"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

/** Botón de envío que pide confirmación antes de ejecutar una acción que cambia datos. */
export function ConfirmSubmit({ message, children, className = "tp-link-btn" }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  const [confirming,setConfirming] = useState(false);
  if (!confirming) return <button type="button" className={className} disabled={pending} onClick={()=>setConfirming(true)}>{children}</button>;
  return (
    <div className="tp-inline-confirm" role="group" aria-label="Confirmar acción">
      <p>{message}</p>
      <button type="submit" className={className} disabled={pending}>{pending ? "…" : "Confirmar"}</button>
      <button type="button" className="tp-link-btn" disabled={pending} onClick={()=>setConfirming(false)}>Cancelar</button>
    </div>
  );
}
