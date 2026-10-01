import { asc, count, eq } from "drizzle-orm";
import { CategoryRow } from "./CategoryForms";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
export async function CategoryManager({kind}:{kind:"producto"|"servicio"}) {
  await requireAdmin();
  const rows=kind==="producto"
    ? await db.select({c:schema.productCategories,n:count(schema.products.id)}).from(schema.productCategories).leftJoin(schema.products,eq(schema.products.categoryId,schema.productCategories.id)).groupBy(schema.productCategories.id).orderBy(asc(schema.productCategories.sort),asc(schema.productCategories.name))
    : await db.select({c:schema.serviceCategories,n:count(schema.services.id)}).from(schema.serviceCategories).leftJoin(schema.services,eq(schema.services.categoryId,schema.serviceCategories.id)).groupBy(schema.serviceCategories.id).orderBy(asc(schema.serviceCategories.sort),asc(schema.serviceCategories.name));
  return <><div className="tp-admin-title"><h1 className="tp-display">Categorías de {kind==="producto"?"productos":"servicios"}</h1></div><p className="tp-muted tp-small">El orden define cómo aparecen en el sitio, de menor a mayor.</p><div className="tp-panel">{rows.map(({c,n})=><CategoryRow key={c.id} kind={kind} category={c} count={n}/>)}<CategoryRow kind={kind}/></div></>;
}
