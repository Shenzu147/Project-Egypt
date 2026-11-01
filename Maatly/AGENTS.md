<!-- Maatly Agent Routing Rules -->
# Maatly — Reglas de enrutamiento y contexto

## Enrutamiento

- Prompt que empieza con `/architect` o que pide un plan, mapa, blueprint o arquitectura → **Maatly Architect**.
- Prompt que empieza con `/builder` o que pide escribir, implementar o refactorizar código → **Maatly Builder**.
- Prompt que empieza con `/fixer` o que pega un error, stack trace, prueba rota o fallo de sintaxis → **Maatly Fixer**.
- Si una petición no encaja en ninguno, preguntar antes de elegir.

## Estado actual (01/11/2026)

- **Maatly** es una app personal de finanzas en español: ingresos y gastos, planes de ahorro, cierres de mes, sobregasto, calendario, tablero de actividades y asistente IA.
- **Trunk:** `Maatly.html` (ex `Maatly_v0.45.html`, renombrado 01/11) — 895.497 B / 10.692 líneas, MD5 `6F7A9CD8…`, `VER_APP = 'v0.45'`. **Nombre fijo**: las próximas entregas editan ESTE archivo en situ; no hay copias por versión.
- **Raíz:** solo el trunk. Las versiones previas viven en commits de git (v0.44 es el padre) y en `respaldo/` (cierre de la era v0.42 + v0.43).
- **Forma:** un archivo HTML único con CSS y JavaScript en línea; los datos viven en `localStorage`. Sin build ni dependencias locales.
- **Repo:** git en `C:\Users\jdeb1\Project Egypt` (raíz); el proyecto vive en `Maatly/`. **Git es el respaldo** (regla del plan 51): nunca reescribir la historia. Los commits se hacen SOLO al «Finalizar sesion» (ver plan 53).
- **Destino:** Supabase (PostgreSQL + Auth con Google), cuentas individuales que empiezan vacías, y modo sin conexión con IndexedDB y cola de sincronización.
- **Planes:** `.kilo/plans/AAAA-MM-DD-tema.md`. Sin plan no hay código (`require_plan_for_code: true`).
- **Memoria (regla del usuario 01/11, plan 53):** `AGENTS.md` = **instrucciones permanentes** (enrutamiento, reglas, convenciones; cambia solo cuando el usuario dicta una regla). `BITACORA.md` = **registro de lo hecho**; PROHIBIDO escribir memoria durante la sesión. La frase exacta **«Finalizar sesion»** ejecuta el ritual del comando `/memoria` (`opencode.json`): entrada del día en BITACORA + Estado/Cambios/Pendientes de este archivo + **commit único** de todo lo pendiente + resumen de cierre en 1–3 líneas. Este archivo se mantiene compacto (< ~150 líneas).

## Cambios recientes

- **01/11 · v0.45** — card «Te queda» simplificada: fuera las píldoras de tramo y de renovación; quedan monto, `~Bs.`, Débito del tramo y Meta. Ficha ⓘ reescrita. Plan 52.
- **01/11 · v0.44** — CSP corregida (va al inicio del `<head>`; `frame-src`, `connect-src` y `font-src` completos), `VER_APP` v0.44, fix del arranque en perfil limpio (la demo se sembraba antes de `MONEDAS`) y `.lnk` re-apuntado. Plan 50.
- **31/10 · v0.43** — versiones CDN fijadas + SRI `sha384` (7/7 verificados) + primera CSP. Plan `2026-11-01-cdn-seguridad`.
- **31/10 · v0.42** — cadencia Mensual/Quincenal/Semanal, renovación con día exacto y aviso N días antes, fix de `finanzasCfgSet`. Plan 49.

## Pendientes

- **QA acumulado era v0.39→v0.45**: checklists en BITACORA (planes 49, 50 y 52), incluida la prueba manual de CSP, adjuntos PDF, calendario, agente y notificaciones.
- **Deudas:** rotar la API key de Gemini · talón 2 (accessors raw e `historialUltimate`) · talón 3 (8 CDNs: sin red la app muere) · piloto Supabase (schema v1 con `ingresos_hist`, retiros con `modo`, `kanbanEstados` con `esCierre`, preferencias JSONB + Google OAuth + Import como puente).

## Principios de arquitectura (no negociables)

1. **Cero confianza en el acceso a datos.** Toda tabla lleva `user_id` y tiene RLS activo. El cliente solo usa la clave pública. La clave `service_role` nunca entra al código ni al navegador.
2. **Aislamiento por usuario.** Ningún dato de un usuario es visible para otro, salvo que exista una función de compartir aprobada en un plan.
3. **Registros inmutables para el dinero.** Movimientos, aportes, retiros y apartados son filas nuevas con UUID. Los saldos (como `montoActual` de un plan o el sobrante de un mes) se derivan de esos registros; no se guardan como valores mutables.
4. **IDs generados en el cliente (UUID).** Nunca IDs secuenciales ni basados en la fecha.
5. **Offline-first.** Escritura local primero (IndexedDB), luego cola de salida, luego sincronización. La interfaz nunca escribe directo en Supabase: toda escritura pasa por la capa de datos.
6. **Esquema versionado.** Los cambios de tablas se hacen con migraciones numeradas. Nada de cambios manuales en la base.
7. **Lógica de dominio separada de la interfaz.** Cierres, sobregasto, saldos y ahorro viven en funciones puras, sin acceso al DOM, y deben tener pruebas.

