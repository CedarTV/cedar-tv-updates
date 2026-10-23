import assert from "node:assert/strict";
import test from "node:test";
import { respond } from "../src/feedback.js";
import { copyFollowUps } from "../src/followups.js";
import { dependencies, environment, fakeDiscord, OWNER, post, submissionBody } from "./helpers.js";

const keys = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const publicKey = Buffer.from(await crypto.subtle.exportKey("raw", keys.publicKey)).toString("hex");
const env = environment({ DISCORD_PUBLIC_KEY: publicKey });

const interaction = async (payload, { sign = true, user = OWNER } = {}) => {
  const body = JSON.stringify({ member: { user: { id: user, global_name: "Tyler" } }, ...payload });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign
    ? Buffer.from(await crypto.subtle.sign("Ed25519", keys.privateKey, new TextEncoder().encode(timestamp + body))).toString("hex")
    : "00".repeat(64);
  return new Request("https://feedback.test/v1/discord/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature-Ed25519": signature, "X-Signature-Timestamp": timestamp },
    body,
  });
};

const press = (customID, extra = {}) => interaction({ type: 3, data: { custom_id: customID, ...extra } });
const choose = (customID, values) => press(customID, { values });
const submitModal = (customID, values) => interaction({
  type: 5,
  data: { custom_id: customID, components: Object.entries(values).map(([id, value]) => ({ type: 1, components: [{ type: 4, custom_id: id, value }] })) },
});
const command = (name, subcommand, options = {}) => interaction({
  type: 2,
  data: { name, type: 1, options: subcommand ? [{ type: 1, name: subcommand, options: Object.entries(options).map(([key, value]) => ({ type: 3, name: key, value })) }] : [] },
});

const setup = async (overrides = {}) => {
  const deps = dependencies({ discord: fakeDiscord() });
  await respond(post(submissionBody(overrides)), env, deps);
  await deps.settle();
  return { deps, id: deps.store.rows.at(-1).submissionID };
};

const call = async (deps, request) => {
  const response = await respond(await request, env, deps);
  await deps.settle();
  return { status: response.status, body: await response.json() };
};

const sends = (deps, channelID) => deps.discord.calls.filter((entry) => entry.op === "send" && entry.channelID === channelID);
const threadOf = (deps, id) => deps.store.tickets.find((ticket) => ticket.id === id).discordThreadID;
const tagNames = (deps, threadID) => (deps.discord.channels[threadID].applied_tags ?? []).map((tag) => deps.discord.tagName(threadID, tag));

test("unsigned requests are rejected and PING answers PONG", async () => {
  const deps = dependencies();
  assert.equal((await call(deps, interaction({ type: 1 }, { sign: false }))).status, 401);
  assert.deepEqual((await call(deps, interaction({ type: 1 }))).body, { type: 1 });
});

test("only the owner can act", async () => {
  const { deps, id } = await setup();
  const { body } = await call(deps, interaction({ type: 3, data: { custom_id: `s:ticket:bug:${id}` } }, { user: "222" }));
  assert.equal(body.data.flags, 64);
  assert.match(body.data.content, /Only the Cedar developer/);
  assert.equal(deps.store.tickets.length, 0);
});

test("triage opens a ticket of either kind with its own staff thread", async () => {
  const { deps, id } = await setup({ title: "Let the guide remember its place" });
  const { body } = await call(deps, press(`s:ticket:feature:${id}`));
  assert.equal(body.type, 7);
  assert.match(body.data.embeds[0].description, /Opened \*\*FR-1\*\* Let the guide remember its place/);
  assert.deepEqual(body.data.components[0].components.map((button) => button.custom_id), [`s:report:${id}`]);
  const [ticket] = deps.store.tickets;
  assert.deepEqual([ticket.id, ticket.kind, ticket.brokeIn], ["FR-1", "feature", ""]);
  const thread = deps.discord.calls.find((entry) => entry.op === "thread");
  assert.equal(thread.forumID, "staffIdeas");
  // Once the thread exists the triage message links to it.
  const closed = deps.discord.calls.filter((entry) => entry.op === "edit" && entry.messageID === deps.store.rows[0].discordMessageID).at(-1);
  assert.match(closed.message.embeds[0].description, new RegExp(`<#${thread.id}>`));
  assert.match((await call(deps, press(`s:ticket:bug:${id}`))).body.data.content, /already handled/);
});

