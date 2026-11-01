#!/usr/bin/env node
'use strict';
/* =====================================================================
   unifhist_edits.js — Maatly v0.24.10 -> v0.24.11 (Historial unificado)
   Fusiona «Registros» + «Archivo Mensual» en UNA pestaña «📦 Historial»
   (tarjeta por mes: plan + movimientos reales, JOIN en vivo, sin migrar
   datos) y deja 2 pestañas: 📦 Historial · 📊 Plan del Mes.
   F1  botones de pestaña: 3 -> 2
   F2  h2 «Historial y Registro» -> «Historial»
   F3  subtítulo reescrito
   F4  contenido subTabRegistros -> subTabHistorial (chips de año +
       buscador de movimientos + contador + contenedor de tarjetas)
   F5  fuera el bloque subTabArchivo
   F6  fuera 'const tb = tablaHistorialBody'
   F7  cargarTablaHistorial -> renderer unificado + histToggleMes /
       histAnioBtn + borrarMesCompleto (plan + archivo juntos)
   F8  toast del cierre auto: nombre viejo fuera
   F9  comentario v0.13 + cambiarTabHistorial a 2 pestañas con alias
   F10 fuera renderArchivoMensual (el JOIN vive en el renderer)
   F11 arcEliminarMovimiento(mes, movId) — busca por mes, no por índice
   F12 call site en cambiarVista
   F13 call site en btnLimpiar
   F14 call site muerto del arranque fuera
   F15 badge v0.24.10 -> v0.24.11
   Uso: node unifhist_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier aserción falla.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node unifhist_edits.js <ruta.html> [--probe]'); process.exit(1); }
const orig = fs.readFileSync(ruta, 'utf8');
let s = orig;

function contar(pajar, aguja) {
  if (!aguja) return 0;
  let n = 0, i = 0;
  while ((i = pajar.indexOf(aguja, i)) !== -1) { n++; i += aguja.length; }
  return n;
}
const j = (lineas) => lineas.join('\n');
const errores = [];
const asertar = (c, m) => { if (!c) errores.push(m); };

/* ================= F1: botones de pestaña (Registros+Archivo -> Historial) ================= */
const R1_TAB = [
  j([
"                                <button id=\"btnTabHistRegistros\" onclick=\"cambiarTabHistorial('registros')\" class=\"hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-extrabold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5\"><svg class=\"w-3.5 h-3.5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 6h13M8 12h13M8 18h13\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 6h.01M3 12h.01M3 18h.01\"></path></svg><span>Registros</span></button>",
"                                <button id=\"btnTabHistArchivo\" onclick=\"cambiarTabHistorial('archivo')\" class=\"hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5\"><svg class=\"w-3.5 h-3.5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8h14\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4\"></path></svg><span>Archivo Mensual</span></button>"
  ]),
  j([
"                                <button id=\"btnTabHistRegistros\" onclick=\"cambiarTabHistorial('historial')\" class=\"hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-extrabold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5\"><svg class=\"w-3.5 h-3.5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8h14\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4\"></path></svg><span>Historial</span></button>"
  ]),
  1
];

/* ================= F2: h2 ================= */
const R2_TITULO = [" Historial y Registro</h2>", " Historial</h2>", 1];

/* ================= F3: subtítulo ================= */
const R3_SUBTITULO = [
"                                <p class=\"text-[11px] text-slate-500 dark:text-slate-400\">Registros que guardas cada mes + archivo automático de los meses que se cierran.</p>",
"                                <p class=\"text-[11px] text-slate-500 dark:text-slate-400\">Tu historial por meses: el plan y los movimientos reales juntos; los meses que se cierran se archivan automáticamente.</p>",
  1
];

/* ================= F4: contenido subTabRegistros -> subTabHistorial ================= */
const R4_CONTENIDO = [
  j([
"                    <div id=\"subTabRegistros\" class=\"overflow-x-auto\">",
"                        <table class=\"w-full text-left border-collapse whitespace-nowrap\">",
"                            <thead>",
"                                <tr class=\"bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide border-b border-slate-200 dark:border-slate-700\">",
"                                    <th class=\"p-4 font-semibold\">Periodo</th>",
"                                    <th class=\"p-4 font-semibold\">Ingreso / Ahorro</th>",
"                                    <th class=\"p-4 font-semibold text-indigo-600 dark:text-indigo-400\">Total Gastado</th>",
"                                    <th class=\"p-4 font-semibold min-w-[250px]\">Distribución Detallada</th>",
"                                    <th class=\"p-4 font-semibold text-center\">Acciones</th>",
"                                </tr>",
"                            </thead>",
"                            <tbody id=\"tablaHistorialBody\" class=\"divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800\"></tbody>",
"                        </table>",
"                        <div id=\"mensajeVacio\" class=\"text-center py-16 text-slate-400 dark:text-slate-500 hidden font-medium flex flex-col items-center\">",
"                            <svg class=\"w-16 h-16 opacity-30 mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4\"></path></svg>",
"                            No hay registros. Crea uno en la pestaña 📊 Plan del Mes o usa los datos de prueba.",
"                        </div>",
"                    </div>"
  ]),
  j([
"                    <div id=\"subTabHistorial\" class=\"p-4 sm:p-6\">",
"                        <div class=\"flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4\">",
"                            <div class=\"flex flex-wrap gap-1.5\" id=\"histAnios\"></div>",
"                            <div class=\"relative w-full sm:w-64 flex-shrink-0\">",
"                                <svg class=\"w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z\"></path></svg>",
"                                <input id=\"inputBuscaMovs\" type=\"search\" oninput=\"cargarTablaHistorial()\" placeholder=\"Buscar movimientos\" class=\"w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500\">",
"                            </div>",
"                        </div>",
"                        <div id=\"lblCuentaHist\" class=\"text-[11px] text-slate-400 font-semibold mb-2\"></div>",
"                        <div id=\"listaHistorialUnificado\" class=\"space-y-3\"></div>",
"                        <div id=\"mensajeVacio\" class=\"text-center py-16 text-slate-400 dark:text-slate-500 hidden font-medium flex flex-col items-center\">",
"                            <svg class=\"w-16 h-16 opacity-30 mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4\"></path></svg>",
"                            No hay meses en tu historial todavía. Crea tu plan en la pestaña 📊 Plan del Mes, registra gastos e ingresos, o carga los datos de prueba.",
"                        </div>",
"                    </div>"
  ]),
  1
];

