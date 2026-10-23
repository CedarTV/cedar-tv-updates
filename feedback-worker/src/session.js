// Sign-in for the hosted Tracker at /tracker/. There's no password: /tracker in Discord (owner
// only) answers privately with a one-time link, which sets a signed 30-day cookie. The cookie is
// renewed while it's used, and only the Discord owner's id is ever accepted.
import { FeedbackError } from "./errors.js";

export const COOKIE = "cedar_tracker";
const CODE_LIFETIME_MS = 10 * 60 * 1000;
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;
const NEXT = /^(BUG|FR|CDR)-[1-9]\d{0,6}$/;

const encoder = new TextEncoder();
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const hash = async (text) => base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(text))));

// Sessions are signed with TRACKER_SESSION_SECRET, or a key derived from ADMIN_TOKEN when that
// secret isn't set. Rotating either signs everyone out.
const signingKey = (env) => {
  const secret = env.TRACKER_SESSION_SECRET || (env.ADMIN_TOKEN ? `tracker-session|${env.ADMIN_TOKEN}` : "");
  if (secret.length < 32) throw new FeedbackError(503, "not_configured");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
};

const sign = async (env, payload) => base64url(new Uint8Array(await crypto.subtle.sign("HMAC", await signingKey(env), encoder.encode(payload))));

export const loginLink = async (deps, env, userID, next = "") => {
  const code = base64url(crypto.getRandomValues(new Uint8Array(32)));
  await deps.store.createLogin(await hash(code), userID, deps.now + CODE_LIFETIME_MS);
  const url = new URL("/tracker/login", deps.origin);
  url.searchParams.set("code", code);
  if (NEXT.test(next)) url.searchParams.set("next", next);
  return url.href;
};

const sessionCookie = async (env, userID, now) => {
  const payload = `v1.${userID}.${now + SESSION_LIFETIME_MS}`;
  return `${COOKIE}=${payload}.${await sign(env, payload)}; Path=/; Max-Age=${SESSION_LIFETIME_MS / 1000}; HttpOnly; Secure; SameSite=Strict`;
};

export const clearCookie = `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

const readCookie = (request) => {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === COOKIE) return value.join("=");
  }
  return null;
};

// The signed-in owner, or null. `renew` is a fresh cookie when the session is over a day old.
export const readSession = async (request, env, now) => {
  const value = readCookie(request);
  const match = /^(v1)\.(\d{1,25})\.(\d{13})\.([A-Za-z0-9_-]{43})$/.exec(value ?? "");
  if (!match) return null;
  const [, version, userID, expires, signature] = match;
  const key = await signingKey(env);
  const bytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0));
  if (!(await crypto.subtle.verify("HMAC", key, bytes, encoder.encode(`${version}.${userID}.${expires}`)))) return null;
  if (Number(expires) <= now || !env.DISCORD_OWNER_ID || userID !== env.DISCORD_OWNER_ID) return null;
  const issued = Number(expires) - SESSION_LIFETIME_MS;
  return { userID, renew: now - issued > RENEW_AFTER_MS ? await sessionCookie(env, userID, now) : null };
};

const page = (status, title, text) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>`
  + `<style>body{font:16px/1.5 -apple-system,system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px;color:#1d1d1f;background:#f5f5f7}`
  + `@media (prefers-color-scheme:dark){body{color:#f5f5f7;background:#000}}</style><h1>${title}</h1><p>${text}</p>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'", "Referrer-Policy": "no-referrer" } },
);

// GET /tracker/login?code=…: spends the code, sets the session and opens the Tracker.
export const completeLogin = async (request, env, deps) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const userID = /^[A-Za-z0-9_-]{43}$/.test(code) ? await deps.store.consumeLogin(await hash(code), deps.now) : null;
  if (!userID || userID !== env.DISCORD_OWNER_ID) {
    return page(400, "That sign-in link has expired", "Links work once and for ten minutes. Type <b>/tracker</b> in the Cedar Discord for a new one.");
  }
  const next = url.searchParams.get("next") ?? "";
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/tracker/${NEXT.test(next) ? `#${next}` : ""}`,
      "Set-Cookie": await sessionCookie(env, userID, deps.now),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
};
