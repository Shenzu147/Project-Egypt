/* v0.24 «Rediseño estilo fintech» — fundación tipográfica + marco + panel de inicio.
 * Mecánica probada: reemplazos exactos con aserciones; aborta sin escribir si algo no cuadra. */
const fs = require('fs');
const P = 'C:/Users/jdeb1/OneDrive/Desktop/Maatly App/Maatly_v0.23.html';
let s = fs.readFileSync(P, 'utf8');
const pre = s.length;
const errores = [];

function tc(t, token) { return t.split(token).length - 1; }
function rep(old, neu, cnt) {
    const g = s.split(old).length - 1;
    if (g !== cnt) { errores.push('[REP] esperado ' + cnt + ' y hay ' + g + ' => ' + JSON.stringify(old.slice(0, 90))); return; }
    s = s.split(old).join(neu);
}

/* ============ A) FUNDACIÓN: fuentes + config tailwind + bloque CSS ============ */
rep(`    <style>`,
`    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <style>`, 1);

rep(`        tailwind.config = { darkMode: 'class', theme: { extend: {} } }`,
`        tailwind.config = { darkMode: 'class', theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'], display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] } } } }`, 1);

rep(`    </style>`,
`    /* ============ v0.24: REDISENO FINTECH (Inter + Space Grotesk, reglas del brief) ============ */
    .kpi-num, .font-display, .num-sg { font-family: 'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
    #sidebar { background: linear-gradient(180deg, #0b1220 0%, #101b31 100%); }
    .sidebar-collapsed .nav-btn { justify-content: center; padding-left: .8rem; padding-right: .8rem; gap: 0; }
    .dark #sidebar { background: linear-gradient(180deg, #0b1220 0%, #0e1728 100%); }
    .logo-bg { background: var(--c-info) !important; }
    /* los temas office/nature/gemini conservan sus gradientes (mayor especificidad) */
    #scrollerPrincipal { background: #f6f7f9; }
    .dark #scrollerPrincipal { background: #0f172a; }
    :focus-visible { outline: 2px solid var(--c-info); outline-offset: 2px; }

    /* --- Hero KPI (Disponible / Sobrante) en navy --- */
    #sortableGrid.grid-stack > .grid-stack-item[gs-id="kDisp"], #gridHistorico.grid-stack > .grid-stack-item[gs-id="kDisp"] { background: transparent !important; border: 0 !important; box-shadow: none !important; }
    #sortableGrid.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content, #gridHistorico.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content { background: linear-gradient(155deg, #0b1220, #13234a); border-color: #1e293b; box-shadow: 0 14px 34px -18px rgba(2, 8, 23, .55); }
    #cajaRestanteInicio .c-positivo { color: #2ee27a; }
    #cajaRestanteInicio .c-alarma { color: #f87171; }
    #cajaRestanteInicio .bs-equiv { color: #94a3b8; }

    /* --- Bottom-nav móvil navy (decisión v0.24: fiel al mockup) --- */
    .mobile-bottom-nav { background: rgba(11, 18, 32, 0.96); border-color: #1e293b; }
    .mobile-bottom-nav .active-tab { color: #a5b4fc !important; }
    </style>`, 1);

/* ============ B) MARCO: sidebar/topbar/movil ============ */
/* Monograma sólido (fuera el gradiente decorativo del tema default) */
rep(`<div class="w-8 h-8 rounded-xl logo-bg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black shadow-lg flex-shrink-0">M</div>`,
`<div class="w-8 h-8 rounded-xl logo-bg bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg flex-shrink-0">M</div>`, 1);
rep(`<div class="w-7 h-7 rounded-lg logo-bg sm:hidden bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">M</div>`,
`<div class="w-7 h-7 rounded-lg logo-bg sm:hidden bg-indigo-600 flex items-center justify-center text-white text-xs font-black">M</div>`, 1);

/* Versión de la app */ 
rep(`flex-shrink-0">v0.21</span>`, `flex-shrink-0">v0.24</span>`, 1);

/* Tooltips del rail solo-iconos */
rep(`bg-indigo-600 text-white shadow-md group" data-target="vistaInicio">`,
`bg-indigo-600 text-white shadow-md group" title="Panel de Inicio" data-target="vistaInicio">`, 1);
rep(`hover:bg-slate-800 hover:text-white group" data-target="vistaAgenda">`,
`hover:bg-slate-800 hover:text-white group" title="Agenda y Calendario" data-target="vistaAgenda">`, 1);
rep(`hover:bg-slate-800 hover:text-white group" data-target="vistaActividades">`,
`hover:bg-slate-800 hover:text-white group" title="Actividades" data-target="vistaActividades">`, 1);
rep(`hover:bg-slate-800 hover:text-white group" data-target="vistaHistorial">`,
`hover:bg-slate-800 hover:text-white group" title="Historial y Registros" data-target="vistaHistorial">`, 1);
rep(`hover:bg-slate-800 hover:text-white group text-slate-400 hover:text-indigo-400" data-target="vistaConfiguracion">`,
`hover:bg-slate-800 hover:text-white group text-slate-400 hover:text-indigo-400" title="Configuración" data-target="vistaConfiguracion">`, 1);

