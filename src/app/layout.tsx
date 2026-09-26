import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./ui.css";

// Fuentes self-hosted (Inter variable + Luckiest Guy, licencia OFL) para no depender de Google Fonts en build.
const inter = localFont({
  src: "../fonts/Inter-Variable.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const luckiest = localFont({
  src: "../fonts/LuckiestGuy-Regular.woff2",
  weight: "400",
  variable: "--font-luckiest",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tropicleta.com"),
  title: {
    default: "Tropicleta — Taller de bicicletas en Tierra Amarilla",
    template: "%s · Tropicleta",
  },
  description:
    "Servicio técnico de bicicletas con atención coordinada en Tierra Amarilla, cerca de Paipote y Copiapó. Mantenciones, ajustes y servicios especializados.",
  openGraph: { type: "website", locale: "es_CL", siteName: "Tropicleta" },
};

export const viewport: Viewport = { themeColor: "#0d0e0f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${luckiest.variable}`}>
      <body>{children}</body>
    </html>
  );
}
