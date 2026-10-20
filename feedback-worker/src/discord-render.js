// Discord message bodies for the private triage and roadmap channels, and the small REST client that posts them.
import { CLOSED_STATUSES, isPublished, PLATFORMS, STATUSES, statusInfo } from "./tracker.js";

export const ROADMAP_URL = "https://cedartv.github.io/cedar-tv-updates/roadmap/";

const BUTTON = 2;
const ROW = 1;
const STYLE = { primary: 1, secondary: 2, success: 3, danger: 4, link: 5 };
const COLORS = { bug: 0xd9534f, feature: 0x5aa2f0, done: 0x6cc46c, muted: 0x4f5660 };
const CHANNELS = { app: "the app", website: "the website", discord: "Discord" };

const clip = (text, maximum) => (text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text);
const button = (custom_id, label, style = STYLE.secondary) => ({ type: BUTTON, style, label, custom_id });
const row = (...components) => ({ type: ROW, components });
const field = (name, value, inline = true) => (value ? { name, value: clip(String(value), 1024), inline } : null);

const fromLabel = (submission) => (submission.channel === "discord" && submission.reporter
  ? `Discord, from ${submission.reporter}`
  : CHANNELS[submission.channel] ?? submission.channel);

// A report as staff see it: its full text and device details, never its email.
const reportEmbed = (submission, { detailsMaximum = 3500, footer = "" } = {}) => {
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
    ].filter(Boolean),
    footer: { text: `Reference ${submission.submissionID.slice(0, 8)}${footer}` },
  };
};

// Submissions waiting for a decision.
export const submissionMessage = (submission) => {
  const isBug = submission.kind === "bug";
  const approve = isBug
    ? [button(`s:approve:investigating:${submission.submissionID}`, "Approve · Investigating", STYLE.success)]
    : [
        button(`s:approve:considering:${submission.submissionID}`, "Approve · Considering", STYLE.success),
        button(`s:approve:planned:${submission.submissionID}`, "Approve · Planned", STYLE.primary),
      ];
  const rows = [row(
    ...approve,
    button(`s:private:${submission.submissionID}`, "Keep private"),
    button(`s:merge:${submission.submissionID}`, "Merge into…"),
    button(`s:discard:${submission.submissionID}`, "Discard", STYLE.danger),
  )];
  if (submission.contact) rows.push(row(button(`s:contact:${submission.submissionID}`, "Show email")));
  return {
    embeds: [reportEmbed(submission, { footer: submission.contact ? " · email provided" : "" })],
    components: rows,
    allowed_mentions: { parse: [] },
  };
};

// A submission that has been triaged. When it became (or joined) an item, the report is kept
// and a button reopens it privately.
export const closedSubmissionMessage = (submission, outcome, { keepsReport = false } = {}) => ({
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

// The original reports behind an item, shown only to the person who asked. Discord allows 6,000
// characters across a message's embeds, so it shows the latest five and clips long text evenly.
export const reportsMessage = (item, reports) => {
  if (!reports.length) {
    return { content: `${item.id} has no original report (it was added directly, or its report was deleted).`, allowed_mentions: { parse: [] } };
  }
  const shown = reports.slice(-5);
  const detailsMaximum = Math.min(3500, Math.floor(3000 / shown.length));
  const date = (report) => new Date(report.createdAtEpochMilliseconds).toISOString().slice(0, 10);
  const more = reports.length > shown.length ? ` Showing the latest ${shown.length} of ${reports.length}; Cedar Tracker lists them all.` : "";
  return {
    content: `Original report${reports.length === 1 ? "" : "s"} for **${item.id}** ${clip(item.title, 120)}.${more}`,
    embeds: shown.map((report) => reportEmbed(report, {
      detailsMaximum,
      footer: ` · ${report.state === "merged" ? "merged in" : "accepted"} · sent ${date(report)}`,
    })),
    allowed_mentions: { parse: [] },
  };
};

// The live control panel for an item: status buttons move it along the roadmap.
export const itemMessage = (item) => {
  const statuses = STATUSES[item.kind].filter((status) => status.id !== "new" && status.id !== item.status);
  const published = isPublished(item);
  const done = CLOSED_STATUSES.includes(item.status);
  const label = (status) => (status.public ? status.label : `${status.label} (hides it)`);
  const style = (status) => (["shipped", "fixed"].includes(status.id) ? STYLE.success : status.public ? STYLE.primary : STYLE.danger);
  return {
    embeds: [{
      author: { name: `${item.id} · ${item.kind === "bug" ? "Bug" : "Feature"}` },
      title: clip(item.title, 256),
      url: published ? ROADMAP_URL : undefined,
      description: [item.summary || "_No public summary yet._", item.description].filter(Boolean).map((text) => clip(text, 1900)).join("\n\n"),
      color: done ? (["shipped", "fixed"].includes(item.status) ? COLORS.done : COLORS.muted) : item.kind === "bug" ? COLORS.bug : COLORS.feature,
      fields: [
        field("Status", statusInfo(item.kind, item.status)?.label ?? item.status),
        field("Roadmap", published ? "Shown" : item.public ? "Hidden (private status)" : "Hidden"),
        field("Platforms", item.platforms.map((platform) => PLATFORMS[platform]).join(", ") || "—"),
        field("Requests", item.requests > 0 ? String(item.requests) : null),
        field("Shipped in", ["shipped", "fixed"].includes(item.status) ? item.shippedIn : null),
      ].filter(Boolean),
      footer: { text: `Updated ${item.updated}` },
    }],
    components: [
      row(...statuses.map((status) => button(`i:status:${status.id}:${item.id}`, label(status), style(status)))),
      row(
        button(`i:edit:${item.id}`, "Edit wording"),
        button(`i:reports:${item.id}`, "Original reports"),
        button(`i:visibility:${item.id}`, item.public ? "Hide from roadmap" : "Show on roadmap", item.public ? STYLE.secondary : STYLE.success),
        { type: BUTTON, style: STYLE.link, label: "Open roadmap", url: ROADMAP_URL },
      ),
    ],
    allowed_mentions: { parse: [] },
  };
};

// Posted in the original forum thread when an item from Discord ships or is fixed.
export const shippedNotice = (item) => ({
  content: item.status === "fixed"
    ? `Fixed${item.shippedIn ? ` in ${item.shippedIn}` : ""}. Thanks for reporting it! ${ROADMAP_URL}`
    : `This shipped${item.shippedIn ? ` in ${item.shippedIn}` : ""}. Thanks for the request! ${ROADMAP_URL}`,
  allowed_mentions: { parse: [] },
});

// Forum tag names from server-config.yaml that mirror tracker statuses.
export const FORUM_TAGS = Object.freeze({
  planned: "Planned",
  "in-progress": "Planned",
  shipped: "Shipped",
  declined: "Not planned",
  fixed: "Fixed",
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
    setTags: (channelID, tagIDs) => call("PATCH", `/channels/${channelID}`, { applied_tags: tagIDs }),
  };
};
