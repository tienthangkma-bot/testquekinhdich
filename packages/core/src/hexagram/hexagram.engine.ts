import {
  Hexagram,
  HexagramLines,
  HexagramTrio,
  LinePosition,
  RawHexagramValues,
  Trigram,
  YaoValue,
  getHexagramByLines,
  getHexagramByTrigrams,
  getTrigramByLines,
} from '@kindich/domain';
import { HexagramNotFoundError } from './errors';
import { validateMovingLines, validateRawHexagramValues } from './hexagram.validator';

/**
 * Xây dựng thực thể Hexagram hoàn chỉnh từ 6 hào và danh sách hào động
 *
 * @param rawValues - Mảng 6 giá trị [0|1] từ dưới lên
 * @param movingLines - Danh sách các vị trí hào động (1 đến 6)
 * @returns Hexagram hoàn chỉnh
 */
export function buildHexagramFromRawValues(
  rawValues: RawHexagramValues,
  movingLines: readonly LinePosition[] = []
): Hexagram {
  // Hạ quái: hào 1, 2, 3 (index 0, 1, 2)
  const lowerLines = [rawValues[0], rawValues[1], rawValues[2]] as const;
  // Thượng quái: hào 4, 5, 6 (index 3, 4, 5)
  const upperLines = [rawValues[3], rawValues[4], rawValues[5]] as const;

  const lowerTrigram = getTrigramByLines(lowerLines);
  const upperTrigram = getTrigramByLines(upperLines);

  if (!lowerTrigram || !upperTrigram) {
    throw new HexagramNotFoundError(
      `Không thể xác định Bát Quái từ các hào: Hạ quái [${lowerLines.join(',')}], Thượng quái [${upperLines.join(',')}]`
    );
  }

  // Tra cứu quẻ từ dữ liệu 64 quẻ
  const baseHexagram = getHexagramByLines(rawValues) || getHexagramByTrigrams(upperTrigram, lowerTrigram);

  if (!baseHexagram) {
    throw new HexagramNotFoundError(
      `Không tìm thấy quẻ tương ứng với chuỗi hào "${rawValues.join('')}" trong dữ liệu 64 quẻ.`
    );
  }

  // Đánh dấu các hào động nếu có
  const movingSet = new Set<number>(movingLines);
  const lines: HexagramLines = [
    { position: 1, value: rawValues[0], isMoving: movingSet.has(1) },
    { position: 2, value: rawValues[1], isMoving: movingSet.has(2) },
    { position: 3, value: rawValues[2], isMoving: movingSet.has(3) },
    { position: 4, value: rawValues[3], isMoving: movingSet.has(4) },
    { position: 5, value: rawValues[4], isMoving: movingSet.has(5) },
    { position: 6, value: rawValues[5], isMoving: movingSet.has(6) },
  ];

  return {
    ...baseHexagram,
    upperTrigram,
    lowerTrigram,
    lines,
    rawValues,
    binary: rawValues.join(''),
  };
}

/**
 * 1. Tạo Quẻ Chủ từ 6 hào đầu vào và đánh dấu hào động (nếu có)
 *
 * @param linesInput - Mảng 6 giá trị [0|1] hoặc chuỗi 6 ký tự nhị phân ("111111")
 * @param movingLinesInput - Danh sách các vị trí hào động (1 đến 6)
 * @returns Hexagram Quẻ Chủ
 */
export function createPrimaryHexagram(
  linesInput: RawHexagramValues | readonly YaoValue[] | string,
  movingLinesInput?: readonly LinePosition[] | readonly number[] | number
): Hexagram {
  const rawValues = validateRawHexagramValues(linesInput);
  const movingLines = validateMovingLines(movingLinesInput);
  return buildHexagramFromRawValues(rawValues, movingLines);
}

/**
 * 2. Xác định Thượng quái (hào 4–6) và Hạ quái (hào 1–3) từ 6 hào của quẻ
 *
 * @param hexagramOrValues - Thực thể Hexagram hoặc mảng 6 hào
 * @returns Đối tượng gồm { upperTrigram: Trigram, lowerTrigram: Trigram }
 */
export function extractTrigrams(
  hexagramOrValues: Hexagram | RawHexagramValues | readonly YaoValue[] | string
): { upperTrigram: Trigram; lowerTrigram: Trigram } {
  let rawValues: RawHexagramValues;

  if (typeof hexagramOrValues === 'object' && hexagramOrValues !== null && 'rawValues' in hexagramOrValues) {
    rawValues = hexagramOrValues.rawValues;
  } else {
    rawValues = validateRawHexagramValues(hexagramOrValues);
  }

  const lowerTrigram = getTrigramByLines([rawValues[0], rawValues[1], rawValues[2]]);
  const upperTrigram = getTrigramByLines([rawValues[3], rawValues[4], rawValues[5]]);

  if (!lowerTrigram || !upperTrigram) {
    throw new HexagramNotFoundError('Không thể phân tách Thượng quái và Hạ quái từ các hào đã cho.');
  }

  return { upperTrigram, lowerTrigram };
}

