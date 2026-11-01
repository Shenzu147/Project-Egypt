'use strict';
/* =====================================================================
   v025_ops.js — builders y tablas de operaciones de la rueda v0.25
   «Historial modal» (Maatly v0.24.11 -> v0.25). Motor: v025_main.js.
   - BUILD: [start,fin] (1-based, INCLUSIVE) -> reemplazo por líneas nuevas
   - KILL : rangos que se eliminan
   - TXT  : transformación textual de UNA línea conservada (por índice)
   - INSERTS: bloque insertado ANTES de la línea n
   Las líneas conservadas que reutilizan builders van por referencia
   L(n) — NUNCA se copian a mano (lección v0.24.11).
   ===================================================================== */
const A = require('./v025_NEWHIST_A.js');
const B = require('./v025_NEWHIST_B.js');
const C = require('./v025_NEWHIST_C.js');
const D = require('./v025_NEWHIST_D.js');
const NH = require('./v025_NEWHTML.js');

/* ------------------------------------------------------------------ */
/* BUILDERS                                                            */
/* ------------------------------------------------------------------ */

/* b16: SINGLE line 2119  'const h = getHist();'
   El reporte se alimenta del archivo (kpis de meses cerrados) + los meses
   con plan guardado (dormidos) que aún NO tienen archivo. gastos:[] ->
   la barra de Gastos y el pie de categorías quedan «Sin Datos» (aceptado). */
function b16() {
	return [
"            const h = (() => {  /* v0.25: archivo de meses cerrados (kpis) + meses con plan guardado (dormidos) sin cierre */",
"                const arch = getArchivoMensual();",
"                const sellos = {};",
"                arch.forEach((a) => { sellos[String(a.mes || '').slice(0, 7)] = true; });",
"                return arch.map((a) => {",
"                    const k = a.kpis || {};",
"                    return { fechaStr: String(a.mes || '').slice(0, 7), periodo: 'Mensual', ingreso: Number(k.ingreso) || 0, ahorro: Number(k.ahorro) || 0, sobrante: Number(k.sobrante) || 0, gastos: [] };",
"                }).concat(getHist().filter((r) => r.fechaStr && !sellos[String(r.fechaStr).slice(0, 7)]));",
"            })();"
];
}

/* b25: span 2449..2454 (syncTasa) — swap de L2452: fuera actualizarCalculos */
function b25(L) {
	return [ L(2449), L(2450), L(2451),
"            if (typeof actualizarKPIs === 'function') actualizarKPIs(); /* v0.25: sin plan; los KPIs reales cambian con la tasa */",
		L(2453), L(2454) ];
}

/* b28: span 2482..2554 — nuevo actualizarKPIs 100% real (mismo nombre) */
function b28() {
	return [
"        function actualizarKPIs() { /* v0.25: 100% real — movimientos en vivo + aportes del mes (fuera el plan) */",
"            const hoy = new Date();",
"            const mesActualStr = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');",
"            const movsMes = movimientosDelMes(hoy.getFullYear(), hoy.getMonth());",
"            const gastoRealMes = movsMes.filter((m) => m.tipo !== 'ingreso').reduce((s, m) => s + (Number(m.monto) || 0), 0);",
"            const ingresoRealMes = movsMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + (Number(m.monto) || 0), 0);",
"            const restanteMes = ingresoRealMes - gastoRealMes;",
"            const ahorroMes = getAportesAhorro().filter((a) => String(a.fecha || '').slice(0, 7) === mesActualStr).reduce((s, a) => s + (Number(a.monto) || 0), 0);",
"            const fmtUSD = (n) => (n < 0 ? '-$' : '$') + Math.abs(n || 0).toLocaleString();",
"            const kpiAhorro = document.getElementById('kpiAhorroTotal');",
"            if (kpiAhorro) animarValorKpi(kpiAhorro, ahorroMes, fmtUSD);",
"            const kpiGasto = document.getElementById('kpiGastoPromedio');",
"            if (kpiGasto) animarValorKpi(kpiGasto, gastoRealMes, fmtUSD);",
"            const kpiRest = document.getElementById('lblRestanteInicio');",
"            if (kpiRest) {",
"                animarValorKpi(kpiRest, restanteMes, fmtUSD);",
"                kpiRest.className = (restanteMes < 0 ? 'text-3xl font-extrabold c-alarma' : 'text-3xl font-extrabold c-positivo') + ' kpi-num';",
"            }",
"            const bsRest = document.querySelector('[data-vinculo=\"restanteKpi\"]');",
"            if (bsRest) bsRest.textContent = formatBs(restanteMes);",
"            const mesNombre = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });",
"            const lblMes = document.getElementById('lblKpiMesNombre');",
"            if (lblMes) lblMes.textContent = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);",
"        }"
];
}

