export const projectBasePath = "/cedar-tv-updates";

export const footerStylesheet = `    <link rel="stylesheet" href="${projectBasePath}/footer.css">`;

export function renderSiteFooter() {
  return `      <footer class="site-footer">
        <div class="site-footer-intro">
          <a class="site-footer-brand" href="${projectBasePath}/" aria-label="Cedar home">
            <img src="${projectBasePath}/assets/cedar-app-icon.png" alt="" width="36" height="36" aria-hidden="true">
            <span>Cedar</span>
          </a>
          <p>A focused media player and organizer for the screens you already own. Connect only sources and services you are authorized to use.</p>
        </div>

        <nav class="site-footer-nav" aria-label="Footer navigation">
          <section class="site-footer-group">
            <h2>Products</h2>
            <ul>
              <li><a href="${projectBasePath}/">Android TV</a></li>
              <li><a href="${projectBasePath}/apple/">Apple apps</a></li>
              <li><a href="${projectBasePath}/link/">Cedar Link</a></li>
              <li><a href="${projectBasePath}/releases/">Release notes</a></li>
            </ul>
          </section>
          <section class="site-footer-group">
            <h2>Resources</h2>
            <ul>
              <li><a href="${projectBasePath}/create-tobacco-tie/">Create Tobacco Tie</a></li>
              <li><a href="${projectBasePath}/support/">Support</a></li>
              <li><a href="${projectBasePath}/privacy/">Privacy</a></li>
              <li><a href="${projectBasePath}/accessibility/">Accessibility</a></li>
              <li><a href="${projectBasePath}/content-policy/">Content policy</a></li>
            </ul>
          </section>
          <section class="site-footer-group">
            <h2>Community</h2>
            <ul>
              <li><a href="https://discord.gg/TFTx7j86v">Discord</a></li>
              <li><a href="https://www.reddit.com/r/CedarApp/">Reddit</a></li>
              <li><a href="https://github.com/CedarTV/cedar-tv-updates/issues">Report an issue</a></li>
              <li><a href="https://github.com/CedarTV/cedar-tv-updates">GitHub</a></li>
              <li><a href="${projectBasePath}/update-v1.json">Android manifest</a></li>
            </ul>
          </section>
        </nav>

        <p class="site-footer-meta">
          <span>© 2026 Cedar</span>
          <span>Cedar does not provide, host, or sell media content.</span>
        </p>
      </footer>`;
}

export const themeAssets = `    <script src="${projectBasePath}/theme.js"></script>
    <link rel="stylesheet" href="${projectBasePath}/site-shell.css">`;

export function renderSiteHeader() {
  return `      <header class="cedar-header">
        <a class="cedar-brand" href="${projectBasePath}/" aria-label="Cedar home">
          <img src="${projectBasePath}/assets/cedar-app-icon.png" alt="" width="36" height="36">
          <span>Cedar</span>
        </a>
        <nav class="cedar-nav" aria-label="Primary navigation">
          <a href="${projectBasePath}/#platforms">Platforms</a>
          <a href="${projectBasePath}/apple/">Apple apps</a>
          <a href="${projectBasePath}/releases/">What’s new</a>
          <a href="${projectBasePath}/artwork/">Artwork</a>
          <a href="${projectBasePath}/link/">Cedar Link</a>
          <a href="${projectBasePath}/support/">Support</a>
          <a class="cedar-download" href="${projectBasePath}/#download">Get Cedar</a>
        </nav>
        <label class="cedar-theme">Theme
          <select aria-label="Color theme" data-theme-select>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>`;
}
