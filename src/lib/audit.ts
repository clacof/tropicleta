import "server-only";
import { db, schema } from "@/db";
import { clientIp } from "@/lib/auth";

/** Registra un cambio hecho desde el panel. Nunca lanza: el historial no debe bloquear la operación. */
export async function audit(action: string, entity: string, entityId: string | number | null, summary: string) {
  try {
    await db.insert(schema.adminAudit).values({
      action,
      entity,
      entityId: entityId == null ? null : String(entityId),
      summary: summary.slice(0, 500),
      ip: await clientIp(),
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}
