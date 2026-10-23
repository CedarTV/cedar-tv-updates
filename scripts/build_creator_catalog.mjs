// Builds Cedar Creator's public files from the curated setups in creator/.
//
//   node scripts/build_creator_catalog.mjs --write   regenerate public/creator/items and the catalog
//   node scripts/build_creator_catalog.mjs --check   fail if the published files are out of date
//
// Every setup and every top-level branch (a "group") becomes its own .cedar file, so Cedar can
// fetch any cart item by its ID. Files that would not survive Cedar's Branches import, or that
// could carry an account, are rejected here instead of being published.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { groupID, isBranchGroup, isSetupID, makeBundle, rowCount } from "../public/creator/creator-model.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const itemsDirectory = resolve(root, "public/creator/items");
const catalogPath = resolve(root, "public/catalogs/creator.json");
// Hosts the Creator page may show previews from; see its Content-Security-Policy.
export const previewImageHosts = ["image.tmdb.org", "media.themoviedb.org", "raw.githubusercontent.com"];
const previewImageHostSuffixes = [".github.io"];
const secretKeyPattern = /(api[-_]?key|token|secret|password|passwd|auth|session|cookie|credential)/i;
// Cedar's BranchLeafKind. An unknown value makes Cedar reject the whole file.
const categoryKinds = new Set(["network", "studio", "company", "genre", "decade", "director", "actor", "award"]);
const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

const argumentsList = process.argv.slice(2);
const checkOnly = argumentsList.includes("--check");
if (argumentsList.length !== 1 || !["--check", "--write"].includes(argumentsList[0])) {
  throw new Error("usage: node scripts/build_creator_catalog.mjs --write | --check");
}

const warnings = [];
const fail = message => { throw new Error(message); };

function isPortable(source, path) {
  if (!source) return;
  if (source.kind === "connectedSource") fail(`${path} uses the curator's own source`);
  if (source.kind === "tobaccoTie") fail(`${path} uses a Tobacco Tie`);
  if (source.kind === "custom" && source.identifier === "cedar.catalog-link") fail(`${path} uses an add-on catalog link`);
}

