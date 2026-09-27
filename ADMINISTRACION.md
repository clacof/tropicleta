# Administración y caja

Acceso: `/admin/`. El pie del sitio incluye el enlace Administración.
En desarrollo, si no se configuró `ADMIN_PASSWORD`, la contraseña es `tropicleta`.
En producción son obligatorios `ADMIN_PASSWORD` y `SESSION_SECRET` (mínimo 16 caracteres).

## Contabilidad

En `/admin/contabilidad/` se registran ingresos y gastos efectivamente cobrados o pagados en CLP enteros. Las órdenes con `paidAt` aparecen automáticamente por fecha de cobro en America/Santiago, sin duplicar registros. Anular una orden no representa un reembolso: registrar el dinero efectivamente devuelto como gasto, categoría Devolución, indicando el código de orden.

El filtro mensual y el CSV incluyen el historial. Los movimientos manuales anulados conservan el motivo, pero no suman a los totales. Para corregir un movimiento, anularlo y crear el correcto. El flujo neto es ingresos menos gastos del período; no es saldo bancario ni utilidad. No incluye facturación electrónica, declaraciones al SII, conciliación bancaria ni contabilidad de partida doble.

## Base de datos

Sin `DATABASE_URL`, el arranque aplica automáticamente las migraciones a PGlite en `.data/pglite`. Respaldar este directorio con el servidor detenido. Para producción usar PostgreSQL persistente y respaldos del proveedor. Con `DATABASE_URL`, ejecutar `npm run db:migrate` antes de desplegar esta versión. La migración `0002_blue_firelord.sql` agrega el libro de caja sin borrar tablas existentes.

Pruebas: `npm run test:accounting` (base temporal en memoria; no modifica datos reales). La prueba de navegador `node tests/accounting-browser.cjs` requiere Playwright y Microsoft Edge; inicia y cierra su propio servidor con una base de datos de prueba separada.

Después de actualizar, reiniciar el servidor local para aplicar la nueva migración si ya estaba abierto.
