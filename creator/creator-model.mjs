// Pure Creator logic shared by the page, the catalog build script and tests. No DOM access.
import { branchesFile } from "../shared/cedar-file.mjs";
export const siteBase = "https://cedartv.github.io/cedar-tv-updates/";
export const appCartBase = "cedar://creator/cart";
// Every Creator file shares one bundle ID, so Cedar namespaces a branch the same way whether it
// arrives alone, inside its whole setup, or in any cart. Re-importing updates it in place.
export const creatorBundleID = "EEF15CF5-D85F-422E-8F05-E647A430BCAB";
export const maximumCartItems = 40;

const setupIDPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const itemIDPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[0-9a-f]{8})?$/;
const avatarPathPattern = /^avatars\/[a-z0-9_-]+\/[a-z0-9_-]+\.webp$/i;
const badgePackIDPattern = /^[a-z0-9_]{1,80}$/;

export const isSetupID = id => typeof id === "string" && setupIDPattern.test(id);
export const isItemID = id => typeof id === "string" && id.length <= 120 && itemIDPattern.test(id);
export const isAvatarPath = path => typeof path === "string" && avatarPathPattern.test(path);
/// A source-badge pack on this site, by its file name under `badge-packs/` (for example `xp_aurora`).
export const isBadgePackID = id => typeof id === "string" && badgePackIDPattern.test(id);
export const groupID = (setupID, branchID) => `${setupID}.${branchID.slice(0, 8).toLowerCase()}`;
export const setupOf = itemID => itemID.split(".")[0];
export const itemFileURL = id => {
  if (!isItemID(id)) throw new Error("Invalid Creator item");
  return `${siteBase}creator/items/${id}.cedar`;
};
export const avatarURL = path => {
  if (!isAvatarPath(path)) throw new Error("Invalid avatar");
  return siteBase + path;
};
export const badgePackURL = id => {
  if (!isBadgePackID(id)) throw new Error("Invalid badge pack");
  return `${siteBase}badge-packs/${id}.json`;
};

// MARK: Branch summaries

export const isBranchGroup = branch => branch.dataSource?.kind === "custom" && branch.dataSource?.identifier === "cedar.branch-group";
export const rowCount = branch => branch.folderOptions?.length || 1;

// MARK: Browsing

export function setupTags(setups) {
  return [...new Set(setups.flatMap(setup => setup.tags || []))].sort((a, b) => a.localeCompare(b));
}


/// The Setups tab's sections, in order. A setup's `section` is one of these IDs.
export const setupSections = [
  { id: "home", title: "Complete Homes", note: "Whole Homes, ready to use as they are." },
  { id: "themed", title: "Themed", note: "Smaller setups built around one idea." },
  { id: "style", title: "Styles", note: "One group in different artwork. Pick the look you like." },
];
/// Card shapes for the shape filter: the catalog's tileShape and its label.
export const setupShapes = [["poster", "Poster"], ["landscape", "Wide"], ["square", "Square"]];

export function setupOptions(setups, { query = "", tag = "", shape = "", sort = "featured" } = {}) {
  const text = query.trim().toLowerCase();
  const matches = setups.filter(setup => {
    if (tag && !(setup.tags || []).includes(tag)) return false;
    if (shape && !(setup.shapes || []).includes(shape)) return false;
    if (!text) return true;
    const haystack = [setup.title, setup.creator, setup.description, setup.credit?.via, setup.style?.group, setup.style?.variant, ...(setup.tags || []),
      ...setup.groups.flatMap(group => [group.title, ...group.rows])].join(" ").toLowerCase();
    return haystack.includes(text);
  });
  const featured = new Map(setups.map((setup, index) => [setup.id, index]));
  const byFeatured = (a, b) => featured.get(a.id) - featured.get(b.id);
  if (sort === "largest") matches.sort((a, b) => b.branchCount - a.branchCount || byFeatured(a, b));
  else if (sort === "smallest") matches.sort((a, b) => a.branchCount - b.branchCount || byFeatured(a, b));
  else if (sort === "name") matches.sort((a, b) => a.title.localeCompare(b.title));
  else matches.sort(byFeatured);
  return matches;
}

/// Splits setups (already filtered and sorted) into the tab's sections. Style setups fold into one
/// card per style group ("Genres"), its variants kept in the order given. Empty sections are left out.
export function setupSectionsOf(options) {
  return setupSections.map(section => {
    const items = [];
    const styles = new Map();
    for (const setup of options.filter(item => (item.section || "home") === section.id)) {
      if (!setup.style) { items.push({ type: "setup", setup }); continue; }
      let card = styles.get(setup.style.group);
      if (!card) {
        card = { type: "style", group: setup.style.group, variants: [] };
        styles.set(setup.style.group, card);
        items.push(card);
      }
      card.variants.push(setup);
    }
    return { ...section, items };
  }).filter(section => section.items.length);
}

// MARK: Cart
// Entries are { type: "setup" | "group" | "avatar" | "badges", id }. Order is the order branches
// are added to Home. A cart holds at most one avatar and one badge pack; they are applied to the
// profile, not ordered.

const profileTypes = new Set(["avatar", "badges"]);
export const entryKey = entry => `${entry.type}:${entry.id}`;
export const branchEntries = cart => cart.filter(entry => !profileTypes.has(entry.type));
export const avatarEntry = cart => cart.find(entry => entry.type === "avatar") || null;
export const badgePackEntry = cart => cart.find(entry => entry.type === "badges") || null;
const profileEntries = cart => cart.filter(entry => profileTypes.has(entry.type));

