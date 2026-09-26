import "server-only";
import { getDb, schema, type DB } from "./client";

/** `db` perezoso: la conexión se crea en el primer uso (no durante el build). */
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export { schema };
