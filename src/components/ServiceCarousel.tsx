"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const slides = [
  { number: 1, title: "Mantención y servicios generales", href: "/servicios/#mantenciones" },
  { number: 2, title: "Ruedas y tubeless", href: "/servicios/#ruedas" },
  { number: 3, title: "Suspensiones", href: "/servicios/#suspensiones" },
  { number: 4, title: "Retiro y entrega", href: "#retiro-entrega" },
  { number: 5, title: "Ejes y rodamientos", href: "/servicios/#ejes" },
  { number: 6, title: "Transmisión", href: "/servicios/#transmision" },
  { number: 7, title: "Taller móvil para eventos", href: "/eventos/" },
  { number: 8, title: "Scooters eléctricos", href: "/servicios/#scooters" },
];

export function ServiceCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  function go(next: number) {
    const element = track.current;
    if (!element) return;
    const item = element.children[Math.max(0, Math.min(next, slides.length - 1))] as HTMLElement;
    element.scrollTo({ left: item.offsetLeft - (element.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <section className="tp-section tp-catalog-showcase" aria-labelledby="catalog-showcase-title">
    <div className="tp-shell">
      <div className="tp-carousel-heading">
        <div><span className="tp-kicker">Encuentra lo que necesita tu bici</span><h2 id="catalog-showcase-title" className="tp-display tp-section-title">Dale otra vuelta.</h2><p className="tp-section-intro">Explora nuestros servicios, pasa las láminas y arma tu cotización.</p></div>
        <div className="tp-carousel-controls"><button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Ver lámina anterior" aria-controls="service-carousel">←</button><button type="button" onClick={() => go(index + 1)} disabled={index === slides.length - 1} aria-label="Ver lámina siguiente" aria-controls="service-carousel">→</button></div>
      </div>
      <div id="service-carousel" className="tp-carousel-track" ref={track} role="region" aria-label="Láminas de servicios" tabIndex={0} onScroll={() => {
        const element = track.current;
        if (!element) return;
        const first = (element.children[0] as HTMLElement).offsetLeft;
        let closest = 0;
        Array.from(element.children).forEach((item, i) => { if (Math.abs((item as HTMLElement).offsetLeft - first - element.scrollLeft) < Math.abs((element.children[closest] as HTMLElement).offsetLeft - first - element.scrollLeft)) closest = i; });
        setIndex(element.scrollLeft >= element.scrollWidth - element.clientWidth - 2 ? slides.length - 1 : closest);
      }}>
        {slides.map(slide => <article key={slide.number} className="tp-carousel-card"><Link href={slide.href} className="tp-poster-crop" aria-label={`Ver ${slide.title}`}><Image src={`/catalogo/${slide.number}.jpg`} alt={`Catálogo Tropicleta: ${slide.title}`} width={720} height={1280} sizes="(max-width: 600px) 85vw, 380px" /></Link><div className="tp-carousel-caption"><h3>{slide.title}</h3><Link className="tp-btn tp-btn-primary" href={slide.href}>{slide.number === 7 ? "Cotizar mi evento" : slide.number === 4 ? "Ver retiro y entrega" : "Ir a servicios y cotización"} →</Link></div></article>)}
      </div>
      <div className="tp-carousel-footer"><p aria-live="polite">Lámina {index + 1} de {slides.length} · Desliza o usa las flechas</p><Link href="/servicios/">Ver todos los servicios y cotizar →</Link></div>
    </div>
  </section>;
}
