import "server-only";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { fallbackCategories, fallbackFeatured } from "@/data/services-fallback";

const { services, serviceCategories, products, productCategories } = schema;

/* ---------------------------- Servicios ---------------------------- */

export async function getServiceCatalog() {
  const cats = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sort));
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.active, true))
    .orderBy(asc(services.sort), asc(services.name));
  return cats.map((c) => ({ ...c, services: rows.filter((s) => s.categoryId === c.id) }));
}

export async function getService(slug: string) {
  const rows = await db
    .select({ service: services, category: serviceCategories })
    .from(services)
    .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(and(eq(services.slug, slug), eq(services.active, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getActiveServiceSlugs() {
  return db.select({ slug: services.slug }).from(services).where(eq(services.active, true));
}

/** Home: 3 servicios destacados. Si la BD falla, usa los textos del sitio original. */
export async function getHomeServices() {
  try {
    const rows = await db
      .select({ service: services, category: serviceCategories })
      .from(services)
      .innerJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(and(eq(services.featured, true), eq(services.active, true)))
      .orderBy(asc(services.sort))
      .limit(3);
    const cats = await db.select().from(serviceCategories).orderBy(asc(serviceCategories.sort));
    if (!rows.length || !cats.length) throw new Error("sin datos");
    return {
      featured: rows.map(({ service, category }) => ({
        slug: service.slug,
        categorySlug: category.slug,
        categoryName: shortCategoryName(category.slug, category.name),
        name: service.name,
        price: service.price,
      })),
      categories: cats.map((c) => ({ slug: c.slug, name: c.name })),
    };
  } catch (e) {
    console.warn("[home] usando respaldo estático:", (e as Error).message);
    return { featured: fallbackFeatured, categories: fallbackCategories };
  }
}

// La home original usa "Mantención" (singular) como etiqueta de la tarjeta.
function shortCategoryName(slug: string, name: string) {
  return slug === "mantenciones" ? "Mantención" : name;
}

/* ---------------------------- Tienda ---------------------------- */

export type ProductSort = "recientes" | "precio-asc" | "precio-desc";

export async function getProductCategories() {
  return db.select().from(productCategories).orderBy(asc(productCategories.sort));
}

export async function getProducts(opts: { category?: string; sort?: ProductSort } = {}) {
  const order =
    opts.sort === "precio-asc"
      ? asc(products.price)
      : opts.sort === "precio-desc"
        ? desc(products.price)
        : desc(products.createdAt);

  const where = [eq(products.active, true)];
  if (opts.category) {
    const cat = await db.select().from(productCategories).where(eq(productCategories.slug, opts.category)).limit(1);
    if (!cat[0]) return [];
    where.push(eq(products.categoryId, cat[0].id));
  }
  return db.select().from(products).where(and(...where)).orderBy(order);
}

export async function getProduct(slug: string) {
  const rows = await db
    .select({ product: products, category: productCategories })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getFeaturedProducts(limit = 4) {
  try {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.featured, true), eq(products.active, true), gt(products.stock, 0)))
      .orderBy(desc(products.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getProductsByIds(ids: number[]) {
  if (!ids.length) return [];
  return db.select().from(products).where(and(inArray(products.id, ids), eq(products.active, true)));
}
