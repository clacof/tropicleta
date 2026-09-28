"use client";

import { useActionState, useRef } from "react";
import type { FormState } from "@/lib/forms";
import { statusLabel } from "./StatusBadge";

/** Selector de estado que se guarda al cambiar, sin botón extra. */
export function StatusSelect({
  id,
  status,
  options,
  action,
}: {
  id: number;
  status: string;
  options: readonly string[];
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={formAction} className="tp-inline-form">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        className="tp-select"
        defaultValue={status}
        aria-label="Cambiar estado"
        disabled={pending}
        onChange={() => ref.current?.requestSubmit()}
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s] ?? s}
          </option>
        ))}
      </select>
      <span className="tp-hint" role="status" aria-live="polite">
        {pending ? "Guardando…" : state.message}
      </span>
    </form>
  );
}
