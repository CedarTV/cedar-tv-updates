// Triage, ticket and roadmap changes shared by the hosted Tracker (admin API) and Discord, with
// the Discord side effects that keep everything in step: the triage message, each ticket's
// thread in the staff forums, the roadmap channel's entry panels and the reporters' own threads.
import {
  closedSubmissionMessage, eventLine, itemMessage, NEEDS_INFO_TAG, PUBLIC_FORUM_TAGS, releasedNotice, reportEmbed, STAFF_TAGS,
  submissionMessage, threadName, ticketMessage,
} from "./discord-render.js";
import { FeedbackError } from "./errors.js";
import {
  changedFields, fieldLabel, isClosed, isTicketID, normalizeTicket, statusLabel, ticketFromSubmission,
} from "./tickets.js";
import { changesItem, followedStatus, itemNumber, normalizeItem, today } from "./tracker.js";

const notFound = (code = "not_found") => new FeedbackError(404, code);

// Discord problems never fail the request that caused them; they're logged and skipped.
const later = (deps, work) => {
  if (!deps.discord) return;
  deps.waitUntil(work().catch((error) => console.error(error.message)));
};

const actorOf = (options) => options.actor || "Tracker";

const event = (deps, fields) => deps.store.addEvent({ atMs: deps.now, ...fields });

// Reports

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

const pendingSubmission = async (deps, submissionID) => {
  const submission = await deps.store.get(submissionID);
  if (!submission) throw notFound();
  if (submission.state !== "new") throw new FeedbackError(409, "already_triaged");
  return submission;
};

const getTicket = async (deps, id) => {
  if (!isTicketID(id)) throw new FeedbackError(400, "invalid_ticket");
  const ticket = await deps.store.getTicket(id);
  if (!ticket) throw notFound("ticket_not_found");
  return ticket;
};

export const ticketOutcome = (ticket, verb) => `${verb} **${ticket.id}** ${ticket.title}${ticket.discordThreadID ? ` · <#${ticket.discordThreadID}>` : ""}`;

// Opens a ticket from a report. `kind` may differ from the report's (a "bug" that is really a
// feature request). Its email is cleared; the report itself stays attached to the ticket.
export const openTicketFromSubmission = async (deps, submissionID, kind, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  if (kind !== "bug" && kind !== "feature") throw new FeedbackError(400, "invalid_kind");
  const ticket = await deps.store.createTicket(kind, ticketFromSubmission(submission, kind), deps.now, submissionID);
  if (!ticket) throw new FeedbackError(409, "already_triaged");
  await event(deps, { ticketID: ticket.id, actor: actorOf(options), type: "created", body: `Opened from a report sent from ${sourceLabel(submission)}.` });
  if (options.refreshMessage !== false) editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, ticketOutcome(ticket, "Opened")));
  ensureTicketThread(deps, deps.env, ticket, { submission });
  return ticket;
};

const sourceLabel = (submission) => (submission.channel === "discord"
  ? `Discord${submission.reporter ? ` by ${submission.reporter}` : ""}`
  : { app: "the app", website: "the website" }[submission.channel] ?? submission.channel);

// Adds a report to an existing ticket (either kind), as another voice for it.
export const attachSubmission = async (deps, submissionID, ticketID, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  const before = await getTicket(deps, ticketID);
  if (before.status === "duplicate") throw new FeedbackError(400, "ticket_is_duplicate");
  if (!(await deps.store.attachSubmission(submissionID, ticketID, deps.now))) throw new FeedbackError(409, "already_triaged");
  const ticket = await deps.store.getTicket(ticketID);
  await event(deps, { ticketID, actor: actorOf(options), type: "report", body: `Report attached: “${submission.title}” from ${sourceLabel(submission)}.` });
  if (options.refreshMessage !== false) editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, ticketOutcome(ticket, "Attached to")));
  later(deps, async () => {
    if (ticket.discordThreadID) {
      await inThread(deps, isClosed(ticket), isClosed(ticket), ticket.discordThreadID, async () => {
        await deps.discord.send(ticket.discordThreadID, {
          content: `📎 Another report, attached by ${actorOf(options)}:`,
          embeds: [reportEmbed(submission)],
          allowed_mentions: { parse: [] },
        });
        await deps.discord.edit(ticket.discordThreadID, ticket.discordThreadID, ticketMessage(ticket));
      });
    }
    await tagReportThread(deps, ticket, { ...submission, ticketID });
  });
  if (ticket.roadmapID) await syncEntry(deps, itemNumber(ticket.roadmapID));
  return ticket;
};

