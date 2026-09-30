import Link from "next/link";
import Image from "next/image";
import { ServiceCarousel } from "@/components/ServiceCarousel";
import { getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import { site } from "@/data/site";
import { WA_CONSULTAR, WA_COORDINAR } from "@/lib/whatsapp";
import { WorkshopGallery } from "@/components/WorkshopGallery";
import { AnimatedEmblem } from "@/components/AnimatedEmblem";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BicycleStore",
  name: "Tropicleta",
  url: "https://tropicleta.com",
  logo: "https://tropicleta.com/brand/tropicleta-social.png",
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
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <div className="tp-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* ================= HERO ================= */}
      <section className="tp-hero tp-home-photo-hero" aria-labelledby="tp-main-title">
        <Image className="tp-hero-background" src="/taller/equipo-tropicleta.jpeg" alt="El equipo Tropicleta junto a su furgón en Atacama" fill sizes="100vw" preload />
        <div className="tp-shell">
          <div className="tp-hero-grid">
            <div>
              <div className="tp-hero-intro-brand"><AnimatedEmblem /><div className="tp-location">
                <span className="tp-location-dot" />
                {site.location}
              </div></div>

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
                  WhatsApp
                </a>
                <Link className="tp-btn tp-btn-secondary" href="/servicios/">
                  Cotizar servicios
                </Link>
                <Link className="tp-btn tp-btn-secondary" href="/tienda/">
                  Tienda
                </Link>
              </div>
            </div>

            <div className="tp-hero-showcase"><ServiceCarousel /></div>
          </div>
        </div>
      </section>

      <section className="tp-section tp-mobile-summary">
        <div className="tp-shell tp-mobile-summary-grid">
          <div><span className="tp-kicker">Taller móvil</span><h2 className="tp-display tp-section-title">Nos vemos en tu próxima ruta.</h2><p className="tp-section-intro">Llevamos la mecánica de Tropicleta a carreras, cicletadas y jornadas comunitarias en Atacama. Coordinamos el apoyo según las necesidades de tu evento.</p><Link className="tp-btn tp-btn-secondary" href="/eventos/">Conocer el taller móvil →</Link></div>
          <Link href="/eventos/" className="tp-mobile-summary-photo"><Image src="/taller/taller-movil-presentacion.jpeg" alt="Taller móvil Tropicleta: asistencia mecánica en terreno para eventos ciclistas" width={720} height={1056} sizes="(max-width: 700px) 80vw, 300px" /></Link>
        </div>
      </section>

      {/* ================= TIENDA ================= */}
      {featuredProducts.length > 0 && <section className="tp-section tp-shop">
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
                      <strong>Encuentra lo que necesita tu bicicleta</strong>
                      <br />
                      <br />
                      Escríbenos para consultar productos y disponibilidad.
                    </div>
                  </div>
                  <a className="tp-btn tp-btn-secondary" href={WA_CONSULTAR} target="_blank" rel="noopener">Consultar productos</a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* ================= CONVERSIÓN LOCAL ================= */}
      <WorkshopGallery />
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
