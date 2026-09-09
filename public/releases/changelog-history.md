# Cedar changelog archive — all recorded builds

Compiled September 9, 2026 from App Store Connect build records, saved Apple testing notes, GitHub Releases and signed Android manifest history.

Coverage: 34 processed Apple binaries (universal iOS is shown separately for iPhone and iPad), one rejected Apple TV upload, and all 19 published Android releases. Android TV, Google TV and Android-based Fire TV share one release line. Unpublished Android version gaps and unused Apple platform/build combinations are not fabricated. Availability is a September 9 snapshot.

Apple build 2 was TV-only; build 6 was Mac-only. Mac build 4 is expired; Apple TV build 1 was rejected. Mac build 12 remains a candidate, while iPhone/iPad and Apple TV build 12 are in external TestFlight.

## iPhone

### 1.0.0 · build 13 · 2026-09-09 · testflight


Build 13 · September 9, 2026 · Available to external testers in TestFlight.

#### Changes

NEW: Add a TV Guide Home branch with Recently Played, Favorites or a saved custom lineup. Choose its title, visible row count and time window; See All keeps the same channel source. Empty guides show setup guidance.

ARTWORK: Studio and streaming-service cards are bundled, with centered logos and brand-colored backgrounds. Compact and large-screen artwork are packaged separately.

LAYOUT: Branch Group poster spacing now matches Home. Live TV Continue Watching no longer casts dark shadows into the gaps between posters.

IPHONE/IPAD: Library, Downloads, Local Files, WebDAV and Media Servers now use compact centered navigation titles.

#### Testing

PLEASE TEST: Add/edit each guide source, change rows and hours, verify lineup order and empty states, open See All, select a current program and test reminders/catch-up where supported. Check bundled cards, poster spacing and navigation.

Known limitations: Prior CloudKit backlog recovery, translation gaps and broader hardware/accessibility qualification remain open. Provider playback and all-device visual checks are not comprehensively certified.


### 1.0.0 · build 12 · 2026-09-09 · testflight


Build 12 · September 9, 2026 · TestFlight beta

#### Changes since build 11

- Household & Sync brings Apple household sharing, invitations, status and device controls together. Household discovery refreshes as iCloud imports arrive and shows initial download progress.
- Replaying unchanged household profiles no longer creates new journal mutations. Copying a profile to Android is a one-time transfer and does not establish ongoing relay sync; existing links remain available under Advanced Transfers & Links.
- Connected libraries share in-flight refreshes, briefly reuse successful snapshots and refresh individual servers explicitly. Library badges and ordering reuse a prepared index.
- Home bounds concurrent discovery work and updates affected add-on shelves without restarting unrelated shelves.
- Metadata and service caches do less maintenance on each hit, have bounded disposable entries and coalesce purgeable writes.
- Network responses are assembled in chunks; oversized downloads stop during transfer. Immediate playlist import reuses its validated download and batches category registration.
- Catalog ordering and expired-guide cleanup use additional database indexes. Existing catalog contents and query behavior are retained.
- Bitmap subtitles reuse unchanged layers, and diagnostics reuse their redaction patterns. Original hero and clear-art quality is preserved.

#### iPhone details

- Home keeps its visible snapshot when returning during an interrupted load. Swipe-driven atmospheric backgrounds have additional continuity and viewport fixes; final physical-device confirmation remains open.
- Search uses the page background through the navigation header.
- Download progress updates avoid repeated full-list reloads. System Now Playing artwork uses the shared image pipeline.

#### What to test

Check slow/reversed hero swipes in both hero layouts, Search in light/dark appearance, leaving/returning to Home while loading, downloads and lock-screen artwork. Also test profile switching, offline/error recovery, media-server refreshes and one-time Android copies.

#### Known limitations

Existing CloudKit export backlogs/private-shared zone problems are not automatically repaired. Production-cloud convergence, sustained physical-device media/output compatibility and large-library performance still need validation. Some Apple translations and wider TV/iPad UI test coverage remain incomplete. The mobile hero follow-up fixes require fresh physical visual confirmation. No overall FPS, battery or startup percentage improvement is claimed.

Available to the existing Cedar External TestFlight group. This beta is not an App Store release.

### 1.0.0 · build 11 · 2026-09-09 · release-candidate


Fewer unnecessary iCloud writes, improved Next Up loading, and clearer sync diagnostics. Organized download destinations preserve existing files.

#### Improvements
- Organized media-library folders can be the sole download destination, with movie/season naming and subtitle sidecars. Existing downloads and exports are preserved.
- Reduced unnecessary iCloud writes and Home reloads when saved profile values have not changed.
- Released obsolete database read snapshots to reduce checkpoint contention.
- Overlapped Next Up metadata lookups and reduced unnecessary episode enrichment.
- Improved artwork network-failure handling and repair diagnostics.

#### Please test
- Select a profile, leave Home idle, then background and reopen Cedar. Check Home stability and sync status.
- Verify Next Up episode selection and artwork.
- Select an organized download destination, download a movie/episode with subtitles, relaunch, and reconnect an external folder. Confirm files are preserved and the chosen destination remains correct.
- Check playback, source selection and settings on iPhone/iPad, Apple TV and Mac.

#### Known issue

iCloud sync: iCloud exports can still be throttled and repeatedly retried by the system. These changes reduce new writes but do not claim to fix the existing CloudKit backlog or retry behavior. Please include device/OS and time of occurrence in feedback; do not send credentials or private media URLs.

### 1.0.0 · build 10 · 2026-09-08 · testflight


Automatic media-library copies, direct App Store review access, and an organized changelog.

#### Improvements

- Optional automatic copies of completed downloads into movie and season folders, with available metadata IDs and subtitles. Pending copies survive drive disconnection and are protected from cleanup.
- Rate Cedar opens the App Store review page directly.
- Changelog highlights the installed build and collapses other versions. Apple TV retains QR links and remote-friendly expansion controls.
- Home DVR scheduling preserves explicit and XMLTV season/episode numbering. The recording Mac exports identified movies and episodes into media-server folders; unidentified broadcasts remain under Recordings.

#### Please test

- Verify source setup, playback, settings navigation and household remote control.
- Test library folders after relaunch and drive reconnection, export retries, and movie/episode matching in your media server. Refresh guide data to capture episode numbering formats. Existing exports are not renamed or overwritten.

#### Known limitations

- Commercial detection and watch-while-recording are not included.
- Signed folder-access and real-server scanning need device testing. Previously documented Mac household CloudKit-zone and legacy-Keychain migration limitations remain.

### 1.0.0 · build 9 · 2026-09-08 · testflight


A stationary, edge-to-edge onboarding poster wall with a stronger diagonal angle.

#### What changed

- Onboarding posters are stationary, fill the window edges, and use a 12-degree angle.

#### Testing notes

- Existing Mac household libraries with records split across private/shared CloudKit zones are not automatically repaired.
- Signed-app migration of restricted legacy Mac credentials still needs real-device validation.
- Phone-remote artwork and seeking still need verification during real TV playback.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 8 · 2026-09-08 · testflight


A redesigned Cedar Remote with larger controls, TV naming, a playback timeline, and reliable discovery.

#### What changed

- New artwork-led remote layout, circular playback controls, contextual actions, and TV room naming.
- Authenticated discovery filters dead entries and merges duplicate TV identities.
- Seekable timeline with compatible TVs; older TVs retain a read-only timeline.
- Hardware, installed-player, and touch-control preferences stay on each device. Languages and episode behavior remain shared.
- Clearer iCloud sync errors and progress, plus corrected household migration ordering.

#### Testing notes

- Check artwork loading and seeking during real playback; authenticated phone-to-TV connectivity was verified while idle.
- Some existing Mac household libraries with records split across private/shared CloudKit zones still cannot export. This build does not automatically repair those libraries.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 7 · 2026-09-08 · testflight


Build 7 · 2026-09-08

#### What changed

