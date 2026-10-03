import "server-only";
import { and, gte, lt, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { paymentLabel } from "./format";
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
    ...manual.map((e) => ({
      id: `m-${e.id}`,
      manualId: e.id,
      date: e.date,
      type: e.type,
      category: e.category,
      area: e.area,
      description: e.description,
      amount: e.amount,
      method: e.method,
      reference: e.reference,
      voided: !!e.voidedAt,
      reason: e.voidReason,
      orderId: null as number | null,
      bookingId: e.bookingId,
    })),
    ...sales.map((o) => ({
      id: `o-${o.id}`,
      manualId: null,
      date: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(o.paidAt!),
      type: "ingreso",
      category: "Tienda online",
      area: "productos" as const,
      description: `Venta ${o.code}`,
      amount: o.total,
      method: paymentLabel(o.paymentMethod),
      reference: o.code,
      voided: false,
      reason: null,
      orderId: o.id,
      bookingId: null as number | null,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const active = rows.filter((r) => !r.voided);
  const income = active.filter((r) => r.type === "ingreso").reduce((s, r) => s + r.amount, 0);
  const expenses = active.filter((r) => r.type === "gasto").reduce((s, r) => s + r.amount, 0);
  const byArea = Object.fromEntries((["productos","servicios","general"] as const).map(area=>{
    const entries=active.filter(r=>r.area===area);
    const income=entries.filter(r=>r.type==="ingreso").reduce((sum,r)=>sum+r.amount,0);
    const expenses=entries.filter(r=>r.type==="gasto").reduce((sum,r)=>sum+r.amount,0);
    return [area,{income,expenses,balance:income-expenses}];
  })) as Record<"productos"|"servicios"|"general",{income:number;expenses:number;balance:number}>;
  return { ...range, rows, income, expenses, balance: income - expenses, byArea };
}
