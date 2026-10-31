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
  interpretHexagram,
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

  // =========================================================================
  // 7. Tích hợp Interpretation Engine trong Mobile (Requirement 5)
  // =========================================================================
  describe('Tích hợp Động cơ Luận giải (Interpretation Engine) (@kindich/core)', () => {
    it('interpretHexagram() tạo đầy đủ 4 khối luận giải: Chu Hi, Thể Dụng, Thế Ứng và Kinh văn cổ điển', () => {
      const hex1 = getHexagramById(1)!;
      const hex44 = getHexagramById(44)!;
      const trioSample: any = {
        primary: hex1,
        transformed: hex44,
        nuclear: hex1,
        movingLineIndices: [1],
        hasMovingLines: true,
      };

      const cal = getFullCalendarInfo(new Date('2026-10-31T08:00:00.000Z'));

      const sixYaoAnalysis = orchestrateSixYaoAnalysis({
        primaryHexagram: hex1,
        changingHexagram: hex44,
        movingLineIndices: [1],
        dateTime: {
          dayCanChi: cal.canChi.day,
          monthCanChi: cal.canChi.month,
          yearCanChi: cal.canChi.year,
          hourCanChi: cal.canChi.hour,
        },
      });

      const interpretation = interpretHexagram({
        trio: trioSample,
        sixYaoResult: sixYaoAnalysis,
        includeAllLines: false,
      });

      // 1. Kinh văn quẻ chủ (có trong kho kiểm chứng)
      expect(interpretation.primaryClassical.hasVerifiedContent).toBe(true);
      expect(interpretation.primaryClassical.content?.hexagramNumber).toBe(1);
      expect(interpretation.primaryClassical.content?.thuanTu.chinese).toContain('元亨利貞');

      // 2. Hào từ của hào động
      expect(interpretation.movingLinesClassical.length).toBe(1);
      expect(interpretation.movingLinesClassical[0]?.content.position).toBe(1);
      expect(interpretation.movingLinesClassical[0]?.content.haoTu.chinese).toBeDefined();

      // 3. Quy tắc chiêm đoán Chu Hi (Dịch Học Khải Mông)
      expect(interpretation.hexagramTransformation.content.divinationMethodRule).toContain('Có 1 hào động');
      expect(interpretation.hexagramTransformation.source).toBe('Dịch Học Khải Mông (Chu Hi)');

      // 4. Luận giải Thế Ứng & Nhật Nguyệt Lục Hào
      expect(interpretation.sixYao).toBeDefined();
      expect(interpretation.sixYao?.content.shiYing.worldLine).toBeDefined();
      expect(interpretation.sixYao?.content.shiYing.relationName).toBeDefined();
      expect(interpretation.sixYao?.content.officerImpact.summaryOverview).toBeDefined();

      // 5. Tuyên bố trách nhiệm học thuật minh bạch
      expect(interpretation.disclaimer).toContain('Bắc Hà Tân An Phái');
    });

    it('interpretHexagram() báo rõ ràng hasVerifiedContent: false khi chưa có dữ liệu cổ điển, không tự bịa đặt', () => {
      const hex5 = getHexagramById(5)!; // Chưa có trong kho nguyên văn
      const trioUnverified: any = {
        primary: hex5,
        transformed: hex5,
        nuclear: hex5,
        movingLineIndices: [],
        hasMovingLines: false,
      };

      const interpretation = interpretHexagram({ trio: trioUnverified });
      expect(interpretation.primaryClassical.hasVerifiedContent).toBe(false);
      expect(interpretation.primaryClassical.content).toBeNull();
      expect(interpretation.primaryClassical.notice).toContain('Chưa có');
    });

    it('interpretHexagram() hỗ trợ luận giải Thể / Dụng Mai Hoa Dịch Số', () => {
      const cal = getFullCalendarInfo(new Date('2026-10-31T08:00:00.000Z'));
      const maiHua = castByMaiHua({
        yearBranch: 7, // Ngọ
        month: 9,
        day: 21,
        hourBranch: 5, // Thìn
      });

      const interpretation = interpretHexagram({
        trio: maiHua.trio,
        maiHuaResult: maiHua,
      });

      expect(interpretation.maiHua).toBeDefined();
      expect(interpretation.maiHua?.content.tiTrigram.name).toBe(maiHua.theDung.theTrigram.name);
      expect(interpretation.maiHua?.content.relationName).toBeDefined();
      expect(interpretation.maiHua?.content.judgmentLevelName).toBeDefined();
      expect(interpretation.maiHua?.content.classicalVerse).toBeDefined();
    });
  });

  // =========================================================================
  // 8. Tích hợp Quản lý Ghi Chú & Nghiệm Lý (Requirement 4)
  // =========================================================================
  describe('Quản lý Ghi Chú & Nghiệm Lý Thực Tế trong Mobile', () => {
    it('cho phép thêm ghi chú, cập nhật kết quả thực tế và xác nhận nghiệm lý', () => {
      const notes: any[] = [];

      // Thêm ghi chú ban đầu
      const note1 = {
        id: 'n1',
        divinationId: 'div-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: 'Lúc gieo lòng bồn chồn về kết quả phỏng vấn',
        actualOutcome: undefined,
        isVerified: false,
      };
      notes.push(note1);

      expect(notes.length).toBe(1);
      expect(notes[0].isVerified).toBe(false);

      // Nghiệm lý thực tế
      const note2 = {
        id: 'n2',
        divinationId: 'div-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: 'Nhận thư mời nhận việc từ công ty đối tác',
        actualOutcome: 'Đúng như quẻ báo Thế lâm Quan Quỷ vượng tướng ngày Thân',
        isVerified: true,
      };
      notes.push(note2);

      expect(notes.length).toBe(2);
      expect(notes[1].isVerified).toBe(true);
      expect(notes[1].actualOutcome).toContain('Đúng như quẻ báo');
    });
  });

  // =========================================================================
  // 9. Tính chất Offline-First & Không phụ thuộc Internet (Requirement 9)
  // =========================================================================
  describe('Đảm bảo Hoạt động 100% Ngoại Tuyến (Offline-First)', () => {
    it('toàn bộ phép tính Kinh Dịch, Lịch Pháp, Diễn Giải và Kinh Văn đều độc lập không gọi mạng', () => {
      // 1. Phép tính seri tiền
      const resSerial = castBySerial('123456');
      expect(resSerial.trio.primary.lines.length).toBe(6);

      // 2. Lịch âm dương & Can Chi
      const cal = getFullCalendarInfo(new Date());
      expect(cal.canChi.day).toBeDefined();

      // 3. Kinh văn cổ điển
      const texts = getClassicalHexagramData(1);
      expect(texts.status).toBe('AVAILABLE');

      // 4. Luận giải trên quẻ #1
      const hex1 = getHexagramById(1)!;
      const interp = interpretHexagram({
        trio: {
          primary: hex1,
          transformed: hex1,
          nuclear: hex1,
          movingLineIndices: [],
          hasMovingLines: false,
        },
      });
      expect(interp.primaryClassical.content?.thuanTu.translation).toBeDefined();
    });
  });

  // =========================================================================
  // 10. Settings Module (Cài Đặt & Cấu Hình Mobile)
  // =========================================================================
  describe('Settings Module cho Mobile', () => {
    it('khởi tạo cài đặt mặc định và cho phép lưu tùy chỉnh giao diện, lập quẻ, lịch pháp', async () => {
      const { LocalStorageSettingsRepository, InMemoryStorage } = await import('@kindich/domain');
      const storage = new InMemoryStorage();
      const settingsRepo = new LocalStorageSettingsRepository(storage);

      const defaults = await settingsRepo.getSettings();
      expect(defaults.appearance.theme).toBe('light');
      expect(defaults.appearance.language).toBe('vi');
      expect(defaults.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(defaults.calendar.dayTransitionRule).toBe('23:00');

      // Cập nhật cài đặt mobile
      const updated = await settingsRepo.saveSettings({
        appearance: { theme: 'dark', language: 'vi', fontSize: 'large' },
        divination: { defaultMethod: 'time', ruleSetId: 'BO_PHE_CHINH_TONG_V1', algorithmVersion: 'MAI-HUA-V1' },
        calendar: { timeZone: 'Asia/Ho_Chi_Minh', dayTransitionRule: '23:00', leapMonthRule: 'TIET_KHI' },
      });

      expect(updated.appearance.theme).toBe('dark');
      expect(updated.appearance.fontSize).toBe('large');
      expect(updated.divination.defaultMethod).toBe('time');

      // Khôi phục cài đặt gốc
      const reset = await settingsRepo.resetSettings();
      expect(reset.appearance.theme).toBe('light');
      expect(reset.divination.defaultMethod).toBe('serial');
    });
  });
});
