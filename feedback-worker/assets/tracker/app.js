// Cedar Tracker, served by the cedar-feedback Worker. It talks only to the Worker's own /v1 API,
// signed in with the cookie /tracker in Discord hands out. Everything is rendered with
// textContent, so report text can never become markup.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  view: "bug",
  tickets: [],
  items: [],
  inbox: [],
  vocabulary: null,
  selectedTicket: null,
  detail: null,
  selectedEntry: null,
  releases: null,
};

const ERRORS = {
  already_triaged: "Someone already handled this report.",
  ticket_not_found: "That ticket doesn’t exist.",
  item_not_found: "That roadmap entry doesn’t exist.",
  ticket_is_duplicate: "That ticket is closed as a duplicate.",
  same_ticket: "A ticket can’t be merged into itself.",
  no_way_to_reach: "This report came without an email or a Discord post.",
  question_required: "Write the question to ask.",
  invalid_build: "Give the build its tickets name, like 70.",
  rate_limited: "Too many requests. Wait a minute and try again.",
};

let signedOut = false;
const showSignedOut = () => {
  signedOut = true;
  $("[data-shell]").hidden = true;
  $("[data-signed-out]").hidden = false;
};

const api = async (path, { method = "GET", body } = {}) => {
  const response = await fetch(`/v1${path}`, {
    method,
    credentials: "same-origin",
    headers: { "X-Cedar-Tracker": "1", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) {
    showSignedOut();
    throw new Error("Signed out");
  }
  if (!response.ok) throw new Error(result.message || ERRORS[result.error] || `Request failed (${result.error ?? response.status})`);
  return result;
};

const node = (tag, attributes = {}, ...children) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value == null || value === false) continue;
    if (key === "class") element.className = value;
    else if (key === "dataset") Object.assign(element.dataset, value);
    else if (key.startsWith("on")) element.addEventListener(key.slice(2), value);
    else element.setAttribute(key, value === true ? "" : value);
  }
  element.append(...children.flat().filter((child) => child != null && child !== false));
  return element;
};

const option = (value, label, selected) => node("option", { value, selected: selected ? true : null }, label);
const formatDate = (milliseconds) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(milliseconds));
const shortDate = (milliseconds) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(milliseconds));
const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
const capitalized = (text) => text[0].toUpperCase() + text.slice(1);

const ticketStatuses = (kind) => state.vocabulary.tickets.statuses[kind];
const ticketStatus = (ticket) => ticketStatuses(ticket.kind).find((status) => status.id === ticket.status);
const isClosed = (ticket) => Boolean(ticketStatus(ticket)?.closed);
const entryStatus = (item) => state.vocabulary.statuses[item.kind].find((status) => status.id === item.status);
const isPublished = (item) => item.public && entryStatus(item)?.public;
const fieldLabel = (kind, key) => {
  const label = state.vocabulary.tickets.fields[key]?.label ?? key;
  return typeof label === "string" ? label : label[kind];
};
const findTicket = (id) => state.tickets.find((ticket) => ticket.id === id);
const findEntry = (id) => state.items.find((item) => item.id === id);
const discordURL = (ticket) => (ticket.discordGuildID && ticket.discordThreadID ? `https://discord.com/channels/${ticket.discordGuildID}/${ticket.discordThreadID}` : null);
const fromLabel = (submission) => (submission.channel === "discord"
  ? `Discord${submission.reporter ? `, from ${submission.reporter}` : ""}`
  : { app: "the app", website: "the website" }[submission.channel] ?? submission.channel);

