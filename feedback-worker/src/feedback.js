// Request handling for the feedback inbox, roadmap items and Discord. Storage and the Discord
// client are injected as `deps` so tests can run without D1 or Discord.
import { FeedbackError } from "./errors.js";
import { handleInteraction } from "./discord.js";
import {
  acceptSubmission, announceSubmission, createItem, deleteItem, discardSubmission, ensureItemMessage,
  itemReports, mergeSubmission, updateItem,
} from "./operations.js";
import { publicFeed, vocabulary } from "./tracker.js";

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
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export { FeedbackError };

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

export const sha256 = async (text) => {
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

// Stores a validated submission and posts it to the Discord triage channel.
export const recordSubmission = async (deps, env, submission, meta) => {
  const record = { ...submission, ...meta, submissionID: crypto.randomUUID(), createdAtMs: deps.now };
  await deps.store.insert(record);
  announceSubmission(deps, env, { ...record, state: "new" });
  return record;
};

const submit = async (request, env, deps) => {
  const { channel, origin } = submissionChannel(request, env);
  const clientHash = await clientDayHash(request, env, deps.now);
  await limit(env.SUBMIT_RATE_LIMITER, `submit:${clientHash}`);
  const submission = validateSubmission(await readJSON(request));
  // Likely bots get the same success response so they don't learn to adapt, but nothing is stored.
  const looksAutomated = submission.honeypot
    || (channel === "website" && (submission.elapsedMs == null || submission.elapsedMs < LIMITS.minimumWebsiteFillMs));
  if (looksAutomated) return jsonResponse(201, { schemaVersion: 1, reference: crypto.randomUUID().slice(0, 8) }, origin);
  if (await deps.store.countForClientDay(clientHash) >= LIMITS.submissionsPerClientDay) {
    throw new FeedbackError(429, "daily_limit_reached");
  }
  const { honeypot: _honeypot, elapsedMs: _elapsed, ...fields } = submission;
  const record = await recordSubmission(deps, env, fields, { channel, clientHash });
  return jsonResponse(201, { schemaVersion: 1, reference: record.submissionID.slice(0, 8) }, origin);
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

const submissionID = (value) => {
  if (!UUID_PATTERN.test(value)) throw new FeedbackError(400, "invalid_identifier");
  return value;
};

const ok = (body) => jsonResponse(200, { schemaVersion: 1, ...body });

// Admin routes for Cedar Tracker. Bodies are plain item fields.
const adminRoutes = {
  "GET inbox": async (request, env, deps) => {
    const state = new URL(request.url).searchParams.get("state") || "new";
    if (state !== "new" && !TRIAGE_STATES.includes(state)) throw new FeedbackError(400, "invalid_state");
    return ok({ submissions: await deps.store.list(state, LIMITS.inboxPage) });
  },
  "POST inbox/:id/accept": async (request, env, deps, id) => ok({ item: await acceptSubmission(deps, submissionID(id), await readJSON(request)) }),
  "POST inbox/:id/merge": async (request, env, deps, id) => ok({ item: await mergeSubmission(deps, submissionID(id), (await readJSON(request)).itemID) }),
  "POST inbox/:id/discard": async (request, env, deps, id) => {
    await discardSubmission(deps, submissionID(id));
    return ok({});
  },
  "GET items": async (request, env, deps) => ok({ items: await deps.store.listItems(), vocabulary: vocabulary() }),
  "POST items": async (request, env, deps) => {
    const item = await createItem(deps, await readJSON(request));
    ensureItemMessage(deps, env, item);
    return ok({ item });
  },
  // Staff-only: the full original reports behind an item, kept for as long as the item exists.
  "GET items/:id/reports": async (request, env, deps, id) => ok({ reports: await itemReports(deps, id) }),
  "PUT items/:id": async (request, env, deps, id) => ok({ item: await updateItem(deps, id, await readJSON(request)) }),
  "DELETE items/:id": async (request, env, deps, id) => ok({ item: await deleteItem(deps, id) }),
};

const matchAdminRoute = (method, parts) => {
  for (const [key, handler] of Object.entries(adminRoutes)) {
    const [routeMethod, pattern] = key.split(" ");
    const expected = pattern.split("/");
    if (routeMethod !== method || expected.length !== parts.length) continue;
    const params = [];
    if (expected.every((part, index) => (part === ":id" ? params.push(decodeURIComponent(parts[index])) : part === parts[index]))) {
      return { handler, params };
    }
  }
  return null;
};

// The public roadmap feed. Anyone may read it; it's cached for 10 seconds at the edge.
const roadmap = async (request, deps) => {
  const cache = globalThis.caches?.default;
  const cached = await cache?.match(request);
  if (cached) return cached;
  const response = new Response(JSON.stringify(publicFeed(await deps.store.listItems())), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=10",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
  if (cache) deps.waitUntil(cache.put(request, response.clone()));
  return response;
};

export const handle = async (request, env, deps) => {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.pathname === "/v1/feedback") {
    if (request.method === "OPTIONS") {
      const { origin } = submissionChannel(request, env);
      return jsonResponse(200, { schemaVersion: 1 }, origin);
    }
    if (request.method === "POST") return submit(request, env, deps);
  }
  if (url.pathname === "/v1/roadmap" && request.method === "GET") return roadmap(request, deps);
  if (url.pathname === "/v1/discord/interactions" && request.method === "POST") return handleInteraction(request, env, deps);
  if (parts[0] === "v1") {
    const match = matchAdminRoute(request.method, parts.slice(1));
    if (match) {
      await requireAdmin(request, env);
      return match.handler(request, env, deps, ...match.params);
    }
  }
  throw new FeedbackError(404, "not_found");
};

export const respond = async (request, env, deps) => {
  deps.env ??= env;
  try {
    return await handle(request, env, deps);
  } catch (error) {
    const origin = request.headers.get("Origin") === env.CEDAR_WEB_ORIGIN ? env.CEDAR_WEB_ORIGIN : null;
    if (error instanceof FeedbackError) {
      const body = { schemaVersion: 1, error: error.code };
      if (error.message !== error.code) body.message = error.message;
      return jsonResponse(error.status, body, origin);
    }
    console.error(error);
    return jsonResponse(500, { schemaVersion: 1, error: "internal_error" }, origin);
  }
};
