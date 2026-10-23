# Cedar feedback inbox

A small Cloudflare Worker/D1 service that receives bug reports and feature requests from the
`/feedback/` page and the Cedar apps' **Send Feedback** screen. It is separate from the encrypted
sync relay in `worker/` on purpose: the relay only ever stores ciphertext, and feedback is plain
text.

It also holds the staff tickets and the roadmap, and serves **Cedar Tracker** at `/tracker/`.

## How a report moves

1. **Report.** A report arrives from the website, the apps, a public Discord forum post or
   **Track as bug/feature**, and is posted to the private `#tracker-triage` channel.
2. **Ticket.** Staff open it as a bug (`BUG-n`) or feature request (`FR-n`) ticket (whatever kind
   it was sent as), attach it to a ticket that already covers it, ask the reporter for more
   (**Needs info**), or discard it. Tickets are private. Each has its own fields (what happens,
   steps, expected vs actual, notes, decision, broke in, fixed in build, commit, released in), the
   reports behind it, and an append-only timeline of status changes, edits, notes, attached
   reports and the reporters' later replies.
3. **Roadmap.** A ticket reaches the public roadmap only when staff add it to a roadmap entry
   (`CDR-n`) and write public wording for it. One entry can stand for several tickets. An entry
   either follows its tickets (in progress while any is being worked on, shipped or fixed once
   all are released) or has its status set by hand. Its request count is the number of reports
   behind its tickets.

## Endpoints

- `POST /v1/feedback`: public. The website sends its `Origin` (must equal `CEDAR_WEB_ORIGIN`);
  the apps send `X-Cedar-Client: app` and no `Origin`. Fields: `schemaVersion` (1), `kind`
  (`bug`/`feature`), `title` (3–120), `details` (10–4,000), `platform`, and optional `appVersion`,
  `osVersion`, `deviceModel`, `contact` (email). Answers `201 { reference }`.
- `GET /v1/roadmap`: public, any origin, cached for 10 seconds. Only entries marked public with a
  public status, and only public fields (see `scripts/tracker_feed.mjs` in the site).
- Staff routes take either the admin bearer token (`ADMIN_TOKEN`, no browser origin) or the
  Tracker's session cookie with `X-Cedar-Tracker: 1` from the Worker's own origin:
  - Inbox: `GET /v1/inbox?state=…`, `POST /v1/inbox/:id/ticket|attach|ask|discard`.
  - Tickets: `GET|POST /v1/tickets`, `GET|PUT|DELETE /v1/tickets/:id` (the `GET` adds reports,
    timeline, roadmap entry and the Discord thread's discussion), `POST /v1/tickets/:id/notes`,
    `POST /v1/tickets/:id/merge` (`{ into }`), `POST|DELETE /v1/tickets/:id/roadmap`
    (`{ entryID }` or `{ create: { title, summary, description } }`).
  - Releases: `POST /v1/releases` (`{ build, version, releaseURL }`) moves every ticket whose
    Fixed in build is `build` and that's Fixed in code, In a build or Verified to Released;
    `GET /v1/releases` lists the site's published releases.
  - Roadmap: `GET|POST /v1/items`, `PUT|DELETE /v1/items/:id`, `GET /v1/items/:id/reports`.
  - `GET /v1/export` (everything except emails), `POST /v1/discord/refresh` (re-renders every
    Discord panel after a layout change).
  Triage clears the reporter's `contact`.
- `GET /tracker/login?code=…`: spends a one-time sign-in code (see below).
- `POST /v1/discord/interactions`: Discord's signed interactions (Ed25519, `DISCORD_PUBLIC_KEY`).
  Only `DISCORD_OWNER_ID` can act.

## Cedar Tracker

The Worker serves the Tracker from `assets/tracker/` at
`https://cedar-feedback.cedar-feedback.workers.dev/tracker/`: Inbox, Bugs, Features, Roadmap and
Settings (backup download, Discord panel refresh). There is no password. `/tracker` in Discord
(owner only) answers privately with a sign-in link that works once, for ten minutes; it sets an
HttpOnly, SameSite=Strict cookie, signed with `TRACKER_SESSION_SECRET` (or a key derived from
`ADMIN_TOKEN`), that lasts 30 days and is renewed while it's used. A ticket panel's
**Open in Tracker** button signs in straight to that ticket. `assets/_headers` sets the page's CSP.

## Discord

- **`#tracker-triage`**: each new report, with **New bug**, **New feature**, **Attach to…** (open
  tickets, closest matches first), **Needs info**, **Discard** and, when an email was given,
  **Show email** (ephemeral, never posted). **Needs info** on a Discord post asks the question
  in that post, mentioning the reporter, and tags it Needs info; for an emailed report it shows
  the address and keeps the report, and its email, waiting in the inbox. Replies show up on the
  triage message.
- **Staff forums** (`DISCORD_STAFF_BUG_FORUM_ID`, `DISCORD_STAFF_FEATURE_FORUM_ID`): one thread per
  ticket. Its first message is the live panel (status, priority and platform menus; **Edit
  details**, **Build info**, **Reports**, **Roadmap…**, **Open in Tracker**). Every change is
  posted in the thread, staff discussion happens there, and the thread's tags follow the
  ticket's status, priority and platforms (tag names must match `STAFF_TAG_NAMES` in
  `src/discord-render.js`). Closed tickets' threads are archived; reopening unarchives them.
  Choosing **In a build** asks for the build, **Released** for the version, **Duplicate** for the
  ticket to merge into.
