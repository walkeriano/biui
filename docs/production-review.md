# Revisión de producción — 19 de octubre de 2026

**Resultado: todavía no aprobar producción.** La aplicación compila y se corrigieron problemas de publicación, reservas y seguridad. La integración real con Supabase y los recorridos completos en navegador siguen sin estar verificados. Las pruebas de API usan un cliente de base de datos simulado; no demuestran que las políticas o los índices estén instalados en el proyecto remoto.

## Alcance y arquitectura

Se revisaron las rutas de App Router, el proxy de sesión, AuthContext, los hooks de acceso a datos, editor, carga de imágenes, componentes públicos, dashboard, SQL de tablas/Storage, configuración y dependencias.

La separación general es adecuada para una aplicación pequeña: rutas en `src/app`, componentes en `src/components`, hooks en `src/hooks` e integración y reglas compartidas en `src/lib`. Se extrajeron valores del modelo y normalización de enlaces a `src/lib` para que el mapper de datos no dependa de componentes del dashboard. Cliente y servidor comparten ahora las reglas de fecha y horario en `src/lib/booking.js`.

El navegador publica directamente en Supabase con la sesión del propietario. La autorización de ese flujo depende de RLS, incluso si se omite el editor. Las reservas públicas pasan por una API con credenciales de servidor; esa API debe validar la petición porque la credencial administrativa evita RLS. El esquema local separa lectura pública de páginas publicadas, escritura del propietario y lectura privada de reservas. No se verificó la instalación remota de esas políticas.

## Correcciones realizadas

| Área | Problema y cambio |
| --- | --- |
| Horarios de reserva | Se calculaban con la zona del visitante y el rango diario dependía de la zona del servidor. Ahora usan la zona del profesional, con pruebas de invierno, verano y días de 23/25 horas. |
| Validación de disponibilidad | Las listas vacías permitían servicios, días u horas arbitrarios. Ahora impiden reservar. Se rechazan instantes con segundos/milisegundos y se respetan las franjas configuradas. |
| Calendario | Solo permitía el mes actual. Ahora permite navegar hasta doce meses hacia adelante y deshabilita horas pasadas. |
| Errores de reserva | Un fallo de red podía dejar el formulario en estado de envío. Se recupera y muestra el error; si falla la consulta de ocupación, los horarios permanecen bloqueados. Se añadió regreso entre pasos. |
| Publicación | La caché de servidor podía mostrar contenido anterior o páginas retiradas durante 60 segundos. Se sustituyó por memoización dentro de la solicitud. |
| Estado del editor | Se evita publicar antes de cargar la página y se evita hidratar el editor desde una caché anterior mientras llega la lectura actual. Los errores inesperados de publicación cierran el estado de espera. |
| Identidad y servicios | Una página nueva heredaba la identidad de Laura y los servicios vacíos podían convertirse en servicios de ejemplo. Se usa el nombre de la cuenta y se conservan las listas vacías. |
| Enlace público | Se validan rutas reservadas y se explican las colisiones de slug. El enlace del dashboard se actualiza al publicar otro slug. |
| Entrada de API | Se rechazan `null`, arrays, campos de tipos incorrectos, fechas imposibles en consulta y cuerpos de más de 8 KiB. |
| Acceso | Se restringe el destino posterior al login al dashboard. Sin configuración de Supabase, el dashboard redirige al acceso. |
| Imágenes | Se restringen las imágenes guardadas a URLs HTTPS o rutas locales; se rechazan SVG y archivos ajenos a los formatos admitidos en nuevas cargas. El máximo de entrada baja a 20 MiB antes de comprimir. Se liberan las previsualizaciones al desmontar el editor. |
| Storage | Se aplican límite de 5 MiB y MIME permitidos también en la primera creación del bucket; antes solo se aplicaban en conflicto. Se retira SVG de la lista permitida. |
| Caché privada | Un navegador que bloquea localStorage ya no rompe la lectura. El cierre de sesión explícito elimina la caché del usuario. |
| Dashboard | Se usan fechas de Madrid, se excluyen canceladas y se evita que el historial antiguo ocupe toda la lista de próximas reservas. El total diario ya no queda limitado a los cuatro elementos del widget. |
| Cabeceras | Se añaden controles de framing, MIME, referrer, permisos y una CSP básica; se elimina `X-Powered-By`. La CSP no incluye una política completa de scripts con nonce. |
| SQL | Las páginas nuevas parten de `published=false`; el editor publica explícitamente. Se añade una restricción de formato y rutas reservadas para nuevos slugs. |
| Verificación | Se añaden `npm test`, `npm run check` y CI para lint, pruebas, compilación y auditoría de dependencias de producción. |

Los cambios SQL están preparados en el repositorio, **no aplicados a Supabase**. Las imágenes SVG existentes tampoco se borraron. La restricción de slugs se crea con `NOT VALID`: protege nuevas escrituras, pero exige revisar y validar los registros anteriores.

## Evidencia ejecutada

