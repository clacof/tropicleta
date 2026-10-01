"use client";

import { useActionState, useState } from "react";
import { vehicleLabels, type Vehicle, type Component } from "@/lib/package-quote";
import { packageReference } from "@/lib/package-reference";
import { formatCLP } from "@/lib/format";
import { requestedPackageReferences } from "@/data/package-references";
import { saveService } from "@/actions/admin";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import type { Service, ServiceCategory } from "@/db/schema";
import type { FormState } from "@/lib/forms";

export function ServiceForm({ service, categories, services, packMode = false }: { service: Service | null; categories: ServiceCategory[]; services: Service[]; packMode?: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(saveService, {});
  const s = service;
  const [kind, setKind] = useState(packMode ? "package" : s?.kind ?? "individual");
  const [doubleSuspension, setDoubleSuspension] = useState(s?.requiresDoubleSuspension ?? false);
  const [packPrice, setPackPrice] = useState(s?.price?.toString() ?? "");
  const [vehicles, setVehicles] = useState<Vehicle[]>(s?.vehicles ?? ["bicicleta", "electrica"]);
  const [components, setComponents] = useState<Component[]>(s?.components ?? []);
  const [individual, setIndividual] = useState(s?.individuallySelectable ?? true);
  let reference = null;
  try {const candidate={slug:s?.slug ?? "__nuevo_pack",name:s?.name ?? "Nuevo pack",kind,components,vehicles,individuallySelectable:individual,active:false,price:packPrice?Number(packPrice.replace(/\D/g,"")):null,priceFrom:false};reference=packageReference([...services.filter(c=>c.id!==s?.id),candidate],candidate);}catch{}
  return (
    <form action={action} className="tp-panel tp-form" style={{ maxWidth: 820 }}>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      {s && <input type="hidden" name="id" value={s.id} />}

      {Object.values(state.errors ?? {}).map((error,i)=><p key={i} className="tp-error" role="alert">{error}</p>)}
      <input type="hidden" name="hierarchy" value={JSON.stringify({kind, vehicles, requiresDoubleSuspension:doubleSuspension, individuallySelectable:individual, components:kind === "package" ? components : []})} />
      <fieldset className="tp-fieldset"><legend className="tp-label">Tipo y compatibilidad</legend>
        <label className="tp-field">Tipo<select className="tp-input" value={kind} disabled={packMode} onChange={e=>setKind(e.target.value)}><option value="individual">Servicio individual</option><option value="package">Paquete de servicios</option></select></label>
        <div className="tp-options">{(Object.keys(vehicleLabels) as Vehicle[]).map(v=><label className="tp-option" key={v}><input type="checkbox" checked={vehicles.includes(v)} onChange={()=>setVehicles(vehicles.includes(v)?vehicles.filter(x=>x!==v):[...vehicles,v])} /><span>{vehicleLabels[v]}</span></label>)}</div>
        <label className="tp-option"><input type="checkbox" checked={individual} onChange={e=>setIndividual(e.target.checked)} /><span>Se puede elegir directamente en el cotizador<small>Desmarca para trabajos disponibles solo dentro de paquetes.</small></span></label>
        <label className="tp-option"><input type="checkbox" checked={doubleSuspension} onChange={e=>setDoubleSuspension(e.target.checked)} /><span>Solo bicicletas de doble suspensión</span></label>
      </fieldset>
      {kind === "package" && <fieldset className="tp-fieldset"><legend className="tp-label">Componentes del paquete</legend><p className="tp-hint">Marca servicios o paquetes y sus componentes obligatorios. Sin componentes queda pendiente de definición y se cotiza por separado.</p>
        <div className="tp-package-editor">{services.filter(c=>c.id!==s?.id&&!c.removed).map(c=>{const selected=components.find(x=>x.slug===c.slug); const compatible=vehicles.every(v=>c.vehicles.includes(v)) && (!c.requiresDoubleSuspension||doubleSuspension) && (c.kind!=="package" || c.components.length>0); return <div key={c.slug}><label className="tp-option"><input type="checkbox" checked={!!selected} disabled={!compatible && !selected} onChange={()=>setComponents(selected?components.filter(x=>x.slug!==c.slug):[...components,{slug:c.slug,required:true}])} /><span>{c.name}<small>{c.kind === "package" ? "Paquete" : "Servicio"} · {c.price===null?"A cotizar":formatCLP(c.price)}{!c.active?" · Borrador u oculto":""}{!compatible?" · Incompatible":""}</small></span></label>{selected && <label className="tp-hint"><input type="checkbox" checked={selected.required} onChange={e=>setComponents(components.map(x=>x.slug===c.slug?{...x,required:e.target.checked}:x))} /> Obligatorio para reconocer el paquete</label>}</div>})}</div>
        <p className="tp-draft-note">{reference ? <>Valor individual actual: <strong>{formatCLP(reference.reference)}</strong>. {reference.savings!==null && <>Ahorro: <strong>{formatCLP(reference.savings)}</strong>.</>}</> : "Define componentes con precios fijos para calcular el ahorro."}</p>
        {s && reference && requestedPackageReferences[s.slug] && requestedPackageReferences[s.slug]!==reference.reference && <p className="tp-alert">La referencia del documento era {formatCLP(requestedPackageReferences[s.slug])}; los servicios individuales actuales suman {formatCLP(reference.reference)}. Conservamos sus precios: revisa el pack antes de activarlo.</p>}
      </fieldset>}
      <div className="tp-form-grid">
        <Field name="name" label="Nombre" state={state} defaultValue={s?.name} required />
        <Field name="categoryId" label="Categoría" as="select" state={state} defaultValue={s ? String(s.categoryId) : ""}>
          <option value="" disabled>
            Elige…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
        <Field name="price" label="Precio (CLP)" state={state} value={packPrice} onChange={e=>setPackPrice(e.target.value)} inputMode="numeric" hint="Vacío = A cotizar" />
        <Field name="duration" label="Tiempo estimado" state={state} defaultValue={s?.duration ?? ""} optional placeholder="Ej: 24 a 48 horas" />
        <Field name="summary" label="Resumen" state={state} defaultValue={s?.summary ?? ""} className="tp-span-2" optional />
        <Field name="description" label="Descripción" as="textarea" rows={4} state={state} defaultValue={s?.description ?? ""} className="tp-span-2" optional />
        <Field
          name="includes"
          label="Qué incluye (uno por línea)"
          as="textarea"
          rows={4}
          state={state}
          defaultValue={s?.includes.join("\n") ?? ""}
          className="tp-span-2"
          optional
        />
        <Field name="slug" label="URL (slug)" state={state} defaultValue={s?.slug ?? ""} optional hint="Se genera desde el nombre si lo dejas vacío" />
        <Field name="sort" label="Orden" type="number" state={state} defaultValue={String(s?.sort ?? 0)} />
      </div>
      <div className="tp-options tp-options-2">
        <label className="tp-option">
          <input type="checkbox" name="priceFrom" defaultChecked={s?.priceFrom} />
          <span>Mostrar “desde”</span>
        </label>
        <label className="tp-option">
          <input type="checkbox" name="featured" defaultChecked={s?.featured} />
          <span>Destacado en la home (máx. 3)</span>
        </label>
        <label className="tp-option">
          <input type="checkbox" name="active" defaultChecked={s?.active ?? !packMode} />
          <span>Visible en el sitio<small>Para publicar un pack, sus componentes deben estar activos.</small></span>
        </label>
      </div>
      <div>
        <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
      </div>
    </form>
  );
}
