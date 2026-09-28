"use client";

import { useFormStatus } from "react-dom";

/** Botón de envío que pide confirmación antes de ejecutar una acción que cambia datos. */
export function ConfirmSubmit({ message, children, className = "tp-link-btn" }: { message: string; children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
