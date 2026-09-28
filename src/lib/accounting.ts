import "server-only";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { monthRange } from "./accounting-validation";

export async function getAccounting(value?: string) {
  const range = monthRange(value);
  const t = schema.cashEntries;
  const o = schema.orders;
  // Convert in PostgreSQL so month boundaries respect Chile's daylight saving time.
  const paidDate = sql<string>`(${o.paidAt} AT TIME ZONE 'America/Santiago')::date`;
  const [manual, sales] = await Promise.all([
    db.select().from(t).where(and(gte(t.date, range.start), lt(t.date, range.end))),
    db.select().from(o).where(and(gte(paidDate, range.start), lt(paidDate, range.end))),
  ]);
  const rows = [
    ...manual.map(e => ({ id: `m-${e.id}`, manualId: e.id, date: e.date, type: e.type, category: e.category, description: e.description, amount: e.amount, method: e.method, reference: e.reference, voided: !!e.voidedAt, reason: e.voidReason, orderId: null as number | null })),
    ...sales.map(o => ({ id: `o-${o.id}`, manualId: null, date: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(o.paidAt!), type: "ingreso", category: "Tienda online", description: `Venta ${o.code}`, amount: o.total, method: o.paymentMethod, reference: o.code, voided: false, reason: null, orderId: o.id })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const active = rows.filter(r => !r.voided);
  const income = active.filter(r => r.type === "ingreso").reduce((s, r) => s + r.amount, 0);
  const expenses = active.filter(r => r.type === "gasto").reduce((s, r) => s + r.amount, 0);
  return { ...range, rows, income, expenses, balance: income - expenses };
}
