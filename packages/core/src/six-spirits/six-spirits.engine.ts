/**
 * Động Cơ Lục Thú (Six Spirits Engine - 六獸 / 六神) trong Dịch học Lục Hào
 *
 * NGUỒN TƯ LIỆU ĐỐI CHIẾU KINH ĐIỂN:
 * 1. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức:
 *    - An Lục Thú Quyết (安六獸訣):
 *      "Giáp Ất khởi Thanh Long,
 *       Bính Đinh khởi Chu Tước,
 *       Mậu nhật khởi Câu Trần,
 *       Kỷ nhật khởi Đằng Xà,
 *       Canh Tân khởi Bạch Hổ,
 *       Nhâm Quý khởi Huyền Vũ."
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân:
 *    - Chương An Lục Thần Ca:
 *      Thứ tự tuần hoàn bất biến từ dưới lên (Hào 1 đến Hào 6):
 *      Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ.
 */

import {
  LinePosition,
  SixSpirit,
  SIX_SPIRIT_MAP,
  SIX_SPIRITS_ORDER,
} from '@kindich/domain';

import {
  CalculateSixSpiritsParams,
  HexagramSixSpiritsResult,
  SixSpiritLine,
} from './six-spirits.types';

/**
 * 10 Thiên Can chuẩn tiếng Việt
 */
export const VALID_HEAVENLY_STEMS = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;

export type ValidHeavenlyStem = (typeof VALID_HEAVENLY_STEMS)[number];

/**
 * Bảng chuẩn hóa chuỗi Thiên Can đầu vào (chấp nhận không dấu, chữ hoa/thường)
 */
const STEM_NORMALIZATION_MAP: Record<string, ValidHeavenlyStem> = {
  // Giáp
  'giáp': 'Giáp',
  'giap': 'Giáp',
  // Ất
  'ất': 'Ất',
  'at': 'Ất',
  // Bính
  'bính': 'Bính',
  'binh': 'Bính',
  // Đinh
  'đinh': 'Đinh',
  'dinh': 'Đinh',
  // Mậu
  'mậu': 'Mậu',
  'mau': 'Mậu',
  // Kỷ
  'kỷ': 'Kỷ',
  'ky': 'Kỷ',
  // Canh
  'canh': 'Canh',
  // Tân
  'tân': 'Tân',
  'tan': 'Tân',
  // Nhâm
  'nhâm': 'Nhâm',
  'nham': 'Nhâm',
  // Quý
  'quý': 'Quý',
  'quy': 'Quý',
};

/**
 * Chuẩn hóa chuỗi Thiên Can ngày đầu vào
 *
 * @param rawStem Chuỗi Thiên Can hoặc Can Chi (ví dụ: "Giáp", "Giáp Tý", "giap", "CANH")
 * @returns ValidHeavenlyStem Thiên Can chuẩn ("Giáp" đến "Quý")
 */
export function normalizeDayStem(rawStem: string): ValidHeavenlyStem {
  if (!rawStem || typeof rawStem !== 'string') {
    throw new Error('Thiên Can ngày không được để trống.');
  }

  // Tách lấy từ đầu tiên nếu người dùng truyền chuỗi Can Chi (ví dụ: "Giáp Tý" -> "Giáp")
  const firstWord = rawStem.trim().split(/\s+/)[0]?.toLowerCase() ?? '';

  const normalized = STEM_NORMALIZATION_MAP[firstWord];
  if (!normalized) {
    throw new Error(
      `Thiên Can ngày không hợp lệ: "${rawStem}". Phải là một trong 10 Thiên Can (Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý).`
    );
  }

  return normalized;
}

/**
 * Xác định Lục Thú khởi đầu tại hào 1 dựa trên Thiên Can của ngày lập quẻ
 *
 * Quy tắc kinh điển:
 * - Giáp, Ất   -> khởi Thanh Long
 * - Bính, Đinh -> khởi Chu Tước
 * - Mậu        -> khởi Câu Trần
 * - Kỷ         -> khởi Đằng Xà
 * - Canh, Tân  -> khởi Bạch Hổ
 * - Nhâm, Quý  -> khởi Huyền Vũ
 *
 * @param dayStem Thiên Can của ngày (ví dụ: "Giáp", "Ất"...)
 * @returns SixSpirit Lục Thú tại hào 1
 */
