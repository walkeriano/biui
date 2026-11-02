# Auditoría de código y estilos — 2 de noviembre de 2026

Solo análisis: no se eliminaron ni modificaron componentes, estilos, dependencias, imágenes o datos remotos. Este documento es el único archivo añadido por esta revisión.

**Actualización posterior:** la limpieza fue autorizada y aplicada el mismo día. La descripción siguiente conserva los hallazgos previos; consulta [los cambios y su verificación](cleanup-verification-2026-11-02.md) para el estado actual.

Se encontraron componentes obsoletos, recursos sin referencias y dos conflictos reales de CSS. La aplicación conserva piezas necesarias que pueden parecer duplicadas; no conviene hacer una eliminación general.

## Método y límites

- Se recorrieron las importaciones y reexportaciones de 86 archivos JS/JSX/CSS mediante el parser de TypeScript instalado, tomando como entradas las páginas, layouts, rutas API y el proxy de Next.js. Resultado: 81 archivos alcanzables y cinco componentes sin conexión con las entradas actuales.
- Se cruzaron referencias de funciones, constantes, iconos y archivos de `public` con `src`, pruebas, scripts y documentación.
- Se inspeccionaron el CSS y los chunks JavaScript de la compilación existente. No se cambió el código para comparar tamaños ni se midieron ahorros de transferencia o tiempos de carga.
- Se reprodujeron conflictos de cascada en Chrome aislado usando el CSS compilado. La desactivación de reglas se hizo únicamente en esa página de prueba, sin tocar los archivos originales ni sesiones personales.
- No se consultó el contenido almacenado en Supabase para buscar referencias a recursos públicos. Las referencias externas, URLs guardadas y consumidores fuera del repositorio requieren comprobación antes de borrar archivos.

## 1. Conflictos CSS confirmados: revisar antes de cualquier limpieza automática

### Tipografía de botones y formularios

[globals.css, líneas 110–115](../src/app/globals.css) declara `font: inherit` para `button`, `input`, `textarea` y `select` fuera de las capas de Tailwind. Esa regla global tiene prioridad sobre utilidades de tipografía dentro de las capas.

En la prueba se asignaron las mismas clases `text-xs font-bold` a un texto de referencia, un botón y un input:

| Elemento | CSS actual | Desactivando únicamente el reset conflictivo en la prueba |
| --- | --- | --- |
| Texto de referencia | 12 px, peso 700 | 12 px, peso 700 |
| Botón | 16 px, peso 400 | 12 px, peso 700 |
| Input | 16 px, peso 400 | 12 px, peso 700 |

La regla no es necesaria para conservar el comportamiento de herencia básico en este ejemplo: el CSS compilado ya incluye el reset de formularios de Tailwind en su capa base. **Es una candidata a corregir o retirar, pero su cambio puede alterar el aspecto actual de controles en todas las pantallas.** Necesita revisión visual de acceso, dashboard, editor y reservas; no debe tratarse como una eliminación sin efectos visibles.

### Subrayado de enlaces

[globals.css, líneas 131–133](../src/app/globals.css) aplica `text-decoration: none` a todos los enlaces, también fuera de las capas. En una ventana de 1280 px, un enlace con `lg:underline` tuvo `text-decoration-line: none`. Al desactivar solo esta regla en el documento de prueba, pasó a `underline`.

Esto afecta, por ejemplo, al subrayado declarado para la sección activa en la [cabecera comercial](../src/components/Header/Header.jsx). Los subrayados implementados mediante bordes, como algunos enlaces de la página profesional, son distintos y no dependen de esa utilidad. La corrección requiere comprobar enlaces normales, hover, foco y navegación activa.

## 2. Cinco componentes de vista previa antiguos: candidatos claros a retirar

Los siguientes archivos no están importados desde las rutas actuales, otros componentes, pruebas ni scripts:

- [PreviewHero.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewHero.jsx)
- [PreviewAbout.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewAbout.jsx)
- [PreviewServices.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewServices.jsx)
- [PreviewBooking.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewBooking.jsx)
- [PreviewContact.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewContact.jsx)

Suman 11.492 bytes de fuente y aproximadamente 334 líneas. Contienen una versión antigua del diseño, textos e identidad de ejemplo que ya no corresponden a la plantilla actual.

La vista previa real usa [PreviewPanel.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewPanel.jsx) → [PreviewPage.jsx](../src/components/dashboard/MyPageView/components/preview/PreviewPage.jsx) → [PublicPage.jsx](../src/components/public-page/PublicPage.jsx). Esos tres componentes sí son necesarios.

