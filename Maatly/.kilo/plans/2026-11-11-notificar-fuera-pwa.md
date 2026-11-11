# Plan 62: Notificar FUERA de la app (PC v0.54) + PWA Android (v0.55)

**Fecha:** 2026-11-11 · **Tema:** notificar-fuera-pwa · **Trunk:** `Maatly.html` editado in situ (plan 53) · `VER_APP` → `'v0.54'` (ronda A) → `'v0.55'` (ronda B).

## Petición (decisión del usuario 11/11)

«Que no se vean las notificaciones de forma interna sino que también fuera, cuando uno solicita el consentimiento del usuario» — elegido **A y luego B** en la misma sesión.

## Hallazgo previo (verificado 11/nov)

`agNotificarLocal` (12848) YA dispara `new Notification(...)` con permiso concedido (fuera, con clic que reabre la app) + toast + centro. Faltas: (A) icono, clic por tipo, mensaje para permiso bloqueado y verificación de que TODOS los avisos salen; (B) Android: el constructor es ilegal allí → hace falta service worker + `showNotification`.

## Ronda A · «Notificar fuera (PC)» → v0.54

1. **`ntfSistema(titulo, cuerpo, tipo)`** (nuevo helper): permiso concedido → `new Notification` con `{body, tag, icon (data-URI canvas), data:{vista}}`; clic por tipo — `ahorro`/`cierre` → `vistaInicio`, resto → `vistaActividades`; si el constructor falla (Android) → fallback `serviceWorker.getRegistration().showNotification(...)`. `agNotificarLocal` lo usa; `ntfAvisoMeta` también lo suma (centro + modal se quedan igual).
2. **`ntfIconoData()`**: logo «M» 64×64 por canvas (degradado indigo→violeta, cacheado).
3. **Panel**: pista i18n `nf.perm.ayuda` cuando el permiso está **bloqueado** (cómo desbloquearlo en el navegador). Dict es+en (943 → 944).
4. **Sonda `cdp_sysnotif.js`**: stub de `Notification` (spy constructor, permiso fake) — asertos: prueba de aviso → sistema; mapping de vista por tipo + onclick que cambia la vista; icono data: presente; centro sigue escribiendo; fase «denied» → 0 llamadas al sistema + pista visible en el panel. 0 excepciones / 0 CSP.

## Ronda B · PWA «Fuera también en Android» → v0.55

1. **`maatly-sw.js`** (junto al HTML; trunk sigue único): install/activate mínimos + `notificationclick` (cierra, enfoca cliente y `postMessage {maatlyNotifClick: vista}`; si no hay cliente, `openWindow('./')`).
2. **`manifest.webmanifest`** + **`icono-512.png`** (icono generado; tamaño real verificado en el PNG).
3. **HTML (contexto seguro únicamente):** `<meta name="theme-color">` estático; `<link rel="manifest">` + `serviceWorker.register('./maatly-sw.js')` + listener de `message` (→ `cambiarVista`) INYECTADOS por boot solo si `https:`/localhost — cero ruido en `file://`.
4. **Verificación `cdp_pwa.js`**: servidor local que sirve los 4 archivos (MIME correcto); SW registrado y `activated`; manifest/sw/icono fetch OK (PNG dimensiones reales); **spy de `reg.showNotification`** + `Notification` roto (simula Android) → el aviso sale por SW con título/vista correctos; 0 excepciones / 0 CSP.
5. **Checklist final para el usuario** (Android real + hosting HTTPS).

## Prohibiciones del régimen

Sin commits ni memoria durante la sesión (solo «Finalizar sesion»); sin copias por versión; solo write/edit; español; `icono-512.png`/`manifest.webmanifest`/`maatly-sw.js` viven junto al trunk y se commitean en el cierre.

## Result

### Ronda A · «Notificar fuera (PC)» → v0.54 — VERIFICADA (11/11)