/* Topbar: SVG coherente para Gastos/Ingresos (fuera el emoji de chrome) */
rep(`<span class="text-base leading-none">&#128184;</span>`,
`<svg class="w-4 h-4 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h13M13 4l4 4-4 4M20 16H7M11 20l-4-4 4-4"></path></svg>`, 1);

/* Bottom-nav móvil: el fondo navy pasa del markup al CSS (decisión #1) */
rep(`class="mobile-bottom-nav sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-1 shadow-2xl"`,
`class="mobile-bottom-nav sm:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t flex justify-around items-center h-16 px-1 shadow-2xl"`, 1);

/* ============ C) PANEL DE INICIO ============ */
/* Control segmentado (píldora blanca dentro de superficie gris, como el mockup) — anclado al botón Mes Actual para no tocar el gemelo del Historial (L~1108) */
rep(`<div class="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1 border border-slate-300 dark:border-slate-700 w-full sm:w-auto">
                        <button id="btnSubTabActual"`,
`<div class="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl gap-1.5 border border-slate-200 dark:border-slate-800 w-full sm:w-auto shadow-sm">
                        <button id="btnSubTabActual"`, 1);
rep(`<button id="btnSubTabActual" onclick="cambiarSubTabInicio('actual')" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-2">
                            <span>📅</span> Mes Actual
                        </button>`,
`<button id="btnSubTabActual" onclick="cambiarSubTabInicio('actual')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-2">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Mes Actual
                        </button>`, 1);
rep(`<button id="btnSubTabHistorico" onclick="cambiarSubTabInicio('historico')" class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2">
                            <span>📊</span> Reporte Histórico
                        </button>`,
`<button id="btnSubTabHistorico" onclick="cambiarSubTabInicio('historico')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h16M7 16v-5M12 16V7M17 16v-9"></path></svg> Reporte Histórico
                        </button>`, 1);

/* Etiquetas KPI → eyebrow (3 tarjetas, mismo string) */
rep(`class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1"`,
`class="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-[0.09em] mb-1"`, 3);

/* Hero: estado estimado/real como píldora (el JS re-escribe la clase — edito su línea) */
rep(`nota.className = 'text-[10px] mt-0.5 font-semibold ' + (fuenteMes ? 'text-indigo-500 dark:text-indigo-400' : 'text-amber-500 dark:text-amber-400');`,
`nota.className = 'mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ' + (fuenteMes ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-slate-400/10 text-slate-300 border-slate-400/20');`, 1);

/* Hero: markup inicial coherente con la píldora (primer pincel; el JS luego ajusta) */
rep(`<span class="text-[10px] mt-0.5 font-semibold text-amber-500 dark:text-amber-400" id="lblFuenteKpi">Estimado — aún no guardas este mes</span>`,
`<span class="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border bg-slate-400/10 text-slate-300 border-slate-400/20" id="lblFuenteKpi">Estimado — aún no guardas este mes</span>`, 1);

/* Hero: la Bs. a 12px (regla auxiliares >= 12) */
rep(`<span class="text-[10px] text-slate-400 mt-1 font-semibold bs-equiv" data-vinculo="restanteKpi">—</span>`,
`<span class="text-xs text-slate-400 mt-1 font-semibold bs-equiv" data-vinculo="restanteKpi">—</span>`, 1);

/* Cabeceras unificadas de widgets (título + subtítulo, sin icono en el título) */
rep(`<h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span class="text-base">💰</span>
                                    Movimientos del Mes
                                </h3>`,
`<div class="min-w-0">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Movimientos del Mes</h3>
                                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Actividades y registros manuales</p>
                                </div>`, 1);

rep(`<h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span class="text-base">🎯</span>
                                    Planes de Ahorro
                                </h3>`,
`<div class="min-w-0">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Planes de Ahorro</h3>
                                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Metas activas y progreso</p>
                                </div>`, 1);

rep(`<h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Actividades
                                </h3>`,
`<div class="min-w-0">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Actividades</h3>
                                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Sincronizadas con el tablero</p>
                                </div>`, 1);

rep(`<h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2"><svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Notas Rápidas</h3>`,
`<div class="min-w-0">
                                    <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Notas Rápidas</h3>
                                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Ideas, enlaces y recordatorios</p>
                                </div>`, 1);