/* b33: span 3212..3213 [L3212 = mvCatCerrarForm(); | L3213 = const mvFecha...] */
function b33(L) {
	return [ L(3212), "            mvAdjReset();", L(3213) ];
}

/* b34: span 3225..3226 [L3225 = const mvCatVal...] + guardar con adjuntos */
function b34(L) {
	return [ L(3225),
"            agregarMovimiento({ fecha: mvFechaVal, desc: desc, monto: monto, tipo: mvTipoSel, cat: mvCatVal, adj: mvAdjSel.slice(), origen: 'manual' });",
"            mvAdjReset();" ];
}

/* b39: span 5805..5817 (bloque de lectura del plan) -> 1 comentario */
function b39() {
	return [ "            /* v0.25: sin plan guardado — el resumen del mes es 100% real */" ];
}

/* b40: span 5837..5841 (if conPlan / else) -> resultado real */
function b40() {
	return [
"            const restanteReal = ingReal - gastoReal; /* v0.25: sin plan — resultado 100% real */",
"            html += '<p>• Resultado del mes (ingresos - gastos): <b class=\"' + (restanteReal < 0 ? 'c-alarma' : 'c-positivo') + '\">' + fmt(restanteReal) + '</b></p>';"
];
}

/* b44: span 5863..5864 (consejos del plan) -> 1 consejo con restanteReal */
function b44() {
	return [
"            if (restanteReal > 0) consejos.push('Tienes ' + fmt(restanteReal) + ' de sobrante este mes: considera mover una parte a un plan de ahorro antes de gastarla.');"
];
}

/* b49: span 6205..6213 -> SOLO ntfFmt (misma línea original por referencia) */
function b49(L) {
	return [ L(6210) ];
}

/* ------------------------------------------------------------------ */
/* KILL (rangos 1-based inclusive)                                     */
/* ------------------------------------------------------------------ */
const KILL = [
	[868],
	[1147, 1150],
	[1171, 1238],
	[1371, 1391],
	[1503],
	[1769],
	[1825, 1851],
	[1908, 1912],
	[1917],
	[1921, 1923],
	[1958],
	[2003, 2010],
	[2402],
	[2407, 2409],
	[2418, 2442],
	[2458],
	[2460, 2464],
	[2556, 2618],
	[2621, 2661],
	[2831, 2844],
	[3276, 3277],
	[4901, 4902],
	[4906, 4908],
	[5083, 5109],
	[5843, 5846],
	[5854, 5859],
	[6095, 6101],
	[6103, 6108],
	[6892, 6893]
];

/* ------------------------------------------------------------------ */
/* BUILD map: start -> { fin, fn }                                     */
/* ------------------------------------------------------------------ */
const BUILDS = {
	2119: { fin: 2119, fn: (L) => b16() },
	2449: { fin: 2454, fn: (L) => b25(L) },
	2482: { fin: 2554, fn: (L) => b28() },
	2663: { fin: 2811, fn: (L) => A.concat(B, C, D) },
	3212: { fin: 3213, fn: (L) => b33(L) },
	3225: { fin: 3226, fn: (L) => b34(L) },
	5805: { fin: 5817, fn: (L) => b39() },
	5837: { fin: 5841, fn: (L) => b40() },
	5863: { fin: 5864, fn: (L) => b44() },
	6205: { fin: 6213, fn: (L) => b49(L) },
	6215: { fin: 6280, fn: (L) => NH.B50() },
	6283: { fin: 6294, fn: (L) => NH.B51() },
	6309: { fin: 6311, fn: (L) => NH.B52() }
};

