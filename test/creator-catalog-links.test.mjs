import test from 'node:test';
import assert from 'node:assert/strict';
import { parseImport, exportCedar, exportCedarProfile, catalogBase, importLink, catalogLinkCount, makeBranch, validateDraft, profileIssues, catalogProbes, probeResult, catalogPageURL } from '../public/creator/home-model.mjs';
import { openProfileFile } from '../public/shared/cedar-file.mjs';

const link = 'https://catalogs.example.com/c/abc123/manifest.json';
const base = 'https://catalogs.example.com/c/abc123';
const manifest = {
  id: 'community.example.catalogs',
  name: 'Example Catalogs',
  resources: ['catalog', { name: 'meta', types: ['movie', 'series'], idPrefixes: ['tt'] }],
  types: ['movie', 'series'],
  catalogs: [
    { type: 'movie', id: 'now', name: 'Cinema · Now Playing', extra: [{ name: 'genre', options: ['Egypt', 'Lebanon'] }] },
    { type: 'movie', id: 'featured', name: 'Cinema · Featured', extra: [{ name: 'skip' }] },
    { type: 'series', id: 'latest', name: 'Cinema · Latest Shows' },
    { type: 'movie', id: 'top', name: 'Cinema · Top Rated' },
    { type: 'movie', id: 'flix-movies', name: 'Flix · Movies', extra: [{ name: 'skip' }] },
    { type: 'series', id: 'flix-shows', name: 'Flix · Shows' },
    { type: 'movie', id: 'trending', name: 'Trending' },
    { type: 'series', id: 'trending', name: 'Trending' },
    { type: 'movie', id: 'decade', name: 'By Decade', extra: [{ name: 'genre', isRequired: true, options: ['1990s', '2000s'] }] },
    { type: 'movie', id: 'hidden', name: 'Archive', showInHome: false },
    { type: 'movie', id: 'search', name: 'Search', extra: [{ name: 'search', isRequired: true }] },
    { type: 'tv', id: 'channels', name: 'Channels' },
  ],
};
const raw = JSON.stringify(manifest);
const titles = rows => rows.map(r => r.kind === 'group' ? [r.title, r.branches.map(b => b.title)] : r.title);

test('a manifest link becomes grouped Branches: prefixes, option groups and More from …', () => {
  const { draft, issues, catalog, format } = parseImport(raw, { sourceURL: link });
  assert.equal(format, 'Example Catalogs catalogs');
  assert.deepEqual(catalog, { name: 'Example Catalogs', count: 10, arrange: 'grouped' });
  assert.deepEqual(titles(draft.rows), [
    ['Now Playing', ['All', 'Egypt', 'Lebanon']],
    ['Cinema', ['Featured', 'Latest Shows', 'Top Rated']],
    ['More from Example Catalogs', ['Flix', 'By Decade', 'Archive']],
    'Trending Movies',
    'Trending Shows',
  ]);
  const flix = draft.rows[2].branches[0];
  assert.deepEqual(flix.sources.map(s => [s.catalogId, s.type]), [['flix-movies', 'movie'], ['flix-shows', 'series']]);
  assert.deepEqual(draft.rows[0].branches[1].sources[0].extras, { genre: 'Egypt' });
  assert.deepEqual(draft.rows[0].branches[0].sources[0].extras, {});
  assert.equal(draft.rows[1].deviceLayout.shared.browseLayout, 'chips-and-grid');
  assert.match(issues[0], /Left out 1 catalog that needs a search term/);
  assert.match(issues[1], /Left out 1 catalog that isn’t movies or shows/);
  assert.match(issues[2], /locked profile file/);
});

test('a manifest can also be one Branch Group or separate rows; required extras start on their first option', () => {
  const one = parseImport(raw, { sourceURL: link, arrange: 'group' }).draft;
  assert.equal(one.rows.length, 1);
  assert.equal(one.rows[0].title, 'Example Catalogs');
  assert.equal(one.rows[0].branches.length, 10);
  const rows = parseImport(raw, { sourceURL: link, arrange: 'rows' }).draft;
  assert.equal(rows.rows.length, 10);
  assert.ok(rows.rows.every(r => r.kind === 'branch'));
  assert.deepEqual(rows.rows.find(r => r.source.catalogId === 'decade').source.extras, { genre: '1990s' });
  assert.deepEqual(rows.rows.filter(r => r.source.catalogId === 'trending').map(r => r.title), ['Trending Movies', 'Trending Shows']);
});

test('catalog-link rows travel only in a locked profile file, written as Cedar’s CatalogLinkBranch', async () => {
  const { draft } = parseImport(raw, { sourceURL: link });
  assert.equal(catalogLinkCount(draft), 12);
  assert.throws(() => exportCedar(draft), /at least one compatible branch/);
  await assert.rejects(exportCedarProfile(draft, {}), /always locked/);
  assert.deepEqual(profileIssues(draft), []);

  const result = await exportCedarProfile(draft, { passphrase: 'correct horse', now: new Date('2026-10-23T00:00:00Z') });
  assert.equal(result.catalogRows, 12);
  assert.ok(result.document.sealed && !result.document.payload);
  const payload = await openProfileFile(result.document, 'correct horse');
  const [nowPlaying, cinema] = payload.home.branches;
  const egypt = nowPlaying.folderOptions[1].sources[0];
  assert.deepEqual(egypt.dataSource, { kind: 'custom', identifier: 'cedar.catalog-link', parameters: { base, name: 'Example Catalogs' } });
  assert.deepEqual(egypt.query, { kind: 'custom', identifier: 'now', parameters: { type: 'movie', 'extra.genre': 'Egypt' } });
  assert.equal(egypt.filters.contentType, 'movies');
  const featured = cinema.folderOptions[0];
  assert.deepEqual(featured.query, { kind: 'custom', identifier: 'featured', parameters: { type: 'movie', pageable: '1' } });
  assert.equal(cinema.folderOptions[1].filters.contentType, 'shows');
  assert.equal(cinema.dataSource.identifier, 'cedar.branch-group');
});

