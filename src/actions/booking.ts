"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { adminEmail, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { formToObject, zodErrors, type FormState } from "@/lib/forms";
import { displayPhone, formatDate, shortCode } from "@/lib/format";
import { serviceQuote } from "@/lib/service-quote";
import { formatCLP } from "@/lib/format";
import { bookingSchema } from "@/lib/validation";

export async function createBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formToObject(fd);
  const parsed = bookingSchema.safeParse(values);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values };
  const d = parsed.data;

  let code: string;
  try {
    // Solo se aceptan servicios existentes (se guardan los nombres para el historial)
    const found = await db
      .select({ slug: schema.services.slug, name: schema.services.name, price: schema.services.price, priceFrom: schema.services.priceFrom })
      .from(schema.services)
      .where(and(inArray(schema.services.slug, d.services), eq(schema.services.active, true)));
    if (!found.length || found.length !== new Set(d.services).size)
      return { errors: { services: "Uno de los servicios ya no está disponible. Vuelve a seleccionarlos." }, values };

    const quote = serviceQuote(found, d.pickup, d.pickupCommune);
    const quoteText = found.map(s => s.name + ": " + (s.price === null ? "A cotizar" : (s.priceFrom ? "Desde " : "") + formatCLP(s.price))).join("; ") + (d.pickup ? "; Retiro + entrega: " + (quote.transport === null ? "A cotizar" : formatCLP(quote.transport)) : "") + "; Total estimado: " + formatCLP(quote.total) + (quote.pending ? "; Valores pendientes de cotizar." : "") + "; Sujeto a diagnóstico y confirmación.";
    code = shortCode("TP");
    await db.insert(schema.bookings).values({
      code,
      name: d.name,
      phone: d.phone,
      email: d.email ?? null,
      vehicleType: d.vehicleType,
      vehicleDetails: d.vehicleDetails || null,
      serviceNames: found.map((s) => s.name),
      preferredDate: d.preferredDate,
      timeSlot: d.timeSlot,
      pickup: d.pickup,
      pickupCommune: d.pickup ? d.pickupCommune! : null,
      pickupAddress: d.pickup ? d.pickupAddress! : null,
      notes: [quoteText, d.notes].filter(Boolean).join("\n"),
    });

    const slot = d.timeSlot === "manana" ? "mañana" : "tarde";
    const summary = `
      <p>Código <b>${code}</b></p>
      <p><b>${escapeHtml(d.name)}</b> · ${displayPhone(d.phone)} ${d.email ? "· " + escapeHtml(d.email) : ""}</p>
      <p>${escapeHtml(d.vehicleType)} ${escapeHtml(d.vehicleDetails ?? "")}</p>
      <p>Servicios: ${found.map((s) => escapeHtml(s.name)).join(", ")}</p>
      <p>${escapeHtml(quoteText)}</p>
      <p>Fecha preferida: ${formatDate(d.preferredDate)}, en la ${slot}</p>
      ${d.pickup ? `<p>Retiro en ${escapeHtml(d.pickupCommune!)}: ${escapeHtml(d.pickupAddress!)}</p>` : ""}
      ${d.notes ? `<p>Notas: ${escapeHtml(d.notes)}</p>` : ""}`;

    await Promise.all([
      sendEmail(adminEmail(), `Nueva cotización y solicitud de hora ${code}`, emailLayout("Nueva solicitud de hora", summary)),
      sendEmail(
        d.email,
        `Recibimos tu solicitud ${code}`,
        emailLayout(
          "Recibimos tu solicitud",
          `<p>¡Gracias, ${escapeHtml(d.name.split(" ")[0])}! Te contactaremos por WhatsApp para confirmar el día y la hora.</p>${summary}`,
        ),
      ),
    ]);
  } catch (e) {
    console.error("[agendar]", e);
    return { message: "No pudimos registrar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.", values };
  }

  redirect(`/agendar/gracias/?codigo=${code}`);
}
