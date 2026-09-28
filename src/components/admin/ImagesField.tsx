"use client";

import { useState } from "react";
import type { FormState } from "@/lib/forms";

/** Imágenes del producto: vista previa, reordenar, quitar, agregar por URL o subir archivos. */
export function ImagesField({ initial, state }: { initial: string[]; state: FormState }) {
  const prev = state.values?.images;
  const [urls, setUrls] = useState<string[]>(typeof prev === "string" ? prev.split("\n").filter(Boolean) : initial);
  const [draft, setDraft] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const error = state.errors?.images;

  const move = (i: number, d: number) =>
    setUrls((u) => {
      const next = [...u];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const add = () => {
    const v = draft.trim();
    if (/^https?:\/\/|^\//.test(v)) setUrls((u) => [...u, v]);
    setDraft("");
  };

  return (
    <div className="tp-field tp-span-2">
      <span className="tp-label">
        Imágenes <small>(la primera es la portada)</small>
      </span>
      <input type="hidden" name="images" value={urls.join("\n")} />
      {urls.length > 0 && (
        <ul className="tp-image-list">
          {urls.map((u, i) => (
            <li key={u + i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" />
              <div>
                <button type="button" className="tp-link-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir">
                  ↑
                </button>
                <button type="button" className="tp-link-btn" disabled={i === urls.length - 1} onClick={() => move(i, 1)} aria-label="Bajar">
                  ↓
                </button>
                <button type="button" className="tp-link-btn" onClick={() => setUrls((x) => x.filter((_, j) => j !== i))}>
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="tp-inline-form">
        <input
          className="tp-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://… o /productos/foto.webp"
          aria-label="Agregar URL de imagen"
        />
        <button type="button" className="tp-btn tp-btn-secondary" onClick={add}>
          Agregar URL
        </button>
      </div>
      <input
        type="file"
        name="uploads"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => setPicked(Array.from(e.target.files ?? []).map((f) => f.name))}
      />
      <span className="tp-hint">
        {picked.length ? `Se subirán al guardar: ${picked.join(", ")}` : "JPG, PNG, WebP o AVIF, máx. 4 MB en total por envío."}
      </span>
      {error && (
        <span className="tp-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
