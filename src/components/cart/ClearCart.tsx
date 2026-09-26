"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Vacía el carrito cuando la orden quedó pagada. */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
