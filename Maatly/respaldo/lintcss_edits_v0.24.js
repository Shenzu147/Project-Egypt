#!/usr/bin/env node
'use strict';
/* =====================================================================
   lintcss_edits.js — Maatly v0.24.7 -> v0.24.8 (higiene CSS: prefijos)
   Fase 1: las 3 reglas .logo-text de los temas (office L132 / nature
           L154 / gemini L184) ganan la propiedad estándar
           background-clip: text !important tras la prefijada
           (silencia css(vendorPrefix) de VS Code).
   Fase 2: defensivo L28 — los spinners numéricos ganan appearance:none
           estándar junto al prefijado.
   Fase 3: badge v0.24.7 -> v0.24.8
   Uso: node lintcss_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier aserción falla.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node lintcss_edits.js <ruta.html> [--probe]'); process.exit(1); }
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

/* ---------- REEMPLAZOS ---------- */
const R = [];
// Fase 1: estándar tras el prefijo en las 3 reglas .logo-text de temas
R.push([
  '-webkit-background-clip: text !important;',
  '-webkit-background-clip: text !important; background-clip: text !important;',
  3
]);
// Fase 2: defensivo L28 (spinners numéricos)
R.push([
  '{ -webkit-appearance: none; margin: 0; }',
  '{ -webkit-appearance: none; appearance: none; margin: 0; }',
  1
]);
// Fase 3: badge
R.push(['>v0.24.7</span>', '>v0.24.8</span>', 1]);

/* ---------- pre-aserciones ---------- */
asertar(contar(orig, '>v0.24.7</span>') === 1, 'pre: badge v0.24.7 = ' + contar(orig, '>v0.24.7</span>') + ' (¿revert de OneDrive?)');
asertar(contar(orig, '-webkit-background-clip: text !important;') === 3, 'pre: -webkit-background-clip = ' + contar(orig, '-webkit-background-clip: text !important;') + ' (se esperaba 3)');
asertar(contar(orig, '; background-clip: text !important;') === 0, 'pre: la estándar background-clip ya existe (¿aplicado dos veces?)');
asertar(contar(orig, '{ -webkit-appearance: none; margin: 0; }') === 1, 'pre: patrón L28 = ' + contar(orig, '{ -webkit-appearance: none; margin: 0; }') + ' (se esperaba 1)');
asertar(contar(orig, '-webkit-appearance: none; appearance: none;') === 1, 'pre: par de sel-maatly = ' + contar(orig, '-webkit-appearance: none; appearance: none;') + ' (se esperaba 1, v0.24.6 intacto)');
asertar(contar(orig, 'sel-maatly ') === 13, 'pre: sel-maatly = ' + contar(orig, 'sel-maatly ') + ' (se esperaba 13)');
asertar(contar(orig, 'sbEncolarResize') === 5, 'pre: sbEncolarResize = ' + contar(orig, 'sbEncolarResize') + ' (se esperaba 5, v0.24.7 intacto)');
asertar(contar(orig, 'sidebar-collapsed') === 11, 'pre: sidebar-collapsed = ' + contar(orig, 'sidebar-collapsed') + ' (se esperaba 11)');
asertar(contar(orig, '</style>') === 1, 'pre: </style> aparece ' + contar(orig, '</style>') + ' veces (se esperaba 1)');

/* ---------- EJECUCIÓN ---------- */
let hechos = 0;
for (const [de, a, esperado] of R) {
  const c = contar(s, de);
  asertar(c === esperado, 'patrón [' + de.slice(0, 60) + '] aparece ' + c + ' veces (se esperaba ' + esperado + ')');
  if (c === esperado) { s = s.split(de).join(a); hechos += c; }
}

/* ---------- SANITY ---------- */
asertar(contar(s, '; background-clip: text !important;') === 3, 'post: estándar background-clip = ' + contar(s, '; background-clip: text !important;') + ' (se esperaba 3)');
asertar(contar(s, '-webkit-background-clip') === 3, 'post: prefijado -webkit-background-clip cambió (' + contar(s, '-webkit-background-clip') + ')');
asertar(contar(s, 'appearance: none') === contar(orig, 'appearance: none') + 1, 'delta appearance: none debe ser +1 (es ' + (contar(s, 'appearance: none') - contar(orig, 'appearance: none')) + ')');
asertar(contar(s, '-webkit-appearance: none; appearance: none;') === 2, 'post: pares appearance = ' + contar(s, '-webkit-appearance: none; appearance: none;') + ' (se esperaba 2: L28 + sel-maatly)');
asertar(contar(s, '>v0.24.8</span>') === 1, 'post: badge v0.24.8 = ' + contar(s, '>v0.24.8</span>'));
asertar(contar(s, '>v0.24.7</span>') === 0, 'post: quedó un badge v0.24.7');
asertar(contar(s, 'sel-maatly ') === 13, 'post: sel-maatly cambió (' + contar(s, 'sel-maatly ') + ')');
asertar(contar(s, 'sbEncolarResize') === 5, 'post: sbEncolarResize cambió (' + contar(s, 'sbEncolarResize') + ')');
asertar(contar(s, 'sidebar-collapsed') === 11, 'post: sidebar-collapsed cambió (' + contar(s, 'sidebar-collapsed') + ')');
const ESTABLES = ['ntfTickDinero', 'maatlyNotifCfg', 'GS_GAP', 'gridstack', 'abrirCfgSeccion', 'Configuración'];
for (const t of ESTABLES) asertar(contar(orig, t) === contar(s, t), 'estabilidad [' + t + '] ' + contar(orig, t) + ' -> ' + contar(s, t));
asertar(contar(orig, '🎉') === contar(s, '🎉'), 'contenido [🎉] cambió');
asertar(contar(s, 'Ã') === 0 && contar(s, 'Â') === 0, 'mojibake detectado');
const DELTA_ESPERADO = R.reduce((acc, [de, a, esperado]) => acc + (a.length - de.length) * esperado, 0);
asertar(s.length === orig.length + DELTA_ESPERADO, 'delta de tamaño debe ser +' + DELTA_ESPERADO + ' (es ' + (s.length - orig.length) + ')');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- lintcss_edits (v0.24.7 -> v0.24.8) ---');
console.log('reemplazos:', hechos, 'de', R.length, 'patrones');
console.log('original :', orig.length, 'caracteres');
console.log('resultado:', s.length, 'caracteres (delta +' + (s.length - orig.length) + ')');
console.log('background-clip estándar:', contar(s, '; background-clip: text !important;'), '| pares appearance:', contar(s, '-webkit-appearance: none; appearance: none;'), '| badge v0.24.8:', contar(s, '>v0.24.8</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
