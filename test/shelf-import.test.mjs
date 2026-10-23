import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport,exportCedar,mdbListSlug} from '../public/creator/home-model.mjs';

const discover = (extra = {}) => ({tmdbDiscover: {_0: {name: 'Popular Movies', mediaType: 'movie', genres: [35, 18], keywords: [], companies: [], networks: [], excludeGenres: [], originalLanguage: 'en', sortBy: 'vote_average.desc', voteCountGte: 100, ...extra}}});
const folder = (title, sources, extra = {}) => ({id: `${title}-id`, title, coverImageURL: 'https://shipflix.github.io/artwork/images/cover.webp', backgroundImageURL: 'https://shipflix.github.io/artwork/images/cover-background.webp', hideTitle: true, tileShape: 'wide', showsSourceRows: true, sources, ...extra});
const shelves = () => [
  {id: 'G', isEnabled: true, sortOrder: 2, style: 'collections_row', title: 'Discover', source: {group: {_0: {title: 'Discover', tileShape: 'wide', hideTitle: true, coverFillsHero: true, contentSources: [
    folder('For You', [discover(), discover({name: 'Recent', mediaType: 'tv', releaseDateGte: '2023-01-01', excludeGenres: [16]})]),
    folder('Top Series', [{traktList: {_0: {listId: '35016391', listSlug: '35016391', listName: 'AMC+', username: '', isPublic: true}}}]),
    folder('Awards', [{traktList: {_0: {listId: '6666498', listSlug: 'venice-film-festival', listName: 'Venice', username: 'someone'}}}], {tileShape: 'poster', hideTitle: false}),
    folder('Lists', [{mdbListList: {_0: {listId: 160245, listName: '[List] Metacritic Must See', username: 'NobNobz', mediatype: 'movie'}}}, {tmdbList: {_0: {listId: 8679755, listName: 'AMC+', mediaType: 'movie'}}}]),
    folder('Die Hard', [{tmdbCollection: {_0: {collectionId: 1570, name: 'Die Hard Collection'}}}]),
    folder('Elsewhere', [{plexLibrary: {_0: {id: 'x'}}}]),
  ]}}}},
  {id: 'T', isEnabled: true, sortOrder: 1, style: 'row_classic', title: 'Trending Movies Today', source: {tmdbCatalog: {_0: 'tmdb_trending_movies_day'}}},
  {id: 'C', isEnabled: false, sortOrder: 0, style: 'row_classic', title: 'Continue Watching', source: {continueWatching: {}}},
];

test('shelf exports become Cedar rows in shelf order, with folder art, shapes and hidden titles', () => {
  const {draft, issues, format} = parseImport(JSON.stringify(shelves()));
  assert.equal(format, 'Home shelf export');
  assert.deepEqual(draft.rows.map(r => [r.title, r.kind, r.enabled]), [['Continue Watching', 'branch', false], ['Trending Movies Today', 'branch', true], ['Discover', 'group', true]]);
  const [forYou, , awards] = draft.rows[2].branches;
  assert.equal(forYou.coverImageUrl, 'https://shipflix.github.io/artwork/images/cover.webp');
  assert.equal(forYou.heroBackdropUrl, 'https://shipflix.github.io/artwork/images/cover-background.webp');
  assert.equal(forYou.hidesTitle, true);
  assert.equal(forYou.tileShape, undefined);
  assert.equal(awards.tileShape, 'poster');
  assert.equal(awards.hidesTitle, undefined);
  assert.equal(issues.length, 3);
  assert.match(issues[0], /Elsewhere \/ plexLibrary: Cedar does not support/);
  assert.match(issues[1], /^1 discover source excludes/);
  assert.match(issues[2], /^1 MDBList list is matched by name/);
});

test('shelf sources export as Cedar discover, list, collection and library sources', () => {
  const {document, issues} = exportCedar(parseImport(shelves()).draft);
  assert.ok(issues.some(i => /Elsewhere: no compatible enabled sources/.test(i)));
  const [trending, group] = document.branches;
  assert.deepEqual(trending.query, {kind: 'trending', parameters: {window: 'day'}});
  assert.equal(trending.defaultFilters.contentType, 'movies');
  const folders = Object.fromEntries(group.folderOptions.map(f => [f.title, f]));
  assert.equal(folders['For You'].hidesTitle, true);
  assert.equal(folders['For You'].heroBackdropURL, 'https://shipflix.github.io/artwork/images/cover-background.webp');
  const [popular, recent] = folders['For You'].sources;
  assert.deepEqual(popular.filters.genreIDs, ['35', '18']);
  assert.deepEqual(popular.filters.originalLanguageCodes, ['en']);
  assert.equal(popular.filters.minimumVoteCount, 100);
  assert.equal(popular.filters.sortOrder, 'topRated');
  assert.equal(recent.filters.contentType, 'shows');
  assert.equal(recent.filters.releaseDateStart, '2023-01-01T00:00:00Z');
  assert.equal(folders['Top Series'].sources[0].query.identifier, 'global:35016391:show');
  assert.equal(folders.Awards.sources[0].query.identifier, 'someone|venice-film-festival');
  const [mdb, tmdbList] = folders.Lists.sources;
  assert.deepEqual(mdb.dataSource, {kind: 'trackingService', parameters: {}, identifier: 'mdblist-public'});
  assert.deepEqual(mdb.query, {kind: 'curatedList', parameters: {listID: '160245'}, identifier: 'nobnobz|list-metacritic-must-see'});
  assert.deepEqual(tmdbList.query, {kind: 'curatedList', identifier: '8679755', parameters: {provider: 'tmdb'}});
  assert.deepEqual(folders['Die Hard'].sources[0].query, {kind: 'metadataCollection', identifier: '1570', parameters: {}});
});

test('MDBList slugs follow its naming: apostrophes dropped, everything else hyphenated', () => {
  assert.equal(mdbListSlug("[List] Letterboxd's Top 500 Films"), 'list-letterboxds-top-500-films');
  assert.equal(mdbListSlug('[List] You’re Not the Same Person'), 'list-youre-not-the-same-person');
  assert.equal(mdbListSlug('[List] Movies That Will Make You Say “What the F***” at Least 3 Times'), 'list-movies-that-will-make-you-say-what-the-f-at-least-3-times');
});

test('Nuvio collection arrays are still read as collections', () => {
  const parsed = parseImport([{id: 'g', title: 'G', folders: [{id: 'f', title: 'F', sources: [{id: 's', title: 'Popular', provider: 'tmdb', tmdbSourceType: 'POPULAR', mediaType: 'movie'}]}]}]);
  assert.equal(parsed.format, 'Collection JSON');
});
