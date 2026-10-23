import { discordClient } from "./discord-render.js";
import { LIMITS, respond } from "./feedback.js";
import { copyFollowUps } from "./followups.js";
import { importForumPosts } from "./forum-import.js";
import { announcePending, threadPending } from "./operations.js";
import { d1Store } from "./store.js";

// Every five minutes: post reports Discord missed, import new forum posts, copy replies from
// watched threads and make any missing ticket threads. Once a day: retention.
const ANNOUNCE_CRON = "*/5 * * * *";

export default {
  fetch(request, env, context) {
    return respond(request, env, {
      store: d1Store(env.DB),
      discord: env.DISCORD_BOT_TOKEN ? discordClient(env.DISCORD_BOT_TOKEN) : null,
      now: Date.now(),
      waitUntil: (promise) => context.waitUntil(promise),
    });
  },

  async scheduled(controller, env) {
    const now = Date.now();
    if (controller.cron === ANNOUNCE_CRON) {
      if (!env.DISCORD_BOT_TOKEN) return;
      const background = [];
      const deps = { store: d1Store(env.DB), discord: cachedReads(discordClient(env.DISCORD_BOT_TOKEN)), now, env, waitUntil: (promise) => background.push(promise) };
      // Each job runs even if another fails; their Discord posts are awaited here because a
      // scheduled run has no request to outlive. Follow-ups run after the import so a post
      // imported this run is already watched.
      const results = await Promise.allSettled([announcePending(deps, env), importForumPosts(deps, env)]);
      results.push(...await Promise.allSettled([followUps(deps, env), threadPending(deps, env)]));
      await Promise.allSettled(background);
      for (const result of results) if (result.status === "rejected") console.error(result.reason?.message ?? result.reason);
      return;
    }
    await env.DB.batch([
      // Reports behind a ticket stay (privately) while the ticket exists, so staff can reopen
      // them; discarded reports, and reports whose ticket was deleted, go after 30 days.
      env.DB.prepare(
        `DELETE FROM feedback_submissions
          WHERE state != 'new' AND triaged_at_ms < ?1
            AND (state = 'discarded' OR ticket_id IS NULL
                 OR ticket_id NOT IN (SELECT id FROM tickets))`,
      ).bind(now - LIMITS.triagedRetentionMs),
      env.DB.prepare(
        "DELETE FROM feedback_submissions WHERE state = 'new' AND created_at_ms < ?1",
      ).bind(now - LIMITS.untriagedRetentionMs),
      // Events and watched threads of reports that are gone go with them.
      env.DB.prepare(
        "DELETE FROM ticket_events WHERE ticket_id IS NULL AND submission_id NOT IN (SELECT submission_id FROM feedback_submissions)",
      ),
      env.DB.prepare("DELETE FROM watched_threads WHERE submission_id NOT IN (SELECT submission_id FROM feedback_submissions)"),
      env.DB.prepare("DELETE FROM tracker_logins WHERE expires_ms < ?1").bind(now),
      // The per-day abuse key is only useful on the day it was made.
      env.DB.prepare(
        "UPDATE feedback_submissions SET client_day_hash = 'expired' WHERE created_at_ms < ?1 AND client_day_hash != 'expired'",
      ).bind(now - 2 * 24 * 60 * 60 * 1000),
    ]);
  },
};

// One read of each channel and each guild's active threads per cron run.
const cachedReads = (discord) => {
  const channels = new Map();
  const threads = new Map();
  return {
    ...discord,
    channel: (id) => {
      if (!channels.has(id)) channels.set(id, discord.channel(id));
      return channels.get(id);
    },
    activeThreads: (guildID) => {
      if (!threads.has(guildID)) threads.set(guildID, discord.activeThreads(guildID));
      return threads.get(guildID);
    },
  };
};

// The guilds come from the configured forums (or DISCORD_GUILD_ID), whose active threads hold
// every thread that could have new replies.
const followUps = async (deps, env) => {
  const guilds = new Set(env.DISCORD_GUILD_ID ? [env.DISCORD_GUILD_ID] : []);
  for (const forumID of [env.DISCORD_BUG_FORUM_ID, env.DISCORD_FEATURE_FORUM_ID].filter(Boolean)) {
    const forum = await deps.discord.channel(forumID);
    if (forum?.guild_id) guilds.add(forum.guild_id);
  }
  let copied = 0;
  for (const guildID of guilds) copied += await copyFollowUps(deps, (await deps.discord.activeThreads(guildID))?.threads ?? []);
  return copied;
};
