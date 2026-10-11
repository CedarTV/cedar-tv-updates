import {
  addToCart, avatarEntry, branchEntries, cartAppLink, cartWebLink, downloadName, entryKey,
  itemFileURL, mergeCart, moveInCart, parseCart, removeFromCart, setupOf, setupOptions, setupPlatforms, setupTags,
} from "./creator-model.mjs";
import { artworkURL, appURL, matchingOptions, avatarCategories, avatarOptions } from "./artwork-model.mjs";

const $ = id => document.getElementById(id);
const cartKey = "cedar-creator-cart";
let setups = [];
let setupsByID = new Map();
let groupsByID = new Map();
let avatarsByPath = new Map();
let cart = [];

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

// MARK: Cart state

function saveCart() {
  try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch {}
}
function restoreCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (!Array.isArray(stored)) return [];
    const query = new URLSearchParams();
    for (const entry of stored) {
      if (entry?.type === "avatar") query.set("a", entry.id);
      else if (entry?.id) query.append("i", entry.id);
    }
    return parseCart(query.toString(), knownItemIDs());
  } catch { return []; }
}
const knownItemIDs = () => new Set([...setupsByID.keys(), ...groupsByID.keys()]);

function describe(entry) {
  if (entry.type === "setup") {
    const setup = setupsByID.get(entry.id);
    return { title: setup.title, detail: `Whole setup · ${plural(setup.groupCount, "group")} · ${plural(setup.branchCount, "branch")}`, covers: setup.covers, branchCount: setup.branchCount };
  }
  if (entry.type === "group") {
    const group = groupsByID.get(entry.id);
    const setup = setupsByID.get(setupOf(entry.id));
    return { title: group.title, detail: `From ${setup.title} · ${plural(group.branchCount, "branch")}`, covers: group.covers, branchCount: group.branchCount };
  }
  const avatar = avatarsByPath.get(entry.id);
  return { title: avatar?.name || "Profile photo", detail: "Profile photo", covers: [`../${entry.id}`], branchCount: 0 };
}

function updateCart(next, message) {
  cart = next;
  saveCart();
  renderCartButton();
  renderCart();
  renderSetups();
  if ($("setup-dialog").open) renderSetupDialog(currentSetup);
  if (message) toast(message);
}

function add(entry) {
  const { cart: next, status } = addToCart(cart, entry);
  const name = describe(entry).title;
  const messages = {
    added: `${name} added to your cart.`,
    replaced: entry.type === "avatar" ? `Profile photo changed to ${name}.` : `${name} replaced its groups in your cart.`,
    included: `${name} is already part of a setup in your cart.`,
    duplicate: `${name} is already in your cart.`,
    full: "Your cart is full. Remove something to add more.",
  };
  updateCart(next, messages[status]);
}

function cartState(entry) {
  if (cart.some(existing => entryKey(existing) === entryKey(entry))) return "in-cart";
  if (entry.type === "group" && cart.some(existing => existing.type === "setup" && existing.id === setupOf(entry.id))) return "included";
  return "available";
}

