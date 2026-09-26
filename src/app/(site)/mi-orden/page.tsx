import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { OrderLookupForm } from "@/components/forms/OrderLookupForm";

export const metadata: Metadata = { title: "Seguimiento de compra", robots: { index: false } };

export default function MiOrdenPage() {
  return (
    <>
      <PageHero kicker="Tienda" title="Sigue tu" highlight="compra." intro="Ingresa el número de orden que te enviamos por correo y el email con que compraste." />
      <section className="tp-section" style={{ paddingTop: 48 }}>
        <div className="tp-shell" style={{ maxWidth: 560 }}>
          <div className="tp-panel">
            <OrderLookupForm />
          </div>
        </div>
      </section>
    </>
  );
}
