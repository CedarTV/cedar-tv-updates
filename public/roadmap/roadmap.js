// Fills the roadmap columns from the same release catalog the release notes are rendered from.
const board = document.querySelector("[data-roadmap]");

const formatDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
};

// Catalog links point at the live site; keep them on whichever host serves this page.
const trustedLink = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "cedartv.github.io" && url.pathname.startsWith("/cedar-tv-updates/")) return `${url.pathname}${url.hash}`;
    if (url.hostname === "github.com" && url.pathname.startsWith("/CedarTV/cedar-tv-updates/")) return url.href;
  } catch {}
  return null;
};

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const card = (release) => {
  const article = element("article", "roadmap-card");
  article.append(element("strong", "", release.name));
  const meta = element("p", "roadmap-meta");
  if (/^\d+\.\d+\.\d+$/.test(release.version ?? "") && /^[1-9]\d*$/.test(String(release.build ?? ""))) {
    meta.append(element("span", "", `Version ${release.version} · Build ${release.build}`));
  }
  const date = formatDate(release.date);
  if (date) {
    const time = element("time", "", date);
    time.dateTime = release.date;
    meta.append(time);
  }
  article.append(meta);
  if (typeof release.summary === "string") article.append(element("span", "", release.summary));
  const links = element("p", "roadmap-actions");
  const notes = trustedLink(release.notesURL);
  if (notes) {
    const link = element("a", "inline-document-link", "Release notes");
    link.href = notes;
    links.append(link);
  }
  const download = trustedLink(release.downloadURL);
  if (download) {
    const link = element("a", "inline-document-link", "Download");
    link.href = download;
    links.append(link);
  }
  if (links.childElementCount) article.append(links);
  return article;
};

const render = (catalog) => {
  if (!catalog || catalog.schemaVersion !== 1) return;
  const releases = [...(catalog.previews ?? []), ...(catalog.platforms ?? [])];
  board.querySelectorAll("[data-roadmap-status]").forEach((column) => {
    const cards = column.querySelector(".roadmap-cards");
    const matching = releases.filter((release) => release.status === column.dataset.roadmapStatus);
    cards.replaceChildren(...matching.map(card));
    if (!matching.length) cards.append(element("p", "roadmap-empty", "Nothing here right now."));
  });
};

fetch("../releases/releases.json", { cache: "no-store", credentials: "omit" })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Release catalog unavailable")))
  .then(render)
  .catch(() => {
    board.querySelectorAll("[data-roadmap-status] .roadmap-cards").forEach((cards) => {
      const note = element("p", "roadmap-empty", "The release catalog didn’t load. ");
      const link = element("a", "inline-document-link", "Read the release notes");
      link.href = "/cedar-tv-updates/releases/";
      note.append(link);
      cards.replaceChildren(note);
    });
  });

// Features and known issues come from the live roadmap feed, which only ever holds reviewed,
// public items. Changes made in Cedar Tracker or Discord show up within a minute.
const ROADMAP_FEED = "https://cedar-feedback.cedar-feedback.workers.dev/v1/roadmap";
const platformNames = {
  iphone: "iPhone",
  ipad: "iPad",
  "apple-tv": "Apple TV",
  mac: "Mac",
  "android-tv": "Android TV",
  radio: "Cedar Radio",
  website: "Website",
};
const recentLimit = 6;

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
  if (!feed || feed.schemaVersion !== 1 || !Array.isArray(feed.items)) throw new Error("Tracker feed unavailable");
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

fetch(ROADMAP_FEED, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" })
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("Tracker feed unavailable")))
  .then(renderTracker)
  .catch(() => {
    document.querySelectorAll("[data-tracker-status] .roadmap-cards").forEach((cards) => {
      cards.replaceChildren(element("p", "roadmap-empty", "This list didn’t load. Try again in a moment."));
    });
  });
