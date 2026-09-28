import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export default async function ServicioAdmin({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const numId = Number(id);
  if (id !== "nuevo" && (!Number.isInteger(numId) || numId <= 0)) notFound();
  const categories = await db.select().from(schema.serviceCategories).orderBy(asc(schema.serviceCategories.sort));
  let service = null;
  if (id !== "nuevo") {
    [service] = await db.select().from(schema.services).where(eq(schema.services.id, numId)).limit(1);
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
