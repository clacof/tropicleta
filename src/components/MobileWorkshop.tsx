import Image from "next/image";
import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";

export function MobileWorkshop() {
  return <section className="tp-section tp-mobile" aria-labelledby="mobile-title">
    <div className="tp-shell tp-mobile-grid">
      <a href="/catalogo/7.jpg" target="_blank" rel="noopener" className="tp-mobile-poster" aria-label="Abrir lámina completa del taller móvil">
        <Image src="/catalogo/7.jpg" alt="Catálogo Tropicleta: taller móvil para eventos ciclistas en Atacama" width={720} height={1280} sizes="(max-width: 760px) 85vw, 360px" />
      </a>
      <div>
        <span className="tp-kicker">Taller móvil · Región de Atacama</span>
        <h2 id="mobile-title" className="tp-display tp-section-title">Tu bici, nuestro apoyo.<br />Donde nos necesites.</h2>
        <p className="tp-section-intro">El taller también sale a la ruta. Acompañamos eventos ciclistas con asistencia mecánica en terreno, para estar cerca de las bicicletas y de las personas que las mueven.</p>
        <ul className="tp-local-list">
          <li className="tp-local-item">Asistencia mecánica en terreno.</li>
          <li className="tp-local-item">Apoyo en rutas y eventos.</li>
          <li className="tp-local-item">Disponibilidad y alcance con coordinación previa.</li>
        </ul>
        <div className="tp-actions">
          <a className="tp-btn tp-btn-primary" href={whatsappUrl("Hola Tropicleta, quiero cotizar el taller móvil. Mi evento es en: __. Fecha: __. Participantes aproximados: __.")} target="_blank" rel="noopener">Cotizar mi evento</a>
          <Link className="tp-btn tp-btn-secondary" href="/eventos/">Conocer el taller móvil →</Link>
        </div>
      </div>
    </div>
  </section>;
}

export function PickupRates() {
  return <section className="tp-section" aria-labelledby="pickup-title"><div className="tp-shell">
    <span className="tp-kicker">Retiro y entrega · Coordinación por zona</span>
    <h2 id="pickup-title" className="tp-display tp-section-title">Nos acercamos a tu bici.</h2>
    <p className="tp-section-intro">Coordinamos el retiro de tu bicicleta y su regreso desde el taller. Confirma dirección, horario y disponibilidad antes de agendar.</p>
    <div className="tp-pickup-table"><table><caption>Tarifas de transporte de bicicletas, en pesos chilenos</caption><thead><tr><th scope="col">Zona</th><th scope="col">Solo retiro o entrega</th><th scope="col">Retiro + entrega</th></tr></thead><tbody>
      {[["Tierra Amarilla", "$3.000", "$5.000"], ["Paipote", "$8.000", "$15.000"], ["Copiapó", "$12.000", "$20.000"]].map(([zone, one, both]) => <tr key={zone}><th scope="row">{zone}</th><td>{one}</td><td>{both}</td></tr>)}
    </tbody></table></div>
    <div className="tp-actions"><a className="tp-btn tp-btn-primary" href={whatsappUrl("Hola Tropicleta, quiero coordinar retiro o entrega de mi bicicleta. Mi zona es: __. Necesito: solo retiro / solo entrega / ambos.")} target="_blank" rel="noopener">Coordinar retiro o entrega</a><a className="tp-btn tp-btn-secondary" href="/catalogo/4.jpg" target="_blank" rel="noopener">Ver lámina de tarifas ↗</a></div>
    <p className="tp-muted">Consulta por otras zonas. Estas tarifas corresponden al transporte de bicicletas al taller.</p>
  </div></section>;
}
