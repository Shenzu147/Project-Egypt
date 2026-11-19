# HOSTING.md — cómo se publica y se mantiene Maatly

Documento de traspaso. Si eres otra persona (o el mismo jdeb1 dentro de un año): con esto y
`Maatly/AGENTS.md` (estado + convenciones) + `Maatly/BITACORA.md` (historial) no necesitas
preguntar nada para publicar una versión.

**La app es un solo archivo HTML sin compilación.** No hay `package.json`, ni bundler, ni
dependencias instalables. Las librerías (Chart.js, GridStack, FullCalendar, XLSX, Tailwind) se
cargan por CDN con versión fija y SRI desde el `<head>` de `Maatly/Maatly.html`.

---

## 1. Qué archivos componen el sitio

Todo lo publicable vive en `Maatly/`:

| Archivo | Papel |
|---|---|
| `Maatly.html` | **La app entera** (≈1,2 MB, archivo único, `VER_APP` dentro) |
| `entrar.html` | Portal de entrada/login (Supabase Auth), `VER_PORTAL` dentro |
| `maatly-sw.js` | Service worker: offline + notificaciones (`CACHE = 'maatly-shell-vX'`) |
| `manifest.webmanifest` | Manifiesto PWA (`start_url: ./Maatly.html`) |
| `icono-512.png` | Icono PWA / TWA |
| `_redirects` | Alias de entrada `/` y `/maatly` (ver §4) |
| `.well-known/assetlinks.json` | Verificación de dominio del APK (Digital Asset Links) |
| `AGENTS.md`, `BITACORA.md`, `.kilo/plans/` | Memoria y planes (también se publican: no meter secretos) |

## 2. Los tres hosts (nov/2026)

| Host | Estado | Para qué |
|---|---|---|
| **https://maatly.pages.dev** | **Canónico**. Auto-deploy en cada push a `main` | Uso normal, OAuth de Google, PWA de escritorio |
| https://shenzu147.github.io/Project-Egypt/Maatly/Maatly.html | Espejo de emergencia, auto-deploy | Red de seguridad si Pages falla. **No** sirve `.well-known` (Jekyll) |
| https://maatly.netlify.app | **Legado, congelado en v0.64** (deploys pausados) | Sólo lo usa el **APK v1** mientras siga instalado. Se puede borrar cuando el teléfono use la PWA/WebAPK de Pages |

Nada del código depende de un host concreto: rutas relativas y ningún origen hardcodeado. Lo
único atado a un host es el **APK** (ver §6).

En el teléfono la instalación recomendada es la **PWA desde Pages** (Chrome/Edge → «Instalar
aplicación»): el navegador genera un WebAPK equivalente al TWA, sin keystore ni SDK. Verificado
con `Page.getInstallabilityErrors` (CDP): sin errores, la instalación se ofrece.

## 3. Desplegar (Cloudflare Pages)

- Repo: `github.com/Shenzu147/Project-Egypt` (público) · rama `main`.
- Proyecto Pages `maatly`: Framework preset **None**, build command **vacío**,
  **build output directory `Maatly`**. No compila: sólo publica la carpeta.
- Flujo: `git push` → build ~30 s. No hay que hacer nada más.
- Tras un push, **abre la app una vez online** para que el service worker nuevo se instale.

## 4. `_redirects` (y por qué el destino no lleva `.html`)

Pages convierte `/Maatly.html` en `/Maatly` **con un 308** y no sirve nada en `/`. Reglas:

```
/         /Maatly   200
/maatly   /Maatly   200
```

Son **reescrituras 200**: la URL no cambia. Si el destino se escribiera como `/Maatly.html`,
Pages re-resolvería la ruta, le quitaría la extensión y respondería 308 (un salto de más).
`/maatly` en minúscula es el `startUrl` del APK, por eso es obligatorio.

## 5. Supabase (login y sincronización)

- Proyecto: **`pshtfyodoxxyzpwgmpoj`** (`https://pshtfyodoxxyzpwgmpoj.supabase.co`).
- `SUPA_CFG` vive en `Maatly.html` (junto a `VER_APP`) con la clave **publishable**
  (`sb_publishable_…`), que es pública por diseño.
- **Nunca** al repo: la *service key*, el *client secret* de Google, la contraseña de la base.
  Viven en el dashboard de Supabase.
- Auth → URL Configuration → *Redirect URLs* debe incluir `https://maatly.pages.dev/**`.
- Tablas: `profiles` (RLS por `auth.uid()`), `snapshots` (copias JSON), `datos` (sync en vivo,
  una fila por `user_id` + `coleccion`). `datos` requiere
  `alter publication supabase_realtime add table public.datos;` o el Realtime no dispara.
- Plan gratuito: el proyecto **se pausa tras ~1 semana sin actividad**. No hay que pagar; basta
  con reactivarlo en el dashboard.
- En `file://` la app es 100 % local: no hay login, ni nube, ni service worker (por diseño).

## 6. APK / TWA (Android)

