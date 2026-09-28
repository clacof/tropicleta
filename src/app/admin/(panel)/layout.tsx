import type { Metadata } from "next";
import Link from "next/link";
import { count, eq, inArray } from "drizzle-orm";
import { logout } from "@/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { BrandLogo } from "@/components/BrandLogo";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel Tropicleta" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [[b], [o], [m]] = await Promise.all([
    db.select({ n: count() }).from(schema.bookings).where(eq(schema.bookings.status, "nueva")),
    db.select({ n: count() }).from(schema.orders).where(inArray(schema.orders.status, ["pagada"])),
    db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.read, false)),
  ]);

  return (
    <div className="tp-admin">
      <aside className="tp-admin-side">
        <Link href="/admin/" className="tp-logo" style={{ fontSize: 22 }}>
          <BrandLogo />
        </Link>
        <AdminNav badges={{ "/admin/reservas/": b.n, "/admin/ordenes/": o.n, "/admin/mensajes/": m.n }} />
        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
          <Link className="tp-btn tp-btn-secondary tp-btn-sm" href="/" target="_blank">
            Ver sitio
          </Link>
          <form action={logout}>
            <button className="tp-btn tp-btn-ghost tp-btn-sm" type="submit">
              Salir
            </button>
          </form>
        </div>
      </aside>
      <main className="tp-admin-main">{children}</main>
    </div>
  );
}
