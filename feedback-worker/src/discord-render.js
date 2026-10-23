// Discord message bodies for the private triage channel, the staff forums' ticket threads and the
// roadmap channel, and the small REST client that posts them.
import { fieldLabel, isClosed, statusLabel, TICKET_STATUSES } from "./tickets.js";
import { CLOSED_STATUSES, isPublished, PLATFORMS, PRIORITIES, STATUSES, statusInfo } from "./tracker.js";

export const ROADMAP_URL = "https://cedartv.github.io/cedar-tv-updates/roadmap/";

const BUTTON = 2;
const ROW = 1;
const STYLE = { primary: 1, secondary: 2, success: 3, danger: 4, link: 5 };
const COLORS = { bug: 0xd9534f, feature: 0x5aa2f0, done: 0x6cc46c, muted: 0x4f5660, waiting: 0xe0a33a };
const CHANNELS = { app: "the app", website: "the website", discord: "Discord" };

const clip = (text, maximum) => (text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text);
const button = (custom_id, label, style = STYLE.secondary) => ({ type: BUTTON, style, label, custom_id });
const select = (custom_id, placeholder, options, { min = 1, max = 1 } = {}) => ({
  type: 3, custom_id, placeholder, options, min_values: min, max_values: max,
});
const row = (...components) => ({ type: ROW, components });
const field = (name, value, inline = true) => (value ? { name, value: clip(String(value), 1024), inline } : null);

const fromLabel = (submission) => (submission.channel === "discord" && submission.reporter
  ? `Discord, from ${submission.reporter}`
  : CHANNELS[submission.channel] ?? submission.channel);

// A report as staff see it: its full text and device details, never its email.
export const reportEmbed = (submission, { detailsMaximum = 3500, footer = "" } = {}) => {
  const isBug = submission.kind === "bug";
  return {
    author: { name: isBug ? "Bug report" : "Feature request" },
    title: clip(submission.title, 256),
    description: clip(submission.details, detailsMaximum),
    color: isBug ? COLORS.bug : COLORS.feature,
    fields: [
      field("App", PLATFORMS[submission.platform] ?? submission.platform),
      field("From", fromLabel(submission)),
      field("Version", submission.appVersion),
      field("System", submission.osVersion),
      field("Device", submission.deviceModel),
      field("Post", submission.sourceChannelID ? `<#${submission.sourceChannelID}>` : null),
    ].filter(Boolean),
    timestamp: submission.createdAtEpochMilliseconds ? new Date(submission.createdAtEpochMilliseconds).toISOString() : undefined,
    footer: { text: `Reference ${submission.submissionID.slice(0, 8)}${footer}` },
  };
};

const day = (milliseconds) => new Date(milliseconds).toISOString().slice(0, 10);

// Reports waiting for a decision. A report can become a bug or a feature whatever it was sent
// as, join an existing ticket, or wait while the reporter is asked for more.
export const submissionMessage = (submission, events = []) => {
  const id = submission.submissionID;
  const isBug = submission.kind === "bug";
  const rows = [row(
    button(`s:ticket:bug:${id}`, "New bug", isBug ? STYLE.success : STYLE.secondary),
    button(`s:ticket:feature:${id}`, "New feature", isBug ? STYLE.secondary : STYLE.success),
    button(`s:attach:${id}`, "Attach to…", STYLE.primary),
    button(`s:ask:${id}`, "Needs info"),
    button(`s:discard:${id}`, "Discard", STYLE.danger),
  )];
  if (submission.contact) rows.push(row(button(`s:contact:${id}`, "Show email")));
  const embed = reportEmbed(submission, { detailsMaximum: 3000, footer: submission.contact ? " · email provided" : "" });
  const asked = events.filter((entry) => entry.type === "asked").at(-1);
  const replies = events.filter((entry) => entry.type === "reply");
  if (submission.needsInfoAtEpochMilliseconds) {
    embed.color = COLORS.waiting;
    embed.fields.push(field("Waiting for the reporter", `Since ${day(submission.needsInfoAtEpochMilliseconds)}${asked?.body ? `: ${clip(asked.body, 200)}` : ""}`, false));
  }
  for (const reply of replies.slice(-2)) embed.fields.push(field(`💬 ${reply.actor || "Reply"} · ${day(reply.atEpochMilliseconds)}`, clip(reply.body || "(attachment)", 400), false));
  embed.fields = embed.fields.filter(Boolean).slice(0, 25);
  return { embeds: [embed], components: rows, allowed_mentions: { parse: [] } };
};