const STOP_WORDS = new Set(["the", "and", "for", "when", "with", "not", "can", "cedar", "app", "does", "doesn", "from", "this", "that", "into", "after"]);
const words = (text) => new Set((text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((word) => !STOP_WORDS.has(word)));
const similarity = (left, right) => {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / Math.sqrt(a.size * b.size);
};

const banner = (text) => {
  const element = $("[data-banner]");
  element.textContent = text ?? "";
  element.hidden = !text;
};

// Loading and navigation

const loadAll = async () => {
  const [tickets, items, inbox] = await Promise.all([api("/tickets"), api("/items"), api("/inbox")]);
  state.tickets = tickets.tickets;
  state.vocabulary = tickets.vocabulary;
  state.items = items.items;
  state.inbox = inbox.submissions;
  refreshCounts();
};

const refreshCounts = () => {
  for (const kind of ["bug", "feature"]) {
    $(`[data-count='${kind}']`).textContent = state.tickets.filter((ticket) => ticket.kind === kind && !isClosed(ticket)).length || "";
  }
  $("[data-count='inbox']").textContent = state.inbox.length || "";
  $("[data-count='roadmap']").textContent = state.items.filter(isPublished).length || "";
};

const show = (view) => {
  state.view = view;
  $$("[data-view]").forEach((button) => button.setAttribute("aria-current", button.dataset.view === view ? "page" : "false"));
  $("[data-panel='tickets']").hidden = !["bug", "feature"].includes(view);
  for (const panel of ["inbox", "roadmap", "settings"]) $(`[data-panel='${panel}']`).hidden = view !== panel;
  if (view === "bug" || view === "feature") {
    if (state.selectedTicket && findTicket(state.selectedTicket)?.kind !== view) closeTicket();
    renderTicketFilters();
    renderTicketList();
  }
  if (view === "inbox") renderInbox();
  if (view === "roadmap") renderEntryList();
};

const VIEWS = { inbox: "inbox", bugs: "bug", features: "feature", roadmap: "roadmap", settings: "settings" };

const route = async () => {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (/^(BUG|FR)-\d+$/.test(hash)) {
    show(hash.startsWith("BUG") ? "bug" : "feature");
    await openTicket(hash);
  } else if (/^CDR-\d+$/.test(hash)) {
    show("roadmap");
    openEntry(hash);
  } else {
    show(VIEWS[hash] ?? state.view);
  }
};

const go = (hash) => {
  if (location.hash === `#${hash}`) route();
  else location.hash = hash;
};

for (const button of $$("[data-view]")) {
  button.addEventListener("click", () => go(Object.entries(VIEWS).find(([, view]) => view === button.dataset.view)[0]));
}
window.addEventListener("hashchange", route);

// Tickets: list

const renderTicketFilters = () => {
  const kind = state.view;
  $("[data-tickets-title]").textContent = kind === "bug" ? "Bugs" : "Feature requests";
  const statusSelect = $("[data-filter='status']");
  const previous = statusSelect.dataset.kind === kind ? statusSelect.value : "open";
  statusSelect.dataset.kind = kind;
  statusSelect.replaceChildren(
    option("open", "Open", previous === "open"),
    option("all", "All statuses", previous === "all"),
    ...ticketStatuses(kind).map((status) => option(status.id, status.label, previous === status.id)),
  );
  const platformSelect = $("[data-filter='platform']");
  if (!platformSelect.options.length) {
    platformSelect.append(option("", "All platforms"), ...Object.entries(state.vocabulary.platforms).map(([id, label]) => option(id, label)));
  }
};

const priorityRank = { urgent: 0, high: 1, normal: 2, low: 3 };

const renderTicketList = () => {
  const kind = state.view;
  const query = $("[data-filter='query']").value.trim().toLowerCase();
  const status = $("[data-filter='status']").value;
  const platform = $("[data-filter='platform']").value;
  const tickets = state.tickets
    .filter((ticket) => ticket.kind === kind)
    .filter((ticket) => status === "all" || (status === "open" ? !isClosed(ticket) : ticket.status === status))
    .filter((ticket) => !platform || ticket.platforms.includes(platform))
    .filter((ticket) => !query || [ticket.id, ticket.title, ticket.summary, ticket.steps, ticket.notes, ticket.decision].join(" ").toLowerCase().includes(query))
    .sort((left, right) => (priorityRank[left.priority] - priorityRank[right.priority]) || right.updatedAtEpochMilliseconds - left.updatedAtEpochMilliseconds);
  const list = $("[data-ticket-list]");
  list.replaceChildren(...tickets.map((ticket) => node("button", {
    type: "button",
    role: "listitem",
    class: `row${ticket.id === state.selectedTicket ? " selected" : ""}`,
    onclick: () => go(ticket.id),
  },
  node("span", { class: "row-top" },
    node("span", { class: "item-id" }, ticket.id),
    node("span", { class: `status status-${ticket.status}` }, ticketStatus(ticket)?.label ?? ticket.status),
    ticket.priority !== "normal" ? node("span", { class: `priority priority-${ticket.priority}` }, ticket.priority) : null,
    ticket.roadmapID ? node("span", { class: "roadmap-dot", title: "On the roadmap" }, ticket.roadmapID) : null),
  node("strong", {}, ticket.title),
  node("span", { class: "row-meta" }, [
    ticket.platforms.map((id) => state.vocabulary.platforms[id]).join(", ") || "No platform",
    ticket.reports ? plural(ticket.reports, "report") : null,
    `updated ${shortDate(ticket.updatedAtEpochMilliseconds)}`,
  ].filter(Boolean).join(" · ")))));
  if (!tickets.length) {
    list.append(node("p", { class: "placeholder" }, state.tickets.some((ticket) => ticket.kind === kind)
      ? "Nothing matches these filters."
      : `No ${kind === "bug" ? "bugs" : "feature requests"} yet. Open one from the Inbox, or press New.`));
  }
};

for (const filter of $$("[data-filter]")) filter.addEventListener("input", renderTicketList);

// Tickets: editor

const editor = $("[data-ticket-editor]");

const closeTicket = () => {
  state.selectedTicket = null;
  state.detail = null;
  editor.hidden = true;
  $("[data-ticket-placeholder]").hidden = false;
};

const textFields = (kind) => Object.entries(state.vocabulary.tickets.fields)
  .filter(([key, spec]) => !spec.line && (!spec.kinds || spec.kinds.includes(kind)));
const lineFields = (kind) => Object.entries(state.vocabulary.tickets.fields)
  .filter(([key, spec]) => spec.line && key !== "title" && (!spec.kinds || spec.kinds.includes(kind)));

const platformChips = (selected) => node("fieldset", { class: "field platforms" }, node("legend", {}, "Platforms"),
  node("div", {}, Object.entries(state.vocabulary.platforms).map(([value, label]) => node("label", { class: "chip" },
    node("input", { type: "checkbox", name: "platforms", value, checked: selected.includes(value) ? true : null }), label))));

const ticketFormValues = (form, kind) => {
  const values = {
    title: form.elements.title.value,
    status: form.elements.status.value,
    priority: form.elements.priority.value,
    platforms: $$("input[name='platforms']:checked", form).map((input) => input.value),
  };
  for (const [key] of [...textFields(kind), ...lineFields(kind)]) if (form.elements[key]) values[key] = form.elements[key].value;
  return values;
};

const ICONS = { status: "🔀", edit: "✏️", note: "📝", roadmap: "🗺️", merged: "🔗", report: "📎", reply: "💬", asked: "❓", created: "🆕" };

const timeline = (detail) => {
  const entries = [
    ...detail.events.map((event) => ({ at: event.atEpochMilliseconds, icon: ICONS[event.type] ?? "•", actor: event.actor, body: event.body, kind: event.type })),
    ...detail.discussion.map((message) => ({
      at: message.atEpochMilliseconds, icon: "🗨️", actor: `${message.author} in Discord`, kind: "discussion",
      body: [message.body, ...message.attachments].filter(Boolean).join("\n"),
    })),
  ].sort((left, right) => left.at - right.at);
  return node("ol", { class: "timeline" }, entries.map((entry) => node("li", { class: entry.kind === "discussion" ? "discussion" : null },
    node("span", { class: "icon", "aria-hidden": "true" }, entry.icon),
    node("div", {},
      node("div", { class: "body" }, entry.body),
      node("div", { class: "meta" }, [entry.actor, formatDate(entry.at)].filter(Boolean).join(" · "))))));
};

const reportCard = (report) => node("article", { class: "submission" },
  node("div", { class: "row-top" },
    node("span", { class: `kind kind-${report.kind}` }, report.state === "merged" ? "Attached" : "Original report"),
    node("span", { class: "row-meta" }, `${state.vocabulary.platforms[report.platform] ?? report.platform} · ${fromLabel(report)} · ${formatDate(report.createdAtEpochMilliseconds)}`)),
  node("h3", {}, report.title),
  node("p", { class: "details" }, report.details),
  node("p", { class: "row-meta" }, [
    report.appVersion && `Version ${report.appVersion}`,
    report.osVersion,
    report.deviceModel,
    `Reference ${report.submissionID.slice(0, 8)}`,
  ].filter(Boolean).join(" · ")));

const roadmapSection = (ticket, entry) => {
  const section = node("section", { class: "section" }, node("h2", {}, "Roadmap"));
  if (entry) {
    section.append(
      node("p", {}, node("button", { type: "button", class: "row", onclick: () => go(entry.id) },
        node("span", { class: "row-top" },
          node("span", { class: "item-id" }, entry.id),
          node("span", { class: `status status-${entry.status}` }, entryStatus(entry)?.label ?? entry.status),
          isPublished(entry) ? node("span", { class: "public-dot" }, "Public") : node("span", { class: "status" }, "Hidden")),
        node("strong", {}, entry.title),
        node("span", { class: "row-meta" }, entry.statusMode === "follow" ? "Status follows its tickets" : "Status set by hand"))),
      node("div", { class: "editor-actions" }, node("button", { type: "button", onclick: () => ticketAction(() => api(`/tickets/${ticket.id}/roadmap`, { method: "DELETE" })) }, "Remove from roadmap")),
    );
    return section;
  }
  const form = node("div", { class: "inline-form", hidden: true },
    node("label", { class: "field" }, node("span", {}, "Public title"), node("input", { name: "rmTitle", maxlength: "120" })),
    node("label", { class: "field" }, node("span", {}, "Public summary ", node("small", {}, "Shown under the title. Write it fresh; don’t paste the report.")), node("textarea", { name: "rmSummary", rows: "2", maxlength: "600" })),
    node("div", { class: "editor-actions" },
      node("button", { type: "button", class: "primary", onclick: () => ticketAction(() => api(`/tickets/${ticket.id}/roadmap`, {
        method: "POST", body: { create: { title: $("[name='rmTitle']", form).value, summary: $("[name='rmSummary']", form).value } },
      })) }, "Add to roadmap")));
  const open = state.items.filter((item) => !["shipped", "fixed", "declined", "wont-fix"].includes(item.status));
  section.append(
    node("p", { class: "hint" }, "Not on the public roadmap. A new entry follows this ticket’s status; you write its public wording."),
    node("div", { class: "editor-actions" },
      node("button", { type: "button", onclick: () => { form.hidden = false; $("[name='rmTitle']", form).focus(); } }, "New roadmap entry…"),
      open.length ? node("button", { type: "button", onclick: () => openPicker("Join a roadmap entry", open.map((item) => ({
        id: item.id, label: item.title, meta: `${item.kind === "bug" ? "Known issue" : "Feature"} · ${entryStatus(item)?.label}`,
      })), (entryID) => ticketAction(() => api(`/tickets/${ticket.id}/roadmap`, { method: "POST", body: { entryID } }))) }, "Join an existing entry…") : null),
    form,
  );
  return section;
};

// Runs a change to the open ticket, then reloads it and the lists.
const ticketAction = async (work) => {
  const error = $("[data-ticket-error]", editor);
  try {
    await work();
    await loadAll();
    await openTicket(state.selectedTicket);
  } catch (failure) {
    if (error) error.textContent = failure.message;
  }
};

const renderTicket = (ticket, detail) => {
  const kind = ticket?.kind ?? state.view;
  const statusSelect = node("select", { name: "status" }, ticketStatuses(kind).map((status) => option(status.id, status.label, status.id === (ticket?.status ?? "new"))));
  const prioritySelect = node("select", { name: "priority" }, state.vocabulary.priorities.map((priority) => option(priority, capitalized(priority), priority === (ticket?.priority ?? "normal"))));
  const thread = ticket ? discordURL(ticket) : null;
  editor.replaceChildren(
    node("div", { class: "editor-head" },
      node("span", { class: "item-id" }, ticket?.id ?? `New ${kind === "bug" ? "bug" : "feature request"}`),
      thread ? node("a", { class: "button", href: thread, target: "_blank", rel: "noopener" }, "Open thread in Discord") : null),
    node("label", { class: "field" }, node("span", {}, "Title"), node("input", { name: "title", maxlength: "120", required: true, value: ticket?.title ?? "" })),
    node("div", { class: "field-row" },
      node("label", { class: "field" }, node("span", {}, "Status"), statusSelect),
      node("label", { class: "field" }, node("span", {}, "Priority"), prioritySelect)),
    platformChips(ticket?.platforms ?? []),
    ...textFields(kind).map(([key, spec]) => node("label", { class: "field" },
      node("span", {}, fieldLabel(kind, key)),
      node("textarea", { name: key, rows: key === "notes" ? "6" : "3", maxlength: String(spec.maximum) }, ticket?.[key] ?? ""))),
    node("div", { class: "field-row" }, lineFields(kind).map(([key, spec]) => node("label", { class: "field" },
      node("span", {}, fieldLabel(kind, key)),
      node("input", { name: key, maxlength: String(spec.maximum), value: ticket?.[key] ?? "" })))),
    ticket ? node("p", { class: "editor-meta" }, `Opened ${formatDate(ticket.createdAtEpochMilliseconds)} · Updated ${formatDate(ticket.updatedAtEpochMilliseconds)}${ticket.duplicateOf ? ` · Duplicate of ${ticket.duplicateOf}` : ""}`) : null,
    node("p", { class: "error", role: "alert", dataset: { ticketError: "" } }),
    node("div", { class: "editor-actions" },
      node("button", { type: "submit", class: "primary" }, ticket ? "Save" : "Open ticket"),
      node("button", { type: "button", onclick: () => go(kind === "bug" ? "bugs" : "features") }, "Close"),
      ticket && ticket.status !== "duplicate" ? node("button", { type: "button", onclick: () => mergeTicket(ticket) }, "Merge into…") : null,
      ticket ? node("button", { type: "button", class: "danger", onclick: () => deleteTicket(ticket) }, "Delete") : null),
  );
  if (ticket && detail) {
    editor.append(
      roadmapSection(ticket, detail.entry),
      node("section", { class: "section reports" }, node("h2", {}, `Reports (${detail.reports.length})`),
        detail.reports.length ? detail.reports.map(reportCard) : node("p", { class: "placeholder" }, "None. This ticket was opened directly.")),
      node("section", { class: "section" }, node("h2", {}, "Timeline"),
        detail.discussionError ? node("p", { class: "error" }, `Couldn’t read the Discord thread: ${detail.discussionError}`) : null,
        timeline(detail),
        node("div", { class: "inline-form" },
          node("label", { class: "field" }, node("span", {}, "Add a note ", node("small", {}, "Also posted in the ticket’s Discord thread.")), node("textarea", { name: "note", rows: "2", maxlength: "4000" })),
          node("div", { class: "editor-actions" }, node("button", { type: "button", onclick: () => {
            const text = editor.elements.note.value;
            if (text.trim()) ticketAction(() => api(`/tickets/${ticket.id}/notes`, { method: "POST", body: { text } }));
          } }, "Add note")))),
    );
  }
  editor.hidden = false;
  $("[data-ticket-placeholder]").hidden = true;
};

const openTicket = async (id) => {
  state.selectedTicket = id;
  const ticket = findTicket(id);
  if (!ticket) {
    closeTicket();
    banner(`${id} doesn’t exist.`);
    return;
  }
  banner(null);
  renderTicketList();
  renderTicket(ticket, state.detail?.ticket.id === id ? state.detail : null);
  try {
    const detail = await api(`/tickets/${id}`);
    if (state.selectedTicket !== id) return;
    state.detail = detail;
    renderTicket(detail.ticket, detail);
  } catch (error) {
    if (!signedOut) $("[data-ticket-error]", editor).textContent = error.message;
  }
};

editor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const existing = state.selectedTicket ? findTicket(state.selectedTicket) : null;
  const kind = existing?.kind ?? state.view;
  const values = ticketFormValues(editor, kind);
  try {
    if (existing) {
      const changed = Object.fromEntries(Object.entries(values).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(existing[key])));
      if (Object.keys(changed).length) await api(`/tickets/${existing.id}`, { method: "PUT", body: changed });
      await loadAll();
      await openTicket(existing.id);
    } else {
      const { ticket } = await api("/tickets", { method: "POST", body: { kind, ...values } });
      await loadAll();
      go(ticket.id);
    }
  } catch (error) {
    $("[data-ticket-error]", editor).textContent = error.message;
  }
});

