'use strict';
/* v0.25 — HTML nuevo (modales Detalle/Adjunto + campo adjunto) y builders de notificaciones */

/* MODALES: se insertan ANTES de la línea `<!-- v0.12: Modal Aportar a un Plan` */
const NEWMODALS = [
"    <!-- v0.25: Modal Detalle del mes (Historial) -->",
"    <div id=\"modalDetalleMes\" class=\"fixed inset-0 bg-slate-900/50 z-[130] hidden flex items-center justify-center backdrop-blur-sm transition-opacity opacity-0 p-4\">",
"        <div class=\"bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 transition-transform border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto\">",
"            <div class=\"flex items-center justify-between gap-2 mb-1\">",
"                <h3 class=\"text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 min-w-0\"><svg class=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z\"></path></svg><span id=\"dmTitulo\" class=\"min-w-0 truncate\">Detalle del mes</span></h3>",
"                <button onclick=\"aaDlgCerrar('modalDetalleMes')\" class=\"text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex-shrink-0\"><svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg></button>",
"            </div>",
"            <p id=\"dmMeta\" class=\"text-[11px] text-slate-400 font-semibold mb-3\"></p>",
"            <div id=\"dmKpi\" class=\"grid grid-cols-3 gap-2 mb-4\"></div>",
"            <div id=\"dmCuerpo\" class=\"space-y-2\"></div>",
"            <div class=\"flex justify-end gap-3 mt-5\">",
"                <button id=\"btnDmBorrarMes\" onclick=\"borrarMesDesdeDetalle()\" class=\"hidden px-4 py-2 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/60 c-alarma hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-semibold transition-colors\">Eliminar mes</button>",
"                <button onclick=\"aaDlgCerrar('modalDetalleMes')\" class=\"px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors\">Cerrar</button>",
"            </div>",
"        </div>",
"    </div>",
"",
"    <!-- v0.25: Modal visor de Adjuntos -->",
"    <div id=\"modalAdjPreview\" class=\"fixed inset-0 bg-slate-900/50 z-[140] hidden flex items-center justify-center backdrop-blur-sm transition-opacity opacity-0 p-4\">",
"        <div class=\"bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl transform scale-95 transition-transform border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col\">",
"            <div class=\"flex items-center justify-between gap-2 p-5 pb-3 flex-shrink-0\">",
"                <h3 class=\"text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 min-w-0\"><svg class=\"w-5 h-5 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48\"></path></svg><span id=\"apTitulo\" class=\"min-w-0 truncate\">Adjuntos</span></h3>",
"                <button onclick=\"cerrarAdjPreview()\" class=\"text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 flex-shrink-0\"><svg class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18L18 6M6 6l12 12\"></path></svg></button>",
"            </div>",
"            <div id=\"apCuerpo\" class=\"px-5 pb-5 overflow-y-auto flex-1\"></div>",
"        </div>",
"    </div>",
""
];

/* CAMPO ADJUNTO: se inserta antes de la línea `            </div>` que cierra la sección Categoría del modal de movimiento */
const NEWFIELD = [
"                <div>",
"                    <label class=\"block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1\">Adjuntar foto o PDF</label>",
"                    <div id=\"mvAdjChips\" class=\"flex flex-wrap gap-2\"></div>",
"                    <button type=\"button\" id=\"btnMvAdjAdd\" class=\"mt-1.5 w-full px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors\">Agregar adjuntos</button>",
"                    <input type=\"file\" id=\"mvAdjInput\" accept=\"image/*,.pdf\" multiple class=\"hidden\">",
"                    <p class=\"text-[10px] text-slate-400 mt-1\">Hasta 1.5 MB por archivo; las fotos grandes se comprimen. Quedan guardados con el movimiento.</p>",
"                </div>"
];

/* NTF: ntfTickDinero reescrito (solo cierre de mes) */
const B50 = function() {
	return [
"        function ntfTickDinero() {",
"            const cfg = agGetNotifCfg();",
"            if (!(cfg.ciePc || cfg.ciePush)) return;",
"            let log = {};",
"            try { log = JSON.parse(localStorage.getItem('maatlyNotifLog') || '{}'); } catch (e) { log = {}; }",
"            const hoy = new Date();",
"            const mesStr = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');",
"            const hoyStr = hoy.toISOString().slice(0, 10);",
"            let cambio = false;",
"",
"            /* v0.25: único aviso de dinero cíclico = cierre de mes (el cierre automático archiva los movimientos) */",
"            const limite = parseInt(cfg.cieDiaMes, 10) || 25;",
"            const yaCerrado = getArchivoMensual().some(a => a.mes === mesStr);",
"            const clave = '_ci_' + hoyStr;",
"            if (hoy.getDate() >= limite && !yaCerrado && log[clave] !== '1') {",
"                log[clave] = '1'; cambio = true;",
"                const total = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();",
"                const restan = total - hoy.getDate() + 1;",
"                const cuerpo = 'Quedan ' + restan + ' día(s) para terminar ' + mesNombreLargo(mesStr) + '. Al pasar el mes, Maatly archiva tus movimientos y suma el sobrante a tu ahorro del historial.';",
"                if (cfg.ciePc) agNotificarLocal('📦 Cierre de mes cerca', cuerpo, clave, 'cierre', '');",
"                if (cfg.ciePush) agEnviarPush('Maatly: cierre de mes cerca', cuerpo);",
"            }",
"",
"            if (cambio) { try { localStorage.setItem('maatlyNotifLog', JSON.stringify(log)); } catch (e) {} }",
"        }"
	];
};

/* NTF: ntfAvisoIngreso simplificado (sin plan del mes) */
const B51 = function() {
	return [
"        function ntfAvisoIngreso(monto) {",
"            const cfg = agGetNotifCfg();",
"            if (!(cfg.ahPc || cfg.ahPush)) return;",
"            const cuerpo = 'Ingresaste ' + ntfFmt(monto) + '. ¿Ya apartaste tu ahorro? Revisa tus planes en Inicio → Planes de Ahorro.';",
"            if (cfg.ahPc) agNotificarLocal('🏦 Aparta tu ahorro', cuerpo, 'ah_' + Date.now(), 'ahorro', '');",
"            if (cfg.ahPush) agEnviarPush('Maatly: aparta tu ahorro', cuerpo);",
"        }"
	];
};

/* NTF: aviso de prueba (ahorro) */
const B52 = function() {
	return [
"            const cuerpo = 'Ejemplo: apartaste ' + ntfFmt(80) + ' de tu ahorro este mes. Los avisos reales salen de tus datos (al registrar un ingreso).';",
"            agNotificarLocal('🏦 Prueba de aviso de dinero', cuerpo, 'nprueba_' + Date.now(), 'ahorro', '');",
"            agEnviarPush('Maatly: prueba de aviso de dinero', cuerpo).then(function(ok) { mostrarToast(ok ? 'Prueba enviada — revisa tu móvil 📱' : 'Push móvil sin configurar (revisa los canales de arriba)', ok ? 'success' : 'info'); });"
	];
};

module.exports = { NEWMODALS: NEWMODALS, NEWFIELD: NEWFIELD, B50: B50, B51: B51, B52: B52 };
