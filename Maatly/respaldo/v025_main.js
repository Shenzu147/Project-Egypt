#!/usr/bin/env node
'use strict';
/* =====================================================================
   v025_main.js — Rueda «Historial modal» v0.25 (Maatly v0.24.11 -> v0.25)
   Motor por ÍNDICES de línea (archivo LF puro: split('\n')).
   - Gate MD5 del trunk pre-cambio
   - Aserciones PRE (censo global + tokens por línea + anclas de insert)
   - Walk: INSERT antes de n -> BUILD consume span -> TXT por línea -> KILL -> keep
   - Aserciones POST sobre el resultado (muertes a 0, residuales, presencia)
   - --probe: no escribe; aborta (exit 2) ante cualquier fallo de aserción
   Uso: node v025_main.js <ruta.html> [--probe]
   ===================================================================== */
const fs = require('fs');
const crypto = require('crypto');
const OPS = require('./v025_ops.js');
const A = require('./v025_NEWHIST_A.js');
const B = require('./v025_NEWHIST_B.js');
const C = require('./v025_NEWHIST_C.js');
const D = require('./v025_NEWHIST_D.js');
const NH = require('./v025_NEWHTML.js');

const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node v025_main.js <ruta.html> [--probe]'); process.exit(1); }

const orig = fs.readFileSync(ruta, 'utf8');
const MD5_ESPERADO = 'F4B32D653342A558C6C4F939537848EE';
const md5de = (t) => crypto.createHash('md5').update(t, 'utf8').digest('hex').toUpperCase();
const md5Antes = md5de(orig);
console.log('MD5 entrada : ' + md5Antes);
if (md5Antes !== MD5_ESPERADO) {
	console.error('ABORT: MD5 = ' + md5Antes + ' (esperado ' + MD5_ESPERADO + ') — ¿revert/revert OneDrive o archivo equivocado?');
	process.exit(2);
}

const LINEAS = orig.split('\n');
const N = LINEAS.length;
if (orig.indexOf('\r\n') !== -1) { console.error('ABORT: el archivo tiene CRLF'); process.exit(2); }
const L = (n) => LINEAS[n - 1];

/* ---------- censo global PRE ---------- */
const CENSUS = {
	'Plan del Mes': 15, 'presupuesto': 18, 'Presupuesto': 12, 'gastoPlan': 19,
	'historialUltimate': 16, 'actualizarCalculos': 17, 'resetearSimulador': 3,
	'renderizarCategorias': 9, 'crearGraficaPresupuesto': 6, 'actualizarResumenPredeterminado': 4,
	'lblSimResumenInfo': 2, 'inputPeriodo': 4, 'miGrafica': 15, 'gastoPromedio': 4,
	'editarRegistro': 2, 'cambiarTabHistorial': 5, 'subTabPlan': 2, 'subTabHistorial': 2,
	'btnTabHistRegistros': 2, 'btnTabHistPlan': 2, 'graficaPresupuesto': 2,
	'contenedorCategorias': 2, 'btnAgregarCat': 2, 'barraProgreso': 2, 'lblTotalGastado': 2,
	'modoEdicionActivo': 7, 'histExpandido': 7, 'histToggleMes': 2, 'lblFuenteKpi': 2,
	'inputSalario': 11, 'inputAhorro': 11, 'cfgDefaultSalario': 11, 'cfgDefaultAhorro': 11,
	'guardarDefaultsAuto': 3, 'catsDinamicas': 14, 'editId': 6, 'btnGuardarMes': 8,
	'histAnios': 2, 'inputBuscaMovs': 2, 'lblCuentaHist': 3, 'histAnioBtn': 2,
	'ntfPdChip': 6, 'ntfCat': 6, 'mensajeVacio': 2, 'renderAhorroAcumuladoWidget': 12,
	'borrarMesCompleto': 2, 'arcEliminarMovimiento': 2, 'actualizarKPIs': 10,
	'animarValorKpi': 4, 'getAportesAhorro': 9, 'ntfMesReg': 3, 'ntfGastoRealMes': 2,
	'ntfAvisoIngreso': 2, 'ntfTickDinero': 2, 'paleta': 12
};
const contar = (s, a) => { let n = 0, i = 0; if (!a) return 0; while ((i = s.indexOf(a, i)) !== -1) { n++; i += a.length; } return n; };
const errores = [];
const esperados = [];
for (const k of Object.keys(CENSUS)) {
	const n = contar(orig, k);
	if (n !== CENSUS[k]) errores.push('CENSO PRE: ' + k + ' = ' + n + ' (esperado ' + CENSUS[k] + ')');
	esperados.push(k + ':' + n);
}

