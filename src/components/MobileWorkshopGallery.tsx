"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const videos = [
  { id: "Dcran3kSBDX", title: "Mecánica exprés en Little MTB", description: "Ajustes en terreno y apoyo a los ciclistas junto a Academia ROTS y Club Deportivo Camélidos." },
  { id: "DcrXM9jSCuU", title: "Una jornada en Little MTB", description: "Bicicletas, familias y comunidad compartiendo una nueva experiencia sobre dos ruedas." },
  { id: "DcaRGHSNapo", title: "Tropicleteros en Atacama Desert Race", description: "Los momentos de un encuentro que nos reunió en el desierto de Atacama." },
  { id: "DcaHBq6NfhB", title: "Así vivimos Atacama Desert Race", description: "Un recorrido por la jornada organizada por Team Mugres." },
  { id: "Db0qbwOx5x9", title: "Reconocimiento de la carrera", description: "En ruta durante el reconocimiento de Atacama Desert Race." },
  { id: "DbgaWlXxZdZ", title: "Mecánica en Complejo Candelaria", description: "Ajustes gratuitos para acompañar una jornada deportiva de la comunidad." },
  { id: "DZNK5z0RR43", title: "Mecánica comunitaria en El Escorial", description: "Una jornada de apoyo a las bicicletas de Tierra Amarilla junto a la Oficina de Juventudes, Cultura y Patrimonio." },
  { id: "DS0YoW-Ehje", title: "Mecánica exprés junto a PedaleAtacama", description: "Apoyo mecánico en el punto de encuentro de una ruta recreativa organizada por PedaleAtacama." },
  { id: "DOEDDGrjdsZ", type: "p", title: "Taller móvil en Cumbres de Atacama", description: "Mecánica en terreno junto a Perros Deache, acompañando a los corredores en Cumbres de Atacama." },
];

function processEmbeds() {
  const instagram = (window as Window & { instgrm?: { Embeds: { process: () => void } } }).instgrm;
  instagram?.Embeds.process();
}

export function MobileWorkshopGallery() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  function go(direction: number) {
    const element = track.current;
    if (!element) return;
    const next = Math.max(0, Math.min(videos.length - 1, index + direction));
    const card = element.children[next] as HTMLElement;
    element.scrollTo({ left: card.offsetLeft - (element.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  useEffect(processEmbeds, []);
  return <section className="tp-section tp-workshop" aria-labelledby="mobile-workshop-videos">
    <div className="tp-shell">
      <div className="tp-video-heading"><div><h2 id="mobile-workshop-videos">El taller en acción</h2><p>Eventos, rutas y mecánica comunitaria en Atacama.</p></div>
        <div className="tp-single-controls"><button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Video anterior">←</button><span aria-live="polite">{index + 1} / {videos.length}</span><button type="button" onClick={() => go(1)} disabled={atEnd} aria-label="Video siguiente">→</button></div>
      </div>
      <p className="tp-swipe-hint">Desliza para ver más videos →</p>
      <div className="tp-mobile-video-grid" ref={track} tabIndex={0} aria-label="Videos del taller móvil" aria-roledescription="carrusel"
        onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); } }}
        onScroll={event => { const element = event.currentTarget; const first = element.children[0] as HTMLElement; const width = first.getBoundingClientRect().width + 24; setIndex(Math.min(videos.length - 1, Math.round(element.scrollLeft / width))); setAtEnd(element.scrollLeft >= element.scrollWidth - element.clientWidth - 2); }}>
        {videos.map(video => {
          const url = `https://www.instagram.com/${"type" in video ? video.type : "reel"}/${video.id}/`;
          return <article className="tp-mobile-video-card" key={video.id}>
            <div className="tp-mobile-video-embed">
              <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14">
                <a href={url} target="_blank" rel="noopener noreferrer"><span className="tp-video-play" aria-hidden="true">▶</span><strong>{video.title}</strong><span>Ver video en Instagram ↗</span></a>
              </blockquote>
            </div>
            <div className="tp-workshop-caption">
              <h3>{video.title}</h3><p>{video.description}</p>
              <a className="tp-mobile-video-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${video.title} en Instagram`}>Ver en Instagram ↗</a>
            </div>
          </article>;
        })}
      </div>
    </div>
    <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" onReady={processEmbeds} />
  </section>;
}
