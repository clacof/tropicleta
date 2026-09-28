import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAccounting } from "@/lib/accounting";
import { pendingCounts } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { displayPhone, formatCLP, formatDate, formatDateTime } from "@/lib/format";

export default async function AdminHome() {
  await requireAdmin();
  const [counts, month, bookings, orders] = await Promise.all([
    pendingCounts(),
    // Mismo cálculo que Contabilidad: mes calendario en America/Santiago, por fecha de cobro
    getAccounting(),
    db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt)).limit(5),
    db.select().from(schema.orders).where(inArray(schema.orders.status, ["pagada", "lista", "entregada"])).orderBy(desc(schema.orders.createdAt)).limit(5),
  ]);
  const onlineSales = month.rows.filter((r) => r.orderId !== null).reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Resumen</h1>
      </div>

      <div className="tp-stats">
        <div className="tp-stat">
          <strong>{counts.bookings}</strong>
          <span>Reservas nuevas</span>
        </div>
        <div className="tp-stat">
          <strong>{counts.orders}</strong>
          <span>Órdenes por entregar</span>
        </div>
        <div className="tp-stat">
          <strong>{counts.messages}</strong>
          <span>Mensajes sin leer</span>
        </div>
        <div className="tp-stat">
          <strong>{formatCLP(onlineSales)}</strong>
          <span>Ventas online del mes</span>
        </div>
      </div>

      <h2 className="tp-display tp-category-heading">Últimas reservas</h2>
      <div className="tp-table-wrap" style={{ marginBottom: 30 }}>
        <table className="tp-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Fecha preferida</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={`/admin/reservas/${b.id}/`}>{b.code}</Link>
                </td>
                <td>
                  {b.name}
                  <br />
                  <span className="tp-hint">{displayPhone(b.phone)}</span>
                </td>
                <td>{formatDate(b.preferredDate)}</td>
                <td>
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr>
                <td colSpan={4} className="tp-muted">
                  Aún no hay reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="tp-display tp-category-heading">Últimas ventas</h2>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th className="num">Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/ordenes/${o.id}/`}>{o.code}</Link>
                </td>
                <td>{o.customerName}</td>
                <td>{formatDateTime(o.createdAt)}</td>
                <td className="num">{formatCLP(o.total)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="tp-muted">
                  Aún no hay ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