/* ---------- guards de doble aplicación (deben ser 0 PRE) ---------- */
const GUARDS0 = ['abrirDetalleMes', 'dmMesCache', 'dmMesActual', 'btnDmBorrarMes', 'dmTitulo', 'dmKpi', 'dmCuerpo',
	'modalDetalleMes', 'modalAdjPreview', 'apTitulo', 'apCuerpo', 'borrarMesDesdeDetalle', 'dmEliminarMov',
	'abrirAdjuntosMov', 'cerrarAdjPreview', 'mvAdjSel', 'mvAdjChips', 'mvAdjInput', 'btnMvAdjAdd',
	'MVADJ_MAX_FILE', 'mvAdjPintarChips', 'mvAdjReset', 'mvAdjQuitar', 'mvAdjFmtSize', 'mvAdjAgregarArchivos', 'mvAdjBlobUrl'];
for (const g of GUARDS0) if (contar(orig, g) !== 0) errores.push('GUARD PRE (debe ser 0): ' + g);

/* ---------- funciones que sobreviven (>=1 PRE) ---------- */
const VIVAS = ['function getAportesAhorro', 'function animarValorKpi', 'function getHist', 'function renderAhorroAcumuladoWidget',
	'function getArchivoMensual', 'function guardarArchivoMensual', 'function mesNombreLargo', 'function movimientosDelMes',
	'function getMovimientos', 'function agregarMovimiento', 'window.borrarMesCompleto', 'window.arcEliminarMovimiento',
	'function kbHoyStr', 'function aaEsc', 'function formatBs', 'function kbFmtFechaCorta', 'function triggerHaptic',
	'agGetNotifCfg', 'agNotificarLocal', 'agEnviarPush', 'xlExtraDe', 'window.filtrarReporteHistorico'];
for (const v of VIVAS) if (contar(orig, v) < 1) errores.push('FALTA PRE: ' + v);

