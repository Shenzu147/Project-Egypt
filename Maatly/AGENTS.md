# AGENTS.md — Memoria compacta y convenciones de Maatly

Documento de referencia PERMANENTE (instrucciones + estado compacto). El detalle histórico vive en `BITACORA.md` (bajo demanda, grep por `## dd/mm`).
> **Re-creado en el cierre del 03/11/2026.** El commit «V0.4» (03/nov, 19:04, del usuario) había eliminado este archivo sin registro ni decisión documentada. Si el borrado fue deliberado: elimina este archivo y actualiza el plan `2026-11-01-regimen-archivo-unico`.

## Estado actual
- **Trunk único (nombre definitivo desde plan 53; NO renombrar por versión):** `Maatly.html` · `VER_APP = 'v0.57'` · portal de entrada `entrar.html` (v0.57.1, dict propio `I18N_PORTAL`).
- **Huella al cierre 13/nov:** trunk MD5 `D4E2DF8B02EFA9099C9FCAE9FB8DAA48` · **1.130.949 B** · 13.716 líneas (intacto desde `85ace3a`) · portal MD5 `B61231D0A1D2A2C830CA7972DE004356` · **40.860 B** · 609 líneas.
- **Último gran trabajo:** v0.57 «Login normalizado» — portal `entrar.html` (609 líneas): regreso de Google VISIBLE (`detectSessionInUrl:false` + intercambio PKCE manual con toast + caja roja `supaUltimoError`; probado contra el proyecto real: código PKCE falso → error VISIBLE en la tarjeta) + email/contraseña como 2ª vía a la MISMA cuenta (entrar · crear · olvide · recuperación `?token_hash` → `verifyOtp`+`updateUser` · añadir contraseña a cuenta solo-Google) · puerta de la app `supaPuerta*` (solo https sin token local; `?local=1` → `maartlyPortalSalto`; file:// jamás). Sonda `cdp_ronda57.js` **131/131 TODO OK** · 0 excepciones/0 CSP. Trunk+portal base commiteados por el usuario (`85ace3a «V0.5 inicio de sesion»`); el portal completo entra en el commit del cierre 13/nov.
- **Idioma:** fuente única `perfilGet().idioma` (`es`/`en`) + helper `idiomaApp()`; dict `I18N {es,en}` **962/962**; la cadena ES del dict es el texto EXISTENTE (cero drift). El portal tiene su propio dict `I18N_PORTAL` es/en (misma disciplina).
- **Datos:** `localStorage` + export/import JSON (`maatlyPerfil`, `maatlyFinanzasCfg`, `maatlyNotif*`/`kanban*`, `maatlyPin`, `maatlyVersionVista`). La sesión de cuenta la maneja supabase-js (`sb-<ref>-auth-token`) — cero claves nuevas. Cero claves nuevas sin decisión del usuario.
- **Hosting:** repo `Shenzu147/Project-Egypt` **PÚBLICO** · **GitHub Pages ACTIVO** `https://shenzu147.github.io/Project-Egypt/Maatly/Maatly.html` (cachea 10 min → Ctrl+F5) · **ESPEJO Netlify (13/nov)** `https://maatly.netlify.app` — publish dir `Maatly` → archivos en la RAÍZ: trunk `/maatly` (Pretty URLs; `/Maatly.html` 301 → `/maatly`), portal `/entrar.html` 200 directo (ideal OAuth); manifest byte-idéntico; auto-deploy en cada push; sirve el estado COMMITTEADO (+535 B de comentario HTML inyectado por Netlify — inofensivo). `/.well-known/assetlinks.json` llega con la fase APK.

## Régimen de trabajo (reglas del usuario — plan «regimen-archivo-unico», 01/nov)
1. **Archivo único editado in situ** — PROHIBIDO crear copias por versión; NO recodificar con PowerShell (mojibake): solo herramientas write/edit; trabajar en español.
2. **«Respaldo»** (palabra exacta) → copia byte-idéntica del trunk a `respaldo/`, sin commit.
3. **«Finalizar sesion»** (frase exacta) → ritual `/memoria`: entrada del día en BITACORA (más nueva arriba, no borrar entradas) + actualizar este archivo (Estado/Cambios/Pendientes; < ~150 líneas; sin secretos) + UN commit con todo lo pendiente (mensaje corto y plano, sin acentos ni símbolos raros; nunca reescribir historia) + resumen final de 1–3 líneas.
4. Durante la sesión: PROHIBIDO escribir memoria y PROHIBIDO commitear — git es el historial.
5. Verificación mínima por ronda: `node --check` 5/5 bloques · `verify_i18n.js` · checker de IDs + checker de drift · **sonda CDP real** (0 excepciones / 0 CSP / 0 errores de consola) · huella (MD5 + bytes + líneas) registrada.
6. Emojis: solo la función de Notas (purga v0.25.46/.47, entidades HTML incluidas). UTF-8/CRLF sin cambios.
7. Toasts de commit solo en `change` — NUNCA por tecla. Diálogos por el motor `mDlg*`/`aaDlgAbrir` (el confirmador va arriba, z-170).

## Convenciones i18n (v0.52)
- Traducción por DICCIONARIOS ESTÁTICOS es/en — jamás API en runtime. `ti()` (clave sola) · `tiPlantilla()` (placeholders `{a}/{b}`…, reusa `paisPlantilla`) · HTML estático con `data-i18n(-ph/-title/-aria)`; el walker SOLO escribe claves que existen en `I18N.es`. Claves `prefijo.clave`.
- Pintores JS con `ti()` dentro y registro en `i18nRefrescar` (recarga suave sin descargar la página). Labels con `<input>` hijo: SIEMPRE `ti()` en el pintor — jamás `data-i18n` en el contenedor.
- Títulos de actividades, categorías, columnas y notas son DATOS del usuario: no se traducen. Texto de `content:` en CSS necesita puente `attr(data-vacio)` (lección I1+6). FullCalendar 6 solo cambia idioma con destroy+rebuild (lección I1+4; `setOption` es no-op).

## Convenciones PWA (v0.55)
- El trunk sigue siendo archivo único; la PWA vive en 3 archivos JUNTOS al trunk (`maatly-sw.js`, `manifest.webmanifest`, `icono-512.png`) — mismo directorio, scope `./`, `start_url './Maatly.html'` (Pages no sirve index.html).
- El registro del SW es SOLO en contexto seguro (https/localhost), inyectado por `agInit`; en `file://` no se inyecta nada (el .lnk local queda limpio). El SW NO tiene caché/offline (decisión 11/nov): solo notificaciones.
- El clic de una notificación del sistema llega como `postMessage {maatlyNotifClick}` → `cambiarVista`; el fallback `ntfSistema`→SW es el camino de Android (allí el constructor `new Notification` es ilegal).

## Convenciones Supabase (v0.56 · I2a)
- **`SUPA_CFG = { url, key }`** en el trunk (junto a `VER_APP`): la url es la **BASE** del proyecto (sin `/rest/v1/`) y la key es la **publishable** (formato nuevo `sb_publishable_…`, pública por diseño). La **service key** y el **client secret** de Google JAMÁS van al HTML ni al repo — viven en el dashboard.
- **SDK** supabase-js 2.119.0 UMD vía jsdelivr con **SRI** (`sha384-uteMfOlo…`); carga DINÁMICA solo si `supaConfigurada()` — con `SUPA_CFG` vacía la app es 100 % local y cero requests. `supaCargarSdk` es idempotente (`dataset.cargado`).
- La sesión la maneja supabase-js en su propio localStorage (`sb-<ref>-auth-token`) — NADA de la app toca esas claves (verificado: 0 `localStorage.clear()`).
- **OAuth de Google SOLO en sitio hosted**: en `file://` la guarda `su.soloHosted` + nota ámbar (`su.fileNota`) en vez del botón muerto. El login es OPCIONAL: cero gate al arranque.
- Pintor `supaRenderPanel` registrado con `i18nRefrescar` (patrón `ntfRenderPanel`) + wire en `abrirCfgSeccion('cuenta')`; panel con 4 estados (sinCfg / noSdk / sesión / botón Google).
- Perfil: `from('profiles').upsert({id, nombre, idioma})` tras SIGNED_IN/INITIAL_SESSION — nombre = `perfilGet().nombre` → prefijo del email. RLS own-profile (`auth.uid() = id` en select/insert/update).
- ~~Regreso de Google en silencio (v0.56)~~ → **RESUELTO en v0.57**: el intercambio es MANUAL en el portal (`detectSessionInUrl:false` + `exchangeCodeForSession` con toast + caja roja `supaUltimoError`) — jamás en silencio.

## Convenciones Login (v0.57)
- **Portal `entrar.html`** (arranque `pBoot`, guard único; dict `I18N_PORTAL` es/en + CSP propia): email+contraseña ARRIBA y Google DEBAJO — ambas vías a la MISMA cuenta (auto-linking por email de Supabase).
- **Contraseña PROPIA de Maatly, jamás la de Google** (Google nunca la comparte; pedirla sería phishing). Mínimo 8, validado en cliente SIN gastar SDK; errores inline vía `pMapearAuth` (dict) sin perder lo tecleado.
- Recuperación: plantilla Reset Password con `{{ .TokenHash }}` → `entrar.html?token_hash=…&type=recovery` → `verifyOtp({type:'recovery'})` + `updateUser({password})`. La cuenta solo-Google añade contraseña desde «dentro» (tarjeta visible cuando `identities` no tiene provider email).
- El `volver` de la app viaja en sessionStorage `maatlyVolver`; el escape del portal es `?local=1` → `maartlyPortalSalto`. OAuth de Google SOLO en sitio hosted (file:// nota ámbar).

## Cambios recientes (detalle: BITACORA → entrada del plan)
- **v0.57 + v0.57.1** (12–13/nov): «Login normalizado» — portal `entrar.html` con regreso de Google VISIBLE (PKCE manual + caja roja) y email+contraseña a la misma cuenta; **Netlify** espejo `https://maatly.netlify.app` verificado en vivo (trunk `/maatly` · portal `/entrar.html`; +535 B comentario de Netlify). Trunk+portal base commiteados por el usuario (`85ace3a`); portal completo en el commit del cierre 13/nov.
- **v0.56** (11–12/nov): Supabase I2a «Cuentas» — login Google opcional, SDK con SRI dinámico, `profiles` con RLS, proyecto real del usuario conectado (RLS probada; authorize → 302 a Google); Pages sirviendo v0.56 (commit `030d158` del usuario). El regreso silencioso quedó resuelto por v0.57 (portal + intercambio manual).
- **v0.53–v0.55** (11/nov): pulir Notificaciones (agentes EN PAUSA por flag, avisos de dinero REALES con dedup, preview) + notificar FUERA en PC + PWA Android (SW/manifest/icono, registro seguro, clic → vista) — planes 61–62, cierre 11/nov con commit + push.
- **v0.52 + I1+1..I1+7** (01–03/nov): i18n global completo por bloques (Ajustes · Dashboard/nav · Histórico · Calendario · Planes · Kanban · barrido final) — dict 84 → **937/937** con verificación por bloque. Cierre 03/nov: respaldo byte-idéntico `respaldo/Maatly_v0.52_cierre3nov.html` + memoria (plan 60).
- **v0.45** (01/nov): card «Te queda» simplificada (plan 52, commit `ddd7988` del usuario).
- **v0.43/v0.44** (01/nov): dependencias fijas + SRI 7/7 + CSP completa al inicio del `<head>` + fix de arranque con demo (plan 50).
- **v0.39→v0.42** (31/oct): moneda canónica (`mFmt`/`mBase`) · cadencia (`estadoMesCore`) · renovación (plan 49; detalle vivo en el roadmap-guardado).

## Pendientes (orden acordado el 13/nov)
1. **Mañana: retoque del SW** — `fetch` passthrough (3 líneas, SIN caché; «solo notificaciones» no cambia) para instalación real como app (WebAPK Android / «Instalar» escritorio) + ritual completo. El push auto-publica en Netlify.
2. **Instalaciones + QA del usuario** desde `https://maatly.netlify.app/maatly`: Android Chrome y Windows Edge → «Instalar aplicación» · portal: crear cuenta email+contraseña · Google mismo email = misma cuenta · añadir contraseña desde «dentro» · recuperación completa · file:// sin puerta.
3. **Usuario dashboard Supabase**: SQL #1 (columnas `rol`/`estado`/`email` + `es_admin()` + policies + trigger `profiles_guarda_rol_estado`) · Email provider ON + desactivar «Confirm email» · Minimum password length 8 · «Automatically link accounts» ON · Redirect URLs: añadir `https://maatly.netlify.app/entrar.html` (conservar la de Pages) · plantilla Reset Password con `{{ .TokenHash }}`.
4. **APK real**: TWA vía PWABuilder/Bubblewrap + `Maatly/.well-known/assetlinks.json` EN el repo (Netlify sirve en raíz — verificación posible sin dominio de pago) + firma keytool.
5. **Supabase I2b backup-JSON** (usar la base montada en I2a) → **I3 calendarios** (Edge Functions: el `client_secret` de Google NUNCA va al HTML) → **I4 datos granulares**. Propuesta en `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md`.
6. **Triage de errores «que no cuadran»**: bloqueante (datos/entrada/excepciones) → ronda en curso; cosmético → cola del QA acumulado.
7. **Deudas i18n** (plan 60): export XLSX ES (11421–11430) · payloads IA (`'desconocido'`, `'Chat'`) · locales `es-VE` / fechas `es` fijos («30 oct · Overdue» en EN) · TDZ `AG_MODELOS_DEFECTO` · `CAL_NIVELES` muerto · `PERFIL_I18N` fuera del dict · revisión EN residual (postergada). (Unidades `'X h'/'X min'` RESUELTAS en v0.53.)
8. QA Android real (checklist plan 62) · rotar la API key de Gemini (el 11/nov invalidó el generador de imágenes del taller) · veredicto del borrado de `AGENTS.md` en el commit «V0.4» del 03/nov (nota de veto arriba) · reflotar los agentes algún día (flag `AGENTES_EN_PAUSA` REFLOTABLE, código intacto).

## Referencias rápidas
- `BITACORA.md` — registro cronológico.
- `.kilo/plans/2026-11-11-supabase-i2a-cuentas.md` — plan 63 (v0.56 · I2a, Result completo incl. verificación contra el proyecto real).
- `.kilo/plans/2026-11-11-notificar-fuera-pwa.md` — plan 62 (v0.54 + v0.55, Result completo + checklist QA Android).
- `.kilo/plans/2026-11-11-notificaciones-pulir.md` — plan 61 (v0.53).
- `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md` — roadmap-guardado (rondas de dinero del usuario + notas Supabase del 03/nov).
- Sondas de verificación: patrón `cdp_*.js` en `Temp\opencode` (Edge headless, puertos 936x–938x; trampas del plan 60 + stub-espía de `Notification` en `cdp_sysnotif.js` + target del SW por `/json` en `cdp_pwa.js` + mock de Supabase en `cdp_i2a.js` (override de `supaConfigurada` + `window.supabase` fake + `skipBrowserRedirect`) y proyecto real en `cdp_i2a_real.js` (RLS con `42501`) + `gen_icono.js` para el PNG + ronda v0.57: `cdp_ronda57.js` (portal con mock y espías password/altas/resets/verifs/updates · P1–P5, 131 asertos) y `cdp_dbg_mala.js` (diagnóstico aislado)).