/* ================= F5: fuera el bloque subTabArchivo ================= */
const R5_ARCHIVO_DEL = [
  j([
"                    </div>",
"                    <div id=\"subTabArchivo\" class=\"hidden\">",
"                        <div id=\"listaArchivoMensual\" class=\"p-4 sm:p-6 space-y-3\"></div>",
"                    </div>",
"                </div>"
  ]),
  j([
"                    </div>",
"                </div>"
  ]),
  1
];

/* ================= F6: fuera 'const tb' ================= */
const R6_TB = [
  j([
"        const tb = document.getElementById('tablaHistorialBody');",
"        function getHist(){ return JSON.parse(localStorage.getItem('historialUltimate'))||[]; }"
  ]),
  j([
"        function getHist(){ return JSON.parse(localStorage.getItem('historialUltimate'))||[]; }"
  ]),
  1
];

/* ================= F7: renderer unificado + borrarMesCompleto ================= */
const R7_RENDERER = [
  j([
"        function cargarTablaHistorial(){",
"            if(!tb) return;",
"            const h = getHist(); tb.innerHTML='';",
"            if (typeof renderAhorroAcumuladoWidget === 'function') renderAhorroAcumuladoWidget(); ",
"            if(!h.length) { document.getElementById('mensajeVacio').classList.remove('hidden'); return; }",
"            document.getElementById('mensajeVacio').classList.add('hidden');",
"            [...h].reverse().forEach(reg => {",
"                let us=0, bsHTML=''; reg.gastos.forEach(g => { if(g.val>0){ us+=g.val; bsHTML+=`<span class=\"bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-1 rounded font-semibold border border-slate-200 dark:border-slate-600\">${g.name}: $${g.val}</span> `; }});",
"                const tr = document.createElement('tr'); tr.className=\"border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors\";",
"                tr.innerHTML = `<td class=\"p-4 font-bold text-slate-800 dark:text-slate-200\">${reg.fechaStr}<br><span class=\"text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded\">${reg.periodo}</span>${reg.autoCierre ? '<span class=\"text-[9px] text-amber-600 dark:text-amber-400 font-bold ml-1\" title=\"Registro creado al cerrar el mes\">📦 cierre auto</span>' : ''}</td><td class=\"p-4 text-sm\"><div class=\"font-medium\">$${reg.ingreso || 0}</div><div class=\"text-green-500 font-bold\">+$${((reg.ahorro || 0) + (reg.sobrante || 0))}</div>${reg.sobrante > 0 ? '<div class=\"text-[9px] font-bold text-amber-600 dark:text-amber-400\">🎉 incl. sobrante $' + (reg.sobrante || 0).toLocaleString() + '</div>' : ''}</td><td class=\"p-4\"><div class=\"font-bold text-indigo-600 dark:text-indigo-400 text-lg\">$${us}</div><div class=\"text-xs text-slate-400\">Bs. ${reg.tasa?(us*reg.tasa).toFixed(2):'-'}</div></td><td class=\"p-4 flex flex-wrap gap-1\">${bsHTML}</td><td class=\"p-4 text-center\"><button onclick=\"editarRegistro(${reg.id})\" class=\"text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition-colors mr-1\"><svg class=\"w-4 h-4 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"></path></svg></button><button onclick=\"borrarRegistro(${reg.id})\" class=\"text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors\"><svg class=\"w-4 h-4 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg></button></td>`;",
"                tb.appendChild(tr);",
"            });",
"            actualizarKPIs();",
"        }",
"        ",
"        window.borrarRegistro = (id) => { ",
"            showModal(\"<svg class='w-5 h-5 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 7h16'></path><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2'></path><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7'></path><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 11v6M14 11v6'></path></svg>Borrar Registro\", \"¿Seguro que deseas eliminar este mes del historial? Esta acción no se puede deshacer.\", \"Sí, Eliminar\", \"bg-red-600 hover:bg-red-700\", () => {",
"                localStorage.setItem('historialUltimate', JSON.stringify(getHist().filter(r=>r.id!==id))); ",
"                cargarTablaHistorial(); mostrarToast(\"Registro borrado\",\"info\");",
"            });",
"        };"
  ]),
  j([
"        /* v0.24.11 — Historial unificado (una tarjeta por mes: plan + movimientos reales).",
"           Cero migración: el JOIN plan/reales se hace EN VIVO aquí; las claves",
"           historialUltimate / maatlyArchivoMensual y sus formatos quedan intactos. */",
"        let histAnioActivo = '';",
"        const histExpandido = {};",
"",
"        window.histAnioBtn = function(anio) {",
"            histAnioActivo = String(anio || '');",
"            cargarTablaHistorial();",
"        };",
"",
"        window.histToggleMes = function(mes) {",
"            histExpandido[mes] = !histExpandido[mes];",
"            const cuerpo = document.getElementById('histBody-' + mes), chev = document.getElementById('histChev-' + mes);",
"            if (cuerpo) cuerpo.classList.toggle('hidden', !histExpandido[mes]);",
"            if (chev) chev.classList.toggle('rotate-180', histExpandido[mes]);",
"        };",
"",
"        function cargarTablaHistorial(){",
"            const cont = document.getElementById('listaHistorialUnificado');",
"            if(!cont) return;",
"            if (typeof renderAhorroAcumuladoWidget === 'function') renderAhorroAcumuladoWidget();",
"",
"            /* --- JOIN en vivo por mes (YYYY-MM): planes (puede haber quincenas) + snapshots --- */",
"            const porMes = {};",
"            getHist().forEach(r => {",
"                const mes = String(r.fechaStr || '').slice(0, 7); if (!mes) return;",
"                if (!porMes[mes]) porMes[mes] = { mes: mes, planes: [], archs: [] };",
"                porMes[mes].planes.push(r);",
"            });",
"            getArchivoMensual().forEach(a => {",
"                const mes = String(a.mes || '').slice(0, 7); if (!mes) return;",
"                if (!porMes[mes]) porMes[mes] = { mes: mes, planes: [], archs: [] };",
"                porMes[mes].archs.push(a);",
"            });",
"            const meses = Object.keys(porMes).sort().reverse();",
"",
"            const vacioEl = document.getElementById('mensajeVacio');",
"            if (!meses.length) {",
"                cont.innerHTML = '';",
"                if (vacioEl) vacioEl.classList.remove('hidden');",
"                const cuentaVacia = document.getElementById('lblCuentaHist');",
"                if (cuentaVacia) cuentaVacia.textContent = '';",
"                if (typeof actualizarKPIs === 'function') actualizarKPIs();",
"                return;",
"            }",
"            if (vacioEl) vacioEl.classList.add('hidden');",
"",
"            /* --- filtro por año (chips) + búsqueda de movimientos --- */",
"            const inpBusca = document.getElementById('inputBuscaMovs');",
"            const q = inpBusca ? inpBusca.value.trim().toLowerCase() : '';",
"            const anios = [...new Set(meses.map(m => m.slice(0, 4)))].sort().reverse();",
"            if (histAnioActivo && !anios.includes(histAnioActivo)) histAnioActivo = '';",
"            const chipsAnio = document.getElementById('histAnios');",
"            if (chipsAnio) chipsAnio.innerHTML = [''].concat(anios).map(function(a) {",
"                const activo = (a === '' && histAnioActivo === '') || a === histAnioActivo;",
"                const cls = activo ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400';",
"                return '<button onclick=\"histAnioBtn(\\'' + a + '\\')\" class=\"text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-colors ' + cls + '\">' + (a === '' ? 'Todos' : a) + '</button>';",
"            }).join('');",
"",
"            const matchMov = function(mv) { return !q || [mv.desc, mv.cat, mv.origen].some(function(v) { return String(v || '').toLowerCase().indexOf(q) !== -1; }); };",
"            const visible = meses.filter(function(mn) {",
"                if (histAnioActivo && mn.slice(0, 4) !== histAnioActivo) return false;",
"                if (!q) return true;",
"                return [].concat(...porMes[mn].archs.map(function(a) { return a.movimientos || []; })).some(matchMov);",
"            });",
"",
"            const fmt = n => (n < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toLocaleString();",
"            const chip = (txt, cls) => '<span class=\"text-[10px] font-extrabold px-2 py-0.5 rounded-md ' + cls + '\">' + txt + '</span>';",
"            let cuentaMovs = 0;",
"            const html = visible.map(function(mes) {",
"                const d = porMes[mes];",
"                const arch = d.archs[0];",
"                const k = (arch && arch.kpis) || {};",
"                const dominante = d.planes.filter(p => (p.periodo || 'Mensual') === 'Mensual')[0] || d.planes[0];",
"                const movs = [].concat(...d.archs.map(function(a) { return a.movimientos || []; }))",
"                    .filter(matchMov)",
"                    .sort((x, y) => String(y.fecha || '').localeCompare(String(x.fecha || '')));",
"                cuentaMovs += movs.length;",
"",
"                const abierta = q ? true : (histExpandido[mes] !== undefined ? histExpandido[mes] : mes === visible[0]);",
"                const metaCierre = d.archs.length",
"                    ? '<span class=\"text-[10px] text-slate-400 dark:text-slate-500 font-semibold\">' + (arch && arch.fechaCierre ? 'Cerrado el ' + kbFmtFechaCorta(arch.fechaCierre) + ' · ' : '') + movs.length + ' movimiento' + (movs.length === 1 ? '' : 's') + '</span>'",
"                    : '<span class=\"text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold\">Plan guardado · movimientos del mes en curso</span>';",
"",
"                /* --- chips KPI de la cabecera --- */",
"                let chipsK = chip('Ingresos ' + fmt(arch ? k.ingreso : (dominante ? dominante.ingreso : 0)), 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200');",
"                const ahoDom = dominante ? (Number(dominante.ahorro) || 0) + (Number(dominante.sobrante) > 0 ? Number(dominante.sobrante) : 0) : 0;",
"                const sobrDom = dominante ? Number(dominante.sobrante) || 0 : 0;",
"                chipsK += chip('Ahorro ' + fmt(arch ? (Number(k.ahorro) || 0) + (Number(k.sobrante) > 0 ? Number(k.sobrante) : 0) : ahoDom) + ((arch ? Number(k.sobrante) : sobrDom) > 0 ? ' 🎉' : ''), 'bg-positivo-suave c-positivo');",
"                chipsK += chip('Gastos plan ' + fmt(dominante ? dominante.gastos.reduce((s, g) => s + (Number(g.val) || 0), 0) : (Number(k.gastoPlan) || 0)), 'bg-alarma-suave c-gasto');",
"                if (arch) {",
"                    chipsK += chip('Reales ' + fmt(k.gastoReal), 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300');",
"                    chipsK += chip('Resultado ' + fmt(k.resultado), Number(k.resultado) >= 0 ? 'bg-positivo-suave c-positivo' : 'bg-alarma-suave c-alarma');",
"                }",
"",
"                /* --- cuerpo: bloques de PLAN (uno por registro) + movimientos reales --- */",
"                const planesHTML = d.planes.map(function(reg) {",
"                    const cats = (reg.gastos || []).filter(g => Number(g.val) > 0).map(g =>",
"                        '<span class=\"bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-1 rounded font-semibold border border-slate-200 dark:border-slate-600\">' + aaEsc(g.name) + ': $' + (Number(g.val) || 0) + '</span>'",
"                    ).join(' ');",
"                    const gp = (reg.gastos || []).reduce((s, g) => s + (Number(g.val) || 0), 0);",
"                    let barra = '';",
"                    if (gp > 0 && arch && k.gastoReal != null) {",
"                        const pct = Math.min(100, (Number(k.gastoReal) / gp) * 100);",
"                        barra = '<div class=\"mt-1.5 flex items-center gap-2\"><div class=\"flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden\"><div class=\"bg-indigo-500 h-full rounded-full\" style=\"width:' + pct.toFixed(0) + '%\"></div></div><span class=\"text-[10px] font-bold ' + (Number(k.gastoReal) > gp ? 'c-alarma' : 'text-slate-500 dark:text-slate-400') + '\">' + fmt(Number(k.gastoReal)) + ' de $' + gp.toLocaleString() + ' planificados.</span></div>';",
"                    }",
"                    return '<div class=\"p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/80\">'",
"                        + '<div class=\"flex items-center justify-between gap-2 mb-1.5\"><span class=\"text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide\">Plan del mes · ' + aaEsc(reg.periodo || 'Mensual') + '</span>'",
"                        + '<button title=\"Editar este mes\" onclick=\"event.stopPropagation(); editarRegistro(' + reg.id + ')\" class=\"text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 rounded-lg transition-colors\"><svg class=\"w-4 h-4 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"></path></svg></button></div>'",
"                        + '<div class=\"flex flex-wrap gap-1\">' + (cats || '<span class=\"text-[11px] text-slate-400 font-medium\">Sin categorías planificadas.</span>') + '</div>'",
"                        + barra",
"                        + '</div>';",
"                }).join('');",
"",
"                const movsHTML = movs.map(function(m) {",
"                    const esIng = m.tipo === 'ingreso';",
"                    return '<div class=\"flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/80\">'",
"                        + '<span class=\"text-[11px] text-slate-500 dark:text-slate-400 truncate\">' + (m.fecha ? aaEsc(m.fecha.slice(8)) + ' · ' : '') + aaEsc(m.desc || 'Movimiento') + (m.origen ? ' · ' + aaEsc(m.origen) : '') + (m.cat ? ' · 🏷 ' + aaEsc(m.cat) : '') + '</span>'",
"                        + '<span class=\"flex items-center gap-1.5 flex-shrink-0\"><span class=\"text-[11px] font-extrabold ' + (esIng ? 'c-positivo' : 'c-gasto') + '\">' + (esIng ? '+$' : '-$') + (Number(m.monto) || 0).toLocaleString() + '</span>'",
"                        + '<button class=\"text-slate-300 hover:text-red-500 transition-colors text-xs\" title=\"Eliminar del archivo\" onclick=\"arcEliminarMovimiento(\\'' + mes + '\\', \\'' + m.id + '\\')\"><svg class=\"w-3.5 h-3.5 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 7h16\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 11v6M14 11v6\"></path></svg></button></span>'",
"                        + '</div>';",
"                }).join('');",
"                const movsBloque = d.archs.length",
"                    ? '<div><div class=\"text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1.5\">Movimientos reales</div>' + (movsHTML ? '<div class=\"space-y-1.5\">' + movsHTML + '</div>' : '<div class=\"text-[11px] text-slate-400 font-medium\">' + (q ? 'Sin resultados de la búsqueda en este mes.' : 'Sin movimientos reales registrados en este mes.') + '</div>') + '</div>'",
"                    : '';",
"",
"                return '<div class=\"rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800\">'",
"                    + '<div class=\"p-4 bg-slate-50 dark:bg-slate-900/50 cursor-pointer select-none flex flex-wrap items-center justify-between gap-2\" onclick=\"histToggleMes(\\'' + mes + '\\')\">'",
"                    + '<div class=\"min-w-0\"><h4 class=\"text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2\">📦 ' + mesNombreLargo(mes)",
"                    + (d.planes.length ? '<span class=\"text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded font-bold\">' + (d.planes.length > 1 ? d.planes.length + ' planes' : aaEsc((dominante && dominante.periodo) || 'Mensual')) + '</span>' : '')",
"                    + (d.planes.some(p => p.autoCierre) ? '<span class=\"text-[9px] text-amber-600 dark:text-amber-400 font-bold\" title=\"Registro creado al cerrar el mes\">📦 cierre auto</span>' : '') + '</h4>'",
"                    + '<div>' + metaCierre + '</div></div>'",
"                    + '<div class=\"flex flex-wrap gap-1.5 items-center\">' + chipsK",
"                    + '<span class=\"flex items-center gap-1 flex-shrink-0\">'",
"                    + '<button title=\"Eliminar este mes completo (plan + archivo)\" onclick=\"event.stopPropagation(); borrarMesCompleto(\\'' + mes + '\\')\" class=\"p-1 text-slate-300 hover:text-red-500 transition-colors\"><svg class=\"w-4 h-4 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\"></path></svg></button>'",
"                    + '<svg id=\"histChev-' + mes + '\" class=\"w-4 h-4 text-slate-400 transition-transform' + (abierta ? ' rotate-180' : '') + '\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"></path></svg>'",
"                    + '</span></div></div>'",
"                    + '<div id=\"histBody-' + mes + '\" class=\"border-t border-slate-100 dark:border-slate-700/60 p-3 sm:p-4 space-y-3' + (abierta ? '' : ' hidden') + '\">'",
"                    + planesHTML + movsBloque",
"                    + '</div>'",
"                    + '</div>';",
"            }).join('');",
"",
"            cont.innerHTML = html || '<div class=\"text-center py-10 text-slate-400 dark:text-slate-500 text-sm font-medium\">Ningún movimiento coincide con la búsqueda' + (histAnioActivo ? ' en ' + histAnioActivo : '') + '.</div>';",
"            const cuenta = document.getElementById('lblCuentaHist');",
"            if (cuenta) cuenta.textContent = visible.length + ' mes' + (visible.length === 1 ? '' : 'es') + ' · ' + cuentaMovs + ' movimiento' + (cuentaMovs === 1 ? '' : 's') + (q ? ' (filtrado)' : '');",
"            if (typeof actualizarKPIs === 'function') actualizarKPIs();",
"        }",
"",
"        window.borrarMesCompleto = function(mes) {",
"            triggerHaptic();",
"            const mm = String(mes || '').slice(0, 7);",
"            const regs = getHist().filter(r => String(r.fechaStr || '').slice(0, 7) === mm);",
"            const archs = getArchivoMensual().filter(a => String(a.mes || '').slice(0, 7) === mm);",
"            if (!regs.length && !archs.length) return;",
"            const detalle = [",
"                regs.length ? regs.length + (regs.length === 1 ? ' registro del plan' : ' registros del plan') : '',",
"                archs.length ? archs.length + (archs.length === 1 ? ' archivo de movimientos' : ' archivos de movimientos') : ''",
"            ].filter(Boolean).join(' y ');",
"            showModal('<svg class=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 7h16\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 11v6M14 11v6\"></path></svg>Borrar Mes', '¿Seguro que deseas eliminar TODO lo de este mes (' + mesNombreLargo(mm) + ')? Se borrarán ' + detalle + '. Esta acción no se puede deshacer.', 'Sí, Eliminar', 'bg-red-600 hover:bg-red-700', function() {",
"                localStorage.setItem('historialUltimate', JSON.stringify(getHist().filter(r => String(r.fechaStr || '').slice(0, 7) !== mm)));",
"                guardarArchivoMensual(getArchivoMensual().filter(a => String(a.mes || '').slice(0, 7) !== mm));",
"                cargarTablaHistorial();",
"                mostrarToast('Mes eliminado del historial', 'info');",
"            });",
"        };"
  ]),
  1
];

