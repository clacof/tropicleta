"use client";

import { useActionState, useState } from "react";
import { updateOrderStatus } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/forms";
import { statusLabel } from "./StatusBadge";

/** Cambio de estado de una orden: solo las transiciones permitidas; al anular ofrece reponer stock. */
export function OrderStatusForm({ id, status, options }: { id: number; status: string; options: string[] }) {
  const [state, action] = useActionState<FormState, FormData>(updateOrderStatus, {});
  const [next, setNext] = useState(options[0] ?? status);
  if (!options.length)
    return (
      <div className="tp-panel">
        {state.message && (
          <p role="status" className={`tp-alert${state.ok ? " tp-alert-ok" : ""}`}>
            {state.message}
          </p>
        )}
        <p className="tp-hint">
          {status === "anulada"
            ? "Orden anulada: no admite más cambios. Registra el reembolso en Contabilidad como gasto en Devolución."
            : "El estado de esta orden lo actualiza la pasarela de pago."}
        </p>
      </div>
    );
  return (
    <form
      action={action}
      className="tp-panel tp-form"
      onSubmit={(e) => {
        if (next === "anulada" && !window.confirm("¿Anular esta orden? No se hace reembolso automático.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <div className="tp-inline-form">
        <select name="status" className="tp-select" value={next} onChange={(e) => setNext(e.target.value)} aria-label="Nuevo estado">
          {options.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <SubmitButton pendingText="Guardando…">Cambiar estado</SubmitButton>
      </div>
      {next === "anulada" && (
        <label className="tp-option">
          <input type="checkbox" name="restock" defaultChecked />
          <span>Reponer el stock de los productos</span>
        </label>
      )}
      {state.message && (
        <p role="status" className={`tp-alert${state.ok ? " tp-alert-ok" : ""}`}>
          {state.message}
        </p>
      )}
      <p className="tp-hint">El cliente recibe un email con el nuevo estado.</p>
    </form>
  );
}
