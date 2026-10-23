// Checks that every list a Creator setup depends on still loads for someone who isn't signed in.
//
//   node scripts/verify_creator_lists.mjs                 check every setup in creator/setups.json
//   node scripts/verify_creator_lists.mjs --report <path>  also write a per-setup health report (JSON)
//
// Exits 1 when any list is missing, private or empty, naming the setup and row that uses it.
// Trakt and TMDB need TRAKT_CLIENT_ID and TMDB_API_KEY in the environment; without them those
// lists are reported as unchecked instead of failing. MDBList is read through its anonymous JSON
// feed, which is what Cedar uses when the viewer has no MDBList key.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const branchGroupID = "cedar.branch-group";
// A list in one of these states shows an empty row or an error in Cedar.
export const brokenStatuses = new Set(["missing", "private", "empty"]);

// The external list a folder source reads, or null for Cedar's own rows (TMDB feeds, discover
// filters, cedar-titles, the viewer's own account lists), which need no check.
export function listReference(source) {
  const dataSource = source?.dataSource ?? {};
  const query = source?.query ?? {};
  const identifier = String(query.identifier ?? "");
  if (query.kind === "curatedList" && dataSource.identifier === "trakt-public") {
    const global = /^global:(\d+):(movie|show)$/.exec(identifier);
    if (global) return { provider: "trakt", key: `trakt:${identifier}`, path: `lists/${global[1]}/items/${global[2]}` };
    const [user, slug] = identifier.split("|");
    if (!user || !slug) return { provider: "trakt", key: `trakt:${identifier}`, invalid: true };
    return { provider: "trakt", key: `trakt:${user}|${slug}`, path: `users/${encodeURIComponent(user)}/lists/${encodeURIComponent(slug)}/items` };
  }
  if (query.kind === "curatedList" && dataSource.identifier === "mdblist-public") {
    const [owner, slug] = identifier.split("|");
    if (!owner || !slug) return { provider: "mdblist", key: `mdblist:${identifier}`, invalid: true };
    return { provider: "mdblist", key: `mdblist:${owner}|${slug}`, path: `lists/${encodeURIComponent(owner)}/${encodeURIComponent(slug)}/json` };
  }
  if (dataSource.kind === "trackingService") return null;
  if (query.kind === "curatedList" && query.parameters?.provider === "tmdb") return { provider: "tmdb", key: `tmdb:list:${identifier}`, path: `list/${identifier}` };
  if (query.kind === "metadataCollection") return { provider: "tmdb", key: `tmdb:collection:${identifier}`, path: `collection/${identifier}` };
  if (query.kind === "productionCompany") return { provider: "tmdb", key: `tmdb:company:${identifier}`, path: `company/${identifier}` };
  return null;
}

// Every row a setup shows: each folder of a Branch Group and each plain Branch, with its sources.
export function setupRows(branches) {
  const rows = [];
  const visit = (folder, path) => {
    for (const option of folder.folderOptions ?? []) {
      const optionPath = [...path, option.title];
      if (option.folderOptions?.length) visit(option, optionPath);
      else rows.push({ path: optionPath.join(" / "), sources: option.sources?.length ? option.sources : [option] });
    }
  };
  for (const branch of branches) {
    if (branch.query?.identifier === branchGroupID) visit(branch, [branch.title]);
    else rows.push({ path: branch.title, sources: branch.sources?.length ? branch.sources : [branch] });
  }
  return rows;
}

// Runs at most `concurrency` tasks at once, starting them no closer than `spacing` ms apart.
function limiter(concurrency, spacing) {
  let active = 0;
  let nextStart = 0;
  const waiting = [];
  const pump = () => {
    if (active >= concurrency || !waiting.length) return;
    active += 1;
    const { task, resolve: done, reject } = waiting.shift();
    const delay = Math.max(0, nextStart - Date.now());
    nextStart = Math.max(nextStart, Date.now()) + spacing;
    setTimeout(() => task().then(done, reject).finally(() => { active -= 1; pump(); }), delay);
  };
  return task => new Promise((done, reject) => { waiting.push({ task, resolve: done, reject }); pump(); });
}

const sleep = ms => new Promise(done => setTimeout(done, ms));

// Fetches JSON, waiting out rate limits and retrying brief failures. Returns { status, body }.
async function getJSON(url, headers) {
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { "User-Agent": "CedarCreatorListCheck/1.0", Accept: "application/json", ...headers }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      if (attempt < 3) { await sleep(2_000 * (attempt + 1)); continue; }
      return { status: 0, error: error.message };
    }
    if (response.status === 429 && attempt < 5) {
      const retryAfter = Number(response.headers.get("retry-after")) || 10;
      await sleep(Math.min(retryAfter, 300) * 1_000 + 1_000);
      continue;
    }
    if (response.status >= 500 && attempt < 3) { await sleep(2_000 * (attempt + 1)); continue; }
    if (!response.ok) return { status: response.status };
    const itemCount = response.headers.get("x-pagination-item-count");
    try { return { status: response.status, itemCount, body: await response.json() }; } catch { return { status: response.status, itemCount, error: "not JSON" }; }
  }
}

function statusFor(result, count) {
  if (result.status === 200) return count === 0 ? "empty" : "ok";
  if (result.status === 404) return "missing";
  if (result.status === 403) return "private";
  // 401 means our own key was refused, which says nothing about the list.
  return "unchecked";
}

