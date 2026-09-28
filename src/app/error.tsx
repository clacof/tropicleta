"use client";

import Link from "next/link";
import { WA_CONSULTAR } from "@/lib/whatsapp";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="tp-section"><div className="tp-shell tp-panel" role="alert">
    <h1 className="tp-display">No pudimos cargar esta sección</h1>
    <p>Intenta nuevamente. Si necesitas atención del taller, puedes contactarnos por WhatsApp.</p>
    <div className="tp-actions">
      <button className="tp-btn tp-btn-primary" onClick={retry}>Volver a intentar</button>
      <Link className="tp-btn tp-btn-secondary" href="/">Ir al inicio</Link>
      <a className="tp-btn tp-btn-secondary" href={WA_CONSULTAR} target="_blank" rel="noopener">Contactar al taller</a>
    </div>
  </div></section>;
}
