export type QuoteService = { slug: string; name: string; price: number | null; priceFrom: boolean; quantity?:number };

export const pickupPrices: Record<string, number> = { "Tierra Amarilla": 5000, Paipote: 15000, "Copiapó": 20000 };
export const oneWayPrices: Record<string, number> = { "Tierra Amarilla": 3000, Paipote: 8000, "Copiapó": 12000 };
export const transportLabels = { both: "Retiro + entrega", pickup: "Solo retiro", delivery: "Solo entrega" };
export type TransportMode = keyof typeof transportLabels;

export function serviceQuote(services: QuoteService[], pickup = false, commune = "", mode: TransportMode = "both", firstService = false) {
  const transport = pickup ? (mode === "both" ? pickupPrices : oneWayPrices)[commune] ?? null : 0;
  const subtotal = services.reduce((sum, service) => sum + (service.price ?? 0)*(service.quantity??1), 0);
  const discount = firstService ? Math.round(subtotal * 0.1) : 0;
  return {
    subtotal,
    discount,
    transport,
    total: subtotal - discount + (transport ?? 0),
    pending: services.some((service) => service.price === null) || transport === null,
    from: services.some((service) => service.priceFrom),
  };
}