/* ================= F8: toast del cierre auto ================= */
const R8_TOAST = [
"                    setTimeout(() => cerrados.forEach(c => mostrarToast('📦 ' + c.mesNombre + ' cerrado' + (c.sobrante > 0 ? ': $' + c.sobrante.toLocaleString() + ' de sobrante sumado a tu ahorro del historial 🎉' : ' — movimientos archivados en Historial y Registro'), 'info')), 900);",
"                    setTimeout(() => cerrados.forEach(c => mostrarToast('📦 ' + c.mesNombre + ' cerrado' + (c.sobrante > 0 ? ': $' + c.sobrante.toLocaleString() + ' de sobrante sumado a tu ahorro del historial 🎉' : ' — movimientos archivados en el Historial'), 'info')), 900);",
  1
];

/* ================= F9: comentario + cambiarTabHistorial (2 pestañas) ================= */
const R9_TABS = [
  j([
"        /* ==================================================",
"           v0.13 — HISTORIAL Y REGISTRO: pestañas + 📦 Archivo Mensual",
"           ================================================== */",
"        window.cambiarTabHistorial = function(tab) {",
"            const reg = document.getElementById('subTabRegistros'), arc = document.getElementById('subTabArchivo'), plan = document.getElementById('subTabPlan');",
"            if (!reg || !arc) return;",
"            const onCls = 'hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-extrabold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5';",
"            const offCls = 'hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5';",
"            reg.classList.toggle('hidden', tab !== 'registros');",
"            arc.classList.toggle('hidden', tab !== 'archivo');",
"            if (plan) plan.classList.toggle('hidden', tab !== 'plan');",
"            const bR = document.getElementById('btnTabHistRegistros'), bA = document.getElementById('btnTabHistArchivo');",
"            if (bR) bR.className = tab === 'registros' ? onCls : offCls;",
"            if (bA) bA.className = tab === 'archivo' ? onCls : offCls;",
"            const bP = document.getElementById('btnTabHistPlan');",
"            if (bP) bP.className = tab === 'plan' ? onCls : offCls;",
"            if (tab === 'archivo') renderArchivoMensual();",
"            if (tab === 'plan') {",
"                if (!modoEdicionActivo) resetearSimulador();",
"                if (typeof renderizarCategorias === 'function') renderizarCategorias();",
"                if (typeof crearGraficaPresupuesto === \"function\") {",
"                    if (typeof miGrafica !== 'undefined' && miGrafica) { miGrafica.destroy(); miGrafica = null; }",
"                    crearGraficaPresupuesto();",
"                }",
"                if (typeof actualizarCalculos === \"function\") actualizarCalculos();",
"            }",
"        };"
  ]),
  j([
"        /* ==================================================",
"           v0.24.11 — HISTORIAL unificado: 2 pestañas (📦 Historial, 📊 Plan del Mes).",
"           Una tarjeta por mes con su plan y sus movimientos reales (JOIN en vivo);",
"           los alias 'registros'/'archivo' siguen funcionando por compatibilidad.",
"           ================================================== */",
"        window.cambiarTabHistorial = function(tab) {",
"            const hv = document.getElementById('subTabHistorial'), plan = document.getElementById('subTabPlan');",
"            if (!hv || !plan) return;",
"            if (tab === 'registros' || tab === 'archivo') tab = 'historial'; /* alias retrocompatible v0.13 */",
"            const onCls = 'hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-extrabold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1.5';",
"            const offCls = 'hist-tab flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5';",
"            hv.classList.toggle('hidden', tab !== 'historial');",
"            plan.classList.toggle('hidden', tab !== 'plan');",
"            const bH = document.getElementById('btnTabHistRegistros'), bP = document.getElementById('btnTabHistPlan');",
"            if (bH) bH.className = tab === 'historial' ? onCls : offCls;",
"            if (bP) bP.className = tab === 'plan' ? onCls : offCls;",
"            if (tab === 'historial') cargarTablaHistorial();",
"            if (tab === 'plan') {",
"                if (!modoEdicionActivo) resetearSimulador();",
"                if (typeof renderizarCategorias === 'function') renderizarCategorias();",
"                if (typeof crearGraficaPresupuesto === \"function\") {",
"                    if (typeof miGrafica !== 'undefined' && miGrafica) { miGrafica.destroy(); miGrafica = null; }",
"                    crearGraficaPresupuesto();",
"                }",
"                if (typeof actualizarCalculos === \"function\") actualizarCalculos();",
"            }",
"        };"
  ]),
  1
];

