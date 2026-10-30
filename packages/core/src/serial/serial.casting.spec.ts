import { describe, it, expect } from 'vitest';
import { castBySerial, calculateModuloRemainder } from './serial.casting';
import { InvalidSerialInputError } from '../hexagram/errors';
import { TrigramCode } from '@kindich/domain';

describe('Serial Casting Module Specification (SERIAL-MOD8-V1)', () => {
  describe('Hàm hỗ trợ calculateModuloRemainder', () => {
    it('chia hết (dư 0) phải trả về chính số chia (divisor)', () => {
      expect(calculateModuloRemainder(8, 8)).toBe(8);
      expect(calculateModuloRemainder(16, 8)).toBe(8);
      expect(calculateModuloRemainder(0, 8)).toBe(8);
      expect(calculateModuloRemainder(6, 6)).toBe(6);
      expect(calculateModuloRemainder(12, 6)).toBe(6);
      expect(calculateModuloRemainder(0, 6)).toBe(6);
    });

    it('chia có dư trả về đúng số dư', () => {
      expect(calculateModuloRemainder(9, 8)).toBe(1);
      expect(calculateModuloRemainder(15, 8)).toBe(7);
      expect(calculateModuloRemainder(14, 6)).toBe(2);
      expect(calculateModuloRemainder(21, 6)).toBe(3);
    });
  });

  describe('1. Kiểm nghiệm với seri mẫu "123456"', () => {
    it('tính toán chính xác theo đúng từng bước thuật toán SERIAL-MOD8-V1', () => {
      const result = castBySerial('123456');

      expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.serialNumber).toBe('123456');

      // Vị trí lẻ (1, 3, 5): 1 + 3 + 5 = 9
      expect(result.oddSum).toBe(9);
      // 9 mod 8 = 1 -> Thượng quái số 1 = Càn
      expect(result.upperTrigramNumber).toBe(1);
      expect(result.upperTrigram.code).toBe(TrigramCode.CAN);

      // Vị trí chẵn (2, 4, 6): 2 + 4 + 6 = 12
      expect(result.evenSum).toBe(12);
      // 12 mod 8 = 4 -> Hạ quái số 4 = Chấn
      expect(result.lowerTrigramNumber).toBe(4);
      expect(result.lowerTrigram.code).toBe(TrigramCode.CHAN);

      // Tổng tất cả chữ số = 21
      expect(result.totalSum).toBe(21);
      // 21 mod 6 = 3 -> Hào 3 động
      expect(result.movingLine).toBe(3);

      // Quẻ Chủ: Thượng Càn, Hạ Chấn -> Thiên Lôi Vô Vọng (Quẻ 25)
      expect(result.trio.primary.number).toBe(25);
      expect(result.trio.primary.name).toBe('Thiên Lôi Vô Vọng');
      expect(result.trio.primary.binary).toBe('100111');
      expect(result.trio.primary.lines[2]!.isMoving).toBe(true);

      // Quẻ Biến: Hào 3 động (0 -> 1) -> Hạ Ly (101), Thượng Càn (111) -> Thiên Hỏa Đồng Nhân (Quẻ 13)
      expect(result.trio.transformed.number).toBe(13);
      expect(result.trio.transformed.name).toBe('Thiên Hỏa Đồng Nhân');
      expect(result.trio.transformed.binary).toBe('101111');

      // Quẻ Hỗ: Hạ hỗ (2,3,4) = [0,0,1] (Cấn), Thượng hỗ (3,4,5) = [0,1,1] (Tốn) -> Phong Sơn Tiệm (Quẻ 53)
      expect(result.trio.nuclear.number).toBe(53);
      expect(result.trio.nuclear.name).toBe('Phong Sơn Tiệm');
      expect(result.trio.nuclear.binary).toBe('001011');
    });
  });

  describe('2. Kiểm nghiệm với seri có số 0 ở đầu', () => {
    it('giữ nguyên số 0 ở đầu seri: "091234"', () => {
      // Vị trí: 1:0, 2:9, 3:1, 4:2, 5:3, 6:4
      // Lẻ (1,3,5): 0 + 1 + 3 = 4 -> 4 mod 8 = 4 (Chấn - Thượng quái)
      // Chẵn (2,4,6): 9 + 2 + 4 = 15 -> 15 mod 8 = 7 (Cấn - Hạ quái)
      // Tổng = 19 -> 19 mod 6 = 1 (Hào 1 động)
      const result = castBySerial('091234');

      expect(result.serialNumber).toBe('091234');
      expect(result.oddSum).toBe(4);
      expect(result.evenSum).toBe(15);
      expect(result.totalSum).toBe(19);

      expect(result.upperTrigramNumber).toBe(4); // Chấn
      expect(result.upperTrigram.code).toBe(TrigramCode.CHAN);

      expect(result.lowerTrigramNumber).toBe(7); // Cấn
      expect(result.lowerTrigram.code).toBe(TrigramCode.CAN_SON);

      expect(result.movingLine).toBe(1);

      // Thượng Chấn, Hạ Cấn -> Lôi Sơn Tiểu Quá (Quẻ 62)
      expect(result.trio.primary.number).toBe(62);
      expect(result.trio.primary.name).toBe('Lôi Sơn Tiểu Quá');

      // Hào 1 động (0 -> 1) -> Hạ Ly (101), Thượng Chấn (100) -> Lôi Hỏa Phong (Quẻ 55)
      expect(result.trio.transformed.number).toBe(55);
      expect(result.trio.transformed.name).toBe('Lôi Hỏa Phong');
    });

    it('xử lý chuỗi nhiều số 0: "000000"', () => {
      // Lẻ: 0 -> dư 0 lấy 8 (Khôn)
      // Chẵn: 0 -> dư 0 lấy 8 (Khôn)
      // Tổng: 0 -> dư 0 lấy 6 (Hào 6 động)
      const result = castBySerial('000000');

      expect(result.upperTrigramNumber).toBe(8);
      expect(result.lowerTrigramNumber).toBe(8);
      expect(result.movingLine).toBe(6);

      // Quẻ Chủ: Thuần Khôn (Quẻ 2)
      expect(result.trio.primary.number).toBe(2);
      expect(result.trio.primary.name).toBe('Thuần Khôn');

      // Hào 6 động (0 -> 1) -> Thượng Cấn (001), Hạ Khôn (000) -> Sơn Địa Bác (Quẻ 23)
      expect(result.trio.transformed.number).toBe(23);
      expect(result.trio.transformed.name).toBe('Sơn Địa Bác');
    });
  });

  describe('3. Kiểm nghiệm với seri tối thiểu 2 chữ số', () => {
    it('seri đúng 2 chữ số: "08"', () => {
      // Vị trí: 1:0, 2:8
      // Lẻ: 0 -> dư 0 lấy 8 (Khôn)
      // Chẵn: 8 -> 8 mod 8 = 0 -> lấy 8 (Khôn)
      // Tổng: 8 -> 8 mod 6 = 2 (Hào 2 động)
      const result = castBySerial('08');

      expect(result.oddSum).toBe(0);
      expect(result.evenSum).toBe(8);
      expect(result.totalSum).toBe(8);

      expect(result.upperTrigramNumber).toBe(8);
      expect(result.lowerTrigramNumber).toBe(8);
      expect(result.movingLine).toBe(2);

      // Quẻ Chủ: Thuần Khôn (Quẻ 2)
      expect(result.trio.primary.number).toBe(2);
      // Hào 2 động (0 -> 1) -> Hạ Khảm (010), Thượng Khôn (000) -> Địa Thủy Sư (Quẻ 7)
      expect(result.trio.transformed.number).toBe(7);
      expect(result.trio.transformed.name).toBe('Địa Thủy Sư');
    });

    it('seri đúng 2 chữ số: "11"', () => {
      // Vị trí: 1:1, 2:1
      // Lẻ: 1 -> 1 (Càn)
      // Chẵn: 1 -> 1 (Càn)
      // Tổng: 2 -> 2 (Hào 2 động)
      const result = castBySerial('11');

      expect(result.upperTrigramNumber).toBe(1);
      expect(result.lowerTrigramNumber).toBe(1);
      expect(result.movingLine).toBe(2);

      // Quẻ Chủ: Thuần Càn (Quẻ 1)
      expect(result.trio.primary.number).toBe(1);
      // Hào 2 động (1 -> 0) -> Hạ Ly (101), Thượng Càn (111) -> Thiên Hỏa Đồng Nhân (Quẻ 13)
      expect(result.trio.transformed.number).toBe(13);
      expect(result.trio.transformed.name).toBe('Thiên Hỏa Đồng Nhân');
    });

    it('seri đúng 2 chữ số: "86"', () => {
      // Vị trí: 1:8, 2:6
      // Lẻ: 8 -> dư 0 lấy 8 (Khôn)
      // Chẵn: 6 -> 6 (Khảm)
      // Tổng: 14 -> 14 mod 6 = 2 (Hào 2 động)
      const result = castBySerial('86');

      expect(result.upperTrigramNumber).toBe(8); // Khôn
      expect(result.lowerTrigramNumber).toBe(6); // Khảm
      expect(result.movingLine).toBe(2);

      // Thượng Khôn, Hạ Khảm -> Địa Thủy Sư (Quẻ 7)
      expect(result.trio.primary.number).toBe(7);
      expect(result.trio.primary.name).toBe('Địa Thủy Sư');
    });
  });

  describe('4. Kiểm nghiệm quy tắc lấy số dư 0 -> 8 và 0 -> 6', () => {
    it('tổng chia hết cho 6 thì hào động là 6: "42"', () => {
      // Lẻ: 4, Chẵn: 2, Tổng = 6 -> 6 mod 6 = 0 -> hào 6 động
      const result = castBySerial('42');
      expect(result.movingLine).toBe(6);
    });

    it('tổng vị trí lẻ và chẵn chia hết cho 8 thì quái là 8: "88"', () => {
      // Lẻ: 8 -> 8, Chẵn: 8 -> 8
      const result = castBySerial('88');
      expect(result.upperTrigramNumber).toBe(8);
      expect(result.lowerTrigramNumber).toBe(8);
    });
  });

  describe('5. Kiểm tra các trường hợp không hợp lệ', () => {
    it('ném InvalidSerialInputError khi chuỗi rỗng hoặc có ít hơn 2 chữ số', () => {
      expect(() => castBySerial('')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('1')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('0')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('   ')).toThrow(InvalidSerialInputError);
    });

    it('ném InvalidSerialInputError khi chứa chữ cái hoặc ký tự đặc biệt', () => {
      expect(() => castBySerial('12A34')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('AA123456')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('12 34')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('12-34')).toThrow(InvalidSerialInputError);
      expect(() => castBySerial('!@#$%^')).toThrow(InvalidSerialInputError);
    });

    it('ném InvalidSerialInputError khi đối số không phải chuỗi', () => {
      expect(() => castBySerial(null as any)).toThrow(InvalidSerialInputError);
      expect(() => castBySerial(undefined as any)).toThrow(InvalidSerialInputError);
      expect(() => castBySerial(123456 as any)).toThrow(InvalidSerialInputError);
    });
  });
});
