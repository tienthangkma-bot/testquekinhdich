/**
 * Module Quy Tắc Lịch Âm Dương Việt Nam Độc Lập
 *
 * PHIÊN BẢN: VN-LUNAR-V1
 *
 * CĂN CỨ KHOA HỌC & PHÁP LÝ:
 * 1. Múi giờ chuẩn: UTC+7 (Kinh tuyến 105° Đông), múi giờ Asia/Ho_Chi_Minh.
 *    Căn cứ Quyết định 121/CP (08/08/1967) và Quyết định 134/2002/QĐ-TTg.
 * 2. Thuật toán thiên văn: Tính toán vị trí Mặt Trăng và Mặt Trời theo mô hình Jean Meeus
 *    (Astronomical Algorithms) và VSOP87 (Bureau des Longitudes).
 * 3. Quy tắc Tháng Nhuận: Tháng âm lịch nào không chứa Trung Khí (Major Solar Term)
 *    là tháng nhuận; Đông Chí luôn nằm ở tháng 11 âm lịch.
 * 4. Quy tắc Can Chi:
 *    - Năm: Can (Năm + 6) mod 10, Chi (Năm + 8) mod 12.
 *    - Tháng (Ngũ Hổ Độn): Khởi từ Bính Dần (năm Giáp/Kỷ), Mậu Dần (Ất/Canh), Canh Dần (Bính/Tân),
 *      Nhâm Dần (Đinh/Nhâm), Giáp Dần (Mậu/Quý).
 *    - Ngày: Tính theo số ngày Julius (JD). Can (JD + 9) mod 10, Chi (JD + 1) mod 12.
 *    - Giờ (Ngũ Thử Độn): Can (CanNgày * 2 + ChiGiờ) mod 10.
 *    - 12 Địa Chi giờ: Chia 24 giờ thành 12 canh giờ đôi, bắt đầu từ giờ Tý (23:00 - 00:59).
 */

import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  HeavenlyStem,
  EarthlyBranch,
  ZodiacAnimal,
  VN_TIMEZONE_OFFSET,
  VN_TIMEZONE_NAME,
  CALENDAR_RULE_VERSION,
} from '../constants';

/**
 * Trả về Thiên Can theo chỉ số (0 đến 9)
 */
export function getHeavenlyStemByIndex(index: number): HeavenlyStem {
  const normalized = ((index % 10) + 10) % 10;
  return HEAVENLY_STEMS[normalized]!;
}

/**
 * Trả về Địa Chi theo chỉ số (0 đến 11)
 */
export function getEarthlyBranchByIndex(index: number): EarthlyBranch {
  const normalized = ((index % 12) + 12) % 12;
  return EARTHLY_BRANCHES[normalized]!;
}

/**
 * Trả về Con Giáp theo chỉ số Địa Chi (0 đến 11)
 */
export function getZodiacAnimalByIndex(index: number): ZodiacAnimal {
  const normalized = ((index % 12) + 12) % 12;
  return ZODIAC_ANIMALS[normalized]!;
}

/**
 * Tính Can Chi của năm âm lịch
 *
 * @param lunarYear Năm âm lịch (ví dụ: 2024, 2026)
 * @returns Chuỗi Can Chi năm (ví dụ: "Giáp Thìn", "Bính Ngọ")
 */
export function calculateYearCanChi(lunarYear: number): {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  name: string;
  zodiac: ZodiacAnimal;
} {
  const stemIndex = ((lunarYear + 6) % 10 + 10) % 10;
  const branchIndex = ((lunarYear + 8) % 12 + 12) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);
  const zodiac = getZodiacAnimalByIndex(branchIndex);

  return {
    stem,
    branch,
    name: `${stem} ${branch}`,
    zodiac,
  };
}

/**
 * Tính Can Chi của tháng âm lịch theo quy tắc "Ngũ Hổ Độn"
 *
 * Quy tắc truyền thống:
 * - Năm Giáp, Kỷ: Tháng Giêng khởi Bính Dần.
 * - Năm Ất, Canh: Tháng Giêng khởi Mậu Dần.
 * - Năm Bính, Tân: Tháng Giêng khởi Canh Dần.
 * - Năm Đinh, Nhâm: Tháng Giêng khởi Nhâm Dần.
 * - Năm Mậu, Quý: Tháng Giêng khởi Giáp Dần.
 *
 * @param lunarMonth Tháng âm lịch (1 đến 12)
 * @param lunarYear Năm âm lịch
 * @returns Chuỗi Can Chi tháng (ví dụ: "Bính Dần", "Mậu Tuất")
 */
