# AGENTS.md — Memoria compacta y convenciones de Maatly

Documento de referencia PERMANENTE (instrucciones + estado compacto). El detalle histórico vive en `BITACORA.md` (bajo demanda, grep por `## dd/mm`).
> **Re-creado en el cierre del 03/11/2026.** El commit «V0.4» (03/nov, 19:04, del usuario) había eliminado este archivo sin registro ni decisión documentada. Si el borrado fue deliberado: elimina este archivo y actualiza el plan `2026-11-01-regimen-archivo-unico`.

## Estado actual
- **Trunk único (nombre definitivo desde plan 53; NO renombrar por versión):** `Maatly.html` · `VER_APP = 'v0.56'`.
- **Huella al cierre 12/nov:** MD5 `1D62FD38B28F8213D8B16AE5C21D69D6` · **1.124.073 B** · 13.617 líneas.
- **Último gran trabajo:** Supabase I2a «Cuentas» (v0.56) — login Google **OPCIONAL** (tarjeta «Cuenta y nube» en Ajustes), SDK supabase-js 2.119.0 con SRI cargado dinámicamente SOLO si `SUPA_CFG` está configurada, upsert de perfil en `profiles` con RLS, dict **960/960**. Proyecto REAL del usuario conectado y verificado (RLS probada con rechazo `42501`; `authorize` → 302 a Google). El login real falla en silencio al regresar (diagnóstico en curso). Result completo: plan 63 en `.kilo/plans/`.
- **Idioma:** fuente única `perfilGet().idioma` (`es`/`en`) + helper `idiomaApp()`; dict `I18N {es,en}` **960/960**; la cadena ES del dict es el texto EXISTENTE (cero drift).
- **Datos:** `localStorage` + export/import JSON (`maatlyPerfil`, `maatlyFinanzasCfg`, `maatlyNotif*`/`kanban*`, `maatlyPin`, `maatlyVersionVista`). La sesión de cuenta la maneja supabase-js (`sb-<ref>-auth-token`) — cero claves nuevas. Cero claves nuevas sin decisión del usuario.
- **Hosting:** repo `Shenzu147/Project-Egypt` **PÚBLICO** · **GitHub Pages ACTIVO** — sitio real `https://shenzu147.github.io/Project-Egypt/Maatly/Maatly.html` (verificado en vivo: v0.56 exacta + SW activo). Deploy automático en cada push (~1–3 min); Pages cachea 10 min (`max-age=600`) → Ctrl+F5 para ver la versión nueva.

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
- El regreso de Google lo intercambia el SDK al boot (`detectSessionInUrl` + PKCE verifier en localStorage). **FALLO CONOCIDO**: el intercambio fallido queda en silencio (sin sesión, URL limpia) — v0.56.1 debe hacerlo visible con toast.

## Cambios recientes (detalle: BITACORA → entrada del plan)
- **v0.56** (11–12/nov): Supabase I2a «Cuentas» — login Google opcional, SDK con SRI dinámico, `profiles` con RLS, proyecto real del usuario conectado (RLS probada; authorize → 302 a Google); Pages sirviendo v0.56 (commit `030d158` del usuario). Login real aún sin funcionar (regreso silencioso — diagnóstico + v0.56.1) — plan 63, cierre 12/nov.
- **v0.53–v0.55** (11/nov): pulir Notificaciones (agentes EN PAUSA por flag, avisos de dinero REALES con dedup, preview) + notificar FUERA en PC + PWA Android (SW/manifest/icono, registro seguro, clic → vista) — planes 61–62, cierre 11/nov con commit + push.
- **v0.52 + I1+1..I1+7** (01–03/nov): i18n global completo por bloques (Ajustes · Dashboard/nav · Histórico · Calendario · Planes · Kanban · barrido final) — dict 84 → **937/937** con verificación por bloque. Cierre 03/nov: respaldo byte-idéntico `respaldo/Maatly_v0.52_cierre3nov.html` + memoria (plan 60).
- **v0.45** (01/nov): card «Te queda» simplificada (plan 52, commit `ddd7988` del usuario).
- **v0.43/v0.44** (01/nov): dependencias fijas + SRI 7/7 + CSP completa al inicio del `<head>` + fix de arranque con demo (plan 50).
- **v0.39→v0.42** (31/oct): moneda canónica (`mFmt`/`mBase`) · cadencia (`estadoMesCore`) · renovación (plan 49; detalle vivo en el roadmap-guardado).

## Pendientes (orden acordado el 12/nov)
1. **Login real de Google (QA) + v0.56.1** — intento limpio único (cerrar TODAS las pestañas, un solo clic, esperar el regreso sin tocar nada); si falla: F12 → Console (copiar el `AuthApiError`) + Supabase dashboard → **Logs → Auth** + revisar consent screen **Testing → Test users** (agregar el Gmail del usuario). Luego v0.56.1: toast visible cuando el regreso falla (motivo incluido) — i18n `su.*` nuevas.
2. **Supabase I2b backup-JSON** (usar la base montada en I2a) → **I3 calendarios** (Edge Functions: el `client_secret` de Google NUNCA va al HTML) → **I4 datos granulares**. Propuesta y preguntas abiertas en `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md`.
3. **Deudas i18n** (plan 60): export XLSX ES (11421–11430) · payloads IA (`'desconocido'`, `'Chat'`) · locales `es-VE` / fechas `es` fijos («30 oct · Overdue» en EN) · TDZ `AG_MODELOS_DEFECTO` · `CAL_NIVELES` muerto · `PERFIL_I18N` fuera del dict · revisión EN residual (postergada). (Unidades `'X h'/'X min'` RESUELTAS en v0.53.)
4. QA Android real (checklist plan 62) · QA acumulado de las eras v0.25–.45 · rotar la API key de Gemini (el 11/nov invalidó el generador de imágenes del taller).
5. Sin resolver: veredicto del borrado de `AGENTS.md` en el commit «V0.4» del 03/nov (nota de veto arriba) · reflotar los agentes algún día (flag `AGENTES_EN_PAUSA` REFLOTABLE, código intacto).

## Referencias rápidas
- `BITACORA.md` — registro cronológico.
- `.kilo/plans/2026-11-11-supabase-i2a-cuentas.md` — plan 63 (v0.56 · I2a, Result completo incl. verificación contra el proyecto real).
- `.kilo/plans/2026-11-11-notificar-fuera-pwa.md` — plan 62 (v0.54 + v0.55, Result completo + checklist QA Android).
- `.kilo/plans/2026-11-11-notificaciones-pulir.md` — plan 61 (v0.53).
- `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md` — roadmap-guardado (rondas de dinero del usuario + notas Supabase del 03/nov).
- Sondas de verificación: patrón `cdp_*.js` en `Temp\opencode` (Edge headless, puertos 936x–938x; trampas del plan 60 + stub-espía de `Notification` en `cdp_sysnotif.js` + target del SW por `/json` en `cdp_pwa.js` + mock de Supabase en `cdp_i2a.js` (override de `supaConfigurada` + `window.supabase` fake + `skipBrowserRedirect`) y proyecto real en `cdp_i2a_real.js` (RLS con `42501`) + `gen_icono.js` para el PNG).
