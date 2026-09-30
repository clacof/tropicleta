"use client";

import Image from "next/image";
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

export function MobileWorkshopGallery() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touch = useRef<{x:number;y:number} | null>(null);
  const go = (direction: number) => setIndex(current => (current + direction + videos.length) % videos.length);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    const stop = () => setPaused(true);
    window.addEventListener("blur", stop);
    return () => { media.removeEventListener("change", update); window.removeEventListener("blur", stop); };
  }, []);
  useEffect(() => {
    if (paused || interacting || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) setIndex(current => (current + 1) % videos.length); }, 8500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reducedMotion, index]);
  return <section className="tp-section tp-workshop tp-instagram-gallery" aria-labelledby="mobile-workshop-videos">
    <div className="tp-shell">
      <div className="tp-video-heading"><div><h2 id="mobile-workshop-videos">El taller en acción</h2><p>Eventos, rutas y mecánica comunitaria en Atacama.</p></div>
        <div className="tp-single-controls"><button type="button" onClick={() => go(-1)} aria-label="Video anterior">←</button><span aria-live={paused || interacting ? "polite" : "off"}>{index + 1} / {videos.length}</span><button type="button" onClick={() => go(1)} aria-label="Video siguiente">→</button></div>
      </div>
      <p className="tp-swipe-hint">Desliza para ver más videos →</p>
      <div className="tp-video-stage" tabIndex={0} aria-label="Videos del taller móvil" aria-roledescription="carrusel"
        onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
        onTouchStart={event => { const point = event.touches[0]; touch.current = { x:point.clientX,y:point.clientY }; setInteracting(true); }}
        onTouchEnd={event => { const start = touch.current; const end = event.changedTouches[0]; if (start && Math.abs(end.clientX - start.x) > 45 && Math.abs(end.clientX - start.x) > Math.abs(end.clientY - start.y)) go(end.clientX < start.x ? 1 : -1); touch.current = null; setInteracting(false); }}
        onTouchCancel={() => { touch.current = null; setInteracting(false); }}
        onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); } }}
        >
        {[-1,0,1].map(offset => {
          const video = videos[(index + offset + videos.length) % videos.length];
          const url = `https://www.instagram.com/${"type" in video ? video.type : "reel"}/${video.id}/`;
          return <article className={`tp-video-slide tp-instagram-post ${offset === 0 ? "is-active" : offset < 0 ? "is-previous" : "is-next"}`} key={`${offset}-${video.id}`} aria-hidden={offset !== 0} inert={offset !== 0}>
            <div className="tp-instagram-post-header"><Image src="/brand/mascota-oficial.webp" alt="" width={32} height={32} /><span><strong>tropicleta</strong><small>Tierra Amarilla · Atacama</small></span><span className="tp-instagram-open" aria-hidden="true">↗</span></div>
            <div className="tp-video-player"><iframe src={`${url}embed/`} title={video.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" loading={offset === 0 ? "eager" : "lazy"} tabIndex={offset === 0 ? 0 : -1} /></div>
            <div className="tp-workshop-caption">
              <span className="tp-instagram-post-link">{offset === 0 ? "En terreno con Tropicleta" : "Más historias en terreno"}</span><h3>{video.title}</h3><p>{video.description}</p>
              {offset === 0 && <a className="tp-mobile-video-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${video.title} en Instagram`}>Ver en Instagram ↗</a>}
            </div>
          </article>;
        })}
      </div>
      <div className="tp-video-playback"><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? "Reanudar carrusel" : "Pausar carrusel"}</button></div>
    </div>
  </section>;
}
