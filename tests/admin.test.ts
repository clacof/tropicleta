import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema";
import { canTransitionOrder } from "../src/lib/order-status";
import { isForeignKeyViolation, isUniqueViolation } from "../src/lib/db-errors";

async function main() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  (globalThis as Record<string, unknown>).__tpDb = db;
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    const { loginBlocked, recordLoginFailure, clearLoginFailures } = await import("../src/lib/login-limit");
    const { searchWhere } = await import("../src/lib/admin-queries");

    // Transiciones: pendientes/rechazadas solo las mueve la pasarela
    assert.equal(canTransitionOrder("pendiente", "pagada"), false);
    assert.equal(canTransitionOrder("rechazada", "pagada"), false);
    assert.equal(canTransitionOrder("anulada", "pagada"), false);
    assert.equal(canTransitionOrder("pagada", "lista"), true);
    assert.equal(canTransitionOrder("lista", "anulada"), true);

    // Límite de intentos por IP, persistido en la BD
    for (let i = 0; i < 9; i++) await recordLoginFailure("1.1.1.1");
    assert.equal(await loginBlocked("1.1.1.1"), false);
    await recordLoginFailure("1.1.1.1");
    assert.equal(await loginBlocked("1.1.1.1"), true);
    assert.equal(await loginBlocked("2.2.2.2"), false); // otra IP no queda bloqueada
    await client.query(`update login_attempts set window_start = now() - interval '16 minutes'`);
    assert.equal(await loginBlocked("1.1.1.1"), false); // ventana vencida
    await recordLoginFailure("1.1.1.1");
    const [row] = await db.select().from(schema.loginAttempts);
    assert.equal(row.count, 1); // se reinicia el contador
    await clearLoginFailures("1.1.1.1");
    assert.equal((await db.select().from(schema.loginAttempts)).length, 0);

    // Violación de unicidad detectada por código de PostgreSQL
    await db.insert(schema.productCategories).values({ name: "A", slug: "a" });
    await assert.rejects(db.insert(schema.productCategories).values({ name: "B", slug: "a" }), (e) => isUniqueViolation(e));

    // Categoría de servicio con servicios: ON DELETE RESTRICT
    const [sc] = await db.insert(schema.serviceCategories).values({ name: "Categoría de prueba", slug: "qa-frenos" }).returning();
    await db.insert(schema.services).values({ name: "Purga", slug: "purga", categoryId: sc.id });
    await assert.rejects(db.delete(schema.serviceCategories), (e) => isForeignKeyViolation(e));

    // Búsqueda por celular con formato libre
    const booking = { code: "TP-AAA111", name: "Ana Pérez", phone: "56912345678", vehicleType: "bicicleta", preferredDate: "2026-01-10", timeSlot: "manana" };
    await db.insert(schema.bookings).values(booking);
    const t = schema.bookings;
    for (const q of ["+56 9 1234 5678", "ana", "tp-aaa", "1234"]) {
      const found = await db.select().from(t).where(searchWhere(q, [t.code, t.name], [t.phone]));
      assert.equal(found.length, 1, `busca "${q}"`);
    }
    assert.equal((await db.select().from(t).where(searchWhere("100%", [t.name]))).length, 0); // comodines escapados

    console.log("PASS: order transitions, login rate limit, unique violations, admin search");
  } finally {
    await client.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
