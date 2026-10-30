// Bearer envelope: possession of the complete code grants access to its address.
// AES-256-GCM, 12-byte nonce, 16-byte tag, UTF-8 prefix as authenticated data.
export const PREFIX = 'cedar-tie1.';
export const LINK_PREFIX = 'cedar://tie/';
export const USERNAME_PREFIX = 'cedar-user1.';
export const PASSWORD_PREFIX = 'cedar-pass1.';
export const SERVER_URL = 'https://cedartv.github.io/cedar-tv-updates/';
export const MAX_BUNDLE_COUNT = 20;
export const MAX_BUNDLE_BYTES = 65536;
const encoder = new TextEncoder();
function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function validateAddress(value) {
  const input = value.trim();
  if (!input) throw new Error('Paste your Cedar Library URL to create your tie.');
  if (encoder.encode(input).length > 4096) throw new Error('This address is too long. Use an address under 4,096 bytes.');
  if (/\s|\\/.test(input)) throw new Error('The address contains a space, line break, or backslash. Check it and try again.');
  let url;
  try { url = new URL(input); } catch { throw new Error('Enter a complete address beginning with https:// or http://.'); }
  // Self-hosted servers may only offer HTTP. Cedar asks before installing one; HTTPS stays preferred.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Use an address beginning with https:// or http://.');
  if (url.username || url.password) throw new Error('Use your Cedar Library’s configured address rather than a URL with a username and password before the hostname.');
  if (input.includes('#')) throw new Error('Remove the fragment after # from this address.');
  let path = url.pathname.replace(/\/+$/, '');
  if (/\/configure$/i.test(path)) path = path.slice(0, -10);
  if (!/\/manifest\.json$/i.test(path)) {
    if (/\.json$/i.test(path)) throw new Error('Use your Cedar Library URL.');
    path += '/manifest.json';
  }
  url.pathname = path;
  const address = url.origin + appleEncoded(url.pathname) + appleEncoded(url.search);
  if (encoder.encode(address).length > 4096) throw new Error('This address is too long. Use an address under 4,096 bytes.');
  return { address, host: url.hostname, secure: url.protocol === 'https:' };
}
// Browsers leave characters such as Torrentio's `|` unescaped. Cedar's Apple and Android apps
// store them escaped, so the tie carries the same address every app saves.
function appleEncoded(part) {
  return part.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@\/?%]/g,
    character => '%' + character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
}
// A paste holding several addresses fills one box each. Addresses never contain whitespace.
export function splitAddresses(value) {
  return value.split(/\s+/).filter(Boolean);
}
async function seal(key, address) {
  const bytes = encoder.encode(JSON.stringify({ v: 1, kind: 'addon', url: address }));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: encoder.encode(PREFIX), tagLength: 128 }, key, bytes));
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce); combined.set(encrypted, nonce.length);
  return base64url(combined);
}
// Several URLs share one key, one sealed box each, so one username and password installs them all.
// Takes one entry per URL box; empty boxes are skipped, and errors name the box by its position.
export async function createTie(values) {
  const boxes = Array.isArray(values) ? values : [values];
  const entries = boxes
    .map((value, index) => ({ value: String(value ?? '').trim(), index }))
    .filter(entry => entry.value);
  if (!entries.length) throw new Error('Paste your Cedar Library URL to create your tie.');
  if (entries.length > MAX_BUNDLE_COUNT) throw new Error(`Add up to ${MAX_BUNDLE_COUNT} URLs to one tie. Create another tie for the rest.`);
  const numbered = boxes.length > 1;
  const validated = entries.map(({ value, index }) => {
    try { return validateAddress(value); }
    catch (issue) {
      const failure = new Error(numbered ? `URL ${index + 1}: ${issue.message}` : issue.message);
      failure.index = index;
      throw failure;
    }
  });
  // Repeating a URL would only reinstall the same tie.
  const unique = [...new Map(validated.map(item => [item.address, item])).values()];
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const sealed = [];
  for (const { address } of unique) sealed.push(await seal(key, address));
  const password = `${PASSWORD_PREFIX}${base64url(keyBytes)}`;
  const username = `${USERNAME_PREFIX}${sealed.join('.')}`;
  keyBytes.fill(0);
  if (encoder.encode(username + password).length > MAX_BUNDLE_BYTES) {
    throw new Error('These URLs are too long to share one tie. Split them across two ties.');
  }
  const code = `${PREFIX}${password.slice(PASSWORD_PREFIX.length)}.${username.slice(USERNAME_PREFIX.length)}`;
  const hosts = unique.map(item => item.host);
  const insecureHosts = [...new Set(unique.filter(item => !item.secure).map(item => item.host))];
  return { username, password, server: SERVER_URL, code, link: `${LINK_PREFIX}${code}`, host: hosts[0], hosts, insecureHosts, count: unique.length };
}
