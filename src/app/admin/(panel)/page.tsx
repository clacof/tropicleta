import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAccounting } from "@/lib/accounting";
import { pendingCounts } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { displayPhone, formatCLP, formatDate, formatDateTime } from "@/lib/format";

export default async function AdminHome({searchParams}:{searchParams:Promise<{mes?:string}>}) {
  await requireAdmin();
  const {mes}=await searchParams;
  const [counts, month, bookings, orders] = await Promise.all([
    pendingCounts(),
    // Mismo cálculo que Contabilidad: mes calendario en America/Santiago, por fecha de cobro
    getAccounting(typeof mes === "string" ? mes : undefined),
    db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt)).limit(5),
    db.select().from(schema.orders).where(inArray(schema.orders.status, ["pagada", "lista", "entregada"])).orderBy(desc(schema.orders.createdAt)).limit(5),
  ]);
  const onlineSales = month.rows.filter((r) => !r.voided && r.orderId !== null).reduce((s, r) => s + r.amount, 0);

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
          <span>Ventas online · {month.month}</span>
        </div>
      </div>

      <section className="tp-panel" style={{marginBlock:24}}>
        <div className="tp-admin-title"><h2>Ingresos y gastos</h2><Link className="tp-btn tp-btn-secondary tp-btn-sm" href={`/admin/contabilidad/?mes=${month.month}`}>Ver contabilidad</Link></div>
        <form className="tp-accounting-filter" method="get"><label>Período<input className="tp-input" type="month" name="mes" defaultValue={month.month} min="2000-01" max="9998-12" required/></label><button className="tp-btn tp-btn-secondary">Ver período</button></form>
        <div className="tp-table-wrap"><table className="tp-table"><thead><tr><th>Área</th><th className="num">Ingresos cobrados</th><th className="num">Gastos pagados</th><th className="num">Saldo</th></tr></thead><tbody>{([['productos','Productos'],['servicios','Servicios'],['general','General / sin asignar']] as const).map(([area,label])=><tr key={area}><td>{label}</td><td className="num">{formatCLP(month.byArea[area].income)}</td><td className="num">{formatCLP(month.byArea[area].expenses)}</td><td className="num" style={{color:month.byArea[area].balance<0?'#fca5a5':'#86efac'}}>{formatCLP(month.byArea[area].balance)}</td></tr>)}<tr><td><strong>Total</strong></td><td className="num">{formatCLP(month.income)}</td><td className="num">{formatCLP(month.expenses)}</td><td className="num" style={{color:month.balance<0?'#fca5a5':'#86efac'}}><strong>{formatCLP(month.balance)}</strong></td></tr></tbody></table></div>
        <p className="tp-hint">Saldo = cobros menos gastos registrados. Los pedidos incluyen despacho. Las cotizaciones pendientes no cuentan como ingresos; los costos sin registrar no se descuentan. Asigna el área de cada movimiento en Contabilidad.</p>
      </section>

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