/* ================= F10: fuera renderArchivoMensual ================= */
const R10_ARCHIVO_FN = [
  '\n' + j([
"        function renderArchivoMensual() {",
"            const cont = document.getElementById('listaArchivoMensual');",
"            if (!cont) return;",
"            const archivo = getArchivoMensual().slice().sort((a, b) => String(b.mes).localeCompare(String(a.mes)));",
"            if (!archivo.length) {",
"                cont.innerHTML = '<div class=\"text-center py-14 text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-2\"><span class=\"text-4xl\">📦</span><p class=\"font-semibold\">El archivo mensual está vacío.</p><p class=\"text-xs max-w-sm\">Cada vez que termina un mes, Maatly lo cierra automáticamente: guarda sus movimientos y sus totales, y suma el sobrante a tu ahorro del historial. Los meses cerrados aparecerán aquí.</p></div>';",
"                return;",
"            }",
"            const fmt = n => (n < 0 ? '-$' : '$') + Math.abs(Number(n) || 0).toLocaleString();",
"            cont.innerHTML = archivo.map(function(a) {",
"                const k = a.kpis || {};",
"                const idx = getArchivoMensual().findIndex(x => x.mes === a.mes);",
"                const movs = (a.movimientos || []).slice().sort((x, y) => String(y.fecha).localeCompare(String(x.fecha)));",
"                const movsHTML = movs.map(function(m) {",
"                    const esIng = m.tipo === 'ingreso';",
"                    return '<div class=\"flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/80\">'",
"                        + '<span class=\"text-[11px] text-slate-500 dark:text-slate-400 truncate\">' + (m.fecha ? aaEsc(m.fecha.slice(8)) + ' · ' : '') + aaEsc(m.desc || 'Movimiento') + (m.origen ? ' · ' + aaEsc(m.origen) : '') + (m.cat ? ' · 🏷 ' + aaEsc(m.cat) : '') + '</span>'",
"                        + '<span class=\"flex items-center gap-1.5 flex-shrink-0\"><span class=\"text-[11px] font-extrabold ' + (esIng ? 'c-positivo' : 'c-gasto') + '\">' + (esIng ? '+$' : '-$') + (Number(m.monto) || 0).toLocaleString() + '</span>'",
"                        + '<button class=\"text-slate-300 hover:text-red-500 transition-colors text-xs\" title=\"Eliminar del archivo\" onclick=\"arcEliminarMovimiento(' + idx + ', \\'' + m.id + '\\')\"><svg class=\"w-3.5 h-3.5 align-middle\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 7h16\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 11v6M14 11v6\"></path></svg></button></span>'",
"                        + '</div>';",
"                }).join('');",
"                const chip = (txt, cls) => '<span class=\"text-[10px] font-extrabold px-2 py-0.5 rounded-md ' + cls + '\">' + txt + '</span>';",
"                return '<div class=\"rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden\">'",
"                    + '<div class=\"p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2\">'",
"                    + '<div class=\"min-w-0\"><h4 class=\"text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2\">📦 ' + mesNombreLargo(a.mes) + '</h4>'",
"                    + '<span class=\"text-[10px] text-slate-400 font-semibold\">Cerrado el ' + kbFmtFechaCorta(a.fechaCierre) + ' · ' + movs.length + ' movimiento' + (movs.length === 1 ? '' : 's') + '</span></div>'",
"                    + '<div class=\"flex flex-wrap gap-1.5\">'",
"                    + chip('Ingresos ' + fmt(k.ingreso), 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200')",
"                    + chip('Ahorro ' + fmt(k.ahorro) + (Number(k.sobrante) > 0 ? ' 🎉' : ''), 'bg-positivo-suave c-positivo')",
"                    + chip('Gastos plan ' + fmt(k.gastoPlan), 'bg-alarma-suave c-gasto')",
"                    + chip('Reales ' + fmt(k.gastoReal), 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300')",
"                    + chip('Sobrante ' + fmt(k.resultado), Number(k.resultado) >= 0 ? 'bg-positivo-suave c-positivo' : 'bg-alarma-suave c-alarma')",
"                    + '</div></div>'",
"                    + (movs.length ? '<div class=\"p-3 space-y-1.5\">' + movsHTML + '</div>' : '<div class=\"p-3 text-[11px] text-slate-400 font-medium\">Sin movimientos reales registrados en este mes.</div>')",
"                    + '</div>';",
"            }).join('');",
"        }"
  ]) + '\n',
  '',
  1
];