test("the panel's status menu moves a ticket, posts the change and archives it when it closes", async () => {
  const { deps, id } = await setup();
  await call(deps, press(`s:ticket:bug:${id}`));
  const thread = threadOf(deps, "BUG-1");
  const moved = await call(deps, choose("t:status:BUG-1", ["confirmed"]));
  assert.equal(moved.body.type, 6);
  assert.equal(deps.store.tickets[0].status, "confirmed");
  assert.deepEqual(tagNames(deps, thread), ["Confirmed", "Apple TV"]);
  assert.match(sends(deps, thread).at(-1).message.content, /New → Confirmed · Tyler/);
  const panel = deps.discord.calls.filter((entry) => entry.op === "edit" && entry.messageID === thread).at(-1);
  assert.equal(panel.message.components[0].components[0].options.find((option) => option.default).value, "confirmed");

  // In a build asks which build; Released asks for the version.
  const inBuild = await call(deps, choose("t:status:BUG-1", ["in-build"]));
  assert.equal(inBuild.body.type, 9);
  assert.deepEqual(inBuild.body.data.components.map((row) => row.components[0].custom_id), ["brokeIn", "fixedIn", "commit"]);
  await call(deps, submitModal("m:build:in-build:BUG-1", { brokeIn: "1.0.0 (68)", fixedIn: "70", commit: "a1b2c3d" }));
  assert.deepEqual([deps.store.tickets[0].status, deps.store.tickets[0].fixedIn, deps.store.tickets[0].commit], ["in-build", "70", "a1b2c3d"]);
  assert.match(sends(deps, thread).at(-2).message.content, /Confirmed → In a build \(70\)/);
  assert.equal((await call(deps, choose("t:status:BUG-1", ["released"]))).body.data.custom_id, "m:release:BUG-1");
  await call(deps, submitModal("m:release:BUG-1", { releasedIn: "1.0.1 (70)", releaseURL: "" }));
  assert.equal(deps.store.tickets[0].status, "released");
  const updates = deps.discord.calls.filter((entry) => entry.op === "update" && entry.channelID === thread);
  assert.deepEqual(updates.at(-1).patch, { archived: true });
  // A note on a closed ticket unarchives the thread just long enough to post it.
  const before = deps.discord.calls.length;
  await respond(new Request("https://feedback.test/v1/tickets/BUG-1/notes", {
    method: "POST", headers: { Authorization: `Bearer ${"a".repeat(40)}`, "Content-Type": "application/json" }, body: JSON.stringify({ text: "Confirmed fixed on the Bedroom TV." }),
  }), env, deps);
  await deps.settle();
  assert.deepEqual(deps.discord.calls.slice(before).map((entry) => entry.op === "update" ? JSON.stringify(entry.patch) : entry.op), ['{"archived":false}', "send", '{"archived":true}']);
  // Reopening unarchives it first and leaves it open.
  const reopenedAt = deps.discord.calls.length;
  await call(deps, choose("t:status:BUG-1", ["in-progress"]));
  const reopen = deps.discord.calls.slice(reopenedAt).filter((entry) => entry.op === "update" && entry.channelID === thread);
  assert.deepEqual(reopen[0].patch, { archived: false });
  assert.equal(reopen.some((entry) => entry.patch.archived === true), false);
});

