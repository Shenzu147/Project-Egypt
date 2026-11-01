/* v0.23 «Notificaciones como canal principal» — script de edición con aserciones
 * Idempotencia: si algún oldString no cuadra con el conteo esperado, ABORTA sin escribir.
 */
/* ============================================================
 * RUEDA DE EMERGENCIA v0.23 - re-aplica el plan «Notificaciones como canal principal»
 * Restaura el trunk al estado post-plan: 526.160 bytes / MD5 28348F9B210F1C6F5784D8EA160009C2.
 *
 * USO:        node respaldo/notif_edits_v0.23.js [ruta-opcional]
 *             (sin ruta: auto-detecta Maatly_v0.23.html y, si falta, Maatly_v0.22.html en el proyecto)
 *
 * ESCENARIOS:
 *   A) Revert bajo el nombre nuevo (Maatly_v0.23.html en 507.388 bytes) --> aplica en el sitio.
 *   B) Revert bajo el nombre viejo (reaparece Maatly_v0.22.html en 507.388) --> aplica y RENOMBRA a
 *      Maatly_v0.23.html (el .lnk ya apunta a ese nombre); aborta sin escribir si ambos existieran.
 *   C) Trunk dañado o faltante --> restaurar primero desde respaldo/Maatly_v0.22.3_preNotif.html
 *      (copiarlo al proyecto con el nombre Maatly_v0.23.html) y correr esto (caso A).
 *
 * GARANTÍAS: por MD5 exige que la entrada sea el estado pre-notif (E89CE257A2C2E43C87E3FEA2B9580F41 =
 * v0.22.3 + «Agente en pausa»); aborta sin escribir si alguna aserción no cuadra; al final imprime el
 * MD5 de salida para cerrar el ciclo de verificación.
 * Generado el 26/10/2026 desde Temp/opencode/notif_edits.js (su medio quedó intacto).
 * ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = 'C:/Users/jdeb1/OneDrive/Desktop/Maatly App';
const PRE_HASH = 'E89CE257A2C2E43C87E3FEA2B9580F41';   // v0.22.3 + Agente en pausa (estado pre-notif)
const POST_HASH = '28348F9B210F1C6F5784D8EA160009C2';  // v0.23 completa (estado post)

function md5File(f) { return crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').toUpperCase(); }

let P = (typeof process.argv[2] === 'string' && process.argv[2]) ? String(process.argv[2]).replace(/\\/g, '/') : null;
if (!P) {
    const cands = ['Maatly_v0.23.html', 'Maatly_v0.22.html'];
    for (let i = 0; i < cands.length; i++) { const full = DIR + '/' + cands[i]; if (fs.existsSync(full)) { P = full; break; } }
}
if (!P) { console.log('ABORTADO - no se encontró Maatly_v0.23.html ni Maatly_v0.22.html en el proyecto.'); process.exit(1); }

let s;
try { s = fs.readFileSync(P, 'utf8'); } catch (e) { console.log('ABORTADO - no se pudo leer: ' + e.message); process.exit(1); }
const hashIn = md5File(P);
if (hashIn === POST_HASH) {
    console.log('NADA QUE HACER - ' + path.basename(P) + ' ya está en estado v0.23 COMPLETO (' + POST_HASH + '). No se escribió nada.');
    if (fs.existsSync(DIR + '/Maatly_v0.22.html')) console.log('Nota: existe además un Maatly_v0.22.html - si es basura de un revert viejo, decide tú si borrarlo.');
    process.exit(0);
}
if (hashIn !== PRE_HASH) {
    console.log('ABORTADO - estado INESPERADO: ' + path.basename(P) + ' tiene MD5 ' + hashIn + ' y ' + Buffer.byteLength(s, 'utf8') + ' bytes.');
    console.log('Solo se aplica sobre el estado pre-notif (' + PRE_HASH + ', 507.388 bytes). No se escribió nada.');
    console.log('Si el trunk está dañado o perdido: restaura primero desde respaldo/Maatly_v0.22.3_preNotif.html');
    console.log('(copiarlo al proyecto con el nombre Maatly_v0.23.html) y vuelve a correr este script.');
    process.exit(1);
}
console.log('Entrada verificada: ' + path.basename(P) + ' (' + Buffer.byteLength(s, 'utf8') + ' bytes, MD5 ' + hashIn + ') = estado pre-notif OK');
const pre = s.length;
const errores = [];

function tc(t, token) { return t.split(token).length - 1; }
function rep(old, neu, cnt) {
    const g = s.split(old).length - 1;
    if (g !== cnt) { errores.push('[REP] esperado ' + cnt + ' y hay ' + g + ' => ' + JSON.stringify(old.slice(0, 80))); return; }
    s = s.split(old).join(neu);
}

/* ---- A) HUB: tarjeta nueva Notificaciones (antes de Datos) ---- */
rep(`                    <button onclick="abrirCfgSeccion('datos')" class="group text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all">`,
`                    <button onclick="abrirCfgSeccion('notif')" class="group text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md transition-all">
                        <div class="flex items-start gap-4">
                            <span class="p-2.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-lg">🔔</span>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold text-slate-800 dark:text-white text-sm">Notificaciones</h3>
                                <p class="text-[11px] text-slate-400 mt-0.5">Canales de aviso (PC y móvil) y avisos de dinero: presupuesto, categorías, ahorro y cierre de mes.</p>
                            </div>
                            <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-rose-500 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </button>
                    <button onclick="abrirCfgSeccion('datos')" class="group text-left bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all">`, 1);

/* ---- B) CFG_SECCIONES: entrada notif ---- */
rep(`            datos:      { icono: '💾', titulo: 'Datos y Respaldos', sub: 'Datos demo, exportación y restauración de tu información.' }
        };`,
`            datos:      { icono: '💾', titulo: 'Datos y Respaldos', sub: 'Datos demo, exportación y restauración de tu información.' },
            notif:      { icono: '🔔', titulo: 'Notificaciones', sub: 'Canales de aviso (PC y móvil) y avisos de dinero: presupuesto, categorías, ahorro y cierre de mes.' }
        };`, 1);

/* ---- C) Sección estática cfgSeccionNotif (antes de la sección DATOS) ---- */
rep(`                <!-- SECCIÓN: DATOS -->`,
`                <!-- SECCIÓN: NOTIFICACIONES (v0.23) -->
                <div id="cfgSeccionNotif" class="hidden space-y-3">
                    <button onclick="cerrarCfgSeccion()" class="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs transition-colors">← Volver a Ajustes</button>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div id="cfgBodyNotif" class="p-0">
                            <p class="text-xs text-slate-400">Cargando panel de notificaciones…</p>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN: DATOS -->`, 1);

