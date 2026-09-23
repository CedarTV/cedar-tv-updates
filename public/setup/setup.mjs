import { parseInvitation, makeCredentials, request, claim, decodeSnapshot, commandEnvelope, editableRows } from './model.mjs';
const $ = id => document.getElementById(id);
const node = (tag, text, className) => { const element = document.createElement(tag); if (text != null) element.textContent = text; if (className) element.className = className; return element; };
const drafts = new Map();
let invitation, credentials, snapshot, cursor = 0, sequence = 0, pending, polling, sending = false, conflict = false, branchDraft, branchJsonDraft, homeDirty = false;
function status(message) { $('status').textContent = message; }
const fragment = location.hash;
history.replaceState(null, '', location.pathname + location.search);
try { if (fragment) { invitation = parseInvitation(fragment); $('connect').disabled = false; status('Your TV is ready. Connect to open its settings.'); } }
catch (error) { status(error.message); }
function option(select, value, title = value) { const item = node('option', title); item.value = value; select.append(item); }
function dirtyState() {
  $('savebar').hidden = !drafts.size;
  $('dirty-count').textContent = `${drafts.size} setting${drafts.size === 1 ? '' : 's'} ready to send`;
  $('save').disabled = sending || conflict || Boolean(pending);
  $('conflict').hidden = !conflict;
}
function setBusy(value) {
  sending = value;
  $('editor').querySelectorAll('button,input,select,textarea').forEach(control => {
    if (control.id !== 'disconnect' && control.id !== 'retry') control.disabled = value || control.dataset.readonly === 'true';
  });
  dirtyState();
}
function adopt(next) {
  if (snapshot && snapshot.profileID !== next.profileID) throw new Error('The TV profile changed. Start a fresh session.');
  const isOwnReceipt = pending && next.receipt?.requestID === pending.requestID;
  if (snapshot && next.revision !== snapshot.revision && (drafts.size || homeDirty) && !isOwnReceipt) conflict = true;
  snapshot = next;
  $('profile-title').textContent = next.configuration.profileName;
  if (!branchDraft || (!homeDirty && !sending)) branchDraft = structuredClone(next.configuration.branches);
  if (isOwnReceipt) {
    const operation = pending; pending = null; $('retry').hidden = true;
    if (next.receipt.status === 'applied') operation.resolve(next);
    else { conflict = true; operation.reject(new Error(next.receipt.message)); }
  }
  if (!sending && !drafts.size && !homeDirty) render();
  dirtyState();
}
async function consume(entries) {
  for (const entry of entries) {
    if (!Number.isSafeInteger(entry.serverSequence) || entry.serverSequence <= cursor) continue;
    const next = await decodeSnapshot(entry, credentials);
    if (next) adopt(next);
    cursor = entry.serverSequence;
  }
}
async function poll() {
  if (!credentials) return;
  try {
    if (snapshot && snapshot.expiresAt <= Date.now()) throw new Error('This setup session expired. Open a fresh session on your TV.');
    const page = await request(credentials, `/changes?after=${cursor}&limit=20`);
    if (page.ownerDeviceID !== credentials.ownerDeviceID) throw new Error('The setup owner changed.');
    await consume(page.changes);
  } catch (error) { status(error.message); }
  if (credentials) polling = setTimeout(poll, 2000);
}
$('connect').addEventListener('click', async () => {
  $('connect').disabled = true;
  try {
    credentials ||= makeCredentials(invitation);
    const response = await claim(invitation, credentials);
    if (response.ownerDeviceID !== credentials.ownerDeviceID || !Array.isArray(response.checkpoints) || response.checkpoints.length !== 2) throw new Error('The TV has not provided a complete setup snapshot.');
    await consume(response.checkpoints);
    if (!snapshot) throw new Error('No TV settings received. Start a new session on the TV.');
    invitation.profileKey.fill(0); invitation.enrollmentToken.fill(0); invitation = null;
    $('welcome').hidden = true; $('editor').hidden = false;
    const selector = $('section');
    for (const page of snapshot.configuration.pages) option(selector, page.id, page.title);
    for (const [id, title] of [['profile-editor', 'Profile name'], ['sources-editor', 'Manage sources'], ['api-editor', 'API credentials'], ['home-editor', 'Custom Home branches'], ['import-editor', 'Import setup / collections']]) option(selector, id, title);
    render(); status('Connected. Choose a section or search the complete settings menu.'); poll();
  } catch (error) { status(error.message); $('connect').disabled = false; }
});
const browserDestinations = {'open-branch-manager':'home-editor','open-quick-setup':'import-editor','profiles-rename-phone':'profile-editor','manage-addons':'sources-editor','manage-media-servers':'sources-editor','manage-webdav':'sources-editor','manage-live-sources':'sources-editor','open-source-manager':'sources-editor','source-torbox-configure':'api-editor','metadata-rpdb-add':'api-editor'};
function settingRow(item) {
  const row = node('div', null, 'row'), description = node('div');
  description.append(node('h3', item.title), node('p', item.subtitle)); row.append(description);
  if (browserDestinations[item.id]) { const button = node('button', 'Open editor', 'secondary'); button.addEventListener('click', () => { $('section').value = browserDestinations[item.id]; $('search').value = ''; render(); }); row.append(button); return row; }
  if (item.kind === 'action' && item.editable) { const button = node('button', 'Move later', 'secondary'); button.addEventListener('click', () => perform('action', {id:item.id})); row.append(button); return row; }
  if (!item.editable) { row.append(node('span', `${item.value}${item.value === 'On TV' ? '' : ' · View on TV'}`, 'status-value')); return row; }
  const value = drafts.has(item.id) ? drafts.get(item.id) : item.value;
  const input = node(item.kind === 'toggle' ? 'input' : 'select');
  input.setAttribute('aria-label', item.title); input.dataset.setting = item.id;
  if (item.kind === 'toggle') { input.type = 'checkbox'; input.checked = value; }
  else { for (const v of item.options) option(input, v); input.value = value; }
  input.addEventListener('change', () => {
    const next = item.kind === 'toggle' ? input.checked : input.value;
    if (next === item.value) drafts.delete(item.id); else drafts.set(item.id, next);
    dirtyState();
  }); row.append(input); return row;
}
function render() {
  if (!snapshot) return;
  const selection = $('section').value, search = $('search').value.trim().toLowerCase();
  const pages = snapshot.configuration.pages.filter(page => search || page.id === selection);
  $('settings').replaceChildren();
  for (const page of pages) for (const group of page.groups) {
    const items = group.items.filter(item => !search || `${item.title} ${item.subtitle} ${page.title}`.toLowerCase().includes(search));
    if (!items.length) continue;
    const card = node('section', null, 'card'); card.append(node('h2', search ? `${page.title} · ${group.title}` : group.title), node('p', group.explanation));
    items.forEach(item => card.append(settingRow(item))); $('settings').append(card);
  }
  for (const id of ['profile', 'sources', 'api', 'home', 'import']) $(id + '-panel').hidden = search || selection !== id + '-editor';
  if (selection === 'profile-editor') $('profile-name').value = snapshot.configuration.profileName;
  if (selection === 'sources-editor') {
    $('source-list').replaceChildren();
    for (const source of snapshot.configuration.sources) {
      const row = node('div', null, 'row'); row.append(node('span', `${source.name} · ${source.kind}`));
      const control = node('input'); control.type = 'checkbox'; control.checked = source.enabled; control.setAttribute('aria-label', `${source.name} enabled`);
      control.addEventListener('change', () => perform('source-enabled', { id: source.id, enabled: control.checked })); row.append(control); $('source-list').append(row);
    }
    if (!$('source-kind').options.length) snapshot.configuration.sourceKinds.forEach(value => option($('source-kind'), value));
  }
  if (selection === 'api-editor' && !$('api-id').options.length) snapshot.configuration.apiKeys.forEach(value => option($('api-id'), value));
  if (selection === 'home-editor') renderBranches();
  dirtyState();
}
function markHomeDirty() { homeDirty = true; branchJsonDraft = null; $('branches-json').value = JSON.stringify(branchDraft, null, 2); }
function field(label, value, change, options) {
  const wrapper = node('label'); wrapper.append(node('span', label.charAt(0).toUpperCase() + label.slice(1))); const input = node(options ? 'select' : 'input');
  if (options) options.forEach(item => option(input, item, item.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase()))); input.value = value || ''; input.addEventListener('change', () => { change(input.value); markHomeDirty(); }); wrapper.append(input); return wrapper;
}
function renderBranches() {
  $('branches').replaceChildren();
  branchDraft.branches.forEach((branch, index) => {
    const card = node('div', null, 'branch'), fields = node('div', null, 'fields');
    fields.append(field('Title', branch.title, value => branch.title = value));
    for (const key of ['catalog', 'mediaType', 'layout', 'posterStyle', 'sort', 'dataSource']) fields.append(field(key.replace(/([A-Z])/g, ' $1'), branch[key], value => branch[key] = value, snapshot.configuration.branchOptions[key]));
    fields.append(field('Source identifier (when required)', branch.sourceIdentifier, value => branch.sourceIdentifier = value || null));
    fields.append(field('Query / list identifier', branch.queryIdentifier, value => branch.queryIdentifier = value || null));
    const controls = node('div', null, 'branch-tools');
    for (const [label, mutate] of [
      [branch.enabled ? 'Hide' : 'Show', () => branch.enabled = !branch.enabled],
      ['Move up', () => { if (index > 0) [branchDraft.branches[index - 1], branchDraft.branches[index]] = [branch, branchDraft.branches[index - 1]]; }],
      ['Move down', () => { if (index < branchDraft.branches.length - 1) [branchDraft.branches[index + 1], branchDraft.branches[index]] = [branch, branchDraft.branches[index + 1]]; }],
      ['Remove', () => branchDraft.branches.splice(index, 1)],
    ]) { const button = node('button', label, 'secondary'); button.addEventListener('click', () => { mutate(); markHomeDirty(); renderBranches(); }); controls.append(button); }
    card.append(fields, controls); $('branches').append(card);
  });
  $('branches-json').value = branchJsonDraft ?? JSON.stringify(branchDraft, null, 2);
}
function transmit(operation, payload) {
  if (pending) throw new Error('Wait for the TV to confirm the previous edit.');
  return new Promise((resolve, reject) => {
    commandEnvelope(credentials, snapshot, operation, payload, ++sequence).then(outbound => {
      pending = { ...outbound, resolve, reject };
      request(credentials, '/changes', { method: 'POST', body: outbound.envelope }).then(() => status('Sent securely. Waiting for the TV to save…')).catch(error => {
        status(`${error.message} Delivery is unconfirmed. Retry sends the same edit safely.`); $('retry').hidden = false;
      });
    }).catch(reject);
  });
}
async function perform(operation, payload) {
  if (sending || !credentials) return;
  if (conflict) { status('Review the latest TV settings before sending. Your draft is still here.'); return; }
  setBusy(true); status('Encrypting and sending your changes…');
  try {
    await transmit(operation, payload);
    if (operation === 'branches') { homeDirty = false; branchJsonDraft = null; branchDraft = structuredClone(snapshot.configuration.branches); }
    status('Saved on your TV.');
  }
  catch (error) { status(error.message); }
  finally { setBusy(false); if (snapshot) render(); }
}
$('save').addEventListener('click', async () => {
  if (sending || conflict || !drafts.size) return;
  setBusy(true); status('Encrypting and sending your changes…');
  try {
    for (const [id, value] of [...drafts]) { await transmit('setting', { id, value }); drafts.delete(id); }
    status('All changes saved on your TV.');
  } catch (error) { status(error.message); }
  finally { setBusy(false); if (snapshot) render(); }
});
$('retry').addEventListener('click', async () => {
  if (!pending) return;
  try { await request(credentials, '/changes', { method: 'POST', body: pending.envelope }); $('retry').hidden = true; status('Delivery retried. Waiting for confirmation from the TV…'); }
  catch (error) { status(error.message); }
});
function discard() { if (!snapshot) return; drafts.clear(); conflict = false; homeDirty = false; branchJsonDraft = null; branchDraft = structuredClone(snapshot.configuration.branches); render(); }
$('discard').addEventListener('click', discard); $('reload').addEventListener('click', discard);
$('search').addEventListener('input', render); $('section').addEventListener('change', render);
$('rename-form').addEventListener('submit', event => { event.preventDefault(); perform('rename', { name: $('profile-name').value }); });
$('source-form').addEventListener('submit', event => { event.preventDefault(); const payload = { id: crypto.randomUUID(), kind: $('source-kind').value, name: $('source-name').value, endpoint: $('source-endpoint').value, username: $('source-username').value, password: $('source-password').value }; $('source-password').value = ''; perform('source', payload); });
$('api-form').addEventListener('submit', event => { event.preventDefault(); const payload = { id: $('api-id').value, value: $('api-value').value }; $('api-value').value = ''; perform('api-key', payload); });
$('import-form').addEventListener('submit', event => { event.preventDefault(); const text = $('import-text').value; $('import-text').value = ''; perform('import', { text }); });
$('add-branch').addEventListener('click', () => {
  if (branchDraft.branches.length >= 20) return status('Use up to 20 custom branches.');
  branchDraft.branches.push({ id: crypto.randomUUID(), title: 'New branch', catalog: 'trending', mediaType: 'movies', layout: 'poster', posterStyle: 'standard', enabled: true, filter: 'none', sort: 'catalog-default', dataSource: 'preferred-metadata', folders: [] });
  markHomeDirty(); renderBranches();
});
$('save-branches').addEventListener('click', () => perform('branches', { branches: branchDraft }));
$('branches-json').addEventListener('input', () => { homeDirty = true; branchJsonDraft = $('branches-json').value; });
$('save-home-json').addEventListener('click', () => { try { const branches = JSON.parse($('branches-json').value); perform('branches', { branches }); } catch { status('The Home document is not valid JSON. Nothing was sent.'); } });
$('disconnect').addEventListener('click', async () => {
  const active = credentials; credentials = null; clearTimeout(polling); pending?.reject(new Error('Browser disconnected. Check the TV for the last edit’s status.')); pending = null;
  $('editor').hidden = true; $('welcome').hidden = false; $('connect').disabled = true;
  drafts.clear(); snapshot = null; branchDraft = null; branchJsonDraft = null; homeDirty = false; document.querySelectorAll('input,textarea').forEach(input => input.value = '');
  try { if (active) await request(active, `/devices/${active.deviceID}`, { method: 'DELETE' }); }
  catch { /* Ending the TV session also revokes this ephemeral browser identity. */ }
  status('Disconnected. Close Browser Setup on the TV to end the session.');
});
window.addEventListener('beforeunload', event => { if (drafts.size || homeDirty || pending) { event.preventDefault(); event.returnValue = ''; } });
