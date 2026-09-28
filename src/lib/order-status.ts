import type { BookingStatus, OrderStatus } from "@/db/schema";

/**
 * Transiciones que el panel puede hacer sobre una orden. Las órdenes pendientes o rechazadas
 * solo cambian por la pasarela de pago (markOrderPaid / markOrderFailed), nunca a mano.
 */
export const orderTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pagada: ["lista", "entregada", "anulada"],
  lista: ["pagada", "entregada", "anulada"],
  entregada: ["lista", "anulada"],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return orderTransitions[from]?.includes(to) ?? false;
}

/** Mensaje al cliente según el nuevo estado (email y WhatsApp). null = no se avisa. */
export function bookingStatusMessage(status: BookingStatus, code: string): string | null {
  switch (status) {
    case "confirmada":
      return `Tu solicitud ${code} está confirmada. Te esperamos en el taller.`;
    case "en_taller":
      return `Tu vehículo de la solicitud ${code} ya está en el taller y estamos trabajando en él.`;
    case "lista":
      return `¡Tu vehículo de la solicitud ${code} está listo! Puedes coordinar el retiro con nosotros.`;
    case "cancelada":
      return `Tu solicitud ${code} fue cancelada. Si fue un error, escríbenos y la reagendamos.`;
    default:
      return null;
  }
}

export function orderStatusMessage(status: OrderStatus, code: string, deliveryMethod: string): string | null {
  switch (status) {
    case "lista":
      return deliveryMethod === "retiro"
        ? `Tu pedido ${code} está listo para retiro en el taller.`
        : `Tu pedido ${code} está listo y sale a despacho.`;
    case "entregada":
      return `Tu pedido ${code} fue entregado. ¡Gracias por comprar en Tropicleta!`;
    case "anulada":
      return `Tu pedido ${code} fue anulado. Te contactaremos para coordinar la devolución si corresponde.`;
    default:
      return null;
  }
}

/** Enlace de WhatsApp al cliente con un mensaje preescrito. */
export function customerWhatsapp(phone: string, name: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${name.split(" ")[0]}, te escribimos de Tropicleta. ${text}`)}`;
}
