import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeItem, publicFeed } from "../feedback-worker/src/tracker.js";
import { validateTrackerFeed } from "../scripts/tracker_feed.mjs";

const feedItem = (overrides = {}) => ({
  id: "CDR-1",
  kind: "feature",
  title: "Picture in picture on Apple TV",
  status: "planned",
  platforms: ["apple-tv"],
  updated: "2026-10-20",
  ...overrides,
});
const feed = (items) => ({ schemaVersion: 1, updated: "2026-10-20", items });

test("the Worker's roadmap feed matches the public schema", () => {
  const item = (id, fields) => ({ id, ...normalizeItem(fields), created: "2026-10-20", updated: "2026-10-20", discordMessageID: "1" });
  const feed = publicFeed([
    item("CDR-1", { kind: "feature", title: "Picture in picture", status: "shipped", public: true, platforms: ["apple-tv", "radio", "website"], summary: "x", notes: "private", priority: "high", requests: 4, shippedIn: "1.0.0 (70)", releaseURL: "https://cedartv.github.io/cedar-tv-updates/apple/releases/apple-tv/" }),
    item("CDR-2", { kind: "bug", title: "Guide freeze", status: "in-progress", public: true }),
    item("CDR-3", { kind: "bug", title: "Hidden", status: "new", public: true }),
  ]);
  validateTrackerFeed(feed);
  assert.deepEqual(feed.items.map((entry) => entry.id), ["CDR-1", "CDR-2"]);
  validateTrackerFeed(publicFeed([]));
});

test("the tracker schema refuses private fields and statuses", () => {
  validateTrackerFeed(feed([feedItem(), feedItem({ id: "CDR-2", kind: "bug", status: "fixed", shippedIn: "1.0.0 (70)" })]));
  assert.throws(() => validateTrackerFeed(feed([feedItem({ notes: "internal" })])), /non-public fields notes/);
  assert.throws(() => validateTrackerFeed(feed([feedItem({ priority: "high" })])), /non-public fields priority/);
  assert.throws(() => validateTrackerFeed(feed([feedItem({ status: "new" })])), /status that isn't public/);
  assert.throws(() => validateTrackerFeed(feed([feedItem({ kind: "bug", status: "wont-fix" })])), /status that isn't public/);
  assert.throws(() => validateTrackerFeed(feed([feedItem(), feedItem()])), /listed twice/);
  assert.throws(() => validateTrackerFeed(feed([feedItem({ releaseURL: "https://example.com/" })])), /releaseURL/);
  assert.throws(() => validateTrackerFeed({ ...feed([]), contact: "x" }), /top-level keys/);
});

test("roadmap renders the tracker feed and links to the feedback form", async () => {
  const page = await readFile("public/roadmap/index.html", "utf8");
  const script = await readFile("public/roadmap/roadmap.js", "utf8");
  const feed = /const ROADMAP_FEED = "([^"]+)"/.exec(script)[1];
  assert.equal(new URL(feed).pathname, "/v1/roadmap");
  assert.match(page, new RegExp(`connect-src 'self' ${new URL(feed).origin.replaceAll(".", "\\.")};`));
  assert.match(script, /fetch\(ROADMAP_FEED/);
  for (const status of ["considering", "planned", "in-progress", "shipped"]) {
    assert.match(page, new RegExp(`data-tracker-kind="feature" data-tracker-status="${status}"`));
  }
  for (const status of ["investigating", "in-progress", "fixed"]) {
    assert.match(page, new RegExp(`data-tracker-kind="bug" data-tracker-status="${status}"`));
  }
  assert.match(page, /href="\/cedar-tv-updates\/feedback\/"/);
});
