import type { Metadata } from "next";
import { asc, count, eq } from "drizzle-orm";
import { CategoryRow } from "@/components/admin/CategoryForms";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriasAdmin() {
  await requireAdmin();
  const pc = schema.productCategories;
  const sc = schema.serviceCategories;
  const [productCats, serviceCats] = await Promise.all([
    db
      .select({ c: pc, n: count(schema.products.id) })
      .from(pc)
      .leftJoin(schema.products, eq(schema.products.categoryId, pc.id))
      .groupBy(pc.id)
      .orderBy(asc(pc.sort), asc(pc.name)),
    db
      .select({ c: sc, n: count(schema.services.id) })
      .from(sc)
      .leftJoin(schema.services, eq(schema.services.categoryId, sc.id))
      .groupBy(sc.id)
      .orderBy(asc(sc.sort), asc(sc.name)),
  ]);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Categorías</h1>
      </div>
      <p className="tp-muted tp-small">
        El orden (número) define cómo aparecen en el sitio, de menor a mayor. El slug de servicios coincide con las anclas de /servicios/.
      </p>

      <h2 className="tp-display tp-category-heading">Tienda</h2>
      <div className="tp-panel" style={{ marginBottom: 30 }}>
        {productCats.map(({ c, n }) => (
          <CategoryRow key={c.id} kind="producto" category={c} count={n} />
        ))}
        <CategoryRow kind="producto" />
      </div>

      <h2 className="tp-display tp-category-heading">Servicios</h2>
      <div className="tp-panel">
        {serviceCats.map(({ c, n }) => (
          <CategoryRow key={c.id} kind="servicio" category={c} count={n} />
        ))}
        <CategoryRow kind="servicio" />
      </div>
    </>
  );
}
