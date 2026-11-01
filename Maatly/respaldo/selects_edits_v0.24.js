#!/usr/bin/env node
'use strict';
/* =====================================================================
   selects_edits.js — Maatly v0.24.5 -> v0.24.6 (selects unificados)
   Fase 1: CSS .sel-maatly (flecha SVG outline + popup dark) + .sel-maatly-pill
   Fase 2: clase en los 11 <select> + normalizar cursor-pointer (+7)
           y focus:border-indigo-500 (+3)
   Fase 3: badge v0.24.5 -> v0.24.6
   Uso: node selects_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier conteo no cuadra.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node selects_edits.js <ruta.html> [--probe]'); process.exit(1); }
const orig = fs.readFileSync(ruta, 'utf8');
let s = orig;

function contar(pajar, aguja) {
  if (!aguja) return 0;
  let n = 0, i = 0;
  while ((i = pajar.indexOf(aguja, i)) !== -1) { n++; i += aguja.length; }
  return n;
}
const errores = [];
const asertar = (c, m) => { if (!c) errores.push(m); };

/* ---------- FASE 1: CSS ---------- */
const CHEV = function (color) {
  return 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23' + color + '\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")';
};
const CSS =
  '\n        /* v0.24.6 — selects unificados: flecha SVG outline + popup coherente con el tema */\n' +
  '        .sel-maatly { -webkit-appearance: none; appearance: none; background-image: ' + CHEV('64748b') + '; background-repeat: no-repeat; background-position: right 0.55rem center; background-size: 0.85em 0.85em; padding-right: 1.85rem; }\n' +
  '        html.dark .sel-maatly { background-image: ' + CHEV('94a3b8') + '; color-scheme: dark; }\n' +
  '        .sel-maatly-pill { padding-right: 1.35rem; background-position: right 0.35rem center; }\n';

/* ---------- FASE 2: REPS ---------- */
const R = [];
// 4 selects del modal de actividad (misma receta, anclados por id)
['kbTipoSel', 'kbEstadoSel', 'kbMontoTipo', 'kbRecurrencia'].forEach(id => {
  R.push(['<select id="' + id + '" class="w-full px-3 py-2 bg-slate-50',
    '<select id="' + id + '" class="sel-maatly cursor-pointer w-full px-3 py-2 bg-slate-50', 1]);
});
// selOrdenActividades: clase + foco índigo
R.push(['id="selOrdenActividades" onchange="kbSetOrdenActividades(this.value)" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"',
  'id="selOrdenActividades" onchange="kbSetOrdenActividades(this.value)" class="sel-maatly text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"', 1]);
// inputPeriodo
R.push(['<select id="inputPeriodo" onchange="actualizarCalculos()" class="px-3 py-1.5 bg-white',
  '<select id="inputPeriodo" onchange="actualizarCalculos()" class="sel-maatly px-3 py-1.5 bg-white', 1]);
// selectTemaEstilo
R.push(['<select id="selectTemaEstilo" onchange="cambiarTemaEstilo(this.value)" class="w-full sm:w-64 px-4 py-2.5 bg-slate-50',
  '<select id="selectTemaEstilo" onchange="cambiarTemaEstilo(this.value)" class="sel-maatly w-full sm:w-64 px-4 py-2.5 bg-slate-50', 1]);
// píldora de estado Kanban (plantilla JS)
R.push(['class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"',
  'class="sel-maatly sel-maatly-pill text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"', 1]);
// agSelModelo
R.push(['<select id="agSelModelo" class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"',
  '<select id="agSelModelo" class="sel-maatly cursor-pointer px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"', 1]);
// agPinAuto + ntfPushVia (inline en labels; misma clase base -> ancla por id)
['agPinAuto', 'ntfPushVia'].forEach(id => {
  R.push(['<select id="' + id + '" class="ml-1 px-2 py-1 bg-slate-50',
    '<select id="' + id + '" class="sel-maatly cursor-pointer focus:border-indigo-500 ml-1 px-2 py-1 bg-slate-50', 1]);
});
// FASE 3 — badge
R.push(['>v0.24.5</span>', '>v0.24.6</span>', 1]);

