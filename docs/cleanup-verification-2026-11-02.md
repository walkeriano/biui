# Limpieza y verificación — 2 de noviembre de 2026

Se aplicó la limpieza autorizada a partir de la [auditoría previa](code-cleanup-audit-2026-11-02.md). Se conservó una copia del código y los recursos anteriores en `/private/tmp/biui-cleanup-before`, sin archivos de entorno ni credenciales. No se modificaron datos ni ajustes de Supabase.

## Cambios

- Eliminados cinco componentes antiguos de vista previa: `PreviewHero`, `PreviewAbout`, `PreviewServices`, `PreviewBooking` y `PreviewContact`. Las vistas previas activas siguen utilizando `PreviewPanel` → `PreviewPage` → `PublicPage`.
- Retirados los siete iconos sin consumidores del import, registro y export de Font Awesome. Se mantienen el registro de los 45 iconos usados, su configuración y la hoja de estilos.
- Eliminadas las paletas `colorOptions` y `secondaryColorOptions`, `publicFallbackServices`, `getPublicPageSlugs`, `formatSelectedDay`, `assertSupabaseAdminConfig` e `isSupabaseAdminConfigured`, sin consumidores activos. Se conserva el cliente administrativo y su configuración marcada como exclusiva de servidor.
- Retirado el estado de estadísticas de compresión que el editor no mostraba y su paso entre hooks. El algoritmo, límites y estadísticas devueltas por `compressImageFile` permanecen intactos.
- Simplificados el condicional idéntico de estilos en la portada, la clase duplicada de tamaño en el enlace de acceso y el contenedor de la cabecera de servicios que había quedado con un solo hijo.
- Eliminados tokens CSS sin consumidores encontrados y el reset duplicado de `box-sizing`, manteniendo el reset base de Tailwind.
- Retiradas las reglas globales de tipografía de controles y decoración de enlaces que anulaban las utilidades de Tailwind. Ahora los tamaños, pesos y subrayados declarados por cada componente se aplican. Esta es una corrección visual intencionada, no un cambio de comportamiento de los formularios.

## Recursos públicos

Se consultaron en modo de solo lectura los campos JSON que contienen imágenes en todas las páginas profesionales actuales, incluidos borradores. La consulta recorrió la tabla de forma paginada y devolvió una página en el momento de comprobarla. No se exportaron contenidos ni identificadores de la cuenta.

Ninguna página referenciaba `movil-png.png`, `all-dash-home.jpg`, `next.svg`, `vercel.svg`, `globe.svg`, `window.svg` o `file.svg`. Tampoco había referencias en código, scripts ni pruebas. Se retiraron esos siete archivos: **1.457.159 bytes**, aproximadamente **1,46 MB**. También se retiró el archivo local ignorado `public/.DS_Store`.

La comprobación cubre el repositorio y las páginas guardadas actuales. No certifica enlaces externos independientes o versiones antiguas del sitio. Los originales se conservan en la copia temporal. Permanecen las imágenes del landing, logos, marcos de vista previa y favicon que sí se utilizan.

## Comprobaciones

- `npm run check`: ESLint, las **34 pruebas** y compilación correctos tras la limpieza de código.
- Nueva compilación de producción tras retirar los recursos públicos y ajustar el formato de los archivos.
- `git diff --check`: sin errores.
- El recorrido de importaciones vuelve a encontrar **81 archivos de fuente y los 81 alcanzables**, sin componentes huérfanos en el conjunto JS/JSX/CSS inspeccionado.
- Se compararon los archivos de lógica crítica con la copia previa: el algoritmo de compresión, API y validación de reservas, intervalos, caché, contexto de autenticación, acciones de sesión, mapper, guardado de páginas y estado del editor no cambiaron. Se conservaron las pruebas y las dependencias.

### Verificación visual

Se renderizaron los componentes reales antes y después con sus respectivos CSS compilados. Se compararon nueve pantallas en cinco anchos: **320, 390, 768, 1024 y 1440 px**, para un total de **45 comparaciones**. Se incluyeron landing comercial, página pública, modo de vista previa, acceso, registro, recuperación, dashboard, reservas y secciones abiertas del editor.

Las comprobaciones no encontraron desbordamiento horizontal de página antes ni después, nuevos botones con contenido recortado, pérdida de iconos visibles ni retorno del hueco entre cabecera y portada móvil. Se comprobaron las dimensiones de controles y se confirmó que el tamaño y peso de texto y el subrayado ahora siguen las utilidades declaradas. Se inspeccionaron capturas de acceso, editor, dashboard y página pública.

Las capturas y resultados detallados quedaron en `/private/tmp/biui-cleanup-visual-2kSegN`. Esta comparación se hizo sobre HTML estático de los componentes en Chrome aislado, con sesión y navegación simuladas. No sustituye un recorrido interactivo completo con hidratación de React o cuentas reales; no se enviaron correos ni se crearon reservas remotas.

## Tamaño de compilación

Comparación de la compilación de producción anterior y posterior a la limpieza de código, con las mismas dependencias. Sumas de todos los archivos CSS y chunks JavaScript del navegador; no representan lo descargado por una sola ruta.

| Archivos | Antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| CSS sin comprimir | 90.873 bytes | 89.372 bytes | 1.501 bytes |
| CSS con gzip de comparación | 16.400 bytes | 16.089 bytes | 311 bytes |
| JavaScript sin comprimir | 1.434.767 bytes | 1.430.982 bytes | 3.785 bytes |
| JavaScript con gzip de comparación | 425.890 bytes | 424.543 bytes | 1.347 bytes |

La comprobación ya no encuentra las definiciones de los iconos retirados en el chunk de iconografía. No se han medido tiempos de carga ni puntuaciones de Lighthouse. Retirar recursos públicos que no se solicitaban reduce el repositorio, sin implicar una reducción equivalente de transferencia inicial.

## Conservado para una intervención independiente

No se cambió la carga de Inter y Playfair Display, ni se eliminó el registro global completo de iconos. Se mantienen los datos de demostración de desarrollo y los valores por defecto consumidos por la aplicación. También se conserva la compatibilidad de reservas con el esquema remoto previo a la migración de intervalos.
