# Plan: Régimen de archivo único + memoria pospuesta a «Finalizar sesion»

**Fecha:** 2026-11-01
**Tema:** regimen-archivo-unico (plan 53)
**Decisión del usuario (01/11):** un solo archivo de trabajo permanente; respaldos solo con la palabra «Respaldo»; memoria (BITACORA + estado de AGENTS) solo con la frase «Finalizar sesion»; sin commits durante la sesión.

## Contexto

El régimen anterior entregaba un HTML nuevo por versión (`Maatly_vX.Y.html`), con `.lnk` que había que re-apuntar cada ronda, y la memoria se escribía al terminar cada tarea. El usuario carga los cambios él mismo a GitHub y pidió simplificar: archivo fijo, git como historial (comiteando al cierre), y la BITACORA como bitácora pura que solo se llena al finalizar la sesión.

## Cambios

1. **Renombrar el trunk una última vez:** `Maatly_v0.45.html` → `Maatly.html` (nombre definitivo; sin cambiar contenido byte). `VER_APP` interno se queda `'v0.45'`.
2. **`Maatly.lnk`** → apuntar a `file:///C:/Users/jdeb1/Project%20Egypt/Maatly/Maatly.html` (no se re-apuntará más; queda local, fuera de git).
3. **`AGENTS.md` — reescritura de las convenciones** (es instrucciones, cambia con reglas del usuario):
   - Estado actual: trunk = `Maatly.html` (huella heredada `6F7A9CD8…`).
   - Convenciones de entrega: archivo único en situ · «Respaldo» = copia byte-idéntica sin commit · prohibido commitear durante la sesión · verificaciones mínimas se mantienen · emojis/UTF-8/CRLF sin cambio.
   - Rol de los MD: AGENTS = instrucciones permanentes (cambia con reglas dictadas); BITACORA = registro de trabajo, PROHIBIDO durante la sesión; la frase exacta **«Finalizar sesion»** ejecuta `/memoria` (entrada del día + Estado/Cambios/Pendientes de AGENTS + commits + resumen de 1–3 líneas).
4. **`opencode.json`** — la descripción y plantilla del comando `/memoria` quedan amarradas al disparador «Finalizar sesion» e incluyen el commit único de cierre.

## Fuera de alcance

- Cualquier edición del contenido de `Maatly.html` (solo renombrar).
- Escribir BITACORA (prohibido: espera al «Finalizar sesion»).
- Commits (prohibidos: espera al «Finalizar sesion»).

## Verificación (Builder)

1. `Maatly.html` existe y `Maatly_v0.45.html` no.
2. MD5 de `Maatly.html` = `6F7A9CD8…` (byte-idéntico al v0.45).
3. Lectura del `.lnk` refleja `Maatly.html`.
4. `git status` muestra el estado pendiente esperado (D v0.45 + ¿¿ `Maatly.html`) — SIN commit.
5. AGENTS.md sin referencias vivas al régimen antiguo de versiones por archivo.