function makeChecker({ traktClientID, tmdbAPIKey }) {
  // Trakt allows 1,000 reads per 5 minutes; staying near 2 a second avoids its long lockouts.
  const queues = { trakt: limiter(1, 500), mdblist: limiter(3, 250), tmdb: limiter(6, 30) };
  const traktHeaders = { "trakt-api-version": "2", "trakt-api-key": traktClientID };
  // Trakt answers a blocked machine with the same 403 it uses for a private list, so a public
  // feed is read first: if that fails too, Trakt lists are reported unchecked, not private.
  let traktReachable;
  const check = {
    async trakt(reference) {
      if (!traktClientID) return { status: "unchecked", detail: "TRAKT_CLIENT_ID is not set" };
      traktReachable ??= getJSON("https://api.trakt.tv/movies/trending?limit=1", traktHeaders).then(result => result.status);
      const canary = await traktReachable;
      if (canary !== 200) return { status: "unchecked", detail: `Trakt refused this machine (HTTP ${canary})` };
      // The items endpoint is the one Cedar reads. The list summary endpoint answers 204 for
      // Trakt's own official lists, so it can't tell a working list from a private one.
      const result = await getJSON(`https://api.trakt.tv/${reference.path}?limit=1`, traktHeaders);
      const items = result.itemCount == null ? undefined : Number(result.itemCount);
      return { status: statusFor(result, items), items, http: result.status };
    },
    async mdblist(reference) {
      const result = await getJSON(`https://mdblist.com/${reference.path}`);
      const items = Array.isArray(result.body) ? result.body.filter(row => ["movie", "show"].includes(row.mediatype)).length : undefined;
      if (result.status === 200 && items === undefined) return { status: "unchecked", detail: "unexpected response", http: result.status };
      return { status: statusFor(result, items), items, http: result.status };
    },
    async tmdb(reference) {
      if (!tmdbAPIKey) return { status: "unchecked", detail: "TMDB_API_KEY is not set" };
      const result = await getJSON(`https://api.themoviedb.org/3/${reference.path}?api_key=${encodeURIComponent(tmdbAPIKey)}`);
      const body = result.body ?? {};
      const items = reference.path.startsWith("collection/") ? body.parts?.length : reference.path.startsWith("list/") ? body.item_count : undefined;
      return { status: statusFor(result, items), items, http: result.status };
    },
  };
  const cache = new Map();
  // MDBList now and then answers 404 for a list that is there, so a missing list is read again
  // before the check fails. A list that has really gone stays missing.
  const confirmed = async reference => {
    const run = () => queues[reference.provider](() => check[reference.provider](reference));
    const first = await run();
    if (first.status !== "missing") return first;
    await sleep(15_000);
    return run();
  };
  return reference => {
    if (reference.invalid) return Promise.resolve({ status: "missing", detail: "malformed identifier" });
    if (!cache.has(reference.key)) cache.set(reference.key, confirmed(reference));
    return cache.get(reference.key);
  };
}

async function readSetup(entry) {
  const document = JSON.parse(await readFile(resolve(root, "creator/setups", entry.file), "utf8"));
  return document.branches ?? [];
}

async function main() {
  const reportIndex = process.argv.indexOf("--report");
  const reportPath = reportIndex > 0 ? process.argv[reportIndex + 1] : null;
  const checkList = makeChecker({ traktClientID: process.env.TRAKT_CLIENT_ID, tmdbAPIKey: process.env.TMDB_API_KEY });
  const manifest = JSON.parse(await readFile(resolve(root, "creator/setups.json"), "utf8"));

  const setups = await Promise.all(manifest.setups.map(async entry => {
    const rows = await Promise.all(setupRows(await readSetup(entry)).map(async row => {
      const sources = await Promise.all(row.sources.map(async source => {
        const reference = listReference(source);
        if (!reference) return { title: source.title ?? null, status: "builtin" };
        return { title: source.title ?? null, list: reference.key, ...(await checkList(reference)) };
      }));
      const broken = sources.filter(source => brokenStatuses.has(source.status));
      return { path: row.path, sources, state: !broken.length ? "ok" : broken.length === sources.length ? "broken" : "partial" };
    }));
    return { id: entry.id, title: entry.title, rows };
  }));

  let failures = 0;
  let unchecked = 0;
  for (const setup of setups) {
    const bad = setup.rows.filter(row => row.state !== "ok");
    unchecked += setup.rows.flatMap(row => row.sources).filter(source => source.status === "unchecked").length;
    console.log(`${bad.length ? "✖" : "✔"} ${setup.title} (${setup.id}): ${setup.rows.length - bad.length} of ${setup.rows.length} rows working`);
    for (const row of bad) {
      for (const source of row.sources.filter(source => brokenStatuses.has(source.status))) {
        failures += 1;
        console.log(`    ${row.state === "broken" ? "row has no working list" : "row lost a list"}: ${row.path} → ${source.list} is ${source.status}`);
      }
    }
  }
  const lists = new Set(setups.flatMap(setup => setup.rows.flatMap(row => row.sources.map(source => source.list).filter(Boolean))));
  console.log(`\nChecked ${lists.size} lists across ${setups.length} setups: ${failures} broken uses, ${unchecked} unchecked.`);
  if (reportPath) {
    await writeFile(reportPath, `${JSON.stringify({ checkedAt: new Date().toISOString(), setups }, null, 2)}\n`);
    console.log(`Wrote ${reportPath}`);
  }
  if (failures) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
