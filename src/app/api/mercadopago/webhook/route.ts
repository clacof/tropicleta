import { WebhookSignatureValidator } from "mercadopago";
import { NextResponse, type NextRequest } from "next/server";
import { syncMercadoPagoPayment } from "@/lib/orders";

/** Webhook de Mercado Pago (tipo "payment"). Confirma el pago consultando la API, nunca confía en el body. */
export async function POST(req: NextRequest) {
  const url = req.nextUrl;
  const body = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };
  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: req.headers.get("x-signature"),
        xRequestId: req.headers.get("x-request-id"),
        dataId,
        secret,
      });
    } catch (e) {
      console.warn("[mp webhook] firma inválida", e);
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true, ignored: true });

  try {
    await syncMercadoPagoPayment(dataId);
  } catch (e) {
    console.error("[mp webhook]", e);
    return NextResponse.json({ ok: false }, { status: 500 }); // MP reintenta
  }
  return NextResponse.json({ ok: true });
}