test('a Home mixing catalog links and shareable rows still has a Branches file, without the links', () => {
  const { draft } = parseImport(raw, { sourceURL: link, arrange: 'rows' });
  draft.rows.push(makeBranch('Trending movies'));
  const { document, issues } = exportCedar(validateDraft(draft));
  assert.equal(document.branches.length, 1);
  assert.ok(!JSON.stringify(document).includes('catalogs.example.com'));
  assert.equal(issues.filter(i => /locked profile file/.test(i)).length, 10);
});

test('a manifest needs its link, and Load URL accepts the usual ways people paste one', () => {
  assert.throws(() => parseImport(raw), /Paste its link/);
  assert.throws(() => parseImport(raw, { sourceURL: `${link}?token=1` }), /without a \?query/);
  assert.throws(() => parseImport(JSON.stringify({ ...manifest, catalogs: [] }), { sourceURL: link }), /no movie or show catalogs/);
  assert.equal(catalogBase(link), base);
  assert.equal(catalogBase('https://catalogs.example.com/manifest.json'), 'https://catalogs.example.com');
  assert.equal(catalogBase('http://catalogs.example.com/manifest.json'), '');
  assert.equal(importLink('stremio://catalogs.example.com/c/abc123/manifest.json'), link);
  assert.equal(importLink('https://catalogs.example.com/c/abc123/configure'), link);
  // Collections and shelf exports are still read as before.
  assert.equal(parseImport(JSON.stringify({ collections: [{ id: 'c', title: 'C', folders: [] }] })).format, 'Collection JSON');
});

test('a saved draft keeps catalog-link sources and drops a bad address', () => {
  const { draft } = parseImport(raw, { sourceURL: link, arrange: 'rows' });
  const again = validateDraft(JSON.parse(JSON.stringify(draft)));
  assert.deepEqual(again.rows[0].source, draft.rows[0].source);
  const bad = validateDraft({ ...draft, rows: [{ ...draft.rows[0], source: { ...draft.rows[0].source, base: 'http://plain.example.com' } }] });
  assert.equal(bad.rows[0].source.base, undefined);
  assert.equal(catalogLinkCount(bad), 1);
  assert.match(profileIssues(validateDraft({ ...bad, rows: [...bad.rows, makeBranch('Trending movies')] }))[0], /incomplete/);
});

test('probes read each optional choice without it, and a few catalogs for the card shape', () => {
  const probes = catalogProbes(manifest, link);
  assert.deepEqual(probes.filter(p => p.checksChoice).map(p => [p.key, p.url]), [['movie|now', `${base}/catalog/movie/now.json`]]);
  assert.deepEqual(probes.filter(p => !p.checksChoice).map(p => p.key), ['movie|featured', 'series|latest', 'movie|top']);
  assert.deepEqual(catalogProbes(manifest, ''), []);
  assert.equal(catalogPageURL(base, 'movie', 'now', { skip: '20', genre: 'Saudi Arabia' }), `${base}/catalog/movie/now/genre=Saudi%20Arabia&skip=20.json`);
});

test('probe answers: an empty catalog needs its choice, and most titles decide the card shape', () => {
  const [choice, ...samples] = catalogProbes(manifest, link);
  const result = probeResult([{ probe: choice, shapes: [] }, { probe: samples[0], shapes: [undefined, 'poster'] }, { probe: samples[1], shapes: ['landscape'] }]);
  assert.deepEqual([...result.needsChoice], ['movie|now']);
  assert.equal(result.shape, 'poster');
  assert.equal(probeResult([{ probe: choice, shapes: ['Landscape', 'landscape'] }]).shape, 'landscape');
  assert.deepEqual([...probeResult([{ probe: choice, shapes: ['poster'] }]).worksWithoutChoice], ['movie|now']);
  assert.equal(probeResult([]).shape, null);
});

test('a needed choice drops All and starts other layouts on its first option; titles set the card shape', () => {
  const probes = { needsChoice: new Set(['movie|now']), worksWithoutChoice: new Set(), shape: 'poster' };
  const grouped = parseImport(raw, { sourceURL: link, probes }).draft;
  assert.deepEqual(grouped.rows[0].branches.map(b => b.title), ['Egypt', 'Lebanon']);
  assert.ok(grouped.rows.filter(r => r.kind === 'group').every(g => g.branches.every(b => b.tileShape === 'poster')));
  assert.ok(grouped.rows.filter(r => r.kind === 'branch').every(r => !r.rowStyle));
  const rows = parseImport(raw, { sourceURL: link, arrange: 'rows', probes }).draft;
  assert.deepEqual(rows.rows.find(r => r.source.catalogId === 'now').source.extras, { genre: 'Egypt' });
  const wide = parseImport(raw, { sourceURL: link, probes: { ...probes, needsChoice: new Set(), shape: 'landscape' } }).draft;
  assert.equal(wide.rows[0].branches[0].title, 'All');
  assert.ok(wide.rows.flatMap(r => r.branches || []).every(b => !b.tileShape));
  assert.ok(wide.rows.filter(r => r.kind === 'branch').every(r => r.rowStyle === 'wide'));
});
