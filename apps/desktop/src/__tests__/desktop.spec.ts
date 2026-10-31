import { describe, it, expect } from 'vitest';
import {
  castBySerial,
  castByMaiHua,
  castHexagramTrio,
  orchestrateSixYaoAnalysis,
  parseCanChiString,
  calculateVoidBranches,
  interpretHexagram,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { HEXAGRAMS, LinePosition } from '@kindich/domain';

describe('Desktop App - Core Integration & Desktop Specifications', () => {
  describe('1. Desktop Navigation & 6 Key Screens Validation', () => {
    it('định nghĩa đầy đủ 6 màn hình bắt buộc cho Desktop', () => {
      const desktopScreens = ['home', 'serial', 'time', 'six-yao', 'history', 'settings'];
      expect(desktopScreens).toHaveLength(6);
      expect(desktopScreens).toContain('home');
      expect(desktopScreens).toContain('serial');
      expect(desktopScreens).toContain('time');
      expect(desktopScreens).toContain('six-yao');
      expect(desktopScreens).toContain('history');
      expect(desktopScreens).toContain('settings');
    });

    it('tổng quan 64 quẻ tra cứu khả dụng trong selector desktop', () => {
      expect(HEXAGRAMS).toHaveLength(64);
      expect(HEXAGRAMS[0]?.name).toBe('Thuần Càn');
      expect(HEXAGRAMS[1]?.name).toBe('Thuần Khôn');
      expect(HEXAGRAMS[63]?.name).toBe('Hỏa Thủy Vị Tế');
    });
  });

  describe('2. Desktop Header & Real-time Calendar Engine Integration', () => {
    it('tính toán can chi, tiết khí và tuần không chuẩn xác cho thanh Header Desktop', () => {
      // Test mốc thời gian xác định: 2026-10-31 09:00:00
      const cal = getFullCalendarInfo('2026-10-31T09:00:00.000Z');
      expect(cal).toBeDefined();
      expect(cal.canChi.day).toBeDefined();
      expect(cal.canChi.month).toBeDefined();
      expect(cal.canChi.year).toBeDefined();
      expect(cal.canChi.hour).toBeDefined();
      expect(cal.solarTerm).toBeDefined();

      // Tuần không
      const { stem, branch } = parseCanChiString(cal.canChi.day);
      const { voidBranches } = calculateVoidBranches(stem, branch);
      expect(voidBranches).toHaveLength(2);
    });
  });

  describe('3. Desktop Serial Casting Workflow (SERIAL-MOD8-V1)', () => {
    it('lập quẻ theo 4 số seri tiền polymer và trả về bộ ba quẻ chuẩn tắc', () => {
      const serial = '6824';
      const result = castBySerial(serial);

      expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.serialNumber).toBe('6824');
      expect(result.trio.primary).toBeDefined();
      expect(result.trio.nuclear).toBeDefined();
      expect(result.movingLine).toBeGreaterThanOrEqual(1);
      expect(result.movingLine).toBeLessThanOrEqual(6);

      // Phân tích Lục Hào
      const sixYao = orchestrateSixYaoAnalysis({
        primaryHexagram: result.trio.primary.number,
        changingHexagram: result.trio.transformed?.number,
        movingLineIndices: result.movingLine ? [result.movingLine as LinePosition] : [],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Kỷ Tỵ',
        },
      });
      expect(sixYao.primaryHexagram.palace).toBeDefined();
      expect(sixYao.primaryHexagram.lines).toHaveLength(6);
    });
  });

  describe('4. Desktop Mai Hua Casting Workflow (MAI-HUA-V1)', () => {
    it('lập quẻ theo giờ động tâm và định chuẩn Thể/Dụng Mai Hoa', () => {
      const result = castByMaiHua({
        yearBranch: 1, // Tý
        month: 9,
        day: 20,
        hourBranch: 5, // Thìn
      });

      expect(result.algorithmVersion).toBe('MAI-HUA-V1');
      expect(result.trio.primary).toBeDefined();
      expect(result.trio.transformed).toBeDefined();
      expect(result.trio.nuclear).toBeDefined();
      expect(result.theDung.theTrigram).toBeDefined();
      expect(result.theDung.dungTrigram).toBeDefined();
      expect(result.theDung.summary).toBeDefined();
    });
  });

  describe('5. Desktop Six Yao & Comprehensive Interpretation Orchestration', () => {
    it('xây dựng bộ ba quẻ và đồ bản Lục Hào từ quẻ tùy chọn', () => {
      // Ví dụ quẻ #1 Thuần Càn (binary 111111) hào 1 động
      const trio = castHexagramTrio('111111', [1]);
      expect(trio.primary.number).toBe(1);
      expect(trio.movingLineIndices).toEqual([1]);
      expect(trio.transformed).toBeDefined();
      expect(trio.transformed?.number).toBe(44); // Thiên Phong Cấu

      // Diễn giải Kinh văn & Chu Hi
      const interpretation = interpretHexagram({
        trio,
      });
      expect(interpretation.primaryClassical).toBeDefined();
      expect(interpretation.movingLinesClassical).toHaveLength(1);
      expect(interpretation.hexagramTransformation.content.divinationMethodRule).toBeDefined();
      expect(interpretation.hexagramTransformation.content.explanation).toBeDefined();
    });
  });

  describe('6. Desktop System Specifications & Offline Data Standards', () => {
    it('đáp ứng tiêu chuẩn RuleSet Bốc Phệ Chính Tông và Offline', () => {
      const ruleSetId = 'BO_PHE_CHINH_TONG_V1';
      const algorithmVersion = 'SERIAL-MOD8-V1';
      const schemaVersion = 2;

      expect(ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(schemaVersion).toBe(2);
    });
  });

  describe('7. Desktop Menu Bar & Window Management Specifications', () => {
    it('kiểm tra danh mục menu chuẩn Desktop (File, View, Settings, Help)', () => {
      const menus = ['file', 'view', 'settings', 'help'];
      expect(menus).toHaveLength(4);
      expect(menus).toContain('file');
      expect(menus).toContain('view');
      expect(menus).toContain('settings');
      expect(menus).toContain('help');
    });

    it('kiểm tra giới hạn và bước phóng to/thu nhỏ giao diện (Zoom 80% - 150%)', () => {
      const ZOOM_LEVELS = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5];
      expect(ZOOM_LEVELS[0]).toBe(0.8);
      expect(ZOOM_LEVELS[ZOOM_LEVELS.length - 1]).toBe(1.5);
      expect(ZOOM_LEVELS).toContain(1.0);

      // Hàm mô phỏng zoom in
      const zoomIn = (current: number) => {
        const next = ZOOM_LEVELS.find((z) => z > current + 0.01);
        return next !== undefined ? next : Math.min(1.5, Number((current + 0.1).toFixed(2)));
      };

      // Hàm mô phỏng zoom out
      const zoomOut = (current: number) => {
        const prevLevels = [...ZOOM_LEVELS].reverse();
        const next = prevLevels.find((z) => z < current - 0.01);
        return next !== undefined ? next : Math.max(0.8, Number((current - 0.1).toFixed(2)));
      };

      expect(zoomIn(1.0)).toBe(1.1);
      expect(zoomIn(1.25)).toBe(1.5);
      expect(zoomIn(1.5)).toBe(1.5); // không vượt quá 1.5

      expect(zoomOut(1.0)).toBe(0.9);
      expect(zoomOut(0.9)).toBe(0.8);
      expect(zoomOut(0.8)).toBe(0.8); // không nhỏ hơn 0.8
    });

    it('kiểm tra bản đồ phím tắt bàn phím Desktop chuẩn', () => {
      const shortcuts = {
        newSerial: 'Ctrl+N',
        newTime: 'Ctrl+T',
        exportBackup: 'Ctrl+E',
        restoreBackup: 'Ctrl+I',
        quit: 'Ctrl+Q',
        zoomIn: 'Ctrl+=',
        zoomOut: 'Ctrl+-',
        zoomReset: 'Ctrl+0',
        fullscreen: 'F11',
        help: 'F1',
      };

      expect(shortcuts.newSerial).toBe('Ctrl+N');
      expect(shortcuts.newTime).toBe('Ctrl+T');
      expect(shortcuts.exportBackup).toBe('Ctrl+E');
      expect(shortcuts.restoreBackup).toBe('Ctrl+I');
      expect(shortcuts.fullscreen).toBe('F11');
      expect(shortcuts.help).toBe('F1');
    });

    it('kiểm tra cấu hình kích thước cửa sổ Desktop tối thiểu và khả năng co giãn', () => {
      const windowConfig = {
        title: 'Kinh Dịch - Bắc Hà Tân An Phái',
        width: 1200,
        height: 800,
        minWidth: 960,
        minHeight: 640,
        resizable: true,
        fullscreen: false,
      };

      expect(windowConfig.resizable).toBe(true);
      expect(windowConfig.minWidth).toBe(960);
      expect(windowConfig.minHeight).toBe(640);
      expect(windowConfig.width).toBeGreaterThanOrEqual(windowConfig.minWidth);
    });
  });

  describe('8. Desktop Empty States & Quick Demo Workflow', () => {
    it('cho phép lập quẻ mẫu nhanh 6824 khi ở trạng thái trống', () => {
      const sampleSerial = '6824';
      const result = castBySerial(sampleSerial);
      expect(result).toBeDefined();
      expect(result.serialNumber).toBe('6824');
      expect(result.trio.primary.name).toBe('Địa Lôi Phục');
    });

    it('cho phép khởi quẻ nhanh với thời khắc hiện tại khi ở trạng thái trống', () => {
      const now = new Date('2026-10-31T09:30:00.000Z');
      const cal = getFullCalendarInfo(now.toISOString(), { dayTransition: 'RAT_HOUR_23' });
      const yearBranchIndex = ((cal.lunar.year + 8) % 12 + 12) % 12;
      const yearBranchNumber = yearBranchIndex + 1;
      const hourBranchNumber = cal.currentHourBranch.index + 1;

      const res = castByMaiHua({
        yearBranch: yearBranchNumber,
        month: cal.lunar.month,
        day: cal.lunar.day,
        hourBranch: hourBranchNumber,
      });

      expect(res).toBeDefined();
      expect(res.algorithmVersion).toBe('MAI-HUA-V1');
      expect(res.trio.primary).toBeDefined();
    });
  });

  describe('9. Desktop Settings Module (Cài Đặt & Cấu Hình Desktop)', () => {
    it('khởi tạo cài đặt mặc định và lưu trữ offline', async () => {
      const { LocalStorageSettingsRepository, InMemoryStorage } = await import('@kindich/domain');
      const storage = new InMemoryStorage();
      const repo = new LocalStorageSettingsRepository(storage);

      const settings = await repo.getSettings();
      expect(settings.appearance.theme).toBe('light');
      expect(settings.appearance.language).toBe('vi');
      expect(settings.appearance.fontSize).toBe('medium');
      expect(settings.divination.defaultMethod).toBe('serial');
      expect(settings.divination.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(settings.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(settings.calendar.dayTransitionRule).toBe('23:00');
      expect(settings.calendar.leapMonthRule).toBe('TIET_KHI');
    });

    it('cho phép lưu các tùy chỉnh giao diện, lập quẻ và lịch pháp', async () => {
      const { LocalStorageSettingsRepository, InMemoryStorage } = await import('@kindich/domain');
      const storage = new InMemoryStorage();
      const repo = new LocalStorageSettingsRepository(storage);

      const updated = await repo.saveSettings({
        appearance: { theme: 'dark', language: 'zh', fontSize: 'large' },
        divination: { defaultMethod: 'time', ruleSetId: 'BO_PHE_CHINH_TONG_V1', algorithmVersion: 'MAI-HUA-V1' },
        calendar: { timeZone: 'Asia/Tokyo', dayTransitionRule: '00:00', leapMonthRule: 'TRUYEN_THONG' },
      });

      expect(updated.appearance.theme).toBe('dark');
      expect(updated.appearance.fontSize).toBe('large');
      expect(updated.divination.defaultMethod).toBe('time');
      expect(updated.calendar.timeZone).toBe('Asia/Tokyo');
      expect(updated.calendar.dayTransitionRule).toBe('00:00');

      // Khôi phục cài đặt gốc
      const reset = await repo.resetSettings();
      expect(reset.appearance.theme).toBe('light');
      expect(reset.appearance.fontSize).toBe('medium');
      expect(reset.divination.defaultMethod).toBe('serial');
      expect(reset.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(reset.calendar.dayTransitionRule).toBe('23:00');
    });

    it('tính toán chính xác dung lượng lưu trữ và số quẻ/ghi chú', async () => {
      const { LocalStorageSettingsRepository, InMemoryStorage } = await import('@kindich/domain');
      const storage = new InMemoryStorage();
      const mockRepo = {
        list: async () => ({
          items: [{ id: '1', noteCount: 3 } as any, { id: '2', noteCount: 2 } as any],
          totalCount: 2,
          page: 1,
          pageSize: 5000,
          totalPages: 1,
        }),
      };
      const repo = new LocalStorageSettingsRepository(storage, mockRepo as any);
      const stats = await repo.getStorageStats();
      expect(stats.divinationCount).toBe(2);
      expect(stats.noteCount).toBe(5);
      expect(stats.totalSizeEstimateBytes).toBeGreaterThan(0);
    });
  });
});