/* ---- D1) agRenderPanel: fuera las consts de notif (pasan al panel nuevo) ---- */
rep(`            const permiso = ('Notification' in window) ? Notification.permission : 'no-soportado';
            const cfg = agGetNotifCfg();
            const pin = agGetPin();`,
`            const pin = agGetPin();`, 1);

/* ---- D2) agRenderPanel: fuera los 3 bloques HTML de notificaciones ---- */
rep(`            html += '  <div class="pt-2 border-t border-slate-200 dark:border-slate-700">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-2">Notificaciones de tareas</h4>';
            html += '    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agNtfVencidas" ' + (cfg.pcVencidas ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Avisar tareas vencidas (PC)</label>';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agNtfAgenda" ' + (cfg.pcAgenda ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Agenda del día (PC)</label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Hora de la agenda: <input type="time" id="agNtfHora" value="' + cfg.horaAgenda + '" class="ml-1 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <div class="text-sm text-slate-700 dark:text-slate-200">Permiso del navegador: <span id="agPermisoEstado" class="font-bold ' + (permiso === 'granted' ? 'text-green-500' : 'text-amber-500') + '">' + (permiso === 'granted' ? 'Concedido' : (permiso === 'denied' ? 'Bloqueado' : (permiso === 'no-soportado' ? 'No soportado' : 'Falta conceder'))) + '</span></div>';
            html += '    </div>';
            html += '    <button id="agBtnPermiso" class="mt-3 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs">Activar notificaciones en este equipo</button>';

            html += '    <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">';
            html += '      <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">Recordatorios antes de cada actividad</h4>';
            html += '      <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Para actividades con fecha y hora. Elige con cuánta antelación avisar (puedes marcar varias).</p>';
            html += '      <div class="flex flex-wrap items-center gap-4 mb-2">';
            html += '        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agNtfPrevPC" ' + (cfg.prevPc ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Notificación en PC</label>';
            html += '        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agNtfPrevPush" ' + (cfg.prevPush ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Push al móvil</label>';
            html += '      </div>';
            html += '      <div id="agPrevChips" class="flex flex-wrap gap-1.5">' + [5, 10, 15, 30, 60].map(function(m) { const on = Array.isArray(cfg.antelaciones) && cfg.antelaciones.indexOf(m) !== -1; return '<button type="button" data-min="' + m + '" class="agPrevChip px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ' + (on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300') + '">' + m + ' min</button>'; }).join('') + '</div>';
            html += '    </div>';
            html += '  </div>';

            html += '  <div class="pt-2 border-t border-slate-200 dark:border-slate-700">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">Push real al móvil (aunque la app esté cerrada)</h4>';
            html += '    <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Opción A — <b>ntfy</b>: instala la app "ntfy" en tu móvil, crea un tema único (ej. maatly-' + agSufijoSugerido() + ') y suscríbete. Opción B — <b>Telegram</b>: crea un bot con @BotFather, pega el token aquí y Maatly <b>detecta tu Chat ID solo</b> (<a href="#" id="agBtnTgGuia" class="text-indigo-600 dark:text-indigo-400 underline font-bold">ver pasos</a>).</p>';
            html += '    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Vía: <select id="agPushVia" class="ml-1 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"><option value="ninguno"' + (cfg.pushVia === 'ninguno' ? ' selected' : '') + '>Ninguna</option><option value="ntfy"' + (cfg.pushVia === 'ntfy' ? ' selected' : '') + '>ntfy</option><option value="telegram"' + (cfg.pushVia === 'telegram' ? ' selected' : '') + '>Telegram</option></select></label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Tema ntfy: <input id="agNtfyTopic" value="' + agEscape(cfg.ntfyTopic) + '" placeholder="maatly-abc123" class="ml-1 w-40 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Token bot Telegram: <input id="agTgToken" type="password" value="' + agEscape(cfg.tgToken) + '" placeholder="123456:ABC..." class="ml-1 w-36 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Chat ID: <input id="agTgChat" value="' + agEscape(cfg.tgChat) + '" placeholder="123456789" class="ml-1 w-28 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '    </div>';
            html += '    <div class="flex flex-wrap items-center gap-2 mt-2">';
            html += '      <button id="agBtnTgDetectar" class="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs">Detectar mi Chat ID</button>';
            html += '      <span id="agTgDetectEstado" class="text-xs text-slate-500 dark:text-slate-400"></span>';
            html += '    </div>';
            html += '    <div class="flex flex-wrap gap-2 mt-3">';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agPushVencidas" ' + (cfg.pushVencidas ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Push de vencidas</label>';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="agPushAgenda" ' + (cfg.pushAgenda ? 'checked' : '') + ' class="accent-indigo-600 w-4 h-4"> Push de agenda del día</label>';
            html += '      <button id="agBtnPushProbar" class="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold rounded-lg text-xs">Enviar prueba al móvil</button>';
            html += '    </div>';
            html += '  </div>';

            html += '  <div class="pt-2 border-t border-slate-200 dark:border-slate-700">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">Seguridad — PIN de acceso (prototipo)</h4>';`,
`            html += '  <div class="pt-2 border-t border-slate-200 dark:border-slate-700">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">Seguridad — PIN de acceso (prototipo)</h4>';`, 1);

