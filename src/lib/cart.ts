import { z } from "zod";

const itemSchema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  image: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});

export type CartItem = z.infer<typeof itemSchema>;

export function clampQuantity(quantity: number, stock: number) {
  if (!Number.isFinite(quantity) || !Number.isFinite(stock)) return 0;
  return Math.max(0, Math.min(Math.floor(quantity), Math.floor(stock), 10));
}

export function parseCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  return value.slice(0, 50).flatMap((raw) => {
    const result = itemSchema.safeParse(raw);
    if (!result.success || seen.has(result.data.productId)) return [];
    const item = result.data;
    seen.add(item.productId);
    const quantity = clampQuantity(item.quantity, item.stock);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}
