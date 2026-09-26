import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { toggleMessageRead } from "@/actions/admin";
import { db, schema } from "@/db";
import { displayPhone, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mensajes" };

export default async function MensajesAdmin() {
  const rows = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(200);
  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Mensajes</h1>
      </div>
      <div className="tp-stack">
        {rows.map((m) => (
          <article key={m.id} className={`tp-panel ${m.read ? "" : "tp-panel-accent"}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>
                {m.name}{" "}
                {m.subject === "eventos" && <span className="tp-badge tp-badge-orange">Evento</span>}
              </strong>
              <span className="tp-hint">{formatDateTime(m.createdAt)}</span>
            </div>
            <p className="tp-small tp-muted" style={{ margin: "4px 0 12px" }}>
              {m.phone && (
                <a className="tp-orange" href={`https://wa.me/${m.phone}`} target="_blank" rel="noopener">
                  {displayPhone(m.phone)}
                </a>
              )}{" "}
              {m.email && <a href={`mailto:${m.email}`}>{m.email}</a>}
            </p>
            <p style={{ whiteSpace: "pre-line" }}>{m.message}</p>
            <form action={toggleMessageRead}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="read" value={String(!m.read)} />
              <button className="tp-btn tp-btn-secondary tp-btn-sm" type="submit">
                {m.read ? "Marcar no leído" : "Marcar leído"}
              </button>
            </form>
          </article>
        ))}
        {!rows.length && <p className="tp-muted">No hay mensajes.</p>}
      </div>
    </>
  );
}
