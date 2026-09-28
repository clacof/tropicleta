import type { Metadata } from "next";
import { count, desc } from "drizzle-orm";
import { Pager } from "@/components/admin/ListControls";
import { db, schema } from "@/db";
import { PAGE_SIZE, pageFrom } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Actividad" };

type Props = { searchParams: Promise<{ p?: string }> };

export default async function ActividadAdmin({ searchParams }: Props) {
  await requireAdmin();
  const page = pageFrom((await searchParams).p);
  const t = schema.adminAudit;
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(t).orderBy(desc(t.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(t),
  ]);

  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Actividad</h1>
      </div>
      <p className="tp-muted tp-small">Historial de cambios hechos desde el panel.</p>
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Detalle</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(r.createdAt)}</td>
                <td>
                  {r.action} · {r.entity}
                </td>
                <td className="tp-audit-summary">{r.summary}</td>
                <td className="tp-hint">{r.ip}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="tp-muted">
                  Aún no hay actividad registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} total={total} pageSize={PAGE_SIZE} params={{}} />
    </>
  );
}
