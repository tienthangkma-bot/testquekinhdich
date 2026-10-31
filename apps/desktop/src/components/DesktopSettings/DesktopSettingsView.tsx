import React, { useState } from 'react';
import { Card, Button } from '@kindich/shared';
import { BackupRestoreModal } from '../BackupRestore';
import { getDivinationRepository } from '../../services/repository.service';

export const DesktopSettingsView: React.FC = () => {
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [clearStatus, setClearStatus] = useState<string | null>(null);

  const handleClearAllData = async () => {
    if (window.confirm('CẢNH BÁO: Hành động này sẽ xóa toàn bộ lịch sử lập quẻ và ghi chú trên máy tính này. Bạn có chắc chắn muốn xóa không?')) {
      try {
        const repo = getDivinationRepository();
        const allItems = await repo.list(undefined, { page: 1, pageSize: 5000 });
        for (const item of allItems.items) {
          await repo.delete(item.id);
        }
        setClearStatus('✓ Đã dọn dẹp sạch toàn bộ dữ liệu lịch sử thành công!');
        setTimeout(() => setClearStatus(null), 4000);
      } catch (err) {
        console.error('Lỗi khi xóa dữ liệu:', err);
        setClearStatus('X Lỗi khi xóa dữ liệu');
      }
    }
  };

  return (
    <div className="desktop-settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--bha-border-subtle, #e2d9cc)', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--bha-font-serif)' }}>
          ⚙️ Cài Đặt & Quản Lý Dữ Liệu Desktop
        </h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--bha-text-secondary)', fontSize: '14px' }}>
          Quản trị sao lưu, khôi phục dữ liệu offline và thông số kỹ thuật hệ thống.
        </p>
      </div>

      {clearStatus && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: clearStatus.startsWith('✓') ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
            color: clearStatus.startsWith('✓') ? '#2e7d32' : '#d32f2f',
            border: `1px solid ${clearStatus.startsWith('✓') ? 'rgba(46, 125, 50, 0.3)' : 'rgba(211, 47, 47, 0.3)'}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {clearStatus}
        </div>
      )}

      {/* Quản lý sao lưu & khôi phục dữ liệu */}
      <Card title="💾 Sao Lưu & Khôi Phục Dữ Liệu Offline">
        <p style={{ fontSize: '14px', color: 'var(--bha-text-secondary)', marginBottom: '16px' }}>
          Dữ liệu các lần lập quẻ, ghi chú câu hỏi và nghiệm lý thực tế được lưu trữ 100% cục bộ trên ổ cứng máy tính của bạn. Bạn có thể xuất thành tệp tin JSON độc lập để lưu trữ cá nhân hoặc chuyển đổi sang máy tính khác.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" onClick={() => setIsBackupModalOpen(true)}>
            📤 Mở Trung Tâm Sao Lưu & Khôi Phục
          </Button>
          <Button variant="secondary" onClick={handleClearAllData} style={{ color: '#d32f2f' }}>
            🗑️ Xóa Toàn Bộ Lịch Sử
          </Button>
        </div>
      </Card>

      {/* Thông số kỹ thuật & Phiên bản */}
      <Card title="ℹ️ Thông Số Kỹ Thuật Ứng Dụng">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Tên ứng dụng: </span>
              <strong>Kinh Dịch - Bắc Hà Tân An Phái (Desktop Edition)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Khung ứng dụng: </span>
              <strong>Tauri 2 (Rust Native Shell + WebView2)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Giao diện: </span>
              <strong>React 19 + TypeScript 5.8 + Vite 6</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Chế độ hoạt động: </span>
              <strong style={{ color: '#2e7d32' }}>Offline-First 100% (Không phụ thuộc Internet)</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Thuật toán Seri: </span>
              <strong>SERIAL-MOD8-V1 (Phép Bốc Phệ)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Thuật toán Mai Hoa: </span>
              <strong>MAI-HUA-V1 (Giờ Động Tâm Thiệu Khang Tiết)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Quy tắc Lục Hào: </span>
              <strong>BO_PHE_CHINH_TONG_V1</strong>
            </div>
            <div>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Database Schema: </span>
              <strong>Version 1 (IndexedDB / Dexie)</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Triết lý bảo mật & quyền riêng tư */}
      <Card title="🛡️ Cam Kết Riêng Tư & Bảo Mật">
        <div style={{ fontSize: '13px', color: 'var(--bha-text-secondary)', lineHeight: 1.7 }}>
          Hệ thống được thiết kế theo tôn chỉ <strong>Local First</strong>. Mọi phép gieo quẻ, suy tư cá nhân, câu hỏi trăn trở và kết quả nghiệm lý của người dùng đều chỉ tồn tại duy nhất trên thiết bị cá nhân. Ứng dụng tuyệt đối không gửi bất kỳ gói tin nào ra máy chủ bên ngoài hay thu thập dữ liệu hành vi.
        </div>
      </Card>

      {/* Modal Sao lưu & Phục hồi */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