$("[data-action='new-ticket']").addEventListener("click", () => {
  state.selectedTicket = null;
  state.detail = null;
  renderTicketList();
  renderTicket(null, null);
  editor.elements.title.focus();
});

const mergeTicket = (ticket) => openPicker(`Merge ${ticket.id} into…`, state.tickets
  .filter((candidate) => candidate.id !== ticket.id && candidate.status !== "duplicate")
  .sort((left, right) => similarity(ticket.title, right.title) - similarity(ticket.title, left.title))
  .map((candidate) => ({ id: candidate.id, label: candidate.title, meta: ticketStatus(candidate)?.label })),
(into) => {
  if (!confirm(`Close ${ticket.id} as a duplicate of ${into}? Its reports and timeline move to ${into}.`)) return;
  ticketAction(async () => {
    await api(`/tickets/${ticket.id}/merge`, { method: "POST", body: { into } });
    state.selectedTicket = into;
    history.replaceState(null, "", `#${into}`);
  });
});

const deleteTicket = async (ticket) => {
  if (!confirm(`Delete ${ticket.id} “${ticket.title}”? Its timeline is deleted and its reports are removed after 30 days. Closing it is usually better.`)) return;
  try {
    await api(`/tickets/${ticket.id}`, { method: "DELETE" });
    await loadAll();
    go(ticket.kind === "bug" ? "bugs" : "features");
  } catch (error) {
    $("[data-ticket-error]", editor).textContent = error.message;
  }
};

