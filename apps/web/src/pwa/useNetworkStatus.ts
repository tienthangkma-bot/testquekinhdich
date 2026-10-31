import { useState, useEffect } from 'react';

export interface NetworkStatus {
  /** Thiết bị hiện đang có kết nối mạng hay không */
  readonly isOnline: boolean;

  /** Đã từng bị mất kết nối mạng trong phiên hiện tại hay không */
  readonly wasOffline: boolean;
}

/**
 * Hook theo dõi trạng thái kết nối mạng Online/Offline (Requirement 5)
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
