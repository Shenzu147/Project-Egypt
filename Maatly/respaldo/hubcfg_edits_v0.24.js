#!/usr/bin/env node
'use strict';
/* =====================================================================
   hubcfg_edits.js — Maatly v0.24.3 -> v0.24.4 (hub de Configuración)
   Fase 1: hub reconstruido — orden Notificaciones primero + pulido visual
           de las 6 tarjetas + renombres de título (Apariencia / Seguridad y PIN)
   Fase 2: CFG_SECCIONES — títulos alineados + sub del agente con GLM/Gemini
   Fase 3: badge v0.24.3 -> v0.24.4
   Fase 4: «Seguridad y PIN» sin full-width (hueco bajo Finanzas, feedback)
   Uso: node hubcfg_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier conteo no cuadra.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node hubcfg_edits.js <ruta.html> [--probe]'); process.exit(1); }
const orig = fs.readFileSync(ruta, 'utf8');
let s = orig;

function contar(pajar, aguja) {
  if (!aguja) return 0;
  let n = 0, i = 0;
  while ((i = pajar.indexOf(aguja, i)) !== -1) { n++; i += aguja.length; }
  return n;
}

const errores = [];
function asertar(cond, msg) { if (!cond) errores.push(msg); }

/* =====================================================================
   FASE 1 — HUB: extraer las 6 tarjetas, pulirlas, renombrar y reordenar
   Orden final: Notificaciones · Usuario y Perfil · Apariencia ·
                Moneda y Finanzas · Datos y Respaldos · Seguridad y PIN
   ===================================================================== */
const APERTURA = '<div id="cfgHub" class="grid grid-cols-1 sm:grid-cols-2 gap-4">';
const idxStart = s.indexOf(APERTURA);
asertar(idxStart !== -1, 'F1: no se encontró la apertura del hub ' + APERTURA);
asertar(contar(s, APERTURA) === 1, 'F1: la apertura del hub no es única (' + contar(s, APERTURA) + ')');

const idxMarker = s.indexOf('<!-- SECCIÓN:', idxStart);
asertar(idxMarker !== -1, 'F1: no se encontró el marcador <!-- SECCIÓN: tras el hub');
const bloque = s.slice(idxStart, idxMarker);

const reCard = /<button onclick="abrirCfgSeccion\('([a-zA-Z]+)'\)"[\s\S]*?<\/button>/g;
const cards = [];
const seps = [];
let prevEnd = APERTURA.length;
let m;
while ((m = reCard.exec(bloque)) !== null) {
  seps.push(bloque.slice(prevEnd, m.index));
  cards.push({ key: m[1], html: m[0] });
  prevEnd = m.index + m[0].length;
}
const tail = bloque.slice(prevEnd);

asertar(cards.length === 6, 'F1: se esperaban 6 tarjetas, hay ' + cards.length);
const ordenEsperado = ['perfil', 'apariencia', 'finanzas', 'notif', 'datos', 'agente'];
asertar(cards.map(c => c.key).join(',') === ordenEsperado.join(','),
  'F1: orden de claves inesperado: ' + cards.map(c => c.key).join(','));
seps.forEach((sep, i) => asertar(sep.trim() === '', 'F1: separador ' + i + ' no es solo espacio en blanco'));
asertar(/^\s*<\/div>\s*$/.test(tail), 'F1: el tail del hub no es espacio + </div>: [' + tail.slice(0, 80) + ']');

