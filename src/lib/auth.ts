import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sesión de administrador mínima: una contraseña (ADMIN_PASSWORD) y una cookie firmada con HMAC.
 * Suficiente para un solo taller; migrar a Auth.js si se necesitan varios usuarios.
 */
const COOKIE = "tp_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const isProd = process.env.NODE_ENV === "production";
// En desarrollo hay valores por defecto para entrar sin configurar nada. En producción son obligatorios.
const DEV_PASSWORD = "tropicleta";
const DEV_SECRET = "solo-desarrollo-no-usar-en-produccion";

function secret() {
  const s = process.env.SESSION_SECRET ?? (isProd ? undefined : DEV_SECRET);
  if (!s || s.length < 16) throw new Error("Define SESSION_SECRET (mín. 16 caracteres)");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? (isProd ? undefined : DEV_PASSWORD);
  if (!expected) return false;
  return safeEqual(sign(input), sign(expected));
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
  const exp = Number(payload.split(".")[1]);
  try {
    return safeEqual(sig, sign(payload)) && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

/** Úsalo al inicio de cada server action y página del panel. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login/");
}
