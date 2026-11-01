# Plan: Seguridad de dependencias CDN en Maatly

**Fecha:** 2026-11-01
**Tema:** cdn-seguridad
**Archivo objetivo:** `Maatly_v0.42.html` (nueva versión `Maatly_v0.43.html`, no sobrescribir)
**Principios aplicados:** seguridad de la interfaz (versión fijada, `integrity`), cero confianza en datos, offline-first.

## Problema

El `<head>` de `Maatly_v0.42.html` carga librerías desde CDNs con versiones no fijadas o `@latest`, y sin atributo `integrity` (SRI). En una app financiera con datos en `localStorage`, esto abre riesgo de supply chain: un CDN comprometido o un cambio de versión silencioso puede inyectar código o romper la app.

Dependencias afectadas (líneas 10, 14-20, 22-24):

| # | Recurso | Versión actual | Riesgo |
|---|---|---|---|
| 1 | Tailwind (play CDN) | sin versión | Cambio silencioso, no apto para producción |
| 2 | GridStack CSS | `@12` (floating) | Cambio menor/patch silencioso |
| 3 | Chart.js | sin versión | Breaking changes silenciosos |
| 4 | chartjs-plugin-datalabels | `2.2.0` (fijada) | OK, falta SRI |
| 5 | SortableJS | `@latest` | **Violación directa** de la regla de versión fijada |
| 6 | GridStack JS | `@12` (floating) | Cambio silencioso |
| 7 | FullCalendar | `6.1.10` (fijada) | OK, falta SRI |
| 8 | SheetJS (xlsx) | `0.18.5` (fijada) | OK, falta SRI |
| 9 | Google Fonts | sin subresource integrity | Fuente externa, menor riesgo |

## Cambios propuestos

### 1. Fijar versiones exactas

- Tailwind: pasar a build estático o fijar play CDN a `https://cdn.tailwindcss.com/3.4.17` (última 3.x estable). Documentar que play CDN no tiene SRI.
- GridStack: fijar a `12.4.1` (o la última 12.x verificada en implementación).
- Chart.js: fijar a `4.4.7` (o última 4.x verificada).
- SortableJS: fijar a `1.15.6`.
- FullCalendar: mantener `6.1.10`.
- chartjs-plugin-datalabels: mantener `2.2.0`.
- xlsx: mantener `0.18.5`.
- Google Fonts: mantener URL actual (las fuentes no exponen SRI útil; se permite por preconnect).

### 2. Añadir SRI (`integrity` + `crossorigin="anonymous"`)

Para cada script/link de jsdelivr y chart.js, calcular `sha384-...` sobre el archivo exacto de la versión fijada y añadir:

```html
<script src="URL" integrity="sha384-..." crossorigin="anonymous"></script>
```

Librerías sin SRI disponible (Tailwind play CDN): documentar excepción y considerar self-hosting o build.

### 3. Content Security Policy (CSP)

Añadir meta CSP restringiendo `script-src` y `style-src` a los dominios usados (`cdn.tailwindcss.com`, `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com`), con `default-src 'self'`. Verificar que no rompa funcionalidad (FullCalendar, GridStack, Chart.js).

### 4. Entrega

- Crear `Maatly_v0.43.html` a partir de `Maatly_v0.42.html`; no sobrescribir la versión anterior.
- No añadir dependencias nuevas.
- No cambiar lógica de negocio.

## Verificación (Builder)

1. `node --check` sobre cada bloque `<script>` extraído.
2. Comparación de IDs de elementos vs `Maatly_v0.42.html` (sin cambios).
3. Prueba manual: carga de la app, gráficos, calendario, drag & drop del tablero, exportación Excel.
4. Confirmar que SRI no bloquea la carga (consola sin errores de integridad).

## Fuera de alcance

- Migración a Supabase / IndexedDB (otro plan).
- Self-hosting de librerías (posible plan futuro si CSP/CDN siguen siendo riesgo).
- Cambios en fórmulas financieras.

## Riesgos residuales

- Tailwind play CDN sin SRI (excepción documentada).
- Google Fonts sin SRI (aceptado).
- Si se cambia de versión en el futuro, hay que recalcular SRI.
