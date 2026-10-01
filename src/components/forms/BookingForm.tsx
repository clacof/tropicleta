"use client";

import { PackageSelector, type PackageCatalog } from "./PackageSelector";
import { packageQuote, toggleSelection, selectedLeaves, emptySelection, type Selection, type Vehicle } from "@/lib/package-quote";
import { formatCLP } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { serviceQuote, pickupPrices, oneWayPrices, transportLabels, type TransportMode, type QuoteService } from "@/lib/service-quote";
import { useActionState, useState, useEffect } from "react";
import { selectionSchema } from "@/lib/quote-selection";
import { createBooking } from "@/actions/booking";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { deliveryCommunes } from "@/data/shop";
import type { FormState } from "@/lib/forms";

type Catalog = PackageCatalog;

export function BookingForm({ catalog, preselected, minDate }: { catalog: Catalog; preselected?: string; minDate: string }) {
  const [state, action] = useActionState<FormState, FormData>(createBooking, {});
  const all = catalog.flatMap(c => c.services);
  const initial = all.find(s => s.slug === preselected && s.vehicles.some(v => v === "bicicleta" || v === "scooter"));
  const [vehicle, setVehicle] = useState<Vehicle>(initial?.vehicles.includes("bicicleta") ? "bicicleta" : initial ? "scooter" : "bicicleta");
  const [doubleSuspension,setDoubleSuspension] = useState(initial?.requiresDoubleSuspension ?? false);
  const [selection, setSelection] = useState<Selection>(initial ? {manual:initial.kind === "package" ? [] : [initial.slug],packages:initial.kind === "package" ? [initial.slug] : [],excluded:[]} : emptySelection);
  const [query, setQuery] = useState("");
  const [pickup, setPickup] = useState(false);
  const [commune, setCommune] = useState("");
  const [transportMode, setTransportMode] = useState<TransportMode>("both");
  const [firstService, setFirstService] = useState(false);
  const [draftReady,setDraftReady] = useState(false);
  useEffect(()=>{try {const text=sessionStorage.getItem("tp-service-draft-v1"); if(text && !preselected) {const saved=JSON.parse(text); const candidate=selectionSchema.parse(saved.selection); if(saved.vehicle === "bicicleta" || saved.vehicle === "scooter") {packageQuote(all,candidate,saved.vehicle,saved.vehicle === "bicicleta" && !!saved.doubleSuspension);setDoubleSuspension(saved.vehicle === "bicicleta" && !!saved.doubleSuspension);setVehicle(saved.vehicle);setSelection(candidate);setPickup(!!saved.pickup);setCommune(saved.commune??"");setFirstService(!!saved.firstService);if(saved.transportMode in transportLabels)setTransportMode(saved.transportMode);}}}catch{}setDraftReady(true);},[]);
  useEffect(()=>{if(draftReady)try{sessionStorage.setItem("tp-service-draft-v1",JSON.stringify({vehicle,doubleSuspension,selection,pickup,commune,firstService,transportMode}));}catch{}},[draftReady,vehicle,doubleSuspension,selection,pickup,commune,firstService,transportMode]);
  let calculation; let selectionError = "";
  try { calculation = packageQuote(all, selection, vehicle, doubleSuspension); } catch(e) { selectionError = e instanceof Error ? e.message : "No se puede cotizar esta selección."; }
  const chosen = calculation?.lines ?? [];
  const quote = serviceQuote(chosen, pickup, commune, transportMode, firstService);
  const toggle = (slug:string) => setSelection(prev => toggleSelection(all,prev,slug));
  const priceLabel = (s: QuoteService) => s.price === null ? "A cotizar" : (s.priceFrom ? "Desde " : "") + formatCLP(s.price);
  const vehicleLabel = doubleSuspension ? "Bicicleta doble suspensión" : vehicle === "scooter" ? "Scooter eléctrico" : "Bicicleta";
  const message = ["Hola Tropicleta, quiero solicitar esta cotización:", "Vehículo: " + vehicleLabel, ...chosen.flatMap(s => [s.name + ": " + priceLabel(s), ...s.included.map(slug=>"  Incluido: " + all.find(s=>s.slug===slug)!.name)]),
    "Subtotal de servicios: " + formatCLP(quote.subtotal),
    ...(firstService ? ["Primer servicio: descuento 10% en servicios · -" + formatCLP(quote.discount)] : []),
    ...(pickup ? [transportLabels[transportMode] + ": " + (commune || "zona por definir") + " · " + (quote.transport === null ? "A cotizar" : formatCLP(quote.transport))] : []),
    "Total estimado: " + formatCLP(quote.total), ...(quote.pending ? ["Hay valores pendientes de cotizar."] : []),
    "Sujeto a diagnóstico y confirmación del taller."].join("\n");
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

      <PackageSelector catalog={catalog} selection={selection} vehicle={vehicle} doubleSuspension={doubleSuspension} query={query} covered={chosen.flatMap(s=>s.included)} onQuery={setQuery} onToggle={toggle} onVehicle={(v,isDouble)=>{setVehicle(v);setDoubleSuspension(isDouble);setSelection(prev=>({manual:prev.manual.filter(slug=>all.find(s=>s.slug===slug)?.vehicles.includes(v)),packages:prev.packages.filter(slug=>{const service=all.find(s=>s.slug===slug);return service?.vehicles.includes(v) && (!service.requiresDoubleSuspension || isDouble);}),excluded:prev.excluded.filter(slug=>all.find(s=>s.slug===slug)?.vehicles.includes(v))}));}} />
      <input type="hidden" name="selection" value={JSON.stringify(selection)} />
      {selectedLeaves(all,selection).map(slug=><input key={slug} type="hidden" name="services" value={slug} />)}
      {selectionError && <p className="tp-alert" role="alert">{selectionError}</p>}
      {err("services")}
      <fieldset className="tp-fieldset">
        <legend className="tp-label">2. Tu vehículo, bicicleta o scooter</legend>
        <Field name="vehicleDetails" label="Marca, modelo o detalle" state={state} optional placeholder="Ej: MTB aro 29, frenos hidráulicos" />
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
        <SubmitButton disabled={!!selectionError || !chosen.length} pendingText="Enviando solicitud…">Enviar cotización y solicitar hora</SubmitButton>
      </div>
      </div>
      <aside className="tp-local-box tp-quote-summary" aria-label="Tu cotización">
        <h2>Tu cotización</h2><p className="tp-hint">{vehicleLabel}</p>
        <label className="tp-option"><input type="checkbox" name="firstService" checked={firstService} onChange={e => setFirstService(e.target.checked)} /><span>Es mi primer servicio en Tropicleta<small>10% de descuento en el total de servicios. No incluye retiro, entrega ni repuestos.</small></span></label>
        {chosen.length === 0 ? <p>Selecciona servicios para ver el desglose y el total.</p> : <ul className="tp-quote-items">{chosen.map(s => <li key={s.slug}><span>{s.name}<small>{priceLabel(s)}{s.automatic ? " · Paquete reconocido" : ""}</small>{s.included.map(slug=><small key={slug}>✓ {all.find(s=>s.slug===slug)!.name} · Incluido</small>)}</span>{!s.automatic && <button type="button" className="tp-btn tp-btn-secondary tp-btn-sm" onClick={() => setSelection(prev=>s.kind === "package" ? (prev.packages.includes(s.slug) ? {...prev,packages:prev.packages.filter(p=>p!==s.slug)} : {...prev,manual:prev.manual.filter(slug=>!s.included.includes(slug)),excluded:[...new Set([...prev.excluded,...s.included])]}) : toggleSelection(all,prev,s.slug))} aria-label={"Quitar " + s.name}>Quitar</button>}</li>)}</ul>}
        <dl className="tp-dl">
          <div><dt>Servicios</dt><dd>{formatCLP(quote.subtotal)}</dd></div>
          {firstService && <div><dt>Primer servicio −10%</dt><dd>−{formatCLP(quote.discount)}</dd></div>}
          {pickup && <div><dt>{transportLabels[transportMode]}{commune ? ` · ${commune}` : ""}</dt><dd>{quote.transport === null ? "Elige tu zona" : formatCLP(quote.transport)}</dd></div>}
          <div aria-live="polite" aria-atomic="true"><dt>{quote.from ? "Total estimado desde" : "Total estimado"}</dt><dd className="tp-quote-total">{formatCLP(quote.total)}</dd></div>
        </dl>
        {quote.pending && <p>Hay servicios o transporte pendientes de cotizar; no están incluidos en la suma.</p>}
        <p className="tp-hint">El taller confirma el valor final tras el diagnóstico gratuito. Repuestos y trabajos adicionales se cotizan aparte. Revisaremos si los servicios elegidos incluyen trabajos en común.</p>
        {chosen.length > 0 && !selectionError && <a className="tp-btn tp-btn-primary" href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">Enviar cotización por WhatsApp</a>}
        <p className="tp-hint">También puedes completar tus datos y fecha preferida para registrar la solicitud.</p>
      </aside>
    </form>
  );
}
