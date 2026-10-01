import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/BookingForm";
import { getServiceCatalog } from "@/lib/queries";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Servicios y cotización", description: "Elige servicios para tu bicicleta o scooter, calcula el total estimado y envía tu cotización a Tropicleta." };
export default async function ServiciosPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  const catalog = (await getServiceCatalog()).filter(c => c.slug !== "retiro-entrega").map(c => ({ slug: c.slug, name: c.name, services: c.services.map(s => ({slug: s.slug, name: s.name, summary: s.summary, price: s.price, priceFrom: s.priceFrom, requiresDoubleSuspension:s.requiresDoubleSuspension, excludesDoubleSuspension:s.excludesDoubleSuspension, removed:s.removed, kind: s.kind, components: s.components, vehicles: s.vehicles, individuallySelectable: s.individuallySelectable, active: s.active})) }));
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  return <><section className="tp-hero tp-page-hero"><div className="tp-shell" style={{position:"relative",zIndex:1}}><span className="tp-kicker">Taller Tropicleta</span><h1 className="tp-display">Servicios y <span>cotización.</span></h1><p className="tp-hero-copy">Elige lo que necesita tu bici o scooter, revisa cómo se suma cada servicio y envía tu cotización. Si quieres, solicita tu hora en el mismo lugar.</p></div></section><section className="tp-section"><div className="tp-shell"><BookingForm catalog={catalog} preselected={servicio} minDate={tomorrow} /></div></section></>;
}
