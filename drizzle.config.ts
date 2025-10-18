import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
throw new Error("DATABASE_URL is not defined");
}

export default {
  schema: "./src/lib/core/db/schema",
  dialect: "postgresql",
  out: "./src/lib/core/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  }
} satisfies Config;