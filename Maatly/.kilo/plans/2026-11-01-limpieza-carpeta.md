# Plan: Limpieza y organización de la carpeta Maatly

**Fecha:** 2026-11-01
**Tema:** limpieza-carpeta (plan 51)
**Decisión del usuario:** borrar TODO `respaldo/` menos `Maatly_v0.42_cierre31oct.html`; dejar v0.42 y v0.43 en la raíz; sí a los commits de seguridad y a la higiene de git.

## Contexto

La carpeta acumula 29 MB: 62 archivos en `respaldo/` (27,1 MB de puntos de rollback v0.21→v0.25 y parches JS ya aplicados al trunk), un duplicado byte-idéntico, y `Maatly.lnk` versionado con rutas absolutas. Todo `respaldo/` ya está commiteado en los commits del 31/10, así que borrar del árbol de trabajo NO pierde el contenido: git queda como único respaldo (regla nueva del proyecto).

## Cambios

1. **Commit de seguridad** — snapshot antes de borrar: `Maatly_v0.44.html`, `AGENTS.md`, `BITACORA.md`, `Maatly.lnk` (modificado), `kilo.json`, `tui.json`, plan `card-te-queda`, plan `csp-correccion` y este plan.
2. **Regla de respaldo en memoria** — nota en BITACORA (plan 51) + actualización de la línea de respaldos en AGENTS.md.
3. **Borrado** — `git rm` de los 61 archivos de `respaldo/` (43 HTML + 18 JS), conservando solo `respaldo/Maatly_v0.42_cierre31oct.html`. La raíz no se toca (v0.42/v0.43/v0.44 se quedan).
4. **Higiene de git** — `.gitignore` nuevo en la raíz (OS, `*.lnk`, artefactos de herramientas) y `git rm --cached Maatly/Maatly.lnk` (sexy solo local). Commits separados para que quede auditable.

## Fuera de alcance

- Sondeo temporal en `Temp\opencode` (opcional, fuera del repo).
- Plan `card-te-queda` (siguiente versión funcional, v0.45).
- Ningún cambio en el HTML del trunk.

## Verificación (Builder)

1. `git log --oneline` muestra los commits de seguridad, limpieza e higiene.
2. `git status` limpio (sin pendientes ni eliminaciones a mitad).
3. `ls Maatly/respaldo` = 1 archivo (`Maatly_v0.42_cierre31oct.html`).
4. `git ls-files` ya no contiene `Maatly.lnk` ni los borrados; el archivo físico `.lnk` sigue existiendo.
5. Recuperación por sondeo: `git show <commit>:<ruta>` devuelve un archivo borrado.