// Picker dialog

const pickDialog = $("[data-pick-dialog]");
const openPicker = (title, choices, onPick) => {
  const query = $("[data-pick-query]");
  $("[data-pick-title]").textContent = title;
  const render = () => {
    const text = query.value.trim().toLowerCase();
    const matches = choices.filter((choice) => !text || `${choice.id} ${choice.label}`.toLowerCase().includes(text)).slice(0, 40);
    $("[data-pick-list]").replaceChildren(...matches.map((choice) => node("button", {
      type: "button",
      class: "row",
      onclick: () => {
        pickDialog.close();
        onPick(choice.id);
      },
    }, node("span", { class: "row-top" }, node("span", { class: "item-id" }, choice.id), choice.meta ? node("span", { class: "row-meta" }, choice.meta) : null), node("strong", {}, choice.label))));
    if (!matches.length) $("[data-pick-list]").append(node("p", { class: "placeholder" }, "Nothing matches."));
  };
  query.value = "";
  query.oninput = render;
  render();
  pickDialog.showModal();
};

// Inbox

const triage = async (submission, action, body = {}) => {
  try {
    const result = await api(`/inbox/${submission.submissionID}/${action}`, { method: "POST", body });
    await loadAll();
    renderInbox();
    return result;
  } catch (error) {
    $("[data-inbox-error]").textContent = error.message;
    return null;
  }
};