// Asks the reporter for more detail. With a Discord thread, the question is posted there;
// otherwise the staff member uses the email shown to them. The report stays untriaged, and
// keeps its email, until someone decides.
export const askReporter = async (deps, submissionID, question, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  const text = (question ?? "").trim();
  if (!submission.sourceChannelID && !submission.contact) throw new FeedbackError(400, "no_way_to_reach");
  if (submission.sourceChannelID && text.length < 3) throw new FeedbackError(400, "question_required");
  await deps.store.setNeedsInfo(submissionID, deps.now);
  await event(deps, {
    submissionID, actor: actorOf(options), type: "asked",
    body: submission.sourceChannelID ? text : `Asked by email${text ? `: ${text}` : "."}`,
  });
  const updated = { ...submission, needsInfoAtEpochMilliseconds: deps.now };
  later(deps, async () => {
    if (submission.sourceChannelID) {
      const mention = submission.reporterUserID ? `<@${submission.reporterUserID}> ` : "";
      await deps.discord.send(submission.sourceChannelID, {
        content: `${mention}${text}`,
        allowed_mentions: { users: submission.reporterUserID ? [submission.reporterUserID] : [] },
      });
      await setPublicTag(deps, submission.sourceChannelID, NEEDS_INFO_TAG);
    }
  });
  if (options.refreshMessage !== false) editSubmissionMessage(deps, updated, submissionMessage(updated, await deps.store.eventsForSubmission(submissionID)));
  return { submission: updated, via: submission.sourceChannelID ? "discord" : "email", contact: submission.sourceChannelID ? null : submission.contact };
};

export const discardSubmission = async (deps, submissionID, options = {}) => {
  const submission = await pendingSubmission(deps, submissionID);
  if (!(await deps.store.discard(submissionID, deps.now))) throw new FeedbackError(409, "already_triaged");
  if (options.refreshMessage !== false) editSubmissionMessage(deps, submission, closedSubmissionMessage(submission, "Discarded.", { keepsReport: false }));
  return submission;
};

// The inbox, with each report's own events (questions asked, replies copied from Discord).
export const inbox = async (deps, state = "new", limit = 200) => {
  const submissions = await deps.store.list(state, limit);
  return Promise.all(submissions.map(async (submission) => ({ ...submission, events: await deps.store.eventsForSubmission(submission.submissionID) })));
};

// Tickets

// Applies the staff-forum tags for a ticket's status, priority and platforms.
const staffTags = async (deps, ticket) => {
  const thread = await deps.discord.channel(ticket.discordThreadID);
  if (!thread?.parent_id) return null;
  const forum = await deps.discord.channel(thread.parent_id);
  const byName = new Map((forum.available_tags ?? []).map((tag) => [tag.name, tag.id]));
  const ids = STAFF_TAGS(ticket).map((name) => byName.get(name)).filter(Boolean).slice(0, 5);
  const current = thread.applied_tags ?? [];
  return JSON.stringify([...current].sort()) === JSON.stringify([...ids].sort()) ? null : ids;
};

