import { describe, it, expect } from 'vitest';
import { Element, TrigramCode } from '@kindich/domain';

import {
  analyzeInterYao,
  calculateYaoStrengths,
  detectThreeHarmonies,
  determineSeasonalStrength,
  SEASONAL_STRENGTH_NAMES,
  STRENGTH_LEVEL_NAMES,
  YAO_STRENGTH_RULE_VERSION,
} from './yao-strength.engine';

import {
  SeasonalStrength,
  StrengthLevel,
  VoidStatusType,
} from './yao-strength.types';

describe('Six Yao Strength Analysis Engine (Đánh Giá Vượng Suy Lục Hào)', () => {
  describe('1. Ngũ Vượng theo Mùa / Nguyệt Lệnh (Vượng, Tướng, Hưu, Tù, Tử)', () => {
    it('Mùa Xuân (Tháng Dần, Mão - Hành Mộc): Mộc vượng, Hỏa tướng, Thủy hưu, Kim tù, Thổ tử', () => {
      const monthElement = Element.MOC;

      expect(determineSeasonalStrength(Element.MOC, monthElement)).toBe(SeasonalStrength.VUONG);
      expect(determineSeasonalStrength(Element.HOA, monthElement)).toBe(SeasonalStrength.TUONG);
      expect(determineSeasonalStrength(Element.THUY, monthElement)).toBe(SeasonalStrength.HUU);
      expect(determineSeasonalStrength(Element.KIM, monthElement)).toBe(SeasonalStrength.TU);
      expect(determineSeasonalStrength(Element.THO, monthElement)).toBe(SeasonalStrength.TU_SI);
    });

    it('Mùa Hạ (Tháng Tỵ, Ngọ - Hành Hỏa): Hỏa vượng, Thổ tướng, Mộc hưu, Thủy tù, Kim tử', () => {
      const monthElement = Element.HOA;

      expect(determineSeasonalStrength(Element.HOA, monthElement)).toBe(SeasonalStrength.VUONG);
      expect(determineSeasonalStrength(Element.THO, monthElement)).toBe(SeasonalStrength.TUONG);
      expect(determineSeasonalStrength(Element.MOC, monthElement)).toBe(SeasonalStrength.HUU);
      expect(determineSeasonalStrength(Element.THUY, monthElement)).toBe(SeasonalStrength.TU);
      expect(determineSeasonalStrength(Element.KIM, monthElement)).toBe(SeasonalStrength.TU_SI);
    });

    it('Mùa Thu (Tháng Thân, Dậu - Hành Kim): Kim vượng, Thủy tướng, Thổ hưu, Hỏa tù, Mộc tử', () => {
      const monthElement = Element.KIM;

      expect(determineSeasonalStrength(Element.KIM, monthElement)).toBe(SeasonalStrength.VUONG);
      expect(determineSeasonalStrength(Element.THUY, monthElement)).toBe(SeasonalStrength.TUONG);
      expect(determineSeasonalStrength(Element.THO, monthElement)).toBe(SeasonalStrength.HUU);
      expect(determineSeasonalStrength(Element.HOA, monthElement)).toBe(SeasonalStrength.TU);
      expect(determineSeasonalStrength(Element.MOC, monthElement)).toBe(SeasonalStrength.TU_SI);
    });

    it('Mùa Đông (Tháng Hợi, Tý - Hành Thủy): Thủy vượng, Mộc tướng, Kim hưu, Thổ tù, Hỏa tử', () => {
      const monthElement = Element.THUY;

      expect(determineSeasonalStrength(Element.THUY, monthElement)).toBe(SeasonalStrength.VUONG);
      expect(determineSeasonalStrength(Element.MOC, monthElement)).toBe(SeasonalStrength.TUONG);
      expect(determineSeasonalStrength(Element.KIM, monthElement)).toBe(SeasonalStrength.HUU);
      expect(determineSeasonalStrength(Element.THO, monthElement)).toBe(SeasonalStrength.TU);
      expect(determineSeasonalStrength(Element.HOA, monthElement)).toBe(SeasonalStrength.TU_SI);
    });

    it('Tứ Quý (Tháng Thìn, Tuất, Sửu, Mùi - Hành Thổ): Thổ vượng, Kim tướng, Hỏa hưu, Mộc tù, Thủy tử', () => {
      const monthElement = Element.THO;

      expect(determineSeasonalStrength(Element.THO, monthElement)).toBe(SeasonalStrength.VUONG);
      expect(determineSeasonalStrength(Element.KIM, monthElement)).toBe(SeasonalStrength.TUONG);
      expect(determineSeasonalStrength(Element.HOA, monthElement)).toBe(SeasonalStrength.HUU);
      expect(determineSeasonalStrength(Element.MOC, monthElement)).toBe(SeasonalStrength.TU);
      expect(determineSeasonalStrength(Element.THUY, monthElement)).toBe(SeasonalStrength.TU_SI);
    });

    it('tên và mô tả Ngũ Vượng khớp chuẩn xác', () => {
      expect(SEASONAL_STRENGTH_NAMES[SeasonalStrength.VUONG].name).toBe('Vượng');
      expect(SEASONAL_STRENGTH_NAMES[SeasonalStrength.TUONG].name).toBe('Tướng');
      expect(SEASONAL_STRENGTH_NAMES[SeasonalStrength.HUU].name).toBe('Hưu');
      expect(SEASONAL_STRENGTH_NAMES[SeasonalStrength.TU].name).toBe('Tù');
      expect(SEASONAL_STRENGTH_NAMES[SeasonalStrength.TU_SI].name).toBe('Tử');
    });
  });

  describe('2. Phân tích quan hệ sinh, khắc, xung, hợp giữa các Hào trong quẻ', () => {
    it('xác định quan hệ sinh giữa 2 hào', () => {
      const line1 = { position: 1 as const, branch: 'Tý', element: Element.THUY };
      const line2 = { position: 2 as const, branch: 'Dần', element: Element.MOC };

      const rel = analyzeInterYao(line1, line2);
      expect(rel.elementRelation).toBe('SINH');
      expect(rel.isHarmonious).toBe(false);
      expect(rel.isClash).toBe(false);
      expect(rel.description).toContain('sinh Hào 2');
    });

    it('xác định quan hệ khắc và lục xung giữa 2 hào', () => {
      const line1 = { position: 1 as const, branch: 'Tý', element: Element.THUY };
      const line4 = { position: 4 as const, branch: 'Ngọ', element: Element.HOA };

      const rel = analyzeInterYao(line1, line4);
      expect(rel.elementRelation).toBe('KHAC');
      expect(rel.isClash).toBe(true);
      expect(rel.description).toContain('khắc Hào 4');
      expect(rel.description).toContain('Lục Xung');
    });

    it('xác định quan hệ lục hợp giữa 2 hào', () => {
      const line1 = { position: 1 as const, branch: 'Tý', element: Element.THUY };
      const line2 = { position: 2 as const, branch: 'Sửu', element: Element.THO };

      const rel = analyzeInterYao(line1, line2);
      expect(rel.isHarmonious).toBe(true);
      expect(rel.description).toContain('Lục Hợp');
    });
  });

  describe('3. Phát hiện Tam Hợp Cục trong 6 hào', () => {
    it('phát hiện Thân Tý Thìn hợp Thủy cục hoàn chỉnh', () => {
      const lines = [
        { position: 1 as const, branch: 'Tý' },
        { position: 2 as const, branch: 'Mão' },
        { position: 3 as const, branch: 'Thìn' },
        { position: 4 as const, branch: 'Tỵ' },
        { position: 5 as const, branch: 'Thân' },
        { position: 6 as const, branch: 'Hợi' },
      ];

      const harmonies = detectThreeHarmonies(lines);
      expect(harmonies).toHaveLength(1);
      expect(harmonies[0]?.name).toBe('Thân Tý Thìn hợp Thủy cục');
      expect(harmonies[0]?.element).toBe(Element.THUY);
      expect(harmonies[0]?.linePositions).toEqual([1, 3, 5]);
      expect(harmonies[0]?.isComplete).toBe(true);
    });

    it('phát hiện Hợi Mão Mùi hợp Mộc cục', () => {
      const lines = [
        { position: 1 as const, branch: 'Mùi' },
        { position: 2 as const, branch: 'Dần' },
        { position: 3 as const, branch: 'Mão' },
        { position: 4 as const, branch: 'Thìn' },
        { position: 5 as const, branch: 'Hợi' },
        { position: 6 as const, branch: 'Tuất' },
      ];

      const harmonies = detectThreeHarmonies(lines);
      expect(harmonies).toHaveLength(1);
      expect(harmonies[0]?.name).toBe('Hợi Mão Mùi hợp Mộc cục');
      expect(harmonies[0]?.element).toBe(Element.MOC);
      expect(harmonies[0]?.linePositions).toEqual([1, 3, 5]);
      expect(harmonies[0]?.isComplete).toBe(true);
    });

    it('không phát hiện nếu thiếu 1 chi trong tam hợp', () => {
      const lines = [
        { position: 1 as const, branch: 'Tý' },
        { position: 2 as const, branch: 'Dần' },
        { position: 3 as const, branch: 'Thìn' },
        { position: 4 as const, branch: 'Tỵ' },
        { position: 5 as const, branch: 'Dậu' }, // Thiếu Thân
        { position: 6 as const, branch: 'Hợi' },
      ];

      const harmonies = detectThreeHarmonies(lines);
      expect(harmonies).toHaveLength(0);
    });
  });

  describe('4. Động cơ calculateYaoStrengths và các trạng thái đặc thù', () => {
    it('phân biệt Ám Động vs Nhật Phá khi gặp Nhật Xung', () => {
      // Tháng Dần (Mộc vượng):
      // - Hào Hỏa (Dần sinh Hỏa -> Tướng hữu lực), gặp Nhật Thần Tý (Thủy khắc Hỏa) hoặc Nhật Tý xung Ngọ Hỏa
      // Xét quẻ có hào 4 Ngọ Hỏa, tháng Dần (Mộc sinh Hỏa = Tướng), ngày Tý (Tý Ngọ tương xung):
      // -> Hào Ngọ Hỏa đắc Tướng ở tháng Dần, gặp Nhật Tý xung -> ÁM ĐỘNG!
      const result = calculateYaoStrengths({
        monthCanChi: 'Mậu Dần', // Tháng Mộc
        dayCanChi: 'Canh Tý',   // Ngày Tý (xung Ngọ)
        lowerTrigramCode: TrigramCode.CAN, // Càn nội: Tý (1), Dần (2), Thìn (3)
        upperTrigramCode: TrigramCode.CAN, // Càn ngoại: Ngọ (4), Thân (5), Tuất (6)
      });

      const haoNgo = result.lines[3]; // Hào 4 Ngọ Hỏa
      expect(haoNgo.branch).toBe('Ngọ');
      expect(haoNgo.seasonalState.state).toBe(SeasonalStrength.TUONG); // Dần Mộc sinh Ngọ Hỏa
      expect(haoNgo.specialStates.isAmDong).toBe(true);
      expect(haoNgo.specialStates.isNhatPha).toBe(false);

      // Ngược lại, xét hào Thân Kim (Hào 5):
      // Ở tháng Dần (Mộc), Thân Kim khắc Dần Mộc -> TÙ (tiêu hao lực),
      // Lại bị Nguyệt Kiến Dần tương xung (Dần Thân tương xung) -> Nguyệt Phá = true!
      const haoThan = result.lines[4]; // Hào 5 Thân Kim
      expect(haoThan.branch).toBe('Thân');
      expect(haoThan.seasonalState.state).toBe(SeasonalStrength.TU);
      expect(haoThan.specialStates.isMonthlyBreak).toBe(true);
    });

    it('phân biệt Giả Không vs Chân Không', () => {
      // Ngày Giáp Tý: Tuần Giáp Tý -> Không Vong: Tuất, Hợi.
      // Quẻ Thuần Càn có Hào 6 là Tuất Thổ rơi vào Không Vong.
      // - Trường hợp 1: Tháng Tỵ (Hỏa) sinh Tuất Thổ -> Tuất đắc TƯỚNG -> Giả Không!
      const resGiaKhong = calculateYaoStrengths({
        dayCanChi: 'Giáp Tý',   // Tuần Giáp Tý -> Tuất Không Vong
        monthCanChi: 'Đinh Tỵ', // Tháng Tỵ Hỏa sinh Tuất Thổ
        lowerTrigramCode: TrigramCode.CAN,
        upperTrigramCode: TrigramCode.CAN,
      });

      const haoTuatGia = resGiaKhong.lines[5]; // Hào 6 Tuất Thổ
      expect(haoTuatGia.specialStates.isVoid).toBe(true);
      expect(haoTuatGia.specialStates.voidType).toBe(VoidStatusType.GIA_KHONG);

      // - Trường hợp 2: Tháng Dần (Mộc khắc Thổ) -> Tuất Thổ bị Nguyệt khắc (TỬ),
      // lại ngày Giáp Dần (Dần Mộc khắc Thổ) -> Chân Không!
      const resChanKhong = calculateYaoStrengths({
        dayCanChi: 'Giáp Dần', // Tuần Giáp Dần -> Tý, Sửu Không Vong
        monthCanChi: 'Mậu Dần', // Tháng Mộc
        lines: [
          { position: 1, branch: 'Sửu', element: Element.THO }, // Sửu Thổ rơi vào Không Vong, bị Dần Mộc khắc (Tử)
          { position: 2, branch: 'Mão', element: Element.MOC },
          { position: 3, branch: 'Tỵ', element: Element.HOA },
          { position: 4, branch: 'Mùi', element: Element.THO },
          { position: 5, branch: 'Dậu', element: Element.KIM },
          { position: 6, branch: 'Hợi', element: Element.THUY },
        ],
      });

      const haoSsuChan = resChanKhong.lines[0]; // Hào 1 Sửu Thổ
      expect(haoSsuChan.specialStates.isVoid).toBe(true);
      expect(haoSsuChan.specialStates.voidType).toBe(VoidStatusType.CHAN_KHONG);
    });

    it('nhận diện Nguyệt Hợp và Nhật Hợp', () => {
      // Ngày Thân, Tháng Tuất.
      // Hào Tỵ: Tỵ Thân hợp Thủy -> Nhật Hợp!
      // Hào Mão: Mão Tuất hợp Hỏa -> Nguyệt Hợp!
      const result = calculateYaoStrengths({
        dayCanChi: 'Mậu Thân',
        monthCanChi: 'Canh Tuất',
        lines: [
          { position: 1, branch: 'Tỵ', element: Element.HOA },  // Hợp Thân (Nhật Hợp)
          { position: 2, branch: 'Mão', element: Element.MOC }, // Hợp Tuất (Nguyệt Hợp)
          { position: 3, branch: 'Ngọ', element: Element.HOA },
          { position: 4, branch: 'Thìn', element: Element.THO },
          { position: 5, branch: 'Tý', element: Element.THUY },
          { position: 6, branch: 'Dần', element: Element.MOC },
        ],
      });

      expect(result.lines[0]?.specialStates.isNhatHop).toBe(true);
      expect(result.lines[1]?.specialStates.isNguyetHop).toBe(true);
    });

    it('tính toán điểm lực lượng đa chiều và diễn giải nguyên nhân rõ ràng', () => {
      const result = calculateYaoStrengths({
        dayCanChi: 'Giáp Tý',
        monthCanChi: 'Bính Thân',
        lowerTrigramCode: TrigramCode.CAN,
        upperTrigramCode: TrigramCode.CAN,
      });

      expect(result.ruleVersion).toBe(YAO_STRENGTH_RULE_VERSION);
      expect(result.lines).toHaveLength(6);

      for (const line of result.lines) {
        expect(line.factors.length).toBeGreaterThan(0);
        expect(typeof line.score).toBe('number');
        expect(Object.values(StrengthLevel)).toContain(line.overallLevel);
        expect(STRENGTH_LEVEL_NAMES[line.overallLevel]).toBe(line.overallLevelName);
        expect(line.reasoning).toBeTruthy();
        expect(line.reasoning).toContain(`Hào ${line.position}`);
      }

      // Kiểm tra tóm lược tương quan lực lượng tổng thể
      expect(result.summary.dominantElement).toBeDefined();
      expect(result.summary.strongestLinePosition).toBeGreaterThanOrEqual(1);
      expect(result.summary.strongestLinePosition).toBeLessThanOrEqual(6);
      expect(result.summary.weakestLinePosition).toBeGreaterThanOrEqual(1);
      expect(result.summary.weakestLinePosition).toBeLessThanOrEqual(6);
      expect(result.summary.summaryText).toBeTruthy();
    });

    it('báo lỗi khi thiếu tham số cần thiết', () => {
      // @ts-expect-error kiểm tra thiếu tham số
      expect(() => calculateYaoStrengths({})).toThrow();
      expect(() =>
        calculateYaoStrengths({
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Thân',
          lines: [{ position: 1, branch: 'Tý' }], // Thiếu đủ 6 hào
        })
      ).toThrow();
    });
  });
});