Los cinco archivos antiguos no son alcanzables desde las entradas JS actuales, así que su retirada no implica por sí sola un ahorro equivalente en JavaScript descargado. Sin embargo, contienen clases que siguen presentes en el CSS compilado: por ejemplo, las clases de fondo naranja y ancho de dos quintos de `PreviewHero` no aparecen en el resto de `src`. Esto es coherente con que Tailwind siga detectando candidatos en esos archivos. El ahorro exacto de CSS debe medirse reconstruyendo después de una eliminación autorizada.

Riesgo de retirada: bajo según las referencias actuales, con compilación y revisión de las dos vistas previas después del cambio.

## 3. Registro de iconos sobredimensionado: impacto real en el JavaScript

[fontawesome.js](../src/lib/fontawesome.js) importa, registra mediante `library.add` y reexporta 52 iconos. Los módulos alcanzables importan 45; siete no tienen consumidores actuales:

`faCircleQuestion`, `faFileLines`, `faGlobe`, `faLeaf`, `faLightbulb`, `faPlay` y `faQuoteLeft`.

Sus nombres aparecen en un chunk del navegador de la compilación inspeccionada. El registro global los referencia aunque ninguna pantalla los utilice, por lo que esta limpieza tiene una relación más directa con el peso de ejecución que borrar archivos de imagen no solicitados.

También podría evaluarse eliminar el registro masivo: los componentes actuales reciben objetos de iconos, sin haberse encontrado referencias de icono por nombre que lo necesiten. Esa es una optimización separada, de riesgo mayor que retirar solo los siete iconos sin uso. Deben conservarse la configuración necesaria de Font Awesome y su hoja de estilos explícita; no eliminar la integración completa.

No se ha cuantificado el ahorro comprimido ni se ha probado una compilación sin el registro.

## 4. Funciones, constantes y estado sin consumidores actuales

| Elemento | Evidencia y recomendación |
| --- | --- |
| `colorOptions` y `secondaryColorOptions` en [data.js](../src/components/dashboard/MyPageView/data.js) | Las paletas están definidas pero no se importan. El selector de colores actual utiliza su propio control. Candidatas a retirar. |
| `publicFallbackServices` en [defaults.js](../src/lib/professionalPage/defaults.js) | Solo está definido y reexportado; no tiene consumidores encontrados. Candidato a retirar. |
| `getPublicPageSlugs` en [publicPages.js](../src/data/publicPages.js) | No tiene llamadas ni importaciones. No hay un `generateStaticParams` que lo utilice actualmente. Candidato a retirar. |
| `formatSelectedDay` en [availability.js](../src/lib/availability.js) | Su único consumidor es el antiguo `PreviewBooking`. Retirarlo junto con ese componente, conservando las funciones de calendario activas. |
| `assertSupabaseAdminConfig` y `isSupabaseAdminConfigured` en [serverConfig.js](../src/lib/supabase/serverConfig.js) | El booleano solo alimenta la función, que no tiene consumidores. No retirar el módulo completo: `supabaseServiceRoleKey` y el marcador `server-only` siguen siendo necesarios. |
| `compressionStats` en [useImageCompressor.js](../src/hooks/useImageCompressor.js) | Se guarda en estado y se devuelve a `useImageUpload`, que lo vuelve a exponer; el editor no lo consume. Se podría simplificar ese estado y el paso del valor. No retirar la compresión ni las estadísticas de `compressImageFile`, que se usan en verificaciones. |

La mayoría de estos cambios mejorarían mantenimiento. Las exportaciones puras sin consumidores pueden estar ya excluidas del bundle; no se debe prometer una mejora visible de velocidad por cada eliminación. El estado de estadísticas introduce actualizaciones que podrían evitarse, pero no se midieron renders ni tiempos y React puede agrupar actualizaciones.

## 5. Simplificaciones pequeñas de estilos y JSX

