/**
 * Dữ liệu chuẩn 64 Quẻ Kinh Dịch (Đại Tượng) theo hệ thống Chu Dịch Văn Vương
 *
 * Nguồn tư liệu kiểm chứng:
 * 1. Chu Dịch (Văn Vương, Chu Công, Khổng Tử Thập Dực)
 * 2. "Kinh Dịch - Đạo của người quân tử" (Nguyễn Hiến Lê, NXB Văn học)
 * 3. "Kinh Dịch diễn giải" (Phan Bội Châu)
 * 4. "Chu Dịch Chính Nghĩa" (Khổng Dĩnh Đạt)
 * 5. Chuẩn Unicode: Yijing Hexagram Symbols Block (U+4DC0 - U+4DFF)
 */

import { Hexagram } from '../models/hexagram.model';
import { HexagramLines, RawHexagramValues, YaoValue } from '../models/yao.model';
import { Trigram } from '../models/trigram.model';
import { TrigramCode } from '../enums/trigram-name.enum';
import {
  TRIGRAM_CAN,
  TRIGRAM_DOAI,
  TRIGRAM_LY,
  TRIGRAM_CHAN,
  TRIGRAM_TON,
  TRIGRAM_KHAM,
  TRIGRAM_CAN_SON,
  TRIGRAM_KHON,
} from './trigrams.data';

/**
 * Hàm khởi tạo thực thể Quẻ chuẩn
 */
function createHexagram(
  number: number,
  id: string,
  name: string,
  sinoVietnameseName: string,
  chineseName: string,
  upperTrigram: Trigram,
  lowerTrigram: Trigram,
  judgement?: string
): Hexagram {
  // Sáu hào lưu từ dưới lên: hào 1,2,3 thuộc hạ quái; hào 4,5,6 thuộc thượng quái
  const rawValues: RawHexagramValues = [
    lowerTrigram.lines[0],
    lowerTrigram.lines[1],
    lowerTrigram.lines[2],
    upperTrigram.lines[0],
    upperTrigram.lines[1],
    upperTrigram.lines[2],
  ];

  const binary = rawValues.join('');
  const symbol = String.fromCodePoint(0x4dc0 + number - 1);

  const lines: HexagramLines = [
    { position: 1, value: rawValues[0], isMoving: false },
    { position: 2, value: rawValues[1], isMoving: false },
    { position: 3, value: rawValues[2], isMoving: false },
    { position: 4, value: rawValues[3], isMoving: false },
    { position: 5, value: rawValues[4], isMoving: false },
    { position: 6, value: rawValues[5], isMoving: false },
  ];

  return {
    id,
    number,
    name,
    sinoVietnameseName,
    chineseName,
    symbol,
    upperTrigram,
    lowerTrigram,
    lines,
    rawValues,
    binary,
    judgement,
  };
}

