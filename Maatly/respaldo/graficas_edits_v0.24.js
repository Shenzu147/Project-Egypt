#!/usr/bin/env node
'use strict';
/* =====================================================================
   graficas_edits.js — Maatly v0.24.9 -> v0.24.10 (gráficas unificadas)
   Fase 1: tras colorGridSegunTema() entra la base compartida —
           LEYENDA_GRAF (leyenda común), DATALABELS_PCT (datalabels
           de % que estaba duplicado en los 2 doughnuts) y
           colorBordeGrafica() (separador de porciones por tema:
           blanco en claros, #1e293b en Oscuro, #0f172a en Gemini).
   Fase 2: doughnut del planificador — dataset usa colorBordeGrafica()
           y options usan los presets (fuera leyenda/datalabels copiados).
   Fase 3: bar histórico — leyenda común (era size 10 sin padding).
   Fase 4: pie histórico — leyenda común + datalabels común.
   Fase 5: la corona por tema también en el dataset del pie histórico
           (filtrarReporteHistorico), igual a la del planificador.
   Fase 6: defaults — ticks/tooltips de Chart.js en Inter.
   Fase 7: badge v0.24.9 -> v0.24.10.
   Uso: node graficas_edits.js <ruta.html> [--probe]
   --probe: solo cuenta y reporta; NO escribe nada.
   Aborta SIN escribir si cualquier aserción falla.
   ===================================================================== */
const fs = require('fs');
const ruta = process.argv[2];
const probe = process.argv.includes('--probe');
if (!ruta) { console.error('uso: node graficas_edits.js <ruta.html> [--probe]'); process.exit(1); }
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

/* ---------- FRAGMENTOS ---------- */
const BASE_NUEVA = j([
"        function colorGridSegunTema() {",
"            const t = localStorage.getItem('temaEstilo') || 'gemini';",
"            return (t === 'oscuro' || t === 'gemini') ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.07)';",
"        }",
""
]) +
j([
"        /* v0.24.10 — gráficas unificadas por tema: las 3 gráficas (doughnut del planificador,",
"           bar histórico y pie histórico) comparten FORMA (leyenda, datalabels de porcentajes,",
"           corona de porciones) y el ESTILO se adapta al tema activo (paleta, separador,",
"           grid, tooltip). Cambiar tema destruye y recrea las gráficas con estos defaults. */",
"        const LEYENDA_GRAF = {",
"            position: 'bottom',",
"            labels: {",
"                padding: 14,",
"                usePointStyle: true,",
"                pointStyle: 'circle',",
"                boxWidth: 8,",
"                boxHeight: 8,",
"                font: { size: 11, family: 'Inter, sans-serif', weight: '600' }",
"            }",
"        };",
"        const DATALABELS_PCT = {",
"            display: true,",
"            color: '#ffffff',",
"            font: { weight: '800', size: 11, family: 'Inter, sans-serif' },",
"            textStrokeColor: 'rgba(15, 23, 42, 0.7)',",
"            textStrokeWidth: 2,",
"            formatter: (value, context) => {",
"                const dataset = context.dataset.data;",
"                const total = dataset.reduce((a, b) => a + b, 0);",
"                if(!total || value <= 0) return null;",
"                const pct = (value / total) * 100;",
"                if(pct < 3) return null;",
"                return pct % 1 === 0 ? pct.toFixed(0) + '%' : pct.toFixed(1) + '%';",
"            }",
"        };",
"        function colorBordeGrafica() {",
"            const t = localStorage.getItem('temaEstilo') || 'gemini';",
"            if (t === 'gemini') return '#0f172a'; /* tarjeta de vidrio: rgba(15, 23, 42, .8) */",
"            if (t === 'oscuro') return '#1e293b'; /* card dark:bg-slate-800 */",
"            return '#ffffff';",
"        }"
]);

/* ---------- REEMPLAZOS ---------- */
const R = [];
// Fase 1: base compartida tras colorGridSegunTema()
R.push([
  j([
"        function colorGridSegunTema() {",
"            const t = localStorage.getItem('temaEstilo') || 'gemini';",
"            return (t === 'oscuro' || t === 'gemini') ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.07)';",
"        }"
  ]),
  BASE_NUEVA,
  1
]);