/* --- pulido por tarjeta (cada patrón debe aparecer EXACTAMENTE 1 vez por tarjeta) --- */
const PULIDO = [
  [' p-5 hover:border-', ' p-6 hover:border-'],                              // tarjeta p-5 -> p-6
  ['<div class="flex items-start gap-4">', '<div class="flex items-center gap-4">'], // fila centrada
  ['"p-2.5 bg-', '"p-3 bg-'],                                                // tile p-2.5 -> p-3
  [' rounded-xl inline-flex', ' rounded-2xl inline-flex'],                   // tile rounded-xl -> 2xl
  ['<svg class="w-5 h-5 flex-shrink-0"', '<svg class="w-6 h-6 flex-shrink-0"'], // ícono del tile más grande
  ['dark:text-white text-sm', 'dark:text-white text-[15px]'],                // h3 text-sm -> 15px
  ['text-[11px] text-slate-400 mt-0.5', 'text-xs text-slate-400 mt-1'],      // subtítulo
  [' transition-colors flex-shrink-0 mt-1"', ' transition-colors flex-shrink-0"'] // chevron sin mt-1
];
const RENOMBRE_CARD = {
  apariencia: ['>Personalización</h3>', '>Apariencia</h3>'],
  agente: ['<span>Seguridad y Agente IA (en pausa)</span>', '<span>Seguridad y PIN</span>']
};

for (const c of cards) {
  for (const [de, a] of PULIDO) {
    const n = contar(c.html, de);
    asertar(n === 1, 'F1: tarjeta ' + c.key + ' — patrón [' + de + '] aparece ' + n + ' veces (se esperaba 1)');
    c.html = c.html.split(de).join(a);
  }
  const rn = RENOMBRE_CARD[c.key];
  if (rn) {
    const n = contar(c.html, rn[0]);
    asertar(n === 1, 'F1: tarjeta ' + c.key + ' — renombre [' + rn[0] + '] aparece ' + n + ' veces (se esperaba 1)');
    c.html = c.html.split(rn[0]).join(rn[1]);
  }
}

/* --- reordenar: Notificaciones primero, agente full-width al final --- */
const ordenFinal = ['notif', 'perfil', 'apariencia', 'finanzas', 'datos', 'agente'];
const porClave = {};
for (const c of cards) porClave[c.key] = c.html;
asertar(Object.keys(porClave).length === 6, 'F1: claves duplicadas en el hub');

const aperturaNueva = APERTURA.replace('gap-4">', 'gap-5">');
asertar(aperturaNueva !== APERTURA, 'F1: no se pudo cambiar gap-4 -> gap-5 en la apertura');

const nuevoBloque = aperturaNueva
  + seps[0] + porClave[ordenFinal[0]]
  + seps[1] + porClave[ordenFinal[1]]
  + seps[2] + porClave[ordenFinal[2]]
  + seps[3] + porClave[ordenFinal[3]]
  + seps[4] + porClave[ordenFinal[4]]
  + seps[5] + porClave[ordenFinal[5]]
  + tail;

s = s.slice(0, idxStart) + nuevoBloque + s.slice(idxMarker);

/* =====================================================================
   FASE 2 — CFG_SECCIONES: títulos alineados con el hub + sub del agente
   ===================================================================== */
const REPS_F2 = [
  ["titulo: 'Personalización'", "titulo: 'Apariencia'", 1],
  ["titulo: 'Seguridad y Agente IA (en pausa)'", "titulo: 'Seguridad y PIN'", 1],
  ["sub: 'Bloqueo con PIN y modelos configurables.", "sub: 'Bloqueo con PIN y modelos GLM/Gemini configurables.", 1]
];
for (const [de, a, esperado] of REPS_F2) {
  const n = contar(s, de);
  asertar(n === esperado, 'F2: patrón [' + de + '] aparece ' + n + ' veces (se esperaba ' + esperado + ')');
  if (n === esperado) s = s.split(de).join(a);
}

/* =====================================================================
   FASE 3 — BADGE de versión
   ===================================================================== */
const nBadge = contar(s, '>v0.24.3</span>');
asertar(nBadge === 1, 'F3: badge v0.24.3 aparece ' + nBadge + ' veces (se esperaba 1)');
if (nBadge === 1) s = s.split('>v0.24.3</span>').join('>v0.24.4</span>');

/* =====================================================================
   FASE 4 — «Seguridad y PIN» SIN full-width: ocupa el hueco bajo
   Moneda y Finanzas -> cuadrícula 2×3 sin huecos (feedback del usuario)
   ===================================================================== */
