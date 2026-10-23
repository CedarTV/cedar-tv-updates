// Staff tickets: the private bug and feature-request records reports turn into. Nothing here is
// ever public; a ticket reaches the roadmap only through a roadmap entry staff write for it.
import { FeedbackError } from "./errors.js";
import { PLATFORMS, PRIORITIES } from "./tracker.js";

export const TICKET_PREFIX = Object.freeze({ bug: "BUG", feature: "FR" });

export const TICKET_STATUSES = Object.freeze({
  bug: [
    { id: "new", label: "New" },
    { id: "confirmed", label: "Confirmed" },
    { id: "in-progress", label: "In progress" },
    { id: "fixed", label: "Fixed in code" },
    { id: "in-build", label: "In a build" },
    { id: "verified", label: "Verified" },
    { id: "released", label: "Released", closed: true },
    { id: "wont-fix", label: "Won’t fix", closed: true },
    { id: "cant-reproduce", label: "Can’t reproduce", closed: true },
    { id: "duplicate", label: "Duplicate", closed: true },
  ],
  feature: [
    { id: "new", label: "New" },
    { id: "considering", label: "Considering" },
    { id: "planned", label: "Planned" },
    { id: "in-progress", label: "In progress" },
    { id: "in-build", label: "In a build" },
    { id: "released", label: "Released", closed: true },
    { id: "declined", label: "Declined", closed: true },
    { id: "duplicate", label: "Duplicate", closed: true },
  ],
});

// Field labels, in the order staff see them. `kinds` limits a field to bugs or features.
export const TICKET_FIELDS = Object.freeze({
  title: { label: "Title", minimum: 3, maximum: 120, line: true },
  summary: { label: { bug: "What happens", feature: "Problem it solves" }, maximum: 4_000 },
  steps: { label: "Steps to reproduce", maximum: 4_000, kinds: ["bug"] },
  expected: { label: "Expected vs actual", maximum: 2_000, kinds: ["bug"] },
  notes: { label: { bug: "Investigation notes", feature: "Design notes" }, maximum: 20_000 },
  decision: { label: "Decision", maximum: 2_000, kinds: ["feature"] },
  brokeIn: { label: "Broke in", maximum: 40, line: true, kinds: ["bug"] },
  fixedIn: { label: { bug: "Fixed in build", feature: "Built in" }, maximum: 40, line: true },
  commit: { label: "Commit", maximum: 120, line: true },
  releasedIn: { label: "Released in", maximum: 40, line: true },
});

export const fieldLabel = (kind, key) => {
  const label = TICKET_FIELDS[key]?.label ?? key;
  return typeof label === "string" ? label : label[kind];
};

const ID = /^(BUG|FR)-([1-9]\d{0,6})$/;

export const isTicketID = (value) => ID.test(value ?? "");

export const ticketKind = (id) => {
  const match = ID.exec(id ?? "");
  if (!match) throw new FeedbackError(400, "invalid_ticket");
  return match[1] === "BUG" ? "bug" : "feature";
};

export const ticketStatus = (kind, status) => TICKET_STATUSES[kind]?.find((candidate) => candidate.id === status);
export const isClosed = (ticket) => Boolean(ticketStatus(ticket.kind, ticket.status)?.closed);
export const statusLabel = (ticket, status = ticket.status) => ticketStatus(ticket.kind, status)?.label ?? status;

const invalid = (message) => {
  const error = new FeedbackError(400, "invalid_ticket");
  error.message = message;
  return error;
};

const clean = (value, key, kind) => {
  const spec = TICKET_FIELDS[key];
  if (value == null) value = "";
  if (typeof value !== "string") throw invalid(`${fieldLabel(kind, key)} must be text`);
  const text = spec.line
    ? value.replace(/\s+/g, " ").trim()
    : value.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (spec.minimum && text.length < spec.minimum) throw invalid(`${fieldLabel(kind, key)} needs at least ${spec.minimum} characters`);
  if (text.length > spec.maximum) throw invalid(`${fieldLabel(kind, key)} is limited to ${spec.maximum} characters`);
  return text;
};

const EDITABLE = ["status", "priority", "platforms", ...Object.keys(TICKET_FIELDS)];

// Validates `input` over `existing` (or a new ticket of `kind`) and returns every editable field.
export const normalizeTicket = (input, existing = null, kind = existing?.kind) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw invalid("Ticket is missing");
  const unknown = Object.keys(input).filter((key) => !EDITABLE.includes(key) && key !== "id" && key !== "kind");
  if (unknown.length) throw invalid(`Unknown field ${unknown[0]}`);
  if (existing && input.kind && input.kind !== existing.kind) throw invalid("A ticket’s kind can’t change; open a new ticket instead");
  if (!TICKET_STATUSES[kind]) throw invalid("Choose Bug or Feature");
  const status = input.status ?? existing?.status ?? "new";
  if (!ticketStatus(kind, status)) throw invalid(`“${status}” isn’t a ${kind === "bug" ? "bug" : "feature"} status`);
  const priority = input.priority ?? existing?.priority ?? "normal";
  if (!PRIORITIES.includes(priority)) throw invalid("Unknown priority");
  const platforms = input.platforms ?? existing?.platforms ?? [];
  if (!Array.isArray(platforms) || platforms.some((platform) => !PLATFORMS[platform])) throw invalid("Unknown platform");
  const ticket = { kind, status, priority, platforms: Object.keys(PLATFORMS).filter((platform) => platforms.includes(platform)) };
  for (const key of Object.keys(TICKET_FIELDS)) {
    const value = input[key] ?? existing?.[key] ?? "";
    // Fields that don't apply to this kind stay empty.
    ticket[key] = TICKET_FIELDS[key].kinds && !TICKET_FIELDS[key].kinds.includes(kind) ? "" : clean(value, key, kind);
  }
  return ticket;
};

// The editable fields that differ, for the timeline ("Edited steps, notes").
export const changedFields = (existing, next) => EDITABLE.filter((key) => JSON.stringify(existing[key]) !== JSON.stringify(next[key]));

// A new ticket's fields from the report it starts from. The report itself stays attached, so
// only the title and platform are copied; staff fill in the rest as they learn more.
export const ticketFromSubmission = (submission, kind = submission.kind) => normalizeTicket({
  title: submission.title.slice(0, 120),
  platforms: PLATFORMS[submission.platform] ? [submission.platform] : [],
  brokeIn: kind === "bug" ? submission.appVersion ?? "" : "",
}, null, kind);

// Rough word overlap, to put the likeliest tickets first when attaching a report.
const words = (text) => new Set((text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((word) => !STOP_WORDS.has(word)));
const STOP_WORDS = new Set(["the", "and", "for", "when", "with", "not", "can", "cedar", "app", "does", "doesn", "from", "this", "that", "into", "after"]);

export const similarity = (left, right) => {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.sqrt(a.size * b.size);
};

export const ticketVocabulary = () => ({ statuses: TICKET_STATUSES, fields: TICKET_FIELDS, prefixes: TICKET_PREFIX });
