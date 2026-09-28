/** Iconos de línea para las categorías del catálogo (servicios y tienda). Heredan `currentColor`. */
const paths: Record<string, React.ReactNode> = {
  // Servicios
  mantenciones: (
    <path d="M15 3.5a4.5 4.5 0 0 0-4.3 5.9l-7 7a2 2 0 0 0 2.9 2.9l7-7A4.5 4.5 0 0 0 19.5 8l-2.7 2.7-2.8-.7-.7-2.8L16 4.5A4.5 4.5 0 0 0 15 3.5Z" />
  ),
  suspensiones: (
    <>
      <circle cx="12" cy="3.5" r="1.5" />
      <rect x="9" y="5" width="6" height="6" rx="1" />
      <path d="M12 11v1.5M8.5 12.5l7 1.5-7 1.5 7 1.5-7 1.5M12 18.5V19" />
      <circle cx="12" cy="20.5" r="1.5" />
    </>
  ),
  transmision: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
    </>
  ),
  frenos: (
    <>
      <circle cx="10.5" cy="13.5" r="7.5" />
      <circle cx="10.5" cy="13.5" r="2.5" />
      <path d="M10.5 7.5v1M10.5 18.5v1M4.5 13.5h1M15.5 13.5h1" />
      <rect x="12.3" y="6.1" width="7" height="4.2" rx="1.4" transform="rotate(45 15.8 8.2)" />
    </>
  ),
  ruedas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6.5" />
      <circle cx="12" cy="12" r="1.3" />
      <path d="M12 5.5v5.2M12 13.3v5.2M6.4 8.8l4.5 2.5M13.1 12.7l4.5 2.5M6.4 15.2l4.5-2.5M13.1 11.3l4.5-2.5" />
    </>
  ),
  ejes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="12" cy="5.8" r="1.1" />
      <circle cx="12" cy="18.2" r="1.1" />
      <circle cx="5.8" cy="12" r="1.1" />
      <circle cx="18.2" cy="12" r="1.1" />
      <circle cx="7.6" cy="7.6" r="1.1" />
      <circle cx="16.4" cy="16.4" r="1.1" />
      <circle cx="7.6" cy="16.4" r="1.1" />
      <circle cx="16.4" cy="7.6" r="1.1" />
    </>
  ),
  scooters: (
    <>
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <path d="M7.5 17h9.3M18.6 15.6 15.8 4M13.5 4h4.5" />
    </>
  ),
  "retiro-entrega": (
    <>
      <path d="M2.5 16V7a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9M13.5 10h3.8l3.2 3.5V16" />
      <path d="M9 16.5h6M2.5 16.5h2M19.5 16.5h1" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  // Tienda
  repuestos: (
    <>
      <rect x="2" y="8" width="11" height="8" rx="4" />
      <rect x="11" y="8" width="11" height="8" rx="4" />
      <circle cx="6" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </>
  ),
  mantencion: (
    <>
      <path d="M11 2h2l1 4h-4l1-4Z" />
      <rect x="7.5" y="6" width="9" height="16" rx="2.5" />
      <path d="M12 11.5s-2 2.2-2 3.5a2 2 0 0 0 4 0c0-1.3-2-3.5-2-3.5Z" />
    </>
  ),
  accesorios: (
    <>
      <rect x="2.5" y="8" width="9" height="8" rx="2" />
      <path d="M11.5 9 15 6.5v11L11.5 15M18 9l3-1.2M18 12h3.5M18 15l3 1.2M5 16v2.5h4V16" />
    </>
  ),
};

const bike = (
  <>
    <circle cx="5.5" cy="16" r="3.5" />
    <circle cx="18.5" cy="16" r="3.5" />
    <path d="M5.5 16H11L9 9h7l2.5 7M5.5 16 9 9M11 16l5-7M7.5 7h3M16 9l.5-2.5h2" />
  </>
);

export function CatalogIcon({ slug, size = 24, className }: { slug: string; size?: number; className?: string }) {
  return (
    <svg
      className={className ?? "tp-cat-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[slug] ?? bike}
    </svg>
  );
}
