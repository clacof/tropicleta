"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { QtyControl } from "./QtyControl";

type Props = {
  product: { id: number; slug: string; name: string; price: number; stock: number; image?: string | null };
  compact?: boolean;
};

export function AddToCart({ product, compact }: Props) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const available = Math.min(product.stock, 10) - inCart;

  if (product.stock <= 0) {
    return (
      <button type="button" className="tp-btn tp-btn-secondary" disabled>
        Sin stock
      </button>
    );
  }

  const onAdd = () =>
    add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, stock: product.stock, image: product.image }, qty);

  if (compact) {
    return (
      <button type="button" className="tp-btn tp-btn-secondary tp-btn-sm" onClick={onAdd} disabled={available <= 0}>
        Agregar
      </button>
    );
  }

  return (
    <div className="tp-actions" style={{ alignItems: "center" }}>
      <QtyControl value={qty} max={Math.max(1, available)} onChange={(v) => setQty(Math.max(1, v))} label={product.name} />
      <button type="button" className="tp-btn tp-btn-primary" onClick={onAdd} disabled={available <= 0}>
        {available <= 0 ? "Máximo en el carrito" : "Agregar al carrito"}
      </button>
    </div>
  );
}
