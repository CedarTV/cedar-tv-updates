import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { trackerFeedPath, validateTrackerFeed } from "../scripts/tracker_feed.mjs";

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

test("the published tracker feed matches the public schema", async () => {
  validateTrackerFeed(JSON.parse(await readFile(trackerFeedPath, "utf8")));
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
  assert.match(script, /fetch\("tracker\.json"/);
  for (const status of ["considering", "planned", "in-progress", "shipped"]) {
    assert.match(page, new RegExp(`data-tracker-kind="feature" data-tracker-status="${status}"`));
  }
  for (const status of ["investigating", "in-progress", "fixed"]) {
    assert.match(page, new RegExp(`data-tracker-kind="bug" data-tracker-status="${status}"`));
  }
  assert.match(page, /href="\/cedar-tv-updates\/feedback\/"/);
});
