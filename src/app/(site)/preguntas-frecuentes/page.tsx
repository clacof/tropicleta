import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { faqs } from "@/data/faq";
import { WA_CONSULTAR } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos tus dudas sobre el taller, retiro a domicilio, garantía y compras en Tropicleta.",
};

export default function FaqPage() {
  const groups = [...new Set(faqs.map((f) => f.group))];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero kicker="Ayuda" title="Preguntas" highlight="frecuentes." intro="Lo que más nos preguntan. Si no encuentras tu respuesta, escríbenos.">
        <a className="tp-btn tp-btn-primary" href={WA_CONSULTAR} target="_blank" rel="noopener">
          Preguntar por WhatsApp
        </a>
      </PageHero>
      <section className="tp-section">
        <div className="tp-shell" style={{ maxWidth: 860 }}>
          {groups.map((g) => (
            <div key={g} style={{ marginBottom: 34 }}>
              <h2 className="tp-display tp-category-heading">{g}</h2>
              <div className="tp-faq">
                {faqs
                  .filter((f) => f.group === g)
                  .map((f) => (
                    <details key={f.q}>
                      <summary>{f.q}</summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
