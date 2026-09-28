import Link from "next/link";

/** Búsqueda por GET: conserva los demás filtros como campos ocultos. */
export function SearchBar({ q, placeholder, keep = {} }: { q?: string; placeholder: string; keep?: Record<string, string | undefined> }) {
  return (
    <form method="get" className="tp-inline-form tp-admin-search" role="search">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input className="tp-input" type="search" name="q" defaultValue={q} placeholder={placeholder} aria-label="Buscar" maxLength={80} />
      <button className="tp-btn tp-btn-secondary" type="submit">
        Buscar
      </button>
      {q && (
        <Link className="tp-link-btn" href={`?${new URLSearchParams(Object.entries(keep).filter((e): e is [string, string] => !!e[1]))}`}>
          Limpiar
        </Link>
      )}
    </form>
  );
}

/** Paginación simple anterior/siguiente con total. */
export function Pager({ page, total, pageSize, params }: { page: number; total: number; pageSize: number; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return <p className="tp-hint tp-pager">{total} resultado{total === 1 ? "" : "s"}</p>;
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]));
    if (p > 1) sp.set("p", String(p));
    else sp.delete("p");
    return `?${sp}`;
  };
  return (
    <nav className="tp-pager" aria-label="Paginación">
      {page > 1 ? <Link className="tp-btn tp-btn-secondary tp-btn-sm" href={href(page - 1)}>← Anterior</Link> : <span />}
      <span className="tp-hint">
        Página {page} de {pages} · {total} resultados
      </span>
      {page < pages ? <Link className="tp-btn tp-btn-secondary tp-btn-sm" href={href(page + 1)}>Siguiente →</Link> : <span />}
    </nav>
  );
}
