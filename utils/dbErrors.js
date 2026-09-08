// Turns a failed Neon/Drizzle call into a sentence a person can act on.
//
// The neon-http driver throws NeonDbError. A Postgres failure carries the
// SQLSTATE in `code` (plus `detail`/`hint`); a transport failure wraps the
// fetch error in `sourceError` and a message that starts with
// "Error connecting to database". Server actions run this on the server and
// hand the sentence back to the browser, so the real reason reaches the toast
// instead of Next's generic "an error occurred" digest.

const POSTGRES_HINTS = {
  "23505":
    "The table's ID counter is behind the rows already in it, so every new row collides with an existing ID. Run `npm run db:check` for the one-line repair.",
  "23502": "The database rejected an empty required field.",
  "42P01":
    "That table does not exist in this database. Run `npm run db:push` against the same NEXT_DATABASE_URL the server uses.",
  "42703": "The table is missing a column the app expects. Run `npm run db:push` against this database.",
  "42501": "The database role in NEXT_DATABASE_URL is not allowed to write to this table.",
  "25006": "This connection is read-only (a read replica or read-only role), so nothing can be saved.",
  "28P01": "Database authentication failed: the password in NEXT_DATABASE_URL is wrong or was rotated.",
  "28000": "Database authentication failed: check the role and password in NEXT_DATABASE_URL.",
  "3D000": "The database named in NEXT_DATABASE_URL does not exist.",
  "57P01": "The database closed the connection. Try again in a moment.",
  "53300": "The database has too many open connections. Try again in a moment.",
};

const TRANSPORT_PATTERN = /Error connecting to database|Failed to fetch|NetworkError|Load failed|ECONN|ENOTFOUND/i;

export function describeDbError(error) {
  if (!error) return "Unknown database error.";

  const message = typeof error.message === "string" && error.message ? error.message : String(error);

  if (error.sourceError || TRANSPORT_PATTERN.test(message)) {
    const reason = (error.sourceError?.message ?? message).replace(/^Error connecting to database:\s*/i, "");
    return `Could not reach the database (${reason}). Check that NEXT_DATABASE_URL points at a live Neon endpoint.`;
  }

  const hint = POSTGRES_HINTS[error.code];
  const detail = typeof error.detail === "string" && error.detail ? ` ${error.detail}` : "";
  return hint ? `${message}.${detail} ${hint}` : `${message}${detail}`;
}
