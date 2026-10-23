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
  return options.filter(option => `${option.name || option.label} ${option.name ? avatarName(option) : ""} ${option.source || ""} ${option.category || ""} ${option.creator || ""} ${option.style || ""}`.toLowerCase().includes(text));
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

/** A photo's name for people. Some catalog names are file names ("bingo-bluey-profile-avatar"). */
export function avatarName(option) {
  const name = String(option?.name || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(name)) return name || "Profile photo";
  return name.replace(/-(?:profile-)?avatars?$/i, "").split("-").filter(Boolean)
    .map(word => word.length <= 2 && word !== "of" ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)).join(" ");
}

// The badges a card shows: what a 4K Remux with Dolby Vision, HDR10+ and Atmos would get.
const sampleBadgeNames = [["4k", "4k ultra hd", "2160p", "uhd"], ["remux", "best remux", "remux 1"], ["dolby vision", "dv"], ["hdr10+", "hdr10", "hdr"], ["atmos", "dolby atmos", "truehd", "atmos+dv"]];
/** Up to five badges from a set: the common ones when it has them, otherwise its first. */
export function sampleBadges(set, count = 5) {
  const badges = (set?.badges || []).filter(badge => badge.enabled !== false && badge.imageURL);
  const byName = new Map(badges.map(badge => [String(badge.name).toLowerCase(), badge]));
  const picked = sampleBadgeNames.map(names => names.map(name => byName.get(name)).find(Boolean)).filter(Boolean);
  for (const badge of badges) if (picked.length < count && !picked.includes(badge)) picked.push(badge);
  return picked.slice(0, count);
}
