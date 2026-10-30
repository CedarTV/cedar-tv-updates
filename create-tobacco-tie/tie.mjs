import { createTie, splitAddresses, MAX_BUNDLE_COUNT, SERVER_URL } from './codec.mjs?v=6';
const form = document.querySelector('#tie-form');
const list = document.querySelector('#address-list');
const addAddress = document.querySelector('#add-address');
const error = document.querySelector('#address-error');
const create = document.querySelector('#create-tie');
const code = document.querySelector('#tie-code');
const username = document.querySelector('#tie-username');
const password = document.querySelector('#tie-password');
const server = document.querySelector('#tie-server');
const openCedar = document.querySelector('#open-cedar');
const status = document.querySelector('#copy-status');
const outputs = [
  { field: server, button: document.querySelector('#copy-server'), label: 'Copy server URL', copied: 'Server URL copied.' },
  { field: username, button: document.querySelector('#copy-username'), label: 'Copy username', copied: 'Username copied.' },
  { field: password, button: document.querySelector('#copy-password'), label: 'Copy password', copied: 'Password copied.' },
  { field: code, button: document.querySelector('#copy-tie'), label: 'Copy Tobacco Tie', copied: 'Tobacco Tie copied.' },
];
let revision = 0;
server.value = SERVER_URL;
const rows = () => [...list.querySelectorAll('.address-row')];
const inputs = () => rows().map(row => row.querySelector('.address-input'));
// One row per URL. With a single row its button clears it; with several, each button removes its row.
function renumber() {
  const all = rows();
  all.forEach((row, index) => {
    const number = index + 1;
    const input = row.querySelector('.address-input');
    const button = row.querySelector('.clear-input');
    input.id = `address-${number}`;
    row.querySelector('.address-label').htmlFor = input.id;
    row.querySelector('.address-label').textContent = `URL ${number}`;
    button.setAttribute('aria-label', all.length > 1 ? `Remove URL ${number}` : `Clear URL ${number}`);
    button.hidden = all.length === 1 && !input.value;
  });
  addAddress.hidden = all.length >= MAX_BUNDLE_COUNT;
}
function addRow(value = '') {
  const row = rows()[0].cloneNode(true);
  const input = row.querySelector('.address-input');
  input.value = value;
  input.removeAttribute('aria-invalid');
  list.append(row);
  renumber();
  return input;
}
function resetResult() {
  revision++;
  error.hidden = true;
  error.textContent = '';
  for (const input of inputs()) input.removeAttribute('aria-invalid');
  renumber();
  code.value = '';
  username.value = '';
  password.value = '';
  openCedar.hidden = true;
  openCedar.removeAttribute('href');
  status.textContent = '';
  for (const output of outputs) {
    output.button.disabled = !output.field.value;
    output.button.textContent = output.label;
  }
}
list.addEventListener('input', resetResult);
list.addEventListener('click', event => {
  const button = event.target.closest('.clear-input');
  if (!button) return;
  const row = button.closest('.address-row');
  const index = rows().indexOf(row);
  if (rows().length > 1) {
    row.remove();
    resetResult();
    inputs()[Math.min(index, inputs().length - 1)].focus();
  } else {
    row.querySelector('.address-input').value = '';
    resetResult();
    row.querySelector('.address-input').focus();
  }
});
// Pasting several addresses at once fills this box and the ones after it, adding boxes as needed.
list.addEventListener('paste', event => {
  const input = event.target.closest('.address-input');
  const parts = splitAddresses(event.clipboardData?.getData('text') ?? '');
  if (!input || parts.length < 2) return;
  event.preventDefault();
  let target = input;
  for (const [offset, part] of parts.entries()) {
    if (offset > 0) {
      const next = inputs()[inputs().indexOf(target) + 1];
      if (next && !next.value) target = next;
      else if (rows().length < MAX_BUNDLE_COUNT) target = addRow();
      else break;
    }
    target.value = part;
  }
  resetResult();
  target.focus();
});
addAddress.addEventListener('click', () => {
  const empty = inputs().find(input => !input.value.trim());
  (empty ?? addRow()).focus();
  resetResult();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  resetResult();
  const current = revision;
  create.disabled = true;
  try {
    const result = await createTie(inputs().map(input => input.value));
    if (current !== revision) return;
    code.value = result.code;
    username.value = result.username;
    password.value = result.password;
    openCedar.href = result.link;
    openCedar.hidden = false;
    for (const output of outputs) output.button.disabled = false;
    status.textContent = result.count > 1
      ? `Your username and password are ready. They install all ${result.count} URLs together.`
      : 'Your Tobacco Tie username and password are ready.';
    if (result.insecureHosts.length) {
      status.textContent += ` ${result.insecureHosts.join(', ')} uses unencrypted HTTP, so its address and anything it sends can be read on the network. Cedar will ask before installing it, and needs the latest app version.`;
    }
    username.focus({ preventScroll: true });
  } catch (issue) {
    if (current !== revision) return;
    error.textContent = issue instanceof Error ? issue.message : 'We couldn’t create this tie. Please try again.';
    error.hidden = false;
    const failing = inputs()[Number.isInteger(issue?.index) ? issue.index : 0];
    failing.setAttribute('aria-invalid', 'true');
    failing.focus();
  } finally { create.disabled = false; }
});
for (const output of outputs) {
  output.button.addEventListener('click', async () => {
    if (!output.field.value) return;
    const current = revision;
    try {
      await navigator.clipboard.writeText(output.field.value);
      if (revision !== current) return;
      output.button.textContent = 'Copied ✓';
      status.textContent = output.copied;
    } catch {
      if (revision !== current) return;
      output.field.focus(); output.field.select();
      status.textContent = 'The value is selected. Use your device’s Copy command.';
    }
  });
}
resetResult();
