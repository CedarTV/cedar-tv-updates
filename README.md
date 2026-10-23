# Cedar public site and Android TV updates

This public repository contains Cedar's cross-platform public information,
Android TV product site, update metadata, and release APKs:

- GitHub Pages serves Cedar's branded landing pages, cross-platform release notes, Apple support and
  policy documents, and `update-v1.json`, its small, signed Android update manifest.
- GitHub Releases serves versioned APK files.
- The app verifies the manifest's ECDSA signature, the APK's SHA-256 and size, its package name and version, and its Android signing certificate before opening Android's installer.

The Cedar source code, service credentials, Android signing keystore, and OTA manifest private key do not belong in this repository.

## Apple support and App Store information

The static Apple-facing routes are versioned alongside the rest of the site:

- `public/apple/` — Apple-platform product information and marketing URL.
- `public/support/` — public support and contact options.
- `public/privacy/` — the hosted privacy policy used by App Store Connect and the app.
- `public/accessibility/` — device-specific accessibility information.
- `public/content-policy/` — authorized-content policy, attribution, and reviewer demo link.
- `public/demo/cedar-review.m3u` — credential-free, lawfully licensed App Review sample playlist.

Keep these pages consistent with the final Apple binaries, privacy manifests, App Store privacy
answers, and review notes. Do not add personal contact information without the account holder's
approval, and never publish production credentials, customer data, private media URLs, or pairing
invitations.

### Publishing cross-platform release notes

Release notes use versioned sources for all five Cedar products:

- `release-notes/android-tv/releases.json` records the Android TV version, build, date, status,
  summary, and notes path. Its current entry must match the signed `public/update-v1.json` manifest.
- `release-notes/apple/releases.json` records platform, version, build, date, status, and summary.
- `release-notes/apple/<platform>/<version>.md` contains the full platform-specific notes.
- `node scripts/render_apple_releases.mjs --write` renders the public overview, iPhone, iPad,
  Apple TV, Mac, and machine-readable JSON pages.
- `node scripts/render_release_hub.mjs --write` renders the all-platform overview, Android TV
  changelog, and a machine-readable five-platform release catalog.
- `node scripts/render_site_footer.mjs --write` applies the same product, resource, community, and
  Discord footer to every public route.
- `node scripts/render_apple_releases.mjs --check` fails when generated pages do not match the
  versioned sources. The release-hub and shared-footer renderers have matching `--check` gates.

Use `release-candidate` while a build is still in release QA, `testflight` only after the matching
build is available to testers, and `released` only after App Store availability is confirmed. Keep
the public notes and App Store “What’s New” text aligned, but do not attach Apple binaries to this
repository; App Store and TestFlight remain the binary distribution channels.

## Cedar Radio

`public/radio/` contains the separate Cedar Radio product, support, and privacy pages. Its Radio Browser, music catalog, and lyrics integrations differ from the Cedar media player. App Store Connect uses `/radio/support/` and `/radio/privacy/` for `com.cedarplayer.app`.

## Feedback, roadmap and known issues

- `public/feedback/` is the public bug report and feature request form. It posts to the
  `cedar-feedback` Worker in [`feedback-worker/`](feedback-worker/README.md), which keeps reports
  private and is separate from the encrypted relay.
- Roadmap items live in the same Worker's D1 database. They're edited in Cedar Tracker (a local
  app in the private Cedar repository) or from the private Discord triage channel, and the Worker
  serves the reviewed, public ones at `/v1/roadmap`. `scripts/tracker_feed.mjs` defines that
  feed's schema and refuses private fields; `test/roadmap-tracker.test.mjs` checks the Worker's
  output against it.
- The roadmap page renders release status from `releases.json` plus Features and Known issues
  from the live `/v1/roadmap` feed.

## Encrypted relay

`worker/` contains the Cloudflare Worker/D1 ciphertext relay that browser setup uses. Cedar Link, the browser companion that also used it, has been retired. The relay stores device-token
hashes and encrypted envelopes; it never receives a profile encryption key or plaintext profile
data. See [`worker/README.md`](worker/README.md) for verification and deployment steps. The complete
rollout and conflict policy is recorded in Cedar Android's `docs/CROSS_PLATFORM_SYNC.md`.

## Android TV browser setup

