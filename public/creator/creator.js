// Creator: the setup catalog, profile photos and source badges, all feeding one Home built in the
// Your Home tab (home-builder.mjs).
import { isBadgePackID, parseCart, setupOf, setupOptions, setupPlatforms, setupTags } from "./creator-model.mjs";
import { artworkURL, appURL, matchingOptions, avatarCategories, avatarOptions } from "./artwork-model.mjs";
import { home } from "./home-builder.mjs";

const $ = id => document.getElementById(id);
let setups = [];
let setupsByID = new Map();
let groupsByID = new Map();
let avatarsByPath = new Map();

// MARK: Small helpers

function element(tag, properties = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(properties)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("data-") || key.startsWith("aria-") || key === "role") node.setAttribute(key, value);
    else node[key] = value;
  }
  node.append(...children);
  return node;
}

function cover(url, alt = "") {
  // Catalog previews are limited to the hosts allowed by this page's Content-Security-Policy.
  const image = element("img", { alt, loading: "lazy", decoding: "async", referrerPolicy: "no-referrer" });
  image.src = url;
  image.addEventListener("error", () => image.replaceWith(placeholder(alt)), { once: true });
  return image;
}
const placeholder = label => element("span", { class: "cover-placeholder", "aria-hidden": "true", text: (label || "").slice(0, 1) });

let toastTimer;
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("is-visible"), 2600);
}

const plural = (count, word) => `${count} ${count === 1 ? word : /(?:ch|sh|s|x)$/.test(word) ? `${word}es` : `${word}s`}`;

// MARK: Picks on Your Home

function describe(entry) {
  if (entry.type === "setup") {
    const setup = setupsByID.get(entry.id);
    return setup && { title: setup.title, byline: byline(setup), detail: `Setup · ${plural(setup.groupCount, "group")} · ${plural(setup.branchCount, "branch")}`, covers: setup.covers };
  }
  const group = groupsByID.get(entry.id);
  const setup = setupsByID.get(setupOf(entry.id));
  return group && setup && { title: group.title, byline: byline(setup), detail: `Branch group from ${setup.title} · ${plural(group.branchCount, "branch")}`, covers: group.covers };
}
const knownItemIDs = () => new Set([...setupsByID.keys(), ...groupsByID.keys()]);

function add(entry) {
  const name = describe(entry)?.title || "This setup";
  const status = home.add(entry, name);
  const messages = {
    added: `${name} added to Your Home.`,
    replaced: `${name} replaced its groups on Your Home.`,
    included: `${name} is already part of a setup on Your Home.`,
    duplicate: `${name} is already on Your Home.`,
    full: "Your Home has as many setups as a link can carry. Remove one to add more.",
  };
  toast(messages[status]);
}

function addButton(entry, labels) {
  const state = home.pickState(entry);
  const button = element("button", { type: "button", class: `button ${state === "available" ? "button-primary" : "button-secondary"}` });
  button.textContent = state === "added" ? "On Your Home ✓" : state === "included" ? "Included in setup" : labels.add;
  button.disabled = state !== "available";
  button.addEventListener("click", () => add(entry));
  return button;
}

function renderHomeButton() {
  const count = home.counts().rows;
  $("home-button-count").textContent = String(count);
  $("home-button").setAttribute("aria-label", `Open Your Home, ${plural(count, "row")}`);
  $("home-button").classList.toggle("has-items", count > 0);
  $("home-tab-count").textContent = String(count);
  $("home-tab-count").hidden = count === 0;
}

// MARK: Setups

function renderSetupFilters() {
  $("setup-tag").replaceChildren(new Option("All categories", ""), ...setupTags(setups).map(tag => new Option(tag, tag)));
  $("setup-platform").replaceChildren(new Option("Everywhere", ""), ...setupPlatforms(setups).map(platform => new Option(platform, platform)));
}

/// "By Kaptain · Strand": who made it and the app it was made for.
const byline = setup => setup.credit?.platform && setup.credit.platform !== "Cedar"
  ? `By ${setup.creator} · ${setup.credit.platform}` : `By ${setup.creator}`;

function creditDetails(setup) {
  const credit = setup.credit || {};
  const made = credit.platform === "Cedar"
    ? element("p", {}, [
      "Curated by ", element("strong", { text: setup.creator }),
      ...(credit.via ? [`, via ${credit.via}`] : []),
      ", modified for Cedar.",
    ])
    : element("p", {}, [
      "Made by ", element("strong", { text: setup.creator }), ` for ${credit.platform}`,
      ...(credit.via ? [`, shared on ${credit.via}`] : []), ".",
    ]);
  const parts = [made];
  if (credit.sourceURL) {
    parts.push(element("p", {}, [element("a", {
      href: credit.sourceURL, target: "_blank", rel: "noopener noreferrer", text: "View the original ↗",
    })]));
  }
  if (credit.conversion) parts.push(element("p", { class: "setup-conversion", text: credit.conversion }));
  return parts;
}

