import { LIMITS, respond } from "./feedback.js";

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
  createdAtEpochMilliseconds: Number(row.created_at_ms),
  triagedAtEpochMilliseconds: row.triaged_at_ms == null ? null : Number(row.triaged_at_ms),
});

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
         device_model, contact, channel, client_day_hash, created_at_ms)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
    ).bind(
      submission.submissionID, submission.kind, submission.title, submission.details,
      submission.platform, submission.appVersion, submission.osVersion, submission.deviceModel,
      submission.contact, submission.channel, submission.clientHash, submission.createdAtMs,
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

  async triage(submissionID, state, itemID, now) {
    const result = await db.prepare(
      `UPDATE feedback_submissions
          SET state = ?2, item_id = ?3, contact = NULL, triaged_at_ms = ?4
        WHERE submission_id = ?1`,
    ).bind(submissionID, state, itemID, now).run();
    return Number(result.meta?.changes ?? 0) > 0;
  },
});

export default {
  fetch(request, env) {
    return respond(request, env, d1Store(env.DB), Date.now());
  },

  async scheduled(_controller, env) {
    const now = Date.now();
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
