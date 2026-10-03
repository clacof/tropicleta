import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { deleteServicePermanently, removeService, restoreService } from "@/actions/admin";
import { serviceDeletionBlocker } from "@/lib/service-trash";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PacksAdminPanel } from "@/components/admin/PacksAdminPanel";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatCLP } from "@/lib/format";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServiciosAdmin({searchParams}:{searchParams:Promise<{quitados?:string;guardado?:string;bloqueado?:string;eliminado?:string}>}) {
  await requireAdmin();
  const rows = await db
    .select({ s: schema.services, c: schema.serviceCategories })
    .from(schema.services)
    .innerJoin(schema.serviceCategories, eq(schema.services.categoryId, schema.serviceCategories.id))
    .orderBy(asc(schema.serviceCategories.sort), asc(schema.services.sort));

  const params=await searchParams;
  const showRemoved = params.quitados === "1";
  const blockedService=rows.find(({s})=>s.id===Number(params.bloqueado))?.s;
  const blockReason=blockedService?serviceDeletionBlocker(blockedService,rows.map(({s})=>s),await db.select({serviceNames:schema.bookings.serviceNames,quoteSnapshot:schema.bookings.quoteSnapshot}).from(schema.bookings)):null;
  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">{showRemoved?"Papelera de servicios":"Servicios"}</h1>
        <Link className="tp-btn tp-btn-primary tp-btn-sm" href="/admin/servicios/nuevo/">
          Nuevo servicio
        </Link>
      </div>
      {params.guardado==="1"&&<p className="tp-alert" role="status">Servicio guardado. El listado ya muestra los nombres y precios actualizados.</p>}
      <Link className="tp-btn tp-btn-secondary tp-btn-sm" href={showRemoved?"/admin/servicios/":"/admin/servicios/papelera/"}>{showRemoved?"Volver al catálogo":`Papelera de servicios (${rows.filter(({s})=>s.removed).length})`}</Link>
      {showRemoved&&<p className="tp-hint">Los servicios quitados conservan su URL. Eliminarlos definitivamente libera esa URL y no se puede deshacer. Puedes recuperarlos como borrador.</p>}
      {params.eliminado==="1"&&<p className="tp-alert" role="status">Servicio eliminado definitivamente. Su URL ya está disponible.</p>}
      {blockReason&&<p className="tp-alert" role="alert">No se puede eliminar “{blockedService?.name}”: {blockReason}</p>}
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
              <tr key={s.id} style={s.active || s.removed ? undefined : { opacity: 0.5 }}>
                <td>
                  <Link href={`/admin/servicios/${s.id}/`}>{s.name}</Link>
                  {showRemoved&&<small style={{display:"block"}}>URL: {s.slug}</small>}
                  {s.kind === "package" && <span className="tp-badge" style={{marginLeft:8}}>Paquete · {s.components.length ? `${s.components.length} componentes` : "Por definir"}</span>}
                  {s.featured && (
                    <span className="tp-badge tp-badge-orange" style={{ marginLeft: 8 }}>
                      Destacado
                    </span>
                  )}
                </td>
                <td>{c.name}</td>
                <td className="num">{s.price!==null ? `${s.priceFrom ? "desde " : ""}${formatCLP(s.price)}` : "A cotizar"}</td>
                <td>{s.removed?"Quitado":s.active ? "Activo" : "Oculto"}</td>
                <td className="num">
                    <form action={s.removed?restoreService:removeService}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmSubmit message={s.removed?`¿Recuperar “${s.name}” como borrador?`:`¿Quitar “${s.name}”? Podrás recuperarlo y conservarás el historial.`}>{s.removed?"Recuperar":"Quitar"}</ConfirmSubmit>
                    </form>
                    {s.removed&&<form action={deleteServicePermanently}><input type="hidden" name="id" value={s.id}/><ConfirmSubmit message={`¿Eliminar definitivamente “${s.name}”? No se puede recuperar. Se liberará la URL ${s.slug}.`}>Eliminar definitivamente</ConfirmSubmit></form>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
