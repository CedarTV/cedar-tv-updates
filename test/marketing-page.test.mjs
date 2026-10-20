import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

async function findIndexPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await findIndexPages(path));
    else if (entry.name === "index.html") pages.push(path);
  }
  return pages.sort();
}

test("landing page presents Cedar as one multi-platform product", async () => {
  const source = await readFile("public/index.html", "utf8");
  for (const phrase of [
    "Cedar across every screen",
    "Android TV · Google TV · Fire TV · iPhone · iPad · Apple TV · Mac",
    "One Cedar.",
    "Choose your screen",
    "All platform releases",
  ]) {
    assert.ok(source.includes(phrase), `landing page should include ${phrase}`);
  }

  for (const platform of ["android-tv", "iphone", "ipad", "apple-tv", "mac"]) {
    assert.match(source, new RegExp(`data-platform-version="${platform}"`));
    assert.match(source, new RegExp(`data-platform-status="${platform}"`));
  }

  assert.doesNotMatch(source, /content="[^"]*designed for Android TV[^"]*"/i);
  assert.doesNotMatch(source, />Cedar for Android TV<\/p>/);
});

test("user-facing sequence labels never use leading zeroes", async () => {
  for (const path of await findIndexPages("public")) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(source, />0[1-9](?:\s*\/[^<]*)?</, `${path} should use natural sequence numbering`);
  }
});

test("landing page reads current platform release data", async () => {
  const source = await readFile("public/site.js", "utf8");
  assert.match(source, /fetch\("releases\/releases\.json"/);
  assert.match(source, /data-platform-version/);
  assert.match(source, /data-platform-status/);
  assert.match(source, /data-build/);
});

test("landing page offers a direct path to install and clear availability", async () => {
  const source = await readFile("public/index.html", "utf8");
  const script = await readFile("public/site.js", "utf8");
  assert.match(source, /class="hero-actions">\s*<a class="button button-primary" href="#download" data-get-cedar>/);
  assert.match(source, /<details class="install-help">/);
  for (const platform of ["android-tv", "iphone", "ipad", "apple-tv", "mac"]) {
    assert.match(source, new RegExp(`data-platform-date="${platform}"`));
  }
  for (const platform of ["iphone", "ipad", "apple-tv", "mac"]) {
    assert.match(source, new RegExp(`href="https://testflight\\.apple\\.com/join/[A-Za-z0-9]+" data-beta-link="${platform}"`));
  }
  assert.doesNotMatch(source, /class="caption-number">\d+ \//);
  assert.match(script, /\["testflight", "Public beta"\]/);
  assert.match(script, /data-platform-date/);
});

test("landing page screens are real Cedar captures that exist on disk", async () => {
  const source = await readFile("public/index.html", "utf8");
  const images = [...source.matchAll(/<img[^>]*src="(assets\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(images.filter((path) => path.startsWith("assets/screens/")).length >= 20);
  for (const path of new Set(images)) await readFile(`public/${path}`);
  for (const device of ["apple-tv", "mac", "ipad", "iphone", "android-tv"]) {
    assert.match(source, new RegExp(`data-device-panel="${device}"`));
  }
});

test("landing page keeps every style in stylesheets so the CSP never blocks it", async () => {
  const source = await readFile("public/index.html", "utf8");
  assert.doesNotMatch(source, /\sstyle="/);
  assert.match(source, /<link rel="stylesheet" href="home\.css">/);
  assert.match(source, /<script src="home\.js" defer><\/script>/);
});

test("pricing only ever asks for nothing", async () => {
  const source = await readFile("public/index.html", "utf8");
  const pricing = source.slice(source.indexOf('id="pricing"'), source.indexOf('id="download"'));
  const prices = [...pricing.matchAll(/\$(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  assert.ok(prices.length >= 3);
  assert.ok(prices.every((price) => price === 0));
});

test("roadmap reads the published release catalog", async () => {
  const page = await readFile("public/roadmap/index.html", "utf8");
  const script = await readFile("public/roadmap/roadmap.js", "utf8");
  assert.match(page, /<link rel="canonical" href="https:\/\/cedartv\.github\.io\/cedar-tv-updates\/roadmap\/">/);
  for (const status of ["preview", "testflight", "released"]) {
    assert.match(page, new RegExp(`data-roadmap-status="${status}"`));
  }
  assert.match(script, /fetch\("\.\.\/releases\/releases\.json"/);
});
