# Cedar feedback inbox

A small Cloudflare Worker/D1 service that receives bug reports and feature requests from the
`/feedback/` page and the Cedar apps' **Send Feedback** screen. It is separate from the encrypted
sync relay in `worker/` on purpose: the relay only ever stores ciphertext, and feedback is plain
text.

It also holds the roadmap: items live in D1, the public roadmap page reads `/v1/roadmap`, and
they're edited from Cedar Tracker (a local app in the private Cedar repository) or from the
private `#tracker-triage` and `#roadmap` Discord channels.

## Endpoints

- `POST /v1/feedback`: public. The website sends its `Origin` (must equal `CEDAR_WEB_ORIGIN`);
  the apps send `X-Cedar-Client: app` and no `Origin`. Fields: `schemaVersion` (1), `kind`
  (`bug`/`feature`), `title` (3–120), `details` (10–4,000), `platform`, and optional `appVersion`,
  `osVersion`, `deviceModel`, `contact` (email). Answers `201 { reference }`.
- `GET /v1/roadmap`: public, any origin, cached for 10 seconds. Only items marked public with a
  public status, and only public fields (see `scripts/tracker_feed.mjs` in the site).
- Admin (bearer `ADMIN_TOKEN`, no browser origin): `GET /v1/inbox?state=…`,
  `POST /v1/inbox/:id/accept|merge|discard`, `GET|POST /v1/items`, `PUT|DELETE /v1/items/:id`,
  `GET /v1/items/:id/reports` (the full original reports behind an item, without email).
  Triage clears the reporter's `contact`.
- `POST /v1/discord/interactions`: Discord's signed interactions (Ed25519, `DISCORD_PUBLIC_KEY`).
  Only `DISCORD_OWNER_ID` can act.

## Discord triage

Each new report is posted to `DISCORD_TRIAGE_CHANNEL_ID` with **Approve** (opens a form for the
public title and summary), **Keep private**, **Merge into…**, **Discard** and, when an email was
given, **Show email** (ephemeral, never posted). Accepting closes the report's message and posts
the item's panel in `DISCORD_ROADMAP_CHANNEL_ID`: status buttons (**Shipped**/**Fixed** ask for
the version), **Edit wording** and **Hide from roadmap**. Changes from Cedar Tracker refresh the
panel. `/roadmap feature` and `/roadmap bug` (with a starting status) add an item directly.

A cron every five minutes posts any untriaged report that never reached Discord (sent before it
was configured, or during an outage), skipping reports less than two minutes old. The daily cron
handles retention.

New posts in the public bug and feature-request forums (`DISCORD_BUG_FORUM_ID`,
`DISCORD_FEATURE_FORUM_ID`) are imported by the same five-minute cron, at most ten a run, oldest
first. Each thread becomes one report, formatted by fixed rules: the post title is the title,
the first message is the text (a very short one is prefixed with the title), the first device
tag (Apple TV, iPhone / iPad, Mac, Android TV) is the platform, other tags and `https`
attachment links are appended, and the poster's display name is kept as the reporter. The
triage message links back to the post. Posts from before the first poll, posts by bots and posts
whose first message was deleted are skipped; imported threads are remembered in
`discord_forum_threads` so retention can't cause re-imports. Discord returns empty text unless
the application has the **Message Content** intent, which `configure-discord.mjs --apply` turns
on; posts read as empty are retried on later runs and logged. Edits and replies after a post is
imported aren't copied.

The **Track as bug** and **Track as feature** message commands turn any Discord post into a
report. For forum threads, status changes apply the matching moderated tag (Planned, Shipped,
Not planned, Fixed) and a shipped or fixed item posts a thank-you in the thread.

`scripts/configure-discord.mjs` registers those commands and sets the application's
interactions endpoint; it runs with `DISCORD_BOT_TOKEN` and `GUILD_ID` and prints the public key
and owner ID, and the two forum IDs, for `wrangler.toml`. Discord sends a signed PING before accepting the endpoint, so
deploy the Worker with `DISCORD_PUBLIC_KEY` first.

## Abuse limits

A rate limiter (3 a minute) and a per-day cap (10) key on a salted SHA-256 of the client address
and the date; the address is never stored and the key is blanked after two days. A hidden
honeypot field and a minimum fill time on the website quietly drop likely bots with the same
success response.

## Retention

The daily cron deletes discarded reports 30 days after triage and untriaged reports after a year.
Reports that were accepted as, or merged into, a roadmap item stay while that item exists, so
staff can reopen them (`GET /v1/items/:id/reports`, the item panel's **Original reports** button,
or the closed triage message's **Show report** button); once the item is deleted they go at the
next daily run. Email is cleared at triage either way, and none of a report's fields ever reach
`/v1/roadmap`, which carries only the roadmap wording (title, summary, description) and status facts.
The public privacy policy (`/privacy/#feedback`) states the same.

## Local verification

```sh
npm install
npm run check && npm test
printf 'ADMIN_TOKEN=%s\nCLIENT_HASH_SALT=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 16)" > .dev.vars
npm run migrate:local
npm run dev
```

## Production deployment

1. `npx wrangler login`, then `npx wrangler d1 create cedar-feedback`.
2. Copy `wrangler.example.toml` to the ignored `wrangler.toml`, set the D1 database ID, and choose
   two account-unique rate-limit namespace IDs.
3. `npm run migrate:remote`, then `npm run deploy`.
4. `npx wrangler secret put ADMIN_TOKEN --config wrangler.toml` (32+ characters, the same value
   saved in Cedar Tracker's Settings), `npx wrangler secret put CLIENT_HASH_SALT --config wrangler.toml`,
   and for Discord `npx wrangler secret put DISCORD_BOT_TOKEN --config wrangler.toml`. Set
   `DISCORD_PUBLIC_KEY`, `DISCORD_TRIAGE_CHANNEL_ID` and `DISCORD_OWNER_ID` in `wrangler.toml`.
5. If the Worker's URL isn't `https://cedar-feedback.cedar-feedback.workers.dev`, update
   `public/feedback/feedback.js` and `public/roadmap/roadmap.js`, both pages' `connect-src`,
   `CedarFeedbackClient.endpoint` in the Cedar app, and Cedar Tracker's `config.json`.
6. Run `scripts/configure-discord.mjs --endpoint https://…/v1/discord/interactions --apply`.

Never commit `wrangler.toml`, `.dev.vars`, or any secret.
