import type { Metadata } from "next";
import Link from "next/link";
import { randomUUID } from "node:crypto";
import { AccountingForm, VoidEntryForm } from "@/components/admin/AccountingForm";
import { getAccounting } from "@/lib/accounting";
import { localDate } from "@/lib/accounting-validation";
import { requireAdmin } from "@/lib/auth";
import { formatCLP, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Contabilidad" };

type Props = { searchParams: Promise<{ mes?: string }> };

export default async function AccountingPage({ searchParams }: Props) {
  await requireAdmin();
  const { mes } = await searchParams;
  const data = await getAccounting(typeof mes === "string" ? mes : undefined);
  const stats = [
    ["Ingresos cobrados", data.income],
    ["Gastos pagados", data.expenses],
    ["Flujo neto del período", data.balance],
  ] as const;

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Contabilidad</h1>
        <a className="tp-btn tp-btn-secondary tp-btn-sm" href={`/admin/contabilidad/exportar/?mes=${data.month}`}>
          Descargar CSV
        </a>
      </div>
      <p className="tp-muted">Control de caja del taller · Pesos chilenos (CLP)</p>

      <form className="tp-accounting-filter" method="get">
        <label>
          Período
          <input className="tp-input" type="month" name="mes" defaultValue={data.month} min="2000-01" max="9998-12" required />
        </label>
        <button className="tp-btn tp-btn-secondary">Ver período</button>
      </form>

      <div className="tp-stats">
        {stats.map(([label, value]) => (
          <div className="tp-stat" key={label}>
            <strong>{formatCLP(value)}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="tp-panel" style={{ marginBlock: 24 }}>
        <h2 className="tp-display tp-category-heading">Registrar movimiento</h2>
        <p className="tp-hint">
          Registra cobros presenciales y pagos realizados. Las ventas online con fecha de cobro se incorporan automáticamente: no las ingreses
          nuevamente. Los cobros de reservas se registran desde la reserva. Registra los reembolsos efectivamente pagados como gastos en
          Devolución.
        </p>
        <AccountingForm today={localDate()} requestId={randomUUID()} />
      </div>

      <h2 className="tp-display tp-category-heading">Libro de caja · {data.month}</h2>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Movimiento</th>
              <th>Categoría</th>
              <th>Medio / referencia</th>
              <th className="num">Ingreso</th>
              <th className="num">Gasto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id} style={{ opacity: r.voided ? 0.6 : 1 }}>
                <td>{formatDate(r.date)}</td>
                <td>
                  {r.description}
                  {r.orderId && (
                    <>
                      <br />
                      <Link href={`/admin/ordenes/${r.orderId}/`}>Ver orden</Link>
                    </>
                  )}
                  {r.bookingId && (
                    <>
                      <br />
                      <Link href={`/admin/reservas/${r.bookingId}/`}>Ver reserva</Link>
                    </>
                  )}
                </td>
                <td>{r.category}</td>
                <td>
                  {r.method}
                  <br />
                  <span className="tp-hint">{r.reference}</span>
                </td>
                <td className="num">{r.type === "ingreso" ? formatCLP(r.amount) : "—"}</td>
                <td className="num">{r.type === "gasto" ? formatCLP(r.amount) : "—"}</td>
                <td>
                  {r.voided ? (
                    <>
                      Anulado
                      <br />
                      <span className="tp-hint">{r.reason}</span>
                    </>
                  ) : r.manualId ? (
                    <VoidEntryForm id={r.manualId} />
                  ) : (
                    "Automático"
                  )}
                </td>
              </tr>
            ))}
            {!data.rows.length && (
              <tr>
                <td colSpan={7}>No hay movimientos en este período. Registra el primer ingreso o gasto del taller.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="tp-hint" style={{ marginTop: 16 }}>
        Los anulados no se incluyen en los totales. El flujo neto corresponde a este período, no al saldo bancario ni a la utilidad contable. Este
        registro interno no emite documentos tributarios ni declaraciones al SII.
      </p>
    </>
  );
}
