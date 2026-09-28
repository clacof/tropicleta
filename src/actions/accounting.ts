"use server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth";
import { formatCLP } from "@/lib/format";
import { entrySchema } from "@/lib/accounting-validation";

export type AccountingState = { ok?: boolean; message?: string };
export async function addCashEntry(_state: AccountingState, fd: FormData): Promise<AccountingState> {
  await requireAdmin();
  const result = entrySchema.safeParse(Object.fromEntries(fd));
  if (!result.success) return { message: "Revisa los campos: fecha válida, descripción y monto entero mayor a cero." };
  try {
    const inserted = await db.insert(schema.cashEntries).values(result.data).onConflictDoNothing({ target: schema.cashEntries.requestId }).returning({ id: schema.cashEntries.id });
    const d = result.data;
    if (inserted.length) await audit("crear", "movimiento", inserted[0].id, `${d.type} ${formatCLP(d.amount)} · ${d.category} · ${d.description}`);
  } catch { return { message: "No se pudo guardar. Intenta nuevamente." }; }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Movimiento registrado correctamente." };
}
export async function voidCashEntry(_state: AccountingState, fd: FormData): Promise<AccountingState> {
  await requireAdmin();
  const parsed = z.object({ id: z.coerce.number().int().positive(), reason: z.string().trim().min(5).max(300) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Escribe un motivo de al menos 5 caracteres." };
  const { id, reason } = parsed.data;
  try {
    const updated = await db.update(schema.cashEntries).set({ voidedAt: new Date(), voidReason: reason }).where(and(eq(schema.cashEntries.id, id), isNull(schema.cashEntries.voidedAt))).returning({ id: schema.cashEntries.id });
    if (!updated.length) return { message: "El movimiento ya fue anulado o no existe." };
    await audit("anular", "movimiento", id, reason);
  } catch { return { message: "No se pudo anular. Intenta nuevamente." }; }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Movimiento anulado." };
}
