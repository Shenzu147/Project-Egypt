# Plan: Corrección de la CSP y de la versión en v0.43 → v0.44

**Fecha:** 2026-11-01
**Tema:** csp-correccion
**Archivo objetivo:** `Maatly_v0.43.html` (nueva versión `Maatly_v0.44.html`, no sobrescribir)
**Principios aplicados:** seguridad de la interfaz (versión fijada, `integrity`), offline-first, una versión nueva por entrega, memoria en BITACORA.

## Contexto

El plan `2026-11-01-cdn-seguridad.md` fijó versiones, añadió SRI y una CSP en `Maatly_v0.43.html`. La revisión de esa entrega encontró cuatro defectos:

| # | Defecto | Consecuencia |
|---|---|---|
| 1 | El `meta` CSP está en la línea 25, **después** de Tailwind y de las 7 librerías | La política no gobierna los recursos que ya se cargaron: protección real nula sobre ellos |
| 2 | Falta `frame-src` | `default-src 'self'` no cubre `blob:`. El visor de PDF (`mvAdjVistaArchivo`, iframe con `blob:`) queda bloqueado |
| 3 | `connect-src` solo permite `'self'` y jsdelivr | Bloquea el agente (`openrouter.ai`, `generativelanguage.googleapis.com`, `api.z.ai`), Telegram (`api.telegram.org`) y `ntfy.sh` |
| 4 | `VER_APP` sigue en `'v0.42'` | La firma de Ajustes, el XLSX y el aviso de versión nueva reportan v0.42; no se anuncia la entrega |

Además, `Maatly.lnk` apunta a `C:\Users\jdeb1\Maatly\Maatly_v0.42.html`, ruta que ya no existe.

## Cambios propuestos

1. **Mover el `meta` CSP al inicio del `<head>`**, antes de cualquier `<script>` o `<link>` (después de `viewport`).
2. **CSP corregida**, sin aflojar lo ya conseguido:
   - `default-src 'self'`
   - `script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net` (se retira `fonts.googleapis.com`, que no sirve scripts)
   - `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com`
   - `font-src https://fonts.gstatic.com`
   - `img-src 'self' data: blob:`
   - `connect-src 'self' https://cdn.jsdelivr.net https://openrouter.ai https://generativelanguage.googleapis.com https://api.z.ai https://api.telegram.org https://ntfy.sh`
   - `frame-src 'self' blob: data:`
   - `worker-src 'self' blob: https://cdn.jsdelivr.net`
   - `object-src 'none'`, `base-uri 'self'`
3. **`VER_APP` → `'v0.44'`** (única constante; firma, XLSX y toast salen de ella).
4. **Re-apuntar `Maatly.lnk`** a `Maatly_v0.44.html` con la ruta codificada (`Project%20Egypt`) y el directorio de trabajo nuevo.
5. **No tocar** fórmulas, UI, almacenamiento ni las versiones/SRI de las librerías.

## Hallazgos durante la verificación (corregidos en la misma v0.44)

1. **`font-src` bloqueaba la fuente de íconos de FullCalendar** (`data:application/x-font-ttf;...`). Se añade `data:` a `font-src`.
2. **Bug heredado de arranque**: la siembra automática de la demo (`cargarDatosDemo(true)`, línea ~2398) se ejecutaba antes de que `MONEDAS` existiera; en un perfil limpio `mFmt → monedaCfgGet → MONEDAS.forEach` lanzaba `TypeError` y abortaba el resto del arranque. Se difiere la llamada hasta después de definir `MONEDAS`, con la capa de moneda ya lista. Verificado con un perfil nuevo: el arranque completa, la firma muestra v0.44 y no hay excepciones.

## Verificación (Builder)

1. `node --check` sobre cada bloque `<script>` extraído de v0.44.
2. Comparación de IDs de elementos vs `Maatly_v0.43.html`: sin diferencias.
3. Diff v0.43 → v0.44 limitado al `<head>` y a `VER_APP` (sin cambios en el resto).
4. Recalcular el sha384 de los 7 CDN y confirmar que los `integrity` siguen intactos.
5. Comprobar que la CSP está antes del primer recurso y que incluye `frame-src` y los 5 hosts de `connect-src`.
6. Prueba manual: carga de la app, gráficas, calendario, drag & drop, exportación XLSX, vista previa de un PDF adjunto, y canales de notificación/agente si están configurados.

## Fuera de alcance

- Self-hosting de librerías (Tailwind Play CDN sigue sin SRI; excepción ya declarada).
- Cambios de lógica de negocio o de fórmulas.
- Migración a Supabase / IndexedDB.

## Riesgos residuales

- Tailwind Play CDN no ofrece SRI: la CSP y la versión fijada son la única barrera.
- `'unsafe-inline'` sigue siendo necesario por el monolito con estilos y scripts en línea.
- La CSP se aplica a un documento `file://`; si algún día se sirve por HTTP habrá que revisar `'self'`.
