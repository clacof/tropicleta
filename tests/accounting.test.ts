import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { entrySchema, monthRange, csvCell } from "../src/lib/accounting-validation";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  (globalThis as Record<string, unknown>).__tpDb = db;
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    const { getAccounting } = await import("../src/lib/accounting");
    const entry = { requestId: randomUUID(), date: "2025-09-10", type: "ingreso", category: "Taller", area:"servicios" as const, description: "Mantención de prueba", amount: 25000, method: "Efectivo", reference: "" };
    assert.equal(entrySchema.safeParse(entry).success, true);
    assert.equal(entrySchema.safeParse({...entry,area:"desconocida"}).success,false);
    for (const amount of [0, -1, 2.5, 2147483648]) assert.equal(entrySchema.safeParse({ ...entry, amount }).success, false);
    assert.equal(entrySchema.safeParse({ ...entry, date: "2025-02-30" }).success, false);
    assert.equal(entrySchema.safeParse({ ...entry, date: "9999-01-01" }).success, false);
    assert.deepEqual(monthRange("2025-12"), { month: "2025-12", start: "2025-12-01", end: "2026-01-01" });
    assert.equal(csvCell("=1+1"), '"\'=1+1"');
    assert.equal(csvCell('texto "citado"'), '"texto ""citado"""');
    await db.insert(schema.cashEntries).values(entry);
    await db.insert(schema.cashEntries).values(entry).onConflictDoNothing();
    const [expense] = await db.insert(schema.cashEntries).values({ ...entry, requestId: randomUUID(), type: "gasto", amount: 4000 }).returning();
    await db.insert(schema.orders).values({ code: "TEST-PAID", customerName: "Prueba", customerEmail: "test@example.com", customerPhone: "56911111111", deliveryMethod: "retiro", subtotal: 10000, shipping: 0, total: 10000, paymentMethod: "webpay", status: "pagada", paidAt: new Date("2025-10-01T01:00:00Z") });
    let report = await getAccounting("2025-09");
    assert.equal(report.income, 35000); // Includes payment in September in Santiago, despite UTC October.
    assert.equal(report.expenses, 4000);
    assert.equal(report.balance, 31000);
    assert.equal(report.rows.length, 3); // Duplicate submission did not add a second income.
    assert.deepEqual(report.byArea.servicios,{income:25000,expenses:4000,balance:21000});
    assert.deepEqual(report.byArea.productos,{income:10000,expenses:0,balance:10000});
    await db.insert(schema.cashEntries).values([
      {...entry,requestId:randomUUID(),type:"gasto",area:"productos",amount:2000},
      {...entry,requestId:randomUUID(),type:"gasto",area:"general",amount:500},
      {...entry,requestId:randomUUID(),type:"gasto",area:"productos",amount:1000,voidedAt:new Date(),voidReason:"Anulado"},
    ]);
    await db.insert(schema.bookings).values({code:"PENDING-QUOTE",name:"Prueba",phone:"56911111111",vehicleType:"bicicleta",preferredDate:"2025-09-10",timeSlot:"manana",quotedPrice:100000});
    report=await getAccounting("2025-09");
    assert.deepEqual(report.byArea.productos,{income:10000,expenses:2000,balance:8000});
    assert.deepEqual(report.byArea.general,{income:0,expenses:500,balance:-500});
    assert.equal(report.income,35000); // Cotizaciones sin cobro no son ingresos.
    assert.equal(report.balance,28500);
    assert.equal(Object.values(report.byArea).reduce((sum,r)=>sum+r.balance,0),report.balance);
    await db.update(schema.cashEntries).set({ voidedAt: new Date(), voidReason: "Corrección" }).where(eq(schema.cashEntries.id, expense.id));
    report = await getAccounting("2025-09");
    assert.equal(report.expenses, 2500);
    assert.equal(report.byArea.servicios.expenses,0);
    assert.equal(report.rows.length, 6); // Audit history remains.
    assert.equal((await getAccounting("2025-10")).income, 0);
    console.log("PASS: migrations, validation, duplicate protection, Chile month boundary, totals, void history, CSV escaping");
  } finally { await client.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
