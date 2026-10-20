import assert from 'node:assert/strict';
import test from 'node:test';
import { createDecipheriv } from 'node:crypto';
import { createTie, splitAddresses, validateAddress, MAX_BUNDLE_COUNT, PREFIX, LINK_PREFIX, USERNAME_PREFIX, PASSWORD_PREFIX, SERVER_URL } from '../public/create-tobacco-tie/codec.mjs';

function decryptAll(code) {
  const [keyText, ...boxes] = code.slice(PREFIX.length).split('.');
  return boxes.map(box => decrypt(`${PREFIX}${keyText}.${box}`));
}
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
  for (const address of ['', 'example.com/manifest.json', 'ftp://example.com/manifest.json', 'javascript:alert(1)', 'https://user:password@example.com', 'https://exam ple.com', 'https://example.com/\nmanifest.json', 'https://example.com/#fragment', 'https://example.com/#', 'https://example.com/other.json', 'https://example.com/\\path', 'https://example.com/'+ 'x'.repeat(4096)]) {
    assert.throws(() => validateAddress(address));
  }
});
test('accepts self-hosted HTTP addresses and reports them as insecure', async () => {
  assert.deepEqual(validateAddress('http://192.168.1.20:7000/abc'), { address: 'http://192.168.1.20:7000/abc/manifest.json', host: '192.168.1.20', secure: false });
  const tie = await createTie('http://192.168.1.20:7000/abc/manifest.json\nhttps://example.com/manifest.json');
  assert.deepEqual(tie.insecureHosts, ['192.168.1.20']);
  assert.deepEqual(decryptAll(tie.code).map(item => item.url), ['http://192.168.1.20:7000/abc/manifest.json', 'https://example.com/manifest.json']);
  assert.deepEqual((await createTie('https://example.com/manifest.json')).insecureHosts, []);
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

test('splits URLs on whitespace and on commas that start a new URL', () => {
  assert.deepEqual(splitAddresses(' https://a.example/manifest.json,https://b.example\n\nhttps://c.example/x , https://d.example, '),
    ['https://a.example/manifest.json', 'https://b.example', 'https://c.example/x', 'https://d.example']);
  // Configured paths keep their own commas.
  assert.deepEqual(splitAddresses('https://p.example/providers=yts,eztv|sort=quality/manifest.json'),
    ['https://p.example/providers=yts,eztv|sort=quality/manifest.json']);
});
test('several URLs share one key, keep their order, and drop repeats', async () => {
  const result = await createTie('https://a.example, https://b.example/x/manifest.json\nhttps://a.example/manifest.json');
  assert.equal(result.count, 2);
  assert.deepEqual(result.hosts, ['a.example', 'b.example']);
  assert.deepEqual(decryptAll(result.code).map(payload => payload.url), ['https://a.example/manifest.json', 'https://b.example/x/manifest.json']);
  assert.ok(!result.password.slice(PASSWORD_PREFIX.length).includes('.'));
  assert.equal(result.code, PREFIX + result.password.slice(PASSWORD_PREFIX.length) + '.' + result.username.slice(USERNAME_PREFIX.length));
});
test('bundles name the failing URL and enforce their limits', async () => {
  await assert.rejects(createTie('https://a.example, https://user:pw@b.example'), /^Error: URL 2:/);
  const many = Array.from({ length: MAX_BUNDLE_COUNT + 1 }, (_, index) => `https://${index}.example`).join('\n');
  await assert.rejects(createTie(many), /up to 20/);
  const long = Array.from({ length: 20 }, (_, index) => `https://${index}.example/${'x'.repeat(3000)}/manifest.json`).join('\n');
  await assert.rejects(createTie(long), /too long to share one tie/);
});
