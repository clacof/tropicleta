# Packs manuales y bajas recuperables

En Administración → Servicios aparecen los packs de servicios y el botón **Nuevo pack de servicios**. Un pack usa la tabla de servicios existente: se seleccionan referencias a trabajos o a otros packs, sin duplicar servicios ni crear productos físicos para ellos.

Los siete packs del documento se guardan como borradores. El administrador muestra el precio actual de cada componente, el valor individual y el ahorro calculados sobre trabajos únicos. Conserva los precios individuales existentes; reutiliza los registros genéricos de ajuste y purga para el freno delantero, y añade únicamente los trabajos expresamente pedidos: ajuste trasero ($7.000), sangrado trasero ($15.000) y tornillería ($3.000).

Las referencias del documento no coinciden todas con la suma de trabajos individuales: completa $83.000, completa con sangrados $113.000, doble suspensión $208.000 y doble suspensión con sangrados $238.000. El documento usaba precios de packs inferiores en algunas referencias. Se muestran las diferencias en el administrador; no se ajustan precios individuales para forzar esos importes.

Para activar un pack anidado, activa primero sus packs componentes. Los packs de doble suspensión requieren marcar esa compatibilidad en el administrador y que el cliente indique doble suspensión en el cotizador; el servidor vuelve a validar esa condición.

**Quitar** retira productos o servicios del catálogo y del listado normal, sin borrar compras, reservas, precios ni componentes. **Ver quitados / recuperar** permite restaurarlos como borradores. Un servicio referenciado por otro pack no puede quitarse hasta desvincularlo, incluso si ese pack está en borrador. Las acciones requieren sesión de administrador y quedan auditadas.

Migración: `0010_manual_service_packs.sql`. Cálculo de referencia: `src/lib/package-reference.ts`. Edición de packs: `/admin/servicios/packs/nuevo/`. Precio, componentes y compatibilidad se guardan mediante la misma acción validada de servicios. Se mantienen las reglas de cobertura sin cobros duplicados y las cotizaciones guardan su desglose.
