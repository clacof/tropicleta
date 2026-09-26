import Link from "next/link";
import { count, desc, eq, gte, and, inArray, sum } from "drizzle-orm";
import { db, schema } from "@/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { displayPhone, formatCLP, formatDate, formatDateTime } from "@/lib/format";

export default async function AdminHome() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [[newBookings], [toDeliver], [unread], [sales], bookings, orders] = await Promise.all([
    db.select({ n: count() }).from(schema.bookings).where(eq(schema.bookings.status, "nueva")),
    db.select({ n: count() }).from(schema.orders).where(inArray(schema.orders.status, ["pagada", "lista"])),
    db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.read, false)),
    db
      .select({ total: sum(schema.orders.total) })
      .from(schema.orders)
      .where(and(inArray(schema.orders.status, ["pagada", "lista", "entregada"]), gte(schema.orders.paidAt, monthStart))),
    db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt)).limit(5),
    db.select().from(schema.orders).where(inArray(schema.orders.status, ["pagada", "lista", "entregada"])).orderBy(desc(schema.orders.createdAt)).limit(5),
  ]);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Resumen</h1>
      </div>

      <div className="tp-stats">
        <div className="tp-stat">
          <strong>{newBookings.n}</strong>
          <span>Reservas nuevas</span>
        </div>
        <div className="tp-stat">
          <strong>{toDeliver.n}</strong>
          <span>Órdenes por entregar</span>
        </div>
        <div className="tp-stat">
          <strong>{unread.n}</strong>
          <span>Mensajes sin leer</span>
        </div>
        <div className="tp-stat">
          <strong>{formatCLP(Number(sales.total ?? 0))}</strong>
          <span>Ventas del mes</span>
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
                  <Link href={`/admin/reservas/#${b.code}`}>{b.code}</Link>
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
