// Copies later replies in a report's Discord thread into its timeline, so "still happening on
// 1.4" or a screenshot posted after the import isn't lost. The five-minute cron compares each
// watched thread's newest message with the last one copied, so quiet threads cost nothing.
import { eventLine, submissionMessage } from "./discord-render.js";

const PER_RUN = 10;
const PER_THREAD = 20;

const SNOWFLAKE = /^\d{1,25}$/;
const newer = (left, right) => SNOWFLAKE.test(left ?? "") && SNOWFLAKE.test(right ?? "") && BigInt(left) > BigInt(right);

const author = (message) => (message.author?.global_name || message.author?.username || "Someone").slice(0, 40);

const text = (message) => [
  (message.content ?? "").trim(),
  ...(message.attachments ?? []).map((attachment) => attachment.url).filter((url) => /^https:\/\//.test(url ?? "")),
].filter(Boolean).join("\n");

// `activeThreads` is the guild's active thread list; an archived thread has no new messages.
export const copyFollowUps = async (deps, activeThreads) => {
  const latest = new Map(activeThreads.filter((thread) => thread.last_message_id).map((thread) => [thread.id, thread.last_message_id]));
  const watched = (await deps.store.watchedThreads([...latest.keys()]))
    .filter((entry) => newer(latest.get(entry.threadID), entry.lastSeenID));
  let copied = 0;
  for (const entry of watched.slice(0, PER_RUN)) {
    const messages = (await deps.discord.messages(entry.threadID, { after: entry.lastSeenID, limit: PER_THREAD }))
      .sort((left, right) => (newer(left.id, right.id) ? 1 : -1));
    if (!messages.length) continue;
    const ticketID = ["accepted", "merged"].includes(entry.state) ? entry.ticketID : null;
    const ticket = ticketID ? await deps.store.getTicket(ticketID) : null;
    const replies = messages.filter((message) => !message.author?.bot && text(message));
    for (const message of replies) {
      const body = text(message);
      await deps.store.addEvent({
        ticketID, submissionID: entry.submissionID, atMs: Date.parse(message.timestamp) || deps.now,
        actor: author(message), type: "reply", body, sourceMessageID: message.id,
      });
      if (ticket?.discordThreadID) {
        await deps.discord.send(ticket.discordThreadID, eventLine({ type: "reply", actor: "", body: `**${author(message)}** in <#${entry.threadID}>: ${body}` }));
      }
      copied += 1;
    }
    await deps.store.setThreadSeen(entry.threadID, messages.at(-1).id);
    // An untriaged report shows its newest replies on its triage message.
    if (replies.length && entry.state === "new") {
      const submission = await deps.store.get(entry.submissionID);
      if (submission?.discordChannelID && submission.discordMessageID) {
        await deps.discord.edit(submission.discordChannelID, submission.discordMessageID, submissionMessage(submission, await deps.store.eventsForSubmission(entry.submissionID)));
      }
    }
  }
  return copied;
};
