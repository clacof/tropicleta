import { defineConfig } from "drizzle-kit";

// Carga .env.local (Node ≥ 20.12) para que drizzle-kit vea DATABASE_URL
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: (process.env.DATABASE_URL || process.env.POSTGRES_URL)! },
});