// A triaged report. When it opened or joined a ticket, the report is kept and a button
// reopens it privately.
export const closedSubmissionMessage = (submission, outcome, { keepsReport = true } = {}) => ({
  embeds: [{
    author: { name: submission.kind === "bug" ? "Bug report" : "Feature request" },
    title: clip(submission.title, 256),
    description: outcome,
    color: COLORS.muted,
    footer: { text: `Reference ${submission.submissionID.slice(0, 8)}` },
  }],
  components: keepsReport ? [row(button(`s:report:${submission.submissionID}`, "Show report"))] : [],
  allowed_mentions: { parse: [] },
});

// Original reports, shown only to the person who asked. Discord allows 6,000 characters across a
// message's embeds, so it shows the latest five and clips long text evenly.
export const reportsMessage = (heading, reports, emptyText) => {
  if (!reports.length) return { content: emptyText, allowed_mentions: { parse: [] } };
  const shown = reports.slice(-5);
  const detailsMaximum = Math.min(3500, Math.floor(3000 / shown.length));
  const more = reports.length > shown.length ? ` Showing the latest ${shown.length} of ${reports.length}; the Tracker lists them all.` : "";
  return {
    content: `${heading}${more}`,
    embeds: shown.map((report) => reportEmbed(report, {
      detailsMaximum,
      footer: ` · ${report.state === "merged" ? "attached" : "opened the ticket"}${report.ticketID ? ` · ${report.ticketID}` : ""}`,
    })),
    allowed_mentions: { parse: [] },
  };
};

export const threadName = (ticket) => clip(`${ticket.id} · ${ticket.title}`, 100);

const PRIORITY_TAGS = Object.freeze({ high: "High priority", urgent: "Urgent" });

// Tag names in the staff forums (server-config.yaml): one per status, the two raised priorities,
// and the platforms. A thread holds five at most, so the status and priority come first.
export const STAFF_TAGS = (ticket) => [
  statusLabel(ticket),
  PRIORITY_TAGS[ticket.priority],
  ...ticket.platforms.map((platform) => PLATFORMS[platform]),
].filter(Boolean);

export const STAFF_TAG_NAMES = Object.freeze(Object.fromEntries(Object.entries(TICKET_STATUSES).map(([kind, statuses]) => [
  kind, [...statuses.map((status) => status.label), ...Object.values(PRIORITY_TAGS), ...Object.values(PLATFORMS)],
])));

// Moderated tags in the public forums (server-config.yaml) that mirror a ticket's status.
// "Needs info" marks a post whose reporter has been asked for more.
export const NEEDS_INFO_TAG = "Needs info";
export const PUBLIC_FORUM_TAGS = Object.freeze({
  bug: { released: "Fixed", "cant-reproduce": "Cannot reproduce" },
  feature: { planned: "Planned", "in-progress": "Planned", "in-build": "Planned", released: "Shipped", declined: "Not planned" },
});

const priorityLabel = (priority) => priority[0].toUpperCase() + priority.slice(1);

