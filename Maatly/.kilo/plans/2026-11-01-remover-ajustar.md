# Plan: retirar «Ajustar» del tablero (v0.49)

**Fecha:** 2026-11-01 · **Tema:** remover-ajustar (plan 57) · **Trunk:** `Maatly.html` editado en situ (plan 53). `VER_APP` → `'v0.49'`.

## Petición (decisión del usuario)

«Mejor dejemos el botón de predeterminado y borramos el de ajustar». La fila de controles queda **«Predeterminado · Guardar»**. El motor del fit (`gsAjustarContenido` + `gsMedirContenidoPx`) muere con él: código muerto no se deja.

## Se elimina

1. **HTML:** el botón `#btnAjustarWidgets` completo (con su SVG) y la mención a «Ajustar» del comentario de `#contenedorControlesInicio`.
2. **Const:** `const btnAjustarWidgets = ...`.
3. **Toggle:** la línea `if (btnAjustarWidgets) btnAjustarWidgets.classList.toggle(...)` del handler de `btnEditGrid`.
4. **Handler:** el bloque `if (btnAjustarWidgets) { btnAjustarWidgets.addEventListener(...) }`.
5. **Motor muerto:** `gsMedirContenidoPx()` y `gsAjustarContenido()` (el botón era su único llamador).

## Se CONSERVA (robustez de carga, no del fit)

- `GS_FIT_FLOOR` (comentario actualizado: ahora es el piso mínimo de carga).
- La reconstrucción de `w/h` omitidos por GridStack v12 al salvar (`it.w > 0 ? clamp : sizes[0]`, `hh = it.h > 0 ? Math.max(GS_FIT_FLOOR, …) : minH`) — fix del NaN latente.
- El re-bajo de piso tras init (`nmn.minH = nmn.h` cuando lo guardado quedó corto) y el piso restaurado por breakpoint (`Math.min(gsHCells(+dmin), n.h)`).
- «Predeterminado» v0.48 completo (botón, const, toggle, handler, modal, removeItem × 2 + recarga).
- `title` de «Guardar» («Guarda tu diseño personalizado del panel»).

## Fuera de alcance

- BITACORA/AGENTS · commits · copias de archivo · CDNs/SRI · fichas ⓘ v0.47 · dropdowns K-SEL.

## Verificación mínima

1. `node --check` 5/5 · diff de IDs vs HEAD (esperado: `btnAjustarWidgets` desaparece de «nuevos»; queda solo +`btnResetWidgets`) · 0 referencias residuales a `gsAjustarContenido`/`btnAjustarWidgets`/`gsMedirContenidoPx` · SRI 7/7.
2. Sonda CDP: la fila muestra solo «Predeterminado · Guardar» · ambos ocultos fuera de Personalizar · el flujo de «Predeterminado» intacto (sonda v0.48 re-corrida: toast sin template, modal con cancelar/aceptar, fábrica tras recarga) · «Guardar» persiste el layout (smoke) · 0 excepciones / 0 CSP.
3. Huella final (MD5 + bytes + líneas).

---

## Resultado (01/11 — ejecutado y verificado)

**Huella:** `76F95DA5D7001D6BAB543C8CF4985EC1` · 901.270 B · 10.746 líneas · `VER_APP = 'v0.49'` (el trunk ENCOGE: 911.287→901.270 B al morir el motor del fit).

**Estática:** `node --check` **5/5** · IDs 397→398 (solo +`btnResetWidgets`; `btnAjustarWidgets` eliminado) · **0 referencias residuales** a `gsAjustarContenido`/`gsMedirContenidoPx`/`btnAjustarWidgets` (grep + verificador en cero) · SRI **7/7**.

**Real (sonda Edge headless + CDP 1400×1000, 0 excepciones / 0 violaciones CSP):**
- Vuelve a correr la sonda v0.48 completa sobre v0.49: sin template ⇒ toast sin recarga · con template ⇒ modal, cancelar respeta las claves, aceptar las borra y recarga · tras recarga: fábrica (kDisp x0 y0 w1 h10), «Predeterminado» oculto fuera de Personalizar, «Guardar» sigue creando el template (`iniGuardado: true`).
- La fila de controles queda **«Predeterminado · Guardar»**.

**Se conservó (robustez de carga, no del fit):** `GS_FIT_FLOOR` como piso mínimo de carga · reconstrucción de `w/h` omitidos por GridStack v12 (fix NaN latente) · re-bajo de piso tras init · piso por breakpoint `Math.min(gsHCells(+dmin), n.h)`. Comentarios re-escritura sin mención al botón retirado.

