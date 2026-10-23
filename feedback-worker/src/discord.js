// Discord interactions: triage buttons, ticket panels in the staff forums, roadmap entry panels,
// modals, and the slash and message commands. Discord calls this endpoint over HTTPS with an
// Ed25519 signature; only the owner may act.
import { closedSubmissionMessage, itemMessage, reportsMessage, submissionMessage } from "./discord-render.js";
import { FeedbackError } from "./errors.js";
import { recordSubmission, validateSubmission } from "./feedback.js";
import {
  askReporter, attachSubmission, createItem, createTicket, discardSubmission, itemReports, linkRoadmap,
  mergeTicket, openTicketFromSubmission, releaseBuild, ticketOutcome, unlinkRoadmap, updateItem, updateTicket,
} from "./operations.js";
import { loginLink } from "./session.js";
import { fieldLabel, isClosed, isTicketID, similarity, statusLabel } from "./tickets.js";
import { CLOSED_STATUSES, itemNumber, STATUSES, statusInfo } from "./tracker.js";

const TYPE = { ping: 1, command: 2, component: 3, modal: 5 };
const REPLY = { pong: 1, message: 4, deferredUpdate: 6, update: 7, modal: 9 };
const EPHEMERAL = 64;
const THREAD_TYPES = new Set([10, 11, 12]);

const statusChoices = (kind) => STATUSES[kind]
  .filter((status) => status.public)
  .map((status) => ({ name: status.label, value: status.id }));

export const COMMANDS = Object.freeze([
  { name: "Track as bug", type: 3, default_member_permissions: "0" },
  { name: "Track as feature", type: 3, default_member_permissions: "0" },
  { name: "tracker", description: "Open Cedar Tracker (a private sign-in link)", type: 1, default_member_permissions: "0" },
  {
    name: "ticket",
    description: "Open a staff ticket, or mark a build released",
    type: 1,
    default_member_permissions: "0",
    options: [
      { type: 1, name: "bug", description: "Open a bug ticket", options: [{ type: 3, name: "title", description: "What’s wrong", required: true, min_length: 3, max_length: 120 }] },
      { type: 1, name: "feature", description: "Open a feature request ticket", options: [{ type: 3, name: "title", description: "What it should do", required: true, min_length: 3, max_length: 120 }] },
      {
        type: 1, name: "released", description: "Release every ticket waiting in a build",
        options: [
          { type: 3, name: "build", description: "The build its tickets name, e.g. 70", required: true, max_length: 40 },
          { type: 3, name: "version", description: "The version it shipped as, e.g. 1.0.1", required: false, max_length: 20 },
        ],
      },
    ],
  },
  {
    name: "roadmap",
    description: "Add an item to the public Cedar roadmap",
    type: 1,
    default_member_permissions: "0",
    options: [
      {
        type: 1, name: "feature", description: "Add a feature",
        options: [{ type: 3, name: "status", description: "Where it starts on the roadmap", required: true, choices: statusChoices("feature") }],
      },
      {
        type: 1, name: "bug", description: "Add a known issue",
        options: [{ type: 3, name: "status", description: "Where it starts on the roadmap", required: true, choices: statusChoices("bug") }],
      },
    ],
  },
]);

const hexBytes = (hex) => Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16));

