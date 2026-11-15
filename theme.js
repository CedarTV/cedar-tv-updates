/* Shared by every page; runs before first paint. No account or network state. */
(() => {
  // Lets the header CSS collapse into the Menu button before first paint, so it doesn't jump on load.
  document.documentElement.classList.add('cedar-js');
  // Translated pages carry their script strings in <script id="cedar-strings">; English pages have none.
  let strings = null;
  window.cedarT = (text, values) => {
    if (strings === null) {
      try { strings = JSON.parse(document.getElementById('cedar-strings')?.textContent || '{}'); } catch { strings = {}; }
    }
    const translated = typeof strings[text] === 'string' ? strings[text] : text;
    return values ? translated.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match)) : translated;
  };
  window.cedarLocale = document.documentElement.lang || 'en';
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
      toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
      menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && header.classList.contains('is-menu-open')) { setOpen(false); toggle.focus(); }
      });
    });
    // Language menu: remember the choice, close on Escape or an outside click.
    const languageKey = 'cedar-language';
    const languageMenus = [...document.querySelectorAll('.cedar-language')];
    languageMenus.forEach(menu => {
      menu.addEventListener('click', event => {
        const link = event.target.closest('a[hreflang]');
        if (link) { try { localStorage.setItem(languageKey, link.hreflang); } catch {} }
      });
    });
    document.addEventListener('click', event => {
      languageMenus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      languageMenus.forEach(menu => { if (menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });
    });
    // On an English page, offer a translation that matches the browser's language, once.
    (() => {
      if ((document.documentElement.lang || 'en') !== 'en') return;
      let chosen = null;
      try { chosen = localStorage.getItem(languageKey); } catch {}
      if (chosen) return;
      const offers = [...(languageMenus[0]?.querySelectorAll('a[data-available][data-offer]') ?? [])];
      if (!offers.length) return;
      const match = (wanted) => {
        const tag = wanted.toLowerCase();
        const [base, region] = tag.split('-');
        const pick = code => offers.find(link => link.hreflang.toLowerCase() === code);
        if (base === 'en') return 'english';
        if (base === 'es') return pick(!region || region === 'es' ? 'es' : 'es-419') ?? pick('es');
        if (base === 'pt') return pick('pt-br');
        return pick(tag) ?? pick(base);
      };
      let offer = null;
      for (const wanted of navigator.languages ?? [navigator.language]) {
        if (!wanted) continue;
        const found = match(wanted);
        if (found === 'english') return;
        if (found) { offer = found; break; }
      }
      const main = document.querySelector('main');
      if (!offer || !main) return;
      const banner = document.createElement('aside');
      banner.className = 'language-offer';
      banner.lang = offer.lang;
      banner.dir = offer.dir;
      const link = document.createElement('a');
      link.href = offer.href;
      link.hreflang = offer.hreflang;
      link.textContent = offer.dataset.offer;
      link.addEventListener('click', () => { try { localStorage.setItem(languageKey, offer.hreflang); } catch {} });
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '×';
      close.setAttribute('aria-label', offer.dataset.dismiss || 'Close');
      close.addEventListener('click', () => {
        try { localStorage.setItem(languageKey, 'en'); } catch {}
        banner.remove();
      });
      banner.append(link, close);
      main.prepend(banner);
    })();
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
