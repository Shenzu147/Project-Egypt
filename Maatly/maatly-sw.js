/* Maatly — service worker (v0.55)
   SOLO notificaciones: install/activate mínimos + notificationclick (cierra la notificación,
   enfoca un cliente abierto y le pasa {maatlyNotifClick: vista}; si no hay ninguno, abre './').
   Sin caché/offline por decisión de esta ronda: la app ya funciona sin red como archivo local. */
self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

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