// Sets the one moderated tag (status, or Needs info) on a reporter's public forum thread,
// keeping the tags they chose themselves.
const setPublicTag = async (deps, threadID, name) => {
  const thread = await deps.discord.channel(threadID);
  if (!thread?.parent_id) return;
  const forum = await deps.discord.channel(thread.parent_id);
  const tags = forum.available_tags ?? [];
  const managed = new Set([NEEDS_INFO_TAG, ...Object.values(PUBLIC_FORUM_TAGS).flatMap((map) => Object.values(map))]);
  const kept = (thread.applied_tags ?? []).filter((id) => !managed.has(tags.find((tag) => tag.id === id)?.name));
  const wanted = tags.find((tag) => tag.name === name);
  const next = [...kept, ...(wanted ? [wanted.id] : [])].slice(0, 5);
  if (JSON.stringify(next) !== JSON.stringify(thread.applied_tags ?? [])) await deps.discord.updateThread(threadID, { applied_tags: next });
};

// Mirrors a ticket's status on a reporter's thread, and thanks them once it's released.
const tagReportThread = async (deps, ticket, report, { thank = false } = {}) => {
  if (!report.sourceChannelID) return;
  await setPublicTag(deps, report.sourceChannelID, PUBLIC_FORUM_TAGS[ticket.kind]?.[ticket.status]);
  if (thank) await deps.discord.send(report.sourceChannelID, releasedNotice(ticket));
};

// Creates a ticket's thread in its staff forum when it has none. Closed tickets are archived
// straight away so the forum's open list stays the work in progress.
export const ensureTicketThread = (deps, env, ticket, { submission = null } = {}) => later(deps, async () => {
  await createTicketThread(deps, env, ticket, submission);
});

const staffForum = (env, kind) => (kind === "bug" ? env.DISCORD_STAFF_BUG_FORUM_ID : env.DISCORD_STAFF_FEATURE_FORUM_ID);

const createTicketThread = async (deps, env, ticket, submission = null) => {
  const forumID = staffForum(env, ticket.kind);
  if (ticket.discordThreadID || !forumID) return null;
  const forum = await deps.discord.channel(forumID);
  const byName = new Map((forum.available_tags ?? []).map((tag) => [tag.name, tag.id]));
  const thread = await deps.discord.createThread(forumID, {
    name: threadName(ticket),
    applied_tags: STAFF_TAGS(ticket).map((name) => byName.get(name)).filter(Boolean).slice(0, 5),
    message: ticketMessage(ticket),
  });
  await deps.store.setTicketThread(ticket.id, thread.guild_id ?? forum.guild_id ?? null, thread.id);
  const withThread = { ...ticket, discordThreadID: thread.id };
  const reports = await deps.store.reportsForTicket(ticket.id);
  for (const report of reports.slice(0, 5)) {
    await deps.discord.send(thread.id, { content: report === reports[0] ? "📨 Original report:" : "📎 Attached report:", embeds: [reportEmbed(report)], allowed_mentions: { parse: [] } });
  }
  if (submission?.discordChannelID && submission.discordMessageID) {
    await deps.discord.edit(submission.discordChannelID, submission.discordMessageID, closedSubmissionMessage(submission, ticketOutcome(withThread, "Opened")));
  }
  if (isClosed(ticket)) await deps.discord.updateThread(thread.id, { archived: true });
  return thread;
};

// Backfill for tickets whose thread couldn't be made when they were opened.
export const threadPending = async (deps, env) => {
  if (!deps.discord || (!env.DISCORD_STAFF_BUG_FORUM_ID && !env.DISCORD_STAFF_FEATURE_FORUM_ID)) return 0;
  let made = 0;
  for (const ticket of await deps.store.ticketsWithoutThread(5)) {
    if (await createTicketThread(deps, env, ticket)) made += 1;
  }
  return made;
};

// Runs `work` in a ticket's thread. A closed ticket's thread is archived, and archived threads
// can't be edited, so it's unarchived for the work and archived again afterwards.
const inThread = async (deps, wasClosed, isClosedNow, threadID, work) => {
  if (wasClosed) await deps.discord.updateThread(threadID, { archived: false });
  await work();
  if (isClosedNow) await deps.discord.updateThread(threadID, { archived: true });
};