export const HEXAGRAMS: readonly Hexagram[] = [
  createHexagram(1, 'HEX_01', 'Thuần Càn', 'Càn vi Thiên', '乾為天', TRIGRAM_CAN, TRIGRAM_CAN),
  createHexagram(2, 'HEX_02', 'Thuần Khôn', 'Khôn vi Địa', '坤為地', TRIGRAM_KHON, TRIGRAM_KHON),
  createHexagram(3, 'HEX_03', 'Thủy Lôi Truân', 'Thủy Lôi Truân', '水雷屯', TRIGRAM_KHAM, TRIGRAM_CHAN),
  createHexagram(4, 'HEX_04', 'Sơn Thủy Mông', 'Sơn Thủy Mông', '山水蒙', TRIGRAM_CAN_SON, TRIGRAM_KHAM),
  createHexagram(5, 'HEX_05', 'Thủy Thiên Nhu', 'Thủy Thiên Nhu', '水天需', TRIGRAM_KHAM, TRIGRAM_CAN),
  createHexagram(6, 'HEX_06', 'Thiên Thủy Tụng', 'Thiên Thủy Tụng', '天水訟', TRIGRAM_CAN, TRIGRAM_KHAM),
  createHexagram(7, 'HEX_07', 'Địa Thủy Sư', 'Địa Thủy Sư', '地水師', TRIGRAM_KHON, TRIGRAM_KHAM),
  createHexagram(8, 'HEX_08', 'Thủy Địa Tỷ', 'Thủy Địa Tỷ', '水地比', TRIGRAM_KHAM, TRIGRAM_KHON),
  createHexagram(9, 'HEX_09', 'Phong Thiên Tiểu Súc', 'Phong Thiên Tiểu Súc', '風天小畜', TRIGRAM_TON, TRIGRAM_CAN),
  createHexagram(10, 'HEX_10', 'Thiên Trạch Lý', 'Thiên Trạch Lý', '天澤履', TRIGRAM_CAN, TRIGRAM_DOAI),
  createHexagram(11, 'HEX_11', 'Địa Thiên Thái', 'Địa Thiên Thái', '地天泰', TRIGRAM_KHON, TRIGRAM_CAN),
  createHexagram(12, 'HEX_12', 'Thiên Địa Bĩ', 'Thiên Địa Bĩ', '天地否', TRIGRAM_CAN, TRIGRAM_KHON),
  createHexagram(13, 'HEX_13', 'Thiên Hỏa Đồng Nhân', 'Thiên Hỏa Đồng Nhân', '天火同人', TRIGRAM_CAN, TRIGRAM_LY),
  createHexagram(14, 'HEX_14', 'Hỏa Thiên Đại Hữu', 'Hỏa Thiên Đại Hữu', '火天大有', TRIGRAM_LY, TRIGRAM_CAN),
  createHexagram(15, 'HEX_15', 'Địa Sơn Khiêm', 'Địa Sơn Khiêm', '地山謙', TRIGRAM_KHON, TRIGRAM_CAN_SON),
  createHexagram(16, 'HEX_16', 'Lôi Địa Dự', 'Lôi Địa Dự', '雷地豫', TRIGRAM_CHAN, TRIGRAM_KHON),
  createHexagram(17, 'HEX_17', 'Trạch Lôi Tùy', 'Trạch Lôi Tùy', '澤雷隨', TRIGRAM_DOAI, TRIGRAM_CHAN),
  createHexagram(18, 'HEX_18', 'Sơn Phong Cổ', 'Sơn Phong Cổ', '山風蠱', TRIGRAM_CAN_SON, TRIGRAM_TON),
  createHexagram(19, 'HEX_19', 'Địa Trạch Lâm', 'Địa Trạch Lâm', '地澤臨', TRIGRAM_KHON, TRIGRAM_DOAI),
  createHexagram(20, 'HEX_20', 'Phong Địa Quan', 'Phong Địa Quan', '風地觀', TRIGRAM_TON, TRIGRAM_KHON),
  createHexagram(21, 'HEX_21', 'Hỏa Lôi Phệ Hạp', 'Hỏa Lôi Phệ Hạp', '火雷噬嗑', TRIGRAM_LY, TRIGRAM_CHAN),
  createHexagram(22, 'HEX_22', 'Sơn Hỏa Bí', 'Sơn Hỏa Bí', '山火賁', TRIGRAM_CAN_SON, TRIGRAM_LY),
  createHexagram(23, 'HEX_23', 'Sơn Địa Bác', 'Sơn Địa Bác', '山地剝', TRIGRAM_CAN_SON, TRIGRAM_KHON),
  createHexagram(24, 'HEX_24', 'Địa Lôi Phục', 'Địa Lôi Phục', '地雷復', TRIGRAM_KHON, TRIGRAM_CHAN),
  createHexagram(25, 'HEX_25', 'Thiên Lôi Vô Vọng', 'Thiên Lôi Vô Vọng', '天雷無妄', TRIGRAM_CAN, TRIGRAM_CHAN),
  createHexagram(26, 'HEX_26', 'Sơn Thiên Đại Súc', 'Sơn Thiên Đại Súc', '山天大畜', TRIGRAM_CAN_SON, TRIGRAM_CAN),
  createHexagram(27, 'HEX_27', 'Sơn Lôi Di', 'Sơn Lôi Di', '山雷頤', TRIGRAM_CAN_SON, TRIGRAM_CHAN),
  createHexagram(28, 'HEX_28', 'Trạch Phong Đại Quá', 'Trạch Phong Đại Quá', '澤風大過', TRIGRAM_DOAI, TRIGRAM_TON),
  createHexagram(29, 'HEX_29', 'Thuần Khảm', 'Khảm vi Thủy', '坎為水', TRIGRAM_KHAM, TRIGRAM_KHAM),
  createHexagram(30, 'HEX_30', 'Thuần Ly', 'Ly vi Hỏa', '離為火', TRIGRAM_LY, TRIGRAM_LY),
  createHexagram(31, 'HEX_31', 'Trạch Sơn Hàm', 'Trạch Sơn Hàm', '澤山咸', TRIGRAM_DOAI, TRIGRAM_CAN_SON),
  createHexagram(32, 'HEX_32', 'Lôi Phong Hằng', 'Lôi Phong Hằng', '雷風恆', TRIGRAM_CHAN, TRIGRAM_TON),
  createHexagram(33, 'HEX_33', 'Thiên Sơn Độn', 'Thiên Sơn Độn', '天山遯', TRIGRAM_CAN, TRIGRAM_CAN_SON),
  createHexagram(34, 'HEX_34', 'Lôi Thiên Đại Tráng', 'Lôi Thiên Đại Tráng', '雷天大壯', TRIGRAM_CHAN, TRIGRAM_CAN),
  createHexagram(35, 'HEX_35', 'Hỏa Địa Tấn', 'Hỏa Địa Tấn', '火地晉', TRIGRAM_LY, TRIGRAM_KHON),
  createHexagram(36, 'HEX_36', 'Địa Hỏa Minh Di', 'Địa Hỏa Minh Di', '地火明夷', TRIGRAM_KHON, TRIGRAM_LY),
  createHexagram(37, 'HEX_37', 'Phong Hỏa Gia Nhân', 'Phong Hỏa Gia Nhân', '風火家人', TRIGRAM_TON, TRIGRAM_LY),
  createHexagram(38, 'HEX_38', 'Hỏa Trạch Khuê', 'Hỏa Trạch Khuê', '火澤睽', TRIGRAM_LY, TRIGRAM_DOAI),
  createHexagram(39, 'HEX_39', 'Thủy Sơn Kiển', 'Thủy Sơn Kiển', '水山蹇', TRIGRAM_KHAM, TRIGRAM_CAN_SON),
  createHexagram(40, 'HEX_40', 'Lôi Thủy Giải', 'Lôi Thủy Giải', '雷水解', TRIGRAM_CHAN, TRIGRAM_KHAM),
  createHexagram(41, 'HEX_41', 'Sơn Trạch Tổn', 'Sơn Trạch Tổn', '山澤損', TRIGRAM_CAN_SON, TRIGRAM_DOAI),
  createHexagram(42, 'HEX_42', 'Phong Lôi Ích', 'Phong Lôi Ích', '風雷益', TRIGRAM_TON, TRIGRAM_CHAN),
  createHexagram(43, 'HEX_43', 'Trạch Thiên Quải', 'Trạch Thiên Quải', '澤天夬', TRIGRAM_DOAI, TRIGRAM_CAN),
  createHexagram(44, 'HEX_44', 'Thiên Phong Cấu', 'Thiên Phong Cấu', '天風姤', TRIGRAM_CAN, TRIGRAM_TON),
  createHexagram(45, 'HEX_45', 'Trạch Địa Tụy', 'Trạch Địa Tụy', '澤地萃', TRIGRAM_DOAI, TRIGRAM_KHON),
  createHexagram(46, 'HEX_46', 'Địa Phong Thăng', 'Địa Phong Thăng', '地風升', TRIGRAM_KHON, TRIGRAM_TON),
  createHexagram(47, 'HEX_47', 'Trạch Thủy Khốn', 'Trạch Thủy Khốn', '澤水困', TRIGRAM_DOAI, TRIGRAM_KHAM),
  createHexagram(48, 'HEX_48', 'Thủy Phong Tỉnh', 'Thủy Phong Tỉnh', '水風井', TRIGRAM_KHAM, TRIGRAM_TON),
  createHexagram(49, 'HEX_49', 'Trạch Hỏa Cách', 'Trạch Hỏa Cách', '澤火革', TRIGRAM_DOAI, TRIGRAM_LY),
  createHexagram(50, 'HEX_50', 'Hỏa Phong Đỉnh', 'Hỏa Phong Đỉnh', '火風鼎', TRIGRAM_LY, TRIGRAM_TON),
  createHexagram(51, 'HEX_51', 'Thuần Chấn', 'Chấn vi Lôi', '震為雷', TRIGRAM_CHAN, TRIGRAM_CHAN),
  createHexagram(52, 'HEX_52', 'Thuần Cấn', 'Cấn vi Sơn', '艮為山', TRIGRAM_CAN_SON, TRIGRAM_CAN_SON),
  createHexagram(53, 'HEX_53', 'Phong Sơn Tiệm', 'Phong Sơn Tiệm', '風山漸', TRIGRAM_TON, TRIGRAM_CAN_SON),
  createHexagram(54, 'HEX_54', 'Lôi Trạch Quy Muội', 'Lôi Trạch Quy Muội', '雷澤歸妹', TRIGRAM_CHAN, TRIGRAM_DOAI),
  createHexagram(55, 'HEX_55', 'Lôi Hỏa Phong', 'Lôi Hỏa Phong', '雷火豐', TRIGRAM_CHAN, TRIGRAM_LY),
  createHexagram(56, 'HEX_56', 'Hỏa Sơn Lữ', 'Hỏa Sơn Lữ', '火山旅', TRIGRAM_LY, TRIGRAM_CAN_SON),
  createHexagram(57, 'HEX_57', 'Thuần Tốn', 'Tốn vi Phong', '巽為風', TRIGRAM_TON, TRIGRAM_TON),
  createHexagram(58, 'HEX_58', 'Thuần Đoài', 'Đoài vi Trạch', '兌為澤', TRIGRAM_DOAI, TRIGRAM_DOAI),
  createHexagram(59, 'HEX_59', 'Phong Thủy Hoán', 'Phong Thủy Hoán', '風水渙', TRIGRAM_TON, TRIGRAM_KHAM),
  createHexagram(60, 'HEX_60', 'Thủy Trạch Tiết', 'Thủy Trạch Tiết', '水澤節', TRIGRAM_KHAM, TRIGRAM_DOAI),
  createHexagram(61, 'HEX_61', 'Phong Trạch Trung Phu', 'Phong Trạch Trung Phu', '風澤中孚', TRIGRAM_TON, TRIGRAM_DOAI),
  createHexagram(62, 'HEX_62', 'Lôi Sơn Tiểu Quá', 'Lôi Sơn Tiểu Quá', '雷山小過', TRIGRAM_CHAN, TRIGRAM_CAN_SON),
  createHexagram(63, 'HEX_63', 'Thủy Hỏa Ký Tế', 'Thủy Hỏa Ký Tế', '水火既濟', TRIGRAM_KHAM, TRIGRAM_LY),
  createHexagram(64, 'HEX_64', 'Hỏa Thủy Vị Tế', 'Hỏa Thủy Vị Tế', '火水未濟', TRIGRAM_LY, TRIGRAM_KHAM),
] as const;

