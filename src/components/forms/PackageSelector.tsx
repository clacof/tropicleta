"use client";
import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { matchesSearch } from "@/lib/catalog-search";
import { packageLeaves, selectedLeaves, vehicleLabels, type Vehicle, type PackageService, type Selection } from "@/lib/package-quote";
import { packageReference } from "@/lib/package-reference";
export type PackageCatalog = { slug:string; name:string; services:(PackageService & { summary?:string|null })[] }[];
export function PackageSelector({catalog,selection,vehicle,doubleSuspension,onDoubleSuspension,query,covered,onToggle,onVehicle,onQuery}: {catalog:PackageCatalog;selection:Selection;vehicle:Vehicle;doubleSuspension:boolean;onDoubleSuspension:(value:boolean)=>void;query:string;covered:string[];onToggle:(slug:string)=>void;onVehicle:(v:Vehicle)=>void;onQuery:(q:string)=>void}) {
  const all=catalog.flatMap(c=>c.services); const leaves=selectedLeaves(all,selection);
  const packages=all.filter(s=>s.kind === "package" && s.individuallySelectable && s.vehicles.includes(vehicle) && (!s.requiresDoubleSuspension || doubleSuspension));
  const included=new Set(selection.packages.flatMap(slug=>packageLeaves(all,slug)));
  const price=(s:PackageService)=>s.price===null?"A cotizar":(s.priceFrom?"Desde ":"")+formatCLP(s.price);
  return <fieldset className="tp-fieldset"><legend className="tp-label">1. Arma tu cotización</legend>
    <div className="tp-options tp-options-3">{(Object.keys(vehicleLabels) as Vehicle[]).map(v=><label key={v} className="tp-option"><input type="radio" name="vehicleType" value={v} checked={vehicle===v} onChange={()=>onVehicle(v)} /><span>{vehicleLabels[v]}</span></label>)}</div>
    {vehicle!=="scooter" && <label className="tp-option"><input type="checkbox" name="doubleSuspension" checked={doubleSuspension} onChange={e=>onDoubleSuspension(e.target.checked)}/><span>Mi bicicleta tiene doble suspensión</span></label>}
    {packages.length>0 && <div><h2 className="tp-quote-heading">Paquetes de servicios</h2><div className="tp-package-grid">{packages.map(s=>{const required=packageLeaves(all,s.slug,true);const complete=s.components.length>0 && required.every(slug=>leaves.includes(slug));const ref=packageReference(all,s);return <div key={s.slug} className={"tp-package-option"+(complete||(!s.components.length&&selection.packages.includes(s.slug))?" is-selected":"")}><label className="tp-option"><input type="checkbox" checked={complete||(!s.components.length&&selection.packages.includes(s.slug))} disabled={complete&&!selection.packages.includes(s.slug)} onChange={()=>onToggle(s.slug)} /><span><strong>{s.name}</strong><b>{price(s)}</b>{ref&&ref.savings!==null&&ref.savings>0&&<small>Ahorra {formatCLP(ref.savings)} · individual {formatCLP(ref.reference)}</small>}{s.summary && <small>{s.summary}</small>}<small>{s.components.length?`${packageLeaves(all,s.slug).length} trabajos incluidos`:"Composición pendiente · se cotiza por separado"}</small></span></label>{s.components.length>0&&<details className="tp-pack-details"><summary>Ver servicios incluidos</summary><ul>{packageLeaves(all,s.slug).map(slug=><li key={slug}>{all.find(c=>c.slug===slug)!.name}</li>)}</ul></details>}</div>})}</div></div>}
    <h2 className="tp-quote-heading">Servicios individuales</h2>
    <label className="tp-field">Buscar un servicio<input className="tp-input" type="search" value={query} onChange={e=>onQuery(e.target.value)} placeholder="Frenos, ruedas, suspensión…" /></label>
    <p className="tp-hint">Precios en pesos chilenos. Los trabajos cubiertos por un paquete no se cobran aparte.</p>
    {catalog.map(c=>{const rows=c.services.filter(s=>s.kind!=="package" && s.vehicles.includes(vehicle) && (s.individuallySelectable||included.has(s.slug)) && matchesSearch(query,s.name,s.summary,c.name));return rows.length>0 && <div key={c.slug} id={c.slug}><h3 className="tp-quote-category">{c.name}</h3><div className="tp-options tp-options-2">{rows.map(s=><label className="tp-option" key={s.slug}><input type="checkbox" checked={leaves.includes(s.slug)} onChange={()=>onToggle(s.slug)} disabled={!s.individuallySelectable&&!included.has(s.slug)} /><span>{s.name}<small>{covered.includes(s.slug)?"Incluido en paquete":price(s)}</small><Link href={`/servicios/${s.slug}/`}>Ver detalle</Link></span></label>)}</div></div>})}
    {!catalog.some(c=>c.services.some(s=>s.kind!=="package"&&s.vehicles.includes(vehicle)&&matchesSearch(query,s.name,s.summary,c.name))) && <p>No hay servicios con esa búsqueda para este vehículo.</p>}
  </fieldset>;
}
