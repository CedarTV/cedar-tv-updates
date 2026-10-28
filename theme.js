/* Shared by every page; runs before first paint. No account or network state. */
(() => {
  const key = 'cedar-color-theme';
  const valid = value => ['light', 'dark', 'system'].includes(value);
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  // Seasonal accent: October 1 – November 1 (site visitor's local date). ?halloween=on|off overrides and is remembered.
  const seasonKey = 'cedar-season';
  const season = (() => {
    let override = null;
    try {
      const asked = new URLSearchParams(location.search).get('halloween');
      if (asked === 'on' || asked === 'off') localStorage.setItem(seasonKey, asked);
      override = localStorage.getItem(seasonKey);
    } catch {}
    if (override === 'on') return true;
    if (override === 'off') return false;
    const now = new Date();
    return now.getMonth() === 9 || (now.getMonth() === 10 && now.getDate() === 1);
  })();
  if (season) document.documentElement.dataset.season = 'halloween';
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
    document.querySelectorAll('.cedar-header').forEach(header => {
      const toggle = header.querySelector('.cedar-menu-toggle');
      const menu = header.querySelector('.cedar-menu');
      if (!toggle || !menu) return;
      const setOpen = open => {
        toggle.setAttribute('aria-expanded', String(open));
        header.classList.toggle('is-menu-open', open);
      };
      header.classList.add('has-menu-toggle');
      toggle.hidden = false;
      toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
      menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && header.classList.contains('is-menu-open')) { setOpen(false); toggle.focus(); }
      });
    });
    // Release notes keep earlier builds collapsed; open one when a link targets it.
    const openLinkedRelease = () => {
      let id = '';
      try { id = decodeURIComponent((window.location.hash || '').slice(1)); } catch { return; }
      const target = id ? document.getElementById(id) : null;
      const details = target?.querySelector(':scope > details');
      if (!details || details.open) return;
      details.open = true;
      target.scrollIntoView({ block: 'start' });
    };
    document.querySelectorAll('.release-history-controls').forEach(controls => {
      const scope = controls.closest('section, main') ?? document;
      controls.hidden = false;
      controls.addEventListener('click', event => {
        const button = event.target.closest('[data-release-expand]');
        if (!button) return;
        scope.querySelectorAll('.release-entry-collapsed > details').forEach(details => {
          if (details.closest('section, main') === scope) details.open = button.dataset.releaseExpand === 'open';
        });
      });
    });
    window.addEventListener('hashchange', openLinkedRelease);
    openLinkedRelease();
    const current = window.location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.cedar-nav a').forEach(link => {
      const target = new URL(link.href);
      if (!target.hash && (target.pathname === current || (target.pathname.endsWith('/releases/') && current.includes('/releases/')))) {
        link.setAttribute('aria-current', target.pathname === current ? 'page' : 'location');
      }
    });
  });
})();
