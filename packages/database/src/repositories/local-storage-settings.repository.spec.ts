import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalStorageSettingsRepository,
  InMemoryStorage,
} from './local-storage-settings.repository';
import {
  normalizeKinhDichSettings,
  IDivinationRepository,
} from '@kindich/domain';

describe('LocalStorageSettingsRepository & Settings Validator', () => {
  let inMemoryStorage: InMemoryStorage;
  let repo: LocalStorageSettingsRepository;

  beforeEach(() => {
    inMemoryStorage = new InMemoryStorage();
    repo = new LocalStorageSettingsRepository(inMemoryStorage);
  });

  describe('1. Cài đặt mặc định & Khởi tạo (Defaults)', () => {
    it('trả về DEFAULT_KINHDICH_SETTINGS khi bộ nhớ chưa có dữ liệu', async () => {
      const settings = await repo.getSettings();
      expect(settings.version).toBe(1);
      expect(settings.appearance.theme).toBe('light');
      expect(settings.appearance.language).toBe('vi');
      expect(settings.appearance.fontSize).toBe('medium');
      expect(settings.divination.defaultMethod).toBe('serial');
      expect(settings.divination.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(settings.divination.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(settings.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(settings.calendar.dayTransitionRule).toBe('23:00');
      expect(settings.calendar.leapMonthRule).toBe('TIET_KHI');
    });

    it('tự động chuẩn hóa dữ liệu khi JSON bị hỏng hoặc thiếu trường (normalizeKinhDichSettings)', () => {
      const malformed = {
        appearance: { theme: 'invalid-theme', fontSize: 'super-huge' },
        calendar: { timeZone: 'Mars/Curiosity' },
      };
      const normalized = normalizeKinhDichSettings(malformed);
      expect(normalized.appearance.theme).toBe('light'); // fallback to light
      expect(normalized.appearance.fontSize).toBe('medium'); // fallback to medium
      expect(normalized.calendar.timeZone).toBe('Asia/Ho_Chi_Minh'); // fallback to Vietnam
    });
  });

  describe('2. Lưu & Cập nhật Cài đặt (Save Settings)', () => {
    it('lưu và cập nhật cài đặt giao diện (theme, language, fontSize)', async () => {
      const updated = await repo.saveSettings({
        appearance: {
          theme: 'dark',
          language: 'zh',
          fontSize: 'large',
        },
      });

      expect(updated.appearance.theme).toBe('dark');
      expect(updated.appearance.language).toBe('zh');
      expect(updated.appearance.fontSize).toBe('large');

      // Đọc lại từ storage để xác thực tính bền vững (Persistence)
      const reloaded = await repo.getSettings();
      expect(reloaded.appearance.theme).toBe('dark');
      expect(reloaded.appearance.language).toBe('zh');
      expect(reloaded.appearance.fontSize).toBe('large');
      // Các trường khác giữ nguyên
      expect(reloaded.divination.defaultMethod).toBe('serial');
    });

    it('lưu và cập nhật cài đặt lập quẻ (defaultMethod)', async () => {
      const updated = await repo.saveSettings({
        divination: {
          defaultMethod: 'time',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'MAI-HUA-V1',
        },
      });

      expect(updated.divination.defaultMethod).toBe('time');
      expect(updated.divination.algorithmVersion).toBe('MAI-HUA-V1');

      const reloaded = await repo.getSettings();
      expect(reloaded.divination.defaultMethod).toBe('time');
    });

    it('lưu và cập nhật cài đặt lịch pháp (timeZone, dayTransitionRule, leapMonthRule)', async () => {
      const updated = await repo.saveSettings({
        calendar: {
          timeZone: 'Asia/Tokyo',
          dayTransitionRule: '00:00',
          leapMonthRule: 'TRUYEN_THONG',
        },
      });

      expect(updated.calendar.timeZone).toBe('Asia/Tokyo');
      expect(updated.calendar.dayTransitionRule).toBe('00:00');
      expect(updated.calendar.leapMonthRule).toBe('TRUYEN_THONG');

      const reloaded = await repo.getSettings();
      expect(reloaded.calendar.timeZone).toBe('Asia/Tokyo');
      expect(reloaded.calendar.dayTransitionRule).toBe('00:00');
      expect(reloaded.calendar.leapMonthRule).toBe('TRUYEN_THONG');
    });
  });

  describe('3. Khôi phục Cài đặt Mặc định (Reset Settings)', () => {
    it('khôi phục hoàn toàn cấu hình về giá trị mặc định', async () => {
      // Thay đổi một loạt cài đặt
      await repo.saveSettings({
        appearance: { theme: 'dark', language: 'en', fontSize: 'small' },
        divination: { defaultMethod: 'six-yao', ruleSetId: 'CUSTOM', algorithmVersion: 'V2' },
        calendar: { timeZone: 'UTC', dayTransitionRule: '00:00', leapMonthRule: 'TRUYEN_THONG' },
      });

      // Gọi reset
      const resetRes = await repo.resetSettings();
      expect(resetRes.appearance.theme).toBe('light');
      expect(resetRes.appearance.language).toBe('vi');
      expect(resetRes.appearance.fontSize).toBe('medium');
      expect(resetRes.divination.defaultMethod).toBe('serial');
      expect(resetRes.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(resetRes.calendar.dayTransitionRule).toBe('23:00');
      expect(resetRes.calendar.leapMonthRule).toBe('TIET_KHI');

      // Đọc lại từ repo
      const reloaded = await repo.getSettings();
      expect(reloaded.appearance.theme).toBe('light');
      expect(reloaded.divination.defaultMethod).toBe('serial');
    });
  });

  describe('4. Xem Dung Lượng Lưu Trữ (Storage Stats)', () => {
    it('tính toán số lượng quẻ, số lượng ghi chú và ước lượng dung lượng byte', async () => {
      const mockDivinationRepo: Partial<IDivinationRepository> = {
        list: async () => ({
          items: [
            { id: '1', noteCount: 2 } as any,
            { id: '2', noteCount: 3 } as any,
          ],
          totalCount: 2,
          page: 1,
          pageSize: 5000,
          totalPages: 1,
        }),
      };

      const statsRepo = new LocalStorageSettingsRepository(
        inMemoryStorage,
        mockDivinationRepo as IDivinationRepository
      );

      const stats = await statsRepo.getStorageStats();
      expect(stats.divinationCount).toBe(2);
      expect(stats.noteCount).toBe(5);
      expect(stats.totalSizeEstimateBytes).toBeGreaterThan(0);
    });
  });
});
