-- Roadmap items gain a longer public description for the roadmap's item view. Reports that
-- became (or were merged into) an item now stay linked to it for staff, so the lookup by item
-- gets an index.

ALTER TABLE tracker_items ADD COLUMN description TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS feedback_by_item
    ON feedback_submissions(item_id, created_at_ms);
