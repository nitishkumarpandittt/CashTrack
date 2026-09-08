// Read-only health check for the database the app points at.
//
//   npm run db:check                                  # NEXT_PUBLIC_DATABASE_URL from .env.local / .env
//   DATABASE_URL="postgresql://..." npm run db:check  # another database, e.g. the one Vercel is built with
//
// It talks to Neon over HTTP exactly the way the browser bundle does, so a
// connection string that passes here also works from the deployed app.
// Nothing is modified: when something is wrong it prints the SQL that fixes it.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const EXPECTED = {
  budgets: ["id", "name", "amount", "icon", "createdBy"],
  incomes: ["id", "name", "amount", "icon", "createdBy"],
  expenses: ["id", "name", "amount", "budgetId", "createdAt"],
};

const url = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!url) {
  console.error(
    "No connection string. Set NEXT_PUBLIC_DATABASE_URL in .env.local, or pass DATABASE_URL=... to check another database.",
  );
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error("The connection string is not a valid URL.");
  process.exit(1);
}

console.log(`Checking ${parsed.hostname}${parsed.pathname} as role "${decodeURIComponent(parsed.username)}"`);

const sql = neon(url);
let problems = 0;
const ok = (msg) => console.log(`  ok   ${msg}`);
const bad = (msg, fix) => {
  problems += 1;
  console.log(`  FAIL ${msg}`);
  if (fix) console.log(`       fix: ${fix}`);
};

try {
  const [who] = await sql`select current_user as role, current_database() as db`;
  ok(`connected as ${who.role} to ${who.db}`);
} catch (error) {
  bad(`cannot connect: ${error.message}`);
  console.log("\nThe app can neither read nor write with this connection string. Fix it before checking anything else.");
  process.exit(1);
}

const [{ transaction_read_only: readOnly }] = await sql`show transaction_read_only`;
if (readOnly === "on") {
  bad(
    "connection is read-only (read replica or read-only role): nothing can be saved",
    "use the primary endpoint's connection string",
  );
} else {
  ok("connection allows writes");
}

const columns = await sql`
  select table_name, column_name
  from information_schema.columns
  where table_schema = 'public' and table_name in ('budgets', 'incomes', 'expenses')
`;
const byTable = new Map();
for (const row of columns) {
  if (!byTable.has(row.table_name)) byTable.set(row.table_name, new Set());
  byTable.get(row.table_name).add(row.column_name);
}

for (const [table, expected] of Object.entries(EXPECTED)) {
  console.log(`\n${table}`);
  const present = byTable.get(table);
  if (!present) {
    bad("table is missing", "npm run db:push  (against this same connection string)");
    continue;
  }

  const missing = expected.filter((column) => !present.has(column));
  if (missing.length) bad(`missing columns: ${missing.join(", ")}`, "npm run db:push");
  else ok("all expected columns present");

  const extra = [...present].filter((column) => !expected.includes(column));
  if (extra.length) {
    const [required] = await sql`
      select string_agg(column_name, ', ') as cols
      from information_schema.columns
      where table_schema = 'public' and table_name = ${table}
        and is_nullable = 'NO' and column_default is null and column_name = any(${extra})
    `;
    if (required?.cols) {
      bad(
        `extra NOT NULL columns the app never fills (${required.cols}): every insert fails`,
        `ALTER TABLE "${table}" ALTER COLUMN "<column>" DROP NOT NULL;  -- or drop the column`,
      );
    } else {
      ok(`extra columns are nullable (${extra.join(", ")})`);
    }
  }

  const qualified = `public.${table}`;
  const [priv] = await sql`
    select has_table_privilege(current_user, ${qualified}, 'SELECT') as can_read,
           has_table_privilege(current_user, ${qualified}, 'INSERT') as can_write
  `;
  if (!priv.can_read) bad("role cannot SELECT from this table");
  if (!priv.can_write) {
    bad(
      "role cannot INSERT into this table",
      `GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO ${decodeURIComponent(parsed.username)};`,
    );
  }
  if (priv.can_read && priv.can_write) ok("role can read and write");

  const [seq] = await sql`select pg_get_serial_sequence(${qualified}, 'id') as name`;
  if (!seq?.name) {
    bad("the id column has no sequence attached, so inserts cannot generate ids", "npm run db:push");
    continue;
  }
  // Identifiers cannot be bound as parameters; both names come from the database itself.
  const [{ max_id: maxId }] = await sql(`select coalesce(max(id), 0)::int as max_id from "${table}"`);
  const [{ last_value: lastValue, is_called: isCalled }] = await sql(
    `select last_value::int as last_value, is_called from ${seq.name}`,
  );
  const next = isCalled ? lastValue + 1 : lastValue;
  if (next <= maxId) {
    bad(
      `id sequence is behind: the next id would be ${next} but rows already go up to ${maxId}, so every insert fails with "duplicate key value violates unique constraint"`,
      `SELECT setval('${seq.name}', (SELECT max(id) FROM "${table}"));`,
    );
  } else {
    ok(`id sequence in step (next id ${next}, highest row ${maxId})`);
  }
}

console.log(
  problems
    ? `\n${problems} problem(s) found. Run the fix statements in the Neon SQL editor. If you change NEXT_PUBLIC_DATABASE_URL, redeploy: it is baked into the browser bundle at build time.`
    : "\nEverything looks healthy for this database.",
);
