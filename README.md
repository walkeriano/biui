# BIUI Site

Plataforma web de BIUI para profesionales: landing comercial, acceso con Supabase Auth, dashboard privado, editor de pagina publica y flujo de reservas.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth, Database y Storage

## Desarrollo

```bash
npm install
npm run dev
```

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

Ejecuta `supabase/schema.sql` en el SQL editor de Supabase para crear:

- `public.professional_pages`
- `public.appointments`
- bucket publico `profesional-assets`
- politicas RLS
- indices y constraints
- triggers de `updated_at`

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

La zona horaria por defecto para disponibilidad es `Europe/Madrid`.

## Cache

Para reducir lecturas a Supabase en el plan gratuito, el dashboard usa cache por usuario en `localStorage` con TTL corto:

- resumen del dashboard: 60 segundos
- reservas: 30 segundos
- pagina profesional del editor: 5 minutos
- slug de pagina publica: 10 minutos

Las paginas publicas tambien usan una cache en memoria del servidor por `slug` durante 60 segundos. En entornos serverless esta cache es oportunista: reduce lecturas cuando una instancia se reutiliza, pero no sustituye una cache compartida externa.

## Verificacion

```bash
npm run lint
npm run build
```
