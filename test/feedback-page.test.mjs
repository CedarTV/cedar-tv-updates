import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { KINDS, PLATFORMS } from "../feedback-worker/src/feedback.js";

test("feedback page posts only to the feedback service its CSP allows", async () => {
  const page = await readFile("public/feedback/index.html", "utf8");
  const script = await readFile("public/feedback/feedback.js", "utf8");
  const endpoint = new URL(/const ENDPOINT = "([^"]+)"/.exec(script)[1]);
  assert.equal(endpoint.protocol, "https:");
  assert.equal(endpoint.pathname, "/v1/feedback");
  assert.match(page, new RegExp(`connect-src ${endpoint.origin.replaceAll(".", "\\.")};`));
  assert.match(page, /form-action 'none'/);
  assert.match(page, /<link rel="canonical" href="https:\/\/cedartv\.github\.io\/cedar-tv-updates\/feedback\/">/);
});

test("feedback form choices match what the inbox accepts", async () => {
  const page = await readFile("public/feedback/index.html", "utf8");
  const kinds = [...page.matchAll(/name="kind" value="([^"]+)"/g)].map((match) => match[1]);
  const select = page.slice(page.indexOf('<select name="platform"'), page.indexOf("</select>", page.indexOf('<select name="platform"')));
  const platforms = [...select.matchAll(/<option value="([^"]+)">/g)].map((match) => match[1]);
  assert.deepEqual(kinds, [...KINDS]);
  assert.deepEqual(platforms, [...PLATFORMS]);
  assert.match(page, /name="website"[^>]*tabindex="-1"/);
});

test("privacy policy explains feedback retention and the form links to it", async () => {
  const privacy = await readFile("public/privacy/index.html", "utf8");
  const page = await readFile("public/feedback/index.html", "utf8");
  assert.match(privacy, /<h2 id="feedback">Feedback and bug reports<\/h2>/);
  assert.match(privacy, /deleted after 30 days/);
  assert.match(page, /href="\/cedar-tv-updates\/privacy\/#feedback"/);
});
