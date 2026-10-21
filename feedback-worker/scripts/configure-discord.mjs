// Registers the "Track as bug/feature" message commands in the Cedar server, points the Discord
// application's interactions endpoint at this Worker, and turns on the Message Content intent
// the forum import needs to read posts. Prints only non-secret IDs, including the bug and
// feature-request forum IDs for wrangler.toml.
//
//   DISCORD_BOT_TOKEN=… GUILD_ID=… node scripts/configure-discord.mjs --endpoint https://…/v1/discord/interactions
//
// Without --apply it only shows what it would do.
import { COMMANDS } from "../src/discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const guildID = process.env.GUILD_ID;
const endpointIndex = process.argv.indexOf("--endpoint");
const endpoint = endpointIndex > 0 ? process.argv[endpointIndex + 1] : null;
const apply = process.argv.includes("--apply");
if (!token || !guildID || !endpoint?.startsWith("https://")) {
  console.error("Set DISCORD_BOT_TOKEN and GUILD_ID, and pass --endpoint https://…/v1/discord/interactions");
  process.exit(1);
}

const discord = async (method, path, body) => {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${path} → ${response.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
};

const application = await discord("GET", "/applications/@me");
const guild = await discord("GET", `/guilds/${guildID}`);
console.log(`Application ${application.name} (${application.id})`);
console.log(`DISCORD_PUBLIC_KEY ${application.verify_key}`);
console.log(`DISCORD_OWNER_ID ${guild.owner_id} (owner of ${guild.name})`);
console.log(`Interactions endpoint now: ${application.interactions_endpoint_url ?? "none"}`);

// Forum channels (type 15) named like "🐞│bugs" and "✨│feature-requests".
const FORUM = 15;
const channels = await discord("GET", `/guilds/${guildID}/channels`);
const forum = (suffix) => channels.find((channel) => channel.type === FORUM && channel.name.endsWith(suffix));
for (const [variable, suffix] of [["DISCORD_BUG_FORUM_ID", "bugs"], ["DISCORD_FEATURE_FORUM_ID", "feature-requests"]]) {
  const match = forum(suffix);
  console.log(match ? `${variable} ${match.id} (${match.name})` : `${variable}: no forum ending in “${suffix}” found`);
}

// Bots in fewer than 100 servers can turn this intent on themselves; without it Discord returns
// forum posts with empty text.
const MESSAGE_CONTENT_LIMITED = 1 << 19;
// Only the "limited" intent flags (presence, members, message content) can be set over the API.
const LIMITED_INTENTS = (1 << 13) | (1 << 15) | MESSAGE_CONTENT_LIMITED;
const hasMessageContent = Boolean(application.flags & (MESSAGE_CONTENT_LIMITED | (1 << 18)));
console.log(`Message Content intent: ${hasMessageContent ? "on" : "off"}`);
if (!apply) {
  console.log(`Would set it to ${endpoint} and register: ${COMMANDS.map((command) => command.name).join(", ")}`);
  if (!hasMessageContent) console.log("Would turn on the Message Content intent.");
  process.exit(0);
}
if (!hasMessageContent) {
  await discord("PATCH", "/applications/@me", { flags: (application.flags & LIMITED_INTENTS) | MESSAGE_CONTENT_LIMITED });
  console.log("Message Content intent turned on.");
}
// Discord sends a signed PING to the URL before accepting it, so the Worker must already be
// deployed with DISCORD_PUBLIC_KEY.
await discord("PATCH", "/applications/@me", { interactions_endpoint_url: endpoint });
const registered = await discord("PUT", `/applications/${application.id}/guilds/${guildID}/commands`, COMMANDS);
console.log(`Endpoint set. Registered ${registered.map((command) => command.name).join(", ")}.`);
