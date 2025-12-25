/**
 * Service Worker для PWA "Вечный Свет"
 * Обеспечивает оффлайн-доступ к приложению
 */

const CACHE_NAME = 'eternal-light-v1';
const ASSETS_TO_CACHE = [
    './',
    './controller.html',
    './display.html',
    './manifest.json',
    './js/common.js',
    './js/data/bible_rst.js',
    './js/data/nrt_data.js',
    './js/data/ktb_data.js'
];

// Установка: кешируем все ресурсы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кеширование ресурсов...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Активировать сразу
    );
});

// Активация: удаляем старые кеши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Удаление старого кеша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Взять контроль сразу
    );
});

// Стратегия: сначала кеш, потом сеть (Cache First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    // Кешируем новые запросы (например, шрифты Google)
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Если оффлайн и файла нет в кеше — ничего не делаем
                console.log('[SW] Оффлайн, ресурс не найден:', event.request.url);
            })
    );
});