- Added direct artwork-gallery links that staged an avatar or badge pack in Cedar for explicit confirmation after startup or onboarding.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 5 · 2026-09-08 · release-candidate


Build 5 · 2026-09-08

#### What changed

- Blended hero backgrounds smoothly between titles and expanded Settings search with corrected destinations.
- Redesigned the Cedar Supporter page for iPhone and iPad.
- Added Save to Media Library for completed downloads, with organized names, available subtitle copies and protection for existing files. Export copied the original file without transcoding.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 4 · 2026-09-08 · testflight


Build 4 · 2026-09-08

#### What changed

- Fixed watched episodes in Search → Recently Viewed opening an invalid detail target. Episode cards opened their parent series while retaining history identity and episode progress.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 3 · 2026-09-08 · release-candidate


Build 3 · 2026-09-08

#### What changed

- Updated the interface and source terminology to Tobacco Ties while retaining compatible import formats.
- Detail trailers used recognized YouTube links; retired trailer-provider settings were removed.
- Updated detail, playback, guide, pairing and Home presentation.
- Some revised strings still fell back to English. Physical-device playback, pairing, sync and accessibility acceptance remained open.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 1 · 2026-09-07 · release-candidate


#### Highlights

- Organize and play media from sources you own or are authorized to use.
- Customize Home branches and shelves around favorites, recent titles, live channels, and provider collections.
- Add M3U, Xtream-compatible, and XMLTV sources with clear handling for unencrypted endpoints.
- Resume playback, choose audio and subtitle tracks, use Picture in Picture, and download supported media.

#### Private by design

- Keep credentials in Keychain and library data local by default.
- Optionally sync profiles through private iCloud data, Cedar Household, or end-to-end encrypted Cedar Link.
- Use Cedar without advertising, cross-app tracking, or a required Cedar account.

#### Release status

This is the version 1.0.0 build 1 release candidate. It is not yet an App Store release.

## iPad

### 1.0.0 · build 13 · 2026-09-09 · testflight


Build 13 · September 9, 2026 · Available to external testers in TestFlight.

#### Changes

NEW: Add a TV Guide Home branch with Recently Played, Favorites or a saved custom lineup. Choose its title, visible row count and time window; See All keeps the same channel source. Empty guides show setup guidance.

ARTWORK: Studio and streaming-service cards are bundled, with centered logos and brand-colored backgrounds. Compact and large-screen artwork are packaged separately.

LAYOUT: Branch Group poster spacing now matches Home. Live TV Continue Watching no longer casts dark shadows into the gaps between posters.

IPHONE/IPAD: Library, Downloads, Local Files, WebDAV and Media Servers now use compact centered navigation titles.

#### Testing

PLEASE TEST: Add/edit each guide source, change rows and hours, verify lineup order and empty states, open See All, select a current program and test reminders/catch-up where supported. Check bundled cards, poster spacing and navigation.

Known limitations: Prior CloudKit backlog recovery, translation gaps and broader hardware/accessibility qualification remain open. Provider playback and all-device visual checks are not comprehensively certified.


### 1.0.0 · build 12 · 2026-09-09 · testflight


Build 12 · September 9, 2026 · TestFlight beta

#### Changes since build 11

- Household & Sync brings Apple household sharing, invitations, status and device controls together. Household discovery refreshes as iCloud imports arrive and shows initial download progress.
- Replaying unchanged household profiles no longer creates new journal mutations. Copying a profile to Android is a one-time transfer and does not establish ongoing relay sync; existing links remain available under Advanced Transfers & Links.
- Connected libraries share in-flight refreshes, briefly reuse successful snapshots and refresh individual servers explicitly. Library badges and ordering reuse a prepared index.
- Home bounds concurrent discovery work and updates affected add-on shelves without restarting unrelated shelves.
- Metadata and service caches do less maintenance on each hit, have bounded disposable entries and coalesce purgeable writes.
- Network responses are assembled in chunks; oversized downloads stop during transfer. Immediate playlist import reuses its validated download and batches category registration.
- Catalog ordering and expired-guide cleanup use additional database indexes. Existing catalog contents and query behavior are retained.
- Bitmap subtitles reuse unchanged layers, and diagnostics reuse their redaction patterns. Original hero and clear-art quality is preserved.

#### iPad details

- Home keeps its visible snapshot when returning during an interrupted load. Shared mobile atmosphere/viewport corrections and Search background consistency are included.
- Download progress updates avoid repeated full-list reloads. System Now Playing artwork uses the shared image pipeline.

#### What to test

Check native Search entry/reselection, rotation, both hero layouts, returning to Home while loading, download destinations and larger-text layouts. Also test profile switching, offline/error recovery, media-server refreshes and one-time Android copies.

#### Known limitations

Existing CloudKit export backlogs/private-shared zone problems are not automatically repaired. Production-cloud convergence, sustained physical-device media/output compatibility and large-library performance still need validation. Some Apple translations and wider TV/iPad UI test coverage remain incomplete. The mobile hero follow-up fixes require fresh physical visual confirmation. No overall FPS, battery or startup percentage improvement is claimed.

Available to the existing Cedar External TestFlight group. This beta is not an App Store release.

### 1.0.0 · build 11 · 2026-09-09 · release-candidate


Fewer unnecessary iCloud writes, improved Next Up loading, and clearer sync diagnostics. Organized download destinations preserve existing files.

#### Improvements
- Organized media-library folders can be the sole download destination, with movie/season naming and subtitle sidecars. Existing downloads and exports are preserved.
- Reduced unnecessary iCloud writes and Home reloads when saved profile values have not changed.
- Released obsolete database read snapshots to reduce checkpoint contention.
- Overlapped Next Up metadata lookups and reduced unnecessary episode enrichment.
- Improved artwork network-failure handling and repair diagnostics.

#### Please test
- Select a profile, leave Home idle, then background and reopen Cedar. Check Home stability and sync status.
- Verify Next Up episode selection and artwork.
- Select an organized download destination, download a movie/episode with subtitles, relaunch, and reconnect an external folder. Confirm files are preserved and the chosen destination remains correct.
- Check playback, source selection and settings on iPhone/iPad, Apple TV and Mac.

#### Known issue

iCloud sync: iCloud exports can still be throttled and repeatedly retried by the system. These changes reduce new writes but do not claim to fix the existing CloudKit backlog or retry behavior. Please include device/OS and time of occurrence in feedback; do not send credentials or private media URLs.

### 1.0.0 · build 10 · 2026-09-08 · testflight


Automatic media-library copies, direct App Store review access, and an organized changelog.

#### Improvements

- Optional automatic copies of completed downloads into movie and season folders, with available metadata IDs and subtitles. Pending copies survive drive disconnection and are protected from cleanup.
- Rate Cedar opens the App Store review page directly.
- Changelog highlights the installed build and collapses other versions. Apple TV retains QR links and remote-friendly expansion controls.
- Home DVR scheduling preserves explicit and XMLTV season/episode numbering. The recording Mac exports identified movies and episodes into media-server folders; unidentified broadcasts remain under Recordings.

#### Please test

- Verify source setup, playback, settings navigation and household remote control.
- Test library folders after relaunch and drive reconnection, export retries, and movie/episode matching in your media server. Refresh guide data to capture episode numbering formats. Existing exports are not renamed or overwritten.

#### Known limitations

- Commercial detection and watch-while-recording are not included.
- Signed folder-access and real-server scanning need device testing. Previously documented Mac household CloudKit-zone and legacy-Keychain migration limitations remain.

### 1.0.0 · build 9 · 2026-09-08 · testflight


A stationary, edge-to-edge onboarding poster wall with a stronger diagonal angle.

#### What changed

- Onboarding posters are stationary, fill the window edges, and use a 12-degree angle.

#### Testing notes

- Existing Mac household libraries with records split across private/shared CloudKit zones are not automatically repaired.
- Signed-app migration of restricted legacy Mac credentials still needs real-device validation.
- Phone-remote artwork and seeking still need verification during real TV playback.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 8 · 2026-09-08 · testflight


