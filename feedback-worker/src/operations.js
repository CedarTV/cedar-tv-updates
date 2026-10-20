// Triage and item changes shared by the admin API (Cedar Tracker) and Discord, with the Discord
// side effects that keep the triage channel, the roadmap channel's item panels and the original
// forum threads in step.
import { closedSubmissionMessage, FORUM_TAGS, itemMessage, shippedNotice, submissionMessage } from "./discord-render.js";
import { FeedbackError } from "./errors.js";
import { changesItem, isPublished, itemFromSubmission, itemNumber, normalizeItem, statusInfo, today } from "./tracker.js";

const notFound = (code = "not_found") => new FeedbackError(404, code);

// Discord problems never fail the request that caused them; they're logged and skipped.
const later = (deps, work) => {
  if (!deps.discord) return;
  deps.waitUntil(work().catch((error) => console.error(error.message)));
};

export const announceSubmission = (deps, env, submission) => later(deps, async () => {
  if (!env.DISCORD_TRIAGE_CHANNEL_ID) return;
  const message = await deps.discord.send(env.DISCORD_TRIAGE_CHANNEL_ID, submissionMessage(submission));
  await deps.store.setSubmissionMessage(submission.submissionID, env.DISCORD_TRIAGE_CHANNEL_ID, message.id);
});

const editSubmissionMessage = (deps, submission, message) => later(deps, async () => {
  if (submission.discordChannelID && submission.discordMessageID) {
    await deps.discord.edit(submission.discordChannelID, submission.discordMessageID, message);
  }
});

// Reports that never reached Discord (posted before it was set up, or during an outage). Only
// reports older than two minutes, so one whose own post is still in flight isn't doubled.
export const announcePending = async (deps, env) => {
  if (!deps.discord || !env.DISCORD_TRIAGE_CHANNEL_ID) return 0;
  const pending = await deps.store.unannounced(deps.now - 2 * 60 * 1000, 10);
  for (const submission of pending) {
    const message = await deps.discord.send(env.DISCORD_TRIAGE_CHANNEL_ID, submissionMessage(submission));
    await deps.store.setSubmissionMessage(submission.submissionID, env.DISCORD_TRIAGE_CHANNEL_ID, message.id);
  }
  return pending.length;
};

const panelChannel = (env) => env.DISCORD_ROADMAP_CHANNEL_ID || env.DISCORD_TRIAGE_CHANNEL_ID;

export const acceptedOutcome = (item, env) => {
  const where = env.DISCORD_ROADMAP_CHANNEL_ID ? ` Its panel is in <#${env.DISCORD_ROADMAP_CHANNEL_ID}>.` : "";
  const status = statusInfo(item.kind, item.status)?.label ?? item.status;
  return `${isPublished(item) ? "Approved" : "Kept private"} as **${item.id}** (${status}).${where}`;
};

const findTag = async (deps, threadID, status) => {
  const name = FORUM_TAGS[status];
  if (!name) return null;
  const thread = await deps.discord.channel(threadID);
  if (!thread.parent_id) return null;
  const forum = await deps.discord.channel(thread.parent_id);
  const tag = forum.available_tags?.find((candidate) => candidate.name === name);
  if (!tag) return null;
  const managed = new Set(Object.values(FORUM_TAGS));
  const kept = (thread.applied_tags ?? []).filter((id) => !managed.has(forum.available_tags.find((candidate) => candidate.id === id)?.name));
  return [...kept, tag.id].slice(0, 5);
};

// After an item changes: refresh its triage message (unless Discord itself is answering with
// the new message), tag the forum thread it came from, and thank the thread when it ships.
const itemChanged = (deps, before, item, { refreshMessage = true } = {}) => later(deps, async () => {
  if (refreshMessage && item.discordChannelID && item.discordMessageID) {
    await deps.discord.edit(item.discordChannelID, item.discordMessageID, itemMessage(item));
  }
  if (!item.sourceChannelID || before?.status === item.status) return;
  const tags = await findTag(deps, item.sourceChannelID, item.status);
  if (tags) await deps.discord.setTags(item.sourceChannelID, tags);
  if (["shipped", "fixed"].includes(item.status)) await deps.discord.send(item.sourceChannelID, shippedNotice(item));
});

const pendingSubmission = async (deps, submissionID) => {
  const submission = await deps.store.get(submissionID);
  if (!submission) throw notFound();
  if (submission.state !== "new") throw new FeedbackError(409, "already_triaged");
  return submission;
};

export const acceptSubmission = async (deps, submissionID, overrides = {}, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  const fields = itemFromSubmission(submission, overrides);
  const item = await deps.store.acceptSubmission(submissionID, fields, today(deps.now), deps.now);
  if (!item) throw new FeedbackError(409, "already_triaged");
  // The report's triage message closes; the item gets its own panel in the roadmap channel.
  if (options.refreshMessage !== false) editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, acceptedOutcome(item, deps.env)));
  ensureItemMessage(deps, deps.env, item);
  itemChanged(deps, null, item, { refreshMessage: false });
  return item;
};

export const mergeSubmission = async (deps, submissionID, itemID, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  const target = await deps.store.getItem(itemNumber(itemID));
  if (!target) throw notFound("item_not_found");
  if (target.kind !== submission.kind) throw new FeedbackError(400, "kind_mismatch");
  const item = await deps.store.mergeSubmission(submissionID, itemNumber(itemID), today(deps.now), deps.now);
  if (!item) throw new FeedbackError(409, "already_triaged");
  if (options.refreshMessage !== false) {
    editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, `Merged into **${item.id}** ${item.title} (now ${item.requests} requests).`));
  }
  itemChanged(deps, target, item);
  return item;
};

export const discardSubmission = async (deps, submissionID, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  if (!(await deps.store.discard(submissionID, deps.now))) throw new FeedbackError(409, "already_triaged");
  if (options.refreshMessage !== false) editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, "Discarded."));
  return submission;
};

export const createItem = async (deps, input) => deps.store.createItem(normalizeItem(input), today(deps.now));

export const updateItem = async (deps, itemID, input, options = {}) => {
  const existing = await deps.store.getItem(itemNumber(itemID));
  if (!existing) throw notFound("item_not_found");
  const next = normalizeItem(input, existing);
  if (!changesItem(existing, next)) return existing;
  const item = await deps.store.updateItem(itemNumber(itemID), next, today(deps.now));
  itemChanged(deps, existing, item, options);
  return item;
};

export const deleteItem = async (deps, itemID) => {
  const existing = await deps.store.getItem(itemNumber(itemID));
  if (!existing || !(await deps.store.deleteItem(itemNumber(itemID)))) throw notFound("item_not_found");
  later(deps, async () => {
    if (existing.discordChannelID && existing.discordMessageID) {
      await deps.discord.edit(existing.discordChannelID, existing.discordMessageID, {
        content: `${existing.id} was deleted in Cedar Tracker.`, embeds: [], components: [],
      });
    }
  });
  return existing;
};

// Posts an item's control panel in the roadmap channel when it has none yet.
export const ensureItemMessage = (deps, env, item) => later(deps, async () => {
  const channelID = panelChannel(env);
  if (item.discordMessageID || !channelID) return;
  const message = await deps.discord.send(channelID, itemMessage(item));
  await deps.store.setItemMessage(itemNumber(item.id), channelID, message.id);
});
