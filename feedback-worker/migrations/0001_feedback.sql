CREATE TABLE IF NOT EXISTS feedback_submissions (
    submission_id TEXT PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('bug', 'feature')),
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    platform TEXT NOT NULL,
    app_version TEXT,
    os_version TEXT,
    device_model TEXT,
    contact TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('website', 'app')),
    client_day_hash TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'accepted', 'merged', 'discarded')),
    item_id TEXT,
    created_at_ms INTEGER NOT NULL,
    triaged_at_ms INTEGER
) STRICT;

CREATE INDEX IF NOT EXISTS feedback_by_state
    ON feedback_submissions(state, created_at_ms);

CREATE INDEX IF NOT EXISTS feedback_by_client_day
    ON feedback_submissions(client_day_hash);