function addButton(entry, labels) {
  const state = cartState(entry);
  const button = element("button", { type: "button", class: `button ${state === "available" ? "button-primary" : "button-secondary"}` });
  button.textContent = state === "in-cart" ? "In cart ✓" : state === "included" ? "Included in setup" : labels.add;
  button.disabled = state !== "available";
  button.addEventListener("click", () => add(entry));
  return button;
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
  if (credit.platform === "Cedar") return [element("p", { text: "Made by Cedar for Cedar." })];
  const made = element("p", {}, [
    "Made by ", element("strong", { text: setup.creator }), ` for ${credit.platform}`,
    ...(credit.via ? [`, shared on ${credit.via}`] : []), "."]);
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

// MARK: Cart

function renderCartButton() {
  const count = branchEntries(cart).length + (avatarEntry(cart) ? 1 : 0);
  $("cart-count").textContent = String(count);
  $("cart-button").setAttribute("aria-label", `Open cart, ${plural(count, "item")}`);
  $("cart-button").classList.toggle("has-items", count > 0);
}

function renderCart() {
  const branches = branchEntries(cart);
  const avatar = avatarEntry(cart);
  const isEmpty = !branches.length && !avatar;
  $("cart-empty").hidden = !isEmpty;
  $("cart-contents").hidden = isEmpty;
  if (isEmpty) return;

  $("cart-list").replaceChildren(...branches.map((entry, index) => {
    const info = describe(entry);
    const handle = element("button", { type: "button", class: "drag-handle", "aria-label": `Reorder ${info.title}. Use the up and down arrow keys.`, text: "⋮⋮" });
    handle.addEventListener("pointerdown", event => beginDrag(event, index));
    handle.addEventListener("keydown", event => {
      const offset = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (!offset) return;
      event.preventDefault();
      move(index, index + offset, true);
    });
    const up = element("button", { type: "button", class: "icon-button", "aria-label": `Move ${info.title} up`, text: "↑" });
    up.disabled = index === 0;
    up.addEventListener("click", () => move(index, index - 1));
    const down = element("button", { type: "button", class: "icon-button", "aria-label": `Move ${info.title} down`, text: "↓" });
    down.disabled = index === branches.length - 1;
    down.addEventListener("click", () => move(index, index + 1));
    const remove = element("button", { type: "button", class: "icon-button", "aria-label": `Remove ${info.title}`, text: "×" });
    remove.addEventListener("click", () => updateCart(removeFromCart(cart, entryKey(entry)), `${info.title} removed.`));
    return element("li", { class: "cart-item", "data-index": String(index) }, [
      handle,
      element("span", { class: "cart-position", text: String(index + 1) }),
      element("div", { class: "cart-item-body" }, [element("strong", { text: info.title }), element("small", { text: info.detail })]),
      element("div", { class: "cart-item-actions" }, [up, down, remove]),
    ]);
  }));
  if (!branches.length) $("cart-list").append(element("li", { class: "cart-note", text: "No branches yet. Your cart will only change your profile photo." }));

  if (avatar) {
    const info = describe(avatar);
    const remove = element("button", { type: "button", class: "text-button", text: "Remove" });
    remove.addEventListener("click", () => updateCart(removeFromCart(cart, entryKey(avatar)), "Profile photo removed."));
    $("cart-avatar").replaceChildren(
      element("img", { src: `../${avatar.id}`, alt: "", width: 56, height: 56 }),
      element("div", {}, [element("strong", { text: info.title }), element("small", { text: "Profile photo · applied after you confirm in Cedar" })]),
      remove);
  } else {
    const choose = element("button", { type: "button", class: "text-button", text: "Choose a profile photo" });
    choose.addEventListener("click", () => { $("cart-dialog").close(); selectTab("avatars"); });
    $("cart-avatar").replaceChildren(element("small", { text: "No profile photo." }), choose);
  }

  const branchCount = branches.reduce((total, entry) => total + describe(entry).branchCount, 0);
  $("cart-summary").textContent = [
    branches.length ? `${plural(branches.length, "item")} · ${plural(branchCount, "branch")}` : null,
    avatar ? "1 profile photo" : null,
  ].filter(Boolean).join(" · ");
  $("cart-open").href = cartAppLink(cart);
  $("cart-link").value = shareLink();
  $("cart-status").textContent = "";
}

/// A single setup or group links straight to its file, which every Cedar build can import.
function shareLink() {
  const branches = branchEntries(cart);
  return branches.length === 1 && !avatarEntry(cart) ? itemFileURL(branches[0].id) : cartWebLink(cart);
}

function move(from, to, keepFocus = false) {
  const next = moveInCart(cart, from, to);
  if (next === cart) return;
  updateCart(next);
  const title = describe(branchEntries(cart)[to]).title;
  $("cart-status").textContent = `${title} moved to position ${to + 1}.`;
  if (keepFocus) $("cart-list").children[to]?.querySelector(".drag-handle")?.focus();
}

// Pointer dragging works the same with a mouse, a pen or a finger.
function beginDrag(event, startIndex) {
  if (event.button !== 0) return;
  event.preventDefault();
  const list = $("cart-list");
  const handle = event.currentTarget;
  const item = handle.closest(".cart-item");
  handle.setPointerCapture(event.pointerId);
  item.classList.add("is-dragging");
  let index = startIndex;
  const onMove = moveEvent => {
    const others = [...list.querySelectorAll(".cart-item")].filter(other => other !== item);
    const target = others.filter(other => {
      const box = other.getBoundingClientRect();
      return moveEvent.clientY > box.top + box.height / 2;
    }).length;
    // Move the neighbours, never the dragged row: detaching it would release pointer capture.
    while (index < target) {
      const next = item.nextElementSibling;
      list.insertBefore(next, item);
      index += 1;
    }
    while (index > target) {
      const previous = item.previousElementSibling;
      list.insertBefore(previous, item.nextElementSibling);
      index -= 1;
    }
  };
  const onEnd = () => {
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onEnd);
    handle.removeEventListener("pointercancel", onEnd);
    handle.removeEventListener("lostpointercapture", onEnd);
    if (!item.classList.contains("is-dragging")) return;
    item.classList.remove("is-dragging");
    if (index !== startIndex) move(startIndex, index);
    else renderCart();
  };
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onEnd);
  handle.addEventListener("pointercancel", onEnd);
  handle.addEventListener("lostpointercapture", onEnd);
}

async function copyText(text, statusElement, input, success) {
  try { await navigator.clipboard.writeText(text); statusElement.textContent = success; }
  catch { input.focus(); input.select(); statusElement.textContent = "Select and copy the link above."; }
}

