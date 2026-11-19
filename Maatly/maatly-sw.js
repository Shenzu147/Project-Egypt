/* Maatly — service worker (v0.67)
   1) NOTIFICACIONES (intacto desde v0.55/v0.57): install/activate mínimos + notificationclick
      (cierra la notificación, enfoca un cliente abierto y le pasa {maatlyNotifClick: vista};
      si no hay ninguno, abre './'). El fetch passthrough de v0.57 era lo que hacía que Chrome/Edge
      ofrecieran instalación REAL (WebAPK en Android / «Instalar aplicación» en escritorio).
   2) OFFLINE para la PWA y el TWA (v0.59.1, corregido en v0.62):
      - Shell: se precachea UNA vez y se guarda bajo los alias de navegación
        ('./Maatly.html', './maatly', './'). OJO: Netlify responde 301 de /Maatly.html a /maatly
        y la Cache API RECHAZA respuestas redirigidas → por eso v0.62 reconstruye la Response
        desde el texto. Sin esto el shell nunca entraba al caché y el TWA daba ERR_FAILED offline.
      - Navegación: NETWORK-FIRST con tope de 6 s (con red siempre ves el build fresco; el caché
        es el salvavidas offline y se refresca solo en cada visita online).
      - CDN: CACHE-FIRST. jsdelivr/fuentes van con CORS; cdn.tailwindcss.com NO manda CORS, así que
        se guarda como respuesta «opaque» (modo no-cors). Las libs van pinneadas por versión con SRI.
      - Todo lo demás (Supabase, APIs) pasa DIRECTO a la red, sin tocar.
    OJO al publicar: subir CACHE (maatly-shell-vX) — el activate borra los viejos SOLO si el nuevo
    tiene shell (si el precache falló, los viejos se conservan y la app sigue abriendo offline).
    v0.62.1: CACHE sube a maatly-shell-v0.62.1 a propósito — el HTML cambió (se oculta el sello de
    Netlify) y así los aparatos que ya tenían v0.62 re-precahean el shell en cuanto abren online.
    v0.64: mismo motivo (deudas i18n: fechas, XLSX bilingüe, coach en el idioma de la app).
    v0.65: mismo motivo (el ⓘ de las 12 tarjetas del panel pasa a la línea del título y gana área táctil).
    v0.66: arranque en blanco (sin demo), tema Claro por defecto y sincronizado, manifest + SW en el
           <head> (instalación como WebAPK, no atajo) e icono de 192.
    v0.67: el tablero se mueve con el dedo (pill «Mover a…», aviso de Cierre, Deshacer) y el arrastre
           entre columnas queda como atajo apagado por defecto en el móvil. */
var CACHE = 'maatly-shell-v0.67';

/* Alias con los que puede llegar la navegación: TWA start_url '/maatly', Pages '/Maatly.html',
   raíz del sitio. Se precachean TODOS con el mismo HTML. */
var SHELL_ALIAS = ['./Maatly.html', './maatly', './'];

/* Recursos propios que se guardan tal cual (mismo origen). */
var PROPIOS = ['./manifest.webmanifest', './icono-512.png'];

/* CDN fijados del <head> (versión + SRI; NUNCA cambiar aquí sin cambiar el HTML)
   + la hoja de Google Fonts (los .woff2 se cachean solos en la primera visita online). */
var CDN = [
    'https://cdn.jsdelivr.net/npm/gridstack@12.4.1/dist/gridstack.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
    'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',
    'https://cdn.jsdelivr.net/npm/gridstack@12.4.1/dist/gridstack-all.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@500;600;700;800&display=swap'
];

/* Tailwind se sirve como script sin CORS: hay que guardarlo en modo no-cors (respuesta opaca). */
var CDN_OPACO = ['https://cdn.tailwindcss.com/3.4.17'];