const askReporter = async (submission) => {
  let question = "";
  if (submission.sourceChannelID) {
    question = prompt(`Question to post in ${submission.reporter ? `${submission.reporter}’s` : "the"} Discord thread:`) ?? "";
    if (!question.trim()) return;
  }
  const result = await triage(submission, "ask", { question });
  if (result?.via === "email") alert(`Email them at ${result.contact}. The report stays in the inbox, marked as waiting, and keeps the address until you triage it.`);
};

const attachTo = (submission) => {
  const text = `${submission.title} ${submission.details}`;
  openPicker("Attach to a ticket", state.tickets
    .filter((ticket) => ticket.status !== "duplicate")
    .map((ticket) => ({ ticket, score: similarity(text, `${ticket.title} ${ticket.summary}`) - (isClosed(ticket) ? 0.2 : 0) }))
    .sort((left, right) => right.score - left.score || right.ticket.updatedAtEpochMilliseconds - left.ticket.updatedAtEpochMilliseconds)
    .map(({ ticket }) => ({ id: ticket.id, label: ticket.title, meta: `${ticketStatus(ticket)?.label} · ${plural(ticket.reports, "report")}` })),
  async (ticketID) => {
    if (await triage(submission, "attach", { ticketID })) go(ticketID);
  });
};