// Fase 2: dataset del doughnut del planificador — borde por tema
R.push([
  j([
"                        data: [],",
"                        backgroundColor: [],",
"                        borderWidth: 2,",
"                        borderColor: '#ffffff'"
  ]),
  j([
"                        data: [],",
"                        backgroundColor: [],",
"                        borderWidth: 2,",
"                        borderColor: colorBordeGrafica() /* v0.24.10: separador por tema */"
  ]),
  1
]);

// Fase 2b: options del doughnut del planificador -> presets compartidos
R.push([
  j([
"                options: {",
"                    responsive: true,",
"                    maintainAspectRatio: false,",
"                    cutout: '55%',",
"                    plugins: {",
"                        legend: {",
"                            position: 'bottom',",
"                            labels: {",
"                                padding: 14,",
"                                usePointStyle: true,",
"                                pointStyle: 'circle',",
"                                boxWidth: 8,",
"                                boxHeight: 8,",
"                                font: { size: 11, family: 'Inter, sans-serif', weight: '600' }",
"                            }",
"                        },",
"                        datalabels: {",
"                            display: true,",
"                            color: '#ffffff',",
"                            font: { weight: '800', size: 11, family: 'Inter, sans-serif' },",
"                            textStrokeColor: 'rgba(15, 23, 42, 0.7)',",
"                            textStrokeWidth: 2,",
"                            formatter: (value, context) => {",
"                                const dataset = context.dataset.data;",
"                                const total = dataset.reduce((a, b) => a + b, 0);",
"                                if(!total || value <= 0) return null;",
"                                const pct = (value / total) * 100;",
"                                if(pct < 3) return null;",
"                                return pct % 1 === 0 ? pct.toFixed(0) + '%' : pct.toFixed(1) + '%';",
"                            }",
"                        }",
"                    }",
"                }",
"            });",
"        }"
  ]),
  j([
"                options: {",
"                    responsive: true,",
"                    maintainAspectRatio: false,",
"                    cutout: '55%',",
"                    plugins: {",
"                        legend: LEYENDA_GRAF,",
"                        datalabels: DATALABELS_PCT",
"                    }",
"                }",
"            });",
"        }"
  ]),
  1
]);

// Fase 3: bar histórico — leyenda común (línea con espacio final, como en el trunk)
R.push([
"                            legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { size: 10, family: 'Inter, sans-serif', weight: '600' } } }, ",
"                            legend: LEYENDA_GRAF, ",
  1
]);

// Fase 4: pie histórico — leyenda común + datalabels común
R.push([
  j([
"                        plugins: { ",
"                            legend: { ",
"                                position: 'bottom', ",
"                                labels: { ",
"                                    usePointStyle: true,",
"                                    pointStyle: 'circle',",
"                                    boxWidth: 8, ",
"                                    font: { size: 10, family: 'Inter, sans-serif', weight: '600' } ",
"                                } ",
"                            }, ",
"                            datalabels: { ",
"                                display: true,",
"                                color: '#ffffff',",
"                                font: { weight: '800', size: 11, family: 'Inter, sans-serif' },",
"                                textStrokeColor: 'rgba(15, 23, 42, 0.7)',",
"                                textStrokeWidth: 2,",
"                                formatter: (value, context) => {",
"                                    const dataset = context.dataset.data;",
"                                    const total = dataset.reduce((a, b) => a + b, 0);",
"                                    if(!total || value <= 0) return null;",
"                                    const pct = (value / total) * 100;",
"                                    if(pct < 3) return null;",
"                                    return pct % 1 === 0 ? pct.toFixed(0) + '%' : pct.toFixed(1) + '%';",
"                                }",
"                            } ",
"                        } "
  ]),
  j([
"                        plugins: { ",
"                            legend: LEYENDA_GRAF,",
"                            datalabels: DATALABELS_PCT",
"                        } "
  ]),
  1
]);

