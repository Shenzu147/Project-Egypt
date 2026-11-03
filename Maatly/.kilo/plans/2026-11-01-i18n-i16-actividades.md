# Plan I1+6: i18n — Actividades / Kanban

**Fecha:** 2026-11-01
**Tema:** i18n-i16-actividades
**Trunk:** `Maatly.html` editado en situ (plan 53) · `VER_APP` se sube a `'v0.53'` al cerrar.
**Bloque previo:** I1+5 (Planes de ahorro) LISTO ✅ — diccionario 499 es=en.

## Alcance

Traducción completa del bloque Actividades/Kanban al inglés (y preparada para más idiomas) por diccionarios estáticos, sin API de traducción en runtime.

### Áreas a cubrir

1. **Board (Kanban):** columnas, tarjetas, chips de estado (Pendiente/En progreso/Hecho), filtro (Todos/Actividades/Vencidas).
2. **Modales de actividad:** crear/editar — campos título, tipo, estado, fecha, hora, monto, categoría, notas.
3. **Toasts:** "Actividad borrada", "Actividad creada", "Actividad actualizada", y los existentes (ej. "4 pausadas…").
4. **Chips de categoría:** reuso de `cal.chip.catSin` para "Sin categoría".
5. **Helper `kbTipoNombre()`:** ya disponible; asegurar que use `tiSi()`/`ti()`.
6. **Integración con Calendario:** toast `cal.act.noEncontrada` ya migrado; verificar el lado Kanban.

### Claves a añadir

Prefijo `kb.` (ya iniciado en I1+2 con ~10 claves). Estimar +40-60 claves nuevas.

## Reglas

- Cadena ES del diccionario = EXACTAMENTE la que ya está en el HTML/JS (cero drift).
- `ti(clave)` para texto, `tiPlantilla(clave, {ph})` para plantillas con valores.
- Atributos `data-i18n` / `data-i18n-ph` / `data-i18n-title` / `data-i18n-aria` en HTML estático.
- Pintores registrados en `I18N_REFRESCOS` con try/catch + warn (sin catch vacío).
- No unificar `PERFIL_I18N` con `I18N` (fuera de alcance).

## Verificación

1. `node --check` 5/5 sobre bloques `<script>`.
2. IDs intactos (escaneo de duplicados 0).
3. Sonda CDP dedicada: boot 0 excepciones/0 CSP · abrir Actividades en es → textos base intactos · cambiar idioma a en (recarga suave) → textos clave en inglés · volver a es → español · recarga → persistencia · captura `probe_v053_actividades_en.png`.
4. Checker de drift vs git HEAD (cero drift).
5. Huella final (MD5 + bytes + líneas) en el Result.

## Fuera de alcance

- I1+7 (barrido final): modalSobregasto, flujos usarAhorro/apartarPozo, nombres de categoría en gráficas, toasts restantes.
- API de traducción en runtime.
- Terceros idiomas.
- Supabase / commits / memoria.
