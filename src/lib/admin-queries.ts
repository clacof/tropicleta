import "server-only";
import { and, count, eq, ilike, inArray, isNull, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db, schema } from "@/db";

export const PAGE_SIZE = 50;

/** Cuenta de pendientes para los contadores del menú y el Resumen (mismo criterio en ambos). */
export async function pendingCounts() {
  const [[b], [o], [m]] = await Promise.all([
    db.select({ n: count() }).from(schema.bookings).where(eq(schema.bookings.status, "nueva")),
    db.select({ n: count() }).from(schema.orders).where(inArray(schema.orders.status, ["pagada", "lista"])),
    db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.read, false)),
  ]);
  return { bookings: b.n, orders: o.n, messages: m.n };
}

/** Pagos vigentes registrados para una reserva. */
export function bookingPayments(bookingId: number) {
  const t = schema.cashEntries;
  return db.select().from(t).where(and(eq(t.bookingId, bookingId), isNull(t.voidedAt)));
}

/** Página actual (1..n) desde ?p= */
export function pageFrom(value?: string) {
  const n = Number(value);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

/** Condición de búsqueda por texto sobre varias columnas (insensible a mayúsculas). */
export function searchWhere(q: string | undefined, columns: PgColumn[], phoneColumns: PgColumn[] = []): SQL | undefined {
  const term = q?.trim().slice(0, 80);
  if (!term) return undefined;
  const like = (v: string) => `%${v.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
  // Los celulares se guardan como 569XXXXXXXX: se buscan solo por dígitos
  const digits = term.replace(/\D/g, "").replace(/^56/, "");
  return or(
    ...columns.map((c) => ilike(c, like(term))),
    ...(digits.length >= 4 ? phoneColumns.map((c) => ilike(c, like(digits))) : []),
  );
}
