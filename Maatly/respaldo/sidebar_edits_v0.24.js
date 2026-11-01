#!/usr/bin/env node
'use strict';
/* =====================================================================
   sidebar_edits.js — Maatly v0.24.6 -> v0.24.7 (sidebar hover-push)
   Fase 1: CSS @media (min-width:640px) — hover/foco expande el rail a
           16rem empujando el contenido; labels visibles; nav-btn
           restaurado (justify/padding/gap) con transición.
   Fase 2: JS — fuera el toggle manual: entran mouseenter/mouseleave/
           focusin/focusout + resize con debounce 350ms (nunca a mitad
           de la animación); boot siempre colapsado; fuera la clave
           vieja localStorage.sidebarCollapsed.
   Fase 3: HTML — fuera el botón btnToggleSidebar (3 líneas).
   Fase 4: badge v0.24.6 -> v0.24.7
   Uso: node sidebar_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier aserción falla.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node sidebar_edits.js <ruta.html> [--probe]'); process.exit(1); }
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

/* ---------- FASE 2 (JS): nuevo bloque ---------- */
const NUEVO_JS = [
  "        /* v0.24.7 — sidebar hover-push: el rail (siempre colapsado en escritorio) se expande al",
  "           pasar el mouse y empuja el contenido — el mismo principio del extinto botón, pero",
  "           automático y fluido (CSS :hover/:focus-within). El re-acomodo del panel",
  "           (GridStack/gráficas) se encola con debounce: un único resize cuando el movimiento",
  "           se estabiliza, nunca a mitad de la animación. */",
  "        const sidebar = document.getElementById('sidebar');",
  "        let sbResizeTmr = null;",
  "        const sbEncolarResize = () => {",
  "            if (sbResizeTmr) clearTimeout(sbResizeTmr);",
  "            sbResizeTmr = setTimeout(() => {",
  "                sbResizeTmr = null;",
  "                window.dispatchEvent(new Event('resize'));",
  "            }, 350);",
  "        };",
  "        if (sidebar) {",
  "            const sbEnEscritorio = () => window.innerWidth >= 640;",
  "            sidebar.addEventListener('mouseenter', () => { if (sbEnEscritorio()) sbEncolarResize(); });",
  "            sidebar.addEventListener('mouseleave', () => { if (sbEnEscritorio()) sbEncolarResize(); });",
  "            sidebar.addEventListener('focusin', () => { if (sbEnEscritorio()) sbEncolarResize(); });",
  "            sidebar.addEventListener('focusout', () => { if (sbEnEscritorio()) sbEncolarResize(); });",
  "        }",
  "        localStorage.removeItem('sidebarCollapsed'); // v0.24.7: clave del toggle manual, fuera",
  ""
].join('\n') + '\n';
const JS_INI = "        const sidebar = document.getElementById('sidebar');";
const JS_FIN = "        const btnNavs = document.querySelectorAll('.nav-btn');";

/* ---------- FASE 1 (CSS): bloque nuevo ---------- */
const CSS = [
  '',
  '        /* v0.24.7 — sidebar hover-push: el rail se expande al hover/foco y empuja el contenido */',
  '        @media (min-width: 640px) {',
  '            #sidebar.sidebar-collapsed { overflow: hidden; }',
  '            #sidebar.sidebar-collapsed:hover, #sidebar.sidebar-collapsed:focus-within { width: 16rem !important; }',
  '            #sidebar.sidebar-collapsed:hover .text-label, #sidebar.sidebar-collapsed:focus-within .text-label { display: block; }',
  '            #sidebar.sidebar-collapsed:hover .nav-btn, #sidebar.sidebar-collapsed:focus-within .nav-btn { justify-content: flex-start; padding-left: 1rem; padding-right: 1rem; gap: 0.75rem; }',
  '            #sidebar .nav-btn { transition: padding .3s ease, gap .3s ease, background-color .15s ease, color .15s ease; }',
  '        }',
  ''
].join('\n');

