"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { formToObject, zodErrors, type FormState } from "@/lib/forms";
import { slugify } from "@/lib/format";

/* ---------------------------- Sesión ---------------------------- */

const attempts = new Map<string, { n: number; t: number }>();

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  // Freno simple a fuerza bruta (por instancia)
  const a = attempts.get("admin") ?? { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60_000) Object.assign(a, { n: 0, t: Date.now() });
  if (a.n >= 10) return { message: "Demasiados intentos. Espera 15 minutos." };

  if (!checkPassword(password)) {
    attempts.set("admin", { ...a, n: a.n + 1 });
    return { message: "Contraseña incorrecta" };
  }
  attempts.delete("admin");
  await createSession();
  redirect("/admin/");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login/");
}

/* ---------------------------- Estados ---------------------------- */

export async function updateBookingStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = z.enum(schema.bookingStatus.enumValues).parse(fd.get("status"));
  await db.update(schema.bookings).set({ status }).where(eq(schema.bookings.id, id));
  revalidatePath("/admin", "layout");
}

export async function updateOrderStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = z.enum(["pagada", "lista", "entregada", "anulada"]).parse(fd.get("status"));
  await db.update(schema.orders).set({ status, updatedAt: new Date() }).where(eq(schema.orders.id, id));
  revalidatePath("/admin", "layout");
}

export async function toggleMessageRead(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const read = fd.get("read") === "true";
  await db.update(schema.contactMessages).set({ read }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin", "layout");
}

/* ---------------------------- Servicios ---------------------------- */

const money = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v.replace(/\D/g, ""))))
  .pipe(z.number().int().min(0).max(10_000_000).nullable());

const serviceSchema = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(2, "Nombre requerido").max(120),
  slug: z.string().trim().max(120).optional(),
  categoryId: z.coerce.number({ error: "Elige una categoría" }).int().positive("Elige una categoría"),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(4000).optional(),
  includes: z.string().optional(),
  price: money,
  priceFrom: z.string().optional(),
  duration: z.string().trim().max(60).optional(),
  featured: z.string().optional(),
  active: z.string().optional(),
  sort: z.coerce.number().int().default(0),
});

export async function saveService(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formToObject(fd);
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values };
  const d = parsed.data;
  const data = {
    name: d.name,
    slug: slugify(d.slug || d.name),
    categoryId: d.categoryId,
    summary: d.summary || null,
    description: d.description || null,
    includes: (d.includes ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    price: d.price,
    priceFrom: d.priceFrom === "on",
    duration: d.duration || null,
    featured: d.featured === "on",
    active: d.active === "on",
    sort: d.sort,
  };
  try {
    if (d.id) await db.update(schema.services).set(data).where(eq(schema.services.id, d.id));
    else await db.insert(schema.services).values(data);
  } catch (e) {
    if (String(e).includes("unique")) return { errors: { slug: "Ya existe un servicio con ese slug" }, values };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin/servicios/");
}

export async function deleteService(fd: FormData) {
  await requireAdmin();
  // Se desactiva en vez de borrar para no romper enlaces ni historial
  await db.update(schema.services).set({ active: false }).where(eq(schema.services.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

/* ---------------------------- Productos ---------------------------- */

const productSchema = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(2, "Nombre requerido").max(140),
  slug: z.string().trim().max(140).optional(),
  categoryId: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  newCategory: z.string().trim().max(60).optional(),
  description: z.string().trim().max(4000).optional(),
  price: money.refine((v) => v !== null && v > 0, "Precio requerido"),
  compareAtPrice: money,
  stock: z.coerce.number({ error: "Stock requerido" }).int().min(0, "No puede ser negativo"),
  images: z.string().optional(),
  featured: z.string().optional(),
  active: z.string().optional(),
});

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formToObject(fd);
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values };
  const d = parsed.data;

  let categoryId = d.categoryId;
  if (d.newCategory) {
    const [cat] = await db
      .insert(schema.productCategories)
      .values({ name: d.newCategory, slug: slugify(d.newCategory) })
      .onConflictDoUpdate({ target: schema.productCategories.slug, set: { name: d.newCategory } })
      .returning();
    categoryId = cat.id;
  }

  const images = (d.images ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\/|^\//.test(s));

  const data = {
    name: d.name,
    slug: slugify(d.slug || d.name),
    categoryId,
    description: d.description || null,
    price: d.price!,
    compareAtPrice: d.compareAtPrice,
    stock: d.stock,
    images,
    featured: d.featured === "on",
    active: d.active === "on",
  };
  try {
    if (d.id) await db.update(schema.products).set(data).where(eq(schema.products.id, d.id));
    else await db.insert(schema.products).values(data);
  } catch (e) {
    if (String(e).includes("unique")) return { errors: { slug: "Ya existe un producto con ese slug" }, values };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect("/admin/productos/");
}

export async function archiveProduct(fd: FormData) {
  await requireAdmin();
  await db.update(schema.products).set({ active: false }).where(eq(schema.products.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}
