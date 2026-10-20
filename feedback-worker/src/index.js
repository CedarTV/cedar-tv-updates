import { discordClient } from "./discord-render.js";
import { LIMITS, respond } from "./feedback.js";
import { announcePending } from "./operations.js";
import { d1Store } from "./store.js";

// Every five minutes: post reports Discord missed. Once a day: retention.
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
      if (env.DISCORD_BOT_TOKEN) {
        await announcePending({ store: d1Store(env.DB), discord: discordClient(env.DISCORD_BOT_TOKEN), now, env, waitUntil: () => {} }, env);
      }
      return;
    }
    await env.DB.batch([
      env.DB.prepare(
        "DELETE FROM feedback_submissions WHERE state != 'new' AND triaged_at_ms < ?1",
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