A redesigned Cedar Remote with larger controls, TV naming, a playback timeline, and reliable discovery.

#### What changed

- New artwork-led remote layout, circular playback controls, contextual actions, and TV room naming.
- Authenticated discovery filters dead entries and merges duplicate TV identities.
- Seekable timeline with compatible TVs; older TVs retain a read-only timeline.
- Hardware, installed-player, and touch-control preferences stay on each device. Languages and episode behavior remain shared.
- Clearer iCloud sync errors and progress, plus corrected household migration ordering.

#### Testing notes

- Check artwork loading and seeking during real playback; authenticated phone-to-TV connectivity was verified while idle.
- Some existing Mac household libraries with records split across private/shared CloudKit zones still cannot export. This build does not automatically repair those libraries.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 7 · 2026-09-08 · testflight


Build 7 · 2026-09-08

#### What changed

- Added direct artwork-gallery links that staged an avatar or badge pack in Cedar for explicit confirmation after startup or onboarding.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 5 · 2026-09-08 · release-candidate


Build 5 · 2026-09-08

#### What changed

- Blended hero backgrounds smoothly between titles and expanded Settings search with corrected destinations.
- Redesigned the Cedar Supporter page for iPhone and iPad.
- Added Save to Media Library for completed downloads, with organized names, available subtitle copies and protection for existing files. Export copied the original file without transcoding.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 4 · 2026-09-08 · testflight


Build 4 · 2026-09-08

#### What changed

- Fixed watched episodes in Search → Recently Viewed opening an invalid detail target. Episode cards opened their parent series while retaining history identity and episode progress.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 3 · 2026-09-08 · release-candidate


Build 3 · 2026-09-08

#### What changed

- Updated the interface and source terminology to Tobacco Ties while retaining compatible import formats.
- Detail trailers used recognized YouTube links; retired trailer-provider settings were removed.
- Updated detail, playback, guide, pairing and Home presentation.
- Some revised strings still fell back to English. Physical-device playback, pairing, sync and accessibility acceptance remained open.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 1 · 2026-09-07 · release-candidate


#### Highlights

- Browse authorized personal media in a spacious interface designed for iPad.
- Customize Home branches and shelves for favorites, recent titles, live channels, guide data, and provider collections.
- Add M3U, Xtream-compatible, and XMLTV sources with clear handling for unencrypted endpoints.
- Resume playback, choose audio and subtitle tracks, use Picture in Picture, and download supported media.

#### Private by design

- Keep credentials in Keychain and library data local by default.
- Optionally sync profiles through private iCloud data, Cedar Household, or end-to-end encrypted Cedar Link.
- Use Cedar without advertising, cross-app tracking, or a required Cedar account.

#### Release status

This is the version 1.0.0 build 1 release candidate. It is not yet an App Store release.

## Apple TV

### 1.0.0 · build 13 · 2026-09-09 · testflight


Build 13 · September 9, 2026 · Available to external testers in TestFlight.

#### Changes

NEW: Add a TV Guide Home branch with Recently Played, Favorites or a saved custom lineup. Choose its title, visible row count and time window; See All keeps the same channel source. Empty guides show setup guidance.

ARTWORK: Studio and streaming-service cards are bundled, with centered logos and brand-colored backgrounds. Compact and large-screen artwork are packaged separately.

LAYOUT: Branch Group poster spacing now matches Home. Live TV Continue Watching no longer casts dark shadows into the gaps between posters.

APPLE TV: A guide can be the first Home branch without waiting for poster artwork.

#### Testing

PLEASE TEST: Add/edit each guide source, change rows and hours, verify lineup order and empty states, open See All, select a current program and test reminders/catch-up where supported. Check bundled cards, poster spacing and navigation with the remote.

Known limitations: Prior CloudKit backlog recovery, translation gaps and broader hardware/accessibility qualification remain open. Provider playback and all-device visual checks are not comprehensively certified.


### 1.0.0 · build 12 · 2026-09-09 · testflight


Build 12 · September 9, 2026 · TestFlight beta

#### Changes since build 11

- Household & Sync brings Apple household sharing, invitations, status and device controls together. Household discovery refreshes as iCloud imports arrive and shows initial download progress.
- Replaying unchanged household profiles no longer creates new journal mutations. Copying a profile to Android is a one-time transfer and does not establish ongoing relay sync; existing links remain available under Advanced Transfers & Links.
- Connected libraries share in-flight refreshes, briefly reuse successful snapshots and refresh individual servers explicitly. Library badges and ordering reuse a prepared index.
- Home bounds concurrent discovery work and updates affected add-on shelves without restarting unrelated shelves.
- Metadata and service caches do less maintenance on each hit, have bounded disposable entries and coalesce purgeable writes.
- Network responses are assembled in chunks; oversized downloads stop during transfer. Immediate playlist import reuses its validated download and batches category registration.
- Catalog ordering and expired-guide cleanup use additional database indexes. Existing catalog contents and query behavior are retained.
- Bitmap subtitles reuse unchanged layers, and diagnostics reuse their redaction patterns. Original hero and clear-art quality is preserved.

#### Apple TV details

- Fullscreen hero artwork and existing native focus motion retain their original quality and presentation.
- Connected-library and Home refreshes avoid repeated work while retaining current shelves and titles.

#### What to test

Check Siri Remote sidebar, branch/episode/source selection, Menu return, cold household discovery, long playback, bitmap subtitles and iPhone remote seeking. Also test profile switching, offline/error recovery, media-server refreshes and one-time Android copies.

#### Known limitations

Existing CloudKit export backlogs/private-shared zone problems are not automatically repaired. Production-cloud convergence, sustained physical-device media/output compatibility and large-library performance still need validation. Some Apple translations and wider TV/iPad UI test coverage remain incomplete. The mobile hero follow-up fixes require fresh physical visual confirmation. No overall FPS, battery or startup percentage improvement is claimed.

Available to the existing Cedar External TestFlight group. This beta is not an App Store release.

### 1.0.0 · build 11 · 2026-09-09 · release-candidate


Fewer unnecessary iCloud writes, improved Next Up loading, and clearer sync diagnostics.

#### Improvements
- Organized media-library folders can be the sole download destination, with movie/season naming and subtitle sidecars. Existing downloads and exports are preserved.
- Reduced unnecessary iCloud writes and Home reloads when saved profile values have not changed.
- Released obsolete database read snapshots to reduce checkpoint contention.
- Overlapped Next Up metadata lookups and reduced unnecessary episode enrichment.
- Improved artwork network-failure handling and repair diagnostics.

#### Please test
- Select a profile, leave Home idle, then background and reopen Cedar. Check Home stability and sync status.
- Verify Next Up episode selection and artwork.
- Select an organized download destination, download a movie/episode with subtitles, relaunch, and reconnect an external folder. Confirm files are preserved and the chosen destination remains correct.
- Check playback, source selection and settings on iPhone/iPad, Apple TV and Mac.

#### Known issue

iCloud sync: iCloud exports can still be throttled and repeatedly retried by the system. These changes reduce new writes but do not claim to fix the existing CloudKit backlog or retry behavior. Please include device/OS and time of occurrence in feedback; do not send credentials or private media URLs.

### 1.0.0 · build 10 · 2026-09-08 · testflight


An organized changelog and improved guide identity for Home DVR scheduling.

#### Improvements

- Changelog highlights the installed build and collapses other versions. Apple TV retains QR links and remote-friendly expansion controls.
- Home DVR scheduling preserves explicit and XMLTV season/episode numbering. The recording Mac exports identified movies and episodes into media-server folders; unidentified broadcasts remain under Recordings.

#### Please test

- Verify source setup, playback, settings navigation and household remote control.
- Test library folders after relaunch and drive reconnection, export retries, and movie/episode matching in your media server. Refresh guide data to capture episode numbering formats. Existing exports are not renamed or overwritten.

