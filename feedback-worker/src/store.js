// D1 storage for reports, staff tickets and their timeline, and roadmap entries. Tests run this
// same code over Node's SQLite (test/d1.js).

export const submissionFromRow = (row) => ({
  submissionID: row.submission_id,
  kind: row.kind,
  title: row.title,
  details: row.details,
  platform: row.platform,
  appVersion: row.app_version,
  osVersion: row.os_version,
  deviceModel: row.device_model,
  contact: row.contact,
  channel: row.channel,
  state: row.state,
  itemID: row.item_id ?? null,
  ticketID: row.ticket_id ?? null,
  needsInfoAtEpochMilliseconds: row.needs_info_ms == null ? null : Number(row.needs_info_ms),
  reporter: row.reporter ?? null,
  reporterUserID: row.reporter_user_id ?? null,
  sourceChannelID: row.source_channel_id ?? null,
  discordChannelID: row.discord_channel_id ?? null,
  discordMessageID: row.discord_message_id ?? null,
  createdAtEpochMilliseconds: Number(row.created_at_ms),
  triagedAtEpochMilliseconds: row.triaged_at_ms == null ? null : Number(row.triaged_at_ms),
});

export const itemFromRow = (row) => ({
  id: `CDR-${row.number}`,
  kind: row.kind,
  title: row.title,
  summary: row.summary,
  description: row.description ?? "",
  notes: row.notes,
  status: row.status,
  statusMode: row.status_mode ?? "manual",
  platforms: JSON.parse(row.platforms),
  priority: row.priority,
  public: Number(row.is_public) === 1,
  // Reports behind the entry's tickets; counted, never stored.
  requests: Number(row.report_count ?? 0),
  shippedIn: row.shipped_in,
  releaseURL: row.release_url,
  created: row.created,
  updated: row.updated,
  discordChannelID: row.discord_channel_id ?? null,
  discordMessageID: row.discord_message_id ?? null,
  sourceChannelID: row.source_channel_id ?? null,
});

const itemValues = (item) => [
  item.kind, item.title, item.summary, item.description, item.notes, item.status, JSON.stringify(item.platforms),
  item.priority, item.public ? 1 : 0, item.shippedIn, item.releaseURL, item.statusMode,
];

const ITEM_COLUMNS = "kind, title, summary, description, notes, status, platforms, priority, is_public, shipped_in, release_url, status_mode";

const ITEM_SELECT = `SELECT tracker_items.*,
       (SELECT COUNT(*) FROM feedback_submissions AS report JOIN tickets ON tickets.id = report.ticket_id
         WHERE tickets.roadmap_number = tracker_items.number AND report.state IN ('accepted', 'merged')) AS report_count
  FROM tracker_items`;

export const ticketFromRow = (row) => ({
  id: row.id,
  kind: row.kind,
  number: Number(row.number),
  title: row.title,
  status: row.status,
  priority: row.priority,
  platforms: JSON.parse(row.platforms),
  summary: row.summary,
  steps: row.steps,
  expected: row.expected,
  notes: row.notes,
  decision: row.decision,
  brokeIn: row.broke_in,
  fixedIn: row.fixed_in,
  commit: row.commit_ref,
  releasedIn: row.released_in,
  roadmapID: row.roadmap_number == null ? null : `CDR-${row.roadmap_number}`,
  duplicateOf: row.duplicate_of ?? null,
  discordGuildID: row.discord_guild_id ?? null,
  discordThreadID: row.discord_thread_id ?? null,
  reports: Number(row.report_count ?? 0),
  createdAtEpochMilliseconds: Number(row.created_ms),
  updatedAtEpochMilliseconds: Number(row.updated_ms),
});

const TICKET_SELECT = `SELECT tickets.*,
       (SELECT COUNT(*) FROM feedback_submissions AS report
         WHERE report.ticket_id = tickets.id AND report.state IN ('accepted', 'merged')) AS report_count
  FROM tickets`;

const ticketValues = (ticket) => [
  ticket.title, ticket.status, ticket.priority, JSON.stringify(ticket.platforms), ticket.summary, ticket.steps,
  ticket.expected, ticket.notes, ticket.decision, ticket.brokeIn, ticket.fixedIn, ticket.commit, ticket.releasedIn,
];

const TICKET_COLUMNS = "title, status, priority, platforms, summary, steps, expected, notes, decision, broke_in, fixed_in, commit_ref, released_in";

