#!/usr/bin/env node
'use strict';
/* =====================================================================
   emoji_edits.js — Maatly v0.24.4 -> v0.24.5 (barrido SVG del chrome)
   Fase 1: HTML estático (botones, tiles, radios, h3, FAB, PIN, tabla)
   Fase 2: títulos de modales (showModal innerHTML + kbModalTitle + botones JS)
   Fase 3: cabeceras de Notificaciones + Resumen del mes
   Fase 4: campana — tipos de notificación (notifMeta)
   Fase 5: FAB/chat — SVG fijo + fuera BOTON_AI_TEMAS.icon
   Fase 6: badge v0.24.4 -> v0.24.5
   Uso: node emoji_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier conteo no cuadra.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node emoji_edits.js <ruta.html> [--probe]'); process.exit(1); }
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

/* ---------- SVG outline (estilo rail/hub v0.24: stroke 2, currentColor) ---------- */
const I = {
  trash:   ['M4 7h16', 'M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2', 'M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7', 'M10 11v6M14 11v6'],
  x:       ['M6 18L18 6M6 6l12 12'],
  editar:  ['M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'],
  clip:    ['M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48'],
  descarga:['M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'],
  save:    ['M15.2 3a2 2 0 011.4.6l3.8 3.8a2 2 0 01.6 1.4v11.2a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h10.2z', 'M17 21v-8H7v8', 'M7 3v5h8'],
  refresh: ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'],
  rocket:  ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z', 'M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'],
  folder:  ['M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z'],
  flask:   ['M10 2v7.527a2 2 0 01-.211.896L4.72 20.55a1 1 0 00.9 1.45h12.76a1 1 0 00.9-1.45l-5.069-10.127A2 2 0 0114 9.527V2', 'M8.5 2h7', 'M7 16h10'],
  mail:    ['M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z', 'M22 6l-10 7L2 6'],
  lockopen:['M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z', 'M7 11V7a5 5 0 019.9-1'],
  clock:   ['M12 8v4l3 3', 'M21 12a9 9 0 11-18 0a9 9 0 0118 0z'],
  relojA:  ['M5 22h14', 'M5 2h14', 'M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22', 'M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2'],
  tag:     ['M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z', 'M7 7h.01'],
  bank:    ['M3 22h18', 'M6 18v-7M10 18v-7M14 18v-7M18 18v-7', 'M12 2L3 7h18l-9-5z'],
  tarjeta: ['M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z', 'M2 10h20'],
  maleta:  ['M4 7h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z', 'M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16'],
  bolsa:   ['M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 01-8 0'],
  tv:      ['M4 7h16a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z', 'M17 2l-5 5-5-5'],
  chat:    ['M21 11.5a8.38 8.38 0 01-.9 3.8a8.5 8.5 0 01-7.6 4.7a8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8a8.5 8.5 0 014.7-7.6a8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'],
  alarma:  ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  robot:   ['M6 8h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z', 'M12 8V4', 'M9 13h.01M15 13h.01', 'M9 17h6'],
  brillos: ['M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z', 'M5 3v4M3 5h4', 'M19 17v4M17 19h4'],
  /* reutilizados del wheel v0.24 */
  dinero:  ['M4 8h13M13 4l4 4-4 4M20 16H7M11 20l-4-4 4-4'],
  gear:    ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 001.065 2.573c.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.426-1.756.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  bell:    ['M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'],
  cal:     ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
  lista:   ['M8 6h13M8 12h13M8 18h13', 'M3 6h.01M3 12h.01M3 18h.01'],
  barras:  ['M4 20h16', 'M7 20v-8', 'M12 20v-13', 'M17 20v-10'],
  archivo: ['M5 8h14', 'M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4', 'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4'],
  db:      ['M3 5c0-1.66 4-3 9-3s9 1.34 9 3-4 3-9 3-9-1.34-9-3z', 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3', 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'],
  plus:    ['M12 4v16m8-8H4'],
  lock:    ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M7 11V7a5 5 0 0 1 10 0v4']
};
function svg(cls, nombre) {
  const paths = I[nombre].map(d => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + d + '"></path>').join('');
  return '<svg class="' + cls + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' + paths + '</svg>';
}
/* variante con atributos en comilla simple: para strings JS delimitados por comillas dobles */
function svgS(cls, nombre) {
  const paths = I[nombre].map(d => "<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='" + d + "'></path>").join('');
  return "<svg class='" + cls + "' fill='none' stroke='currentColor' viewBox='0 0 24 24'>" + paths + '</svg>';
}
const W5 = 'w-5 h-5 flex-shrink-0';
const W4 = 'w-4 h-4 flex-shrink-0';
const W4IN = 'w-4 h-4 inline-block align-middle mr-1.5';
const W35AM = 'w-3.5 h-3.5 align-middle';
const W35F = 'w-3.5 h-3.5 flex-shrink-0';
const W3IN = 'w-3 h-3 inline-block align-middle mr-1';
const W6 = 'w-6 h-6';

