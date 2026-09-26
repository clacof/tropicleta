import { site } from "@/data/site";

/** Construye un enlace wa.me con el mensaje preformateado. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const WA_COORDINAR = whatsappUrl("Hola Tropicleta, quiero coordinar un servicio.");
export const WA_CONSULTAR = whatsappUrl("Hola Tropicleta, quiero consultar por un servicio.");
