import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin";
import { StatusBadge, statusLabel } from "@/components/admin/StatusBadge";
import { db, schema } from "@/db";
import { displayPhone, formatCLP, formatDateTime } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export default async function OrdenAdmin({ params }: Props) {
  const { id } = await params;
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.id, Number(id))).limit(1);
  if (!o) notFound();
  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, o.id));
  const wa = `https://wa.me/${o.customerPhone}?text=${encodeURIComponent(`Hola ${o.customerName.split(" ")[0]}, te escribimos de Tropicleta por tu orden ${o.code}.`)}`;

  return (
    <>
      <nav className="tp-breadcrumb">
        <Link href="/admin/ordenes/">Órdenes</Link>
        <span>/</span>
        <span>{o.code}</span>
      </nav>
      <div className="tp-admin-title">
        <h1 className="tp-display">{o.code}</h1>
        <StatusBadge status={o.status} />
      </div>

      <div className="tp-two-col">
        <div className="tp-panel tp-stack">
          {items.map((i) => (
            <div key={i.id} className="tp-summary-row">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span>{formatCLP(i.unitPrice * i.quantity)}</span>
            </div>
          ))}
          <div className="tp-summary-row">
            <span>Subtotal</span>
            <span>{formatCLP(o.subtotal)}</span>
          </div>
          <div className="tp-summary-row">
            <span>Despacho</span>
            <span>{formatCLP(o.shipping)}</span>
          </div>
          <div className="tp-summary-total">
            <span>Total</span>
            <strong>{formatCLP(o.total)}</strong>
          </div>
        </div>

        <div className="tp-stack">
          <div className="tp-panel">
            <dl className="tp-dl tp-small">
              <div>
                <dt>Cliente</dt>
                <dd>{o.customerName}</dd>
              </div>
              <div>
                <dt>Celular</dt>
                <dd>
                  <a href={wa} target="_blank" rel="noopener" className="tp-orange">
                    {displayPhone(o.customerPhone)}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{o.customerEmail}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{o.deliveryMethod === "retiro" ? "Retiro en taller" : `${o.address}, ${o.commune}`}</dd>
              </div>
              {o.notes && (
                <div>
                  <dt>Notas</dt>
                  <dd>{o.notes}</dd>
                </div>
              )}
              <div>
                <dt>Pago</dt>
                <dd>
                  {o.paymentMethod === "webpay" ? "Webpay" : "Mercado Pago"}
                  {o.authorizationCode ? ` · aut. ${o.authorizationCode}` : ""}
                </dd>
              </div>
              <div>
                <dt>Creada</dt>
                <dd>{formatDateTime(o.createdAt)}</dd>
              </div>
              {o.paidAt && (
                <div>
                  <dt>Pagada</dt>
                  <dd>{formatDateTime(o.paidAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {["pagada", "lista", "entregada"].includes(o.status) && (
            <form action={updateOrderStatus} className="tp-panel tp-inline-form">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" className="tp-select" defaultValue={o.status} aria-label="Estado">
                {["pagada", "lista", "entregada", "anulada"].map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
              <button className="tp-btn tp-btn-primary" type="submit">
                Actualizar estado
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
