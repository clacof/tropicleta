export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { isServerless, databaseUrl } = await import("./db/url");
  // En Vercel el disco es de solo lectura: la BD embebida no sirve; sin URL, avisar claro y no intentar crearla.
  if (isServerless()) {
    if (!databaseUrl()) console.error("[db] Falta DATABASE_URL (o POSTGRES_URL) en este entorno de Vercel.");
    return;
  }
  const { ensureEmbeddedDb } = await import("./db/client");
  try {
    await ensureEmbeddedDb();
  } catch (e) {
    console.error("[db] No se pudo preparar la BD embebida:", e);
  }
}
