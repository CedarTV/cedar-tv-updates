// Bearer envelope: possession of the complete code grants access to its address.
// AES-256-GCM, 12-byte nonce, 16-byte tag, UTF-8 prefix as authenticated data.
export const PREFIX = 'cedar-tie1.';
export const LINK_PREFIX = 'cedar://tie/';
const encoder = new TextEncoder();
function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function validateAddress(value) {
  const input = value.trim();
  if (!input) throw new Error('Paste an add-on address to create your tie.');
  if (encoder.encode(input).length > 4096) throw new Error('This address is too long. Use an address under 4,096 bytes.');
  if (/\s|\\/.test(input)) throw new Error('The address contains a space, line break, or backslash. Check it and try again.');
  let url;
  try { url = new URL(input); } catch { throw new Error('Enter a complete address beginning with https://.'); }
  if (url.protocol !== 'https:') throw new Error('Use an HTTPS address beginning with https://.');
  if (url.username || url.password) throw new Error('Use the add-on’s configured address rather than a URL with a username and password before the hostname.');
  if (input.includes('#')) throw new Error('Remove the fragment after # from this address.');
  let path = url.pathname.replace(/\/+$/, '');
  if (/\/configure$/i.test(path)) path = path.slice(0, -10);
  if (!/\/manifest\.json$/i.test(path)) {
    if (/\.json$/i.test(path)) throw new Error('Use an add-on manifest address.');
    path += '/manifest.json';
  }
  url.pathname = path;
  if (encoder.encode(url.href).length > 4096) throw new Error('This address is too long. Use an address under 4,096 bytes.');
  return { address: url.href, host: url.hostname };
}
export async function createTie(value) {
  const { address, host } = validateAddress(value);
  const bytes = encoder.encode(JSON.stringify({ v: 1, kind: 'addon', url: address }));
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: encoder.encode(PREFIX), tagLength: 128 }, key, bytes));
  const combined = new Uint8Array(nonce.length + encrypted.length);
  combined.set(nonce); combined.set(encrypted, nonce.length);
  const code = `${PREFIX}${base64url(keyBytes)}.${base64url(combined)}`;
  keyBytes.fill(0);
  return { code, link: `${LINK_PREFIX}${code}`, host };
}
