import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Select } from '@kindich/shared';
import {
  KinhDichSettings,
  DEFAULT_KINHDICH_SETTINGS,
  StorageStats,
} from '@kindich/domain';
import { LocalStorageSettingsRepository } from '@kindich/database';
import { BackupRestoreModal } from '../BackupRestore';
import { getDivinationRepository } from '../../services/repository.service';

export const DesktopSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<KinhDichSettings>(DEFAULT_KINHDICH_SETTINGS);
  const [stats, setStats] = useState<StorageStats>({
    divinationCount: 0,
    noteCount: 0,
    totalSizeEstimateBytes: 0,
  });
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'restore'>('export');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getSettingsRepo = useCallback(() => {
    return new LocalStorageSettingsRepository(undefined, getDivinationRepository());
  }, []);

  const loadData = useCallback(async () => {
    try {
      const repo = getSettingsRepo();
      const [currentSettings, currentStats] = await Promise.all([
        repo.getSettings(),
        repo.getStorageStats(),
      ]);
      setSettings(currentSettings);
      setStats(currentStats);
    } catch (err) {
      console.error('Lỗi khi tải cấu hình:', err);
    }
  }, [getSettingsRepo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleUpdateAppearance = async (field: keyof KinhDichSettings['appearance'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        appearance: {
          ...settings.appearance,
          [field]: value,
        },
      });
      setSettings(updated);
      showNotification(`✓ Đã cập nhật cài đặt giao diện: ${field} = ${value}`);

      // Áp dụng theme và cỡ chữ lên DOM
      if (field === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
      if (field === 'fontSize') {
        document.documentElement.setAttribute('data-font-size', value);
      }
    } catch {
      showNotification('X Không thể lưu cài đặt giao diện', 'error');
    }
  };

  const handleUpdateDivination = async (field: keyof KinhDichSettings['divination'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        divination: {
          ...settings.divination,
          [field]: value,
        },
      });
      setSettings(updated);
      showNotification(`✓ Đã cập nhật cài đặt lập quẻ: ${value}`);
    } catch {
      showNotification('X Không thể lưu cài đặt lập quẻ', 'error');
    }
  };

  const handleUpdateCalendar = async (field: keyof KinhDichSettings['calendar'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        calendar: {
          ...settings.calendar,
          [field]: value,
        },
      });
      setSettings(updated);
      showNotification(`✓ Đã cập nhật cài đặt lịch pháp`);
    } catch {
      showNotification('X Không thể lưu cài đặt lịch pháp', 'error');
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cài đặt về mặc định của hệ thống?')) {
      try {
        const repo = getSettingsRepo();
        const reset = await repo.resetSettings();
        setSettings(reset);
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-font-size');
        showNotification('✓ Đã khôi phục cài đặt mặc định thành công!');
      } catch {
        showNotification('X Không thể khôi phục cài đặt', 'error');
      }
    }
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        'CẢNH BÁO NGUY HIỂM: Hành động này sẽ xóa vĩnh viễn toàn bộ lịch sử lập quẻ và ghi chú. Bạn có chắc chắn muốn tiếp tục?'
      )
    ) {
      try {
        const repo = getDivinationRepository();
        const allItems = await repo.list(undefined, { page: 1, pageSize: 5000 });
        for (const item of allItems.items) {
          await repo.delete(item.id);
        }
        await loadData();
        showNotification('✓ Đã dọn dẹp sạch toàn bộ dữ liệu lịch sử thành công!');
      } catch (err) {
        console.error('Lỗi khi xóa dữ liệu:', err);
        showNotification('X Lỗi khi xóa dữ liệu', 'error');
      }
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="desktop-settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--bha-border-subtle, #e2d9cc)', paddingBottom: '12px' }}>
        <h1 style={{ fontSize: '24px', margin: 0, fontFamily: 'var(--bha-font-serif)' }}>
          ⚙️ Cài Đặt & Cấu Hình Hệ Thống
        </h1>
        <p style={{ margin: '6px 0 0 0', color: 'var(--bha-text-secondary)', fontSize: '14px' }}>
          Quản trị giao diện, phương pháp lập quẻ, lịch pháp và dữ liệu lưu trữ offline.
        </p>
      </div>

      {notice && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: notice.type === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
            color: notice.type === 'success' ? '#2e7d32' : '#d32f2f',
            border: `1px solid ${notice.type === 'success' ? 'rgba(46, 125, 50, 0.3)' : 'rgba(211, 47, 47, 0.3)'}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {notice.text}
        </div>
      )}

      {/* 1. Cài đặt giao diện (Requirement 1) */}
      <Card title="🎨 1. Cài Đặt Giao Diện (Appearance)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Chế độ màu (Sáng / Tối):
            </label>
            <Select
              value={settings.appearance.theme}
              options={[
                { value: 'light', label: '☀️ Sáng (Mặc định Cổ điển)' },
                { value: 'dark', label: '🌙 Tối (Dễ nhìn ban đêm)' },
                { value: 'system', label: '💻 Tự động theo Hệ điều hành' },
              ]}
              onChange={(e) => handleUpdateAppearance('theme', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Ngôn ngữ hiển thị:
            </label>
            <Select
              value={settings.appearance.language}
              options={[
                { value: 'vi', label: 'Tiếng Việt (Việt Ngữ)' },
                { value: 'zh', label: 'Hán Tự / Âm Hán (漢字)' },
                { value: 'en', label: 'English (Tiếng Anh)' },
              ]}
              onChange={(e) => handleUpdateAppearance('language', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Cỡ chữ hiển thị:
            </label>
            <Select
              value={settings.appearance.fontSize}
              options={[
                { value: 'small', label: 'Nhỏ (87.5% - Gọn gàng)' },
                { value: 'medium', label: 'Vừa (100% - Tiêu chuẩn)' },
                { value: 'large', label: 'Lớn (112.5% - Dễ đọc)' },
              ]}
              onChange={(e) => handleUpdateAppearance('fontSize', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 2. Cài đặt lập quẻ (Requirement 2) */}
      <Card title="🔮 2. Cài Đặt Lập Quẻ & Thuật Toán (Divination)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Phương pháp lập quẻ mặc định khi mở app:
            </label>
            <Select
              value={settings.divination.defaultMethod}
              options={[
                { value: 'serial', label: '💵 Seri Tiền Polymer (SERIAL-MOD8-V1)' },
                { value: 'time', label: '⏳ Giờ Động Tâm Mai Hoa (MAI-HUA-V1)' },
                { value: 'six-yao', label: '📊 Phân Tích Lục Hào Chuyên Sâu' },
              ]}
              onChange={(e) => handleUpdateDivination('defaultMethod', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Bộ quy tắc Lục Hào (RuleSet):
            </label>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bha-bg-subtle, #f5f0e8)', borderRadius: '6px', fontSize: '13px' }}>
              <strong>{settings.divination.ruleSetId}</strong>
              <div style={{ color: 'var(--bha-text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Bốc Phệ Chính Tông (Dã Hạc Đạo Nhân & Vương Duy Đức) • Đang kích hoạt
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Phiên bản thuật toán:
            </label>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bha-bg-subtle, #f5f0e8)', borderRadius: '6px', fontSize: '13px' }}>
              <strong>{settings.divination.algorithmVersion}</strong>
              <div style={{ color: 'var(--bha-text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Chuẩn toán học chia 8 thượng/hạ quái & chia 6 hào động
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Cài đặt lịch pháp (Requirement 3) */}
      <Card title="📅 3. Cài Đặt Lịch Pháp & Thiên Văn (Calendar)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Múi giờ tính toán:
            </label>
            <Select
              value={settings.calendar.timeZone}
              options={[
                { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (UTC+7, Kinh tuyến 105°E - Mặc định)' },
                { value: 'Asia/Bangkok', label: 'Bangkok / Đông Dương (UTC+7)' },
                { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
                { value: 'Asia/Tokyo', label: 'Tokyo / Nhật Bản (UTC+9)' },
                { value: 'UTC', label: 'Giờ Quốc Tế (UTC+0)' },
              ]}
              onChange={(e) => handleUpdateCalendar('timeZone', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Quy tắc chuyển ngày Can Chi:
            </label>
            <Select
              value={settings.calendar.dayTransitionRule}
              options={[
                { value: '23:00', label: '23:00 (Giờ Tý bắt đầu ngày mới - Cổ pháp chính tông)' },
                { value: '00:00', label: '00:00 (Nửa đêm dương lịch - Lịch hành chính)' },
              ]}
              onChange={(e) => handleUpdateCalendar('dayTransitionRule', e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Quy tắc tháng nhuận:
            </label>
            <Select
              value={settings.calendar.leapMonthRule}
              options={[
                { value: 'TIET_KHI', label: 'Theo Tiết Khí thiên văn (Căn cứ Trung Khí - Chuẩn)' },
                { value: 'TRUYEN_THONG', label: 'Theo quy ước Lịch vạn niên truyền thống' },
              ]}
              onChange={(e) => handleUpdateCalendar('leapMonthRule', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* 4. Cài đặt dữ liệu & Dung lượng (Requirement 4) */}
      <Card title="💾 4. Quản Lý Dữ Liệu & Thống Kê Dung Lượng">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '12px', border: '1px solid var(--bha-border, #dcd4c8)', borderRadius: '8px', backgroundColor: 'var(--bha-bg-card, #fff)' }}>
            <div style={{ color: 'var(--bha-text-secondary)', fontSize: '12px' }}>Tổng số quẻ đã lập</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--bha-crimson-700, #981b1e)', marginTop: '4px' }}>
              {stats.divinationCount}
            </div>
          </div>

          <div style={{ padding: '12px', border: '1px solid var(--bha-border, #dcd4c8)', borderRadius: '8px', backgroundColor: 'var(--bha-bg-card, #fff)' }}>
            <div style={{ color: 'var(--bha-text-secondary)', fontSize: '12px' }}>Tổng số ghi chú & nghiệm lý</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--bha-accent, #8b6b23)', marginTop: '4px' }}>
              {stats.noteCount}
            </div>
          </div>

          <div style={{ padding: '12px', border: '1px solid var(--bha-border, #dcd4c8)', borderRadius: '8px', backgroundColor: 'var(--bha-bg-card, #fff)' }}>
            <div style={{ color: 'var(--bha-text-secondary)', fontSize: '12px' }}>Dung lượng bộ nhớ cục bộ</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#2e7d32', marginTop: '4px' }}>
              {formatSize(stats.totalSizeEstimateBytes)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <Button
            variant="primary"
            onClick={() => {
              setBackupModalTab('export');
              setIsBackupModalOpen(true);
            }}
          >
            📤 Xuất Bản Sao Lưu (Backup JSON)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setBackupModalTab('restore');
              setIsBackupModalOpen(true);
            }}
          >
            📥 Khôi Phục Dữ Liệu (Restore JSON)
          </Button>
          <Button variant="secondary" onClick={handleClearAllData} style={{ color: '#d32f2f', borderColor: '#d32f2f' }}>
            🗑️ Xóa Toàn Bộ Lịch Sử
          </Button>
        </div>
      </Card>

      {/* 5. Khôi phục cài đặt gốc (Requirement 6) */}
      <Card title="🔄 5. Khôi Phục Cài Đặt Gốc">
        <p style={{ fontSize: '14px', color: 'var(--bha-text-secondary)', marginBottom: '14px' }}>
          Nếu bạn muốn đặt lại tất cả các tùy chỉnh giao diện, phương pháp lập quẻ mặc định và quy tắc lịch pháp về cấu hình nguyên bản của hệ thống Bắc Hà Tân An Phái:
        </p>
        <Button variant="secondary" onClick={handleResetSettings}>
          Khôi Phục Cài Đặt Mặc Định (Reset to Defaults)
        </Button>
      </Card>

      {/* Modal Sao lưu & Phục hồi */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => {
          setIsBackupModalOpen(false);
          loadData();
        }}
        initialTab={backupModalTab}
      />
    </div>
  );
};