/* ================= F11: arcEliminarMovimiento por mes ================= */
const R11_ARC_ELIM = [
  j([
"        window.arcEliminarMovimiento = function(idx, movId) {",
"            triggerHaptic();",
"            const archivo = getArchivoMensual();",
"            const entrada = archivo[idx];",
"            const mov = entrada && (entrada.movimientos || []).find(m => m.id === movId);",
"            if (!mov) return;",
"            showModal('<svg class=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 7h16\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 11v6M14 11v6\"></path></svg>Eliminar Movimiento Archivado', '¿Eliminar \"' + (mov.desc || 'Movimiento') + '\" del archivo de ' + mesNombreLargo(entrada.mes) + '? (Los totales guardados del mes cerrado no cambian)', 'Sí, Eliminar', 'bg-red-600 hover:bg-red-700', function() {",
"                entrada.movimientos = entrada.movimientos.filter(m => m.id !== movId);",
"                guardarArchivoMensual(archivo);",
"                renderArchivoMensual();",
"                mostrarToast('Movimiento eliminado del archivo', 'info');",
"            });",
"        };"
  ]),
  j([
"        window.arcEliminarMovimiento = function(mes, movId) {",
"            triggerHaptic();",
"            const mm = String(mes || '').slice(0, 7);",
"            const archivo = getArchivoMensual();",
"            const entrada = archivo.find(a => String(a.mes || '').slice(0, 7) === mm);",
"            const mov = entrada && (entrada.movimientos || []).find(m => m.id === movId);",
"            if (!mov) return;",
"            showModal('<svg class=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 7h16\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 11v6M14 11v6\"></path></svg>Eliminar Movimiento Archivado', '¿Eliminar \"' + (mov.desc || 'Movimiento') + '\" del archivo de ' + mesNombreLargo(mm) + '? (Los totales guardados del mes cerrado no cambian)', 'Sí, Eliminar', 'bg-red-600 hover:bg-red-700', function() {",
"                entrada.movimientos = entrada.movimientos.filter(m => m.id !== movId);",
"                guardarArchivoMensual(archivo);",
"                cargarTablaHistorial();",
"                mostrarToast('Movimiento eliminado del archivo', 'info');",
"            });",
"        };"
  ]),
  1
];