async function downloadCart() {
  const button = $("cart-download");
  button.disabled = true;
  $("cart-status").textContent = "Preparing your file…";
  try {
    const entries = branchEntries(cart);
    const files = Object.fromEntries(await Promise.all(entries.map(async entry => {
      const response = await fetch(`items/${entry.id}.cedar`, { cache: "no-cache" });
      if (!response.ok) throw new Error(entry.id);
      return [entry.id, await response.json()];
    })));
    const bundle = mergeCart(cart, files);
    const blob = new Blob([`${JSON.stringify(bundle, null, 2)}\n`], { type: "application/octet-stream" });
    const link = element("a", { href: URL.createObjectURL(blob), download: downloadName(cart, entries.length === 1 ? describe(entries[0]).title : null) });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
    $("cart-status").textContent = "Downloaded. Open the file in Cedar on iPhone, iPad or Mac.";
  } catch {
    $("cart-status").textContent = "The file could not be prepared. Check your connection and try again.";
  } finally {
    button.disabled = false;
  }
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
  $("add-avatar").hidden = !isAvatar;
  $("open-cedar").classList.toggle("button-primary", !isAvatar);
  $("open-cedar").classList.toggle("button-secondary", isAvatar);
  $("manual-help").textContent = isAvatar
    ? "Add it to your cart to apply it with your setups, or open it in Cedar now. To paste it yourself, edit your profile → avatar → Custom Image → Image Link."
    : "In Cedar Settings, open Source Badges. Paste the URL into the badge-pack field, then choose Add Badge Pack.";
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
  (isAvatar ? $("add-avatar") : $("open-cedar")).focus({ preventScroll: true });
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
  $("panel-setups").hidden = name !== "setups";
  $("panel-gallery").hidden = name === "setups";
  $("panel-gallery").setAttribute("aria-labelledby", `tab-${name === "setups" ? "avatars" : name}`);
  if (name !== "setups" && gallery.shown !== name) { $("search").value = ""; loadGallery(name); }
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

for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
  });
}
$("cart-button").addEventListener("click", () => { renderCart(); $("cart-dialog").showModal(); });
$("cart-copy").addEventListener("click", () => copyText(shareLink(), $("cart-status"), $("cart-link"), "Link copied. In Cedar, paste it into Home & Branches → Import from Link."));
$("cart-download").addEventListener("click", downloadCart);
$("cart-clear").addEventListener("click", () => { if (confirm("Empty your cart?")) updateCart([], "Cart emptied."); });
$("setup-search").addEventListener("input", renderSetups);
$("setup-tag").addEventListener("change", renderSetups);
$("setup-platform").addEventListener("change", renderSetups);
$("setup-sort").addEventListener("change", renderSetups);
$("search").addEventListener("input", () => { gallery.visible = 48; renderGallery(); });
for (const control of [$("category"), $("sort")]) control.addEventListener("change", () => { gallery.visible = 48; renderGallery(); });
$("more").addEventListener("click", () => { gallery.visible += 48; renderGallery(); });
$("copy").addEventListener("click", () => copyText($("selection-url").value, $("copy-status"), $("selection-url"), "URL copied. Paste it into Cedar."));
$("add-avatar").addEventListener("click", () => {
  if (gallery.selected?.url) add({ type: "avatar", id: gallery.selected.url.slice(1) });
});
$("full-set").addEventListener("toggle", () => {
  if (!$("full-set").open || !gallery.selected?.badges || $("full-set-grid").childElementCount) return;
  $("full-set-grid").append(...gallery.selected.badges.map(badge =>
    element("figure", {}, [galleryImage(badge.imageURL, ""), element("figcaption", { text: badge.name })])));
});

async function start() {
  const query = new URLSearchParams(location.search);
  const requestedTab = query.get("tab") || ({ avatars: "avatars", badges: "badges" })[query.get("kind")];
  if (["avatars", "badges"].includes(requestedTab)) selectTab(requestedTab);
  try {
    const [catalogResponse, avatarResponse] = await Promise.all([fetch("../catalogs/creator.json"), fetch("../catalogs/avatars.json")]);
    if (!catalogResponse.ok) throw new Error("Unavailable");
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
  // Avatars in a cart must still exist in the catalog.
  const isKnownAvatar = entry => entry.type !== "avatar" || avatarsByPath.has(entry.id);
  cart = restoreCart().filter(isKnownAvatar);

  // A shared cart link (…/creator/?i=…&a=…) opened in a browser.
  if (query.has("i") || query.has("a")) {
    const shared = parseCart(location.search, knownItemIDs()).filter(isKnownAvatar);
    const differs = JSON.stringify(shared) !== JSON.stringify(cart);
    if (shared.length && differs && (!cart.length || confirm("Replace your cart with the shared one?"))) cart = shared;
    const url = new URL(location.href);
    url.searchParams.delete("i"); url.searchParams.delete("a");
    history.replaceState(null, "", url);
    saveCart();
    if (shared.length) queueMicrotask(() => { renderCart(); $("cart-dialog").showModal(); });
  }
  renderSetupFilters();
  renderSetups();
  renderCartButton();
}
start();
