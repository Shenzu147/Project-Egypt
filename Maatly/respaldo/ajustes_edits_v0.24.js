#!/usr/bin/env node
'use strict';
/* =====================================================================
   ajustes_edits.js — Maatly v0.24.1 -> v0.24.3 (ajustes del rediseno)
   Fase A: numeros en Manrope (sustituye Space Grotesk)
   Fase B: cada tema pinta el chrome oscuro (rail + hero) + bottom-nav
   Fase C: SVG outline en todo el chrome (titulos, tabs, hub, botones)
   Uso: node ajustes_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier conteo no cuadra.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node ajustes_edits.js <ruta.html> [--probe]'); process.exit(1); }
const orig = fs.readFileSync(ruta, 'utf8');
const NL = orig.includes('\r\n') ? '\r\n' : '\n';
let s = orig;

function contar(pajar, aguja) {
  if (!aguja) return 0;
  let n = 0, i = 0;
  while ((i = pajar.indexOf(aguja, i)) !== -1) { n++; i += aguja.length; }
  return n;
}

/* ---------- SVG outline (mismo estilo que el rail v0.24: stroke 2) ---------- */
const I = {
  dinero:  ['M4 8h13M13 4l4 4-4 4M20 16H7M11 20l-4-4 4-4'],
  arriba:  ['M12 19V5M5 12l7-7 7 7'],
  abajo:   ['M12 5v14M19 12l-7 7-7-7'],
  target:  ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M7 12a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M10.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0'],
  archivo: ['M5 8h14', 'M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4', 'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4'],
  lista:   ['M8 6h13M8 12h13M8 18h13', 'M3 6h.01M3 12h.01M3 18h.01'],
  barras:  ['M4 20h16', 'M7 20v-8', 'M12 20v-13', 'M17 20v-10'],
  gear:    ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  bell:    ['M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'],
  plus:    ['M12 4v16m8-8H4'],
  cal:     ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
  user:    ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0'],
  paleta:  ['M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3', 'M1 14h6M9 8h6M17 16h6'],
  lock:    ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  db:      ['M3 5c0-1.66 4-3 9-3s9 1.34 9 3-4 3-9 3-9-1.34-9-3z', 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3', 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'],
  cpu:     ['M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 9h6v6H9z', 'M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3'],
  editar:  ['M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z']
};
function svg(cls, nombre) {
  const paths = I[nombre].map(function (d) {
    return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="' + d + '"></path>';
  }).join('');
  return '<svg class="' + cls + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' + paths + '</svg>';
}
const W3 = 'w-3 h-3 flex-shrink-0';
const W35 = 'w-3.5 h-3.5 flex-shrink-0';
const W4 = 'w-4 h-4 flex-shrink-0';
const W5 = 'w-5 h-5 flex-shrink-0';

/* ---------- FASE B: bloque CSS de temas (se inserta antes de </style>) ---------- */
const CSS_TEMAS = [
  '        /* ===== v0.24.2: cada tema pinta el chrome oscuro (rail + hero) ===== */',
  '        html.theme-office #sidebar { background: linear-gradient(180deg, #1e293b 0%, #334155 100%) !important; }',
  '        html.theme-office #sortableGrid.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content, html.theme-office #gridHistorico.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content { background: linear-gradient(155deg, #1e293b, #334155) !important; border-color: #475569 !important; }',
  '        html.theme-nature #sidebar { background: linear-gradient(180deg, #0f2317 0%, #1d3b29 100%) !important; }',
  '        html.theme-nature #sortableGrid.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content, html.theme-nature #gridHistorico.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content { background: linear-gradient(155deg, #0f2317, #1d3b29) !important; border-color: #2e5c40 !important; }',
  '        html.theme-gemini #sidebar { background: linear-gradient(180deg, #0b0f19 0%, #2e1065 100%) !important; }',
  '        html.theme-gemini #sortableGrid.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content, html.theme-gemini #gridHistorico.grid-stack > .grid-stack-item[gs-id="kDisp"] > .grid-stack-item-content { background: linear-gradient(155deg, #0b0f19, #2e1065) !important; border-color: #6d28d9 !important; }'
].join(NL);

