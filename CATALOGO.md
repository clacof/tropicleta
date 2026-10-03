# Catálogo del taller

El catálogo reúne 39 servicios en ocho categorías. La migración `0004_official_catalog` incorpora una sola vez los nombres, precios y alcances de 24 fichas confirmadas por las láminas del 29/09/2026. Conserva los identificadores y el estado de publicación de las fichas existentes; los otros 15 servicios siguen a cotizar. Las publicaciones posteriores conservan las ediciones del administrador.

Las ocho láminas originales se encuentran en `public/catalogo/`. Retiro y entrega tiene tarifas diferenciadas por zona y por trayecto; no modifica los costos de despacho de la tienda. La mantención completa explicita las exclusiones del catálogo; armado de rueda indica rayos aparte y freno de scooter indica valor por unidad.

Los iconos de navegador proceden del PNG transparente oficial Recurso 22, correspondiente a la mascota del PDF Recurso 35. Se incluyen PNG cuadrado de 96 px, Apple de 180 px y favicon ICO de 64 px. No se modifica el dibujo original.

También prepara 16 productos como borradores: precio por definir, stock cero y sin publicación. Sus ilustraciones son referenciales. En `/admin/productos/`, revisar la marca, descripción, compatibilidad, imágenes, precio y stock antes de marcar **Publicado**. Se pueden guardar avances sin precio; publicar requiere un precio mayor que cero.

La migración `0008_race_lub_product` añade el sellador Race Lub de 250 ml solicitado para probar el carrito: publicado, $10.000 CLP y stock inicial de 6 unidades. No vuelve a cargar existencias al reiniciar. Su imagen de catálogo está en `public/productos/sellador-race-lub-250-ml.png`, editada con ImageGen a partir del aviso proporcionado. Instrucción de edición: conservar el envase y tubo aplicador sobre fondo gris claro; eliminar textos promocionales, precios, insignias, logos y adornos exteriores.

La carga no sustituye productos, existencias ni servicios ocultos. No crea ventas, clientes ni reservas de ejemplo. Se prueba con `npm run test:catalog` sobre una base de datos temporal.

El catálogo público incluye búsqueda por palabras sin distinguir tildes ni mayúsculas. En la tienda, la búsqueda conserva categoría y ordenamiento. Cuando no hay coincidencias, se puede volver al catálogo o consultar por WhatsApp.

Esta actualización no modifica el emblema animado, sus imágenes, sus estilos ni el componente de animación.
