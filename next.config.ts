import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // mantiene las URLs del sitio original (/servicios/, /tienda/...)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // Solo `next dev`: permite abrir el sitio desde la red local (ej. http://192.168.1.122:3000 en el celular).
  // Sin esto Next bloquea el JS de desarrollo y ningún botón responde.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  // Subida de imágenes de productos desde el panel (Vercel acepta hasta 4,5 MB por solicitud)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Fotos de productos subidas a Vercel Blob → optimizadas por next/image (AVIF/WebP + srcset)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
