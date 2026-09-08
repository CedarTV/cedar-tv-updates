import { artworkURL, appURL, matchingOptions, avatarCategories, avatarOptions } from "./artwork-model.mjs";
const $ = id => document.getElementById(id);
const kind = $("kind"), search = $("search"), gallery = $("gallery"), status = $("status");
let catalogs = {}, visible = 48, selected = null;
const requested = new URLSearchParams(location.search).get("kind");
if (["avatars", "badges"].includes(requested)) kind.value = requested;
const image = (path, name) => {
  const element = document.createElement("img");
  // Catalog images are mirrored under the site's own public directory.
  if (!/^\/(avatars|badges)\/[a-z0-9_-]+\/[a-z0-9_-]+\.webp$/i.test(path)) return element;
  element.src = `..${path}`; element.alt = name; element.loading = "lazy";
  return element;
};
function select(option) {
  selected = option;
  const isAvatar = kind.value === "avatars";
  const name = option.name || option.label;
  const source = artworkURL(isAvatar ? option.url : option.sourceURL, kind.value);
  $("selection-title").textContent = name;
  $("selection-url").value = source;
  $("open-cedar").href = appURL(source, kind.value);
  $("cedar-link").href = `../link/?artwork=${kind.value}`;
  $("manual-help").textContent = isAvatar
    ? "In Cedar, edit your profile → avatar → Custom Image. Paste the URL into Image Link, choose Use Image Link, then save your profile."
    : "In Cedar Settings, open Source Badges. Paste the URL into the badge-pack field, then choose Add Badge Pack.";
  $("copy-status").textContent = "";
  $("preview").classList.toggle("avatar", isAvatar);
  $("preview").replaceChildren(...(isAvatar ? [image(option.url, name)] : option.badges.slice(0, 4).map(badge => image(badge.imageURL, badge.name))));
  $("full-set").open = false;
  $("full-set").hidden = isAvatar;
  $("full-set-label").textContent = `View full set (${option.badges?.length || 0} badges)`;
  $("full-set-grid").replaceChildren();
  $("selection").hidden = false;
  render();
  $("selection").scrollIntoView({ block: "start", behavior: "instant" });
  $("open-cedar").focus({ preventScroll: true });
}
function render() {
  const options = kind.value === "avatars"
    ? avatarOptions(catalogs.avatars || [], search.value, $("category").value, $("sort").value)
    : matchingOptions(catalogs.badges || [], search.value);
  status.textContent = `${options.length} ${kind.value === "avatars" ? "avatars" : "badge sets"}${search.value ? " found" : " available"}`;
  gallery.replaceChildren();
  for (const option of options.slice(0, visible)) {
    const button = document.createElement("button"); button.type = "button"; button.className = "artwork-choice";
    button.setAttribute("aria-pressed", String(selected === option));
    const label = document.createElement("span"); label.textContent = option.name || option.label;
    const detail = document.createElement("small"); detail.textContent = kind.value === "avatars" ? (option.category || option.source || "Avatar") : `${option.badges.length} badges · ${option.creator}`;
    button.append(image(option.url || option.badges[0]?.imageURL || "", ""), label, detail);
    button.addEventListener("click", () => select(option)); gallery.append(button);
  }
  $("more").hidden = visible >= options.length;
}
async function load() {
  visible = 48; selected = null; $("selection").hidden = true; gallery.replaceChildren(); $("more").hidden = true;
  $("category-control").hidden = kind.value !== "avatars";
  $("sort-control").hidden = kind.value !== "avatars";
  const loadingKind = kind.value; status.textContent = "Loading artwork…";
  try {
    if (!catalogs[loadingKind]) {
      const response = await fetch(`../catalogs/${loadingKind}.json`);
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json(); catalogs[loadingKind] = data.avatars || data.sets;
    }
    if (kind.value === loadingKind) {
      if (loadingKind === "avatars") {
        const previous = $("category").value;
        $("category").replaceChildren(new Option("All categories", ""), ...avatarCategories(catalogs.avatars).map(value => new Option(value, value)));
        $("category").value = previous;
      }
      render();
    }
  } catch { if (kind.value === loadingKind) status.textContent = "Artwork could not load. Refresh this page to try again."; }
}
kind.addEventListener("change", () => { search.value = ""; load(); });
search.addEventListener("input", () => { visible = 48; render(); });
$("more").addEventListener("click", () => { visible += 48; render(); });
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("selection-url").value); $("copy-status").textContent = "URL copied. Paste it into Cedar."; }
  catch { $("selection-url").focus(); $("selection-url").select(); $("copy-status").textContent = "Select and copy the URL above manually."; }
});
$("full-set").addEventListener("toggle", () => {
  if (!$("full-set").open || !selected?.badges || $("full-set-grid").childElementCount) return;
  for (const badge of selected.badges) {
    const item = document.createElement("figure");
    const label = document.createElement("figcaption"); label.textContent = badge.name;
    item.append(image(badge.imageURL, ""), label); $("full-set-grid").append(item);
  }
});
for (const control of [$("category"), $("sort")]) control.addEventListener("change", () => { visible = 48; render(); });
load();
