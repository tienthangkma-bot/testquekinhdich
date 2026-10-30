import { describe, it, expect } from 'vitest';
import {
  HEXAGRAMS,
  getHexagramById,
  getHexagramByLines,
  getHexagramByTrigrams,
} from './hexagrams.data';
import { TrigramCode } from '../enums/trigram-name.enum';
import {
  TRIGRAM_CAN,
  TRIGRAM_KHON,
  TRIGRAM_KHAM,
  TRIGRAM_LY,
} from './trigrams.data';

describe('64 Quẻ Kinh Dịch Specification (King Wen Sequence)', () => {
  it('phải khai báo đủ chính xác 64 quẻ', () => {
    expect(HEXAGRAMS).toHaveLength(64);
  });

  it('tất cả ID quẻ phải duy nhất và đúng định dạng HEX_XX', () => {
    const ids = HEXAGRAMS.map((h) => h.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(64);

    HEXAGRAMS.forEach((h, index) => {
      const expectedNumber = index + 1;
      const expectedId = `HEX_${expectedNumber.toString().padStart(2, '0')}`;
      expect(h.id).toBe(expectedId);
    });
  });

  it('số thứ tự Văn Vương phải liên tục từ 1 đến 64', () => {
    const numbers = HEXAGRAMS.map((h) => h.number);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(64);

    HEXAGRAMS.forEach((h, index) => {
      expect(h.number).toBe(index + 1);
    });
  });

  it('tất cả 64 tổ hợp nhị phân 6 hào phải duy nhất và đầy đủ (2^6 = 64)', () => {
    const binaries = HEXAGRAMS.map((h) => h.binary);
    const uniqueBinaries = new Set(binaries);
    expect(uniqueBinaries.size).toBe(64);

    binaries.forEach((bin) => {
      expect(bin).toHaveLength(6);
      expect(bin).toMatch(/^[01]{6}$/);
    });
  });

  it('tất cả 64 cặp Thượng quái và Hạ quái phải duy nhất (8x8 = 64)', () => {
    const pairs = HEXAGRAMS.map((h) => `${h.upperTrigram.code}-${h.lowerTrigram.code}`);
    const uniquePairs = new Set(pairs);
    expect(uniquePairs.size).toBe(64);
  });

  it('cấu trúc 6 hào phải ánh xạ chính xác với Thượng quái và Hạ quái', () => {
    HEXAGRAMS.forEach((h) => {
      // Hào 1, 2, 3 thuộc Hạ quái (từ dưới lên)
      expect(h.rawValues[0]).toBe(h.lowerTrigram.lines[0]);
      expect(h.rawValues[1]).toBe(h.lowerTrigram.lines[1]);
      expect(h.rawValues[2]).toBe(h.lowerTrigram.lines[2]);

      // Hào 4, 5, 6 thuộc Thượng quái (từ dưới lên)
      expect(h.rawValues[3]).toBe(h.upperTrigram.lines[0]);
      expect(h.rawValues[4]).toBe(h.upperTrigram.lines[1]);
      expect(h.rawValues[5]).toBe(h.upperTrigram.lines[2]);

      // lines objects
      expect(h.lines).toHaveLength(6);
      h.lines.forEach((line, idx) => {
        expect(line.position).toBe(idx + 1);
        expect(line.value).toBe(h.rawValues[idx]);
        expect(line.isMoving).toBe(false);
      });

      // Ký hiệu Unicode phải khớp với dải U+4DC0 + number - 1
      const expectedSymbol = String.fromCodePoint(0x4dc0 + h.number - 1);
      expect(h.symbol).toBe(expectedSymbol);
    });
  });

  describe('Kiểm tra các quẻ trọng yếu', () => {
    it('Quẻ 1: Thuần Càn (Càn/Càn, 111111, ䷀)', () => {
      const q = HEXAGRAMS[0]!;
      expect(q.number).toBe(1);
      expect(q.name).toBe('Thuần Càn');
      expect(q.sinoVietnameseName).toBe('Càn vi Thiên');
      expect(q.chineseName).toBe('乾為天');
      expect(q.upperTrigram).toBe(TRIGRAM_CAN);
      expect(q.lowerTrigram).toBe(TRIGRAM_CAN);
      expect(q.binary).toBe('111111');
      expect(q.symbol).toBe('䷀');
    });

    it('Quẻ 2: Thuần Khôn (Khôn/Khôn, 000000, ䷁)', () => {
      const q = HEXAGRAMS[1]!;
      expect(q.number).toBe(2);
      expect(q.name).toBe('Thuần Khôn');
      expect(q.sinoVietnameseName).toBe('Khôn vi Địa');
      expect(q.chineseName).toBe('坤為地');
      expect(q.upperTrigram).toBe(TRIGRAM_KHON);
      expect(q.lowerTrigram).toBe(TRIGRAM_KHON);
      expect(q.binary).toBe('000000');
      expect(q.symbol).toBe('䷁');
    });

    it('Quẻ 11: Địa Thiên Thái (Khôn/Càn, 111000, ䷊)', () => {
      const q = HEXAGRAMS[10]!;
      expect(q.number).toBe(11);
      expect(q.name).toBe('Địa Thiên Thái');
      expect(q.upperTrigram).toBe(TRIGRAM_KHON);
      expect(q.lowerTrigram).toBe(TRIGRAM_CAN);
      expect(q.binary).toBe('111000');
      expect(q.symbol).toBe('䷊');
    });

    it('Quẻ 12: Thiên Địa Bĩ (Càn/Khôn, 000111, ䷋)', () => {
      const q = HEXAGRAMS[11]!;
      expect(q.number).toBe(12);
      expect(q.name).toBe('Thiên Địa Bĩ');
      expect(q.upperTrigram).toBe(TRIGRAM_CAN);
      expect(q.lowerTrigram).toBe(TRIGRAM_KHON);
      expect(q.binary).toBe('000111');
      expect(q.symbol).toBe('䷋');
    });

    it('Quẻ 63: Thủy Hỏa Ký Tế (Khảm/Ly, 101010, ䷾)', () => {
      const q = HEXAGRAMS[62]!;
      expect(q.number).toBe(63);
      expect(q.name).toBe('Thủy Hỏa Ký Tế');
      expect(q.upperTrigram).toBe(TRIGRAM_KHAM);
      expect(q.lowerTrigram).toBe(TRIGRAM_LY);
      expect(q.binary).toBe('101010');
      expect(q.symbol).toBe('䷾');
    });

    it('Quẻ 64: Hỏa Thủy Vị Tế (Ly/Khảm, 010101, ䷿)', () => {
      const q = HEXAGRAMS[63]!;
      expect(q.number).toBe(64);
      expect(q.name).toBe('Hỏa Thủy Vị Tế');
      expect(q.upperTrigram).toBe(TRIGRAM_LY);
      expect(q.lowerTrigram).toBe(TRIGRAM_KHAM);
      expect(q.binary).toBe('010101');
      expect(q.symbol).toBe('䷿');
    });
  });

  describe('Hàm tra cứu: getHexagramById', () => {
    it('tra cứu đúng theo số thứ tự 1 đến 64', () => {
      expect(getHexagramById(1)?.name).toBe('Thuần Càn');
      expect(getHexagramById(2)?.name).toBe('Thuần Khôn');
      expect(getHexagramById(52)?.name).toBe('Thuần Cấn');
      expect(getHexagramById(63)?.name).toBe('Thủy Hỏa Ký Tế');
      expect(getHexagramById(64)?.name).toBe('Hỏa Thủy Vị Tế');
    });

    it('tra cứu đúng theo mã ID chuẩn (HEX_01, HEX_64)', () => {
      expect(getHexagramById('HEX_01')?.number).toBe(1);
      expect(getHexagramById('HEX_64')?.number).toBe(64);
      expect(getHexagramById('hex_11')?.number).toBe(11);
      expect(getHexagramById('hex_52')?.number).toBe(52);
    });

    it('tra cứu đúng theo tên slug không dấu', () => {
      expect(getHexagramById('THUAN_CAN')?.number).toBe(1);
      expect(getHexagramById('THUAN_CAN_SON')?.number).toBe(52);
      expect(getHexagramById('THIEN_DIA_BI')?.number).toBe(12);
      expect(getHexagramById('HOA_THUY_VI_TE')?.number).toBe(64);
    });

    it('trả về undefined nếu ID không tồn tại', () => {
      expect(getHexagramById(0)).toBeUndefined();
      expect(getHexagramById(65)).toBeUndefined();
      expect(getHexagramById('INVALID_ID')).toBeUndefined();
    });
  });

  describe('Hàm tra cứu: getHexagramByLines', () => {
    it('tra cứu đúng theo chuỗi nhị phân 6 ký tự', () => {
      expect(getHexagramByLines('111111')?.number).toBe(1);
      expect(getHexagramByLines('000000')?.number).toBe(2);
      expect(getHexagramByLines('111000')?.number).toBe(11);
      expect(getHexagramByLines('000111')?.number).toBe(12);
      expect(getHexagramByLines('101010')?.number).toBe(63);
      expect(getHexagramByLines('010101')?.number).toBe(64);
    });

    it('tra cứu đúng theo mảng 6 giá trị [0|1] từ dưới lên', () => {
      expect(getHexagramByLines([1, 1, 1, 1, 1, 1])?.number).toBe(1);
      expect(getHexagramByLines([0, 0, 0, 0, 0, 0])?.number).toBe(2);
      expect(getHexagramByLines([1, 1, 1, 0, 0, 0])?.number).toBe(11);
      expect(getHexagramByLines([1, 0, 1, 0, 1, 0])?.number).toBe(63);
    });

    it('trả về undefined nếu dữ liệu hào không hợp lệ', () => {
      expect(getHexagramByLines('111')).toBeUndefined();
      expect(getHexagramByLines('1111111')).toBeUndefined();
      expect(getHexagramByLines('123456')).toBeUndefined();
      expect(getHexagramByLines([1, 1, 1] as any)).toBeUndefined();
    });
  });

  describe('Hàm tra cứu: getHexagramByTrigrams', () => {
    it('tra cứu đúng theo đối tượng Trigram', () => {
      expect(getHexagramByTrigrams(TRIGRAM_CAN, TRIGRAM_CAN)?.number).toBe(1);
      expect(getHexagramByTrigrams(TRIGRAM_KHON, TRIGRAM_KHON)?.number).toBe(2);
      expect(getHexagramByTrigrams(TRIGRAM_KHON, TRIGRAM_CAN)?.number).toBe(11);
      expect(getHexagramByTrigrams(TRIGRAM_CAN, TRIGRAM_KHON)?.number).toBe(12);
      expect(getHexagramByTrigrams(TRIGRAM_KHAM, TRIGRAM_LY)?.number).toBe(63);
      expect(getHexagramByTrigrams(TRIGRAM_LY, TRIGRAM_KHAM)?.number).toBe(64);
    });

    it('tra cứu đúng theo mã enum TrigramCode', () => {
      expect(getHexagramByTrigrams(TrigramCode.CAN, TrigramCode.CAN)?.number).toBe(1);
      expect(getHexagramByTrigrams(TrigramCode.KHON, TrigramCode.CAN)?.number).toBe(11);
      expect(getHexagramByTrigrams(TrigramCode.KHAM, TrigramCode.LY)?.number).toBe(63);
    });
  });
});
