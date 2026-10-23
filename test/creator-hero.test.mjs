import test from 'node:test';
import assert from 'node:assert/strict';
import {newDraft, newHero, validateDraft, exportCedar, exportCedarProfile, draftCart, heroSource, heroSourceName, makeBranch, makePick} from '../public/creator/home-model.mjs';

const draft = (extra = {}) => validateDraft({...newDraft(), ...extra});

test('a draft without a hero leaves the viewer’s own hero alone', () => {
  const {document, hero} = exportCedar(draft());
  assert.equal(hero, false);
  assert.ok(!document.branches.some(b => b.presentation.templateID === 'hero-carousel'));
});

test('the hero exports first, as a hero-carousel Branch with its style, details and title count', () => {
  const d = draft({hero: {...newHero(), style: 'fade', fields: ['genre', 'ratings'], limit: 6}});
  const {document, hero, branchCount} = exportCedar(d);
  const [first] = document.branches;
  assert.equal(hero, true);
  assert.equal(branchCount, 3);
  assert.equal(first.position, 0);
  assert.equal(first.presentation.templateID, 'hero-carousel');
  assert.deepEqual(first.presentation.hero.style, 'fullscreen');
  assert.equal(first.presentation.hero.fadesArtwork, true);
  assert.deepEqual(first.presentation.hero.metadataFields, ['genre', 'ratings']);
  assert.equal(first.presentation.hero.ratings.isEnabled, true);
  assert.equal(first.pageSize, 6);
  assert.deepEqual(first.query, {kind: 'trending', parameters: {window: 'week'}});
});

test('a hero can follow a direct Branch, and says why when that Branch is gone', () => {
  const row = makeBranch('Popular movies', 'POPULAR');
  const d = draft({rows: [row], hero: {...newHero(), source: {kind: 'row', rowId: row.id}}});
  assert.equal(heroSourceName(d), 'Popular movies');
  assert.equal(heroSource(d).query.kind, 'popular');
  const gone = validateDraft({...d, rows: []});
  assert.match(heroSource(gone).problem, /no longer on Your Home/);
  const {issues, hero} = exportCedar({...gone, rows: [makeBranch('Other')]});
  assert.equal(hero, false);
  assert.match(issues[0], /^Hero: /);
});

test('hero settings are cleaned: unknown styles, fields and sources fall back, limits are clamped', () => {
  const d = draft({hero: {style: 'spinning', fields: ['genre', 'secret'], limit: 999, source: {kind: 'feed', feed: 'nope'}}});
  assert.deepEqual(d.hero, {style: 'fullscreen', fields: ['genre'], limit: 20, source: {kind: 'feed', feed: 'trending-week'}});
  const local = draft({hero: {...newHero(), source: {kind: 'custom', title: 'Downloads', cedar: {dataSource: {kind: 'local', parameters: {}}, query: {kind: 'continueWatching', parameters: {}}, filters: {}}}}});
  assert.deepEqual(local.hero.source, {kind: 'feed', feed: 'trending-week'}, 'Continue Watching can’t feed the hero');
});

test('a Home with its own hero is no longer a picks-only link, and profile files carry the hero too', async () => {
  const pick = makePick({type: 'setup', id: 'horror-vault'}, 'Horror Vault');
  assert.ok(draftCart(draft({rows: [pick]})));
  assert.equal(draftCart(draft({rows: [pick], hero: newHero()})), null);
  const {document, hero} = await exportCedarProfile(draft({hero: newHero()}));
  assert.equal(hero, true);
  assert.equal(document.kind, 'profile');
});
