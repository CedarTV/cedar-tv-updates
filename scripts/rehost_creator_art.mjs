// Copies Creator setup artwork that is only reachable through another app's image proxy onto the
// Cedar site, and points the setups at the copy.
//
//   node scripts/rehost_creator_art.mjs           download, save to public/creator/art, rewrite creator/setups
//   node scripts/rehost_creator_art.mjs --check   fail if any setup still uses proxied artwork
//
// The proxy wraps the original address in base64. The original is tried first; when it's gone,
// the proxy's copy is used. Files are named by content, so running this again changes nothing.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const setupsDirectory = resolve(root, "creator/setups");
const artDirectory = resolve(root, "public/creator/art");
const artBase = "https://cedartv.github.io/cedar-tv-updates/creator/art/";
export const proxiedArtwork = /https:\/\/get-stranded\.fabriceleven\.com\/img\/remote\/[A-Za-z0-9_-]+=*/g;
const checkOnly = process.argv.includes("--check");

export function originalAddress(proxied) {
  const encoded = proxied.slice(proxied.lastIndexOf("/") + 1).replace(/-/g, "+").replace(/_/g, "/");
  const original = Buffer.from(encoded, "base64").toString("utf8");
  return /^https:\/\/[^\s"'<>]+$/.test(original) ? original : null;
}

/** The file's image type, or null when it isn't a whole JPEG, PNG, GIF or WebP. */
export function imageType(bytes) {
  const ascii = (start, end) => bytes.subarray(start, end).toString("latin1");
  if (bytes.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return bytes.readUInt32LE(4) + 8 === bytes.length ? "webp" : null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9 ? "jpg" : null;
  if (ascii(1, 4) === "PNG") return ascii(bytes.length - 8, bytes.length - 4) === "IEND" ? "png" : null;
  if (ascii(0, 4) === "GIF8") return bytes[bytes.length - 1] === 0x3b ? "gif" : null;
  return null;
}

async function download(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Cedar Creator artwork copy)" }, signal: AbortSignal.timeout(60_000) });
      if (!response.ok) return null;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (imageType(bytes)) return bytes;
    } catch {}
    await new Promise(done => setTimeout(done, attempt * 2000));
  }
  return null;
}

const files = (await readdir(setupsDirectory)).filter(name => /\.(cedar|json)$/.test(name));
const texts = new Map(await Promise.all(files.map(async name => [name, await readFile(resolve(setupsDirectory, name), "utf8")])));
const proxied = [...new Set([...texts.values()].flatMap(text => text.match(proxiedArtwork) || []))].sort();
if (checkOnly) {
  if (proxied.length) throw new Error(`${proxied.length} setup images still load through another app's proxy. Run node scripts/rehost_creator_art.mjs`);
  console.log("No setup artwork depends on another app's proxy.");
  process.exit(0);
}

await mkdir(artDirectory, { recursive: true });
const replacements = new Map();
for (const url of proxied) {
  const original = originalAddress(url);
  const bytes = (original && await download(original)) || await download(url);
  if (!bytes) throw new Error(`Couldn't download ${original || url}`);
  const name = `${createHash("sha256").update(bytes).digest("hex").slice(0, 20)}.${imageType(bytes)}`;
  await writeFile(resolve(artDirectory, name), bytes);
  replacements.set(url, artBase + name);
}
let changed = 0;
for (const [name, text] of texts) {
  const next = text.replace(proxiedArtwork, url => replacements.get(url));
  if (next !== text) { await writeFile(resolve(setupsDirectory, name), next); changed++; }
}
console.log(`Copied ${replacements.size} images to public/creator/art and updated ${changed} setups.`);
