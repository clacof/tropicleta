/**
 *   npm run db:seed              → categorías, servicios y productos (contenido dummy editable)
 *   SEED_DEMO=1 npm run db:seed  → además reservas, órdenes y mensajes de ejemplo para el panel
 * Con DATABASE_URL usa Postgres; sin ella, la BD embebida (./.data/pglite).
 */
import { getDb, usingEmbeddedDb } from "./client";
import { seedDatabase } from "./seed-data";

async function main() {
  const db = getDb();
  if (usingEmbeddedDb()) {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as never, { migrationsFolder: "./drizzle" });
  }
  await seedDatabase(db, { demo: process.env.SEED_DEMO === "1" });
  console.info("✓ Seed listo");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
