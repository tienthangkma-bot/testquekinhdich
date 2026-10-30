/**
 * Động Cơ Lập Quẻ Mai Hoa Dịch Số (MAI-HUA-V1)
 *
 * QUY ƯỚC ĐỊA CHI (1-based index):
 * Tý=1, Sửu=2, Dần=3, Mão=4, Thìn=5, Tỵ=6, Ngọ=7, Mùi=8, Thân=9, Dậu=10, Tuất=11, Hợi=12.
 *
 * CÔNG THỨC:
 * 1. Thượng quái = (Năm địa chi + Tháng + Ngày) mod 8 (dư 0 lấy 8).
 * 2. Hạ quái = (Năm địa chi + Tháng + Ngày + Giờ địa chi) mod 8 (dư 0 lấy 8).
 * 3. Hào động = Tổng trên mod 6 (dư 0 lấy 6).
 * 4. Ánh xạ Bát Quái theo Tiên Thiên (chuẩn SERIAL-MOD8-V1):
 *    1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn.
 * 5. Phân tích Thể / Dụng:
 *    - Quái chứa hào động là Dụng (động, biến đổi, khách thể).
 *    - Quái còn lại không chứa hào động là Thể (tĩnh, bất biến, chủ thể).
 * 6. Gọi Hexagram Engine để sinh Quẻ Chủ, Quẻ Biến, Quẻ Hỗ.
 */

import {
  LinePosition,
  RawHexagramValues,
  getTrigramByEarlyNumber,
} from '@kindich/domain';
import { getFullCalendarInfo, DateTimeInput } from '@kindich/calendar';
import { castHexagramTrio } from '../hexagram/hexagram.engine';
import { calculateModuloRemainder } from '../serial/serial.casting';
import { InvalidMaiHuaInputError } from '../hexagram/errors';
import {
  EarthlyBranchName,
  MaiHuaLunarInput,
  MaiHuaCastingResult,
  TheDungAnalysis,
} from './mai-hua.types';

/**
 * Bảng quy ước số thứ tự 12 Địa Chi theo Mai Hoa Dịch Số (1 đến 12)
 */
export const MAI_HUA_BRANCH_MAP: Record<EarthlyBranchName, number> = {
  'Tý': 1,
  'Sửu': 2,
  'Dần': 3,
  'Mão': 4,
  'Thìn': 5,
  'Tỵ': 6,
  'Ngọ': 7,
  'Mùi': 8,
  'Thân': 9,
  'Dậu': 10,
  'Tuất': 11,
  'Hợi': 12,
};

/**
 * Bảng tra ngược từ số sang tên Địa Chi (1 đến 12)
 */
export const MAI_HUA_NUMBER_TO_BRANCH: Record<number, EarthlyBranchName> = {
  1: 'Tý',
  2: 'Sửu',
  3: 'Dần',
  4: 'Mão',
  5: 'Thìn',
  6: 'Tỵ',
  7: 'Ngọ',
  8: 'Mùi',
  9: 'Thân',
  10: 'Dậu',
  11: 'Tuất',
  12: 'Hợi',
};

/**
 * Chuẩn hóa giá trị đầu vào của Địa Chi sang số thứ tự (1-12) và tên Địa Chi
 *
 * @param input Giá trị Địa Chi (số 1-12, tên Địa Chi hoặc năm số ví dụ 2026)
 * @param paramName Tên tham số để báo lỗi (năm hoặc giờ)
 */
export function resolveEarthlyBranch(
  input: number | EarthlyBranchName,
  paramName: 'năm' | 'giờ'
): { number: number; name: EarthlyBranchName } {
  if (typeof input === 'string') {
    const branchNumber = MAI_HUA_BRANCH_MAP[input];
    if (!branchNumber) {
      throw new InvalidMaiHuaInputError(
        `Địa chi ${paramName} không hợp lệ: "${input}". Giá trị phải thuộc 12 Địa Chi (Tý đến Hợi).`
      );
    }
    return { number: branchNumber, name: input };
  }

  if (typeof input === 'number') {
    // Nếu là năm số nguyên lớn (ví dụ: 2026, 2024), tự động tính Chi của năm:
    // Chi = ((năm + 8) mod 12) + 1 (1: Tý ... 12: Hợi)
    if (input > 100 && paramName === 'năm') {
      const branchIndex = ((Math.floor(input) + 8) % 12 + 12) % 12;
      const branchNumber = branchIndex + 1;
      const name = MAI_HUA_NUMBER_TO_BRANCH[branchNumber]!;
      return { number: branchNumber, name };
    }

    if (Number.isInteger(input) && input >= 1 && input <= 12) {
      const name = MAI_HUA_NUMBER_TO_BRANCH[input]!;
      return { number: input, name };
    }
  }

  throw new InvalidMaiHuaInputError(
    `Địa chi ${paramName} không hợp lệ: ${input}. Phải là số nguyên từ 1 đến 12 hoặc tên Địa Chi (Tý đến Hợi).`
  );
}

/**
 * Lập quẻ Kinh Dịch theo phương pháp Mai Hoa Dịch Số (MAI-HUA-V1)
 *
 * @param input Dữ liệu âm lịch gồm năm, tháng, ngày và giờ địa chi
 * @returns MaiHuaCastingResult Kết quả lập quẻ đầy đủ, phân tích Thể/Dụng và bộ ba quẻ
 */
