import { discordClient } from "./discord-render.js";
import { LIMITS, respond } from "./feedback.js";
import { importForumPosts } from "./forum-import.js";
import { announcePending } from "./operations.js";
import { d1Store } from "./store.js";

// Every five minutes: post reports Discord missed and import new forum posts. Once a day: retention.
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
      const deps = { store: d1Store(env.DB), discord: discordClient(env.DISCORD_BOT_TOKEN), now, env, waitUntil: (promise) => background.push(promise) };
      // Each job runs even if the other fails; the forum import's triage posts are awaited here
      // because a scheduled run has no request to outlive.
      const results = await Promise.allSettled([announcePending(deps, env), importForumPosts(deps, env)]);
      await Promise.allSettled(background);
      for (const result of results) if (result.status === "rejected") console.error(result.reason?.message ?? result.reason);
      return;
    }
    await env.DB.batch([
      // Reports behind a roadmap item stay (privately) while the item exists, so staff can
      // reopen them; discarded reports, and reports whose item was deleted, go after 30 days.
      env.DB.prepare(
        `DELETE FROM feedback_submissions
          WHERE state != 'new' AND triaged_at_ms < ?1
            AND (state = 'discarded' OR item_id IS NULL
                 OR item_id NOT IN (SELECT 'CDR-' || number FROM tracker_items))`,
      ).bind(now - LIMITS.triagedRetentionMs),
      env.DB.prepare(
        "DELETE FROM feedback_submissions WHERE state = 'new' AND created_at_ms < ?1",
      ).bind(now - LIMITS.untriagedRetentionMs),
      // The per-day abuse key is only useful on the day it was made.
      env.DB.prepare(
        "UPDATE feedback_submissions SET client_day_hash = 'expired' WHERE created_at_ms < ?1 AND client_day_hash != 'expired'",
      ).bind(now - 2 * 24 * 60 * 60 * 1000),
    ]);
  },
};
