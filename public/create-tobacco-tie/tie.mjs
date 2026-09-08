import { createTie } from './codec.mjs';
const form = document.querySelector('#tie-form');
const input = document.querySelector('#addon-url');
const error = document.querySelector('#address-error');
const clear = document.querySelector('#clear-input');
const create = document.querySelector('#create-tie');
const copy = document.querySelector('#copy-tie');
const code = document.querySelector('#tie-code');
const openCedar = document.querySelector('#open-cedar');
const status = document.querySelector('#copy-status');
let revision = 0;
function resetResult() {
  revision++;
  error.hidden = true;
  error.textContent = '';
  input.removeAttribute('aria-invalid');
  clear.hidden = !input.value;
  code.value = '';
  openCedar.hidden = true;
  openCedar.removeAttribute('href');
  status.textContent = '';
  copy.disabled = true;
  copy.innerHTML = 'Copy Tobacco Tie <span aria-hidden="true">↗</span>';
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
    openCedar.href = result.link;
    openCedar.hidden = false;
    copy.disabled = false;
    status.textContent = 'Your Tobacco Tie is ready.';
    code.focus({ preventScroll: true });
  } catch (issue) {
    if (current !== revision) return;
    error.textContent = issue instanceof Error ? issue.message : 'We couldn’t create this tie. Please try again.';
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  } finally { create.disabled = false; }
});
copy.addEventListener('click', async () => {
  if (!code.value) return;
  const current = revision;
  try {
    await navigator.clipboard.writeText(code.value);
    if (revision !== current) return;
    copy.textContent = 'Copied ✓';
    status.textContent = 'Copied to your clipboard.';
  } catch {
    if (revision !== current) return;
    code.focus(); code.select();
    status.textContent = 'Your code is selected. Use your device’s Copy command.';
  }
});