/* ================= F12: call site en cambiarVista ================= */
const R12_VISTA = [
"                if (typeof renderArchivoMensual === 'function') renderArchivoMensual();",
"                if (typeof cargarTablaHistorial === 'function') cargarTablaHistorial();",
  1
];

/* ================= F13: call site en btnLimpiar ================= */
const R13_LIMPIAR = [
"                    localStorage.removeItem('historialUltimate'); localStorage.removeItem('maatlyArchivoMensual'); localStorage.removeItem('maatlyMetasCumplidas'); renderArchivoMensual(); cargarTablaHistorial(); mostrarToast(\"Historial formateado\", \"error\"); ",
"                    localStorage.removeItem('historialUltimate'); localStorage.removeItem('maatlyArchivoMensual'); localStorage.removeItem('maatlyMetasCumplidas'); cargarTablaHistorial(); mostrarToast(\"Historial formateado\", \"error\"); ",
  1
];

/* ================= F14: call site muerto del arranque fuera ================= */
const R14_BOOT = [
  j([
"            kbPintarFiltroActividades();",
"            renderArchivoMensual();"
  ]),
  j([
"            kbPintarFiltroActividades();"
  ]),
  1
];

/* ================= F15: badge ================= */
const R15_BADGE = [">v0.24.10</span>", ">v0.24.11</span>", 1];

const R = [R1_TAB, R2_TITULO, R3_SUBTITULO, R4_CONTENIDO, R5_ARCHIVO_DEL, R6_TB, R7_RENDERER, R8_TOAST, R9_TABS, R10_ARCHIVO_FN, R11_ARC_ELIM, R12_VISTA, R13_LIMPIAR, R14_BOOT, R15_BADGE];