// Fase 5: corona por tema en el pie histórico (dataset de filtrarReporteHistorico)
R.push([
  j([
"                    datasets: [{",
"                        data: pieData.length > 0 ? pieData : [1],",
"                        backgroundColor: themeColors",
"                    }]"
  ]),
  j([
"                    datasets: [{",
"                        data: pieData.length > 0 ? pieData : [1],",
"                        backgroundColor: themeColors,",
"                        borderWidth: 2,",
"                        borderColor: colorBordeGrafica() /* v0.24.10: corona igual a la del planificador */",
"                    }]"
  ]),
  1
]);

// Fase 6: defaults — fuente Inter para ticks/tooltips
R.push([
  j([
"                Chart.defaults.color = barColors.text;",
"                Chart.defaults.borderColor = gridColorTema;"
  ]),
  j([
"                Chart.defaults.color = barColors.text;",
"                Chart.defaults.borderColor = gridColorTema;",
"                Chart.defaults.font.family = 'Inter, sans-serif'; /* v0.24.10: ticks/tooltips en Inter */"
  ]),
  1
]);

// Fase 7: badge
R.push(['>v0.24.9</span>', '>v0.24.10</span>', 1]);

/* ---------- pre-aserciones ---------- */
asertar(contar(orig, '>v0.24.9</span>') === 1, 'pre: badge v0.24.9 = ' + contar(orig, '>v0.24.9</span>') + ' (¿revert de OneDrive?)');
asertar(contar(orig, 'LEYENDA_GRAF') === 0, 'pre: LEYENDA_GRAF ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'DATALABELS_PCT') === 0, 'pre: DATALABELS_PCT ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'colorBordeGrafica') === 0, 'pre: colorBordeGrafica ya existe (¿aplicado dos veces?)');
asertar(contar(orig, "borderColor: '#ffffff'") === 1, 'pre: borderColor blanco = ' + contar(orig, "borderColor: '#ffffff'") + ' (se esperaba 1)');
asertar(contar(orig, 'backgroundColor: []') === 1, 'pre: backgroundColor vacio = ' + contar(orig, 'backgroundColor: []') + ' (se esperaba 1)');
asertar(contar(orig, 'textStrokeColor') === 2, 'pre: datalabels duplicado = ' + contar(orig, 'textStrokeColor') + ' (se esperaba 2)');
asertar(contar(orig, "font: { size: 10, family: 'Inter, sans-serif', weight: '600' }") === 2, 'pre: leyendas size 10 = ' + contar(orig, "font: { size: 10, family: 'Inter, sans-serif', weight: '600' }") + ' (se esperaba 2)');
asertar(contar(orig, 'function colorGridSegunTema') === 1, 'pre: colorGridSegunTema = ' + contar(orig, 'function colorGridSegunTema') + ' (se esperaba 1)');
asertar(contar(orig, 'Chart.defaults.font.family') === 0, 'pre: defaults.font.family ya existe (¿aplicado dos veces?)');
asertar(contar(orig, 'ntfTickDinero') > 0, 'pre: ntfTickDinero ausente (¿revert de OneDrive?)');
asertar(contar(orig, '</style>') === 1, 'pre: </style> aparece ' + contar(orig, '</style>') + ' veces (se esperaba 1)');

/* ---------- EJECUCIÓN ---------- */
let hechos = 0;
for (const [de, a, esperado] of R) {
  const c = contar(s, de);
  asertar(c === esperado, 'patron [' + de.slice(0, 60).replace(/\n/g, '~') + '] aparece ' + c + ' veces (se esperaba ' + esperado + ')');
  if (c === esperado) { s = s.split(de).join(a); hechos += c; }
}

