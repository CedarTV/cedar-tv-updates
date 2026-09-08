// Design-preview envelope only. App import compatibility will be agreed separately.
export const PREFIX = 'tt-preview1.';
export function validateAddress(value) {
  const input = value.trim();
  if (!input) throw new Error('Paste an add-on address to create your tie.');
  if (input.length > 4096) throw new Error('This address is too long. Use an address under 4,096 characters.');
  if (/\s/.test(input)) throw new Error('The address contains a space or line break. Check it and try again.');
  let url;
  try { url = new URL(input); } catch { throw new Error('Enter a complete address beginning with https://.'); }
  if (url.protocol !== 'https:') throw new Error('Use an HTTPS address beginning with https://.');
  if (url.username || url.password) throw new Error('Use the add-on’s configured address rather than a URL with a username and password before the hostname.');
  return { address: url.href, host: url.hostname };
}
export async function createTie(value) {
  const { address, host } = validateAddress(value);
  const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, kind: 'addon', url: address }));
  const payload = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const checksum = Array.from(new Uint8Array(digest).slice(0, 4), byte => byte.toString(16).padStart(2, '0')).join('');
  return { code: `${PREFIX}${payload}.${checksum}`, host };
}
