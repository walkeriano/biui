# Límites de Storage aplicados — 2 de noviembre de 2026

Se actualizó el bucket existente `profesional-assets` en el Supabase configurado en `.env.local`, mediante `storage.updateBucket` y una credencial administrativa exclusivamente de servidor. No hace falta desplegar una nueva versión de la aplicación para que esos límites entren en vigor.

| Configuración | Antes | Después |
| --- | --- | --- |
| Tamaño máximo propio del bucket | Sin definir | 5.242.880 bytes (5 MiB) |
| Tipos admitidos | Sin definir | `image/avif`, `image/gif`, `image/jpeg`, `image/png`, `image/webp` |
| Visibilidad | Pública | Pública |

El cambio conserva las políticas de acceso, objetos existentes y URLs. No modifica páginas, reservas ni autenticación. El compresor del navegador permanece igual: admite originales de hasta 20 MiB y busca una salida de 700 KiB con lado máximo de 1920 píxeles. El límite de Storage se aplica al archivo que recibe después de esa compresión.

## Verificación real

Se creó administrativamente una cuenta temporal confirmada, sin enviar correo, y se inició sesión con el cliente público para verificar los permisos efectivos. Se generaron archivos de imagen reales para cada formato y se descargaron sin sesión para comparar sus bytes con los originales.

- Subida autenticada y lectura pública correctas para PNG, JPEG, WebP, GIF y AVIF.
- `upsert: true`, como utiliza el cliente actual, sigue funcionando en una ruta propia.
- Archivo de exactamente 5 MiB aceptado; archivo de 5 MiB más un byte rechazado con **413**. Para comprobar el tamaño se rellenó un PNG con bytes adicionales; esta prueba no certifica validación profunda del contenido.
- SVG, HTML y PDF rechazados con **415**.
- Subida anónima y escritura fuera de la carpeta del propietario rechazadas.
- **Cinco imágenes existentes**, referenciadas desde una página publicada, siguen respondiendo **200** con tipo de imagen mediante sus URLs públicas.
- Los archivos y la cuenta temporales se eliminaron al terminar. No se editaron archivos ni cuentas previas.
- `npm run lint`, `node --check scripts/harden-storage.mjs` y las **30 pruebas locales** pasan.

Los resultados de las 15 comprobaciones de configuración, cargas, rechazos y limpieza están en [storage-hardening-verification.json](storage-hardening-verification.json). La lectura de las cinco imágenes existentes se realizó después, en una comprobación independiente. No se repitió el recorrido completo del editor en navegador: el código de aplicación y de compresión no cambió; las pruebas remotas ejercitaron Storage directamente con sesión de usuario.

## Repetición y reversibilidad

[scripts/harden-storage.mjs](../scripts/harden-storage.mjs) consulta por defecto la configuración sin modificarla:

```sh
node --env-file=.env.local scripts/harden-storage.mjs
```

Añadir `--apply` aplica los límites. El script guarda antes una copia de la configuración en el directorio temporal del sistema, sin claves ni tokens, y conserva la visibilidad leída del bucket. Después vuelve a consultar la configuración y comprueba el resultado. Rechaza nombres inesperados para evitar renombrar el bucket mediante la API.

La copia de esta aplicación quedó en `/var/folders/5k/0qw7dx991412x6cfsszkr_cw0000gn/T/biui-storage-before-817148fb-44b9-4e29-a2c6-aa9560642542.json`. Los valores previos de tamaño y tipos eran `null`; no se recomienda restaurarlos salvo necesidad operativa evaluada.

Para otros entornos también se preparó [supabase/storage-hardening.sql](../supabase/storage-hardening.sql), transaccional y reaplicable. Actualiza únicamente tamaño y tipos y falla si el bucket no existe. No se ejecutó el SQL de endurecimiento general, que incluye cambios ajenos a Storage.

Referencia de la operación utilizada: [Supabase updateBucket](https://supabase.com/docs/reference/javascript/file-buckets-updatebucket).

## Alcance restante

La corrección limita cada archivo y sus tipos admitidos. No añade cuotas acumuladas por profesional, limpieza de archivos huérfanos ni validación del contenido mediante decodificación en servidor. Tampoco elimina archivos anteriores que incumplan los límites nuevos. Esas medidas requieren una intervención separada.
