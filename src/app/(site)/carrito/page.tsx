import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function CarritoPage() {
  return (
    <section className="tp-section" style={{ paddingTop: 48 }}>
      <div className="tp-shell">
        <span className="tp-kicker">Tienda Tropicleta</span>
        <h1 className="tp-display tp-section-title">Tu carrito</h1>
        <CartView />
      </div>
    </section>
  );
}
