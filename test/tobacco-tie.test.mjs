import assert from 'node:assert/strict';
import test from 'node:test';
import { createDecipheriv } from 'node:crypto';
import { createTie, validateAddress, PREFIX, LINK_PREFIX, USERNAME_PREFIX, PASSWORD_PREFIX, SERVER_URL } from '../public/create-tobacco-tie/codec.mjs';

function decrypt(code) {
  assert.ok(code.startsWith(PREFIX));
  const [key, raw] = code.slice(PREFIX.length).split('.').map(value => Buffer.from(value, 'base64url'));
  assert.equal(key.length, 32);
  const cipher = createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
  cipher.setAAD(Buffer.from(PREFIX));
  cipher.setAuthTag(raw.subarray(-16));
  return JSON.parse(Buffer.concat([cipher.update(raw.subarray(12, -16)), cipher.final()]).toString('utf8'));
}
test('browser encryption interoperates with independent AES-GCM and preserves configured URLs', async () => {
  const address = 'https://example.com/a%2Fb/manifest.json?token=abc%2B123&name=caf%C3%A9';
  const { code, link, host } = await createTie(address);
  assert.equal(host, 'example.com');
  assert.equal(link, LINK_PREFIX + code);
  assert.deepEqual(decrypt(code), { v: 1, kind: 'addon', url: address });
  assert.ok(!code.includes('example.com'));
});
test('rejects unsupported and malformed addresses', () => {
  for (const address of ['', 'example.com/manifest.json', 'http://example.com', 'javascript:alert(1)', 'https://user:password@example.com', 'https://exam ple.com', 'https://example.com/\nmanifest.json', 'https://example.com/#fragment', 'https://example.com/#', 'https://example.com/other.json', 'https://example.com/\\path', 'https://example.com/'+ 'x'.repeat(4096)]) {
    assert.throws(() => validateAddress(address));
  }
});
test('normalizes base/configure addresses without rewriting encoded configuration', () => {
  for (const value of ['https://example.com', 'https://example.com/configure', 'https://example.com/']) {
    assert.equal(validateAddress(value).address, 'https://example.com/manifest.json');
  }
  assert.equal(validateAddress('  https://example.com/a%2Fb/configure?token=%2B  ').address, 'https://example.com/a%2Fb/manifest.json?token=%2B');
});
test('every tie uses a fresh key and nonce', async () => {
  const a = await createTie('https://example.com/manifest.json');
  const b = await createTie('https://example.com/manifest.json');
  assert.notEqual(a.code.split('.')[1], b.code.split('.')[1]);
  assert.notEqual(a.code.split('.')[2].slice(0, 16), b.code.split('.')[2].slice(0, 16));
  assert.deepEqual(decrypt(a.code), decrypt(b.code));
});
test('authentication rejects changed ciphertext and key', async () => {
  const { code } = await createTie('https://example.com/manifest.json');
  for (const index of [1, 2]) {
    const parts = code.split('.');
    const data = Buffer.from(parts[index], 'base64url'); data[0] ^= 1;
    parts[index] = data.toString('base64url');
    assert.throws(() => decrypt(parts.join('.')));
  }
});

test('username and password recover the manifest and preserve the legacy code', async () => {
  const address = 'https://example.com/a%2Fb/manifest.json?token=abc%2B123&name=caf%C3%A9';
  const { username, password, code, server } = await createTie(address);
  assert.ok(username.startsWith(USERNAME_PREFIX));
  assert.ok(password.startsWith(PASSWORD_PREFIX));
  assert.equal(server, SERVER_URL);
  assert.equal(code, PREFIX + password.slice(PASSWORD_PREFIX.length) + '.' + username.slice(USERNAME_PREFIX.length));
  assert.deepEqual(decrypt(code), { v: 1, kind: 'addon', url: address });
  assert.ok(!username.includes('example.com'));
  assert.ok(!password.includes('example.com'));
  assert.equal(Buffer.from(password.slice(PASSWORD_PREFIX.length), 'base64url').length, 32);
});

test('credentials from different generations cannot be mixed', async () => {
  const first = await createTie('https://example.com/manifest.json');
  const second = await createTie('https://example.com/manifest.json');
  const mixed = PREFIX + second.password.slice(PASSWORD_PREFIX.length) + '.' + first.username.slice(USERNAME_PREFIX.length);
  assert.throws(() => decrypt(mixed));
});

test('maximum-size addresses fit the native credential input limit', async () => {
  const suffix = '/manifest.json';
  const prefix = 'https://example.com/';
  const address = prefix + 'x'.repeat(4096 - prefix.length - suffix.length) + suffix;
  const result = await createTie(address);
  assert.ok(result.username.length + result.password.length <= 8192);
  assert.equal(decrypt(result.code).url, address);
});
