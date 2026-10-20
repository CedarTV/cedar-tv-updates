import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { listReference, setupRows } from "../scripts/verify_creator_lists.mjs";

const source = (dataSource, query) => ({ dataSource, query });
const tracking = identifier => ({ kind: "trackingService", identifier, parameters: {} });
const metadata = { kind: "preferredMetadata", parameters: {} };

test("list references cover the public list sources Creator setups use", () => {
  assert.deepEqual(listReference(source(tracking("trakt-public"), { kind: "curatedList", identifier: "majeed_pk|best-gun-movies" })),
    { provider: "trakt", key: "trakt:majeed_pk|best-gun-movies", path: "users/majeed_pk/lists/best-gun-movies/items" });
  assert.equal(listReference(source(tracking("trakt-public"), { kind: "curatedList", identifier: "global:34698053:movie" })).path, "lists/34698053/items/movie");
  assert.equal(listReference(source(tracking("mdblist-public"), { kind: "curatedList", identifier: "snoak|action-movies", parameters: { listID: "91211" } })).path,
    "lists/snoak/action-movies/json");
  assert.equal(listReference(source(metadata, { kind: "metadataCollection", identifier: "9735" })).key, "tmdb:collection:9735");
  assert.equal(listReference(source(metadata, { kind: "curatedList", identifier: "8661472", parameters: { provider: "tmdb" } })).key, "tmdb:list:8661472");
  assert.ok(listReference(source(tracking("mdblist-public"), { kind: "curatedList", identifier: "no-slug" })).invalid);
});

test("Cedar's own rows need no list check", () => {
  assert.equal(listReference(source(metadata, { kind: "popular", parameters: {} })), null);
  assert.equal(listReference(source(metadata, { kind: "curatedList", identifier: "saga", parameters: { provider: "cedar-titles", movies: "603" } })), null);
  assert.equal(listReference(source(tracking("trakt"), { kind: "curatedList", identifier: "builtin:watchlist" })), null);
});

test("rows include nested folders and plain branches, falling back to the folder's own query", () => {
  const rows = setupRows([
    { title: "Plain", query: { kind: "popular" } },
    { title: "Group", query: { identifier: "cedar.branch-group" }, folderOptions: [
      { title: "Hub", folderOptions: [{ title: "Leaf", query: { kind: "popular" } }] },
      { title: "Two", query: { kind: "popular" }, sources: [{ query: { kind: "popular" } }, { query: { kind: "trending" } }] },
    ] },
  ]);
  assert.deepEqual(rows.map(row => [row.path, row.sources.length]), [["Plain", 1], ["Group / Hub / Leaf", 1], ["Group / Two", 2]]);
});

test("every row in every curated setup reads something Cedar can load", async () => {
  for (const file of await readdir("creator/setups")) {
    const document = JSON.parse(await readFile(`creator/setups/${file}`, "utf8"));
    for (const row of setupRows(document.branches)) {
      assert.ok(row.sources.length, `${file}: ${row.path} has no sources`);
      for (const item of row.sources) assert.ok(!listReference(item)?.invalid, `${file}: ${row.path} has a malformed list identifier`);
    }
  }
});
