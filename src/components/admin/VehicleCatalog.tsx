"use client";
import {useActionState,useEffect,useRef} from "react";
import {manageQuoteVehicle,saveVehicleCatalog} from "@/actions/admin";
import {SubmitButton} from "@/components/SubmitButton";
import type {Service} from "@/db/schema";
import type {QuoteVehicle} from "@/lib/package-quote";
type Vehicle=QuoteVehicle&{id:number;removed:boolean};
function VehicleAction({vehicle}:{vehicle:Vehicle}){
  const [state,action]=useActionState(manageQuoteVehicle,{});
  return <div className="tp-inline-form"><strong>{vehicle.name}</strong><form action={action}><input type="hidden" name="id" value={vehicle.id}/><input type="hidden" name="intent" value={vehicle.removed?"restore":"remove"}/><SubmitButton className="tp-btn tp-btn-secondary tp-btn-sm">{vehicle.removed?"Recuperar":"Quitar"}</SubmitButton></form>{state.message&&<p className="tp-hint" role="status">{state.message}</p>}</div>;
}
export function VehicleCatalog({services,vehicles}:{services:Service[];vehicles:Vehicle[]}){
 const [state,action]=useActionState(saveVehicleCatalog,{});const [addState,addAction]=useActionState(manageQuoteVehicle,{});const ref=useRef<HTMLFormElement>(null);
 useEffect(()=>{if(addState.ok)ref.current?.reset();},[addState]);
 const visible=vehicles.filter(v=>!v.removed);
 return <><section className="tp-panel"><h2>Vehículos</h2><p className="tp-hint">Quitar un vehículo lo oculta del cotizador y conserva su historial y sus servicios asignados.</p>{visible.map(v=><VehicleAction key={v.id} vehicle={v}/>)}<form ref={ref} action={addAction} className="tp-inline-form"><input type="hidden" name="intent" value="add"/><label className="tp-field">Nombre del vehículo<input name="name" className="tp-input" required minLength={2} maxLength={60} placeholder="Ej: Bicicleta de ruta"/></label><SubmitButton>Añadir vehículo</SubmitButton></form>{addState.message&&<p role="status" className="tp-hint">{addState.message}</p>}{vehicles.some(v=>v.removed)&&<details><summary>Vehículos quitados</summary>{vehicles.filter(v=>v.removed).map(v=><VehicleAction key={v.id} vehicle={v}/>)}</details>}</section>
 <form action={action} className="tp-panel" key={visible.map(v=>v.slug).join(',')}><h2>Servicios y packs por vehículo</h2><p className="tp-hint">Marca qué incluye cada vehículo en “Arma tu cotización”. Los borradores aparecen cuando los activas. Los componentes deben admitir los mismos vehículos que sus packs.</p>{state.message&&<p className="tp-alert" role="status">{state.message}</p>}<div className="tp-table-wrap"><table className="tp-table"><thead><tr><th>Servicio o pack</th>{visible.map(v=><th key={v.slug}>{v.name}</th>)}</tr></thead><tbody>{services.filter(s=>!s.removed).map(s=><tr key={s.id}><td>{s.name}<small className="tp-hint"> · {s.kind==="package"?"Pack":"Individual"}{!s.active?" · Borrador / oculto":""}</small></td>{visible.map(v=><td key={v.slug}><input type="checkbox" name={`vehicle-${v.slug}-${s.id}`} defaultChecked={s.vehicles.includes(v.slug)} aria-label={`${s.name}: ${v.name}`}/></td>)}</tr>)}</tbody></table></div><SubmitButton pendingText="Guardando vehículos…">Guardar vehículos</SubmitButton></form></>;
}
