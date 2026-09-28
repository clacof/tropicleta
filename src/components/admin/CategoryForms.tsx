"use client";

import { useActionState, useEffect, useRef } from "react";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/lib/forms";
import { ConfirmSubmit } from "./ConfirmSubmit";

type Category = { id: number; name: string; slug: string; sort: number; description?: string | null };
type Kind = "producto" | "servicio";

/** Fila editable de una categoría (o formulario vacío para crear una nueva). */
export function CategoryRow({ kind, category, count }: { kind: Kind; category?: Category; count?: number }) {
  const [state, action] = useActionState<FormState, FormData>(saveCategory, {});
  const [delState, delAction] = useActionState<FormState, FormData>(deleteCategory, {});
  const c = category;
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && !c) ref.current?.reset();
  }, [state, c]);
  return (
    <div className="tp-category-row">
      <form ref={ref} action={action} className="tp-category-form">
        <input type="hidden" name="kind" value={kind} />
        {c && <input type="hidden" name="id" value={c.id} />}
        <input className="tp-input" name="name" defaultValue={c?.name} placeholder="Nombre" required minLength={2} maxLength={60} aria-label="Nombre" />
        <input className="tp-input" name="slug" defaultValue={c?.slug} placeholder="slug (opcional)" maxLength={60} aria-label="Slug" />
        {kind === "servicio" && (
          <input className="tp-input" name="description" defaultValue={c?.description ?? ""} placeholder="Descripción (opcional)" maxLength={500} aria-label="Descripción" />
        )}
        <input className="tp-input" name="sort" type="number" defaultValue={c?.sort ?? 0} aria-label="Orden" style={{ width: 80 }} />
        <SubmitButton className="tp-btn tp-btn-secondary tp-btn-sm" pendingText="…">
          {c ? "Guardar" : "Agregar"}
        </SubmitButton>
      </form>
      {c && (
        <form action={delAction}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={c.id} />
          <ConfirmSubmit
            message={
              kind === "producto" && count
                ? `¿Eliminar “${c.name}”? Sus ${count} productos quedarán sin categoría.`
                : `¿Eliminar la categoría “${c.name}”?`
            }
          >
            Eliminar
          </ConfirmSubmit>
        </form>
      )}
      {c && <span className="tp-hint">{count ?? 0} en uso</span>}
      {(state.message || delState.message) && (
        <span className="tp-hint" role="status">
          {delState.message ?? state.message}
        </span>
      )}
    </div>
  );
}