// A ticket's live panel: the first message of its staff thread. Selects change status, priority
// and platforms in place; the buttons open forms or private details.
export const ticketMessage = (ticket) => {
  const color = isClosed(ticket)
    ? (ticket.status === "released" ? COLORS.done : COLORS.muted)
    : ticket.kind === "bug" ? COLORS.bug : COLORS.feature;
  const text = (key) => (ticket[key] ? field(fieldLabel(ticket.kind, key), clip(ticket[key], 1024), false) : null);
  return {
    embeds: [{
      author: { name: `${ticket.id} · ${ticket.kind === "bug" ? "Bug" : "Feature request"}` },
      title: clip(ticket.title, 256),
      description: ticket.summary ? clip(ticket.summary, 3000) : "_Nothing written yet. Edit details to describe it._",
      color,
      fields: [
        field("Status", statusLabel(ticket)),
        field("Priority", priorityLabel(ticket.priority)),
        field("Platforms", ticket.platforms.map((platform) => PLATFORMS[platform]).join(", ") || "—"),
        text("steps"),
        text("expected"),
        text("decision"),
        text("notes"),
        field(fieldLabel(ticket.kind, "brokeIn"), ticket.brokeIn),
        field(fieldLabel(ticket.kind, "fixedIn"), ticket.fixedIn),
        field("Commit", ticket.commit),
        field("Released in", ticket.releasedIn),
        field("Reports", ticket.reports > 0 ? String(ticket.reports) : null),
        field("Roadmap", ticket.roadmapID),
        field("Duplicate of", ticket.duplicateOf),
      ].filter(Boolean),
      footer: { text: `Updated ${day(ticket.updatedAtEpochMilliseconds)}` },
    }],
    components: [
      row(select(`t:status:${ticket.id}`, "Status", TICKET_STATUSES[ticket.kind].map((status) => ({
        label: status.label, value: status.id, default: status.id === ticket.status,
      })))),
      row(select(`t:priority:${ticket.id}`, "Priority", PRIORITIES.map((priority) => ({
        label: `${priorityLabel(priority)} priority`, value: priority, default: priority === ticket.priority,
      })))),
      row(select(`t:platforms:${ticket.id}`, "Platforms", Object.entries(PLATFORMS).map(([value, label]) => ({
        label, value, default: ticket.platforms.includes(value),
      })), { min: 0, max: Object.keys(PLATFORMS).length })),
      row(
        button(`t:edit:${ticket.id}`, "Edit details", STYLE.primary),
        button(`t:build:${ticket.id}`, "Build info"),
        button(`t:reports:${ticket.id}`, ticket.reports > 0 ? `Reports (${ticket.reports})` : "Reports"),
        button(`t:roadmap:${ticket.id}`, ticket.roadmapID ? `Roadmap · ${ticket.roadmapID}` : "Roadmap…"),
        button(`t:tracker:${ticket.id}`, "Open in Tracker"),
      ),
    ],
    allowed_mentions: { parse: [] },
  };
};

const EVENT_ICONS = { status: "🔀", edit: "✏️", note: "📝", roadmap: "🗺️", merged: "🔗", report: "📎", reply: "💬", asked: "❓", created: "🆕" };

// One timeline event as a line in the ticket's thread.
export const eventLine = ({ type, actor, body }) => ({
  content: clip(type === "note" ? `${EVENT_ICONS.note} **${actor}:** ${body}` : `${EVENT_ICONS[type] ?? "•"} ${body}${actor ? ` · ${actor}` : ""}`, 2000),
  allowed_mentions: { parse: [] },
});

