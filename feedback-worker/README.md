# Cedar feedback inbox

A small Cloudflare Worker/D1 service that receives bug reports and feature requests from the
`/feedback/` page and the Cedar apps' **Send Feedback** screen. It is separate from the encrypted
sync relay in `worker/` on purpose: the relay only ever stores ciphertext, and feedback is plain
text.

Nothing here is public. The local Cedar Tracker reads the inbox with an admin token, and turns
reviewed reports into roadmap items that are published as `public/roadmap/tracker.json`.

## Endpoints

- `POST /v1/feedback`: public. The website sends its `Origin` (must equal `CEDAR_WEB_ORIGIN`);
  the apps send `X-Cedar-Client: app` and no `Origin`. Fields: `schemaVersion` (1), `kind`
  (`bug`/`feature`), `title` (3–120), `details` (10–4,000), `platform`, and optional `appVersion`,
  `osVersion`, `deviceModel`, `contact` (email). Answers `201 { reference }`.
- `GET /v1/inbox?state=new|accepted|merged|discarded`: admin bearer token, no browser origin.
- `POST /v1/inbox/:submissionID` `{ schemaVersion, state, itemID }`: admin. Triage clears `contact`.

## Abuse limits

A rate limiter (3 a minute) and a per-day cap (10) key on a salted SHA-256 of the client address
and the date; the address is never stored and the key is blanked after two days. A hidden
honeypot field and a minimum fill time on the website quietly drop likely bots with the same
success response.

## Retention

The daily cron deletes triaged reports 30 days after triage and untriaged reports after a year.
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
   saved in Cedar Tracker's Settings) and `npx wrangler secret put CLIENT_HASH_SALT --config wrangler.toml`.
5. If the Worker's URL isn't `https://cedar-feedback.cedar-feedback.workers.dev`, update
   `public/feedback/feedback.js`, the `/feedback/` page's `connect-src`, and
   `CedarFeedbackClient.endpoint` in the Cedar app.

Never commit `wrangler.toml`, `.dev.vars`, or either secret.
