import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { toggleMessageRead } from "@/actions/admin";
import { Pager, SearchBar } from "@/components/admin/ListControls";
import { db, schema } from "@/db";
import { PAGE_SIZE, pageFrom, searchWhere } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/auth";
import { displayPhone, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Mensajes" };

type Props = { searchParams: Promise<{ q?: string; p?: string; ver?: string }> };

export default async function MensajesAdmin({ searchParams }: Props) {
  await requireAdmin();
  const { q, p, ver } = await searchParams;
  const page = pageFrom(p);
  const unread = ver === "no-leidos";
  const t = schema.contactMessages;
  const where = and(unread ? eq(t.read, false) : undefined, searchWhere(q, [t.name, t.email, t.message], [t.phone]));
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(t).where(where).orderBy(desc(t.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(t).where(where),
  ]);
  return (
    <>
      <div className="tp-admin-title">
        <h1 className="tp-display">Mensajes</h1>
      </div>
      <nav className="tp-chip-nav" aria-label="Filtrar">
        <Link className="tp-chip" href={`/admin/mensajes/${q ? `?q=${encodeURIComponent(q)}` : ""}`} aria-current={!unread ? "true" : undefined}>
          Todos
        </Link>
        <Link className="tp-chip" href={`/admin/mensajes/?${new URLSearchParams({ ver: "no-leidos", ...(q ? { q } : {}) })}`} aria-current={unread ? "true" : undefined}>
          No leídos
        </Link>
      </nav>
      <SearchBar q={q} placeholder="Nombre, celular, email o texto" keep={{ ver: unread ? ver : undefined }} />
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
      <Pager page={page} total={total} pageSize={PAGE_SIZE} params={{ ver: unread ? ver : undefined, q }} />
    </>
  );
}
