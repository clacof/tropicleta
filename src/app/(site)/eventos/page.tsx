import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Taller móvil para eventos",
  description: "Llevamos el taller Tropicleta a cicletadas, carreras y eventos ciclistas en la Región de Atacama. Cotiza tu evento.",
};

// Contenido DUMMY: ajustar a lo que ofrece realmente el taller móvil.
const features = [
  { n: "01", t: "Asistencia en ruta", d: "Pinchazos, cadenas cortadas y ajustes de cambios y frenos durante todo el evento." },
  { n: "02", t: "Revisión de partida", d: "Chequeo rápido de seguridad a los participantes antes de la largada." },
  { n: "03", t: "Punto de inflado", d: "Estación de aire y sellante para que todos salgan con la presión correcta." },
  { n: "04", t: "Repuestos básicos", d: "Cámaras, parches, pastillas y cables para resolver en el momento." },
];

export default function EventosPage() {
  return (
    <>
      <PageHero
        kicker="Taller móvil"
        title="Llevamos el taller"
        highlight="a tu evento."
        intro="Cicletadas, carreras, travesías y eventos corporativos en la Región de Atacama. Nos instalamos con herramientas y repuestos para que nadie se quede abajo."
      >
        <a
          className="tp-btn tp-btn-primary"
          href={whatsappUrl("Hola Tropicleta, quiero cotizar el taller móvil para un evento.")}
          target="_blank"
          rel="noopener"
        >
          Cotizar por WhatsApp
        </a>
        <a className="tp-btn tp-btn-secondary" href="#cotizar">
          Formulario de cotización
        </a>
      </PageHero>

      <section className="tp-section">
        <div className="tp-shell">
          <span className="tp-kicker">Qué incluye</span>
          <h2 className="tp-display tp-section-title">Soporte completo</h2>
          <div className="tp-feature-grid" style={{ marginTop: 26 }}>
            {features.map((f) => (
              <div key={f.n} className="tp-feature">
                <div className="tp-feature-num">{f.n}</div>
                <h3 className="tp-display">{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-section tp-shop" id="cotizar">
        <div className="tp-shell tp-two-col">
          <div className="tp-panel">
            <span className="tp-kicker">Cotización</span>
            <h2 className="tp-display tp-category-heading">Cuéntanos de tu evento</h2>
            <ContactForm subject="eventos" />
          </div>
          <aside className="tp-local-box">
            <span className="tp-kicker">Ideal para</span>
            <ul className="tp-local-list" style={{ marginBottom: 0 }}>
              <li className="tp-local-item">Cicletadas familiares y municipales.</li>
              <li className="tp-local-item">Carreras de MTB y ruta.</li>
              <li className="tp-local-item">Travesías y cicloturismo.</li>
              <li className="tp-local-item">Actividades de bienestar en empresas.</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
