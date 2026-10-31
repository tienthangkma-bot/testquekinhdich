import React, { useState } from 'react';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { PwaInstallGuideModal } from './PwaInstallGuideModal';
import { usePwaInstall } from './usePwaInstall';
import { useNetworkStatus } from './useNetworkStatus';
import './pwa.css';

/**
 * Cụm tiện ích PWA trên Header (Trạng thái mạng + Hướng dẫn cài đặt) (Requirements 5 & 6)
 */
export const PwaHeaderActions: React.FC = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { isInstalled } = usePwaInstall();
  const { isOnline } = useNetworkStatus();

  return (
    <>
      <div className="header-pwa-actions" data-testid="pwa-header-actions">
        {/* Trạng thái mạng Online / Offline */}
        <NetworkStatusIndicator />

        {/* Nút hướng dẫn cài đặt ứng dụng (PWA Install) */}
        {!isInstalled && (
          <button
            type="button"
            className="pwa-install-trigger-btn"
            onClick={() => setIsGuideOpen(true)}
            title="Cài đặt ứng dụng lên màn hình chính để dùng nhanh và offline"
            data-testid="pwa-install-guide-btn"
          >
            <span>📲</span>
            <span>Cài đặt ứng dụng</span>
          </button>
        )}
      </div>

      {/* Banner thông báo khi đang chạy ngoại tuyến */}
      {!isOnline && (
        <div className="offline-banner" data-testid="offline-global-banner">
          <div className="offline-banner__content">
            <span style={{ fontSize: '1.2rem' }}>📶</span>
            <span>
              <strong>Chế độ Ngoại tuyến (Offline):</strong> Thiết bị đang không có mạng. Toàn bộ
              chức năng lập quẻ, tra cứu, xem lịch sử và ghi chú hoạt động bình thường trên máy.
            </span>
          </div>
        </div>
      )}

      {/* Modal Hướng dẫn cài đặt */}
      <PwaInstallGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