const renderInbox = () => {
  const container = $("[data-inbox]");
  $("[data-inbox-error]").textContent = "";
  container.replaceChildren(...state.inbox.map((submission) => {
    const canAsk = Boolean(submission.sourceChannelID || submission.contact);
    return node("article", { class: "submission" },
      node("div", { class: "row-top" },
        node("span", { class: `kind kind-${submission.kind}` }, submission.kind === "bug" ? "Bug report" : "Feature request"),
        submission.needsInfoAtEpochMilliseconds ? node("span", { class: "waiting" }, `Waiting since ${shortDate(submission.needsInfoAtEpochMilliseconds)}`) : null,
        node("span", { class: "row-meta" }, `${state.vocabulary.platforms[submission.platform] ?? submission.platform} · ${fromLabel(submission)} · ${formatDate(submission.createdAtEpochMilliseconds)}`)),
      node("h2", {}, submission.title),
      node("p", { class: "details" }, submission.details),
      node("p", { class: "row-meta" }, [
        submission.appVersion && `Version ${submission.appVersion}`,
        submission.osVersion,
        submission.deviceModel,
        submission.contact && `Email: ${submission.contact}`,
      ].filter(Boolean).join(" · ")),
      submission.events.length ? node("ul", { class: "events" }, submission.events.map((event) => node("li", {},
        `${ICONS[event.type] ?? "•"} ${event.actor ? `${event.actor}: ` : ""}${event.body} (${formatDate(event.atEpochMilliseconds)})`))) : null,
      node("div", { class: "editor-actions" },
        node("button", { type: "button", class: submission.kind === "bug" ? "primary" : null, onclick: async () => {
          const result = await triage(submission, "ticket", { kind: "bug" });
          if (result) go(result.ticket.id);
        } }, "New bug"),
        node("button", { type: "button", class: submission.kind === "feature" ? "primary" : null, onclick: async () => {
          const result = await triage(submission, "ticket", { kind: "feature" });
          if (result) go(result.ticket.id);
        } }, "New feature"),
        node("button", { type: "button", onclick: () => attachTo(submission), disabled: state.tickets.length ? null : true }, "Attach to…"),
        node("button", { type: "button", onclick: () => askReporter(submission), disabled: canAsk ? null : true, title: canAsk ? null : "No email or Discord post to reply to" }, "Needs info"),
        node("button", { type: "button", class: "danger", onclick: () => {
          if (confirm("Discard this report? It’s deleted from the feedback service after 30 days.")) triage(submission, "discard");
        } }, "Discard")));
  }));
  if (!state.inbox.length) container.append(node("p", { class: "placeholder" }, "Inbox zero. New reports show up here and in Discord’s triage channel."));
};

$("[data-action='refresh-inbox']").addEventListener("click", async () => {
  await loadAll();
  renderInbox();
});

// Roadmap entries

const entryEditor = $("[data-entry-editor]");

const renderEntryList = () => {
  const list = $("[data-entry-list]");
  list.replaceChildren(...[...state.items].sort((left, right) => right.updated.localeCompare(left.updated)).map((item) => node("button", {
    type: "button",
    role: "listitem",
    class: `row${item.id === state.selectedEntry ? " selected" : ""}`,
    onclick: () => go(item.id),
  },
  node("span", { class: "row-top" },
    node("span", { class: "item-id" }, item.id),
    node("span", { class: `status status-${item.status}` }, entryStatus(item)?.label ?? item.status),
    isPublished(item) ? node("span", { class: "public-dot" }, "Public") : node("span", { class: "status" }, "Hidden"),
    item.statusMode === "follow" ? node("span", { class: "row-meta" }, "follows tickets") : null),
  node("strong", {}, item.title),
  node("span", { class: "row-meta" }, [
    item.kind === "bug" ? "Known issue" : "Feature",
    item.requests ? plural(item.requests, "request") : null,
    `updated ${item.updated}`,
  ].filter(Boolean).join(" · ")))));
  if (!state.items.length) list.append(node("p", { class: "placeholder" }, "Nothing on the roadmap. Add a ticket from its Roadmap section, or press New entry."));
};

const openEntry = (id) => {
  state.selectedEntry = id;
  const item = id ? findEntry(id) : null;
  if (id && !item) {
    banner(`${id} doesn’t exist.`);
    return;
  }
  banner(null);
  renderEntryList();
  renderEntry(item);
};

