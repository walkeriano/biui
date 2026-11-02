# Cierre de tareas altas y medias — 26 de octubre de 2026

Alcance: las seis tareas altas/medias de la revisión. Se mantiene soporte sin cambios por indicación del usuario. No se añaden pagos, notificaciones, borradores, retirada de publicación, paginación ni rate limit distribuido.

## Cambios de aplicación

- Recuperación: el correo vuelve a `/auth/confirm`, que intercambia el código PKCE y redirige a `/restablecer-contrasena`. El formulario guarda la contraseña con `auth.updateUser`, valida repetición y muestra errores de enlace caducado. `/acceso?mode=login` abre directamente el login.
- Reservas: confirmar, cancelar y reprogramar desde el panel. La API usa la sesión del propietario y RLS. Valida servicios, días, horas, duración y fecha futura para reprogramar. Comprueba `updated_at` para impedir sobreescribir un cambio concurrente. La cancelación libera el horario; reprogramar conserva el estado de la cita.
- Duración: conserva las etiquetas existentes (`50 minutos`, `60 minutos`, `90 minutos`) y añade `durationMinutes` a nuevos guardados. Cada reserva nueva guarda su duración, por lo que editar un servicio no cambia las citas ya creadas después de esta migración. Una cita nueva debe terminar dentro del horario configurado.
- Calendario: consulta intervalos ocupados y bloquea cualquier inicio incompatible con la duración del servicio elegido. Mantiene `bookedAppointmentAts` en la respuesta para compatibilidad.
- Editor: permanece montado al cambiar de sección, conservando texto e imágenes pendientes. Advierte al recargar/cerrar la pestaña y pide confirmación al cerrar sesión con cambios sin publicar. Los cambios pendientes siguen siendo temporales; el aviso permite cancelar la salida.
- Landing: presenta las funciones disponibles y elimina precios de suscripción y promesas de notificaciones. Conserva anclas y enlaces existentes. El bloque de soporte no cambia.

## Aplicación manual en Supabase

No se han aplicado migraciones ni modificado la configuración remota. La verificación posterior de navegador usó datos temporales y los eliminó; consulta [el informe de regresión](regression-verification.md). El operador debe aplicar lo siguiente:

1. Tener esta versión de la aplicación ejecutándose antes de migrar. Antes de la migración, consultar y crear reservas usa automáticamente el esquema anterior; todavía no se protegen intervalos completos. Confirmar y cancelar también funcionan en el esquema anterior. Reprogramar requiere la migración y devuelve un aviso si falta.
2. Ejecutar `supabase/appointment-intervals-preflight.sql` en el SQL Editor. Es solo lectura. Revisar cada `conflicting_id` y las duraciones inferidas. `FALLBACK_60_REVIEW_REQUIRED` identifica servicios sin duración recuperable: se usarían 60 minutos. Incluso las duraciones recuperadas proceden del servicio actual y deben contrastarse si este cambió desde la reserva original. Resolver los conflictos con el profesional antes de continuar; el código no cancela ni elimina citas para resolverlos.
3. Ejecutar `supabase/production-hardening.sql`: revoca inserciones directas de reservas a `anon` y `authenticated`, retira la política pública conocida, establece borradores por defecto y limita Storage a 5 MiB y los formatos de imagen admitidos.
4. Ejecutar `supabase/appointment-intervals.sql`: añade duración y fin, recupera las duraciones existentes, instala un trigger para calcular el fin y una restricción de exclusión GiST para impedir solapamientos por profesional. Es transaccional: si existen conflictos, se revierte sin borrar reservas. Puede ejecutarse de nuevo.
5. No volver a una versión antigua de la API tras migrar: esas versiones no envían duración. La migración deliberadamente no asigna una duración por defecto a nuevas reservas.
6. En **Authentication → URL Configuration → Redirect URLs**, permitir `https://TU-DOMINIO/auth/confirm` y la URL local correspondiente. Mantener el resto de destinos que ya utiliza la aplicación. Se usa el correo estándar de recuperación de Supabase. Para una plantilla personalizada basada en token hash, el callback también acepta `?token_hash=...&type=recovery`.

`supabase/schema.sql` incluye los mismos cambios para instalaciones nuevas. Para el proyecto existente usar los archivos específicos anteriores, no recrear tablas ni datos.

Comprobación SQL posterior, solo lectura:

```sql
select has_table_privilege('anon', 'public.appointments', 'insert') as anon_insert,
       has_table_privilege('authenticated', 'public.appointments', 'insert') as authenticated_insert;
-- Ambas deben ser false.
select column_default from information_schema.columns
where table_schema='public' and table_name='professional_pages' and column_name='published';
-- Debe ser false.
select file_size_limit, allowed_mime_types from storage.buckets where id='profesional-assets';
-- 5242880; sin image/svg+xml.
select conname from pg_constraint
where conrelid='public.appointments'::regclass and conname='appointments_no_overlap';
-- Una fila.
```

Tras migrar, `GET /api/appointments?slug=...&date=YYYY-MM-DD` debe responder `intervalProtectionReady: true`. Comprobar una reserva de 90 minutos a las 09:00: las 10:00 deben quedar bloqueadas. Confirmar, reprogramar y cancelar; verificar que cancelar libera el intervalo. Probar recuperación con un correo real y con un enlace caducado.

## Verificación y límites

- `npm run check`: lint, 30 pruebas de lógica/API y compilación de producción.
- Las pruebas mantienen los recorridos previos y añaden compatibilidad con el esquema anterior, snapshots de duración, solapamientos, fin antes del cierre, autorización de propietario, cambios concurrentes y recuperación PKCE/token hash.
- `scripts/verify-booking-sql.mjs`: 12 comprobaciones sobre PostgreSQL aislado con PGlite, sin conexión a Supabase. Verifica rollback ante conflictos, backfill, exclusión de intervalos, citas adyacentes, aislamiento por profesional, reprogramación, cancelación, recálculo del fin, RLS, revocación de inserts, configuración de Storage y reaplicación del esquema.
- Para repetir SQL: instalar `@electric-sql/pglite` fuera del repositorio y ejecutar `PGLITE_MODULE=/ruta/node_modules/@electric-sql/pglite/dist/index.js node scripts/verify-booking-sql.mjs`. No se añadió dependencia de producción.
- Comprobaciones HTTP sobre `next start`: `/`, `/acceso`, `/acceso?mode=login` y `/restablecer-contrasena` responden 200; el callback sin enlace válido y el dashboard sin sesión redirigen correctamente; fecha imposible y cuerpo `null` se rechazan con 400; gestionar reservas sin sesión se rechaza con 401. La landing servida conserva soporte y muestra los textos nuevos.
- Una consulta de disponibilidad a través de la API local con Supabase real respondió 200 y `intervalProtectionReady: false`, confirmando compatibilidad con el esquema actual sin escribir datos.
- La consulta remota de solo lectura confirmó que Storage seguía sin límites y que faltaba `appointments.duration_minutes`. No se realizaron cambios remotos ni se enviaron correos.
- La verificación posterior en un navegador aislado completó 33 comprobaciones correctas, sin fallos, y dos bloqueos por SQL pendiente. Incluyó publicación, imágenes y reservas reales, así como recuperación real sin envío de correo. Consulta [el informe de regresión](regression-verification.md). La reprogramación y la protección de intervalos aún requieren aceptación contra el backend migrado.