test("priority and platforms change from the panel, and Edit details keeps long notes out", async () => {
  const { deps, id } = await setup();
  await call(deps, press(`s:ticket:bug:${id}`));
  await call(deps, choose("t:priority:BUG-1", ["urgent"]));
  await call(deps, choose("t:platforms:BUG-1", ["mac", "iphone"]));
  const [ticket] = deps.store.tickets;
  assert.deepEqual([ticket.priority, ticket.platforms], ["urgent", ["iphone", "mac"]]);
  assert.deepEqual(tagNames(deps, ticket.discordThreadID), ["New", "Urgent", "iPhone", "Mac"]);
  const opened = await call(deps, press("t:edit:BUG-1"));
  assert.deepEqual(opened.body.data.components.map((row) => row.components[0].custom_id), ["title", "summary", "steps", "expected", "notes"]);
  await call(deps, submitModal("m:edit:BUG-1", { title: "Guide freezes past midnight", summary: "The guide stops scrolling.", steps: "Scroll past 00:00", expected: "", notes: "x".repeat(4000) }));
  assert.equal(deps.store.tickets[0].title, "Guide freezes past midnight");
  assert.equal(deps.discord.calls.filter((entry) => entry.op === "update" && entry.patch.name).at(-1).patch.name, "BUG-1 · Guide freezes past midnight");
  await respond(new Request("https://feedback.test/v1/tickets/BUG-1", {
    method: "PUT", headers: { Authorization: `Bearer ${"a".repeat(40)}`, "Content-Type": "application/json" }, body: JSON.stringify({ notes: "y".repeat(5000) }),
  }), env, deps);
  const again = await call(deps, press("t:edit:BUG-1"));
  assert.deepEqual(again.body.data.components.map((row) => row.components[0].custom_id), ["title", "summary", "steps", "expected"]);
});

test("Attach to… offers the closest tickets first and posts the report into the thread", async () => {
  const { deps, id } = await setup({ title: "Mini player", kind: "feature", details: "A floating mini player would be great." });
  await call(deps, press(`s:ticket:feature:${id}`));
  await respond(post(submissionBody({ title: "Audio drifts", details: "Audio drifts after an hour of playback." })), env, deps);
  await deps.settle();
  await call(deps, press(`s:ticket:bug:${deps.store.rows.at(-1).submissionID}`));
  await respond(post(submissionBody({ title: "Floating mini player please", details: "I want a mini player while browsing." })), env, deps);
  await deps.settle();
  const newest = deps.store.rows.at(-1).submissionID;
  const picker = await call(deps, press(`s:attach:${newest}`));
  assert.equal(picker.body.data.flags, 64);
  assert.deepEqual(picker.body.data.components[0].components[0].options.map((option) => option.value), ["FR-1", "BUG-1"]);
  const attached = await call(deps, choose(`s:attachpick:${newest}`, ["FR-1"]));
  assert.match(attached.body.data.content, /Attached to FR-1/);
  const thread = threadOf(deps, "FR-1");
  const posted = sends(deps, thread).at(-1);
  assert.equal(posted.message.embeds[0].title, "Floating mini player please");
  assert.match(JSON.stringify(deps.discord.calls.filter((entry) => entry.op === "edit" && entry.messageID === thread).at(-1).message), /Reports \(2\)/);
  const reports = await call(deps, press("t:reports:FR-1"));
  assert.equal(reports.body.data.embeds.length, 2);
});

