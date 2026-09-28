/**
 * URL de PostgreSQL. Acepta los nombres que crean las integraciones de Vercel:
 * DATABASE_URL (Neon, manual) o POSTGRES_URL (Supabase, Neon, Prisma Postgres).
 */
export const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;

/** Entorno serverless (Vercel/Lambda): disco de solo lectura, no se puede usar la BD embebida. */
export const isServerless = () =>
  !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL || process.env.AWS_LAMBDA_FUNCTION_NAME);