/* ---------- REPS ---------- */
const REPS = [

  /* ===== FASE A: Manrope ===== */
  { nom: 'A1 link fuentes', n: 1,
    de: 'family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap',
    a:  'family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@500;600;700;800&display=swap' },
  { nom: 'A2 tailwind display', n: 1,
    de: "display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']",
    a:  "display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']" },
  { nom: 'A3 comentario css', n: 1,
    de: '/* ============ v0.24: REDISENO FINTECH (Inter + Space Grotesk, reglas del brief) ============ */',
    a:  '/* ============ v0.24: REDISENO FINTECH (Inter + Manrope, reglas del brief) ============ */' },
  { nom: 'A4 kpi-num font', n: 1,
    de: ".kpi-num, .font-display, .num-sg { font-family: 'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif;",
    a:  ".kpi-num, .font-display, .num-sg { font-family: 'Manrope', Inter, ui-sans-serif, system-ui, sans-serif;" },

  /* ===== FASE B: bottom-nav office/nature -> tinta oscura ===== */
  { nom: 'B1 office nav', n: 1,
    de: 'html.theme-office .mobile-bottom-nav { background-color: #ffffff !important; border-top: 1px solid #cbd5e1 !important; }',
    a:  'html.theme-office .mobile-bottom-nav { background: linear-gradient(180deg, #1e293b, #334155) !important; border-top: 1px solid #0f172a !important; }' },
  { nom: 'B2 office btn', n: 1,
    de: 'html.theme-office .mobile-nav-btn { color: #64748b !important; }',
    a:  'html.theme-office .mobile-nav-btn { color: #94a3b8 !important; }' },
  { nom: 'B3 office activo', n: 1,
    de: 'html.theme-office .mobile-nav-btn.active-tab { color: #0f172a !important; }',
    a:  'html.theme-office .mobile-nav-btn.active-tab { color: #e2e8f0 !important; }' },
  { nom: 'B4 office pill', n: 1,
    de: 'html.theme-office .mobile-nav-btn.active-tab .icon-pill { background-color: #e2e8f0 !important; }',
    a:  'html.theme-office .mobile-nav-btn.active-tab .icon-pill { background-color: rgba(148, 163, 184, 0.25) !important; }' },
  { nom: 'B5 nature nav', n: 1,
    de: 'html.theme-nature .mobile-bottom-nav { background-color: #ffffff !important; border-top: 1px solid #d1e2d4 !important; }',
    a:  'html.theme-nature .mobile-bottom-nav { background: linear-gradient(180deg, #0f2317, #1d3b29) !important; border-top: 1px solid #0a1b10 !important; }' },
  { nom: 'B6 nature btn', n: 1,
    de: 'html.theme-nature .mobile-nav-btn { color: #52796f !important; }',
    a:  'html.theme-nature .mobile-nav-btn { color: #8fb8a0 !important; }' },
  { nom: 'B7 nature activo', n: 1,
    de: 'html.theme-nature .mobile-nav-btn.active-tab { color: #047857 !important; }',
    a:  'html.theme-nature .mobile-nav-btn.active-tab { color: #6ee7b7 !important; }' },
  { nom: 'B8 nature pill', n: 1,
    de: 'html.theme-nature .mobile-nav-btn.active-tab .icon-pill { background-color: #d1fae5 !important; }',
    a:  'html.theme-nature .mobile-nav-btn.active-tab .icon-pill { background-color: rgba(16, 185, 129, 0.25) !important; }' },
  { nom: 'B0 bloque css temas', n: 1,
    de: NL + '    </style>',
    a:  NL + CSS_TEMAS + NL + '    </style>' },

  /* ===== FASE C: SVG en el chrome ===== */
  { nom: 'C1 historial h2', n: 1,
    de: 'gap-2">\uD83D\uDDC2\uFE0F Historial y Registro</h2>',
    a:  'gap-2">' + svg(W5, 'archivo') + ' Historial y Registro</h2>' },
  { nom: 'C2 tab registros', n: 1,
    de: 'gap-1.5">\uD83D\uDDC2\uFE0F Registros</button>',
    a:  'gap-1.5">' + svg(W35, 'lista') + '<span>Registros</span></button>' },
  { nom: 'C3 tab archivo', n: 1,
    de: 'gap-1.5">\uD83D\uDCE6 Archivo Mensual</button>',
    a:  'gap-1.5">' + svg(W35, 'archivo') + '<span>Archivo Mensual</span></button>' },
  { nom: 'C4 tab plan', n: 1,
    de: 'gap-1.5">&#128202; Plan del Mes</button>',
    a:  'gap-1.5">' + svg(W35, 'barras') + '<span>Plan del Mes</span></button>' },
  { nom: 'C5 cfg h2', n: 1,
    de: 'gap-2">\u2699\uFE0F Ajustes y Configuraci\u00F3n</h2>',
    a:  'gap-2">' + svg(W5, 'gear') + ' Ajustes y Configuraci\u00F3n</h2>' },

  { nom: 'C6 hub perfil', n: 1,
    de: '<span class="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-lg">\uD83D\uDC64</span>',
    a:  '<span class="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl inline-flex items-center justify-center">' + svg(W5, 'user') + '</span>' },
  { nom: 'C7 hub apariencia', n: 1,
    de: '<span class="p-2.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl text-lg">\uD83C\uDFA8</span>',
    a:  '<span class="p-2.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl inline-flex items-center justify-center">' + svg(W5, 'paleta') + '</span>' },
  { nom: 'C8 hub finanzas', n: 1,
    de: '<span class="p-2.5 bg-positivo-suave c-positivo rounded-xl text-lg">\uD83D\uDCB5</span>',
    a:  '<span class="p-2.5 bg-positivo-suave c-positivo rounded-xl inline-flex items-center justify-center">' + svg(W5, 'dinero') + '</span>' },
  { nom: 'C9 hub notif', n: 1,
    de: '<span class="p-2.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-lg">\uD83D\uDD14</span>',
    a:  '<span class="p-2.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl inline-flex items-center justify-center">' + svg(W5, 'bell') + '</span>' },
  { nom: 'C10 hub datos', n: 1,
    de: '<span class="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl text-lg">\uD83D\uDCBE</span>',
    a:  '<span class="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl inline-flex items-center justify-center">' + svg(W5, 'db') + '</span>' },
  { nom: 'C11 hub agente', n: 1,
    de: '<span class="p-2.5 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-xl text-lg">\uD83E\uDD16</span>',
    a:  '<span class="p-2.5 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-xl inline-flex items-center justify-center">' + svg(W5, 'cpu') + '</span>' },
  { nom: 'C12 hub agente h3', n: 1,
    de: 'text-sm">\uD83D\uDD12 Seguridad y Agente IA (en pausa)</h3>',
    a:  'text-sm flex items-center gap-1.5">' + svg(W4, 'lock') + '<span>Seguridad y Agente IA (en pausa)</span></h3>' },

  { nom: 'C13 cfg perfil', n: 1,
    de: "icono: '\uD83D\uDC64', titulo: 'Usuario y Perfil'",
    a:  "icono: '" + svg(W5, 'user') + " ', titulo: 'Usuario y Perfil'" },
  { nom: 'C14 cfg apariencia', n: 1,
    de: "icono: '\uD83C\uDFA8', titulo: 'Personalizaci\u00F3n'",
    a:  "icono: '" + svg(W5, 'paleta') + " ', titulo: 'Personalizaci\u00F3n'" },
  { nom: 'C15 cfg finanzas', n: 1,
    de: "icono: '\uD83D\uDCB5', titulo: 'Moneda y Finanzas'",
    a:  "icono: '" + svg(W5, 'dinero') + " ', titulo: 'Moneda y Finanzas'" },
  { nom: 'C16 cfg agente', n: 1,
    de: "icono: '\uD83D\uDD12', titulo: 'Seguridad y Agente IA (en pausa)'",
    a:  "icono: '" + svg(W5, 'lock') + " ', titulo: 'Seguridad y Agente IA (en pausa)'" },
  { nom: 'C17 cfg datos', n: 1,
    de: "icono: '\uD83D\uDCBE', titulo: 'Datos y Respaldos'",
    a:  "icono: '" + svg(W5, 'db') + " ', titulo: 'Datos y Respaldos'" },
  { nom: 'C18 cfg notif', n: 1,
    de: "icono: '\uD83D\uDD14', titulo: 'Notificaciones'",
    a:  "icono: '" + svg(W5, 'bell') + " ', titulo: 'Notificaciones'" },
  { nom: 'C19 cfg innerhtml', n: 1,
    de: "if (t) t.textContent = def.icono + ' ' + def.titulo;",
    a:  'if (t) t.innerHTML = def.icono + def.titulo;' },
  { nom: 'C20 cfg volver gear', n: 1,
    de: "if (t) t.textContent = '\u2699\uFE0F Ajustes y Configuraci\u00F3n';",
    a:  "if (t) t.innerHTML = '" + svg(W5, 'gear') + " Ajustes y Configuraci\u00F3n';" },

  { nom: 'C21 aportar h3', n: 1,
    de: 'gap-2">\uD83C\uDFAF Aportar a un Plan</h3>',
    a:  'gap-2">' + svg(W5, 'target') + ' Aportar a un Plan</h3>' },

  { nom: 'C22 uaTitulo html', n: 1,
    de: '<h3 id="uaTitulo" class="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">\uD83D\uDCB8 Usar mi Ahorro</h3>',
    a:  '<h3 class="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">' + svg(W5, 'dinero') + '<span id="uaTitulo">Usar mi Ahorro</span></h3>' },
  { nom: 'C23 uaTitulo js', n: 1,
    de: "titulo.textContent = '\uD83D\uDCB8 Usar mi Ahorro';",
    a:  "titulo.textContent = 'Usar mi Ahorro';" },

  { nom: 'C24 paTitulo html', n: 1,
    de: 'gap-2">\uD83C\uDFAF Crear Plan de Ahorro</h3>',
    a:  'gap-2">' + svg(W5, 'target') + ' Crear Plan de Ahorro</h3>' },
  { nom: 'C25 paEditar js', n: 1,
    de: "titleEl.innerHTML = '\u270F\uFE0F Editar Plan de Ahorro';",
    a:  "titleEl.innerHTML = '" + svg(W5, 'editar') + " Editar Plan de Ahorro';" },
  { nom: 'C26 paCrear js', n: 1,
    de: "titleEl.innerHTML = '\uD83C\uDFAF Crear Plan de Ahorro';",
    a:  "titleEl.innerHTML = '" + svg(W5, 'target') + " Crear Plan de Ahorro';" },

  { nom: 'C27 fe usar', n: 1,
    de: 'text-white shadow-sm">\uD83D\uDCB8 Usar ahorro ahora</button>',
    a:  'text-white shadow-sm flex items-center justify-center gap-1.5">' + svg(W4, 'dinero') + '<span>Usar ahorro ahora</span></button>' },
  { nom: 'C28 ahorro usar', n: 1,
    de: 'px-2.5 py-1 rounded-lg transition-all">\uD83D\uDCB8 Usar ahorro</button>',
    a:  'px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1">' + svg(W3, 'dinero') + '<span>Usar ahorro</span></button>' },
  { nom: 'C29 meta usar', n: 1,
    de: 'px-2 py-1 rounded-lg transition-all">\uD83D\uDCB8 Usar</button>',
    a:  'px-2 py-1 rounded-lg transition-all inline-flex items-center gap-1">' + svg(W3, 'dinero') + '<span>Usar</span></button>' },
  { nom: 'C30 plan usar clase', n: 1,
    de: 'bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-all" onclick="event.stopPropagation(); usarAhorroPlan',
    a:  'bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1" onclick="event.stopPropagation(); usarAhorroPlan' },
  { nom: 'C31 plan usar svg', n: 1,
    de: "')\">\uD83D\uDCB8 Usar ahorro</button>",
    a:  "')\">" + svg(W3, 'dinero') + '<span>Usar ahorro</span></button>' },
  { nom: 'C32 plan aportar clase', n: 1,
    de: 'bg-positivo-suave hover:brightness-95 px-2.5 py-1 rounded-lg transition-all" onclick="event.stopPropagation(); aportarAhorro',
    a:  'bg-positivo-suave hover:brightness-95 px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1" onclick="event.stopPropagation(); aportarAhorro' },
  { nom: 'C33 plan aportar svg', n: 1,
    de: "')\">\uFF0B Aportar</button>",
    a:  "')\">" + svg(W3, 'plus') + '<span>Aportar</span></button>' },

  { nom: 'C34 dd actividad', n: 1,
    de: '<span class="text-base bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg">\uD83D\uDCC5</span>',
    a:  '<span class="text-base bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg inline-flex items-center justify-center">' + svg(W4, 'cal') + '</span>' },
  { nom: 'C35 dd plan', n: 1,
    de: '<span class="text-base bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-lg">\uD83C\uDFAF</span>',
    a:  '<span class="text-base bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-lg inline-flex items-center justify-center">' + svg(W4, 'target') + '</span>' },
  { nom: 'C36 campana panel', n: 1,
    de: '<span class="text-base">\uD83D\uDD14</span>',
    a:  svg(W4, 'bell') },
  { nom: 'C37 manual', n: 1,
    de: 'gap-1 flex-shrink-0">\uFF0B Manual</button>',
    a:  'gap-1 flex-shrink-0">' + svg(W35, 'plus') + '<span>Manual</span></button>' },
  { nom: 'C38 nuevo', n: 1,
    de: 'gap-1">' + NL + '                                    \u2795 Nuevo' + NL + '                                </button>',
    a:  'gap-1">' + NL + '                                    ' + svg(W35, 'plus') + '<span>Nuevo</span>' + NL + '                                </button>' },
  { nom: 'C39 chip gasto', n: 1,
    de: '<span class="text-sm leading-none">\uD83D\uDCB8</span><span>Gasto</span>',
    a:  svg(W35, 'abajo') + '<span>Gasto</span>' },
  { nom: 'C40 chip ingreso', n: 1,
    de: '<span class="text-sm leading-none">\uD83D\uDCB5</span><span>Ingreso</span>',
    a:  svg(W35, 'arriba') + '<span>Ingreso</span>' },
  { nom: 'C41 avatar movs', n: 1,
    de: "<span class=\"w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${esIng ? 'bg-positivo-suave' : 'bg-alarma-suave'}\">${esIng ? '\uD83D\uDCB5' : '\uD83D\uDCB8'}</span>",
    a:  '<span class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${esIng ? \'bg-positivo-suave c-positivo\' : \'bg-alarma-suave c-gasto\'}">${esIng ? \'' + svg(W35, 'arriba') + "' : '" + svg(W35, 'abajo') + "'}</span>" },
  { nom: 'C42 badge version', n: 1,
    de: '>v0.24</span>',
    a:  '>v0.24.3</span>' }
];

