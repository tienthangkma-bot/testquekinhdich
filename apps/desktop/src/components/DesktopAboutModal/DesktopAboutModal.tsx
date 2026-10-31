import React from 'react';
import { Modal, Button } from '@kindich/shared';

export interface DesktopAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAboutModal: React.FC<DesktopAboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ℹ️ Về Ứng Dụng Kinh Dịch Desktop"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--bha-border-subtle)', paddingBottom: '14px' }}>
          <span style={{ fontSize: '40px', color: 'var(--bha-crimson-700)' }}>☯</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--bha-crimson-800)' }}>
              Kinh Dịch - Bắc Hà Tân An Phái
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--bha-text-secondary)', marginTop: '2px' }}>
              Phiên bản Desktop Windows • Tauri 2 Native • Cục bộ 100%
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--bha-crimson-800)' }}>
            Thông số kỹ thuật:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--bha-text-secondary)' }}>
            <li>Nền tảng: <strong>Tauri 2 (Rust Shell + Microsoft Edge WebView2)</strong></li>
            <li>Cơ sở dữ liệu: <strong>SQLite Cục Bộ (%APPDATA%\com.kindich.desktop\kindich_desktop.db)</strong></li>
            <li>Database Schema: <strong>Version 2 (Tự động Migration & Versioning)</strong></li>
            <li>Thuật toán Seri tiền: <strong>SERIAL-MOD8-V1 (Phép Bốc Phệ Chính Tông)</strong></li>
            <li>Thuật toán Mai Hoa: <strong>MAI-HUA-V1 (Giờ Động Tâm Thiệu Khang Tiết)</strong></li>
            <li>Quy tắc Chiêm đoán: <strong>Chu Hi (Dịch Học Khải Mông)</strong></li>
          </ul>
        </div>

        <div style={{ background: 'var(--bha-bg-subtle, #faf7f0)', padding: '12px', borderRadius: '6px', border: '1px solid var(--bha-border-subtle)' }}>
          <div style={{ fontWeight: 600, color: 'var(--bha-crimson-700)', marginBottom: '4px' }}>
            🛡️ Tôn Chỉ Bảo Mật & Đạo Học
          </div>
          <div style={{ fontSize: '12px', color: 'var(--bha-text-secondary)' }}>
            Ứng dụng hoạt động hoàn toàn offline, không phụ thuộc vào internet, không gửi dữ liệu ra máy chủ bên ngoài. Mọi trăn trở, câu hỏi và nghiệm lý của bạn được bảo mật tuyệt đối trên chính chiếc máy tính cá nhân.
          </div>
        </div>
      </div>
    </Modal>
  );
};