test("Track as bug, Needs info and the reporter's reply all stay with the report", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  deps.discord.forum.messages["thread1/800"] = { id: "800", content: "Guide froze again.", author: { id: "333333333333333333", username: "sam", global_name: "Sam" } };
  const opened = await call(deps, interaction({
    type: 2, channel_id: "thread1", channel: { id: "thread1", type: 11, name: "Guide freezing" },
    data: { name: "Track as bug", target_id: "800", resolved: { messages: { 800: { content: "Guide froze again.", author: { username: "sam" } } } } },
  }));
  assert.equal(opened.body.data.custom_id, "m:import:bug:t:thread1:800");
  await call(deps, submitModal("m:import:bug:t:thread1:800", { title: "Guide freezing", details: "Guide froze again on the TV." }));
  const [report] = deps.store.rows;
  assert.deepEqual([report.reporter, report.reporterUserID, report.sourceChannelID], ["Sam", "333333333333333333", "thread1"]);
  assert.deepEqual(deps.store.watched.map((row) => [row.thread_id, row.last_seen_id]), [["thread1", "800"]]);

  const ask = await call(deps, press(`s:ask:${report.submissionID}`));
  assert.equal(ask.body.type, 9);
  const asked = await call(deps, submitModal(`m:ask:${report.submissionID}`, { question: "Which build are you on?" }));
  assert.equal(asked.body.type, 7);
  assert.match(JSON.stringify(asked.body.data.embeds[0].fields), /Waiting for the reporter.*Which build are you on\?/);
  const question = sends(deps, "thread1").at(-1);
  assert.equal(question.message.content, "<@333333333333333333> Which build are you on?");
  assert.deepEqual(question.message.allowed_mentions, { users: ["333333333333333333"] });
  assert.deepEqual(deps.discord.channels.thread1.applied_tags.map((tag) => deps.discord.tagName("thread1", tag)), ["Player", "Needs info"]);

  // The cron copies the reply into the report, and onto its triage message.
  deps.discord.forum.threadMessages.thread1 = [
    { id: "900", content: "Which build are you on?", author: { id: "bot", bot: true }, timestamp: "2026-10-20T00:01:00Z" },
    { id: "901", content: "Build 69, every night.", author: { id: "333333333333333333", global_name: "Sam" }, timestamp: "2026-10-20T00:02:00Z", attachments: [{ url: "https://cdn.discordapp.com/a/shot.png" }] },
  ];
  assert.equal(await copyFollowUps(deps, [{ id: "thread1", last_message_id: "901" }, { id: "quiet", last_message_id: "5" }]), 1);
  await deps.settle();
  assert.equal(deps.store.watched[0].last_seen_id, "901");
  const triage = deps.discord.calls.filter((entry) => entry.op === "edit" && entry.messageID === report.discordMessageID).at(-1);
  assert.match(JSON.stringify(triage.message.embeds[0].fields), /💬 Sam.*Build 69, every night/);
  // Nothing new, nothing fetched.
  const fetches = deps.discord.calls.filter((entry) => entry.op === "messages").length;
  assert.equal(await copyFollowUps(deps, [{ id: "thread1", last_message_id: "901" }]), 0);
  assert.equal(deps.discord.calls.filter((entry) => entry.op === "messages").length, fetches);

  // Once it's a ticket, later replies go to the staff thread too, and its release thanks Sam.
  deps.now = Date.UTC(2026, 9, 20, 0, 5);
  await call(deps, press(`s:ticket:bug:${report.submissionID}`));
  const staff = threadOf(deps, "BUG-1");
  deps.discord.forum.threadMessages.thread1.push({ id: "902", content: "Still happening on 70.", author: { id: "333333333333333333", global_name: "Sam" }, timestamp: "2026-10-20T00:06:00Z" });
  await copyFollowUps(deps, [{ id: "thread1", last_message_id: "902" }]);
  assert.match(sends(deps, staff).at(-1).message.content, /\*\*Sam\*\* in <#thread1>: Still happening on 70\./);
  const detail = await (await respond(new Request("https://feedback.test/v1/tickets/BUG-1", { headers: { Authorization: `Bearer ${"a".repeat(40)}` } }), env, deps)).json();
  assert.deepEqual(detail.events.map((entry) => entry.type), ["asked", "reply", "created", "reply"]);
  await call(deps, choose("t:status:BUG-1", ["released"]));
  await call(deps, submitModal("m:release:BUG-1", { releasedIn: "1.0.1 (70)" }));
  assert.equal(deps.discord.channels.thread1.applied_tags.map((tag) => deps.discord.tagName("thread1", tag)).join(), "Player,Fixed");
  assert.match(sends(deps, "thread1").at(-1).message.content, /Fixed in 1\.0\.1 \(70\)\. Thanks for reporting it!/);
});