/* ---------- SANITY ---------- */
asertar(contar(s, '>v0.24.10</span>') === 1, 'post: badge v0.24.10 = ' + contar(s, '>v0.24.10</span>'));
asertar(contar(s, '>v0.24.9</span>') === 0, 'post: quedo un badge v0.24.9');
asertar(contar(s, 'LEYENDA_GRAF') === 4, 'post: LEYENDA_GRAF = ' + contar(s, 'LEYENDA_GRAF') + ' (se esperaba 4: def + 3 usos)');
asertar(contar(s, 'DATALABELS_PCT') === 3, 'post: DATALABELS_PCT = ' + contar(s, 'DATALABELS_PCT') + ' (se esperaba 3: def + 2 usos)');
asertar(contar(s, 'colorBordeGrafica') === 3, 'post: colorBordeGrafica = ' + contar(s, 'colorBordeGrafica') + ' (se esperaba 3: def + 2 llamadas)');
asertar(contar(s, "borderColor: '#ffffff'") === 0, 'post: quedo un borderColor blanco fijo');
asertar(contar(s, 'borderColor: colorBordeGrafica()') === 2, 'post: llamadas en datasets = ' + contar(s, 'borderColor: colorBordeGrafica()') + ' (se esperaba 2)');
asertar(contar(s, 'textStrokeColor') === 1, 'post: datalabels de % = ' + contar(s, 'textStrokeColor') + ' (se esperaba 1: solo el preset)');
asertar(contar(s, "font: { size: 10, family: 'Inter, sans-serif', weight: '600' }") === 0, 'post: quedo una leyenda size 10');
asertar(contar(s, "font: { size: 11, family: 'Inter, sans-serif', weight: '600' }") === 1, 'post: leyenda size 11 = ' + contar(s, "font: { size: 11, family: 'Inter, sans-serif', weight: '600' }") + ' (se esperaba 1)');
asertar(contar(s, 'legend: LEYENDA_GRAF') === 3, 'post: usos de leyenda = ' + contar(s, 'legend: LEYENDA_GRAF') + ' (se esperaba 3)');
asertar(contar(s, 'datalabels: DATALABELS_PCT') === 2, 'post: usos de datalabels = ' + contar(s, 'datalabels: DATALABELS_PCT') + ' (se esperaba 2)');
asertar(contar(s, 'Chart.defaults.font.family') === 1, 'post: defaults.font.family = ' + contar(s, 'Chart.defaults.font.family'));
asertar(contar(s, '#0f172a') === contar(orig, '#0f172a') + 1, 'post: #0f172a delta debe ser +1');
asertar(contar(s, '#1e293b') === contar(orig, '#1e293b') + 1, 'post: #1e293b delta debe ser +1');
const ESTABLES = ['ntfTickDinero', 'maatlyNotifCfg', 'GS_CELL', 'sel-maatly', 'sidebar-collapsed', 'gridstack', 'abrirCfgSeccion', 'Configuración'];
for (const t of ESTABLES) asertar(contar(orig, t) === contar(s, t), 'estabilidad [' + t + '] ' + contar(orig, t) + ' -> ' + contar(s, t));
asertar(contar(orig, '🎉') === contar(s, '🎉'), 'contenido [🎉] cambio');
asertar(contar(s, 'Ã') === 0 && contar(s, 'Â') === 0, 'mojibake detectado');
const DELTA_ESPERADO = R.reduce((acc, [de, a, esperado]) => acc + (a.length - de.length) * esperado, 0);
asertar(s.length === orig.length + DELTA_ESPERADO, 'delta de tamano debe ser +' + DELTA_ESPERADO + ' (es ' + (s.length - orig.length) + ')');

/* ---------- REPORTE / ESCRITURA ---------- */
console.log('--- graficas_edits (v0.24.9 -> v0.24.10) ---');
console.log('reemplazos:', hechos, 'de', R.length, 'patrones');
console.log('original :', orig.length, 'caracteres, lineas: ' + (orig.split('\n').length));
console.log('resultado:', s.length, 'caracteres (delta +' + (s.length - orig.length) + '), lineas: ' + (s.split('\n').length));
console.log('LEYENDA_GRAF:', contar(s, 'LEYENDA_GRAF'), '| DATALABELS_PCT:', contar(s, 'DATALABELS_PCT'), '| colorBordeGrafica:', contar(s, 'colorBordeGrafica'), '| borderColor blanco:', contar(s, "borderColor: '#ffffff'"), '| badge v0.24.10:', contar(s, '>v0.24.10</span>'));

if (errores.length) {
  console.error('\n*** FALLO DE ASERCIONES (nada escrito) ***');
  for (const e of errores) console.error(' - ' + e);
  process.exit(1);
}
if (probe) { console.log('\n[probe] OK — todas las aserciones pasan. Nada escrito.'); process.exit(0); }
fs.writeFileSync(ruta, s, 'utf8');
console.log('\nEscrito:', ruta);