- En [PublicHero.jsx](../src/components/public-page/PublicHero.jsx), las dos ramas de `contentClassName` son idénticas. Puede ser una sola cadena. Las ramas de `sectionClassName` son diferentes y deben conservarse.
- En [Header.jsx](../src/components/Header/Header.jsx), el enlace de inicio de sesión declara `text-base` y `text-sm` en el mismo breakpoint. Conviene elegir el tamaño deseado; la resolución depende del CSS generado, no del orden visual de las clases en el atributo.
- En [PublicServices.jsx](../src/components/public-page/PublicServices.jsx), queda un contenedor flex pensado para distribuir título y enlace. Tras retirar «Ver todos los servicios», solo contiene un hijo. Es candidato a simplificar, comprobando que los espacios y anchos se mantengan.
- En [globals.css](../src/app/globals.css), `--focus-ring` no tiene consumidores encontrados. Tampoco se localizaron usos de los tokens de color de texto `muted-foreground`, `primary-foreground`, `accent-foreground`, `success-foreground`, `danger-foreground` ni del color `success-hover` fuera de sus declaraciones y alias. Son candidatos secundarios, con beneficio pequeño.
- La regla global de `box-sizing: border-box` repite parte del reset de Tailwind. No se observó un conflicto por ella: prioridad baja.

## 6. Siete recursos públicos sin referencias locales: confirmar antes de borrar

`movil-png.png`, `all-dash-home.jpg`, `next.svg`, `vercel.svg`, `globe.svg`, `window.svg` y `file.svg` no aparecen referenciados en el código activo ni en las búsquedas de pruebas, scripts y documentación. Suman aproximadamente **1,46 MB en disco**, principalmente los dos primeros.

Son candidatos, no archivos cuya retirada se haya demostrado segura. Las páginas guardadas aceptan ciertas URLs relativas y podrían apuntar a un archivo de `public`; además puede haber enlaces externos. Antes de eliminarlos hay que revisar esas referencias almacenadas.

No se descargan todos los archivos de `public` al abrir una página: retirarlos reduce espacio del repositorio y del artefacto, pero no garantiza menor transferencia inicial.

`public/.DS_Store` es un archivo local de macOS, ignorado y no versionado, sin función en la aplicación.

## 7. Elementos que deben conservarse

- `mock-laptop.png` y `mock-movil.png`: marcos usados en las vistas previas.
- `service-1.png` a `service-4.png`, `bg-oficial.png` y `logo-biui.jpg`: recursos del landing comercial. Algunos originales son pesados, pero están referenciados y varios se sirven mediante `next/image`; su tamaño en disco no equivale a la descarga real.
- `src/app/favicon.ico`: Next.js lo incorpora por convención; la ausencia de importaciones no indica desuso.
- `publicPageFallbackData`: aunque contiene ejemplos, el mapper consume sus colores, estilo y horarios. No retirar todo el objeto por encontrar datos de demostración.
- `src/data/publicPages.js`: mantiene el modo de demostración en desarrollo sin Supabase. Puede decidirse retirar ese modo, pero actualmente tiene un uso explícito.
- `.page-editor-content`, colores, radios y sombras activos: sostienen el editor oscuro y el diseño compartido. `--container-page` sí se usa en la pantalla de acceso.
- Compresión, caché, normalización de URLs, validación de reservas, RLS, cliente administrativo solo de servidor y compatibilidad con el esquema antiguo de citas. No son código sobrante; la compatibilidad todavía importa mientras falte la migración remota.
- Scripts de verificación y pruebas: son herramientas operativas, no componentes de UI. No se deben clasificar como basura por no importarse desde una página.
- Las dependencias declaradas tienen usos de ejecución, compilación o comprobación identificados. No se propone eliminar ningún paquete completo.

## 8. Observación adicional sobre fuentes

El editor permite elegir Inter y Playfair Display, pero no se encontró carga de esas fuentes mediante `next/font`, `@font-face` o una hoja externa. Se asignan mediante `fontFamily`, por lo que su disponibilidad depende del dispositivo y puede intervenir una fuente alternativa. Esto requiere revisar la personalización tipográfica; no es un motivo para borrar esos campos.

## Propuesta para decidir

1. Retirar primero los cinco componentes antiguos y sus utilidades exclusivas, paletas y constantes sin consumidores, en un cambio pequeño y verificable.
2. Revisar referencias almacenadas antes de retirar los siete recursos públicos.
3. Limpiar los siete iconos sin uso y medir el bundle; evaluar después el registro global por separado.
4. Corregir los dos resets CSS conflictivos en una intervención específica, con comparaciones visuales de formularios, botones y enlaces. Tienen más importancia visual que las duplicaciones pequeñas y también más riesgo de cambiar el aspecto actual.

No se ha ejecutado ninguna de estas propuestas. La decisión de qué retirar queda pendiente.