var RS = /(^|\.)(jsdelivr\.net|cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

function urlDe(rel) {
    try { return new URL(rel, self.registration.scope).href; } catch (e) { return rel; }
}

/* Guarda una URL tal cual. Si la respuesta vino REDIRIGIDA (Netlify 301), la Cache API la
   rechaza: se reconstruye desde el cuerpo con las cabeceras mínimas y se guarda igual. */
function guardarUrl(c, url, modo) {
    var init = {};
    if (modo) init.mode = modo;
    return fetch(new Request(url, init)).then(function (r) {
        if (!r) return false;
        if (r.type === 'opaque') {
            /* opaca: no se puede leer, pero sí almacenar si el request fue no-cors */
            return c.put(new Request(url, { mode: 'no-cors' }), r).then(function () { return true; }, function () { return false; });
        }
        if (!r.ok) return false;
        var cuerpo = r.redirected ? r.blob().then(function (b) {
            var cab = {};
            var ct = r.headers.get('content-type');
            if (ct) cab['Content-Type'] = ct;
            return new Response(b, { status: r.status, statusText: r.statusText, headers: cab });
        }) : Promise.resolve(r);
        return cuerpo.then(function (resp) {
            return c.put(url, resp).then(function () { return true; }, function () { return false; });
        });
    }).catch(function () { return false; });
}

/* Shell: se trae una vez y se guarda bajo todos los alias de navegación. */
function precacheShell(c) {
    return fetch(new Request(urlDe('./Maatly.html'), { cache: 'no-store' })).then(function (r) {
        if (!r || !r.ok) throw new Error('shell ' + (r && r.status));
        return r.text();
    }).then(function (html) {
        var cab = { 'Content-Type': 'text/html; charset=utf-8' };
        return Promise.all(SHELL_ALIAS.map(function (rel) {
            return c.put(urlDe(rel), new Response(html, { status: 200, statusText: 'OK', headers: cab }))
                .then(function () { return true; }, function () { return false; });
        }));
    }).catch(function () { return false; });
}

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return Promise.all([
                precacheShell(c),
                Promise.all(PROPIOS.map(function (u) { return guardarUrl(c, urlDe(u)); })),
                Promise.all(CDN.map(function (u) { return guardarUrl(c, u); })),
                Promise.all(CDN_OPACO.map(function (u) { return guardarUrl(c, u, 'no-cors'); }))
            ]);
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return c.match(urlDe('./Maatly.html'), { ignoreSearch: true });
        }).then(function (shell) {
            if (!shell) return false;   /* precache falló: NO borrar los caches viejos */
            return caches.keys().then(function (ks) {
                return Promise.all(ks.map(function (k) {
                    return (k !== CACHE && /^maatly-shell-/.test(k)) ? caches.delete(k) : Promise.resolve(false);
                }));
            });
        }).then(function () { return self.clients.claim(); })
    );
});

/* ¿La ruta pedida es el shell de la app? (para no servir la app al abrir el portal offline) */
function esShellRuta(url) {
    var p = url.pathname;
    return /\/$/.test(p) || /\/maatly$/i.test(p) || /\/maatly\.html$/i.test(p) || /\/index\.html$/i.test(p);
}

function desdeCache(req, conAlias) {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit || !conAlias) return hit || null;
        var i = 0;
        function siguiente() {
            if (i >= SHELL_ALIAS.length) return Promise.resolve(null);
            return caches.match(urlDe(SHELL_ALIAS[i++]), { ignoreSearch: true }).then(function (h) {
                return h || siguiente();
            });
        }
        return siguiente();
    }).catch(function () { return null; });
}

function navegar(req) {
    var url;
    try { url = new URL(req.url); } catch (e) { return desdeCache(req, false).then(function (h) { return h || fetch(req); }); }
    var alias = esShellRuta(url);
    /* NETWORK-FIRST: HTML fresco online; caché (última visita o precache) offline.
       Tope de 6 s para que una red que «existe» pero no responde no deje la app en blanco. */
    var tope = new Promise(function (_, rechaza) {
        setTimeout(function () { rechaza(new Error('tope')); }, 6000);
    });
    return Promise.race([fetch(req), tope]).then(function (r) {
        if (r && r.ok && r.redirected) {
            /* no se puede cachear redirigida; el alias del precache ya tiene el HTML */
            return r;
        }
        if (r && r.ok) {
            var copia = r.clone();
            caches.open(CACHE).then(function (c) {
                return c.put(req, copia);
            }).catch(function () {});
        }
        return r;
    }).catch(function () {
        return desdeCache(req, alias).then(function (h) {
            return h || Response.error();
        });
    });
}

function cdn(req) {
    return caches.open(CACHE).then(function (c) {
        return c.match(req, { ignoreSearch: true }).then(function (hit) {
            if (hit) return hit;
            return fetch(req).then(function (r) {
                if (r && (r.ok || r.type === 'opaque')) {
                    try {
                        if (r.type === 'opaque') {
                            c.put(new Request(req.url, { mode: 'no-cors' }), r.clone()).catch(function () {});
                        } else {
                            c.put(req, r.clone()).catch(function () {});
                        }
                    } catch (x) {}
                }
                return r;
            });
        });
    }).catch(function () { return fetch(req); });
}

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url;
    try { url = new URL(req.url); } catch (err) { return; }
    if (req.mode === 'navigate') { e.respondWith(navegar(req)); return; }
    if (RS.test(url.hostname)) { e.respondWith(cdn(req)); }
    /* Supabase/APIs/pings: pasan directo a la red */
});

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    var vista = (e.notification.data && e.notification.data.vista) || 'vistaInicio';
    e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
        for (var i = 0; i < lista.length; i++) {
            try { lista[i].postMessage({ maatlyNotifClick: vista }); } catch (err) {}
            return lista[i].focus();
        }
        return self.clients.openWindow('./');
    }));
});
