import assert from "node:assert/strict";
import test from "node:test";
import { respond } from "../src/feedback.js";
import { dependencies, environment, fakeDiscord, OWNER, post, submissionBody } from "./helpers.js";

const keys = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const publicKey = Buffer.from(await crypto.subtle.exportKey("raw", keys.publicKey)).toString("hex");
const env = environment({ DISCORD_PUBLIC_KEY: publicKey });

const interaction = async (payload, { sign = true, user = OWNER } = {}) => {
  const body = JSON.stringify({ member: { user: { id: user } }, ...payload });
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
const submitModal = (customID, values) => interaction({
  type: 5,
  data: { custom_id: customID, components: Object.entries(values).map(([id, value]) => ({ type: 1, components: [{ type: 4, custom_id: id, value }] })) },
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

test("unsigned requests are rejected and PING answers PONG", async () => {
  const deps = dependencies();
  assert.equal((await call(deps, interaction({ type: 1 }, { sign: false }))).status, 401);
  assert.deepEqual((await call(deps, interaction({ type: 1 }))).body, { type: 1 });
});

test("only the owner can act", async () => {
  const { deps, id } = await setup();
  const { body } = await call(deps, interaction({ type: 3, data: { custom_id: `s:private:${id}` } }, { user: "222" }));
  assert.equal(body.data.flags, 64);
  assert.match(body.data.content, /Only the Cedar developer/);
  assert.equal(deps.store.items.length, 0);
});

test("approve opens a prefilled modal, and submitting it publishes the item", async () => {
  const { deps, id } = await setup({ kind: "feature", title: "Picture in picture" });
  const opened = await call(deps, press(`s:approve:planned:${id}`));
  assert.equal(opened.body.type, 9);
  assert.equal(opened.body.data.components[0].components[0].value, "Picture in picture");

  // The modal holds public wording only; the report's text is never prefilled into it.
  assert.deepEqual(opened.body.data.components.map((row) => row.components[0].custom_id), ["title", "summary", "description"]);
  assert.doesNotMatch(JSON.stringify(opened.body.data.components), /Scrolling the guide/);

  const done = await call(deps, submitModal(`m:approve:planned:${id}`, {
    title: "Picture-in-picture on Apple TV", summary: "Keep a game in the corner.", description: "A small player stays on screen while you browse.",
  }));
  assert.equal(done.body.type, 7);
  assert.match(done.body.data.embeds[0].description, /Approved as \*\*CDR-1\*\* \(Planned\)\. Its panel is in <#roadmap>/);
  assert.deepEqual(done.body.data.components[0].components.map((button) => button.custom_id), [`s:report:${id}`]);
  const panel = deps.discord.calls.find((entry) => entry.op === "send" && entry.channelID === "roadmap");
  assert.match(panel.message.embeds[0].author.name, /CDR-1/);
  const [item] = deps.store.items;
  assert.equal(item.status, "planned");
  assert.equal(item.public, true);
  assert.equal(item.title, "Picture-in-picture on Apple TV");
  const feed = await (await respond(new Request("https://feedback.test/v1/roadmap"), env, deps)).json();
  assert.equal(feed.items[0].summary, "Keep a game in the corner.");
  assert.equal(feed.items[0].description, "A small player stays on screen while you browse.");
  assert.doesNotMatch(JSON.stringify(feed), /Scrolling the guide|1\.0\.0 \(68\)/);
  // The interaction answer updates the triage message, so no extra REST edit is made.
  assert.equal(deps.discord.calls.filter((entry) => entry.op === "edit").length, 0);
});

test("staff can reopen the full original reports after approval, privately", async () => {
  const { deps, id } = await setup({ contact: "viewer@example.com" });
  await call(deps, press(`s:approve:investigating:${id}`));
  await call(deps, submitModal(`m:approve:investigating:${id}`, { title: "Guide freezes after midnight", summary: "" }));
  await respond(post(submissionBody({ title: "Guide stuck again", details: "Same freeze on the bedroom TV every night." })), env, deps);
  await deps.settle();
  await call(deps, press(`s:mergepick:${deps.store.rows.at(-1).submissionID}`, { values: ["CDR-1"] }));

  const one = await call(deps, press(`s:report:${id}`));
  assert.equal(one.body.data.flags, 64);
  assert.equal(one.body.data.embeds[0].description, "Scrolling the guide past midnight freezes the Apple TV app.");
  assert.match(JSON.stringify(one.body.data.embeds[0].fields), /1\.0\.0 \(68\)/);

  const panel = deps.discord.calls.find((entry) => entry.op === "send" && entry.channelID === "roadmap");
  assert.match(JSON.stringify(panel.message.components), /i:reports:CDR-1/);
  const all = await call(deps, press("i:reports:CDR-1"));
  assert.equal(all.body.data.flags, 64);
  assert.deepEqual(all.body.data.embeds.map((embed) => embed.description), [
    "Scrolling the guide past midnight freezes the Apple TV app.",
    "Same freeze on the bedroom TV every night.",
  ]);
  assert.doesNotMatch(JSON.stringify(all.body), /viewer@example\.com/);

  await call(deps, submitModal("m:create:feature:planned", { title: "Mini player", summary: "" }));
  assert.match((await call(deps, press("i:reports:CDR-2"))).body.data.content, /no original report/);
});

test("status buttons move items, shipping asks for a version", async () => {
  const { deps, id } = await setup();
  await call(deps, press(`s:private:${id}`));
  const moved = await call(deps, press("i:status:in-progress:CDR-1"));
  assert.equal(moved.body.type, 7);
  assert.equal(deps.store.items[0].status, "in-progress");
  const ship = await call(deps, press("i:status:fixed:CDR-1"));
  assert.equal(ship.body.type, 9);
  await call(deps, submitModal("m:ship:fixed:CDR-1", { shippedIn: "1.0.0 (70)", releaseURL: "" }));
  assert.equal(deps.store.items[0].status, "fixed");
  assert.equal(deps.store.items[0].shippedIn, "1.0.0 (70)");
  const visibility = await call(deps, press("i:visibility:CDR-1"));
  assert.equal(deps.store.items[0].public, true);
  assert.match(JSON.stringify(visibility.body.data.components), /Hide from roadmap/);
});

test("merge offers open items of the same kind and edits both messages", async () => {
  const { deps, id } = await setup();
  await call(deps, press(`s:private:${id}`));
  await respond(post(submissionBody({ title: "Guide stuck again" })), env, deps);
  await deps.settle();
  const newest = deps.store.rows.at(-1);
  const picker = await call(deps, press(`s:merge:${newest.submissionID}`));
  assert.equal(picker.body.data.flags, 64);
  assert.deepEqual(picker.body.data.components[0].components[0].options.map((option) => option.value), ["CDR-1"]);
  const merged = await call(deps, press(`s:mergepick:${newest.submissionID}`, { values: ["CDR-1"] }));
  assert.match(merged.body.data.content, /Merged into CDR-1/);
  assert.equal(deps.store.items[0].requests, 2);
  const edits = deps.discord.calls.filter((entry) => entry.op === "edit");
  const report = edits.find((entry) => entry.messageID === newest.discordMessageID);
  assert.match(report.message.embeds[0].description, /Merged into \*\*CDR-1\*\*/);
  const panel = edits.find((entry) => entry.messageID === deps.store.items[0].discordMessageID);
  assert.match(JSON.stringify(panel.message.embeds[0].fields), /"Requests","value":"2"/);
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

test("Track as feature imports a forum post, and shipping tags and thanks the thread", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const opened = await call(deps, interaction({
    type: 2,
    channel_id: "thread1",
    channel: { id: "thread1", type: 11, name: "Mini player on Mac" },
    data: {
      name: "Track as feature",
      target_id: "m1",
      resolved: { messages: { m1: { content: "A floating mini player would be great.", author: { username: "sam", global_name: "Sam" } } } },
    },
  }));
  assert.equal(opened.body.type, 9);
  assert.equal(opened.body.data.custom_id, "m:import:feature:thread1:Sam");
  assert.equal(opened.body.data.components[0].components[0].value, "Mini player on Mac");

  const sent = await call(deps, submitModal("m:import:feature:thread1:Sam", { title: "Mini player on Mac", details: "A floating mini player would be great." }));
  assert.match(sent.body.data.content, /triage channel/);
  const row = deps.store.rows[0];
  assert.equal(row.channel, "discord");
  assert.equal(row.reporter, "Sam");
  assert.equal(row.sourceChannelID, "thread1");
  assert.equal(deps.discord.calls[0].channelID, "triage");

  await call(deps, submitModal(`m:approve:planned:${row.submissionID}`, { title: "Mini player on Mac", summary: "" }));
  assert.deepEqual(deps.discord.calls.find((entry) => entry.op === "tags").tags, ["tagPlayer", "tagPlanned"]);
  assert.match(deps.store.items[0].notes, /Requested by Sam on Discord/);

  await call(deps, submitModal("m:ship:shipped:CDR-1", { shippedIn: "1.1.0 (80)" }));
  const tags = deps.discord.calls.filter((entry) => entry.op === "tags").at(-1);
  assert.deepEqual(tags.tags, ["tagPlayer", "tagShipped"]);
  const thanks = deps.discord.calls.filter((entry) => entry.op === "send" && entry.channelID === "thread1").at(-1);
  assert.match(thanks.message.content, /shipped in 1\.1\.0 \(80\)/);
});

test("items created in Cedar Tracker get a Discord control panel", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const response = await respond(new Request("https://feedback.test/v1/items", {
    method: "POST",
    headers: { Authorization: `Bearer ${"a".repeat(40)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "bug", title: "Crash on launch", status: "investigating" }),
  }), env, deps);
  assert.equal(response.status, 200);
  await deps.settle();
  assert.equal(deps.discord.calls[0].op, "send");
  assert.equal(deps.store.items[0].discordMessageID, "1001");
  // Later edits from the Tracker refresh that message.
  await respond(new Request("https://feedback.test/v1/items/CDR-1", {
    method: "PUT",
    headers: { Authorization: `Bearer ${"a".repeat(40)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "in-progress" }),
  }), env, deps);
  await deps.settle();
  assert.equal(deps.discord.calls.at(-1).op, "edit");
  assert.equal(deps.discord.calls.at(-1).messageID, "1001");
});

test("/roadmap adds an item directly and posts its panel", async () => {
  const deps = dependencies({ discord: fakeDiscord() });
  const command = (subcommand, status) => interaction({
    type: 2,
    data: { name: "roadmap", type: 1, options: [{ type: 1, name: subcommand, options: [{ type: 3, name: "status", value: status }] }] },
  });
  const opened = await call(deps, command("feature", "shipped"));
  assert.equal(opened.body.type, 9);
  assert.equal(opened.body.data.custom_id, "m:create:feature:shipped");
  assert.deepEqual(opened.body.data.components.map((row) => row.components[0].custom_id), ["title", "summary", "description", "shippedIn"]);
  assert.match((await call(deps, command("bug", "planned"))).body.data.content, /didn’t work/);

  const added = await call(deps, submitModal("m:create:feature:shipped", { title: "Mini player", summary: "Float a small player.", shippedIn: "1.1.0 (80)" }));
  assert.match(added.body.data.content, /Added \*\*CDR-1\*\* Mini player/);
  assert.equal(added.body.data.flags, 64);
  const [item] = deps.store.items;
  assert.deepEqual([item.status, item.public, item.shippedIn], ["shipped", true, "1.1.0 (80)"]);
  assert.equal(item.discordChannelID, "roadmap");
  const feed = await (await respond(new Request("https://feedback.test/v1/roadmap"), env, deps)).json();
  assert.equal(feed.items[0].shippedIn, "1.1.0 (80)");
});

test("the /roadmap command offers only public statuses for each kind", async () => {
  const { COMMANDS } = await import("../src/discord.js");
  const roadmap = COMMANDS.find((command) => command.name === "roadmap");
  const choices = Object.fromEntries(roadmap.options.map((option) => [option.name, option.options[0].choices.map((choice) => choice.value)]));
  assert.deepEqual(choices, { feature: ["considering", "planned", "in-progress", "shipped"], bug: ["investigating", "in-progress", "fixed"] });
});
