// Roadmap items: vocabulary, validation and the public projection the website shows.
// publicFeed() is the only path from items to the public roadmap; it must stay in step with
// the site's scripts/tracker_feed.mjs schema.

import { FeedbackError } from "./errors.js";

export const KINDS = Object.freeze({ feature: "Feature", bug: "Bug" });

export const STATUSES = Object.freeze({
  feature: [
    { id: "new", label: "New", public: false },
    { id: "considering", label: "Considering", public: true },
    { id: "planned", label: "Planned", public: true },
    { id: "in-progress", label: "In progress", public: true },
    { id: "shipped", label: "Shipped", public: true },
    { id: "declined", label: "Declined", public: false },
  ],
  bug: [
    { id: "new", label: "New", public: false },
    { id: "investigating", label: "Investigating", public: true },
    { id: "in-progress", label: "Fix in progress", public: true },
    { id: "fixed", label: "Fixed", public: true },
    { id: "wont-fix", label: "Won’t fix", public: false },
  ],
});

export const CLOSED_STATUSES = Object.freeze(["shipped", "fixed", "declined", "wont-fix"]);

export const PLATFORMS = Object.freeze({
  iphone: "iPhone",
  ipad: "iPad",
  "apple-tv": "Apple TV",
  mac: "Mac",
  "android-tv": "Android TV",
  radio: "Cedar Radio",
  website: "Website",
});

export const PRIORITIES = Object.freeze(["low", "normal", "high", "urgent"]);

export const vocabulary = () => ({ kinds: KINDS, statuses: STATUSES, platforms: PLATFORMS, priorities: PRIORITIES });

const ID = /^CDR-([1-9]\d{0,6})$/;
const RELEASE_URL_PREFIX = "https://cedartv.github.io/cedar-tv-updates/";

export const itemNumber = (id) => {
  const match = ID.exec(id ?? "");
  if (!match) throw new FeedbackError(400, "invalid_item");
  return Number(match[1]);
};

export const today = (now) => new Date(now).toISOString().slice(0, 10);

const invalid = (message) => {
  const error = new FeedbackError(400, "invalid_item");
  error.message = message;
  return error;
};

const line = (value, field, { minimum = 0, maximum }) => {
  if (value == null) value = "";
  if (typeof value !== "string") throw invalid(`${field} must be text`);
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < minimum) throw invalid(minimum > 1 ? `${field} needs at least ${minimum} characters` : `${field} is required`);
  if (text.length > maximum) throw invalid(`${field} is limited to ${maximum} characters`);
  return text;
};

const block = (value, field, maximum) => {
  if (value == null) return "";
  if (typeof value !== "string") throw invalid(`${field} must be text`);
  const text = value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length > maximum) throw invalid(`${field} is limited to ${maximum} characters`);
  return text;
};

export const statusInfo = (kind, status) => STATUSES[kind]?.find((candidate) => candidate.id === status);

const EDITABLE = ["kind", "title", "summary", "notes", "status", "platforms", "priority", "public", "requests", "shippedIn", "releaseURL"];

// Validates editable fields over `existing` and returns the complete editable item.
export const normalizeItem = (input, existing = null) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw invalid("Item is missing");
  const unknown = Object.keys(input).filter((key) => !EDITABLE.includes(key) && key !== "id");
  if (unknown.length) throw invalid(`Unknown field ${unknown[0]}`);
  const kind = input.kind ?? existing?.kind;
  if (!KINDS[kind]) throw invalid("Choose Feature or Bug");
  const status = input.status ?? existing?.status ?? "new";
  if (!statusInfo(kind, status)) throw invalid(`“${status}” isn’t a ${KINDS[kind].toLowerCase()} status`);
  const platforms = input.platforms ?? existing?.platforms ?? [];
  if (!Array.isArray(platforms) || platforms.some((platform) => !PLATFORMS[platform])) throw invalid("Unknown platform");
  const priority = input.priority ?? existing?.priority ?? "normal";
  if (!PRIORITIES.includes(priority)) throw invalid("Unknown priority");
  const requests = input.requests ?? existing?.requests ?? 0;
  if (!Number.isSafeInteger(requests) || requests < 0 || requests > 1_000_000) throw invalid("Requests must be a whole number");
  const releaseURL = line(input.releaseURL ?? existing?.releaseURL, "Release link", { maximum: 300 });
  if (releaseURL && !releaseURL.startsWith(RELEASE_URL_PREFIX)) throw invalid("Release link must be a Cedar website page");
  return {
    kind,
    title: line(input.title ?? existing?.title, "Title", { minimum: 3, maximum: 120 }),
    summary: block(input.summary ?? existing?.summary, "Public summary", 600),
    notes: block(input.notes ?? existing?.notes, "Private notes", 20_000),
    status,
    platforms: Object.keys(PLATFORMS).filter((platform) => platforms.includes(platform)),
    priority,
    public: Boolean(input.public ?? existing?.public ?? false),
    requests,
    shippedIn: line(input.shippedIn ?? existing?.shippedIn, "Shipped in", { maximum: 40 }),
    releaseURL,
  };
};

// True when an edit changes something, so no-op saves keep the item's updated date.
export const changesItem = (existing, next) => EDITABLE.some((key) => JSON.stringify(existing[key]) !== JSON.stringify(next[key]));

export const isPublished = (item) => item.public && Boolean(statusInfo(item.kind, item.status)?.public);

export const publicFeed = (items) => {
  const published = items
    .filter(isPublished)
    .sort((left, right) => itemNumber(left.id) - itemNumber(right.id))
    .map((item) => {
      const entry = { id: item.id, kind: item.kind, title: item.title };
      if (item.summary) entry.summary = item.summary;
      entry.status = item.status;
      entry.platforms = item.platforms;
      if (item.requests > 0) entry.requests = item.requests;
      if (item.shippedIn && ["shipped", "fixed"].includes(item.status)) {
        entry.shippedIn = item.shippedIn;
        if (item.releaseURL) entry.releaseURL = item.releaseURL;
      }
      entry.updated = item.updated;
      return entry;
    });
  const updated = published.reduce((latest, item) => (item.updated > latest ? item.updated : latest), "");
  return { schemaVersion: 1, updated: updated || null, items: published };
};

const CHANNEL_NAMES = { app: "the app", website: "the website", discord: "Discord" };

// Builds an item from a submission. Contact details are never copied.
export const itemFromSubmission = (submission, overrides = {}) => {
  const context = [
    submission.appVersion && `App version: ${submission.appVersion}`,
    submission.osVersion && `System: ${submission.osVersion}`,
    submission.deviceModel && `Device: ${submission.deviceModel}`,
    submission.reporter && `Requested by ${submission.reporter} on Discord.`,
    `From ${CHANNEL_NAMES[submission.channel] ?? submission.channel}, reference ${submission.submissionID.slice(0, 8)}`,
  ].filter(Boolean).join("\n");
  return normalizeItem({
    kind: submission.kind,
    title: submission.title.slice(0, 120),
    notes: `${submission.details}\n\n${context}`,
    status: "new",
    platforms: PLATFORMS[submission.platform] ? [submission.platform] : [],
    requests: 1,
    public: false,
    ...overrides,
  });
};
