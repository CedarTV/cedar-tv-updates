import assert from "node:assert/strict";
import test from "node:test";
import { LIMITS, respond } from "../src/feedback.js";
import { announcePending } from "../src/operations.js";
import { admin, dependencies, environment, fakeDiscord, memoryStore, post, submissionBody as body, WEB } from "./helpers.js";

const send = (request, env = environment(), deps = dependencies()) => respond(request, env, deps);

test("website submission is cleaned, stored and answered with CORS", async () => {
  const deps = dependencies();
  const response = await send(post(body()), environment(), deps);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), WEB);
  assert.match((await response.json()).reference, /^[0-9a-f]{8}$/);
  assert.equal(deps.store.rows.length, 1);
  assert.equal(deps.store.rows[0].title, "Guide freezes on scroll");
  assert.equal(deps.store.rows[0].channel, "website");
  assert.equal(deps.store.rows[0].honeypot, undefined);
});

test("app submission needs the client header and gets no CORS", async () => {
  const deps = dependencies();
  assert.equal((await send(post(body(), {}), environment(), deps)).status, 403);
  const accepted = await send(post(body({ elapsedMs: undefined }), { "X-Cedar-Client": "app" }), environment(), deps);
  assert.equal(accepted.status, 201);
  assert.equal(accepted.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal(deps.store.rows[0].channel, "app");
});

test("new submissions are posted to the Discord triage channel", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await deps.settle();
  const [call] = deps.discord.calls;
  assert.equal(call.op, "send");
  assert.equal(call.channelID, "triage");
  assert.equal(call.message.embeds[0].title, "Guide freezes on scroll");
  assert.doesNotMatch(JSON.stringify(call.message), /viewer@example\.com/);
  assert.match(call.message.embeds[0].footer.text, /email provided/);
  assert.equal(deps.store.rows[0].discordMessageID, "1001");
});

test("other origins are refused", async () => {
  assert.equal((await send(post(body(), { Origin: "https://evil.example" }))).status, 403);
});

test("honeypot and instant website posts look successful but are dropped", async () => {
  const deps = dependencies();
  assert.equal((await send(post(body({ website: "spam" })), environment(), deps)).status, 201);
  assert.equal((await send(post(body({ elapsedMs: 200 })), environment(), deps)).status, 201);
  assert.equal(deps.store.rows.length, 0);
});

test("invalid fields are rejected", async () => {
  for (const [payload, code] of [
    [body({ kind: "question" }), "invalid_kind"],
    [body({ platform: "windows" }), "invalid_platform"],
    [body({ title: "x" }), "invalid_title"],
    [body({ details: "short" }), "invalid_details"],
    [body({ contact: "not an email" }), "invalid_contact"],
    [body({ extra: true }), "unknown_field"],
    [body({ schemaVersion: 2 }), "unsupported_schema"],
  ]) {
    const response = await send(post(payload));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, code);
  }
});

test("a client is capped per day and by the rate limiter", async () => {
  const store = memoryStore();
  for (let index = 0; index < LIMITS.submissionsPerClientDay; index += 1) {
    assert.equal((await send(post(body()), environment(), dependencies({ store, now: 0 }))).status, 201);
  }
  assert.equal((await send(post(body()), environment(), dependencies({ store, now: 0 }))).status, 429);
  assert.equal((await send(post(body()), environment(), dependencies({ store, now: 86_400_000 }))).status, 201);
  const limited = environment({ SUBMIT_RATE_LIMITER: { limit: async () => ({ success: false }) } });
  assert.equal((await send(post(body()), limited)).status, 429);
});

test("admin routes need the token and no browser origin", async () => {
  const deps = dependencies();
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  assert.equal((await send(admin("/v1/inbox", { headers: { Authorization: "Bearer wrong" } }), environment(), deps)).status, 401);
  assert.equal((await send(admin("/v1/items", { headers: { Origin: WEB } }), environment(), deps)).status, 403);
  assert.equal((await send(admin("/v1/inbox"), environment({ ADMIN_TOKEN: "short" }), deps)).status, 503);
  const response = await send(admin("/v1/inbox"), environment(), deps);
  assert.equal(response.status, 200);
  const { submissions } = await response.json();
  assert.equal(submissions[0].contact, "viewer@example.com");
});

test("accepting a submission creates a private item, clears contact and updates Discord", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await deps.settle();
  const id = deps.store.rows[0].submissionID;
  const response = await send(admin(`/v1/inbox/${id}/accept`, { method: "POST", body: "{}" }), environment(), deps);
  const { item } = await response.json();
  assert.equal(item.id, "CDR-1");
  assert.equal(item.status, "new");
  assert.equal(item.public, false);
  assert.equal(item.requests, 1);
  assert.doesNotMatch(item.notes, /viewer@example\.com/);
  assert.equal(deps.store.rows[0].contact, null);
  await deps.settle();
  const edit = deps.discord.calls.find((call) => call.op === "edit");
  assert.equal(edit.messageID, "1001");
  assert.match(edit.message.embeds[0].description, /Kept private as \*\*CDR-1\*\*.*<#roadmap>/);
  const panel = deps.discord.calls.find((call) => call.op === "send" && call.channelID === "roadmap");
  assert.match(panel.message.embeds[0].author.name, /CDR-1/);
  assert.equal(deps.store.items[0].discordChannelID, "roadmap");
  assert.equal((await send(admin(`/v1/inbox/${id}/accept`, { method: "POST", body: "{}" }), environment(), deps)).status, 409);
});