/* ---- D3) agWirePanel: fuera los bindings de notificaciones (pasan a ntfWirePanel) ---- */
rep(`            const agNtfV = document.getElementById('agNtfVencidas'), agNtfA = document.getElementById('agNtfAgenda'), agNtfH = document.getElementById('agNtfHora');
            const agGuardarNotif = () => {
                const cfg = agGetNotifCfg();
                if (agNtfV) cfg.pcVencidas = agNtfV.checked;
                if (agNtfA) cfg.pcAgenda = agNtfA.checked;
                if (agNtfH) cfg.horaAgenda = agNtfH.value || '08:00';
                const via = document.getElementById('agPushVia'); if (via) cfg.pushVia = via.value;
                const ntp = document.getElementById('agNtfyTopic'); if (ntp) cfg.ntfyTopic = ntp.value.trim();
                const tgt = document.getElementById('agTgToken'); if (tgt) cfg.tgToken = tgt.value.trim();
                const tgc = document.getElementById('agTgChat'); if (tgc) cfg.tgChat = tgc.value.trim();
                const pV = document.getElementById('agPushVencidas'); if (pV) cfg.pushVencidas = pV.checked;
                const pA = document.getElementById('agPushAgenda'); if (pA) cfg.pushAgenda = pA.checked;
                const ppc = document.getElementById('agNtfPrevPC'); if (ppc) cfg.prevPc = ppc.checked;
                const ppsh = document.getElementById('agNtfPrevPush'); if (ppsh) cfg.prevPush = ppsh.checked;
                const mins = []; document.querySelectorAll('#agPrevChips .agPrevChip').forEach(c => { if (c.classList.contains('bg-indigo-600')) mins.push(parseInt(c.dataset.min, 10) || 0); });
                cfg.antelaciones = mins;
                localStorage.setItem('maatlyNotifCfg', JSON.stringify(cfg));
            };
            [agNtfV, agNtfA, agNtfH].forEach(el => { if (el) el.addEventListener('change', agGuardarNotif); });
            ['agPushVia', 'agNtfyTopic', 'agTgToken', 'agTgChat', 'agPushVencidas', 'agPushAgenda'].forEach(id => {
                const el = document.getElementById(id); if (el) el.addEventListener('change', agGuardarNotif);
            });
            ['agNtfPrevPC', 'agNtfPrevPush'].forEach(id => {
                const el = document.getElementById(id); if (el) el.addEventListener('change', agGuardarNotif);
            });
            document.querySelectorAll('#agPrevChips .agPrevChip').forEach(c => c.addEventListener('click', () => {
                triggerHaptic();
                ['bg-indigo-600', 'border-indigo-600', 'text-white', 'bg-slate-50', 'dark:bg-slate-900', 'border-slate-300', 'dark:border-slate-600', 'text-slate-500', 'dark:text-slate-300'].forEach(cl => c.classList.toggle(cl));
                agGuardarNotif();
            }));

            const btnPermiso = document.getElementById('agBtnPermiso');
            if (btnPermiso) btnPermiso.addEventListener('click', async () => {
                triggerHaptic();
                if (!('Notification' in window)) { mostrarToast('Este navegador no soporta notificaciones', 'error'); return; }
                const p = await Notification.requestPermission();
                mostrarToast(p === 'granted' ? 'Notificaciones activadas' : 'Permiso: ' + p, p === 'granted' ? 'success' : 'error');
                agRenderPanel();
            });

            const btnProbar = document.getElementById('agBtnPushProbar');
            if (btnProbar) btnProbar.addEventListener('click', async () => {
                agGuardarNotif();
                const ok = await agEnviarPush('Prueba de Maatly', 'Si lees esto en tu móvil, el push real funciona. 🎉');
                mostrarToast(ok ? 'Enviado — revisa tu móvil' : 'No se pudo enviar (revisa vía/tema/token)', ok ? 'success' : 'error');
            });

            const btnTgGuia = document.getElementById('agBtnTgGuia');
            if (btnTgGuia) btnTgGuia.addEventListener('click', (e) => { e.preventDefault(); triggerHaptic(); agAbrirGuiaTelegram(); });
            const btnTgDetectar = document.getElementById('agBtnTgDetectar');
            if (btnTgDetectar) btnTgDetectar.addEventListener('click', () => { triggerHaptic(); agDetectarChatId(); });

`, `\n`, 1);

