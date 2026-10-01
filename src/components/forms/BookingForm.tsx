"use client";


import { multiVehicleQuote,vehicleQuotesSchema,setSelectionQuantity,cleanSelectionQuantities,type VehicleQuote } from "@/lib/multi-quote";
import { PackageSelector, type PackageCatalog } from "./PackageSelector";
import { supportsVehicle, toggleSelection, emptySelection, type QuoteVehicle, type Selection } from "@/lib/package-quote";
import { formatCLP } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { serviceQuote, pickupPrices, oneWayPrices, transportLabels, type TransportMode, type QuoteService } from "@/lib/service-quote";
import { useActionState, useState, useEffect } from "react";

import { createBooking } from "@/actions/booking";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { deliveryCommunes } from "@/data/shop";
import type { FormState } from "@/lib/forms";

type Catalog = PackageCatalog;

export function BookingForm({ catalog, vehicles, preselected, minDate }: { catalog: Catalog; vehicles:QuoteVehicle[]; preselected?: string; minDate: string }) {
  const [state, action] = useActionState<FormState, FormData>(createBooking, {});
  const all = catalog.flatMap(c => c.services);
  const initial = all.find(s => s.slug === preselected && vehicles.some(v=>s.vehicles.includes(v.slug)));
  const initialVehicle=vehicles.find(v=>initial?.vehicles.includes(v.slug))?.slug ?? vehicles[0]?.slug ?? "";
  const [vehicleQuotes,setVehicleQuotes]=useState<VehicleQuote[]>([{id:"vehicle-1",vehicle:initialVehicle,details:"",selection:initial?{manual:initial.kind==="package"?[]:[initial.slug],packages:initial.kind==="package"?[initial.slug]:[],excluded:[]}:emptySelection}]);
  const [activeId,setActiveId]=useState("vehicle-1");
  const active=vehicleQuotes.find(v=>v.id===activeId)??vehicleQuotes[0];
  const vehicle=active.vehicle;const selection=active.selection;const doubleSuspension=false;
  const setVehicle=(vehicle:string)=>setVehicleQuotes(rows=>rows.map(r=>r.id===active.id?{...r,vehicle}:r));

  const setSelection=(change:(selection:Selection)=>Selection)=>setVehicleQuotes(rows=>rows.map(r=>r.id===active.id?{...r,selection:cleanSelectionQuantities(all,change(r.selection))}:r));
  const [query, setQuery] = useState("");
  const [pickup, setPickup] = useState(false);
  const [commune, setCommune] = useState("");
  const [transportMode, setTransportMode] = useState<TransportMode>("both");
  const [firstService, setFirstService] = useState(false);
  const [draftReady,setDraftReady] = useState(false);
  useEffect(()=>{try{const text=sessionStorage.getItem("tp-service-draft-v2");if(text&&!preselected){const saved=JSON.parse(text);const rows=vehicleQuotesSchema.parse(saved.vehicles);multiVehicleQuote(all,rows,vehicles);setVehicleQuotes(rows);setActiveId(rows[0].id);setPickup(!!saved.pickup);setCommune(saved.commune??"");setFirstService(!!saved.firstService);if(saved.transportMode in transportLabels)setTransportMode(saved.transportMode);}}catch{}setDraftReady(true);},[]);
  useEffect(()=>{if(draftReady)try{sessionStorage.setItem("tp-service-draft-v2",JSON.stringify({vehicles:vehicleQuotes,pickup,commune,firstService,transportMode}));}catch{}},[draftReady,vehicleQuotes,pickup,commune,firstService,transportMode]);
  let selectionError="";let groups:ReturnType<typeof multiVehicleQuote>=[];
  try{groups=multiVehicleQuote(all,vehicleQuotes,vehicles);}catch(e){selectionError=e instanceof Error?e.message:"No se puede cotizar esta selección.";}
  const calculation=groups.find(g=>g.id===active.id)?.calculation;
  const chosen=groups.flatMap(g=>g.calculation.lines);
  const quote=serviceQuote(chosen,pickup,commune,transportMode,firstService);
  const toggle=(slug:string)=>setSelection(prev=>toggleSelection(all,prev,slug));
  const changeQuantity=(slug:string,quantity:number)=>setSelection(prev=>setSelectionQuantity(all,prev,slug,quantity));
  const priceLabel=(s:QuoteService)=>s.price===null?"A cotizar":(s.priceFrom?"Desde ":"")+formatCLP(s.price);
  const vehicleLabel=vehicles.find(v=>v.slug===vehicle)?.name??"Selecciona un vehículo";
  const message=["Hola Tropicleta, quiero solicitar esta cotización:",...groups.flatMap(g=>[g.label+(g.details?" · "+g.details:""),...g.calculation.lines.flatMap(s=>[s.name+" ×"+s.quantity+": "+(s.price===null?"A cotizar":(s.priceFrom?"Desde ":"")+formatCLP(s.price*s.quantity)),...s.included.map(slug=>"  Incluido: "+all.find(s=>s.slug===slug)!.name+" ×"+s.includedQuantities[slug])]),"Subtotal del vehículo: "+formatCLP(serviceQuote(g.calculation.lines).subtotal)]),"Subtotal de servicios: "+formatCLP(quote.subtotal),...(firstService?["Primer servicio: descuento 10% en servicios · -"+formatCLP(quote.discount)]:[]),...(pickup?[transportLabels[transportMode]+": "+(commune||"zona por definir")+" · "+(quote.transport===null?"A cotizar":formatCLP(quote.transport))]:[]),"Total estimado: "+formatCLP(quote.total),...(quote.pending?["Hay valores pendientes de cotizar."]:[]),"Sujeto a diagnóstico y confirmación del taller."].join("\n");
  const incomplete=groups.some(g=>!g.calculation.leaves.length);
  const val = (k: string) => (typeof state.values?.[k] === "string" ? (state.values[k] as string) : undefined);
  const err = (k: string) =>
    state.errors?.[k] && (
      <span className="tp-error" role="alert">
        {state.errors[k]}
      </span>
    );

  return (
    <form action={action} className="tp-form tp-quote-layout" noValidate>
      <div>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}

      <section className="tp-vehicle-picker" aria-label="Vehículos de la cotización"><div className="tp-vehicle-tabs">{vehicleQuotes.map((row,i)=><button key={row.id} type="button" className={"tp-btn tp-btn-sm "+(row.id===active.id?"tp-btn-primary":"tp-btn-secondary")} aria-pressed={row.id===active.id} onClick={()=>setActiveId(row.id)}>{vehicles.find(v=>v.slug===row.vehicle)?.name??"Vehículo"} {i+1}</button>)}</div><div className="tp-vehicle-actions"><button type="button" className="tp-btn tp-btn-secondary tp-btn-sm" disabled={vehicleQuotes.length>=10||!vehicles.length} onClick={()=>{const id=crypto.randomUUID();setVehicleQuotes(rows=>[...rows,{id,vehicle:vehicles[0]?.slug??"",details:"",selection:emptySelection}]);setActiveId(id);setQuery("");}}>+ Añadir otro vehículo</button>{vehicleQuotes.length>1&&<button type="button" className="tp-btn tp-btn-ghost tp-btn-sm" onClick={()=>{const rows=vehicleQuotes.filter(r=>r.id!==active.id);setVehicleQuotes(rows);setActiveId(rows[0].id);}}>Quitar este vehículo</button>}</div><p className="tp-hint">Elige servicios y cantidades para cada vehículo. Los packs se calculan por separado para cada uno.</p></section>
      <PackageSelector onQuantity={changeQuantity} vehicles={vehicles} catalog={catalog} selection={selection} vehicle={vehicle} doubleSuspension={doubleSuspension} query={query} covered={calculation?.lines.flatMap(s=>s.included)??[]} onQuery={setQuery} onToggle={toggle} onVehicle={(v,isDouble)=>{setVehicle(v);setSelection(prev=>({quantities:prev.quantities,manual:prev.manual.filter(slug=>!!all.find(s=>s.slug===slug) && supportsVehicle(all.find(s=>s.slug===slug)!,v,isDouble)),packages:prev.packages.filter(slug=>{const service=all.find(s=>s.slug===slug);return !!service && supportsVehicle(service,v,isDouble);}),excluded:prev.excluded.filter(slug=>!!all.find(s=>s.slug===slug) && supportsVehicle(all.find(s=>s.slug===slug)!,v,isDouble))}));}} />
      <input type="hidden" name="vehicleQuotes" value={JSON.stringify(vehicleQuotes)}/>
      <input type="hidden" name="selection" value={JSON.stringify(selection)} />
      {[...new Set(groups.flatMap(g=>g.calculation.leaves))].map(slug=><input key={slug} type="hidden" name="services" value={slug} />)}
      {selectionError && <p className="tp-alert" role="alert">{selectionError}</p>}
      {err("services")}
      <fieldset className="tp-fieldset">
        <legend className="tp-label">2. Tu vehículo, bicicleta o scooter</legend>
        <label className="tp-field">Marca, modelo o detalle de {vehicleLabel}<input className="tp-input" name="vehicleDetails" maxLength={200} value={active.details} onChange={e=>setVehicleQuotes(rows=>rows.map(r=>r.id===active.id?{...r,details:e.target.value}:r))} placeholder="Ej: MTB aro 29, frenos hidráulicos"/></label>
      </fieldset>

      <fieldset className="tp-fieldset">
        <legend className="tp-label">3. ¿Cuándo te acomoda?</legend>
        <div className="tp-form-grid">
          <Field name="preferredDate" label="Fecha preferida" type="date" min={minDate} state={state} required />
          <div className="tp-field">
            <span className="tp-label">Bloque</span>
            <div className="tp-options tp-options-2">
              {[
                ["manana", "Mañana"],
                ["tarde", "Tarde"],
              ].map(([v, l]) => (
                <label key={v} className="tp-option">
                  <input type="radio" name="timeSlot" value={v} defaultChecked={(val("timeSlot") ?? "manana") === v} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
            {err("timeSlot")}
          </div>
        </div>
        <span className="tp-hint">Es una preferencia: te confirmamos la hora exacta por WhatsApp.</span>
      </fieldset>

      <fieldset className="tp-fieldset" id="retiro-entrega">
        <legend className="tp-label">4. Retiro y entrega</legend>
        <label className="tp-option">
          <input type="checkbox" name="pickup" checked={pickup} onChange={(e) => setPickup(e.target.checked)} />
          <span>
            Quiero retiro o entrega a domicilio
            <small>Selecciona primero tu zona y luego el trayecto. El transporte se suma a la cotización.</small>
          </span>
        </label>
        {pickup && (
          <>
          <div className="tp-form-grid">
            <Field name="pickupCommune" label="Comuna / sector" as="select" state={state} value={commune} onChange={e => setCommune(e.target.value)}>
              <option value="" disabled>
                Elige una opción
              </option>
              {deliveryCommunes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Field>
          </div>
          {commune && <>
            <div className="tp-options">{(["pickup", "delivery", "both"] as TransportMode[]).map(mode => <label key={mode} className="tp-option"><input type="radio" name="transportMode" value={mode} checked={transportMode === mode} onChange={() => setTransportMode(mode)} /><span>{transportLabels[mode]} · {formatCLP((mode === "both" ? pickupPrices : oneWayPrices)[commune])}</span></label>)}</div>
            {err("transportMode")}
            <Field name="pickupAddress" label="Dirección" state={state} autoComplete="street-address" />
          </>}
          </>
        )}
      </fieldset>

      <fieldset className="tp-fieldset">
        <legend className="tp-label">5. Tus datos</legend>
        <Field name="name" label="Nombre" state={state} autoComplete="name" required />
        <div className="tp-form-grid">
          <Field name="phone" label="Celular (WhatsApp)" type="tel" inputMode="tel" autoComplete="tel" placeholder="9 1234 5678" state={state} required />
          <Field name="email" label="Email" type="email" autoComplete="email" state={state} optional hint="Para enviarte el comprobante" />
        </div>
        <Field name="notes" label="Comentarios" as="textarea" rows={3} state={state} optional placeholder="Cuéntanos qué le pasa a tu bici" />
      </fieldset>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />

      <div>
        <SubmitButton disabled={!vehicles.some(v=>v.slug===vehicle) || !!selectionError || !chosen.length || incomplete} pendingText="Enviando solicitud…">Enviar cotización y solicitar hora</SubmitButton>
      </div>
      </div>
      <aside className="tp-local-box tp-quote-summary" aria-label="Tu cotización">
        <h2>Tu cotización</h2><p className="tp-hint">{vehicleQuotes.length} {vehicleQuotes.length===1?"vehículo":"vehículos"}</p>
        <label className="tp-option"><input type="checkbox" name="firstService" checked={firstService} onChange={e => setFirstService(e.target.checked)} /><span>Es mi primer servicio en Tropicleta<small>10% de descuento en el total de servicios. No incluye retiro, entrega ni repuestos.</small></span></label>
        {groups.map(g=><section key={g.id} className="tp-vehicle-summary"><h3>{g.label}</h3>{g.details&&<p className="tp-hint">{g.details}</p>}{!g.calculation.lines.length?<p className="tp-hint">Selecciona servicios para este vehículo.</p>:<ul className="tp-quote-items">{g.calculation.lines.map(s=><li key={s.slug}><span>{s.name} ×{s.quantity}<small>{priceLabel(s)} por unidad · {s.price===null?"A cotizar":formatCLP(s.price*s.quantity)}{s.automatic?" · Pack reconocido":""}</small>{s.included.map(slug=><small key={slug}>✓ {all.find(c=>c.slug===slug)!.name} ×{s.includedQuantities[slug]} · Incluido</small>)}</span><button type="button" className="tp-btn tp-btn-ghost tp-btn-sm" onClick={()=>{setActiveId(g.id);setVehicleQuotes(rows=>rows.map(r=>r.id===g.id?{...r,selection:cleanSelectionQuantities(all,s.automatic?{...r.selection,manual:r.selection.manual.filter(slug=>!s.included.includes(slug)),excluded:[...new Set([...r.selection.excluded,...s.included])]}:setSelectionQuantity(all,r.selection,s.slug,0))}:r));}} aria-label={"Quitar "+s.name+" de "+g.label}>Quitar</button></li>)}</ul>}<p className="tp-hint">Subtotal: <strong>{formatCLP(serviceQuote(g.calculation.lines).subtotal)}</strong></p></section>)}
        <dl className="tp-dl">
          <div><dt>Servicios</dt><dd>{formatCLP(quote.subtotal)}</dd></div>
          {firstService && <div><dt>Primer servicio −10%</dt><dd>−{formatCLP(quote.discount)}</dd></div>}
          {pickup && <div><dt>{transportLabels[transportMode]}{commune ? ` · ${commune}` : ""}</dt><dd>{quote.transport === null ? "Elige tu zona" : formatCLP(quote.transport)}</dd></div>}
          <div aria-live="polite" aria-atomic="true"><dt>{quote.from ? "Total estimado desde" : "Total estimado"}</dt><dd className="tp-quote-total">{formatCLP(quote.total)}</dd></div>
        </dl>
        {quote.pending && <p>Hay servicios o transporte pendientes de cotizar; no están incluidos en la suma.</p>}
        <p className="tp-hint">El taller confirma el valor final tras el diagnóstico gratuito. Repuestos y trabajos adicionales se cotizan aparte. Revisaremos si los servicios elegidos incluyen trabajos en común.</p>
        {chosen.length > 0 && !selectionError && !incomplete && <a className="tp-btn tp-btn-primary" href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">Enviar cotización por WhatsApp</a>}
        <p className="tp-hint">También puedes completar tus datos y fecha preferida para registrar la solicitud.</p>
      </aside>
    </form>
  );
}
