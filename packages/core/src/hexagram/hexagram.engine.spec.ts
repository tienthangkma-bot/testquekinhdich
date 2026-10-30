import { describe, it, expect } from 'vitest';
import {
  createPrimaryHexagram,
  createNuclearHexagram,
  castHexagramTrio,
  extractTrigrams,
} from './hexagram.engine';
import {
  InvalidHexagramInputError,
  InvalidMovingLineError,
} from './errors';
import { TrigramCode } from '@kindich/domain';

describe('Hexagram Engine Specification', () => {
  describe('1. Khởi tạo Quẻ Chủ & Phân tách Thượng/Hạ quái', () => {
    it('khởi tạo quẻ chủ chính xác từ mảng 6 số [0|1]', () => {
      // 111111 -> Thuần Càn (Quẻ 1)
      const hex = createPrimaryHexagram([1, 1, 1, 1, 1, 1]);
      expect(hex.number).toBe(1);
      expect(hex.name).toBe('Thuần Càn');
      expect(hex.upperTrigram.code).toBe(TrigramCode.CAN);
      expect(hex.lowerTrigram.code).toBe(TrigramCode.CAN);
      expect(hex.lines).toHaveLength(6);
      expect(hex.binary).toBe('111111');
    });

    it('khởi tạo quẻ chủ chính xác từ chuỗi nhị phân 6 ký tự', () => {
      // 000000 -> Thuần Khôn (Quẻ 2)
      const hex = createPrimaryHexagram('000000');
      expect(hex.number).toBe(2);
      expect(hex.name).toBe('Thuần Khôn');
      expect(hex.upperTrigram.code).toBe(TrigramCode.KHON);
      expect(hex.lowerTrigram.code).toBe(TrigramCode.KHON);
    });

    it('phân tách Thượng quái (hào 4-6) và Hạ quái (hào 1-3) chuẩn xác', () => {
      // 100010: Hạ quái = [1,0,0] (Chấn), Thượng quái = [0,1,0] (Khảm) -> Thủy Lôi Truân (Quẻ 3)
      const { upperTrigram, lowerTrigram } = extractTrigrams('100010');
      expect(lowerTrigram.code).toBe(TrigramCode.CHAN);
      expect(upperTrigram.code).toBe(TrigramCode.KHAM);

      const hex = createPrimaryHexagram('100010');
      expect(hex.number).toBe(3);
      expect(hex.name).toBe('Thủy Lôi Truân');
    });
  });

  describe('2. Trường hợp KHÔNG CÓ hào động', () => {
    it('quẻ biến chính là quẻ chủ khi không có hào động', () => {
      const trio = castHexagramTrio('111111'); // Thuần Càn
      expect(trio.hasMovingLines).toBe(false);
      expect(trio.movingLineIndices).toEqual([]);
      expect(trio.primary.number).toBe(1);
      expect(trio.transformed.number).toBe(1);
      expect(trio.transformed.binary).toBe(trio.primary.binary);

      // Tất cả hào quẻ chủ đều tĩnh
      trio.primary.lines.forEach((line) => {
        expect(line.isMoving).toBe(false);
      });
    });

    it('xử lý đúng khi truyền mảng rỗng [] cho hào động', () => {
      const trio = castHexagramTrio('000000', []);
      expect(trio.hasMovingLines).toBe(false);
      expect(trio.primary.number).toBe(2);
      expect(trio.transformed.number).toBe(2);
    });
  });

  describe('3. Trường hợp MỘT hào động', () => {
    it('Thuần Càn hào 1 động -> Quẻ Biến là Thiên Phong Cấu (Quẻ 44)', () => {
      // Thuần Càn: 111111, hào 1 động đảo 1 -> 0
      // Dãy hào biến: [0, 1, 1, 1, 1, 1] -> Hạ Tốn [0,1,1], Thượng Càn [1,1,1] -> Thiên Phong Cấu (44)
      const trio = castHexagramTrio('111111', 1);

      expect(trio.hasMovingLines).toBe(true);
      expect(trio.movingLineIndices).toEqual([1]);

      // Quẻ Chủ
      expect(trio.primary.number).toBe(1);
      expect(trio.primary.lines[0]!.isMoving).toBe(true);
      expect(trio.primary.lines[1]!.isMoving).toBe(false);

      // Quẻ Biến
      expect(trio.transformed.number).toBe(44);
      expect(trio.transformed.name).toBe('Thiên Phong Cấu');
      expect(trio.transformed.binary).toBe('011111');
    });

    it('Thuần Càn hào 6 động -> Quẻ Biến là Trạch Thiên Quải (Quẻ 43)', () => {
      // Thuần Càn: 111111, hào 6 động đảo 1 -> 0
      // Dãy hào biến: [1, 1, 1, 1, 1, 0] -> Hạ Càn [1,1,1], Thượng Đoài [1,1,0] -> Trạch Thiên Quải (43)
      const trio = castHexagramTrio('111111', [6]);

      expect(trio.primary.number).toBe(1);
      expect(trio.primary.lines[5]!.isMoving).toBe(true);

      expect(trio.transformed.number).toBe(43);
      expect(trio.transformed.name).toBe('Trạch Thiên Quải');
      expect(trio.transformed.binary).toBe('111110');
    });

    it('Thuần Khôn hào 1 động -> Quẻ Biến là Địa Lôi Phục (Quẻ 24)', () => {
      // Thuần Khôn: 000000, hào 1 động đảo 0 -> 1
      // Dãy hào biến: [1, 0, 0, 0, 0, 0] -> Hạ Chấn [1,0,0], Thượng Khôn [0,0,0] -> Địa Lôi Phục (24)
      const trio = castHexagramTrio('000000', 1);

      expect(trio.primary.number).toBe(2);
      expect(trio.transformed.number).toBe(24);
      expect(trio.transformed.name).toBe('Địa Lôi Phục');
      expect(trio.transformed.binary).toBe('100000');
    });
  });

  describe('4. Trường hợp NHIỀU hào động', () => {
    it('Thuần Càn hào 1 và hào 4 động -> Quẻ Biến là Thuần Tốn (Quẻ 57)', () => {
      // Thuần Càn: 111111, hào 1 và 4 đảo 1 -> 0
      // Dãy hào biến: [0, 1, 1, 0, 1, 1] -> Hạ Tốn [0,1,1], Thượng Tốn [0,1,1] -> Thuần Tốn (57)
      const trio = castHexagramTrio('111111', [1, 4]);

      expect(trio.movingLineIndices).toEqual([1, 4]);
      expect(trio.primary.lines[0]!.isMoving).toBe(true);
      expect(trio.primary.lines[3]!.isMoving).toBe(true);
      expect(trio.primary.lines[1]!.isMoving).toBe(false);

      expect(trio.transformed.number).toBe(57);
      expect(trio.transformed.name).toBe('Thuần Tốn');
      expect(trio.transformed.binary).toBe('011011');
    });

    it('Địa Thiên Thái (Quẻ 11) hào 2 và hào 5 động -> Quẻ Biến là Thủy Hỏa Ký Tế (Quẻ 63)', () => {
      // Địa Thiên Thái: [1, 1, 1, 0, 0, 0] (Hạ Càn, Thượng Khôn)
      // Hào 2 động (1 -> 0), Hào 5 động (0 -> 1)
      // Dãy hào biến: [1, 0, 1, 0, 1, 0] -> Hạ Ly [1,0,1], Thượng Khảm [0,1,0] -> Thủy Hỏa Ký Tế (63)
      const trio = castHexagramTrio('111000', [2, 5]);

      expect(trio.primary.number).toBe(11);
      expect(trio.transformed.number).toBe(63);
      expect(trio.transformed.name).toBe('Thủy Hỏa Ký Tế');
      expect(trio.transformed.binary).toBe('101010');
    });
  });

  describe('5. Trường hợp CẢ SÁU hào động', () => {
    it('Thuần Càn cả 6 hào động -> Quẻ Biến là Thuần Khôn (Quẻ 2)', () => {
      // 111111 đảo cả 6 hào -> 000000 (Thuần Khôn)
      const trio = castHexagramTrio('111111', [1, 2, 3, 4, 5, 6]);

      expect(trio.movingLineIndices).toEqual([1, 2, 3, 4, 5, 6]);
      expect(trio.primary.lines.every((l) => l.isMoving)).toBe(true);

      expect(trio.transformed.number).toBe(2);
      expect(trio.transformed.name).toBe('Thuần Khôn');
      expect(trio.transformed.binary).toBe('000000');
    });

    it('Thuần Khôn cả 6 hào động -> Quẻ Biến là Thuần Càn (Quẻ 1)', () => {
      // 000000 đảo cả 6 hào -> 111111 (Thuần Càn)
      const trio = castHexagramTrio('000000', [1, 2, 3, 4, 5, 6]);

      expect(trio.transformed.number).toBe(1);
      expect(trio.transformed.name).toBe('Thuần Càn');
      expect(trio.transformed.binary).toBe('111111');
    });

    it('Thủy Hỏa Ký Tế (Quẻ 63) cả 6 hào động -> Quẻ Biến là Hỏa Thủy Vị Tế (Quẻ 64)', () => {
      // 101010 đảo cả 6 hào -> 010101 (Hỏa Thủy Vị Tế)
      const trio = castHexagramTrio('101010', [1, 2, 3, 4, 5, 6]);

      expect(trio.primary.number).toBe(63);
      expect(trio.transformed.number).toBe(64);
      expect(trio.transformed.name).toBe('Hỏa Thủy Vị Tế');
      expect(trio.transformed.binary).toBe('010101');
    });
  });

  describe('6. Kiểm tra QUẺ HỖ (Nuclear Hexagram)', () => {
    it('Quẻ Hỗ của Thuần Càn (111111) là Thuần Càn (Quẻ 1)', () => {
      const hex = createPrimaryHexagram('111111');
      const nuclear = createNuclearHexagram(hex);
      expect(nuclear.number).toBe(1);
      expect(nuclear.binary).toBe('111111');
    });

    it('Quẻ Hỗ của Thuần Khôn (000000) là Thuần Khôn (Quẻ 2)', () => {
      const hex = createPrimaryHexagram('000000');
      const nuclear = createNuclearHexagram(hex);
      expect(nuclear.number).toBe(2);
      expect(nuclear.binary).toBe('000000');
    });

    it('Quẻ Hỗ của Thủy Lôi Truân (Quẻ 3) là Sơn Địa Bác (Quẻ 23)', () => {
      // Truân: [1, 0, 0, 0, 1, 0]
      // Hạ hỗ (hào 2, 3, 4): [0, 0, 0] = Khôn
      // Thượng hỗ (hào 3, 4, 5): [0, 0, 1] = Cấn
      // Thượng Cấn, Hạ Khôn -> Sơn Địa Bác (23)
      const hex = createPrimaryHexagram('100010');
      const nuclear = createNuclearHexagram(hex);
      expect(nuclear.number).toBe(23);
      expect(nuclear.name).toBe('Sơn Địa Bác');
      expect(nuclear.binary).toBe('000001');
    });

    it('Quẻ Hỗ của Hỏa Thủy Vị Tế (Quẻ 64) là Thủy Hỏa Ký Tế (Quẻ 63)', () => {
      // Vị Tế: [0, 1, 0, 1, 0, 1]
      // Hạ hỗ (hào 2, 3, 4): [1, 0, 1] = Ly
      // Thượng hỗ (hào 3, 4, 5): [0, 1, 0] = Khảm
      // Thượng Khảm, Hạ Ly -> Thủy Hỏa Ký Tế (63)
      const hex = createPrimaryHexagram('010101');
      const nuclear = createNuclearHexagram(hex);
      expect(nuclear.number).toBe(63);
      expect(nuclear.name).toBe('Thủy Hỏa Ký Tế');
      expect(nuclear.binary).toBe('101010');
    });

    it('Quẻ Hỗ của Thủy Hỏa Ký Tế (Quẻ 63) là Hỏa Thủy Vị Tế (Quẻ 64)', () => {
      // Ký Tế: [1, 0, 1, 0, 1, 0]
      // Hạ hỗ (hào 2, 3, 4): [0, 1, 0] = Khảm
      // Thượng hỗ (hào 3, 4, 5): [1, 0, 1] = Ly
      // Thượng Ly, Hạ Khảm -> Hỏa Thủy Vị Tế (64)
      const hex = createPrimaryHexagram('101010');
      const nuclear = createNuclearHexagram(hex);
      expect(nuclear.number).toBe(64);
      expect(nuclear.name).toBe('Hỏa Thủy Vị Tế');
      expect(nuclear.binary).toBe('010101');
    });
  });

  describe('7. Kiểm tra xử lý lỗi đầu vào', () => {
    it('ném lỗi InvalidHexagramInputError khi mảng không đủ 6 hào', () => {
      expect(() => createPrimaryHexagram([1, 1, 1, 1, 1] as any)).toThrow(InvalidHexagramInputError);
      expect(() => createPrimaryHexagram([1, 1, 1, 1, 1, 1, 1] as any)).toThrow(InvalidHexagramInputError);
    });

    it('ném lỗi InvalidHexagramInputError khi giá trị hào không phải 0 hoặc 1', () => {
      expect(() => createPrimaryHexagram([1, 2, 1, 0, 0, 0] as any)).toThrow(InvalidHexagramInputError);
      expect(() => createPrimaryHexagram([-1, 0, 1, 0, 0, 0] as any)).toThrow(InvalidHexagramInputError);
    });

    it('ném lỗi InvalidHexagramInputError khi chuỗi ký tự sai quy chuẩn', () => {
      expect(() => createPrimaryHexagram('11111')).toThrow(InvalidHexagramInputError);
      expect(() => createPrimaryHexagram('1111111')).toThrow(InvalidHexagramInputError);
      expect(() => createPrimaryHexagram('11100a')).toThrow(InvalidHexagramInputError);
    });

    it('ném lỗi InvalidMovingLineError khi vị trí hào động ngoài phạm vi 1 đến 6', () => {
      expect(() => castHexagramTrio('111111', 0)).toThrow(InvalidMovingLineError);
      expect(() => castHexagramTrio('111111', 7)).toThrow(InvalidMovingLineError);
      expect(() => castHexagramTrio('111111', [1, 8])).toThrow(InvalidMovingLineError);
      expect(() => castHexagramTrio('111111', -1)).toThrow(InvalidMovingLineError);
    });
  });
});
