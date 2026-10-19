import test from 'node:test';
import assert from 'node:assert/strict';
import {bundleHeader, branchesFile, profileFile, openProfileFile, seal, open, findTobaccoTies, parseTobaccoTieLinks, addonFamily, CATEGORIES, SENSITIVE} from '../public/shared/cedar-file.mjs';
import {parseImport, exportCedar, exportCedarProfile} from '../public/customize/model.mjs';

const bundleID = '6F1C2B8A-4E2D-4F0B-9C3A-1D2E3F405162';
const generator = {application: 'Test'};

test('every file starts with the header Cedar reads', () => {
  const header = bundleHeader({kind: 'profile', bundleID: bundleID.toLowerCase(), title: 'Me', createdAt: '2026-10-18T00:00:00Z', generator});
  assert.deepEqual(Object.keys(header), ['formatIdentifier', 'schemaVersion', 'kind', 'bundleID', 'title', 'createdAt', 'generator']);
  assert.equal(header.bundleID, bundleID);
  assert.throws(() => bundleHeader({kind: 'setup', bundleID, generator}), /branches and profile/);
  assert.throws(() => bundleHeader({kind: 'branches', bundleID: 'nope', generator}), /UUID/);
  const file = branchesFile({bundleID, title: 'Rows', generator, branches: [{id: 'a'}, {id: 'b'}]});
  assert.deepEqual(file.branches.map(b => b.position), [0, 1]);
});

test('the seal opens only with its passphrase and matches Cedar’s layout', async () => {
  const sealed = await seal('{"hello":"world"}', 'correct horse', {iterations: 10000});
  assert.equal(sealed.algorithm, 'AES-256-GCM/PBKDF2-SHA256');
  assert.equal(Buffer.from(sealed.salt, 'base64').length, 16);
  // 12-byte nonce + 17-byte plaintext + 16-byte tag.
  assert.equal(Buffer.from(sealed.sealed, 'base64').length, 12 + 17 + 16);
  assert.equal(new TextDecoder().decode(await open(sealed, 'correct horse')), '{"hello":"world"}');
  await assert.rejects(open(sealed, 'wrong'), /doesn’t unlock/);
  // Passphrases are compared after NFC normalisation, as in Cedar.
  const nfd = await seal('x', 'café', {iterations: 10000});
  assert.equal(new TextDecoder().decode(await open(nfd, 'café')), 'x');
});

test('profile files lock anything sensitive and summarise contents without revealing them', async () => {
  const payload = {identity: {name: 'Tyler'}, tobaccoTies: {ties: [{id: bundleID, url: 'https://tie.example/secret-token/manifest.json', enabledCatalogIDs: []}], settings: []}};
  await assert.rejects(profileFile({bundleID, generator, payload}), /locked/);
  await assert.rejects(profileFile({bundleID, generator, payload: {bogus: 1}, passphrase: 'pw'}), /Unknown profile section/);
  const file = await profileFile({bundleID, title: 'Tyler', generator, payload, passphrase: 'correct horse'});
  assert.equal(file.kind, 'profile');
  assert.deepEqual(file.contents, {categories: ['addons', 'profile'], counts: {profile: 1, addons: 1}});
  assert.ok(!JSON.stringify(file).includes('secret-token'));
  assert.equal(file.payload, undefined);
  assert.deepEqual(await openProfileFile(file, 'correct horse'), payload);
  const readable = await profileFile({bundleID, generator, payload: {identity: {name: 'Tyler'}}});
  assert.deepEqual(readable.payload, {identity: {name: 'Tyler'}});
  assert.deepEqual([...SENSITIVE].filter(c => !CATEGORIES.includes(c)), []);
});

test('Tobacco Tie links are found in other apps’ exports and in pasted text', () => {
  const nuvio = {config: {addons: [{transportUrl: 'https://aio.example/abc123/manifest.json', manifest: {id: 'community.aio', name: 'AIO'}}, {manifest: {id: 'x'}, transportUrl: 'not a link'}], note: 'https://elsewhere.example/manifest.json'}};
  assert.deepEqual(findTobaccoTies(nuvio), [{url: 'https://aio.example/abc123/manifest.json', manifestID: 'community.aio', name: 'AIO'}]);
  assert.deepEqual(parseTobaccoTieLinks('https://a.example/x/configure\nhttps://b.example/manifest.json'), [{url: 'https://a.example/x/manifest.json'}, {url: 'https://b.example/manifest.json'}]);
  assert.throws(() => parseTobaccoTieLinks('http://a.example/manifest.json'), /https/);
  assert.equal(addonFamily('app.xperience.0f8e6a1c-1b2c-4d3e-8f90-a1b2c3d4e5f6'), 'app.xperience');
});

const nuvioExport = () => ({config: {
  addons: [{transportUrl: 'https://xperience.example/manifest/owner/token123/manifest.json', manifest: {id: 'app.xperience.11111111-2222-4333-8444-555555555555', name: 'Xperience'}}],
  collections: [{id: 'c', title: 'Picks', folders: [{id: 'f', title: 'Trending', catalogSources: [
    {addonId: 'app.xperience.99999999-8888-4777-8666-555555555555', type: 'movie', catalogId: 'xp.trending'},
    {addonId: 'external', type: 'movie', catalogId: 'popular_movies'},
  ]}]}],
}});

test('a Branches export still leaves Tobacco Tie rows out', () => {
  const parsed = parseImport(nuvioExport());
  assert.equal(parsed.ties.length, 1);
  const {document, issues} = exportCedar(parsed.draft);
  assert.ok(!JSON.stringify(document).includes('token123'));
  assert.equal(document.branches[0].folderOptions[0].sources.length, 1);
  assert.match(issues[0], /Tobacco Tie catalogs/);
});

test('a profile export keeps Tobacco Tie rows by binding them to the owner’s tie, sealed', async () => {
  const parsed = parseImport(nuvioExport());
  const result = await exportCedarProfile(parsed.draft, {passphrase: 'correct horse', ties: parsed.ties, now: new Date('2026-10-18T00:00:00Z')});
  assert.equal(result.tieCount, 1);
  assert.equal(result.linkedRows, 1);
  assert.equal(result.unusedTies, 0);
  assert.deepEqual(result.issues, []);
  assert.ok(!JSON.stringify(result.document).includes('token123'));
  const payload = await openProfileFile(result.document, 'correct horse');
  const tie = payload.tobaccoTies.ties[0];
  assert.equal(tie.url, 'https://xperience.example/manifest/owner/token123/manifest.json');
  const sources = payload.home.branches[0].folderOptions[0].sources;
  assert.deepEqual(sources[0].dataSource, {kind: 'manifestAddon', identifier: tie.id.toLowerCase(), parameters: {}});
  // Cedar matches catalogs by the installed manifest's own ID, so the row uses the tie's ID, not the author's.
  assert.equal(sources[0].query.identifier, 'app.xperience.11111111-2222-4333-8444-555555555555|movie|xp.trending');
  assert.equal(sources[1].query.kind, 'popular');
  // A profile without ties and without a passphrase is a readable file.
  const plain = await exportCedarProfile(parseImport([{id: 'g', title: 'G', folders: [{id: 'f', title: 'F', sources: [{id: 's', title: 'Popular', provider: 'tmdb', tmdbSourceType: 'POPULAR', mediaType: 'movie'}]}]}]).draft);
  assert.ok(plain.document.payload.home.branches.length);
});