/* ------------------------------------------------------------------ */
/* TXT (una línea por índice; fn recibe la línea y devuelve la nueva)   */
/* ------------------------------------------------------------------ */
const TXT = {
	700: (l) => reemplazar(l, '>v0.24.11<', '>v0.25<'),
	1042: (l) => reemplazarRegex(l, /Se alimenta de Historia[^<]*/, 'Se alimenta del sobrante de tus meses cerrados'),
	1145: (l) => reemplazarRegex(l, /Tu historial por meses[^<]*/, 'Tu dinero mes a mes: meses cerrados y el mes en curso en vivo; los cierres se archivan automáticamente.'),
	1168: () => "                            No hay movimientos todavía. Registra el primero con 💸 Gastos/Ingresos en la barra superior.",
	1259: (l) => reemplazar(l, 'presupuesto, categorías, ahorro y cierre de mes.', 'ahorro y cierre de mes.'),
	1289: (l) => reemplazar(l, ' y valores predeterminados de Gastos.', '.'),
	1521: (l) => reemplazar(l, ' y valores predeterminados de Gastos.', '.'),
	1524: (l) => reemplazar(l, 'presupuesto, categorías, ahorro y cierre de mes.', 'ahorro y cierre de mes.'),
	3032: (l) => reemplazarRango(l, 'Guarda un mes en', 'aquí.', 5, 'El pozo crece con el sobrante de tus meses cerrados.'),
	3281: (l) => reemplazar(l, ' (presupuesto 0: la ajustas en Plan del Mes)', ''),
	3389: (l) => reemplazarRangoPunto(l, 'Guarda un mes en', 'El pozo se llena con el sobrante de tus meses cerrados.'),
	5274: (l) => reemplazar(l, "'v0.21'", "'v0.25'"),
	5295: (l) => reemplazar(l, "'origen'])", "'origen', 'adj'])"),
	5321: (l) => reemplazar(l, "'origen'])", "'origen', 'adj'])"),
	5752: (l) => reemplazar(l, 'disponibles para asignar en tu presupuesto Maatly.', 'de sobrante este mes.'),
	5756: (l) => reemplazar(l, 'disponibles en tu presupuesto Maatly', 'de sobrante este mes'),
	5853: (l) => reemplazar(l, 'guardados en Historial y Registro.', 'guardados en el Historial.'),
	6093: (l) => reemplazarRango(l, '(Plan del Mes', ')', 1, '(movimientos, ahorro y cierre de mes)'),
	6119: (l) => reemplazar(l, 'Aviso diario a fin de mes si el mes actual sigue sin guardar/cerrar.', 'Aviso a fin de mes si el mes sigue abierto; el cierre automático archiva tus movimientos.')
};

/* helpers de texto (aborts si el patrón no aparece exactamente 1 vez) */
function reemplazar(line, buscar, poner) {
	const n = contar(line, buscar);
	if (n !== 1) throw new Error('TXT: \""' + buscar + '\" esperado 1 vez, hay ' + n);
	return line.split(buscar).join(poner);
}
function reemplazarRegex(line, rx, poner) {
	const m = line.match(rx);
	if (!m) throw new Error('TXT: regex ' + rx + ' no encontrada');
	return line.replace(rx, poner);
}
function reemplazarRango(line, desde, hasta, hastaAdj, poner) {
	const k1 = line.indexOf(desde);
	if (k1 < 0) throw new Error('TXT: no está \"' + desde + '\"');
	const k2 = line.indexOf(hasta, k1 + desde.length);
	if (k2 < 0) throw new Error('TXT: no está \"' + hasta + '\"');
	return line.slice(0, k1) + poner + line.slice(k2 + hastaAdj);
}
function reemplazarRangoPunto(line, desde, poner) {
	const k1 = line.indexOf(desde);
	if (k1 < 0) throw new Error('TXT: no está \"' + desde + '\"');
	const k2 = line.indexOf('.', k1);
	if (k2 < 0) throw new Error('TXT: no hay punto tras \"' + desde + '\"');
	return line.slice(0, k1) + poner + line.slice(k2 + 1);
}
function contar(p, a) { if (!a) return 0; let n = 0, i = 0; while ((i = p.indexOf(a, i)) !== -1) { n++; i += a.length; } return n; }

/* ------------------------------------------------------------------ */
/* INSERTS (bloques del HTML nuevo; módulo NEWHTML)                    */
/* ------------------------------------------------------------------ */
const INSERTS = [
	{ n: 439, blk: NH.NEWFIELD },
	{ n: 447, blk: NH.NEWMODALS }
];

module.exports = { KILL: KILL, BUILDS: BUILDS, TXT: TXT, INSERTS: INSERTS };
