"use client";

import { useActionState, useState } from "react";
import { createBooking } from "@/actions/booking";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { deliveryCommunes } from "@/data/shop";
import type { FormState } from "@/lib/forms";

type Catalog = { slug: string; name: string; services: { slug: string; name: string }[] }[];

export function BookingForm({ catalog, preselected, minDate }: { catalog: Catalog; preselected?: string; minDate: string }) {
  const [state, action] = useActionState<FormState, FormData>(createBooking, {});
  const prevServices = state.values?.services;
  const selected = new Set(
    prevServices ? (Array.isArray(prevServices) ? prevServices : [prevServices]) : preselected ? [preselected] : [],
  );
  const [pickup, setPickup] = useState(state.values?.pickup === "on");
  const val = (k: string) => (typeof state.values?.[k] === "string" ? (state.values[k] as string) : undefined);
  const err = (k: string) =>
    state.errors?.[k] && (
      <span className="tp-error" role="alert">
        {state.errors[k]}
      </span>
    );

  return (
    <form action={action} className="tp-form" noValidate>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}

      <fieldset className="tp-fieldset">
        <legend className="tp-label">1. ¿Qué necesitas?</legend>
        {catalog.map((c) => (
          <div key={c.slug} style={{ display: "grid", gap: 8 }}>
            <span className="tp-hint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>
              {c.name}
            </span>
            <div className="tp-options tp-options-2">
              {c.services.map((s) => (
                <label key={s.slug} className="tp-option">
                  <input type="checkbox" name="services" value={s.slug} defaultChecked={selected.has(s.slug)} />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {err("services")}
      </fieldset>

      <fieldset className="tp-fieldset">
        <legend className="tp-label">2. Tu vehículo</legend>
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

      <fieldset className="tp-fieldset">
        <legend className="tp-label">4. Retiro a domicilio</legend>
        <label className="tp-option">
          <input type="checkbox" name="pickup" checked={pickup} onChange={(e) => setPickup(e.target.checked)} />
          <span>
            Quiero que retiren y entreguen mi {val("vehicleType") === "scooter" ? "scooter" : "bici"}
            <small>Sectores definidos de Tierra Amarilla, Paipote y Copiapó. Costo según sector.</small>
          </span>
        </label>
        {pickup && (
          <div className="tp-form-grid">
            <Field name="pickupCommune" label="Comuna / sector" as="select" state={state} defaultValue="">
              <option value="" disabled>
                Elige una opción
              </option>
              {deliveryCommunes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Field>
            <Field name="pickupAddress" label="Dirección" state={state} autoComplete="street-address" />
          </div>
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
        <SubmitButton pendingText="Enviando solicitud…">Solicitar hora</SubmitButton>
      </div>
    </form>
  );
}