**Cambios en `Maatly.html`** (trunk único, 6 edits):
1. `ntfIconoData()` — logo «M» 64×64 por canvas → data-URI PNG cacheado (len 7574, 2.ª llamada idéntica).
2. `ntfSistema(titulo, cuerpo, tipo)` — con permiso `granted`: `new Notification` con `{body, tag 'maatly-*', icon data-URI, data:{vista}}`; clic por tipo (`ahorro`/`cierre`→`vistaInicio`, resto→`vistaActividades`); si el constructor falla (Android lo prohíbe) → fallback `getRegistration().showNotification`.
3. `agNotificarLocal` usa `ntfSistema` + toast + centro (centro/toast intactos).
4. `ntfAvisoMeta` también sale FUERA (`ntfSistema(ti('nf.meta.tit'), …, 'ahorro')`).
5. Panel: pista i18n `nf.perm.ayuda` SOLO cuando el permiso está `denied`.
6. Dict es+en +`nf.perm.ayuda` → **944/944** · `VER_APP` → `'v0.54'`.

**Verificación** — `node --check` 5/5 · `verify_i18n` TODO OK (v0.54, 944/944, sin mojibake, SRI 7) · `check_keys` 944/944 · `check_ids` 110/110 · drift: 5 cadenas en revisión manual = las nuevas ES de las rondas sin commit (v0.53 + `nf.perm.ayuda`), cero drift real.

**Sonda `cdp_sysnotif.js` (puertos 9372/9373) — TODO OK (43 asertos, 0 excepciones / 0 CSP / 0 errores de consola):**
- estático: `ntfSistema`, `ntfIconoData`, `ntfAvisoMeta→ntfSistema`, `'nf.perm.ayuda'` ×3 en el trunk;
- [F1 granted]: agNotificarLocal → **1 notificación FUERA** (título/body íntegros, tag `maatly-…`, icono data-URI, `data.vista` correcto por tipo ahorro/vencida/cierre) · onclick por tipo reabre en `vistaInicio`/`vistaActividades` · centro sigue escribiendo (`_probeB_` tp vencida) · toast «Prueba sistema B — Cuerpo B» · panel granted SIN pista · **constructor roto (simula Android)** → 0 sistema, SIN excepción, centro+toast intactos;
- [F2 denied]: 0 llamadas al sistema + centro/toast siguen + pista `nf.perm.ayuda` visible en `cfgBodyNotif` (ES y EN tras recarga de idioma) + botón de permiso intacto;
- boot: toast de versión v0.54.
- Capturas: `probe_v054_sysnotif_panel_es.png` · `probe_v054_sysnotif_denied.png` (EN, Blocked + pista + toast vistos).

**Huella v0.54:** MD5 `9104BF62597D264D9B7BBCC25753BB81` · 1.105.153 B · 13.397 líneas.

### Ronda B · PWA «Fuera también en Android» → v0.55 — VERIFICADA (11/11)

**Cambios**:
1. `maatly-sw.js` (NUEVO, junto al trunk): `install` → skipWaiting · `activate` → clients.claim · `notificationclick` → cierra la notificación, `clients.matchAll({includeUncontrolled:true})` → `postMessage {maatlyNotifClick: vista}` + `focus()` del primer cliente; sin clientes → `openWindow('./')`. **Sin caché/offline** (decisión de la ronda: la app ya funciona sin red como archivo local).
2. `manifest.webmanifest` (NUEVO): name/short_name «Maatly» · start_url `./` · scope `./` · display standalone · background `#0f172a` · theme_color `#4f46e5` · lang es · icono `icono-512.png` `512x512` REAL purpose **any + maskable**.
3. `icono-512.png` (NUEVO, 241.891 B): generado con **Edge headless + canvas** (el generador de imágenes cayó por la API key de Gemini vencida — deuda anotada): degradado `#4f46e5`→`#7c3aed` + «M» blanca bold 300px; firma PNG + IHDR 512×512 verificados (`gen_icono.js`, puerto 9369).
4. `Maatly.html` — boot `agInit` (antes del cierre del IIFE): guarda de contexto seguro (`https:` / localhost / 127.0.0.1) → inyecta `<link rel="manifest">` (solo si no existe) + `serviceWorker.register('./maatly-sw.js')` (catch silencioso) + listener `message` en `navigator.serviceWorker` → `cambiarVista(String(d.maatlyNotifClick))`. En `file://` NO se inyecta nada (cero ruido de consola).
5. `VER_APP` → `'v0.55'`.

