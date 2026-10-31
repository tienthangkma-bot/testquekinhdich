import React, { useState } from 'react';
import { Button, Modal } from '@kindich/shared';
import { usePwaInstall } from './usePwaInstall';
import './pwa.css';

export interface PwaInstallGuideModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

type PlatformTab = 'android' | 'ios' | 'desktop';

/**
 * Modal Hướng dẫn cài đặt ứng dụng PWA lên màn hình chính (Requirement 6)
 */
export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { canInstall, isInstalled, installApp } = usePwaInstall();
  const [activeTab, setActiveTab] = useState<PlatformTab>(() => {
    if (typeof window === 'undefined') return 'android';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      return 'ios';
    }
    if (ua.includes('android')) {
      return 'android';
    }
    return 'desktop';
  });

  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);

  const handleTriggerInstall = async () => {
    const success = await installApp();
    if (success) {
      setInstallSuccessMessage('✓ Đã cài đặt ứng dụng thành công lên màn hình chính!');
      setTimeout(() => {
        onClose();
        setInstallSuccessMessage(null);
      }, 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📲 Cài Đặt Ứng Dụng Lên Màn Hình Chính"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {canInstall && !isInstalled && (
            <Button
              variant="gold"
              size="md"
              onClick={handleTriggerInstall}
              data-testid="pwa-prompt-install-btn"
            >
              Cài đặt ngay ➔
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="pwa-guide-container" data-testid="pwa-install-guide">
        {/* Lợi ích khi cài đặt */}
        <div className="pwa-benefits-box">
          <div className="pwa-benefit-item">
            <span className="pwa-benefit-item__icon">⚡</span>
            <span>Khởi chạy tức thì từ màn hình chính như ứng dụng bản địa</span>
          </div>
          <div className="pwa-benefit-item">
            <span className="pwa-benefit-item__icon">📶</span>
            <span>Mở và sử dụng 100% mượt mà ngay cả khi không có mạng</span>
          </div>
          <div className="pwa-benefit-item">
            <span className="pwa-benefit-item__icon">📱</span>
            <span>Giao diện toàn màn hình, không vướng thanh địa chỉ web</span>
          </div>
        </div>

        {isInstalled ? (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            ✓ Ứng dụng đã được cài đặt và đang chạy ở chế độ Standalone trên thiết bị của bạn.
          </div>
        ) : (
          <>
            {/* Thanh chuyển đổi Hệ điều hành */}
            <div className="pwa-platform-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'android'}
                className={`pwa-platform-tab-btn ${
                  activeTab === 'android' ? 'pwa-platform-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('android')}
                data-testid="pwa-tab-android"
              >
                <span>🤖</span>
                <span>Android / Chrome</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'ios'}
                className={`pwa-platform-tab-btn ${
                  activeTab === 'ios' ? 'pwa-platform-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('ios')}
                data-testid="pwa-tab-ios"
              >
                <span>🍏</span>
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'desktop'}
                className={`pwa-platform-tab-btn ${
                  activeTab === 'desktop' ? 'pwa-platform-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab('desktop')}
                data-testid="pwa-tab-desktop"
              >
                <span>💻</span>
                <span>Máy Tính (PC/Mac)</span>
              </button>
            </div>

            {/* Chi tiết từng nền tảng */}
            {activeTab === 'android' ? (
              <ul className="pwa-steps-list">
                <li className="pwa-step-card">
                  <span className="pwa-step-number">1</span>
                  <div className="pwa-step-text">
                    Nếu xuất hiện nút <strong>"Cài đặt ngay"</strong> ở góc dưới, hãy bấm để cài
                    đặt tự động.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">2</span>
                  <div className="pwa-step-text">
                    Hoặc bấm vào <strong>biểu tượng menu 3 chấm (⋮)</strong> ở góc trên bên phải
                    trình duyệt Chrome.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">3</span>
                  <div className="pwa-step-text">
                    Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc{' '}
                    <strong>"Thêm vào màn hình chính" (Add to Home screen)</strong>.
                  </div>
                </li>
              </ul>
            ) : activeTab === 'ios' ? (
              <ul className="pwa-steps-list">
                <li className="pwa-step-card">
                  <span className="pwa-step-number">1</span>
                  <div className="pwa-step-text">
                    Mở ứng dụng bằng trình duyệt <strong>Safari</strong> trên iPhone hoặc iPad.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">2</span>
                  <div className="pwa-step-text">
                    Bấm vào <strong>biểu tượng Chia sẻ</strong> (hình vuông có mũi tên chỉ lên{' '}
                    <strong>⎋</strong>) ở thanh công cụ dưới cùng.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">3</span>
                  <div className="pwa-step-text">
                    Cuộn xuống danh sách tác vụ và chọn{' '}
                    <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">4</span>
                  <div className="pwa-step-text">
                    Nhấn nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải để hoàn tất.
                  </div>
                </li>
              </ul>
            ) : (
              <ul className="pwa-steps-list">
                <li className="pwa-step-card">
                  <span className="pwa-step-number">1</span>
                  <div className="pwa-step-text">
                    Trên trình duyệt Chrome hoặc Microsoft Edge, nhìn vào phía bên phải thanh địa
                    chỉ URL.
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">2</span>
                  <div className="pwa-step-text">
                    Nhấp vào <strong>biểu tượng Cài đặt ứng dụng</strong> (hình máy tính nhỏ có mũi
                    tên xuống ⬇).
                  </div>
                </li>
                <li className="pwa-step-card">
                  <span className="pwa-step-number">3</span>
                  <div className="pwa-step-text">
                    Chọn <strong>"Cài đặt"</strong>. Ứng dụng sẽ được tạo lối tắt riêng trên Desktop
                    và Menu Start.
                  </div>
                </li>
              </ul>
            )}

            {installSuccessMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {installSuccessMessage}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
