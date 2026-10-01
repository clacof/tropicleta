import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

type Props = { params: Promise<{ id: string }>; searchParams:Promise<{dependencias?:string;recuperacion?:string}>; packMode?:boolean };

export default async function ServicioAdmin({ params, searchParams, packMode = false }: Props) {
  await requireAdmin();
  const { id } = await params;
  const numId = Number(id);
  if (id !== "nuevo" && (!Number.isInteger(numId) || numId <= 0)) notFound();
  const categories = await db.select().from(schema.serviceCategories).orderBy(asc(schema.serviceCategories.sort));
  let service = null;
  if (id !== "nuevo") {
    [service] = await db.select().from(schema.services).where(eq(schema.services.id, numId)).limit(1);
    if (!service) notFound();
    if (packMode && service.kind !== "package") notFound();
  }
  return (
    <>
      <nav className="tp-breadcrumb">
        <Link href="/admin/servicios/">{packMode?"Servicios · Packs":"Servicios"}</Link>
        <span>/</span>
        <span>{service?.name ?? "Nuevo"}</span>
      </nav>
      <div className="tp-admin-title">
        <h1 className="tp-display">{packMode?(service?"Editar pack de servicios":"Nuevo pack de servicios"):(service ? "Editar servicio" : "Nuevo servicio")}</h1>
      </div>
      {(await searchParams).dependencias && <p className="tp-alert" role="alert">Este servicio está vinculado a un pack. Quita primero esa referencia de los packs que lo utilizan.</p>}
      {(await searchParams).recuperacion && <p className="tp-alert" role="alert">No se puede recuperar este pack todavía: recupera primero sus componentes y revisa sus referencias.</p>}
      {service?.removed ? <p className="tp-alert">Este servicio fue quitado. Recupéralo desde el listado antes de editarlo.</p> : <ServiceForm quoteVehicles={await db.select().from(schema.quoteVehicles).where(eq(schema.quoteVehicles.removed,false)).orderBy(asc(schema.quoteVehicles.sort))} service={service} categories={categories} packMode={packMode} services={await db.select().from(schema.services).orderBy(asc(schema.services.sort))} />}
    </>
  );
}