**Verificación estática** — `node --check` 5/5 (con la inyección) · `verify_i18n` TODO OK (v0.55, dict 944/944, SRI 7, sin mojibake) · `check_keys` 944/944 · `check_ids` 110/110.

**Sonda `cdp_pwa.js` (puertos 9374/9375) — TODO OK (52 asertos, 0 excepciones / 0 CSP / 0 errores de consola):**
- estático: SW (8 fragmentos) · manifest (standalone + 512x512 ×2 + theme/name) · trunk (registro + manifest + listener + guarda de contexto);
- [P1] contexto seguro (http://127.0.0.1): link manifest inyectado · fetches 200 con MIME correctos (manifest `application/manifest+json` · sw `text/javascript` · icono `image/png` 241.891 B vía arrayBuffer) · **SW registrado y ACTIVADO** · scope raíz · página CONTROLADA (clients.claim) · **SIMULACIÓN ANDROID** (`Notification` sin constructor, como en Android real): el aviso sale por `reg.showNotification` con título/body/tag `maatly-…`/icono data-URI y vista correctas — vencida→`vistaActividades`, ahorro→`vistaInicio` — centro + toast siguen;
- [P2] pipeline del clic evaluado DENTRO del worker (target service_worker por /json): `matchAll` → 1 cliente → `postMessage {maatlyNotifClick:'vistaActividades'}` → el listener de la página cambió la vista de verdad y regresó a `vistaInicio`;
- [P3] `file://` (el .lnk del usuario): SIN link manifest · SIN SW · app arranca igual (v0.55);
- capturas: `probe_v055_pwa_https.png` · `probe_v055_pwa_file.png`.

**Hallazgo nuevo (bitácora):** en origen `file:` hasta `navigator.serviceWorker.getRegistration()` lanza `SecurityError` («origin null not supported») — la guarda del app nunca lo invoca allí (verificado en P3).

**Huella final v0.55:** MD5 `19E855BA53829455A36355A77705B316` · 1.106.460 B · 13.419 líneas.

**Checklist QA Android real (para el usuario — no automatizable desde aquí):**
1. Hosting HTTPS real (p. ej. GitHub Pages): subir a la raíz los 4 archivos — `Maatly.html` + `maatly-sw.js` + `manifest.webmanifest` + `icono-512.png` (mismo directorio).
2. En Android Chrome abrir la URL → menú ⋮ → «Añadir a la pantalla de inicio» (si ofrece «Instalar», el manifest+SW están bien).
3. Con el permiso de notificaciones concedido, esperar un aviso (actividad vencida/agenda o dinero) → debe aparecer NOTIFICACIÓN DEL SISTEMA con el logo «M».
4. Tocar la notificación → la app se abre/enfoca y salta a la vista correspondiente (dinero/cierre → Inicio; actividades → Actividades).
5. En PC el clic del aviso del escritorio ya quedó verificado (sonda A).

### Estado al cierre de las dos rondas (11/11)
- Trunk v0.55 + `maatly-sw.js` + `manifest.webmanifest` + `icono-512.png` + plan 62 — **SIN COMMIT** (régimen: se commitean en «Finalizar sesion»).
- `git status` esperado: `M Maatly/Maatly.html` + sin trackear: plan 61, plan 62, los 3 archivos PWA.
