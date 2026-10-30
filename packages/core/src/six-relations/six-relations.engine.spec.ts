import { describe, it, expect } from 'vitest';
import {
  Element,
  HEXAGRAMS,
  PalaceGeneration,
  SixRelation,
  TrigramCode,
} from '@kindich/domain';

import {
  calculateSixRelations,
  determineSixRelation,
  getSixRelationName,
  isElementGenerating,
  isElementOvercoming,
  ELEMENT_GENERATES,
  ELEMENT_OVERCOMES,
} from './six-relations.engine';

describe('Six Relations Engine (Động Cơ Lục Thân)', () => {
  describe('1. Ngũ Hành Tương Sinh & Tương Khắc', () => {
    it('chu trình tương sinh: Mộc -> Hỏa -> Thổ -> Kim -> Thủy -> Mộc', () => {
      expect(ELEMENT_GENERATES[Element.MOC]).toBe(Element.HOA);
      expect(ELEMENT_GENERATES[Element.HOA]).toBe(Element.THO);
      expect(ELEMENT_GENERATES[Element.THO]).toBe(Element.KIM);
      expect(ELEMENT_GENERATES[Element.KIM]).toBe(Element.THUY);
      expect(ELEMENT_GENERATES[Element.THUY]).toBe(Element.MOC);

      expect(isElementGenerating(Element.MOC, Element.HOA)).toBe(true);
      expect(isElementGenerating(Element.HOA, Element.THO)).toBe(true);
      expect(isElementGenerating(Element.THO, Element.KIM)).toBe(true);
      expect(isElementGenerating(Element.KIM, Element.THUY)).toBe(true);
      expect(isElementGenerating(Element.THUY, Element.MOC)).toBe(true);

      // Chiều ngược lại không phải tương sinh
      expect(isElementGenerating(Element.HOA, Element.MOC)).toBe(false);
    });

    it('chu trình tương khắc: Mộc -> Thổ -> Thủy -> Hỏa -> Kim -> Mộc', () => {
      expect(ELEMENT_OVERCOMES[Element.MOC]).toBe(Element.THO);
      expect(ELEMENT_OVERCOMES[Element.THO]).toBe(Element.THUY);
      expect(ELEMENT_OVERCOMES[Element.THUY]).toBe(Element.HOA);
      expect(ELEMENT_OVERCOMES[Element.HOA]).toBe(Element.KIM);
      expect(ELEMENT_OVERCOMES[Element.KIM]).toBe(Element.MOC);

      expect(isElementOvercoming(Element.MOC, Element.THO)).toBe(true);
      expect(isElementOvercoming(Element.THO, Element.THUY)).toBe(true);
      expect(isElementOvercoming(Element.THUY, Element.HOA)).toBe(true);
      expect(isElementOvercoming(Element.HOA, Element.KIM)).toBe(true);
      expect(isElementOvercoming(Element.KIM, Element.MOC)).toBe(true);

      // Chiều ngược lại không phải tương khắc
      expect(isElementOvercoming(Element.THO, Element.MOC)).toBe(false);
    });
  });

  describe('2. Quy tắc xác định Lục Thân (5 quan hệ Ngũ Hành)', () => {
    it('Cùng hành: Huynh Đệ (Đồng ngã giả vi Huynh Đệ)', () => {
      expect(determineSixRelation(Element.KIM, Element.KIM)).toBe(SixRelation.HUYNH_DE);
      expect(determineSixRelation(Element.MOC, Element.MOC)).toBe(SixRelation.HUYNH_DE);
      expect(determineSixRelation(Element.THUY, Element.THUY)).toBe(SixRelation.HUYNH_DE);
      expect(determineSixRelation(Element.HOA, Element.HOA)).toBe(SixRelation.HUYNH_DE);
      expect(determineSixRelation(Element.THO, Element.THO)).toBe(SixRelation.HUYNH_DE);
    });

    it('Hào sinh Cung: Phụ Mẫu (Sinh ngã giả vi Phụ Mẫu)', () => {
      // Cung Kim, Hào Thổ (Thổ sinh Kim)
      expect(determineSixRelation(Element.THO, Element.KIM)).toBe(SixRelation.PHU_MAU);
      // Cung Thủy, Hào Kim (Kim sinh Thủy)
      expect(determineSixRelation(Element.KIM, Element.THUY)).toBe(SixRelation.PHU_MAU);
      // Cung Mộc, Hào Thủy (Thủy sinh Mộc)
      expect(determineSixRelation(Element.THUY, Element.MOC)).toBe(SixRelation.PHU_MAU);
      // Cung Hỏa, Hào Mộc (Mộc sinh Hỏa)
      expect(determineSixRelation(Element.MOC, Element.HOA)).toBe(SixRelation.PHU_MAU);
      // Cung Thổ, Hào Hỏa (Hỏa sinh Thổ)
      expect(determineSixRelation(Element.HOA, Element.THO)).toBe(SixRelation.PHU_MAU);
    });

    it('Cung sinh Hào: Tử Tôn (Ngã sinh giả vi Tử Tôn)', () => {
      // Cung Kim, Hào Thủy (Kim sinh Thủy)
      expect(determineSixRelation(Element.THUY, Element.KIM)).toBe(SixRelation.TU_TON);
      // Cung Thủy, Hào Mộc (Thủy sinh Mộc)
      expect(determineSixRelation(Element.MOC, Element.THUY)).toBe(SixRelation.TU_TON);
      // Cung Mộc, Hào Hỏa (Mộc sinh Hỏa)
      expect(determineSixRelation(Element.HOA, Element.MOC)).toBe(SixRelation.TU_TON);
      // Cung Hỏa, Hào Thổ (Hỏa sinh Thổ)
      expect(determineSixRelation(Element.THO, Element.HOA)).toBe(SixRelation.TU_TON);
      // Cung Thổ, Hào Kim (Thổ sinh Kim)
      expect(determineSixRelation(Element.KIM, Element.THO)).toBe(SixRelation.TU_TON);
    });

    it('Cung khắc Hào: Thê Tài (Ngã khắc giả vi Thê Tài)', () => {
      // Cung Kim, Hào Mộc (Kim khắc Mộc)
      expect(determineSixRelation(Element.MOC, Element.KIM)).toBe(SixRelation.THE_TAI);
      // Cung Mộc, Hào Thổ (Mộc khắc Thổ)
      expect(determineSixRelation(Element.THO, Element.MOC)).toBe(SixRelation.THE_TAI);
      // Cung Thổ, Hào Thủy (Thổ khắc Thủy)
      expect(determineSixRelation(Element.THUY, Element.THO)).toBe(SixRelation.THE_TAI);
      // Cung Thủy, Hào Hỏa (Thủy khắc Hỏa)
      expect(determineSixRelation(Element.HOA, Element.THUY)).toBe(SixRelation.THE_TAI);
      // Cung Hỏa, Hào Kim (Hỏa khắc Kim)
      expect(determineSixRelation(Element.KIM, Element.HOA)).toBe(SixRelation.THE_TAI);
    });

    it('Hào khắc Cung: Quan Quỷ (Khắc ngã giả vi Quan Quỷ)', () => {
      // Cung Kim, Hào Hỏa (Hỏa khắc Kim)
      expect(determineSixRelation(Element.HOA, Element.KIM)).toBe(SixRelation.QUAN_QUY);
      // Cung Thủy, Hào Thổ (Thổ khắc Thủy)
      expect(determineSixRelation(Element.THO, Element.THUY)).toBe(SixRelation.QUAN_QUY);
      // Cung Mộc, Hào Kim (Kim khắc Mộc)
      expect(determineSixRelation(Element.KIM, Element.MOC)).toBe(SixRelation.QUAN_QUY);
      // Cung Hỏa, Hào Thủy (Thủy khắc Hỏa)
      expect(determineSixRelation(Element.THUY, Element.HOA)).toBe(SixRelation.QUAN_QUY);
      // Cung Thổ, Hào Mộc (Mộc khắc Thổ)
      expect(determineSixRelation(Element.MOC, Element.THO)).toBe(SixRelation.QUAN_QUY);
    });

    it('bao phủ toàn diện 25 cặp Ngũ Hành (5x5) không bỏ sót trường hợp nào', () => {
      const allElements = [
        Element.KIM,
        Element.MOC,
        Element.THUY,
        Element.HOA,
        Element.THO,
      ];

      for (const lineEl of allElements) {
        for (const palaceEl of allElements) {
          const relation = determineSixRelation(lineEl, palaceEl);
          expect(Object.values(SixRelation)).toContain(relation);
        }
      }
    });

    it('mã định danh ổn định và tên tiếng Việt khớp đúng', () => {
      expect(getSixRelationName(SixRelation.HUYNH_DE)).toBe('Huynh Đệ');
      expect(getSixRelationName(SixRelation.PHU_MAU)).toBe('Phụ Mẫu');
      expect(getSixRelationName(SixRelation.TU_TON)).toBe('Tử Tôn');
      expect(getSixRelationName(SixRelation.THE_TAI)).toBe('Thê Tài');
      expect(getSixRelationName(SixRelation.QUAN_QUY)).toBe('Quan Quỷ');
    });
  });

  describe('3. Đối chiếu Quẻ kinh điển trong Tăng San Bốc Dịch', () => {
    it('Quẻ 1: Thuần Càn (Cung Càn, Hành Kim, Bản Cung)', () => {
      const result = calculateSixRelations({ hexagramNumber: 1 });

      expect(result.hexagramName).toBe('Thuần Càn');
      expect(result.palace).toBe(TrigramCode.CAN);
      expect(result.palaceName).toBe('Càn');
      expect(result.palaceElement).toBe(Element.KIM);
      expect(result.generation).toBe(PalaceGeneration.BAN_CUNG);
      expect(result.worldLine).toBe(6);
      expect(result.responseLine).toBe(3);

      expect(result.lines).toHaveLength(6);

      // Hào 1: Giáp Tý (Thủy) -> Kim sinh Thủy -> Tử Tôn Tý Thủy
      expect(result.lines[0]).toMatchObject({
        position: 1,
        stem: 'Giáp',
        branch: 'Tý',
        element: Element.THUY,
        relation: SixRelation.TU_TON,
        relationName: 'Tử Tôn',
        fullLabel: 'Tử Tôn Tý Thủy',
      });

      // Hào 2: Giáp Dần (Mộc) -> Kim khắc Mộc -> Thê Tài Dần Mộc
      expect(result.lines[1]).toMatchObject({
        position: 2,
        stem: 'Giáp',
        branch: 'Dần',
        element: Element.MOC,
        relation: SixRelation.THE_TAI,
        relationName: 'Thê Tài',
        fullLabel: 'Thê Tài Dần Mộc',
      });

      // Hào 3: Giáp Thìn (Thổ) -> Thổ sinh Kim -> Phụ Mẫu Thìn Thổ
      expect(result.lines[2]).toMatchObject({
        position: 3,
        stem: 'Giáp',
        branch: 'Thìn',
        element: Element.THO,
        relation: SixRelation.PHU_MAU,
        relationName: 'Phụ Mẫu',
        fullLabel: 'Phụ Mẫu Thìn Thổ',
      });

      // Hào 4: Nhâm Ngọ (Hỏa) -> Hỏa khắc Kim -> Quan Quỷ Ngọ Hỏa
      expect(result.lines[3]).toMatchObject({
        position: 4,
        stem: 'Nhâm',
        branch: 'Ngọ',
        element: Element.HOA,
        relation: SixRelation.QUAN_QUY,
        relationName: 'Quan Quỷ',
        fullLabel: 'Quan Quỷ Ngọ Hỏa',
      });

      // Hào 5: Nhâm Thân (Kim) -> Kim đồng Kim -> Huynh Đệ Thân Kim
      expect(result.lines[4]).toMatchObject({
        position: 5,
        stem: 'Nhâm',
        branch: 'Thân',
        element: Element.KIM,
        relation: SixRelation.HUYNH_DE,
        relationName: 'Huynh Đệ',
        fullLabel: 'Huynh Đệ Thân Kim',
      });

      // Hào 6: Nhâm Tuất (Thổ) -> Thổ sinh Kim -> Phụ Mẫu Tuất Thổ
      expect(result.lines[5]).toMatchObject({
        position: 6,
        stem: 'Nhâm',
        branch: 'Tuất',
        element: Element.THO,
        relation: SixRelation.PHU_MAU,
        relationName: 'Phụ Mẫu',
        fullLabel: 'Phụ Mẫu Tuất Thổ',
      });
    });

    it('Quẻ 5: Thủy Thiên Nhu (Cung Khôn, Hành Thổ, Du Hồn)', () => {
      const result = calculateSixRelations({ hexagramNumber: 5 });

      expect(result.hexagramName).toBe('Thủy Thiên Nhu');
      expect(result.palace).toBe(TrigramCode.KHON);
      expect(result.palaceName).toBe('Khôn');
      expect(result.palaceElement).toBe(Element.THO);
      expect(result.generation).toBe(PalaceGeneration.DU_HON);
      expect(result.worldLine).toBe(4);
      expect(result.responseLine).toBe(1);

      // Cung Thổ:
      // Hào 1: Giáp Tý (Thủy) -> Thổ khắc Thủy -> Thê Tài Tý Thủy
      expect(result.lines[0].relation).toBe(SixRelation.THE_TAI);
      expect(result.lines[0].fullLabel).toBe('Thê Tài Tý Thủy');

      // Hào 2: Giáp Dần (Mộc) -> Mộc khắc Thổ -> Quan Quỷ Dần Mộc
      expect(result.lines[1].relation).toBe(SixRelation.QUAN_QUY);
      expect(result.lines[1].fullLabel).toBe('Quan Quỷ Dần Mộc');

      // Hào 3: Giáp Thìn (Thổ) -> Cùng Thổ -> Huynh Đệ Thìn Thổ
      expect(result.lines[2].relation).toBe(SixRelation.HUYNH_DE);
      expect(result.lines[2].fullLabel).toBe('Huynh Đệ Thìn Thổ');

      // Hào 4: Mậu Thân (Kim) -> Thổ sinh Kim -> Tử Tôn Thân Kim
      expect(result.lines[3].relation).toBe(SixRelation.TU_TON);
      expect(result.lines[3].fullLabel).toBe('Tử Tôn Thân Kim');

      // Hào 5: Mậu Tuất (Thổ) -> Cùng Thổ -> Huynh Đệ Tuất Thổ
      expect(result.lines[4].relation).toBe(SixRelation.HUYNH_DE);
      expect(result.lines[4].fullLabel).toBe('Huynh Đệ Tuất Thổ');

      // Hào 6: Mậu Tý (Thủy) -> Thổ khắc Thủy -> Thê Tài Tý Thủy
      expect(result.lines[5].relation).toBe(SixRelation.THE_TAI);
      expect(result.lines[5].fullLabel).toBe('Thê Tài Tý Thủy');
    });

    it('Quẻ 30: Thuần Ly (Cung Ly, Hành Hỏa, Bản Cung)', () => {
      const result = calculateSixRelations({ hexagramNumber: 30 });

      expect(result.hexagramName).toBe('Thuần Ly');
      expect(result.palaceElement).toBe(Element.HOA);

      // Cung Hỏa:
      // Hào 1: Kỷ Mão (Mộc) -> Mộc sinh Hỏa -> Phụ Mẫu Mão Mộc
      expect(result.lines[0].relation).toBe(SixRelation.PHU_MAU);
      expect(result.lines[0].fullLabel).toBe('Phụ Mẫu Mão Mộc');

      // Hào 2: Kỷ Sửu (Thổ) -> Hỏa sinh Thổ -> Tử Tôn Sửu Thổ
      expect(result.lines[1].relation).toBe(SixRelation.TU_TON);
      expect(result.lines[1].fullLabel).toBe('Tử Tôn Sửu Thổ');

      // Hào 3: Kỷ Hợi (Thủy) -> Thủy khắc Hỏa -> Quan Quỷ Hợi Thủy
      expect(result.lines[2].relation).toBe(SixRelation.QUAN_QUY);
      expect(result.lines[2].fullLabel).toBe('Quan Quỷ Hợi Thủy');

      // Hào 4: Kỷ Dậu (Kim) -> Hỏa khắc Kim -> Thê Tài Dậu Kim
      expect(result.lines[3].relation).toBe(SixRelation.THE_TAI);
      expect(result.lines[3].fullLabel).toBe('Thê Tài Dậu Kim');

      // Hào 5: Kỷ Mùi (Thổ) -> Hỏa sinh Thổ -> Tử Tôn Mùi Thổ
      expect(result.lines[4].relation).toBe(SixRelation.TU_TON);
      expect(result.lines[4].fullLabel).toBe('Tử Tôn Mùi Thổ');

      // Hào 6: Kỷ Tỵ (Hỏa) -> Cùng Hỏa -> Huynh Đệ Tỵ Hỏa
      expect(result.lines[5].relation).toBe(SixRelation.HUYNH_DE);
      expect(result.lines[5].fullLabel).toBe('Huynh Đệ Tỵ Hỏa');
    });

    it('Quẻ 51: Thuần Chấn (Cung Chấn, Hành Mộc, Bản Cung)', () => {
      const result = calculateSixRelations({ hexagramNumber: 51 });

      expect(result.hexagramName).toBe('Thuần Chấn');
      expect(result.palaceElement).toBe(Element.MOC);

      // Cung Mộc:
      // Hào 1: Tý (Thủy) -> Thủy sinh Mộc -> Phụ Mẫu
      expect(result.lines[0].relation).toBe(SixRelation.PHU_MAU);
      // Hào 2: Dần (Mộc) -> Cùng Mộc -> Huynh Đệ
      expect(result.lines[1].relation).toBe(SixRelation.HUYNH_DE);
      // Hào 3: Thìn (Thổ) -> Mộc khắc Thổ -> Thê Tài
      expect(result.lines[2].relation).toBe(SixRelation.THE_TAI);
      // Hào 4: Ngọ (Hỏa) -> Mộc sinh Hỏa -> Tử Tôn
      expect(result.lines[3].relation).toBe(SixRelation.TU_TON);
      // Hào 5: Thân (Kim) -> Kim khắc Mộc -> Quan Quỷ
      expect(result.lines[4].relation).toBe(SixRelation.QUAN_QUY);
      // Hào 6: Tuất (Thổ) -> Mộc khắc Thổ -> Thê Tài
      expect(result.lines[5].relation).toBe(SixRelation.THE_TAI);
    });

    it('Quẻ 29: Thuần Khảm (Cung Khảm, Hành Thủy, Bản Cung)', () => {
      const result = calculateSixRelations({ hexagramNumber: 29 });

      expect(result.hexagramName).toBe('Thuần Khảm');
      expect(result.palaceElement).toBe(Element.THUY);

      // Cung Thủy:
      // Hào 1: Dần (Mộc) -> Thủy sinh Mộc -> Tử Tôn
      expect(result.lines[0].relation).toBe(SixRelation.TU_TON);
      // Hào 2: Thìn (Thổ) -> Thổ khắc Thủy -> Quan Quỷ
      expect(result.lines[1].relation).toBe(SixRelation.QUAN_QUY);
      // Hào 3: Ngọ (Hỏa) -> Thủy khắc Hỏa -> Thê Tài
      expect(result.lines[2].relation).toBe(SixRelation.THE_TAI);
      // Hào 4: Thân (Kim) -> Kim sinh Thủy -> Phụ Mẫu
      expect(result.lines[3].relation).toBe(SixRelation.PHU_MAU);
      // Hào 5: Tuất (Thổ) -> Thổ khắc Thủy -> Quan Quỷ
      expect(result.lines[4].relation).toBe(SixRelation.QUAN_QUY);
      // Hào 6: Tý (Thủy) -> Cùng Thủy -> Huynh Đệ
      expect(result.lines[5].relation).toBe(SixRelation.HUYNH_DE);
    });
  });

  describe('4. Độ linh hoạt của tham số đầu vào', () => {
    it('truyền đối tượng Hexagram trực tiếp', () => {
      const hex = HEXAGRAMS[0]; // Thuần Càn
      const result = calculateSixRelations({ hexagram: hex });
      expect(result.hexagramNumber).toBe(1);
      expect(result.palace).toBe(TrigramCode.CAN);
      expect(result.lines).toHaveLength(6);
    });

    it('truyền hexagramId', () => {
      const result = calculateSixRelations({ hexagramId: 'HEX_01' });
      expect(result.hexagramNumber).toBe(1);
      expect(result.palace).toBe(TrigramCode.CAN);
    });

    it('truyền lowerTrigramCode và upperTrigramCode', () => {
      const result = calculateSixRelations({
        lowerTrigramCode: TrigramCode.CAN,
        upperTrigramCode: TrigramCode.CAN,
      });
      expect(result.hexagramNumber).toBe(1);
      expect(result.palace).toBe(TrigramCode.CAN);
    });

    it('cho phép tùy biến customPalaceElement và customPalace', () => {
      const result = calculateSixRelations({
        lowerTrigramCode: TrigramCode.CAN,
        upperTrigramCode: TrigramCode.CAN,
        customPalace: TrigramCode.LY,
        customPalaceElement: Element.HOA,
      });

      expect(result.palace).toBe(TrigramCode.LY);
      expect(result.palaceElement).toBe(Element.HOA);
      // Hào 1: Tý (Thủy). Với Cung Hỏa: Thủy khắc Hỏa -> Quan Quỷ
      expect(result.lines[0].relation).toBe(SixRelation.QUAN_QUY);
    });
  });

  describe('5. Xử lý lỗi đầu vào', () => {
    it('báo lỗi khi số thứ tự quẻ không hợp lệ', () => {
      expect(() => calculateSixRelations({ hexagramNumber: 0 })).toThrow();
      expect(() => calculateSixRelations({ hexagramNumber: 65 })).toThrow();
    });

    it('báo lỗi khi không đủ thông tin xác định quẻ và cung', () => {
      expect(() => calculateSixRelations({})).toThrow();
    });

    it('báo lỗi khi getSixRelationName nhận mã không hợp lệ', () => {
      expect(() => getSixRelationName('UNKNOWN' as SixRelation)).toThrow();
    });
  });
});
