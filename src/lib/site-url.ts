export function siteUrl(path = "") {
  const fallback = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tropicleta.com";
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let base = fallback;

  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "http:" || url.protocol === "https:") {
        base = url.href;
      }
    } catch {
      // Una URL mal configurada no debe impedir el build ni generar enlaces relativos.
    }
  }

  base = base.replace(/\/+$/, "");
  return base + path;
}