/* Filtro de actividades: SVG en vez de lupa-emoji (chrome) */
rep(`class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs transition-colors flex items-center justify-center">🔍</button>`,
`class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs transition-colors flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>`, 1);

/* Notas: estado de guardado con punto, sin emoji de chrome, 11px */
rep(`<span class="text-[9px] font-semibold text-slate-400 flex-shrink-0">💾 Guardado automático</span>`,
`<span class="text-[11px] font-semibold text-slate-400 flex-shrink-0">● Guardado automático</span>`, 1);

/* Barras de progreso sólidas (brief: fuera degradados decorativos) */
rep(`background: linear-gradient(90deg, var(--c-positivo), var(--c-info));`, `background: var(--c-positivo);`, 2);

/* ============ Verificaciones post-edición ============ */
const checks = [
    ['fonts.googleapis.com/css2', 1], ['Space+Grotesk', 1],
    ["'Inter', 'system-ui'", 1],
    ['REDISENO FINTECH', 1], ['tracking-[0.09em]', 3],
    ['[gs-id="kDisp"]', 4], ['#cajaRestanteInicio .c-positivo', 1],
    ['from-indigo-500 via-purple-500 to-pink-500', 0], ['bg-indigo-600 flex items-center justify-center text-white text-xs font-black', 2],
    ['>v0.21</span>', 0], ['>v0.24</span>', 1],
    ['title="Panel de Inicio"', 1], ['title="Agenda y Calendario"', 1],
    ['title="Historial y Registros"', 1], ['title="Configuración"', 1],
    ['&#128184;', 0],
    ['bg-slate-200 dark:bg-slate-800 p-1', 1],
    ['rounded-2xl gap-1.5 border border-slate-200 dark:border-slate-800 w-full sm:w-auto shadow-sm', 1],
    ['<span>📅</span> Mes Actual', 0], ['<span>📊</span> Reporte Histórico', 0],
    ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 4],
    ['text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-[0.09em] mb-1', 3],
    ["nota.className = 'mt-2 inline-flex", 1],
    ['bg-slate-400/10 text-slate-300 border-slate-400/20', 2],
    ['text-[10px] mt-0.5 font-semibold ', 0],
    ['text-xs text-slate-400 mt-1 font-semibold bs-equiv', 1],
    ['Actividades y registros manuales', 1], ['Metas activas y progreso', 1],
    ['Sincronizadas con el tablero', 1],
    ['Ideas, enlaces y recordatorios', 1],
    ['padding-left: .8rem; padding-right: .8rem; gap: 0;', 1],
    ['● Guardado automático', 1], ['💾 Guardado automático', 0],
    ['linear-gradient(90deg, var(--c-positivo), var(--c-info))', 0],
    ['bg-white/95 dark:bg-slate-900/95', 0],
    ['mobile-bottom-nav sm:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md', 1],
    /* intactos */
    ['GS_GAP = 12', 1], ['data-w="', 11], ['grid-stack-item-content', 17],
    ['paddingLeft: cs.paddingLeft', 1], ['function gsLevanta', 1],
    ['function ntfTickDinero', 1], ['maatlyNotifCfg', 2], ['agente-off', 3],
    ['id="scrollerPrincipal"', 1]
];

checks.forEach(pair => {
    const [tok, exp] = pair;
    const g = tc(s, tok);
    if (g !== exp) errores.push('[CHK] "' + tok + '" esperado ' + exp + ', hay ' + g);
});

/* conteos dinámicos (verificados por probe sobre el estado pre-edición) */
const dyn = [
    ['background: var(--c-positivo);', 2],
    ['title="Actividades"', 1],
    ['M4 8h13M13 4l4 4-4 4M20 16H7M11 20l-4-4 4-4', 1]
];
dyn.forEach(pair => { const [tok, exp] = pair; const g = tc(s, tok); if (g !== exp) errores.push('[DYN] "' + tok + '" esperado ' + exp + ', hay ' + g); });

/* compilar los bloques <script> inline para descartar errores de sintaxis */
function compilarScripts(htmlText) {
    const vm = require('vm');
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m, num = 0;
    while ((m = re.exec(htmlText)) !== null) {
        num++;
        try { new vm.Script(m[1]); } catch (e) { errores.push('[JS ' + num + '] ' + e.message); }
    }
    return num;
}
const numScripts = compilarScripts(s);

if (errores.length) {
    console.log('ABORTADO — errores:');
    errores.forEach(e => console.log(' - ' + e));
    process.exit(1);
}

fs.writeFileSync(P, s, 'utf8');
console.log('OK — rediseño aplicado y verificado');
console.log('Scripts inline compilados sin errores: ' + numScripts);
console.log('Tamaño: ' + pre + ' -> ' + Buffer.byteLength(s, 'utf8') + ' bytes');
console.log('Líneas: ' + (s.split('\n').length));
