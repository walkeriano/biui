# Recorrido completo de regresión — 26 de octubre de 2026

Resultado de la última ejecución: **33 comprobaciones correctas, cero fallidas y 2 bloqueadas por las migraciones pendientes**. No se encontraron otras regresiones en los recorridos verificados tras corregir el retorno de recuperación.

Se ejecutó una compilación local de producción con Chrome aislado y Supabase real, usando dos cuentas temporales por ejecución. Las cuentas, páginas, reservas y archivos creados por las pruebas se eliminaron al terminar. No se editaron datos previos ni se aplicaron migraciones o cambios de configuración remota. No se enviaron correos.

## Recorridos comprobados

| Área | Comprobación y resultado |
| --- | --- |
| Landing | Navegación, anclas, historial, menú móvil, teclado y desplazamiento a 320, 390, 768, 1024 y 1440 px; también pantalla de poca altura. Correcto, sin errores de JavaScript. |
| Acceso | Campos obligatorios y longitud de contraseña de registro; mostrar/ocultar contraseña; login incorrecto y correcto contra Supabase; dashboard protegido y cierre de sesión. Correcto. |
| Editor | Portada, apariencia, fuentes, botones, sobre mí, servicios, duraciones, contacto y disponibilidad. Correcto. |
| Cambios pendientes | Texto e imagen conservados al cambiar entre secciones; cancelar cierre de sesión y recarga conserva las ediciones. Correcto. |
| Imágenes y publicación | Selección local, vista previa, compresión, subida real a Storage, persistencia de contenido y carga pública de la imagen. Correcto. |
| Vista previa y móvil | Vistas móvil/escritorio, navegación del dashboard, cierre del menú antes de editar y ausencia de desbordamiento horizontal. Correcto. |
| Página pública | Textos, servicios, imagen, enlaces sociales y reserva desde un navegador en otra zona horaria. Correcto. |
| Reservas | Elegir servicio/fecha/hora, tratar fallos de consulta y envío, reintentar y crear una reserva real visible en el panel. Correcto. |
| Gestión | Confirmar; cancelar primero descartando el diálogo y luego aceptándolo; verificar el cambio real y la liberación del horario. Correcto. |
| Concurrencia | Dos peticiones simultáneas al mismo inicio dan 201 y 409. Correcto. |
| Propietarios | Reservas privadas para visitante y segunda cuenta; segunda cuenta sin permiso de editar la página ajena; borradores explícitos privados. Correcto. |
| Republicación | Nuevo título y slug visibles, enlace del dashboard actualizado, URL anterior 404 y recarga del editor con valores persistidos. Correcto. |
| Recuperación | Token real generado sin enviar correo, apertura del formulario, rechazo de contraseñas distintas, actualización real y login con la contraseña nueva. Enlace inválido permite volver al login. Correcto tras la corrección descrita abajo. |
| Retirada de publicación | Solo sobre la página temporal: desaparece del público y la API rechaza nuevas reservas. Correcto. |
| Limpieza | Eliminación de las dos cuentas temporales y sus archivos; comprobación de que no quedan sus páginas ni reservas. Correcto. |

## Problema detectado y corregido

El callback de recuperación usaba el origen de `request.url` para crear una redirección absoluta. En el servidor local, Next normalizaba `127.0.0.1` a `localhost`; el navegador cambiaba de host y dejaba de enviar la cookie de sesión recién creada. Esto impedía mostrar el formulario aunque el token fuese válido.

`src/app/auth/confirm/route.js` ahora devuelve un `Location` relativo. El navegador conserva su origen y su cookie, y el destino sigue fijo en la pantalla de recuperación. Se añadió una prueba de regresión para la normalización del host. El recorrido completo se repitió y la recuperación real pasó.

## Pendientes que no son regresiones

- **Protección de intervalos y reprogramación real:** faltan los campos y restricciones de `appointment-intervals.sql` en Supabase. La consulta y creación de reservas actuales siguen funcionando; confirmar y cancelar funcionan. Se comprobó que intentar reprogramar devuelve el aviso previsto sin modificar la cita. El calendario con intervalos completos se probó además en navegador con una respuesta de disponibilidad simulada, claramente identificada en el informe JSON. La restricción real y las mutaciones se comprobaron anteriormente con pruebas de API y PostgreSQL aislado; falta repetir el recorrido contra el backend migrado.
- **Restricciones de Storage:** el bucket real continúa sin límites de tamaño/tipos; requiere `production-hardening.sql`. No se cambió esa configuración durante las pruebas. La subida normal de imágenes sí pasó contra el backend real.
- **Entrega de correo:** no se enviaron emails. El registro se comprobó en sus validaciones de interfaz y el acceso con cuentas temporales reales. La recuperación se comprobó con un token generado administrativamente. Falta comprobar entrega SMTP y permitir `/auth/confirm` en los destinos de redirección de Supabase.

La guía de aplicación manual sigue en [high-medium-delivery.md](high-medium-delivery.md).

## Evidencia y repetición

- `npm run check`: lint, **30 pruebas** y compilación correctos tras la corrección.
- Navegación: `scripts/verify-landing.mjs`, correcto en los cinco tamaños y pantalla corta.
- Recorrido: `scripts/verify-regression.mjs`, ejecución `eeeb946b`. Resultado detallado: [regression-verification.json](regression-verification.json).
- Capturas de esta ejecución: `/private/tmp/biui-regression-eeeb946b`. Se inspeccionaron las capturas de la página pública y del editor móvil.

Para repetir se necesita una compilación de producción local en `http://127.0.0.1:3100`, Chrome y `playwright-core` instalado fuera del repositorio. No se añadió dependencia de producción.

```sh
npm run build
npm start -- --hostname 127.0.0.1 --port 3100
# En otra terminal; crea y limpia sus propios datos temporales:
node --env-file=.env.local --experimental-default-type=module scripts/verify-regression.mjs --allow-test-writes
```

`PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE` y `BIUI_TEST_URL` permiten ajustar rutas y puerto. El perfil del navegador es temporal. Los identificadores de las cuentas de cada ejecución se guardan en su directorio temporal para permitir limpieza si una ejecución se interrumpe.
