"use client";

import { useActionState } from "react";
import { sendContactMessage } from "@/actions/contact";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/forms";

export function ContactForm({ subject = "contacto" }: { subject?: "contacto" | "eventos" }) {
  const [state, action] = useActionState<FormState, FormData>(sendContactMessage, {});

  if (state.ok) {
    return (
      <div className="tp-alert tp-alert-ok" role="status">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="tp-form" noValidate>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      <Field name="name" label="Nombre" state={state} autoComplete="name" required />
      <div className="tp-form-grid">
        <Field name="phone" label="Celular" state={state} type="tel" inputMode="tel" autoComplete="tel" placeholder="9 1234 5678" />
        <Field name="email" label="Email" state={state} type="email" autoComplete="email" optional />
      </div>
      {subject === "eventos" && (
        <div className="tp-form-grid">
          <Field name="eventDate" label="Fecha del evento" type="date" state={state} optional />
          <Field name="attendees" label="Participantes aprox." inputMode="numeric" state={state} optional />
          <Field name="eventPlace" label="Lugar" state={state} optional className="tp-span-2" placeholder="Ej: Plaza de Tierra Amarilla" />
        </div>
      )}
      <Field
        name="message"
        label={subject === "eventos" ? "Cuéntanos del evento" : "Mensaje"}
        as="textarea"
        state={state}
        required
        rows={5}
        placeholder={subject === "eventos" ? "Tipo de evento, horario y qué necesitas del taller" : undefined}
      />
      <input type="hidden" name="subject" value={subject} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" hidden aria-hidden="true" />
      <div>
        <SubmitButton>Enviar mensaje</SubmitButton>
      </div>
    </form>
  );
}