test("emailed reports show the address instead, and reports without either can't be asked", async () => {
  const { deps, id } = await setup({ contact: "viewer@example.com" });
  const asked = await call(deps, press(`s:ask:${id}`));
  assert.equal(asked.body.data.flags, 64);
  assert.match(asked.body.data.content, /viewer@example\.com/);
  assert.ok(deps.store.rows[0].needsInfoAtEpochMilliseconds);
  await respond(post(submissionBody({ title: "Anonymous report" })), env, deps);
  const none = await call(deps, press(`s:ask:${deps.store.rows.at(-1).submissionID}`));
  assert.match(none.body.data.content, /no way to ask/);
});

test("a ticket goes on the roadmap with fresh public wording and the entry follows it", async () => {
  const { deps, id } = await setup({ kind: "feature", title: "pip pls", details: "Picture in picture please, my partner needs the TV." });
  await call(deps, press(`s:ticket:feature:${id}`));
  const menu = await call(deps, press("t:roadmap:FR-1"));
  assert.equal(menu.body.data.flags, 64);
  assert.equal(menu.body.data.components[0].components[0].custom_id, "t:rmnew:FR-1");
  const form = await call(deps, press("t:rmnew:FR-1"));
  assert.doesNotMatch(JSON.stringify(form.body.data), /pip pls|my partner/);
  const added = await call(deps, submitModal("m:rmnew:FR-1", { title: "Picture in picture", summary: "Keep watching in a corner." }));
  assert.match(added.body.data.content, /Added to the roadmap as \*\*CDR-1\*\*/);
  const [entry] = deps.store.items;
  assert.deepEqual([entry.statusMode, entry.status, entry.public], ["follow", "considering", true]);
  const panel = sends(deps, "roadmap").at(-1);
  assert.match(JSON.stringify(panel.message.embeds[0].fields), /follows tickets/);
  assert.match(JSON.stringify(panel.message.components), /i:mode:manual:CDR-1/);

  await call(deps, choose("t:status:FR-1", ["planned"]));
  assert.equal(deps.store.items[0].status, "planned");
  const refreshed = deps.discord.calls.filter((call) => call.op === "edit" && call.channelID === "roadmap").at(-1);
  assert.match(JSON.stringify(refreshed.message.embeds[0].fields), /Planned \(follows tickets\)/);

  // Setting it by hand brings the status buttons back.
  const manual = await call(deps, press("i:mode:manual:CDR-1"));
  assert.match(JSON.stringify(manual.body.data.components), /i:status:in-progress:CDR-1/);
  const linked = await call(deps, press("i:reports:CDR-1"));
  assert.match(linked.body.data.content, /Tickets behind \*\*CDR-1\*\*/);
  assert.equal(linked.body.data.embeds[0].title, "pip pls");
});

test("a duplicate chosen from the status menu merges into the other ticket", async () => {
  const { deps, id } = await setup();
  await call(deps, press(`s:ticket:bug:${id}`));
  await respond(post(submissionBody({ title: "Guide stuck" })), env, deps);
  await deps.settle();
  await call(deps, press(`s:ticket:bug:${deps.store.rows.at(-1).submissionID}`));
  assert.equal((await call(deps, choose("t:status:BUG-2", ["duplicate"]))).body.data.custom_id, "m:dup:BUG-2");
  assert.match((await call(deps, submitModal("m:dup:BUG-2", { into: "bug-2" }))).body.data.content, /can’t duplicate itself/);
  await call(deps, submitModal("m:dup:BUG-2", { into: "bug-1" }));
  assert.deepEqual(deps.store.tickets.map((ticket) => [ticket.id, ticket.status, ticket.reports]), [["BUG-1", "new", 0], ["BUG-2", "duplicate", 0]]);
  assert.equal(deps.store.rows.filter((row) => row.ticketID === "BUG-1").length, 2);
  assert.match(sends(deps, threadOf(deps, "BUG-1")).at(-1).message.content, /BUG-2 “Guide stuck” merged in/);
});

