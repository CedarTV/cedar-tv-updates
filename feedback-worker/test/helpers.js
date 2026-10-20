// In-memory stand-ins for D1 and Discord with the same shapes the Worker uses.
export const WEB = "https://cedartv.github.io";
export const ADMIN = "a".repeat(40);
export const OWNER = "111111111111111111";

export const memoryStore = () => {
  const rows = [];
  const items = [];
  let counter = 0;
  const copy = (value) => (value ? structuredClone(value) : value);
  const pending = (id) => rows.find((row) => row.submissionID === id && row.state === "new");
  return {
    rows,
    items,
    async countForClientDay(clientHash) { return rows.filter((row) => row.clientHash === clientHash).length; },
    async insert(row) {
      rows.push({ reporter: null, sourceChannelID: null, ...row, state: "new", itemID: null, discordChannelID: null, discordMessageID: null });
    },
    async list(state) { return rows.filter((row) => row.state === state).map(copy); },
    async get(id) { return copy(rows.find((row) => row.submissionID === id)); },
    async setSubmissionMessage(id, channelID, messageID) {
      Object.assign(rows.find((row) => row.submissionID === id), { discordChannelID: channelID, discordMessageID: messageID });
    },
    async unannounced(createdBefore, limit) {
      return rows.filter((row) => row.state === "new" && !row.discordMessageID && row.createdAtMs < createdBefore).slice(0, limit).map(copy);
    },
    async discard(id) {
      const row = pending(id);
      if (!row) return false;
      Object.assign(row, { state: "discarded", contact: null });
      return true;
    },
    async listItems() { return items.map(copy); },
    async getItem(number) { return copy(items.find((item) => item.id === `CDR-${number}`)); },
    async createItem(fields, date, links = {}) {
      counter += 1;
      const item = { id: `CDR-${counter}`, ...fields, created: date, updated: date, discordChannelID: null, discordMessageID: null, sourceChannelID: null, ...links };
      items.push(item);
      return copy(item);
    },
    async updateItem(number, fields, date) {
      const item = items.find((candidate) => candidate.id === `CDR-${number}`);
      if (!item) return null;
      Object.assign(item, fields, { updated: date });
      return copy(item);
    },
    async setItemMessage(number, channelID, messageID) {
      Object.assign(items.find((item) => item.id === `CDR-${number}`), { discordChannelID: channelID, discordMessageID: messageID });
    },
    async deleteItem(number) {
      const index = items.findIndex((item) => item.id === `CDR-${number}`);
      if (index < 0) return false;
      items.splice(index, 1);
      return true;
    },
    async acceptSubmission(id, fields, date) {
      const row = pending(id);
      if (!row) return null;
      const item = await this.createItem(fields, date, { sourceChannelID: row.sourceChannelID });
      Object.assign(row, { state: "accepted", itemID: item.id, contact: null });
      return item;
    },
    async mergeSubmission(id, number, date) {
      const row = pending(id);
      const item = items.find((candidate) => candidate.id === `CDR-${number}`);
      if (!row || !item) return null;
      item.requests += 1;
      item.updated = date;
      Object.assign(row, { state: "merged", itemID: item.id, contact: null });
      return copy(item);
    },
  };
};

export const fakeDiscord = () => {
  const calls = [];
  let next = 1000;
  const channels = {
    thread1: { id: "thread1", parent_id: "forum1", applied_tags: ["tagPlayer"] },
    forum1: { id: "forum1", available_tags: [{ id: "tagPlayer", name: "Player" }, { id: "tagPlanned", name: "Planned" }, { id: "tagShipped", name: "Shipped" }, { id: "tagFixed", name: "Fixed" }] },
  };
  return {
    calls,
    async send(channelID, message) { calls.push({ op: "send", channelID, message }); next += 1; return { id: String(next) }; },
    async edit(channelID, messageID, message) { calls.push({ op: "edit", channelID, messageID, message }); return {}; },
    async channel(id) { return structuredClone(channels[id]); },
    async setTags(channelID, tags) { calls.push({ op: "tags", channelID, tags }); channels[channelID].applied_tags = tags; return {}; },
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
  DISCORD_OWNER_ID: OWNER,
  ...overrides,
});

// Collects waitUntil work so tests can await Discord side effects.
export const dependencies = ({ store = memoryStore(), discord = null, now = Date.UTC(2026, 9, 20) } = {}) => {
  const background = [];
  return {
    store, discord, now, background,
    waitUntil: (promise) => background.push(promise),
    settle: () => Promise.all(background.splice(0)),
  };
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
