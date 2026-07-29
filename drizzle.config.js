import "dotenv/config";

const url = process.env.NEXT_PUBLIC_DATABASE_URL;

if (!url) {
  throw new Error(
    "NEXT_PUBLIC_DATABASE_URL is not set. Add it to .env.local before running drizzle-kit."
  );
}

export default {
  dialect: "postgresql",
  schema: "./utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: { url },
};
