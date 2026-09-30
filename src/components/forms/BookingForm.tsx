"use client";

import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { serviceQuote, pickupPrices, oneWayPrices, transportLabels, type TransportMode, type QuoteService } from "@/lib/service-quote";
import { matchesSearch } from "@/lib/catalog-search";
import { useActionState, useState } from "react";
import { createBooking } from "@/actions/booking";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { deliveryCommunes } from "@/data/shop";
import type { FormState } from "@/lib/forms";

type Catalog = { slug: string; name: string; services: (QuoteService & { summary?: string | null })[] }[];

export function BookingForm({ catalog, preselected, minDate }: { catalog: Catalog; preselected?: string; minDate: string }) {
  const [state, action] = useActionState<FormState, FormData>(createBooking, {});
  const [selected, setSelected] = useState(() => new Set(preselected ? [preselected] : []));
  const [query, setQuery] = useState("");
  const [pickup, setPickup] = useState(false);
  const [commune, setCommune] = useState("");
  const [transportMode, setTransportMode] = useState<TransportMode>("both");
  const [firstService, setFirstService] = useState(false);
  const chosen = catalog.flatMap(c => c.services).filter(s => selected.has(s.slug));
  const quote = serviceQuote(chosen, pickup, commune, transportMode, firstService);
  const toggle = (slug: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(slug)) next.delete(slug); else if (next.size < 10) next.add(slug);
    return next;
  });
  const priceLabel = (s: QuoteService) => s.price === null ? "A cotizar" : (s.priceFrom ? "Desde " : "") + formatCLP(s.price);
  const message = ["Hola Tropicleta, quiero solicitar esta cotización:", ...chosen.map(s => s.name + ": " + priceLabel(s)),
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

      <fieldset className="tp-fieldset">
        <legend className="tp-label">1. Elige tus servicios</legend>
        <label className="tp-field">Buscar un servicio<input className="tp-input" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Frenos, cadena, suspensión…" /></label>
        <p className="tp-hint">Puedes elegir hasta 10 servicios. Los precios están en pesos chilenos.</p>
        {chosen.map(s => <input key={s.slug} type="hidden" name="services" value={s.slug} />)}
        {catalog.map((c) => (
          <div key={c.slug} id={c.slug} hidden={!c.services.some(s => matchesSearch(query, s.name, s.summary, c.name))} style={{ display: "grid", gap: 8 }}>
            <span className="tp-hint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
              {c.name}
            </span>
            <div className="tp-options tp-options-2">
            {c.slug === "scooters" && <p className="tp-hint" style={{ gridColumn: "1 / -1" }}>Solo realizamos parchados, cambio de cámara, inyección de líquido sellante tubeless y ajuste de frenos. Para el líquido, selecciona el servicio de $7.000 en Ruedas y sistema tubeless.</p>}
              {c.services.filter(s => matchesSearch(query, s.name, s.summary, c.name)).map((s) => (
                <label key={s.slug} className="tp-option">
                  <input type="checkbox" checked={selected.has(s.slug)} onChange={() => toggle(s.slug)} disabled={!selected.has(s.slug) && selected.size >= 10} />
                  <span>{s.name}<small>{priceLabel(s)}</small>{s.summary && <small>{s.summary}</small>}<Link href={`/servicios/${s.slug}/`}>Ver detalle</Link></span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {!catalog.some(c => c.services.some(s => matchesSearch(query, s.name, s.summary, c.name))) && <p>No encontramos servicios con esa búsqueda.</p>}
        {err("services")}
      </fieldset>

      <fieldset className="tp-fieldset">
        <legend className="tp-label">2. Tu vehículo, bicicleta o scooter</legend>
        <div className="tp-options tp-options-2">
          {[
            ["bicicleta", "Bicicleta"],
            ["scooter", "Scooter eléctrico"],
          ].map(([v, l]) => (
            <label key={v} className="tp-option">
              <input type="radio" name="vehicleType" value={v} defaultChecked={(val("vehicleType") ?? "bicicleta") === v} />
              <span>{l}</span>
            </label>
          ))}
        </div>
        {err("vehicleType")}
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
            <small>Selecciona el trayecto y tu zona. El transporte se suma a la cotización.</small>
          </span>
        </label>
        {pickup && (
          <>
          <div className="tp-options">{(Object.keys(transportLabels) as TransportMode[]).map(mode => <label key={mode} className="tp-option"><input type="radio" name="transportMode" value={mode} checked={transportMode === mode} onChange={() => setTransportMode(mode)} /><span>{transportLabels[mode]}</span></label>)}</div>
          {err("transportMode")}
          <div className="tp-form-grid">
            <Field name="pickupCommune" label="Comuna / sector" as="select" state={state} value={commune} onChange={e => setCommune(e.target.value)}>
              <option value="" disabled>
                Elige una opción
              </option>
              {deliveryCommunes.map((c) => (
                <option key={c} value={c}>
                  {c} · {formatCLP((transportMode === "both" ? pickupPrices : oneWayPrices)[c])}
                </option>
              ))}
            </Field>
            <Field name="pickupAddress" label="Dirección" state={state} autoComplete="street-address" />
          </div>
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
        <SubmitButton pendingText="Enviando solicitud…">Enviar cotización y solicitar hora</SubmitButton>
      </div>
      </div>
      <aside className="tp-local-box tp-quote-summary" aria-label="Tu cotización">
        <h2>Tu cotización</h2>
        <label className="tp-option"><input type="checkbox" name="firstService" checked={firstService} onChange={e => setFirstService(e.target.checked)} /><span>Es mi primer servicio en Tropicleta<small>10% de descuento en el total de servicios. No incluye retiro, entrega ni repuestos.</small></span></label>
        {chosen.length === 0 ? <p>Selecciona servicios para ver el desglose y el total.</p> : <ul className="tp-quote-items">{chosen.map(s => <li key={s.slug}><span>{s.name}<small>{priceLabel(s)}</small></span><button type="button" className="tp-btn tp-btn-secondary tp-btn-sm" onClick={() => toggle(s.slug)} aria-label={"Quitar " + s.name}>Quitar</button></li>)}</ul>}
        <dl className="tp-dl">
          <div><dt>Servicios</dt><dd>{formatCLP(quote.subtotal)}</dd></div>
          {firstService && <div><dt>Primer servicio −10%</dt><dd>−{formatCLP(quote.discount)}</dd></div>}
          {pickup && <div><dt>{transportLabels[transportMode]}{commune ? ` · ${commune}` : ""}</dt><dd>{quote.transport === null ? "Elige tu zona" : formatCLP(quote.transport)}</dd></div>}
          <div aria-live="polite" aria-atomic="true"><dt>{quote.from ? "Total estimado desde" : "Total estimado"}</dt><dd className="tp-quote-total">{formatCLP(quote.total)}</dd></div>
        </dl>
        {quote.pending && <p>Hay servicios o transporte pendientes de cotizar; no están incluidos en la suma.</p>}
        <p className="tp-hint">El taller confirma el valor final tras el diagnóstico gratuito. Repuestos y trabajos adicionales se cotizan aparte. Revisaremos si los servicios elegidos incluyen trabajos en común.</p>
        {chosen.length > 0 && <a className="tp-btn tp-btn-primary" href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer">Enviar cotización por WhatsApp</a>}
        <p className="tp-hint">También puedes completar tus datos y fecha preferida para registrar la solicitud.</p>
      </aside>
    </form>
  );
}