export function getStartingSpiritForStem(dayStem: string): SixSpirit {
  const stem = normalizeDayStem(dayStem);

  switch (stem) {
    case 'Giáp':
    case 'Ất':
      return SixSpirit.THANH_LONG;

    case 'Bính':
    case 'Đinh':
      return SixSpirit.CHU_TUOC;

    case 'Mậu':
      return SixSpirit.CAU_TRAN;

    case 'Kỷ':
      return SixSpirit.DANG_XA;

    case 'Canh':
    case 'Tân':
      return SixSpirit.BACH_HO;

    case 'Nhâm':
    case 'Quý':
      return SixSpirit.HUYEN_VU;

    default:
      throw new Error(`Thiên Can không hợp lệ: "${dayStem}".`);
  }
}

/**
 * Khởi tạo chi tiết thông tin Lục Thú cho một hào cụ thể
 */
function createSixSpiritLine(position: LinePosition, spirit: SixSpirit): SixSpiritLine {
  const info = SIX_SPIRIT_MAP[spirit];
  return {
    position,
    spirit: info.code,
    spiritName: info.name,
    chineseName: info.chineseName,
    element: info.element,
    elementName: info.elementName,
    direction: info.direction,
    nature: info.nature,
    description: info.description,
  };
}

/**
 * Tính toán Lục Thú cho đủ 6 hào của quẻ dựa vào Thiên Can ngày lập quẻ
 *
 * Thứ tự tuần hoàn bất biến từ hào 1 (dưới) lên hào 6 (trên):
 * Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ
 *
 * @param params Tham số chứa Thiên Can ngày, hoặc truyền chuỗi Thiên Can trực tiếp
 * @returns HexagramSixSpiritsResult Kết quả an Lục Thú cho cả 6 hào
 */
export function calculateSixSpirits(
  params: CalculateSixSpiritsParams | string
): HexagramSixSpiritsResult {
  const rawStem = typeof params === 'string' ? params : params.dayStem;
  const dayStem = normalizeDayStem(rawStem);
  const startingSpirit = getStartingSpiritForStem(dayStem);

  // Tìm vị trí xuất phát trong vòng tuần hoàn 6 Lục Thú
  const startIndex = SIX_SPIRITS_ORDER.indexOf(startingSpirit);

  // An lần lượt cho đủ 6 hào từ hào 1 đến hào 6
  const lines: SixSpiritLine[] = [];
  for (let i = 0; i < 6; i++) {
    const position = (i + 1) as LinePosition;
    const spiritIndex = (startIndex + i) % 6;
    const spirit = SIX_SPIRITS_ORDER[spiritIndex]!;
    lines.push(createSixSpiritLine(position, spirit));
  }

  const startingSpiritInfo = SIX_SPIRIT_MAP[startingSpirit];

  return {
    dayStem,
    startingSpirit,
    startingSpiritName: startingSpiritInfo.name,
    lines: lines as unknown as readonly [
      SixSpiritLine,
      SixSpiritLine,
      SixSpiritLine,
      SixSpiritLine,
      SixSpiritLine,
      SixSpiritLine,
    ],
  };
}

/**
 * Tra cứu Lục Thú tại một vị trí hào cụ thể (1 đến 6)
 *
 * @param dayStem Thiên Can ngày lập quẻ
 * @param position Vị trí hào (1 đến 6, từ dưới lên)
 * @returns SixSpiritLine
 */
export function getSixSpiritAtLine(
  dayStem: string,
  position: LinePosition
): SixSpiritLine {
  if (position < 1 || position > 6 || !Number.isInteger(position)) {
    throw new Error(
      `Vị trí hào không hợp lệ: ${position}. Phải là số nguyên từ 1 đến 6.`
    );
  }

  const result = calculateSixSpirits(dayStem);
  return result.lines[position - 1]!;
}
