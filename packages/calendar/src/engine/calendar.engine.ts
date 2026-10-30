/**
 * Calendar Engine: Động Cơ Lịch Âm Dương & Can Chi Việt Nam
 *
 * PHIÊN BẢN: VN-LUNAR-V1
 * MÚI GIỜ: Asia/Ho_Chi_Minh (UTC+7)
 *
 * TÍNH NĂNG:
 * 1. Chuyển đổi hai chiều Dương lịch <-> Âm lịch Việt Nam.
 * 2. Tự động nhận diện và xử lý tháng nhuận chính xác theo thiên văn học (Trung Khí / Sóc).
 * 3. Xác định đầy đủ 4 trụ Can Chi: Năm, Tháng, Ngày (Nhật Thần), Giờ.
 * 4. Hỗ trợ 12 Địa Chi giờ (Tý đến Hợi) và nhận diện Hoàng Đạo / Hắc Đạo.
 * 5. Hỗ trợ 2 chế độ chuyển ngày tại thời khắc giờ Tý:
 *    - 'RAT_HOUR_23': Chuyển ngày từ 23:00 (chuẩn Dịch học cổ pháp / Mai Hoa / Tử Vi).
 *    - 'MIDNIGHT': Chuyển ngày từ 00:00 (chuẩn lịch dân dụng).
 */

import {
  solarToLunar as sdkSolarToLunar,
  lunarToSolar as sdkLunarToSolar,
  leapMonthOf as sdkLeapMonthOf,
  lunarMonthLength as sdkLunarMonthLength,
  integerJd,
  luckyHours,
  getDayInfo,
  VN_TIMEZONE,
} from '@lunar-calendar/sdk';

import {
  SolarDate,
  LunarDate,
  CalendarOptions,
  CalendarConversionResult,
  HourBranchInfo,
  DayTransitionRule,
} from '../types';

import {
  VN_TIMEZONE_NAME,
} from '../constants';

import {
  calculateYearCanChi,
  calculateMonthCanChi,
  calculateDayCanChi,
  calculateHourCanChi,
  getHourBranchIndex,
  getEarthlyBranchByIndex,
} from '../rules/vietnamese-lunar.rule';

/**
 * Kiểu biểu diễn thời gian đầu vào linh hoạt
 */
export type DateTimeInput =
  | Date
  | string
  | {
      day: number;
      month: number;
      year: number;
      hour?: number;
      minute?: number;
      second?: number;
    };

/**
 * Tách và chuẩn hóa thời gian đầu vào theo múi giờ Asia/Ho_Chi_Minh (UTC+7)
 */