#### Known limitations

- Commercial detection and watch-while-recording are not included.
- Signed folder-access and real-server scanning need device testing. Previously documented Mac household CloudKit-zone and legacy-Keychain migration limitations remain.

### 1.0.0 · build 9 · 2026-09-08 · testflight


A stationary, edge-to-edge onboarding poster wall with a stronger diagonal angle.

#### What changed

- Onboarding posters are stationary, fill the window edges, and use a 12-degree angle.

#### Testing notes

- Existing Mac household libraries with records split across private/shared CloudKit zones are not automatically repaired.
- Signed-app migration of restricted legacy Mac credentials still needs real-device validation.
- Phone-remote artwork and seeking still need verification during real TV playback.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 8 · 2026-09-08 · testflight


Full-screen heroes, cleaner TV settings, local playback preferences, and improved phone remote control.

#### What changed

- Heroes always render full-screen, even when another device selects Card.
- Removed touch-only settings and unavailable search results; external-player choices match installed TV apps.
- Improved remote transport with authenticated artwork/status and seek support.
- Hardware, installed-player, and touch-control preferences stay on each device. Languages and episode behavior remain shared.
- Clearer iCloud sync errors and progress, plus corrected household migration ordering.

#### Testing notes

- Check artwork loading and seeking during real playback; authenticated phone-to-TV connectivity was verified while idle.
- Some existing Mac household libraries with records split across private/shared CloudKit zones still cannot export. This build does not automatically repair those libraries.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 7 · 2026-09-08 · testflight


Build 7 · 2026-09-08

#### What changed

- Kept Apple TV artwork setup available through copied URLs and Cedar Link. Direct website-to-app artwork opening applied to iPhone, iPad and Mac.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 5 · 2026-09-08 · release-candidate


Build 5 · 2026-09-08

#### What changed

- Blended hero backgrounds smoothly between titles and expanded Settings search with corrected destinations.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 4 · 2026-09-08 · testflight


Build 4 · 2026-09-08

#### What changed

- Fixed watched episodes in Search → Recently Viewed opening an invalid detail target. Episode cards opened their parent series while retaining history identity and episode progress.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 3 · 2026-09-08 · release-candidate


Build 3 · 2026-09-08

#### What changed

- Updated the interface and source terminology to Tobacco Ties while retaining compatible import formats.
- Detail trailers used recognized YouTube links; retired trailer-provider settings were removed.
- Updated detail, playback, guide, pairing and Home presentation.
- Some revised strings still fell back to English. Physical-device playback, pairing, sync and accessibility acceptance remained open.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 2 · 2026-09-07 · release-candidate


Build 2 · 2026-09-07

#### What changed

- Repaired Apple TV Top Shelf device capabilities and added the required wide images with a Cedar wordmark fallback. This replaced the build 1 upload that Apple rejected during processing.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 1 · 2026-09-07 · rejected


#### Highlights

- Browse authorized personal media through a remote-first, ten-foot Home experience.
- Customize branches and shelves for favorites, next plays, live channels, guide data, and provider collections.
- Add M3U, Xtream-compatible, and XMLTV sources, then navigate a focused Live TV guide.
- Resume playback, choose audio and subtitle tracks, and use controls designed for television focus.

#### Pair and sync

- Pair Cedar devices over the local network.
- Optionally sync profiles through private iCloud data, Cedar Household, or end-to-end encrypted Cedar Link.
- Use Cedar without advertising, cross-app tracking, or a required Cedar account.

#### Release status

Apple rejected this build 1 upload during processing because required Top Shelf device capabilities and wide images were missing. It was not available to testers. Build 2 corrected these issues. The feature descriptions above record the intended initial baseline, not a successful release.

## Mac

### 1.0.0 · build 13 · 2026-09-09 · release-candidate


Build 13 · September 9, 2026 · Uploaded to TestFlight and awaiting Apple beta review; not yet available to external testers.

#### Changes

NEW: Add a TV Guide Home branch with Recently Played, Favorites or a saved custom lineup. Choose its title, visible row count and time window; See All keeps the same channel source. Empty guides show setup guidance.

ARTWORK: Studio and streaming-service cards are bundled, with centered logos and brand-colored backgrounds. Compact and large-screen artwork are packaged separately.

LAYOUT: Branch Group poster spacing now matches Home. Live TV Continue Watching no longer casts dark shadows into the gaps between posters.

#### Testing

PLEASE TEST: Add/edit each guide source, change rows and hours, verify lineup order and empty states, open See All, select a current program and test reminders/catch-up where supported. Check bundled cards, poster spacing and navigation.

Known limitations: Prior CloudKit backlog recovery, translation gaps and broader hardware/accessibility qualification remain open. Provider playback and all-device visual checks are not comprehensively certified.


### 1.0.0 · build 12 · 2026-09-09 · release-candidate


Build 12 · September 9, 2026 · Beta release candidate

#### Changes since build 11

- Household & Sync brings Apple household sharing, invitations, status and device controls together. Household discovery refreshes as iCloud imports arrive and shows initial download progress.
- Replaying unchanged household profiles no longer creates new journal mutations. Copying a profile to Android is a one-time transfer and does not establish ongoing relay sync; existing links remain available under Advanced Transfers & Links.
- Connected libraries share in-flight refreshes, briefly reuse successful snapshots and refresh individual servers explicitly. Library badges and ordering reuse a prepared index.
- Home bounds concurrent discovery work and updates affected add-on shelves without restarting unrelated shelves.
- Metadata and service caches do less maintenance on each hit, have bounded disposable entries and coalesce purgeable writes.
- Network responses are assembled in chunks; oversized downloads stop during transfer. Immediate playlist import reuses its validated download and batches category registration.
- Catalog ordering and expired-guide cleanup use additional database indexes. Existing catalog contents and query behavior are retained.
- Bitmap subtitles reuse unchanged layers, and diagnostics reuse their redaction patterns. Original hero and clear-art quality is preserved.

#### Mac details

- Download progress updates avoid repeated full-list reloads. Existing organized media-library destinations and native Mac controls remain.
- DVR scheduling reacts to deadlines and changes; export maintenance uses pending work and retry timing instead of repeatedly scanning idle history.
- System Now Playing artwork uses the shared image pipeline; bitmap subtitles retain their existing imagery and placement.

#### What to test

Check scheduled recording/edit/cancel, sleep/resume, disconnected export folders and retries, signed-app credential migration, native controls, long playback and subtitles. Also test profile switching, offline/error recovery, media-server refreshes and one-time Android copies.

#### Known limitations

Existing CloudKit export backlogs/private-shared zone problems are not automatically repaired. Production-cloud convergence, sustained physical-device media/output compatibility and large-library performance still need validation. Some Apple translations and wider TV/iPad UI test coverage remain incomplete. The mobile hero follow-up fixes require fresh physical visual confirmation. No overall FPS, battery or startup percentage improvement is claimed.

Apple controls beta processing and external review. This candidate is not an App Store release; availability is recorded separately from upload completion.

### 1.0.0 · build 11 · 2026-09-09 · release-candidate


Fewer unnecessary iCloud writes, improved Next Up loading, and clearer sync diagnostics. Organized download destinations preserve existing files.

#### Improvements
- Organized media-library folders can be the sole download destination, with movie/season naming and subtitle sidecars. Existing downloads and exports are preserved.
- Reduced unnecessary iCloud writes and Home reloads when saved profile values have not changed.
- Released obsolete database read snapshots to reduce checkpoint contention.
- Overlapped Next Up metadata lookups and reduced unnecessary episode enrichment.
- Improved artwork network-failure handling and repair diagnostics.

#### Please test
- Select a profile, leave Home idle, then background and reopen Cedar. Check Home stability and sync status.
- Verify Next Up episode selection and artwork.
- Select an organized download destination, download a movie/episode with subtitles, relaunch, and reconnect an external folder. Confirm files are preserved and the chosen destination remains correct.
- Check playback, source selection and settings on iPhone/iPad, Apple TV and Mac.

