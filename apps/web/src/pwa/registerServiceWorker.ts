/**
 * Quản lý đăng ký Service Worker cho ứng dụng Kinh Dịch (Requirement 2 & 3)
 */

export interface ServiceWorkerConfig {
  readonly onInstalled?: () => void;
  readonly onUpdated?: (registration: ServiceWorkerRegistration) => void;
  readonly onError?: (error: Error) => void;
}

/**
 * Đăng ký Service Worker trong môi trường trình duyệt hỗ trợ
 */
export async function registerServiceWorker(
  config?: ServiceWorkerConfig
): Promise<ServiceWorkerRegistration | null> {
  // Chỉ chạy trong môi trường trình duyệt và hỗ trợ serviceWorker
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // Đã có phiên bản cũ, phiên bản mới đang chờ kích hoạt
            if (config?.onUpdated) {
              config.onUpdated(registration);
            }
          } else {
            // Cài đặt thành công lần đầu, tài nguyên đã sẵn sàng offline
            if (config?.onInstalled) {
              config.onInstalled();
            }
          }
        }
      });
    });

    return registration;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Lỗi khi đăng ký Service Worker:', error);
    if (config?.onError) {
      config.onError(error);
    }
    return null;
  }
}

/**
 * Hủy đăng ký Service Worker (phục vụ bảo trì hoặc reset cache)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.unregister();
    }
    return false;
  } catch (err) {
    console.error('Lỗi khi hủy đăng ký Service Worker:', err);
    return false;
  }
}
