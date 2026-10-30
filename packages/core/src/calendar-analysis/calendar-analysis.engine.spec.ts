import { describe, it, expect } from 'vitest';
import { Element, TrigramCode } from '@kindich/domain';

import {
  analyzeCalendar,
  calculateVoidBranches,
  CLASH_MAP,
  determineOfficerElementRelation,
  getClashingBranch,
  getMonthlyBreakBranch,
  HARMONY_MAP,
  isBranchClash,
  isBranchHarmony,
  parseCanChiString,
  VALID_BRANCHES,
  VALID_STEMS,
} from './calendar-analysis.engine';
import { ElementRelationType } from './calendar-analysis.types';

describe('Calendar Analysis Engine (Phân Tích Lịch Pháp Lục Hào)', () => {
  describe('1. Xác định Tuần Không (Không Vong) theo 6 Tuần Giáp', () => {
    it('đủ 10 Thiên Can và 12 Địa Chi hợp lệ', () => {
      expect(VALID_STEMS).toHaveLength(10);
      expect(VALID_BRANCHES).toHaveLength(12);
    });

    it('Tuần Giáp Tý -> Không Vong: Tuất, Hợi', () => {
      // Đầu tuần
      const r1 = calculateVoidBranches('Giáp', 'Tý');
      expect(r1.weekCycle).toBe('Tuần Giáp Tý');
      expect(r1.voidBranches).toEqual(['Tuất', 'Hợi']);

      // Giữa tuần
      const r2 = calculateVoidBranches('Bính', 'Dần');
      expect(r2.weekCycle).toBe('Tuần Giáp Tý');
      expect(r2.voidBranches).toEqual(['Tuất', 'Hợi']);

      // Cuối tuần
      const r3 = calculateVoidBranches('Quý', 'Dậu');
      expect(r3.weekCycle).toBe('Tuần Giáp Tý');
      expect(r3.voidBranches).toEqual(['Tuất', 'Hợi']);
    });

    it('Tuần Giáp Tuất -> Không Vong: Thân, Dậu', () => {
      const r1 = calculateVoidBranches('Giáp', 'Tuất');
      expect(r1.weekCycle).toBe('Tuần Giáp Tuất');
      expect(r1.voidBranches).toEqual(['Thân', 'Dậu']);

      const r2 = calculateVoidBranches('Bính', 'Tý');
      expect(r2.weekCycle).toBe('Tuần Giáp Tuất');
      expect(r2.voidBranches).toEqual(['Thân', 'Dậu']);

      const r3 = calculateVoidBranches('Quý', 'Mùi');
      expect(r3.weekCycle).toBe('Tuần Giáp Tuất');
      expect(r3.voidBranches).toEqual(['Thân', 'Dậu']);
    });

    it('Tuần Giáp Thân -> Không Vong: Ngọ, Mùi', () => {
      const r1 = calculateVoidBranches('Giáp', 'Thân');
      expect(r1.weekCycle).toBe('Tuần Giáp Thân');
      expect(r1.voidBranches).toEqual(['Ngọ', 'Mùi']);

      const r2 = calculateVoidBranches('Mậu', 'Tý');
      expect(r2.weekCycle).toBe('Tuần Giáp Thân');
      expect(r2.voidBranches).toEqual(['Ngọ', 'Mùi']);

      const r3 = calculateVoidBranches('Quý', 'Tỵ');
      expect(r3.weekCycle).toBe('Tuần Giáp Thân');
      expect(r3.voidBranches).toEqual(['Ngọ', 'Mùi']);
    });

    it('Tuần Giáp Ngọ -> Không Vong: Thìn, Tỵ', () => {
      const r1 = calculateVoidBranches('Giáp', 'Ngọ');
      expect(r1.weekCycle).toBe('Tuần Giáp Ngọ');
      expect(r1.voidBranches).toEqual(['Thìn', 'Tỵ']);

      const r2 = calculateVoidBranches('Canh', 'Tý');
      expect(r2.weekCycle).toBe('Tuần Giáp Ngọ');
      expect(r2.voidBranches).toEqual(['Thìn', 'Tỵ']);

      const r3 = calculateVoidBranches('Quý', 'Mão');
      expect(r3.weekCycle).toBe('Tuần Giáp Ngọ');
      expect(r3.voidBranches).toEqual(['Thìn', 'Tỵ']);
    });

    it('Tuần Giáp Thìn -> Không Vong: Dần, Mão', () => {
      const r1 = calculateVoidBranches('Giáp', 'Thìn');
      expect(r1.weekCycle).toBe('Tuần Giáp Thìn');
      expect(r1.voidBranches).toEqual(['Dần', 'Mão']);

      const r2 = calculateVoidBranches('Bính', 'Ngọ');
      expect(r2.weekCycle).toBe('Tuần Giáp Thìn');
      expect(r2.voidBranches).toEqual(['Dần', 'Mão']);

      const r3 = calculateVoidBranches('Quý', 'Sửu');
      expect(r3.weekCycle).toBe('Tuần Giáp Thìn');
      expect(r3.voidBranches).toEqual(['Dần', 'Mão']);
    });

    it('Tuần Giáp Dần -> Không Vong: Tý, Sửu', () => {
      const r1 = calculateVoidBranches('Giáp', 'Dần');
      expect(r1.weekCycle).toBe('Tuần Giáp Dần');
      expect(r1.voidBranches).toEqual(['Tý', 'Sửu']);

      const r2 = calculateVoidBranches('Mậu', 'Ngọ');
      expect(r2.weekCycle).toBe('Tuần Giáp Dần');
      expect(r2.voidBranches).toEqual(['Tý', 'Sửu']);

      const r3 = calculateVoidBranches('Quý', 'Hợi');
      expect(r3.weekCycle).toBe('Tuần Giáp Dần');
      expect(r3.voidBranches).toEqual(['Tý', 'Sửu']);
    });

    it('báo lỗi khi truyền Thiên Can hoặc Địa Chi không hợp lệ vào calculateVoidBranches', () => {
      expect(() => calculateVoidBranches('SaiCan', 'Tý')).toThrow();
      expect(() => calculateVoidBranches('Giáp', 'SaiChi')).toThrow();
    });
  });

  describe('2. Xác định Nguyệt Phá theo 12 tháng', () => {
    it('đối chiếu chính xác 12 tháng với chi bị Nguyệt Phá', () => {
      expect(getMonthlyBreakBranch('Tý')).toBe('Ngọ');
      expect(getMonthlyBreakBranch('Sửu')).toBe('Mùi');
      expect(getMonthlyBreakBranch('Dần')).toBe('Thân');
      expect(getMonthlyBreakBranch('Mão')).toBe('Dậu');
      expect(getMonthlyBreakBranch('Thìn')).toBe('Tuất');
      expect(getMonthlyBreakBranch('Tỵ')).toBe('Hợi');
      expect(getMonthlyBreakBranch('Ngọ')).toBe('Tý');
      expect(getMonthlyBreakBranch('Mùi')).toBe('Sửu');
      expect(getMonthlyBreakBranch('Thân')).toBe('Dần');
      expect(getMonthlyBreakBranch('Dậu')).toBe('Mão');
      expect(getMonthlyBreakBranch('Tuất')).toBe('Thìn');
      expect(getMonthlyBreakBranch('Hợi')).toBe('Tỵ');
    });

    it('báo lỗi khi tra cứu chi không hợp lệ', () => {
      expect(() => getClashingBranch('UNKNOWN')).toThrow();
    });
  });

  describe('3. Quan hệ Lục Hợp & Lục Xung giữa các Địa Chi', () => {
    it('kiểm tra tính đối xứng của 6 cặp Lục Xung', () => {
      const pairs: [string, string][] = [
        ['Tý', 'Ngọ'],
        ['Sửu', 'Mùi'],
        ['Dần', 'Thân'],
        ['Mão', 'Dậu'],
        ['Thìn', 'Tuất'],
        ['Tỵ', 'Hợi'],
      ];

      for (const [b1, b2] of pairs) {
        expect(isBranchClash(b1, b2)).toBe(true);
        expect(isBranchClash(b2, b1)).toBe(true);
        expect(CLASH_MAP[b1]).toBe(b2);
        expect(CLASH_MAP[b2]).toBe(b1);
      }

      expect(isBranchClash('Tý', 'Sửu')).toBe(false);
      expect(isBranchClash('Dần', 'Mão')).toBe(false);
    });

    it('kiểm tra tính đối xứng của 6 cặp Lục Hợp', () => {
      const pairs: [string, string][] = [
        ['Tý', 'Sửu'],
        ['Dần', 'Hợi'],
        ['Mão', 'Tuất'],
        ['Thìn', 'Dậu'],
        ['Tỵ', 'Thân'],
        ['Ngọ', 'Mùi'],
      ];

      for (const [b1, b2] of pairs) {
        expect(isBranchHarmony(b1, b2)).toBe(true);
        expect(isBranchHarmony(b2, b1)).toBe(true);
        expect(HARMONY_MAP[b1]?.partner).toBe(b2);
      }

      expect(isBranchHarmony('Tý', 'Ngọ')).toBe(false);
    });
  });

  describe('4. Phân tích quan hệ Ngũ Hành Sinh Khắc giữa Quan Tinh và Hào', () => {
    it('Quan tinh sinh Hào (SINH_HAO)', () => {
      const res = determineOfficerElementRelation(Element.THUY, Element.MOC, 'Nhật Thần');
      expect(res.relation).toBe(ElementRelationType.SINH_HAO);
      expect(res.description).toContain('sinh Hào');
    });

    it('Hào sinh Quan tinh (HAO_SINH)', () => {
      const res = determineOfficerElementRelation(Element.HOA, Element.MOC, 'Nguyệt Kiến');
      expect(res.relation).toBe(ElementRelationType.HAO_SINH);
      expect(res.description).toContain('Hào sinh Nguyệt Kiến');
    });

    it('Quan tinh khắc Hào (KHAC_HAO)', () => {
      const res = determineOfficerElementRelation(Element.KIM, Element.MOC, 'Nhật Thần');
      expect(res.relation).toBe(ElementRelationType.KHAC_HAO);
      expect(res.description).toContain('khắc Hào');
    });

    it('Hào khắc Quan tinh (HAO_KHAC)', () => {
      const res = determineOfficerElementRelation(Element.THO, Element.MOC, 'Nguyệt Kiến');
      expect(res.relation).toBe(ElementRelationType.HAO_KHAC);
      expect(res.description).toContain('Hào khắc Nguyệt Kiến');
    });

    it('Tỷ hòa / Đồng hành (TY_HOA)', () => {
      const res = determineOfficerElementRelation(Element.KIM, Element.KIM, 'Nhật Thần');
      expect(res.relation).toBe(ElementRelationType.TY_HOA);
      expect(res.description).toContain('tỷ hòa');
    });
  });

  describe('5. Động cơ analyzeCalendar - Phân tích toàn diện Nhật Thần, Nguyệt Kiến và Hào', () => {
    it('trường hợp điển hình: Ngày Giáp Tý, Tháng Bính Thân, phân tích 6 hào quẻ Thuần Càn', () => {
      const result = analyzeCalendar({
        dayCanChi: 'Giáp Tý',
        monthCanChi: 'Bính Thân',
        lowerTrigramCode: TrigramCode.CAN,
        upperTrigramCode: TrigramCode.CAN,
      });

      expect(result.ruleVersion).toBe('CAL-ANALYSIS-V1');

      // 1. Nhật Thần: Giáp Tý (Tý Thủy)
      expect(result.dayMaster).toMatchObject({
        stem: 'Giáp',
        branch: 'Tý',
        canChi: 'Giáp Tý',
        element: Element.THUY,
        elementName: 'Thủy',
        weekCycle: 'Tuần Giáp Tý',
        voidBranches: ['Tuất', 'Hợi'],
        isMonthlyBreakDay: false,
      });

      // 2. Nguyệt Kiến: Bính Thân (Thân Kim)
      expect(result.monthCommander).toMatchObject({
        stem: 'Bính',
        branch: 'Thân',
        canChi: 'Bính Thân',
        element: Element.KIM,
        elementName: 'Kim',
        monthlyBreakBranch: 'Dần', // Tháng Thân -> Dần bị Nguyệt Phá
      });

      // 3. Phân tích 6 hào Thuần Càn: Tý (1), Dần (2), Thìn (3), Ngọ (4), Thân (5), Tuất (6)
      expect(result.lineAnalyses).toBeDefined();
      const lines = result.lineAnalyses!;
      expect(lines).toHaveLength(6);

      // Hào 1: Tý (Thủy)
      expect(lines[0].branch).toBe('Tý');
      expect(lines[0].isVoid).toBe(false);
      expect(lines[0].isMonthlyBreak).toBe(false);
      expect(lines[0].dayRelation.elementRelation).toBe(ElementRelationType.TY_HOA);
      expect(lines[0].monthRelation.elementRelation).toBe(ElementRelationType.SINH_HAO); // Thân Kim sinh Tý Thủy

      // Hào 2: Dần (Mộc) -> Dần Thân tương xung (Nguyệt Kiến xung Hào) -> Nguyệt Phá = true!
      expect(lines[1].branch).toBe('Dần');
      expect(lines[1].isMonthlyBreak).toBe(true);
      expect(lines[1].monthRelation.isClash).toBe(true);
      expect(lines[1].summaryTags).toContain('Nguyệt Phá');

      // Hào 4: Ngọ (Hỏa) -> Ngọ Tý tương xung (Nhật Thần xung Hào) -> Nhật Xung = true!
      expect(lines[3].branch).toBe('Ngọ');
      expect(lines[3].dayRelation.isClash).toBe(true);
      expect(lines[3].summaryTags).toContain('Nhật Xung');

      // Hào 6: Tuất (Thổ) -> Tuất nằm trong voidBranches ["Tuất", "Hợi"] -> Không Vong = true!
      expect(lines[5].branch).toBe('Tuất');
      expect(lines[5].isVoid).toBe(true);
      expect(lines[5].summaryTags).toContain('Không Vong');
    });

    it('trường hợp biên: Ngày Nguyệt Phá (Chi ngày xung Chi tháng)', () => {
      // Tháng Dần (Nguyệt Kiến Dần), Ngày Thân (Nhật Thần Thân) -> Thân xung Dần -> Ngày Nguyệt Phá
      const result = analyzeCalendar({
        dayCanChi: 'Canh Thân',
        monthCanChi: 'Mậu Dần',
      });

      expect(result.dayMaster.isMonthlyBreakDay).toBe(true);
      expect(result.monthCommander.monthlyBreakBranch).toBe('Thân');
    });

    it('tích hợp với kết quả từ calendarResult của Calendar Engine', () => {
      const result = analyzeCalendar({
        calendarResult: {
          canChi: {
            day: 'Đinh Mão',
            month: 'Canh Tuất',
          },
          solarTerm: {
            name: 'Hàn Lộ',
          },
        },
      });

      expect(result.dayMaster.canChi).toBe('Đinh Mão');
      expect(result.dayMaster.branch).toBe('Mão');
      expect(result.monthCommander.canChi).toBe('Canh Tuất');
      expect(result.monthCommander.branch).toBe('Tuất');
      expect(result.monthCommander.solarTermName).toBe('Hàn Lộ');

      // Đinh Mão thuộc Tuần Giáp Tý (Mão 3 - Đinh 3 = 0) -> Tuần Giáp Tý -> Không Vong: Tuất, Hợi
      expect(result.dayMaster.voidBranches).toEqual(['Tuất', 'Hợi']);

      // Tháng Tuất -> Thìn bị Nguyệt Phá
      expect(result.monthCommander.monthlyBreakBranch).toBe('Thìn');

      // Mão (ngày) và Tuất (tháng) là Lục Hợp (Mão Tuất hợp Hỏa)
      expect(isBranchHarmony(result.dayMaster.branch, result.monthCommander.branch)).toBe(true);
    });

    it('báo lỗi khi thiếu thông tin Can Chi ngày hoặc tháng', () => {
      expect(() => analyzeCalendar({})).toThrow('Thiếu thông tin Can Chi ngày');
      expect(() => analyzeCalendar({ dayCanChi: 'Giáp Tý' })).toThrow('Thiếu thông tin Can Chi tháng');
      expect(() => parseCanChiString('SaiDinhDang')).toThrow();
    });
  });
});