#### Known issue

iCloud sync: iCloud exports can still be throttled and repeatedly retried by the system. These changes reduce new writes but do not claim to fix the existing CloudKit backlog or retry behavior. Please include device/OS and time of occurrence in feedback; do not send credentials or private media URLs.

### 1.0.0 · build 10 · 2026-09-08 · testflight


Editable native connection forms, automatic media-library copies, improved DVR organization, and a cleaner changelog.

#### Improvements

- Native source-picker and Downloads panels. Connection editors now have editable fields, wider sheets, and visible Save/Cancel.
- Optional automatic copies of completed downloads into movie and season folders, with available metadata IDs and subtitles. Pending copies survive drive disconnection and are protected from cleanup.
- Rate Cedar opens the App Store review page directly.
- Changelog highlights the installed build and collapses other versions. Apple TV retains QR links and remote-friendly expansion controls.
- Home DVR scheduling preserves explicit and XMLTV season/episode numbering. The recording Mac exports identified movies and episodes into media-server folders; unidentified broadcasts remain under Recordings.

#### Please test

- Verify source setup, playback, settings navigation and household remote control.
- Test library folders after relaunch and drive reconnection, export retries, and movie/episode matching in your media server. Refresh guide data to capture episode numbering formats. Existing exports are not renamed or overwritten.

#### Known limitations

- Commercial detection and watch-while-recording are not included.
- Signed folder-access and real-server scanning need device testing. Previously documented Mac household CloudKit-zone and legacy-Keychain migration limitations remain.

### 1.0.0 · build 9 · 2026-09-08 · testflight


Native Mac settings and playback menus, fewer Keychain prompts, and cleaner connection sheets.

#### What changed

- Onboarding posters are stationary, fill the window edges, and use a 12-degree angle.
- Settings now use native grouped forms, switches, pop-up menus, and value rows while retaining custom previews and editors.
- Playback options, audio, and subtitles use native menus. Controls stay visible while a menu is open.
- Media-server connection rows no longer have an extra blue button background.
- Source selection and download-location sheets have usable minimum dimensions.
- New credentials use the data-protection Keychain. Accessible older credentials migrate without password dialogs; restricted older credentials may need reconnection.
- Cleaned up add-on refresh and credential-sync compiler warnings while preserving legacy Keychain prompt suppression.

#### Testing notes

- Existing Mac household libraries with records split across private/shared CloudKit zones are not automatically repaired.
- Signed-app migration of restricted legacy Mac credentials still needs real-device validation.
- Phone-remote artwork and seeking still need verification during real TV playback.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 8 · 2026-09-08 · testflight


Local playback preferences, clearer iCloud status, and household migration ordering improvements.

#### What changed

- Removed touch-only player guidance and unavailable settings search entries.
- Hardware, installed-player, and touch-control preferences stay on each device. Languages and episode behavior remain shared.
- Clearer iCloud sync errors and progress, plus corrected household migration ordering.

#### Testing notes

- Check artwork loading and seeking during real playback; authenticated phone-to-TV connectivity was verified while idle.
- Some existing Mac household libraries with records split across private/shared CloudKit zones still cannot export. This build does not automatically repair those libraries.

This is a TestFlight build, not an App Store release.

### 1.0.0 · build 7 · 2026-09-08 · testflight


Build 7 · 2026-09-08

#### What changed

- Added direct artwork-gallery links that staged an avatar or badge pack in Cedar for explicit confirmation after startup or onboarding.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 6 · 2026-09-08 · testflight


Build 6 · 2026-09-08

#### What changed

- Corrected the installed Mac application name to Cedar, including the app bundle and executable. This addressed the TestFlight review rejection of Mac build 4; build 5 had retained the old name.

#### Release status

Available through TestFlight for eligible testers; this is not an App Store release. Status checked September 9, 2026.

### 1.0.0 · build 5 · 2026-09-08 · release-candidate


Build 5 · 2026-09-08

#### What changed

- Blended hero backgrounds smoothly between titles and expanded Settings search with corrected destinations.
- Added Mac Picture in Picture and downloads. Cedar must remain running during Mac downloads.
- Added Save to Media Library for completed downloads, with organized names, available subtitle copies and protection for existing files. Export copied the original file without transcoding.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 4 · 2026-09-08 · expired


Build 4 · 2026-09-08

#### What changed

- Fixed watched episodes in Search → Recently Viewed opening an invalid detail target. Episode cards opened their parent series while retaining history identity and episode progress.

#### Release status

Expired. Mac build 4 was rejected in beta review for its installed application name; the correction shipped in Mac build 6. Status checked September 9, 2026.

### 1.0.0 · build 3 · 2026-09-08 · release-candidate


Build 3 · 2026-09-08

#### What changed

- Updated the interface and source terminology to Tobacco Ties while retaining compatible import formats.
- Detail trailers used recognized YouTube links; retired trailer-provider settings were removed.
- Updated detail, playback, guide, pairing and Home presentation.
- Some revised strings still fell back to English. Physical-device playback, pairing, sync and accessibility acceptance remained open.

#### Release status

Processed successfully. External TestFlight availability is not confirmed for this build; it is retained as a historical release candidate. Status checked September 9, 2026.

### 1.0.0 · build 1 · 2026-09-07 · release-candidate


#### Highlights

- Organize and play authorized personal media in a native Mac app.
- Import supported playlist and guide files through Finder, drag and drop, and sandboxed file access.
- Customize Home branches and shelves for favorites, recent titles, live channels, guide data, and provider collections.
- Resume playback, choose audio and subtitle tracks, use system media controls, and hand off to an external player where offered.

#### Private by design

- Keep credentials in Keychain and library data local by default.
- Optionally sync profiles through private iCloud data, Cedar Household, or end-to-end encrypted Cedar Link.
- Use Cedar without advertising, cross-app tracking, or a required Cedar account.

#### Release status

This is the version 1.0.0 build 1 release candidate. It is not yet an App Store release.

## Android TV / Google TV / Fire TV

### 1.2.85 · build 88 · 2026-09-09 · released


Custom Home TV guides, bundled studio and streaming-service artwork, and refined poster corners across Android TV, Google TV and Android-based Fire TV.

Build 88 · September 9, 2026

#### TV Guide branches

- Add a TV Guide from Manage Branches → Add Branch → Quick Add. Choose Recently Played, Favorites or a saved Custom Lineup, then set a title, 1–12 visible rows and a 1, 2, 3, 6 or 12-hour window.
- See All opens the larger guide with the same channel source. Recently Played follows viewing history, Favorites sorts by name and lineups preserve saved order while resolving available channel variants.
- Home resolves only its configured rows; the full guide loads up to 500 channels. Hidden channels and disabled sources are excluded. The timeline refreshes while Home is open.
- Current channels open fullscreen playback. Programs reuse catch-up, reminders and DVR actions where supported.
- Empty guides stay visible and focus returns correctly after See All. Apple-imported guide settings are supported, including matching saved lineup IDs.

#### Artwork and layout

- Bundled cards for 32 studios/organizations and 12 streaming services use the approved Apple artwork. Standard cards no longer fetch cover artwork from an API.
- Streaming-service cards feature centered logos and smooth brand-colored backgrounds. Android TV packages only the large-screen assets.
- Poster artwork and focus borders use consistent continuous corners inspired by the Apple presentation, including rating-strip edges.

#### Testing notes

38 Home unit tests and two focused emulator UI tests passed during feature verification. The ordinary app creation flow saved guide source, rows and hours. Populated UI action tests used deterministic fixtures; real provider playback and broad hardware qualification are not certified. Previously documented limitations remain.


### 1.2.84 · build 87 · 2026-09-09 · released


Build 87 · September 9, 2026

#### Profiles and Apple compatibility

