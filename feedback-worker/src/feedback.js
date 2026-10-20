// Request handling for the feedback inbox. Storage is injected so tests can run without D1.

export const LIMITS = Object.freeze({
  requestBytes: 16 * 1_024,
  titleMinimum: 3,
  titleMaximum: 120,
  detailsMinimum: 10,
  detailsMaximum: 4_000,
  shortField: 64,
  contactMaximum: 254,
  submissionsPerClientDay: 10,
  minimumWebsiteFillMs: 3_000,
  inboxPage: 200,
  triagedRetentionMs: 30 * 24 * 60 * 60 * 1000,
  untriagedRetentionMs: 365 * 24 * 60 * 60 * 1000,
});

export const KINDS = Object.freeze(["bug", "feature"]);
export const PLATFORMS = Object.freeze([
  "iphone", "ipad", "apple-tv", "mac", "android-tv", "radio", "website", "other",
]);
export const TRIAGE_STATES = Object.freeze(["accepted", "merged", "discarded"]);

const SUBMISSION_FIELDS = [
  "schemaVersion", "kind", "title", "details", "platform", "appVersion", "osVersion",
  "deviceModel", "contact", "website", "elapsedMs",
];
const VERSION_PATTERN = /^[0-9A-Za-z.() -]{1,32}$/;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const ITEM_ID_PATTERN = /^CDR-[1-9]\d{0,6}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export class FeedbackError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export const jsonResponse = (status, body, origin = null) => {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Max-Age", "86400");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
};

const sha256 = async (text) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

// Single spaces only, no control characters, so titles render cleanly in the tracker.
const cleanLine = (value) => value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
const cleanText = (value) => value
  .replace(/\r\n?/g, "\n")
  .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const requiredText = (value, clean, minimum, maximum, code) => {
  if (typeof value !== "string") throw new FeedbackError(400, code);
  const text = clean(value);
  if (text.length < minimum || text.length > maximum) throw new FeedbackError(400, code);
  return text;
};

const optionalText = (value, maximum, pattern, code) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new FeedbackError(400, code);
  const text = cleanLine(value);
  if (!text) return null;
  if (text.length > maximum || (pattern && !pattern.test(text))) throw new FeedbackError(400, code);
  return text;
};

export const readJSON = async (request) => {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new FeedbackError(415, "content_type_required");
  }
  if (Number(request.headers.get("Content-Length") || 0) > LIMITS.requestBytes) {
    throw new FeedbackError(413, "request_too_large");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > LIMITS.requestBytes) {
    throw new FeedbackError(413, "request_too_large");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new FeedbackError(400, "invalid_json");
  }
};

export const validateSubmission = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new FeedbackError(400, "invalid_json");
  if (Object.keys(body).some((key) => !SUBMISSION_FIELDS.includes(key))) {
    throw new FeedbackError(400, "unknown_field");
  }
  if (body.schemaVersion !== 1) throw new FeedbackError(400, "unsupported_schema");
  if (!KINDS.includes(body.kind)) throw new FeedbackError(400, "invalid_kind");
  if (!PLATFORMS.includes(body.platform)) throw new FeedbackError(400, "invalid_platform");
  return {
    kind: body.kind,
    title: requiredText(body.title, cleanLine, LIMITS.titleMinimum, LIMITS.titleMaximum, "invalid_title"),
    details: requiredText(body.details, cleanText, LIMITS.detailsMinimum, LIMITS.detailsMaximum, "invalid_details"),
    platform: body.platform,
    appVersion: optionalText(body.appVersion, 32, VERSION_PATTERN, "invalid_app_version"),
    osVersion: optionalText(body.osVersion, LIMITS.shortField, null, "invalid_os_version"),
    deviceModel: optionalText(body.deviceModel, LIMITS.shortField, null, "invalid_device_model"),
    contact: optionalText(body.contact, LIMITS.contactMaximum, EMAIL_PATTERN, "invalid_contact"),
    honeypot: typeof body.website === "string" && body.website.trim() !== "",
    elapsedMs: Number.isSafeInteger(body.elapsedMs) ? body.elapsedMs : null,
  };
};

// The website posts with an Origin header; the Cedar apps post without one and identify
// themselves. Any other browser origin is refused before the body is read.
export const submissionChannel = (request, env) => {
  const origin = request.headers.get("Origin");
  if (origin) {
    if (!env.CEDAR_WEB_ORIGIN || origin !== env.CEDAR_WEB_ORIGIN) throw new FeedbackError(403, "origin_not_allowed");
    return { channel: "website", origin };
  }
  if (request.headers.get("X-Cedar-Client") === "app") return { channel: "app", origin: null };
  throw new FeedbackError(403, "client_not_allowed");
};

