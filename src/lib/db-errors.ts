/** Busca el código de error de PostgreSQL (drizzle lo envuelve en `cause`). */
function pgCode(e: unknown): string | undefined {
  for (let cur = e, i = 0; cur && typeof cur === "object" && i < 5; cur = (cur as { cause?: unknown }).cause, i++) {
    const code = (cur as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
}

export const isUniqueViolation = (e: unknown) => pgCode(e) === "23505";
/** 23503 = foreign_key_violation (NO ACTION), 23001 = restrict_violation (ON DELETE RESTRICT). */
export const isForeignKeyViolation = (e: unknown) => ["23503", "23001"].includes(pgCode(e) ?? "");
