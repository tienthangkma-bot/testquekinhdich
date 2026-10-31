import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PwaInstallState {
  /** Có thể kích hoạt hộp thoại cài đặt tự động hay không (đối với Chromium/Edge/Android) */
  readonly canInstall: boolean;

  /** Ứng dụng đã được cài đặt và đang chạy ở chế độ Standalone hay chưa */
  readonly isInstalled: boolean;

  /** Kích hoạt hộp thoại cài đặt của trình duyệt */
  readonly installApp: () => Promise<boolean>;
}

/**
 * Hook quản lý tiến trình cài đặt PWA lên màn hình chính (Requirement 6)
 */
export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)').matches
        : false;
    const isIosStandalone =
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    return isStandaloneDisplay || isIosStandalone;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lắng nghe sự kiện beforeinstallprompt (Chrome / Android / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Lắng nghe khi cài đặt thành công
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Lỗi khi kích hoạt cài đặt PWA:', err);
      return false;
    }
  }, [deferredPrompt]);

  return {
    canInstall: deferredPrompt !== null,
    isInstalled,
    installApp,
  };
}