/**
 * Bảng tra cứu quẻ trực tiếp theo số thứ tự (1 - 64)
 */
export const HEXAGRAM_MAP: Readonly<Record<number, Hexagram>> = Object.freeze(
  HEXAGRAMS.reduce<Record<number, Hexagram>>((acc, hex) => {
    acc[hex.number] = hex;
    return acc;
  }, {})
);

/**
 * Bảng tra cứu quẻ theo ID, số thứ tự Văn Vương hoặc tên
 */
export const HEXAGRAM_BY_ID_MAP: Readonly<Record<string, Hexagram>> = Object.freeze(
  HEXAGRAMS.reduce<Record<string, Hexagram>>((acc, hex) => {
    // 1. Theo ID (HEX_01, HEX_64...)
    acc[hex.id.toUpperCase()] = hex;

    // 2. Theo số thứ tự ("1", "64"...)
    acc[hex.number.toString()] = hex;

    // 3. Theo tên có dấu ("THUẦN CÀN", "THUẦN CẤN"...)
    acc[hex.name.trim().toUpperCase()] = hex;

    // 4. Theo tên Hán Việt ("CÀN VI THIÊN", "CẤN VI SƠN"...)
    acc[hex.sinoVietnameseName.trim().toUpperCase()] = hex;

    // 5. Theo slug chuẩn hóa (đặc biệt phân biệt Càn và Cấn)
    const slug = hex.name
      .replace(/Cấn/g, 'Can_Son')
      .replace(/cấn/g, 'can_son')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase()
      .replace(/\s+/g, '_');
    acc[slug] = hex;

    // Đảm bảo định danh duy nhất không xung đột giữa Thuần Càn (1) và Thuần Cấn (52)
    if (hex.number === 1) {
      acc['THUAN_CAN'] = hex;
    } else if (hex.number === 52) {
      acc['THUAN_CAN_SON'] = hex;
      acc['THUAN_CEN'] = hex;
    }

    return acc;
  }, {})
);

