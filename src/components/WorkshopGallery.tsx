import Image from "next/image";
const stories = [
  { image: "suspension", title: "Listas para volver al cerro", text: "Una Scott Spark RC lista para su próxima ruta.", post: "DRp1XCXksWw", position: "50% 40%" },
  { image: "rodamientos", title: "Cuidado hasta el último detalle", text: "Servicio al cuadro, limpieza y renovación de grasas.", post: "DcwH1-hx8LU", position: "50% 88%" },
  { image: "chopper", title: "Cada bicicleta tiene su historia", text: "Una chopper que vuelve a rodar y un mensaje que nos alegra el día.", post: "Dch4ZgGNc38", position: "50% 18%" },
];
export function WorkshopGallery() {
  return <section className="tp-section tp-workshop tp-instagram-gallery" aria-labelledby="workshop-title"><div className="tp-shell">
    <div className="tp-workshop-heading"><div><span className="tp-kicker">Desde nuestro Instagram</span><h2 id="workshop-title" className="tp-display tp-section-title">Bicicletas mueven historias.</h2><p className="tp-section-intro">Bicis, detalles del taller y personas que vuelven a pedalear. Así se vive Tropicleta.</p></div><a className="tp-btn tp-btn-secondary" href="https://www.instagram.com/tropicleta/" target="_blank" rel="noopener noreferrer">Seguir a @tropicleta ↗</a></div>
    <div className="tp-workshop-grid">{stories.map(story => <a key={story.post} className="tp-workshop-card tp-instagram-post" href={"https://www.instagram.com/tropicleta/reel/" + story.post + "/"} target="_blank" rel="noopener noreferrer">
      <div className="tp-instagram-post-header"><Image src="/brand/mascota-oficial.webp" alt="" width={32} height={32} /><span><strong>tropicleta</strong><small>Tierra Amarilla · Atacama</small></span><span className="tp-instagram-open" aria-hidden="true">↗</span></div>
      <div className="tp-workshop-photo"><Image src={"/taller/" + story.image + ".jpg"} alt={story.title} fill sizes="(max-width: 639px) 100vw, (max-width: 979px) 50vw, 33vw" style={{objectPosition:story.position}} /></div>
      <div className="tp-workshop-caption"><span className="tp-instagram-post-link">Ver publicación en Instagram ↗</span><h3>{story.title}</h3><p>{story.text}</p></div>
    </a>)}</div>
  </div></section>;
}
