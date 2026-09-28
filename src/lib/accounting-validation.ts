import { z } from "zod";

export const categories = ["Taller", "Venta presencial", "Repuestos", "Arriendo", "Servicios básicos", "Sueldos", "Transporte", "Comisiones", "Devolución", "Otros"] as const;
export const methods = ["Efectivo", "Transferencia", "Tarjeta", "Otro"] as const;
export function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export const entrySchema = z.object({
  requestId: z.uuid(),
  date: z.iso.date().refine(v => v <= localDate(), "La fecha no puede ser futura"),
  type: z.enum(["ingreso", "gasto"]),
  category: z.enum(categories),
  description: z.string().trim().min(3).max(500),
  amount: z.coerce.number().int().min(1).max(2_000_000_000),
  method: z.enum(methods),
  reference: z.string().trim().max(120),
});
export function monthRange(value?: string) {
  const month = value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= "2000-01" && value <= "9998-12" ? value : localDate().slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  return { month, start: `${month}-01`, end: `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01` };
}
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return '"' + (/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
}