/**
 * Bảng tra cứu quẻ theo chuỗi nhị phân 6 hào (từ dưới lên: hào 1 -> 6)
 */
export const HEXAGRAM_BY_BINARY_MAP: Readonly<Record<string, Hexagram>> = Object.freeze(
  HEXAGRAMS.reduce<Record<string, Hexagram>>((acc, hex) => {
    acc[hex.binary] = hex;
    return acc;
  }, {})
);

/**
 * Bảng tra cứu quẻ theo cặp [Thượng quái, Hạ quái]
 */
export const HEXAGRAM_BY_TRIGRAMS_MAP: Readonly<Record<string, Hexagram>> = Object.freeze(
  HEXAGRAMS.reduce<Record<string, Hexagram>>((acc, hex) => {
    const key = `${hex.upperTrigram.code}-${hex.lowerTrigram.code}`;
    acc[key] = hex;
    return acc;
  }, {})
);

/**
 * Bản đồ tra cứu quẻ theo tên tiếng Việt, Hán Việt và chữ Hán (O(1) lookup map)
 */
export const HEXAGRAM_BY_NAME_MAP: Readonly<Record<string, Hexagram>> = Object.freeze(
  HEXAGRAMS.reduce<Record<string, Hexagram>>((acc, hex) => {
    acc[hex.name.toLowerCase()] = hex;
    acc[hex.sinoVietnameseName.toLowerCase()] = hex;
    acc[hex.chineseName.toLowerCase()] = hex;
    return acc;
  }, {})
);

