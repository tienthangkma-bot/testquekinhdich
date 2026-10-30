import { describe, expect, it } from 'vitest';
import {
  Element,
  GenerationStage,
  PalaceId,
  SixRelation,
  SixSpirit,
  TrigramCode,
} from '@kindich/domain';

import {
  orchestrateSixYaoAnalysis,
  SIX_YAO_OBJECTIVE_DISCLAIMER,
  SIX_YAO_ORCHESTRATOR_VERSION,
  SIX_YAO_PROVENANCE_SOURCES,
} from './six-yao.orchestrator';

describe('Six Yao Analysis Orchestrator (Bộ Điều Phối Lục Hào Toàn Diện)', () => {
  describe('1. Xử lý Quẻ Tĩnh (Static Hexagram - Không có hào động)', () => {
    it('phân tích đầy đủ 6 hào của quẻ Thuần Càn trong trạng thái tĩnh', () => {
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1, // Thuần Càn
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Mậu Thìn',
        },
      });

      // 1. Kiểm tra cờ tĩnh và quẻ biến
      expect(result.isStatic).toBe(true);
      expect(result.changingHexagram).toBeNull();
      expect(result.movingLines).toHaveLength(0);

      // 2. Kiểm tra thông tin Bát Cung Quẻ Chủ
      expect(result.primaryHexagram.hexagramNumber).toBe(1);
      expect(result.primaryHexagram.hexagramId).toBe('HEX_01');
      expect(result.primaryHexagram.name).toBe('Thuần Càn');
      expect(result.primaryHexagram.palace.id).toBe(PalaceId.CAN);
      expect(result.primaryHexagram.palace.element).toBe(Element.KIM);
      expect(result.primaryHexagram.palace.generationStage).toBe(
        GenerationStage.BAN_CUNG
      );
      expect(result.primaryHexagram.palace.worldLine).toBe(6);
      expect(result.primaryHexagram.palace.responseLine).toBe(3);

      // 3. Kiểm tra thông tin 6 hào từ dưới lên (Hào 1 đến Hào 6)
      const lines = result.primaryHexagram.lines;
      expect(lines).toHaveLength(6);

      // Hào 1: Giáp Tý Thủy (Tử Tôn), Thanh Long, hào Ứng=false, hào Thế=false
      expect(lines[0]!.position).toBe(1);
      expect(lines[0]!.branch).toBe('Tý');
      expect(lines[0]!.element).toBe(Element.THUY);
      expect(lines[0]!.sixRelation).toBe(SixRelation.TU_TON);
      expect(lines[0]!.sixRelationName).toBe('Tử Tôn');
      expect(lines[0]!.sixSpirit).toBe(SixSpirit.THANH_LONG);
      expect(lines[0]!.isWorld).toBe(false);
      expect(lines[0]!.isResponse).toBe(false);
      expect(lines[0]!.isMoving).toBe(false);

      // Hào 2: Giáp Dần Mộc (Thê Tài), Chu Tước
      expect(lines[1]!.position).toBe(2);
      expect(lines[1]!.branch).toBe('Dần');
      expect(lines[1]!.element).toBe(Element.MOC);
      expect(lines[1]!.sixRelation).toBe(SixRelation.THE_TAI);
      expect(lines[1]!.sixSpirit).toBe(SixSpirit.CHU_TUOC);

      // Hào 3: Giáp Thìn Thổ (Phụ Mẫu), Câu Trần, Hào ỨNG
      expect(lines[2]!.position).toBe(3);
      expect(lines[2]!.branch).toBe('Thìn');
      expect(lines[2]!.element).toBe(Element.THO);
      expect(lines[2]!.sixRelation).toBe(SixRelation.PHU_MAU);
      expect(lines[2]!.sixSpirit).toBe(SixSpirit.CAU_TRAN);
      expect(lines[2]!.isResponse).toBe(true);
      expect(lines[2]!.isWorld).toBe(false);

      // Hào 4: Nhâm Ngọ Hỏa (Quan Quỷ), Đằng Xà
      expect(lines[3]!.position).toBe(4);
      expect(lines[3]!.branch).toBe('Ngọ');
      expect(lines[3]!.element).toBe(Element.HOA);
      expect(lines[3]!.sixRelation).toBe(SixRelation.QUAN_QUY);
      expect(lines[3]!.sixSpirit).toBe(SixSpirit.DANG_XA);

      // Hào 5: Nhâm Thân Kim (Huynh Đệ), Bạch Hổ
      expect(lines[4]!.position).toBe(5);
      expect(lines[4]!.branch).toBe('Thân');
      expect(lines[4]!.element).toBe(Element.KIM);
      expect(lines[4]!.sixRelation).toBe(SixRelation.HUYNH_DE);
      expect(lines[4]!.sixSpirit).toBe(SixSpirit.BACH_HO);

      // Hào 6: Nhâm Tuất Thổ (Phụ Mẫu), Huyền Vũ, Hào THẾ
      expect(lines[5]!.position).toBe(6);
      expect(lines[5]!.branch).toBe('Tuất');
      expect(lines[5]!.element).toBe(Element.THO);
      expect(lines[5]!.sixRelation).toBe(SixRelation.PHU_MAU);
      expect(lines[5]!.sixSpirit).toBe(SixSpirit.HUYEN_VU);
      expect(lines[5]!.isWorld).toBe(true);
      expect(lines[5]!.isResponse).toBe(false);

      // 4. Kiểm tra Lịch Pháp của ngày Giáp Tý, tháng Bính Dần
      // Ngày Giáp Tý: Tuần Không là Tuất và Hợi
      expect(result.dateTime.dayMaster.voidBranches).toEqual(['Tuất', 'Hợi']);
      expect(lines[5]!.calendar.isVoid).toBe(true); // Hào 6 Tuất Thổ phạm Tuần Không
      expect(lines[0]!.calendar.isVoid).toBe(false);

      // Tháng Dần: Nguyệt Phá là Thân (Dần Thân tương xung)
      expect(result.dateTime.monthCommander.monthlyBreakBranch).toBe('Thân');
      expect(lines[4]!.calendar.isMonthlyBreak).toBe(true); // Hào 5 Thân Kim phạm Nguyệt Phá
      expect(lines[1]!.calendar.isMonthlyBreak).toBe(false);

      // 5. Kiểm tra Tóm lược khách quan
      expect(result.summary.worldLinePosition).toBe(6);
      expect(result.summary.responseLinePosition).toBe(3);
      expect(result.summary.movingLineCount).toBe(0);
      expect(result.summary.objectiveOverview).toContain('Quẻ Tĩnh');
    });
  });

  describe('2. Phân biệt Quẻ Chủ và Quẻ Biến, phân tích Hào Biến', () => {
    it('phát hiện đúng Hồi Đầu Khắc và Hồi Đầu Hợp khi Hào 1 Quẻ Càn động biến Quẻ Cấu', () => {
      // Quẻ 1 (Thuần Càn), động hào 1 -> biến Quẻ 44 (Thiên Phong Cấu)
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        movingLineIndices: [1],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Mậu Thân',
        },
      });

      expect(result.isStatic).toBe(false);
      expect(result.movingLines).toHaveLength(1);
      expect(result.changingHexagram).not.toBeNull();
      expect(result.changingHexagram?.hexagramNumber).toBe(44);
      expect(result.changingHexagram?.name).toBe('Thiên Phong Cấu');

      // Hào 1 Quẻ Chủ: Động hào
      const hao1Primary = result.primaryHexagram.lines[0]!;
      expect(hao1Primary.isMoving).toBe(true);
      expect(hao1Primary.branch).toBe('Tý');
      expect(hao1Primary.element).toBe(Element.THUY);
      expect(hao1Primary.sixRelation).toBe(SixRelation.TU_TON);
      expect(hao1Primary.changingLine).toBeDefined();

      // Chi tiết Hào Biến tại vị trí 1
      const changedLine = hao1Primary.changingLine!;
      expect(changedLine.position).toBe(1);
      expect(changedLine.branch).toBe('Sửu');
      expect(changedLine.element).toBe(Element.THO);
      // Quy tắc Cốt Lõi: Lục Thân của Hào Biến lấy theo Cung Quẻ Chủ (Càn Kim): Thổ sinh Kim -> Phụ Mẫu!
      expect(changedLine.sixRelation).toBe(SixRelation.PHU_MAU);
      expect(changedLine.sixRelationName).toBe('Phụ Mẫu');

      // Tương tác: Tý Thủy gặp Sửu Thổ
      // - Sửu Thổ khắc Tý Thủy -> Hồi Đầu Khắc!
      // - Tý Sửu lục hợp -> Hồi Đầu Hợp!
      const interaction = changedLine.interaction;
      expect(interaction.isHoiDauKhac).toBe(true);
      expect(interaction.isHoiDauHop).toBe(true);
      expect(interaction.tags).toContain('Hồi Đầu Khắc');
      expect(interaction.tags).toContain('Hồi Đầu Hợp');
      expect(interaction.description).toContain('Hồi Đầu Khắc Hợp');
    });

    it('phát hiện Hồi Đầu Sinh khi Hào 5 Quẻ Càn (Thân Kim) động biến Quẻ Đại Hữu (Mùi Thổ)', () => {
      // Quẻ 1 (Thuần Càn), động hào 5 -> biến Quẻ 14 (Hỏa Thiên Đại Hữu)
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        movingLineIndices: [5],
        dateTime: {
          dayCanChi: 'Ất Sửu',
          monthCanChi: 'Kỷ Tỵ',
        },
      });

      expect(result.changingHexagram?.hexagramNumber).toBe(14);
      expect(result.changingHexagram?.name).toBe('Hỏa Thiên Đại Hữu');

      const hao5 = result.primaryHexagram.lines[4]!;
      expect(hao5.branch).toBe('Thân');
      expect(hao5.element).toBe(Element.KIM);

      const changed5 = hao5.changingLine!;
      expect(changed5.branch).toBe('Mùi');
      expect(changed5.element).toBe(Element.THO);

      // Thân Kim động biến Mùi Thổ: Mùi Thổ sinh Thân Kim -> HỒI ĐẦU SINH!
      const interaction = changed5.interaction;
      expect(interaction.isHoiDauSinh).toBe(true);
      expect(interaction.tags).toContain('Hồi Đầu Sinh');
      expect(interaction.description).toContain('Hồi Đầu Sinh');
    });

    it('phát hiện Hóa Thoái Thần khi Hào 6 Quẻ Càn (Tuất Thổ) động biến Quẻ Quải (Mùi Thổ)', () => {
      // Quẻ 1 (Thuần Càn), động hào 6 -> biến Quẻ 43 (Trạch Thiên Quải)
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        movingLineIndices: [6],
        dateTime: {
          dayCanChi: 'Bính Dần',
          monthCanChi: 'Canh Thân',
        },
      });

      expect(result.changingHexagram?.hexagramNumber).toBe(43);
      expect(result.changingHexagram?.name).toBe('Trạch Thiên Quải');

      const hao6 = result.primaryHexagram.lines[5]!;
      expect(hao6.branch).toBe('Tuất');
      expect(hao6.element).toBe(Element.THO);

      const changed6 = hao6.changingLine!;
      expect(changed6.branch).toBe('Mùi');
      expect(changed6.element).toBe(Element.THO);

      // Tuất Thổ hóa Mùi Thổ: Hóa Thoái Thần!
      const interaction = changed6.interaction;
      expect(interaction.isThoaiThan).toBe(true);
      expect(interaction.tags).toContain('Hóa Thoái Thần');
      expect(interaction.description).toContain('Hóa Thoái Thần');
    });
  });

  describe('3. Quy tắc Lục Thân Quẻ Biến y theo Cung Quẻ Chủ', () => {
    it('tính đúng Lục Thân cho Quẻ Biến theo Cung Quẻ Chủ kể cả khi Quẻ Biến thuộc Cung khác', () => {
      // Quẻ Thuần Càn (Cung Càn - Kim)
      // Động hào 1 và hào 2: [0, 0, 1, 1, 1, 1] -> Quẻ Thiên Lôi Vô Vọng (HEX_25)
      // Quẻ Vô Vọng thuộc Cung Tốn (Mộc)!
      // Nhưng Lục Thân của Quẻ Biến PHẢI tính theo CUNG CÀN (KIM):
      // - Hào 1 Vô Vọng: Tý Thủy -> theo Càn Kim là TỬ TÔN (Kim sinh Thủy).
      // - Hào 2 Vô Vọng: Dần Mộc -> theo Càn Kim là THÊ TÀI (Kim khắc Mộc).
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1, // Thuần Càn
        changingHexagram: 25, // Thiên Lôi Vô Vọng
        dateTime: {
          dayCanChi: 'Canh Ngọ',
          monthCanChi: 'Tân Dậu',
        },
      });

      expect(result.primaryHexagram.palace.id).toBe(PalaceId.CAN);
      expect(result.changingHexagram?.hexagramNumber).toBe(25);
      expect(result.changingHexagram?.palace.id).toBe(PalaceId.TON); // Cung gốc của Vô Vọng là Tốn

      // Hào 1 của Quẻ Biến Vô Vọng: Tý Thủy
      const hao1Changing = result.changingHexagram!.lines[0]!;
      expect(hao1Changing.branch).toBe('Tý');
      expect(hao1Changing.element).toBe(Element.THUY);
      // Nếu theo Cung Tốn (Mộc) thì Thủy sinh Mộc sẽ là Phụ Mẫu.
      // Nhưng theo chuẩn Lục Hào (Cung Càn Kim) thì Kim sinh Thủy -> PHẢI LÀ TỬ TÔN!
      expect(hao1Changing.sixRelation).toBe(SixRelation.TU_TON);
      expect(hao1Changing.sixRelationName).toBe('Tử Tôn');

      // Hào 2 của Quẻ Biến Vô Vọng: Dần Mộc
      const hao2Changing = result.changingHexagram!.lines[1]!;
      expect(hao2Changing.branch).toBe('Dần');
      expect(hao2Changing.element).toBe(Element.MOC);
      // Theo Cung Càn Kim: Kim khắc Mộc -> PHẢI LÀ THÊ TÀI!
      expect(hao2Changing.sixRelation).toBe(SixRelation.THE_TAI);
      expect(hao2Changing.sixRelationName).toBe('Thê Tài');
    });
  });

  describe('4. Tích hợp Calendar Engine với Date / DateTimeInput thực tế', () => {
    it('chuyển đổi và phân giải tự động từ đối tượng Date chuẩn ISO', () => {
      // 10:30 ngày 30 tháng 10 năm 2026
      const testDate = new Date('2026-10-30T10:30:00+07:00');

      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 'HEX_01',
        dateTime: testDate,
      });

      expect(result.dateTime.solarDate).toBeDefined();
      expect(result.dateTime.solarDate?.year).toBe(2026);
      expect(result.dateTime.solarDate?.month).toBe(10);
      expect(result.dateTime.solarDate?.day).toBe(30);

      expect(result.dateTime.lunarDate).toBeDefined();
      expect(result.dateTime.canChi.day).toBeDefined();
      expect(result.dateTime.canChi.month).toBeDefined();
      expect(result.dateTime.dayMaster.branch).toBeDefined();
      expect(result.dateTime.monthCommander.branch).toBeDefined();
    });
  });

  describe('5. Tính linh hoạt của định dạng đầu vào Quẻ', () => {
    it('hỗ trợ nhập theo cặp Thượng quái và Hạ quái', () => {
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: {
          upperTrigramCode: TrigramCode.CAN,
          lowerTrigramCode: TrigramCode.KHAM,
        }, // Thiên Thủy Tụng (HEX_06)
        dateTime: {
          dayCanChi: 'Giáp Dần',
          monthCanChi: 'Mậu Thân',
        },
      });

      expect(result.primaryHexagram.hexagramNumber).toBe(6);
      expect(result.primaryHexagram.name).toBe('Thiên Thủy Tụng');
    });

    it('hỗ trợ nhập theo tên tiếng Việt có dấu của quẻ', () => {
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 'Địa Thiên Thái',
        dateTime: {
          dayCanChi: 'Giáp Dần',
          monthCanChi: 'Mậu Thân',
        },
      });

      expect(result.primaryHexagram.hexagramNumber).toBe(11);
      expect(result.primaryHexagram.name).toBe('Địa Thiên Thái');
    });
  });

  describe('6. Kiểm chứng Nguồn gốc (Provenance), Quy chuẩn & Tuân thủ Disclaimer', () => {
    it('lưu trữ đầy đủ Algorithm Version, RuleSet ID và các trích dẫn chuẩn', () => {
      const result = orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        ruleSetId: 'CUSTOM-SIX-YAO-V1',
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
        },
      });

      expect(result.algorithmVersion).toBe(SIX_YAO_ORCHESTRATOR_VERSION);
      expect(result.ruleSetId).toBe('CUSTOM-SIX-YAO-V1');
      expect(result.analyzedAt).toBeDefined();

      // Kiểm tra danh mục nguồn đối chiếu
      expect(result.sourceReferences.baGong).toBe(
        SIX_YAO_PROVENANCE_SOURCES.baGong
      );
      expect(result.sourceReferences.sixRelations).toBe(
        SIX_YAO_PROVENANCE_SOURCES.sixRelations
      );
      expect(result.sourceReferences.changingSixRelations).toBe(
        SIX_YAO_PROVENANCE_SOURCES.changingSixRelations
      );
      expect(result.sourceReferences.yaoStrength).toBe(
        SIX_YAO_PROVENANCE_SOURCES.yaoStrength
      );

      // Kiểm tra tuyên bố từ chối kết luận cát/hung tùy tiện
      expect(result.disclaimer).toBe(SIX_YAO_OBJECTIVE_DISCLAIMER);
      expect(result.summary.objectiveOverview).toBeDefined();
    });
  });
});
