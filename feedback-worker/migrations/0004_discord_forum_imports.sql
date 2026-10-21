-- Posts in the public Discord bug and feature-request forums are imported into triage by the
-- five-minute cron. Each thread is remembered here (separately from submissions, which retention
-- deletes) so it's never imported twice, and each forum keeps the time importing started so
-- posts from before then are left alone.

CREATE TABLE IF NOT EXISTS discord_forum_threads (
    thread_id TEXT PRIMARY KEY,
    forum_id TEXT NOT NULL,
    submission_id TEXT,
    imported_at_ms INTEGER NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS discord_forum_state (
    forum_id TEXT PRIMARY KEY,
    since_ms INTEGER NOT NULL
) STRICT;
