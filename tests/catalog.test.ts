import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import type { DB } from "../src/db/client";
import { completeCatalog } from "../src/db/catalog";
import { seedServices, seedProducts } from "../src/db/seed-data";
import { matchesSearch } from "../src/lib/catalog-search";
import { officialServices } from "../src/data/official-services";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    const first = await completeCatalog(db as unknown as DB);
    assert.equal(first.services, seedServices.filter((s) => !officialServices.some((o) => o[1] === s.slug)).length);
    assert.equal(first.drafts, seedProducts.length);
    const services = await db.select().from(schema.services);
    const categories = await db.select().from(schema.serviceCategories);
    assert.ok(categories.every((c) => services.some((s) => s.categoryId === c.id)));
    assert.equal(services.filter((s) => s.price !== null).length, officialServices.length);
    for (const [, slug, name, price, summary] of officialServices) {
      const service = services.find((s) => s.slug === slug)!;
      assert.equal(service.name, name);
      assert.equal(service.price, price);
      assert.equal(service.summary, summary);
      assert.equal(service.duration, null);
    }
    const products = await db.select().from(schema.products);
    assert.ok(products.every((p) => !p.active && p.stock === 0 && p.price === 0));
    await db.update(schema.services).set({ price: 12345, summary: "Texto del taller", active: false }).where(eq(schema.services.slug, "mantencion-basica"));
    await db.update(schema.products).set({ price: 8900, stock: 7, active: true }).where(eq(schema.products.slug, products[0].slug));
    const again = await completeCatalog(db as unknown as DB);
    await migrate(db, { migrationsFolder: "./drizzle" });
    assert.deepEqual(again, { services: 0, drafts: 0 });
    const [service] = await db.select().from(schema.services).where(eq(schema.services.slug, "mantencion-basica"));
    assert.equal(service.price, 12345);
    assert.equal(service.summary, "Texto del taller");
    assert.equal(service.active, false);
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, products[0].id));
    assert.equal(product.stock, 7);
    assert.equal(product.price, 8900);
    assert.equal(product.active, true);
    assert.equal(matchesSearch("SUSPENSION", "Suspensión de bicicleta"), true);
    assert.equal(matchesSearch("cadena seco", "Lubricante seco para cadena"), true);
    assert.equal(matchesSearch("luces", "Cadena"), false);
    console.log(`${first.services} servicios y ${first.drafts} borradores: integridad, idempotencia y búsqueda verificadas.`);
  } finally { await client.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
