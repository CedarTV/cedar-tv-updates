import assert from "node:assert/strict";
import test from "node:test";
import { forumSubmission, importForumPosts, snowflakeTime } from "../src/forum-import.js";
import { dependencies, environment, fakeDiscord } from "./helpers.js";

const START = Date.UTC(2026, 9, 21, 12);
const env = environment({ DISCORD_BUG_FORUM_ID: "bugsForum", DISCORD_FEATURE_FORUM_ID: "ideasForum" });
// A snowflake for a thread created `minutes` after the import started.
const snowflake = (minutes, sequence = 0) => String(((BigInt(START + minutes * 60_000) - 1_420_070_400_000n) << 22n) + BigInt(sequence));

const setup = () => {
  const discord = fakeDiscord();
  discord.channels.bugsForum = {
    id: "bugsForum", guild_id: "guild",
    available_tags: [{ id: "tPlayback", name: "Playback" }, { id: "tTV", name: "Apple TV" }, { id: "tMac", name: "Mac" }],
  };
  discord.channels.ideasForum = { id: "ideasForum", guild_id: "guild", available_tags: [{ id: "tPhone", name: "iPhone / iPad" }] };
  const deps = dependencies({ discord, now: START });
  deps.env = env;
  return { deps, discord };
};

const post = (discord, { id, forum = "bugsForum", name, content, tags = [], author = { username: "viewer", global_name: "Viewer" }, attachments = [], archived = false }) => {
  (archived ? discord.forum.archived : discord.forum.active).push({ id, parent_id: forum, name, applied_tags: tags });
  discord.forum.messages[`${id}/${id}`] = { id, content, author, attachments };
};

const run = async (deps, minutes) => {
  deps.now = START + minutes * 60_000;
  const count = await importForumPosts(deps, env);
  await deps.settle();
  return count;
};

test("snowflakes decode to their creation time", () => {
  assert.equal(snowflakeTime(snowflake(3, 7)), START + 3 * 60_000);
});

test("new forum posts become formatted triage reports linked to their thread", async () => {
  const { deps, discord } = setup();
  assert.equal(await run(deps, 0), 0); // The first run only marks where importing starts.
  post(discord, {
    id: snowflake(1), name: "  Guide freezes   after midnight ",
    content: "Scrolling the guide past midnight freezes the app.\n\nSteps: open Guide, scroll right.",
    tags: ["tPlayback", "tTV"], attachments: [{ url: "https://cdn.discordapp.com/a/shot.png" }, { url: "http://insecure.test/x.png" }],
  });
  post(discord, { id: snowflake(2), forum: "ideasForum", name: "Mini player", content: "PiP pls", tags: ["tPhone"], archived: true });
  assert.equal(await run(deps, 5), 2);

  const [bug, feature] = deps.store.rows;
  assert.deepEqual(
    [bug.kind, bug.title, bug.platform, bug.channel, bug.reporter, bug.sourceChannelID, bug.contact],
    ["bug", "Guide freezes after midnight", "apple-tv", "discord", "Viewer", snowflake(1), null],
  );
  assert.equal(bug.details, "Scrolling the guide past midnight freezes the app.\n\nSteps: open Guide, scroll right.\n\nForum tags: Playback\nAttachments:\nhttps://cdn.discordapp.com/a/shot.png");
  // A short post leans on its title.
  assert.deepEqual([feature.kind, feature.platform, feature.details], ["feature", "iphone", "Mini player\n\nPiP pls"]);

  const triage = discord.calls.filter((call) => call.op === "send" && call.channelID === "triage");
  assert.equal(triage.length, 2);
  assert.match(JSON.stringify(triage[0].message.embeds[0].fields), new RegExp(`"Post","value":"<#${snowflake(1)}>"`));
  assert.match(JSON.stringify(triage[0].message.components), /s:approve:investigating/);
  assert.equal(deps.store.threads.get(snowflake(1)).submissionID, bug.submissionID);

  // Nothing is imported twice.
  assert.equal(await run(deps, 10), 0);
  assert.equal(deps.store.rows.length, 2);
});

test("older, bot, deleted and unreadable posts are not imported", async (t) => {
  const { deps, discord } = setup();
  await run(deps, 0);
  post(discord, { id: snowflake(-60), name: "Posted before importing began", content: "This was here already." });
  post(discord, { id: snowflake(1), name: "Bot post", content: "Automated message here.", author: { username: "Cedar", bot: true } });
  discord.forum.active.push({ id: snowflake(2), parent_id: "bugsForum", name: "Deleted first message" });
  post(discord, { id: snowflake(3), name: "Needs message content", content: "" });
  post(discord, { id: snowflake(4), forum: "elsewhere", name: "Another channel", content: "Not one of the forums." });
  const warnings = t.mock.method(console, "warn", () => {});
  assert.equal(await run(deps, 5), 0);
  assert.equal(deps.store.rows.length, 0);
  assert.match(warnings.mock.calls[0].arguments[0], /Message Content intent/);
  // Bot and deleted posts are remembered; the unreadable one is retried once it can be read.
  assert.deepEqual([...deps.store.threads.keys()].sort(), [snowflake(1), snowflake(2)].sort());
  discord.forum.messages[`${snowflake(3)}/${snowflake(3)}`].content = "Now the bot can read this post.";
  assert.equal(await run(deps, 10), 1);
  assert.equal(deps.store.rows[0].title, "Needs message content");
});

test("a run imports at most ten posts, oldest first", async () => {
  const { deps, discord } = setup();
  await run(deps, 0);
  for (let index = 12; index >= 1; index -= 1) post(discord, { id: snowflake(index), name: `Report number ${index}`, content: "Something went wrong here." });
  assert.equal(await run(deps, 20), 10);
  assert.deepEqual(deps.store.rows.map((row) => row.title).slice(0, 2), ["Report number 1", "Report number 2"]);
  assert.equal(await run(deps, 25), 2);
  assert.equal(deps.store.rows.length, 12);
});

test("a failed save releases the thread so the next run retries it", async () => {
  const { deps, discord } = setup();
  await run(deps, 0);
  post(discord, { id: snowflake(1), name: "Retry me please", content: "This should be imported later." });
  const insert = deps.store.insert;
  deps.store.insert = async () => { throw new Error("D1 unavailable"); };
  await assert.rejects(run(deps, 5), /D1 unavailable/);
  assert.equal(deps.store.threads.size, 0);
  deps.store.insert = insert;
  assert.equal(await run(deps, 10), 1);
});

test("without forum ids or Discord, nothing is polled", async () => {
  const { deps, discord } = setup();
  assert.equal(await importForumPosts(deps, environment()), 0);
  assert.equal(await importForumPosts({ ...deps, discord: null }, env), 0);
  assert.equal(discord.calls.length, 0);
});

test("forum posts are cleaned and clipped to the report limits", () => {
  const fields = forumSubmission({ name: "x" }, { content: "a".repeat(5000) }, "feature", ["Mac", "Library"]);
  assert.equal(fields.title, "Feature request from Discord");
  assert.equal(fields.platform, "mac");
  assert.ok(fields.details.length <= 4000);
  assert.match(fields.details, /…\n\nForum tags: Library$/);
  assert.equal(forumSubmission({ name: "Empty" }, { content: "  " }, "bug", []), null);
  assert.match(forumSubmission({ name: "Hi" }, { content: "", attachments: [{ url: "https://cdn.test/a.png" }] }, "bug", []).details, /Posted without details|Attachments/);
});
