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

const json = (request, deps, env = environment()) => send(request, env, deps).then(async (response) => ({ status: response.status, body: await response.json() }));
const postJSON = (path, payload = {}) => admin(path, { method: "POST", body: JSON.stringify(payload) });

test("a report opens a private ticket, clears its email and keeps the report attached", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await deps.settle();
  const id = deps.store.rows[0].submissionID;
  const { body: opened } = await json(postJSON(`/v1/inbox/${id}/ticket`, { kind: "bug" }), deps);
  assert.deepEqual([opened.ticket.id, opened.ticket.status, opened.ticket.reports, opened.ticket.brokeIn], ["BUG-1", "new", 1, "1.0.0 (68)"]);
  assert.deepEqual(opened.ticket.platforms, ["apple-tv"]);
  assert.equal(deps.store.rows[0].contact, null);
  assert.equal(deps.store.rows[0].ticketID, "BUG-1");
  // Nothing reaches the roadmap until staff write an entry for it.
  assert.equal(deps.store.items.length, 0);
  await deps.settle();
  const thread = deps.discord.calls.find((call) => call.op === "thread");
  assert.equal(thread.forumID, "staffBugs");
  assert.equal(thread.body.name, "BUG-1 · Guide freezes on scroll");
  assert.deepEqual(thread.body.applied_tags.map((tag) => deps.discord.tagName(thread.id, tag)), ["New", "Apple TV"]);
  assert.match(JSON.stringify(thread.body.message.components), /t:status:BUG-1/);
  // The report is posted into the thread, and the triage message links to it.
  const original = deps.discord.calls.find((call) => call.op === "send" && call.channelID === thread.id);
  assert.equal(original.message.embeds[0].description, "Scrolling the guide past midnight freezes the Apple TV app.");
  const closed = deps.discord.calls.filter((call) => call.op === "edit" && call.messageID === "1001").at(-1);
  assert.match(closed.message.embeds[0].description, new RegExp(`Opened \\*\\*BUG-1\\*\\* Guide freezes on scroll · <#${thread.id}>`));
  assert.equal(deps.store.tickets[0].discordThreadID, thread.id);
  assert.equal((await json(postJSON(`/v1/inbox/${id}/ticket`, { kind: "bug" }), deps)).status, 409);
});

test("a bug report can become a feature ticket, and reports of either kind attach to any ticket", async () => {
  const deps = dependencies();
  await send(post(body()), environment(), deps);
  await send(post(body({ kind: "feature", title: "Guide should keep its place", details: "After a freeze the guide forgets where I was." })), environment(), deps);
  await send(post(body({ title: "Junk", details: "asdfasdfasdf" })), environment(), deps);
  const [first, second, junk] = deps.store.rows.map((row) => row.submissionID);
  assert.equal((await json(postJSON(`/v1/inbox/${first}/ticket`, { kind: "feature" }), deps)).body.ticket.id, "FR-1");
  const attached = await json(postJSON(`/v1/inbox/${second}/attach`, { ticketID: "FR-1" }), deps);
  assert.equal(attached.body.ticket.reports, 2);
  assert.equal((await json(postJSON(`/v1/inbox/${junk}/attach`, { ticketID: "BUG-9" }), deps)).status, 404);
  assert.equal((await send(postJSON(`/v1/inbox/${junk}/discard`), environment(), deps)).status, 200);
  assert.deepEqual(deps.store.rows.map((row) => [row.state, row.ticketID]), [["accepted", "FR-1"], ["merged", "FR-1"], ["discarded", null]]);
  const detail = (await json(admin("/v1/tickets/FR-1"), deps)).body;
  assert.deepEqual(detail.events.map((entry) => entry.type), ["created", "report"]);
  assert.equal(detail.reports.length, 2);
});

