"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/", label: "Resumen", exact: true },
  { href: "/admin/reservas/", label: "Reservas" },
  { href: "/admin/ordenes/", label: "Órdenes" },
  { href: "/admin/mensajes/", label: "Mensajes" },
  { href: "/admin/servicios/", label: "Servicios" },
  { href: "/admin/productos/", label: "Productos" },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const raw = usePathname();
  const pathname = raw.endsWith("/") ? raw : raw + "/";
  return (
    <nav aria-label="Panel">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const n = badges[l.href];
        return (
          <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
            {l.label} {n ? <span className="tp-badge tp-badge-orange" style={{ padding: "1px 7px" }}>{n}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