## Reglas de dominio financiero

- Los montos se almacenan y calculan en centavos enteros. El formato (`$1.234,56`) solo se aplica en pantalla.
- Las fechas de negocio usan la fecha local (`YYYY-MM-DD` en hora de Caracas o del usuario). Prohibido usar `toISOString().slice(0, 10)` para "hoy".
- Un mes sin actividad no genera sobrante.
- Un gasto planificado y un gasto real no se suman: se toma el mayor.
- Los aportes con fuente "otra" cuentan como ingreso del mes y como ahorro.
- Los apartados al pozo salen del dinero libre del mes.
- Cualquier cambio en una fórmula debe documentarse en el changelog de la versión.

## Reglas de seguridad de la interfaz

- Todo dato del usuario que entre a HTML pasa por escape, o se renderiza con `textContent`.
- Prohibido guardar claves o tokens en texto plano en el cliente.
- Librerías externas: versión fijada (nunca `@latest`) y atributo `integrity` cuando el CDN lo permita.
- La CSP va **antes** de cualquier recurso en el `<head>`; si va después, no gobierna lo ya cargado.
- Prohibido `catch` vacío. Los errores se registran y, si afectan datos, se muestran al usuario.
- Sin dependencias nuevas sin un plan aprobado.

## Convenciones de entrega (regla del usuario 01/11, plan 53)

- **Archivo único:** se trabaja SIEMPRE sobre `Maatly.html`, editándolo en situ. PROHIBIDO crear copias por versión para una entrega. La numeración vive en `VER_APP` (la sube cada entrega funcional: toast/Ajustes/XLSX) y el historial vive en git.
- **«Respaldo»** (palabra exacta del usuario): genera copia byte-idéntica en `respaldo/Maatly_<VER>_<AAAAMMDD-HHmm>.html`. Solo disco: sin commit inmediato.
- **Git al cierre:** PROHIBIDO commitear durante la sesión. Con «Finalizar sesion» se commitea todo: `Maatly.html` + memoria + planes + respaldos pendientes. Nunca reescribir la historia de git.
- Verificación mínima antes de dar un cambio por terminado: `node --check` de cada bloque `<script>` en línea · comparación de IDs contra el estado previo · SRI recalculado si se tocan CDNs · sonda real (Edge headless + CDP) cuando el cambio afecte arranque o CSP.
- Los archivos locales de la máquina (`.lnk` del lanzador) no van a git: ignorados vía `.gitignore`. El `.lnk` apunta a `Maatly.html` — nombre fijo, no se re-apunta más.
- Emojis: solo se conserva el botón 😊 de Notas; el resto usa SVG o tokens del tema.
- Los archivos usan UTF-8 y CRLF (git lo normaliza).

## Maatly Architect

Responsabilidad: blueprint estructural y verificación de cumplimiento.

GUARDRAILS:
- NO escribir, modificar ni mostrar código fuente de implementación. Sí se pueden describir esquemas (tablas, columnas, relaciones, políticas de acceso) en prosa o en tablas.
- Toda tarea empieza con un plan en `.kilo/plans/`, con nombre `AAAA-MM-DD-tema.md`. Sin plan no hay ejecución.
- Validar cada cambio propuesto contra los principios de arquitectura de este archivo.
- Bloquear cualquier petición que salte la fase de plan o pida código directo.
- Si se detecta una violación de seguridad o de patrón, detener el trabajo y señalar la violación específica.

## Maatly Builder

Responsabilidad: generación de código y ejecución.

GUARDRAILS:
- PROHIBIDO escribir código sin que exista un plan en `.kilo/plans/` y que ese plan haya sido leído.
- Editar SIEMPRE sobre `Maatly.html` (en situ; sin copias por versión, plan 53). Verificar el trunk después de cada cambio; si queda roto, no seguir escribiendo sobre él.
- Ejecutar verificaciones locales cada 3 archivos modificados:
  - `node --check` sobre cada bloque `<script>` extraído;
  - comparación de IDs de elementos contra la versión anterior;
  - pruebas de las fórmulas financieras, cuando existan.
- Si una verificación falla, pasar el contexto a **Maatly Fixer**. No escribir más código sobre una versión rota.
- Entregar archivos y scripts completos. Prohibidos los fragmentos y los marcadores de posición.

## Maatly Fixer

Responsabilidad: aislar el radio del error y corregirlo.

GUARDRAILS:
- Solo actúa cuando llega al contexto un error, stack trace, fallo de prueba o error de sintaxis.
- Antes de editar, identificar qué cambió y causó la falla: comparar la versión que falla con la anterior. Cuando el proyecto tenga repositorio git, usar `git status` y `git diff`.
- Radio de modificación limitado: solo tocar archivos ligados al trazo del error. Si el arreglo exige un cambio estructural, abortar y devolver el caso a **Maatly Architect**.
- No repetir la misma corrección dos veces. Si la prueba falla después de un ajuste, revertirlo y probar otra hipótesis.
- Cerrar cada corrección con un resumen: causa, archivo, cambio y verificación.
