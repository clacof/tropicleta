"use client";

import { useActionState } from "react";
import { saveService } from "@/actions/admin";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import type { Service, ServiceCategory } from "@/db/schema";
import type { FormState } from "@/lib/forms";

export function ServiceForm({ service, categories }: { service: Service | null; categories: ServiceCategory[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveService, {});
  const s = service;
  return (
    <form action={action} className="tp-panel tp-form" style={{ maxWidth: 820 }}>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="tp-form-grid">
        <Field name="name" label="Nombre" state={state} defaultValue={s?.name} required />
        <Field name="categoryId" label="Categoría" as="select" state={state} defaultValue={s ? String(s.categoryId) : ""}>
          <option value="" disabled>
            Elige…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
        <Field name="price" label="Precio (CLP)" state={state} defaultValue={s?.price?.toString() ?? ""} inputMode="numeric" hint="Vacío = A cotizar" />
        <Field name="duration" label="Tiempo estimado" state={state} defaultValue={s?.duration ?? ""} optional placeholder="Ej: 24 a 48 horas" />
        <Field name="summary" label="Resumen" state={state} defaultValue={s?.summary ?? ""} className="tp-span-2" optional />
        <Field name="description" label="Descripción" as="textarea" rows={4} state={state} defaultValue={s?.description ?? ""} className="tp-span-2" optional />
        <Field
          name="includes"
          label="Qué incluye (uno por línea)"
          as="textarea"
          rows={4}
          state={state}
          defaultValue={s?.includes.join("\n") ?? ""}
          className="tp-span-2"
          optional
        />
        <Field name="slug" label="URL (slug)" state={state} defaultValue={s?.slug ?? ""} optional hint="Se genera desde el nombre si lo dejas vacío" />
        <Field name="sort" label="Orden" type="number" state={state} defaultValue={String(s?.sort ?? 0)} />
      </div>
      <div className="tp-options tp-options-2">
        <label className="tp-option">
          <input type="checkbox" name="priceFrom" defaultChecked={s?.priceFrom} />
          <span>Mostrar “desde”</span>
        </label>
        <label className="tp-option">
          <input type="checkbox" name="featured" defaultChecked={s?.featured} />
          <span>Destacado en la home (máx. 3)</span>
        </label>
        <label className="tp-option">
          <input type="checkbox" name="active" defaultChecked={s?.active ?? true} />
          <span>Visible en el sitio</span>
        </label>
      </div>
      <div>
        <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
      </div>
    </form>
  );
}
