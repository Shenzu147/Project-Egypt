# Plan: Botón «Ajustar tamaños al contenido» en el modo Personalizar (v0.46)

**Fecha:** 2026-11-01
**Tema:** widget-fit (plan 54)
**Trunk:** `Maatly.html` — editado en situ (plan 53). `VER_APP` → `'v0.46'`.

## Petición (decisiones del usuario)

En el modo **Personalizar** del tablero, un botón que encaja automáticamente los **bordes** (alturas **y** anchos) de cada widget a su contenido, **sin mover posiciones** (nada de `x/y`, ni `compact()`). Caso vacío (p. ej. sin metas de ahorro): tamaño corto que «se ve bien» ≈ 150px. El encogido **se guarda** con el layout, y el botón actúa sobre **ambos tableros** (Inicio + Tendencias).

## Cambios (todos en `Maatly.html`)

1. **HTML (~1369):** botón `#btnAjustarWidgets` junto a `#btnEditGrid` dentro de `#contenedorControlesInicio`. Oculto por defecto; visible solo en edit mode (lo togglea el handler de `btnEditGrid`). Estilo gemelo del botón Personalizar, icono SVG.
2. **Constante (~3642):** `GS_FIT_FLOOR = 9` celdas (≈ 150px): piso estético de contenido compacto/vacío (el piso de datos `data-hmin` 280–340px **deja de ser el piso del ajuste**).
3. **Motor `gsAjustarContenido()`** (junto a `gsAjustarAlturas`, ~3662), para `gsInicio` + `gsHist`:
   - **Altura:** `natural = gsHCells(medidor.scrollHeight + 2)` → `h = clamp(natural, GS_FIT_FLOOR, data-hmax)`. min/max viajan DENTRO de `gs.update(el, {...})` (regla v0.25.16: GridStack@12 re-clampea por node.min/max).
   - **Ancho:** parametrizado por `data-sizes` (anchos válidos del widget, ya existentes en el trunk):
     - Widget **fluido** (contiene `canvas/svg/video/iframe/object`): el ancho solo se **ensancha** un paso si hay desbordamiento horizontal real (`scrollWidth > clientWidth + 4`), hasta el tope de `data-sizes`.
     - Widget **apilable**: se puede **encoger** hacia el ancho mínimo de `data-sizes` si, medido a ese ancho (px = unidad × c − 24, vía `cc.offsetWidth`), el contenido cabe dentro del `data-hmax`; si no cabe, se queda en su ancho actual.
   - **Sin `compact()` y sin tocar `x/y`.** Doble pasada de asentado (refinado de altura tras el settle del ancho, ~120/350ms) + `reResizeGraficas()` de ambas grillas + haptic + toast.
4. **Persistencia (2 fixes):**
   - **Carga (línea ~3739):** `hh = Math.max(GS_FIT_FLOOR, …)` en vez de `Math.max(minH, …)` — un widget guardado corto NO se re-estira al cargar. `data-hmin` sigue valuando la altura inicial y el piso del arrastre manual.
   - **Breakpoint 1 columna (~3848):** el re-clamp de `minH` pasa a `Math.min(gsHCells(dmin), n.h)` para no deshacer un layout corto guardado.
5. **`VER_APP`** `'v0.45'` → `'v0.46'`.

## Fuera de alcance

- BITACORA/AGENTS (prohibidos fuera del «Finalizar sesion») · commits (ídem) · copias de archivo (prohibidas) · CDNs/SRI (no se tocan).

## Verificación mínima

1. `node --check` de los 5 bloques `<script>` + diff de IDs (base: `HEAD:Maatly/Maatly_v0.45.html`, esperado +1 ID: `btnAjustarWidgets`) + SRI 7/7.
2. Sonda real (Edge headless + CDP): arranque 0 excepciones / 0 violaciones CSP; en Personalizar: el botón aparece, al pulsarlo **ningún `x/y` cambia**, un widget forzado alto/corto se re-encierra al contenido, ventas de `h`/`w` dentro de `data-hmax`/`data-sizes`, y el layout ajustado persiste en localStorage tras «Guardar»/recarga.
3. Huella final (MD5 + bytes + líneas) reportada.

---

## Resultado (01/11 — ejecutado y verificado)

**Huella:** `24F2B0852D657757589491521E41D03D` · 907.177 B · 10.825 líneas · `VER_APP = 'v0.46'`.

**Estática:** `node --check` **5/5** · IDs 397→398 (solo +`btnAjustarWidgets`, 0 faltantes) · SRI **7/7** · `GS_FIT_FLOOR` declara antes de `gsLevanta` ✓.

**Real (3 sondas Edge headless + CDP, 0 excepciones / 0 violaciones CSP en todas):**
- **Escritorio:** forzado kDisp h=19 → fit → h=10 al contenido; wPlanes forzado w3 → **w1**; wNotas 18→11; kAhorro/kGasto →9 (piso estético); listas crecen hasta su `data-hmax` (wMovs/wActiv →33). Guardado y recarga: h=10 persiste EXACTO, w=1 carga sin NaN.
- **Móvil (≤767):** `ajustado == base` nodo por nodo (el push del forzado se reabsorbe), techo `data-hmax` neutralizado (wActiv se queda en 89 — regla v0.25.16).
- **Tendencias:** un tap ajustó **11 widgets** (4 hist + 7 Inicio): hGrafica 27→25, hCategorias 29→25, aCategorias w3→w1, hAcumulado w3→w2. Canvas = fluido (ancho intacto).

**Fixes surgidos de las sondas (aplicados):**
1. Desktop: la CSS fija `.gs-medidor height:100%` (≥768) — medía la CAJA. Nuevo `gsMedirContenidoPx()` libera a `auto` para medir contenido y devuelve la regla.
2. Móvil: el clamp al `data-hmax` recortaba contenidos largos — en móvil se neutraliza (piso 4-5, sin techo), igual que `gsAjustarAlturas`.
3. GridStack v12 omite `w` cuando `w===minW` y `h` cuando `h===minH` al salvar — la carga ahora reconstruye el faltante con los pisos estáticos (antes: NaN latente).
4. Fluido afilado: canvas/video/iframe o SVG ≥120px — los iconos SVG de las filas ya no bloquean el encogido de ancho.

## Refinado v0.46b — posición del botón (pedido con captura)

- **Problema:** el contenedor `#contenedorControlesInicio` es un div de bloque y ambos botones son `display:flex` — se apilaban en columna (Ajustar debajo de Guardar) y desalineados de las pestañas.
- **Arreglo:** contenedor en fila (`flex items-center gap-2`) y `#btnAjustarWidgets` REORDENADO a la **izquierda** de `#btnEditGrid` (Personalizar/Guardar). El padre ya centra con `sm:items-center` → alineado con las pestañas Este mes/Tendencias.
- **Sonda POS (Edge headless + CDP 1400×1000):** `mismaFila ✓` (t=101/101) · `ajustarIzq ✓` (Ajustar x1115–1219 < Guardar x1227) · `centradoTabs ✓` (centro y=119 == pestañas y=119) · oculto al arrancar y al guardar ✓ · 0 excepciones / 0 CSP.
- **Huella v0.46b:** `7EA9AC8CAD865AEF60FF8C268EA35157` · 907.204 B · 10.825 líneas.


