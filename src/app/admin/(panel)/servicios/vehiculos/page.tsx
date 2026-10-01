import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { VehicleCatalog } from "@/components/admin/VehicleCatalog";
import { db,schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
export const metadata:Metadata={title:"Vehículos del cotizador"};
export default async function Vehicles(){await requireAdmin();const services=await db.select().from(schema.services).orderBy(asc(schema.services.kind),asc(schema.services.name));return <><Link href="/admin/servicios/">← Servicios</Link><div className="tp-admin-title"><h1 className="tp-display">Vehículos del cotizador</h1></div><VehicleCatalog services={services}/></>;}
