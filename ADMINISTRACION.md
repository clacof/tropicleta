# Administración y caja

Acceso: `/admin/`. El pie del sitio incluye el enlace Administración.
En desarrollo, si no se configuró `ADMIN_PASSWORD`, la contraseña es `tropicleta`.
En producción son obligatorios `ADMIN_PASSWORD` y `SESSION_SECRET` (mínimo 16 caracteres).

## Seguridad del panel

- La sesión dura 2 días. Cambiar `ADMIN_PASSWORD` (o `SESSION_SECRET`) cierra todas las sesiones abiertas.
- Tras 10 contraseñas incorrectas desde una misma IP, esa IP queda bloqueada 15 minutos (se guarda en la tabla `login_attempts`, vale para todas las instancias).
- Cada página y acción del panel verifica la sesión por sí misma.
- **Actividad** (`/admin/actividad/`) guarda el historial de cambios: estados, cobros, productos, servicios, categorías y movimientos de caja, con fecha e IP.

## Reservas y órdenes

- Listas con búsqueda (código, nombre, celular en cualquier formato, email) y paginación de 50.
- El estado de una reserva se guarda al elegirlo en el selector. Al pasar a Confirmada, En taller, Lista o Cancelada se envía un email al cliente si dejó email; el enlace de WhatsApp trae el mensaje del estado.
- El detalle de la reserva (`/admin/reservas/<id>/`) tiene notas internas, presupuesto y **Registrar cobro**, que crea el ingreso en Contabilidad (categoría Taller) enlazado a la reserva. Para corregir un cobro, anularlo en Contabilidad.
- Órdenes: solo se permiten estos cambios manuales: Pagada ↔ Lista, → Entregada, → Anulada (Entregada puede volver a Lista). Las órdenes pendientes o rechazadas solo las cambia la pasarela de pago. Al anular se puede reponer el stock. El cliente recibe un email al pasar a Lista, Entregada o Anulada.

## Catálogo

- Máximo 3 servicios y 4 productos destacados (los que caben en la home).
- Imágenes de productos: subir archivos (JPG, PNG, WebP, AVIF; hasta 4 MB por envío), agregar URL, reordenar (la primera es la portada) y quitar. En Vercel se guardan en **Vercel Blob**: crear un Blob store público y conectarlo al proyecto (define `BLOB_READ_WRITE_TOKEN`). En desarrollo sin Blob se guardan en `public/uploads/` (ignorado por git).
- **Categorías** (`/admin/categorias/`): crear, renombrar, ordenar y eliminar. Al eliminar una categoría de tienda sus productos quedan sin categoría; una categoría de servicios con servicios no se puede eliminar.

## Contabilidad

En `/admin/contabilidad/` se registran ingresos y gastos efectivamente cobrados o pagados en CLP enteros. Las órdenes con `paidAt` aparecen automáticamente por fecha de cobro en America/Santiago, sin duplicar registros. Anular una orden no representa un reembolso: registrar el dinero efectivamente devuelto como gasto, categoría Devolución, indicando el código de orden.

El filtro mensual y el CSV incluyen el historial. Los movimientos manuales anulados conservan el motivo, pero no suman a los totales. Para corregir un movimiento, anularlo y crear el correcto. El flujo neto es ingresos menos gastos del período; no es saldo bancario ni utilidad. No incluye facturación electrónica, declaraciones al SII, conciliación bancaria ni contabilidad de partida doble.

## Base de datos

Sin `DATABASE_URL`, el arranque aplica automáticamente las migraciones a PGlite en `.data/pglite`. Respaldar este directorio con el servidor detenido. Para producción usar PostgreSQL persistente y respaldos del proveedor. Con `DATABASE_URL`, ejecutar `npm run db:migrate` antes de desplegar esta versión. La migración `0002_blue_firelord.sql` agrega el libro de caja y `0003_admin_panel.sql` agrega notas/presupuesto de reservas, el enlace cobro↔reserva, el historial y el bloqueo de ingreso; ninguna borra datos.

Pruebas: `npm run test:admin` (transiciones de órdenes, bloqueo de ingreso, búsqueda) y `npm run test:accounting` (base temporal en memoria; no modifica datos reales). La prueba de navegador `node tests/accounting-browser.cjs` requiere Playwright y Microsoft Edge; inicia y cierra su propio servidor con una base de datos de prueba separada.

Después de actualizar, reiniciar el servidor local para aplicar la nueva migración si ya estaba abierto.
