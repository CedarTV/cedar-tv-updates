/* Shared by every page; runs before first paint. No account or network state. */
(() => {
  const key = 'cedar-color-theme';
  const valid = value => ['light', 'dark', 'system'].includes(value);
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch {}
  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08090b' : '#f4f1eb');
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
  }
  apply();
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[data-theme-select]').forEach(select => select.addEventListener('change', () => {
      if (!valid(select.value)) return;
      preference = select.value;
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    }));
    const current = window.location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.cedar-nav a').forEach(link => {
      const target = new URL(link.href);
      if (!target.hash && (target.pathname === current || (target.pathname.endsWith('/releases/') && current.includes('/releases/')))) {
        link.setAttribute('aria-current', target.pathname === current ? 'page' : 'location');
      }
    });
  });
})();
