import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Server-only. The connection string carries the database password, so it is
// read from a variable without the NEXT_PUBLIC_ prefix and this module must
// never end up in a browser bundle. Components talk to the database through
// the server actions in app/actions/*, not through this client directly.
if (typeof window !== "undefined") {
  throw new Error(
    "utils/dbConfig was imported in the browser. Call a server action from app/actions instead."
  );
}

// NEXT_DATABASE_URL is the name this project uses; DATABASE_URL is accepted
// too so a Vercel/Neon integration that injects it works without renaming.
const databaseUrl = process.env.NEXT_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "NEXT_DATABASE_URL is not set. Add it to .env.local (locally) or to the host's environment variables before starting the app."
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
