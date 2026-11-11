# Plan 61: Pulir Notificaciones (v0.53) — flag AGENTES_EN_PAUSA · payloads i18n · previsualización · disparo real

**Fecha:** 2026-11-11 · **Tema:** notificaciones-pulir · **Trunk:** `Maatly.html` editado in situ (plan 53) · `VER_APP` → `'v0.53'`.

## Petición (decisiones del usuario 11/11)

Ronda elegida del mapa de pendientes: **«Pulir Notificaciones»** (menú completo decidido el 03/nov). Alcance del flag decidido hoy: **«También panel Ajustes»** — ocultar los sub-bloques GLM/TG de la sección Asistente IA dejando visible SOLO el bloque de PIN (el PIN vive DENTRO de esa sección — no romper).

## Alcance

### N1 · Flag `AGENTES_EN_PAUSA` (código intacto y reflotable)
- `const AGENTES_EN_PAUSA = true` junto a `VER_APP` — reflotable a `false`; cero claves de storage nuevas.
- **Centro:** `agTickNotif` salta la rama del coach diario (no se generan items 'coaching'); filtro del tipo 'coaching' (histórico incluido) en `notifListaUnificada` en un solo punto. El aviso vivo **«Agenda de hoy»** (tipo `agenda`) **se queda**.
- **Sidebar:** `#sidebarAiStatus` («Agente Maatly · Conectado») oculto en boot con el flag.
- **Ajustes:** `agRenderPanel` con rama de flag → sección Asistente IA muestra **solo el bloque de PIN**; sub-bloques GLM/TG (modelos, claves, guías, conexión, chat) ocultos. `agWirePanel` es null-safe (re-uso).
- Los canales de push del panel de Notificaciones (ntfy/TG token) **NO se tocan** (infraestructura de avisos).

### N2 · Textos/payloads residuales
- Prueba de canal (~12344): literales `'Prueba de Maatly'`/`'Si lees esto…'` → claves nuevas `nf.canal.probeTit`/`nf.canal.probeBody` (ES = texto exacto, EN espejo).
- Unidades `' X h'/' X min'` (~12971) → `tiPlantilla` con claves `nt.unidadH`/`nt.unidadM` (ES produce lo mismo).
- Verificar que los demás call sites de push ya van con `ti()` (8/9 confirmados el 11/nov).

### N3 · Previsualización de avisos
- Tarjeta «Así llegará el aviso» en `ntfRenderPanel`, junto al botón «Probar un aviso de dinero», mismo estilo del centro (vía `notifItemHTML`), textos reales de ejemplo. El bloque de permiso ya existe — solo se verifica.

### N4 · Verificación + cierre
- Ritual: `node --check` 5/5 · `verify_i18n.js` · checker de IDs + checker de drift · **sonda CDP `cdp_notif.js` con Date-fake** (día 27 → aviso de cierre real; cfg «día exacto 13» al 11 → renovación real con dedup; flag ON → coach ausente + panel reducido + sidebar oculta; payload i18n en la prueba de canal; estados del centro: vacío/badge/leídos) · 0 excepciones / 0 CSP.
- `VER_APP` → `'v0.53'` (toast natural de versión) + huella (MD5 + bytes + líneas) en el Result.

## Prohibiciones del régimen
Sin commits ni memoria durante la sesión (solo con «Finalizar sesion»); sin copias por versión; solo herramientas write/edit; español.

## Result (11/11/2026) — ✅ RONDA COMPLETA (v0.53)

