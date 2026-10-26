# Corrección del menú comercial — 25 de octubre de 2026

El fallo se reprodujo en el landing local antes de editarlo. Al pulsar «Suscripción», `main.scrollTop` pasaba de 0 a 288, además del desplazamiento de la ventana. Al volver a «Beneficios», quedaba en 110 y la cabecera terminaba en la coordenada vertical 0: desaparecía por completo. No era necesario que se produjera una excepción de JavaScript para romper la presentación.

## Causa y corrección

`overflow-hidden` convertía el contenedor principal y las secciones decorativas en contenedores desplazables. Los fondos absolutos sobresalían 288 píxeles por debajo del contenido. La navegación por anclas desplazaba también esos contenedores y recortaba el contenido. Se sustituyó por `overflow-clip`, que conserva el recorte de los fondos sin permitir desplazamiento interno.

También se corrigieron estos comportamientos:

- Cabecera fija durante el recorrido mediante `position: sticky`.
- Anclas nativas para las secciones y margen de desplazamiento para despejar la cabecera. «Beneficios» apunta a las tarjetas de beneficios y «Suscripción» a la sección real, en lugar de a un elemento absoluto fuera de ella.
- Indicador activo según la posición real, incluido el historial y las cargas directas con ancla. Antes «Inicio» estaba marcado permanentemente.
- Menú móvil y de tablet, antes ausente por debajo de 1024 píxeles. Incluye estado expandido accesible, cierre al seleccionar, Escape, clic/foco exterior y cambio a escritorio. En pantallas de poca altura, el menú puede desplazarse dentro del espacio disponible.
- Respeto de la preferencia de movimiento reducido.

## Verificación ejecutada

- `npm run check`: lint, 17 pruebas y compilación de producción correctos.
- Navegador Chromium contra `next start`, con anchos de 320, 390, 768, 1024 y 1440 píxeles: navegación por las cuatro secciones, estado activo, cabecera visible, ausencia de desplazamiento interno y desbordamiento horizontal, cierre del menú móvil, historial atrás/adelante, carga directa y recarga con ancla, enlaces del pie y acceso a `/acceso`.
- Escape devuelve el foco al botón; Enter abre el menú; el clic exterior y el cambio de breakpoint lo cierran.
- Vista de 390 × 360: menú dentro de la pantalla y navegación con desplazamiento suave.
- Capturas revisadas en móvil y escritorio. Cero excepciones de JavaScript en los recorridos.

La prueba reproducible está en `scripts/verify-landing.mjs`. Requiere Playwright y un navegador instalado, y solo acepta un servidor local. Puede utilizar una instalación temporal sin cambiar las dependencias del proyecto:

```sh
npm install --prefix /tmp/biui-landing-check playwright --no-audit --no-fund
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

En otra terminal, con Chrome instalado en macOS:

```sh
PLAYWRIGHT_MODULE=/tmp/biui-landing-check/node_modules/playwright/index.mjs \
CHROME_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node scripts/verify-landing.mjs
```

`BIUI_SCREENSHOT_DIR` permite guardar capturas en una carpeta existente. `BIUI_TEST_URL` permite elegir otro puerto local.

Esta validación cubre el landing y su navegación en una compilación local de producción. No se desplegaron cambios ni se verificó el dominio de producción. Los pendientes de otras áreas descritos en las revisiones anteriores requieren su propia validación; este informe no certifica toda la aplicación.
