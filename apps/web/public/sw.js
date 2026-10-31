/**
 * Service Worker cho ứng dụng Kinh Dịch - Bắc Hà Tân An Phái
 * Đảm bảo ứng dụng chạy 100% offline-first và bảo mật (Requirement 2, 3, 7)
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `kindich-pwa-${CACHE_VERSION}`;

/**
 * Danh sách tài nguyên tĩnh tối thiểu cấu thành App Shell
 */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg',
];

/**
 * 1. Sự kiện INSTALL: Tải trước App Shell và kích hoạt ngay
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * 2. Sự kiện ACTIVATE: Dọn dẹp cache phiên bản cũ và chiếm quyền điều khiển client
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('kindich-pwa-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * 3. Sự kiện FETCH: Chiến lược Cache kết hợp bảo mật (Requirement 7)
 * - Navigation (HTML): Network-First, fallback về App Shell trong Cache khi Offline.
 * - Static Assets (JS, CSS, SVGs, Fonts): Stale-While-Revalidate hoặc Cache-First.
 * - TUYỆT ĐỐI KHÔNG CACHE dữ liệu cá nhân (chỉ cache tài nguyên công khai).
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Chỉ xử lý phương thức GET
  if (request.method !== 'GET') {
    return;
  }

  // Bỏ qua các schema không phải http/https (như chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Bỏ qua các request đến domain khác (external API/services nếu có)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Chiến lược cho Navigation Request (Người dùng mở trang HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Khi ngoại tuyến: Phục vụ App Shell đã lưu trong cache
          const cachedAppShell =
            (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedAppShell) {
            return cachedAppShell;
          }
          return new Response(
            '<!DOCTYPE html><html><body><h1>Ngoại Tuyến</h1><p>Vui lòng kết nối Internet lần đầu để tải ứng dụng.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Chiến lược cho Tài nguyên tĩnh (JS, CSS, Icons, Fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Cập nhật ngầm từ mạng (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
          })
          .catch(() => {
            /* Giữ nguyên cachedResponse khi offline */
          });
        return cachedResponse;
      }

      // Chưa có trong cache: Fetch từ mạng và cache lại
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          // Trả về response rỗng hoặc phù hợp nếu cả 2 đều không có
          return new Response('', { status: 408, statusText: 'Request Timed Out (Offline)' });
        });
    })
  );
});

/**
 * 4. Xử lý thông điệp từ giao diện (vd: bỏ qua chờ để nâng cấp bản mới)
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
