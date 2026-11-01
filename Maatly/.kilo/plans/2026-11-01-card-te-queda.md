# Plan: Simplificar card "Te queda"

**Fecha:** 2026-11-01
**Tema:** card-te-queda
**Archivo objetivo:** `Maatly_v0.44.html` (nueva versión `Maatly_v0.45.html`, no sobrescribir)
**Principios aplicados:** lógica de dominio separada de la interfaz; cambios documentados en changelog.

## Objetivo

Simplificar la card "Te queda" eliminando dos elementos informativos redundantes:
1. La etiqueta de período (`Q1 · 1-15 nov`).
2. El aviso de renovación (`Te renuevan hoy · 1 nov`).

Mantener: monto "Te queda", porcentaje "Débito del tramo" con su barra de progreso, y "Meta Bs. ... · 100%".

## Justificación (por qué conservar "Débito del tramo")

El "Débito del tramo" es el porcentaje del tramo/quincena ya consumido (gastos realizados vs. disponible del tramo). Se conserva porque:
- Indica el ritmo de consumo del dinero del período.
- Permite detectar sobregasto temprano (si alcanza 100% antes del fin del tramo).
- Sirve para comparar ritmo de gasto entre tramos.
- Alimenta el cierre de mes (sobrante/sobregasto) y las métricas de ahorro.

Eliminarlo quitaría la única señal de ritmo de consumo del período. Solo se eliminan elementos redundantes de presentación.

## Cambios propuestos

1. Localizar el template de la card "Te queda" en el HTML.
2. Eliminar los nodos de texto/badges de la etiqueta de período y del aviso de renovación.
3. Ajustar el layout (clases Tailwind) para que no queden huecos.
4. No tocar la lógica de cálculo del tramo ni del débito; solo presentación.

## Fuera de alcance

- Cambios en fórmulas financieras.
- Cambios en otras cards.
- Migración a Supabase/IndexedDB.

## Verificación (Builder)

1. `node --check` sobre cada bloque `<script>` extraído.
2. Comparación de IDs de elementos vs. `Maatly_v0.44.html` (solo deben desaparecer IDs de los elementos eliminados; el resto idéntico).
3. Prueba visual de la card en distintos estados: inicio de tramo, fin de tramo, renovación.
4. Confirmar que el cálculo del débito del tramo sigue funcionando (sin errores en consola).
