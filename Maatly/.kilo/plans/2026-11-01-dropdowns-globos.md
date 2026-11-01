# Plan: Dropdowns de Ajustes → K-SEL + fichas ⓘ en párrafos (v0.47)

**Fecha:** 2026-11-01 · **Tema:** dropdowns-globos (plan 55) · **Trunk:** `Maatly.html` editado en situ (plan 53). `VER_APP` → `'v0.47'`.

## Petición (decisiones del usuario)

1. Adaptar los dropdowns nuevos de **Configuración** a la UI (sistema temático K-SEL que ya existe).
2. **Fichas ⓘ:** párrafos simples (2-4 por ficha), **sin referencias de versión** («v0.42:», «v0.45:» fuera) y **solo las 12 fichas `WIDGET_INFO`** (los demás textos de ayuda quedan intactos).

## Cambios (todos en `Maatly.html`)

**A) Dropdowns (~1883-1929):**
1. A `selCadencia`, `selRenovaModo`, `selMonedaApp` y `selLocalRef`: añadir `sel-maatly cursor-pointer` (la fachada K-SEL v0.25.44 los engancha sola por delegación) y unificar clases al estándar del trunk: `rounded-xl` · `text-sm font-bold` (`text-xs` en selLocalRef, comparte fila con input pequeño) · `px-3 py-2` · `bg-slate-50 dark:bg-slate-900` · `border-slate-300 dark:border-slate-600` · `focus:border-indigo-500`. Anchos razonables se conservan.
2. Tras repoblado programático (lista de monedas / cadencia / tasa): repintar el trigger con `window.ddPintar(sel)` (API v0.25.44 ya existente) en `monedaPintar` y donde se asigna `.value` al	arrancar.

**B) Fichas ⓘ:**
1. `<p id="iwTexto">` → `<div id="iwTexto" class="space-y-2">` en `#modalInfoWidget`.
2. `abrirInfoWidget`: dividir cada `w.d` en `\n\n` y crear **un `<p>` por bloque** con `createElement` + `textContent` (sin innerHTML — regla de seguridad).
3. Los 12 textos de `WIDGET_INFO` reescritos en 2-4 párrafos cortos (qué ves → cómo se calcula → ojo con…), conservando cada dato operativo y sin menciones de versión interna.
4. `VER_APP` `'v0.46'` → `'v0.47'`.

## Fuera de alcance

- BITACORA/AGENTS (prohibidos fuera del «Finalizar sesion») · commits (ídem) · copias de archivo (prohibidas) · CDNs/SRI (no se tocan) · textos de ayuda de Ajustes (decisión del usuario: solo las fichas ⓘ).

## Verificación mínima

1. `node --check` de los 5 bloques `<script>` + diff de IDs (base: `HEAD:Maatly/Maatly.html`, sin IDs nuevos esperados) + SRI 7/7.
2. Sonda real (Edge headless + CDP): Ajustes abre → los 4 selects son triggers temáticos `sel-maatly`, el popup abre y al elegir opción se actualizan `cadPreviewTxt`/`monedaPreview` (onchange intacto); ficha ⓘ renderiza varios párrafos; 0 excepciones / 0 violaciones CSP.
3. Huella final (MD5 + bytes + líneas) reportada.

---

## Resultado (01/11 — ejecutado y verificado)

**Huella:** `DCF4FFDD8EFD3D24426F1E865EE1547D` · 908.349 B · 10.840 líneas · `VER_APP = 'v0.47'`.

**Estática:** `node --check` **5/5** · IDs intactos frente a HEAD (solo +`btnAjustarWidgets` ya del v0.46; 0 faltantes) · SRI **7/7** · las 4 select lines con `sel-maatly cursor-pointer … rounded-xl` (0 `rounded-lg` en ellas) · **0 referencias de versión dentro de `WIDGET_INFO`**.

**Real (sonda Edge headless + CDP 1400×1000, **0 excepciones / 0 violaciones CSP**):**
- **Fichas ⓘ:** `abrirInfoWidget('kDisp')` → `#iwTexto` es `div.space-y-2` con **4 `<p>`** (`createElement + textContent`), sin ninguna mención `v0.x`.
- **Ajustes:** los 4 selects (`selCadencia`, `selRenovaModo`, `selMonedaApp`, `selLocalRef`) quedan con la fachada K-SEL: `sel-maatly` ✓, select real oculto (`dd-oculto`) ✓, trigger montado ✓, labels coherentes («Quincenal», «Renovación auto», «Dólar (EE. UU.) · $», «Bolívar venezolano · Bs.») ✓.
- **Interacción:** popup de cadencia con 3 ítems; al elegir «Quincenal» → `value='quincenal'`, trigger repintado y `cadPreviewTxt` actualizado con la renovación (onchange intacto).
- **Repintado programático:** `monedaPintar`/`cadenciaPintar`/`pintarLocalRef` llaman `window.ddPintar(...)` tras el `innerHTML` + `.value` — label siempre en sync.

