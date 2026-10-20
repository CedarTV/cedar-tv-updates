import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "public/index.html",
  "public/styles.css",
  "public/policy.css",
  "public/assets/cedar-app-icon.png",
  "public/assets/cedar-wordmark.png",
  "public/assets/tmdb-logo.svg",
  "public/apple/index.html",
  "public/support/index.html",
  "public/privacy/index.html",
  "public/accessibility/index.html",
  "public/content-policy/index.html",
  "public/demo/cedar-review.m3u",
  "public/setup/cedar-sync.mjs",
  "public/setup/vendor/fflate-inflate.mjs",
  "public/setup/vendor/fflate-LICENSE.txt",
  "public/catalogs/avatars.json",
  "public/catalogs/badges.json",
];

await Promise.all(requiredFiles.map((path) => access(path)));

const policyPages = [
  "apple",
  "support",
  "privacy",
  "accessibility",
  "content-policy",
];
for (const route of policyPages) {
  const policyPage = await readFile(`public/${route}/index.html`, "utf8");
  const canonical = `https://cedartv.github.io/cedar-tv-updates/${route}/`;
  if (
    !policyPage.includes(`<link rel="canonical" href="${canonical}">`)
    || !policyPage.includes("Content-Security-Policy")
    || !policyPage.includes('/cedar-tv-updates/support/')
    || !policyPage.includes('/cedar-tv-updates/privacy/')
    || /\[(?:SUPPORT EMAIL|LEGAL HOLDER|OWNER REQUIRED)\]/i.test(policyPage)
    || /chatgpt\.site/i.test(policyPage)
  ) {
    throw new Error(`${route} is missing canonical policy metadata or contains a release placeholder`);
  }
}

const supportPage = await readFile("public/support/index.html", "utf8");
if (!supportPage.includes("https://discord.gg/TFTx7j86v") || !supportPage.includes("/issues")) {
  throw new Error("The public Support URL must contain working contact options");
}

const privacyPage = await readFile("public/privacy/index.html", "utf8");
for (const requiredPrivacyTopic of [
  "Data on your device",
  "Services you connect",
  "Tracking and advertising",
  "Your choices and contact",
]) {
  if (!privacyPage.includes(requiredPrivacyTopic)) {
    throw new Error(`The privacy policy is missing ${requiredPrivacyTopic}`);
  }
}

const demoPlaylist = await readFile("public/demo/cedar-review.m3u", "utf8");
if (!demoPlaylist.startsWith("#EXTM3U\n") || !demoPlaylist.includes("Big Buck Bunny") || !demoPlaylist.includes("https://")) {
  throw new Error("The App Review demo playlist is incomplete");
}

const badges = JSON.parse(await readFile("public/catalogs/badges.json", "utf8"));
if (!Array.isArray(badges.sets) || badges.sets.length === 0) {
  throw new Error("The Cedar badge catalog is empty");
}
for (const set of badges.sets) {
  const source = new URL(set.sourceURL);
  if (
    typeof set.id !== "string"
    || !/^[a-z0-9_-]+$/i.test(set.id)
    || source.origin !== "https://cedartv.github.io"
    || source.pathname !== `/cedar-tv-updates/badge-packs/${set.id}.json`
  ) {
    throw new Error(`Badge set ${set.label || "unknown"} has an invalid install source`);
  }
  const pack = JSON.parse(await readFile(`public/badge-packs/${set.id}.json`, "utf8"));
  if (!Array.isArray(pack.groups) || !Array.isArray(pack.filters) || pack.filters.length === 0) {
    throw new Error(`Badge set ${set.label || set.id} is not installable`);
  }
}

const protocol = await readFile("public/setup/cedar-sync.mjs", "utf8");
for (const requiredProtocol of [
  "cedar-sync-v1:",
  "/changes",
  "/invitations",
  "AES-GCM",
  "DecompressionStream",
  "inflateSync",
  "scope",
  "ownerDeviceID",
  "cedar-companion-snapshot",
  "browser-companion-configuration",
  "browser-remote-command",
  "browser-device-action",
]) {
  if (!protocol.includes(requiredProtocol)) {
    throw new Error(`The setup relay protocol client is missing ${requiredProtocol}`);
  }
}

console.log("Verified the public site");
