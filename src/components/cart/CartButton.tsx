"use client";

import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, open, ready } = useCart();
  return (
    <button type="button" className="tp-cart-btn" onClick={open} aria-label={`Abrir carrito (${count} productos)`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M2 3h3l3 12h11l3-9H6" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M8 15l-1 3h13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      </svg>
      {ready && count > 0 && <span className="tp-cart-count">{count}</span>}
    </button>
  );
}