/**
 * Tra cứu quẻ theo tên (tiếng Việt, Hán Việt hoặc chữ Hán)
 */
export function getHexagramByName(name: string): Hexagram | undefined {
  if (!name) return undefined;
  return HEXAGRAM_BY_NAME_MAP[name.trim().toLowerCase()];
}

/**
 * Tra cứu quẻ theo ID hoặc số thứ tự Văn Vương (1 đến 64) hoặc tên quẻ
 *
 * @param idOrNumber - ID quẻ ('HEX_01', 'HEX_64'), số thứ tự (1 - 64) hoặc tên quẻ
 * @returns Hexagram tương ứng, hoặc undefined nếu không tìm thấy
 */
export function getHexagramById(idOrNumber: string | number): Hexagram | undefined {
  if (idOrNumber === undefined || idOrNumber === null) return undefined;
  const str = idOrNumber.toString().trim();
  const byId = HEXAGRAM_BY_ID_MAP[str.toUpperCase()];
  if (byId) return byId;
  return HEXAGRAM_BY_NAME_MAP[str.toLowerCase()];
}

/**
 * Tra cứu quẻ theo sáu hào (lưu từ dưới lên: [hào 1, hào 2, hào 3, hào 4, hào 5, hào 6])
 *
 * @param lines - Mảng 6 giá trị [0|1] hoặc chuỗi nhị phân 6 ký tự (ví dụ: "111111", "000000")
 * @returns Hexagram tương ứng, hoặc undefined nếu không hợp lệ
 */
export function getHexagramByLines(
  lines: RawHexagramValues | readonly YaoValue[] | string
): Hexagram | undefined {
  let binaryKey: string;

  if (typeof lines === 'string') {
    binaryKey = lines.trim();
  } else if (Array.isArray(lines) && lines.length === 6) {
    binaryKey = lines.join('');
  } else {
    return undefined;
  }

  if (binaryKey.length !== 6 || !/^[01]{6}$/.test(binaryKey)) {
    return undefined;
  }

  return HEXAGRAM_BY_BINARY_MAP[binaryKey];
}

/**
 * Tra cứu quẻ theo Thượng quái và Hạ quái
 *
 * @param upper - Thượng quái (Trigram hoặc TrigramCode)
 * @param lower - Hạ quái (Trigram hoặc TrigramCode)
 * @returns Hexagram tương ứng, hoặc undefined
 */
export function getHexagramByTrigrams(
  upper: Trigram | TrigramCode | string,
  lower: Trigram | TrigramCode | string
): Hexagram | undefined {
  const upperCode = typeof upper === 'object' ? upper.code : upper.toString().toUpperCase();
  const lowerCode = typeof lower === 'object' ? lower.code : lower.toString().toUpperCase();

  const key = `${upperCode}-${lowerCode}`;
  return HEXAGRAM_BY_TRIGRAMS_MAP[key];
}