const renderEntry = (item, newKind = "feature") => {
  const kind = item?.kind ?? newKind;
  const linked = item ? state.tickets.filter((ticket) => ticket.roadmapID === item.id) : [];
  const statusSelect = node("select", { name: "status" }, state.vocabulary.statuses[kind].map((status) => option(status.id, `${status.label}${status.public ? "" : " (hidden)"}`, status.id === (item?.status ?? (kind === "bug" ? "investigating" : "considering")))));
  const modeSelect = node("select", { name: "statusMode" },
    option("follow", "Follows its tickets", (item?.statusMode ?? "manual") === "follow"),
    option("manual", "Set by hand", (item?.statusMode ?? "manual") === "manual"));
  const syncMode = () => { statusSelect.disabled = modeSelect.value === "follow" && linked.length > 0; };
  modeSelect.addEventListener("change", syncMode);
  entryEditor.replaceChildren(
    node("div", { class: "editor-head" },
      node("span", { class: "item-id" }, item?.id ?? "New roadmap entry"),
      node("span", { class: `public-pill${item && isPublished(item) ? " on" : ""}` }, item ? (isPublished(item) ? "On the roadmap" : "Hidden") : "")),
    item ? null : node("label", { class: "field" }, node("span", {}, "Kind"), node("select", { name: "kind", onchange: (event) => renderEntry(null, event.target.value) },
      option("feature", "Feature", kind === "feature"), option("bug", "Known issue", kind === "bug"))),
    node("label", { class: "field" }, node("span", {}, "Public title"), node("input", { name: "title", maxlength: "120", value: item?.title ?? "" })),
    node("label", { class: "field" }, node("span", {}, "Public summary ", node("small", {}, "Shown under the title on the website")), node("textarea", { name: "summary", rows: "2", maxlength: "600" }, item?.summary ?? "")),
    node("label", { class: "field" }, node("span", {}, "Public details ", node("small", {}, "Shown when someone opens the entry. Write it fresh; don’t paste the report.")), node("textarea", { name: "description", rows: "4", maxlength: "2000" }, item?.description ?? "")),
    node("label", { class: "toggle" }, node("input", { type: "checkbox", name: "public", checked: (item ? item.public : true) ? true : null }), node("span", {}, "Show on the public roadmap ", node("small", {}, "Only public statuses appear: Considering, Planned, In progress and Shipped features; Investigating, Fix in progress and Fixed known issues."))),
    node("div", { class: "field-row" },
      node("label", { class: "field" }, node("span", {}, "Status comes from"), modeSelect),
      node("label", { class: "field" }, node("span", {}, "Status"), statusSelect)),
    platformChips(item?.platforms ?? []),
    node("div", { class: "field-row" },
      node("label", { class: "field" }, node("span", {}, "Shipped in"), node("input", { name: "shippedIn", maxlength: "40", value: item?.shippedIn ?? "", placeholder: "1.0.1 (70)" })),
      node("label", { class: "field" }, node("span", {}, "Release notes link"), node("input", { name: "releaseURL", maxlength: "300", value: item?.releaseURL ?? "" }))),
    node("label", { class: "field" }, node("span", {}, "Private notes ", node("small", {}, "Never published")), node("textarea", { name: "notes", rows: "3" }, item?.notes ?? "")),
    item ? node("section", { class: "section" }, node("h2", {}, `Tickets (${linked.length})`),
      linked.length
        ? linked.map((ticket) => node("button", { type: "button", class: "row", onclick: () => go(ticket.id) },
          node("span", { class: "row-top" }, node("span", { class: "item-id" }, ticket.id), node("span", { class: `status status-${ticket.status}` }, ticketStatus(ticket)?.label)),
          node("strong", {}, ticket.title)))
        : node("p", { class: "placeholder" }, "No tickets. Link one from a ticket’s Roadmap section; until then the status is set by hand.")) : null,
    item ? node("p", { class: "editor-meta" }, `Created ${item.created} · Updated ${item.updated}${item.requests ? ` · ${plural(item.requests, "request")}` : ""}`) : null,
    node("p", { class: "error", role: "alert", dataset: { entryError: "" } }),
    node("div", { class: "editor-actions" },
      node("button", { type: "submit", class: "primary" }, item ? "Save" : "Add entry"),
      node("button", { type: "button", onclick: () => go("roadmap") }, "Close"),
      item ? node("button", { type: "button", class: "danger", onclick: () => deleteEntry(item) }, "Delete") : null),
  );
  syncMode();
  entryEditor.hidden = false;
  $("[data-entry-placeholder]").hidden = true;
};

entryEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const elements = entryEditor.elements;
  const existing = state.selectedEntry ? findEntry(state.selectedEntry) : null;
  const body = {
    title: elements.title.value,
    summary: elements.summary.value,
    description: elements.description.value,
    public: elements.public.checked,
    statusMode: elements.statusMode.value,
    status: elements.status.value,
    platforms: $$("input[name='platforms']:checked", entryEditor).map((input) => input.value),
    shippedIn: elements.shippedIn.value,
    releaseURL: elements.releaseURL.value,
    notes: elements.notes.value,
  };
  // A following entry's status isn't the form's to set.
  if (existing && body.statusMode === "follow" && existing.statusMode === "follow") delete body.status;
  try {
    const { item } = existing
      ? await api(`/items/${existing.id}`, { method: "PUT", body })
      : await api("/items", { method: "POST", body: { kind: elements.kind.value, ...body } });
    await loadAll();
    go(item.id);
  } catch (error) {
    $("[data-entry-error]", entryEditor).textContent = error.message;
  }
});

const deleteEntry = async (item) => {
  if (!confirm(`Delete ${item.id} “${item.title}”? It leaves the website and its Discord panel; linked tickets stay.`)) return;
  try {
    await api(`/items/${item.id}`, { method: "DELETE" });
    await loadAll();
    state.selectedEntry = null;
    entryEditor.hidden = true;
    $("[data-entry-placeholder]").hidden = false;
    go("roadmap");
  } catch (error) {
    $("[data-entry-error]", entryEditor).textContent = error.message;
  }
};

$("[data-action='new-entry']").addEventListener("click", () => {
  state.selectedEntry = null;
  renderEntryList();
  renderEntry(null);
  entryEditor.elements.title.focus();
});

// Releasing a build

const releaseDialog = $("[data-release-dialog]");
const releaseForm = $("[data-release-form]");

const previewRelease = () => {
  const build = releaseForm.elements.build.value.trim();
  const waiting = state.tickets.filter((ticket) => build && ticket.fixedIn === build && ["fixed", "in-build", "verified"].includes(ticket.status));
  $("[data-release-preview]").textContent = build
    ? (waiting.length ? `Releases ${waiting.map((ticket) => ticket.id).join(", ")}.` : `No tickets are waiting in build ${build}.`)
    : "";
};

$("[data-action='release']").addEventListener("click", async () => {
  releaseForm.reset();
  $("[data-release-error]").textContent = "";
  previewRelease();
  releaseDialog.showModal();
  if (!state.releases) {
    state.releases = (await api("/releases").catch(() => ({ releases: [] }))).releases;
    $("[data-release-pick]").append(...state.releases.map((release, index) => option(String(index), release.label)));
  }
});

$("[data-release-pick]").addEventListener("change", (event) => {
  const release = state.releases?.[Number(event.target.value)];
  if (!release) return;
  releaseForm.elements.build.value = release.build;
  releaseForm.elements.version.value = release.version;
  releaseForm.elements.releaseURL.value = release.releaseURL;
  previewRelease();
});
releaseForm.elements.build.addEventListener("input", previewRelease);

releaseForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value !== "release") return;
  event.preventDefault();
  try {
    const { releasedIn, tickets } = await api("/releases", {
      method: "POST",
      body: { build: releaseForm.elements.build.value, version: releaseForm.elements.version.value, releaseURL: releaseForm.elements.releaseURL.value },
    });
    releaseDialog.close();
    await loadAll();
    banner(tickets.length ? `Released ${plural(tickets.length, "ticket")} in ${releasedIn}: ${tickets.map((ticket) => ticket.id).join(", ")}.` : `No tickets were waiting in that build.`);
    show(state.view);
  } catch (error) {
    $("[data-release-error]").textContent = error.message;
  }
});

// Settings

const settingsStatus = (text, failed = false) => {
  $("[data-settings-status]").textContent = failed ? "" : text;
  $("[data-settings-error]").textContent = failed ? text : "";
};

$("[data-action='export']").addEventListener("click", async () => {
  try {
    const backup = await api("/export");
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = node("a", { href: url, download: `cedar-tracker-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    settingsStatus(`Saved ${plural(backup.tickets.length, "ticket")} and ${plural(backup.entries.length, "roadmap entry")}.`);
  } catch (error) {
    settingsStatus(error.message, true);
  }
});

$("[data-action='refresh-panels']").addEventListener("click", async () => {
  try {
    const { entries, tickets, failed } = await api("/discord/refresh", { method: "POST" });
    settingsStatus(`Refreshed ${plural(tickets, "ticket panel")} and ${plural(entries, "roadmap panel")}.${failed.length ? ` Couldn’t refresh: ${failed.join("; ")}` : ""}`, failed.length > 0);
  } catch (error) {
    settingsStatus(error.message, true);
  }
});

$("[data-action='sign-out']").addEventListener("click", async () => {
  await fetch("/v1/session/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  showSignedOut();
});

try {
  await loadAll();
  $("[data-shell]").hidden = false;
  await route();
} catch (error) {
  if (!signedOut) {
    $("[data-shell]").hidden = false;
    banner(`Cedar Tracker couldn’t load: ${error.message}`);
  }
}
