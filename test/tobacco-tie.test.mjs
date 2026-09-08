import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { createTie, validateAddress, PREFIX } from '../public/create-tobacco-tie/codec.mjs';

test('preview tie preserves configured URL data and has a valid checksum', async () => {
  const address = 'https://example.com/a%2Fb/manifest.json?token=abc%2B123&name=caf%C3%A9';
  const { code, host } = await createTie(address);
  assert.equal(host, 'example.com');
  assert.ok(code.startsWith(PREFIX));
  const [payload, checksum] = code.slice(PREFIX.length).split('.');
  const bytes = Buffer.from(payload, 'base64url');
  assert.deepEqual(JSON.parse(bytes.toString('utf8')), { v: 1, kind: 'addon', url: address });
  assert.equal(checksum, createHash('sha256').update(bytes).digest('hex').slice(0, 8));
});
test('preview rejects unsupported and malformed addresses', () => {
  for (const address of ['', 'example.com/manifest.json', 'http://example.com', 'javascript:alert(1)', 'https://user:password@example.com', 'https://exam ple.com', 'https://example.com/\nmanifest.json', 'https://example.com/'+ 'x'.repeat(4096)]) {
    assert.throws(() => validateAddress(address));
  }
});
test('surrounding whitespace is trimmed without dropping query or fragment data', () => {
  assert.equal(validateAddress('  https://example.com/path?a=b#section  ').address, 'https://example.com/path?a=b#section');
});
test('same address produces a stable preview code', async () => {
  assert.deepEqual(await createTie('https://example.com/manifest.json'), await createTie('https://example.com/manifest.json'));
});