// After a ticket changes: keep the thread's name and tags in step, refresh its panel, post what
// changed, archive or unarchive it with its status, and tell the reporters' threads.
const ticketChanged = (deps, before, ticket, lines) => later(deps, async () => {
  const thread = ticket.discordThreadID;
  if (thread) {
    await inThread(deps, Boolean(before && isClosed(before)), isClosed(ticket), thread, async () => {
      const patch = {};
      if (before && before.title !== ticket.title) patch.name = threadName(ticket);
      const tags = await staffTags(deps, ticket);
      if (tags) patch.applied_tags = tags;
      if (Object.keys(patch).length) await deps.discord.updateThread(thread, patch);
      await deps.discord.edit(thread, thread, ticketMessage(ticket));
      for (const line of lines) await deps.discord.send(thread, line);
    });
  }
  if (before?.status !== ticket.status) {
    const thank = ticket.status === "released";
    for (const report of await deps.store.reportsForTicket(ticket.id)) await tagReportThread(deps, ticket, report, { thank });
  }
});

export const createTicket = async (deps, input, options = {}) => {
  const kind = input?.kind;
  if (kind !== "bug" && kind !== "feature") throw new FeedbackError(400, "invalid_kind");
  const ticket = await deps.store.createTicket(kind, normalizeTicket(input, null, kind), deps.now);
  await event(deps, { ticketID: ticket.id, actor: actorOf(options), type: "created", body: "Opened directly." });
  ensureTicketThread(deps, deps.env, ticket);
  return ticket;
};

export const updateTicket = async (deps, id, input, options = {}) => {
  const existing = await getTicket(deps, id);
  const next = normalizeTicket(input, existing);
  const changed = changedFields(existing, next);
  if (!changed.length) return existing;
  const ticket = await deps.store.updateTicket(id, next, deps.now);
  const actor = actorOf(options);
  const lines = [];
  if (changed.includes("status")) {
    const body = `${statusLabel(existing)} → ${statusLabel(ticket)}${ticket.status === "in-build" && ticket.fixedIn ? ` (${ticket.fixedIn})` : ""}${ticket.status === "released" && ticket.releasedIn ? ` in ${ticket.releasedIn}` : ""}`;
    await event(deps, { ticketID: id, actor, type: "status", body });
    lines.push(eventLine({ type: "status", actor, body }));
  }
  const edited = changed.filter((key) => key !== "status");
  if (edited.length) {
    const body = `Edited ${edited.map((key) => (key === "priority" || key === "platforms" ? key : fieldLabel(ticket.kind, key).toLowerCase())).join(", ")}`;
    await event(deps, { ticketID: id, actor, type: "edit", body });
    lines.push(eventLine({ type: "edit", actor, body }));
  }
  ticketChanged(deps, existing, ticket, lines);
  if (ticket.roadmapID && (changed.includes("status") || changed.includes("releasedIn") || changed.includes("platforms"))) {
    await syncEntry(deps, itemNumber(ticket.roadmapID), options);
  }
  return ticket;
};

export const addNote = async (deps, id, text, options = {}) => {
  const ticket = await getTicket(deps, id);
  const body = (text ?? "").replace(/\r\n?/g, "\n").trim();
  if (body.length < 1 || body.length > 4_000) throw new FeedbackError(400, "invalid_note");
  const actor = actorOf(options);
  await event(deps, { ticketID: id, actor, type: "note", body });
  await deps.store.touchTicket(id, deps.now);
  later(deps, async () => {
    if (!ticket.discordThreadID) return;
    await inThread(deps, isClosed(ticket), isClosed(ticket), ticket.discordThreadID, () => deps.discord.send(ticket.discordThreadID, eventLine({ type: "note", actor, body })));
  });
  return deps.store.getTicket(id);
};

