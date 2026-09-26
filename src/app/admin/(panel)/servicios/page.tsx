import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { deleteService } from "@/actions/admin";
import { db, schema } from "@/db";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServiciosAdmin() {
  const rows = await db
    .select({ s: schema.services, c: schema.serviceCategories })
    .from(schema.services)
    .innerJoin(schema.serviceCategories, eq(schema.services.categoryId, schema.serviceCategories.id))
    .orderBy(asc(schema.serviceCategories.sort), asc(schema.services.sort));

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Servicios</h1>
        <Link className="tp-btn tp-btn-primary tp-btn-sm" href="/admin/servicios/nuevo/">
          Nuevo servicio
        </Link>
      </div>
      <p className="tp-muted tp-small">Los 3 marcados como destacados aparecen en la home. Sin precio = “A cotizar”.</p>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Categoría</th>
              <th className="num">Precio</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, c }) => (
              <tr key={s.id} style={s.active ? undefined : { opacity: 0.5 }}>
                <td>
                  <Link href={`/admin/servicios/${s.id}/`}>{s.name}</Link>
                  {s.featured && (
                    <span className="tp-badge tp-badge-orange" style={{ marginLeft: 8 }}>
                      Destacado
                    </span>
                  )}
                </td>
                <td>{c.name}</td>
                <td className="num">{s.price ? `${s.priceFrom ? "desde " : ""}${formatCLP(s.price)}` : "A cotizar"}</td>
                <td>{s.active ? "Activo" : "Oculto"}</td>
                <td className="num">
                  {s.active && (
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="tp-link-btn" type="submit">
                        Ocultar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
