export type QuoteService = { slug: string; name: string; price: number | null; priceFrom: boolean };

export const pickupPrices: Record<string, number> = { "Tierra Amarilla": 5000, Paipote: 15000, "Copiapó": 20000 };

export function serviceQuote(services: QuoteService[], pickup = false, commune = "") {
  const transport = pickup ? pickupPrices[commune] ?? null : 0;
  return {
    subtotal: services.reduce((sum, service) => sum + (service.price ?? 0), 0),
    transport,
    total: services.reduce((sum, service) => sum + (service.price ?? 0), 0) + (transport ?? 0),
    pending: services.some((service) => service.price === null) || transport === null,
    from: services.some((service) => service.priceFrom),
  };
}
