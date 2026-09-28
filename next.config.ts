import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // mantiene las URLs del sitio original (/servicios/, /tienda/...)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // Subida de imágenes de productos desde el panel (Vercel acepta hasta 4,5 MB por solicitud)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Fotos de productos subidas a Vercel Blob → optimizadas por next/image (AVIF/WebP + srcset)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
