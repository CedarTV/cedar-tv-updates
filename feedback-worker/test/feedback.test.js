import assert from "node:assert/strict";
import test from "node:test";
import { LIMITS, respond } from "../src/feedback.js";

const WEB = "https://cedartv.github.io";
const ADMIN = "a".repeat(40);

const memoryStore = () => {
  const rows = [];
  return {
    rows,
    async countForClientDay(clientHash) { return rows.filter((row) => row.clientHash === clientHash).length; },
    async insert(row) { rows.push({ ...row, state: "new", itemID: null }); },
    async list(state) { return rows.filter((row) => row.state === state); },
    async triage(id, state, itemID) {
      const row = rows.find((candidate) => candidate.submissionID === id);
      if (!row) return false;
      Object.assign(row, { state, itemID, contact: null });
      return true;
    },
  };
};

const allowAll = { limit: async () => ({ success: true }) };
const environment = (overrides = {}) => ({
  CEDAR_WEB_ORIGIN: WEB,
  CLIENT_HASH_SALT: "salt",
  ADMIN_TOKEN: ADMIN,
  SUBMIT_RATE_LIMITER: allowAll,
  ADMIN_RATE_LIMITER: allowAll,
  ...overrides,
});

const body = (overrides = {}) => ({
  schemaVersion: 1,
  kind: "bug",
  title: "Guide  freezes\n on scroll",
  details: "Scrolling the guide past midnight freezes the Apple TV app.",
  platform: "apple-tv",
  appVersion: "1.0.0 (68)",
  elapsedMs: 9_000,
  ...overrides,
});

const post = (payload, headers = { Origin: WEB }) => new Request("https://feedback.test/v1/feedback", {
  method: "POST",
  headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9", ...headers },
  body: JSON.stringify(payload),
});

const admin = (path, init = {}) => new Request(`https://feedback.test${path}`, {
  ...init,
  headers: { Authorization: `Bearer ${ADMIN}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
});

test("website submission is cleaned, stored and answered with CORS", async () => {
  const store = memoryStore();
  const response = await respond(post(body()), environment(), store, 0);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), WEB);
  assert.match((await response.json()).reference, /^[0-9a-f]{8}$/);
  assert.equal(store.rows.length, 1);
  assert.equal(store.rows[0].title, "Guide freezes on scroll");
  assert.equal(store.rows[0].channel, "website");
});

test("app submission needs the client header and gets no CORS", async () => {
  const store = memoryStore();
  const refused = await respond(post(body(), {}), environment(), store, 0);
  assert.equal(refused.status, 403);
  const accepted = await respond(post(body({ elapsedMs: undefined }), { "X-Cedar-Client": "app" }), environment(), store, 0);
  assert.equal(accepted.status, 201);
  assert.equal(accepted.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(store.rows[0].channel, "app");
});

test("other origins are refused", async () => {
  const response = await respond(post(body(), { Origin: "https://evil.example" }), environment(), memoryStore(), 0);
  assert.equal(response.status, 403);
});

test("honeypot and instant website posts look successful but are dropped", async () => {
  const store = memoryStore();
  assert.equal((await respond(post(body({ website: "spam" })), environment(), store, 0)).status, 201);
  assert.equal((await respond(post(body({ elapsedMs: 200 })), environment(), store, 0)).status, 201);
  assert.equal(store.rows.length, 0);
});

test("invalid fields are rejected", async () => {
  const env = environment();
  for (const [payload, code] of [
    [body({ kind: "question" }), "invalid_kind"],
    [body({ platform: "windows" }), "invalid_platform"],
    [body({ title: "x" }), "invalid_title"],
    [body({ details: "short" }), "invalid_details"],
    [body({ contact: "not an email" }), "invalid_contact"],
    [body({ extra: true }), "unknown_field"],
    [body({ schemaVersion: 2 }), "unsupported_schema"],
  ]) {
    const response = await respond(post(payload), env, memoryStore(), 0);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, code);
  }
});

test("a client is capped per day and by the rate limiter", async () => {
  const store = memoryStore();
  for (let index = 0; index < LIMITS.submissionsPerClientDay; index += 1) {
    assert.equal((await respond(post(body()), environment(), store, 0)).status, 201);
  }
  const capped = await respond(post(body()), environment(), store, 0);
  assert.equal(capped.status, 429);
  const nextDay = await respond(post(body()), environment(), store, 86_400_000);
  assert.equal(nextDay.status, 201);
  const limited = await respond(post(body()), environment({ SUBMIT_RATE_LIMITER: { limit: async () => ({ success: false }) } }), memoryStore(), 0);
  assert.equal(limited.status, 429);
});

test("inbox needs the admin token and no browser origin", async () => {
  const store = memoryStore();
  await respond(post(body({ contact: "viewer@example.com" })), environment(), store, 0);
  assert.equal((await respond(admin("/v1/inbox", { headers: { Authorization: "Bearer wrong" } }), environment(), store, 0)).status, 401);
  assert.equal((await respond(admin("/v1/inbox", { headers: { Origin: WEB } }), environment(), store, 0)).status, 403);
  assert.equal((await respond(admin("/v1/inbox"), environment({ ADMIN_TOKEN: "short" }), store, 0)).status, 503);
  const response = await respond(admin("/v1/inbox"), environment(), store, 0);
  assert.equal(response.status, 200);
  const { submissions } = await response.json();
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].contact, "viewer@example.com");
});

test("triage links an item, clears contact and validates input", async () => {
  const store = memoryStore();
  await respond(post(body({ contact: "viewer@example.com" })), environment(), store, 0);
  const id = store.rows[0].submissionID;
  const triage = (payload, target = id) => respond(
    admin(`/v1/inbox/${target}`, { method: "POST", body: JSON.stringify({ schemaVersion: 1, ...payload }) }),
    environment(), store, 5,
  );
  assert.equal((await triage({ state: "accepted" })).status, 400);
  assert.equal((await triage({ state: "discarded", itemID: "CDR-1" })).status, 400);
  assert.equal((await triage({ state: "accepted", itemID: "CDR-7" }, crypto.randomUUID())).status, 404);
  assert.equal((await triage({ state: "accepted", itemID: "CDR-7" })).status, 200);
  assert.equal(store.rows[0].state, "accepted");
  assert.equal(store.rows[0].itemID, "CDR-7");
  assert.equal(store.rows[0].contact, null);
});

test("preflight answers only the site origin", async () => {
  const preflight = (origin) => new Request("https://feedback.test/v1/feedback", { method: "OPTIONS", headers: { Origin: origin } });
  const ok = await respond(preflight(WEB), environment(), memoryStore(), 0);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.equal((await respond(preflight("https://evil.example"), environment(), memoryStore(), 0)).status, 403);
});
