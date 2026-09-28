// Sin zod a propósito: este módulo va al bundle del cliente en todas las páginas (CartProvider en el layout)
// y zod pesa ~90 KB gzip. El servidor revalida todo en el checkout.

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  stock: number;
};

const isInt = (v: unknown, min: number): v is number => Number.isInteger(v) && (v as number) >= min;

/** Valida un ítem leído de localStorage; descarta campos extra. */
function parseItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    !isInt(r.productId, 1) ||
    typeof r.slug !== "string" ||
    !/^[a-z0-9-]+$/.test(r.slug) ||
    typeof r.name !== "string" ||
    r.name.length < 1 ||
    r.name.length > 200 ||
    !isInt(r.price, 0) ||
    !isInt(r.quantity, 1) ||
    !isInt(r.stock, 0) ||
    (r.image !== undefined && r.image !== null && typeof r.image !== "string")
  )
    return null;
  const item: CartItem = { productId: r.productId, slug: r.slug, name: r.name, price: r.price, quantity: r.quantity, stock: r.stock };
  if (r.image !== undefined) item.image = r.image as string | null;
  return item;
}

export function clampQuantity(quantity: number, stock: number) {
  if (!Number.isFinite(quantity) || !Number.isFinite(stock)) return 0;
  return Math.max(0, Math.min(Math.floor(quantity), Math.floor(stock), 10));
}

export function parseCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  return value.slice(0, 50).flatMap((raw) => {
    const item = parseItem(raw);
    if (!item || seen.has(item.productId)) return [];
    seen.add(item.productId);
    const quantity = clampQuantity(item.quantity, item.stock);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}
