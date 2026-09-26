import { WA_COORDINAR } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppFloat() {
  return (
    <a
      className="tp-wa-float"
      href={WA_COORDINAR}
      target="_blank"
      rel="noopener"
      aria-label="Escribir a Tropicleta por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