test("merging adds a request; discarding closes the report", async () => {
  const deps = dependencies();
  await send(post(body()), environment(), deps);
  await send(post(body({ title: "Guide freeze again" })), environment(), deps);
  await send(post(body({ kind: "feature", title: "Picture in picture" })), environment(), deps);
  const [first, second, feature] = deps.store.rows.map((row) => row.submissionID);
  await send(admin(`/v1/inbox/${first}/accept`, { method: "POST", body: "{}" }), environment(), deps);
  const merged = await send(admin(`/v1/inbox/${second}/merge`, { method: "POST", body: JSON.stringify({ itemID: "CDR-1" }) }), environment(), deps);
  assert.equal((await merged.json()).item.requests, 2);
  const mismatch = await send(admin(`/v1/inbox/${feature}/merge`, { method: "POST", body: JSON.stringify({ itemID: "CDR-1" }) }), environment(), deps);
  assert.equal((await mismatch.json()).error, "kind_mismatch");
  assert.equal((await send(admin(`/v1/inbox/${feature}/discard`, { method: "POST", body: "{}" }), environment(), deps)).status, 200);
  assert.deepEqual(deps.store.rows.map((row) => row.state), ["accepted", "merged", "discarded"]);
});

test("an item's original reports stay readable to staff after triage, without email", async () => {
  const deps = dependencies();
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await send(post(body({ title: "Guide freeze again", details: "It froze again on the second Apple TV." })), environment(), deps);
  const [first, second] = deps.store.rows.map((row) => row.submissionID);
  await send(admin(`/v1/inbox/${first}/accept`, { method: "POST", body: "{}" }), environment(), deps);
  await send(admin(`/v1/inbox/${second}/merge`, { method: "POST", body: JSON.stringify({ itemID: "CDR-1" }) }), environment(), deps);
  // Staff can rewrite the item's notes without losing the report.
  await send(admin("/v1/items/CDR-1", { method: "PUT", body: JSON.stringify({ notes: "" }) }), environment(), deps);

  const response = await send(admin("/v1/items/CDR-1/reports"), environment(), deps);
  assert.equal(response.status, 200);
  const { reports } = await response.json();
  assert.deepEqual(reports.map((report) => [report.state, report.details]), [
    ["accepted", "Scrolling the guide past midnight freezes the Apple TV app."],
    ["merged", "It froze again on the second Apple TV."],
  ]);
  assert.equal(reports[0].appVersion, "1.0.0 (68)");
  assert.doesNotMatch(JSON.stringify(reports), /viewer@example\.com|contact/);
  assert.equal((await send(admin("/v1/items/CDR-9/reports"), environment(), deps)).status, 404);
  assert.equal((await send(new Request("https://feedback.test/v1/items/CDR-1/reports"), environment(), deps)).status, 401);
});

test("items can be created, edited and deleted, and the roadmap shows only public ones", async () => {
  const deps = dependencies();
  const create = (fields) => send(admin("/v1/items", { method: "POST", body: JSON.stringify(fields) }), environment(), deps).then((response) => response.json());
  const { item } = await create({ kind: "feature", title: "Picture in picture", status: "planned", public: true, notes: "secret", priority: "high" });
  await create({ kind: "bug", title: "Private crash", status: "investigating" });
  const bad = await send(admin("/v1/items", { method: "POST", body: JSON.stringify({ kind: "feature", title: "x" }) }), environment(), deps);
  assert.equal(bad.status, 400);
  assert.match((await bad.json()).message, /at least 3/);

  const edited = await send(admin(`/v1/items/${item.id}`, { method: "PUT", body: JSON.stringify({ status: "shipped", shippedIn: "1.0.0 (70)" }) }), environment(), deps);
  assert.equal((await edited.json()).item.status, "shipped");

  const listed = await (await send(admin("/v1/items"), environment(), deps)).json();
  assert.equal(listed.items.length, 2);
  assert.ok(listed.vocabulary.statuses.feature.length > 0);

  const feed = await (await send(new Request("https://feedback.test/v1/roadmap"), environment(), deps)).json();
  assert.deepEqual(feed.items.map((entry) => entry.id), ["CDR-1"]);
  assert.equal(feed.items[0].shippedIn, "1.0.0 (70)");
  assert.equal(feed.items[0].notes, undefined);
  assert.equal(feed.items[0].priority, undefined);

  assert.equal((await send(admin("/v1/items/CDR-1", { method: "DELETE" }), environment(), deps)).status, 200);
  assert.equal((await send(admin("/v1/items/CDR-1", { method: "DELETE" }), environment(), deps)).status, 404);
});

test("the roadmap feed is public and readable from any origin", async () => {
  const response = await send(new Request("https://feedback.test/v1/roadmap", { headers: { Origin: "https://example.com" } }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=10");
  assert.deepEqual(await response.json(), { schemaVersion: 1, updated: null, items: [] });
});

test("preflight answers only the site origin", async () => {
  const preflight = (origin) => new Request("https://feedback.test/v1/feedback", { method: "OPTIONS", headers: { Origin: origin } });
  const ok = await send(preflight(WEB));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
  assert.equal((await send(preflight("https://evil.example"))).status, 403);
});

test("reports that never reached Discord are posted later, once", async () => {
  const deps = dependencies({ now: 1_000_000 });
  await send(post(body()), environment(), deps);
  await send(post(body({ title: "Second report" })), environment(), dependencies({ store: deps.store, now: 1_100_000 }));
  const later = dependencies({ store: deps.store, discord: fakeDiscord(), now: 1_000_000 + 2 * 60 * 1000 + 1 });
  assert.equal(await announcePending(later, environment()), 1);
  assert.equal(later.discord.calls[0].message.embeds[0].title, "Guide freezes on scroll");
  assert.equal(await announcePending(later, environment()), 0);
  later.now += 10 * 60 * 1000;
  assert.equal(await announcePending(later, environment()), 1);
  assert.equal(await announcePending(dependencies({ store: deps.store }), environment()), 0);
});