const nSpan = contar(s, ' transition-all sm:col-span-2">');
asertar(nSpan === 1, 'F4: [ transition-all sm:col-span-2">] aparece ' + nSpan + ' veces (se esperaba 1)');
if (nSpan === 1) s = s.split(' transition-all sm:col-span-2">').join(' transition-all">');

/* =====================================================================
   SANITY DURO — conteos globales post-edición (contra el original)
   ===================================================================== */
const POST = [
  ['Personalización', 0], ['Seguridad y Agente IA', 0],
  ['GLM/Gemini configurables', 2], ['Seguridad y PIN', 2],
  ['>v0.24.4</span>', 1], ['>v0.24.3</span>', 0],
  ['sm:grid-cols-2 gap-5', 1], ['sm:grid-cols-2 gap-4', 0],
  ['sm:col-span-2', 0],
  [' rounded-xl inline-flex', 0]
];
/* '"p-2.5 bg-' existe 1 vez fuera del hub (JS de chips, L~2917): delta -6, no 0 */
asertar(contar(orig, '"p-2.5 bg-') - contar(s, '"p-2.5 bg-') === 6,
  'SANITY delta: ["p-2.5 bg-] antes=' + contar(orig, '"p-2.5 bg-') + ' después=' + contar(s, '"p-2.5 bg-') + ' (delta debe ser 6)');
for (const [aguja, esperado] of POST) {
  const n = contar(s, aguja);
  asertar(n === esperado, 'SANITY: [' + aguja + '] = ' + n + ' (se esperaba ' + esperado + ')');
}

/* deltas: patrones que solo existen en las 6 tarjetas del hub */
const DELTAS = [
  ' p-5 hover:border-', 'flex items-start gap-4', '<svg class="w-5 h-5 flex-shrink-0"',
  'dark:text-white text-sm', 'text-[11px] text-slate-400 mt-0.5', ' transition-colors flex-shrink-0 mt-1"',
  ' p-6 hover:border-', 'flex items-center gap-4', '<svg class="w-6 h-6 flex-shrink-0"',
  'dark:text-white text-[15px]', 'text-xs text-slate-400 mt-1'
];
for (const aguja of DELTAS) {
  const antes = contar(orig, aguja), despues = contar(s, aguja);
  asertar(Math.abs(antes - despues) === 6, 'SANITY delta: [' + aguja + '] antes=' + antes + ' después=' + despues + ' (delta debe ser 6)');
}

/* estabilidad: nada fuera del hub/CFG/badge debe moverse */
const ESTABLES = ['Configuración', 'Ã', 'Â', 'ntfTickDinero', 'agente-off', 'abrirCfgSeccion', 'maatlyNotifCfg', 'gridstack', 'GS_GAP'];
for (const aguja of ESTABLES) {
  const antes = contar(orig, aguja), despues = contar(s, aguja);
  asertar(antes === despues, 'ESTABILIDAD: [' + aguja + '] antes=' + antes + ' después=' + despues);
}

/* =====================================================================
   REPORTE / ESCRITURA
   ===================================================================== */
console.log('--- hubcfg_edits (v0.24.3 -> v0.24.4) ---');
console.log('original :', orig.length, 'caracteres');
console.log('resultado:', s.length, 'caracteres (delta ' + (s.length - orig.length) + ')');
console.log('Personalización          :', contar(s, 'Personalización'));
console.log('Seguridad y Agente IA    :', contar(s, 'Seguridad y Agente IA'));
console.log('Seguridad y PIN          :', contar(s, 'Seguridad y PIN'));
console.log('GLM/Gemini configurables :', contar(s, 'GLM/Gemini configurables'));
console.log('badge v0.24.4            :', contar(s, '>v0.24.4</span>'));
console.log('sm:col-span-2 (agente)   :', contar(s, 'sm:col-span-2'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
