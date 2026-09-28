"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { QtyControl } from "./QtyControl";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { formatCLP } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, setQuantity, remove } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div className="tp-drawer-backdrop" onClick={close} aria-hidden="true" />
      <aside className="tp-drawer" role="dialog" aria-modal="true" aria-labelledby="tp-cart-title">
        <div className="tp-drawer-head">
          <h2 id="tp-cart-title" className="tp-display">
            Tu carrito
          </h2>
          <button type="button" className="tp-drawer-close" aria-label="Cerrar carrito" onClick={close}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="tp-drawer-body">
          {items.length === 0 ? (
            <div className="tp-empty">
              <p style={{ margin: 0 }}>Tu carrito está vacío.</p>
              <Link className="tp-btn tp-btn-secondary" href="/tienda/" onClick={close}>
                Ver tienda
              </Link>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.productId} className="tp-cart-line">
                <div className="tp-cart-thumb">
                  <ProductMedia name={i.name} image={i.image} sizes="64px" />
                </div>
                <div>
                  <div className="tp-cart-line-top">
                    <Link href={`/tienda/${i.slug}/`} onClick={close}>
                      {i.name}
                    </Link>
                    <span>{formatCLP(i.price * i.quantity)}</span>
                  </div>
                  <div className="tp-cart-line-bottom">
                    <QtyControl
                      value={i.quantity}
                      max={Math.min(i.stock, 10)}
                      onChange={(v) => setQuantity(i.productId, v)}
                      label={i.name}
                    />
                    <button type="button" className="tp-link-btn" onClick={() => remove(i.productId)}>
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="tp-drawer-foot">
            <div className="tp-summary-total">
              <span>Subtotal</span>
              <strong>{formatCLP(subtotal)}</strong>
            </div>
            <p className="tp-hint" style={{ margin: 0 }}>
              El despacho se calcula en el checkout. Retiro en taller sin costo.
            </p>
            <Link className="tp-btn tp-btn-primary tp-btn-block" href="/checkout/" onClick={close}>
              Ir a pagar
            </Link>
            <Link className="tp-btn tp-btn-ghost tp-btn-block" href="/carrito/" onClick={close}>
              Ver carrito
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
