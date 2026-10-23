import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { d1Store, itemFromRow } from "../src/store.js";
import { publicFeed } from "../src/tracker.js";
import { migrate, sqliteD1 } from "./d1.js";

// Roadmap items and reports shaped like production before staff tickets.
const legacy = () => {
  const db = new DatabaseSync(":memory:");
  migrate(db, { through: 4 });
  db.exec(`
    INSERT INTO tracker_items(number, kind, title, summary, notes, status, platforms, is_public, requests, shipped_in, created, updated) VALUES
      (3, 'feature', 'Detail layouts on Mac', '', 'Report text\nFrom the website', 'in-progress', '["mac"]', 1, 1, '', '2026-10-20', '2026-10-20'),
      (4, 'feature', 'Tobacco Ties over http', '', '', 'shipped', '["apple-tv"]', 1, 1, '69', '2026-10-20', '2026-10-21'),
      (6, 'bug', 'Testing', '', '', 'wont-fix', '[]', 0, 1, '', '2026-10-22', '2026-10-22'),
      (7, 'bug', 'Playback issues with Silo', '', '', 'fixed', '[]', 1, 1, 'Shipping in Build 70', '2026-10-22', '2026-10-23'),
      (8, 'bug', 'Explore filters', '', '', 'investigating', '[]', 1, 2, '', '2026-10-23', '2026-10-23');
    UPDATE tracker_counters SET value = 10 WHERE name = 'item';
    INSERT INTO feedback_submissions(submission_id, kind, title, details, platform, channel, client_day_hash, state, item_id, created_at_ms, triaged_at_ms, source_channel_id) VALUES
      ('a', 'feature', 'Layouts', 'Detail layouts please', 'mac', 'website', 'h', 'accepted', 'CDR-3', 1, 2, NULL),
      ('b', 'bug', 'Silo', 'Silo will not play', 'apple-tv', 'discord', 'discord', 'accepted', 'CDR-7', 3, 4, '1530000000000000000'),
      ('c', 'bug', 'Explore', 'Apply does nothing', 'iphone', 'app', 'h', 'accepted', 'CDR-8', 5, 6, NULL),
      ('d', 'bug', 'Explore again', 'Still cannot apply', 'iphone', 'app', 'h', 'merged', 'CDR-8', 7, 8, NULL),
      ('e', 'feature', 'Deleted item', 'Gone', 'mac', 'website', 'h', 'accepted', 'CDR-1', 9, 10, NULL);
  `);
  return db;
};

test("existing roadmap items become linked tickets and the public roadmap doesn't change", async () => {
  const db = legacy();
  const before = publicFeed(db.prepare("SELECT *, requests AS report_count FROM tracker_items").all().map(itemFromRow));
  db.exec(readFileSync(new URL("../migrations/0005_staff_tickets.sql", import.meta.url), "utf8"));
  const store = d1Store(sqliteD1(db));

  const tickets = await store.listTickets();
  assert.deepEqual(tickets.map((ticket) => [ticket.id, ticket.status, ticket.roadmapID, ticket.reports]), [
    ["BUG-1", "wont-fix", "CDR-6", 0],
    ["BUG-2", "fixed", "CDR-7", 1],
    ["BUG-3", "confirmed", "CDR-8", 2],
    ["FR-1", "in-progress", "CDR-3", 1],
    ["FR-2", "released", "CDR-4", 0],
  ]);
  assert.equal(tickets.find((ticket) => ticket.id === "FR-1").notes, "Report text\nFrom the website");
  assert.deepEqual([tickets[1].fixedIn, tickets[1].releasedIn], ["Shipping in Build 70", ""]);
  assert.equal(tickets.find((ticket) => ticket.id === "FR-2").releasedIn, "69");

  // Entries keep their hand-set status, and requests now count linked reports.
  const after = publicFeed(await store.listItems());
  const strip = (feed) => feed.items.map(({ requests: _requests, ...entry }) => entry);
  assert.deepEqual(strip(after), strip(before));
  assert.deepEqual(after.items.map((entry) => [entry.id, entry.requests]), [["CDR-3", 1], ["CDR-4", undefined], ["CDR-7", 1], ["CDR-8", 2]]);
  assert.ok((await store.listItems()).every((item) => item.statusMode === "manual"));

  // A report whose item was deleted stays unlinked, so retention removes it.
  assert.equal((await store.get("e")).ticketID, null);
  assert.deepEqual(db.prepare("SELECT * FROM watched_threads").all().map((row) => ({ ...row })), [{ thread_id: "1530000000000000000", submission_id: "b", last_seen_id: "1530000000000000000" }]);

  // New tickets continue each kind's numbering; new entries continue CDR numbers.
  assert.equal((await store.createTicket("bug", { ...tickets[0], title: "Next bug" }, 1)).id, "BUG-4");
  assert.equal((await store.createItem({ kind: "feature", title: "Next", summary: "", description: "", notes: "", status: "considering", platforms: [], priority: "normal", public: false, shippedIn: "", releaseURL: "", statusMode: "follow" }, "2026-10-24")).id, "CDR-11");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM ticket_events WHERE type = 'note'").get().count, 5);
});
