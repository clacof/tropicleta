"use client";

import Link from "next/link";
import { useEffect,useRef } from "react";
import { useCart } from "./CartProvider";
import { QtyControl } from "./QtyControl";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { formatCLP } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, close, items, subtotal, setQuantity, remove } = useCart();
  const drawer=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(!isOpen)return;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const focusables=()=>Array.from(drawer.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')??[]).filter(element=>element.offsetParent!==null);
    focusables()[0]?.focus();
    const keepFocus=(event:FocusEvent)=>{if(event.target instanceof Node&&!drawer.current?.contains(event.target))focusables()[0]?.focus();};
    const onKey=(event:KeyboardEvent)=>{
      if(event.key!=="Tab")return;
      const elements=focusables();const first=elements[0];const last=elements.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener("focusin",keepFocus);document.addEventListener("keydown",onKey);
    return()=>{document.removeEventListener("focusin",keepFocus);document.removeEventListener("keydown",onKey);if(previous?.isConnected)previous.focus();};
  },[isOpen]);
  if (!isOpen) return null;

  return (
    <>
      <div className="tp-drawer-backdrop" onClick={close} aria-hidden="true" />
      <aside ref={drawer} className="tp-drawer" role="dialog" aria-modal="true" aria-labelledby="tp-cart-title">
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
