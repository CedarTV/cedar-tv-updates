// D1 storage for submissions and roadmap items. Tests use an in-memory store with the same shape.

const submissionFromRow = (row) => ({
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
  itemID: row.item_id,
  reporter: row.reporter ?? null,
  sourceChannelID: row.source_channel_id ?? null,
  discordChannelID: row.discord_channel_id ?? null,
  discordMessageID: row.discord_message_id ?? null,
  createdAtEpochMilliseconds: Number(row.created_at_ms),
  triagedAtEpochMilliseconds: row.triaged_at_ms == null ? null : Number(row.triaged_at_ms),
});

const itemFromRow = (row) => ({
  id: `CDR-${row.number}`,
  kind: row.kind,
  title: row.title,
  summary: row.summary,
  description: row.description ?? "",
  notes: row.notes,
  status: row.status,
  platforms: JSON.parse(row.platforms),
  priority: row.priority,
  public: Number(row.is_public) === 1,
  requests: Number(row.requests),
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
  item.priority, item.public ? 1 : 0, item.requests, item.shippedIn, item.releaseURL,
];

const ITEM_COLUMNS = "kind, title, summary, description, notes, status, platforms, priority, is_public, requests, shipped_in, release_url";

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
         device_model, contact, channel, client_day_hash, created_at_ms, reporter, source_channel_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)`,
    ).bind(
      submission.submissionID, submission.kind, submission.title, submission.details,
      submission.platform, submission.appVersion, submission.osVersion, submission.deviceModel,
      submission.contact, submission.channel, submission.clientHash, submission.createdAtMs,
      submission.reporter ?? null, submission.sourceChannelID ?? null,
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
          SET state = 'discarded', item_id = NULL, contact = NULL, triaged_at_ms = ?2
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

  // The original reports behind an item: the one it was accepted from and any merged into it.
  async reportsForItem(itemID) {
    const result = await db.prepare(
      `SELECT * FROM feedback_submissions
        WHERE item_id = ?1 AND state IN ('accepted', 'merged')
        ORDER BY created_at_ms ASC`,
    ).bind(itemID).all();
    return (result.results || []).map(submissionFromRow);
  },

  async listItems() {
    const result = await db.prepare("SELECT * FROM tracker_items ORDER BY number ASC").all();
    return (result.results || []).map(itemFromRow);
  },

  async getItem(number) {
    const row = await db.prepare("SELECT * FROM tracker_items WHERE number = ?1").bind(number).first();
    return row ? itemFromRow(row) : null;
  },

  async createItem(item, date) {
    const [, inserted] = await db.batch([
      db.prepare("UPDATE tracker_counters SET value = value + 1 WHERE name = 'item'"),
      db.prepare(
        `INSERT INTO tracker_items(number, ${ITEM_COLUMNS}, created, updated)
         SELECT value, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13
           FROM tracker_counters WHERE name = 'item'
         RETURNING *`,
      ).bind(...itemValues(item), date),
    ]);
    return itemFromRow(inserted.results[0]);
  },

  async updateItem(number, item, date) {
    const row = await db.prepare(
      `UPDATE tracker_items
          SET kind = ?2, title = ?3, summary = ?4, description = ?5, notes = ?6, status = ?7,
              platforms = ?8, priority = ?9, is_public = ?10, requests = ?11, shipped_in = ?12,
              release_url = ?13, updated = ?14
        WHERE number = ?1
        RETURNING *`,
    ).bind(number, ...itemValues(item), date).first();
    return row ? itemFromRow(row) : null;
  },

  async setItemMessage(number, channelID, messageID) {
    await db.prepare(
      "UPDATE tracker_items SET discord_channel_id = ?2, discord_message_id = ?3 WHERE number = ?1",
    ).bind(number, channelID, messageID).run();
  },

  async deleteItem(number) {
    const result = await db.prepare("DELETE FROM tracker_items WHERE number = ?1").bind(number).run();
    return Number(result.meta?.changes ?? 0) > 0;
  },

  // One transaction: number the item, create it (keeping the forum thread it came from), and
  // mark the submission accepted. Nothing happens unless the submission is still new.
  async acceptSubmission(submissionID, item, date, now) {
    const stillNew = "EXISTS (SELECT 1 FROM feedback_submissions WHERE submission_id = ?1 AND state = 'new')";
    const [, inserted] = await db.batch([
      db.prepare(`UPDATE tracker_counters SET value = value + 1 WHERE name = 'item' AND ${stillNew}`).bind(submissionID),
      db.prepare(
        `INSERT INTO tracker_items(number, ${ITEM_COLUMNS}, created, updated, source_channel_id)
         SELECT counter.value, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?14,
                submission.source_channel_id
           FROM tracker_counters AS counter
           JOIN feedback_submissions AS submission ON submission.submission_id = ?1 AND submission.state = 'new'
          WHERE counter.name = 'item'
         RETURNING *`,
      ).bind(submissionID, ...itemValues(item), date),
      db.prepare(
        `UPDATE feedback_submissions
            SET state = 'accepted', contact = NULL, triaged_at_ms = ?2,
                item_id = 'CDR-' || (SELECT value FROM tracker_counters WHERE name = 'item')
          WHERE submission_id = ?1 AND state = 'new'`,
      ).bind(submissionID, now),
    ]);
    const row = inserted.results?.[0];
    return row ? itemFromRow(row) : null;
  },

  async mergeSubmission(submissionID, number, date, now) {
    const [updated, merged] = await db.batch([
      db.prepare(
        `UPDATE tracker_items SET requests = requests + 1, updated = ?3
          WHERE number = ?2
            AND EXISTS (SELECT 1 FROM feedback_submissions WHERE submission_id = ?1 AND state = 'new')
         RETURNING *`,
      ).bind(submissionID, number, date),
      db.prepare(
        `UPDATE feedback_submissions
            SET state = 'merged', item_id = ?4, contact = NULL, triaged_at_ms = ?3
          WHERE submission_id = ?1 AND state = 'new'
            AND EXISTS (SELECT 1 FROM tracker_items WHERE number = ?2)`,
      ).bind(submissionID, number, now, `CDR-${number}`),
    ]);
    if (!Number(merged.meta?.changes ?? 0)) return null;
    return itemFromRow(updated.results[0]);
  },
});
