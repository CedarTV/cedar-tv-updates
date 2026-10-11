// Adds community setups to Cedar Creator, keeping who made them and where they were shared.
//
//   node scripts/import_creator_sources.mjs <source folder> <converted folder>
//
// <source folder> is a "Cedar Creator" collection with manifest.json (title, creator, platform,
// source link and description for every item). <converted folder> holds the branches-only .cedar
// files and report.json written by Cedar's own importers (the CreatorCatalogConversion tool in the
// Cedar app repository), so no Strand, Fusion or Nuvio file is published as-is and no source,
// key or login can come along. Entries already in creator/setups.json are updated in place.
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [sourceFolder, convertedFolder] = process.argv.slice(2);
if (!sourceFolder || !convertedFolder) throw new Error("usage: node scripts/import_creator_sources.mjs <source folder> <converted folder>");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "creator/setups.json");
const catalog = JSON.parse(await readFile(manifestPath, "utf8"));
const source = JSON.parse(await readFile(resolve(sourceFolder, "manifest.json"), "utf8"));
const report = new Map(JSON.parse(await readFile(resolve(convertedFolder, "report.json"), "utf8")).map(item => [item.id, item]));

const origins = {
  Strand: { platform: "Strand", via: "Get Stranded", viaURL: "https://get-stranded.fabriceleven.com" },
  Fusion: { platform: "Fusion", via: "Fusion Starter Kit by itsrenoria", viaURL: "https://kit.betterer.cc" },
  Nuvio: { platform: "Nuvio", via: "Nuvio community", viaURL: null },
};
// The Nuvio master collection credits several curators and artists (CREDITS.md §3).
const nuvioCreators = "ImKaptain, bramst0ne, luckynumb3rs and the Nuvio community";
const tagWords = { genres: "Genres", decades: "Decades", streaming: "Streaming", studios: "Studios", awards: "Awards", directors: "Directors", anime: "Anime", movies: "Movies", series: "Series", spotlight: "Spotlight", discover: "Discover", networks: "Networks", kids: "Kids" };

const slug = text => text.normalize("NFKD").replace(/[^\w\s-]/g, " ").toLowerCase().replace(/[_\s.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const title = text => text.replace(/\b\w/g, letter => letter.toUpperCase());
const firstParagraph = text => (text || "").split(/\n\s*\n/)[0].trim().slice(0, 320);

/// Fusion shelf files name their topic, layout, designer and variant: widgets-sourced-genres-square-orangebyte-color.
function fusionShelf(id) {
  const [topic, layout, designer, ...variant] = id.replace(/^widgets-sourced-/, "").split("-");
  const name = `${title(topic)} (${[title(layout), ...variant.map(title)].join(", ")})`;
  return { name, designer, topic };
}

function entryFor(item) {
  // Fusion "collection" files hold the same shelves as their widget files, under a generic title.
  if (item.id.startsWith("collections-")) return null;
  const result = report.get(item.id);
  if (!result || result.error || result.branches === 0) return null;
  const origin = origins[item.platform];
  let name = item.title;
  let creator = item.creator;
  let description = firstParagraph(item.description);
  const tags = new Set((item.tags || []).map(tag => tagWords[tag.replace(/^shelves:/, "").toLowerCase()]).filter(Boolean));
  if (item.id.startsWith("widgets-sourced-")) {
    const shelf = fusionShelf(item.id);
    name = shelf.name;
    creator = shelf.designer;
    description = `A ${shelf.topic} shelf with built-in sources, designed by ${shelf.designer} for Fusion.`;
    if (tagWords[shelf.topic]) tags.add(tagWords[shelf.topic]);
  } else if (item.platform === "Fusion") {
    name = `${item.creator.replace(/\s*\p{Extended_Pictographic}/gu, "").trim()}’s Fusion Home`;
    description = `A complete Fusion home screen curated by ${item.creator}, as ${result.branches} Cedar branches.`;
  } else if (item.platform === "Nuvio") {
    name = "Nuvio Community Collection";
    creator = nuvioCreators;
    description = "The Nuvio community’s master collection: spotlight, discover, streaming services, networks, genres, moods, franchises, actors, directors, studios, decades, anime, awards, world cinema and more.";
  }
  if (/kids/i.test(name)) tags.add("Kids");

  const skipped = result.issues.filter(issue => /Skipped/.test(issue)).length;
  const broadened = result.issues.filter(issue => /broader|default discovery order|standard poster layout/.test(issue)).length;
  const notes = [];
  if (skipped) notes.push(`${skipped} ${skipped === 1 ? "part" : "parts"} that Cedar can’t show yet were left out`);
  if (broadened) notes.push(`${broadened} ${broadened === 1 ? "filter" : "filters"} Cedar doesn’t support were relaxed, so some rows may show more titles`);
  return {
    id: item.platform === "Strand" ? slug(name)
      : item.platform === "Nuvio" ? "nuvio-community-collection"
      : slug(item.id.replace(/^widgets-sourced-/, "fusion-")),
    file: `${item.id}.cedar`,
    title: name,
    creator,
    description: description || `${result.branches} ${result.branches === 1 ? "branch" : "branches"} converted from ${origin.platform}.`,
    tags: [...tags].sort(),
    addedAt: source.generatedAt.slice(0, 10),
    credit: {
      platform: origin.platform,
      via: origin.via,
      sourceURL: item.sourceUrl || origin.viaURL,
      ...(notes.length ? { conversion: `Converted from ${origin.platform}. ${notes.join("; ")}.` } : { conversion: `Converted from ${origin.platform}.` }),
    },
    rank: item.upvotes ?? 0,
    // Strand setups, then Fusion homes, the Nuvio collection, and single Fusion shelves last.
    group: item.platform === "Strand" ? 0 : item.id.startsWith("widgets-sourced-") ? 3 : item.platform === "Fusion" ? 1 : 2,
  };
}

const imported = source.items.map(entryFor).filter(Boolean);
// Titles such as "Decades" and "Genres" are shared by several creators.
const counts = imported.reduce((map, entry) => map.set(entry.id, (map.get(entry.id) || 0) + 1), new Map());
for (const entry of imported) if (counts.get(entry.id) > 1) entry.id = `${entry.id}-${slug(entry.creator)}`;

imported.sort((a, b) => a.group - b.group || b.rank - a.rank || a.title.localeCompare(b.title));

const kept = catalog.setups.filter(entry => !imported.some(item => item.id === entry.id));
for (const entry of imported) {
  await copyFile(resolve(convertedFolder, entry.file), resolve(root, "creator/setups", entry.file));
  delete entry.rank;
  delete entry.group;
}
catalog.setups = [...kept, ...imported];
await writeFile(manifestPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Imported ${imported.length} credited setups (${kept.length} existing kept)`);
