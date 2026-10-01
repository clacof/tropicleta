import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { removeService, restoreService } from "@/actions/admin";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PacksAdminPanel } from "@/components/admin/PacksAdminPanel";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServiciosAdmin({searchParams}:{searchParams:Promise<{quitados?:string}>}) {
  await requireAdmin();
  const rows = await db
    .select({ s: schema.services, c: schema.serviceCategories })
    .from(schema.services)
    .innerJoin(schema.serviceCategories, eq(schema.services.categoryId, schema.serviceCategories.id))
    .orderBy(asc(schema.serviceCategories.sort), asc(schema.services.sort));

  const showRemoved = (await searchParams).quitados === "1";
  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Servicios</h1>
        <Link className="tp-btn tp-btn-primary tp-btn-sm" href="/admin/servicios/nuevo/">
          Nuevo servicio
        </Link>
      </div>
      <Link className="tp-btn tp-btn-ghost tp-btn-sm" href={showRemoved?"/admin/servicios/":"/admin/servicios/?quitados=1"}>{showRemoved?"Volver al catálogo":"Ver quitados / recuperar"}</Link>
      <section className="tp-panel"><h2>Vehículos</h2><p className="tp-hint">Añade o quita vehículos y configura sus servicios y packs.</p><Link className="tp-btn tp-btn-secondary tp-btn-sm" href="/admin/servicios/vehiculos/">Configurar vehículos</Link></section>
      <PacksAdminPanel catalog={rows.map(({s})=>s)} showRemoved={showRemoved} />
      <h2>Servicios individuales</h2>
      <p className="tp-muted tp-small">Edita servicios, paquetes, vehículos y componentes desde cada ficha. Sin precio = “A cotizar”.</p>
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
            {rows.filter(({s})=>s.kind !== "package" && s.removed === showRemoved).map(({ s, c }) => (
              <tr key={s.id} style={s.active ? undefined : { opacity: 0.5 }}>
                <td>
                  <Link href={`/admin/servicios/${s.id}/`}>{s.name}</Link>
                  {s.kind === "package" && <span className="tp-badge" style={{marginLeft:8}}>Paquete · {s.components.length ? `${s.components.length} componentes` : "Por definir"}</span>}
                  {s.featured && (
                    <span className="tp-badge tp-badge-orange" style={{ marginLeft: 8 }}>
                      Destacado
                    </span>
                  )}
                </td>
                <td>{c.name}</td>
                <td className="num">{s.price ? `${s.priceFrom ? "desde " : ""}${formatCLP(s.price)}` : "A cotizar"}</td>
                <td>{s.removed?"Quitado":s.active ? "Activo" : "Oculto"}</td>
                <td className="num">
                    <form action={s.removed?restoreService:removeService}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmSubmit message={s.removed?`¿Recuperar “${s.name}” como borrador?`:`¿Quitar “${s.name}”? Podrás recuperarlo y conservarás el historial.`}>{s.removed?"Recuperar":"Quitar"}</ConfirmSubmit>
                    </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