const eventFromRow = (row) => ({
  eventID: Number(row.event_id),
  ticketID: row.ticket_id ?? null,
  submissionID: row.submission_id ?? null,
  atEpochMilliseconds: Number(row.at_ms),
  actor: row.actor,
  type: row.type,
  body: row.body,
  sourceMessageID: row.source_message_id ?? null,
});

const placeholders = (count, start = 1) => Array.from({ length: count }, (_, index) => `?${index + start}`).join(", ");

export const d1Store = (db) => ({
  async countForClientDay(clientHash) {
    const row = await db.prepare(
      "SELECT COUNT(*) AS count FROM feedback_submissions WHERE client_day_hash = ?1",
    ).bind(clientHash).first();
    return Number(row?.count ?? 0);
  },

  async insert(submission) {
    await db.prepare(
      `INSERT INTO feedback_submissions(
         submission_id, kind, title, details, platform, app_version, os_version,
         device_model, contact, channel, client_day_hash, created_at_ms, reporter, source_channel_id, reporter_user_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
    ).bind(
      submission.submissionID, submission.kind, submission.title, submission.details,
      submission.platform, submission.appVersion, submission.osVersion, submission.deviceModel,
      submission.contact, submission.channel, submission.clientHash, submission.createdAtMs,
      submission.reporter ?? null, submission.sourceChannelID ?? null, submission.reporterUserID ?? null,
    ).run();
  },

  async list(state, limit) {
    const result = await db.prepare(
      `SELECT * FROM feedback_submissions
        WHERE state = ?1
        ORDER BY created_at_ms ASC
        LIMIT ?2`,
    ).bind(state, limit).all();
    return (result.results || []).map(submissionFromRow);
  },

  async get(submissionID) {
    const row = await db.prepare("SELECT * FROM feedback_submissions WHERE submission_id = ?1").bind(submissionID).first();
    return row ? submissionFromRow(row) : null;
  },

  async setSubmissionMessage(submissionID, channelID, messageID) {
    await db.prepare(
      "UPDATE feedback_submissions SET discord_channel_id = ?2, discord_message_id = ?3 WHERE submission_id = ?1",
    ).bind(submissionID, channelID, messageID).run();
  },

  async unannounced(createdBefore, limit) {
    const result = await db.prepare(
      `SELECT * FROM feedback_submissions
        WHERE state = 'new' AND discord_message_id IS NULL AND created_at_ms < ?1
        ORDER BY created_at_ms ASC
        LIMIT ?2`,
    ).bind(createdBefore, limit).all();
    return (result.results || []).map(submissionFromRow);
  },

  async discard(submissionID, now) {
    const result = await db.prepare(
      `UPDATE feedback_submissions
          SET state = 'discarded', item_id = NULL, ticket_id = NULL, contact = NULL, needs_info_ms = NULL, triaged_at_ms = ?2
        WHERE submission_id = ?1 AND state = 'new'`,
    ).bind(submissionID, now).run();
    return Number(result.meta?.changes ?? 0) > 0;
  },

  // When importing from a forum began; set once, the first time the forum is polled.
  async forumSince(forumID, now) {
    await db.prepare("INSERT OR IGNORE INTO discord_forum_state(forum_id, since_ms) VALUES (?1, ?2)").bind(forumID, now).run();
    const row = await db.prepare("SELECT since_ms FROM discord_forum_state WHERE forum_id = ?1").bind(forumID).first();
    return Number(row.since_ms);
  },

  async importedThreads(threadIDs) {
    if (!threadIDs.length) return new Set();
    const result = await db.prepare(
      `SELECT thread_id FROM discord_forum_threads WHERE thread_id IN (${threadIDs.map((_, index) => `?${index + 1}`).join(", ")})`,
    ).bind(...threadIDs).all();
    return new Set((result.results || []).map((row) => row.thread_id));
  },

  // Claims a thread before importing it, so overlapping runs can't import it twice.
  async claimThread(threadID, forumID, now) {
    const result = await db.prepare(
      "INSERT OR IGNORE INTO discord_forum_threads(thread_id, forum_id, imported_at_ms) VALUES (?1, ?2, ?3)",
    ).bind(threadID, forumID, now).run();
    return Number(result.meta?.changes ?? 0) > 0;
  },

  async setThreadSubmission(threadID, submissionID) {
    await db.prepare("UPDATE discord_forum_threads SET submission_id = ?2 WHERE thread_id = ?1").bind(threadID, submissionID).run();
  },

  async releaseThread(threadID) {
    await db.prepare("DELETE FROM discord_forum_threads WHERE thread_id = ?1 AND submission_id IS NULL").bind(threadID).run();
  },

  // Asking the reporter for more: the report stays untriaged (so its email is kept) until a reply
  // or a decision.
  async setNeedsInfo(submissionID, atMs) {
    const result = await db.prepare(
      "UPDATE feedback_submissions SET needs_info_ms = ?2 WHERE submission_id = ?1 AND state = 'new'",
    ).bind(submissionID, atMs).run();
    return Number(result.meta?.changes ?? 0) > 0;
  },

  // Watched Discord threads

  async watchThread(threadID, submissionID, lastSeenID) {
    await db.prepare(
      "INSERT OR IGNORE INTO watched_threads(thread_id, submission_id, last_seen_id) VALUES (?1, ?2, ?3)",
    ).bind(threadID, submissionID, lastSeenID).run();
  },

  // The watched threads among `threadIDs` whose report is still open or behind an open ticket.
  async watchedThreads(threadIDs) {
    if (!threadIDs.length) return [];
    const result = await db.prepare(
      `SELECT watched.thread_id, watched.submission_id, watched.last_seen_id, report.ticket_id, report.state
         FROM watched_threads AS watched
         JOIN feedback_submissions AS report ON report.submission_id = watched.submission_id
        WHERE watched.thread_id IN (${placeholders(threadIDs.length)}) AND report.state != 'discarded'`,
    ).bind(...threadIDs).all();
    return (result.results || []).map((row) => ({
      threadID: row.thread_id, submissionID: row.submission_id, lastSeenID: row.last_seen_id,
      ticketID: row.ticket_id ?? null, state: row.state,
    }));
  },

  async setThreadSeen(threadID, lastSeenID) {
    await db.prepare("UPDATE watched_threads SET last_seen_id = ?2 WHERE thread_id = ?1").bind(threadID, lastSeenID).run();
  },

  // Tickets

  async listTickets() {
    const result = await db.prepare(`${TICKET_SELECT} ORDER BY kind ASC, number ASC`).all();
    return (result.results || []).map(ticketFromRow);
  },

  async getTicket(id) {
    const row = await db.prepare(`${TICKET_SELECT} WHERE tickets.id = ?1`).bind(id).first();
    return row ? ticketFromRow(row) : null;
  },

  async ticketsForEntry(number) {
    const result = await db.prepare(`${TICKET_SELECT} WHERE tickets.roadmap_number = ?1 ORDER BY kind, number`).bind(number).all();
    return (result.results || []).map(ticketFromRow);
  },

  // Open tickets that still need a staff thread (made before Discord was set up, or during an outage).
  async ticketsWithoutThread(limit) {
    const result = await db.prepare(`${TICKET_SELECT} WHERE tickets.discord_thread_id IS NULL ORDER BY created_ms ASC LIMIT ?1`).bind(limit).all();
    return (result.results || []).map(ticketFromRow);
  },

  // Numbers and stores a ticket. With a submission, it's created from that report in the same
  // transaction, and only while the report is still untriaged.
  async createTicket(kind, ticket, now, submissionID = null) {
    const prefix = kind === "bug" ? "BUG-" : "FR-";
    const guard = "(?2 IS NULL OR EXISTS (SELECT 1 FROM feedback_submissions WHERE submission_id = ?2 AND state = 'new'))";
    const statements = [
      db.prepare(`UPDATE tracker_counters SET value = value + 1 WHERE name = ?1 AND ${guard}`).bind(kind, submissionID),
      db.prepare(
        `INSERT INTO tickets(id, kind, number, ${TICKET_COLUMNS}, created_ms, updated_ms)
         SELECT ?3 || value, ?1, value, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?17
           FROM tracker_counters WHERE name = ?1 AND ${guard}
         RETURNING *`,
      ).bind(kind, submissionID, prefix, ...ticketValues(ticket), now),
    ];
    if (submissionID) {
      statements.push(db.prepare(
        `UPDATE feedback_submissions
            SET state = 'accepted', contact = NULL, needs_info_ms = NULL, triaged_at_ms = ?2,
                ticket_id = ?3 || (SELECT value FROM tracker_counters WHERE name = ?4)
          WHERE submission_id = ?1 AND state = 'new'`,
      ).bind(submissionID, now, prefix, kind));
    }
    const [, inserted] = await db.batch(statements);
    const row = inserted.results?.[0];
    return row ? ticketFromRow({ ...row, report_count: submissionID ? 1 : 0 }) : null;
  },

  async attachSubmission(submissionID, ticketID, now) {
    const result = await db.prepare(
      `UPDATE feedback_submissions
          SET state = 'merged', ticket_id = ?2, contact = NULL, needs_info_ms = NULL, triaged_at_ms = ?3
        WHERE submission_id = ?1 AND state = 'new' AND EXISTS (SELECT 1 FROM tickets WHERE id = ?2)`,
    ).bind(submissionID, ticketID, now).run();
    if (!Number(result.meta?.changes ?? 0)) return false;
    await db.prepare("UPDATE tickets SET updated_ms = ?2 WHERE id = ?1").bind(ticketID, now).run();
    return true;
  },

  async updateTicket(id, ticket, now) {
    const row = await db.prepare(
      `UPDATE tickets
          SET title = ?2, status = ?3, priority = ?4, platforms = ?5, summary = ?6, steps = ?7, expected = ?8,
              notes = ?9, decision = ?10, broke_in = ?11, fixed_in = ?12, commit_ref = ?13, released_in = ?14,
              updated_ms = ?15
        WHERE id = ?1
        RETURNING id`,
    ).bind(id, ...ticketValues(ticket), now).first();
    return row ? this.getTicket(id) : null;
  },

  async touchTicket(id, now) {
    await db.prepare("UPDATE tickets SET updated_ms = ?2 WHERE id = ?1").bind(id, now).run();
  },

  async setTicketThread(id, guildID, threadID) {
    await db.prepare("UPDATE tickets SET discord_guild_id = ?2, discord_thread_id = ?3 WHERE id = ?1").bind(id, guildID, threadID).run();
  },

  async setTicketRoadmap(id, number, now) {
    await db.prepare("UPDATE tickets SET roadmap_number = ?2, updated_ms = ?3 WHERE id = ?1").bind(id, number, now).run();
  },

  // Moves one ticket's reports and timeline into another and closes it as a duplicate.
  async mergeTicket(fromID, intoID, now) {
    const [closed] = await db.batch([
      db.prepare(
        `UPDATE tickets SET status = 'duplicate', duplicate_of = ?2, roadmap_number = NULL, updated_ms = ?3
          WHERE id = ?1 AND EXISTS (SELECT 1 FROM tickets WHERE id = ?2) RETURNING id`,
      ).bind(fromID, intoID, now),
      db.prepare("UPDATE feedback_submissions SET ticket_id = ?2 WHERE ticket_id = ?1 AND EXISTS (SELECT 1 FROM tickets WHERE id = ?2 AND status != 'duplicate')").bind(fromID, intoID),
      db.prepare("UPDATE ticket_events SET ticket_id = ?2 WHERE ticket_id = ?1 AND EXISTS (SELECT 1 FROM tickets WHERE id = ?2 AND status != 'duplicate')").bind(fromID, intoID),
      db.prepare("UPDATE tickets SET updated_ms = ?2 WHERE id = ?1").bind(intoID, now),
    ]);
    return closed.results.length > 0;
  },

  // Reports go back to being unlinked (retention removes them after 30 days); events go with it.
  async deleteTicket(id) {
    const [deleted] = await db.batch([
      db.prepare("DELETE FROM tickets WHERE id = ?1 RETURNING id").bind(id),
      db.prepare("UPDATE feedback_submissions SET ticket_id = NULL WHERE ticket_id = ?1").bind(id),
      db.prepare("DELETE FROM ticket_events WHERE ticket_id = ?1").bind(id),
    ]);
    return deleted.results.length > 0;
  },

  // Tickets waiting to ship in `build`, for a release.
  async ticketsInBuild(build) {
    const result = await db.prepare(
      `${TICKET_SELECT} WHERE tickets.fixed_in = ?1 AND tickets.status IN ('fixed', 'in-build', 'verified') ORDER BY kind, number`,
    ).bind(build).all();
    return (result.results || []).map(ticketFromRow);
  },

  // The original reports behind a ticket.
  async reportsForTicket(ticketID) {
    const result = await db.prepare(
      `SELECT * FROM feedback_submissions
        WHERE ticket_id = ?1 AND state IN ('accepted', 'merged')
        ORDER BY created_at_ms ASC`,
    ).bind(ticketID).all();
    return (result.results || []).map(submissionFromRow);
  },

  // Timeline

  async addEvent(event) {
    await db.prepare(
      `INSERT INTO ticket_events(ticket_id, submission_id, at_ms, actor, type, body, source_message_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    ).bind(
      event.ticketID ?? null, event.submissionID ?? null, event.atMs, event.actor ?? "", event.type,
      (event.body ?? "").slice(0, 4_000), event.sourceMessageID ?? null,
    ).run();
  },

  // A ticket's own events plus those of the reports attached to it.
  async eventsForTicket(ticketID) {
    const result = await db.prepare(
      `SELECT * FROM ticket_events
        WHERE ticket_id = ?1
           OR submission_id IN (SELECT submission_id FROM feedback_submissions WHERE ticket_id = ?1)
        ORDER BY at_ms ASC, event_id ASC`,
    ).bind(ticketID).all();
    return (result.results || []).map(eventFromRow);
  },

  async eventsForSubmission(submissionID) {
    const result = await db.prepare("SELECT * FROM ticket_events WHERE submission_id = ?1 ORDER BY at_ms ASC, event_id ASC").bind(submissionID).all();
    return (result.results || []).map(eventFromRow);
  },

  async allEvents() {
    const result = await db.prepare("SELECT * FROM ticket_events ORDER BY at_ms ASC, event_id ASC").all();
    return (result.results || []).map(eventFromRow);
  },

  // Hosted Tracker sign-in codes

  async createLogin(codeHash, userID, expiresMs) {
    await db.prepare("INSERT INTO tracker_logins(code_hash, user_id, expires_ms) VALUES (?1, ?2, ?3)").bind(codeHash, userID, expiresMs).run();
  },

  // Single use: the code is deleted as it's read.
  async consumeLogin(codeHash, now) {
    const row = await db.prepare("DELETE FROM tracker_logins WHERE code_hash = ?1 RETURNING user_id, expires_ms").bind(codeHash).first();
    return row && Number(row.expires_ms) > now ? row.user_id : null;
  },

  // Roadmap entries

  async listItems() {
    const result = await db.prepare(`${ITEM_SELECT} ORDER BY number ASC`).all();
    return (result.results || []).map(itemFromRow);
  },

  async getItem(number) {
    const row = await db.prepare(`${ITEM_SELECT} WHERE number = ?1`).bind(number).first();
    return row ? itemFromRow(row) : null;
  },

  async createItem(item, date) {
    const [, inserted] = await db.batch([
      db.prepare("UPDATE tracker_counters SET value = value + 1 WHERE name = 'item'"),
      db.prepare(
        `INSERT INTO tracker_items(number, ${ITEM_COLUMNS}, created, updated)
         SELECT value, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13
           FROM tracker_counters WHERE name = 'item'
         RETURNING number`,
      ).bind(...itemValues(item), date),
    ]);
    return this.getItem(Number(inserted.results[0].number));
  },

  async updateItem(number, item, date) {
    const row = await db.prepare(
      `UPDATE tracker_items
          SET kind = ?2, title = ?3, summary = ?4, description = ?5, notes = ?6, status = ?7,
              platforms = ?8, priority = ?9, is_public = ?10, shipped_in = ?11, release_url = ?12,
              status_mode = ?13, updated = ?14
        WHERE number = ?1
        RETURNING number`,
    ).bind(number, ...itemValues(item), date).first();
    return row ? this.getItem(number) : null;
  },

  async setItemMessage(number, channelID, messageID) {
    await db.prepare(
      "UPDATE tracker_items SET discord_channel_id = ?2, discord_message_id = ?3 WHERE number = ?1",
    ).bind(number, channelID, messageID).run();
  },

  // Linked tickets stay; they just leave the roadmap.
  async deleteItem(number) {
    const [deleted] = await db.batch([
      db.prepare("DELETE FROM tracker_items WHERE number = ?1 RETURNING number").bind(number),
      db.prepare("UPDATE tickets SET roadmap_number = NULL WHERE roadmap_number = ?1").bind(number),
    ]);
    return deleted.results.length > 0;
  },
});
