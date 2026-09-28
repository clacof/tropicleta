import Link from "next/link";
import Image from "next/image";
import { footerLinks, site } from "@/data/site";
import { WA_CONSULTAR } from "@/lib/whatsapp";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="tp-footer">
      <div className="tp-shell">
        <div className="tp-footer-grid">
          <div className="tp-footer-brand">
            <Link href="/" className="tp-footer-logo" aria-label="Tropicleta, ir al inicio">
              <Image src="/brand/tropicleta-completo.jpeg" alt="Tropicleta · Taller de bicicletas" width={142} height={224} sizes="142px" />
            </Link>
            <p>
              Taller de bicicletas y scooters eléctricos en Tierra Amarilla. Atención con coordinación previa y retiro y
              entrega en Tierra Amarilla, Paipote y Copiapó.
            </p>
            <div className="tp-socials">
              {site.socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener" aria-label={s.name}>
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2>Taller</h2>
            <ul>
              {footerLinks.taller.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Ayuda</h2>
            <ul>
              {footerLinks.ayuda.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Contacto</h2>
            <ul>
              <li>
                <a href={WA_CONSULTAR} target="_blank" rel="noopener">
                  WhatsApp {site.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>{site.location}</li>
              {site.hours.slice(0, 2).map((h) => (
                <li key={h.days}>
                  {h.days}: {h.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="tp-footer-bottom">
          <Link href="/admin/">Administración</Link>
          <span>
            © {year} {site.domain}
          </span>
          <span>Diagnóstico gratuito · Garantía 2 semanas · Pagos con Webpay y Mercado Pago</span>
        </div>
      </div>
    </footer>
  );
}
