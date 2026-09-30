"use client";

import Script from "next/script";
import { useEffect } from "react";

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
  useEffect(processEmbeds, []);
  return <section className="tp-section tp-workshop" aria-labelledby="mobile-workshop-videos">
    <div className="tp-shell">
      <span className="tp-kicker">Taller móvil en acción</span>
      <h2 id="mobile-workshop-videos" className="tp-display tp-section-title">Historias fuera del taller</h2>
      <p className="tp-section-intro">Acompáñanos en eventos, rutas y jornadas de mecánica comunitaria. Así se vive Tropicleta en terreno.</p>
      <div className="tp-mobile-video-grid">
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
