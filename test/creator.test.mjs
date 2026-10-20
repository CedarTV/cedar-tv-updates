import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  addToCart, cartAppLink, cartWebLink, creatorBundleID, itemFileURL, mergeCart, moveInCart,
  parseCart, removeFromCart, setupOptions,
} from "../public/creator/creator-model.mjs";

const setup = id => ({ type: "setup", id });
const group = id => ({ type: "group", id });
const avatar = id => ({ type: "avatar", id });

test("published Creator files match their curated sources", () => {
  execFileSync(process.execPath, ["scripts/build_creator_catalog.mjs", "--check"], { stdio: "pipe" });
});

test("every catalog item has a portable Cedar Branches file under the shared bundle ID", async () => {
  const { setups } = JSON.parse(await readFile("public/catalogs/creator.json", "utf8"));
  assert.ok(setups.length >= 1);
  const seen = new Set();
  for (const entry of setups) {
    for (const id of [entry.id, ...entry.groups.map(item => item.id)]) {
      const bundle = JSON.parse(await readFile(`public/creator/items/${id}.cedar`, "utf8"));
      assert.equal(bundle.formatIdentifier, "app.cedar.bundle");
      assert.equal(bundle.kind, "branches");
      assert.equal(bundle.bundleID, creatorBundleID);
      assert.match(bundle.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      assert.deepEqual(bundle.branches.map(branch => branch.position), bundle.branches.map((_, index) => index));
      assert.ok(!JSON.stringify(bundle).match(/connectedSource|tobaccoTie|cedar\.catalog-link/));
      assert.equal(itemFileURL(id), `https://cedartv.github.io/cedar-tv-updates/creator/items/${id}.cedar`);
    }
    const whole = JSON.parse(await readFile(`public/creator/items/${entry.id}.cedar`, "utf8"));
    assert.equal(whole.branches.length, entry.groupCount);
    for (const branch of whole.branches) {
      assert.ok(!seen.has(branch.id), "branch ids are unique across the catalog");
      seen.add(branch.id);
    }
  }
});

test("every setup credits its creator, and every published file carries that credit", async () => {
  const { setups } = JSON.parse(await readFile("public/catalogs/creator.json", "utf8"));
  for (const entry of setups) {
    assert.ok(entry.creator, `${entry.id} names its creator`);
    assert.ok(["Cedar", "Strand", "Fusion", "Nuvio"].includes(entry.credit.platform));
    if (entry.credit.platform !== "Cedar") assert.match(entry.credit.sourceURL || "", /^https:\/\//, `${entry.id} links to its source`);
    for (const id of [entry.id, ...entry.groups.map(group => group.id)]) {
      const bundle = JSON.parse(await readFile(`public/creator/items/${id}.cedar`, "utf8"));
      assert.equal(bundle.credits.creator, entry.creator);
      assert.equal(bundle.credits.platform, entry.credit.platform);
    }
  }
});

test("the custom Strand setup with a provider login is never published", async () => {
  const { setups } = JSON.parse(await readFile("public/catalogs/creator.json", "utf8"));
  assert.ok(!setups.some(entry => /custom/i.test(entry.title)));
  assert.ok(!JSON.stringify(setups).match(/xtream|password/i));
});

test("cart keeps one avatar, folds groups into their setup, and refuses duplicates", () => {
  let cart = [];
  cart = addToCart(cart, group("horror-vault.d4e19235")).cart;
  cart = addToCart(cart, setup("cinematic-sagas")).cart;
  cart = addToCart(cart, group("horror-vault.a8dd20c2")).cart;
  let result = addToCart(cart, setup("horror-vault"));
  assert.equal(result.status, "replaced");
  assert.deepEqual(result.cart, [setup("horror-vault"), setup("cinematic-sagas")]);
  cart = result.cart;
  assert.equal(addToCart(cart, group("horror-vault.d4e19235")).status, "included");
  assert.equal(addToCart(cart, setup("cinematic-sagas")).status, "duplicate");
  cart = addToCart(cart, avatar("avatars/nuvio/a.webp")).cart;
  result = addToCart(cart, avatar("avatars/nuvio/b.webp"));
  assert.equal(result.status, "replaced");
  assert.deepEqual(result.cart.filter(entry => entry.type === "avatar"), [avatar("avatars/nuvio/b.webp")]);
});

test("reordering moves branch entries and keeps the avatar out of the order", () => {
  const cart = [setup("a"), group("b.12345678"), setup("c"), avatar("avatars/x/y.webp")];
  assert.deepEqual(moveInCart(cart, 2, 0), [setup("c"), setup("a"), group("b.12345678"), avatar("avatars/x/y.webp")]);
  assert.equal(moveInCart(cart, 0, 9), cart);
  assert.deepEqual(removeFromCart(cart, "setup:c"), [setup("a"), group("b.12345678"), avatar("avatars/x/y.webp")]);
});

test("cart links round-trip in order and reject anything outside the catalog", () => {
  const cart = [setup("cinematic-sagas"), group("horror-vault.d4e19235"), avatar("avatars/nuvio/a.webp")];
  const web = new URL(cartWebLink(cart));
  assert.equal(web.origin + web.pathname, "https://cedartv.github.io/cedar-tv-updates/creator/");
  assert.deepEqual(parseCart(web.search), cart);
  const app = new URL(cartAppLink(cart));
  assert.equal(app.protocol, "cedar:");
  assert.equal(app.host, "creator");
  assert.equal(app.pathname, "/cart");
  assert.deepEqual(app.searchParams.getAll("i"), ["cinematic-sagas", "horror-vault.d4e19235"]);
  assert.deepEqual(parseCart("?i=../x&i=Horror&i=a.b&a=https://evil.example/a.webp&a=avatars/../x.webp"), []);
  assert.deepEqual(parseCart("?i=known&i=unknown", new Set(["known"])), [setup("known")]);
});

test("merging a cart keeps cart order, drops repeated branches and adds the avatar link", () => {
  const branch = (id, title) => ({ id, title, position: 9 });
  const files = {
    first: { title: "First", branches: [branch("A", "One"), branch("B", "Two")] },
    "second.cccccccc": { title: "Second", branches: [branch("C", "Three"), branch("A", "One")] },
  };
  const bundle = mergeCart([group("second.cccccccc"), setup("first"), avatar("avatars/nuvio/a.webp")], files, "2026-10-11T00:00:00Z");
  assert.equal(bundle.bundleID, creatorBundleID);
  assert.deepEqual(bundle.branches.map(item => [item.id, item.position]), [["C", 0], ["A", 1], ["B", 2]]);
  assert.equal(bundle.avatarURL, "https://cedartv.github.io/cedar-tv-updates/avatars/nuvio/a.webp");
  assert.equal(bundle.title, "Cedar Creator selection");
});

test("a cart carries one badge pack by its site file name", () => {
  const badges = id => ({ type: "badges", id });
  const cart = [setup("first"), avatar("avatars/nuvio/a.webp"), badges("xp_aurora")];
  assert.deepEqual(parseCart(new URL(cartWebLink(cart)).search), cart);
  assert.deepEqual(addToCart(cart, badges("xp_onyx")).cart.at(-1), badges("xp_onyx"));
  assert.deepEqual(parseCart("?i=first&b=../evil&b=https://evil.example/x.json"), [setup("first")]);
  const files = { first: { title: "First", branches: [{ id: "A", title: "One", position: 0 }] } };
  assert.equal(mergeCart(cart, files).badgePackURL, "https://cedartv.github.io/cedar-tv-updates/badge-packs/xp_aurora.json");
});

test("setup browsing filters by text and category without changing featured order", () => {
  const rows = [
    { id: "b", title: "Beta", creator: "Cedar", description: "", tags: ["Decades"], addedAt: "2026-10-01", branchCount: 3, groups: [{ title: "Retro", rows: ["1980s"] }] },
    { id: "a", title: "Alpha", creator: "Cedar", description: "", tags: ["Genres"], addedAt: "2026-10-05", branchCount: 9, groups: [] },
  ];
  assert.deepEqual(setupOptions(rows, { query: "1980" }).map(row => row.id), ["b"]);
  assert.deepEqual(setupOptions(rows, { tag: "Genres" }).map(row => row.id), ["a"]);
  assert.deepEqual(setupOptions(rows, { sort: "newest" }).map(row => row.id), ["a", "b"]);
  assert.deepEqual(setupOptions(rows, { sort: "name" }).map(row => row.id), ["a", "b"]);
  assert.deepEqual(setupOptions(rows).map(row => row.id), ["b", "a"]);
  rows[0].credit = { platform: "Strand" };
  rows[1].credit = { platform: "Cedar" };
  assert.deepEqual(setupOptions(rows, { platform: "Strand" }).map(row => row.id), ["b"]);
  assert.deepEqual(setupOptions(rows, { query: "strand" }).map(row => row.id), ["b"]);
});
