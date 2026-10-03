import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sesión de administrador mínima: una contraseña (ADMIN_PASSWORD) y una cookie firmada con HMAC.
 * Suficiente para un solo taller; migrar a Auth.js si se necesitan varios usuarios.
 *
 * La cookie incluye una huella de la contraseña: al cambiar ADMIN_PASSWORD (o SESSION_SECRET)
 * todas las sesiones abiertas dejan de ser válidas.
 */
const COOKIE = "tp_admin";
const MAX_AGE = 60 * 60 * 24 * 2; // 2 días

const isProd = process.env.NODE_ENV === "production";
// En desarrollo hay valores por defecto para entrar sin configurar nada. En producción son obligatorios.
const DEV_PASSWORD = "tropicleta";
const DEV_SECRET = "solo-desarrollo-no-usar-en-produccion";

function secret() {
  const s = process.env.SESSION_SECRET ?? (isProd ? undefined : DEV_SECRET);
  if (!s || s.length < 16) throw new Error("Define SESSION_SECRET (mín. 16 caracteres)");
  return s;
}

function expectedPassword() {
  return process.env.ADMIN_PASSWORD ?? (isProd ? undefined : DEV_PASSWORD);
}

export { adminConfigurationError } from "./auth-config";

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Huella corta de la contraseña vigente (no revela la contraseña: es un HMAC). */
function passwordTag() {
  return sign(`pw:${expectedPassword() ?? ""}`).slice(0, 16);
}

export function checkPassword(input: string) {
  const expected = expectedPassword();
  if (!expected) return false;
  return safeEqual(sign(input), sign(expected));
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}.${passwordTag()}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const [, exp, tag = ""] = payload.split(".");
  try {
    return safeEqual(sig, sign(payload)) && Number(exp) > Date.now() / 1000 && safeEqual(tag, passwordTag());
  } catch {
    return false;
  }
}

/** Úsalo al inicio de cada server action y página del panel (el layout no basta: no se re-ejecuta al navegar). */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login/");
}

/** IP del cliente según el proxy (Vercel define x-forwarded-for). */
export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim().slice(0, 64);
}
