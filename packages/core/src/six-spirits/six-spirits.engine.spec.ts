import { describe, it, expect } from 'vitest';
import { Element, SixSpirit } from '@kindich/domain';

import {
  calculateSixSpirits,
  getSixSpiritAtLine,
  getStartingSpiritForStem,
  normalizeDayStem,
  VALID_HEAVENLY_STEMS,
} from './six-spirits.engine';

describe('Six Spirits Engine (Động Cơ Lục Thú) - Bốc Phệ Chính Tông', () => {
  describe('1. Khởi đầu Lục Thú tại hào 1 theo 10 Thiên Can', () => {
    it('Giáp, Ất khởi Thanh Long', () => {
      expect(getStartingSpiritForStem('Giáp')).toBe(SixSpirit.THANH_LONG);
      expect(getStartingSpiritForStem('Ất')).toBe(SixSpirit.THANH_LONG);
    });

    it('Bính, Đinh khởi Chu Tước', () => {
      expect(getStartingSpiritForStem('Bính')).toBe(SixSpirit.CHU_TUOC);
      expect(getStartingSpiritForStem('Đinh')).toBe(SixSpirit.CHU_TUOC);
    });

    it('Mậu khởi Câu Trần', () => {
      expect(getStartingSpiritForStem('Mậu')).toBe(SixSpirit.CAU_TRAN);
    });

    it('Kỷ khởi Đằng Xà', () => {
      expect(getStartingSpiritForStem('Kỷ')).toBe(SixSpirit.DANG_XA);
    });

    it('Canh, Tân khởi Bạch Hổ', () => {
      expect(getStartingSpiritForStem('Canh')).toBe(SixSpirit.BACH_HO);
      expect(getStartingSpiritForStem('Tân')).toBe(SixSpirit.BACH_HO);
    });

    it('Nhâm, Quý khởi Huyền Vũ', () => {
      expect(getStartingSpiritForStem('Nhâm')).toBe(SixSpirit.HUYEN_VU);
      expect(getStartingSpiritForStem('Quý')).toBe(SixSpirit.HUYEN_VU);
    });
  });

  describe('2. Kiểm tra thứ tự tuần hoàn 6 hào cho toàn bộ 10 Thiên Can', () => {
    const expectedSequences: Record<string, SixSpirit[]> = {
      // Giáp & Ất: Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ
      'Giáp': [
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
      ],
      'Ất': [
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
      ],
      // Bính & Đinh: Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ -> Thanh Long
      'Bính': [
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
      ],
      'Đinh': [
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
      ],
      // Mậu: Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ -> Thanh Long -> Chu Tước
      'Mậu': [
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
      ],
      // Kỷ: Đằng Xà -> Bạch Hổ -> Huyền Vũ -> Thanh Long -> Chu Tước -> Câu Trần
      'Kỷ': [
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
      ],
      // Canh & Tân: Bạch Hổ -> Huyền Vũ -> Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà
      'Canh': [
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
      ],
      'Tân': [
        SixSpirit.BACH_HO,
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
      ],
      // Nhâm & Quý: Huyền Vũ -> Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ
      'Nhâm': [
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
      ],
      'Quý': [
        SixSpirit.HUYEN_VU,
        SixSpirit.THANH_LONG,
        SixSpirit.CHU_TUOC,
        SixSpirit.CAU_TRAN,
        SixSpirit.DANG_XA,
        SixSpirit.BACH_HO,
      ],
    };

    it('kiểm tra toàn bộ 10 Thiên Can có đúng chuỗi 6 Lục Thú từ hào 1 đến hào 6', () => {
      for (const stem of VALID_HEAVENLY_STEMS) {
        const result = calculateSixSpirits(stem);
        expect(result.dayStem).toBe(stem);
        expect(result.lines).toHaveLength(6);

        const actualSpirits = result.lines.map((l) => l.spirit);
        expect(actualSpirits).toEqual(expectedSequences[stem]);
      }
    });

    it('vị trí hào được đánh số chính xác từ 1 đến 6 (từ dưới lên)', () => {
      const result = calculateSixSpirits('Giáp');
      const positions = result.lines.map((l) => l.position);
      expect(positions).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('3. Dữ liệu chi tiết của từng hào Lục Thú', () => {
    it('mỗi hào có đầy đủ thông tin tên, chữ Hán, Ngũ Hành, phương vị, tính chất và mô tả', () => {
      const result = calculateSixSpirits('Giáp');

      // Hào 1: Thanh Long
      expect(result.lines[0]).toMatchObject({
        position: 1,
        spirit: SixSpirit.THANH_LONG,
        spiritName: 'Thanh Long',
        chineseName: '青龍',
        element: Element.MOC,
        elementName: 'Mộc',
        direction: 'Đông',
        nature: 'Cát thần',
      });
      expect(result.lines[0]?.description).toBeTruthy();

      // Hào 2: Chu Tước
      expect(result.lines[1]).toMatchObject({
        position: 2,
        spirit: SixSpirit.CHU_TUOC,
        spiritName: 'Chu Tước',
        chineseName: '朱雀',
        element: Element.HOA,
        elementName: 'Hỏa',
        direction: 'Nam',
      });

      // Hào 3: Câu Trần
      expect(result.lines[2]).toMatchObject({
        position: 3,
        spirit: SixSpirit.CAU_TRAN,
        spiritName: 'Câu Trần',
        chineseName: '勾陳',
        element: Element.THO,
        elementName: 'Thổ',
      });

      // Hào 4: Đằng Xà
      expect(result.lines[3]).toMatchObject({
        position: 4,
        spirit: SixSpirit.DANG_XA,
        spiritName: 'Đằng Xà',
        chineseName: '螣蛇',
        element: Element.THO,
        elementName: 'Thổ',
      });

      // Hào 5: Bạch Hổ
      expect(result.lines[4]).toMatchObject({
        position: 5,
        spirit: SixSpirit.BACH_HO,
        spiritName: 'Bạch Hổ',
        chineseName: '白虎',
        element: Element.KIM,
        elementName: 'Kim',
        direction: 'Tây',
      });

      // Hào 6: Huyền Vũ
      expect(result.lines[5]).toMatchObject({
        position: 6,
        spirit: SixSpirit.HUYEN_VU,
        spiritName: 'Huyền Vũ',
        chineseName: '玄武',
        element: Element.THUY,
        elementName: 'Thủy',
        direction: 'Bắc',
      });
    });

    it('ngũ hành của 6 linh thú chuẩn xác tuyệt đối', () => {
      const result = calculateSixSpirits('Giáp');
      const spiritElements = result.lines.map((l) => l.element);
      expect(spiritElements).toEqual([
        Element.MOC,  // Thanh Long
        Element.HOA,  // Chu Tước
        Element.THO,  // Câu Trần
        Element.THO,  // Đằng Xà
        Element.KIM,  // Bạch Hổ
        Element.THUY, // Huyền Vũ
      ]);
    });
  });

  describe('4. Tính linh hoạt và chuẩn hóa dữ liệu đầu vào', () => {
    it('chấp nhận chuỗi Can Chi đầy đủ của ngày', () => {
      const res1 = calculateSixSpirits('Giáp Tý');
      expect(res1.dayStem).toBe('Giáp');
      expect(res1.startingSpirit).toBe(SixSpirit.THANH_LONG);

      const res2 = calculateSixSpirits('Mậu Ngọ');
      expect(res2.dayStem).toBe('Mậu');
      expect(res2.startingSpirit).toBe(SixSpirit.CAU_TRAN);

      const res3 = calculateSixSpirits('Kỷ Mão');
      expect(res3.dayStem).toBe('Kỷ');
      expect(res3.startingSpirit).toBe(SixSpirit.DANG_XA);
    });

    it('chấp nhận chữ thường, không dấu, khoảng trắng thừa', () => {
      expect(normalizeDayStem('giap')).toBe('Giáp');
      expect(normalizeDayStem('  GIAP  ')).toBe('Giáp');
      expect(normalizeDayStem('mau')).toBe('Mậu');
      expect(normalizeDayStem('MAU DAN')).toBe('Mậu');
      expect(normalizeDayStem('nham')).toBe('Nhâm');
      expect(normalizeDayStem('quy')).toBe('Quý');
    });

    it('hỗ trợ truyền params dạng object CalculateSixSpiritsParams', () => {
      const res = calculateSixSpirits({ dayStem: 'Bính Dần' });
      expect(res.dayStem).toBe('Bính');
      expect(res.startingSpirit).toBe(SixSpirit.CHU_TUOC);
    });
  });

  describe('5. Hàm tra cứu getSixSpiritAtLine', () => {
    it('tra cứu đúng Lục Thú tại từng hào cụ thể', () => {
      // Ngày Canh: Hào 1 = Bạch Hổ, Hào 2 = Huyền Vũ, Hào 3 = Thanh Long...
      expect(getSixSpiritAtLine('Canh', 1).spirit).toBe(SixSpirit.BACH_HO);
      expect(getSixSpiritAtLine('Canh', 2).spirit).toBe(SixSpirit.HUYEN_VU);
      expect(getSixSpiritAtLine('Canh', 3).spirit).toBe(SixSpirit.THANH_LONG);
      expect(getSixSpiritAtLine('Canh', 4).spirit).toBe(SixSpirit.CHU_TUOC);
      expect(getSixSpiritAtLine('Canh', 5).spirit).toBe(SixSpirit.CAU_TRAN);
      expect(getSixSpiritAtLine('Canh', 6).spirit).toBe(SixSpirit.DANG_XA);
    });

    it('báo lỗi khi vị trí hào nằm ngoài phạm vi 1..6', () => {
      // @ts-expect-error kiểm tra vị trí ngoài biên
      expect(() => getSixSpiritAtLine('Giáp', 0)).toThrow();
      // @ts-expect-error kiểm tra vị trí ngoài biên
      expect(() => getSixSpiritAtLine('Giáp', 7)).toThrow();
      // @ts-expect-error kiểm tra số thực
      expect(() => getSixSpiritAtLine('Giáp', 2.5)).toThrow();
    });
  });

  describe('6. Xử lý lỗi đầu vào', () => {
    it('báo lỗi khi Thiên Can rỗng hoặc không xác định', () => {
      expect(() => calculateSixSpirits('')).toThrow();
      // @ts-expect-error kiểm tra null
      expect(() => calculateSixSpirits(null)).toThrow();
      expect(() => calculateSixSpirits('UNKNOWN')).toThrow();
      expect(() => calculateSixSpirits('12345')).toThrow();
    });
  });
});
