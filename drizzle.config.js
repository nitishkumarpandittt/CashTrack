import "dotenv/config";

const url = process.env.NEXT_DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "NEXT_DATABASE_URL is not set. Add it to .env.local before running drizzle-kit."
  );
}

const config = {
  dialect: "postgresql",
  schema: "./utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: { url },
};

export default config;