test("ticket edits are validated and every change lands on the timeline", async () => {
  const deps = dependencies();
  const { body: created } = await json(postJSON("/v1/tickets", { kind: "bug", title: "Audio drifts after an hour", priority: "high" }), deps);
  assert.equal(created.ticket.id, "BUG-1");
  const put = (fields) => json(admin("/v1/tickets/BUG-1", { method: "PUT", body: JSON.stringify(fields) }), deps);
  assert.equal((await put({ status: "planned" })).body.message, "“planned” isn’t a bug status");
  assert.match((await put({ kind: "feature" })).body.message, /kind can’t change/);
  // Feature-only fields don't stick to bugs.
  assert.equal((await put({ decision: "Not for bugs" })).body.ticket.decision, "");
  const edited = (await put({ status: "confirmed", steps: "1. Play a film\n2. Wait an hour", expected: "In sync. Actual: 300 ms late." })).body.ticket;
  assert.deepEqual([edited.status, edited.decision], ["confirmed", ""]);
  await json(postJSON("/v1/tickets/BUG-1/notes", { text: "Only with the HomePods." }), deps);
  assert.equal((await json(postJSON("/v1/tickets/BUG-1/notes", { text: "  " }), deps)).status, 400);
  const { events } = (await json(admin("/v1/tickets/BUG-1"), deps)).body;
  assert.deepEqual(events.map((entry) => [entry.type, entry.body]), [
    ["created", "Opened directly."],
    ["status", "New → Confirmed"],
    ["edit", "Edited steps to reproduce, expected vs actual"],
    ["note", "Only with the HomePods."],
  ]);
  const listed = (await json(admin("/v1/tickets"), deps)).body;
  assert.equal(listed.tickets.length, 1);
  assert.ok(listed.vocabulary.tickets.statuses.bug.some((status) => status.id === "in-build"));
});

test("a ticket on the roadmap moves its entry, and releasing a build ships both", async () => {
  const deps = dependencies();
  await json(postJSON("/v1/tickets", { kind: "feature", title: "Mini player" }), deps);
  await json(postJSON("/v1/tickets", { kind: "feature", title: "Mini player on Mac" }), deps);
  const linked = (await json(postJSON("/v1/tickets/FR-1/roadmap", { create: { title: "A mini player", summary: "Keep watching while you browse." } }), deps)).body;
  assert.deepEqual([linked.entry.id, linked.entry.status, linked.entry.statusMode, linked.entry.public], ["CDR-1", "considering", "follow", true]);
  await json(postJSON("/v1/tickets/FR-2/roadmap", { entryID: "CDR-1" }), deps);
  const put = (id, fields) => json(admin(`/v1/tickets/${id}`, { method: "PUT", body: JSON.stringify(fields) }), deps);
  await put("FR-1", { status: "planned" });
  assert.equal(deps.store.items[0].status, "planned");
  await put("FR-1", { status: "in-build", fixedIn: "70" });
  await put("FR-2", { status: "in-build", fixedIn: "70" });
  assert.equal(deps.store.items[0].status, "in-progress");
  const feedBefore = await (await send(new Request("https://feedback.test/v1/roadmap"), environment(), deps)).json();
  assert.deepEqual(feedBefore.items.map((entry) => [entry.id, entry.status]), [["CDR-1", "in-progress"]]);

  const release = (await json(postJSON("/v1/releases", { build: "70", version: "1.0.1", releaseURL: "https://cedartv.github.io/cedar-tv-updates/apple/releases/" }), deps)).body;
  assert.deepEqual([release.releasedIn, release.tickets.map((ticket) => ticket.id)], ["1.0.1 (70)", ["FR-1", "FR-2"]]);
  const [entry] = deps.store.items;
  assert.deepEqual([entry.status, entry.shippedIn, entry.releaseURL], ["shipped", "1.0.1 (70)", "https://cedartv.github.io/cedar-tv-updates/apple/releases/"]);
  const feed = await (await send(new Request("https://feedback.test/v1/roadmap"), environment(), deps)).json();
  assert.equal(feed.items[0].shippedIn, "1.0.1 (70)");
  assert.doesNotMatch(JSON.stringify(feed), /FR-1|Mini player on Mac/);
  assert.equal((await json(postJSON("/v1/releases", { build: "70" }), deps)).body.tickets.length, 0);

  // Setting the status by hand stops following; switching back recomputes it.
  await json(admin("/v1/items/CDR-1", { method: "PUT", body: JSON.stringify({ statusMode: "manual", status: "planned" }) }), deps);
  assert.equal(deps.store.items[0].status, "planned");
  const followed = (await json(admin("/v1/items/CDR-1", { method: "PUT", body: JSON.stringify({ statusMode: "follow" }) }), deps)).body.item;
  assert.equal(followed.status, "shipped");
});

