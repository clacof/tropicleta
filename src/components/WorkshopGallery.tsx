import Image from "next/image";

const stories = [
  { image: "taller", title: "Nuestro taller, pedaleo a pedaleo", text: "Un espacio que crece con cada detalle y con nuestra comunidad.", post: "DXfocb7kQal" },
  { image: "suspension", title: "Listas para volver al cerro", text: "Mantención y servicio de suspensión para una Scott Spark RC.", post: "DRp1XCXksWw" },
  { image: "ultrasonido", title: "Cuidado hasta el último eslabón", text: "Limpieza ultrasónica y preparación de cera en el taller.", post: "DcxlrmWRpov" },
  { image: "rodamientos", title: "Que tu bici vuelva a moverse suave", text: "Limpieza y renovación de grasas en los componentes del cuadro.", post: "DcwH1-hx8LU" },
  { image: "evento", title: "La mecánica también sale a la pista", text: "Acompañando Little MTB con nuestro servicio de mecánica exprés.", post: "Dcran3kSBDX" },
  { image: "chopper", title: "Cada bicicleta tiene su historia", text: "Una chopper pasa por mantención y renovación de componentes.", post: "Dch4ZgGNc38" },
];

export function WorkshopGallery() {
  return <section className="tp-section tp-workshop" aria-labelledby="workshop-title">
    <div className="tp-shell">
      <div className="tp-workshop-heading">
        <div><span className="tp-kicker">Comunidad Tropicleta · Atacama</span>
          <h2 id="workshop-title" className="tp-display tp-section-title">Bicicletas mueven historias.</h2>
          <p className="tp-section-intro">Desde el cuidado de una bici en Tierra Amarilla hasta la mecánica en Little MTB: el taller es un punto de encuentro para quienes disfrutan pedalear. Conoce nuestro trabajo, comparte tu próxima ruta y sigue las historias de la comunidad en Instagram.</p>
        </div>
        <a className="tp-btn tp-btn-secondary" href="https://www.instagram.com/tropicleta/" target="_blank" rel="noopener noreferrer">Seguir a @tropicleta ↗</a>
      </div>
      <div className="tp-workshop-grid">{stories.map((story) =>
        <a key={story.post} className="tp-workshop-card" href={`https://www.instagram.com/tropicleta/reel/${story.post}/`} target="_blank" rel="noopener noreferrer">
          <div className="tp-workshop-photo"><Image src={`/taller/${story.image}.jpg`} alt={story.title} fill sizes="(max-width: 639px) 100vw, (max-width: 979px) 50vw, 33vw" /><span>Ver en Instagram ↗</span></div>
          <div className="tp-workshop-caption"><h3>{story.title}</h3><p>{story.text}</p></div>
        </a>
      )}</div>
    </div>
  </section>;
}