/* ---- E) Bloque NUEVO: panel Notificaciones + wire + guardado + motor de dinero ---- */
rep(`        }

        /* ---------- Validador de conexión por modelo ---------- */`,
`        }

        /* ---------- v0.23: Panel «Notificaciones» en Configuración — canal principal (independiente del agente en pausa) ---------- */
        function ntfRenderPanel() {
            const cont = document.getElementById('cfgBodyNotif');
            if (!cont) return;
            const permisoNtf = ('Notification' in window) ? Notification.permission : 'no-soportado';
            const cfg = agGetNotifCfg();
            const CBOX = 'accent-indigo-600 w-4 h-4';
            const CLSCHIP = 'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ';
            const ON = 'bg-indigo-600 border-indigo-600 text-white';
            const OFF = 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300';
            let html = '';
            html += '<div class="space-y-6">';

            // 1) Canales (migrados del panel del agente, mismos ajustes)
            html += '  <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-2">📺 Canales de aviso</h4>';
            html += '    <div class="flex flex-wrap items-center gap-4">';
            html += '      <div class="text-sm text-slate-700 dark:text-slate-200">Permiso del navegador: <span id="ntfPermisoEstado" class="font-bold ' + (permisoNtf === 'granted' ? 'text-green-500' : 'text-amber-500') + '">' + (permisoNtf === 'granted' ? 'Concedido' : (permisoNtf === 'denied' ? 'Bloqueado' : (permisoNtf === 'no-soportado' ? 'No soportado' : 'Falta conceder'))) + '</span> <button id="ntfBtnPermiso" class="ml-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px]">Activar en este equipo</button></div>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Vía push móvil: <select id="ntfPushVia" class="ml-1 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"><option value="ninguno"' + (cfg.pushVia === 'ninguno' ? ' selected' : '') + '>Ninguna</option><option value="ntfy"' + (cfg.pushVia === 'ntfy' ? ' selected' : '') + '>ntfy</option><option value="telegram"' + (cfg.pushVia === 'telegram' ? ' selected' : '') + '>Telegram</option></select></label>';
            html += '    </div>';
            html += '    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Tema ntfy: <input id="ntfNtfyTopic" value="' + agEscape(cfg.ntfyTopic) + '" placeholder="maatly-' + agSufijoSugerido() + '" class="ml-1 w-40 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Token bot Telegram: <input id="ntfTgToken" type="password" value="' + agEscape(cfg.tgToken) + '" placeholder="123456:ABC..." class="ml-1 w-36 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Chat ID: <input id="ntfTgChat" value="' + agEscape(cfg.tgChat) + '" placeholder="123456789" class="ml-1 w-28 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '      <div class="flex items-center gap-2"><button id="ntfBtnTgDetectar" class="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs">Detectar mi Chat ID</button><span id="ntfTgDetectEstado" class="text-xs text-slate-500 dark:text-slate-400"></span></div>';
            html += '    </div>';
            html += '    <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Opción A — <b>ntfy</b>: instala la app "ntfy" en tu móvil y crea un tema único (ej. maatly-' + agSufijoSugerido() + '), luego suscríbete. Opción B — <b>Telegram</b>: crea un bot con @BotFather, pega el token aquí y Maatly <b>detecta tu Chat ID solo</b> (<a href="#" id="ntfBtnTgGuia" class="text-indigo-600 dark:text-indigo-400 underline font-bold">ver pasos</a>).</p>';
            html += '    <button id="ntfBtnPushProbar" class="mt-3 px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-semibold rounded-lg text-xs">Enviar prueba al móvil</button>';
            html += '  </div>';

            // 2) Actividades y agenda (migrados del panel del agente)
            html += '  <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4">';
            html += '    <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-2">⏰ Actividades y agenda</h4>';
            html += '    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfVencidas" ' + (cfg.pcVencidas ? 'checked' : '') + ' class="' + CBOX + '"> Avisar tareas vencidas (PC)</label>';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfAgenda" ' + (cfg.pcAgenda ? 'checked' : '') + ' class="' + CBOX + '"> Agenda del día (PC)</label>';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPushVencidas" ' + (cfg.pushVencidas ? 'checked' : '') + ' class="' + CBOX + '"> Push de vencidas</label>';
            html += '      <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPushAgenda" ' + (cfg.pushAgenda ? 'checked' : '') + ' class="' + CBOX + '"> Push de agenda del día</label>';
            html += '      <label class="text-sm text-slate-700 dark:text-slate-200">Hora de la agenda: <input type="time" id="ntfHora" value="' + cfg.horaAgenda + '" class="ml-1 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"></label>';
            html += '    </div>';
            html += '    <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">';
            html += '      <h4 class="font-bold text-slate-800 dark:text-white text-sm mb-1">Recordatorios antes de cada actividad</h4>';
            html += '      <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">Para actividades con fecha y hora. Elige con cuánta antelación avisar (puedes marcar varias).</p>';
            html += '      <div class="flex flex-wrap items-center gap-4 mb-2">';
            html += '        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPrevPC" ' + (cfg.prevPc ? 'checked' : '') + ' class="' + CBOX + '"> Notificación en PC</label>';
            html += '        <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPrevPush" ' + (cfg.prevPush ? 'checked' : '') + ' class="' + CBOX + '"> Push al móvil</label>';
            html += '      </div>';
            html += '      <div id="ntfPrevChips" class="flex flex-wrap gap-1.5">' + [5, 10, 15, 30, 60].map(function(m) { const on = Array.isArray(cfg.antelaciones) && cfg.antelaciones.indexOf(m) !== -1; return '<button type="button" data-min="' + m + '" class="ntfPrevChip ' + CLSCHIP + (on ? ON : OFF) + '">' + m + ' min</button>'; }).join('') + '</div>';
            html += '    </div>';
            html += '  </div>';

            // 3) Avisos de dinero (nuevos en v0.23)
            html += '  <div class="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-xl p-4 space-y-4">';
            html += '    <div><h4 class="font-bold text-slate-800 dark:text-white text-sm">💰 Avisos de dinero</h4><p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Reglas con tus propios datos (Plan del Mes, movimientos y planes de ahorro). Cada aviso queda en el centro de la campana.</p></div>';

            html += '    <div class="border border-slate-200 dark:border-slate-700/80 rounded-lg p-3">';
            html += '      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">';
            html += '        <div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">📊 Presupuesto del mes</p><p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Compara tus gastos reales con lo planificado. Marca con qué porcentajes avisar (1 vez por umbral y por mes).</p></div>';
            html += '        <div class="flex items-center gap-3 flex-shrink-0"><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPdPc" ' + (cfg.pdPc ? 'checked' : '') + ' class="' + CBOX + '"> PC</label><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfPdPush" ' + (cfg.pdPush ? 'checked' : '') + ' class="' + CBOX + '"> Push</label></div>';
            html += '      </div>';
            html += '      <div id="ntfPdChips" class="flex flex-wrap gap-1.5 mt-2">' + [50, 75, 90].map(function(u) { const on = Array.isArray(cfg.pdUmbrales) && cfg.pdUmbrales.indexOf(u) !== -1; return '<button type="button" data-min="' + u + '" class="ntfPdChip ' + CLSCHIP + (on ? ON : OFF) + '">' + u + '%</button>'; }).join('') + '</div>';
            html += '    </div>';

            html += '    <div class="border border-slate-200 dark:border-slate-700/80 rounded-lg p-3">';
            html += '      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">';
            html += '        <div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">🏷️ Categoría excedida</p><p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Avisa cuando el gasto real de una categoría supera su presupuesto del Plan del Mes (1 vez por categoría y por mes).</p></div>';
            html += '        <div class="flex items-center gap-3 flex-shrink-0"><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfCatPc" ' + (cfg.catPc ? 'checked' : '') + ' class="' + CBOX + '"> PC</label><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfCatPush" ' + (cfg.catPush ? 'checked' : '') + ' class="' + CBOX + '"> Push</label></div>';
            html += '      </div>';
            html += '    </div>';

            html += '    <div class="border border-slate-200 dark:border-slate-700/80 rounded-lg p-3">';
            html += '      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">';
            html += '        <div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">🏦 Ahorro y planes</p><p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Al registrar un ingreso: recordatorio para apartar tu ahorro del mes. Al alcanzar la meta de un plan: celebración del logro.</p></div>';
            html += '        <div class="flex items-center gap-3 flex-shrink-0"><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfAhPc" ' + (cfg.ahPc ? 'checked' : '') + ' class="' + CBOX + '"> PC</label><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfAhPush" ' + (cfg.ahPush ? 'checked' : '') + ' class="' + CBOX + '"> Push</label></div>';
            html += '      </div>';
            html += '    </div>';

            html += '    <div class="border border-slate-200 dark:border-slate-700/80 rounded-lg p-3">';
            html += '      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">';
            html += '        <div><p class="text-sm font-bold text-slate-700 dark:text-slate-200">📦 Cierre de mes</p><p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Aviso diario a fin de mes si el mes actual sigue sin guardar/cerrar.</p></div>';
            html += '        <div class="flex items-center gap-3 flex-shrink-0"><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfCiePc" ' + (cfg.ciePc ? 'checked' : '') + ' class="' + CBOX + '"> PC</label><label class="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200"><input type="checkbox" id="ntfCiePush" ' + (cfg.ciePush ? 'checked' : '') + ' class="' + CBOX + '"> Push</label></div>';
            html += '      </div>';
            html += '      <div class="mt-2"><label class="text-xs text-slate-700 dark:text-slate-200">Avisar desde el día <input type="number" id="ntfCieDia" min="1" max="31" value="' + (parseInt(cfg.cieDiaMes, 10) || 25) + '" class="ml-1 w-14 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"> del mes</label></div>';
            html += '    </div>';

            html += '    <div class="pt-1"><button id="ntfBtnProbarDinero" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs">Probar un aviso de dinero</button><span class="text-[11px] text-slate-500 dark:text-slate-400 ml-2">Muestra un aviso de ejemplo en el PC y en tu móvil.</span></div>';
            html += '  </div>';
            html += '</div>';
            cont.innerHTML = html;
            ntfWirePanel();
        }

        function ntfGuardarCfg() {
            try {
                const cfg = agGetNotifCfg();
                const v = document.getElementById('ntfVencidas'); if (v) cfg.pcVencidas = v.checked;
                const a = document.getElementById('ntfAgenda'); if (a) cfg.pcAgenda = a.checked;
                const h = document.getElementById('ntfHora'); if (h) cfg.horaAgenda = h.value || '08:00';
                const via = document.getElementById('ntfPushVia'); if (via) cfg.pushVia = via.value;
                const ntp = document.getElementById('ntfNtfyTopic'); if (ntp) cfg.ntfyTopic = ntp.value.trim();
                const tgt = document.getElementById('ntfTgToken'); if (tgt) cfg.tgToken = tgt.value.trim();
                const tgc = document.getElementById('ntfTgChat'); if (tgc) cfg.tgChat = tgc.value.trim();
                const pV = document.getElementById('ntfPushVencidas'); if (pV) cfg.pushVencidas = pV.checked;
                const pA = document.getElementById('ntfPushAgenda'); if (pA) cfg.pushAgenda = pA.checked;
                const ppc = document.getElementById('ntfPrevPC'); if (ppc) cfg.prevPc = ppc.checked;
                const ppsh = document.getElementById('ntfPrevPush'); if (ppsh) cfg.prevPush = ppsh.checked;
                const mins = []; document.querySelectorAll('#ntfPrevChips .ntfPrevChip').forEach(c => { if (c.classList.contains('bg-indigo-600')) mins.push(parseInt(c.dataset.min, 10) || 0); });
                cfg.antelaciones = mins;
                const pd = document.getElementById('ntfPdPc'); if (pd) cfg.pdPc = pd.checked;
                const pup = document.getElementById('ntfPdPush'); if (pup) cfg.pdPush = pup.checked;
                const umb = []; document.querySelectorAll('#ntfPdChips .ntfPdChip').forEach(c => { if (c.classList.contains('bg-indigo-600')) umb.push(parseInt(c.dataset.min, 10) || 0); });
                cfg.pdUmbrales = umb;
                const cp = document.getElementById('ntfCatPc'); if (cp) cfg.catPc = cp.checked;
                const cpush = document.getElementById('ntfCatPush'); if (cpush) cfg.catPush = cpush.checked;
                const ahp = document.getElementById('ntfAhPc'); if (ahp) cfg.ahPc = ahp.checked;
                const ahs = document.getElementById('ntfAhPush'); if (ahs) cfg.ahPush = ahs.checked;
                const cip = document.getElementById('ntfCiePc'); if (cip) cfg.ciePc = cip.checked;
                const cis = document.getElementById('ntfCiePush'); if (cis) cfg.ciePush = cis.checked;
                const cid = document.getElementById('ntfCieDia'); if (cid) cfg.cieDiaMes = parseInt(cid.value, 10) || 25;
                localStorage.setItem('maatlyNotifCfg', JSON.stringify(cfg));
            } catch (e) {}
        }

        function ntfWirePanel() {
            ['ntfVencidas', 'ntfAgenda', 'ntfHora', 'ntfPushVia', 'ntfNtfyTopic', 'ntfTgToken', 'ntfTgChat', 'ntfPushVencidas', 'ntfPushAgenda', 'ntfPrevPC', 'ntfPrevPush', 'ntfPdPc', 'ntfPdPush', 'ntfCatPc', 'ntfCatPush', 'ntfAhPc', 'ntfAhPush', 'ntfCiePc', 'ntfCiePush', 'ntfCieDia'].forEach(id => {
                const el = document.getElementById(id); if (el) el.addEventListener('change', ntfGuardarCfg);
            });
            document.querySelectorAll('#ntfPrevChips .ntfPrevChip').forEach(c => c.addEventListener('click', () => {
                triggerHaptic();
                ['bg-indigo-600', 'border-indigo-600', 'text-white', 'bg-slate-50', 'dark:bg-slate-900', 'border-slate-300', 'dark:border-slate-600', 'text-slate-500', 'dark:text-slate-300'].forEach(cl => c.classList.toggle(cl));
                ntfGuardarCfg();
            }));
            document.querySelectorAll('#ntfPdChips .ntfPdChip').forEach(c => c.addEventListener('click', () => {
                triggerHaptic();
                ['bg-indigo-600', 'border-indigo-600', 'text-white', 'bg-slate-50', 'dark:bg-slate-900', 'border-slate-300', 'dark:border-slate-600', 'text-slate-500', 'dark:text-slate-300'].forEach(cl => c.classList.toggle(cl));
                ntfGuardarCfg();
            }));

            const btnPermisoNtf = document.getElementById('ntfBtnPermiso');
            if (btnPermisoNtf) btnPermisoNtf.addEventListener('click', async () => {
                triggerHaptic();
                if (!('Notification' in window)) { mostrarToast('Este navegador no soporta notificaciones', 'error'); return; }
                const p = await Notification.requestPermission();
                mostrarToast(p === 'granted' ? 'Notificaciones activadas' : 'Permiso: ' + p, p === 'granted' ? 'success' : 'error');
                ntfRenderPanel();
            });

            const btnProbarNtf = document.getElementById('ntfBtnPushProbar');
            if (btnProbarNtf) btnProbarNtf.addEventListener('click', async () => {
                triggerHaptic();
                ntfGuardarCfg();
                const ok = await agEnviarPush('Prueba de Maatly', 'Si lees esto en tu móvil, el push real funciona. 🎉');
                mostrarToast(ok ? 'Enviado — revisa tu móvil' : 'No se pudo enviar (revisa vía/tema/token)', ok ? 'success' : 'error');
            });

            const btnTgGuiaNtf = document.getElementById('ntfBtnTgGuia');
            if (btnTgGuiaNtf) btnTgGuiaNtf.addEventListener('click', (e) => { e.preventDefault(); triggerHaptic(); agAbrirGuiaTelegram(); });
            const btnTgDetectarNtf = document.getElementById('ntfBtnTgDetectar');
            if (btnTgDetectarNtf) btnTgDetectarNtf.addEventListener('click', () => { triggerHaptic(); ntfGuardarCfg(); agDetectarChatId(); });

            const btnDineroNtf = document.getElementById('ntfBtnProbarDinero');
            if (btnDineroNtf) btnDineroNtf.addEventListener('click', () => { triggerHaptic(); ntfGuardarCfg(); ntfAvisoPrueba(); });
        }

        /* ---------- v0.23: avisos de DINERO (deterministas, sin IA) ---------- */
        function ntfMesReg(mesStr) {
            let reg = null;
            getHist().forEach(r => { if (r.fechaStr === mesStr && (!reg || Number(r.id) > Number(reg.id))) reg = r; });
            return reg;
        }
        function ntfFmt(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-VE'); }
        function ntfGastoRealMes(anio, mesIdx) {
            return movimientosDelMes(anio, mesIdx).filter(m => m.tipo !== 'ingreso').reduce((sum, m) => sum + (Number(m.monto) || 0), 0);
        }

        function ntfTickDinero() {
            const cfg = agGetNotifCfg();
            if (!(cfg.pdPc || cfg.pdPush || cfg.catPc || cfg.catPush || cfg.ciePc || cfg.ciePush)) return;
            let log = {};
            try { log = JSON.parse(localStorage.getItem('maatlyNotifLog') || '{}'); } catch (e) { log = {}; }
            const hoy = new Date();
            const mesStr = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');
            const hoyStr = hoy.toISOString().slice(0, 10);
            let cambio = false;

            const reg = ntfMesReg(mesStr);
            const gastoPlan = reg ? (reg.gastos || []).reduce((sum, g) => sum + (Number(g.val) || 0), 0) : 0;

            // 1) Presupuesto del mes: avisos al cruzar los umbrales marcados
            if ((cfg.pdPc || cfg.pdPush) && reg && gastoPlan > 0) {
                const gastoReal = ntfGastoRealMes(hoy.getFullYear(), hoy.getMonth());
                const pct = Math.floor((gastoReal / gastoPlan) * 100);
                (Array.isArray(cfg.pdUmbrales) ? cfg.pdUmbrales : []).forEach(U => {
                    const clave = 'pg_' + mesStr + '_' + U;
                    if (pct >= U && log[clave] !== '1') {
                        log[clave] = '1'; cambio = true;
                        const rest = gastoPlan - gastoReal;
                        const cuerpo = 'Has usado ' + pct + '% de lo planificado (' + ntfFmt(gastoReal) + ' de ' + ntfFmt(gastoPlan) + ').' + (rest > 0 ? ' Disponible: ' + ntfFmt(rest) + '.' : ' Ya rebasaste lo planificado.');
                        if (cfg.pdPc) agNotificarLocal('📊 Presupuesto al ' + U + '%', cuerpo, clave, 'presupuesto', '');
                        if (cfg.pdPush) agEnviarPush('Maatly: presupuesto al ' + U + '%', cuerpo);
                    }
                });
            }

            // 2) Categoría excedida: gasto real de una categoría > su presupuesto del plan del mes
            if ((cfg.catPc || cfg.catPush) && reg && Array.isArray(reg.gastos)) {
                const delMes = movimientosDelMes(hoy.getFullYear(), hoy.getMonth());
                reg.gastos.forEach(g => {
                    const preset = Number(g.val) || 0;
                    const nom = (g.name || g.nombre || '').trim();
                    if (!nom || preset <= 0) return;
                    const gastado = delMes.filter(m => m.tipo !== 'ingreso' && String(m.cat || '').trim().toLowerCase() === nom.toLowerCase()).reduce((sum, m) => sum + (Number(m.monto) || 0), 0);
                    if (gastado > preset) {
                        const clave = 'cg_' + mesStr + '_' + nom;
                        if (log[clave] !== '1') {
                            log[clave] = '1'; cambio = true;
                            const cuerpo = 'En "' + nom + '" llevas ' + ntfFmt(gastado) + ' de ' + ntfFmt(preset) + ' planificados (+' + ntfFmt(gastado - preset) + ').';
                            if (cfg.catPc) agNotificarLocal('🏷️ Categoría excedida: ' + nom, cuerpo, clave, 'categoria', '');
                            if (cfg.catPush) agEnviarPush('Maatly: categoría excedida — ' + nom, cuerpo);
                        }
                    }
                });
            }

            // 3) Cierre de mes: aviso diario desde el día configurado
            if (cfg.ciePc || cfg.ciePush) {
                const limite = parseInt(cfg.cieDiaMes, 10) || 25;
                const yaCerrado = getArchivoMensual().some(a => a.mes === mesStr);
                const clave = '_ci_' + hoyStr;
                if (hoy.getDate() >= limite && !yaCerrado && log[clave] !== '1') {
                    log[clave] = '1'; cambio = true;
                    const total = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
                    const restan = total - hoy.getDate() + 1;
                    const cuerpo = 'Quedan ' + restan + ' día(s) para terminar ' + mesNombreLargo(mesStr) + '. Guarda tu mes en Historial → Plan del Mes (💾 Guardar en Historial).';
                    if (cfg.ciePc) agNotificarLocal('📦 Cierre de mes cerca', cuerpo, clave, 'cierre', '');
                    if (cfg.ciePush) agEnviarPush('Maatly: cierre de mes cerca', cuerpo);
                }
            }

            if (cambio) { try { localStorage.setItem('maatlyNotifLog', JSON.stringify(log)); } catch (e) {} }
        }

        // Evento: al registrar un ingreso — recordatorio de apartar el ahorro del mes
        function ntfAvisoIngreso(monto) {
            const cfg = agGetNotifCfg();
            if (!(cfg.ahPc || cfg.ahPush)) return;
            const hoy = new Date();
            const mesStr = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');
            const reg = ntfMesReg(mesStr);
            const ahorroPlan = reg ? (Number(reg.ahorro) || 0) : 0;
            let cuerpo = 'Ingresaste ' + ntfFmt(monto) + '. ';
            cuerpo += ahorroPlan > 0 ? 'Tu plan del mes pide apartar ' + ntfFmt(ahorroPlan) + ' de ahorro — ¿ya lo apartaste?' : '¿Sigues con tu ahorro? Revisa tus planes en Inicio → Planes de Ahorro.';
            if (cfg.ahPc) agNotificarLocal('🏦 Aparta tu ahorro', cuerpo, 'ah_' + Date.now(), 'ahorro', '');
            if (cfg.ahPush) agEnviarPush('Maatly: aparta tu ahorro', cuerpo);
        }

        // Evento: meta de un plan de ahorro alcanzada — centro de la campana + push (el PC ya celebra con el modal)
        function ntfAvisoMeta(plan) {
            if (!plan) return;
            const cfg = agGetNotifCfg();
            const clave = 'pl_' + plan.id + '_' + (plan.ciclo || 0);
            const cuerpo = '¡Plan "' + plan.nombre + '" cumplido! ' + ntfFmt(plan.montoActual) + ' alcanzados. Ya puedes usar tu ahorro desde la tarjeta del plan.';
            try { notifRegistrar('🎉 Meta de ahorro cumplida', cuerpo, clave, 'ahorro', plan.id || ''); } catch (e) {}
            try { notifRefrescar(); } catch (e) {}
            if (cfg.ahPush) agEnviarPush('🎉 ' + plan.nombre + ' cumplido', cuerpo);
        }

        // Aviso de ejemplo desde el panel de Notificaciones
        function ntfAvisoPrueba() {
            const cuerpo = 'Ejemplo: has usado 75% de tu presupuesto del mes. Los avisos reales salen de tus datos.';
            agNotificarLocal('📊 Prueba de aviso de dinero', cuerpo, 'nprueba_' + Date.now(), 'presupuesto', '');
            agEnviarPush('Maatly: prueba de aviso de dinero', cuerpo).then(function(ok) { mostrarToast(ok ? 'Prueba enviada — revisa tu móvil 📱' : 'Push móvil sin configurar (revisa los canales de arriba)', ok ? 'success' : 'info'); });
        }

        /* ---------- Validador de conexión por modelo ---------- */`, 1);

