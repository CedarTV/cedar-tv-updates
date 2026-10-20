import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newDraft, makeBranch, makeGroup, makeChild, validateDraft, addPick, exportCedar, rowBranches, groupCardShape, setGroupCardShape, setAppearance } from '../public/creator/home-model.mjs';
import { resolveBranch, rowStyle, cardShape, folderAt, folderSources, describeSource, previewImageURL, isGroup } from '../public/creator/home-preview.mjs';

const item = async id => JSON.parse(await readFile(`public/creator/items/${id}.cedar`, 'utf8'));
const empty = () => ({ ...newDraft(), rows: [] });

test('a picked setup previews every Branch it publishes, once its file is loaded', async () => {
  const draft = empty();
  addPick(draft, { type: 'setup', id: 'horror-vault' }, 'Horror Vault');
  const file = await item('horror-vault');
  assert.equal(rowBranches(draft, draft.rows[0], {}), null);
  const branches = rowBranches(draft, draft.rows[0], { 'horror-vault': file });
  assert.equal(branches.length, file.branches.length);
  assert.ok(branches.every(isGroup));
  assert.equal(cardShape(branches[1]), 'poster');
  assert.equal(rowBranches(draft, { ...draft.rows[0], enabled: false }, { 'horror-vault': file }).length, 0);
});

test('hand-made rows preview exactly what export writes, row style and card shape included', () => {
  const draft = empty();
  const direct = makeBranch('Popular', 'POPULAR');
  direct.rowStyle = 'wide';
  const group = makeGroup('Mine');
  group.branches.push(makeChild('One'), makeChild('Two'));
  setGroupCardShape(group, 'poster');
  draft.rows.push(direct, group);
  const clean = validateDraft(draft);
  assert.equal(clean.rows[0].rowStyle, 'wide');
  assert.equal(groupCardShape(clean.rows[1]), 'poster');
  const exported = exportCedar(clean).document.branches;
  const previewed = clean.rows.flatMap(row => rowBranches(clean, row));
  assert.deepEqual(previewed.map(b => b.presentation.templateID), exported.map(b => b.presentation.templateID));
  assert.equal(rowStyle(previewed[0].presentation.templateID), 'wide');
  assert.deepEqual(previewed[1].folderOptions.map(f => f.tileShape), ['poster', 'poster']);
  assert.equal(groupCardShape({ branches: [] }), 'landscape');
  assert.throws(() => setGroupCardShape(group, 'round'), /card shape/);
});

test('each device sees its own layout, and hidden rows drop out', () => {
  const draft = empty();
  const group = makeGroup('Devices');
  group.branches.push(makeChild('One'));
  setAppearance(group, 'phone', { rowStyle: 'classic', browseLayout: 'chips-and-grid' });
  setAppearance(group, 'desktop', { enabled: false });
  draft.rows.push(group);
  const [branch] = rowBranches(draft, draft.rows[0]);
  assert.equal(rowStyle(resolveBranch(branch, 'television').presentation.templateID), 'wide');
  assert.equal(resolveBranch(branch, 'television').browseLayout, 'rows');
  const phone = resolveBranch(branch, 'phone');
  assert.equal(rowStyle(phone.presentation.templateID), 'poster');
  assert.equal(phone.browseLayout, 'chips-and-grid');
  assert.equal(resolveBranch(branch, 'desktop'), null);
  assert.equal(resolveBranch({ ...branch, isEnabled: false }, 'phone'), null);
  assert.equal(rowStyle('some-old-template'), 'poster');
});

test('folders open by index path, including folders inside folders', () => {
  const branch = { folderOptions: [{ title: 'Hub', tileShape: 'square', folderOptions: [{ title: 'Leaf', tileShape: 'square', sources: [{ title: 'A' }, { title: 'B' }] }] }] };
  const { folder, trail } = folderAt(branch, [0, 0]);
  assert.equal(folder.title, 'Leaf');
  assert.deepEqual(trail.map(f => f.title), ['Hub', 'Leaf']);
  assert.equal(cardShape(branch.folderOptions[0]), 'square');
  assert.equal(folderAt(branch, [3]), null);
  assert.equal(folderSources(folder).length, 2);
  assert.equal(folderSources({ title: 'Old', query: {} }).length, 1);
});

test('rows say where their titles come from', () => {
  const tracking = identifier => ({ kind: 'trackingService', identifier, parameters: {} });
  const metadata = { kind: 'preferredMetadata', parameters: {} };
  assert.equal(describeSource({ dataSource: tracking('trakt-public'), query: { kind: 'curatedList', identifier: 'zephir|slashers' } }), 'Trakt list · zephir/slashers');
  assert.equal(describeSource({ dataSource: tracking('trakt-public'), query: { kind: 'curatedList', identifier: 'global:34819290:show' } }), 'Trakt list · #34819290');
  assert.equal(describeSource({ dataSource: tracking('mdblist-public'), query: { kind: 'curatedList', identifier: 'snoak|action' } }), 'MDBList · snoak/action');
  assert.equal(describeSource({ dataSource: metadata, query: { kind: 'popular' }, filters: { contentType: 'shows', streamingProviderIDs: ['8', '1796'] } }), 'Popular shows on Netflix');
  assert.equal(describeSource({ dataSource: metadata, query: { kind: 'curatedList', identifier: 'x', parameters: { provider: 'cedar-titles', movies: '1,2,3' } } }), 'Hand-picked · 3 titles');
  assert.equal(describeSource({ dataSource: metadata, query: { kind: 'personCredits', identifier: '500', parameters: { role: 'actor' } } }), 'Actor’s credits');
});

test('preview artwork avoids hosts that refuse other sites and oversized TMDB originals', () => {
  assert.equal(previewImageURL('https://get-stranded.fabriceleven.com/img/remote/aHR0cHM6Ly9maWxlcy5jYXRib3gubW9lLzQ5bzh3ai53ZWJw'), 'https://files.catbox.moe/49o8wj.webp');
  assert.equal(previewImageURL('https://image.tmdb.org/t/p/original/a.jpg'), 'https://image.tmdb.org/t/p/w780/a.jpg');
  // Anything that doesn't decode to an https URL is left as it was.
  const notURL = `https://get-stranded.fabriceleven.com/img/remote/${btoa('javascript:alert(1)')}`;
  assert.equal(previewImageURL(notURL), notURL);
  assert.equal(previewImageURL('https://raw.githubusercontent.com/a/b.png'), 'https://raw.githubusercontent.com/a/b.png');
});