/* ---------- aserciones por línea (estabilidad del mapeo) ---------- */
const SPANS = {
	436: ['btnMvCatNuevaCancel'], 438: ['</div>'], 439: ['            </div>'], 440: ['flex justify-end gap-3 mt-6'],
	447: ['Modal Aportar a un Plan'], 448: ['modalAporte'],
	700: ['v0.24.11'],
	868: ['lblFuenteKpi'],
	1042: ['Se alimenta de Historia'],
	1145: ['Tu historial por meses'], 1148: ['btnTabHistRegistros'], 1149: ['btnTabHistPlan'], 1150: ['</div>'],
	1168: ['Plan del Mes'],
	1171: ['subTabPlan'], 1181: ['inputPeriodo'], 1211: ['graficaPresupuesto'], 1238: ['</div>'],
	1259: ['presupuesto'], 1289: ['valores predeterminados de Gastos'], 1288: ['Moneda y Finanzas'],
	1371: ['bg-white dark:bg-slate-800 rounded-2xl'], 1375: ['Valores Predeterminados de Gastos'], 1381: ['cfgDefaultSalario'], 1385: ['cfgDefaultAhorro'], 1391: ['<hr'],
	1503: ['miGrafica'],
	1521: ['valores predeterminados de Gastos'], 1524: ['presupuesto'],
	1769: ['let paleta ='],
	1825: ['function crearGraficaPresupuesto'], 1846: ['DATALABELS_PCT'], 1850: ['}'], 1852: ['function cambiarTemaEstilo'],
	1908: ['paleta = hexList.map'], 1912: ['}));'], 1917: ['miGrafica'], 1921: ['crearGraficaPresupuesto'], 1922: ['renderizarCategorias'], 1923: ['actualizarCalculos'], 1924: [''],
	1958: ['modoEdicionActivo'],
	2003: ['v0.21.1'], 2004: ['cambiarTabHistorial'], 2006: ['modoEdicionActivo'], 2010: ['}'], 2012: ['vistaAgenda'],
	2028: ['cargarTablaHistorial'],
	2402: ['inputSalario'], 2403: ['inputTasaGlobalConfig'], 2407: ['cfgDefaultSalario'], 2408: ['cfgDefaultAhorro'], 2409: [''],
	2418: ['defaultSalario'], 2442: ['cfgDefaultAhorro'],
	2449: ['const syncTasa'], 2452: ['actualizarCalculos'], 2454: ['syncTasa);'],
	2458: ['catsDinamicas'], 2460: ['function resetearSimulador'], 2463: ['}'], 2464: [''], 2465: ['function formatBs'],
	2482: ['function actualizarKPIs'], 2543: ['lblFuenteKpi'], 2554: ['}'], 2555: [''],
	2556: ['function renderizarCategorias'], 2618: ['actualizarCalculos'],
	2620: ['function getHist'], 2621: ['let editId = null;'], 2645: ['editId'], 2661: ['}'],
	2663: ['Historial unificado'], 2720: ['histAnioBtn'], 2810: ['actualizarKPIs'], 2811: ['}'],
	2813: ['window.borrarMesCompleto'],
	2831: ['editarRegistro'], 2844: ['};'],
	2934: ['gastoPlan', 'ingreso = 0'],
	3032: ['Guarda un mes en'], 3006: ['function renderAhorroAcumuladoWidget'],
	3212: ['mvCatCerrarForm();'], 3213: ['mvFecha'], 3215: ['aaDlgAbrir'],
	3225: ['mvCatSel'], 3226: ['agregarMovimiento'], 3227: ['ntfAvisoIngreso'],
	3276: ['Plan del Mes'], 3277: ['categorias'], 3281: ['presupuesto 0'],
	3389: ['Guarda un mes en'],
	3897: ['function kbFmtFechaCorta'],
	3933: ['function movimientosDelMes'], 3926: ['function agregarMovimiento'],
	4901: ['crearGraficaPresupuesto'], 4902: [''], 4906: ['renderizarCategorias'], 4908: ['actualizarCalculos'], 4909: ['cargarTablaHistorial'],
	5083: ['=========='], 5088: ['cambiarTabHistorial'], 5101: ['modoEdicionActivo'], 5109: ['};'], 5111: ['arcEliminarMovimiento'],
	5274: ["'v0.21'"], 5295: ["'origen'])"], 5321: ["'origen'])"],
	5805: ['const h = getHist();'], 5817: ['restPlan'],
	5837: ['conPlan'], 5839: ['else'], 5840: ['Plan del Mes'], 5841: ['}'], 5843: ['conPlan'], 5846: ['}'], 5853: ['Historial y Registro'], 5854: ['conPlan && gastoReal'], 5859: ['}'],
	5863: ['consejos.push'], 5864: ['restPlan > 0'], 5865: ['recurrentes'], 5867: ['consejos.join'],
	6093: ['(Plan del Mes'], 6095: ['border-slate-200'], 6101: ['    </div>'], 6103: ['border-slate-200'], 6108: ['    </div>'],
	6119: ['sin guardar/cerrar'],
	6205: ['function ntfMesReg'], 6210: ['function ntfFmt'], 6213: ['}'], 6214: [''],
	6215: ['function ntfTickDinero'], 6280: ['}'], 6282: ['Evento: al registrar un ingreso'],
	6283: ['function ntfAvisoIngreso'], 6294: ['}'], 6297: ['function ntfAvisoMeta'],
	6309: ['Ejemplo: has usado 75%'], 6311: ['agEnviarPush'], 6312: ['}'],
	6888: ['proxima'], 6891: ['agenda'], 6892: ['presupuesto'], 6893: ['categoria'], 6894: ['ahorro'], 6897: ['};']
};
for (const k of Object.keys(SPANS)) {
	const n = parseInt(k, 10);
	const line = L(n);
	if (line === undefined) { errores.push('SPANS: línea ' + n + ' fuera de rango'); continue; }
	for (const tok of SPANS[k]) {
		if (tok === '') { if (line !== '') errores.push('SPAN ' + n + ': se esperaba línea vacía, es [' + line.slice(0, 60) + ']'); }
		else if (line.indexOf(tok) === -1) errores.push('SPAN ' + n + ': falta [' + tok + '] en [' + line.slice(0, 90) + ']');
	}
}

