import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newDraft, makeBranch, validateDraft, addPick, pickState, draftCart, exportCedar, exportCedarProfile, counts, mergeImport, parseImport } from '../public/creator/home-model.mjs';
import { mergeCart, creatorBundleID } from '../public/creator/creator-model.mjs';
import { openProfileFile } from '../public/shared/cedar-file.mjs';

const item = async id => JSON.parse(await readFile(`public/creator/items/${id}.cedar`, 'utf8'));
const now = new Date('2026-10-18T00:00:00Z');
const empty = () => ({ ...newDraft(), rows: [] });

test('picks follow Creator’s cart rules: a whole setup replaces its groups, and its groups are then included', () => {
  const draft = empty();
  assert.equal(addPick(draft, { type: 'group', id: 'horror-vault.d4e19235' }, 'Group'), 'added');
  draft.rows.push(makeBranch('Mine'));
  assert.equal(addPick(draft, { type: 'group', id: 'horror-vault.a8dd20c2' }, 'Group 2'), 'added');
  assert.equal(addPick(draft, { type: 'setup', id: 'horror-vault' }, 'Horror Vault'), 'replaced');
  assert.deepEqual(draft.rows.map(r => r.kind), ['pick', 'branch']);
  assert.equal(draft.rows[0].item.id, 'horror-vault');
  assert.equal(addPick(draft, { type: 'group', id: 'horror-vault.3da902c6' }, 'Group 3'), 'included');
  assert.equal(pickState(draft, { type: 'group', id: 'horror-vault.3da902c6' }), 'included');
  assert.equal(addPick(draft, { type: 'setup', id: 'horror-vault' }, 'Again'), 'duplicate');
  assert.equal(counts(validateDraft(draft)).picks, 1);
  assert.throws(() => validateDraft({ ...draft, rows: [{ id: 'x', kind: 'pick', title: 'x', item: { type: 'group', id: 'no-dot' } }] }), /Creator pick/);
});

test('a Home of only picks downloads exactly what Creator’s cart did, and can still be a link', async () => {
  const draft = empty();
  addPick(draft, { type: 'setup', id: 'horror-vault' }, 'Horror Vault');
  addPick(draft, { type: 'setup', id: 'action-adrenaline' }, 'Action');
  draft.avatar = 'avatars/marvel/iron-man.webp';
  const items = { 'horror-vault': await item('horror-vault'), 'action-adrenaline': await item('action-adrenaline') };
  const cart = draftCart(validateDraft(draft));
  assert.deepEqual(cart, [{ type: 'setup', id: 'horror-vault' }, { type: 'setup', id: 'action-adrenaline' }, { type: 'avatar', id: 'avatars/marvel/iron-man.webp' }]);
  const { document } = exportCedar(draft, now, items);
  const expected = mergeCart(cart, items, '2026-10-18T00:00:00Z');
  assert.equal(document.bundleID, creatorBundleID);
  assert.deepEqual(document.branches, expected.branches);
  assert.deepEqual(document.credits, expected.credits);
  assert.equal(document.avatarURL, expected.avatarURL);
  // A disabled pick or an own Branch means the Home can only travel as a file.
  draft.rows[1].enabled = false;
  assert.equal(draftCart(validateDraft(draft)), null);
});

test('picks and own Branches export together, in Home order, under the Home’s own bundle ID', async () => {
  const draft = empty();
  draft.rows.push(makeBranch('Mine'));
  addPick(draft, { type: 'group', id: 'horror-vault.d4e19235' }, 'Group');
  const items = { 'horror-vault.d4e19235': await item('horror-vault.d4e19235') };
  const { document, bundleID } = exportCedar(draft, now, items);
  assert.notEqual(bundleID, creatorBundleID);
  assert.equal(document.branches.length, 1 + items['horror-vault.d4e19235'].branches.length);
  assert.equal(document.branches[0].title, 'Mine');
  assert.deepEqual(document.branches.slice(1).map(b => b.id), items['horror-vault.d4e19235'].branches.map(b => b.id));
  assert.deepEqual(document.branches.map(b => b.position), document.branches.map((_, i) => i));
  // A pick whose file could not be downloaded is reported, not silently dropped.
  assert.match(exportCedar(draft, now, {}).issues[0], /could not be downloaded/);
  const profile = await exportCedarProfile(draft, { passphrase: 'correct horse', items, now });
  const payload = await openProfileFile(profile.document, 'correct horse');
  assert.equal(payload.home.branches.length, document.branches.length);
});

test('replacing a Home from an import keeps the chosen profile photo', () => {
  const draft = empty();
  draft.avatar = 'avatars/marvel/iron-man.webp';
  const incoming = parseImport([{ id: 'g', title: 'G', folders: [{ id: 'f', title: 'F', sources: [{ id: 's', title: 'Popular', provider: 'tmdb', tmdbSourceType: 'POPULAR', mediaType: 'movie' }] }] }]).draft;
  assert.equal(mergeImport(draft, incoming, 'replace').avatar, 'avatars/marvel/iron-man.webp');
});
