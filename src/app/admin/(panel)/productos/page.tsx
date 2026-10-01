import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { deleteProductPermanently, removeProduct, restoreProduct } from "@/actions/admin";


import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductosAdmin({searchParams}:{searchParams:Promise<{quitados?:string;bloqueado?:string;eliminado?:string}>}) {
  await requireAdmin();
  const rows = await db
    .select({ p: schema.products, c: schema.productCategories })
    .from(schema.products)
    .leftJoin(schema.productCategories, eq(schema.products.categoryId, schema.productCategories.id))
    .orderBy(desc(schema.products.active), desc(schema.products.createdAt));

  const params=await searchParams;
  const showRemoved = params.quitados === "1";


  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">{showRemoved?"Papelera de productos":"Productos"}</h1>
        <Link className="tp-btn tp-btn-primary tp-btn-sm" href="/admin/productos/nuevo/">
          Nuevo producto
        </Link>
      </div>
      <Link className="tp-btn tp-btn-secondary tp-btn-sm" href={showRemoved?"/admin/productos/":"/admin/productos/papelera/"}>{showRemoved?"Volver al catálogo":`Papelera de productos (${rows.filter(({p})=>p.removed).length})`}</Link>
      {showRemoved&&<p className="tp-hint">Recupera un producto o elimínalo definitivamente para liberar su URL. El borrado definitivo no se puede deshacer.</p>}
      {params.eliminado==="1"&&<p className="tp-alert" role="status">Producto eliminado definitivamente. Su URL ya está disponible.</p>}
      {params.bloqueado&&<p className="tp-alert" role="alert">No se puede eliminar: el producto debe estar en la papelera y no tener órdenes vinculadas. Puedes recuperarlo y cambiar su URL para liberar la actual.</p>}

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
            {rows.filter(({p})=>p.removed === showRemoved).map(({ p, c }) => (
              <tr key={p.id} style={p.active || p.removed ? undefined : { opacity: 0.5 }}>
                <td>
                  <Link href={`/admin/productos/${p.id}/`}>{p.name}</Link>
                  {showRemoved&&<small style={{display:"block"}}>URL: {p.slug}</small>}
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
                <td>{p.removed?"Quitado":p.active ? "Publicado" : p.price === 0 ? "Borrador" : "Archivado"}</td>
                <td className="num">
                    <form action={p.removed?restoreProduct:removeProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit message={p.removed?`¿Recuperar “${p.name}” como borrador?`:`¿Quitar “${p.name}”? Podrás recuperarlo y conservarás el historial.`}>{p.removed?"Recuperar":"Quitar"}</ConfirmSubmit>
                    </form>
                    {p.removed&&<form action={deleteProductPermanently}><input type="hidden" name="id" value={p.id}/><ConfirmSubmit message={`¿Eliminar definitivamente “${p.name}”? No se puede recuperar. Se liberará la URL ${p.slug}.`}>Eliminar definitivamente</ConfirmSubmit></form>}
                </td>
              </tr>
            ))}
            {!rows.some(({p})=>p.removed === showRemoved) && (
              <tr>
                <td colSpan={6} className="tp-muted">
                  {showRemoved?"La papelera de productos está vacía.":"Aún no hay productos. Crea el primero."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
