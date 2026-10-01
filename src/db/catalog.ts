import { sql } from "drizzle-orm";
import type { DB } from "./client";
import * as schema from "./schema";
import { seedProductCategories, seedProducts, seedServiceCategories, seedServices } from "./seed-data";
import { fallbackFeatured } from "../data/services-fallback";
import { excludedServiceSlugs } from "../data/official-services";

/** Completa el catálogo sin reemplazar precios, stock ni cambios del administrador. */
export async function completeCatalog(db: DB) {
  return db.transaction(async (tx) => {
    await tx.insert(schema.serviceCategories).values(seedServiceCategories.map((c, sort) => ({ ...c, sort })))
      .onConflictDoUpdate({ target: schema.serviceCategories.slug, set: {
        description: sql`coalesce(${schema.serviceCategories.description}, excluded.description)`,
      } });
    const categories = await tx.select().from(schema.serviceCategories);
    const services = seedServices.filter(s => !excludedServiceSlugs.includes(s.slug)).map((s, sort) => ({
      slug: s.slug, name: s.name, sort,
      categoryId: categories.find((c) => c.slug === s.cat)!.id,
      // Los únicos importes confirmados son los tres servicios del sitio original.
      price: fallbackFeatured.find((f) => f.slug === s.slug)?.price ?? null,
      featured: !!s.featured,
      summary: s.summary.replace(/\s*\(cada \d+ horas\)/g, ""),
      description: "El alcance del trabajo, los repuestos y el plazo se confirman al revisar tu bicicleta o scooter. Solicita un diagnóstico antes de coordinar el servicio.",
      active: true,
    }));
    // Migrations maintain the initial service catalog. Do not recreate an old URL
    // after its service was renamed in Admin (which would duplicate the service).
    const existingServices=await tx.select({id:schema.services.id}).from(schema.services).limit(1);
    const addedServices = existingServices.length?[]:await tx.insert(schema.services).values(services).onConflictDoNothing().returning({ id: schema.services.id });
    // Completa las fichas iniciales vacías sin modificar contenido ya escrito.
    for (const service of services) {
      await tx.update(schema.services).set({
        summary: sql`coalesce(${schema.services.summary}, ${service.summary})`,
        description: sql`coalesce(${schema.services.description}, ${service.description})`,
      }).where(sql`${schema.services.slug} = ${service.slug}`);
    }
    await tx.insert(schema.productCategories).values(seedProductCategories.map((c, sort) => ({ ...c, sort }))).onConflictDoNothing();
    const productCategories = await tx.select().from(schema.productCategories);
    const addedProducts = await tx.insert(schema.products).values(seedProducts.map((p) => ({
      slug: p.slug, name: p.name,
      categoryId: productCategories.find((c) => c.slug === p.cat)!.id,
      price: 0, stock: 0, active: false, featured: false,
      images: [`/productos/${p.slug}.svg`],
      description: "Ficha en preparación. Confirmar marca, medidas, compatibilidad, precio y disponibilidad antes de publicar. La ilustración es referencial.",
    }))).onConflictDoNothing().returning({ id: schema.products.id });
    return { services: addedServices.length, drafts: addedProducts.length };
  });
}
