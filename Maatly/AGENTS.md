# AGENTS.md — Memoria compacta y convenciones de Maatly

Documento de referencia PERMANENTE (instrucciones + estado compacto). El detalle histórico vive en `BITACORA.md` (bajo demanda, grep por `## dd/mm`).
> **Re-creado en el cierre del 03/11/2026.** El commit «V0.4» (03/nov, 19:04, del usuario) había eliminado este archivo sin registro ni decisión documentada. Si el borrado fue deliberado: elimina este archivo y actualiza el plan `2026-11-01-regimen-archivo-unico`.

## Estado actual
- **Trunk único (nombre definitivo desde plan 53; NO renombrar por versión):** `Maatly.html` · `VER_APP = 'v0.52'`.
- **Huella al cierre 03/nov:** MD5 `CA193A67E162A13EB7C82DD97DA506BC` · **1.098.897 B** · 13.314 líneas.
- **Último gran trabajo:** i18n GLOBAL completo — dict `I18N {es,en}` **937/937 simétrico**, bloques I1+1..I1+7, sonda CDP 172 asertos en verde, 0 excepciones / 0 CSP. Huellas por bloque y Result completo: `.kilo/plans/2026-11-01-i18n-global.md` (plan 60).
- **Idioma:** fuente única `perfilGet().idioma` (`es`/`en`) + helper `idiomaApp()`; la cadena ES del dict es el texto EXISTENTE (cero drift).
- **Datos:** `localStorage` + export/import JSON (`maatlyPerfil`, `maatlyFinanzasCfg`, `maatlyNotif*`/`kanban*`, `maatlyPin`, `maatlyVersionVista`). Cero claves nuevas sin decisión del usuario.

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

## Cambios recientes (detalle: BITACORA → entrada del plan)
- **v0.52 + I1+1..I1+7** (01–03/nov): i18n global completo por bloques (Ajustes · Dashboard/nav · Histórico · Calendario · Planes · Kanban · barrido final) — dict 84 → **937/937** con verificación por bloque. Cierre 03/nov: respaldo byte-idéntico `respaldo/Maatly_v0.52_cierre3nov.html` + memoria (plan 60).
- **v0.45** (01/nov): card «Te queda» simplificada (plan 52, commit `ddd7988` del usuario).
- **v0.43/v0.44** (01/nov): dependencias fijas + SRI 7/7 + CSP completa al inicio del `<head>` + fix de arranque con demo (plan 50).
- **v0.39→v0.42** (31/oct): moneda canónica (`mFmt`/`mBase`) · cadencia (`estadoMesCore`) · renovación (plan 49; detalle vivo en el roadmap-guardado).

## Pendientes (orden acordado el 03/nov)
1. **Ronda «pulir Notificaciones»** — menú COMPLETO decidido: payloads push i18n/dinámicos (`'Maatly: …'`, `'Prueba de Maatly'`) · disparo REAL de los avisos `nf.cierre/ren.*` (QA cambiando fecha/ventana) · centro coherente con agentes callados (vacío/leídos/historia/badge) · UX de Avisos en Config (toggles PC/Push, `ntfRenDias`, previsualización, canal de prueba) · permiso de notificaciones en contexto de hosting.
2. **Agentes EN PAUSA**: ocultar secciones/notificaciones TG/GLM del centro por flag REFLOTABLE (prohibido borrar código).
3. **Deudas i18n** (plan 60): export XLSX ES (11421–11430) · payloads IA (`'desconocido'`, `'Chat'`) · unidades `' X h'/' X min'` en `proximaC` (12971) · locales `es-VE` / fechas `es` fijos («30 oct · Overdue» en EN) · TDZ `AG_MODELOS_DEFECTO` · `CAL_NIVELES` muerto · `PERFIL_I18N` fuera del dict · revisión EN residual (postergada).
4. **Supabase + SSO Google + sync de calendarios** — propuesta I2a cuentas · I2b backup-JSON · I3 calendarios (Edge Functions: el `client_secret` de Google NUNCA va al HTML) · I4 datos granulares. NOTAS y preguntas abiertas (login opcional/obligatorio, orden I3-I2b, hosting) en `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md`. Al momento: añadir `https://*.supabase.co` a `connect-src` del CSP.
5. QA acumulado de las eras v0.25–.45 (checklists por plan en BITACORA) · rotar la API key de Gemini (deuda vieja).

## Referencias rápidas
- `BITACORA.md` — registro cronológico.
- `.kilo/plans/2026-11-01-i18n-global.md` — plan 60 (era i18n completa).
- `C:\Users\jdeb1\.opencode\plan\maatly-v0.39-roadmap.md` — roadmap-guardado (rondas de dinero del usuario + notas Supabase del 03/nov).
- Sondas de verificación: patrón `cdp_i18n_N.js` en `Temp\opencode` (Edge headless, puertos 936x; trampas documentadas en plan 60: cierres con animación 300 ms, `isInput=true` oculta modalMessage, valor sucio único por pase, cfg sembrada silenciosa).
