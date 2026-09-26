import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { getFeaturedProducts, getHomeServices } from "@/lib/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import { site } from "@/data/site";
import { WA_CONSULTAR, WA_COORDINAR } from "@/lib/whatsapp";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BicycleStore",
  name: "Tropicleta",
  url: "https://tropicleta.com",
  telephone: "+" + site.whatsappNumber,
  areaServed: site.coverage,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tierra Amarilla",
    addressRegion: "Atacama",
    addressCountry: "CL",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ featured: featuredServices, categories }, featuredProducts] = await Promise.all([
    getHomeServices(),
    getFeaturedProducts(4),
  ]);

  return (
    <div className="tp-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ================= HERO ================= */}
      <section className="tp-hero" aria-labelledby="tp-main-title">
        <div className="tp-shell">
          <div className="tp-hero-grid">
            <div>
              <div className="tp-location">
                <span className="tp-location-dot" />
                {site.location}
              </div>

              <h1 id="tp-main-title" className="tp-display">
                Taller de bicicletas <span>hecho para rodar.</span>
              </h1>

              <p className="tp-hero-copy">
                Servicio técnico de bicicletas con atención coordinada en Tierra Amarilla, cerca de Paipote y
                Copiapó. Mantenciones, ajustes y servicios especializados.
              </p>

              <div className="tp-actions">
                <a
                  className="tp-btn tp-btn-primary"
                  href={WA_COORDINAR}
                  target="_blank"
                  rel="noopener"
                  aria-label="Coordinar servicio con Tropicleta por WhatsApp"
                >
                  Coordinar por WhatsApp
                </a>
                <Link className="tp-btn tp-btn-secondary" href="/servicios/">
                  Ver servicios
                </Link>
                <Link className="tp-btn tp-btn-secondary" href="/tienda/">
                  Ir a la tienda
                </Link>
              </div>
            </div>

            <aside className="tp-trust" aria-label="Información de atención Tropicleta">
              <div className="tp-trust-item">
                <div className="tp-trust-label">Diagnóstico</div>
                <div className="tp-trust-value">Gratuito</div>
              </div>
              <div className="tp-trust-item">
                <div className="tp-trust-label">Garantía</div>
                <div className="tp-trust-value">2 semanas</div>
              </div>
              <div className="tp-trust-item">
                <div className="tp-trust-label">Atención</div>
                <div className="tp-trust-value">Coordinación previa</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= SERVICIOS DESTACADOS ================= */}
      <section className="tp-section">
        <div className="tp-shell">
          <span className="tp-kicker">Taller Tropicleta</span>
          <h2 className="tp-display tp-section-title">Servicios destacados</h2>
          <p className="tp-section-intro">
            Una selección de nuestros servicios. Puedes revisar el catálogo completo antes de coordinar tu atención.
          </p>

          <div className="tp-service-grid">
            {featuredServices.map((s, i) => (
              <Link key={s.slug} className="tp-service-card" href={`/servicios/${s.slug}/`}>
                <div>
                  <div className="tp-service-number">
                    {String(i + 1).padStart(2, "0")} / {s.categoryName.toUpperCase()}
                  </div>
                  <h3 className="tp-display tp-service-name">{s.name}</h3>
                </div>
                <div>
                  <div className="tp-price">{s.price ? formatCLP(s.price) : "A cotizar"}</div>
                  <div className="tp-service-link">Ver detalles →</div>
                </div>
              </Link>
            ))}
          </div>

          {/* CATEGORÍAS */}
          <div className="tp-category-wrap">
            <h3 className="tp-display tp-category-heading">Explora el catálogo</h3>
            <div className="tp-category-grid">
              {categories.map((c) => (
                <Link key={c.slug} className="tp-category" href={`/servicios/#${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="tp-actions tp-category-actions">
              <Link className="tp-btn tp-btn-primary" href="/servicios/">
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TIENDA ================= */}
      <section className="tp-section tp-shop">
        <div className="tp-shell">
          <div className="tp-shop-layout">
            <div>
              <span className="tp-kicker">Tienda Tropicleta</span>
              <h2 className="tp-display tp-section-title">Productos seleccionados</h2>
              <p className="tp-section-intro">
                Una selección pequeña de productos para ciclistas, elegidos para complementar el trabajo del taller.
              </p>
              <div className="tp-actions">
                <Link className="tp-btn tp-btn-primary" href="/tienda/">
                  Ver tienda
                </Link>
              </div>
            </div>

            <div className="tp-shop-panel">
              {featuredProducts.length > 0 ? (
                <div className="tp-mini-products">
                  {featuredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="tp-shop-placeholder">
                    <div>
                      <strong>Espacio preparado para productos destacados</strong>
                      <br />
                      <br />
                      Se conectará directamente con la tienda.
                    </div>
                  </div>
                  <p className="tp-shop-note">Este bloque desaparece cuando conectemos los productos reales.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONVERSIÓN LOCAL ================= */}
      <section className="tp-section">
        <div className="tp-shell">
          <div className="tp-local-box">
            <span className="tp-kicker">Taller local</span>
            <h2 className="tp-display tp-section-title">Tu bici, en buenas manos</h2>
            <p className="tp-section-intro">
              Atendemos con coordinación previa desde Tierra Amarilla y contamos con retiro y entrega en sectores
              definidos de Tierra Amarilla, Paipote y Copiapó.
            </p>
            <ul className="tp-local-list">
              <li className="tp-local-item">Diagnóstico gratuito.</li>
              <li className="tp-local-item">Atención con coordinación previa.</li>
              <li className="tp-local-item">Servicios para bicicletas y scooters eléctricos.</li>
              <li className="tp-local-item">Taller móvil para eventos ciclistas en la Región de Atacama.</li>
            </ul>
            <div className="tp-actions">
              <a className="tp-btn tp-btn-primary" href={WA_CONSULTAR} target="_blank" rel="noopener">
                Hablar con Tropicleta
              </a>
              <Link className="tp-btn tp-btn-secondary" href="/contacto/">
                Ver contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