`public/setup/` is an expiring settings editor for Android builds with **Quick Setup → Open Browser Setup**.
Scan the TV's QR code from a phone or computer, connect, then edit the native settings catalogue,
add or pause sources, enter API credentials, rename the profile, arrange Home branches, or import
a Cedar/provider/Nuvio/Studio setup document. Each save waits for an authenticated acknowledgment
from the TV. Older released Android builds do not expose this entry point.

The TV owns a separate, temporary encrypted relay space. It does not enroll the browser in ongoing profile sync. The invitation expires in five minutes;
the session ends after 30 minutes, when setup closes, when the TV app backgrounds, or on a profile
switch. The browser removes the invitation fragment immediately and keeps setup credentials and
drafts in memory. Existing provider endpoints, passwords and API keys are not projected back to it.
New credentials are encrypted before delivery and saved through Android's native credential store.
Parental security, account authorization and device-only operations stay on the TV. The shared site
theme may save a color preference; setup data does not use browser persistence.

Run the normal site test and renderer gates before publishing. The browser recovery harness
`scripts/test_android_setup_browser.cjs` requires Playwright/Chrome and `CEDAR_SETUP_EVIDENCE`
pointing to a report directory containing a synthetic `settings-fixture.json` generated by Android's
`CedarBrowserSetupInstrumentedTest`. The live relay harness `scripts/verify_android_setup_browser.cjs`
runs alongside that class's opt-in `encryptedBrowserRelayRoundTripWhenRequested` instrumentation test
with `cedarBrowserRelay=true`. Set `CEDAR_SETUP_LIVE_SITE=1` to verify public Pages; otherwise it serves
the local static assets under their intended origin while still using the live encrypted relay.
Both harnesses save redacted verification records and screenshots, never invitation credentials.

## Personalize Cedar

The homepage’s **Choose an avatar** and **Choose source badges** buttons open the public
`artwork/` gallery. Browsing and copying a selection URL require no pairing. Each selection offers:

- **Open in Cedar**: `cedar://artwork/avatar?url=…` or `cedar://artwork/badges?url=…`.
  Apple app builds with artwork-link support stage the choice for explicit confirmation after
  startup/onboarding. This requires an updated app; existing released builds may ignore the route.
- **Copy URL**: paste the image URL into the profile’s Custom Image editor, or the pack URL into
  Settings → Source Badges → Pack URL. Clipboard failures leave a selectable text field.

## Profile avatars and badge artwork

The companion's recovered Xperience artwork is stored directly in Git and served by GitHub Pages:

- `public/avatars/` contains 1,465 profile avatars.
- `public/badges/` contains 1,581 unique badge images across 33 sets.
- `public/catalogs/avatars.json` and `public/catalogs/badges.json` power the Creator and artwork selectors.
- `public/badge-packs/` contains 33 bounded Cedar-compatible manifests whose images stay on GitHub Pages.
- `creator/artwork-sources.json` records byte sizes, source URLs, and SHA-256 checksums for every mirrored file. It isn't published: the public catalogs name no other app and link nowhere else.
- `public/avatars/community/` holds the photos that came from the old `nuvio` collection, which the catalog now uses. `public/avatars/nuvio/` stays so profiles that already chose one of those photos keep it.

Run `node scripts/import-xperience-assets.mjs` to verify the local copies and regenerate the catalogs from the recovery reports. Existing valid files are reused.

## Release order

Run `scripts/publish_release.sh` from a clean `main` checkout. It publishes the signed APK first and commits the signed manifest last. This prevents devices from seeing a manifest whose APK is not yet available.

## Shared website navigation and themes

All 17 public pages use `scripts/site_components.mjs` for the primary header and footer.
After changing shared navigation or community links, run:

```sh
node scripts/render_apple_releases.mjs
node scripts/render_release_hub.mjs
node scripts/render_site_footer.mjs --write
```

`public/site-shell.css` supplies shared navigation and light-theme colors.
`public/theme.js` follows the device color scheme by default and saves an explicit
Light, Dark, or System choice under `cedar-color-theme` in browser storage. It also
works when browser storage is unavailable. Screenshots and media artwork retain
their original colors. The theme script runs before the page renders and does not
make network requests.

Run `node --test test/*.test.mjs`, each renderer with `--check`, and
`node scripts/verify_public_site.mjs` before publishing.

## Cedar Creator

`public/creator/` is the one place to shape a Cedar Home on the website, at
<https://cedartv.github.io/cedar-tv-updates/creator/>. It has four tabs:

- **Setups**: the curated catalog (`creator/setups.json`, built into `public/creator/items/` by
  `scripts/build_creator_catalog.mjs`). Adding a setup or one of its branch groups puts it on Your Home.
- **Your Home**: the builder that used to be Cedar Studio. Catalog picks sit alongside Branches and
  Branch Groups built by hand or imported, with a Home preview, quick editor, source filters, group
  device layouts, undo, and a draft saved in the browser. No emoji controls are used.

  The Home preview (`public/creator/home-preview.mjs`) draws the same Branch JSON that export
  writes, so a picked setup shows every row it publishes. Rows take their real style (poster, wide,
  featured or hero) and each Branch Group shows its folder cards in the group's one shape (poster,
  landscape or square), as Cedar does on the chosen device. A folder card opens the folder's page:
  its rows (or chips and grid), or the folders inside a hub. **See all** opens a Branch's titles or
  a group's cards. Titles are sample posters; covers, heroes and logos are the setup's own artwork.
  Card and poster titles sit below the artwork by default; the preview's Titles menu also offers
  Cedar's other positions (on the artwork, or hidden) and is remembered in the browser only.

  **+ Branch** opens the Branch builder (`public/creator/branch-builder.mjs`), the website's version
  of Cedar's New Branch page: Content (Discover, Your Library, Saved & Tracked, or a public Trakt,
  MDBList or TMDB list link), Build Your Own with Refine Results, Layout with a live preview, an
  automatic or custom Branch Title, and Devices. Its choices and title rules come from the app
  (`branch-options.mjs`), and a built Branch is stored and exported as Cedar's own `dataSource`,
  `query` and filters. The same builder edits a row inside a Branch Group folder, and opens imported
  TMDB and Trakt sources too.
- **Profile photos** and **Source badges**: the artwork galleries. A profile photo can be put on Your
  Home so the exported file offers it.

Import accepts external collection arrays, collection envelopes, Nuvio profile exports, and saved
v1/v2 drafts, through files, pasted JSON or public HTTPS URLs (10 MB maximum). A review precedes
append, replace or add-missing. Kaptain's public v0.92 collection can be loaded through the import
dialog; its JSON and artwork remain hosted by their original authors. Creator is the only place other
apps' collection formats are read; the Cedar apps import only `.cedar` files.

Export writes Cedar's native `.cedar` file, as described in `CEDAR_FILE_FORMAT.md` in the Cedar
repository, through `public/shared/cedar-file.mjs`:

- A **Branches file** is safe to share. Catalog picks are copied exactly as published. Direct
  Branches become ordinary Branches in the row style chosen for them (posters by default); Branch Groups become
  `cedar.branch-group` Branches whose device layouts become `platformConfiguration`. Sources that
  can't travel (Tobacco Tie catalogs other than Trakt Up Next and watchlists) are left out and listed.
- A **profile file** is sealed with a passphrase and can carry the owner's own Tobacco Ties, so rows
  that read them come too.
- A Home made only of catalog picks is written under Creator's shared bundle ID, exactly as the old
  cart download was, and can also be opened as a `cedar://creator/cart` link or copied as a web link.
  Any hand-made row makes it a file-only Home with its own stable bundle ID.

The browser never sends a file to a paired device. The old Studio address, `public/customize/`,
redirects to the Your Home tab, and Creator moves an old cart and an old Studio draft into Your Home.
`Tests/Fixtures/CedarFormat/studio-export.cedar` and `studio-profile.cedar` in the Cedar repository
come from this exporter and are checked by Cedar's own importer.

Verify with `node --test test/*.test.mjs` and `node scripts/verify_creator_browser.cjs` (Playwright
and Chrome required). Set `CEDAR_STUDIO_URL` to a served project root or the live Pages root, and
`CEDAR_STUDIO_ARTIFACTS` to a disposable directory under the parent workspace's `tmp` symlink.

## Tobacco Ties

`public/create-tobacco-tie/` generates a portable username and password locally in the browser.
In Cedar, open Settings → Connections & Services → Media Servers → Add Connection → Cedar Library, choose Add a Tobacco Tie, then enter the displayed server URL and both credentials.
Cedar checks that server without sending the credentials, then decodes and installs the source.
Legacy codes and `cedar://tie/` links remain available for older apps and through the code import option.
Anyone holding both credentials or a complete code can install the tie; keep configured ties private. See
[`docs/tobacco-tie-format.md`](docs/tobacco-tie-format.md) for the versioned format and verification.