const clientDayHash = async (request, env, now) => {
  if (!env.CLIENT_HASH_SALT) throw new FeedbackError(503, "not_configured");
  const client = request.headers.get("CF-Connecting-IP") || "unidentified-client";
  const day = new Date(now).toISOString().slice(0, 10);
  return sha256(`${env.CLIENT_HASH_SALT}|${day}|${client}`);
};

const limit = async (limiter, key) => {
  if (!limiter) throw new FeedbackError(503, "rate_limiter_unavailable");
  const result = await limiter.limit({ key });
  if (!result.success) throw new FeedbackError(429, "rate_limited");
};

const submit = async (request, env, store, now) => {
  const { channel, origin } = submissionChannel(request, env);
  const clientHash = await clientDayHash(request, env, now);
  await limit(env.SUBMIT_RATE_LIMITER, `submit:${clientHash}`);
  const submission = validateSubmission(await readJSON(request));
  const reference = crypto.randomUUID();
  // Likely bots get the same success response so they don't learn to adapt, but nothing is stored.
  const looksAutomated = submission.honeypot
    || (channel === "website" && (submission.elapsedMs == null || submission.elapsedMs < LIMITS.minimumWebsiteFillMs));
  if (!looksAutomated) {
    if (await store.countForClientDay(clientHash) >= LIMITS.submissionsPerClientDay) {
      throw new FeedbackError(429, "daily_limit_reached");
    }
    await store.insert({ ...submission, submissionID: reference, channel, clientHash, createdAtMs: now });
  }
  return jsonResponse(201, { schemaVersion: 1, reference: reference.slice(0, 8) }, origin);
};

const timingSafeEqual = async (left, right) => {
  const [a, b] = await Promise.all([sha256(left), sha256(right)]);
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
};

const requireAdmin = async (request, env) => {
  if (request.headers.get("Origin")) throw new FeedbackError(403, "origin_not_allowed");
  if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32) throw new FeedbackError(503, "not_configured");
  const match = /^Bearer (\S+)$/.exec(request.headers.get("Authorization") || "");
  await limit(env.ADMIN_RATE_LIMITER, `admin:${await sha256(match?.[1] ?? "none")}`);
  if (!match || !(await timingSafeEqual(match[1], env.ADMIN_TOKEN))) {
    throw new FeedbackError(401, "invalid_authorization");
  }
};

const listInbox = async (request, env, store) => {
  await requireAdmin(request, env);
  const state = new URL(request.url).searchParams.get("state") || "new";
  if (state !== "new" && !TRIAGE_STATES.includes(state)) throw new FeedbackError(400, "invalid_state");
  const submissions = await store.list(state, LIMITS.inboxPage);
  return jsonResponse(200, { schemaVersion: 1, submissions });
};

const triage = async (request, env, store, submissionID, now) => {
  await requireAdmin(request, env);
  if (!UUID_PATTERN.test(submissionID)) throw new FeedbackError(400, "invalid_identifier");
  const body = await readJSON(request);
  if (!body || typeof body !== "object" || Object.keys(body).some((key) => !["schemaVersion", "state", "itemID"].includes(key))) {
    throw new FeedbackError(400, "unknown_field");
  }
  if (body.schemaVersion !== 1) throw new FeedbackError(400, "unsupported_schema");
  if (!TRIAGE_STATES.includes(body.state)) throw new FeedbackError(400, "invalid_state");
  const itemID = body.itemID ?? null;
  if (body.state === "discarded" ? itemID !== null : !ITEM_ID_PATTERN.test(itemID ?? "")) {
    throw new FeedbackError(400, "invalid_item");
  }
  // Contact details are cleared once a submission is triaged; the tracker never copies them.
  if (!(await store.triage(submissionID, body.state, itemID, now))) throw new FeedbackError(404, "not_found");
  return jsonResponse(200, { schemaVersion: 1 });
};

export const handle = async (request, env, store, now = Date.now()) => {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (request.method === "OPTIONS" && url.pathname === "/v1/feedback") {
    const { origin } = submissionChannel(request, env);
    return jsonResponse(200, { schemaVersion: 1 }, origin);
  }
  if (request.method === "POST" && url.pathname === "/v1/feedback") return submit(request, env, store, now);
  if (parts[0] === "v1" && parts[1] === "inbox") {
    if (parts.length === 2 && request.method === "GET") return listInbox(request, env, store);
    if (parts.length === 3 && request.method === "POST") return triage(request, env, store, parts[2], now);
  }
  throw new FeedbackError(404, "not_found");
};

export const respond = async (request, env, store, now) => {
  try {
    return await handle(request, env, store, now);
  } catch (error) {
    const origin = request.headers.get("Origin") === env.CEDAR_WEB_ORIGIN ? env.CEDAR_WEB_ORIGIN : null;
    if (error instanceof FeedbackError) return jsonResponse(error.status, { schemaVersion: 1, error: error.code }, origin);
    return jsonResponse(500, { schemaVersion: 1, error: "internal_error" }, origin);
  }
};
