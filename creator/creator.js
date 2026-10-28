// Creator: one workspace. The library on the left (setups, profile photos, source badges and the
// builders) feeds the Home on the right, which home-builder.mjs draws and edits.
import { isBadgePackID, parseCart, setupOf, setupOptions, setupTags } from "./creator-model.mjs";
import { artworkURL, appURL, matchingOptions, avatarCategories, avatarOptions, avatarName, sampleBadges } from "./artwork-model.mjs";
import { home } from "./home-builder.mjs";
import { useThumbnails } from "./home-preview.mjs";

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
  const button = element("button", { type: "button", class: `button ${state === "available" ? "button-primary" : "button-added"}` });
  button.textContent = state === "added" ? "✓ Added" : state === "included" ? "In its setup" : labels.add;
  button.disabled = state !== "available";
  button.addEventListener("click", () => add(entry));
  return button;
}

function renderHomeButton() {
  const count = home.counts().picks;
  $("home-tab-count").textContent = String(count);
  $("home-tab-count").hidden = count === 0;
}

// MARK: Setups

function renderSetupFilters() {
  $("setup-tag").replaceChildren(new Option("All categories", ""), ...setupTags(setups).map(tag => new Option(tag, tag)));
}

const byline = setup => `By ${setup.creator}`;

/// Who made a setup. Creator credits the people behind it, never the app it was first made for.
function creditDetails(setup) {
  const credit = setup.credit || {};
  const parts = [credit.platform === "Cedar"
    ? element("p", {}, ["Curated by ", element("strong", { text: setup.creator }), ...(credit.via ? [`, via ${credit.via}`] : []), ", modified for Cedar."])
    : element("p", {}, ["Made by ", element("strong", { text: setup.creator }), "."])];
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
  const options = setupOptions(setups, { query: $("setup-search").value, tag: $("setup-tag").value, sort: $("setup-sort").value });
  $("setup-status").textContent = setups.length
    ? `${plural(options.length, "setup")}${$("setup-search").value || $("setup-tag").value ? " found" : ""} · Preview shows one on the screen before you add it.`
    : $("setup-status").textContent;
  const previewing = home.previewing();
  $("setup-grid").removeAttribute("aria-busy");
  $("setup-grid").replaceChildren(...options.map(setup => {
    const entry = { type: "setup", id: setup.id };
    const state = home.pickState(entry);
    const title = element("button", { type: "button", class: "setup-title-button", text: setup.title });
    title.addEventListener("click", () => openSetup(setup.id));
    const actions = element("div", { class: "setup-actions" });
    if (state === "available") {
      const isPreviewing = previewing === setup.id;
      const preview = element("button", { type: "button", class: "button button-secondary", text: isPreviewing ? "Previewing" : "Preview", "aria-pressed": String(isPreviewing) });
      preview.addEventListener("click", () => home.preview(isPreviewing ? null : entry, setup.title));
      actions.append(preview);
    }
    actions.append(addButton(entry, { add: "+ Add" }));
    const details = element("button", { type: "button", class: "text-link", text: `${plural(setup.groupCount, "group")} · ${plural(setup.branchCount, "row")}` });
    details.addEventListener("click", () => openSetup(setup.id));
    return element("article", { class: `setup-card${previewing === setup.id ? " previewing" : ""}` }, [
      coverMosaic(setup.covers, setup.title),
      element("div", { class: "setup-body" }, [
        element("h2", {}, [title]),
        element("p", { class: "setup-creator", text: byline(setup) }),
        element("p", { class: "setup-meta" }, [details, setup.tags.length ? ` · ${setup.tags.slice(0, 3).join(", ")}` : ""]),
        actions,
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

const galleryName = option => gallery.kind === "avatars" ? avatarName(option) : option.label;
const isChosen = option => gallery.kind === "avatars" ? home.avatar() === option.url.slice(1) : home.badgePack() === option.id;

/** Puts a photo or badge set on Your Home and shows it where Cedar does. */
function selectArtwork(option, { apply = true } = {}) {
  gallery.selected = option;
  const isAvatar = gallery.kind === "avatars";
  const name = galleryName(option);
  if (apply) {
    if (isAvatar && option.url) { home.setAvatar(option.url.slice(1)); home.showScreen("who"); }
    if (!isAvatar && isBadgePackID(option.id)) { home.setBadgePack(option.id); home.showScreen("title"); }
  }
  const source = artworkURL(isAvatar ? option.url : option.sourceURL, gallery.kind);
  $("selection-title").textContent = name;
  $("selection-url").value = source;
  $("open-cedar").href = appURL(source, gallery.kind);
  $("manual-help").textContent = isAvatar
    ? "It travels in your .cedar file. A new profile made from it uses this photo; others are offered it."
    : "Cedar installs these badges with your Home and draws them on each source of a title.";
  $("copy-status").textContent = "";
  $("preview").classList.toggle("avatar", isAvatar);
  $("preview").replaceChildren(...(isAvatar ? [galleryImage(option.url, name)] : sampleBadges(option).map(badge => galleryImage(badge.imageURL, badge.name))));
  $("full-set").open = false;
  $("full-set").hidden = isAvatar;
  $("full-set-label").textContent = `View all ${option.badges?.length || 0} badges`;
  $("full-set-grid").replaceChildren();
  $("selection").hidden = false;
  renderGallery();
}

function renderGallery() {
  const options = gallery.kind === "avatars"
    ? avatarOptions(gallery.catalogs.avatars || [], $("search").value, $("category").value, $("sort").value)
    : matchingOptions(gallery.catalogs.badges || [], $("search").value);
  $("status").textContent = `${options.length} ${gallery.kind === "avatars" ? "profile photos" : "badge sets"}${$("search").value ? " found" : ""} · ${gallery.kind === "avatars" ? "Pick one to see it on Who’s Watching." : "Pick one to see it on a title’s sources."}`;
  $("gallery").classList.toggle("badge-sets", gallery.kind === "badges");
  $("gallery").replaceChildren(...options.slice(0, gallery.visible).map(option => {
    const chosen = isChosen(option);
    const button = element("button", { type: "button", class: `artwork-choice${chosen ? " chosen" : ""}`, "aria-pressed": String(chosen) });
    if (gallery.kind === "avatars") {
      button.append(galleryImage(option.url, ""), element("span", { text: avatarName(option) }), element("small", { text: option.category || "Profile photo" }));
    } else {
      const strip = element("span", { class: "badge-strip", "aria-hidden": "true" }, sampleBadges(option).map(badge => galleryImage(badge.imageURL, "")));
      const text = element("span", { class: "badge-set-text" }, [element("span", { text: option.label }), element("small", { text: [`${option.badges.length} badges`, option.creator ? `by ${option.creator}` : option.style].filter(Boolean).join(" · ") })]);
      button.append(strip, text, element("span", { class: "check", "aria-hidden": "true", text: "✓" }));
    }
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
    await loadCatalog(kind);
    if (gallery.kind !== kind) return;
    if (kind === "avatars") {
      const previous = $("category").value;
      $("category").replaceChildren(new Option("All categories", ""), ...avatarCategories(gallery.catalogs.avatars).map(value => new Option(value, value)));
      $("category").value = previous;
    }
    // Whatever Your Home already uses is shown first as the selection.
    const current = gallery.catalogs[kind].find(isChosen);
    if (current) selectArtwork(current, { apply: false }); else renderGallery();
  } catch { if (gallery.kind === kind) $("status").textContent = "Artwork could not load. Refresh this page to try again."; }
}

async function loadCatalog(kind) {
  if (gallery.catalogs[kind]) return gallery.catalogs[kind];
  const response = await fetch(`../catalogs/${kind}.json`);
  if (!response.ok) throw new Error("Unavailable");
  const data = await response.json();
  gallery.catalogs[kind] = data.avatars || data.sets;
  if (kind === "avatars") avatarsByPath = new Map(data.avatars.map(avatar => [avatar.url.slice(1), avatar]));
  return gallery.catalogs[kind];
}

// MARK: Tabs

const tabs = [...document.querySelectorAll("[role=tab]")];
function selectTab(name, { focus = false } = {}) {
  if (name === "home") { $("panel-home").scrollIntoView({ block: "start", behavior: "smooth" }); return; }
  if (!tabs.some(tab => tab.dataset.tab === name)) name = "setups";
  for (const tab of tabs) {
    const selected = tab.dataset.tab === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  const isGallery = name === "avatars" || name === "badges";
  $("panel-setups").hidden = name !== "setups";
  $("panel-build").hidden = name !== "build";
  $("panel-gallery").hidden = !isGallery;
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
home.onChange(() => {
  renderHomeButton();
  renderSetups();
  if (gallery.shown && !$("panel-gallery").hidden && gallery.catalogs[gallery.kind]) renderGallery();
  if ($("setup-dialog").open) renderSetupDialog(currentSetup);
});
$("setup-search").addEventListener("input", renderSetups);
$("setup-tag").addEventListener("change", renderSetups);
$("setup-sort").addEventListener("change", renderSetups);
$("search").addEventListener("input", () => { gallery.visible = 48; renderGallery(); });
for (const control of [$("category"), $("sort")]) control.addEventListener("change", () => { gallery.visible = 48; renderGallery(); });
$("more").addEventListener("click", () => { gallery.visible += 48; renderGallery(); });
$("copy").addEventListener("click", () => copyText($("selection-url").value, $("copy-status"), $("selection-url"), "URL copied. Paste it into Cedar."));
$("full-set").addEventListener("toggle", () => {
  if (!$("full-set").open || !gallery.selected?.badges || $("full-set-grid").childElementCount) return;
  $("full-set-grid").append(...gallery.selected.badges.map(badge =>
    element("figure", {}, [galleryImage(badge.imageURL, ""), element("figcaption", { text: badge.name })])));
});

async function start() {
  const query = new URLSearchParams(location.search);
  const requestedTab = query.get("tab") || ({ avatars: "avatars", badges: "badges" })[query.get("kind")];
  if (["avatars", "badges", "build"].includes(requestedTab)) selectTab(requestedTab);
  // The page holds the preview banner's place (is-reserved) because an empty Home gets the featured
  // preview once the catalogs load. A saved Home or a requested tab won't, so give the space back now.
  const willPreview = !home.counts().rows && !requestedTab;
  if (!willPreview) $("preview-banner").classList.remove("is-reserved");
  try {
    const catalogResponse = await fetch("../catalogs/creator.json");
    if (!catalogResponse.ok) throw new Error("Unavailable");
    // Photos and badges also draw on the preview, so both catalogs load with the page.
    await Promise.all([loadCatalog("avatars"), loadCatalog("badges")]).catch(() => {});
    const catalog = await catalogResponse.json();
    setups = catalog.setups;
    useThumbnails(catalog.thumbnails);
  } catch {
    $("setup-status").textContent = "Setups could not load. Refresh this page to try again.";
    $("setup-grid").removeAttribute("aria-busy");
    $("preview-banner").classList.remove("is-reserved");
    return;
  }
  setupsByID = new Map(setups.map(setup => [setup.id, setup]));
  groupsByID = new Map(setups.flatMap(setup => setup.groups.map(group => [group.id, group])));
  home.connect({
    describePick: describe,
    describeAvatar: path => { const avatar = avatarsByPath.get(path); return avatar && avatarName(avatar); },
    describeBadgePack: id => gallery.catalogs.badges?.find(set => set.id === id)?.label,
    badgeImages: id => { const set = gallery.catalogs.badges?.find(item => item.id === id); return set ? sampleBadges(set) : []; },
    describeSetup: id => setupsByID.get(id),
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
  // An empty Home shows the first featured setup as a preview, so the right side isn't a blank box.
  if (willPreview && !home.counts().rows && !home.previewing()) {
    const [first] = setupOptions(setups, { query: "", tag: "", sort: "featured" });
    if (first) home.preview({ type: "setup", id: first.id }, first.title, { quiet: true });
  }
  $("preview-banner").classList.remove("is-reserved");
  renderSetupFilters();
  renderSetups();
  renderHomeButton();
}
renderHomeButton();
start();