export function calculateMonthCanChi(
  lunarMonth: number,
  lunarYear: number
): {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  name: string;
} {
  const yearStemIndex = ((lunarYear + 6) % 10 + 10) % 10;
  // Tháng 1 (Dần) có branchIndex = 2.
  // branchIndex = (lunarMonth + 1) % 12 (Tháng 1 -> 2: Dần, Tháng 11 -> 0: Tý, Tháng 12 -> 1: Sửu)
  const branchIndex = (lunarMonth + 1) % 12;

  // Ngũ Hổ Độn:
  // Can tháng = (CanNăm * 2 + Tháng + 1) % 10
  const stemIndex = (yearStemIndex * 2 + lunarMonth + 1) % 10;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem,
    branch,
    name: `${stem} ${branch}`,
  };
}

/**
 * Tính Can Chi của ngày theo số ngày Julius (JD)
 *
 * @param jd Số ngày Julius (Julian Day Number)
 * @returns Can Chi ngày (Nhật Thần)
 */
export function calculateDayCanChi(jd: number): {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  name: string;
  stemIndex: number;
  branchIndex: number;
} {
  const stemIndex = ((jd + 9) % 10 + 10) % 10;
  const branchIndex = ((jd + 1) % 12 + 12) % 12;

  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(branchIndex);

  return {
    stem,
    branch,
    name: `${stem} ${branch}`,
    stemIndex,
    branchIndex,
  };
}

/**
 * Xác định Địa Chi giờ từ giờ Dương lịch (0 đến 23)
 *
 * Bảng 12 Địa Chi giờ:
 * - Giờ Tý: 23:00 - 00:59 (chỉ số 0)
 * - Giờ Sửu: 01:00 - 02:59 (chỉ số 1)
 * - Giờ Dần: 03:00 - 04:59 (chỉ số 2)
 * - Giờ Mão: 05:00 - 06:59 (chỉ số 3)
 * - Giờ Thìn: 07:00 - 08:59 (chỉ số 4)
 * - Giờ Tỵ: 09:00 - 10:59 (chỉ số 5)
 * - Giờ Ngọ: 11:00 - 12:59 (chỉ số 6)
 * - Giờ Mùi: 13:00 - 14:59 (chỉ số 7)
 * - Giờ Thân: 15:00 - 16:59 (chỉ số 8)
 * - Giờ Dậu: 17:00 - 18:59 (chỉ số 9)
 * - Giờ Tuất: 19:00 - 20:59 (chỉ số 10)
 * - Giờ Hợi: 21:00 - 22:59 (chỉ số 11)
 *
 * @param hour Giờ trong ngày (0 đến 23)
 * @returns Chỉ số Địa Chi từ 0 đến 11
 */
export function getHourBranchIndex(hour: number): number {
  if (hour < 0 || hour > 23) {
    throw new Error(`Giờ không hợp lệ: ${hour}. Giờ phải nằm trong khoảng từ 0 đến 23.`);
  }
  // Công thức: floor((hour + 1) / 2) % 12
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * Trả về dải khung giờ tương ứng với Địa Chi giờ
 *
 * @param branchIndex Chỉ số Địa Chi giờ (0 đến 11)
 * @returns Chuỗi mô tả khung giờ (ví dụ: "23:00 – 00:59")
 */
export function getHourRangeDescription(branchIndex: number): string {
  const startHour = (branchIndex * 2 + 23) % 24;
  const endHour = (startHour + 1) % 24;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(startHour)}:00 – ${pad(endHour)}:59`;
}

/**
 * Tính Can Chi của giờ theo quy tắc "Ngũ Thử Độn"
 *
 * Quy tắc truyền thống:
 * - Ngày Giáp, Kỷ: Giờ Tý khởi Giáp Tý.
 * - Ngày Ất, Canh: Giờ Tý khởi Bính Tý.
 * - Ngày Bính, Tân: Giờ Tý khởi Mậu Tý.
 * - Ngày Đinh, Nhâm: Giờ Tý khởi Canh Tý.
 * - Ngày Mậu, Quý: Giờ Tý khởi Nhâm Tý.
 *
 * Công thức: CanGiờ = (CanNgày * 2 + ChiGiờ) % 10
 *
 * @param dayStemIndex Chỉ số Can của ngày (0: Giáp ... 9: Quý)
 * @param hourBranchIndex Chỉ số Chi của giờ (0: Tý ... 11: Hợi)
 * @returns Can Chi giờ (ví dụ: "Bính Tý", "Đinh Sửu")
 */
export function calculateHourCanChi(
  dayStemIndex: number,
  hourBranchIndex: number
): {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  name: string;
} {
  const stemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
  const stem = getHeavenlyStemByIndex(stemIndex);
  const branch = getEarthlyBranchByIndex(hourBranchIndex);

  return {
    stem,
    branch,
    name: `${stem} ${branch}`,
  };
}

/**
 * Xuất phiên bản và quy tắc độc lập
 */
export const VietnameseLunarRule = {
  version: CALENDAR_RULE_VERSION,
  timeZoneOffset: VN_TIMEZONE_OFFSET,
  timeZoneName: VN_TIMEZONE_NAME,
  calculateYearCanChi,
  calculateMonthCanChi,
  calculateDayCanChi,
  calculateHourCanChi,
  getHourBranchIndex,
  getHourRangeDescription,
} as const;
