type Props = {
  kicker: string;
  title: string;
  highlight?: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
};

/** Hero de páginas interiores con el mismo fondo, kicker y tipografía de la home. */
export function PageHero({ kicker, title, highlight, intro, children }: Props) {
  return (
    <section className="tp-hero tp-page-hero">
      <div className="tp-shell" style={{ position: "relative", zIndex: 1 }}>
        <span className="tp-kicker">{kicker}</span>
        <h1 className="tp-display">
          {title} {highlight && <span>{highlight}</span>}
        </h1>
        {intro && <p className="tp-hero-copy">{intro}</p>}
        {children && <div className="tp-actions">{children}</div>}
      </div>
    </section>
  );
}