/* ---- F) agGetNotifCfg: base extendida (retrocompatible) ---- */
rep(`            const base = { pcVencidas: true, pcAgenda: true, horaAgenda: '08:00', pushVia: 'ninguno', ntfyTopic: '', tgToken: '', tgChat: '', pushVencidas: false, pushAgenda: false, prevPc: false, prevPush: false, antelaciones: [15] };`,
`            const base = { pcVencidas: true, pcAgenda: true, horaAgenda: '08:00', pushVia: 'ninguno', ntfyTopic: '', tgToken: '', tgChat: '', pushVencidas: false, pushAgenda: false, prevPc: false, prevPush: false, antelaciones: [15], pdPc: true, pdPush: false, pdUmbrales: [50, 75, 90], catPc: true, catPush: false, ahPc: true, ahPush: false, ciePc: true, ciePush: false, cieDiaMes: 25 };`, 1);

/* ---- G) agTickNotif: gancho del motor de dinero ---- */
rep(`            if (cambio) localStorage.setItem('maatlyNotifLog', JSON.stringify(log));

            notifRefrescar();`,
`            if (cambio) localStorage.setItem('maatlyNotifLog', JSON.stringify(log));

            try { ntfTickDinero(); } catch (e) {}
            notifRefrescar();`, 1);