/* ---------- REPS: [de, a, esperado, emojiBase] ---------- */
const R = [];
// FASE 1 — HTML estático
R.push(['gap-2">🧾 Nuevo Movimiento<', 'gap-2">' + svg(W5, 'dinero') + 'Nuevo Movimiento<', 1, '🧾']);
R.push(['<span class="text-base leading-none mt-0.5">🏦</span>', svg('w-5 h-5 flex-shrink-0 mt-0.5', 'bank'), 1, '🏦']);
R.push(['<span class="text-base leading-none mt-0.5">🧳</span>', svg('w-5 h-5 flex-shrink-0 mt-0.5', 'maleta'), 1, '🧳']);
R.push(['<span class="text-base leading-none mt-0.5">🛍️</span>', svg('w-5 h-5 flex-shrink-0 mt-0.5', 'bolsa'), 1, '🛍']);
R.push(['<span class="text-base leading-none mt-0.5">🏧</span>', svg('w-5 h-5 flex-shrink-0 mt-0.5', 'tarjeta'), 1, '🏧']);
R.push(['gap-2">🔐 Crear PIN<', 'gap-2">' + svg(W5, 'lock') + 'Crear PIN<', 1, '🔐']);
R.push(['>🗑️ Eliminar</button>', '>' + svg(W35AM + ' mr-1', 'trash') + 'Eliminar</button>', 2, '🗑']);
R.push(['gap-2">📋 Nueva Actividad<', 'gap-2">' + svg(W5, 'lista') + 'Nueva Actividad<', 1, '📋']);
R.push(['justify-center">📎</button>', 'justify-center">' + svg('w-4 h-4', 'clip') + '</button>', 1, '📎']);
R.push(['<span class="text-base">🏦</span> Ahorro Acumulado', svg(W5, 'bank') + ' Ahorro Acumulado', 1, '🏦']);
R.push(['flex-shrink-0">🗓️</div>', 'flex-shrink-0">' + svg(W6, 'cal') + '</div>', 1, '🗓']);
R.push(['⚙️ Ajustar Ingreso/Ahorro', svg(W4, 'gear') + 'Ajustar Ingreso/Ahorro', 1, '⚙']);
R.push(['➕ Agregar Categoría', svg(W4IN, 'plus') + 'Agregar Categoría', 1, '➕']);
R.push(['\n                                💾 Guardar en Historial\n', '\n                                ' + svg(W4, 'save') + 'Guardar en Historial\n', 1, '💾']);
R.push(['❌ Cancelar Edición', svg(W4IN, 'x') + 'Cancelar Edición', 1, '❌']);
R.push(['💻 Almacenamiento Local Activo', svg(W35AM + ' mr-1.5', 'db') + 'Almacenamiento Local Activo', 1, '💻']);
R.push(['gap-2">🧪 Base de Datos de', 'gap-2">' + svg(W4, 'flask') + 'Base de Datos de', 1, '🧪']);
R.push(['🚀 Cargar Datos Demo', svg(W4, 'rocket') + 'Cargar Datos Demo', 1, '🚀']);
R.push(['>📊 Exportar</button>', '>' + svg(W4, 'archivo') + 'Exportar</button>', 1, '📊']);
R.push(['>📂 Restaurar</button>', '>' + svg(W4, 'folder') + 'Restaurar</button>', 1, '📂']);
R.push(['focus:outline-none">✨</button>', 'focus:outline-none">' + svg(W6, 'brillos') + '</button>', 1, '✨']);
R.push(['<span class="text-xl bg-white/20 p-2 rounded-xl">🤖</span>', '<span class="bg-white/20 p-2 rounded-xl inline-flex">' + svg('w-5 h-5', 'robot') + '</span>', 1, '🤖']);
R.push(['flex-shrink-0">🤖</div>', 'flex-shrink-0">' + svg(W4, 'robot') + '</div>', 3, '🤖']);
R.push(['>🗑️</button>', '>' + svg(W35AM, 'trash') + '</button>', 6, '🗑']);
R.push(['>✏️</button>', '>' + svg('w-4 h-4 align-middle', 'editar') + '</button>', 1, '✏']);
R.push(['>❌</button>', '>' + svg('w-4 h-4 align-middle', 'x') + '</button>', 1, '❌']);
R.push(['flex-shrink-0">⬇️</button>', 'flex-shrink-0">' + svg(W35AM, 'descarga') + '</button>', 1, '⬇']);
R.push(['>✕</button>', '>' + svg(W35AM, 'x') + '</button>', 5, '✕']);
R.push(['<span class="text-sm leading-none">➕</span>', svg(W35F, 'plus'), 1, '➕']);
R.push(['}">📅 ${fechaFmt}</span>', '}">' + svg(W3IN, 'cal') + '${fechaFmt}</span>', 1, '📅']);
R.push(['justify-center text-3xl text-white">🔒</div>', 'justify-center text-white">' + svg('w-8 h-8', 'lock') + '</div>', 1, '🔒']);
// FASE 2 — títulos de modales (showModal usa innerHTML) + botones JS
const T = (emoji, texto, n, k) => R.push([emoji + ' ' + texto, svg(W5, k) + texto, n, null]); // k = nombre svg
R.push(['🗑️ Borrar Registro', svgS(W5, 'trash') + 'Borrar Registro', 1, '🗑']);
R.push(['🗑️ Eliminar Aporte', svg(W5, 'trash') + 'Eliminar Aporte', 1, '🗑']);
R.push(['🗑️ Eliminar Registro de Meta', svg(W5, 'trash') + 'Eliminar Registro de Meta', 1, '🗑']);
R.push(['🗑️ Eliminar Uso / Retiro', svg(W5, 'trash') + 'Eliminar Uso / Retiro', 1, '🗑']);
R.push(['🗑️ Eliminar Actividad', svg(W5, 'trash') + 'Eliminar Actividad', 2, '🗑']);
R.push(['🗑️ Eliminar Columna', svg(W5, 'trash') + 'Eliminar Columna', 1, '🗑']);
R.push(['🗑️ Eliminar Movimiento Archivado', svg(W5, 'trash') + 'Eliminar Movimiento Archivado', 1, '🗑']);
R.push(['🗑️ Eliminar Movimiento', svg(W5, 'trash') + 'Eliminar Movimiento', 1, '🗑']);
R.push(['🗑️ Eliminar Modelo', svg(W5, 'trash') + 'Eliminar Modelo', 1, '🗑']);
R.push(['🗑️ Borrar Todo y Empezar en Cero', svg(W5, 'trash') + 'Borrar Todo y Empezar en Cero', 1, '🗑']);
R.push(['🗑️ Borrar Todo', svg(W4, 'trash') + 'Borrar Todo', 1, '🗑']);
R.push(['🚨 Borrado Crítico', svgS(W5, 'alarma') + 'Borrado Crítico', 1, '🚨']);
R.push(['🆕 Nueva Columna', svg(W5, 'plus') + 'Nueva Columna', 1, '🆕']);
R.push(['✏️ Renombrar Columna', svg(W5, 'editar') + 'Renombrar Columna', 1, '✏']);
R.push(['📨 Elegir Chat de Telegram', svg(W5, 'mail') + 'Elegir Chat de Telegram', 1, '📨']);
R.push(['🔓 Quitar PIN', svg(W5, 'lockopen') + 'Quitar PIN', 1, '🔓']);
R.push(['🔓 Olvidé mi PIN', svg(W5, 'lockopen') + 'Olvidé mi PIN', 1, '🔓']);
R.push(['🧪 Cargar Datos de Prueba Maatly', svgS(W5, 'flask') + 'Cargar Datos de Prueba Maatly', 1, '🧪']);
R.push(["textContent = esEdicion ? '📋 Editar Actividad' : '📋 Nueva Actividad'", "innerHTML = esEdicion ? '" + svg(W5, 'lista') + "Editar Actividad' : '" + svg(W5, 'lista') + "Nueva Actividad'", 1, '📋']);
R.push(["innerHTML='💾 Guardar Registro'", "innerHTML='" + svg(W4, 'save') + "Guardar Registro'", 2, '💾']);
R.push(["innerHTML='🔄 Actualizar Registro'", "innerHTML='" + svg(W4, 'refresh') + "Actualizar Registro'", 1, '🔄']);
// FASE 3 — cabeceras Notificaciones + Resumen
R.push(['mb-2">📺 Canales de aviso</h4>', 'mb-2 flex items-center gap-1.5">' + svg(W4, 'tv') + 'Canales de aviso</h4>', 1, '📺']);
R.push(['mb-2">⏰ Actividades y agenda</h4>', 'mb-2 flex items-center gap-1.5">' + svg(W4, 'clock') + 'Actividades y agenda</h4>', 1, '⏰']);
R.push(['text-sm">💰 Avisos de dinero</h4>', 'text-sm flex items-center gap-1.5">' + svg(W4, 'dinero') + 'Avisos de dinero</h4>', 1, '💰']);
R.push(['text-sm">📊 Resumen del mes</h4>', 'text-sm flex items-center gap-1.5">' + svg(W4, 'barras') + 'Resumen del mes</h4>', 1, '📊']);
R.push(['text-slate-200">📊 Presupuesto del mes</p>', 'text-slate-200 flex items-center gap-1.5">' + svg(W4, 'barras') + 'Presupuesto del mes</p>', 1, '📊']);
R.push(['text-slate-200">🏷️ Categoría excedida</p>', 'text-slate-200 flex items-center gap-1.5">' + svg(W4, 'tag') + 'Categoría excedida</p>', 1, '🏷']);
R.push(['text-slate-200">🏦 Ahorro y planes</p>', 'text-slate-200 flex items-center gap-1.5">' + svg(W4, 'bank') + 'Ahorro y planes</p>', 1, '🏦']);
R.push(['text-slate-200">📦 Cierre de mes</p>', 'text-slate-200 flex items-center gap-1.5">' + svg(W4, 'archivo') + 'Cierre de mes</p>', 1, '📦']);
// FASE 4 — campana: tipos (notifMeta -> notifItemHTML, ruta innerHTML)
R.push(["i: '⏰'", "i: '" + svg(W4, 'clock') + "'", 1, '⏰']);
R.push(["i: '⏳'", "i: '" + svg(W4, 'relojA') + "'", 1, '⏳']);
R.push(["i: '🔔'", "i: '" + svg(W4, 'bell') + "'", 1, '🔔']);
R.push(["i: '🤖'", "i: '" + svg(W4, 'robot') + "'", 1, '🤖']);
R.push(["i: '📅'", "i: '" + svg(W4, 'cal') + "'", 1, '📅']);
R.push(["i: '📊'", "i: '" + svg(W4, 'barras') + "'", 1, '📊']);
R.push(["i: '🏷️'", "i: '" + svg(W4, 'tag') + "'", 1, '🏷']);
R.push(["i: '🏦'", "i: '" + svg(W4, 'bank') + "'", 1, '🏦']);
R.push(["i: '📦'", "i: '" + svg(W4, 'archivo') + "'", 1, '📦']);
R.push(["i: '💬'", "i: '" + svg(W4, 'chat') + "'", 1, '💬']);
// FASE 5 — FAB/chat: SVG fijo + fuera los icon por tema
R.push(['btnAi.textContent = aiCfg.icon;\n                btnAi.style.background', 'btnAi.style.background', 1, null]);
R.push(["{ icon: '✨', bg:", '{ bg:', 1, '✨']);
R.push(["{ icon: '🌙', bg:", '{ bg:', 1, '🌙']);
R.push(["{ icon: '💼', bg:", '{ bg:', 1, '💼']);
R.push(["{ icon: '🌿', bg:", '{ bg:', 1, '🌿']);
R.push(["{ icon: '🌌', bg:", '{ bg:', 1, '🌌']);
// FASE 6 — badge
R.push(['>v0.24.4</span>', '>v0.24.5</span>', 1, null]);

