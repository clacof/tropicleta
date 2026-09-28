# Mercado Pago en Vercel — guía de configuración

El código de Mercado Pago (Checkout Pro) ya está implementado. **No hay que modificar código.** Esta guía cubre
solo la configuración: crear la aplicación en Mercado Pago, cargar las variables de entorno en Vercel, configurar
el webhook y probar el flujo completo.

## Cómo funciona (contexto)

1. El cliente elige Mercado Pago en `/checkout/`. El servidor recalcula el total, crea la orden `pendiente` y una
   preferencia de Checkout Pro con `external_reference` = código de orden (`TPC...`).
   Archivo: `src/actions/checkout.ts`.
2. El cliente paga en Mercado Pago y vuelve a `/checkout/gracias/?orden=TPC...&payment_id=...`. Esa página consulta
   el pago en la API y actualiza la orden.
3. En paralelo, Mercado Pago llama a `POST /api/mercadopago/webhook/`. El endpoint valida la firma
   (`MP_WEBHOOK_SECRET`), consulta el pago en la API y marca la orden. Archivo: `src/app/api/mercadopago/webhook/route.ts`.
4. Con el pago `approved` y un monto que coincide con el total, la orden pasa a `pagada`: se descuenta stock y se
   envían emails al cliente y al admin. Si el monto no coincide, o si el pago se devuelve (`refunded`) o tiene
   contracargo (`charged_back`), la orden no cambia de estado y se envía un email de alerta a `ADMIN_EMAIL`.
   Archivo: `src/lib/orders.ts`.

Sin `MP_ACCESS_TOKEN`, el checkout muestra Mercado Pago como no disponible y solo funciona Webpay.

## Requisitos previos

- Proyecto de Vercel conectado a este repo, con el dominio de producción (`tropicleta.com`) ya asignado.
- `DATABASE_URL` (Postgres) configurada en Vercel. El build la exige: `vercel.json` ejecuta `src/db/deploy.ts`.
- Cuenta de **Mercado Pago Chile** del negocio. Tiene que ser de Chile porque los ítems se cobran en `CLP`.
- Recomendado: `RESEND_API_KEY`, `EMAIL_FROM` y `ADMIN_EMAIL` configuradas. Sin ellas no salen los emails de venta
  ni las alertas de Mercado Pago.

## Paso 1 — Crear la aplicación en Mercado Pago

1. Entrar a <https://www.mercadopago.cl/developers/panel/app> con la cuenta del negocio.
2. **Crear aplicación**:
   - Tipo de solución: **Pagos online**.
   - ¿Usas plataforma de e-commerce?: **No**.
   - Producto: **Checkout Pro**.
3. En la aplicación, entrar a **Credenciales de prueba** y copiar el **Access Token** (empieza con `APP_USR-` o
   `TEST-`).
4. En **Cuentas de prueba**, crear dos usuarios de prueba: uno **vendedor** y uno **comprador**, ambos de Chile.
   Guardar el usuario y la contraseña del comprador para pagar en las pruebas.

## Paso 2 — Configurar el webhook en Mercado Pago

1. En la aplicación: **Webhooks → Configurar notificaciones**.
2. Tanto en **Modo de prueba** como en **Modo productivo**, usar la URL:
   ```
   https://tropicleta.com/api/mercadopago/webhook/
   ```
   La barra final es importante: el sitio usa `trailingSlash`.
3. Evento: marcar solo **Pagos** (`payment`).
4. Guardar y copiar la **clave secreta** que aparece. Va en `MP_WEBHOOK_SECRET`.

Nota: el código también envía `notification_url` en cada preferencia, así que Mercado Pago puede notificar el mismo
pago dos veces. No es un problema, porque el procesamiento es idempotente.

## Paso 3 — Variables de entorno en Vercel (fase de pruebas)

En Vercel: **Project → Settings → Environment Variables**, entorno **Production**.

| Variable | Valor en pruebas | Notas |
|---|---|---|
| `MP_ACCESS_TOKEN` | Access Token **de prueba** | Secreto. Marcar como *Sensitive*. |
| `MP_WEBHOOK_SECRET` | Clave secreta del Paso 2 | Secreto. **Obligatoria en producción**: sin ella el webhook responde 503. |
| `MP_SANDBOX` | `1` | Usa `sandbox_init_point`. |
| `NEXT_PUBLIC_SITE_URL` | `https://tropicleta.com` | **Debe ser https**. Si no, no se envían `auto_return` ni `notification_url`. Sin barra final. |

Por CLI (alternativa, desde la raíz del repo con el proyecto vinculado mediante `vercel link`):

```bash
vercel env add MP_ACCESS_TOKEN production --sensitive
vercel env add MP_WEBHOOK_SECRET production --sensitive
vercel env add MP_SANDBOX production        # valor: 1
vercel env add NEXT_PUBLIC_SITE_URL production   # valor: https://tropicleta.com
```

**Después de agregar o cambiar variables hay que redesplegar.** Vercel solo las aplica en despliegues nuevos, y
`NEXT_PUBLIC_SITE_URL` se incrusta en el build.

```bash
vercel --prod
# o, desde el dashboard: Deployments → último despliegue de producción → Redeploy
```

### ¿Y los Preview deployments?

