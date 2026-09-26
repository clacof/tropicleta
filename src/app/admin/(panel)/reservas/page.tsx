import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { updateBookingStatus } from "@/actions/admin";
import { StatusBadge, statusLabel } from "@/components/admin/StatusBadge";
import { db, schema } from "@/db";
import { displayPhone, formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Reservas" };

type Props = { searchParams: Promise<{ estado?: string }> };

export default async function ReservasAdmin({ searchParams }: Props) {
  const { estado } = await searchParams;
  const valid = schema.bookingStatus.enumValues.includes(estado as never);
  const rows = await db
    .select()
    .from(schema.bookings)
    .where(valid ? eq(schema.bookings.status, estado as never) : undefined)
    .orderBy(desc(schema.bookings.createdAt))
    .limit(200);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Reservas</h1>
      </div>
      <nav className="tp-chip-nav" aria-label="Filtrar por estado">
        <Link className="tp-chip" href="/admin/reservas/" aria-current={!valid ? "true" : undefined}>
          Todas
        </Link>
        {schema.bookingStatus.enumValues.map((s) => (
          <Link key={s} className="tp-chip" href={`/admin/reservas/?estado=${s}`} aria-current={estado === s ? "true" : undefined}>
            {statusLabel[s]}
          </Link>
        ))}
      </nav>

      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Solicitud</th>
              <th>Cliente</th>
              <th>Servicios</th>
              <th>Preferencia</th>
              <th>Retiro</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const wa = `https://wa.me/${b.phone}?text=${encodeURIComponent(
                `Hola ${b.name.split(" ")[0]}, te escribimos de Tropicleta por tu solicitud ${b.code}.`,
              )}`;
              return (
                <tr key={b.id} id={b.code}>
                  <td>
                    <strong>{b.code}</strong>
                    <br />
                    <span className="tp-hint">{formatDateTime(b.createdAt)}</span>
                  </td>
                  <td>
                    {b.name}
                    <br />
                    <a href={wa} target="_blank" rel="noopener">
                      {displayPhone(b.phone)}
                    </a>
                    {b.email && (
                      <>
                        <br />
                        <span className="tp-hint">{b.email}</span>
                      </>
                    )}
                  </td>
                  <td>
                    {b.serviceNames.join(", ")}
                    <br />
                    <span className="tp-hint">
                      {b.vehicleType} {b.vehicleDetails}
                    </span>
                    {b.notes && (
                      <>
                        <br />
                        <span className="tp-hint">“{b.notes}”</span>
                      </>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDate(b.preferredDate)}
                    <br />
                    <span className="tp-hint">{b.timeSlot === "manana" ? "Mañana" : "Tarde"}</span>
                  </td>
                  <td>{b.pickup ? `${b.pickupCommune}: ${b.pickupAddress}` : "—"}</td>
                  <td>
                    <StatusBadge status={b.status} />
                    <form action={updateBookingStatus} className="tp-inline-form" style={{ marginTop: 8 }}>
                      <input type="hidden" name="id" value={b.id} />
                      <select name="status" className="tp-select" defaultValue={b.status} aria-label="Cambiar estado">
                        {schema.bookingStatus.enumValues.map((s) => (
                          <option key={s} value={s}>
                            {statusLabel[s]}
                          </option>
                        ))}
                      </select>
                      <button className="tp-btn tp-btn-secondary" type="submit">
                        OK
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="tp-muted">
                  No hay reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
