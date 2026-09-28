import type { Metadata } from "next";
import Link from "next/link";
import { CatalogIcon } from "@/components/CatalogIcon";
import { getServiceCatalog } from "@/lib/queries";
import { formatCLP } from "@/lib/format";
import { whatsappUrl, WA_COORDINAR } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Catálogo de servicios del taller Tropicleta en Tierra Amarilla: mantenciones, suspensiones, transmisión, frenos, ruedas, ejes, scooters eléctricos y retiro a domicilio.",
};

export default async function ServiciosPage() {
  const catalog = await getServiceCatalog();

  return (
    <>
      <section className="tp-hero tp-page-hero">
        <div className="tp-shell" style={{ position: "relative", zIndex: 1 }}>
          <span className="tp-kicker">Taller Tropicleta</span>
          <h1 className="tp-display">
            Catálogo de <span>servicios.</span>
          </h1>
          <p className="tp-hero-copy">
            Revisa lo que hacemos antes de coordinar tu atención. El diagnóstico es gratuito y los trabajos tienen 2
            semanas de garantía.
          </p>
          <div className="tp-actions">
            <Link className="tp-btn tp-btn-primary" href="/agendar/">
              Solicitar hora
            </Link>
            <a className="tp-btn tp-btn-secondary" href={WA_COORDINAR} target="_blank" rel="noopener">
              Coordinar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="tp-section">
        <div className="tp-shell">
          <nav className="tp-chip-nav" aria-label="Categorías de servicio">
            {catalog.map((c) => (
              <a key={c.slug} className="tp-chip" href={`#${c.slug}`}>
                <CatalogIcon slug={c.slug} size={16} />
                {c.name}
              </a>
            ))}
          </nav>

          <div className="tp-stack">
            {catalog.map((c) => (
              <section key={c.slug} id={c.slug} className="tp-category-wrap" style={{ marginTop: 0 }} aria-labelledby={`cat-${c.slug}`}>
                <h2 id={`cat-${c.slug}`} className="tp-display tp-category-heading" style={{ marginBottom: 6 }}>
                  <CatalogIcon slug={c.slug} size={28} />
                  {c.name}
                </h2>
                {c.description && (
                  <p className="tp-muted" style={{ marginBottom: 18 }}>
                    {c.description}
                  </p>
                )}

                {c.services.length > 0 ? (
                  <div className="tp-service-list">
                    {c.services.map((s) => (
                      <Link key={s.id} className="tp-service-row" href={`/servicios/${s.slug}/`}>
                        <div>
                          <h3>{s.name}</h3>
                          {s.summary && <p>{s.summary}</p>}
                        </div>
                        <div className="tp-row-price">
                          {s.price ? (
                            <>
                              {s.priceFrom && <small>Desde</small>}
                              {formatCLP(s.price)}
                            </>
                          ) : (
                            <span className="tp-quote">A cotizar</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="tp-muted">Consúltanos por este servicio.</p>
                )}

                <div className="tp-actions" style={{ marginTop: 18 }}>
                  <a
                    className="tp-btn tp-btn-secondary tp-btn-sm"
                    href={whatsappUrl(`Hola Tropicleta, quiero consultar por ${c.name.toLowerCase()}.`)}
                    target="_blank"
                    rel="noopener"
                  >
                    Consultar {c.name.toLowerCase()}
                  </a>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