- Profile copies stay independent. Receive a fresh transfer to update the current profile or create a new copy. Older linked profiles apply Apple configuration changes only when you choose Update Legacy Linked Profile Now.
- Background remote/device communication and tracking-account sync remain separate from manual profile updates.
- Imported profiles preserve this TV's player, quality limit, HDR, display matching, Dolby Vision handling, preview decoding and seek interval. Shared language and episode preferences still import.
- New copies retain normal profile selection and parental checks. Failed imports clean up the new copy, and Cedar enforces its eight-profile limit.
- Apple remotes can read playback artwork and seek supported on-demand Android playback. Legacy browser command names remain supported.

#### Artwork and navigation

- Clear-art begins loading sooner: Cedar publishes primary artwork before optional metadata finishes and removes a second settle delay.
- Visible hero/clear-art requests take priority over queued posters. Replacing an image at the same size reliably starts the new request.
- Scrolling between Home branches now animates. Hero backgrounds and titles dissolve over 240 ms, retaining the outgoing background while new artwork loads.
- Background refreshes retain the title being browsed. Imported collections retain their chosen covers.
- Removed the retired Ratings Panel poster style while preserving ordinary scores and detail ratings.
- Onboarding uses a stationary, edge-to-edge poster background tilted 12 degrees.
- Original hero and clear-art quality, rendition and decode policies are preserved.

#### Performance and reliability

- Source and guide refreshes update their affected data without unnecessarily restarting unrelated Home providers.
- Search groups and Home feeds appear as results arrive. Home requests only the feeds required by enabled content.
- Catalog identity work runs off the UI thread with stale-result protection. Disposable metadata caches and keyed work have bounded lifetimes.
- Cancelled TMDb requests close their connections. Artwork writes avoid repeated full-directory scans.

#### Testing and known limitations

The application passed 577 unit tests and 19 selected emulator regressions before packaging. Release packaging verifies the permanent signer, non-debuggable configuration, package/version, native ABI coverage and 16 KiB alignment. These checks do not certify every physical TV, codec or provider.

Profile updates merge imported data; they are not exact deletion mirrors. Android subtitle startup/delivery and permanent changelog history still differ from Apple. Physical transfer/remote, sustained playback, accessibility and hardware performance checks remain. No overall FPS, battery or startup percentage gain is claimed.

### 1.2.83 · build 86 · 2026-09-07 · released


Cedar 1.2.83 makes device transfers and ongoing profile sync easier to follow.

#### What changed

- Pair from Mac, iPhone, iPad, or Apple TV with updated nearby-device instructions.
- Profile import shows its current stage and elapsed time, including when the profile is saved and ongoing sync is being linked.
- Manual Cedar Link sync reports fetching, saving, and confirming stages, with elapsed time and a timeout/retry result.
- Completion confirms when changes are saved on this television. A duplicate manual request cannot start another simultaneous sync.
- Encrypted pairing receipts now separately report ongoing sync enrollment, so compatible Apple senders can distinguish a copied profile from a working link.

#### Qualification

- 541 unit tests and Android lint passed.
- A current tvOS simulator sent a real profile to the physical Android TV: 83 items acknowledged in about 15 seconds.
- Two subsequent production-relay updates changed and restored a detail-display preference on the Android TV. Each receiver import completed in under four seconds.
- Full cross-platform certification remains open: physical macOS-to-Apple-TV iCloud propagation, deletion reconciliation, and broader data-domain coverage still require verification. Nearby transfer completion does not certify iCloud or catalogue/EPG refresh completion.

### 1.2.82 · build 85 · 2026-09-07 · released


Cedar 1.2.82 brings current tvOS channel-name cleanup and automatic focused-channel previews to the Android live guide.

#### What changed

- Clean Up Names removes provider prefixes and technical clutter, preserves meaningful names, and displays the strongest resolution as a separate quality badge.
- Category labels show country flags while preserving broad regions. Provider IDs and EPG matching remain intact.
- Focus a channel for 450 ms to start a muted preview. Moving focus cancels stale requests; browsing does not add recent channels.
- Selecting the preview restores audio and opens fullscreen using the same player and media item.
- Live TV & DVR settings include controls for name cleanup and focused previews. Cleaned names also appear in search and the live player.
- Existing category refresh controls, hero image quality, branding, and the Android sidebar are preserved.

#### Qualification

- 541 unit tests and Android lint passed.
- Eight targeted tests passed on the physical Android TV, covering cleanup settings, focus cancellation, no browsing recents, quality badges, player reuse, muted-to-fullscreen playback, and guide time alignment.
- Full bilateral parity certification remains open; this release qualifies the listed live-guide behavior.

### 1.2.81 · build 84 · 2026-09-07 · released


Cedar 1.2.81 adds Live TV category refresh controls and bulk actions from current tvOS, preserving imported category preferences and making excluded playlists easy to restore.

#### What changed

- Stop Fetching Category independently controls future ingestion. Existing channels remain cached until a successful playlist refresh.
- Show All Categories, Hide All Categories, and Hide All and Stop Fetching match the current tvOS bulk actions. Renaming and ordering are retained.
- Xtream refreshes skip excluded category stream requests. M3U and Stalker imports exclude matching live channels while retaining category definitions for editing.
- Playlists stay selectable when every category is excluded. Re-enable fetching and refresh to restore their channels.
- Apple-profile transfer and local profile copies preserve category refresh exclusions. Category saves capture the owning profile and handle storage failures.
- Explicit MDBList API-key transport supports private account qualification; the normal viewer connection remains OAuth. Personal credentials and manifest links are not bundled.

#### Qualification

- 538 unit tests passed; Android lint passed.
- Four targeted physical-TV tests passed: category controls, M3U cache/exclusion recovery, Xtream request exclusion, and manifest playback with a verified MDBList watched-state write and restoration.
- Full live-guide parity remains open for name cleanup, automatic focused-channel previews, and bilateral guide behavior qualification. This release does not claim full parity certification.

### 1.2.80 · build 83 · 2026-09-07 · released


Cedar 1.2.80 matches the current Apple MDBList settings branding and advances live-account parity qualification while retaining full-screen Settings and display-resolution hero artwork.

#### What changed

- MDBList connection, status, and independent-watchlist rows now use the same compact brand mark and colors as current Cedar on Apple platforms.
- Android continues to use Cedar’s tvOS MDBList application client ID. Personal test credentials are kept out of source, APKs, and published updates.
- Hero backdrops retain original TMDb requests, up to 4K decoding for full-screen surfaces, and fitted transparent title artwork. No artwork-resolution policy was reduced.

#### Qualification

- 535 unit tests passed and Android lint passed, including artwork-resolution and title-artwork regression coverage.
- Eight authenticated MDBList read endpoints passed a read-only account smoke test. This does not certify OAuth approval, refresh, or account mutation round trips.
- Full parity remains in progress, including durable offline tracking updates, manual watched-state controls, and cross-platform reconciliation.
- Six targeted physical-TV tests passed, including live account reads, device-code registration, Settings flows, and a full 3840 × 2160 image decode.

### 1.2.79 · build 82 · 2026-09-07 · released


Cedar 1.2.79 adds MDBList account tracking with device authorization, profile-owned sessions, library synchronization, and optional scrobbling.

#### What changed

- Connect MDBList through a short-lived device code in Accounts & Sync. Connecting an account stays separate from choosing its Tracking Authority; select the connected service explicitly to enable activity synchronization.
- Read MDBList watched history, playback progress, Next Up, watchlist, ratings, collection, statistics, and available calendar events.
- Send watchlist and rating changes through the selected tracking authority. Completed playback can forward watched state when MDBList is active; optional scrobbling uses MDBList's episode payload format.
- Refresh MDBList OAuth sessions with profile-scoped encrypted storage. Profile switches cancel pending authorization, and disconnect serializes with token refresh.
- Detect rejected updates, repeated pagination cursors, and oversized snapshots; retain the previous cached library when a full refresh fails.
- Preserve independent MDBList API-key ratings/watchlists, full-screen Settings, display-resolution hero artwork, and signed OTA updates.