/* ---------- módulos de bloques nuevos: estructura ---------- */
if (!Array.isArray(A) || !Array.isArray(B) || !Array.isArray(C) || !Array.isArray(D)) errores.push('Módulos NEWHIST no son arrays');
if (!Array.isArray(NH.NEWMODALS) || !Array.isArray(NH.NEWFIELD)) errores.push('NEWHTML incompleto');
['B50', 'B51', 'B52'].forEach((f) => { if (typeof NH[f] !== 'function') errores.push('Falta NH.' + f); });

if (errores.length) {
	console.error('--- ABORT PRE (' + errores.length + ') ---');
	errores.forEach((e) => console.error(' · ' + e));
	process.exit(2);
}
console.log('PRE OK: censo ' + esperados.length + ' tokens, ' + Object.keys(SPANS).length + ' líneas, guards ' + GUARDS0.length + ' a cero.');

/* =====================================================================
   WALK
   ===================================================================== */
const killSet = new Set();
for (const r of OPS.KILL) { const b = r.length > 1 ? r[1] : r[0]; for (let n = r[0]; n <= b; n++) killSet.add(n); }
let killTotal = 0; OPS.KILL.forEach((r) => { killTotal += (r.length > 1 ? r[1] : r[0]) - r[0] + 1; });
const buildStart = {};
let buildTotal = 0;
for (const s of Object.keys(OPS.BUILDS)) {
	const st = parseInt(s, 10);
	buildStart[st] = OPS.BUILDS[s];
	buildTotal += OPS.BUILDS[s].fin - st + 1;
}
const insertMap = new Map();
OPS.INSERTS.forEach((o) => { if (insertMap.has(o.n)) errores.push('INSERT duplicado en ' + o.n); insertMap.set(o.n, o.blk); });
let insertTotal = 0; OPS.INSERTS.forEach((o) => { insertTotal += o.blk.length; });

const sal = [];
let buildHechos = 0, txtHechos = 0;
for (let i = 1; i <= N; i++) {
	if (insertMap.has(i)) { const blk = insertMap.get(i); for (const l of blk) sal.push(l); }
	if (buildStart[i]) {
		const bd = buildStart[i];
		let out;
		try { out = bd.fn(L); } catch (e) { errores.push('BUILD ' + i + ': ' + e.message); out = null; }
		if (out) { for (const l of out) sal.push(l); buildHechos++; }
		i = bd.fin;
		continue;
	}
	if (killSet.has(i)) continue;
	let line = LINEAS[i - 1];
	if (OPS.TXT[i]) {
		try { line = OPS.TXT[i](line); txtHechos++; } catch (e) { errores.push('TXT ' + i + ': ' + e.message); }
	}
	sal.push(line);
}
if (errores.length) {
	console.error('--- ABORT WALK (' + errores.length + ') ---');
	errores.forEach((e) => console.error(' · ' + e));
	process.exit(2);
}
if (buildHechos !== Object.keys(OPS.BUILDS).length || txtHechos !== Object.keys(OPS.TXT).length) {
	console.error('ABORT: no se ejecutaron todas las ops (build ' + buildHechos + '/' + Object.keys(OPS.BUILDS).length + ', txt ' + txtHechos + '/' + Object.keys(OPS.TXT).length + ')');
	process.exit(2);
}

const res = sal.join('\n');
const md5Nuevo = md5de(res);

/* =====================================================================
   POST (sobre el resultado)
   ===================================================================== */
const MUERTES = ['Plan del Mes', 'cambiarTabHistorial', 'crearGraficaPresupuesto', 'miGrafica', 'graficaPresupuesto',
	'inputSalario', 'inputAhorro', 'cfgDefaultSalario', 'cfgDefaultAhorro', 'resetearSimulador', 'renderizarCategorias',
	'actualizarCalculos', 'guardarDefaultsAuto', 'actualizarResumenPredeterminado', 'editarRegistro', 'modoEdicionActivo',
	'histExpandido', 'histToggleMes', 'lblFuenteKpi', 'lblSimResumenInfo', 'inputPeriodo', 'contenedorCategorias',
	'btnAgregarCat', 'barraProgreso', 'lblTotalGastado', 'btnTabHistRegistros', 'btnTabHistPlan', 'subTabPlan',
	'ntfMesReg', 'ntfGastoRealMes', 'editId', 'btnGuardarMes', 'btnCancelarEdicion', 'Presupuesto'];