/* ---------- pre-aserciones ---------- */
asertar(contar(orig, 'sel-maatly') === 0, 'pre: sel-maatly ya existe (' + contar(orig, 'sel-maatly') + ')');
asertar(contar(orig, '</style>') === 1, 'pre: </style> aparece ' + contar(orig, '</style>') + ' veces (se esperaba 1)');

/* ---------- EJECUCIÓN ---------- */
let hechos = 0;
for (const [de, a, esperado] of R) {
  const c = contar(s, de);
  asertar(c === esperado, 'patrón [' + de.slice(0, 70) + '] aparece ' + c + ' veces (se esperaba ' + esperado + ')');
  if (c === esperado) { s = s.split(de).join(a); hechos += c; }
}
/* inserción CSS (después de los REPS para que el badge no la afecte; da igual, anclas disjuntas) */
asertar(contar(s, '\n    </style>') === 1, 'ancla CSS [\\n    </style>] no única');
s = s.split('\n    </style>').join(CSS + '    </style>');

/* ---------- SANITY ---------- */
asertar(contar(s, 'sel-maatly ') === 13, 'post: [sel-maatly ] = ' + contar(s, 'sel-maatly ') + ' (se esperaba 13: 11 selects + 2 reglas CSS)');
asertar(contar(s, 'sel-maatly-pill') === 2, 'post: [sel-maatly-pill] = ' + contar(s, 'sel-maatly-pill') + ' (se esperaba 2: select + CSS)');
asertar(contar(s, 'cursor-pointer') === contar(orig, 'cursor-pointer') + 7, 'delta cursor-pointer debe ser +7 (es ' + (contar(s, 'cursor-pointer') - contar(orig, 'cursor-pointer')) + ')');
asertar(contar(s, 'focus:border-indigo-500') === contar(orig, 'focus:border-indigo-500') + 3, 'delta focus:border-indigo-500 debe ser +3 (es ' + (contar(s, 'focus:border-indigo-500') - contar(orig, 'focus:border-indigo-500')) + ')');
asertar(contar(s, '-webkit-appearance: none') === contar(orig, '-webkit-appearance: none') + 1, 'delta -webkit-appearance debe ser +1');
asertar(contar(s, 'appearance: none') === contar(orig, 'appearance: none') + 2, 'delta appearance: none debe ser +2 (incluye el prefijo -webkit)');
asertar(contar(s, 'color-scheme') === contar(orig, 'color-scheme') + 1, 'delta color-scheme debe ser +1');
const ESTABLES = ['ntfTickDinero', 'agente-off', 'maatlyNotifCfg', 'GS_GAP', 'abrirCfgSeccion', 'gridstack', 'Configuración'];
for (const t of ESTABLES) asertar(contar(orig, t) === contar(s, t), 'estabilidad [' + t + '] ' + contar(orig, t) + ' -> ' + contar(s, t));
asertar(contar(s, 'Ã') === 0 && contar(s, 'Â') === 0, 'mojibake detectado');
asertar(contar(orig, '🎉') === contar(s, '🎉'), 'contenido [🎉] cambió');
const deltaCSS = (CSS + '    </style>').length - '\n    </style>'.length; /* el ancla se consume */
const DELTA_ESPERADO = R.reduce((acc, [de, a, esperado]) => acc + (a.length - de.length) * esperado, deltaCSS);
asertar(s.length === orig.length + DELTA_ESPERADO, 'delta de tamaño debe ser +' + DELTA_ESPERADO + ' (es ' + (s.length - orig.length) + ')');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- selects_edits (v0.24.5 -> v0.24.6) ---');
console.log('reemplazos:', hechos, 'de', R.length, 'patrones + 1 inserción CSS');
console.log('CSS insertado:', CSS.length, 'caracteres');
console.log('original :', orig.length, 'caracteres');
console.log('resultado:', s.length, 'caracteres (delta +' + (s.length - orig.length) + ')');
console.log('sel-maatly:', contar(s, 'sel-maatly '), '| pill:', contar(s, 'sel-maatly-pill'), '| badge v0.24.6:', contar(s, '>v0.24.6</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