#### Qualification

- 535 unit tests passed, including 15 new MDBList transport/decoding tests. Android lint passed.
- Personal-account approval and live account read/write round trips remain part of the parity certification work; requesting a device code alone does not certify those flows.
- Twelve physical-TV tests passed, including native MDBList account controls and a live device-code request using Cedar’s configured client ID.

### 1.2.78 · build 81 · 2026-09-07 · released


Cedar 1.2.78 adopts the latest full-screen television Settings layout and preserves hero artwork detail at the app's display resolution.

#### What changed

- Settings now fills the screen, with controls on the left and contextual help on the right. The sidebar remains on the main destinations; Back from Settings returns Home.
- Removed the automatic 720p hero limit on televisions with less physical memory.
- Full-screen artwork uses the measured app surface up to 4K, while retaining bounded downloads, concurrent loads, and bitmap memory safety limits.
- TMDb backdrop metadata retains original image URLs. Older cached smaller URLs upgrade when necessary to cover the displayed surface.
- Synchronized the parity contract's tracking-authority title with the current Apple catalog. Full product parity certification remains pending complete behavioral evidence on both platforms.

#### Validation

- 520 unit tests passed; Android lint reported zero errors.
- Parity contract validation passes on both repositories at revision 3; all 42 validator regression tests pass.
- The connected TV exposes a 1920 × 1080 app surface. Full-screen image targets now preserve that resolution; a separate hardware decode test verifies 3840 × 2160 pixels.
- All ten TV instrumented tests passed, including Settings geometry and focus, 4K decoding, all Settings destinations, post-play, playback controls, and sidebar behavior.

### 1.2.77 · build 80 · 2026-09-07 · released


Cedar 1.2.77 extends television parity with local-history Next Up branches, bounded episode discovery, and steadier focus during post-play recommendations.

#### What changed

- Next Up combines local completed-episode history with the selected tracking account, preferring local candidates and keeping active series in Continue Watching.
- Episode discovery uses exact IMDb/TMDb series identities, reuses cached metadata, limits lookups to four at a time, and discards results after profile changes.
- The furthest completed regular episode establishes progression. Unknown or future immediate successors do not cause a jump to a later episode, and stale partial progress before that point does not block local progression.
- New Next Up branches are series-only. Keep Separate from Continue Watching is available in the native branch editor and survives profile transfer and branch editing.
- Editing a branch preserves its portable query parameters.
- Post-play recommendations use parent-series metadata for episodes and remain independent of whether the Related detail-page section is visible.
- Player auto-hide no longer takes focus away from Next Episode or post-play recommendations. Back dismisses those overlays before leaving playback.
- Retained the Settings, transport, audio-information, and signed OTA improvements from 1.2.76.

#### Validation

- 519 unit tests passed.
- Eight instrumented tests passed on the connected Android TV, covering Settings, sidebar focus, playback controls, post-play focus, and metadata identity lookup.
- Release signing, non-debuggable configuration, ZIP alignment, and native-library page alignment checks passed.
- Dolby Digital Plus over HDMI ARC was verified during the 1.2.76 hardware session. Physical speaker mapping and acoustic sync still require listening confirmation.

### 1.2.76 · build 79 · 2026-09-07 · released


Cedar 1.2.76 brings the current Apple TV Settings organization and post-play discovery to Android TV, while improving remote playback controls and preserving the compact sidebar.

#### What changed

- Organized Settings into Personal, Sources, Services, Watching, and App, with General first and the current television destination names.
- Separated add-on, Live TV, media-server, and WebDAV management and expanded the Settings control column.
- Added post-play recommendations from available title metadata, with paged cards, Return to Player, a configurable movie trigger, and Next Episode priority.
- Added transfer of post-play preferences from Apple Cedar profiles.
- Fixed Back being consumed by hidden player controls instead of closing playback.
- Paused the Next Episode countdown while playback is paused, a player menu is open, or Cedar is in the background.
- Added source audio codec, channel count, and sample-rate information to Stream Information.
- Preserved Cedar's existing app signer, signed update verification, profile storage, and Android navigation sidebar.

#### Television validation

- All 513 Android unit tests passed.
- The connected Smart TV Pro passed tests covering the 18 Settings destinations, post-play paging/return focus, repeated stop/replay, and controls reappearing after auto-hide.
- A six-channel Dolby Digital Plus fixture produced active E-AC-3 output over HDMI ARC to the connected sound system. This confirms the digital output path; it does not independently verify the soundbar's physical speaker mapping or acoustic synchronization.


### 1.2.75 · build 78 · 2026-08-31 · released


Cedar 1.2.75 safely migrates the Android TV update channel to Cedar's new `CedarTV` GitHub namespace.

#### What changed

- Cedar now prefers the branded `cedartv.github.io` update and Cedar Link host.
- The previous Pages address remains a temporary, exact-host fallback during the account cutover.
- Manifest failover is limited to endpoint availability failures such as DNS, connection, timeout, or HTTP errors.
- Signed-manifest, schema, package, URL-policy, and cryptographic verification failures still fail closed and never fall back.
- Both transition hosts remain restricted to HTTPS on the existing bounded OTA allowlist.

#### Migration validation

- The OTA unit suite covers fallback URL parsing, deduplication, and strict failure classification.
- Cedar's permanent release signer and signed-manifest public key remain unchanged.
- This bridge build was prepared before the GitHub username changed from `24gx4xx5jv-cloud` to `CedarTV`.

### 1.2.74 · build 77 · 2026-08-31 · released


Cedar 1.2.74 completes the cache-only TorBox Instant path and hardens private credential provisioning on physical Fire TV devices.

#### What changed

- TorBox API keys can be imported by themselves through Cedar's bounded private-setup bundle, without replacing or refreshing existing IPTV sources.
- Imported TorBox keys use the same encrypted, active-profile credential scope as Quick Setup and normal playback resolution.
- TorBox Instant checks unknown hashes before preparation and always uses TorBox's cache-only create option, so Cedar never starts an uncached download.
- Signed playback links are accepted only over HTTPS on TorBox's documented API/CDN domains. Wrong, duplicated, disguised, or off-domain credential parameters are rejected.
- Signed TorBox links stay transient and are never written to Cedar settings, reports, or source-selection memory; URL query values remain redacted from diagnostics.
- The private provisioning workflow now supports Fire OS versions that require matching app/test signatures, while the normal GitHub release pipeline refuses every debuggable APK.

#### Fire TV validation

- Imported a TorBox-only setup bundle into Cedar's Android Keystore-backed vault on the connected AFTKM Fire TV Stick without clearing app data.
- Resolved a confirmed cached torrent through Cedar's device-side TorBox API flow, including file selection and signed URL generation, in 1.9 seconds.
- After explicit authorization, Cedar opened the TorBox CDN stream, rendered its first video frame, and sustained Media3 playback beyond five seconds; the bounded device test completed in 14.1 seconds.
- The disposable test package, plaintext setup/response files, temporary debuggable APKs, and temporary unsigned release output were removed before restoring the signed non-debuggable 1.2.74 build.
- The complete Android unit suite and the 1.2.74 release lint gate pass.

### 1.2.73 · build 76 · 2026-08-31 · released


Cedar 1.2.73 hardens Live TV refreshes and cross-platform Cedar Link synchronization while reducing unnecessary video work in the embedded guide preview.

#### What changed

