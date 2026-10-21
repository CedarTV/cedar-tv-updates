// Imports new posts from the public Discord bug and feature-request forums into triage. The
// five-minute cron polls both forums over REST (a Worker can't hold a gateway connection); each
// new thread becomes one report, formatted by fixed rules, and is posted to the triage channel
// like any other. Approving it links the item back to the thread, so the existing status tags
// and shipped notices apply.
import { FeedbackError } from "./errors.js";
import { recordSubmission, validateSubmission } from "./feedback.js";

const DISCORD_EPOCH = 1_420_070_400_000;
const PER_RUN = 10;
const FOOTER_MAXIMUM = 1_500;
const DETAILS_MAXIMUM = 4_000;

// Forum tags that name a device. The first one becomes the report's platform; other tags are
// kept in the report text.
export const PLATFORM_TAGS = Object.freeze({
  "Apple TV": "apple-tv",
  "iPhone / iPad": "iphone",
  Mac: "mac",
  "Android TV": "android-tv",
});

export const snowflakeTime = (id) => Number(BigInt(id) >> 22n) + DISCORD_EPOCH;

const clip = (text, maximum) => (text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text);

const forums = (env) => [
  { id: env.DISCORD_BUG_FORUM_ID, kind: "bug" },
  { id: env.DISCORD_FEATURE_FORUM_ID, kind: "feature" },
].filter((forum) => forum.id);

// Builds a validated report from a forum thread and its starter message. Returns null when the
// message has no text or attachments, which is what Discord sends when the bot lacks the
// Message Content intent; those posts are retried on the next run rather than imported empty.
export const forumSubmission = (thread, starter, kind, tagNames) => {
  const text = (starter.content ?? "").trim();
  const attachments = (starter.attachments ?? []).map((attachment) => attachment.url).filter((url) => /^https:\/\//.test(url ?? ""));
  if (!text && !attachments.length) return null;
  const platformTag = tagNames.find((name) => PLATFORM_TAGS[name]);
  const otherTags = tagNames.filter((name) => !PLATFORM_TAGS[name]);
  let title = (thread.name ?? "").replace(/\s+/g, " ").trim();
  if (title.length < 3) title = kind === "bug" ? "Bug report from Discord" : "Feature request from Discord";
  const footer = clip([
    otherTags.length ? `Forum tags: ${otherTags.join(", ")}` : null,
    attachments.length ? `Attachments:\n${attachments.join("\n")}` : null,
  ].filter(Boolean).join("\n"), FOOTER_MAXIMUM);
  // Short posts lean on their title, so it's repeated to keep the report readable on its own.
  let body = text.length >= 10 ? text : [title, text].filter(Boolean).join("\n\n");
  if (body.length < 10) body = `${body}\n\n(Posted without details.)`;
  body = clip(body, DETAILS_MAXIMUM - (footer ? footer.length + 2 : 0));
  return validateSubmission({
    schemaVersion: 1,
    kind,
    title: clip(title, 120),
    details: footer ? `${body}\n\n${footer}` : body,
    platform: PLATFORM_TAGS[platformTag] ?? "other",
  });
};

const reporterName = (author) => (author?.global_name || author?.username || "").slice(0, 40) || null;

// Imports up to ten new threads per run, oldest first, and returns how many it imported.
export const importForumPosts = async (deps, env) => {
  const list = forums(env);
  if (!deps.discord || !list.length) return 0;
  const activeByGuild = new Map();
  let imported = 0;
  let unreadable = 0;
  for (const forum of list) {
    // The first poll only records when importing began; older posts are left alone.
    const since = await deps.store.forumSince(forum.id, deps.now);
    const channel = await deps.discord.channel(forum.id);
    const tagNames = new Map((channel.available_tags ?? []).map((tag) => [tag.id, tag.name]));
    if (!activeByGuild.has(channel.guild_id)) activeByGuild.set(channel.guild_id, deps.discord.activeThreads(channel.guild_id));
    const [active, archived] = await Promise.all([activeByGuild.get(channel.guild_id), deps.discord.archivedThreads(forum.id)]);
    const byID = new Map();
    for (const thread of [...(active?.threads ?? []), ...(archived?.threads ?? [])]) {
      if (thread.parent_id === forum.id && snowflakeTime(thread.id) >= since) byID.set(thread.id, thread);
    }
    const threads = [...byID.values()].sort((left, right) => snowflakeTime(left.id) - snowflakeTime(right.id));
    const seen = await deps.store.importedThreads(threads.map((thread) => thread.id));
    for (const thread of threads) {
      if (seen.has(thread.id)) continue;
      if (imported >= PER_RUN) return imported;
      // A forum thread's starter message has the thread's id.
      const starter = await deps.discord.message(thread.id, thread.id);
      if (!starter || starter.author?.bot) {
        // Deleted or bot-made posts are remembered so they aren't fetched again.
        await deps.store.claimThread(thread.id, forum.id, deps.now);
        continue;
      }
      let fields;
      try {
        fields = forumSubmission(thread, starter, forum.kind, (thread.applied_tags ?? []).map((id) => tagNames.get(id)).filter(Boolean));
      } catch (error) {
        if (!(error instanceof FeedbackError)) throw error;
        console.warn(`Skipped forum post ${thread.id}: ${error.code}`);
        await deps.store.claimThread(thread.id, forum.id, deps.now);
        continue;
      }
      if (!fields) {
        unreadable += 1;
        continue;
      }
      if (!(await deps.store.claimThread(thread.id, forum.id, deps.now))) continue;
      try {
        const { honeypot: _honeypot, elapsedMs: _elapsed, ...submission } = fields;
        const record = await recordSubmission(deps, env, submission, {
          channel: "discord",
          clientHash: "discord",
          reporter: reporterName(starter.author),
          sourceChannelID: thread.id,
        });
        await deps.store.setThreadSubmission(thread.id, record.submissionID);
      } catch (error) {
        await deps.store.releaseThread(thread.id);
        throw error;
      }
      imported += 1;
    }
  }
  if (unreadable) console.warn(`${unreadable} forum post(s) had no readable text; turn on the bot's Message Content intent.`);
  return imported;
};
