// limpieza_botones_edits.js — v0.24.9 «Limpieza de botones de widget»
// Quita «＋ Manual» del widget Movimientos del Mes y «+ Nuevo» del widget Planes de Ahorro.
// La funcionalidad sigue alcanzable: header (btnGastosIngresos / + Crear → Plan de Ahorro) y tarjetas de plan.
// Uso: node limpieza_botones_edits.js <entrada.html> <salida.html>
const fs = require('fs');

const IN = process.argv[2];
const OUT = process.argv[3];
if (!IN || !OUT) { console.error('Uso: node limpieza_botones_edits.js <entrada> <salida>'); process.exit(1); }

const s = fs.readFileSync(IN, 'utf8');
const c = (t) => s.split(t).length - 1;
const fail = (m) => { console.error('ABORT: ' + m); process.exit(1); };

// ---------- Aserciones PRE ----------
if (c('mvAgregarManual') !== 2) fail('mvAgregarManual pre=' + c('mvAgregarManual') + ' (esperado 2)');
if (c('onclick="abrirModalPlanAhorro()"') !== 1) fail('onclick abrirModalPlanAhorro pre=' + c('onclick="abrirModalPlanAhorro()"') + ' (esperado 1)');
if (c('abrirModalPlanAhorro') !== 4) fail('abrirModalPlanAhorro pre=' + c('abrirModalPlanAhorro') + ' (esperado 4)');
if (c('＋ Manual') !== 2) fail('＋ Manual pre=' + c('＋ Manual') + ' (esperado 2)');
if (c('>Manual</span>') !== 1) fail('>Manual</span> pre=' + c('>Manual</span>') + ' (esperado 1)');
if (c('>Nuevo</span>') !== 1) fail('>Nuevo</span> pre=' + c('>Nuevo</span>') + ' (esperado 1)');
if (c('v0.24.8') !== 1) fail('badge v0.24.8 pre=' + c('v0.24.8') + ' (esperado 1)');
if (c('Gastos/Ingresos') !== 1) fail('Gastos/Ingresos pre=' + c('Gastos/Ingresos') + ' (esperado 1)');
// Estabilidad (tokens de v0.24.5-v0.24.8)
if (c('sel-maatly ') !== 13) fail('sel-maatly pre=' + c('sel-maatly ') + ' (esperado 13)');
if (c('sbEncolarResize') !== 5) fail('sbEncolarResize pre=' + c('sbEncolarResize') + ' (esperado 5)');
if (c('sidebar-collapsed') !== 11) fail('sidebar-collapsed pre=' + c('sidebar-collapsed') + ' (esperado 11)');
if (c('; background-clip: text !important;') !== 3) fail('background-clip pre=' + c('; background-clip: text !important;') + ' (esperado 3)');

let out = s;
let lines0 = out.split('\n').length;

// Helper: elimina [lineStart, eol+1) de la línea que contiene `anchor`
// (start = inicio de esa línea; eol = newline tras `hasta`).
function quitarLinea(str, anchor, hasta) {
  const b = str.indexOf(anchor);
  if (b < 0) fail('no encontrado: ' + anchor.slice(0, 60));
  const lineStart = str.lastIndexOf('\n', b) + 1;
  const e = hasta ? str.indexOf(hasta, b) : b;
  if (e < 0) fail('no encontrado hasta: ' + hasta);
  const eol = str.indexOf('\n', e + (hasta ? hasta.length : 0));
  if (eol < 0) fail('sin newline tras: ' + anchor.slice(0, 60));
  return str.slice(0, lineStart) + str.slice(eol + 1);
}

// ---------- E1: botón «＋ Manual» del widget Movimientos del Mes (1 línea) ----------
const pre1 = out.length;
out = quitarLinea(out, '<button onclick="mvAgregarManual()"', '</button>');
const d1 = out.length - pre1;

// ---------- E2: wrapper JS mvAgregarManual (1 línea) ----------
const pre2 = out.length;
out = quitarLinea(out, 'window.mvAgregarManual = function()', null);
const d2 = out.length - pre2;

// ---------- E3: botón «+ Nuevo» del widget Planes de Ahorro (3 líneas) ----------
const pre3 = out.length;
out = quitarLinea(out, '<button onclick="abrirModalPlanAhorro()"', '</button>');
const d3 = out.length - pre3;

// ---------- E4: texto del empty-state de Movimientos ----------
const TXT_OLD = 'Completa actividades con monto o toca <strong>＋ Manual</strong>.';
const TXT_NEW = 'Completa actividades con monto o usa <strong>Gastos/Ingresos</strong> en la barra superior.';
if (out.split(TXT_OLD).length - 1 !== 1) fail('TXT_OLD count=' + (out.split(TXT_OLD).length - 1) + ' (esperado 1)');
out = out.replace(TXT_OLD, TXT_NEW);

// ---------- E5: badge de versión ----------
if (out.split('v0.24.8').length - 1 !== 1) fail('badge v0.24.8 (post-edits) count!=1');
out = out.replace('v0.24.8', 'v0.24.9');

// ---------- Aserciones POST ----------
const co = (t) => out.split(t).length - 1;
if (co('mvAgregarManual') !== 0) fail('mvAgregarManual post=' + co('mvAgregarManual') + ' (esperado 0)');
if (co('onclick="abrirModalPlanAhorro()"') !== 0) fail('onclick abrirModalPlanAhorro post!=0');
if (co('abrirModalPlanAhorro') !== 3) fail('abrirModalPlanAhorro post=' + co('abrirModalPlanAhorro') + ' (esperado 3: def + dropdown + tarjeta)');
if (co('＋ Manual') !== 1) fail('＋ Manual post=' + co('＋ Manual') + ' (esperado 1: comentario histórico L406)');
if (co('>Manual</span>') !== 0) fail('>Manual</span> post!=0');
if (co('>Nuevo</span>') !== 0) fail('>Nuevo</span> post!=0');
if (co('v0.24.9') !== 1) fail('badge v0.24.9 post!=1');
if (co('v0.24.8') !== 0) fail('badge v0.24.8 post!=0');
if (co('Gastos/Ingresos') !== 2) fail('Gastos/Ingresos post=' + co('Gastos/Ingresos') + ' (esperado 2)');
if (co('abrirModalMovManual') < 1) fail('abrirModalMovManual debe seguir presente');
// Estabilidad POST
if (co('sel-maatly ') !== 13) fail('sel-maatly post=' + co('sel-maatly '));
if (co('sbEncolarResize') !== 5) fail('sbEncolarResize post=' + co('sbEncolarResize'));
if (co('sidebar-collapsed') !== 11) fail('sidebar-collapsed post=' + co('sidebar-collapsed'));
if (co('; background-clip: text !important;') !== 3) fail('background-clip post=' + co('; background-clip: text !important;'));

const lines1 = out.split('\n').length;
console.log('--- limpieza_botones (v0.24.8 -> v0.24.9) ---');
console.log('deltas: E1 ' + d1 + ' | E2 ' + d2 + ' | E3 ' + d3 + ' | E4 ' + (TXT_NEW.length - TXT_OLD.length) + ' | E5 0');
console.log('lineas: ' + lines0 + ' -> ' + lines1 + ' (esperado 7038)');
if (lines1 !== 7038) fail('lineas post=' + lines1 + ' (esperado 7038)');

fs.writeFileSync(OUT, out, 'utf8');
console.log('Escrito: ' + OUT);