- The current guide remains visible while the same profile refreshes its IPTV playlist and XMLTV data, instead of replacing usable content with a loading state.
- Large IPTV and guide rebuilds are serialized to reduce peak memory and CPU contention on memory-constrained televisions.
- Cedar Link coalesces a relay backlog to the newest complete Apple profile snapshot, imports it once, and advances the relay cursor only after a successful transaction.
- Foreground and background Cedar Link syncs now share one process-wide coordinator, preventing duplicate concurrent profile imports.
- Importing an Apple profile no longer republishes the same profile back to Apple, removing the observed Apple-to-Android feedback loop while preserving heartbeat and remote-device messages.
- The embedded Live guide preview now requests an adaptive rendition no higher than 540p. Entering fullscreen immediately restores the viewer's configured quality ceiling on the same tuned player.
- Fixed-resolution IPTV streams remain at their supplied resolution; Cedar does not silently transcode or reduce their playback quality.

#### Fire TV validation

- Installed and exercised on an AFTKM Fire TV Stick running Android 11 with approximately 1.7 GB RAM.
- Verified playlist and XMLTV retention, 4K HEVC live preview, fullscreen player reuse, playback source controls, and remote focus traversal.
- A fixed 3840 × 2160 HEVC test feed continued to play at its native resolution, as expected. Warm guide-navigation passes measured 49.2% and 54.3% janky frames versus the earlier 55–66% range, while guide-only warmed passes remained 11.7–12.5%.
- A staged Apple profile backlog produced one authenticated Android import with no echo publication or Cedar Link error.

### 1.2.72 · build 75 · 2026-08-31 · released


Cedar 1.2.72 reduces expensive fullscreen hero work while rapidly traversing Home and Branch Group rows on memory-constrained televisions.

#### What changed

- A deliberate single focus move keeps Cedar's existing hero response time.
- Repeated D-pad moves within a navigation burst receive an adaptive settle window, allowing superseded hero jobs to cancel before their fullscreen backdrop commits.
- The final focused item still receives the same full-screen backdrop without a fade or quality reduction.
- Detail metadata, availability, and trailer prefetch remain staged after the visible hero settles.
- No bitmap decoder or cache-size experiment that regressed physical Fire TV performance is included.

#### Fire TV validation

Two ordered A/B comparisons improved three-run median jank by 5.6% and 4.9%. A matched Perfetto pass improved jank from 22.81% to 18.41%, reduced app GC time by 9.0%, reduced texture-upload time by 15.5%, and lowered the worst measured UI frame from 39.54 ms to 29.00 ms. Late-session settled Graphics PSS fell 2.5%.

Performance remained variable: the pooled six-run median did not improve because of one candidate outlier, and total bitmap decode time rose in the matched trace. Cedar therefore keeps the change narrowly scoped to rapid focus bursts and does not alter single-step navigation, artwork quality, or cache capacity.

### 1.2.71 · build 74 · 2026-08-31 · released


Cedar 1.2.71 brings Android TV branch navigation in line with tvOS and reduces artwork work during aggressive remote navigation.

#### What changed

- Branch Groups now open as independent horizontal content rows, matching Cedar on tvOS.
- Removed the conflicting **Browse All** branch action and tab-style branch switching on television layouts.
- Added stable focus restoration and progressive skeleton loading while branch rows populate.
- Backdrops remain full-screen and cinematic without a fade overlay.
- Right-sized TMDB backdrops are requested and decoded for the surface that displays them.
- Memory-constrained TVs retain full-screen backdrops at up to 1280 x 720; capable devices retain the existing 1920 x 1080 ceiling.
- Artwork loading is limited to two concurrent jobs, uses a bounded decoded-bitmap cache, and avoids duplicate work for the same URL.
- Detail, availability, and trailer prefetch now waits for focus to settle instead of competing with rapid navigation.
- Explicit HTTP IPTV artwork and stream destinations remain supported, while HTTPS-to-HTTP redirects continue to be rejected.

#### Fire TV validation

On the connected Fire TV Stick, a three-run aggressive navigation pass on the final installed APK improved median janky frames from 18.02% to 16.14% (10.4% relative). Trace evidence showed 23% fewer bitmap decodes, 61% less total decode time, and an 85% reduction in the slowest bitmap decode. Results vary on cold installs while Android rebuilds runtime profiles and the device is under system memory pressure.

Linked profiles continue to treat Apple/iCloud as the authority for portable Cedar settings. Android-only preferences such as TorBox Instant and device playback tuning remain local to the Android TV.

### 1.2.60 · build 63 · 2026-08-31 · released


Cedar Android TV 1.2.60 completes Cedar's latest hardware-focused playback, performance, and television-parity pass.

- Adds reliable playback for supported Dolby Vision Profile 7 Matroska titles on compatible Fire TV hardware by converting video to Profile 8.1 while preserving direct TrueHD Atmos 7.1 output when the device and HDMI path support it.
- Reduces hidden-player polling and tightens player, artwork, and memory lifecycles for smoother operation on constrained televisions.
- Adds device-memory-aware focus motion, keeps Home artwork as a clean full-screen backdrop, and removes the redundant Browse All action from Home branch headers.
- Expands native television controls for Home branches, manifest add-ons, source ranking, EPG source binding, person pages, Live search and numeric tuning, subtitle timing, content advisories, and Cedar Link import and sync.
- Adds optional TorBox Instant source preparation with cached-only, bounded behavior that never starts an uncached torrent download.
- Preserves Cedar's permanent Android signing identity and 16 KiB native-library compatibility across all four packaged ABIs.

The Dolby Vision and TrueHD path was verified on physical Fire TV hardware with high-bitrate test titles. Availability still depends on the television, streaming device, receiver, source format, and licensed platform decoders.

### 1.2.44 · build 47 · 2026-08-29 · released


Cedar Android TV 1.2.44 brings Cedar's newest browsing, source, playback, profile, and appearance improvements to Android TV.

- Adds Browse All to eligible Home rails, with sorting and paged results.
- Adds automatic source and guide refresh schedules, source health and last-updated details, and adjustable Xtream catch-up timing.
- Adds safe, selective local-profile configuration copying for sources, add-ons, API keys, Home branches, and preferences without copying personal activity or account sessions.
- Adds Dark, System, and Light appearances, optional HTTPS source badge packs, and focused-title detail prefetch controls.
- Improves cross-provider matching and playback fallback while preserving provider-specific authorization.
- Adds optional Anime Skip intro, recap, and outro segments.
- Hardens Cedar Link sync compatibility and adds privacy-preserving companion status plus short-lived remote controls for linked Android TVs.
- Improves initial D-pad focus handoff between the navigation rail and screen content.
- Preserves RTMP playback with an official-source rebuild that supports Android's 16 KB page-size requirement across all four packaged ABIs.

The matching RTMP source and relinking kit, including provenance, checksums, build instructions, and license texts, is attached to this release.

### 1.2.43 · build 46 · 2026-08-27 · released


Cedar Link is now available for production Android TV profile transfers and encrypted Apple-to-Android profile sync.

- Adds **Profiles & Sharing → Link or Transfer Profile** and the matching Cedar device-pairing flow.
- Imports Cedar profiles from iPhone or iPad as one authenticated, transactional transfer, including compatible sources, settings, connected services, and protected credentials.
- Receives end-to-end encrypted profile updates through Cedar's ciphertext-only relay while keeping the television's last working local profile available during network failures.
- Supports bounded cross-platform compression for mature Apple profiles that exceed the original sync-document size, without increasing the relay's public request limits.
- Keeps small profile documents backward compatible and rejects oversized or malformed compressed payloads before import.
- Improves pairing, linked-profile status, manual resync, and failure messaging throughout Android TV settings.

Existing installations signed with Cedar's permanent Android release key can update normally from inside Cedar. Development-signed installations still require one manual replacement before joining the production update channel.

### 1.2.41 · build 44 · 2026-08-26 · released


Initial GitHub update-channel bridge for Cedar Android TV.

- Adds signed update manifests served by GitHub Pages.
- Adds versioned APK delivery through GitHub Releases.
- Allows only bounded HTTPS release redirects to Cedar's exact host allowlist.
- Keeps full manifest, APK hash, package, version, and Android signer verification before installation.

This build uses Cedar's permanent Android release signer. Existing development-signed installations require one manual replacement; subsequent versions can update from inside Cedar.
