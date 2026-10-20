// Discord interactions: buttons, select menus, modals and the "Track as …" message commands.
// Discord calls this endpoint over HTTPS with an Ed25519 signature; only the owner may act.
import { closedSubmissionMessage, itemMessage } from "./discord-render.js";
import { FeedbackError } from "./errors.js";
import { recordSubmission, validateSubmission } from "./feedback.js";
import { acceptSubmission, discardSubmission, mergeSubmission, updateItem } from "./operations.js";
import { CLOSED_STATUSES, itemNumber, statusInfo } from "./tracker.js";

const TYPE = { ping: 1, command: 2, component: 3, modal: 5 };
const REPLY = { pong: 1, message: 4, update: 7, modal: 9 };
const EPHEMERAL = 64;
const THREAD_TYPES = new Set([10, 11, 12]);

export const COMMANDS = Object.freeze([
  { name: "Track as bug", type: 3, default_member_permissions: "0" },
  { name: "Track as feature", type: 3, default_member_permissions: "0" },
]);

const hexBytes = (hex) => Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));

export const verifySignature = async (publicKeyHex, signatureHex, timestamp, body) => {
  if (!/^[0-9a-f]{64}$/i.test(publicKeyHex) || !/^[0-9a-f]{128}$/i.test(signatureHex ?? "") || !timestamp) return false;
  const key = await crypto.subtle.importKey("raw", hexBytes(publicKeyHex), { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify("Ed25519", key, hexBytes(signatureHex), new TextEncoder().encode(timestamp + body));
};

const reply = (body) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
const notice = (content) => reply({ type: REPLY.message, data: { content, flags: EPHEMERAL, allowed_mentions: { parse: [] } } });
const update = (data) => reply({ type: REPLY.update, data });

const textInput = (custom_id, label, { value = "", style = 1, required = true, min = 0, max = 4000, placeholder } = {}) => ({
  type: 1,
  components: [{
    type: 4, custom_id, label, style, required, value: value.slice(0, max) || undefined,
    min_length: min || undefined, max_length: max, placeholder,
  }],
});
const modal = (custom_id, title, inputs) => reply({ type: REPLY.modal, data: { custom_id, title: title.slice(0, 45), components: inputs } });

// Modal values arrive nested in rows (or labels); collect them by custom_id.
const modalValues = (components, values = {}) => {
  for (const component of components ?? []) {
    if (component.custom_id && typeof component.value === "string") values[component.custom_id] = component.value;
    modalValues(component.components, values);
    if (component.component) modalValues([component.component], values);
  }
  return values;
};

const wordingInputs = (title, summary) => [
  textInput("title", "Public title", { value: title, min: 3, max: 120 }),
  textInput("summary", "Public summary (optional)", { value: summary, style: 2, required: false, max: 600, placeholder: "Shown on the roadmap under the title." }),
];

const shipInputs = (item) => [
  textInput("shippedIn", "Shipped in (optional)", { value: item.shippedIn, required: false, max: 40, placeholder: "1.0.0 (70)" }),
  textInput("releaseURL", "Release notes link (optional)", { value: item.releaseURL, required: false, max: 300, placeholder: "https://cedartv.github.io/cedar-tv-updates/…" }),
];

const getSubmission = async (deps, submissionID) => {
  const submission = await deps.store.get(submissionID);
  if (!submission) throw new FeedbackError(404, "not_found");
  return submission;
};

const getItem = async (deps, itemID) => {
  const item = await deps.store.getItem(itemNumber(itemID));
  if (!item) throw new FeedbackError(404, "item_not_found");
  return item;
};

const component = async (interaction, env, deps) => {
  const [scope, action, ...rest] = interaction.data.custom_id.split(":");
  const silent = { refreshMessage: false };
  if (scope === "s") {
    const submissionID = rest.at(-1);
    switch (action) {
      case "approve": {
        const submission = await getSubmission(deps, submissionID);
        const label = statusInfo(submission.kind, rest[0])?.label ?? rest[0];
        return modal(`m:approve:${rest[0]}:${submissionID}`, `Approve as ${label}`, wordingInputs(submission.title.slice(0, 120), ""));
      }
      case "private":
        return update(itemMessage(await acceptSubmission(deps, submissionID, {}, silent)));
      case "discard": {
        const submission = await discardSubmission(deps, submissionID, silent);
        return update(closedSubmissionMessage(submission, "Discarded."));
      }
      case "contact": {
        const submission = await getSubmission(deps, submissionID);
        return notice(submission.contact ? `Email: ${submission.contact}` : "No email on this report (it’s cleared once a report is triaged).");
      }
      case "merge": {
        const submission = await getSubmission(deps, submissionID);
        const items = (await deps.store.listItems())
          .filter((item) => item.kind === submission.kind && !CLOSED_STATUSES.includes(item.status))
          .sort((left, right) => right.updated.localeCompare(left.updated))
          .slice(0, 25);
        if (!items.length) return notice("There are no open items of this kind to merge into.");
        return reply({
          type: REPLY.message,
          data: {
            flags: EPHEMERAL,
            content: `Merge “${submission.title.slice(0, 80)}” into:`,
            components: [{
              type: 1,
              components: [{
                type: 3,
                custom_id: `s:mergepick:${submissionID}`,
                placeholder: "Choose an item",
                options: items.map((item) => ({
                  label: `${item.id} ${item.title}`.slice(0, 100),
                  value: item.id,
                  description: `${statusInfo(item.kind, item.status)?.label ?? item.status} · ${item.requests} request${item.requests === 1 ? "" : "s"}`,
                })),
              }],
            }],
          },
        });
      }
      case "mergepick": {
        // The triage message is edited over REST; this answer replaces the picker.
        const item = await mergeSubmission(deps, submissionID, interaction.data.values?.[0]);
        return update({ content: `Merged into ${item.id} ${item.title}.`, components: [] });
      }
    }
  }
  if (scope === "i") {
    const itemID = rest.at(-1);
    switch (action) {
      case "status": {
        const status = rest[0];
        if (["shipped", "fixed"].includes(status)) {
          const item = await getItem(deps, itemID);
          return modal(`m:ship:${status}:${itemID}`, `Mark ${itemID} ${statusInfo(item.kind, status)?.label ?? status}`, shipInputs(item));
        }
        return update(itemMessage(await updateItem(deps, itemID, { status }, silent)));
      }
      case "edit": {
        const item = await getItem(deps, itemID);
        return modal(`m:edit:${itemID}`, `Edit ${itemID}`, wordingInputs(item.title, item.summary));
      }
      case "visibility": {
        const item = await getItem(deps, itemID);
        return update(itemMessage(await updateItem(deps, itemID, { public: !item.public }, silent)));
      }
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

const modalSubmit = async (interaction, env, deps) => {
  const [, action, ...rest] = interaction.data.custom_id.split(":");
  const values = modalValues(interaction.data.components);
  const silent = { refreshMessage: false };
  switch (action) {
    case "approve":
      return update(itemMessage(await acceptSubmission(deps, rest[1], {
        status: rest[0], public: true, title: values.title, summary: values.summary ?? "",
      }, silent)));
    case "edit":
      return update(itemMessage(await updateItem(deps, rest[0], { title: values.title, summary: values.summary ?? "" }, silent)));
    case "ship":
      return update(itemMessage(await updateItem(deps, rest[1], {
        status: rest[0], shippedIn: values.shippedIn ?? "", releaseURL: values.releaseURL ?? "",
      }, silent)));
    case "import": {
      const [kind, sourceChannelID, ...reporterParts] = rest;
      const submission = validateSubmission({ schemaVersion: 1, kind, title: values.title, details: values.details, platform: "other" });
      const { honeypot: _honeypot, elapsedMs: _elapsed, ...fields } = submission;
      await recordSubmission(deps, env, fields, {
        channel: "discord",
        clientHash: "discord",
        reporter: reporterParts.join(":") || null,
        sourceChannelID: sourceChannelID === "-" ? null : sourceChannelID,
      });
      return notice("Sent to the triage channel.");
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

// "Track as bug" / "Track as feature" on any message: opens a prefilled modal.
const messageCommand = (interaction) => {
  const kind = interaction.data.name === "Track as bug" ? "bug" : "feature";
  const message = interaction.data.resolved?.messages?.[interaction.data.target_id];
  if (!message) throw new FeedbackError(400, "message_unavailable");
  const inThread = THREAD_TYPES.has(interaction.channel?.type);
  const firstLine = (message.content || "").split("\n").find((text) => text.trim()) ?? "";
  const title = (inThread && interaction.channel?.name) || firstLine;
  const reporter = (message.author?.global_name || message.author?.username || "").slice(0, 40);
  const source = inThread ? interaction.channel_id : "-";
  return modal(`m:import:${kind}:${source}:${reporter}`, kind === "bug" ? "Track as bug" : "Track as feature", [
    textInput("title", "Title", { value: title.slice(0, 120), min: 3, max: 120 }),
    textInput("details", "Details", { value: message.content || "", style: 2, min: 10, max: 4000 }),
  ]);
};

const describe = (error) => {
  const messages = {
    already_triaged: "Someone already handled this report.",
    not_found: "That report no longer exists.",
    item_not_found: "That item no longer exists.",
    kind_mismatch: "You can only merge a report into an item of the same kind.",
  };
  if (error.message && error.message !== error.code) return error.message;
  return messages[error.code] ?? `That didn’t work (${error.code}).`;
};

export const handleInteraction = async (request, env, deps) => {
  if (!env.DISCORD_PUBLIC_KEY) throw new FeedbackError(503, "not_configured");
  const body = await request.text();
  const valid = await verifySignature(
    env.DISCORD_PUBLIC_KEY,
    request.headers.get("X-Signature-Ed25519"),
    request.headers.get("X-Signature-Timestamp"),
    body,
  );
  if (!valid) throw new FeedbackError(401, "invalid_signature");
  const interaction = JSON.parse(body);
  if (interaction.type === TYPE.ping) return reply({ type: REPLY.pong });

  const user = interaction.member?.user ?? interaction.user;
  if (!env.DISCORD_OWNER_ID || user?.id !== env.DISCORD_OWNER_ID) return notice("Only the Cedar developer can use this.");
  try {
    if (interaction.type === TYPE.component) return await component(interaction, env, deps);
    if (interaction.type === TYPE.modal) return await modalSubmit(interaction, env, deps);
    if (interaction.type === TYPE.command) return messageCommand(interaction);
  } catch (error) {
    if (error instanceof FeedbackError) return notice(describe(error));
    throw error;
  }
  return notice("Unsupported interaction.");
};