Vive **fuera del repo**, en `C:\Users\jdeb1\maatly-twa\` (fuente + keystore + `CREDENCIALES.txt`).

- `packageId: app.maatly.twa` · `minSdkVersion 24` · `targetSdk 36` · orientación `default`.
- Keystore `./android.keystore`, alias `android`. **Sin keystore no hay actualizaciones
  firmadas**: es el único activo irreversible del proyecto. Respaldarlo aparte (cifrado).
  `CREDENCIALES.txt` guarda las contraseñas y **jamás** entra al repo.
- El SHA-256 del certificado **sí es público** (va en `assetlinks.json`):
  `10:F6:08:CE:66:FE:E6:3B:95:E2:13:F1:11:D6:D8:F5:3E:DF:BC:F9:54:57:07:AF:3D:14:5F:92:18:B9:0C:B3`
- `gen_twa.js` es la **fuente de verdad** del proyecto Android (host, URLs, versión, iconos).
  `twa-manifest.json`, el proyecto Gradle y `manifest-checksum.txt` son **generados**: no se
  editan a mano (si se tocan, el checksum no cuadra y `bubblewrap build` se bloquea).

Reconstruir una versión nueva (el `appVersionCode` debe subir siempre):

```bat
set BUBBLEWRAP_KEYSTORE_PASSWORD=...
set BUBBLEWRAP_KEY_PASSWORD=...
node gen_twa.js "10:F6:08:CE:66:FE:E6:3B:95:E2:13:F1:11:D6:D8:F5:3E:DF:BC:F9:54:57:07:AF:3D:14:5F:92:18:B9:0C:B3"
bubblewrap build --skipPwaValidation
```

El fingerprint se pasa **con dos puntos**, tal como aparece en `twa-manifest.json` (es el mismo
que sirve `assetlinks.json`). `gen_twa.js` reescribe el manifiesto, el proyecto Android y
`manifest-checksum.txt`; `bubblewrap build` firma y deja `app-release-signed.apk`.

Mismo keystore ⇒ la nueva APK se instala **encima** de la anterior. `startUrl` es `/maatly`
(reescritura 200 del §4). El TWA verifica el origen contra
`https://maatly.pages.dev/.well-known/assetlinks.json`, que hoy responde 200.

**Alternativa sin toolchain**: abrir `https://maatly.pages.dev/maatly` en Chrome/Edge de Android
y usar «Instalar aplicación». El navegador genera un WebAPK propio (mismo efecto que el TWA), sin
keystore, sin SDK y sin `assetlinks.json`. Sirve para tener la app actualizada hoy mismo; el APK
firmado sigue siendo el camino si algún día se publica en una tienda.

## 7. Ritual de versión (no saltárselo)

1. Subir `VER_APP` en `Maatly.html` (y `VER_PORTAL` en `entrar.html` si toca).
2. Subir `CACHE` en `maatly-sw.js` (`maatly-shell-vX`): sin esto los aparatos siguen con el
   HTML viejo cacheado.
3. `node --check` de los bloques JS · `verify_i18n.js` (dict es/en simétrico) ·
   checkers de IDs y de drift.
4. Sondas CDP reales: 0 excepciones, 0 errores de consola, 0 avisos CSP.
5. Anotar la huella (MD5 + bytes + líneas) y commitear.

Las sondas y checkers se escriben en `C:\Users\jdeb1\AppData\Local\Temp\opencode\` (son
herramientas, no producto). Las útiles en esta etapa:

```
node check_js_blocks.js      # 5/5 bloques JS
node verify_i18n.js          # dict es/en simétrico
node check_ids_i12.js        # IDs del DOM
node check_drift_i17.js      # texto ES del dict == texto del HTML
node cdp_ancho.js            # 7 anchos (320→767) con datos extremos
node cdp_scroll.js           # barras y tope móvil
node cdp_cf.js               # host emulado: rutas, SW y offline sin red
node check_cf_vivo.js        # HTTP en vivo (rutas, cabeceras, MIME)
node cdp_cf_vivo.js          # navegador en vivo: SW controlando, caché, offline real
```

**Ojo al verificar en el sitio publicado**: la app tiene *puerta* (v0.57) y sin sesión manda a
`/entrar`. Para QA del shell hay que entrar con `?local=1`.

## 8. Si algún día hay dominio propio

Comprar el dominio y añadirlo como *Custom domain* en Pages: mover el sitio es entonces un
cambio de DNS, no una migración. Después: actualizar `gen_twa.js` (host + URLs) y reconstruir
el APK. `entrar.html` y `SUPA_CFG` no cambian (mismo código, otro origen).

## 9. Lo que no hay que hacer

- No crear copias por versión del HTML ni "recodificar" con PowerShell (mojibake); se edita
  in situ.
- No commitear keystore, `CREDENCIALES.txt`, service keys ni `client_secret`.
- No cambiar el `packageId` (rompe la actualización del APK y `assetlinks.json`).
- No borrar `_redirects`: sin él, `/` y `/maatly` dan 404.
