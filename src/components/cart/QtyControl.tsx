"use client";

type Props = { value: number; max: number; onChange: (v: number) => void; label: string };

export function QtyControl({ value, max, onChange, label }: Props) {
  return (
    <div className="tp-qty" role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Quitar uno">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar uno">
        +
      </button>
    </div>
  );
}
