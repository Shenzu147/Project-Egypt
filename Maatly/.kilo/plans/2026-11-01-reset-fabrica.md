# Plan: «Predeterminado» — volver al diseño de fábrica del tablero (v0.48)

**Fecha:** 2026-11-01 · **Tema:** reset-fabrica (plan 56) · **Trunk:** `Maatly.html` editado en situ (plan 53). `VER_APP` → `'v0.48'`.

## Petición (decisiones del usuario)

Modelo de dos estados para el tablero: **diseño predeterminado** (de fábrica) ↔ **tu template personalizado** (lo guardado con «Guardar»). Faltaba el camino de regreso:
1. **«Predeterminado»** restaura TODO de fábrica (posiciones + tamaños), descartando el template guardado (con confirmación).
2. **«Ajustar»** se queda como está (v0.46: solo tamaños al contenido, sin mover posiciones).
3. Aplicación por **confirmación + recarga** (borrar las 2 claves guardadas y arrancar limpio — el diseño de fábrica queda fiel al 100%).

## Cambios (todos en `Maatly.html`)

1. **HTML (~1370):** botón `#btnResetWidgets` «Predeterminado» con icono SVG de flecha circular, entre `#btnAjustarWidgets` e `#btnEditGrid` en `#contenedorControlesInicio`. Oculto por defecto (mismo toggle del modo Personalizar).
2. **Const JS:** `btnResetWidgets` al lado de `btnAjustarWidgets`/`btnEditGrid`.
3. **Toggle:** misma línea del handler de `btnEditGrid` que muestra/oculta «Ajustar» ahora también togglea «Predeterminado».
4. **Handler:**
   - Si `gsLayout(LAY_INICIO)` o `gsLayout(LAY_HIST)` tienen contenido → `showModal(...)` de confirmación («Tu arreglo guardado en Inicio y Tendencias se descarta; los widgets vuelven al diseño de fábrica») → al aceptar: `localStorage.removeItem` de ambas claves (try/catch por clave) + `location.reload()`. Cancelar no toca nada.
   - Si no hay nada guardado → toast «¡Ya estás en el diseño base!» y no recarga.
5. **Micro-copy:** `title="Guarda tu diseño personalizado del panel"` en `#btnEditGrid`.
6. **`VER_APP`** `'v0.46'` → `'v0.48'` (salta: la v0.47 se entregó en esta misma working tree y el número oficial se revisa al «Finalizar sesion»; el trunk queda en v0.48).

## Fuera de alcance

- BITACORA/AGENTS (prohibidos fuera del «Finalizar sesion») · commits (ídem) · copias de archivo (prohibidas) · CDNs/SRI (no se tocan) · lógica de fit v0.46 (no se retoca) · texts de fichas v0.47 (no se tocan).

## Verificación mínima

1. `node --check` de los 5 bloques `<script>` + diff de IDs (base: `HEAD:Maatly/Maatly.html`; esperado +1 ID nuevo `btnResetWidgets` sobre la working tree) + SRI 7/7.
2. Sonda real (Edge headless + CDP): Personalizar → «Predeterminado» visible · sin template guardado ⇒ toast y NO recarga · al pulsar con template ⇒ modal de confirmación · cancelar ⇒ claves intactas · aceptar ⇒ claves eliminadas, recarga y layout de fábrica (`maatlyLayout*` ausentes, posiciones/tamaños naturales) · 0 excepciones / 0 CSP.
3. Smoke de regresión del fit (sonda v0.46): «Ajustar» sigue encajando tamaños sin mover `x/y`.
4. Huella final (MD5 + bytes + líneas) reportada.

---

## Resultado (01/11 — ejecutado y verificado)

**Huella:** `840DFA9D0A7B86BD5BCDF1187CE605A1` · 911.287 B · 10.867 líneas · `VER_APP = 'v0.48'` (desde `'v0.47'`, entregado esta misma working tree — la nota del plan decía v0.46→v0.48; el salto real es v0.47→v0.48).

**Estática:** `node --check` **5/5** · IDs 397→399 (`+btnAjustarWidgets` ya del v0.46 y **`+btnResetWidgets`** nuevo; 0 faltantes) · SRI **7/7** · 9/9 anclas.

**Real (sonda Edge headless + CDP 1400×1000, 0 excepciones / 0 violaciones CSP):**
- **SIN template:** «Predeterminado» visible solo en Personalizar · sin modal, sin recarga (token vivo) · toast «¡Ya estás viendo el diseño base del tablero!».
- **Con template:** al Guardar nacen las claves · el botón abre «¿Volver al diseño base?» · **cancelar** deja las claves intactas.
- **Aceptar:** las 2 claves (`maatlyLayoutInicio` + `maatlyLayoutHistorico`) quedan fuera y **realmente recarga** (el token del contexto muere).
- **Post-recarga:** ver v0.48 · claves ausentes · «Predeterminado»/«Ajustar» ocultos fuera de Personalizar · kDisp en fábrica (x0 y0 w1 h10).
- **Regresión del fit (smoke v0.46 sobre v0.48):** kDisp forzado 19→10, wPlanes forzado w3→w1/h26, listas a su `data-hmax` (33), `x/y` solo absorben por el motor · persistencia EXACTA tras recarga («Ajustar» intacto por los nuevos toques).

**Copy UI:** fila de Personalizar queda `Ajustar (índigo) · Predeterminado (outline, icono arrow-path) · Guardar (title="Guarda tu diseño personalizado del panel")`.