test("/ticket opens tickets directly and releases a build", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const opened = await call(deps, command("ticket", "bug", { title: "Crash on launch" }));
  assert.match(opened.body.data.content, /Opened \*\*BUG-1\*\* Crash on launch\. Its thread is in <#staffBugs>/);
  await call(deps, choose("t:status:BUG-1", ["fixed"]));
  await call(deps, submitModal("m:build:-:BUG-1", { fixedIn: "71", commit: "" }));
  assert.match((await call(deps, command("ticket", "released", { build: "70" }))).body.data.content, /No tickets were waiting in build 70/);
  const released = await call(deps, command("ticket", "released", { build: "71", version: "1.0.2" }));
  assert.match(released.body.data.content, /Released 1 ticket in 1\.0\.2 \(71\): BUG-1/);
  assert.deepEqual([deps.store.tickets[0].status, deps.store.tickets[0].releasedIn], ["released", "1.0.2 (71)"]);
});

test("/tracker signs in with a one-time link and a 30-day cookie", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const { body } = await call(deps, command("tracker"));
  assert.equal(body.data.flags, 64);
  const link = new URL(body.data.components[0].components[0].url);
  assert.equal(link.pathname, "/tracker/login");

  const login = await respond(new Request(link), env, deps);
  assert.equal(login.status, 303);
  assert.equal(login.headers.get("Location"), "/tracker/");
  const cookie = login.headers.get("Set-Cookie");
  assert.match(cookie, /^cedar_tracker=v1\.111111111111111111\.\d{13}\.[A-Za-z0-9_-]{43}; Path=\/; Max-Age=2592000; HttpOnly; Secure; SameSite=Strict$/);
  assert.equal((await respond(new Request(link), env, deps)).status, 400);

  const session = cookie.split(";")[0];
  const api = (headers = {}) => respond(new Request("https://feedback.test/v1/tickets", { headers: { Cookie: session, ...headers } }), env, deps);
  assert.equal((await api({ "X-Cedar-Tracker": "1" })).status, 200);
  assert.equal((await api()).status, 403);
  assert.equal((await api({ "X-Cedar-Tracker": "1", Origin: "https://evil.example" })).status, 403);
  assert.equal((await respond(new Request("https://feedback.test/v1/tickets", { headers: { "X-Cedar-Tracker": "1" } }), env, deps)).status, 401);
  // A tampered cookie, or one for another user, is refused.
  const forged = session.replace("111111111111111111", "222222222222222222");
  assert.equal((await respond(new Request("https://feedback.test/v1/tickets", { headers: { Cookie: forged, "X-Cedar-Tracker": "1" } }), env, deps)).status, 401);
  // Old sessions are renewed as they're used, and expired ones end.
  const later = { ...deps, now: deps.now + 2 * 24 * 60 * 60 * 1000 };
  const renewed = await respond(new Request("https://feedback.test/v1/tickets", { headers: { Cookie: session, "X-Cedar-Tracker": "1" } }), env, later);
  assert.match(renewed.headers.get("Set-Cookie"), /^cedar_tracker=v1\./);
  const expired = { ...deps, now: deps.now + 31 * 24 * 60 * 60 * 1000 };
  assert.equal((await respond(new Request("https://feedback.test/v1/tickets", { headers: { Cookie: session, "X-Cedar-Tracker": "1" } }), env, expired)).status, 401);

  // The ticket panel's button deep-links to that ticket.
  await call(deps, command("ticket", "feature", { title: "Mini player" }));
  const deep = new URL((await call(deps, press("t:tracker:FR-1"))).body.data.components[0].components[0].url);
  assert.equal((await respond(new Request(deep), env, deps)).headers.get("Location"), "/tracker/#FR-1");
  const stale = { ...deps, now: deps.now + 11 * 60 * 1000 };
  const late = new URL((await call(deps, command("tracker"))).body.data.components[0].components[0].url);
  assert.equal((await respond(new Request(late), env, stale)).status, 400);
});

