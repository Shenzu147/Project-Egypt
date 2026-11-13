/* Maatly — service worker (v0.57)
   SOLO notificaciones: install/activate mínimos + notificationclick (cierra la notificación,
   enfoca un cliente abierto y le pasa {maatlyNotifClick: vista}; si no hay ninguno, abre './').
   Sin caché/offline por decisión del 11/nov: la app ya funciona sin red como archivo local.
   v0.57 · fetch passthrough (NO guarda NADA — los requests pasan a red tal cual): su única
   función es que el SW cuente como «manejador» para que Chrome/Edge ofrezcan instalación
   REAL como app (WebAPK en Android / botón «Instalar aplicación» en escritorio). */
self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function () {});

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
