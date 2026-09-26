import type { Metadata } from "next";
import { BookingForm } from "@/components/forms/BookingForm";
import { getServiceCatalog } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solicitar hora",
  description: "Solicita hora en Tropicleta: elige el servicio, la fecha y si necesitas retiro a domicilio en Tierra Amarilla, Paipote o Copiapó.",
};

type Props = { searchParams: Promise<{ servicio?: string }> };

export default async function AgendarPage({ searchParams }: Props) {
  const { servicio } = await searchParams;
  const catalog = (await getServiceCatalog())
    .map((c) => ({ slug: c.slug, name: c.name, services: c.services.map((s) => ({ slug: s.slug, name: s.name })) }))
    .filter((c) => c.services.length);

  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", { timeZone: "America/Santiago" });

  return (
    <>
      <section className="tp-hero tp-page-hero">
        <div className="tp-shell" style={{ position: "relative", zIndex: 1 }}>
          <span className="tp-kicker">Agenda</span>
          <h1 className="tp-display">
            Solicita tu <span>hora.</span>
          </h1>
          <p className="tp-hero-copy">
            Cuéntanos qué necesitas y cuándo te acomoda. Te confirmamos por WhatsApp. El diagnóstico es gratuito.
          </p>
        </div>
      </section>

      <section className="tp-section" style={{ paddingTop: 48 }}>
        <div className="tp-shell tp-two-col">
          <div className="tp-panel">
            <BookingForm catalog={catalog} preselected={servicio} minDate={tomorrow} />
          </div>
          <aside className="tp-local-box tp-sticky">
            <span className="tp-kicker">Cómo funciona</span>
            <ul className="tp-local-list" style={{ marginBottom: 0 }}>
              <li className="tp-local-item">Envías tu solicitud con la fecha que prefieres.</li>
              <li className="tp-local-item">Te escribimos por WhatsApp para confirmar día y hora.</li>
              <li className="tp-local-item">Diagnóstico gratuito antes de cualquier trabajo.</li>
              <li className="tp-local-item">Garantía de 2 semanas en el servicio.</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