/* ---------- pre-aserciones ---------- */
asertar(contar(orig, '>v0.24.10</span>') === 1, 'pre: badge v0.24.10 = ' + contar(orig, '>v0.24.10</span>') + ' (¿revert de OneDrive?)');
asertar(contar(orig, 'renderArchivoMensual') === 7, 'pre: renderArchivoMensual = ' + contar(orig, 'renderArchivoMensual') + ' (se esperaba 7)');
asertar(contar(orig, 'tablaHistorialBody') === 2, 'pre: tablaHistorialBody = ' + contar(orig, 'tablaHistorialBody'));
asertar(contar(orig, 'listaArchivoMensual') === 2, 'pre: listaArchivoMensual = ' + contar(orig, 'listaArchivoMensual'));
asertar(contar(orig, 'subTabArchivo') === 2, 'pre: subTabArchivo = ' + contar(orig, 'subTabArchivo'));
asertar(contar(orig, 'subTabRegistros') === 2, 'pre: subTabRegistros = ' + contar(orig, 'subTabRegistros'));
asertar(contar(orig, 'btnTabHistArchivo') === 2, 'pre: btnTabHistArchivo = ' + contar(orig, 'btnTabHistArchivo'));
asertar(contar(orig, 'borrarRegistro') === 2, 'pre: borrarRegistro = ' + contar(orig, 'borrarRegistro'));
asertar(contar(orig, 'editarRegistro') === 2, 'pre: editarRegistro = ' + contar(orig, 'editarRegistro'));
asertar(contar(orig, 'cambiarTabHistorial') === 6, 'pre: cambiarTabHistorial = ' + contar(orig, 'cambiarTabHistorial'));
asertar(contar(orig, 'mensajeVacio') === 3, 'pre: mensajeVacio = ' + contar(orig, 'mensajeVacio'));
asertar(contar(orig, 'getArchivoMensual') === 8, 'pre: getArchivoMensual = ' + contar(orig, 'getArchivoMensual'));
asertar(contar(orig, 'guardarArchivoMensual') === 3, 'pre: guardarArchivoMensual = ' + contar(orig, 'guardarArchivoMensual'));
asertar(contar(orig, 'Plan del Mes') === 14, 'pre: Plan del Mes = ' + contar(orig, 'Plan del Mes'));
asertar(contar(orig, '🎉') === 24, 'pre: 🎉 = ' + contar(orig, '🎉'));
asertar(contar(orig, '📦') === 8, 'pre: 📦 = ' + contar(orig, '📦'));
asertar(contar(orig, 'event.stopPropagation') === 2, 'pre: stopPropagation = ' + contar(orig, 'event.stopPropagation'));
asertar(contar(orig, 'hist-tab') === 5, 'pre: hist-tab = ' + contar(orig, 'hist-tab'));
asertar(contar(orig, 'maatlyArchivoMensual') === 12, 'pre: maatlyArchivoMensual = ' + contar(orig, 'maatlyArchivoMensual'));
asertar(contar(orig, 'historialUltimate') === 15, 'pre: historialUltimate = ' + contar(orig, 'historialUltimate'));
asertar(contar(orig, 'triggerHaptic') === 79, 'pre: triggerHaptic = ' + contar(orig, 'triggerHaptic'));
asertar(contar(orig, 'showModal') === 21, 'pre: showModal = ' + contar(orig, 'showModal'));
asertar(contar(orig, 'mostrarToast') === 98, 'pre: mostrarToast = ' + contar(orig, 'mostrarToast'));
asertar(contar(orig, 'renderAhorroAcumuladoWidget') === 12, 'pre: renderAhorroAcumuladoWidget = ' + contar(orig, 'renderAhorroAcumuladoWidget'));
/* guardas contra doble aplicación / colisión de nombres nuevos */
asertar(contar(orig, 'listaHistorialUnificado') === 0, 'pre: listaHistorialUnificado ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'subTabHistorial') === 0, 'pre: subTabHistorial ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'borrarMesCompleto') === 0, 'pre: borrarMesCompleto ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'histAnios') === 0, 'pre: histAnios ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'inputBuscaMovs') === 0, 'pre: inputBuscaMovs ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'lblCuentaHist') === 0, 'pre: lblCuentaHist ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'histToggleMes') === 0, 'pre: histToggleMes ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'histExpandido') === 0, 'pre: histExpandido ya existe (¿aplicado dos veces?)');
/* estables v0.24.10 */
asertar(contar(orig, 'LEYENDA_GRAF') === 4, 'pre: LEYENDA_GRAF = ' + contar(orig, 'LEYENDA_GRAF'));
asertar(contar(orig, 'DATALABELS_PCT') === 3, 'pre: DATALABELS_PCT = ' + contar(orig, 'DATALABELS_PCT'));
asertar(contar(orig, 'ntfTickDinero') === 2, 'pre: ntfTickDinero = ' + contar(orig, 'ntfTickDinero'));
asertar(contar(orig, 'GS_CELL') === 4, 'pre: GS_CELL = ' + contar(orig, 'GS_CELL'));
asertar(contar(orig, 'sel-maatly') === 15, 'pre: sel-maatly = ' + contar(orig, 'sel-maatly'));
asertar(contar(orig, 'sidebar-collapsed') === 11, 'pre: sidebar-collapsed = ' + contar(orig, 'sidebar-collapsed'));

/* ---------- EJECUCIÓN ---------- */
let hechos = 0;
for (const [de, a, esperado] of R) {
  const c = contar(s, de);
  asertar(c === esperado, 'patron [' + String(de).slice(0, 60).replace(/\n/g, '~') + '] aparece ' + c + ' veces (se esperaba ' + esperado + ')');
  if (c === esperado) { s = s.split(de).join(a); hechos += c; }
}

