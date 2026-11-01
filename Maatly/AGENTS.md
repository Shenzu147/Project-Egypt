<!-- Maatly Agent Routing Rules -->
# Maatly — Reglas de enrutamiento de agentes

## Enrutamiento

- Prompt que empieza con `/architect` o que pide un plan, mapa, blueprint o arquitectura → **Maatly Architect**.
- Prompt que empieza con `/builder` o que pide escribir, implementar o refactorizar código → **Maatly Builder**.
- Prompt que empieza con `/fixer` o que pega un error, stack trace, prueba rota o fallo de sintaxis → **Maatly Fixer**.
- Si una petición no encaja en ninguno, preguntar antes de elegir.

## Contexto del proyecto (leer antes de cualquier tarea)

- **Maatly** es una app personal de finanzas en español: ingresos y gastos, planes de ahorro, cierres de mes, sobregasto, calendario, tablero de actividades y asistente IA.
- **Estado actual:** un archivo HTML único (`Maatly_vX.Y.html`) con CSS y JavaScript en línea. Los datos viven en `localStorage`.
- **Destino:** Supabase (PostgreSQL + Auth con Google), cuentas individuales que empiezan vacías, y modo sin conexión con IndexedDB y cola de sincronización.
- Cada cambio entregado es una versión nueva (`vX.Y+1`). Nunca se sobrescribe una versión anterior.

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
- Prohibido `catch` vacío. Los errores se registran y, si afectan datos, se muestran al usuario.
- Sin dependencias nuevas sin un plan aprobado.

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
- Escribir primero en un archivo de trabajo (`Maatly_vX.Y.html` nuevo) o en una rama. Nunca sobrescribir la versión entregada sin verificación previa.
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
