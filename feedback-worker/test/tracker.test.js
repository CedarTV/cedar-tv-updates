import assert from "node:assert/strict";
import test from "node:test";
import { changesItem, followedStatus, normalizeItem, publicFeed } from "../src/tracker.js";

const item = (id, { requests = 0, ...fields }, updated = "2026-10-01") => ({ id, ...normalizeItem(fields), requests, created: updated, updated });

const items = () => [
  item("CDR-1", { kind: "feature", title: "Picture in picture", status: "planned", platforms: ["apple-tv", "iphone"], public: true, summary: "Keep watching while you browse.", notes: "Needs AVKit work", priority: "high", requests: 3 }),
  item("CDR-2", { kind: "bug", title: "Guide freezes past midnight", status: "investigating", platforms: ["apple-tv"], public: true }, "2026-10-02"),
  item("CDR-3", { kind: "feature", title: "Secret project", status: "in-progress", public: false }, "2026-10-03"),
  item("CDR-4", { kind: "bug", title: "Unreviewed crash", status: "new", public: true }, "2026-10-04"),
];

test("the public feed holds only public items with public statuses and public fields", () => {
  const feed = publicFeed(items());
  assert.deepEqual(feed.items.map((entry) => entry.id), ["CDR-1", "CDR-2"]);
  assert.equal(feed.updated, "2026-10-02");
  for (const entry of feed.items) {
    for (const key of ["notes", "priority", "public", "created", "discordMessageID"]) assert.equal(entry[key], undefined);
  }
  assert.deepEqual(feed.items[0].platforms, ["iphone", "apple-tv"]);
  assert.equal(feed.items[0].requests, 3);
  assert.equal(feed.items[1].requests, undefined);
});

test("shipped versions only appear once something shipped", () => {
  const list = items();
  Object.assign(list[0], normalizeItem({ shippedIn: "1.0.0 (70)", releaseURL: "https://cedartv.github.io/cedar-tv-updates/apple/releases/apple-tv/" }, list[0]));
  assert.equal(publicFeed(list).items[0].shippedIn, undefined);
  Object.assign(list[0], normalizeItem({ status: "shipped" }, list[0]));
  assert.equal(publicFeed(list).items[0].shippedIn, "1.0.0 (70)");
  assert.throws(() => normalizeItem({ releaseURL: "https://example.com/" }, list[0]), /Cedar website/);
});

test("no-op edits are detected so the updated date doesn't churn", () => {
  const [first] = items();
  assert.equal(changesItem(first, normalizeItem({ title: "Picture in picture" }, first)), false);
  assert.equal(changesItem(first, normalizeItem({ title: "Picture-in-picture" }, first)), true);
});

test("validation rejects statuses from the other kind and bad input", () => {
  const [first] = items();
  assert.throws(() => normalizeItem({ status: "fixed" }, first), /isn’t a feature status/);
  assert.throws(() => normalizeItem({ kind: "idea", title: "Nope" }), /Feature or Bug/);
  assert.throws(() => normalizeItem({ kind: "bug", title: "x" }), /at least 3/);
  assert.throws(() => normalizeItem({ kind: "bug", title: "Valid", platforms: ["windows"] }), /platform/);
  assert.throws(() => normalizeItem({ kind: "bug", title: "Valid", contact: "a@b.c" }), /Unknown field contact/);
});

test("an entry that follows its tickets takes its status from them", () => {
  const feature = normalizeItem({ kind: "feature", title: "Mini player", status: "considering", statusMode: "follow" });
  const bug = normalizeItem({ kind: "bug", title: "Guide freeze", status: "investigating", statusMode: "follow" });
  const tickets = (...statuses) => statuses.map((status, index) => ({ status, releasedIn: status === "released" ? `1.0.${index} (7${index})` : "" }));
  assert.equal(followedStatus(feature, []), null);
  assert.deepEqual(followedStatus(feature, tickets("new", "considering")), { status: "considering" });
  assert.deepEqual(followedStatus(feature, tickets("new", "planned")), { status: "planned" });
  assert.deepEqual(followedStatus(feature, tickets("planned", "in-build")), { status: "in-progress" });
  // Released only once every ticket still in play is; dropped tickets don't hold it back.
  assert.deepEqual(followedStatus(feature, tickets("released", "planned")), { status: "in-progress" });
  assert.deepEqual(followedStatus(feature, tickets("released", "declined", "released")), { status: "shipped", shippedIn: "1.0.2 (72)" });
  assert.deepEqual(followedStatus(feature, tickets("declined", "duplicate")), { status: "declined" });
  assert.deepEqual(followedStatus(bug, tickets("confirmed")), { status: "investigating" });
  assert.deepEqual(followedStatus(bug, tickets("fixed")), { status: "in-progress" });
  assert.deepEqual(followedStatus(bug, tickets("released")), { status: "fixed", shippedIn: "1.0.0 (70)" });
  assert.deepEqual(followedStatus(bug, tickets("cant-reproduce")), { status: "wont-fix" });
  assert.throws(() => normalizeItem({ statusMode: "auto" }, feature), /follow tickets/);
});