/* ---------- post-aserciones ---------- */
asertar(contar(s, '>v0.24.11</span>') === 1, 'post: badge v0.24.11 = ' + contar(s, '>v0.24.11</span>'));
asertar(contar(s, '>v0.24.10</span>') === 0, 'post: quedo badge v0.24.10');
asertar(contar(s, 'renderArchivoMensual') === 0, 'post: renderArchivoMensual residual = ' + contar(s, 'renderArchivoMensual'));
asertar(contar(s, 'tablaHistorialBody') === 0, 'post: tablaHistorialBody residual');
asertar(contar(s, 'listaArchivoMensual') === 0, 'post: listaArchivoMensual residual');
asertar(contar(s, 'subTabArchivo') === 0, 'post: subTabArchivo residual');
asertar(contar(s, 'subTabRegistros') === 0, 'post: subTabRegistros residual');
asertar(contar(s, 'btnTabHistArchivo') === 0, 'post: btnTabHistArchivo residual');
asertar(contar(s, 'borrarRegistro') === 0, 'post: borrarRegistro residual');
asertar(contar(s, 'subTabHistorial') === 2, 'post: subTabHistorial = ' + contar(s, 'subTabHistorial'));
asertar(contar(s, 'listaHistorialUnificado') === 2, 'post: listaHistorialUnificado = ' + contar(s, 'listaHistorialUnificado'));
asertar(contar(s, 'borrarMesCompleto') === 2, 'post: borrarMesCompleto = ' + contar(s, 'borrarMesCompleto'));
asertar(contar(s, 'histAnios') === 2, 'post: histAnios = ' + contar(s, 'histAnios'));
asertar(contar(s, 'inputBuscaMovs') === 2, 'post: inputBuscaMovs = ' + contar(s, 'inputBuscaMovs'));
asertar(contar(s, 'lblCuentaHist') === 3, 'post: lblCuentaHist = ' + contar(s, 'lblCuentaHist') + ' (se esperaba 3: markup + 2 usos)');
asertar(contar(s, 'histToggleMes') === 2, 'post: histToggleMes = ' + contar(s, 'histToggleMes'));
asertar(contar(s, 'histAnioBtn') === 2, 'post: histAnioBtn = ' + contar(s, 'histAnioBtn'));
asertar(contar(s, 'histBody-') === 2, 'post: histBody- = ' + contar(s, 'histBody-'));
asertar(contar(s, 'cambiarTabHistorial') === 5, 'post: cambiarTabHistorial = ' + contar(s, 'cambiarTabHistorial') + ' (se esperaba 5)');
asertar(contar(s, 'cargarTablaHistorial') === 12, 'post: cargarTablaHistorial = ' + contar(s, 'cargarTablaHistorial') + ' (se esperaba 12)');
asertar(contar(s, 'editarRegistro') === 2, 'post: editarRegistro = ' + contar(s, 'editarRegistro'));
asertar(contar(s, 'arcEliminarMovimiento') === 2, 'post: arcEliminarMovimiento = ' + contar(s, 'arcEliminarMovimiento'));
asertar(contar(s, 'getArchivoMensual') === 9, 'post: getArchivoMensual = ' + contar(s, 'getArchivoMensual') + ' (se esperaba 9)');
asertar(contar(s, 'guardarArchivoMensual') === 4, 'post: guardarArchivoMensual = ' + contar(s, 'guardarArchivoMensual') + ' (se esperaba 4: def + arcElim + borrarMes + cierre)');
asertar(contar(s, 'mensajeVacio') === 2, 'post: mensajeVacio = ' + contar(s, 'mensajeVacio') + ' (se esperaba 2: markup + vacioEl)');
asertar(contar(s, 'Plan del Mes') === 15, 'post: Plan del Mes = ' + contar(s, 'Plan del Mes') + ' (se esperaba 15)');
asertar(contar(s, '🎉') === 23, 'post: 🎉 = ' + contar(s, '🎉') + ' (se esperaba 23)');
asertar(contar(s, '📦') === 7, 'post: 📦 = ' + contar(s, '📦') + ' (se esperaba 7)');
asertar(contar(s, 'event.stopPropagation') === 4, 'post: stopPropagation = ' + contar(s, 'event.stopPropagation') + ' (se esperaba 4)');
asertar(contar(s, 'hist-tab') === 4, 'post: hist-tab = ' + contar(s, 'hist-tab'));
asertar(contar(s, 'triggerHaptic') === 80, 'post: triggerHaptic = ' + contar(s, 'triggerHaptic') + ' (se esperaba 80)');
asertar(contar(s, 'showModal') === 21, 'post: showModal = ' + contar(s, 'showModal'));
asertar(contar(s, 'mostrarToast') === 98, 'post: mostrarToast = ' + contar(s, 'mostrarToast'));
asertar(contar(s, 'renderAhorroAcumuladoWidget') === 12, 'post: renderAhorroAcumuladoWidget = ' + contar(s, 'renderAhorroAcumuladoWidget'));
asertar(contar(s, 'actualizarKPIs') === 10, 'post: actualizarKPIs = ' + contar(s, 'actualizarKPIs') + ' (se esperaba 10; 2 guardas cuentan doble por línea)');
asertar(contar(s, 'archivados en el Historial') === 1, 'post: toast nuevo = ' + contar(s, 'archivados en el Historial'));
asertar(contar(s, 'maatlyArchivoMensual') === 13, 'post: maatlyArchivoMensual = 12 + 1 del comentario (claves intactas)');
asertar(contar(s, 'historialUltimate') === 16, 'post: historialUltimate = 15 + 1 del comentario (claves intactas)');
asertar(contar(s, 'LEYENDA_GRAF') === 4, 'post: LEYENDA_GRAF estable');
asertar(contar(s, 'DATALABELS_PCT') === 3, 'post: DATALABELS_PCT estable');
asertar(contar(s, 'ntfTickDinero') === 2, 'post: ntfTickDinero estable');
asertar(contar(s, 'GS_CELL') === 4, 'post: GS_CELL estable');
asertar(contar(s, 'sel-maatly') === 15, 'post: sel-maatly estable');
asertar(contar(s, 'sidebar-collapsed') === 11, 'post: sidebar-collapsed estable');
asertar(contar(s, 'Ã') === 0 && contar(s, 'Â') === 0, 'mojibake detectado');
const DELTA_ESPERADO = R.reduce((acc, [de, a, esperado]) => acc + (a.length - de.length) * esperado, 0);
asertar(s.length === orig.length + DELTA_ESPERADO, 'delta de tamano debe ser ' + DELTA_ESPERADO + ' (es ' + (s.length - orig.length) + ')');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- unifhist_edits (v0.24.10 -> v0.24.11) ---');
console.log('reemplazos:', hechos, 'de', R.length, 'patrones');
console.log('original :', orig.length, 'caracteres, lineas: ' + (orig.split('\n').length));
console.log('resultado:', s.length, 'caracteres (delta ' + (s.length - orig.length) + '), lineas: ' + (s.split('\n').length));
console.log('renderArchivoMensual:', contar(s, 'renderArchivoMensual'), '| listaHistorialUnificado:', contar(s, 'listaHistorialUnificado'), '| borrarMesCompleto:', contar(s, 'borrarMesCompleto'), '| badge v0.24.11:', contar(s, '>v0.24.11</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
