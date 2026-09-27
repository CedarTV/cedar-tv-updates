import { createTie, SERVER_URL } from './codec.mjs?v=3';
const form = document.querySelector('#tie-form');
const input = document.querySelector('#addon-url');
const error = document.querySelector('#address-error');
const clear = document.querySelector('#clear-input');
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
function resetResult() {
  revision++;
  error.hidden = true;
  error.textContent = '';
  input.removeAttribute('aria-invalid');
  clear.hidden = !input.value;
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
input.addEventListener('input', resetResult);
clear.addEventListener('click', () => { input.value = ''; resetResult(); input.focus(); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  resetResult();
  const current = revision;
  create.disabled = true;
  try {
    const result = await createTie(input.value);
    if (current !== revision) return;
    code.value = result.code;
    username.value = result.username;
    password.value = result.password;
    openCedar.href = result.link;
    openCedar.hidden = false;
    for (const output of outputs) output.button.disabled = false;
    status.textContent = 'Your Tobacco Tie username and password are ready.';
    username.focus({ preventScroll: true });
  } catch (issue) {
    if (current !== revision) return;
    error.textContent = issue instanceof Error ? issue.message : 'We couldn’t create this tie. Please try again.';
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
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
