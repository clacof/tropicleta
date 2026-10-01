# Cotización por paquetes

Se amplía la tabla existente de servicios; precios y relaciones permanecen en PostgreSQL. Cada registro indica tipo (servicio/paquete), vehículos compatibles, posibilidad de selección individual y componentes con obligatoriedad. No se crean composiciones sin confirmación del taller.

Los paquetes sin composición definida se cotizan solos. Esta restricción evita asumir que un adicional está fuera del paquete. El administrador debe definir su composición para habilitar combinaciones y reconocimiento automático.

La selección conserva tres listas: trabajos manuales, paquetes explícitos y trabajos excluidos. Quitar un paquete conserva los trabajos manuales. Quitar un trabajo incluido desactiva el reconocimiento del paquete cuando era obligatorio, sin borrar los demás trabajos. Los componentes opcionales se incluyen al elegir un paquete, pero pueden quitarse sin descompletarlo.

El motor resuelve una cobertura exacta: ningún trabajo se cobra en dos líneas. Los paquetes anidados se expanden a trabajos únicos. Aplica la combinación conocida más económica; valores desconocidos no se consideran gratuitos. Empates: menos cargos, luego orden estable por identificador. La configuración de los siete packs confirmados se detalla en `manual-packs.md`; quedan como borradores para revisar y activar desde el administrador.

La jerarquía se valida en el administrador y en el servidor: ciclos, referencias inexistentes, duplicados, dependencias inactivas y vehículos incompatibles. El servidor reconstruye la cotización con el catálogo vigente; nunca acepta precios enviados por el navegador. El desglose y la selección se guardan en la reserva para preservar el historial aunque cambie el catálogo.

## Archivos y validación

- `src/lib/package-quote.ts`: expansión jerárquica, selección y cobertura de precios compartida.
- `src/components/forms/PackageSelector.tsx` y `BookingForm.tsx`: paquetes arriba, servicios debajo, filtros por vehículo, desglose, descuento y transporte existentes. La selección válida se conserva durante la sesión del navegador.
- `src/components/admin/ServiceForm.tsx` y `src/actions/admin.ts`: edición visual, obligatoriedad, vehículos, validación al guardar y protección al desactivar componentes de paquetes activos.
- `src/actions/booking.ts`: recálculo servidor, validación de la selección y guardado del detalle en la reserva.
- `drizzle/0007_package_quotes.sql`, su snapshot y `src/db/schema.ts`: migración compatible, sin borrar historial ni definir componentes sin confirmar.
- `tests/package-quote.test.ts`: los doce escenarios solicitados, más componentes opcionales, precios desconocidos, referencias inválidas, vehículos y restricciones de selección. Los paquetes utilizados por las pruebas son ficticios.

Se ejecutaron las pruebas de paquetes, cotizaciones, validación y catálogo. Se comprobó en una base local separada que el administrador guarda un paquete con dos componentes y el cotizador lo reconoce automáticamente sin duplicar cargos. El paquete de prueba se dejó oculto. No se enviaron correos ni solicitudes reales.

## Configuración pendiente del taller

En Administración → Servicios, abre cada mantención, ajuste inicial y armado. Confirma vehículos, precio y componentes; marca los obligatorios. Primero configura los paquetes inferiores y luego selecciónalos como componentes de los superiores. No hay relaciones inventadas en los paquetes reales.

Los siete packs del documento ya tienen composición configurada. Mantención eléctrica y armado de bicicleta nueva siguen pendientes y cotizables por separado. Al activar un pack, activa primero sus packs componentes.
