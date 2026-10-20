// Fills the Features and Known issues columns from the live roadmap feed, which only ever holds
// reviewed, public items. The page re-reads it every minute while it's visible.
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

const trackerCard = (item) => {
  const article = element("article", "roadmap-card");
  article.append(element("strong", "", item.title));
  const meta = element("p", "roadmap-meta");
  for (const platform of item.platforms ?? []) {
    if (platformNames[platform]) meta.append(element("span", "roadmap-tag", platformNames[platform]));
  }
  if (Number.isSafeInteger(item.requests) && item.requests > 1) meta.append(element("span", "", `Asked for by ${item.requests} people`));
  if (meta.childElementCount) article.append(meta);
  if (typeof item.summary === "string" && item.summary) article.append(element("span", "", item.summary));
  if (typeof item.shippedIn === "string" && item.shippedIn) {
    const shipped = element("p", "roadmap-actions");
    const notes = trustedLink(item.releaseURL);
    if (notes) {
      const link = element("a", "inline-document-link", `In ${item.shippedIn}`);
      link.href = notes;
      shipped.append(link);
    } else {
      shipped.append(element("span", "roadmap-meta", `In ${item.shippedIn}`));
    }
    article.append(shipped);
  }
  return article;
};

const renderTracker = (feed) => {
  if (!feed || feed.schemaVersion !== 1 || !Array.isArray(feed.items)) throw new Error("Roadmap feed unavailable");
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