/* ---------- EJECUCIÓN ---------- */
const removals = {};
let hechos = 0;
for (const [de, a, esperado, k] of R) {
  const c = contar(s, de);
  asertar(c === esperado, 'patrón [' + de.slice(0, 60) + '] aparece ' + c + ' veces (se esperaba ' + esperado + ')');
  if (c === esperado) {
    s = s.split(de).join(a);
    hechos += c;
    if (k) removals[k] = (removals[k] || 0) + c * contar(de, k);
  }
}

/* ---------- cirugía por índice: botón Kanban multi-línea (🗑 solo en su línea) ---------- */
const iKb = s.indexOf('title="Eliminar actividad"');
asertar(iKb !== -1, 'no se encontró el botón Kanban "Eliminar actividad"');
if (iKb !== -1) {
  const iEm = s.indexOf('🗑', iKb);
  asertar(iEm !== -1 && (iEm - iKb) < 600, '🗑 del botón Kanban lejos del botón (delta ' + (iEm - iKb) + ')');
  if (iEm !== -1 && iKb !== -1) {
    let len = 2; /* 🗑 = par suprinario */
    if (s.substr(iEm + len, 1) === '\uFE0F') len = 3;
    s = s.slice(0, iEm) + svg(W35AM, 'trash') + s.slice(iEm + len);
    removals['🗑'] = (removals['🗑'] || 0) + 1;
    hechos++;
  }
}

