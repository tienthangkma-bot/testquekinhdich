/**
 * Module Lập Quẻ Bằng Số Seri Tiền (SERIAL-MOD8-V1)
 *
 * Thuật toán đã thống nhất:
 * 1. Nhận seri tiền dưới dạng chuỗi, tối thiểu 2 chữ số.
 * 2. Giữ nguyên số 0 ở đầu seri.
 * 3. Tổng các chữ số ở vị trí lẻ (đếm từ 1) -> thượng quái.
 * 4. Tổng các chữ số ở vị trí chẵn -> hạ quái.
 * 5. Tổng tất cả chữ số -> hào động.
 * 6. Lấy phần dư:
 *    - Chia 8 để xác định quái (dư 0 lấy 8).
 *    - Chia 6 để xác định hào động (dư 0 lấy 6).
 * 7. Ánh xạ Bát Quái theo thứ tự:
 *    1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn.
 * 8. Tạo sáu hào từ dưới lên: hạ quái trước (hào 1-3), thượng quái sau (hào 4-6).
 * 9. Gọi Hexagram Engine để tạo quẻ chủ, quẻ biến và quẻ hỗ.
 */

import {
  HexagramTrio,
  LinePosition,
  RawHexagramValues,
  Trigram,
  getTrigramByEarlyNumber,
} from '@kindich/domain';
import { castHexagramTrio } from '../hexagram/hexagram.engine';
import { InvalidSerialInputError } from '../hexagram/errors';

/**
 * Kết quả phân tích chi tiết của quá trình lập quẻ theo số seri tiền
 */
export interface SerialCastingResult {
  /** Phiên bản thuật toán áp dụng */
  readonly algorithmVersion: 'SERIAL-MOD8-V1';

  /** Chuỗi số seri tiền gốc */
  readonly serialNumber: string;

  /** Tổng các chữ số ở vị trí lẻ (đếm từ 1) */
  readonly oddSum: number;

  /** Tổng các chữ số ở vị trí chẵn */
  readonly evenSum: number;

  /** Tổng tất cả các chữ số trong seri */
  readonly totalSum: number;

  /** Số Tiên Thiên của Thượng quái (1 đến 8) */
  readonly upperTrigramNumber: number;

  /** Số Tiên Thiên của Hạ quái (1 đến 8) */
  readonly lowerTrigramNumber: number;

  /** Vị trí hào động xác định từ tổng tất cả chữ số (1 đến 6) */
  readonly movingLine: LinePosition;

  /** Thượng quái xác định được */
  readonly upperTrigram: Trigram;

  /** Hạ quái xác định được */
  readonly lowerTrigram: Trigram;

  /** Dãy 6 hào thô của Quẻ Chủ (lưu từ dưới lên: hạ quái hào 1-3, thượng quái hào 4-6) */
  readonly rawValues: RawHexagramValues;

  /** Bộ ba quẻ hoàn chỉnh: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */
  readonly trio: HexagramTrio;
}

/**
 * Hàm hỗ trợ tính số dư theo quy tắc Dịch học:
 * - Chia cho divisor lấy phần dư.
 * - Nếu phần dư bằng 0 thì lấy chính divisor.
 *
 * @param sum - Tổng số cần tính
 * @param divisor - Số chia (8 cho quái, 6 cho hào động)
 * @returns Số nguyên từ 1 đến divisor
 */
export function calculateModuloRemainder(sum: number, divisor: number): number {
  const remainder = sum % divisor;
  return remainder === 0 ? divisor : remainder;
}

/**
 * Lập quẻ Kinh Dịch từ số seri tiền theo thuật toán SERIAL-MOD8-V1
 *
 * @param serial - Chuỗi ký tự số seri tờ tiền (tối thiểu 2 chữ số, giữ nguyên số 0 ở đầu)
 * @returns SerialCastingResult Kết quả lập quẻ đầy đủ thông số và bộ ba quẻ
 * @throws InvalidSerialInputError Nếu chuỗi seri không hợp lệ
 */
export function castBySerial(serial: string): SerialCastingResult {
  if (typeof serial !== 'string') {
    throw new InvalidSerialInputError('Số seri tiền phải là một chuỗi ký tự.');
  }

  const trimmed = serial.trim();

  // Quy tắc 1 & 2: Tối thiểu 2 chữ số và chỉ gồm các ký tự số, giữ nguyên số 0 ở đầu
  if (trimmed.length < 2) {
    throw new InvalidSerialInputError(
      `Số seri tiền phải có tối thiểu 2 chữ số. Nhận được: "${serial}" (${trimmed.length} chữ số).`
    );
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new InvalidSerialInputError(
      `Số seri tiền chỉ được chứa các ký tự số từ 0 đến 9. Nhận được: "${serial}".`
    );
  }

  // Tách các chữ số giữ nguyên số 0 đầu
  const digits = trimmed.split('').map((c) => Number(c));

  let oddSum = 0;   // Tổng vị trí lẻ (1, 3, 5, 7...)
  let evenSum = 0;  // Tổng vị trí chẵn (2, 4, 6, 8...)

  digits.forEach((digit, index) => {
    const position = index + 1; // Đếm vị trí từ 1
    if (position % 2 !== 0) {
      oddSum += digit;
    } else {
      evenSum += digit;
    }
  });

  // Quy tắc 3, 4, 5, 6:
  // - Tổng vị trí lẻ chia 8 lấy số dư -> Thượng quái (dư 0 lấy 8)
  const upperTrigramNumber = calculateModuloRemainder(oddSum, 8);
  // - Tổng vị trí chẵn chia 8 lấy số dư -> Hạ quái (dư 0 lấy 8)
  const lowerTrigramNumber = calculateModuloRemainder(evenSum, 8);
  // - Tổng tất cả chữ số chia 6 lấy số dư -> Hào động (dư 0 lấy 6)
  const totalSum = oddSum + evenSum;
  const movingLine = calculateModuloRemainder(totalSum, 6) as LinePosition;

  // Quy tắc 7: Ánh xạ Bát Quái theo thứ tự:
  // 1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn
  const upperTrigram = getTrigramByEarlyNumber(upperTrigramNumber);
  const lowerTrigram = getTrigramByEarlyNumber(lowerTrigramNumber);

  if (!upperTrigram || !lowerTrigram) {
    throw new InvalidSerialInputError(
      `Lỗi xác định Bát Quái: Thượng quái số ${upperTrigramNumber}, Hạ quái số ${lowerTrigramNumber}.`
    );
  }

  // Quy tắc 8: Tạo sáu hào từ dưới lên: hạ quái trước (hào 1-3), thượng quái sau (hào 4-6)
  const rawValues: RawHexagramValues = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  // Quy tắc 9: Gọi Hexagram Engine để tạo quẻ chủ, quẻ biến và quẻ hỗ
  const trio = castHexagramTrio(rawValues, [movingLine]);

  return {
    algorithmVersion: 'SERIAL-MOD8-V1',
    serialNumber: trimmed,
    oddSum,
    evenSum,
    totalSum,
    upperTrigramNumber,
    lowerTrigramNumber,
    movingLine,
    upperTrigram,
    lowerTrigram,
    rawValues,
    trio,
  };
}
