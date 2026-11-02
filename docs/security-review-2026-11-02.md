# Revisión de seguridad — 2 de noviembre de 2026

Se detectaron riesgos que conviene resolver antes de considerar el proyecto preparado para producción. Esta revisión identifica debilidades; no demuestra que se haya producido una intrusión ni garantiza ausencia de otras vulnerabilidades.

Alcance: código Next.js/React, API de reservas, autenticación, SQL/RLS/Storage, dependencias instaladas y CI. Se ejecutaron pruebas locales y dos consultas de solo lectura al Supabase configurado. Durante esta revisión no se modificaron datos remotos, no se enviaron correos y no se aplicaron migraciones. La aplicación y sus dependencias permanecieron sin cambios.

Actualización posterior, autorizada el mismo día: **se corrigieron los límites de tamaño y tipos del bucket**, con verificación remota. Consulta [el cambio y sus pruebas](storage-hardening-verification.md). Los demás hallazgos conservan el estado descrito en esta revisión.

## Hallazgos prioritarios

### 1. Alta — Storage permite cargas sin las restricciones previstas (confirmado en remoto)

**Estado posterior: corregido para nuevas cargas.** La descripción siguiente documenta la situación encontrada antes del cambio. Quedan fuera de esta corrección las cuotas acumuladas y la validación profunda del contenido.

La consulta `storage.getBucket('profesional-assets')` devolvió `public: true`, `file_size_limit: null` y `allowed_mime_types: null`. No hay límites de tamaño/tipos propios de este bucket; siguen aplicándose los límites generales de la plataforma. El SQL del repositorio exige 5 MiB y formatos raster, pero esa configuración no está aplicada.

Un usuario con permiso de subida puede invocar Storage directamente y omitir la compresión y validación del navegador. Esto permite consumir almacenamiento y ancho de banda con archivos ajenos al uso previsto. Que el bucket sea público facilita su distribución. No se ha demostrado ejecución de scripts en el dominio de la aplicación: depende de cómo se sirva y abra cada archivo.

Evidencia: [políticas y configuración previstas](../supabase/schema.sql), [cliente de subida](../src/hooks/useImageUpload.js). Corrección preparada: [production-hardening.sql](../supabase/production-hardening.sql). Tras aplicarla, verificar que una imagen válida se admite y que se rechazan archivos de más de 5 MiB y tipos no permitidos. Añadir cuotas por cuenta y gestión de archivos huérfanos; el máximo por archivo no limita el volumen total.

### 2. Alta — Un visitante puede agotar el limitador y bloquear a otros (reproducido localmente)

[rateLimit.js, líneas 11–16](../src/lib/rateLimit.js) recorre las entradas en cada petición y bloquea claves nuevas al llegar a 10.000. [GET de reservas, líneas 26–55](../src/app/api/appointments/route.js) crea una entrada para cualquier slug no vacío antes de comprobar que exista la página.

Con una sola IP y muchos slugs distintos se pueden ocupar las entradas, incluso para páginas inexistentes. Una vez lleno el mapa, visitantes nuevos reciben 429 también para páginas válidas, hasta que caduquen entradas. Las entradas de GET y POST comparten capacidad. El barrido completo añade coste de CPU. La reproducción local saturó el mapa y confirmó que una clave legítima nueva quedaba bloqueada; no se hizo una prueba de carga remota.

Corregir con límites globales por origen antes de crear claves por página, validación de slug, almacenamiento compartido con caducidad y un diseño de capacidad que evite bloquear globalmente a usuarios nuevos. Comprobar también el coste de consultas para slugs inexistentes.

### 3. Alta, condicionada al despliegue — IP no verificada y límite por proceso

[getClientIp, líneas 40–44](../src/lib/rateLimit.js) acepta el primer `x-forwarded-for` o `x-real-ip` sin comprobar un proxy de confianza. Si la infraestructura conserva valores elegidos por el visitante, este puede cambiar de identidad y eludir el límite. Se reprodujeron seis peticiones locales con cabeceras distintas a una misma página sin alcanzar el máximo de cinco. Falta comprobar cómo normaliza esas cabeceras el alojamiento real; la reproducción local por sí sola no demuestra elusión en producción.