- **Huella final:** MD5 `A9A785E7DFFB622EDC044050D4815168` · **1.102.038 B** · **13.347 líneas (node)** · `VER_APP='v0.53'`. Diff vs v0.52: +3.141 B / +33 líneas.
- **N1 · Flag `AGENTES_EN_PAUSA` (6 edits):** const junto a `VER_APP` (reflotable a `false`, cero claves de storage) · `actualizarEstadoConexionAI` oculta `#sidebarAiStatus` en boot · rama coach de `agTickNotif` con guard `!AGENTES_EN_PAUSA` (el item vivo «Agenda de hoy» tipo `agenda` sigue vivo — verificado) · filtro `tp!=='coaching'` en `notifListaUnificada` (vivos + históricos, un solo punto) · `agRenderPanel` con rama flag → sub-bloques GLM/TG ocultos y SOLO bloque PIN (wrapper con clase condicional, sin `border-t` huérfano; `agWirePanel` null-safe re-usado). Canales de push del panel ntf (ntfy/TG) intactos.
- **N2 · Dict 937 → 943/943 simétrico (6 claves nuevas):** `nf.canal.probeTit`/`probeBody` (ES = el literal que reemplazaron, EXACTO) · `nf.prevAviso.tit`/`d` (texto nuevo de UI) · `nt.unidadH`/`nt.unidadM` (`'{a} h'`/`'{a} min'` — ES produce lo mismo que antes). Call sites: prueba de canal (`ntfWirePanel`) ahora `agEnviarPush(ti('nf.canal.probeTit'), ti('nf.canal.probeBody'))` — el único literal de push que quedaba; unidades del centro en `tiPlantilla` (12971). Grep final: literales solo en dict (5371/5372).
- **N3 · Previsualización:** tarjeta «Así llegará el aviso» en `ntfRenderPanel` junto a «Probar un aviso de dinero» — usa el MISMO pintor del centro (`notifItemHTML`, ejemplo tipo `ahorro` con `nf.prueba.*` y `ntfFmt(80)`), wrapper `#ntfPrevAviso` con `pointer-events-none` (el clic de items del centro está acotado a `#notifLista`; doble seguridad). Se repinta al cambiar de idioma (pintor ya registrado en `i18nRefrescar`).
- **Verificación del ritual:**
  - `node --check` **5/5 bloques** · `verify_i18n.js` **TODO OK** (291 `data-i18n` / 610 claves `ti()` · huérfanas 0 · SRI 7/7 · `VER_APP='v0.53'` · sin mojibake) · `check_keys_i17.js` **943/943 SIMÉTRICAS** · IDs **110/110** (414 `id=` — +1 `ntfPrevAviso`).
  - **Drift vs HEAD (`554d024`, v0.52):** 939 EXACTAS + 0 por fragmentos; revisión manual **4** = 2 claves nuevas `nf.prevAviso.*` (texto nuevo de UI, sin origen en HEAD — legítimas) + 2 solo-placeholders `nt.unidad*`. **`nf.canal.probeTit/probeBody` ni siquiera aparecen en revisión: su ES ya existía como literal en HEAD → cero drift real.** `verify_i18n.js` actualizado a v0.53 (aserto de versión, herramienta en Temp).
  - **Sonda `cdp_notif.js`** (9370/9371 · Edge headless · **Date-fake congelado** vía `Page.addScriptToEvaluateOnNewDocument`, re-registrado por fase): **43 asertos TODO OK — 0 excepciones / 0 CSP / 0 errores de consola**.
    - **F1 (flag/centro/preview/payload):** toast de versión v0.53 · flag `=== true` · sidebar oculta · `agTickNotif` sin excepción y log sin `_agenda` (rama coach saltada) · centro sin `coaching` (vivo ni histórico sembrado) · «Agenda de hoy» presente · vencida viva · unidades i18n «3 h» sin NaN · unread 4/4 · badge coincide (4) · «leer todas» → badge oculto · panel agente = solo PIN (sin `agfield/agregar/sel`, con PIN/crear) · `agResumenCoachTexto` intacto (reflotable) · preview con ejemplo + «ahora mismo» · payload ES exacto con spy sobre `agEnviarPush` + toast «Enviado — revisa tu móvil» · EN sin recarga: sidebar oculta, panel reducido, «Money alert test», payload «Test from Maatly» + toast «Sent — check your phone».
    - **F2 (cierre REAL, fake 27/11, cieDiaMes 25 + ciePc):** 1 item tipo `cierre` — «Cierre de mes cerca · Quedan 4 día(s) para terminar Noviembre de 2026…» · log `_ci_2026-11-27` = 1 · 2.ª llamada NO duplica · centro sin coaching.
    - **F3 (renovación REAL, fake 11/11 + `maatlyFinanzasCfg {renovacion:{modo:'dia',dia:13}}` + renDias 2):** 1 item tipo `ahorro` — «Renovación de saldo · En 2 días te renuevan (13 nov…)» · log `_ren_2026-11-13` = 1 · dedup OK.
  - **Capturas revisadas:** `probe_v053_notif_panel_es.png` (panel con canales intactos + fila «Maatly v0.53») · `probe_v053_notif_centro_cierre.png` (centro con el cierre REAL no leído; sidebar sin bloque del agente) · `probe_v053_notif_agente_pin.png` (Asistente IA = SOLO PIN).
- **Notas conscientes:** (1) la descripción estática de la sección Asistente IA sigue mencionando «Clave y modelo del asistente…» (texto `data-i18n` existente que termina en «El chat está en pausa por ahora») — se deja tal cual para no añadir drift; (2) la sonda falló 3 asertos por cuestiones mías, no del producto (regex con `$` — la unidad va dentro de «(faltan {c}).» en `nt.proximaC`; `'ahora mismo'`/'just now' en minúscula; toast de versión chequeado tras expirar + un aserto duplicado retirado) — el producto no se tocó por esos fallos.
- **Régimen:** sin commits ni memoria durante la sesión — pendiente de «Finalizar sesion».
