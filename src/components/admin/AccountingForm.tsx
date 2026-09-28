"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addCashEntry, voidCashEntry } from "@/actions/accounting";
import { SubmitButton } from "@/components/SubmitButton";
import { categories, methods } from "@/lib/accounting-validation";

export function AccountingForm({ today, requestId }: { today: string; requestId: string }) {
  const [state, action] = useActionState(addCashEntry, {});
  const [key, setKey] = useState(requestId);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setKey(crypto.randomUUID());
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="tp-form">
      <input type="hidden" name="requestId" value={key} />
      <div className="tp-accounting-fields">
        <label>
          Tipo
          <select className="tp-input" name="type">
            <option value="ingreso">Ingreso</option>
            <option value="gasto">Gasto</option>
          </select>
        </label>
        <label>
          Fecha
          <input className="tp-input" name="date" type="date" defaultValue={today} max={today} required />
        </label>
        <label>
          Categoría
          <select className="tp-input" name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Monto en CLP
          <input className="tp-input" name="amount" type="number" min="1" max="2000000000" step="1" placeholder="15000" required />
        </label>
        <label>
          Medio de pago
          <select className="tp-input" name="method">
            {methods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          Comprobante / referencia
          <input className="tp-input" name="reference" maxLength={120} placeholder="Opcional" />
        </label>
      </div>
      <label>
        Descripción
        <input
          className="tp-input"
          name="description"
          minLength={3}
          maxLength={500}
          required
          placeholder="Ej. Mantención de bicicleta / compra de repuestos"
        />
      </label>
      {state.message && (
        <p role="status" className={`tp-alert${state.ok ? " tp-alert-ok" : ""}`}>
          {state.message}
        </p>
      )}
      <SubmitButton className="tp-btn tp-btn-primary" pendingText="Guardando…">
        Registrar movimiento
      </SubmitButton>
    </form>
  );
}

export function VoidEntryForm({ id }: { id: number }) {
  const [state, action] = useActionState(voidCashEntry, {});
  return (
    <details>
      <summary>Anular</summary>
      <form action={action} className="tp-form">
        <input type="hidden" name="id" value={id} />
        <label>
          Motivo de anulación
          <input className="tp-input" name="reason" required minLength={5} maxLength={300} />
        </label>
        <p className="tp-hint">Se conservará en el historial y dejará de sumar al balance.</p>
        <SubmitButton className="tp-btn tp-btn-secondary tp-btn-sm" pendingText="Anulando…">
          Confirmar anulación
        </SubmitButton>
        {state.message && <p role="status">{state.message}</p>}
      </form>
    </details>
  );
}