/* ---------- probe / verificacion de conteos ---------- */
let errores = 0;
for (const r of REPS) {
  const real = contar(s, r.de);
  const ok = real === r.n;
  if (!ok) errores++;
  console.log((ok ? 'OK ' : 'XX ') + r.nom + ' :: esperado ' + r.n + ' / real ' + real);
  if (probe || !ok) continue;
  s = s.split(r.de).join(r.a);
}
if (probe) {
  console.log(errores ? 'PROBE: ' + errores + ' MISMATCH(es) — revisar antes de aplicar' : 'PROBE: todo cuadra (' + REPS.length + ' reps)');
  process.exit(errores ? 1 : 0);
}
if (errores) {
  console.error('ABORTADO: ' + errores + ' conteo(s) no cuadran; NO se escribio nada.');
  process.exit(1);
}

/* ---------- sanity duro (antes de escribir) ---------- */
const duro = [
  ['Space Grotesk', 0], ['Space+Grotesk', 0], ['Manrope', 4], ['&#128202;', 0],
  ['ntfTickDinero', 2], ['agente-off', 3]
];
let fallo = 0;
for (const [tok, esp] of duro) {
  const real = contar(s, tok);
  const ok = real === esp;
  if (!ok) fallo++;
  console.log((ok ? 'OK ' : 'XX ') + 'SANITY "' + tok + '" :: esperado ' + esp + ' / real ' + real);
}
for (const ch of ['\u00C3', '\u00C2']) {
  if (contar(s, ch) !== contar(orig, ch)) { fallo++; console.log('XX SANITY mojibake "' + ch + '" cambio: ' + contar(orig, ch) + ' -> ' + contar(s, ch)); }
  else console.log('OK  SANITY mojibake "' + ch + '" estable (' + contar(s, ch) + ')');
}
if (contar(s, 'Configuraci\u00F3n') !== contar(orig, 'Configuraci\u00F3n')) { fallo++; console.log('XX SANITY acentos: "Configuraci\u00F3n" cambio'); }
else console.log('OK  SANITY acentos estables ("Configuraci\u00F3n" x' + contar(s, 'Configuraci\u00F3n') + ')');
if (fallo) { console.error('ABORTADO: sanity duro fallo (' + fallo + '); NO se escribio nada.'); process.exit(1); }

/* ---------- sanity blando (solo reporte) ---------- */
const blando = ['GS_GAP', 'data-w="', 'grid-stack-item-content', 'paddingLeft', 'maatlyNotifCfg', 'theme-office #sidebar', 'theme-nature #sidebar', 'theme-gemini #sidebar'];
for (const tok of blando) console.log('INFO "' + tok + '" :: ' + contar(s, tok));
for (const ic of ['dinero', 'arriba', 'abajo', 'target', 'archivo', 'lista', 'barras', 'gear', 'bell', 'plus', 'cal', 'user', 'paleta', 'lock', 'db', 'cpu', 'editar']) {
  console.log('INFO svg-' + ic + ' :: ' + contar(s, 'd="' + I[ic][0] + '"'));
}

fs.writeFileSync(ruta, s, 'utf8');
console.log('ESCRITO ' + ruta + ' :: ' + Buffer.byteLength(s, 'utf8') + ' bytes (antes ' + Buffer.byteLength(orig, 'utf8') + ')');