function coverMosaic(covers, label) {
  const mosaic = element("div", { class: `cover-mosaic cover-count-${Math.min(covers.length, 4)}` });
  if (!covers.length) mosaic.append(placeholder(label));
  for (const url of covers.slice(0, 4)) mosaic.append(cover(url));
  return mosaic;
}

function renderSetups() {
  const options = setupOptions(setups, { query: $("setup-search").value, tag: $("setup-tag").value, platform: $("setup-platform").value, sort: $("setup-sort").value });
  $("setup-status").textContent = setups.length
    ? `${plural(options.length, "setup")}${$("setup-search").value || $("setup-tag").value || $("setup-platform").value ? " found" : ""}`
    : $("setup-status").textContent;
  $("setup-grid").replaceChildren(...options.map(setup => {
    const details = element("button", { type: "button", class: "button button-secondary", text: "View groups" });
    details.addEventListener("click", () => openSetup(setup.id));
    const title = element("button", { type: "button", class: "setup-title-button", text: setup.title });
    title.addEventListener("click", () => openSetup(setup.id));
    return element("article", { class: "setup-card" }, [
      coverMosaic(setup.covers, setup.title),
      element("div", { class: "setup-body" }, [
        element("p", { class: "setup-creator", text: byline(setup) }),
        element("h2", {}, [title]),
        element("p", { class: "setup-description", text: setup.description }),
        element("ul", { class: "setup-tags", "aria-label": "Categories" }, setup.tags.map(tag => element("li", { text: tag }))),
        element("p", { class: "setup-meta", text: `${plural(setup.groupCount, "group")} · ${plural(setup.branchCount, "branch")}` }),
        element("div", { class: "setup-actions" }, [addButton({ type: "setup", id: setup.id }, { add: "Add setup" }), details]),
      ]),
    ]);
  }));
}

let currentSetup = null;
function openSetup(id) {
  currentSetup = id;
  renderSetupDialog(id);
  if (!$("setup-dialog").open) $("setup-dialog").showModal();
}

function renderSetupDialog(id) {
  const setup = setupsByID.get(id);
  if (!setup) return;
  $("setup-dialog-creator").textContent = byline(setup);
  $("setup-dialog-credit").replaceChildren(...creditDetails(setup));
  $("setup-dialog-title").textContent = setup.title;
  $("setup-dialog-description").textContent = setup.description;
  $("setup-dialog-meta").textContent = `${plural(setup.groupCount, "group")} · ${plural(setup.branchCount, "branch")}`;
  $("setup-dialog-add").replaceWith(Object.assign(addButton({ type: "setup", id }, { add: "Add whole setup" }), { id: "setup-dialog-add" }));
  $("setup-dialog-groups").replaceChildren(...setup.groups.map(group => {
    const rows = group.rows.length
      ? element("ul", { class: "group-rows", "aria-label": `Branches in ${group.title}` }, [
        ...group.rows.slice(0, 8).map(row => element("li", { text: row })),
        ...(group.rows.length > 8 ? [element("li", { class: "more", text: `+${group.rows.length - 8} more` })] : []),
      ])
      : element("p", { class: "group-kind", text: "A single row on Home." });
    const strip = element("div", { class: "group-covers", "aria-hidden": "true" }, group.covers.length ? group.covers.map(url => cover(url)) : [placeholder(group.title)]);
    return element("li", { class: "group-item" }, [
      strip,
      element("div", { class: "group-body" }, [
        element("h4", { text: group.title }),
        element("p", { class: "group-kind", text: group.kind === "group" ? `Branch group · ${plural(group.branchCount, "branch")}` : "Single branch" }),
        rows,
      ]),
      addButton({ type: "group", id: group.id }, { add: "Add group" }),
    ]);
  }));
}

async function copyText(text, statusElement, input, success) {
  try { await navigator.clipboard.writeText(text); statusElement.textContent = success; }
  catch { input.focus(); input.select(); statusElement.textContent = "Select and copy the link above."; }
}

// MARK: Profile photos and source badges

const gallery = { kind: "avatars", shown: null, catalogs: {}, visible: 48, selected: null };
const galleryImage = (path, name) => {
  const image = document.createElement("img");
  // Catalog images are mirrored under the site's own public directory.
  if (!/^\/(avatars|badges)\/[a-z0-9_-]+\/[a-z0-9_-]+\.webp$/i.test(path)) return image;
  image.src = `..${path}`; image.alt = name; image.loading = "lazy";
  return image;
};

