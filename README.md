# BIUI Site

Plataforma web de BIUI para profesionales: landing comercial, acceso con Supabase Auth, dashboard privado, editor de pagina publica y flujo de reservas.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth, Database y Storage

## Desarrollo

```bash
npm ci
npm run dev
```

Se requiere Node.js 22.22 o posterior.

La app queda disponible en `http://localhost:3000`.

## Variables De Entorno

Crea `.env.local` tomando como referencia `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` habilitan Auth, lectura publica de paginas, dashboard y Storage desde cliente.

`SUPABASE_SERVICE_ROLE_KEY` es obligatoria en servidor para reservas publicas. No debe exponerse al cliente. Se usa para consultar horarios ocupados y crear reservas despues de validar la peticion en `/api/appointments`.

## Supabase

Revisa y ejecuta `supabase/schema.sql` en staging antes de producción para crear o actualizar:

- `public.professional_pages`
- `public.appointments`
- bucket publico `profesional-assets`
- politicas RLS
- indices y constraints
- triggers de `updated_at`

El esquema también establece las páginas nuevas como borradores y valida nuevos slugs. El editor publica explícitamente. La restricción de slug es `NOT VALID` para instalaciones existentes: revisa los registros anteriores antes de validarla. Los cambios SQL del repositorio no se aplican automáticamente.

Si solo necesitas reparar o recrear politicas de Storage, ejecuta `supabase/storage-policies.sql`.

## Modelo De Seguridad

Las paginas profesionales publicadas son legibles publicamente. Cada profesional puede crear, editar y borrar solamente su propia pagina.

Las reservas se leen y actualizan solo por el profesional propietario. La creacion publica de reservas debe pasar por `/api/appointments`; el esquema no deja una policy publica de insert en `appointments`, para evitar saltarse validaciones, rate limit y controles anti-spam desde la anon key.

El bucket `profesional-assets` es publico para lectura. La escritura queda limitada a rutas con prefijo del `auth.uid()` del profesional.

## Reservas

`GET /api/appointments?slug=...&date=YYYY-MM-DD` devuelve horarios ocupados para una pagina publicada.

`POST /api/appointments` crea una reserva validando:

- pagina publicada
- servicio existente
- hora permitida
- dia disponible
- fecha futura
- email opcional valido
- limite basico de frecuencia por IP y pagina
- honeypot `website`

La zona horaria por defecto para disponibilidad es `Europe/Madrid`. Tanto el navegador como la API usan la zona del profesional. El calendario permite seleccionar fechas hasta doce meses hacia adelante.

El índice único evita reservas activas con el mismo instante de inicio; todavía no protege solapamientos según la duración del servicio. El rate limit actual vive en memoria de cada proceso y requiere protección compartida antes de escalar a varias instancias.

## Cache

Para reducir lecturas a Supabase en el plan gratuito, el dashboard usa cache por usuario en `localStorage` con TTL corto:

- resumen del dashboard: 60 segundos
- reservas: 30 segundos
- pagina profesional del editor: 5 minutos
- slug de pagina publica: 10 minutos

Las páginas públicas solo se memoizan dentro de una solicitud, para compartir la consulta entre contenido y metadatos. No se conserva una caché entre solicitudes, de modo que una publicación o retirada pueda reflejarse en la siguiente carga. La sesión explícitamente cerrada elimina la caché privada de ese usuario.

## Verificacion

```bash
npm run check
npm audit --omit=dev
```

`npm run check` ejecuta lint, pruebas de lógica/API con Supabase simulado y compilación. El pipeline de CI ejecuta esas comprobaciones y audita las dependencias de producción.

Consulta [la revisión de producción](docs/production-review.md) para los hallazgos corregidos, los límites de estas pruebas y los pendientes de Supabase, recuperación de contraseña y gestión de reservas. La revisión no aprueba todavía el despliegue a producción.
