// A D1 stand-in over Node's built-in SQLite, with every migration applied, so tests run the
// Worker's real SQL. Only the parts of the D1 API the Worker uses are here.
import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const migrations = new URL("../migrations/", import.meta.url);

export const migrate = (db, { through = Infinity } = {}) => {
  for (const file of readdirSync(migrations).filter((name) => name.endsWith(".sql")).sort()) {
    if (Number.parseInt(file, 10) > through) break;
    db.exec(readFileSync(new URL(file, migrations), "utf8"));
  }
};

export const sqliteD1 = (database = null) => {
  const db = database ?? new DatabaseSync(":memory:");
  if (!database) migrate(db);
  const statement = (sql, params = []) => {
    const execute = () => {
      const prepared = db.prepare(sql);
      if (/^\s*SELECT\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
        const results = prepared.all(...params);
        return { results, meta: { changes: results.length } };
      }
      const result = prepared.run(...params);
      return { results: [], meta: { changes: Number(result.changes) } };
    };
    return {
      bind: (...values) => statement(sql, values.map((value) => (value === undefined ? null : value))),
      first: async () => db.prepare(sql).get(...params) ?? null,
      all: async () => ({ results: db.prepare(sql).all(...params) }),
      run: async () => execute(),
      execute,
    };
  };
  return {
    raw: db,
    prepare: (sql) => statement(sql),
    // D1 runs a batch as one transaction.
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const results = statements.map((entry) => entry.execute());
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
};