/* ---- H) guardarMovManual: aviso de ahorro al registrar ingreso ---- */
rep(`            agregarMovimiento({ fecha: mvFechaVal, desc: desc, monto: monto, tipo: mvTipoSel, cat: mvCatVal, origen: 'manual' });
            renderizarMovimientos();`,
`            agregarMovimiento({ fecha: mvFechaVal, desc: desc, monto: monto, tipo: mvTipoSel, cat: mvCatVal, origen: 'manual' });
            if (mvTipoSel === 'ingreso') { try { ntfAvisoIngreso(monto); } catch (e) {} }
            renderizarMovimientos();`, 1);

/* ---- I) aaChequearCompletado: aviso de meta alcanzada ---- */
rep(`            abrirModalFelicidades(plan);
        }`,
`            abrirModalFelicidades(plan);
            try { ntfAvisoMeta(plan); } catch (e) {}
        }`, 1);

/* ---- J) notifMeta: tipos nuevos del centro de la campana ---- */
rep(`                agenda: { i: '📅', cls: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300', lbl: 'Agenda' },
                info: { i: '💬', cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', lbl: 'Aviso' }`,
`                agenda: { i: '📅', cls: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300', lbl: 'Agenda' },
                presupuesto: { i: '📊', cls: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300', lbl: 'Presupuesto' },
                categoria: { i: '🏷️', cls: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300', lbl: 'Categoría' },
                ahorro: { i: '🏦', cls: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300', lbl: 'Ahorro' },
                cierre: { i: '📦', cls: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300', lbl: 'Cierre' },
                info: { i: '💬', cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', lbl: 'Aviso' }`, 1);

