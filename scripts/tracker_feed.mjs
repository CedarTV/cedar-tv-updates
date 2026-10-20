// Schema for public/roadmap/tracker.json, the public projection the local Cedar Tracker publishes.
// The tracker keeps private notes, priorities and unreviewed items out of this file; this check
// makes sure nothing outside the public shape slips through.

export const trackerFeedPath = "public/roadmap/tracker.json";

export const PUBLIC_STATUSES = Object.freeze({
  feature: ["considering", "planned", "in-progress", "shipped"],
  bug: ["investigating", "in-progress", "fixed"],
});

export const PLATFORMS = Object.freeze(["iphone", "ipad", "apple-tv", "mac", "android-tv", "radio", "website"]);

const ITEM_FIELDS = ["id", "kind", "title", "summary", "status", "platforms", "requests", "shippedIn", "releaseURL", "updated"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const fail = (message) => { throw new Error(`tracker.json: ${message}`); };

export function validateTrackerFeed(feed) {
  if (!feed || typeof feed !== "object" || Array.isArray(feed)) fail("must be an object");
  const keys = Object.keys(feed).sort().join(",");
  if (keys !== "items,schemaVersion,updated") fail(`unexpected top-level keys ${keys}`);
  if (feed.schemaVersion !== 1) fail("schemaVersion must be 1");
  if (feed.updated !== null && !DATE.test(feed.updated)) fail("updated must be a date or null");
  if (!Array.isArray(feed.items)) fail("items must be an array");
  const ids = new Set();
  for (const item of feed.items) {
    const label = item?.id ?? "item";
    const extra = Object.keys(item ?? {}).filter((key) => !ITEM_FIELDS.includes(key));
    if (extra.length) fail(`${label} has non-public fields ${extra.join(", ")}`);
    if (!/^CDR-[1-9]\d{0,6}$/.test(item.id ?? "")) fail(`${label} has an invalid id`);
    if (ids.has(item.id)) fail(`${label} is listed twice`);
    ids.add(item.id);
    if (!PUBLIC_STATUSES[item.kind]) fail(`${label} has an invalid kind`);
    if (!PUBLIC_STATUSES[item.kind].includes(item.status)) fail(`${label} has a status that isn't public`);
    if (typeof item.title !== "string" || item.title.trim().length < 3 || item.title.length > 120) fail(`${label} needs a title`);
    if (item.summary !== undefined && (typeof item.summary !== "string" || item.summary.length > 600)) fail(`${label} summary is invalid`);
    if (!Array.isArray(item.platforms) || item.platforms.some((platform) => !PLATFORMS.includes(platform))) fail(`${label} platforms are invalid`);
    if (item.requests !== undefined && (!Number.isSafeInteger(item.requests) || item.requests < 1)) fail(`${label} requests is invalid`);
    if (item.shippedIn !== undefined && (typeof item.shippedIn !== "string" || item.shippedIn.length > 40)) fail(`${label} shippedIn is invalid`);
    if (item.releaseURL !== undefined && !item.releaseURL.startsWith("https://cedartv.github.io/cedar-tv-updates/")) fail(`${label} releaseURL must point at the Cedar site`);
    if (!DATE.test(item.updated ?? "")) fail(`${label} needs an updated date`);
  }
  return feed;
}
