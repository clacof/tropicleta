"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
const slides = [
  { number: 4, title: "Retiro y entrega", href: "/servicios/#retiro-entrega", cta: "Cotizar servicio y transporte" },
  { number: 1, title: "Servicios generales", href: "/servicios/#mantenciones" },
  { number: 8, title: "Scooters eléctricos", href: "/servicios/#scooters" },
  { number: 2, title: "Ruedas y tubeless", href: "/servicios/#ruedas" },
  { number: 3, title: "Suspensiones", href: "/servicios/#suspensiones" },
  { number: 5, title: "Ejes y rodamientos", href: "/servicios/#ejes" },
  { number: 6, title: "Transmisión", href: "/servicios/#transmision" },
];
export function ServiceCarousel() {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const go = (direction: number) => setIndex(current => (current + direction + slides.length) % slides.length);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || interacting || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(current => (current + 1) % slides.length); }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reducedMotion, index]);
  return <section className="tp-single-carousel" aria-label="Catálogo de servicios" aria-roledescription="carrusel"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); } }}>
    <div className="tp-single-controls">
      <button type="button" onClick={() => go(-1)} aria-label="Ver lámina anterior" aria-controls="service-carousel">←</button>
      <span aria-live={paused || interacting || reducedMotion ? "polite" : "off"}>{index + 1} / {slides.length} · {slides[index].title}</span>
      <button type="button" onClick={() => go(1)} aria-label="Ver lámina siguiente" aria-controls="service-carousel">→</button>
    </div>
    <div id="service-carousel" style={{ touchAction: "pan-y" }}
      onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; swiped.current = false; setInteracting(true); }}
      onTouchEnd={event => { const start = touch.current; const end = event.changedTouches[0]; if (start && Math.abs(end.clientX - start.x) > 45 && Math.abs(end.clientX - start.x) > Math.abs(end.clientY - start.y)) { go(end.clientX < start.x ? 1 : -1); swiped.current = true; } touch.current = null; setInteracting(false); }}
      onTouchCancel={() => { touch.current = null; setInteracting(false); }}
      onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}>
      {slides.map((slide, position) => <article key={slide.number} hidden={position !== index} className="tp-single-card" aria-label={position + 1 + " de " + slides.length + ": " + slide.title} aria-roledescription="lámina">
        <Link href={slide.href} className="tp-poster-crop" aria-label={"Ver " + slide.title}><Image src={"/catalogo/compacto/" + slide.number + ".jpg"} alt={"Catálogo Tropicleta: " + slide.title} fill sizes="(max-width: 600px) 90vw, 340px" loading={position === index ? "eager" : "lazy"} /></Link>
        <div className="tp-single-caption"><Link className="tp-btn tp-btn-primary" href={slide.href}>{slide.cta ?? "Ir a servicios y cotización"} →</Link></div>
      </article>)}
    </div>
    <div className="tp-single-footer"><Link href="/servicios/">Servicios y cotización →</Link>{!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? "Reanudar" : "Pausar"}</button>}</div>
  </section>;
}