function selectArtwork(option) {
  gallery.selected = option;
  const isAvatar = gallery.kind === "avatars";
  const name = option.name || option.label;
  const source = artworkURL(isAvatar ? option.url : option.sourceURL, gallery.kind);
  $("selection-title").textContent = name;
  $("selection-url").value = source;
  $("open-cedar").href = appURL(source, gallery.kind);
  $("manual-help").textContent = isAvatar
    ? "Use it on Your Home so it travels in your .cedar file, or open it in Cedar now. To paste it yourself, edit your profile → avatar → Custom Image → Image Link."
    : "Use it on Your Home so Cedar installs it with your .cedar file, or open it in Cedar now. To paste it yourself, open Source Badges in Cedar Settings, paste the URL and choose Add Badge Pack.";
  $("copy-status").textContent = "";
  $("preview").classList.toggle("avatar", isAvatar);
  $("preview").replaceChildren(...(isAvatar ? [galleryImage(option.url, name)] : option.badges.slice(0, 4).map(badge => galleryImage(badge.imageURL, badge.name))));
  $("full-set").open = false;
  $("full-set").hidden = isAvatar;
  $("full-set-label").textContent = `View full set (${option.badges?.length || 0} badges)`;
  $("full-set-grid").replaceChildren();
  $("selection").hidden = false;
  renderGallery();
  $("selection").scrollIntoView({ block: "start", behavior: "instant" });
  $("add-avatar").focus({ preventScroll: true });
}

function renderGallery() {
  const options = gallery.kind === "avatars"
    ? avatarOptions(gallery.catalogs.avatars || [], $("search").value, $("category").value, $("sort").value)
    : matchingOptions(gallery.catalogs.badges || [], $("search").value);
  $("status").textContent = `${options.length} ${gallery.kind === "avatars" ? "profile photos" : "badge sets"}${$("search").value ? " found" : " available"}`;
  $("gallery").replaceChildren(...options.slice(0, gallery.visible).map(option => {
    const button = element("button", { type: "button", class: "artwork-choice", "aria-pressed": String(gallery.selected === option) });
    const detail = gallery.kind === "avatars" ? (option.category || option.source || "Profile photo") : `${option.badges.length} badges · ${option.creator}`;
    button.append(galleryImage(option.url || option.badges[0]?.imageURL || "", ""), element("span", { text: option.name || option.label }), element("small", { text: detail }));
    button.addEventListener("click", () => selectArtwork(option));
    return button;
  }));
  $("more").hidden = gallery.visible >= options.length;
}

async function loadGallery(kind) {
  gallery.kind = kind; gallery.shown = kind; gallery.visible = 48; gallery.selected = null;
  $("selection").hidden = true; $("gallery").replaceChildren(); $("more").hidden = true;
  $("category-control").hidden = kind !== "avatars";
  $("sort-control").hidden = kind !== "avatars";
  $("status").textContent = "Loading artwork…";
  try {
    if (!gallery.catalogs[kind]) {
      const response = await fetch(`../catalogs/${kind}.json`);
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json();
      gallery.catalogs[kind] = data.avatars || data.sets;
      if (kind === "avatars") avatarsByPath = new Map(data.avatars.map(avatar => [avatar.url.slice(1), avatar]));
    }
    if (gallery.kind !== kind) return;
    if (kind === "avatars") {
      const previous = $("category").value;
      $("category").replaceChildren(new Option("All categories", ""), ...avatarCategories(gallery.catalogs.avatars).map(value => new Option(value, value)));
      $("category").value = previous;
    }
    renderGallery();
  } catch { if (gallery.kind === kind) $("status").textContent = "Artwork could not load. Refresh this page to try again."; }
}

// MARK: Tabs

const tabs = [...document.querySelectorAll("[role=tab]")];
function selectTab(name, { focus = false } = {}) {
  for (const tab of tabs) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  const isGallery = name === "avatars" || name === "badges";
  $("panel-setups").hidden = name !== "setups";
  $("panel-home").hidden = name !== "home";
  $("panel-gallery").hidden = !isGallery;
  $("home-button").hidden = name === "home";
  if (isGallery) $("panel-gallery").setAttribute("aria-labelledby", `tab-${name}`);
  if (isGallery && gallery.shown !== name) { $("search").value = ""; loadGallery(name); }
  const url = new URL(location.href);
  if (name === "setups") url.searchParams.delete("tab"); else url.searchParams.set("tab", name);
  history.replaceState(null, "", url);
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab.dataset.tab));
  tab.addEventListener("keydown", event => {
    const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!offset) return;
    event.preventDefault();
    selectTab(tabs[(index + offset + tabs.length) % tabs.length].dataset.tab, { focus: true });
  });
});

