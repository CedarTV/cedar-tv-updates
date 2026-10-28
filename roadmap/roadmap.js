// Fills the Features and Known issues columns from the live roadmap feed, which only ever holds
// reviewed, public items. The page re-reads it every minute while it's visible. Each card opens
// the item's public detail in a dialog, and #CDR-n links open it directly.
const ROADMAP_FEED = "https://cedar-feedback.cedar-feedback.workers.dev/v1/roadmap";
const REFRESH_MS = 60_000;
const recentLimit = 6;

const platformNames = {
  iphone: "iPhone",
  ipad: "iPad",
  "apple-tv": "Apple TV",
  mac: "Mac",
  "android-tv": "Android TV",
  radio: "Cedar Radio",
  website: "Website",
};

const statusNames = {
  feature: { considering: "Considering", planned: "Planned", "in-progress": "In progress", shipped: "Shipped" },
  bug: { investigating: "Investigating", "in-progress": "Fix in progress", fixed: "Fixed" },
};

const ITEM_HASH = /^#(CDR-[1-9]\d{0,6})$/;
let itemsByID = new Map();

// Release links point at the live site; keep them on whichever host serves this page.
const trustedLink = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "cedartv.github.io" && url.pathname.startsWith("/cedar-tv-updates/")) return `${url.pathname}${url.hash}`;
  } catch {}
  return null;
};

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const metaLine = (item) => {
  const meta = element("p", "roadmap-meta");
  for (const platform of item.platforms ?? []) {
    if (platformNames[platform]) meta.append(element("span", "roadmap-tag", platformNames[platform]));
  }
  if (Number.isSafeInteger(item.requests) && item.requests > 1) meta.append(element("span", "", `Asked for by ${item.requests} people`));
  return meta;
};

const shippedLine = (item) => {
  if (typeof item.shippedIn !== "string" || !item.shippedIn) return null;
  const shipped = element("p", "roadmap-actions");
  const notes = trustedLink(item.releaseURL);
  if (notes) {
    const link = element("a", "inline-document-link", `In ${item.shippedIn}`);
    link.href = notes;
    shipped.append(link);
  } else {
    shipped.append(element("span", "roadmap-meta", `In ${item.shippedIn}`));
  }
  return shipped;
};

const trackerCard = (item) => {
  const article = element("article", "roadmap-card");
  const title = element("strong");
  const link = element("a", "roadmap-card-link", item.title);
  link.href = `#${item.id}`;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (location.hash !== `#${item.id}`) history.pushState({ roadmapItem: item.id }, "", `#${item.id}`);
    showItem(item.id);
  });
  title.append(link);
  article.append(title);
  const meta = metaLine(item);
  if (meta.childElementCount) article.append(meta);
  if (typeof item.summary === "string" && item.summary) article.append(element("span", "", item.summary));
  const shipped = shippedLine(item);
  if (shipped) article.append(shipped);
  return article;
};

// The detail dialog shows only what the feed publishes: the roadmap wording and status facts.
const dialog = document.querySelector("[data-roadmap-dialog]");
const detail = (name) => dialog.querySelector(`[data-roadmap-detail="${name}"]`);

const showItem = (id) => {
  const item = itemsByID.get(id);
  if (!item || !dialog) return false;
  const kind = item.kind === "bug" ? "Known issue" : "Feature";
  detail("eyebrow").textContent = `${item.id} · ${kind} · ${statusNames[item.kind]?.[item.status] ?? item.status}`;
  detail("title").textContent = item.title;
  const meta = metaLine(item);
  detail("meta").replaceChildren(...meta.childNodes);
  detail("meta").hidden = !detail("meta").childElementCount;
  const body = [item.summary, item.description]
    .filter((text) => typeof text === "string" && text)
    .flatMap((text) => text.split(/\n{2,}/))
    .map((paragraph) => element("p", "", paragraph));
  if (!body.length) body.push(element("p", "roadmap-empty", "No more detail has been written for this item yet."));
  const shipped = shippedLine(item);
  if (shipped) body.push(shipped);
  detail("body").replaceChildren(...body);
  detail("footnote").textContent = /^\d{4}-\d{2}-\d{2}$/.test(item.updated ?? "") ? `Updated ${item.updated}` : "";
  if (!dialog.open) dialog.showModal();
  return true;
};

// Closing the dialog drops the item from the address, going back when the card click added it.
dialog?.addEventListener("close", () => {
  if (!ITEM_HASH.test(location.hash)) return;
  if (history.state?.roadmapItem) history.back();
  else history.replaceState(null, "", `${location.pathname}${location.search}`);
});

const syncDialog = () => {
  const match = ITEM_HASH.exec(location.hash);
  if (match && showItem(match[1])) return;
  if (dialog?.open) dialog.close();
};
window.addEventListener("popstate", syncDialog);
window.addEventListener("hashchange", syncDialog);

const renderTracker = (feed) => {
  if (!feed || feed.schemaVersion !== 1 || !Array.isArray(feed.items)) throw new Error("Roadmap feed unavailable");
  itemsByID = new Map(feed.items.map((item) => [item.id, item]));
  document.querySelectorAll("[data-tracker-status]").forEach((column) => {
    const cards = column.querySelector(".roadmap-cards");
    let matching = feed.items.filter((item) => item.kind === column.dataset.trackerKind && item.status === column.dataset.trackerStatus);
    if (["shipped", "fixed"].includes(column.dataset.trackerStatus)) {
      matching = matching.sort((left, right) => String(right.updated).localeCompare(String(left.updated))).slice(0, recentLimit);
    }
    cards.replaceChildren(...matching.map(trackerCard));
    if (!matching.length) cards.append(element("p", "roadmap-empty", "Nothing here right now."));
  });
};

let loadedOnce = false;
const load = () => fetch(ROADMAP_FEED, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Roadmap feed unavailable")))
  .then((feed) => {
    renderTracker(feed);
    // The first load opens a linked item; later refreshes update the open one in place.
    if (!loadedOnce || dialog?.open) syncDialog();
    loadedOnce = true;
  })
  .catch(() => {
    // A failed refresh keeps what's already shown; only the first load shows the error.
    if (loadedOnce) return;
    document.querySelectorAll("[data-tracker-status] .roadmap-cards").forEach((cards) => {
      cards.replaceChildren(element("p", "roadmap-empty", "This list didn’t load. Try again in a moment."));
    });
  });

load();
setInterval(() => {
  if (document.visibilityState === "visible") load();
}, REFRESH_MS);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") load();
});