// A roadmap entry's panel in the roadmap channel: public wording and visibility, and its status,
// which either follows the linked tickets or is set with the buttons.
export const itemMessage = (item, tickets = []) => {
  const published = isPublished(item);
  const done = CLOSED_STATUSES.includes(item.status);
  const following = item.statusMode === "follow";
  const label = (status) => (status.public ? status.label : `${status.label} (hides it)`);
  const style = (status) => (["shipped", "fixed"].includes(status.id) ? STYLE.success : status.public ? STYLE.primary : STYLE.danger);
  const statuses = STATUSES[item.kind].filter((status) => status.id !== "new" && status.id !== item.status);
  const linked = tickets.map((ticket) => `${ticket.discordThreadID ? `<#${ticket.discordThreadID}>` : ticket.id} · ${statusLabel(ticket)}`).join("\n");
  const components = [];
  if (!following) components.push(row(...statuses.map((status) => button(`i:status:${status.id}:${item.id}`, label(status), style(status)))));
  components.push(row(
    button(`i:edit:${item.id}`, "Edit wording"),
    button(`i:reports:${item.id}`, "Tickets & reports"),
    button(`i:visibility:${item.id}`, item.public ? "Hide from roadmap" : "Show on roadmap", item.public ? STYLE.secondary : STYLE.success),
    following
      ? button(`i:mode:manual:${item.id}`, "Set status by hand")
      : button(`i:mode:follow:${item.id}`, "Follow tickets", tickets.length ? STYLE.primary : STYLE.secondary),
    { type: BUTTON, style: STYLE.link, label: "Open roadmap", url: ROADMAP_URL },
  ));
  return {
    embeds: [{
      author: { name: `${item.id} · ${item.kind === "bug" ? "Known issue" : "Feature"}` },
      title: clip(item.title, 256),
      url: published ? ROADMAP_URL : undefined,
      description: [item.summary || "_No public summary yet._", item.description].filter(Boolean).map((text) => clip(text, 1900)).join("\n\n"),
      color: done ? (["shipped", "fixed"].includes(item.status) ? COLORS.done : COLORS.muted) : item.kind === "bug" ? COLORS.bug : COLORS.feature,
      fields: [
        field("Status", `${statusInfo(item.kind, item.status)?.label ?? item.status}${following ? " (follows tickets)" : ""}`),
        field("Roadmap", published ? "Shown" : item.public ? "Hidden (private status)" : "Hidden"),
        field("Platforms", item.platforms.map((platform) => PLATFORMS[platform]).join(", ") || "—"),
        field("Requests", item.requests > 0 ? String(item.requests) : null),
        field("Shipped in", ["shipped", "fixed"].includes(item.status) ? item.shippedIn : null),
        field("Tickets", linked || null, false),
      ].filter(Boolean),
      footer: { text: `Updated ${item.updated}` },
    }],
    components,
    allowed_mentions: { parse: [] },
  };
};

// Posted in a reporter's own thread when their ticket is released.
export const releasedNotice = (ticket) => ({
  content: ticket.kind === "bug"
    ? `Fixed${ticket.releasedIn ? ` in ${ticket.releasedIn}` : ""}. Thanks for reporting it!`
    : `This shipped${ticket.releasedIn ? ` in ${ticket.releasedIn}` : ""}. Thanks for the request!`,
  allowed_mentions: { parse: [] },
});

export const discordClient = (token, fetcher = fetch) => {
  const call = async (method, path, body) => {
    const response = await fetcher(`https://discord.com/api/v10${path}`, {
      method,
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new Error(`Discord ${method} ${path.split("/").slice(0, 3).join("/")} answered ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  return {
    send: (channelID, message) => call("POST", `/channels/${channelID}/messages`, message),
    edit: (channelID, messageID, message) => call("PATCH", `/channels/${channelID}/messages/${messageID}`, message),
    channel: (channelID) => call("GET", `/channels/${channelID}`),
    activeThreads: (guildID) => call("GET", `/guilds/${guildID}/threads/active`),
    archivedThreads: (channelID) => call("GET", `/channels/${channelID}/threads/archived/public?limit=25`),
    // Null when the message is gone (a forum post whose first message was deleted).
    message: (channelID, messageID) => call("GET", `/channels/${channelID}/messages/${messageID}`).catch((error) => {
      if (/ 404$/.test(error.message)) return null;
      throw error;
    }),
    // Name, tags, archived or locked on a thread.
    updateThread: (channelID, patch) => call("PATCH", `/channels/${channelID}`, patch),
    createThread: (forumID, body) => call("POST", `/channels/${forumID}/threads`, body),
    messages: (channelID, { after = null, limit = 50 } = {}) => call("GET", `/channels/${channelID}/messages?limit=${limit}${after ? `&after=${after}` : ""}`),
  };
};