/// Returns { cart, status } where status is "added", "replaced", "included", "duplicate" or "full".
export function addToCart(cart, entry) {
  if (cart.some(existing => entryKey(existing) === entryKey(entry))) return { cart, status: "duplicate" };
  if (profileTypes.has(entry.type)) {
    const replaced = cart.some(existing => existing.type === entry.type);
    return { cart: [...cart.filter(existing => existing.type !== entry.type), entry], status: replaced ? "replaced" : "added" };
  }
  if (entry.type === "group" && cart.some(existing => existing.type === "setup" && existing.id === setupOf(entry.id))) {
    return { cart, status: "included" };
  }
  let next = cart;
  let status = "added";
  if (entry.type === "setup") {
    // The whole setup takes the place of any of its groups that were already in the cart.
    const firstGroup = cart.findIndex(existing => existing.type === "group" && setupOf(existing.id) === entry.id);
    if (firstGroup >= 0) {
      next = cart.filter(existing => !(existing.type === "group" && setupOf(existing.id) === entry.id));
      next.splice(Math.min(firstGroup, next.length), 0, entry);
      return { cart: next, status: "replaced" };
    }
  }
  if (branchEntries(next).length >= maximumCartItems) return { cart, status: "full" };
  return { cart: [...next, entry], status };
}

export const removeFromCart = (cart, key) => cart.filter(entry => entryKey(entry) !== key);

/// Moves a branch entry from one position to another within the branch entries only.
export function moveInCart(cart, from, to) {
  const branches = branchEntries(cart);
  if (from < 0 || from >= branches.length || to < 0 || to >= branches.length || from === to) return cart;
  const [moved] = branches.splice(from, 1);
  branches.splice(to, 0, moved);
  return [...branches, ...profileEntries(cart)];
}

export function cartQuery(cart) {
  const query = new URLSearchParams();
  for (const entry of branchEntries(cart)) query.append("i", entry.id);
  const avatar = avatarEntry(cart);
  if (avatar) query.set("a", avatar.id);
  const badges = badgePackEntry(cart);
  if (badges) query.set("b", badges.id);
  return query.toString();
}
export const cartWebLink = cart => `${siteBase}creator/?${cartQuery(cart)}`;
export const cartAppLink = cart => `${appCartBase}?${cartQuery(cart)}`;

/// Reads a cart from a query string. Unknown or malformed items are dropped, never guessed. An item
/// listed in `replaced` (the catalog's retired setups) is read as its replacement.
export function parseCart(search, knownItemIDs = null, replaced = {}) {
  const query = new URLSearchParams(search);
  let cart = [];
  for (const requested of query.getAll("i")) {
    const id = Object.hasOwn(replaced, requested) ? replaced[requested] : requested;
    if (!isItemID(id) || (knownItemIDs && !knownItemIDs.has(id))) continue;
    cart = addToCart(cart, { type: id.includes(".") ? "group" : "setup", id }).cart;
  }
  const avatar = query.get("a");
  if (avatar && isAvatarPath(avatar)) cart = addToCart(cart, { type: "avatar", id: avatar }).cart;
  const badges = query.get("b");
  if (badges && isBadgePackID(badges)) cart = addToCart(cart, { type: "badges", id: badges }).cart;
  return cart;
}

// MARK: Files

export function makeBundle({ title, createdAt, branches, avatar = null, badgePack = null, credits = null }) {
  // `credits` is Creator's attribution block (CEDAR_FILE_FORMAT.md §3), kept with every item.
  return branchesFile({
    bundleID: creatorBundleID,
    title,
    createdAt,
    generator: { application: "Cedar Creator" },
    branches,
    avatarURL: avatar,
    badgePackURL: badgePack,
    extra: credits ? { credits } : {},
  });
}

/// Combines downloaded item files in cart order. A branch that appears twice is kept once.
export function mergeCart(cart, filesByID, createdAt = new Date().toISOString().replace(/\.\d+Z$/, "Z")) {
  const seen = new Set();
  const branches = [];
  const titles = [];
  const credits = [];
  for (const entry of branchEntries(cart)) {
    const file = filesByID[entry.id];
    if (!file || !Array.isArray(file.branches)) throw new Error(`Missing ${entry.id}`);
    titles.push(file.title);
    if (file.credits && !credits.some(credit => JSON.stringify(credit) === JSON.stringify(file.credits))) credits.push(file.credits);
    for (const branch of file.branches) {
      if (seen.has(branch.id)) continue;
      seen.add(branch.id);
      branches.push(branch);
    }
  }
  const avatar = avatarEntry(cart);
  const badges = badgePackEntry(cart);
  return makeBundle({
    title: titles.length === 1 ? titles[0] : "Cedar Creator selection",
    createdAt,
    branches,
    avatar: avatar ? avatarURL(avatar.id) : null,
    badgePack: badges ? badgePackURL(badges.id) : null,
    credits: credits.length === 1 ? credits[0] : credits.length ? credits : null,
  });
}

export function downloadName(cart, catalogTitle) {
  const branches = branchEntries(cart);
  const base = branches.length === 1 && catalogTitle ? catalogTitle : `Cedar Creator ${branches.length || 0} items`;
  return `${base.replace(/[^A-Za-z0-9 _-]+/g, "").trim().replace(/\s+/g, "-") || "Cedar-Creator"}.cedar`;
}