/* ---------- SANITY: deltas por emoji (pre - barridos === post) ---------- */
for (const k of Object.keys(removals)) {
  const antes = contar(orig, k), despues = contar(s, k);
  asertar(antes - removals[k] === despues, 'delta [' + k + '] antes=' + antes + ' barridos=' + removals[k] + ' después=' + despues);
}
/* contenido intacto */
const ESTABLES_EMOJI = ['🎉', '😊', '😀', '💡', '🎯', '💸', '📝', '🏆', '✅', '🙏', '🟢', '🔕', '☰', '🕐', '⚠', '💵', '🔁'];
for (const e of ESTABLES_EMOJI) {
  asertar(contar(orig, e) === contar(s, e), 'contenido [' + e + '] cambió: ' + contar(orig, e) + ' -> ' + contar(s, e));
}
/* tokens funcionales */
const ESTABLES = ['ntfTickDinero', 'agente-off', 'maatlyNotifCfg', 'GS_GAP', 'abrirCfgSeccion', 'Configuración', 'gridstack', 'Ã', 'Â'];
for (const t of ESTABLES) {
  asertar(contar(orig, t) === contar(s, t), 'estabilidad [' + t + '] ' + contar(orig, t) + ' -> ' + contar(s, t));
}
/* sin emojis remanentes en chrome barrido */
const CERO = ['✕', '✏', '❌', '🔄', '📂', '📨', '🧪', '🔓', '📋', '🤖', '🔒', '⏳', '💬', '📺', '⚙', '➕', '⬇', '🛍', '🆕'];
for (const e of CERO) asertar(contar(s, e) === 0, 'remanente [' + e + '] = ' + contar(s, e) + ' (se esperaba 0)');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- emoji_edits (v0.24.4 -> v0.24.5) ---');
console.log('reemplazos:', hechos, 'de', R.length, 'patrones + 1 cirugía');
console.log('original :', orig.length, 'caracteres');
console.log('resultado:', s.length, 'caracteres (delta ' + (s.length - orig.length) + ')');
for (const k of Object.keys(removals)) console.log('  [' + k + '] ' + contar(orig, k) + ' -> ' + contar(s, k) + ' (-' + removals[k] + ')');
console.log('badge v0.24.5:', contar(s, '>v0.24.5</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
