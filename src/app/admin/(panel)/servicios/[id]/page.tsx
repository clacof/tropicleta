import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { db, schema } from "@/db";

type Props = { params: Promise<{ id: string }> };

export default async function ServicioAdmin({ params }: Props) {
  const { id } = await params;
  const categories = await db.select().from(schema.serviceCategories).orderBy(asc(schema.serviceCategories.sort));
  let service = null;
  if (id !== "nuevo") {
    [service] = await db.select().from(schema.services).where(eq(schema.services.id, Number(id))).limit(1);
    if (!service) notFound();
  }
  return (
    <>
      <nav className="tp-breadcrumb">
        <Link href="/admin/servicios/">Servicios</Link>
        <span>/</span>
        <span>{service?.name ?? "Nuevo"}</span>
      </nav>
      <div className="tp-admin-title">
        <h1 className="tp-display">{service ? "Editar servicio" : "Nuevo servicio"}</h1>
      </div>
      <ServiceForm service={service} categories={categories} />
    </>
  );
}
