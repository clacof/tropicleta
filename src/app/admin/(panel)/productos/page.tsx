import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { archiveProduct } from "@/actions/admin";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosAdmin() {
  await requireAdmin();
  const rows = await db
    .select({ p: schema.products, c: schema.productCategories })
    .from(schema.products)
    .leftJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
    .orderBy(desc(schema.products.active), desc(schema.products.createdAt));

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Productos</h1>
        <Link className="tp-btn tp-btn-primary tp-btn-sm" href="/admin/productos/nuevo/">
          Nuevo producto
        </Link>
      </div>
      {rows.some(({ p }) => !p.active && p.price === 0) && <div className="tp-draft-note">
        <strong>Productos preparados para completar</strong>
        <p>Las fichas con precio “Por definir” son borradores y no aparecen en la tienda. Abre cada producto, confirma su descripción, precio y stock, y marca “Publicado” cuando esté listo.</p>
      </div>}
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="num">Precio</th>
              <th className="num">Stock</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, c }) => (
              <tr key={p.id} style={p.active ? undefined : { opacity: 0.5 }}>
                <td>
                  <Link href={`/admin/productos/${p.id}/`}>{p.name}</Link>
                  {p.featured && (
                    <span className="tp-badge tp-badge-orange" style={{ marginLeft: 8 }}>
                      Destacado
                    </span>
                  )}
                </td>
                <td>{c?.name ?? "—"}</td>
                <td className="num">{p.price > 0 ? formatCLP(p.price) : "Por definir"}</td>
                <td className="num" style={p.stock === 0 ? { color: "#fca5a5" } : undefined}>
                  {p.stock}
                </td>
                <td>{p.active ? "Publicado" : p.price === 0 ? "Borrador" : "Archivado"}</td>
                <td className="num">
                  {p.active && (
                    <form action={archiveProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit message={`¿Archivar “${p.name}”? Dejará de verse en la tienda.`}>Archivar</ConfirmSubmit>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="tp-muted">
                  Aún no hay productos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
