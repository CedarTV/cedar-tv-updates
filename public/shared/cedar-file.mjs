// The one place the website writes Cedar's `.cedar` file layout (CEDAR_FILE_FORMAT.md in the
// Cedar repo). Cedar Studio, Cedar Creator and any converter on this site build their files here,
// so every file the site produces has the same header, the same profile layout and the same seal
// the Cedar apps write and read.
//
// Runs in browsers and in Node 20+ (Web Crypto only).

export const FORMAT_IDENTIFIER = 'app.cedar.bundle';
export const SCHEMA_VERSION = 1;
export const SEAL_ALGORITHM = 'AES-256-GCM/PBKDF2-SHA256';
export const SEAL_ITERATIONS = 310000;

/** Profile file sections, as Cedar's `ProfileImportCategory` raw values, in display order. */
export const CATEGORIES = ['profile', 'sources', 'mediaServers', 'addons', 'apiKeys', 'branches', 'preferences', 'radio', 'watchHistory'];
/** Categories that can hold a login, an address with a token, or personal activity. */
export const SENSITIVE = new Set(['sources', 'mediaServers', 'addons', 'apiKeys', 'radio', 'watchHistory']);
/** Payload key for each category. */
const SECTION = {profile: 'identity', sources: 'sources', mediaServers: 'mediaServers', addons: 'tobaccoTies', apiKeys: 'apiKeys', branches: 'home', preferences: 'preferences', radio: 'radio', watchHistory: 'watchHistory'};

const encoder = new TextEncoder();
const subtle = () => globalThis.crypto.subtle;

/** ISO 8601 without fractional seconds, as Cedar writes dates. */
export const cedarDate = (date = new Date()) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

/** The fields every `.cedar` file starts with (§2.1). Key order matches what Cedar writes. */
export function bundleHeader({kind, bundleID, title, createdAt = cedarDate(), generator}) {
  if (!['branches', 'profile'].includes(kind)) throw Error(`The website writes branches and profile files, not ${kind}.`);
  if (!/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(bundleID || '')) throw Error('A .cedar file needs a UUID bundleID.');
  if (!generator?.application) throw Error('Name the tool that wrote the file in generator.application.');
  const header = {formatIdentifier: FORMAT_IDENTIFIER, schemaVersion: SCHEMA_VERSION, kind, bundleID: bundleID.toUpperCase()};
  if (title) header.title = title;
  if (createdAt) header.createdAt = createdAt;
  header.generator = generator.version ? {application: generator.application, version: generator.version} : {application: generator.application};
  return header;
}

/** A `kind: branches` file (§3). Branches here must never carry logins or tokens. */
export function branchesFile({bundleID, title, createdAt, generator, branches, avatarURL = null, extra = {}}) {
  const file = {...bundleHeader({kind: 'branches', bundleID, title, createdAt, generator}), branches: branches.map((branch, position) => ({...branch, position}))};
  if (avatarURL) file.avatarURL = avatarURL;
  return Object.assign(file, extra);
}

const base64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };
const unbase64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

