// Registers the "Track as bug/feature" message commands in the Cedar server and points the
// Discord application's interactions endpoint at this Worker. Prints only non-secret IDs.
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
if (!apply) {
  console.log(`Would set it to ${endpoint} and register: ${COMMANDS.map((command) => command.name).join(", ")}`);
  process.exit(0);
}
// Discord sends a signed PING to the URL before accepting it, so the Worker must already be
// deployed with DISCORD_PUBLIC_KEY.
await discord("PATCH", "/applications/@me", { interactions_endpoint_url: endpoint });
const registered = await discord("PUT", `/applications/${application.id}/guilds/${guildID}/commands`, COMMANDS);
console.log(`Endpoint set. Registered ${registered.map((command) => command.name).join(", ")}.`);