/**
 * 3. Tạo Quẻ Biến bằng cách đảo giá trị các hào động
 *
 * Quy tắc:
 * - Hào động vị trí p (1..6): 0 biến thành 1, 1 biến thành 0
 * - Hào tĩnh (không động): giữ nguyên giá trị
 * - Nếu không có hào động: Quẻ Biến chính là Quẻ Chủ
 *
 * @param primary - Quẻ Chủ
 * @param movingLinesInput - Danh sách vị trí các hào động (1 đến 6)
 * @returns Hexagram Quẻ Biến
 */
export function createTransformedHexagram(
  primary: Hexagram,
  movingLinesInput?: readonly LinePosition[] | readonly number[] | number
): Hexagram {
  const movingLines = validateMovingLines(movingLinesInput);

  // Nếu không có hào động, quẻ biến là quẻ chủ
  if (movingLines.length === 0) {
    return primary;
  }

  const movingSet = new Set<number>(movingLines);
  const transformedValues: YaoValue[] = primary.rawValues.map((val, idx) => {
    const position = idx + 1;
    if (movingSet.has(position)) {
      // Đảo cực: 0 -> 1, 1 -> 0
      return (val === 1 ? 0 : 1) as YaoValue;
    }
    return val;
  });

  const rawValues = transformedValues as unknown as RawHexagramValues;
  // Trong quẻ biến, các hào sau biến đổi đã chuyển sang trạng thái tĩnh
  return buildHexagramFromRawValues(rawValues, []);
}

/**
 * 4. Tạo Quẻ Hỗ (Nuclear Hexagram) từ Quẻ Chủ
 *
 * Quy tắc Dịch học chuẩn:
 * - Hạ quái của Quẻ Hỗ (Nội hỗ): Hào 2, 3, 4 của Quẻ Chủ (lưu từ dưới lên: index 1, 2, 3)
 * - Thượng quái của Quẻ Hỗ (Ngoại hỗ): Hào 3, 4, 5 của Quẻ Chủ (lưu từ dưới lên: index 2, 3, 4)
 *
 * @param primary - Quẻ Chủ
 * @returns Hexagram Quẻ Hỗ
 */
export function createNuclearHexagram(primary: Hexagram): Hexagram {
  const p = primary.rawValues;

  // Hạ quái: hào 2, 3, 4 (index 1, 2, 3)
  const lowerNuclearLines: [YaoValue, YaoValue, YaoValue] = [p[1], p[2], p[3]];
  // Thượng quái: hào 3, 4, 5 (index 2, 3, 4)
  const upperNuclearLines: [YaoValue, YaoValue, YaoValue] = [p[2], p[3], p[4]];

  const nuclearRawValues: RawHexagramValues = [
    lowerNuclearLines[0],
    lowerNuclearLines[1],
    lowerNuclearLines[2],
    upperNuclearLines[0],
    upperNuclearLines[1],
    upperNuclearLines[2],
  ];

  return buildHexagramFromRawValues(nuclearRawValues, []);
}

/**
 * Hàm tích hợp toàn diện của Hexagram Engine:
 * Nhận 6 hào và danh sách hào động, xuất ra bộ 3 Quẻ hoàn chỉnh: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ
 *
 * @param linesInput - Mảng 6 giá trị [0|1] hoặc chuỗi nhị phân 6 ký tự
 * @param movingLinesInput - Danh sách các vị trí hào động (1 đến 6)
 * @returns HexagramTrio (Quẻ Chủ, Quẻ Biến, Quẻ Hỗ, Hào Động)
 */
export function castHexagramTrio(
  linesInput: RawHexagramValues | readonly YaoValue[] | string,
  movingLinesInput?: readonly LinePosition[] | readonly number[] | number
): HexagramTrio {
  const movingLines = validateMovingLines(movingLinesInput);
  const primary = createPrimaryHexagram(linesInput, movingLines);
  const transformed = createTransformedHexagram(primary, movingLines);
  const nuclear = createNuclearHexagram(primary);

  return {
    primary,
    transformed,
    nuclear,
    movingLineIndices: movingLines,
    hasMovingLines: movingLines.length > 0,
  };
}