// MARK: Wiring

for (const dialog of document.querySelectorAll(".creator-dialog")) {
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
  });
}
$("home-button").addEventListener("click", () => { selectTab("home"); $("panel-home").scrollIntoView({ block: "start" }); });
home.onChange(() => {
  renderHomeButton();
  renderSetups();
  if ($("setup-dialog").open) renderSetupDialog(currentSetup);
});
$("setup-search").addEventListener("input", renderSetups);
$("setup-tag").addEventListener("change", renderSetups);
$("setup-platform").addEventListener("change", renderSetups);
$("setup-sort").addEventListener("change", renderSetups);
$("search").addEventListener("input", () => { gallery.visible = 48; renderGallery(); });
for (const control of [$("category"), $("sort")]) control.addEventListener("change", () => { gallery.visible = 48; renderGallery(); });
$("more").addEventListener("click", () => { gallery.visible += 48; renderGallery(); });
$("copy").addEventListener("click", () => copyText($("selection-url").value, $("copy-status"), $("selection-url"), "URL copied. Paste it into Cedar."));
$("add-avatar").addEventListener("click", () => {
  const option = gallery.selected;
  if (gallery.kind === "badges") {
    if (!isBadgePackID(option?.id)) return;
    home.setBadgePack(option.id);
    toast(`${option.label || "These source badges"} will be installed with Your Home.`);
    return;
  }
  if (!option?.url) return;
  home.setAvatar(option.url.slice(1));
  toast(`${option.name || "Profile photo"} will travel with Your Home.`);
});
$("full-set").addEventListener("toggle", () => {
  if (!$("full-set").open || !gallery.selected?.badges || $("full-set-grid").childElementCount) return;
  $("full-set-grid").append(...gallery.selected.badges.map(badge =>
    element("figure", {}, [galleryImage(badge.imageURL, ""), element("figcaption", { text: badge.name })])));
});

async function start() {
  const query = new URLSearchParams(location.search);
  const requestedTab = query.get("tab") || ({ avatars: "avatars", badges: "badges" })[query.get("kind")];
  if (["home", "avatars", "badges"].includes(requestedTab)) selectTab(requestedTab);
  try {
    const [catalogResponse, avatarResponse, badgeResponse] = await Promise.all([fetch("../catalogs/creator.json"), fetch("../catalogs/avatars.json"),
      home.badgePack() ? fetch("../catalogs/badges.json") : null]);
    if (!catalogResponse.ok) throw new Error("Unavailable");
    if (badgeResponse?.ok) gallery.catalogs.badges ??= (await badgeResponse.json()).sets;
    setups = (await catalogResponse.json()).setups;
    if (avatarResponse.ok) {
      const data = await avatarResponse.json();
      gallery.catalogs.avatars ??= data.avatars;
      avatarsByPath = new Map(data.avatars.map(avatar => [avatar.url.slice(1), avatar]));
    }
  } catch {
    $("setup-status").textContent = "Setups could not load. Refresh this page to try again.";
    return;
  }
  setupsByID = new Map(setups.map(setup => [setup.id, setup]));
  groupsByID = new Map(setups.flatMap(setup => setup.groups.map(group => [group.id, group])));
  home.connect({
    describePick: describe,
    describeAvatar: path => avatarsByPath.get(path)?.name,
    describeBadgePack: id => gallery.catalogs.badges?.find(set => set.id === id)?.label,
    openSetup: item => openSetup(setupOf(item.id)),
    showTab: selectTab,
  });

  // A shared Creator link (…/creator/?i=…&a=…) opened in a browser adds its picks to Your Home.
  if (query.has("i") || query.has("a") || query.has("b")) {
    const shared = parseCart(location.search, knownItemIDs()).filter(entry => entry.type !== "avatar" || avatarsByPath.has(entry.id));
    if (shared.length && (!home.counts().rows || confirm("Add the shared setups to Your Home?"))) {
      for (const entry of shared) {
        if (entry.type === "avatar") home.setAvatar(entry.id);
        else if (entry.type === "badges") home.setBadgePack(entry.id);
        else home.add(entry, describe(entry)?.title);
      }
      selectTab("home");
    }
    const url = new URL(location.href);
    url.searchParams.delete("i"); url.searchParams.delete("a"); url.searchParams.delete("b");
    history.replaceState(null, "", url);
  }
  renderSetupFilters();
  renderSetups();
  renderHomeButton();
}
renderHomeButton();
start();