Además, el mapa vive en cada proceso: distintas instancias y reinicios mantienen contadores independientes. Las claves son IP + slug; no hay un límite agregado por IP para todas las páginas ni una defensa adicional de contacto verificado contra reservas falsas. El honeypot se evita dejándolo vacío.

Usar la IP garantizada por la infraestructura, impedir acceso directo al origen cuando corresponda, y establecer límites compartidos por IP y página. Considerar un desafío antibot validado en servidor y confirmación del contacto según el nivel de abuso.

### 4. Alta si sigue vigente — Inserciones anónimas directas documentadas anteriormente

La [verificación del 19 de octubre](supabase-verification.md) registró que un visitante anónimo podía insertar directamente en `appointments`, omitiendo validaciones y límites de la API. La documentación del 26 de octubre mantiene pendiente el endurecimiento remoto. **No se volvió a probar una inserción ni se consultaron los privilegios SQL actuales en esta revisión**, por lo que no se afirma que siga siendo explotable hoy.

Es prioritario verificar los permisos reales y aplicar [production-hardening.sql](../supabase/production-hardening.sql) si siguen pendientes. El SQL revoca `INSERT` a `anon` y `authenticated` y elimina la política pública conocida. Revisar además políticas inesperadas y privilegios heredados. Supabase exige combinar [privilegios y RLS](https://supabase.com/docs/guides/api/securing-your-api); una comprobación en la interfaz no protege la API de datos.

Comprobación de solo lectura en el SQL Editor:

```sql
select has_table_privilege('anon', 'public.appointments', 'insert') as anon_insert,
       has_table_privilege('authenticated', 'public.appointments', 'insert') as authenticated_insert;
-- Ambas deben ser false.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('appointments', 'professional_pages');
```

### 5. Media — Falta protección completa frente a reservas solapadas (confirmado en remoto)

La consulta de cero filas a `appointments`, seleccionando `duration_minutes,appointment_end_at`, devolvió `42703` (columna inexistente). No se leyó información de clientes. La API conserva compatibilidad con ese esquema y reintenta la inserción sin duración. Por tanto, falta el esquema necesario para la protección por intervalos diseñada en el repositorio.

El índice de inicio único no impide que una cita de 90 minutos a las 09:00 coincida con otra a las 10:00. Impacta la integridad y disponibilidad de la agenda; no implica acceso a datos de otro profesional.

Aplicar primero [el preflight de solo lectura](../supabase/appointment-intervals-preflight.sql), revisar conflictos y duraciones históricas, y después [la migración de intervalos](../supabase/appointment-intervals.sql), siguiendo [el orden de despliegue documentado](high-medium-delivery.md). Verificar dos solicitudes concurrentes con inicios distintos e intervalos solapados: una debe ser rechazada por la base de datos.

### 6. Media — Datos personales persistentes en localStorage

[ReservationsView.jsx](../src/components/dashboard/ReservationsView/ReservationsView.jsx) guarda nombres, teléfonos, emails y notas en localStorage mediante [localCache.js](../src/lib/localCache.js). El TTL impide reutilizar datos vencidos desde ese helper, pero el navegador no los elimina automáticamente: la limpieza se realiza al leer esa entrada o al cerrar sesión explícitamente. Cerrar la pestaña, caducar la sesión o un cierre externo no garantiza su eliminación.

En un dispositivo compartido, los datos pueden permanecer en disco. Un script que ya consiga ejecutarse en el mismo origen también puede leerlos. Esto amplifica el impacto de un XSS; no se encontró un XSS explotable en esta revisión.

Evitar persistir datos personales de reservas y notas; usar memoria para esa información. Limpiar cachés y estado visible ante cualquier pérdida o cambio de sesión, además del cierre explícito.

### 7. Media — La CSP actual no restringe scripts ni conexiones

[next.config.mjs, línea 12](../next.config.mjs) define `base-uri`, `object-src` y `frame-ancestors`, pero no `script-src`, `default-src` ni `connect-src`. Las directivas existentes ayudan, aunque no añaden una barrera contra la ejecución de scripts inyectados ni restringen sus conexiones.

Preparar una CSP compatible con Next.js y Supabase, con nonces o hashes para scripts cuando corresponda, y desplegar primero en modo de informe para comprobar recursos necesarios. Es una mejora de defensa en profundidad; no una prueba de XSS. Referencia: [guía CSP de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).

### 8. Media — Validación incompleta de fechas y estructura de páginas

[validateBooking](../src/lib/booking.js) exige fecha futura, pero no impone el horizonte del calendario. Se comprobó localmente que acepta una cita válida en 2099, aunque la interfaz limita la navegación a doce meses. Esto permite crear reservas fuera de la ventana prevista y acumular datos innecesarios. GET también permite consultar fechas históricas o lejanas válidas. Definir y aplicar la misma ventana en servidor para consultas, altas y reprogramaciones según sus reglas de negocio.

Las columnas JSONB de páginas carecen de validación de estructura y tamaño en el SQL. El propietario escribe directamente mediante Supabase, de modo que puede omitir las validaciones del editor. Se reprodujo un `TypeError` en [databaseRowToPublicPage](../src/lib/professionalPage/mapper.js) con `services: [null]`. Datos mal formados pueden romper el renderizado de esa página o su flujo de reservas. No se demostró afectación de páginas ajenas. Añadir restricciones de tipo/tamaño en la frontera de escritura y normalización defensiva en lectura.

## Dependencias y verificaciones

- `npm test`: **30/30 correctas**. Usan mocks para la API; no certifican los permisos remotos.
- `npm run lint`: correcto.
- `npm audit --omit=dev --json`: **0 vulnerabilidades conocidas reportadas** en dependencias de producción al consultar el registro.
- `npm audit --json`: **17 entradas: 1 alta y 16 moderadas**, en dependencias de desarrollo. Muchas son propagación de una misma causa, no 17 fallos independientes.
- Alta: `zod@4.6.5`, transitiva de `eslint-plugin-react-hooks`; aviso [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), agotamiento de memoria; el rango indicado por npm es `<4.6.6`.
- Moderadas: `minimatch@3.1.5` y `10.2.6`, con propagación a ESLint y sus plugins; aviso [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), denegación de servicio por patrones. No se demostró que un visitante pueda alcanzar esas herramientas desde la aplicación publicada.
- La CI solo audita producción, por lo que estos avisos de desarrollo no fallan ese paso. Planificar actualizaciones compatibles y repetir lint/pruebas; no aplicar automáticamente las degradaciones mayores sugeridas por `npm audit fix --force`.
- `.env.local` está ignorado y no aparece en los archivos versionados ni en la consulta de historial de nombres de entorno realizada. Un escaneo limitado de patrones de claves sobre archivos actuales versionados no encontró coincidencias. No equivale a una búsqueda exhaustiva de secretos en todo el historial o artefactos de despliegue.

Controles ya presentes: clave administrativa marcada `server-only`, consultas estructuradas con Supabase, comprobaciones de propietario y sesión en PATCH, RLS definida en SQL, cuerpo de mutaciones limitado a 8 KiB, fechas/servicios/horarios validados, redirección de login restringida y cabeceras contra framing y MIME sniffing. No se encontró un camino directo de ejecución de código, inyección SQL o lectura de reservas ajenas en el código revisado.

## Orden de corrección y límites

1. Verificar privilegios actuales y aplicar el endurecimiento de Supabase pendiente, especialmente reservas y Storage.
2. Corregir saturación, confianza en cabeceras y persistencia del limitador entre instancias.
3. Instalar la protección de intervalos después de revisar los conflictos históricos.
4. Reducir datos personales persistentes, validar estructuras/ventanas en servidor y reforzar CSP.
5. Actualizar dependencias de desarrollo con comprobación de compatibilidad.

Quedan sin verificar: ajustes reales de Auth (confirmación de email, política de contraseñas, CAPTCHA, límites, MFA y destinos de recuperación), permisos administrativos, logs de accesos, copias de seguridad/restauración, HTTPS/HSTS y comportamiento del proxy en el alojamiento final. No deben considerarse fallos confirmados. Supabase ofrece [límites propios de Auth](https://supabase.com/docs/guides/auth/rate-limits) y [CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha); hay que comprobar su configuración efectiva y adaptar los formularios antes de activarlo. Esta revisión no incluyó pruebas de fuerza bruta, carga remota ni una auditoría completa de infraestructura.
