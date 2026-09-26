"use client";

import { useActionState } from "react";
import { login } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/forms";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="tp-form">
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      <div className="tp-field">
        <label className="tp-label" htmlFor="password">
          Contraseña
        </label>
        <input id="password" name="password" type="password" className="tp-input" autoComplete="current-password" required autoFocus />
      </div>
      <SubmitButton className="tp-btn tp-btn-primary tp-btn-block" pendingText="Ingresando…">
        Ingresar
      </SubmitButton>
    </form>
  );
}