test("an entry counts the reports behind its tickets, and staff can read them without email", async () => {
  const deps = dependencies();
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await send(post(body({ title: "Guide freeze again", details: "It froze again on the second Apple TV." })), environment(), deps);
  const [first, second] = deps.store.rows.map((row) => row.submissionID);
  await json(postJSON(`/v1/inbox/${first}/ticket`, { kind: "bug" }), deps);
  await json(postJSON(`/v1/inbox/${second}/attach`, { ticketID: "BUG-1" }), deps);
  await json(postJSON("/v1/tickets/BUG-1/roadmap", { create: { title: "Guide freezes after midnight" } }), deps);
  const feed = await (await send(new Request("https://feedback.test/v1/roadmap"), environment(), deps)).json();
  assert.deepEqual([feed.items[0].status, feed.items[0].requests], ["investigating", 2]);

  const { body: behind } = await json(admin("/v1/items/CDR-1/reports"), deps);
  assert.deepEqual(behind.tickets.map((ticket) => ticket.id), ["BUG-1"]);
  assert.deepEqual(behind.reports.map((report) => [report.state, report.details]), [
    ["accepted", "Scrolling the guide past midnight freezes the Apple TV app."],
    ["merged", "It froze again on the second Apple TV."],
  ]);
  assert.doesNotMatch(JSON.stringify(behind), /viewer@example\.com|contact/);
  assert.equal((await send(admin("/v1/items/CDR-9/reports"), environment(), deps)).status, 404);
  assert.equal((await send(new Request("https://feedback.test/v1/items/CDR-1/reports"), environment(), deps)).status, 401);
});

test("merging a duplicate ticket moves its reports and history", async () => {
  const deps = dependencies();
  await send(post(body()), environment(), deps);
  await send(post(body({ title: "Guide frozen" })), environment(), deps);
  const [first, second] = deps.store.rows.map((row) => row.submissionID);
  await json(postJSON(`/v1/inbox/${first}/ticket`, { kind: "bug" }), deps);
  await json(postJSON(`/v1/inbox/${second}/ticket`, { kind: "bug" }), deps);
  await json(postJSON("/v1/tickets/BUG-2/notes", { text: "Happens on tvOS 27.1 only." }), deps);
  assert.equal((await json(postJSON("/v1/tickets/BUG-2/merge", { into: "BUG-2" }), deps)).status, 400);
  const merged = (await json(postJSON("/v1/tickets/BUG-2/merge", { into: "BUG-1" }), deps)).body.ticket;
  assert.equal(merged.reports, 2);
  const [one, two] = deps.store.tickets;
  assert.deepEqual([one.status, two.status, two.duplicateOf], ["new", "duplicate", "BUG-1"]);
  const { events } = (await json(admin("/v1/tickets/BUG-1"), deps)).body;
  assert.ok(events.some((entry) => entry.body === "Happens on tvOS 27.1 only."));
  assert.equal((await json(postJSON("/v1/inbox/" + first + "/attach", { ticketID: "BUG-2" }), deps)).status, 409);
});

test("asking for more keeps an emailed report in the inbox with its address", async () => {
  const deps = dependencies();
  await send(post(body({ contact: "viewer@example.com" })), environment(), deps);
  await send(post(body({ title: "No way back" })), environment(), deps);
  const [withEmail, without] = deps.store.rows.map((row) => row.submissionID);
  const asked = (await json(postJSON(`/v1/inbox/${withEmail}/ask`, { question: "Which build?" }), deps)).body;
  assert.deepEqual([asked.via, asked.contact], ["email", "viewer@example.com"]);
  assert.equal((await json(postJSON(`/v1/inbox/${without}/ask`, {}), deps)).body.error, "no_way_to_reach");
  const { submissions } = (await json(admin("/v1/inbox"), deps)).body;
  assert.equal(submissions[0].contact, "viewer@example.com");
  assert.ok(submissions[0].needsInfoAtEpochMilliseconds);
  assert.deepEqual(submissions[0].events.map((entry) => entry.body), ["Asked by email: Which build?"]);
  // The question stays with the report once it becomes a ticket.
  await json(postJSON(`/v1/inbox/${withEmail}/ticket`, { kind: "bug" }), deps);
  const { events } = (await json(admin("/v1/tickets/BUG-1"), deps)).body;
  assert.deepEqual(events.map((entry) => entry.type), ["asked", "created"]);
});

test("items can be created, edited and deleted, and the roadmap shows only public ones", async () => {
  const deps = dependencies();
  const create = (fields) => send(admin("/v1/items", { method: "POST", body: JSON.stringify(fields) }), environment(), deps).then((response) => response.json());
  const { item } = await create({ kind: "feature", title: "Picture in picture", status: "planned", public: true, notes: "secret", priority: "high" });
  assert.equal(item.statusMode, "manual");
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
