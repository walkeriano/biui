# Verificación con Supabase activo — 19 de octubre de 2026

Se ejecutaron pruebas contra el proyecto real configurado en `.env.local`, desde una compilación local de producción de Next.js. Las cuentas, páginas, archivos y reservas usados son temporales; no se editaron los datos existentes del usuario ni se enviaron emails.

**La conexión funciona. La configuración remota todavía requiere una corrección de seguridad.** La última ejecución completó 23 comprobaciones: 20 correctas y tres fallidas por esa configuración pendiente. Lint, compilación y las 17 pruebas locales pasan. El archivo [live-verification.json](live-verification.json) contiene los resultados individuales de la última ejecución.

## Conexiones y permisos

Se confirmaron las conexiones con clave pública y de servidor, la creación administrativa de dos cuentas de prueba, el login con contraseña desde el navegador y el acceso protegido al dashboard. El proyecto conserva el mismo endpoint y las claves configuradas tras reactivarlo.

Un visitante anónimo no puede leer las reservas; una segunda cuenta tampoco puede leer las reservas del primer profesional. Los borradores explícitos solo son visibles para su propietario y la escritura de archivos bajo la carpeta de otro propietario se rechaza.

Hay tres diferencias respecto a la configuración prevista en el repositorio:

1. `professional_pages.published` sigue teniendo valor inicial `true`. El editor publica explícitamente, pero una escritura que omita ese campo crea una página pública.
2. El bucket `profesional-assets` tiene `file_size_limit=null` y `allowed_mime_types=null`. Una carga SVG directa con una cuenta autenticada sigue siendo aceptada, aunque la aplicación ya la rechaza.
3. **Un visitante anónimo puede insertar una reserva directamente en la tabla, saltándose `/api/appointments`.** No puede leer las reservas, pero sí eludir las validaciones y el límite de frecuencia de la aplicación.

La comprobación de conexión al bucket es solo una lectura de su configuración; no equivale a aprobar sus límites.

## Corrección remota preparada

Ejecutar [supabase/production-hardening.sql](../supabase/production-hardening.sql) en el SQL Editor de Supabase. El archivo:

- Cambia a borrador el valor inicial para futuras páginas.
- Elimina la política conocida de inserción pública de reservas y retira el permiso de inserción de `anon` y `authenticated`. La API seguirá creando con la credencial de servidor.
- Establece el máximo de 5 MiB y los formatos raster admitidos en Storage.
- Añade la validación de nuevos slugs si aún no está instalada.

El archivo usa una transacción y no elimina páginas, cuentas, reservas ni archivos existentes. La restricción de slugs se crea como `NOT VALID`, así que los registros anteriores se deben revisar por separado. El script quedó preparado; **no se ejecutó en el backend**. Tras aplicarlo, repetir las pruebas: los tres rechazos esperados deben pasar.

## Compresión de imágenes

Se probó el código real de compresión en un Chrome aislado y también su uso desde el editor y la subida a Supabase Storage:

| Medida | Resultado |
| --- | --- |
| PNG de entrada | 14.092.468 bytes, 2560 × 1600 |
| Imagen resultante | 696.900 bytes, 1536 × 960, WebP |
| Reducción | 95 % |
| Objetivo | Hasta 700 KiB; dimensión máxima de 1920 px |

También se comprobaron transparencia, rechazo de SVG, archivos corruptos y archivos que superan 20 MiB. Se simuló la ausencia del codificador WebP dentro del navegador para verificar que la salida PNG conserva el MIME y la extensión correctos.

Se extrajo la compresión a `src/lib/imageCompression.js` para probar el mismo código que utiliza el hook. Ahora reduce también dimensiones si bajar calidad no alcanza el tamaño objetivo, mantiene al menos un píxel por dimensión y libera el bitmap al terminar. Si se necesita reducir dimensiones, no devuelve el original por el solo hecho de que tenga menos bytes. Esta prueba no sustituye una ejecución nativa en Safari o Firefox; las imágenes animadas se convierten en un fotograma estático.

## Caché y editor

Se añadieron pruebas para caducidad exacta del TTL, aislamiento por usuario, borrado al cerrar sesión, JSON corrupto, versiones antiguas, entradas sin caducidad, almacenamiento bloqueado y cuota agotada. Se corrigió la aceptación de entradas sin vencimiento y el límite exacto de caducidad.

El dashboard usa caché local como lectura provisional y vuelve a consultar Supabase al montar las vistas. El TTL limita la reutilización local, pero no evita todas las peticiones. Las páginas públicas solo comparten la consulta dentro de una solicitud; no se conserva una caché entre solicitudes que pueda retrasar una publicación o retirada.

La prueba de volver desde reservas al editor encontró que se podía escribir mientras llegaban los datos, y la hidratación posterior reemplazaba esas ediciones. El formulario queda deshabilitado hasta completar carga e hidratación. La vista previa usa ahora la identidad de la cuenta en lugar del nombre de ejemplo.

## Recorrido funcional y repetición

La última ejecución de `scripts/verify-live.mjs` completó login, creación desde el editor, compresión y subida real, vista pública desde otra zona horaria, reserva desde la landing, lectura en dashboard y carrera de dos reservas para el mismo horario. También pasaron la republicación con otro título y slug, desaparición del enlace antiguo, actualización de la caché, cierre de sesión y retirada de publicación. La página retirada también rechazó reservas por API. No hubo excepciones de navegador y las dos cuentas temporales y sus archivos se eliminaron al terminar.

Las pruebas concurrentes reales dieron una reserva creada y un conflicto 409 para el mismo instante de inicio. Esto confirma ese índice en el backend actual; sigue pendiente la protección por duración de intervalos descrita en la revisión de producción original.

Para repetir manualmente, iniciar `npm run build` y `npm start -- --hostname 127.0.0.1 --port 3100`. El comprobador requiere `playwright-core`, Chrome y autorización explícita para crear y limpiar sus propios datos:

```bash
node --env-file=.env.local --experimental-default-type=module scripts/verify-live.mjs --allow-test-writes
```

Por defecto busca Playwright en `/private/tmp/biui-verification/node_modules/playwright-core/index.mjs` y Chrome en su ubicación de macOS. Se pueden indicar `PLAYWRIGHT_MODULE` y `CHROME_EXECUTABLE` para otras ubicaciones. `BIUI_TEST_URL` permite otro puerto local. No se usa un perfil personal del navegador. Los identificadores de las cuentas temporales se guardan, sin contraseñas ni tokens, en `/private/tmp/biui-live-<runId>.json` para permitir limpieza si se interrumpe la ejecución.

Las limitaciones de producción que ya se señalaron —rate limit entre instancias, recuperación de contraseña y gestión completa de estados— no quedan resueltas por reactivar Supabase.
