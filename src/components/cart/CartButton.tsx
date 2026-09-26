"use client";

import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, open, ready } = useCart();
  return (
    <button type="button" className="tp-cart-btn" onClick={open} aria-label={`Abrir carrito (${count} productos)`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
        <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
      {ready && count > 0 && <span className="tp-cart-count">{count}</span>}
    </button>
  );
}
