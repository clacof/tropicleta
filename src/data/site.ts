/**
 * Datos del negocio. ⚠️ Email, redes, horario y referencia de dirección son DUMMY: confirmar con Tropicleta.
 * WhatsApp, ubicación y zonas de cobertura vienen del sitio original.
 */
export const site = {
  name: "Tropicleta",
  domain: "tropicleta.com",
  location: "Tierra Amarilla · Región de Atacama",
  addressNote: "Tierra Amarilla, Región de Atacama. Te enviamos la ubicación exacta al coordinar.",
  whatsappNumber: "56976614443",
  whatsappDisplay: "+56 9 7661 4443",
  coverage: ["Tierra Amarilla", "Paipote", "Copiapó"],
  email: "hola@tropicleta.com",
  hours: [
    { days: "Lunes a viernes", time: "10:00 – 19:00" },
    { days: "Sábado", time: "10:00 – 14:00" },
    { days: "Domingo y festivos", time: "Cerrado (eventos con reserva)" },
  ],
  socials: [
    { name: "Instagram", href: "https://instagram.com/tropicleta" },
    { name: "Facebook", href: "https://facebook.com/tropicleta" },
    { name: "TikTok", href: "https://tiktok.com/@tropicleta" },
  ],
} as const;

export const nav = [
  { href: "/servicios/", label: "Servicios" },
  { href: "/agendar/", label: "Agendar" },
  { href: "/tienda/", label: "Tienda" },
  { href: "/nosotros/", label: "Nosotros" },
  { href: "/contacto/", label: "Contacto" },
] as const;

export const footerLinks = {
  taller: [
    { href: "/servicios/", label: "Servicios" },
    { href: "/agendar/", label: "Solicitar hora" },
    { href: "/eventos/", label: "Taller móvil para eventos" },
    { href: "/consejos/", label: "Consejos" },
    { href: "/nosotros/", label: "Nosotros" },
  ],
  ayuda: [
    { href: "/preguntas-frecuentes/", label: "Preguntas frecuentes" },
    { href: "/mi-orden/", label: "Seguimiento de compra" },
    { href: "/garantia/", label: "Garantía" },
    { href: "/envios-y-devoluciones/", label: "Envíos y devoluciones" },
    { href: "/terminos/", label: "Términos y condiciones" },
    { href: "/privacidad/", label: "Privacidad" },
  ],
};