- `npm run check`: lint correcto, 13 pruebas correctas y compilación de producción correcta.
- Pruebas de publicación: serialización del profesional, normalización del slug, eliminación de imágenes locales del payload, persistencia de servicios vacíos y compatibilidad entre horario publicado y validación de reservas.
- Pruebas de API con Supabase simulado: creación pendiente asociada al propietario, entrada inválida, email inválido, página no disponible, conflicto `23505` convertido en 409, error de base de datos, rate limit, honeypot y consulta de ocupación sin datos del cliente.
- Pruebas HTTP contra `next start`: `/` 200, `/acceso` 200, `/dashboard` 307 hacia acceso, fecha imposible 400 y cuerpo `null` 400. Se comprobaron las nuevas cabeceras en las respuestas.
- `npm audit --omit=dev --json`: cero vulnerabilidades conocidas en dependencias de producción al ejecutar la revisión.
- `npm audit --json`: cinco entradas de severidad alta en la cadena de desarrollo `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`. Son entradas de una misma cadena, no cinco defectos independientes. El [aviso de braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) no publica una versión corregida. No se aplicó la degradación a ESLint Config Next 14 sugerida por npm porque desalinearía el stack de Next 16. La auditoría completa sigue fallando.
- Solo `.env.example` está versionado entre los archivos `.env*`. Esto no constituye un análisis exhaustivo de secretos en todo el historial Git.
- Las variables locales tienen valores presentes, pero las lecturas de `professional_pages` y `appointments` fallaron con `TypeError: fetch failed`, también fuera del aislamiento de red. No se imprimieron las credenciales.

No se ejecutaron recorridos de clics en navegador, cargas reales a Storage, escrituras remotas, pruebas entre dos propietarios ni una carrera real de reservas simultáneas. La respuesta 409 se probó simulando el error del índice; el índice único está definido en el SQL local.

## Pendientes prioritarios

| Prioridad | Hallazgo pendiente | Evidencia / condición de cierre |
| --- | --- | --- |
| P1 | Verificar el backend real y sus políticas | Conexión remota fallida. Aplicar los cambios SQL en staging y comprobar lectura anónima, aislamiento entre propietarios, acceso a borradores, restricciones de Storage y rechazo de inserts anónimos directos de reservas. |
| P1 | Rate limit compartido y origen fiable de IP | `src/lib/rateLimit.js` usa memoria del proceso y cabeceras reenviadas. Los límites se reinician al escalar/reiniciar y no se comparten entre instancias. Configurar un límite persistente o controles del proveedor; verificar qué cabecera sobrescribe el proxy de confianza. La limpieza y el tope de memoria añadidos no resuelven este límite distribuido. |
| P1 | Duración y solapamientos | El índice de `appointments` impide dos inicios idénticos. No impide una cita de 90 minutos a las 09:00 y otra a las 10:00. El modelo guarda duración como texto del servicio y no guarda el fin de la cita. Definir duración numérica y protección atómica de intervalos antes de admitir duraciones que excedan las franjas. |
| P1 | Recuperación de contraseña incompleta | `useAuthActions.js` envía el enlace a `/acceso`, pero no existe un formulario que llame a `auth.updateUser` con la nueva contraseña. El proxy además redirige sesiones autenticadas al dashboard. Implementar destino de recuperación, manejo del enlace y formulario; probar con el proveedor de correo. |
| P2 | Confirmación/cancelación en dashboard | `ReservationsView` muestra estados, pero no ofrece acciones para cambiarlos. RLS permite al propietario actualizar; falta el recorrido de interfaz si se espera gestionar la reserva completa. |
| P2 | Alertas de dependencias de desarrollo | Resolver o aceptar explícitamente la exposición de la cadena de braces en CI; revisar la actualización del proveedor cuando exista un parche compatible. |
| P2 | Paginación y métricas | Próximas reservas tiene límite de 100 y el resumen consulta hasta 1000 registros desde el inicio del mes. Falta paginación y conteos agregados para superar esos volúmenes sin resultados parciales. Los clientes recientes quedan limitados al conjunto consultado. |
| P2 | Errores de lectura pública | `professionalPage/server.js` convierte un error de Supabase en ausencia de página y termina mostrando 404. Distinguir indisponibilidad temporal y página inexistente con una pantalla de reintento. |
| P2 | Enlaces de registro | Los enlaces de términos y privacidad apuntan a anclas sin contenido asociado. Completar sus destinos. |
| P2 | Operación del despliegue | No hay configuración versionada que permita confirmar copias de seguridad, alertas, restauración, dominio/HTTPS y secretos del entorno desplegado. Verificarlos en el proveedor. |

## Recorrido de aceptación en staging

1. Crear o usar dos cuentas de prueba y un visitante anónimo. Revisar confirmación de email y recuperación de contraseña.
2. Con la cuenta A, publicar texto propio, al menos un servicio y varias imágenes. Abrir el enlace como visitante y comparar nombre, textos, imágenes y horario.
3. Cambiar texto y slug; comprobar que el enlace nuevo muestra la versión actual y el anterior deja de resolver. Probar un slug ocupado y uno reservado sin perder los cambios del editor.
4. Desde la cuenta B, intentar leer/escribir la página privada de A y sus reservas, y subir/reemplazar/borrar archivos bajo la carpeta de A. Debe rechazarse por RLS.
5. Desde la landing, reservar usando un navegador con otra zona horaria. Comparar el instante almacenado y la hora mostrada en el dashboard.
6. Lanzar dos reservas simultáneas para el mismo inicio. Debe existir una sola fila activa y una de las respuestas debe ser 409. Repetir tras cancelar para comprobar liberación del horario.
7. Desactivar días/servicios y retirar la publicación. Intentar reservar directamente por HTTP: debe rechazarse. El visitante no debe obtener nombres, teléfonos, notas ni emails mediante consulta de ocupación.
8. Cortar la red durante la consulta y el envío; comprobar que se puede volver y reintentar. Recargar el dashboard y verificar la reserva creada.
9. Ejecutar la prueba de solapamiento por duración cuando el modelo de intervalos esté implementado.

Criterios consultados: [guía de producción de Next.js](https://nextjs.org/docs/app/guides/production-checklist) y [Row Level Security de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).