- **`#roadmap`**: one panel per entry: public wording, visibility, and either **Follow tickets**
  or status buttons. `/roadmap feature|bug` adds an entry with no ticket.
- **Commands**: `/tracker`, `/ticket bug|feature title:` (opens a ticket directly),
  `/ticket released build: version:` (releases a build), `/roadmap`, and the **Track as bug** /
  **Track as feature** message commands.
- **Reporters' threads**: a ticket's status moves the moderated tag on every public forum post
  behind it (Planned, Shipped, Not planned, Fixed, Cannot reproduce), and releasing it posts a
  thank-you there.

The five-minute cron posts reports that never reached triage, imports new posts from the public
bug and feature-request forums (`DISCORD_BUG_FORUM_ID`, `DISCORD_FEATURE_FORUM_ID`), copies new
replies from watched report threads into the timeline (and the ticket's staff thread), and makes
any missing ticket threads. Forum posts are imported at most ten a run, oldest first, by fixed
rules: the post title is the title, the first message is the text (a very short one is prefixed
with the title), the first device tag (Apple TV, iPhone / iPad, Mac, Android TV) is the platform,
other tags and `https` attachment links are appended, and the poster's display name is kept as
the reporter. Posts from before the first poll, posts by bots and posts whose first message was
deleted are skipped; imported threads are remembered in `discord_forum_threads` so retention
can't cause re-imports. Discord returns empty text unless the application has the **Message
Content** intent, which `configure-discord.mjs --apply` turns on.

`scripts/configure-discord.mjs` registers the commands and sets the application's interactions
endpoint; it runs with `DISCORD_BOT_TOKEN` and `GUILD_ID` and prints the public key, owner ID and
the four forum IDs for `wrangler.toml`. Discord sends a signed PING before accepting the endpoint,
so deploy the Worker with `DISCORD_PUBLIC_KEY` first.

## Abuse limits

A rate limiter (3 a minute) and a per-day cap (10) key on a salted SHA-256 of the client address
and the date; the address is never stored and the key is blanked after two days. A hidden
honeypot field and a minimum fill time on the website quietly drop likely bots with the same
success response.

## Retention

The daily cron deletes discarded reports 30 days after triage and untriaged reports after a year.
Reports behind a ticket stay while that ticket exists, so staff can reopen them; once the ticket
is deleted they go 30 days later. A report waiting on **Needs info** is still untriaged, so it
keeps its email until it's triaged. Email is cleared at triage either way, and none of a report's
fields, nor anything from a ticket, ever reach `/v1/roadmap`, which carries only the roadmap
wording (title, summary, description) and status facts. Timeline events of deleted reports,
their watched threads and expired sign-in codes go too. The public privacy policy
(`/privacy/#feedback`) states the same.

## Local verification

```sh
npm install
npm run check && npm test
printf 'ADMIN_TOKEN=%s\nCLIENT_HASH_SALT=%s\nDISCORD_OWNER_ID=100000000000000001\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 16)" > .dev.vars
npm run migrate:local
npm run dev
```

Tests run the real SQL over Node's built-in SQLite (`test/d1.js`), with every migration applied.
To sign in to a local Tracker without Discord, insert a code for the `.dev.vars` owner into
`tracker_logins` (`code_hash` is the base64url SHA-256 of the code) and open
`/tracker/login?code=…`.

## Production deployment

1. `npx wrangler login`, then `npx wrangler d1 create cedar-feedback`.
2. Copy `wrangler.example.toml` to the ignored `wrangler.toml`, set the D1 database ID, and choose
   two account-unique rate-limit namespace IDs.
3. `npm run migrate:remote`, then `npm run deploy`.
4. `npx wrangler secret put ADMIN_TOKEN --config wrangler.toml` (32+ characters), `npx wrangler secret put CLIENT_HASH_SALT --config wrangler.toml`,
   and for Discord `npx wrangler secret put DISCORD_BOT_TOKEN --config wrangler.toml`. Set
   `DISCORD_PUBLIC_KEY`, `DISCORD_TRIAGE_CHANNEL_ID`, `DISCORD_ROADMAP_CHANNEL_ID`,
   `DISCORD_STAFF_BUG_FORUM_ID`, `DISCORD_STAFF_FEATURE_FORUM_ID` and `DISCORD_OWNER_ID` in
   `wrangler.toml`, which also needs the `[assets]` block from the example.
5. If the Worker's URL isn't `https://cedar-feedback.cedar-feedback.workers.dev`, update
   `public/feedback/feedback.js` and `public/roadmap/roadmap.js`, both pages' `connect-src`,
   and `CedarFeedbackClient.endpoint` in the Cedar app.
6. Run `scripts/configure-discord.mjs --endpoint https://…/v1/discord/interactions --apply`.

Never commit `wrangler.toml`, `.dev.vars`, or any secret.
