import test from 'node:test';
import assert from 'node:assert/strict';
import * as o from '../public/creator/branch-options.mjs';
import { newDraft, validateDraft, exportCedar, rowFromBuild, buildFromRow, buildFromChild, sourceFromBuild, applyBuild, makeBranch, makeGroup, makeChild, sourceProblem } from '../public/creator/home-model.mjs';

const choice = id => o.sourceGroups.flatMap(g => g.choices).find(c => c.id === id);
const build = (change = s => s) => { const b = o.newBuild(); b.source = change(b.source); return b; };

test('automatic titles follow Cedar’s New Branch rules', () => {
  const s = o.newBuild().source;
  assert.equal(o.automaticTitle(s), 'Popular Movies & TV');
  const drama = { ...s, query: { kind: 'topRated', parameters: {} }, filters: { ...s.filters, contentType: 'shows', genreIDs: ['80', '18'], streamingProviderIDs: ['8'], releaseDateStart: '2010-01-01T00:00:00Z', releaseDateEnd: '2019-12-31T00:00:00Z' } };
  assert.equal(o.automaticTitle(drama), 'Top Rated 2010s Crime Drama TV Shows on Netflix');
  assert.equal(o.automaticTitle({ ...s, filters: { ...s.filters, sortOrder: 'releaseDateOldest' } }), 'Classic Movies & TV');
  assert.equal(o.automaticTitle({ ...s, query: { kind: 'popular', parameters: { withPersonID: '287', personName: 'Brad Pitt' } }, filters: { ...s.filters, contentType: 'movies' } }), 'Movies Featuring Brad Pitt');
  const genre = o.applyChoice(s, choice('discovery:genre'));
  assert.equal(o.automaticTitle({ ...genre, query: { ...genre.query, identifier: '878' } }), 'Science Fiction Movies & TV');
  assert.equal(o.automaticTitle(o.applyChoice(s, choice('local:continue'))), 'Continue Watching');
});

test('release periods read and write a year, a decade or a range', () => {
  const f = o.emptyFilters();
  assert.equal(o.setReleasePeriod(f, '1996').releaseYear, 1996);
  const decade = o.setReleasePeriod(f, '1990s');
  assert.deepEqual([decade.releaseDateStart, decade.releaseDateEnd], ['1990-01-01T00:00:00Z', '1999-12-31T00:00:00Z']);
  assert.equal(o.releasePeriod(decade), '1990s');
  assert.equal(o.releasePeriod(o.setReleasePeriod(f, '2003–1996')), '1996–2003');
  assert.equal(o.releasePeriod(o.setReleasePeriod(decade, '')), '');
  assert.equal(o.setReleasePeriod(f, '1500').releaseYear, undefined);
});

test('public list links become the sources Cedar reads without signing in', () => {
  assert.deepEqual(o.parseListURL('https://trakt.tv/users/zephir/lists/slashers').source.query, { kind: 'curatedList', identifier: 'zephir|slashers', parameters: {} });
  assert.equal(o.parseListURL('https://trakt.tv/lists/123', 'shows').source.query.identifier, 'global:123:show');
  const mdb = o.parseListURL('https://mdblist.com/lists/Snoak/action-movies');
  assert.deepEqual([mdb.source.dataSource.identifier, mdb.source.query.identifier], ['mdblist-public', 'snoak|action-movies']);
  assert.equal(o.parseListURL('https://www.themoviedb.org/collection/10-star-wars-collection').source.query.kind, 'metadataCollection');
  assert.deepEqual(o.parseListURL('https://www.themoviedb.org/list/8661472').source.query.parameters, { provider: 'tmdb' });
  assert.throws(() => o.parseListURL('https://example.com/list'), /Trakt, MDBList or TMDB/);
  assert.throws(() => o.parseListURL('not a link'), /web address/);
  assert.deepEqual(o.tmdbID('https://www.themoviedb.org/person/287-brad-pitt', 'person'), { id: '287', name: 'Brad Pitt' });
  assert.equal(o.tmdbID('41077', 'company').id, '41077');
  assert.equal(o.tmdbID('https://www.themoviedb.org/movie/550', 'person'), null);
});