for (const m of MUERTES) {
	const n = contar(res, m);
	if (n !== 0) errores.push('VIVA/debe morir POST: ' + m + ' = ' + n);
}
const ns = (res.match(/\bsalario\b/gi) || []).length;
if (ns !== 0) errores.push('POST palabra "salario" = ' + ns);
if (contar(res, "'origen'])") !== 0) errores.push("POST: queda 'origen']) sin 'adj'");
if (contar(res, "v0.24.11'") !== 0) errores.push('POST: ref de version vieja v0.24.11 con comilla');

const RESIDUAL = {
	'presupuesto': 4, 'gastoPlan': 8, 'historialUltimate': 15, 'maatlyArchivoMensual': 13, 'paleta': 1,
	'ntfPdChip': 4, 'ntfCat': 4, 'catsDinamicas': 9, 'subTabHistorial': 1,
	'kpiAhorroTotal': 2, 'kpiGastoPromedio': 6, 'lblKpiMesNombre': 2,
	'guardarArchivoMensual': 4, 'borrarMesCompleto': 4, 'mensajeVacio': 2,
	'lblCuentaHist': 3, 'inputBuscaMovs': 2, 'histAnios': 2, 'histAnioBtn': 2,
	"'origen', 'adj'": 2, 'borrarMesDesdeDetalle': 2, 'modalAdjPreview': 3, 'modalDetalleMes': 6,
	'actualizarKPIs': 10, 'ntfFmt': 4
};
const residReales = [];
for (const k of Object.keys(RESIDUAL)) {
	const n = contar(res, k);
	residReales.push(k + ':' + n);
	if (n !== RESIDUAL[k]) errores.push('RESIDUAL POST: ' + k + ' = ' + n + ' (esperado ' + RESIDUAL[k] + ')');
}

const PRESENCIA = ['abrirDetalleMes', 'abrirAdjuntosMov', 'dmEliminarMov', 'borrarMesDesdeDetalle', 'mvAdjSel',
	'mvAdjReset', 'mvAdjPintarChips', 'mvAdjBlobUrl', 'function actualizarKPIs', 'function cargarTablaHistorial',
	'histAnioBtn', 'ntfFmt', 'mesNombreLargo', 'kbFmtFechaCorta', 'getArchivoMensual', 'Gastos/Ingresos',
	'Adjuntar foto o PDF', 'Detalle del mes', 'Hasta 1.5 MB por archivo', 'El pozo se llena', 'de sobrante este mes',
	'function getAportesAhorro', 'window.borrarMesCompleto'];
for (const p of PRESENCIA) if (contar(res, p) < 1) errores.push('NO ESTA POST: ' + p);

if (res.length < 540 * 1024) errores.push('POST: el resultado midió ' + res.length + ' B (<540 KB), algo se fue a pique');

if (errores.length) {
	console.error('--- ABORT POST (' + errores.length + ') ---');
	errores.forEach((e) => console.error(' · ' + e));
	console.error('residuales reales: ' + residReales.join(', '));
	console.error('bytes/lineas: ' + res.length + ' / ' + sal.length + '  MD5 nuevo: ' + md5Nuevo);
	process.exit(2);
}

/* =====================================================================
   SALIDA
   ===================================================================== */
console.log('[v0.25] entrada : ' + orig.length + ' B · ' + N + ' lineas · ' + md5Antes);
console.log('[v0.25] salida  : ' + res.length + ' B · ' + sal.length + ' lineas · ' + md5Nuevo);
console.log('[v0.25] delta   : ' + (res.length - orig.length) + ' B · ' + (sal.length - N) + ' lineas');
console.log('[v0.25] KILL ' + killTotal + ' lineas · BUILD ' + buildTotal + ' lineas · INSERT ' + insertTotal + ' lineas · TXT ' + Object.keys(OPS.TXT).length);
console.log('[v0.25] residuales: ' + residReales.join(', '));
if (probe) { console.log('PROBE OK — sin escritura'); process.exit(0); }
fs.writeFileSync(ruta, res, 'utf8');
const ver = md5de(fs.readFileSync(ruta, 'utf8'));
console.log('APLICADO → ' + ruta + '  MD5 relectura = ' + ver + (ver === md5Nuevo ? ' (OK)' : ' (ERROR)'));
if (ver !== md5Nuevo) process.exit(2);
