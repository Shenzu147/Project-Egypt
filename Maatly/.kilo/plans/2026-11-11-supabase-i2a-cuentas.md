# Plan 63: Supabase I2a · Cuentas (v0.56)

**Fecha:** 2026-11-11 · **Tema:** supabase-i2a-cuentas · **Trunk:** `Maatly.html` editado in situ (plan 53) · `VER_APP` → `'v0.56'`.

## Decisiones del usuario (11/11)

- **Ronda elegida:** Supabase **I2a · Cuentas** (después del cierre v0.55 + hosting Pages vivo).
- **Login OPCIONAL** (recomendado y aceptado): la app sigue 100 % funcional sin cuenta — tarjeta en Ajustes, cero gate al arranque. Argumento clave: el OAuth de Google solo completa en el sitio hosted; el `.lnk` local por `file://` no puede firmar.
- **Proyecto Supabase:** el usuario lo crea ahora (te paso URL + anon key); el código se prepara con marcadores.

## Alcance I2a (fase «chica» del roadmap-guardado)

1. **CSP** (`<head>`, línea 7): `connect-src` += `https://*.supabase.co wss://*.supabase.co`.
2. **SDK** supabase-js **2.119.0** vía jsdelivr con SRI (`sha384-uteMfOlo…`, 219.856 B) — carga DINÁMICA solo si `SUPA_CFG.url` está configurada (cero requests y cero ruido en file:// sin configurar).
3. **Config**: const `SUPA_CFG = { url: '', key: '' }` junto a `VER_APP` — el proyecto pasa ahí (URL + anon key; la service key JAMÁS va al HTML).
4. **Sección nueva en Ajustes «Cuenta y nube»** (hub + `cfgSeccionCuenta` + `cfgBodyCuenta` + registro en `CFG_SECCIONES` + pintor `supaRenderPanel` + wire): estado de sesión (sin sesión / nombre+email+proveedor), botón «Iniciar sesión con Google» (`signInWithOAuth({ provider: 'google', redirectTo: location.href })`), «Cerrar sesión», y con `SUPA_CFG` vacía → guía honesta «nube no configurada».
5. **Perfil**: tras el primer sign-in, upsert en `profiles` (id = `auth.uid()`, nombre del perfil, idioma de `perfilGet().idioma`) con RLS «own profile».
6. **SQL del usuario** (pega en el SQL editor de Supabase): tabla `profiles` + RLS. (En el Result final.)
7. **i18n**: claves `su.*` es/en (dict 944 → ~958, ES = texto exacto).
8. **Login opcional**: NADA cambia en el arranque (sin gate, sin esperar sesión); `onAuthStateChange` actualiza la tarjeta viva.

## Fuera de alcance (fases siguientes)

I2b backup-JSON · I3 calendarios (Edge Functions; el `client_secret` de Google NUNCA va al HTML) · I4 datos granulares. Cero datos se mueven a la nube en I2a.

## Verificación

- Checkers del ritual (`node --check` 5/5 · `verify_i18n` · `check_keys` · `check_ids` · drift).
- Sonda `cdp_i2a.js`: (a) **fase file://** — sin `SUPA_CFG`, cero SDK, app 100 % funcional, tarjeta honesta, 0 ruido; (b) **fase http://127.0.0.1 con MOCK** del cliente (`window.supabase` fake por `addScriptToEvaluateOnNewDocument`): sign-in → tarjeta con nombre/email, upsert de profile llamado con id/nombre/idioma, sign-out → tarjeta limpia; 0 excepciones / 0 CSP.
- **QA real del usuario** cuando pegue URL+key y configure Google en Supabase: sign-in desde el sitio hosted (Pages) → Google → regreso con sesión → tarjeta con su nombre → cerrar sesión.

## Prohibiciones del régimen

Sin commits ni memoria durante la sesión; solo write/edit; español; cero claves de storage nuevas sin decisión (la única: `maatlySupaSesion` NO existe — la sesión la maneja supabase-js en su propio localStorage `sb-<ref>-auth-token`).

## Result (11/11/2026 — COMPLETO, TODO OK)

### Edits aplicados al trunk (8)
1. **CSP** (línea 7): `connect-src` += `https://*.supabase.co wss://*.supabase.co` (comentario v0.56).
2. **`VER_APP = 'v0.56'`** + **`const SUPA_CFG = { url: '', key: '' }`** con comentario-guía (service key JAMÁS).
3. **Tarjeta hub «Cuenta y nube»** (teal, icono nube feather) antes del botón del agente — 2×col con `data-i18n` `aj.titulo.cuenta`/`aj.sub.cuenta`.
4. **Sección estática** `cfgSeccionCuenta` + `cfgBodyCuenta` antes de `<!-- SECCIÓN: DATOS -->` (patrón idéntico a las demás).
5. **`CFG_SECCIONES.cuenta`** (icono nube + claves i18n) tras `notif:`.
6. **Wire** en `abrirCfgSeccion`: `if (id === 'cuenta') supaRenderPanel();`.
7. **Bloque JS v0.56** antes de «Estado del sidebar y arranque»: `supaCliente`/`supaSesion` (let) · `supaConfigurada()` · `supaCargarSdk()` (script `#sdkSupabase`, jsdelivr 2.119.0, **SRI sha384-uteMfOlo…**, crossorigin anonymous) · `supaInit()` (createClient + `getSession` + `onAuthStateChange` + upsert en SIGNED_IN/INITIAL_SESSION) · `supaPerfilAsegurar()` (`from('profiles').upsert({id, nombre, idioma})`, nombre = perfilGet().nombre → prefijo del email) · `supaSignIn()` (guardas: sinCfg → file: → noSdk; `signInWithOAuth({provider:'google', redirectTo: location.href sin hash})`; catch → `su.errSignIn`) · `supaSignOut()` · `supaRenderPanel()` (4 estados: guía sinCfg / noSdk ámbar / sesión con nombre+email+salir / botón Google SVG 4 colores + nota opcional; en file:// nota ámbar en lugar del botón muerto; wire btnSupaEntrar/btnSupaSalir) · `i18nRefrescar(supaRenderPanel)`.
8. **`supaInit();`** dentro de `agInit` tras `ntfRenderPanel();` (no-op si SUPA_CFG vacía).
9. **Dict i18n**: +16 claves es/en (`aj.titulo.cuenta`, `aj.sub.cuenta`, `su.tit/desc/sinCfgTit/sinCfgD1/sinCfgD2/noSdk/fileNota/entrar/salir/opcional/errSignIn/sinCfg/soloHosted/sesion`) → **960/960 simétrico**.

### Bug encontrado y corregido durante la sonda
- **`supaCargarSdk` no era idempotente**: si el script ya había cargado, el listener `load` añadido después no dispara nunca → `supaInit` colgaría en `await`. Fix: en `onload` se marca `dataset.cargado='1'` y la segunda llamada resuelve al instante (sin cambio de comportamiento en el camino real).

### Verificación (ritual completo)
- **Checkers** (tras el fix, re-corridos): `node --check` 5/5 · `verify_i18n` TODO OK (dict **960/960** simétrico, data-i18n 294 usos/259 claves, ti() 623, sin huérfanas, sin IDs duplicados, SRI 7, v0.56, sin mojibake) · `check_keys` 960/960 SIMÉTRICAS · `check_ids` 110/110 · drift = solo las 16 cadenas ES nuevas sin commit (esperado).
- **Sonda `cdp_i2a.js`** (puertos 9377/9378, servidor local con MIME + PWA files): **55 asertos TODO OK, 0 excepciones / 0 CSP / 0 errores de consola**.
  - **P1 file://** (22): cero SDK (sin `window.supabase`, sin `#sdkSupabase`, 0 requests supabase-js) · app funcional · hub → tarjeta «Cuenta y nube» → sección + título · panel guía honesta «Nube aún no configurada» + sinCfgD2 · sin botones Google/salir · guardas: `supaSignIn` sin cfg → toast `su.sinCfg`; con `supaConfigurada=true` → toast `su.soloHosted` SIN llamar OAuth · i18n EN: tarjeta «Account & cloud», subtítulo, `su.noSdk`/`su.fileNota` EN · regreso a es.
  - **P2 http://127.0.0.1** (30): SDK REAL de jsdelivr cargó con **SRI íntegro** (script con integrity) · mock inyectado + `supaConfigurada=true` → `supaInit`: `getSession` + `onAuthStateChange` + `createClient` recibió SUPA_CFG · 0 upserts sin sesión · sección → botón Google + nota opcional + SIN caja sinCfg · clic → `signInWithOAuth` 1 vez con `{provider:'google', redirectTo:'http://127.0.0.1:9377/Maatly.html'}` · vuelta simulada `('SIGNED_IN')` → panel con «Alex Ramírez» + email + «Sesión iniciada con Google» + botón salir, Google ausente · **upsert profiles `{id:'u-mock-123', nombre:'Alex', idioma:'es'}`** · sin spam (sigue 1) · i18n EN del panel vivo («Signed in with Google»/«Sign out») · regreso es · salir → `signOut` + panel limpio + sin upsert extra.
- **Capturas revisadas**: `probe_v056_i2a_file.png` (estado guardas: notas ámbar + toast) · `probe_v056_i2a_http.png` (botón «Continuar con Google» 4 colores + nota opcional) — diseño coherente con la app.

### Huella final v0.56 (ronda I2a)
MD5 `7C76F1E131C52309ECD98CB1214CA970` · **1.123.909 B** · **13.617 líneas**.

### Verificación REAL contra el proyecto del usuario (11/11, claves pegadas)
- `SUPA_CFG` con claves REALES: url `https://pshtfyodoxxyzpwgmpoj.supabase.co` (el usuario pasó la URL del endpoint REST; se pega la BASE — el SDK añade los caminos) + key **`sb_publishable_…`** (formato NUEVO de Supabase, pública por diseño).
- **curl** `/auth/v1/settings` → 200 (key válida) · `google:false` · REST `/profiles` → 200 `[]` (tabla EXISTE + RLS activa).
- **Sonda `cdp_i2a_real.js`** (9379/9380, proyecto REAL): **16 asertos TODO OK + 1 aviso, 0 excepciones / 0 CSP / 0 errores de consola**. Boot real: SDK real por SRI → `supaInit` REAL en el boot → `supaCliente` creado con las claves del usuario · `supaSesion` null · panel en estado «botón Google» (sin caja sinCfg ni noSdk) · `signInWithOAuth` responde sin excepción y produce la URL de authorize (con `skipBrowserRedirect`, NO navega) · **RLS probada de verdad**: upsert SIN sesión → `42501 new row violates row-level security policy` (RECHAZADO, correcto) · select sin sesión → `[]` sin error · el 401 de red es la propia RLS (filtrado como ruido deliberado).
- **CSP validada en vivo**: los fetch del SDK a `*.supabase.co` pasaron limpios por `connect-src` (0 violaciones).
- Huella tras pegar claves: MD5 `1D62FD38B28F8213D8B16AE5C21D69D6` · **1.124.073 B** · **13.617 líneas**.

### Estado de la activación (usuario)
- ✅ Proyecto creado + claves pegadas en `SUPA_CFG` · ✅ tabla `profiles` + RLS funcionando.
- ⏳ **Falta el paso 3**: habilitar Google (OAuth client en Google Cloud Console → pegar en Supabase Auth → Providers → Google) y **Authentication → URL Configuration**: Site URL + Redirect URLs con `https://shenzu147.github.io/Project-Egypt/Maatly/Maatly.html` (sin esto el regreso de Google se rechaza). Hoy el clic → «Unsupported provider» → toast `su.errSignIn` (comportamiento correcto).

### Pendiente del usuario (activación real — original)
1. Crear proyecto Supabase (gratis) → Settings → API: copiar **Project URL** + **anon public key** → pegarlas en `SUPA_CFG` del trunk.
2. SQL editor: crear tabla `profiles` + RLS «own profile» (SQL entregado en la sesión).
3. Auth → Providers → Google: OAuth client en Google Cloud Console (origen `https://shenzu147.github.io`, redirect `https://<ref>.supabase.co/auth/v1/callback`) → pegar client id/secret en Supabase.
4. Push a Pages → QA real: sign-in desde el sitio publicado → Google → regreso con sesión → tarjeta con nombre → cerrar sesión. (El SDK real + SRI ya quedaron probados en P2; falta solo el extremo real de Supabase.)