/* ---- K) agDetectarChatId: ids con fallback al panel nuevo ---- */
rep(`            const estado = document.getElementById('agTgDetectEstado');
            const inpToken = document.getElementById('agTgToken');
            const inpChat = document.getElementById('agTgChat');
            const inpVia = document.getElementById('agPushVia');`,
`            const estado = document.getElementById('ntfTgDetectEstado') || document.getElementById('agTgDetectEstado');
            const inpToken = document.getElementById('ntfTgToken') || document.getElementById('agTgToken');
            const inpChat = document.getElementById('ntfTgChat') || document.getElementById('agTgChat');
            const inpVia = document.getElementById('ntfPushVia') || document.getElementById('agPushVia');`, 1);

/* ---- L) agInit: renderizar también el panel de notificaciones ---- */
rep(`            agSetModelos(agGetModelos());
            agRenderPanel();

            const chatSub = document.getElementById('chatEstadoModelo');`,
`            agSetModelos(agGetModelos());
            agRenderPanel();
            ntfRenderPanel();

            const chatSub = document.getElementById('chatEstadoModelo');`, 1);

/* ---- Verificaciones post-edición ---- */
const checks = [
    /* estructura nueva */
    ["abrirCfgSeccion('notif')", 1],
    ['id="cfgSeccionNotif"', 1],
    ['id="cfgBodyNotif"', 1],
    ["notif:      { icono: '🔔'", 1],
    ['function ntfRenderPanel()', 1],
    ['ntfRenderPanel();', 2],
    ['function ntfWirePanel()', 1],
    ['ntfWirePanel();', 1],
    ['function ntfGuardarCfg()', 1],
    ['ntfGuardarCfg()', 6],
    ["addEventListener('change', ntfGuardarCfg)", 1],
    ['function ntfTickDinero', 1],
    ['ntfTickDinero();', 1],
    ['function ntfAvisoIngreso(monto)', 1],
    ['ntfAvisoIngreso(monto);', 1],
    ['function ntfAvisoMeta(plan)', 1],
    ['ntfAvisoMeta(plan);', 1],
    ['function ntfAvisoPrueba()', 1],
    ['ntfAvisoPrueba();', 1],
    ['pdUmbrales', 6],
    ['cieDiaMes', 4],
    /* ids del panel nuevo */
    ['id="ntfVencidas"', 1], ['id="ntfAgenda"', 1], ['id="ntfHora"', 1],
    ['id="ntfPushVencidas"', 1], ['id="ntfPushAgenda"', 1],
    ['id="ntfPrevPC"', 1], ['id="ntfPrevPush"', 1], ['id="ntfPrevChips"', 1],
    ['id="ntfPdPc"', 1], ['id="ntfPdPush"', 1], ['id="ntfPdChips"', 1],
    ['id="ntfCatPc"', 1], ['id="ntfCatPush"', 1],
    ['id="ntfAhPc"', 1], ['id="ntfAhPush"', 1],
    ['id="ntfCiePc"', 1], ['id="ntfCiePush"', 1], ['id="ntfCieDia"', 1],
    ['id="ntfNtfyTopic"', 1], ['id="ntfTgToken"', 1], ['id="ntfTgChat"', 1], ['id="ntfPushVia"', 1],
    ['id="ntfPermisoEstado"', 1], ['id="ntfBtnPermiso"', 1], ['id="ntfBtnPushProbar"', 1],
    ['id="ntfBtnTgGuia"', 1], ['id="ntfBtnTgDetectar"', 1], ['id="ntfTgDetectEstado"', 1],
    ['id="ntfBtnProbarDinero"', 1],
    ['#ntfPrevChips .ntfPrevChip', 2], ['#ntfPdChips .ntfPdChip', 2],
    /* centro de la campana */
    ["presupuesto: { i: '📊'", 1],
    ["categoria: { i: '🏷️'", 1],
    ["ahorro: { i: '🏦'", 1],
    ["cierre: { i: '📦'", 1],
    ['maatlyNotifLog', 4],
    ['maatlyNotifCfg', 2],
    /* limpieza del panel del agente */
    ['Notificaciones de tareas', 0],
    ['Push real al móvil', 0],
    ['agGuardarNotif', 0],
    ['agNtfVencidas', 0], ['agNtfAgenda', 0], ['agNtfHora', 0],
    ['agPermisoEstado', 0], ['agBtnPermiso', 0],
    ['agNtfPrevPC', 0], ['agNtfPrevPush', 0], ['agPrevChips', 0], ['agPrevChip', 0],
    ['agPushVia', 1], ['agNtfyTopic', 0], ['agTgToken', 1], ['agTgChat', 1], ['agTgDetectEstado', 1],
    ['agPushVencidas', 0], ['agPushAgenda', 0],
    ['agBtnTgGuia', 0], ['agBtnTgDetectar', 0], ['agBtnPushProbar', 0],
    /* intactos */
    ['Notification.permission', 2],
    ['agRenderPanel(', 8],
    ['id="cfgBodyAi"', 1],
    ['function agRenderPanel()', 1],
    ['function agWirePanel()', 1],
    ['function agEnviarPush(', 1],
    ['function agDetectarChatId()', 1],
    ['function notifMeta(', 1],
    ['function agTickNotif()', 1],
    ['GS_GAP = 12', 1],
    ['data-w="', 11],
    ['grid-stack-item-content', 15],
    ['paddingLeft: cs.paddingLeft', 1]
];

