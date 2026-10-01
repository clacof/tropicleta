"use client";
import { useActionState } from "react";
import { saveVehicleCatalog } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { Service } from "@/db/schema";
export function VehicleCatalog({services}:{services:Service[]}) {
  const [state,action]=useActionState(saveVehicleCatalog,{});
  return <form action={action} className="tp-panel"><p className="tp-hint">Elige dónde aparece cada servicio y pack en “Arma tu cotización”. Los borradores se mostrarán cuando los actives. Los componentes deben admitir los mismos vehículos que sus packs.</p>{state.message&&<p className="tp-alert" role="status">{state.message}</p>}<div className="tp-table-wrap"><table className="tp-table"><thead><tr><th>Servicio o pack</th><th>Bicicleta</th><th>Doble suspensión</th><th>Scooter eléctrico</th></tr></thead><tbody>{services.filter(s=>!s.removed).map(s=><tr key={s.id}><td>{s.name}<small className="tp-hint"> · {s.kind==="package"?"Pack":"Individual"}{!s.active?" · Borrador / oculto":""}</small></td><td><input type="checkbox" name={`bike-${s.id}`} defaultChecked={s.vehicles.includes("bicicleta")&&!s.requiresDoubleSuspension} aria-label={`${s.name}: Bicicleta`}/></td><td><input type="checkbox" name={`double-${s.id}`} defaultChecked={s.vehicles.includes("bicicleta")&&!s.excludesDoubleSuspension} aria-label={`${s.name}: Bicicleta doble suspensión`}/></td><td><input type="checkbox" name={`scooter-${s.id}`} defaultChecked={s.vehicles.includes("scooter")} aria-label={`${s.name}: Scooter eléctrico`}/></td></tr>)}</tbody></table></div><SubmitButton pendingText="Guardando vehículos…">Guardar vehículos</SubmitButton></form>;
}