export const verifySignature = async (publicKeyHex, signatureHex, timestamp, body) => {
  if (!/^[0-9a-f]{64}$/i.test(publicKeyHex) || !/^[0-9a-f]{128}$/i.test(signatureHex ?? "") || !timestamp) return false;
  const key = await crypto.subtle.importKey("raw", hexBytes(publicKeyHex), { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify("Ed25519", key, hexBytes(signatureHex), new TextEncoder().encode(timestamp + body));
};

const reply = (body) => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
const notice = (content, components) => reply({ type: REPLY.message, data: { content, components, flags: EPHEMERAL, allowed_mentions: { parse: [] } } });
const ephemeral = (message) => reply({ type: REPLY.message, data: { ...message, flags: EPHEMERAL } });
const update = (data) => reply({ type: REPLY.update, data });
// Ticket panels are edited over REST after each change, in order with renames, tags and
// archiving, so the interaction itself is only acknowledged.
const acknowledge = () => reply({ type: REPLY.deferredUpdate });

const textInput = (custom_id, label, { value = "", style = 1, required = true, min = 0, max = 4000, placeholder } = {}) => ({
  type: 1,
  components: [{
    type: 4, custom_id, label, style, required, value: value.slice(0, max) || undefined,
    min_length: min || undefined, max_length: max, placeholder,
  }],
});
const modal = (custom_id, title, inputs) => reply({ type: REPLY.modal, data: { custom_id, title: title.slice(0, 45), components: inputs.slice(0, 5) } });
const linkButton = (label, url) => ({ type: 2, style: 5, label, url });
const actionRow = (...components) => ({ type: 1, components });

// Modal values arrive nested in rows (or labels); collect them by custom_id.
const modalValues = (components, values = {}) => {
  for (const component of components ?? []) {
    if (component.custom_id && typeof component.value === "string") values[component.custom_id] = component.value;
    modalValues(component.components, values);
    if (component.component) modalValues([component.component], values);
  }
  return values;
};

// Public wording only: neither the report nor the ticket is copied in, so private detail can't
// be published by accident.
const wordingInputs = (title, summary, description = "") => [
  textInput("title", "Public title", { value: title, min: 3, max: 120 }),
  textInput("summary", "Public summary (optional)", { value: summary, style: 2, required: false, max: 600, placeholder: "Shown on the roadmap under the title." }),
  textInput("description", "Public details (optional)", { value: description, style: 2, required: false, max: 2000, placeholder: "Shown when someone opens the item on the roadmap. Write it fresh; don’t paste the report." }),
];

const shipInputs = (item) => [
  textInput("shippedIn", "Shipped in (optional)", { value: item.shippedIn, required: false, max: 40, placeholder: "1.0.0 (70)" }),
  textInput("releaseURL", "Release notes link (optional)", { value: item.releaseURL, required: false, max: 300, placeholder: "https://cedartv.github.io/cedar-tv-updates/…" }),
];

// The ticket's own detail fields. Notes longer than a Discord field are left out of the form
// (and so untouched) and edited in the Tracker instead.
const detailInputs = (ticket) => {
  const area = (key, max, placeholder) => textInput(key, fieldLabel(ticket.kind, key), { value: ticket[key], style: 2, required: false, max, placeholder });
  const inputs = [textInput("title", "Title", { value: ticket.title, min: 3, max: 120 })];
  if (ticket.kind === "bug") {
    inputs.push(area("summary", 4000), area("steps", 4000, "1. Open…\n2. …"), area("expected", 2000, "Expected: … Actual: …"));
  } else {
    inputs.push(area("summary", 4000, "Who wants it, and what they’re trying to do."), area("decision", 2000, "What we decided, and why."));
  }
  if (ticket.notes.length <= 4000) inputs.push(area("notes", 4000));
  return inputs;
};

const buildInputs = (ticket, { requireBuild = false } = {}) => [
  ...(ticket.kind === "bug" ? [textInput("brokeIn", "Broke in (optional)", { value: ticket.brokeIn, required: false, max: 40, placeholder: "1.0.0 (68)" })] : []),
  textInput("fixedIn", fieldLabel(ticket.kind, "fixedIn"), { value: ticket.fixedIn, required: requireBuild, max: 40, placeholder: "70" }),
  textInput("commit", "Commit (optional)", { value: ticket.commit, required: false, max: 120, placeholder: "a1b2c3d" }),
];

const getSubmission = async (deps, submissionID) => {
  const submission = await deps.store.get(submissionID);
  if (!submission) throw new FeedbackError(404, "not_found");
  return submission;
};

const getTicket = async (deps, id) => {
  const ticket = isTicketID(id) ? await deps.store.getTicket(id) : null;
  if (!ticket) throw new FeedbackError(404, "ticket_not_found");
  return ticket;
};

const getItem = async (deps, itemID) => {
  const item = await deps.store.getItem(itemNumber(itemID));
  if (!item) throw new FeedbackError(404, "item_not_found");
  return item;
};

const reportsNotice = (ticket, reports) => ephemeral(reportsMessage(
  `Report${reports.length === 1 ? "" : "s"} behind **${ticket.id}** ${ticket.title.slice(0, 120)}.`,
  reports,
  `${ticket.id} has no reports (it was opened directly, or its reports were deleted).`,
));

// Open tickets, the ones that best match the report first.
const attachChoices = async (deps, submission) => (await deps.store.listTickets())
  .filter((ticket) => !isClosed(ticket) || ticket.status === "released")
  .filter((ticket) => ticket.status !== "duplicate")
  .map((ticket) => ({ ticket, score: similarity(`${submission.title} ${submission.details}`, `${ticket.title} ${ticket.summary}`) + (isClosed(ticket) ? -0.2 : 0) }))
  .sort((left, right) => right.score - left.score || right.ticket.updatedAtEpochMilliseconds - left.ticket.updatedAtEpochMilliseconds)
  .slice(0, 25)
  .map(({ ticket }) => ticket);

const roadmapMenu = async (deps, ticket) => {
  if (ticket.roadmapID) {
    const entry = await deps.store.getItem(itemNumber(ticket.roadmapID));
    return {
      content: `**${ticket.id}** is on the roadmap as **${entry.id}** “${entry.title}” (${statusInfo(entry.kind, entry.status)?.label ?? entry.status}${entry.statusMode === "follow" ? ", following its tickets" : ""}). Edit its public wording from its panel${entry.discordChannelID ? ` in <#${entry.discordChannelID}>` : ""}.`,
      components: [actionRow({ type: 2, style: 4, label: "Remove from roadmap", custom_id: `t:rmunlink:${ticket.id}` })],
    };
  }
  const entries = (await deps.store.listItems())
    .filter((entry) => !CLOSED_STATUSES.includes(entry.status))
    .sort((left, right) => right.updated.localeCompare(left.updated))
    .slice(0, 25);
  const components = [actionRow({ type: 2, style: 3, label: "Add as a new roadmap entry", custom_id: `t:rmnew:${ticket.id}` })];
  if (entries.length) {
    components.push(actionRow({
      type: 3,
      custom_id: `t:rmlink:${ticket.id}`,
      placeholder: "Or join an existing entry",
      options: entries.map((entry) => ({
        label: `${entry.id} ${entry.title}`.slice(0, 100),
        value: entry.id,
        description: `${entry.kind === "bug" ? "Known issue" : "Feature"} · ${statusInfo(entry.kind, entry.status)?.label ?? entry.status}`,
      })),
    }));
  }
  return { content: `**${ticket.id}** isn’t on the public roadmap. A new entry follows this ticket’s status; you write its public wording.`, components };
};

const actorName = (interaction) => {
  const user = interaction.member?.user ?? interaction.user;
  return (interaction.member?.nick || user?.global_name || user?.username || "Discord").slice(0, 40);
};

const submissionComponent = async (interaction, env, deps, action, rest, options) => {
  const submissionID = rest.at(-1);
  const silent = { ...options, refreshMessage: false };
  switch (action) {
    // "approve" and "private" are on triage messages posted before tickets existed.
    case "approve":
    case "private":
    case "ticket": {
      const submission = await getSubmission(deps, submissionID);
      const kind = action === "ticket" ? rest[0] : submission.kind;
      const ticket = await openTicketFromSubmission(deps, submissionID, kind, silent);
      return update(closedSubmissionMessage(submission, ticketOutcome(ticket, "Opened")));
    }
    case "merge":
    case "attach": {
      const submission = await getSubmission(deps, submissionID);
      const tickets = await attachChoices(deps, submission);
      if (!tickets.length) return notice("There are no open tickets to attach this to yet. Use New bug or New feature.");
      return ephemeral({
        content: `Attach “${submission.title.slice(0, 80)}” to:`,
        components: [actionRow({
          type: 3,
          custom_id: `s:attachpick:${submissionID}`,
          placeholder: "Choose a ticket (closest matches first)",
          options: tickets.map((ticket) => ({
            label: `${ticket.id} ${ticket.title}`.slice(0, 100),
            value: ticket.id,
            description: `${statusLabel(ticket)} · ${ticket.reports} report${ticket.reports === 1 ? "" : "s"}`,
          })),
        })],
      });
    }
    case "mergepick":
    case "attachpick": {
      // The triage message is edited over REST; this answer replaces the picker.
      const ticket = await attachSubmission(deps, submissionID, interaction.data.values?.[0], options);
      return update({ content: `Attached to ${ticket.id} ${ticket.title}.`, components: [] });
    }
    case "ask": {
      const submission = await getSubmission(deps, submissionID);
      if (submission.state !== "new") return notice("Someone already handled this report.");
      if (submission.sourceChannelID) {
        return modal(`m:ask:${submissionID}`, "Ask the reporter", [
          textInput("question", submission.reporterUserID ? "Question (they’re mentioned in their post)" : "Question (posted in their thread)", { style: 2, min: 3, max: 1500, placeholder: "Which build are you on, and does it happen after a restart?" }),
        ]);
      }
      if (!submission.contact) return notice("This report came without an email or a Discord post, so there’s no way to ask for more. Triage it as it is.");
      const { contact } = await askReporter(deps, submissionID, "", options);
      return notice(`Email them at ${contact}. The report stays here, marked as waiting, and keeps the address until you triage it.`);
    }
    case "discard": {
      const submission = await discardSubmission(deps, submissionID, silent);
      return update(closedSubmissionMessage(submission, "Discarded.", { keepsReport: false }));
    }
    case "report": {
      // Reopens a triaged report privately; the closed triage message only keeps the outcome.
      const submission = await getSubmission(deps, submissionID);
      if (!submission.ticketID && !submission.itemID) return notice("This report isn’t linked to a ticket anymore.");
      const events = await deps.store.eventsForSubmission(submissionID);
      const message = reportsMessage(`Report${submission.ticketID ? ` behind **${submission.ticketID}**` : ""}.`, [submission], "");
      if (events.length) message.content += `\n${events.map((entry) => `• ${entry.type === "reply" ? `💬 ${entry.actor}: ` : ""}${entry.body}`).join("\n").slice(0, 1500)}`;
      return ephemeral(message);
    }
    case "contact": {
      const submission = await getSubmission(deps, submissionID);
      return notice(submission.contact ? `Email: ${submission.contact}` : "No email on this report (it’s cleared once a report is triaged).");
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

const ticketComponent = async (interaction, env, deps, action, rest, options) => {
  const ticketID = rest.at(-1);
  const values = interaction.data.values ?? [];
  switch (action) {
    case "status": {
      const status = values[0];
      const ticket = await getTicket(deps, ticketID);
      if (status === ticket.status) return acknowledge();
      if (status === "in-build") return modal(`m:build:in-build:${ticketID}`, `${ticketID} is in a build`, buildInputs(ticket, { requireBuild: true }));
      if (status === "released") {
        return modal(`m:release:${ticketID}`, `Release ${ticketID}`, [
          textInput("releasedIn", "Released in", { value: ticket.releasedIn || ticket.fixedIn, max: 40, placeholder: "1.0.1 (70)" }),
          textInput("releaseURL", "Release notes link (optional, for its roadmap entry)", { required: false, max: 300, placeholder: "https://cedartv.github.io/cedar-tv-updates/…" }),
        ]);
      }
      if (status === "duplicate") {
        return modal(`m:dup:${ticketID}`, `${ticketID} duplicates…`, [
          textInput("into", "The ticket to merge it into", { min: 4, max: 12, placeholder: ticket.kind === "bug" ? "BUG-12" : "FR-4" }),
        ]);
      }
      await updateTicket(deps, ticketID, { status }, options);
      return acknowledge();
    }
    case "priority":
      await updateTicket(deps, ticketID, { priority: values[0] }, options);
      return acknowledge();
    case "platforms":
      await updateTicket(deps, ticketID, { platforms: values }, options);
      return acknowledge();
    case "edit": {
      const ticket = await getTicket(deps, ticketID);
      return modal(`m:edit:${ticketID}`, `Edit ${ticketID}`, detailInputs(ticket));
    }
    case "build": {
      const ticket = await getTicket(deps, ticketID);
      return modal(`m:build:-:${ticketID}`, `Build info for ${ticketID}`, buildInputs(ticket));
    }
    case "reports": {
      const ticket = await getTicket(deps, ticketID);
      return reportsNotice(ticket, await deps.store.reportsForTicket(ticketID));
    }
    case "roadmap":
      return ephemeral(await roadmapMenu(deps, await getTicket(deps, ticketID)));
    case "rmnew": {
      await getTicket(deps, ticketID);
      return modal(`m:rmnew:${ticketID}`, `Roadmap wording for ${ticketID}`, wordingInputs("", ""));
    }
    case "rmlink": {
      const { entry } = await linkRoadmap(deps, ticketID, { entryID: values[0] }, options);
      return update({ content: `${ticketID} now counts toward **${entry.id}** “${entry.title}”.`, components: [] });
    }
    case "rmunlink": {
      await unlinkRoadmap(deps, ticketID, options);
      return update({ content: `${ticketID} is off the roadmap.`, components: [] });
    }
    case "tracker": {
      const url = await loginLink(deps, env, (interaction.member?.user ?? interaction.user).id, ticketID);
      return notice(`Opens ${ticketID} in Cedar Tracker. The link works once, for ten minutes.`, [actionRow(linkButton("Open in Tracker", url))]);
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

const itemComponent = async (interaction, env, deps, action, rest) => {
  const itemID = rest.at(-1);
  const silent = { refreshMessage: false };
  const panel = async (item) => update(itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
  switch (action) {
    case "status": {
      const status = rest[0];
      if (["shipped", "fixed"].includes(status)) {
        const item = await getItem(deps, itemID);
        return modal(`m:ship:${status}:${itemID}`, `Mark ${itemID} ${statusInfo(item.kind, status)?.label ?? status}`, shipInputs(item));
      }
      return panel(await updateItem(deps, itemID, { status }, silent));
    }
    case "mode":
      return panel(await updateItem(deps, itemID, { statusMode: rest[0] }, silent));
    case "edit": {
      const item = await getItem(deps, itemID);
      return modal(`m:edit:${itemID}`, `Edit ${itemID}`, wordingInputs(item.title, item.summary, item.description));
    }
    case "reports": {
      const { item, tickets, reports } = await itemReports(deps, itemID);
      const list = tickets.map((ticket) => `• ${ticket.discordThreadID ? `<#${ticket.discordThreadID}>` : `**${ticket.id}**`} ${ticket.title} · ${statusLabel(ticket)}`).join("\n");
      const message = reportsMessage(
        `${tickets.length ? `Tickets behind **${item.id}**:\n${list}\n\n` : ""}Reports:`,
        reports,
        tickets.length ? `Tickets behind **${item.id}**:\n${list}\n\nNo reports yet.` : `${item.id} has no tickets. Link one from its Roadmap… button.`,
      );
      return ephemeral(message);
    }
    case "visibility": {
      const item = await getItem(deps, itemID);
      return panel(await updateItem(deps, itemID, { public: !item.public }, silent));
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

const component = async (interaction, env, deps) => {
  const [scope, action, ...rest] = interaction.data.custom_id.split(":");
  const options = { actor: actorName(interaction) };
  if (scope === "s") return submissionComponent(interaction, env, deps, action, rest, options);
  if (scope === "t") return ticketComponent(interaction, env, deps, action, rest, options);
  if (scope === "i") return itemComponent(interaction, env, deps, action, rest);
  throw new FeedbackError(400, "unknown_action");
};

const modalSubmit = async (interaction, env, deps) => {
  const [, action, ...rest] = interaction.data.custom_id.split(":");
  const values = modalValues(interaction.data.components);
  const options = { actor: actorName(interaction) };
  const silent = { ...options, refreshMessage: false };
  switch (action) {
    case "ask": {
      const { submission } = await askReporter(deps, rest[0], values.question, silent);
      return update(submissionMessage(submission, await deps.store.eventsForSubmission(rest[0])));
    }
    case "edit": {
      if (isTicketID(rest[0])) {
        const fields = Object.fromEntries(["title", "summary", "steps", "expected", "decision", "notes"].filter((key) => key in values).map((key) => [key, values[key]]));
        await updateTicket(deps, rest[0], fields, options);
        return acknowledge();
      }
      const item = await updateItem(deps, rest[0], { title: values.title, summary: values.summary ?? "", description: values.description ?? "" }, { refreshMessage: false });
      return update(itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
    }
    case "build": {
      const [status, ticketID] = rest;
      const fields = Object.fromEntries(["brokeIn", "fixedIn", "commit"].filter((key) => key in values).map((key) => [key, values[key]]));
      await updateTicket(deps, ticketID, status === "-" ? fields : { ...fields, status }, options);
      return acknowledge();
    }
    case "release":
      await updateTicket(deps, rest[0], { status: "released", releasedIn: values.releasedIn ?? "" }, { ...options, releaseURL: values.releaseURL ?? "" });
      return acknowledge();
    case "dup":
      await mergeTicket(deps, rest[0], (values.into ?? "").trim().toUpperCase(), options);
      return acknowledge();
    case "rmnew": {
      const { entry } = await linkRoadmap(deps, rest[0], {
        create: { title: values.title, summary: values.summary ?? "", description: values.description ?? "" },
      }, options);
      const where = env.DISCORD_ROADMAP_CHANNEL_ID ? ` Its panel is in <#${env.DISCORD_ROADMAP_CHANNEL_ID}>.` : "";
      return update({ content: `Added to the roadmap as **${entry.id}** “${entry.title}”, following ${rest[0]}.${where}`, components: [] });
    }
    case "create": {
      const [kind, status] = rest;
      const item = await createItem(deps, {
        kind, status, public: true, title: values.title, summary: values.summary ?? "", description: values.description ?? "",
        shippedIn: values.shippedIn ?? "",
      });
      const where = env.DISCORD_ROADMAP_CHANNEL_ID ? ` Its panel is in <#${env.DISCORD_ROADMAP_CHANNEL_ID}>.` : "";
      return notice(`Added **${item.id}** ${item.title} to the roadmap.${where}`);
    }
    case "ship": {
      const item = await updateItem(deps, rest[1], {
        status: rest[0], shippedIn: values.shippedIn ?? "", releaseURL: values.releaseURL ?? "",
      }, { refreshMessage: false });
      return update(itemMessage(item, await deps.store.ticketsForEntry(itemNumber(item.id))));
    }
    case "import": {
      // The message is read again for its author, who becomes the reporter.
      const [kind, where, channelID, messageID] = rest;
      const submission = validateSubmission({ schemaVersion: 1, kind, title: values.title, details: values.details, platform: "other" });
      const { honeypot: _honeypot, elapsedMs: _elapsed, ...fields } = submission;
      const message = deps.discord ? await deps.discord.message(channelID, messageID).catch(() => null) : null;
      const author = message?.author;
      await recordSubmission(deps, env, fields, {
        channel: "discord",
        clientHash: "discord",
        reporter: (author?.global_name || author?.username || "").slice(0, 40) || null,
        reporterUserID: author?.id ?? null,
        sourceChannelID: where === "t" ? channelID : null,
        sourceMessageID: where === "t" ? messageID : null,
      });
      return notice("Sent to the triage channel.");
    }
  }
  throw new FeedbackError(400, "unknown_action");
};

// /roadmap feature|bug status:… opens a form for the new entry's public wording.
const roadmapCommand = (interaction) => {
  const subcommand = interaction.data.options?.[0];
  const kind = subcommand?.name;
  const status = subcommand?.options?.find((option) => option.name === "status")?.value;
  if (!STATUSES[kind] || !statusInfo(kind, status)?.public) throw new FeedbackError(400, "unknown_action");
  const inputs = wordingInputs("", "");
  if (["shipped", "fixed"].includes(status)) inputs.push(shipInputs({ shippedIn: "", releaseURL: "" })[0]);
  return modal(`m:create:${kind}:${status}`, `New ${kind === "bug" ? "known issue" : "feature"} · ${statusInfo(kind, status).label}`, inputs);
};

// /ticket bug|feature title:… opens a ticket directly; /ticket released build:… releases a build.
const ticketCommand = async (interaction, env, deps) => {
  const subcommand = interaction.data.options?.[0];
  const option = (name) => subcommand?.options?.find((candidate) => candidate.name === name)?.value ?? "";
  const options = { actor: actorName(interaction) };
  if (subcommand?.name === "released") {
    const { releasedIn, tickets } = await releaseBuild(deps, { build: option("build"), version: option("version") }, options);
    if (!tickets.length) return notice(`No tickets were waiting in build ${option("build")}. A ticket waits in a build when its Fixed in build is set and it’s Fixed in code, In a build or Verified.`);
    return notice(`Released ${tickets.length} ticket${tickets.length === 1 ? "" : "s"} in ${releasedIn}: ${tickets.map((ticket) => ticket.id).join(", ")}. Their roadmap entries and reporters’ threads are updated.`);
  }
  if (subcommand?.name !== "bug" && subcommand?.name !== "feature") throw new FeedbackError(400, "unknown_action");
  const ticket = await createTicket(deps, { kind: subcommand.name, title: option("title") }, options);
  const forum = subcommand.name === "bug" ? env.DISCORD_STAFF_BUG_FORUM_ID : env.DISCORD_STAFF_FEATURE_FORUM_ID;
  return notice(`Opened **${ticket.id}** ${ticket.title}.${forum ? ` Its thread is in <#${forum}>.` : ""}`);
};

const trackerCommand = async (interaction, env, deps) => {
  const url = await loginLink(deps, env, (interaction.member?.user ?? interaction.user).id);
  return notice("Your Cedar Tracker sign-in link works once, for ten minutes. You stay signed in on that browser for 30 days.", [actionRow(linkButton("Open Cedar Tracker", url))]);
};

// "Track as bug" / "Track as feature" on any message: opens a prefilled modal. In a thread, the
// thread becomes the report's source, so status tags, questions and replies follow it there.
const messageCommand = (interaction) => {
  const kind = interaction.data.name === "Track as bug" ? "bug" : "feature";
  const message = interaction.data.resolved?.messages?.[interaction.data.target_id];
  if (!message) throw new FeedbackError(400, "message_unavailable");
  const inThread = THREAD_TYPES.has(interaction.channel?.type);
  const firstLine = (message.content || "").split("\n").find((text) => text.trim()) ?? "";
  const title = (inThread && interaction.channel?.name) || firstLine;
  return modal(`m:import:${kind}:${inThread ? "t" : "c"}:${interaction.channel_id}:${interaction.data.target_id}`, kind === "bug" ? "Track as bug" : "Track as feature", [
    textInput("title", "Title", { value: title.slice(0, 120), min: 3, max: 120 }),
    textInput("details", "Details", { value: message.content || "", style: 2, min: 10, max: 4000 }),
  ]);
};

const describe = (error) => {
  const messages = {
    already_triaged: "Someone already handled this report.",
    not_found: "That report no longer exists.",
    item_not_found: "That roadmap entry no longer exists.",
    ticket_not_found: "That ticket doesn’t exist.",
    ticket_is_duplicate: "That ticket is closed as a duplicate. Use the ticket it duplicates.",
    same_ticket: "A ticket can’t duplicate itself.",
    invalid_ticket: "That isn’t a ticket id (BUG-12 or FR-4).",
    invalid_build: "Give the build its tickets name, like 70.",
    question_required: "Write the question to ask.",
    no_way_to_reach: "There’s no way to reach this reporter.",
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
    if (interaction.type === TYPE.command) {
      if (interaction.data.name === "roadmap") return roadmapCommand(interaction);
      if (interaction.data.name === "ticket") return await ticketCommand(interaction, env, deps);
      if (interaction.data.name === "tracker") return await trackerCommand(interaction, env, deps);
      return messageCommand(interaction);
    }
  } catch (error) {
    if (error instanceof FeedbackError) return notice(describe(error));
    throw error;
  }
  return notice("Unsupported interaction.");
};