No se recomienda probar Mercado Pago en Preview. Las URLs de Preview cambian en cada despliegue y suelen estar
protegidas por Vercel Authentication, que bloquea el webhook con un 401. Por eso se prueba en el dominio de producción
con credenciales de prueba (esta fase) y después se cambia a credenciales reales (Paso 5). Si Preview no tiene
`MP_ACCESS_TOKEN`, allí Mercado Pago simplemente aparece como no disponible.

## Paso 4 — Probar el flujo completo

1. Abrir `https://tropicleta.com/tienda/`, agregar un producto con stock y ir a `/checkout/`.
2. Completar los datos, elegir **Mercado Pago** y confirmar. Debe redirigir a Mercado Pago.
3. Iniciar sesión con el **usuario comprador de prueba** y pagar con una tarjeta de prueba de Chile. Los números están
   en <https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards>.
   El **nombre del titular** define el resultado:
   - `APRO` → aprobado.
   - `OTHE` → rechazado.
   - `CONT` → pendiente.
4. Verificar:
   - [ ] **APRO**: vuelve solo a `/checkout/gracias/` con "¡Gracias por tu compra!", la orden aparece como **Pagada**
     en `/admin/ordenes/`, el stock baja y llegan los emails al cliente y al admin.
   - [ ] **OTHE**: la página muestra "El pago no se completó" y la orden queda **Rechazada**.
   - [ ] **Webhook**: en Mercado Pago (**Webhooks → Historial de notificaciones**), las notificaciones `payment`
     responden **200**. En Vercel (**Logs**, filtrar por `/api/mercadopago/webhook`) no aparece
     `firma inválida` ni `falta MP_WEBHOOK_SECRET`.
   - [ ] **Webhook sin página de retorno**: pagar con APRO y cerrar la pestaña antes de volver al sitio. Al rato, la
     orden debe quedar **Pagada** igual.
5. Opcional: en **Webhooks → Simular notificación** se puede enviar un `payment` de prueba. Con un ID inexistente, el
   endpoint responde 500 y Mercado Pago reintenta. Es lo esperado: lo que importa es que no responda 401 (firma).

## Paso 5 — Pasar a producción (cobros reales)

1. En la aplicación de Mercado Pago: **Credenciales de producción → Activar credenciales**. Mercado Pago pide la
   industria y el sitio web (`https://tropicleta.com`), y la cuenta debe tener validada la identidad y una cuenta
   bancaria para retiros.
2. Copiar el **Access Token de producción** (`APP_USR-...`).
3. Confirmar que el webhook de **Modo productivo** (Paso 2) apunta a la misma URL. Si la clave secreta de producción es
   distinta, actualizar `MP_WEBHOOK_SECRET`.
4. En Vercel (Production):
   - `MP_ACCESS_TOKEN` → token de producción.
   - `MP_SANDBOX` → `0`, o borrar la variable.
   - `MP_WEBHOOK_SECRET` → clave de producción, si cambió.
5. **Redesplegar** producción.
6. Hacer una compra real de bajo monto con una tarjeta propia. Verificar que la orden quede Pagada, luego devolver el
   pago desde la cuenta de Mercado Pago. Tras la devolución debe llegar a `ADMIN_EMAIL` el email "Revisar orden ...".
   La orden **no** se anula sola: se anula a mano y la devolución se registra en `/admin/contabilidad/` como gasto
   con categoría *Devolución* (ver `ADMINISTRACION.md`).

## Resumen de variables

| Variable | Pruebas | Producción |
|---|---|---|
| `MP_ACCESS_TOKEN` | token de prueba | `APP_USR-...` de producción |
| `MP_WEBHOOK_SECRET` | clave secreta del webhook | clave secreta del webhook (productivo) |
| `MP_SANDBOX` | `1` | `0` o sin definir |
| `NEXT_PUBLIC_SITE_URL` | `https://tropicleta.com` | `https://tropicleta.com` |
| `ADMIN_EMAIL` | email del taller | email del taller |

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| El checkout dice "Mercado Pago aún no está disponible" | Falta `MP_ACCESS_TOKEN` en ese entorno, o no se redesplegó. |
| No vuelve solo al sitio después de pagar | `NEXT_PUBLIC_SITE_URL` no es https (no se envía `auto_return`), o no se redesplegó. |
| La orden queda "Pendiente" para siempre | El webhook falla: revisar que el Historial de notificaciones responda 200 y que el Access Token sea del mismo modo (prueba/producción) que el pago. |
| El webhook responde 401 | `MP_WEBHOOK_SECRET` no corresponde a la clave del modo (prueba/producción) que envió la notificación. |
| El webhook responde 503 | Falta `MP_WEBHOOK_SECRET` en producción. |
| El webhook responde 500 | Error al consultar el pago o en la BD. Revisar Logs de Vercel (`[mp webhook]`). Mercado Pago reintenta solo. |
| Llega el email "Revisar orden" por monto distinto | El monto cobrado no coincide con el total de la orden. No entregar sin revisar el pago en Mercado Pago. |
| Error al crear la preferencia (`[checkout] error pasarela` en logs) | Token inválido o cuenta que no es de Chile (moneda `CLP`). |

## Limitación conocida

El stock se descuenta al **confirmarse el pago**, no al crear la orden. Si dos clientes compran la última unidad al
mismo tiempo, ambos pagos pueden aprobarse. Con el volumen actual el riesgo es bajo. Si pasa, llegan dos emails de
venta y hay que devolver uno de los pagos a mano.
