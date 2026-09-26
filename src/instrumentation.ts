export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureEmbeddedDb } = await import("./db/client");
  try {
    await ensureEmbeddedDb();
  } catch (e) {
    console.error("[db] No se pudo preparar la BD embebida:", e);
  }
}
