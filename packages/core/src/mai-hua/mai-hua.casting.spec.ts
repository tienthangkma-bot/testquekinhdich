import { describe, it, expect } from 'vitest';
import {
  castByMaiHua,
  castByDateTime,
  MAI_HUA_BRANCH_MAP,
  MAI_HUA_NUMBER_TO_BRANCH,
} from './mai-hua.casting';
import { InvalidMaiHuaInputError } from '../hexagram/errors';
import { TrigramCode } from '@kindich/domain';

describe('Mai Hua Casting Engine Specification (MAI-HUA-V1)', () => {
  describe('1. Bảng quy ước 12 Địa Chi (1-based index: Tý=1 đến Hợi=12)', () => {
    it('ánh xạ chính xác tên Địa Chi sang số 1 đến 12 và ngược lại', () => {
      expect(MAI_HUA_BRANCH_MAP['Tý']).toBe(1);
      expect(MAI_HUA_BRANCH_MAP['Sửu']).toBe(2);
      expect(MAI_HUA_BRANCH_MAP['Dần']).toBe(3);
      expect(MAI_HUA_BRANCH_MAP['Mão']).toBe(4);
      expect(MAI_HUA_BRANCH_MAP['Thìn']).toBe(5);
      expect(MAI_HUA_BRANCH_MAP['Tỵ']).toBe(6);
      expect(MAI_HUA_BRANCH_MAP['Ngọ']).toBe(7);
      expect(MAI_HUA_BRANCH_MAP['Mùi']).toBe(8);
      expect(MAI_HUA_BRANCH_MAP['Thân']).toBe(9);
      expect(MAI_HUA_BRANCH_MAP['Dậu']).toBe(10);
      expect(MAI_HUA_BRANCH_MAP['Tuất']).toBe(11);
      expect(MAI_HUA_BRANCH_MAP['Hợi']).toBe(12);

      for (let i = 1; i <= 12; i++) {
        const name = MAI_HUA_NUMBER_TO_BRANCH[i]!;
        expect(MAI_HUA_BRANCH_MAP[name]).toBe(i);
      }
    });
  });

  describe('2. Kiểm nghiệm ví dụ chuẩn: Năm Ngọ (7), tháng 8, ngày 15, giờ Tuất (11)', () => {
    it('tính toán chính xác Thượng Khảm, Hạ Càn, Hào 5 động, Thủy Thiên Nhu, Thượng Dụng - Hạ Thể', () => {
      const result = castByMaiHua({
        yearBranch: 7, // Ngọ
        month: 8,
        day: 15,
        hourBranch: 11, // Tuất
      });

      // 1. Kiểm tra phiên bản và quy tắc
      expect(result.algorithmVersion).toBe('MAI-HUA-V1');
      expect(result.calendarRuleVersion).toBe('VN-LUNAR-V1');
      expect(result.timeZone).toBe('Asia/Ho_Chi_Minh');

      // 2. Thượng quái: (7 + 8 + 15) = 30 -> 30 mod 8 = 6 (Khảm)
      expect(result.upperSum).toBe(30);
      expect(result.upperTrigramNumber).toBe(6);
      expect(result.upperTrigram.code).toBe(TrigramCode.KHAM);
      expect(result.upperTrigram.name).toBe('Khảm');

      // 3. Hạ quái: (7 + 8 + 15 + 11) = 41 -> 41 mod 8 = 1 (Càn)
      expect(result.lowerSum).toBe(41);
      expect(result.totalSum).toBe(41);
      expect(result.lowerTrigramNumber).toBe(1);
      expect(result.lowerTrigram.code).toBe(TrigramCode.CAN);
      expect(result.lowerTrigram.name).toBe('Càn');

      // 4. Hào động: 41 mod 6 = 5 (Hào 5 động)
      expect(result.movingLine).toBe(5);

      // 5. Quẻ Chủ: Thượng Khảm, Hạ Càn -> Thủy Thiên Nhu (Quẻ #5 Văn Vương)
      expect(result.trio.primary.number).toBe(5);
      expect(result.trio.primary.name).toBe('Thủy Thiên Nhu');
      expect(result.trio.primary.lines[4]!.isMoving).toBe(true);

      // 6. Phân tích Thể / Dụng: Hào 5 thuộc Thượng quái -> Thượng quái là Dụng, Hạ quái là Thể
      expect(result.theDung.thePosition).toBe('LOWER');
      expect(result.theDung.theTrigram.code).toBe(TrigramCode.CAN);
      expect(result.theDung.theTrigram.name).toBe('Càn');

      expect(result.theDung.dungPosition).toBe('UPPER');
      expect(result.theDung.dungTrigram.code).toBe(TrigramCode.KHAM);
      expect(result.theDung.dungTrigram.name).toBe('Khảm');

      expect(result.theDung.summary).toContain('Hào 5 động thuộc Thượng quái (Khảm) nên Thượng quái là Dụng; Hạ quái (Càn) là Thể.');

      // 7. Quẻ Biến: Đảo hào 5 (1 -> 0) -> Thượng Khôn (000), Hạ Càn (111) -> Địa Thiên Thái (Quẻ #11 Văn Vương)
      expect(result.trio.transformed.number).toBe(11);
      expect(result.trio.transformed.name).toBe('Địa Thiên Thái');

      // 8. Quẻ Hỗ: Hạ hỗ (2,3,4) = Đoài, Thượng hỗ (3,4,5) = Ly -> Hỏa Trạch Khuê (Quẻ #38 Văn Vương)
      expect(result.trio.nuclear.number).toBe(38);
      expect(result.trio.nuclear.name).toBe('Hỏa Trạch Khuê');
    });

    it('hỗ trợ truyền trực tiếp tên Địa Chi dạng chuỗi ("Ngọ", "Tuất")', () => {
      const result = castByMaiHua({
        yearBranch: 'Ngọ',
        month: 8,
        day: 15,
        hourBranch: 'Tuất',
      });

      expect(result.input.yearBranchNumber).toBe(7);
      expect(result.input.yearBranchName).toBe('Ngọ');
      expect(result.input.hourBranchNumber).toBe(11);
      expect(result.input.hourBranchName).toBe('Tuất');
      expect(result.trio.primary.name).toBe('Thủy Thiên Nhu');
      expect(result.movingLine).toBe(5);
    });
  });

  describe('3. Kiểm nghiệm phân tích Thể/Dụng khi hào động ở Hạ quái (hào 1, 2, 3)', () => {
    it('hào 2 động: Hạ quái là Dụng, Thượng quái là Thể', () => {
      // Chọn tham số để tổng chia 6 dư 2:
      // Năm Tý (1), tháng 1, ngày 6 -> Thượng: 1+1+6 = 8 -> dư 0 lấy 8 (Khôn)
      // Giờ Sửu (2) -> Hạ/Tổng: 8 + 2 = 10 -> 10 mod 8 = 2 (Đoài). Hào động: 10 mod 6 = 4
      // Chọn: Năm Tý (1), tháng 1, ngày 4 -> Thượng: 1+1+4 = 6 (Khảm)
      // Giờ Sửu (2) -> Hạ/Tổng: 6 + 2 = 8 -> 8 mod 8 = 0 lấy 8 (Khôn). Hào động: 8 mod 6 = 2 (Hào 2 động)
      const result = castByMaiHua({
        yearBranch: 'Tý', // 1
        month: 1,
        day: 4,
        hourBranch: 'Sửu', // 2
      });

      expect(result.upperSum).toBe(6);
      expect(result.upperTrigramNumber).toBe(6); // Khảm
      expect(result.lowerSum).toBe(8);
      expect(result.lowerTrigramNumber).toBe(8); // Khôn (dư 0 lấy 8)
      expect(result.movingLine).toBe(2); // 8 mod 6 = 2 (Hào 2 động)

      // Quẻ Chủ: Thượng Khảm, Hạ Khôn -> Thủy Địa Tỷ (Quẻ #8)
      expect(result.trio.primary.number).toBe(8);
      expect(result.trio.primary.name).toBe('Thủy Địa Tỷ');

      // Hào 2 động nằm ở Hạ quái (Khôn) -> Hạ quái là Dụng, Thượng quái (Khảm) là Thể
      expect(result.theDung.thePosition).toBe('UPPER');
      expect(result.theDung.theTrigram.name).toBe('Khảm');
      expect(result.theDung.dungPosition).toBe('LOWER');
      expect(result.theDung.dungTrigram.name).toBe('Khôn');
      expect(result.theDung.summary).toContain('Hào 2 động thuộc Hạ quái (Khôn) nên Hạ quái là Dụng; Thượng quái (Khảm) là Thể.');
    });
  });

  describe('4. Quy tắc chia hết lấy số dư 0 -> 8 và 0 -> 6', () => {
    it('thượng quái chia hết cho 8 thì quái số là 8 (Khôn)', () => {
      // 8 mod 8 = 0 -> lấy 8
      const result = castByMaiHua({
        yearBranch: 'Dần', // 3
        month: 2,
        day: 3, // Tổng thượng = 3 + 2 + 3 = 8 -> lấy 8 (Khôn)
        hourBranch: 'Tý', // 1 -> Tổng hạ = 9 -> 1 (Càn). Hào động: 9 mod 6 = 3
      });

      expect(result.upperTrigramNumber).toBe(8);
      expect(result.upperTrigram.code).toBe(TrigramCode.KHON);
      expect(result.lowerTrigramNumber).toBe(1);
      expect(result.movingLine).toBe(3);
    });

    it('tổng chia hết cho 6 thì hào động là hào 6', () => {
      // Năm Dần (3), tháng 1, ngày 2 -> Thượng = 6 (Khảm)
      // Giờ Hợi (12) -> Tổng = 18 -> 18 mod 8 = 2 (Đoài). Hào động: 18 mod 6 = 0 -> lấy hào 6
      const result = castByMaiHua({
        yearBranch: 3,
        month: 1,
        day: 2,
        hourBranch: 12,
      });

      expect(result.upperSum).toBe(6);
      expect(result.upperTrigramNumber).toBe(6); // Khảm
      expect(result.lowerSum).toBe(18);
      expect(result.lowerTrigramNumber).toBe(2); // Đoài
      expect(result.movingLine).toBe(6); // 18 mod 6 = 0 -> lấy 6

      // Hào 6 động nằm ở Thượng quái -> Thượng quái là Dụng, Hạ quái là Thể
      expect(result.theDung.thePosition).toBe('LOWER');
      expect(result.theDung.dungPosition).toBe('UPPER');
    });
  });

  describe('5. Tự động chuyển đổi năm Dương lịch thành Địa Chi năm', () => {
    it('tự nhận diện năm 2026 là năm Bính Ngọ (Chi Ngọ = 7)', () => {
      const result = castByMaiHua({
        yearBranch: 2026,
        month: 8,
        day: 15,
        hourBranch: 'Tuất',
      });

      expect(result.input.yearBranchNumber).toBe(7);
      expect(result.input.yearBranchName).toBe('Ngọ');
      expect(result.trio.primary.name).toBe('Thủy Thiên Nhu');
    });

    it('tự nhận diện năm 2024 là năm Giáp Thìn (Chi Thìn = 5)', () => {
      const result = castByMaiHua({
        yearBranch: 2024,
        month: 1,
        day: 1,
        hourBranch: 'Tý',
      });

      expect(result.input.yearBranchNumber).toBe(5);
      expect(result.input.yearBranchName).toBe('Thìn');
    });
  });

  describe('6. Kiểm tra các trường hợp không hợp lệ', () => {
    it('ném lỗi khi tháng âm lịch ngoài khoảng 1-12', () => {
      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 0, day: 15, hourBranch: 11 })
      ).toThrow(InvalidMaiHuaInputError);

      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 13, day: 15, hourBranch: 11 })
      ).toThrow(InvalidMaiHuaInputError);
    });

    it('ném lỗi khi ngày âm lịch ngoài khoảng 1-30', () => {
      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 8, day: 0, hourBranch: 11 })
      ).toThrow(InvalidMaiHuaInputError);

      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 8, day: 31, hourBranch: 11 })
      ).toThrow(InvalidMaiHuaInputError);
    });

    it('ném lỗi khi tên Địa Chi không hợp lệ', () => {
      expect(() =>
        castByMaiHua({ yearBranch: 'Voi' as any, month: 8, day: 15, hourBranch: 11 })
      ).toThrow(InvalidMaiHuaInputError);

      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 8, day: 15, hourBranch: 0 as any })
      ).toThrow(InvalidMaiHuaInputError);

      expect(() =>
        castByMaiHua({ yearBranch: 7, month: 8, day: 15, hourBranch: 13 as any })
      ).toThrow(InvalidMaiHuaInputError);
    });
  });

  describe('7. Tích hợp lập quẻ theo thời điểm Dương lịch (castByDateTime)', () => {
    it('khởi quẻ thành công từ ngày giờ Dương lịch chuẩn Asia/Ho_Chi_Minh', () => {
      // 10/02/2024 là mùng 1 Tết Giáp Thìn (Năm Thìn = 5, Tháng 1, Ngày 1)
      // Lúc 07:30 sáng là giờ Thìn (chi 5)
      // Thượng = 5 + 1 + 1 = 7 (Cấn)
      // Hạ/Tổng = 7 + 5 = 12 -> 12 mod 8 = 4 (Chấn)
      // Hào động = 12 mod 6 = 0 -> hào 6 động
      const result = castByDateTime({ day: 10, month: 2, year: 2024, hour: 7, minute: 30 });

      expect(result.input.yearBranchName).toBe('Thìn');
      expect(result.input.yearBranchNumber).toBe(5);
      expect(result.input.month).toBe(1);
      expect(result.input.day).toBe(1);
      expect(result.input.hourBranchName).toBe('Thìn');
      expect(result.input.hourBranchNumber).toBe(5);

      expect(result.upperTrigramNumber).toBe(7); // Cấn
      expect(result.lowerTrigramNumber).toBe(4); // Chấn
      expect(result.movingLine).toBe(6); // Hào 6 động

      // Quẻ Chủ: Thượng Cấn (Sơn), Hạ Chấn (Lôi) -> Sơn Lôi Di (Quẻ #27)
      expect(result.trio.primary.number).toBe(27);
      expect(result.trio.primary.name).toBe('Sơn Lôi Di');
    });
  });
});