export function castByMaiHua(input: MaiHuaLunarInput): MaiHuaCastingResult {
  if (!input || typeof input !== 'object') {
    throw new InvalidMaiHuaInputError('Dữ liệu đầu vào Mai Hoa Dịch Số không hợp lệ.');
  }

  // 1. Phân giải và kiểm tra Địa Chi năm & giờ
  const yearBranch = resolveEarthlyBranch(input.yearBranch, 'năm');
  const hourBranch = resolveEarthlyBranch(input.hourBranch, 'giờ');

  // 2. Kiểm tra Tháng âm lịch (1 đến 12)
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new InvalidMaiHuaInputError(
      `Tháng âm lịch không hợp lệ: ${input.month}. Tháng phải là số nguyên từ 1 đến 12.`
    );
  }

  // 3. Kiểm tra Ngày âm lịch (1 đến 30)
  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 30) {
    throw new InvalidMaiHuaInputError(
      `Ngày âm lịch không hợp lệ: ${input.day}. Ngày phải là số nguyên từ 1 đến 30.`
    );
  }

  // 4. Áp dụng công thức Mai Hoa Dịch Số:
  // - Thượng quái = (Năm địa chi + Tháng + Ngày) mod 8
  const upperSum = yearBranch.number + input.month + input.day;
  const upperTrigramNumber = calculateModuloRemainder(upperSum, 8);

  // - Hạ quái = (Năm địa chi + Tháng + Ngày + Giờ địa chi) mod 8
  const lowerSum = upperSum + hourBranch.number;
  const lowerTrigramNumber = calculateModuloRemainder(lowerSum, 8);

  // - Hào động = Tổng trên mod 6 (dư 0 lấy 6)
  const totalSum = lowerSum;
  const movingLine = calculateModuloRemainder(totalSum, 6) as LinePosition;

  // 5. Ánh xạ Bát Quái theo Tiên Thiên (chuẩn 1 Càn đến 8 Khôn)
  const upperTrigram = getTrigramByEarlyNumber(upperTrigramNumber);
  const lowerTrigram = getTrigramByEarlyNumber(lowerTrigramNumber);

  if (!upperTrigram || !lowerTrigram) {
    throw new InvalidMaiHuaInputError(
      `Lỗi xác định Bát Quái: Thượng quái số ${upperTrigramNumber}, Hạ quái số ${lowerTrigramNumber}.`
    );
  }

  // 6. Xếp 6 hào từ dưới lên (Hạ quái hào 1-3, Thượng quái hào 4-6)
  const rawValues: RawHexagramValues = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  // 7. Gọi Hexagram Engine tạo Bộ Ba Quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ
  const trio = castHexagramTrio(rawValues, [movingLine]);

  // 8. Phân tích Thể / Dụng:
  // - Quái chứa hào động là Dụng (biến động).
  // - Quái còn lại không chứa hào động là Thể (bất biến, chủ thể).
  let theDung: TheDungAnalysis;

  if (movingLine >= 1 && movingLine <= 3) {
    // Hào động ở hào 1, 2, 3 -> Hạ quái là Dụng, Thượng quái là Thể
    theDung = {
      theTrigram: upperTrigram,
      thePosition: 'UPPER',
      dungTrigram: lowerTrigram,
      dungPosition: 'LOWER',
      summary: `Hào ${movingLine} động thuộc Hạ quái (${lowerTrigram.name}) nên Hạ quái là Dụng; Thượng quái (${upperTrigram.name}) là Thể.`,
    };
  } else {
    // Hào động ở hào 4, 5, 6 -> Thượng quái là Dụng, Hạ quái là Thể
    theDung = {
      theTrigram: lowerTrigram,
      thePosition: 'LOWER',
      dungTrigram: upperTrigram,
      dungPosition: 'UPPER',
      summary: `Hào ${movingLine} động thuộc Thượng quái (${upperTrigram.name}) nên Thượng quái là Dụng; Hạ quái (${lowerTrigram.name}) là Thể.`,
    };
  }

  return {
    algorithmVersion: 'MAI-HUA-V1',
    calendarRuleVersion: 'VN-LUNAR-V1',
    timeZone: 'Asia/Ho_Chi_Minh',
    input: {
      yearBranchNumber: yearBranch.number,
      yearBranchName: yearBranch.name,
      month: input.month,
      day: input.day,
      hourBranchNumber: hourBranch.number,
      hourBranchName: hourBranch.name,
    },
    upperSum,
    lowerSum,
    totalSum,
    upperTrigramNumber,
    lowerTrigramNumber,
    movingLine,
    upperTrigram,
    lowerTrigram,
    theDung,
    trio,
  };
}

/**
 * Lập quẻ Mai Hoa Dịch Số trực tiếp từ thời điểm Dương lịch (Giờ động tâm)
 *
 * Hàm này tự động gọi Calendar Engine để chuyển đổi Dương lịch -> Âm lịch Việt Nam
 * và xác định Địa Chi giờ, sau đó lập quẻ theo thuật toán MAI-HUA-V1.
 *
 * @param dateTime Thời điểm động tâm (Date, chuỗi ISO hoặc object {day, month, year, hour, minute})
 */
export function castByDateTime(dateTime: DateTimeInput): MaiHuaCastingResult {
  const calInfo = getFullCalendarInfo(dateTime, { dayTransition: 'RAT_HOUR_23' });

  // Địa Chi năm:
  // Lấy chi của năm từ calInfo.lunar.year
  const yearBranchIndex = ((calInfo.lunar.year + 8) % 12 + 12) % 12;
  const yearBranchNumber = yearBranchIndex + 1; // 1-based index (Tý = 1)

  // Địa Chi giờ:
  const hourBranchNumber = calInfo.currentHourBranch.index + 1; // 1-based index (Tý = 1)

  return castByMaiHua({
    yearBranch: yearBranchNumber,
    month: calInfo.lunar.month,
    day: calInfo.lunar.day,
    hourBranch: hourBranchNumber,
  });
}