// Folds a duplicate ticket into another: its reports and timeline move over and it closes.
export const mergeTicket = async (deps, fromID, intoID, options = {}) => {
  if (fromID === intoID) throw new FeedbackError(400, "same_ticket");
  const from = await getTicket(deps, fromID);
  const into = await getTicket(deps, intoID);
  if (into.status === "duplicate") throw new FeedbackError(400, "ticket_is_duplicate");
  if (!(await deps.store.mergeTicket(fromID, intoID, deps.now))) throw notFound("ticket_not_found");
  const actor = actorOf(options);
  await event(deps, { ticketID: intoID, actor, type: "merged", body: `${fromID} “${from.title}” was merged in, with its reports and history.` });
  await event(deps, { ticketID: fromID, actor, type: "status", body: `Closed as a duplicate of ${intoID}.` });
  const closed = await deps.store.getTicket(fromID);
  const merged = await deps.store.getTicket(intoID);
  ticketChanged(deps, from, closed, [eventLine({ type: "status", actor, body: `Duplicate of ${intoID}${merged.discordThreadID ? ` · <#${merged.discordThreadID}>` : ""}` })]);
  ticketChanged(deps, into, merged, [eventLine({ type: "merged", actor, body: `${fromID} “${from.title}” merged in${from.discordThreadID ? ` (<#${from.discordThreadID}>)` : ""}.` })]);
  if (from.roadmapID) await syncEntry(deps, itemNumber(from.roadmapID));
  if (merged.roadmapID) await syncEntry(deps, itemNumber(merged.roadmapID));
  return merged;
};

export const deleteTicket = async (deps, id) => {
  const existing = await getTicket(deps, id);
  if (!(await deps.store.deleteTicket(id))) throw notFound("ticket_not_found");
  later(deps, async () => {
    if (existing.discordThreadID) {
      await deps.discord.edit(existing.discordThreadID, existing.discordThreadID, { content: `${existing.id} was deleted in Cedar Tracker.`, embeds: [], components: [] });
      await deps.discord.updateThread(existing.discordThreadID, { archived: true, locked: true });
    }
  });
  if (existing.roadmapID) await syncEntry(deps, itemNumber(existing.roadmapID));
  return existing;
};

// Everything staff need on one ticket. The discussion is read live from its Discord thread
// (staff messages only; the bot's own lines repeat the timeline).
export const ticketDetail = async (deps, id) => {
  const ticket = await getTicket(deps, id);
  const [reports, events, entry] = await Promise.all([
    deps.store.reportsForTicket(id),
    deps.store.eventsForTicket(id),
    ticket.roadmapID ? deps.store.getItem(itemNumber(ticket.roadmapID)) : null,
  ]);
  let discussion = [];
  let discussionError = null;
  if (deps.discord && ticket.discordThreadID) {
    try {
      const messages = await deps.discord.messages(ticket.discordThreadID, { limit: 100 });
      discussion = messages
        .filter((message) => !message.author?.bot && (message.content || message.attachments?.length))
        .map((message) => ({
          messageID: message.id,
          author: message.author?.global_name || message.author?.username || "Someone",
          atEpochMilliseconds: Date.parse(message.timestamp),
          body: message.content ?? "",
          attachments: (message.attachments ?? []).map((attachment) => attachment.url).filter(Boolean),
        }))
        .sort((left, right) => left.atEpochMilliseconds - right.atEpochMilliseconds);
    } catch (error) {
      discussionError = error.message;
    }
  }
  return {
    ticket,
    reports: reports.map(({ contact: _contact, ...report }) => report),
    events,
    entry,
    discussion,
    discussionError,
  };
};

// Moves every ticket waiting in `build` to Released, which also ships their roadmap entries and
// thanks the reporters' threads.
export const releaseBuild = async (deps, { build, version = "", releaseURL = "" } = {}, options = {}) => {
  const label = (build ?? "").replace(/\s+/g, " ").trim();
  if (!label || label.length > 40) throw new FeedbackError(400, "invalid_build");
  const releasedIn = (version ?? "").trim() ? `${version.trim()} (${label})`.slice(0, 40) : label;
  const released = [];
  for (const ticket of await deps.store.ticketsInBuild(label)) {
    released.push(await updateTicket(deps, ticket.id, { status: "released", releasedIn }, { ...options, releaseURL }));
  }
  return { releasedIn, tickets: released };
};

// Roadmap entries

const panelChannel = (env) => env.DISCORD_ROADMAP_CHANNEL_ID || env.DISCORD_TRIAGE_CHANNEL_ID;

// After an entry changes: refresh its panel (unless Discord itself is answering with it).
const itemChanged = (deps, item, { refreshMessage = true } = {}) => later(deps, async () => {
  if (refreshMessage && item.discordChannelID && item.discordMessageID) {
    await deps.discord.edit(item.discordChannelID, item.discordMessageID, itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
  }
});

// Recomputes an entry that follows its tickets (status, shipped version, platforms) and
// refreshes its panel, which also shows the new request count.
export const syncEntry = async (deps, number, options = {}) => {
  const item = await deps.store.getItem(number);
  if (!item) return null;
  const tickets = await deps.store.ticketsForEntry(number);
  let next = item;
  if (item.statusMode === "follow") {
    const followed = followedStatus(item, tickets);
    const platforms = [...new Set([...item.platforms, ...tickets.flatMap((ticket) => ticket.platforms)])];
    const fields = { platforms };
    if (followed) {
      fields.status = followed.status;
      if (followed.shippedIn !== undefined) fields.shippedIn = followed.shippedIn || item.shippedIn;
      if (options.releaseURL && ["shipped", "fixed"].includes(followed.status)) fields.releaseURL = options.releaseURL;
    }
    const normalized = normalizeItem(fields, item);
    if (changesItem(item, normalized)) next = await deps.store.updateItem(number, normalized, today(deps.now));
  }
  itemChanged(deps, next);
  return next;
};

export const linkRoadmap = async (deps, ticketID, { entryID = null, create = null } = {}, options = {}) => {
  const ticket = await getTicket(deps, ticketID);
  let entry;
  if (create) {
    entry = await deps.store.createItem(normalizeItem({
      kind: ticket.kind, status: ticket.kind === "bug" ? "investigating" : "considering", statusMode: "follow",
      platforms: ticket.platforms, public: create.public ?? true,
      title: create.title, summary: create.summary ?? "", description: create.description ?? "",
    }), today(deps.now));
  } else {
    entry = await deps.store.getItem(itemNumber(entryID));
    if (!entry) throw notFound("item_not_found");
  }
  await deps.store.setTicketRoadmap(ticketID, itemNumber(entry.id), deps.now);
  const actor = actorOf(options);
  const body = `${create ? "Added to the roadmap as" : "Linked to roadmap entry"} ${entry.id} “${entry.title}”.`;
  await event(deps, { ticketID, actor, type: "roadmap", body });
  const linked = await deps.store.getTicket(ticketID);
  ticketChanged(deps, ticket, linked, [eventLine({ type: "roadmap", actor, body })]);
  if (ticket.roadmapID && ticket.roadmapID !== entry.id) await syncEntry(deps, itemNumber(ticket.roadmapID));
  if (create) ensureItemMessage(deps, deps.env, entry);
  const synced = await syncEntry(deps, itemNumber(entry.id));
  return { ticket: linked, entry: synced };
};

export const unlinkRoadmap = async (deps, ticketID, options = {}) => {
  const ticket = await getTicket(deps, ticketID);
  if (!ticket.roadmapID) return { ticket };
  await deps.store.setTicketRoadmap(ticketID, null, deps.now);
  const actor = actorOf(options);
  const body = `Removed from roadmap entry ${ticket.roadmapID}.`;
  await event(deps, { ticketID, actor, type: "roadmap", body });
  const unlinked = await deps.store.getTicket(ticketID);
  ticketChanged(deps, ticket, unlinked, [eventLine({ type: "roadmap", actor, body })]);
  await syncEntry(deps, itemNumber(ticket.roadmapID));
  return { ticket: unlinked };
};

// The reports behind an entry's tickets. Contact details were cleared at triage, so none are returned.
export const itemReports = async (deps, itemID) => {
  const item = await deps.store.getItem(itemNumber(itemID));
  if (!item) throw notFound("item_not_found");
  const tickets = await deps.store.ticketsForEntry(itemNumber(itemID));
  const reports = (await Promise.all(tickets.map((ticket) => deps.store.reportsForTicket(ticket.id)))).flat()
    .sort((left, right) => left.createdAtEpochMilliseconds - right.createdAtEpochMilliseconds);
  return { item, tickets, reports: reports.map(({ contact: _contact, ...report }) => report) };
};

export const createItem = async (deps, input) => {
  const item = await deps.store.createItem(normalizeItem(input), today(deps.now));
  ensureItemMessage(deps, deps.env, item);
  return item;
};

export const updateItem = async (deps, itemID, input, options = {}) => {
  const existing = await deps.store.getItem(itemNumber(itemID));
  if (!existing) throw notFound("item_not_found");
  const next = normalizeItem(input, existing);
  if (!changesItem(existing, next)) return existing;
  const item = await deps.store.updateItem(itemNumber(itemID), next, today(deps.now));
  // Switching back to following recomputes the status from the tickets straight away.
  if (item.statusMode === "follow" && existing.statusMode !== "follow") return syncEntry(deps, itemNumber(itemID));
  itemChanged(deps, item, options);
  return item;
};

export const deleteItem = async (deps, itemID) => {
  const existing = await deps.store.getItem(itemNumber(itemID));
  const tickets = existing ? await deps.store.ticketsForEntry(itemNumber(itemID)) : [];
  if (!existing || !(await deps.store.deleteItem(itemNumber(itemID)))) throw notFound("item_not_found");
  later(deps, async () => {
    if (existing.discordChannelID && existing.discordMessageID) {
      await deps.discord.edit(existing.discordChannelID, existing.discordMessageID, {
        content: `${existing.id} was deleted in Cedar Tracker.`, embeds: [], components: [],
      });
    }
  });
  for (const ticket of tickets) {
    await event(deps, { ticketID: ticket.id, actor: "Tracker", type: "roadmap", body: `Roadmap entry ${existing.id} was deleted.` });
    ticketChanged(deps, ticket, { ...ticket, roadmapID: null }, []);
  }
  return existing;
};

// Posts an entry's control panel in the roadmap channel when it has none yet.
export const ensureItemMessage = (deps, env, item) => later(deps, async () => {
  const channelID = panelChannel(env);
  if (item.discordMessageID || !channelID) return;
  const message = await deps.discord.send(channelID, itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
  await deps.store.setItemMessage(itemNumber(item.id), channelID, message.id);
});

// Re-renders every panel with the current layout (after a deploy changes it). One panel that
// can't be edited is reported and skipped rather than stopping the rest.
export const refreshPanels = async (deps) => {
  const result = { entries: 0, tickets: 0, failed: [] };
  if (!deps.discord) return result;
  for (const item of await deps.store.listItems()) {
    if (!item.discordChannelID || !item.discordMessageID) continue;
    try {
      await deps.discord.edit(item.discordChannelID, item.discordMessageID, itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
      result.entries += 1;
    } catch (error) {
      result.failed.push(`${item.id}: ${error.message}`);
    }
  }
  for (const ticket of await deps.store.listTickets()) {
    if (!ticket.discordThreadID) continue;
    try {
      await inThread(deps, isClosed(ticket), isClosed(ticket), ticket.discordThreadID, () => deps.discord.edit(ticket.discordThreadID, ticket.discordThreadID, ticketMessage(ticket)));
      result.tickets += 1;
    } catch (error) {
      result.failed.push(`${ticket.id}: ${error.message}`);
    }
  }
  return result;
};

export const exportAll = async (deps) => {
  const [items, tickets, events] = await Promise.all([deps.store.listItems(), deps.store.listTickets(), deps.store.allEvents()]);
  const reports = (await Promise.all(tickets.map((ticket) => deps.store.reportsForTicket(ticket.id)))).flat()
    .map(({ contact: _contact, ...report }) => report);
  return { exportedAt: new Date(deps.now).toISOString(), entries: items, tickets, events, reports };
};

