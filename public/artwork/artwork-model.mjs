export const siteBase = "https://cedartv.github.io/cedar-tv-updates/";
export function artworkURL(path, kind) {
  const url = new URL(path.startsWith("/") ? path.slice(1) : path, siteBase);
  const prefix = kind === "avatars" ? "/cedar-tv-updates/avatars/" : "/cedar-tv-updates/badge-packs/";
  if (url.origin !== new URL(siteBase).origin || !url.pathname.startsWith(prefix)
      || url.username || url.password || url.search || url.hash) throw new Error("Invalid artwork URL");
  return url.href;
}
export function appURL(source, kind) {
  const link = new URL(`cedar://artwork/${kind === "avatars" ? "avatar" : "badges"}`);
  link.searchParams.set("url", artworkURL(source, kind));
  return link.href;
}
export function matchingOptions(options, query) {
  const text = query.trim().toLowerCase();
  return options.filter(option => `${option.name || option.label} ${option.source || ""} ${option.category || ""} ${option.creator || ""} ${option.style || ""}`.toLowerCase().includes(text));
}

export const avatarCategory = option => option.category?.trim() || "Uncategorized";
export function avatarCategories(options) {
  return [...new Set(options.map(avatarCategory))].sort((a, b) => a.localeCompare(b));
}
export function avatarOptions(options, query, category = "", sort = "featured") {
  const matches = matchingOptions(options, query).filter(option => !category || avatarCategory(option) === category);
  if (sort === "category") matches.sort((a, b) => avatarCategory(a).localeCompare(avatarCategory(b)) || a.name.localeCompare(b.name));
  if (sort === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
  return matches;
}
