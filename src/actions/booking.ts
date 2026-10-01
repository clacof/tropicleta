"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { adminEmail, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { formToObject, zodErrors, type FormState } from "@/lib/forms";
import { displayPhone, formatDate, shortCode } from "@/lib/format";
import { serviceQuote, transportLabels } from "@/lib/service-quote";
import { formatCLP } from "@/lib/format";
import { bookingSchema } from "@/lib/validation";
import { packageQuote } from "@/lib/package-quote";
import { selectionSchema } from "@/lib/quote-selection";

export async function createBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formToObject(fd);
  const parsed = bookingSchema.safeParse(values);
  if (!parsed.success) return { errors: zodErrors(parsed.error), values };
  const d = parsed.data;

  const [vehicle]=await db.select().from(schema.quoteVehicles).where(and(eq(schema.quoteVehicles.slug,d.vehicleType),eq(schema.quoteVehicles.removed,false))).limit(1);
  if(!vehicle || d.doubleSuspension) return {errors:{services:"El vehículo cambió. Recarga y elige un vehículo disponible."},values};
  let code: string;
  try {
    // Solo se aceptan servicios existentes (se guardan los nombres para el historial)
    const catalog = await db.select().from(schema.services);
    let calculation; let selection;
    try {
      selection = selectionSchema.parse(d.selection ? JSON.parse(d.selection) : {manual:d.services.filter(slug=>catalog.find(s=>s.slug===slug)?.kind!=="package"),packages:d.services.filter(slug=>catalog.find(s=>s.slug===slug)?.kind==="package"),excluded:[]});
      calculation = packageQuote(catalog,selection,d.vehicleType,d.doubleSuspension);
      if (!calculation.leaves.length || calculation.leaves.slice().sort().join("|") !== [...new Set(d.services)].sort().join("|")) throw Error("La selección cambió. Revisa tu cotización antes de enviarla.");
    } catch(e) { return { errors:{services:e instanceof Error?e.message:"La selección no es válida."}, values }; }
    const found = calculation.lines;

    const quote = serviceQuote(found, d.pickup, d.pickupCommune, d.transportMode, d.firstService);
    const quoteText = found.map(s => s.name + ": " + (s.price === null ? "A cotizar" : (s.priceFrom ? "Desde " : "") + formatCLP(s.price))).join("; ") + "; Subtotal de servicios: " + formatCLP(quote.subtotal) + (d.firstService ? "; Primer servicio, descuento 10% en servicios: -" + formatCLP(quote.discount) : "") + (d.pickup ? "; " + transportLabels[d.transportMode] + ": " + (quote.transport === null ? "A cotizar" : formatCLP(quote.transport)) : "") + "; Total estimado: " + formatCLP(quote.total) + (quote.pending ? "; Valores pendientes de cotizar." : "") + "; Sujeto a diagnóstico y confirmación.";
    const packageDetail = "Vehículo: " + vehicle.name + "; " + found.map(s=>s.name + (s.automatic?" (paquete reconocido)":"") + (s.included.length?" · Incluidos: " + s.included.map(slug=>catalog.find(s=>s.slug===slug)!.name).join(", "):"")).join("; ");
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
      quoteSnapshot: { vehicle:d.vehicleType, doubleSuspension:d.doubleSuspension, selection, lines:found, ...quote },
      notes: [packageDetail, quoteText, d.notes].filter(Boolean).join("\n"),
    });

    const slot = d.timeSlot === "manana" ? "mañana" : "tarde";
    const summary = `
      <p>Código <b>${code}</b></p>
      <p><b>${escapeHtml(d.name)}</b> · ${displayPhone(d.phone)} ${d.email ? "· " + escapeHtml(d.email) : ""}</p>
      <p>${escapeHtml(d.vehicleType)} ${escapeHtml(d.vehicleDetails ?? "")}</p>
      <p>Servicios: ${found.map((s) => escapeHtml(s.name)).join(", ")}</p>
      <p>${escapeHtml(packageDetail)}</p><p>${escapeHtml(quoteText)}</p>
      <p>Fecha preferida: ${formatDate(d.preferredDate)}, en la ${slot}</p>
      ${d.pickup ? `<p>${transportLabels[d.transportMode]} en ${escapeHtml(d.pickupCommune!)}: ${escapeHtml(d.pickupAddress!)}</p>` : ""}
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