async function sealKey(passphrase, salt, iterations, usage) {
  const material = await subtle().importKey('raw', encoder.encode(passphrase.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return subtle().deriveKey({name: 'PBKDF2', hash: 'SHA-256', salt, iterations}, material, {name: 'AES-GCM', length: 256}, false, [usage]);
}

/**
 * Seals bytes exactly as Cedar's `CedarSecretBox` does: PBKDF2-HMAC-SHA256 over the NFC
 * passphrase, AES-256-GCM with `app.cedar.bundle` as additional data, and nonce + ciphertext +
 * tag as one Base64 value.
 */
export async function seal(plaintext, passphrase, {iterations = SEAL_ITERATIONS} = {}) {
  if (!passphrase) throw Error('Choose a passphrase to lock this file.');
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await sealKey(passphrase, salt, iterations, 'encrypt');
  const data = typeof plaintext === 'string' ? encoder.encode(plaintext) : plaintext;
  const box = new Uint8Array(await subtle().encrypt({name: 'AES-GCM', iv: nonce, additionalData: encoder.encode(FORMAT_IDENTIFIER), tagLength: 128}, key, data));
  const combined = new Uint8Array(nonce.length + box.length);
  combined.set(nonce); combined.set(box, nonce.length);
  return {algorithm: SEAL_ALGORITHM, iterations, salt: base64(salt), sealed: base64(combined)};
}

/** Opens a value from `seal` (or one Cedar wrote). Throws on a wrong passphrase. */
export async function open(sealed, passphrase) {
  if (sealed?.algorithm !== SEAL_ALGORITHM || !(sealed.iterations >= 10000 && sealed.iterations <= 10000000)) throw Error('This file is locked in a way this page cannot read.');
  const combined = unbase64(sealed.sealed), salt = unbase64(sealed.salt);
  const key = await sealKey(passphrase, salt, sealed.iterations, 'decrypt');
  try {
    return new Uint8Array(await subtle().decrypt({name: 'AES-GCM', iv: combined.subarray(0, 12), additionalData: encoder.encode(FORMAT_IDENTIFIER), tagLength: 128}, key, combined.subarray(12)));
  } catch { throw Error('That passphrase doesn’t unlock this file.'); }
}

function categoriesOf(payload) {
  return CATEGORIES.filter(category => payload[SECTION[category]] != null);
}

function countsOf(payload) {
  const counts = {};
  const length = value => Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0;
  if (payload.identity) counts.profile = 1;
  if (payload.sources) counts.sources = length(payload.sources.providers);
  if (payload.mediaServers) counts.mediaServers = length(payload.mediaServers);
  if (payload.tobaccoTies) counts.addons = length(payload.tobaccoTies.ties);
  if (payload.apiKeys) counts.apiKeys = length(payload.apiKeys);
  if (payload.home) counts.branches = length(payload.home.branches);
  if (payload.preferences) counts.preferences = length(payload.preferences);
  if (payload.radio) counts.radio = length(payload.radio.stations);
  if (payload.watchHistory) counts.watchHistory = length(payload.watchHistory.titles);
  return counts;
}

/**
 * A `kind: profile` file (§9). `payload` holds only the sections being written, using the
 * payload keys in CEDAR_FILE_FORMAT.md §9.2 (`identity`, `sources`, `tobaccoTies`, `home`, …).
 *
 * With a passphrase the whole payload is sealed. A payload with any sensitive section needs one.
 */
export async function profileFile({bundleID, title, createdAt, generator, payload, passphrase = ''}) {
  const header = bundleHeader({kind: 'profile', bundleID, title, createdAt, generator});
  for (const key of Object.keys(payload)) if (!Object.values(SECTION).includes(key)) throw Error(`Unknown profile section ${key}.`);
  const categories = categoriesOf(payload);
  if (!categories.length) throw Error('Choose at least one thing to put in the profile file.');
  if (!passphrase && categories.some(c => SENSITIVE.has(c))) throw Error('Tobacco Ties, logins and history are only ever saved locked. Choose a passphrase.');
  const file = {...header, contents: {categories: [...categories].sort(), counts: countsOf(payload)}};
  if (passphrase) file.sealed = await seal(JSON.stringify(payload), passphrase);
  else file.payload = payload;
  return file;
}

/** Reads a profile file's payload, unlocking it when sealed. */
export async function openProfileFile(file, passphrase = '') {
  if (file?.formatIdentifier !== FORMAT_IDENTIFIER || file.kind !== 'profile') throw Error('This is not a Cedar profile file.');
  if (file.payload) return file.payload;
  return JSON.parse(new TextDecoder().decode(await open(file.sealed, passphrase)));
}

// MARK: Tobacco Ties found in other apps' exports

const manifestPattern = /^https:\/\/[^\s"'<>]+\/manifest\.json(?:\?[^\s"'<>#]*)?$/i;

/**
 * Every add-on manifest address in another app's export, with whatever the export says about it
 * (`manifest.id`, `manifest.name`). These are the owner's own configured addresses and can carry
 * their access token, so they only ever go into a sealed profile file.
 */
export function findTobaccoTies(data) {
  const found = new Map();
  const visit = (value, depth) => {
    if (depth > 12 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && manifestPattern.test(child.trim()) && /url|manifest|transport|link|address/i.test(key)) {
        const url = new URL(child.trim());
        if (url.username || url.password) continue;
        const manifest = value.manifest && typeof value.manifest === 'object' ? value.manifest : {};
        const entry = found.get(url.href) || {url: url.href};
        if (typeof manifest.id === 'string' && !entry.manifestID) entry.manifestID = manifest.id;
        if (typeof (manifest.name ?? value.name) === 'string' && !entry.name) entry.name = String(manifest.name ?? value.name).slice(0, 200);
        found.set(url.href, entry);
      } else visit(child, depth + 1);
    }
  };
  visit(data, 0);
  return [...found.values()];
}

/** Pasted addresses, one per line or separated by spaces. */
export function parseTobaccoTieLinks(text) {
  return String(text || '').split(/\s+/).map(v => v.trim()).filter(Boolean).map(value => {
    let url;
    try { url = new URL(value); } catch { throw Error(`${value.slice(0, 60)} is not a link.`); }
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw Error('Tobacco Tie links must be https addresses without a login or #fragment.');
    if (!/\/manifest\.json$/i.test(url.pathname)) url.pathname = url.pathname.replace(/\/(configure)?\/?$/i, '') + '/manifest.json';
    return {url: url.href};
  });
}

/**
 * The add-on family behind an ID: Xperience and similar services add the owner's UUID
 * (`app.xperience.<uuid>`), so two owners' copies are the same Tobacco Tie with different IDs.
 */
export const addonFamily = id => String(id || '').toLowerCase().replace(/[.\-_]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, '');
