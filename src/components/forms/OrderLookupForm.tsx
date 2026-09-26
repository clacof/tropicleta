"use client";

import { useActionState } from "react";
import { lookupOrder } from "@/actions/order-lookup";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/forms";

export function OrderLookupForm() {
  const [state, action] = useActionState<FormState, FormData>(lookupOrder, {});
  return (
    <form action={action} className="tp-form">
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      <Field name="code" label="Número de orden" state={state} placeholder="TPC-XXXXXXXXXX" required />
      <Field name="email" label="Email de la compra" type="email" state={state} required />
      <div>
        <SubmitButton pendingText="Buscando…">Ver mi orden</SubmitButton>
      </div>
    </form>
  );
}
