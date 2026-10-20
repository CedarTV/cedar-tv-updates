-- Roadmap items move from the local Cedar Tracker store into D1, and submissions can now come
-- from Discord. SQLite can't change a CHECK constraint in place, so the submissions table is
-- rebuilt with the wider channel list and the Discord columns.

CREATE TABLE feedback_submissions_v2 (
    submission_id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('bug', 'feature')),
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    platform TEXT NOT NULL,
    app_version TEXT,
    os_version TEXT,
    device_model TEXT,
    contact TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('website', 'app', 'discord')),
    client_day_hash TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'accepted', 'merged', 'discarded')),
    item_id TEXT,
    created_at_ms INTEGER NOT NULL,
    triaged_at_ms INTEGER,
    reporter TEXT,
    source_channel_id TEXT,
    discord_channel_id TEXT,
    discord_message_id TEXT
) STRICT;

INSERT INTO feedback_submissions_v2(
    submission_id, kind, title, details, platform, app_version, os_version, device_model,
    contact, channel, client_day_hash, state, item_id, created_at_ms, triaged_at_ms)
SELECT submission_id, kind, title, details, platform, app_version, os_version, device_model,
       contact, channel, client_day_hash, state, item_id, created_at_ms, triaged_at_ms
  FROM feedback_submissions;

DROP TABLE feedback_submissions;
ALTER TABLE feedback_submissions_v2 RENAME TO feedback_submissions;

CREATE INDEX IF NOT EXISTS feedback_by_state
    ON feedback_submissions(state, created_at_ms);

CREATE INDEX IF NOT EXISTS feedback_by_client_day
    ON feedback_submissions(client_day_hash);

CREATE TABLE IF NOT EXISTS tracker_items (
    number INTEGER PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('bug', 'feature')),
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    platforms TEXT NOT NULL DEFAULT '[]',
    priority TEXT NOT NULL DEFAULT 'normal',
    is_public INTEGER NOT NULL DEFAULT 0,
    requests INTEGER NOT NULL DEFAULT 0,
    shipped_in TEXT NOT NULL DEFAULT '',
    release_url TEXT NOT NULL DEFAULT '',
    created TEXT NOT NULL,
    updated TEXT NOT NULL,
    discord_channel_id TEXT,
    discord_message_id TEXT,
    source_channel_id TEXT
) STRICT;

-- Item numbers are never reused, even after a delete.
CREATE TABLE IF NOT EXISTS tracker_counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL
) STRICT;

INSERT OR IGNORE INTO tracker_counters(name, value) VALUES ('item', 0);