function inspectStrings(value, path) {
  if (Array.isArray(value)) return value.forEach((item, index) => inspectStrings(item, `${path}[${index}]`));
  if (!value || typeof value !== "object") {
    if (typeof value === "string" && /^(?:[a-z][a-z0-9+.-]*:\/\/|javascript:|data:|vbscript:)/i.test(value.trim()) && !value.startsWith("https://")) {
      fail(`${path} must use an https link`);
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (secretKeyPattern.test(key)) fail(`${path}.${key} looks like a credential`);
    if (typeof child === "string" && child.startsWith("https://")) {
      const url = new URL(child);
      if (url.username || url.password) fail(`${path}.${key} carries sign-in details`);
      if ([...url.searchParams.keys()].some(name => secretKeyPattern.test(name))) fail(`${path}.${key} carries a credential in its query`);
      if (url.host === "get-stranded.fabriceleven.com") fail(`${path}.${key} loads through another app's image proxy; run node scripts/rehost_creator_art.mjs`);
    }
    inspectStrings(child, `${path}.${key}`);
  }
}

function previewImage(url) {
  if (!url) return null;
  const parsed = new URL(url);
  const allowed = previewImageHosts.includes(parsed.host) || previewImageHostSuffixes.some(suffix => parsed.host.endsWith(suffix));
  if (!allowed) return null;
  // Full-size TMDB art is several megabytes; cards only need a modest size.
  if (parsed.host === "image.tmdb.org") parsed.pathname = parsed.pathname.replace(/^\/t\/p\/original\//, "/t/p/w780/");
  return parsed.href;
}

function readBranches(document, file) {
  if (document.formatIdentifier === "app.cedar.home-branches" && document.schemaVersion === 1) return document.branches;
  if (document.formatIdentifier === "app.cedar.bundle" && document.kind === "branches") return document.branches;
  return fail(`${file} must be a Cedar Branches export (.cedar with kind "branches", or Home branches JSON)`);
}

const manifest = JSON.parse(await readFile(resolve(root, "creator/setups.json"), "utf8"));
const files = new Map();
const setups = [];
const branchIDs = new Set();
for (const entry of manifest.setups) {
  if (!isSetupID(entry.id)) fail(`setup id "${entry.id}" must be lowercase words joined by hyphens`);
  if (setups.some(setup => setup.id === entry.id)) fail(`setup id "${entry.id}" is used twice`);
  for (const field of ["title", "creator", "description", "addedAt", "file"]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) fail(`${entry.id} needs a ${field}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.addedAt)) fail(`${entry.id} addedAt must be YYYY-MM-DD`);
  const credit = entry.credit;
  if (!credit || !["Cedar", "Strand", "Fusion", "Nuvio"].includes(credit.platform)) fail(`${entry.id} needs credit.platform (Cedar, Strand, Fusion or Nuvio)`);
  if (credit.sourceURL != null && !/^https:\/\/[^\s"<>]+$/.test(credit.sourceURL)) fail(`${entry.id} credit.sourceURL must be an https link`);
  // Credits travel inside every published file, so a downloaded setup still says who made it.
  const credits = { creator: entry.creator, platform: credit.platform, via: credit.via || null, sourceURL: credit.sourceURL || null };
  const document = JSON.parse(await readFile(resolve(root, "creator/setups", entry.file), "utf8"));
  const branches = readBranches(document, entry.file)
    .filter(branch => branch.isEnabled !== false)
    .sort((a, b) => a.position - b.position);
  if (!branches.length) fail(`${entry.id} has no enabled branches`);

  const groups = [];
  for (const branch of branches) {
    const path = `${entry.id} / ${branch.title}`;
    if (!uuidPattern.test(branch.id)) fail(`${path} needs a UUID id`);
    if (branchIDs.has(branch.id.toUpperCase())) fail(`${path} reuses a branch id from another setup; re-export it so each branch is unique`);
    branchIDs.add(branch.id.toUpperCase());
    inspectStrings(branch, path);
    isPortable(branch.dataSource, path);
    for (const folder of branch.folderOptions || []) {
      isPortable(folder.dataSource, `${path} / ${folder.title}`);
      if (folder.categoryIdentity && !categoryKinds.has(folder.categoryIdentity.kind)) {
        fail(`${path} / ${folder.title}: categoryIdentity kind "${folder.categoryIdentity.kind}" is not one Cedar reads (${[...categoryKinds].join(", ")})`);
      }
      for (const source of folder.sources || []) isPortable(source.dataSource, `${path} / ${folder.title} / ${source.title}`);
      for (const key of ["coverImageURL", "heroBackdropURL"]) {
        if (folder[key] && !previewImage(folder[key])) warnings.push(`${path} / ${folder.title}: ${key} is hosted on ${new URL(folder[key]).host}`);
      }
    }
    const id = groupID(entry.id, branch.id);
    if (groups.some(group => group.id === id)) fail(`${path} shares its short id with another branch in this setup`);
    const createdAt = `${entry.addedAt}T00:00:00Z`;
    files.set(`${id}.cedar`, makeBundle({ title: branch.title, createdAt, branches: [branch], credits }));
    groups.push({
      id,
      title: branch.title,
      kind: isBranchGroup(branch) ? "group" : "row",
      layout: branch.presentation?.templateID || null,
      rows: (branch.folderOptions || []).map(folder => folder.title),
      branchCount: rowCount(branch),
      covers: (branch.folderOptions || []).map(folder => previewImage(folder.coverImageURL) || previewImage(folder.heroBackdropURL)).filter(Boolean).slice(0, 6),
    });
  }
  files.set(`${entry.id}.cedar`, makeBundle({ title: entry.title, createdAt: `${entry.addedAt}T00:00:00Z`, branches, credits }));
  setups.push({
    id: entry.id,
    title: entry.title,
    creator: entry.creator,
    description: entry.description,
    tags: entry.tags || [],
    addedAt: entry.addedAt,
    credit: { platform: credit.platform, via: credit.via || null, sourceURL: credit.sourceURL || null, conversion: credit.conversion || null },
    groupCount: groups.length,
    branchCount: groups.reduce((total, group) => total + group.branchCount, 0),
    covers: groups.flatMap(group => group.covers).slice(0, 4),
    groups,
  });
}

const catalog = `${JSON.stringify({ version: 1, setups }, null, 2)}\n`;
const rendered = new Map([...files].map(([name, bundle]) => [name, `${JSON.stringify(bundle)}\n`]));
const existing = new Set((await readdir(itemsDirectory).catch(() => [])).filter(name => name.endsWith(".cedar")));

if (checkOnly) {
  const stale = [];
  if ((await readFile(catalogPath, "utf8").catch(() => "")) !== catalog) stale.push("public/catalogs/creator.json");
  for (const [name, contents] of rendered) {
    if ((await readFile(resolve(itemsDirectory, name), "utf8").catch(() => "")) !== contents) stale.push(`public/creator/items/${name}`);
  }
  for (const name of existing) if (!rendered.has(name)) stale.push(`public/creator/items/${name} (no longer in creator/setups.json)`);
  if (stale.length) fail(`Creator files are out of date; run node scripts/build_creator_catalog.mjs --write\n  ${stale.join("\n  ")}`);
} else {
  await mkdir(itemsDirectory, { recursive: true });
  for (const name of existing) if (!rendered.has(name)) await rm(resolve(itemsDirectory, name));
  for (const [name, contents] of rendered) await writeFile(resolve(itemsDirectory, name), contents, "utf8");
  await writeFile(catalogPath, catalog, "utf8");
}

if (warnings.length && !checkOnly) {
  console.warn(`${warnings.length} artwork links point outside Cedar's preview hosts. They still work in Cedar, but the website shows a placeholder:`);
  for (const warning of warnings.slice(0, 8)) console.warn(`  ${warning}`);
  if (warnings.length > 8) console.warn(`  …and ${warnings.length - 8} more`);
}
console.log(`${checkOnly ? "Verified" : "Built"} ${setups.length} Creator setups and ${rendered.size} item files`);
