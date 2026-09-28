/** Preparación de PostgreSQL durante el despliegue; nunca carga ventas o productos de ejemplo. */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";
import { fallbackCategories, fallbackFeatured } from "../data/services-fallback";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Configura DATABASE_URL en Vercel antes de publicar.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    await db.transaction(async (tx) => {
      await tx.insert(schema.serviceCategories).values(fallbackCategories.map((c, sort) => ({ ...c, sort }))).onConflictDoNothing();
      const categories = await tx.select().from(schema.serviceCategories);
      await tx.insert(schema.services).values(fallbackFeatured.map((s, sort) => ({
        slug: s.slug, name: s.name, price: s.price, featured: true, sort,
        categoryId: categories.find((c) => c.slug === s.categorySlug)!.id,
      }))).onConflictDoNothing();
    });
    console.log("Base de datos preparada; datos existentes conservados.");
  } finally {
    await pool.end();
  }
}

// Log completo: los errores de conexión de pg (AggregateError, SSL, DNS) suelen venir con `message` vacío
main().catch((error) => {
  const host = (() => { try { return new URL(process.env.DATABASE_URL ?? "").host; } catch { return "(DATABASE_URL inválida)"; } })();
  console.error(`[deploy] Falló la preparación de la BD (host: ${host})`);
  console.error(error);
  for (const e of error?.errors ?? []) console.error("  ↳", e?.code ?? "", e?.message ?? e);
  process.exitCode = 1;
});
