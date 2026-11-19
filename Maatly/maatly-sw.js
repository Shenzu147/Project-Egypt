/* Maatly — service worker (v0.60)
   1) NOTIFICACIONES (intacto desde v0.55/v0.57): install/activate mínimos + notificationclick
      (cierra la notificación, enfoca un cliente abierto y le pasa {maatlyNotifClick: vista};
      si no hay ninguno, abre './'). El fetch passthrough de v0.57 era lo que hacía que Chrome/Edge
      ofrecieran instalación REAL (WebAPK en Android / «Instalar aplicación» en escritorio).
   2) OFFLINE (v0.59.1, para el TWA): precachea el shell + los CDN fijados del <head>.
      - Navegación: NETWORK-FIRST (siempre trae el HTML fresco cuando hay red; el cache es el
        salvavidas offline y se refresca solo en cada visita online).
      - CDN: CACHE-FIRST (las librerías van pinneadas por versión con SRI — inmutables; el bytes
        cacheado conserva la integridad).
      - Todo lo demás (Supabase, APIs) pasa DIRECTO a la red, sin tocar.
   ⚠️ Al publicar un build nuevo: subir la versión del CACHE (maatly-shell-vX) — el activate
   borra los caches viejos. Las libs pinneadas no necesitan re-bump. */
var CACHE = 'maatly-shell-v0.61';

/* Shell relativo al SCOPE del SW (funciona en Netlify raíz y en Pages /Maatly/). */
var PRECACHE = [
    './Maatly.html',
    './manifest.webmanifest',
    './icono-512.png',
    /* CDN fijados del <head> (versión + SRI; NUNCA cambiar aquí sin cambiar el HTML) */
    'https://cdn.jsdelivr.net/npm/gridstack@12.4.1/dist/gridstack.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7',
    'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
    'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',
    'https://cdn.jsdelivr.net/npm/gridstack@12.4.1/dist/gridstack-all.js',
    'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            /* add uno por uno: una caída de CDN no rompe el install (la app sigue online) */
            return Promise.all(PRECACHE.map(function (u) {
                return c.add(u).catch(function () {});
            }));
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (ks) {
            return Promise.all(ks.map(function (k) {
                return (k !== CACHE) ? caches.delete(k) : Promise.resolve(false);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url;
    try { url = new URL(req.url); } catch (err) { return; }
    var esNavegacion = (req.mode === 'navigate');
    var esCdn = /(^|\.)(jsdelivr\.net|cdnjs\.cloudflare\.com)$/.test(url.hostname);
    if (!esNavegacion && !esCdn) return;   /* Supabase/APIs/pings: pasan directo a la red */

    if (esNavegacion) {
        /* NETWORK-FIRST: HTML fresco online; cache (de la última visita o el precache) offline */
        e.respondWith(fetch(req).then(function (r) {
            try { caches.open(CACHE).then(function (c) { c.put(req, r.clone()); }).catch(function () {}); } catch (x) {}
            return r;
        }).catch(function () {
            return caches.open(CACHE).then(function (c) {
                return c.match(req).then(function (hit) {
                    if (hit) return hit;
                    return c.match('./Maatly.html').then(function (h2) {
                        return h2 || c.match('./').then(function (h3) { return h3 || Response.error(); });
                    });
                });
            });
        }));
        return;
    }

    /* CDN: CACHE-FIRST con relleno (bytes pinneados con SRI = inmutables) */
    e.respondWith(caches.open(CACHE).then(function (c) {
        return c.match(req, { ignoreSearch: true }).then(function (hit) {
            if (hit) return hit;
            return fetch(req).then(function (r) {
                if (r && r.ok) { try { c.put(req, r.clone()); } catch (x) {} }
                return r;
            });
        });
    }).catch(function () { return fetch(req); }));
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