export function parseToVietnamDateTime(input: DateTimeInput): {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
} {
  if (typeof input === 'object' && !(input instanceof Date) && 'day' in input) {
    return {
      day: input.day,
      month: input.month,
      year: input.year,
      hour: input.hour ?? 0,
      minute: input.minute ?? 0,
      second: input.second ?? 0,
    };
  }

  const dateObj = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Thời gian đầu vào không hợp lệ: "${input}"`);
  }

  // Sử dụng Intl.DateTimeFormat để trích xuất chuẩn xác các thành phần theo múi giờ Asia/Ho_Chi_Minh
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VN_TIMEZONE_NAME,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(dateObj);
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const part of parts) {
    switch (part.type) {
      case 'year':
        year = parseInt(part.value, 10);
        break;
      case 'month':
        month = parseInt(part.value, 10);
        break;
      case 'day':
        day = parseInt(part.value, 10);
        break;
      case 'hour':
        hour = parseInt(part.value, 10);
        break;
      case 'minute':
        minute = parseInt(part.value, 10);
        break;
      case 'second':
        second = parseInt(part.value, 10);
        break;
    }
  }

  return { day, month, year, hour, minute, second };
}

/**
 * 1. Chuyển đổi ngày Dương lịch sang Âm lịch Việt Nam
 *
 * @param day Ngày dương lịch (1-31)
 * @param month Tháng dương lịch (1-12)
 * @param year Năm dương lịch
 * @returns LunarDate Ngày âm lịch với cờ isLeap biểu thị tháng nhuận
 */
export function convertSolarToLunar(day: number, month: number, year: number): LunarDate {
  const result = sdkSolarToLunar(day, month, year, VN_TIMEZONE);
  const monthLen = sdkLunarMonthLength(result.month, result.year, result.leap, VN_TIMEZONE);

  return {
    day: result.day,
    month: result.month,
    year: result.year,
    isLeap: result.leap,
    monthLength: monthLen,
  };
}

/**
 * 2. Chuyển đổi ngày Âm lịch Việt Nam sang Dương lịch
 *
 * @param day Ngày âm lịch (1-30)
 * @param month Tháng âm lịch (1-12)
 * @param year Năm âm lịch
 * @param isLeap Có phải tháng nhuận hay không (mặc định false)
 * @returns SolarDate Ngày dương lịch tương ứng, hoặc null nếu ngày âm không tồn tại
 */
export function convertLunarToSolar(
  day: number,
  month: number,
  year: number,
  isLeap = false
): SolarDate | null {
  const result = sdkLunarToSolar(day, month, year, isLeap, VN_TIMEZONE);
  if (!result) {
    return null;
  }
  return {
    day: result.day,
    month: result.month,
    year: result.year,
  };
}

/**
 * 3. Kiểm tra năm âm lịch có tháng nhuận không và nhuận tháng mấy
 *
 * @param lunarYear Năm âm lịch cần tra cứu
 * @returns Số tháng nhuận (1-12) hoặc null nếu năm không có tháng nhuận
 */
export function getLeapMonthOfYear(lunarYear: number): number | null {
  return sdkLeapMonthOf(lunarYear, VN_TIMEZONE);
}

/**
 * 4. Lấy số ngày của một tháng âm lịch (29 ngày = tháng thiếu, 30 ngày = tháng đủ)
 */
export function getLunarMonthLength(month: number, year: number, isLeap = false): number {
  return sdkLunarMonthLength(month, year, isLeap, VN_TIMEZONE);
}

/**
 * 5. Lấy danh sách toàn bộ 12 Địa Chi giờ trong ngày kèm Hoàng Đạo / Hắc Đạo và Can Chi
 *
 * @param dayJd Số ngày Julian của ngày cần tính
 * @param dayStemIndex Chỉ số Can của ngày (0: Giáp ... 9: Quý)
 */
export function getAllHourBranches(dayJd: number, dayStemIndex: number): HourBranchInfo[] {
  const luckyList = luckyHours(dayJd);

  return luckyList.map((item, index) => {
    const branch = getEarthlyBranchByIndex(index);
    const hourCanChi = calculateHourCanChi(dayStemIndex, index);

    return {
      index,
      branch,
      range: item.range,
      isAuspicious: item.auspicious,
      canChi: hourCanChi.name,
    };
  });
}

/**
 * 6. Lấy thông tin chi tiết một giờ cụ thể trong ngày
 *
 * @param hour Giờ dương lịch (0-23)
 * @param dayJd Số ngày Julian của ngày tính toán
 * @param dayStemIndex Chỉ số Can của ngày
 */
export function getHourBranchInfo(
  hour: number,
  dayJd: number,
  dayStemIndex: number
): HourBranchInfo {
  const branchIndex = getHourBranchIndex(hour);
  const allHours = getAllHourBranches(dayJd, dayStemIndex);
  return allHours[branchIndex]!;
}

/**
 * 7. Lấy bộ Can Chi 4 trụ (Năm, Tháng, Ngày, Giờ) cho một thời điểm bất kỳ
 *
 * @param input Thời gian đầu vào (Date, chuỗi ISO, hoặc object {day, month, year, hour, minute})
 * @param options Tùy chọn chuyển ngày ('RAT_HOUR_23' hoặc 'MIDNIGHT')
 */
export function getCanChiForDateTime(
  input: DateTimeInput,
  options: CalendarOptions = {}
): {
  year: string;
  month: string;
  day: string;
  hour: string;
  hourBranch: HourBranchInfo;
} {
  const info = getFullCalendarInfo(input, options);
  return {
    year: info.canChi.year,
    month: info.canChi.month,
    day: info.canChi.day,
    hour: info.canChi.hour,
    hourBranch: info.currentHourBranch,
  };
}

/**
 * 8. Tra cứu và phân tích toàn diện thông tin Lịch Âm Dương & Can Chi
 *
 * @param input Thời gian đầu vào (Date, chuỗi ISO 8601, hoặc object ngày giờ)
 * @param options Cấu hình (mặc định dayTransition: 'RAT_HOUR_23' phục vụ Dịch học)
 * @returns CalendarConversionResult Kết quả phân tích lịch đầy đủ
 */
export function getFullCalendarInfo(
  input: DateTimeInput,
  options: CalendarOptions = {}
): CalendarConversionResult {
  const dayTransition: DayTransitionRule = options.dayTransition ?? 'RAT_HOUR_23';

  // 1. Phân giải ngày giờ Dương lịch chuẩn Asia/Ho_Chi_Minh
  const civil = parseToVietnamDateTime(input);

  // 2. Chuyển đổi Dương lịch -> Âm lịch Việt Nam
  const lunar = convertSolarToLunar(civil.day, civil.month, civil.year);

  // 3. Tính Julian Day Number cho ngày dương lịch
  let jd = integerJd(civil.day, civil.month, civil.year);

  // 4. Xử lý quy tắc chuyển ngày lúc 23:00 (Giờ Tý)
  // Trong cổ pháp Dịch học / Mai Hoa / Tử Vi, thời khắc từ 23:00 đến 23:59 đã bước vào
  // giờ Tý của ngày tiếp theo. Do đó Nhật Thần (Can Chi ngày) và Can Chi giờ Tý
  // sẽ được tính theo ngày mới.
  let effectiveDayJd = jd;
  if (civil.hour >= 23 && dayTransition === 'RAT_HOUR_23') {
    effectiveDayJd = jd + 1;
  }

  // 5. Tính toán Can Chi Năm & Tháng
  const yearCanChi = calculateYearCanChi(lunar.year);
  const monthCanChi = calculateMonthCanChi(lunar.month, lunar.year);

  // 6. Tính toán Can Chi Ngày (Nhật Thần)
  const dayCanChi = calculateDayCanChi(effectiveDayJd);

  // 7. Xác định Chi giờ và Can Chi Giờ (Ngũ Thử Độn)
  const currentHourBranch = getHourBranchInfo(civil.hour, effectiveDayJd, dayCanChi.stemIndex);

  // 8. Danh sách toàn bộ 12 giờ trong ngày
  const allHourBranches = getAllHourBranches(effectiveDayJd, dayCanChi.stemIndex);

  // 9. Lấy thêm thông tin Tiết khí và Ngày trong tuần từ SDK
  const daySdkInfo = getDayInfo(civil.day, civil.month, civil.year, VN_TIMEZONE);

  return {
    algorithmVersion: 'VN-LUNAR-V1',
    timeZone: 'Asia/Ho_Chi_Minh',
    solar: {
      day: civil.day,
      month: civil.month,
      year: civil.year,
      hour: civil.hour,
      minute: civil.minute,
      weekday: daySdkInfo.solar.weekday,
      weekdayIndex: daySdkInfo.solar.weekdayIndex,
    },
    lunar: {
      day: lunar.day,
      month: lunar.month,
      year: lunar.year,
      isLeap: lunar.isLeap,
      monthLength: lunar.monthLength ?? 30,
    },
    canChi: {
      year: yearCanChi.name,
      month: monthCanChi.name,
      day: dayCanChi.name,
      hour: currentHourBranch.canChi,
    },
    zodiacAnimal: yearCanChi.zodiac,
    currentHourBranch,
    allHourBranches,
    solarTerm: daySdkInfo.solarTerm
      ? {
          name: daySdkInfo.solarTerm.name,
          index: daySdkInfo.solarTerm.index,
        }
      : undefined,
  };
}