checks.forEach(pair => {
    const [tok, exp] = pair;
    const g = tc(s, tok);
    if (g !== exp) errores.push('[CHK] "' + tok + '" esperado ' + exp + ', hay ' + g);
});

/* compilar los 2 bloques <script> inline para descartar errores de sintaxis */
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
    console.log('Scripts compilados: ' + numScripts);
    process.exit(1);
}

const esProyecto = path.dirname(P).replace(/\\/g, '/') === DIR;
if (esProyecto && path.basename(P) === 'Maatly_v0.22.html' && fs.existsSync(DIR + '/Maatly_v0.23.html')) {
    console.log('ABORTADO - escenario B en conflicto: existe también Maatly_v0.23.html (' + md5File(DIR + '/Maatly_v0.23.html') + ').');
    console.log('No se escribió nada; revisa qué versión conservas y limpia el sobrante antes de volver a correr.');
    process.exit(1);
}
fs.writeFileSync(P, s, 'utf8');
const hashPost = md5File(P);
console.log('OK - reemplazos aplicados y verificados');
console.log('Scripts inline compilados sin errores: ' + numScripts);
console.log('Tamaño: ' + pre + ' -> ' + Buffer.byteLength(s, 'utf8') + ' bytes');
console.log('Líneas: ' + (s.split('\n').length));
console.log('MD5 post: ' + hashPost + (hashPost === POST_HASH ? '  OK = v0.23 completa' : '  ALERTA: NO coincide con ' + POST_HASH + ' - revisa ANTES de abrir la app'));
if (hashPost !== POST_HASH) process.exitCode = 1;
if (esProyecto && path.basename(P) === 'Maatly_v0.22.html' && !fs.existsSync(DIR + '/Maatly_v0.23.html')) {
    fs.renameSync(P, DIR + '/Maatly_v0.23.html');
    console.log('Renombrado a Maatly_v0.23.html (escenario B) - el .lnk ya apunta a ese nombre. MD5 final: ' + md5File(DIR + '/Maatly_v0.23.html'));
}
if (esProyecto && path.basename(P) === 'Maatly_v0.23.html' && fs.existsSync(DIR + '/Maatly_v0.22.html')) {
    console.log('ALERTA: queda un Maatly_v0.22.html en el proyecto (' + md5File(DIR + '/Maatly_v0.22.html') + ') - posible basura de un revert; borrar solo si no lo necesitas.');
}
