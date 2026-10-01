import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import type { DB } from "../src/db/client";
import { completeCatalog } from "../src/db/catalog";
import { seedServices, seedProducts } from "../src/db/seed-data";
import { matchesSearch } from "../src/lib/catalog-search";
import { officialServices, excludedServiceSlugs } from "../src/data/official-services";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    const first = await completeCatalog(db as unknown as DB);
    assert.equal(first.services, 0);
    assert.equal(first.drafts, seedProducts.length);
    const services = await db.select().from(schema.services);
    const categories = await db.select().from(schema.serviceCategories);
    const active = services.filter(s => s.active);
    assert.equal(active.length, officialServices.length - 4 + 3); // Cuatro packs en borrador; tres componentes nuevos confirmados.
    assert.ok(excludedServiceSlugs.every(slug => !active.some(s => s.slug === slug)));
    for (const [, slug, name, price, summary] of officialServices) {
      const service = services.find((s) => s.slug === slug)!;
      assert.equal(service.name, name);
      assert.equal(service.price, price);
      assert.equal(service.summary, summary);
      assert.equal(service.duration, null);
      if (slug !== "retiro-y-entrega") assert.equal(service.priceFrom, false);
    }
    const products = await db.select().from(schema.products);
    const raceLub = products.find((p) => p.slug === "sellador-race-lub-250-ml")!;
    assert.ok(raceLub);
    assert.equal(raceLub.stock, 6);
    assert.equal(raceLub.price, 10000);
    assert.equal(raceLub.active, true);
    assert.deepEqual(raceLub.images, ["/productos/sellador-race-lub-250-ml.png"]);
    assert.ok(products.filter((p) => p.id !== raceLub.id).every((p) => !p.active && p.stock === 0 && p.price === 0));
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
    await db.update(schema.services).set({slug:"camara-scooter-editada",name:"Cambio de cámara de scooter"}).where(eq(schema.services.slug,"pinchazo-scooter"));
    await completeCatalog(db as unknown as DB);
    assert.equal((await db.select().from(schema.services).where(eq(schema.services.slug,"pinchazo-scooter"))).length,0,"No recrear la URL ni el nombre antiguo tras editar el servicio");
    const [renamed]=await db.select().from(schema.services).where(eq(schema.services.slug,"camara-scooter-editada"));
    assert.equal(renamed.name,"Cambio de cámara de scooter");
    const [frontWheel]=await db.select().from(schema.services).where(eq(schema.services.slug,"armado-de-rueda"));
    await db.update(schema.services).set({price:23456}).where(eq(schema.services.id,frontWheel.id));
    await db.delete(schema.services).where(eq(schema.services.slug,"armado-rueda-trasera"));
    await client.exec(await readFile("drizzle/0015_wheel_specific_services.sql","utf8"));
    const [rearWheel]=await db.select().from(schema.services).where(eq(schema.services.slug,"armado-rueda-trasera"));
    assert.equal(rearWheel.price,23456,"La opción trasera copia el precio individual vigente");
    assert.equal((await db.select().from(schema.services).where(eq(schema.services.id,frontWheel.id)))[0].price,23456);
    assert.equal(rearWheel.name,"Armado de rueda trasera");
    assert.equal(matchesSearch("SUSPENSION", "Suspensión de bicicleta"), true);
    assert.equal(matchesSearch("cadena seco", "Lubricante seco para cadena"), true);
    assert.equal(matchesSearch("luces", "Cadena"), false);
    console.log(`${first.services} servicios y ${first.drafts} borradores: integridad, idempotencia y búsqueda verificadas.`);
  } finally { await client.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
