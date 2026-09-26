import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Consejos",
  description: "Consejos de mantención y uso de bicicletas desde el taller Tropicleta en Atacama.",
};

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });

export default function ConsejosPage() {
  return (
    <>
      <PageHero kicker="Consejos" title="Desde el" highlight="taller." intro="Guías cortas para cuidar tu bici entre visitas al taller." />
      <section className="tp-section">
        <div className="tp-shell tp-post-grid">
          {posts.map((p) => (
            <Link key={p.slug} href={`/consejos/${p.slug}/`} className="tp-post-card">
              <span className="tp-meta">
                {fmt(p.date)} · {p.readingMinutes} min
              </span>
              <h2 className="tp-display">{p.title}</h2>
              <p>{p.excerpt}</p>
              <span className="tp-service-link" style={{ marginTop: 6 }}>
                Leer →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
