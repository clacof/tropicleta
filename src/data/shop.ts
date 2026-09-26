/**
 * Reglas de la tienda. POR CONFIRMAR con Tropicleta: costo de despacho y comunas.
 * Se recalculan siempre en el servidor (nunca se confía en el total del cliente).
 */
export const deliveryCommunes = ["Tierra Amarilla", "Paipote", "Copiapó"] as const;
export type DeliveryCommune = (typeof deliveryCommunes)[number];

export const shopRules = {
  pickupLabel: "Retiro en el taller (Tierra Amarilla, con coordinación previa)",
  deliveryLabel: "Despacho a domicilio",
  /** Costo de despacho en CLP por comuna. Ajustar con la tarifa real. */
  shippingByCommune: {
    "Tierra Amarilla": Number(process.env.NEXT_PUBLIC_SHIPPING_TIERRA_AMARILLA ?? 2000),
    Paipote: Number(process.env.NEXT_PUBLIC_SHIPPING_PAIPOTE ?? 3000),
    Copiapó: Number(process.env.NEXT_PUBLIC_SHIPPING_COPIAPO ?? 4000),
  } satisfies Record<DeliveryCommune, number>,
  maxQtyPerItem: 10,
};

export function shippingCost(method: "retiro" | "despacho", commune?: string | null): number {
  if (method === "retiro") return 0;
  const cost = shopRules.shippingByCommune[commune as DeliveryCommune];
  if (cost === undefined) throw new Error("Comuna fuera de cobertura");
  return cost;
}
