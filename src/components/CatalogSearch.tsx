import Link from "next/link";

export function CatalogSearch({ action, query, label, placeholder, hidden = {} }: {
  action: string; query: string; label: string; placeholder: string; hidden?: Record<string, string | undefined>;
}) {
  return <form key={query} action={action} method="get" className="tp-catalog-search" role="search" aria-label={label}>
    {Object.entries(hidden).map(([name, value]) => value ? <input key={name} type="hidden" name={name} value={value} /> : null)}
    <label className="tp-catalog-search-field"><span>{label}</span>
      <input className="tp-input" name="q" type="search" defaultValue={query} placeholder={placeholder} maxLength={100} />
    </label>
    <button className="tp-btn tp-btn-primary" type="submit">Buscar</button>
    {query && <Link className="tp-btn tp-btn-secondary" href={action}>Limpiar búsqueda</Link>}
  </form>;
}
