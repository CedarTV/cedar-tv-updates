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
