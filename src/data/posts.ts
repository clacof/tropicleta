/** Artículos del blog "Consejos" (contenido DUMMY de ejemplo). Cuerpo en párrafos; "## " marca subtítulos. */
export type Post = { slug: string; title: string; excerpt: string; date: string; readingMinutes: number; body: string };

export const posts: Post[] = [
  {
    slug: "cada-cuanto-hacer-mantencion",
    title: "¿Cada cuánto hacerle mantención a tu bici?",
    excerpt: "Una guía simple según cuánto pedaleas, para que tu bici no te deje botado en plena ruta.",
    date: "2026-09-10",
    readingMinutes: 4,
    body: `La respuesta corta: depende de cuánto la uses y en qué condiciones. En el norte, el polvo y la tierra aceleran el desgaste de la transmisión, así que conviene revisar más seguido que en otras zonas.

## Si pedaleas todos los días
Lubrica la cadena cada semana y haz una mantención básica cada 2 o 3 meses. Una mantención completa al año mantiene todo en orden.

## Si sales el fin de semana
Revisa presión y frenos antes de cada salida, lubrica cada 2 o 3 salidas y haz una mantención completa una vez al año, idealmente antes de la temporada de rutas.

## Señales de que necesita taller ya
Cambios que saltan, frenos que chillan o se van al fondo, ruidos en el pedalier o juego en la dirección. No esperes a que empeore: un ajuste a tiempo sale mucho más barato que cambiar piezas.`,
  },
  {
    slug: "tubeless-vale-la-pena",
    title: "Tubeless: ¿vale la pena en Atacama?",
    excerpt: "Espinas, piedras y calor. Te contamos por qué el tubeless es casi obligatorio para el MTB en la zona.",
    date: "2026-08-22",
    readingMinutes: 3,
    body: `El sistema tubeless elimina la cámara y usa un sellante líquido que tapa pinchazos pequeños al instante. En cerros con espinas y piedras sueltas, la diferencia se nota desde la primera salida.

## Ventajas
Menos pinchazos, puedes usar menos presión para tener más agarre y la rueda queda más liviana.

## Lo que hay que cuidar
El sellante se seca con el tiempo, más rápido con calor. Recomendamos revisarlo cada 2 o 3 meses y renovarlo cuando haga falta.

## ¿Mi rueda sirve?
La mayoría de las llantas modernas son compatibles. Tráela al taller y te decimos qué necesita.`,
  },
  {
    slug: "cuidar-la-cadena",
    title: "Cómo cuidar la cadena para que dure el doble",
    excerpt: "Limpieza, lubricante correcto y cuándo cambiarla antes de que se coma el cassette.",
    date: "2026-08-05",
    readingMinutes: 3,
    body: `La cadena es la pieza que más trabaja y la que más se descuida. Cuidarla bien alarga la vida de todo el sistema de transmisión.

## Limpia antes de lubricar
Aplicar lubricante sobre una cadena sucia forma una pasta que desgasta todo. Limpia con desengrasante, seca y recién ahí lubrica.

## Usa lubricante seco en el norte
Los lubricantes de cera o secos acumulan menos polvo. Aplica una gota por eslabón y retira el exceso con un paño.

## Mide el desgaste
Con un medidor de cadena sabes cuándo cambiarla. Si esperas demasiado, también tendrás que cambiar cassette y platos.`,
  },
  {
    slug: "revision-antes-de-salir",
    title: "La revisión de 2 minutos antes de cada salida",
    excerpt: "Cinco chequeos rápidos que evitan la mayoría de los problemas en ruta.",
    date: "2026-07-18",
    readingMinutes: 2,
    body: `No necesitas herramientas para esta revisión. Hazla antes de cada salida y te ahorrarás sorpresas.

## 1. Presión
Aprieta los neumáticos o usa el bombín con manómetro.

## 2. Frenos
Aprieta ambas manillas: deben frenar firme antes de tocar el manubrio.

## 3. Ruedas
Revisa que los cierres o ejes pasantes estén bien apretados.

## 4. Cadena
Que esté lubricada y no haga ruido.

## 5. Kit de emergencia
Cámara o sellante, parches, bombín y multiherramienta. Todo cabe en un bolso pequeño.`,
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