test('a source must be complete and readable before it can be saved', () => {
  const genre = o.applyChoice(o.newBuild().source, choice('discovery:genre'));
  assert.equal(o.sourceIssue(genre), 'Choose a genre.');
  assert.equal(o.sourceIssue({ ...genre, query: { ...genre.query, identifier: '27' } }), '');
  assert.equal(o.sourceIssue(o.applyChoice(genre, choice('discovery:year'))), 'Choose a year.');
  assert.throws(() => o.cleanCedarSource({ dataSource: { kind: 'connectedSource', parameters: {} }, query: { kind: 'popular' } }), /can’t build/);
  assert.throws(() => o.cleanCedarSource({ dataSource: { kind: 'preferredMetadata' }, query: { kind: 'leaves' } }), /can’t build/);
  const clean = o.cleanCedarSource({ dataSource: { kind: 'preferredMetadata', parameters: { '<x>': 'y', ok: 1 } }, query: { kind: 'popular', parameters: {} }, filters: { contentType: 'tv', genreIDs: ['27', '27', '<b>'], releaseYear: 99, minimumVoteAverage: 11, sortOrder: 'bogus' } });
  assert.deepEqual(clean.dataSource.parameters, {});
  assert.deepEqual(clean.filters, { contentType: 'both', genreIDs: ['27'], originalLanguageCodes: [], countryCodes: [], streamingProviderIDs: [], networkIDs: [], productionCompanyIDs: [] });
  // A tampered draft keeps the row but can't export it.
  const draft = validateDraft({ version: 2, title: 'x', rows: [{ id: 'r', kind: 'branch', title: 'Bad', source: { title: 'Bad', provider: 'cedar', cedar: { dataSource: { kind: 'liveTV' }, query: { kind: 'popular' } } } }] });
  assert.match(sourceProblem(draft.rows[0].source, true), /can’t be read/);
});

test('built Branches export exactly as built and reopen in the builder', () => {
  const b = build(s => ({ ...o.applyChoice(s, choice('discovery:streamingProvider')), query: { kind: 'streamingProvider', identifier: '337', parameters: { region: 'CA' } } }));
  b.style = 'ratings'; b.platforms = ['phone', 'television']; b.title = 'Disney picks'; b.titleMode = 'custom';
  const draft = validateDraft({ ...newDraft(), rows: [rowFromBuild(b)] });
  const [exported] = exportCedar(draft).document.branches;
  assert.equal(exported.title, 'Disney picks');
  assert.equal(exported.titleMode, 'custom');
  assert.deepEqual(exported.query, { kind: 'streamingProvider', parameters: { region: 'CA' }, identifier: '337' });
  assert.equal(exported.presentation.posterLook, 'critic');
  assert.deepEqual(exported.platformConfiguration, { platforms: ['phone', 'television'], overrides: {} });
  const reopened = buildFromRow(draft.rows[0]);
  assert.deepEqual([reopened.style, reopened.platforms, reopened.titleMode], ['ratings', ['phone', 'television'], 'custom']);
  // Every device on means no platform list at all.
  const all = applyBuild(draft.rows[0], { ...reopened, platforms: [...o.families], style: 'feature', titleMode: 'automatic', title: 'Movies & TV on Disney+' });
  assert.equal(all.platforms, undefined);
  assert.equal(exportCedar(validateDraft({ ...newDraft(), rows: [all] })).document.branches[0].presentation.templateID, 'list-preview-full-width');
});

test('imported TMDB and Trakt sources open in the builder; Tobacco Tie ones can’t', () => {
  const legacy = makeBranch('Top rated', 'TOP_RATED', 'tv', { withGenres: '18', voteCountGte: 100 });
  const opened = buildFromRow(legacy);
  assert.equal(opened.source.query.kind, 'topRated');
  assert.deepEqual([opened.source.filters.contentType, opened.source.filters.genreIDs, opened.source.filters.minimumVoteCount], ['shows', ['18'], 100]);
  assert.equal(opened.style, 'poster');
  assert.throws(() => buildFromChild({ id: 'a', title: 'Tie', provider: 'addon', catalogId: 'top' }), /Tobacco Tie/);
  const group = makeGroup('G');
  group.branches.push(makeChild('Sci-fi'));
  group.branches[0].sources = [sourceFromBuild({ ...build(s => ({ ...s, filters: { ...s.filters, genreIDs: ['878'] } })), title: 'Sci-fi' })];
  const folder = exportCedar(validateDraft({ ...newDraft(), rows: [group] })).document.branches[0].folderOptions[0];
  assert.deepEqual(folder.sources[0].filters.genreIDs, ['878']);
  assert.deepEqual(folder.filters.genreIDs, ['878']);
});
