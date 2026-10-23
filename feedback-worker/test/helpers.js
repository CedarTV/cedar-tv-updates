// Test stand-ins: the Worker's real D1 store over Node's SQLite, and a fake Discord with the same
// shape the Worker uses.
import { STAFF_TAG_NAMES } from "../src/discord-render.js";
import { d1Store, itemFromRow, submissionFromRow, ticketFromRow } from "../src/store.js";
import { sqliteD1 } from "./d1.js";

export const WEB = "https://cedartv.github.io";
export const ADMIN = "a".repeat(40);
export const OWNER = "111111111111111111";

// The real store, plus synchronous views of its tables for assertions.
export const memoryStore = () => {
  const db = sqliteD1();
  const store = d1Store(db);
  const all = (sql) => db.raw.prepare(sql).all();
  Object.defineProperties(store, {
    db: { value: db },
    rows: { get: () => all("SELECT * FROM feedback_submissions ORDER BY created_at_ms, rowid").map(submissionFromRow) },
    items: { get: () => all("SELECT * FROM tracker_items ORDER BY number").map(itemFromRow) },
    tickets: { get: () => all("SELECT * FROM tickets ORDER BY created_ms, rowid").map(ticketFromRow) },
    events: { get: () => all("SELECT * FROM ticket_events ORDER BY event_id") },
    threads: { get: () => new Map(all("SELECT * FROM discord_forum_threads").map((row) => [row.thread_id, { forumID: row.forum_id, submissionID: row.submission_id }])) },
    watched: { get: () => all("SELECT * FROM watched_threads ORDER BY thread_id") },
  });
  return store;
};

const staffForum = (id, kind) => ({
  id, guild_id: "guild", type: 15,
  available_tags: STAFF_TAG_NAMES[kind].map((name, index) => ({ id: `${id}-tag${index}`, name })),
});

export const fakeDiscord = () => {
  const calls = [];
  let next = 1000;
  const channels = {
    thread1: { id: "thread1", parent_id: "forum1", guild_id: "guild", applied_tags: ["tagPlayer"] },
    forum1: { id: "forum1", guild_id: "guild", available_tags: [{ id: "tagPlayer", name: "Player" }, { id: "tagPlanned", name: "Planned" }, { id: "tagShipped", name: "Shipped" }, { id: "tagFixed", name: "Fixed" }, { id: "tagNeedsInfo", name: "Needs info" }] },
    staffBugs: staffForum("staffBugs", "bug"),
    staffIdeas: staffForum("staffIdeas", "feature"),
  };
  // `messages` holds single messages by "channel/message"; `threadMessages` a thread's history.
  const forum = { active: [], archived: [], messages: {}, threadMessages: {} };
  return {
    calls,
    channels,
    forum,
    tagName: (channelID, tagID) => channels[channels[channelID]?.parent_id]?.available_tags.find((tag) => tag.id === tagID)?.name,
    async activeThreads(guildID) { calls.push({ op: "active", guildID }); return { threads: structuredClone(forum.active) }; },
    async archivedThreads(channelID) { return { threads: structuredClone(forum.archived.filter((thread) => thread.parent_id === channelID)) }; },
    async message(channelID, messageID) { return structuredClone(forum.messages[`${channelID}/${messageID}`] ?? null); },
    async messages(channelID, { after = null } = {}) {
      calls.push({ op: "messages", channelID, after });
      return structuredClone((forum.threadMessages[channelID] ?? []).filter((message) => !after || BigInt(message.id) > BigInt(after)));
    },
    async send(channelID, message) { calls.push({ op: "send", channelID, message }); next += 1; return { id: String(next) }; },
    async edit(channelID, messageID, message) { calls.push({ op: "edit", channelID, messageID, message }); return {}; },
    async channel(id) { return structuredClone(channels[id]); },
    async createThread(forumID, body) {
      next += 1;
      const id = String(next);
      calls.push({ op: "thread", forumID, id, body });
      channels[id] = { id, parent_id: forumID, guild_id: "guild", name: body.name, applied_tags: body.applied_tags ?? [] };
      return { id, guild_id: "guild" };
    },
    async updateThread(channelID, patch) {
      calls.push({ op: "update", channelID, patch });
      Object.assign(channels[channelID] ??= { id: channelID }, patch);
      return {};
    },
  };
};

const allowAll = { limit: async () => ({ success: true }) };

export const environment = (overrides = {}) => ({
  CEDAR_WEB_ORIGIN: WEB,
  CLIENT_HASH_SALT: "salt",
  ADMIN_TOKEN: ADMIN,
  SUBMIT_RATE_LIMITER: allowAll,
  ADMIN_RATE_LIMITER: allowAll,
  DISCORD_TRIAGE_CHANNEL_ID: "triage",
  DISCORD_ROADMAP_CHANNEL_ID: "roadmap",
  DISCORD_STAFF_BUG_FORUM_ID: "staffBugs",
  DISCORD_STAFF_FEATURE_FORUM_ID: "staffIdeas",
  DISCORD_OWNER_ID: OWNER,
  ...overrides,
});

// Collects waitUntil work so tests can await Discord side effects.
export const dependencies = ({ store = memoryStore(), discord = null, now = Date.UTC(2026, 9, 20), env = null } = {}) => {
  const background = [];
  const deps = {
    store, discord, now, background,
    waitUntil: (promise) => background.push(promise),
    // Side effects can queue more side effects, so this drains until nothing is left.
    settle: async () => {
      while (background.length) await Promise.all(background.splice(0));
    },
  };
  if (env) deps.env = env;
  return deps;
};

export const submissionBody = (overrides = {}) => ({
  schemaVersion: 1,
  kind: "bug",
  title: "Guide  freezes\n on scroll",
  details: "Scrolling the guide past midnight freezes the Apple TV app.",
  platform: "apple-tv",
  appVersion: "1.0.0 (68)",
  elapsedMs: 9_000,
  ...overrides,
});

export const post = (payload, headers = { Origin: WEB }) => new Request("https://feedback.test/v1/feedback", {
  method: "POST",
  headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9", ...headers },
  body: JSON.stringify(payload),
});

export const admin = (path, init = {}) => new Request(`https://feedback.test${path}`, {
  ...init,
  headers: { Authorization: `Bearer ${ADMIN}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
});