test("discard and show email are ephemeral-safe", async () => {
  const { deps, id } = await setup({ contact: "viewer@example.com" });
  const email = await call(deps, press(`s:contact:${id}`));
  assert.equal(email.body.data.flags, 64);
  assert.match(email.body.data.content, /viewer@example\.com/);
  const discarded = await call(deps, press(`s:discard:${id}`));
  assert.equal(discarded.body.type, 7);
  assert.equal(discarded.body.data.components.length, 0);
  const again = await call(deps, press(`s:discard:${id}`));
  assert.match(again.body.data.content, /already handled/);
  assert.equal((await call(deps, press(`s:contact:${id}`))).body.data.content.includes("viewer@"), false);
});

test("/roadmap adds an entry directly and posts its panel", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const roadmap = (subcommand, status) => command("roadmap", subcommand, { status });
  const opened = await call(deps, roadmap("feature", "shipped"));
  assert.equal(opened.body.type, 9);
  assert.equal(opened.body.data.custom_id, "m:create:feature:shipped");
  assert.deepEqual(opened.body.data.components.map((row) => row.components[0].custom_id), ["title", "summary", "description", "shippedIn"]);
  assert.match((await call(deps, roadmap("bug", "planned"))).body.data.content, /didn’t work/);

  const added = await call(deps, submitModal("m:create:feature:shipped", { title: "Mini player", summary: "Float a small player.", shippedIn: "1.1.0 (80)" }));
  assert.match(added.body.data.content, /Added \*\*CDR-1\*\* Mini player/);
  const [item] = deps.store.items;
  assert.deepEqual([item.status, item.public, item.shippedIn, item.statusMode], ["shipped", true, "1.1.0 (80)", "manual"]);
  assert.equal(item.discordChannelID, "roadmap");
  const feed = await (await respond(new Request("https://feedback.test/v1/roadmap"), env, deps)).json();
  assert.equal(feed.items[0].shippedIn, "1.1.0 (80)");
});

test("the slash commands offer only public roadmap statuses and the ticket subcommands", async () => {
  const { COMMANDS } = await import("../src/discord.js");
  const roadmap = COMMANDS.find((entry) => entry.name === "roadmap");
  const choices = Object.fromEntries(roadmap.options.map((option) => [option.name, option.options[0].choices.map((choice) => choice.value)]));
  assert.deepEqual(choices, { feature: ["considering", "planned", "in-progress", "shipped"], bug: ["investigating", "in-progress", "fixed"] });
  assert.deepEqual(COMMANDS.find((entry) => entry.name === "ticket").options.map((option) => option.name), ["bug", "feature", "released"]);
  assert.ok(COMMANDS.every((entry) => entry.default_member_permissions === "0"));
});

test("the Discord client waits out rate limits and retries", async () => {
  const { discordClient } = await import("../src/discord-render.js");
  const answers = [
    new Response(JSON.stringify({ message: "Maximum number of edits", retry_after: 2.5, code: 30046 }), { status: 429 }),
    new Response(JSON.stringify({ id: "1" }), { status: 200 }),
  ];
  const waits = [];
  const client = discordClient("token", async () => answers.shift(), async (ms) => { waits.push(ms); });
  assert.deepEqual(await client.edit("c", "m", { content: "x" }), { id: "1" });
  assert.deepEqual(waits, [2600]);
  // A wait longer than 15 seconds isn't worth holding a request for.
  const long = discordClient("token", async () => new Response(JSON.stringify({ retry_after: 60 }), { status: 429 }), async () => {});
  await assert.rejects(long.send("c", {}), /answered 429/);
});
