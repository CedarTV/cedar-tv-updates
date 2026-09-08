import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { artworkURL, appURL, matchingOptions } from "../public/artwork/artwork-model.mjs";

test("every catalog choice yields a mirrored copy URL and a lossless app request", async () => {
  for (const kind of ["avatars", "badges"]) {
    const data = JSON.parse(await readFile(`public/catalogs/${kind}.json`, "utf8"));
    for (const option of data.avatars || data.sets) {
      const source = artworkURL(option.url || option.sourceURL, kind);
      const request = new URL(appURL(source, kind));
      assert.equal(request.protocol, "cedar:");
      assert.equal(request.hostname, "artwork");
      assert.equal(request.pathname, kind === "avatars" ? "/avatar" : "/badges");
      assert.equal(request.searchParams.get("url"), source);
      await readFile(`public/${new URL(source).pathname.replace("/cedar-tv-updates/", "")}`);
    }
  }
});
test("gallery rejects outside URLs and filters names and collection metadata", () => {
  for (const source of ["https://evil.example/avatar.webp", "javascript:alert(1)", "../private.json"]) {
    assert.throws(() => artworkURL(source, "avatars"));
  }
  const rows = [{ name: "Blue", source: "Disney" }, { label: "Aurora", style: "Frosted glass" }];
  assert.deepEqual(matchingOptions(rows, " DISNEY "), [rows[0]]);
  assert.deepEqual(matchingOptions(rows, "glass"), [rows[1]]);
  assert.deepEqual(matchingOptions(rows, "no match"), []);
});

test("avatar category filtering composes with search and sorting without changing catalog order", async () => {
  const { avatarOptions, avatarCategories } = await import("../public/artwork/artwork-model.mjs");
  const rows = [{ name: "Zed", category: "Marvel" }, { name: "Amy", category: null }, { name: "Ant", category: "Marvel" }];
  assert.deepEqual(avatarCategories(rows), ["Marvel", "Uncategorized"]);
  assert.deepEqual(avatarOptions(rows, "", "Marvel", "name").map(x => x.name), ["Ant", "Zed"]);
  assert.deepEqual(avatarOptions(rows, "ant", "Marvel", "category"), [rows[2]]);
  assert.deepEqual(avatarOptions(rows, "", "Uncategorized"), [rows[1]]);
  assert.deepEqual(avatarOptions(rows, "", "", "category").map(x => x.name), ["Ant", "Zed", "Amy"]);
  assert.deepEqual(rows.map(x => x.name), ["Zed", "Amy", "Ant"]);
});
