import { describe, it, expect } from 'vitest';
import {
  CastingMethod,
  getHexagramById,
} from '@kindich/domain';
import {
  castBySerial,
  castByMaiHua,
  orchestrateSixYaoAnalysis,
  getClassicalHexagramData,
  SIX_YAO_DEFAULT_RULESET_ID,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { theme } from '../theme/colors';
import { MobileDivinationRecord, QuestionCategory } from '../types/navigation';

describe('KinhDich Mobile App (apps/mobile)', () => {
  // =========================================================================
  // 1. Tái sử dụng @kindich/shared Design Tokens
  // =========================================================================
  describe('Tái sử dụng Design Tokens (@kindich/shared)', () => {
    it('theme colors chứa đầy đủ bảng màu Crimson, Gold và Background chuẩn Bắc Hà Tân An', () => {
      expect(theme.colors.primary).toBe('#851616');
      expect(theme.colors.accent).toBe('#B5871D');
      expect(theme.colors.background).toBe('#FAF8F5');
      expect(theme.colors.card).toBe('#FFFFFF');
      expect(theme.colors.borderGold).toBe('#D6B462');
      expect(theme.colors.text).toBe('#1F1916');
    });

    it('theme spacing và radius tuân thủ thiết kế responsive mobile', () => {
      expect(theme.spacing.md).toBe(12);
      expect(theme.spacing.lg).toBe(16);
      expect(theme.radius.md).toBe(8);
      expect(theme.radius.lg).toBe(12);
    });
  });

  // =========================================================================
  // 2. Tái sử dụng @kindich/core: Lập quẻ Seri tiền (SERIAL-MOD8-V1)
  // =========================================================================
  describe('Lập quẻ bằng Seri Tiền trong Mobile (@kindich/core)', () => {
    it('thực thi castBySerial chính xác với số seri tiền', () => {
      const serial = '081293';
      const result = castBySerial(serial);

      expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.serialNumber).toBe('081293');
      expect(result.trio.primary).toBeDefined();
      expect(result.trio.transformed).toBeDefined();
      expect(result.trio.nuclear).toBeDefined();
      expect(result.movingLine).toBeGreaterThanOrEqual(1);
      expect(result.movingLine).toBeLessThanOrEqual(6);

      // Thượng quái, Hạ quái
      expect(result.upperTrigram).toBeDefined();
      expect(result.lowerTrigram).toBeDefined();
      expect(result.trio.primary.lines.length).toBe(6);
    });
  });

  // =========================================================================
  // 3. Tái sử dụng @kindich/core & @kindich/calendar: Lập quẻ Mai Hoa
  // =========================================================================
  describe('Lập quẻ Mai Hoa Dịch Số trong Mobile (@kindich/core & @kindich/calendar)', () => {
    it('thực thi castByMaiHua và phân tích Thể Dụng', () => {
      const testDate = new Date(2026, 9, 31, 10, 30); // 31/10/2026 10:30
      const cal = getFullCalendarInfo(testDate);

      const yearBranchIndex = ((cal.lunar.year + 8) % 12 + 12) % 12;
      const yearBranchNumber = yearBranchIndex + 1;
      const hourBranchNumber = cal.currentHourBranch.index + 1;

      const result = castByMaiHua({
        yearBranch: yearBranchNumber,
        month: Math.abs(cal.lunar.month),
        day: cal.lunar.day,
        hourBranch: hourBranchNumber,
      });

      expect(result.algorithmVersion).toBe('MAI-HUA-V1');
      expect(result.theDung).toBeDefined();
      expect(result.theDung.theTrigram).toBeDefined();
      expect(result.theDung.dungTrigram).toBeDefined();
      expect(['UPPER', 'LOWER']).toContain(result.theDung.thePosition);
      expect(['UPPER', 'LOWER']).toContain(result.theDung.dungPosition);
    });
  });

  // =========================================================================
  // 4. Tái sử dụng Six Yao Analysis Orchestrator trong Mobile
  // =========================================================================
  describe('Điều phối phân tích Lục Hào Cổ Pháp trong Mobile', () => {
    it('orchestrateSixYaoAnalysis tạo kết quả phân tích đủ 6 hào, Bát Cung, Thế Ứng, Lục Thân, Lục Thú', () => {
      const analysis = orchestrateSixYaoAnalysis({
        primaryHexagram: 1, // Thuần Càn
        changingHexagram: 44, // Thiên Phong Cấu (hào 1 động)
        movingLineIndices: [1],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Thìn',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Kỷ Tỵ',
        },
      });

      expect(analysis.primaryHexagram.hexagramNumber).toBe(1);
      expect(analysis.primaryHexagram.palace.name).toBe('Càn');
      expect(analysis.primaryHexagram.palace.worldLine).toBe(6);
      expect(analysis.primaryHexagram.palace.responseLine).toBe(3);

      // Đủ 6 hào
      expect(analysis.primaryHexagram.lines.length).toBe(6);

      // Hào 1 khởi Thanh Long (vì ngày Giáp)
      const line1 = analysis.primaryHexagram.lines[0];
      expect(line1.position).toBe(1);
      expect(line1.sixSpiritName).toBe('Thanh Long');
      expect(line1.isMoving).toBe(true);
      expect(line1.changingLine).toBeDefined();

      // Thông tin lịch pháp
      expect(analysis.dateTime.canChi.day).toBe('Giáp Tý');
      expect(analysis.dateTime.dayMaster.voidBranches).toContain('Tuất');
      expect(analysis.dateTime.dayMaster.voidBranches).toContain('Hợi');
    });
  });

  // =========================================================================
  // 5. Kinh Văn Cổ Điển Thoán Hào
  // =========================================================================
  describe('Truy xuất Kinh văn Thoán Hào (@kindich/core)', () => {
    it('getClassicalHexagramData trả về Thoán từ và Đại Tượng cho quẻ Thuần Càn (#1)', () => {
      const lookup = getClassicalHexagramData(1);
      expect(lookup.status).toBe('AVAILABLE');

      if (lookup.status === 'AVAILABLE') {
        expect(lookup.data.hexagramNumber).toBe(1);
        expect(lookup.data.hexagramName).toBe('Thuần Càn');
        expect(lookup.data.thuanTu.chinese).toContain('元亨利貞');
        expect(lookup.data.thuanTu.translation).toBeDefined();
        expect(lookup.data.daiTuong.chinese).toBeDefined();
        expect(lookup.data.lines.length).toBe(6);
      }
    });
  });

  // =========================================================================
  // 6. Quản lý State Lịch Sử & Lọc Danh Mục Mobile
  // =========================================================================
  describe('Quản lý Dữ liệu Lịch sử & Phân loại Đề mục trong Mobile', () => {
    it('hỗ trợ tạo record, lưu lịch sử, tìm kiếm và lọc danh mục', () => {
      const serialResult = castBySerial('6886');
      const mockRecord: MobileDivinationRecord = {
        id: 'test-rec-1',
        method: CastingMethod.SERIAL,
        createdAt: new Date().toISOString(),
        question: 'Dự án kinh doanh mở rộng thị trường',
        category: 'finance',
        trio: serialResult.trio,
        movingLines: serialResult.trio.movingLineIndices,
        serialNumber: '6886',
        dateTimeInfo: {
          solarDateStr: '31/10/2026 10:30',
          lunarDateStr: 'Ngày 21 tháng 9 năm Bính Ngọ',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Mậu Tuất',
          dayCanChi: 'Giáp Tý',
          hourCanChi: 'Kỷ Tỵ',
        },
      };

      const history: MobileDivinationRecord[] = [mockRecord];

      // Lọc theo danh mục 'finance'
      const financeItems = history.filter((i) => i.category === 'finance');
      expect(financeItems.length).toBe(1);

      // Lọc theo danh mục khác 'study'
      const studyItems = history.filter((i) => i.category === 'study');
      expect(studyItems.length).toBe(0);

      // Tìm kiếm theo từ khóa 'kinh doanh'
      const searchItems = history.filter((i) =>
        i.question?.toLowerCase().includes('kinh doanh')
      );
      expect(searchItems.length).toBe(1);
    });
  });
});
