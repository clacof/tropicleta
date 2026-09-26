import { PageHero } from "./PageHero";
import { Prose } from "./Prose";

/** Páginas de texto (garantía, términos, privacidad...). Los textos incluidos son DE EJEMPLO: revisarlos con asesoría legal. */
export function LegalPage({ kicker, title, highlight, intro, body, updated }: {
  kicker: string;
  title: string;
  highlight?: string;
  intro?: string;
  body: string;
  updated: string;
}) {
  return (
    <>
      <PageHero kicker={kicker} title={title} highlight={highlight} intro={intro} />
      <section className="tp-section">
        <div className="tp-shell">
          <p className="tp-meta" style={{ marginBottom: 24 }}>
            Última actualización: {updated}
          </p>
          <Prose text={body} />
        </div>
      </section>
    </>
  );
}
