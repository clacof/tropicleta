"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Enviando…", className = "tp-btn tp-btn-primary", disabled = false }: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
