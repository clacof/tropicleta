"use client";

import { useActionState } from "react";
import { saveProduct } from "@/actions/admin";
import { Field } from "@/components/Field";
import { SubmitButton } from "@/components/SubmitButton";
import { ImagesField } from "./ImagesField";
import type { Product, ProductCategory } from "@/db/schema";
import type { FormState } from "@/lib/forms";

export function ProductForm({ product, categories }: { product: Product | null; categories: ProductCategory[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveProduct, {});
  const p = product;
  return (
    <form action={action} className="tp-panel tp-form" style={{ maxWidth: 820 }}>
      {state.message && (
        <div className="tp-alert" role="alert">
          {state.message}
        </div>
      )}
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="tp-form-grid">
        <Field name="name" label="Nombre" state={state} defaultValue={p?.name} required className="tp-span-2" />
        <Field name="price" label="Precio (CLP)" state={state} defaultValue={p?.price ? p.price.toString() : ""} inputMode="numeric" hint="Obligatorio para publicar. Puedes dejarlo vacío en un borrador." />
        <Field name="compareAtPrice" label="Precio anterior (CLP)" state={state} defaultValue={p?.compareAtPrice?.toString() ?? ""} inputMode="numeric" optional hint="Para mostrar oferta" />
        <Field name="stock" label="Stock" type="number" min={0} state={state} defaultValue={String(p?.stock ?? 0)} required />
        <Field name="categoryId" label="Categoría" as="select" state={state} defaultValue={p?.categoryId ? String(p.categoryId) : ""}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
        <Field name="newCategory" label="…o crear categoría nueva" state={state} optional />
        <Field name="slug" label="URL (slug)" state={state} defaultValue={p?.slug ?? ""} optional hint="Se genera desde el nombre" />
        <Field name="description" label="Descripción" as="textarea" rows={5} state={state} defaultValue={p?.description ?? ""} className="tp-span-2" optional />
        <ImagesField initial={p?.images ?? []} state={state} />
      </div>
      <div className="tp-options tp-options-2">
        <label className="tp-option">
          <input type="checkbox" name="featured" defaultChecked={p?.featured} />
          <span>Destacado en la home (máx. 4)</span>
        </label>
        <label className="tp-option">
          <input type="checkbox" name="active" defaultChecked={p?.active ?? true} />
          <span>Publicado</span>
        </label>
      </div>
      <div>
        <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
      </div>
    </form>
  );
}
