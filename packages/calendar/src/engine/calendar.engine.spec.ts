import { describe, it, expect } from 'vitest';
import {
  convertSolarToLunar,
  convertLunarToSolar,
  getLeapMonthOfYear,
  getLunarMonthLength,
  getFullCalendarInfo,
  getCanChiForDateTime,
  getAllHourBranches,
  parseToVietnamDateTime,
} from './calendar.engine';

import {
  calculateYearCanChi,
  calculateMonthCanChi,
  calculateDayCanChi,
  calculateHourCanChi,
  getHourBranchIndex,
} from '../rules/vietnamese-lunar.rule';

describe('Vietnamese Calendar Engine Specification (VN-LUNAR-V1)', () => {
  describe('1. Chuyển đổi Dương lịch <-> Âm lịch Việt Nam (Các mốc chuẩn)', () => {
    it('Tết Nguyên Đán Giáp Thìn 2024: 10/02/2024 -> 01/01/2024 Âm lịch', () => {
      const lunar = convertSolarToLunar(10, 2, 2024);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(2024);
      expect(lunar.isLeap).toBe(false);

      // Chuyển đổi ngược lại: Âm -> Dương
      const solar = convertLunarToSolar(1, 1, 2024, false);
      expect(solar).toEqual({ day: 10, month: 2, year: 2024 });
    });

    it('Tết Nguyên Đán Ất Tỵ 2025: 29/01/2025 -> 01/01/2025 Âm lịch', () => {
      const lunar = convertSolarToLunar(29, 1, 2025);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(2025);
      expect(lunar.isLeap).toBe(false);

      const solar = convertLunarToSolar(1, 1, 2025, false);
      expect(solar).toEqual({ day: 29, month: 1, year: 2025 });
    });

    it('Tết Nguyên Đán Bính Ngọ 2026: 17/02/2026 -> 01/01/2026 Âm lịch', () => {
      const lunar = convertSolarToLunar(17, 2, 2026);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(2026);
      expect(lunar.isLeap).toBe(false);

      const solar = convertLunarToSolar(1, 1, 2026, false);
      expect(solar).toEqual({ day: 17, month: 2, year: 2026 });
    });

    it('Đối chiếu lịch sử: Tết Mậu Thân 1968 tại Việt Nam (UTC+7) là ngày 29/01/1968', () => {
      // Do múi giờ UTC+7, điểm Sóc rơi vào 29/01/1968, trong khi Trung Quốc (UTC+8) là 30/01/1968
      const lunar = convertSolarToLunar(29, 1, 1968);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(1);
      expect(lunar.year).toBe(1968);
    });

    it('Chuyển đổi ngày âm lịch không tồn tại trả về null', () => {
      // Tháng thiếu chỉ có 29 ngày, truy vấn ngày 30 phải trả về null
      // Tháng 1 năm 2024 là tháng thiếu (29 ngày)
      const solar = convertLunarToSolar(30, 1, 2024, false);
      expect(solar).toBeNull();
    });
  });

  describe('2. Kiểm nghiệm Tháng Nhuận (Leap Months)', () => {
    it('Năm Canh Tý 2020: Nhuận tháng 4 âm lịch', () => {
      expect(getLeapMonthOfYear(2020)).toBe(4);

      // Tháng 4 chính: 23/04/2020 là mùng 1 tháng 4
      const lunarNormal = convertSolarToLunar(23, 4, 2020);
      expect(lunarNormal.day).toBe(1);
      expect(lunarNormal.month).toBe(4);
      expect(lunarNormal.isLeap).toBe(false);

      // Tháng 4 nhuận: 23/05/2020 là mùng 1 tháng 4 nhuận
      const lunarLeap = convertSolarToLunar(23, 5, 2020);
      expect(lunarLeap.day).toBe(1);
      expect(lunarLeap.month).toBe(4);
      expect(lunarLeap.isLeap).toBe(true);

      // Chuyển đổi ngược lại tháng nhuận
      const solarFromLeap = convertLunarToSolar(1, 4, 2020, true);
      expect(solarFromLeap).toEqual({ day: 23, month: 5, year: 2020 });
    });

    it('Năm Quý Mão 2023: Nhuận tháng 2 âm lịch', () => {
      expect(getLeapMonthOfYear(2023)).toBe(2);

      // 22/03/2023 là mùng 1 tháng 2 nhuận
      const lunar = convertSolarToLunar(22, 3, 2023);
      expect(lunar.day).toBe(1);
      expect(lunar.month).toBe(2);
      expect(lunar.isLeap).toBe(true);

      const solar = convertLunarToSolar(1, 2, 2023, true);
      expect(solar).toEqual({ day: 22, month: 3, year: 2023 });
    });

    it('Năm thường không nhuận trả về null cho tháng nhuận', () => {
      expect(getLeapMonthOfYear(2024)).toBeNull();
      expect(getLeapMonthOfYear(2026)).toBeNull();
    });

    it('Số ngày trong tháng âm lịch luôn là 29 (thiếu) hoặc 30 (đủ)', () => {
      for (let m = 1; m <= 12; m++) {
        const len = getLunarMonthLength(m, 2024, false);
        expect([29, 30]).toContain(len);
      }
    });
  });

  describe('3. Xác định Can Chi 4 Trụ (Năm, Tháng, Ngày, Giờ)', () => {
    it('Can Chi Năm và Con Giáp tính toán chính xác', () => {
      const year2024 = calculateYearCanChi(2024);
      expect(year2024.name).toBe('Giáp Thìn');
      expect(year2024.zodiac).toBe('Rồng');

      const year2025 = calculateYearCanChi(2025);
      expect(year2025.name).toBe('Ất Tỵ');
      expect(year2025.zodiac).toBe('Rắn');

      const year2026 = calculateYearCanChi(2026);
      expect(year2026.name).toBe('Bính Ngọ');
      expect(year2026.zodiac).toBe('Ngựa');
    });

    it('Can Chi Tháng tính theo chuẩn quy tắc Ngũ Hổ Độn', () => {
      // Năm Giáp Thìn (2024, Can Giáp): Tháng 1 khởi Bính Dần
      expect(calculateMonthCanChi(1, 2024).name).toBe('Bính Dần');
      expect(calculateMonthCanChi(2, 2024).name).toBe('Đinh Mão');
      expect(calculateMonthCanChi(3, 2024).name).toBe('Mậu Thìn');
      expect(calculateMonthCanChi(4, 2024).name).toBe('Kỷ Tỵ');
      expect(calculateMonthCanChi(5, 2024).name).toBe('Canh Ngọ');
      expect(calculateMonthCanChi(6, 2024).name).toBe('Tân Mùi');
      expect(calculateMonthCanChi(7, 2024).name).toBe('Nhâm Thân');
      expect(calculateMonthCanChi(8, 2024).name).toBe('Quý Dậu');
      expect(calculateMonthCanChi(9, 2024).name).toBe('Giáp Tuất');
      expect(calculateMonthCanChi(10, 2024).name).toBe('Ất Hợi');
      expect(calculateMonthCanChi(11, 2024).name).toBe('Bính Tý');
      expect(calculateMonthCanChi(12, 2024).name).toBe('Đinh Sửu');

      // Năm Bính Ngọ (2026, Can Bính): Tháng 1 khởi Canh Dần
      expect(calculateMonthCanChi(1, 2026).name).toBe('Canh Dần');
    });

    it('Can Chi Ngày (Nhật Thần) chính xác theo số ngày Julius', () => {
      // Mốc kiểm chứng quốc tế: 01/01/2000 là ngày Mậu Ngọ (JD = 2451545)
      expect(calculateDayCanChi(2451545).name).toBe('Mậu Ngọ');

      // Ngày 10/02/2024 (mùng 1 Tết Giáp Thìn): Nhật Thần là Giáp Thìn
      const info = getFullCalendarInfo({ day: 10, month: 2, year: 2024, hour: 10 });
      expect(info.canChi.day).toBe('Giáp Thìn');

      // Ngày 30/10/2026 (giờ 14:00): Nhật Thần là Đinh Sửu
      const info2 = getFullCalendarInfo({ day: 30, month: 10, year: 2026, hour: 14 });
      expect(info2.canChi.day).toBe('Đinh Sửu');
    });

    it('Can Chi Giờ tính chuẩn theo quy tắc Ngũ Thử Độn', () => {
      // Ngày Can Giáp (stemIndex = 0): Giờ Tý khởi Giáp Tý
      expect(calculateHourCanChi(0, 0).name).toBe('Giáp Tý');
      expect(calculateHourCanChi(0, 1).name).toBe('Ất Sửu');
      expect(calculateHourCanChi(0, 2).name).toBe('Bính Dần');
      expect(calculateHourCanChi(0, 6).name).toBe('Canh Ngọ');

      // Ngày Can Đinh (stemIndex = 3, ví dụ ngày Đinh Sửu):
      // Can Giờ Tý = (3 * 2 + 0) % 10 = 6 -> Canh Tý
      expect(calculateHourCanChi(3, 0).name).toBe('Canh Tý');
      // Can Giờ Ngọ (chi 6) = (3 * 2 + 6) % 10 = 2 -> Bính Ngọ
      expect(calculateHourCanChi(3, 6).name).toBe('Bính Ngọ');
    });
  });

  describe('4. Phân bổ 12 Địa Chi Giờ (Tý đến Hợi)', () => {
    it('ánh xạ đúng toàn bộ 24 giờ vào 12 Địa Chi giờ đôi', () => {
      expect(getHourBranchIndex(23)).toBe(0);  // Tý
      expect(getHourBranchIndex(0)).toBe(0);   // Tý
      expect(getHourBranchIndex(1)).toBe(1);   // Sửu
      expect(getHourBranchIndex(2)).toBe(1);   // Sửu
      expect(getHourBranchIndex(3)).toBe(2);   // Dần
      expect(getHourBranchIndex(4)).toBe(2);   // Dần
      expect(getHourBranchIndex(5)).toBe(3);   // Mão
      expect(getHourBranchIndex(6)).toBe(3);   // Mão
      expect(getHourBranchIndex(7)).toBe(4);   // Thìn
      expect(getHourBranchIndex(8)).toBe(4);   // Thìn
      expect(getHourBranchIndex(9)).toBe(5);   // Tỵ
      expect(getHourBranchIndex(10)).toBe(5);  // Tỵ
      expect(getHourBranchIndex(11)).toBe(6);  // Ngọ
      expect(getHourBranchIndex(12)).toBe(6);  // Ngọ
      expect(getHourBranchIndex(13)).toBe(7);  // Mùi
      expect(getHourBranchIndex(14)).toBe(7);  // Mùi
      expect(getHourBranchIndex(15)).toBe(8);  // Thân
      expect(getHourBranchIndex(16)).toBe(8);  // Thân
      expect(getHourBranchIndex(17)).toBe(9);  // Dậu
      expect(getHourBranchIndex(18)).toBe(9);  // Dậu
      expect(getHourBranchIndex(19)).toBe(10); // Tuất
      expect(getHourBranchIndex(20)).toBe(10); // Tuất
      expect(getHourBranchIndex(21)).toBe(11); // Hợi
      expect(getHourBranchIndex(22)).toBe(11); // Hợi
    });

    it('getAllHourBranches trả về đủ 12 giờ kèm thông tin Hoàng Đạo / Hắc Đạo', () => {
      const hours = getAllHourBranches(2460351, 0); // Ngày Giáp Thìn
      expect(hours.length).toBe(12);

      const branchNames = hours.map((h) => h.branch);
      expect(branchNames).toEqual([
        'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
        'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi',
      ]);

      // Có sự phân biệt giờ Hoàng Đạo (auspicious) và Hắc Đạo
      const auspiciousHours = hours.filter((h) => h.isAuspicious);
      expect(auspiciousHours.length).toBe(6); // Chuẩn Dịch học: Mỗi ngày có 6 giờ hoàng đạo
    });
  });

  describe('5. Thời điểm chuyển ngày (Giờ Tý: 22:59 -> 23:00 -> 00:00 -> 01:00)', () => {
    it('Lúc 22:59 ngày 30/10/2026: Vẫn thuộc giờ Hợi của ngày Đinh Sửu', () => {
      const info = getFullCalendarInfo(
        { day: 30, month: 10, year: 2026, hour: 22, minute: 59 },
        { dayTransition: 'RAT_HOUR_23' }
      );

      expect(info.currentHourBranch.branch).toBe('Hợi');
      expect(info.canChi.day).toBe('Đinh Sửu');
      expect(info.canChi.hour).toBe('Tân Hợi');
    });

    it('Lúc 23:00 ngày 30/10/2026 với RAT_HOUR_23: Bước sang giờ Tý của ngày mới 31/10/2026 (Mậu Dần)', () => {
      const info = getFullCalendarInfo(
        { day: 30, month: 10, year: 2026, hour: 23, minute: 0 },
        { dayTransition: 'RAT_HOUR_23' }
      );

      expect(info.currentHourBranch.branch).toBe('Tý');
      expect(info.canChi.day).toBe('Mậu Dần'); // Chuyển sang ngày mới theo cổ pháp Dịch học
      expect(info.canChi.hour).toBe('Nhâm Tý'); // Can ngày Mậu khởi Nhâm Tý
    });

    it('Lúc 23:00 ngày 30/10/2026 với MIDNIGHT: Vẫn giữ ngày cũ (Dạ Tý)', () => {
      const info = getFullCalendarInfo(
        { day: 30, month: 10, year: 2026, hour: 23, minute: 0 },
        { dayTransition: 'MIDNIGHT' }
      );

      expect(info.currentHourBranch.branch).toBe('Tý');
      expect(info.canChi.day).toBe('Đinh Sửu'); // Giữ ngày cũ theo lịch dân sự
      expect(info.canChi.hour).toBe('Canh Tý'); // Can ngày Đinh khởi Canh Tý
    });

    it('Lúc 00:00 ngày 31/10/2026 (Chính Tý): Cả hai chế độ đều đồng nhất là ngày Mậu Dần', () => {
      const infoRat = getFullCalendarInfo(
        { day: 31, month: 10, year: 2026, hour: 0, minute: 0 },
        { dayTransition: 'RAT_HOUR_23' }
      );
      const infoMid = getFullCalendarInfo(
        { day: 31, month: 10, year: 2026, hour: 0, minute: 0 },
        { dayTransition: 'MIDNIGHT' }
      );

      expect(infoRat.canChi.day).toBe('Mậu Dần');
      expect(infoRat.canChi.hour).toBe('Nhâm Tý');
      expect(infoMid.canChi.day).toBe('Mậu Dần');
      expect(infoMid.canChi.hour).toBe('Nhâm Tý');
    });

    it('Lúc 01:00 ngày 31/10/2026: Bước sang giờ Sửu (Quý Sửu)', () => {
      const info = getFullCalendarInfo({ day: 31, month: 10, year: 2026, hour: 1, minute: 0 });
      expect(info.currentHourBranch.branch).toBe('Sửu');
      expect(info.canChi.day).toBe('Mậu Dần');
      expect(info.canChi.hour).toBe('Quý Sửu');
    });
  });

  describe('6. Kiểm tra parse thời gian ISO và Múi giờ Asia/Ho_Chi_Minh', () => {
    it('phân giải chuỗi ISO 8601 chuẩn UTC sang đúng giờ Asia/Ho_Chi_Minh', () => {
      // 2024-02-09T17:00:00.000Z tương ứng với 2024-02-10T00:00:00.000+07:00 (Mùng 1 Tết Giáp Thìn)
      const parsed = parseToVietnamDateTime('2024-02-09T17:00:00.000Z');
      expect(parsed.year).toBe(2024);
      expect(parsed.month).toBe(2);
      expect(parsed.day).toBe(10);
      expect(parsed.hour).toBe(0);
      expect(parsed.minute).toBe(0);

      const canChi = getCanChiForDateTime('2024-02-09T17:00:00.000Z');
      expect(canChi.year).toBe('Giáp Thìn');
      expect(canChi.day).toBe('Giáp Thìn');
    });

    it('ném lỗi khi định dạng ngày không hợp lệ', () => {
      expect(() => parseToVietnamDateTime('invalid-date')).toThrow(/Thời gian đầu vào không hợp lệ/);
    });
  });
});
