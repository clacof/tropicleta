import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // mantiene las URLs del sitio original (/servicios/, /tienda/...)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
