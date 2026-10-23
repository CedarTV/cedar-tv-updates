-- Staff tickets sit between reports and the roadmap. A report now becomes (or joins) a private
-- ticket (BUG-n or FR-n) with its own fields and an append-only timeline; the roadmap keeps its
-- CDR-n entries in tracker_items and links to tickets instead of holding the staff work itself.
--
-- Every existing roadmap item becomes one ticket linked back to it. Its reports move with it and
-- the entry keeps its status as set by hand ('manual'), so the public roadmap doesn't change.

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('bug', 'feature')),
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    platforms TEXT NOT NULL DEFAULT '[]',
    summary TEXT NOT NULL DEFAULT '',
    steps TEXT NOT NULL DEFAULT '',
    expected TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    decision TEXT NOT NULL DEFAULT '',
    broke_in TEXT NOT NULL DEFAULT '',
    fixed_in TEXT NOT NULL DEFAULT '',
    commit_ref TEXT NOT NULL DEFAULT '',
    released_in TEXT NOT NULL DEFAULT '',
    roadmap_number INTEGER,
    duplicate_of TEXT,
    discord_guild_id TEXT,
    discord_thread_id TEXT,
    created_ms INTEGER NOT NULL,
    updated_ms INTEGER NOT NULL,
    UNIQUE (kind, number)
) STRICT;

CREATE INDEX IF NOT EXISTS tickets_by_roadmap ON tickets(roadmap_number);

-- What happened to a ticket, oldest first: status and field changes, notes, linked reports,
-- replies in the reporter's Discord thread. Events from before a report was triaged carry only
-- its submission_id and are shown with whichever ticket the report joins.
CREATE TABLE IF NOT EXISTS ticket_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT,
    submission_id TEXT,
    at_ms INTEGER NOT NULL,
    actor TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    source_message_id TEXT
) STRICT;

CREATE INDEX IF NOT EXISTS events_by_ticket ON ticket_events(ticket_id, at_ms);
CREATE INDEX IF NOT EXISTS events_by_submission ON ticket_events(submission_id, at_ms);

-- Discord threads a report came from. The five-minute cron copies the reporter's later replies
-- into the timeline; last_seen_id is the newest message already copied.
CREATE TABLE IF NOT EXISTS watched_threads (
    thread_id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    last_seen_id TEXT NOT NULL
) STRICT;

-- One-time sign-in codes for the hosted Tracker, handed out by /tracker in Discord. Only a hash
-- of the code is stored, and it's deleted when used or after it expires.
CREATE TABLE IF NOT EXISTS tracker_logins (
    code_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_ms INTEGER NOT NULL
) STRICT;

ALTER TABLE feedback_submissions ADD COLUMN ticket_id TEXT;
ALTER TABLE feedback_submissions ADD COLUMN needs_info_ms INTEGER;
ALTER TABLE feedback_submissions ADD COLUMN reporter_user_id TEXT;
CREATE INDEX IF NOT EXISTS feedback_by_ticket ON feedback_submissions(ticket_id, created_at_ms);

-- 'follow': the entry's public status follows its linked tickets. 'manual': staff set it.
ALTER TABLE tracker_items ADD COLUMN status_mode TEXT NOT NULL DEFAULT 'manual';

INSERT INTO tickets(
    id, kind, number, title, status, priority, platforms, notes, fixed_in, released_in,
    roadmap_number, created_ms, updated_ms)
SELECT (CASE kind WHEN 'bug' THEN 'BUG-' ELSE 'FR-' END) || ordinal,
       kind, ordinal, title,
       CASE status WHEN 'investigating' THEN 'confirmed' WHEN 'shipped' THEN 'released' ELSE status END,
       priority, platforms, notes,
       CASE WHEN status = 'fixed' THEN shipped_in ELSE '' END,
       CASE WHEN status = 'shipped' THEN shipped_in ELSE '' END,
       number,
       CAST(strftime('%s', created) AS INTEGER) * 1000,
       CAST(strftime('%s', updated) AS INTEGER) * 1000
  FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY kind ORDER BY number) AS ordinal FROM tracker_items);

INSERT INTO ticket_events(ticket_id, at_ms, actor, type, body)
SELECT id, created_ms, 'Cedar', 'note', 'Moved over from roadmap item CDR-' || roadmap_number || '. Its private notes are in Notes.'
  FROM tickets;

UPDATE feedback_submissions
   SET ticket_id = (SELECT id FROM tickets WHERE 'CDR-' || tickets.roadmap_number = feedback_submissions.item_id)
 WHERE item_id IS NOT NULL;

INSERT OR IGNORE INTO tracker_counters(name, value) VALUES
    ('bug', (SELECT COUNT(*) FROM tickets WHERE kind = 'bug')),
    ('feature', (SELECT COUNT(*) FROM tickets WHERE kind = 'feature'));

-- Reports already linked to a Discord thread start being watched. Replies since the post are
-- copied on the first run, so their history reaches the new timelines.
INSERT OR IGNORE INTO watched_threads(thread_id, submission_id, last_seen_id)
SELECT source_channel_id, submission_id, source_channel_id
  FROM feedback_submissions
 WHERE source_channel_id IS NOT NULL AND state != 'discarded';
