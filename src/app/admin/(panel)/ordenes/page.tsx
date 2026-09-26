import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ne } from "drizzle-orm";
import { StatusBadge, statusLabel } from "@/components/admin/StatusBadge";
import { db, schema } from "@/db";
import { formatCLP, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Órdenes" };

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function OrdenesAdmin({ searchParams }: Props) {
  const { estado } = await searchParams;
  const valid = schema.orderStatus.enumValues.includes(estado as never);
  const rows = await db
    .select()
    .from(schema.orders)
    // Por defecto se ocultan los intentos de pago abandonados
    .where(valid ? eq(schema.orders.status, estado as never) : ne(schema.orders.status, "anulada"))
    .orderBy(desc(schema.orders.createdAt))
    .limit(200);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Órdenes</h1>
      </div>
      <nav className="tp-chip-nav" aria-label="Filtrar por estado">
        <Link className="tp-chip" href="/admin/ordenes/" aria-current={!valid ? "true" : undefined}>
          Activas
        </Link>
        {schema.orderStatus.enumValues.map((s) => (
          <Link key={s} className="tp-chip" href={`/admin/ordenes/?estado=${s}`} aria-current={estado === s ? "true" : undefined}>
            {statusLabel[s]}
          </Link>
        ))}
      </nav>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Pago</th>
              <th className="num">Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/ordenes/${o.id}/`}>{o.code}</Link>
                  <br />
                  <span className="tp-hint">{formatDateTime(o.createdAt)}</span>
                </td>
                <td>{o.customerName}</td>
                <td>{o.deliveryMethod === "retiro" ? "Retiro" : `Despacho · ${o.commune}`}</td>
                <td>{o.paymentMethod === "webpay" ? "Webpay" : "Mercado Pago"}</td>
                <td className="num">{formatCLP(o.total)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="tp-muted">
                  No hay órdenes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
