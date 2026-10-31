import React, { useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { Modal, Button } from '@kindich/shared';
import './pwa.css';

export interface NetworkStatusIndicatorProps {
  /** Cho phép người dùng bấm vào pill để xem giải thích chi tiết */
  readonly clickable?: boolean;
}

/**
 * Hiển thị trạng thái Online/Offline theo thời gian thực (Requirement 5)
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  clickable = true,
}) => {
  const { isOnline } = useNetworkStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`network-status-pill ${
          isOnline ? 'network-status-pill--online' : 'network-status-pill--offline'
        }`}
        onClick={() => clickable && setIsModalOpen(true)}
        title={
          isOnline
            ? 'Đang trực tuyến. Bấm để xem thông tin chế độ offline.'
            : 'Đang ngoại tuyến (Offline). Toàn bộ chức năng lập quẻ và ghi chú vẫn hoạt động bình thường.'
        }
        role="status"
        aria-label={isOnline ? 'Trạng thái: Trực tuyến (Online)' : 'Trạng thái: Ngoại tuyến (Offline)'}
        data-testid="network-status-indicator"
      >
        <span className="network-status-pill__dot" />
        <span>{isOnline ? 'Trực tuyến' : 'Ngoại tuyến (Offline)'}</span>
      </div>

      {/* Modal giải thích khả năng chạy Offline */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isOnline ? '🌐 Trạng Thái Kết Nối: Trực Tuyến' : '📶 Trạng Thái Kết Nối: Ngoại Tuyến'}
        size="md"
        footer={
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Đã hiểu
          </Button>
        }
      >
        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--bha-text-primary)' }}>
          {isOnline ? (
            <p>
              Thiết bị của bạn đang kết nối Internet. Ứng dụng đã được nạp sẵn vào bộ nhớ đệm
              (Service Worker) và cơ sở dữ liệu IndexedDB trên thiết bị. Bạn có thể sử dụng ứng dụng
              ngay cả khi mất kết nối mạng.
            </p>
          ) : (
            <>
              <p style={{ fontWeight: 600, color: '#E65100' }}>
                Thiết bị hiện đang mất kết nối Internet hoặc đang ở chế độ máy bay.
              </p>
              <p>
                Nhờ kiến trúc <strong>Offline-First</strong> độc lập:
              </p>
              <ul style={{ margin: '8px 0 12px 20px', padding: 0 }}>
                <li>Lập quẻ Seri tiền và Mai Hoa Dịch Số 100% không cần mạng.</li>
                <li>Phân tích Lục Hào, Bát Cung, Thoán từ, Hào từ chạy hoàn toàn cục bộ.</li>
                <li>Lịch sử và ghi chú cá nhân được lưu trữ an toàn trong IndexedDB trên máy.</li>
                <li>Sao lưu và khôi phục file JSON hoạt động bình thường.</li>
              </ul>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