/* ---------- pre-aserciones ---------- */
asertar(contar(orig, '>v0.24.6</span>') === 1, 'pre: badge v0.24.6 = ' + contar(orig, '>v0.24.6</span>') + ' (¿revert de OneDrive?)');
asertar(contar(orig, 'btnToggleSidebar') === 5, 'pre: btnToggleSidebar = ' + contar(orig, 'btnToggleSidebar') + ' (se esperaba 5)');
asertar(contar(orig, 'iconToggleSidebar') === 9, 'pre: iconToggleSidebar = ' + contar(orig, 'iconToggleSidebar') + ' (se esperaba 9)');
asertar(contar(orig, 'sidebarCollapsed') === 2, 'pre: sidebarCollapsed = ' + contar(orig, 'sidebarCollapsed') + ' (se esperaba 2)');
asertar(contar(orig, 'sidebar-collapsed') === 8, 'pre: sidebar-collapsed = ' + contar(orig, 'sidebar-collapsed') + ' (se esperaba 8)');
asertar(contar(orig, '</style>') === 1, 'pre: </style> aparece ' + contar(orig, '</style>') + ' veces (se esperaba 1)');
asertar(contar(orig, '\n    </style>') === 1, 'pre: ancla CSS no única');
asertar(contar(orig, JS_INI) === 1, 'pre: ancla JS_INI no única');
asertar(contar(orig, JS_FIN) === 1, 'pre: ancla JS_FIN no única');
asertar(contar(orig, "getElementById('sidebar')") === 1, 'pre: getElementById(sidebar) = ' + contar(orig, "getElementById('sidebar')") + ' (se esperaba 1)');
asertar(contar(orig, 'sbEncolarResize') === 0, 'pre: sbEncolarResize ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'sel-maatly ') === 13, 'pre: sel-maatly = ' + contar(orig, 'sel-maatly ') + ' (se esperaba 13, estado v0.24.6)');

/* ---------- EJECUCIÓN ---------- */
/* FASE 2: splice del bloque JS por anclas (immune a espacios invisibles) */
let deltaJS = 0;
const ini = s.indexOf(JS_INI);
const fin = s.indexOf(JS_FIN);
asertar(ini !== -1 && fin !== -1 && fin > ini, 'fase2: anclas JS no encontradas o en orden inverso');
if (ini !== -1 && fin !== -1 && fin > ini) {
  const span = s.slice(ini, fin);
  asertar(contar(span, 'btnToggleSidebar') === 4, 'fase2: span JS btnToggleSidebar = ' + contar(span, 'btnToggleSidebar') + ' (se esperaba 4)');
  asertar(contar(span, 'iconToggleSidebar') === 8, 'fase2: span JS iconToggleSidebar = ' + contar(span, 'iconToggleSidebar') + ' (se esperaba 8)');
  asertar(contar(span, 'sidebarCollapsed') === 2, 'fase2: span JS sidebarCollapsed = ' + contar(span, 'sidebarCollapsed') + ' (se esperaba 2)');
  asertar(contar(span, 'sidebar-collapsed') === 4, 'fase2: span JS sidebar-collapsed = ' + contar(span, 'sidebar-collapsed') + ' (se esperaba 4)');
  asertar(contar(span, "dispatchEvent(new Event('resize'))") === 1, 'fase2: span JS sin el resize del toggle viejo');
  if (errores.length === 0) {
    deltaJS = NUEVO_JS.length - span.length;
    s = s.slice(0, ini) + NUEVO_JS + s.slice(fin);
  }
}

/* FASE 3: eliminación del botón (por índices) */
let deltaBtn = 0;
if (errores.length === 0) {
  const bp = s.indexOf('<button id="btnToggleSidebar"');
  asertar(bp !== -1, 'fase3: botón no encontrado');
  if (bp !== -1) {
    const bq = s.indexOf('</button>', bp);
    asertar(bq !== -1, 'fase3: cierre del botón no encontrado');
    if (bq !== -1) {
      const nl = s.lastIndexOf('\n', bp);
      const finB = bq + '</button>'.length;
      const spanB = s.slice(nl, finB);
      asertar(spanB.indexOf('\n            <button id="btnToggleSidebar"') === 0, 'fase3: span del botón no empieza donde se esperaba');
      asertar(contar(spanB, 'btnToggleSidebar') === 1, 'fase3: span botón btnToggleSidebar = ' + contar(spanB, 'btnToggleSidebar'));
      asertar(contar(spanB, 'iconToggleSidebar') === 1, 'fase3: span botón iconToggleSidebar = ' + contar(spanB, 'iconToggleSidebar'));
      asertar(contar(spanB, 'rotate-180') === 1, 'fase3: span botón sin rotate-180');
      if (errores.length === 0) {
        deltaBtn = -spanB.length;
        s = s.slice(0, nl) + s.slice(finB);
      }
    }
  }
}

/* FASE 4: badge */
if (errores.length === 0) {
  asertar(contar(s, '>v0.24.6</span>') === 1, 'fase4: badge v0.24.6 no único tras fases 2-3');
  if (errores.length === 0) s = s.split('>v0.24.6</span>').join('>v0.24.7</span>');
}

/* FASE 1: inserción CSS (al final del <style>, tras el CSS de v0.24.6) */
let deltaCSS = 0;
if (errores.length === 0) {
  asertar(contar(s, '\n    </style>') === 1, 'fase1: ancla CSS no única');
  if (errores.length === 0) {
    deltaCSS = (CSS + '    </style>').length - '\n    </style>'.length;
    s = s.split('\n    </style>').join(CSS + '    </style>');
  }
}

/* ---------- SANITY ---------- */
asertar(contar(s, 'btnToggleSidebar') === 0, 'post: btnToggleSidebar = ' + contar(s, 'btnToggleSidebar') + ' (se esperaba 0)');
asertar(contar(s, 'iconToggleSidebar') === 0, 'post: iconToggleSidebar = ' + contar(s, 'iconToggleSidebar') + ' (se esperaba 0)');
asertar(contar(s, 'sidebarCollapsed') === 1, 'post: sidebarCollapsed = ' + contar(s, 'sidebarCollapsed') + ' (se esperaba 1: el removeItem)');
asertar(contar(s, "localStorage.removeItem('sidebarCollapsed')") === 1, 'post: removeItem de sidebarCollapsed no está');
asertar(contar(s, 'sidebar-collapsed') === 11, 'post: sidebar-collapsed = ' + contar(s, 'sidebar-collapsed') + ' (se esperaba 11: 4 originales + 7 del CSS nuevo)');
asertar(contar(s, 'sbEncolarResize') === 5, 'post: sbEncolarResize = ' + contar(s, 'sbEncolarResize') + ' (se esperaba 5: 1 def + 4 usos)');
asertar(contar(s, ':focus-within') === contar(orig, ':focus-within') + 4, 'post: :focus-within debe ser +4 (3 reglas CSS + 1 en comentario JS; es ' + (contar(s, ':focus-within') - contar(orig, ':focus-within')) + ')');
asertar(contar(s, "sidebar.addEventListener('mouseenter'") === 1, 'post: mouseenter del sidebar = ' + contar(s, "sidebar.addEventListener('mouseenter'"));
asertar(contar(s, "sidebar.addEventListener('mouseleave'") === 1, 'post: mouseleave del sidebar = ' + contar(s, "sidebar.addEventListener('mouseleave'"));
asertar(contar(s, '>v0.24.7</span>') === 1, 'post: badge v0.24.7 = ' + contar(s, '>v0.24.7</span>'));
asertar(contar(s, '>v0.24.6</span>') === 0, 'post: quedó un badge v0.24.6');
asertar(contar(s, 'sel-maatly ') === 13, 'post: sel-maatly = ' + contar(s, 'sel-maatly ') + ' (v0.24.6 debe seguir intacto)');
const ESTABLES = ['ntfTickDinero', 'maatlyNotifCfg', 'GS_GAP', 'gridstack', 'abrirCfgSeccion', 'Configuración'];
for (const t of ESTABLES) asertar(contar(orig, t) === contar(s, t), 'estabilidad [' + t + '] ' + contar(orig, t) + ' -> ' + contar(s, t));
asertar(contar(orig, '🎉') === contar(s, '🎉'), 'contenido [🎉] cambió');
asertar(contar(s, 'Ã') === 0 && contar(s, 'Â') === 0, 'mojibake detectado');
const DELTA_ESPERADO = deltaJS + deltaBtn + deltaCSS; /* badge: misma longitud, delta 0 */
asertar(s.length === orig.length + DELTA_ESPERADO, 'delta de tamaño debe ser +' + DELTA_ESPERADO + ' (es ' + (s.length - orig.length) + ')');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- sidebar_edits (v0.24.6 -> v0.24.7) ---');
console.log('JS viejo:', fin - ini, 'chars -> nuevo:', NUEVO_JS.length, '(delta ' + deltaJS + ')');
console.log('botón eliminado:', -deltaBtn, 'chars');
console.log('CSS insertado:', CSS.length, 'chars (delta real ' + deltaCSS + ' tras consumir el ancla)');
console.log('original :', orig.length, 'caracteres');
console.log('resultado:', s.length, 'caracteres (delta +' + (s.length - orig.length) + ')');
console.log('sidebar-collapsed:', contar(s, 'sidebar-collapsed'), '| focus-within:', contar(s, ':focus-within'), '| badge v0.24.7:', contar(s, '>v0.24.7</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
