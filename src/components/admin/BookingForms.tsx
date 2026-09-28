"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { registerBookingPayment, saveBookingDetails } from "@/actions/admin";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { methods } from "@/lib/accounting-validation";
import type { FormState } from "@/lib/forms";

export function BookingDetailsForm({ id, internalNotes, quotedPrice }: { id: number; internalNotes: string | null; quotedPrice: number | null }) {
  const [state, action] = useActionState<FormState, FormData>(saveBookingDetails, {});
  return (
    <form action={action} className="tp-panel tp-form">
      <input type="hidden" name="id" value={id} />
      <Field name="quotedPrice" label="Presupuesto / precio final (CLP)" state={state} defaultValue={quotedPrice?.toString() ?? ""} inputMode="numeric" optional />
      <Field name="internalNotes" label="Notas internas" as="textarea" rows={4} state={state} defaultValue={internalNotes ?? ""} optional hint="Solo visibles en el panel" />
      {state.message && (
        <p role="status" className={`tp-alert${state.ok ? " tp-alert-ok" : ""}`}>
          {state.message}
        </p>
      )}
      <div>
        <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
      </div>
    </form>
  );
}

export function BookingPaymentForm({ id, today, requestId, suggested }: { id: number; today: string; requestId: string; suggested: number | null }) {
  const [state, action] = useActionState<FormState, FormData>(registerBookingPayment, {});
  const [key, setKey] = useState(requestId);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setKey(crypto.randomUUID());
    }
  }, [state]);
  return (
    <form ref={ref} action={action} className="tp-panel tp-form">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="requestId" value={key} />
      <div className="tp-form-grid">
        <Field name="amount" label="Monto cobrado (CLP)" type="number" min={1} step={1} state={state} defaultValue={suggested ? String(suggested) : ""} required />
        <Field name="date" label="Fecha" type="date" max={today} state={state} defaultValue={today} required />
        <Field name="method" label="Medio de pago" as="select" state={state} defaultValue="Efectivo">
          {methods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Field>
        <Field name="reference" label="Comprobante" state={state} optional maxLength={120} />
      </div>
      {state.message && (
        <p role="status" className={`tp-alert${state.ok ? " tp-alert-ok" : ""}`}>
          {state.message}
        </p>
      )}
      <div>
        <SubmitButton pendingText="Registrando…">Registrar cobro</SubmitButton>
      </div>
    </form>
  );
}
