import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { Trigram } from '../models/trigram.model';
import { RawTrigramValues, YaoValue } from '../models/yao.model';

/**
 * 8 Quái Chuẩn trong Bát Quái theo thứ tự mã hóa Tiên Thiên:
 * Càn 111, Đoài 110, Ly 101, Chấn 100, Tốn 011, Khảm 010, Cấn 001, Khôn 000
 * Ba hào tính từ dưới lên: [hào 1, hào 2, hào 3] (0 = Âm, 1 = Dương)
 */
export const TRIGRAM_CAN: Trigram = {
  id: TrigramCode.CAN,
  code: TrigramCode.CAN,
  name: 'Càn',
  sinoVietnameseName: 'Càn',
  chineseName: '乾',
  symbol: '☰',
  element: Element.KIM,
  lines: [1, 1, 1],
  binary: '111',
  nature: 'Thiên',
  earlyHeavenNumber: 1,
  laterHeavenNumber: 6,
};

export const TRIGRAM_DOAI: Trigram = {
  id: TrigramCode.DOAI,
  code: TrigramCode.DOAI,
  name: 'Đoài',
  sinoVietnameseName: 'Đoài',
  chineseName: '兌',
  symbol: '☱',
  element: Element.KIM,
  lines: [1, 1, 0],
  binary: '110',
  nature: 'Trạch',
  earlyHeavenNumber: 2,
  laterHeavenNumber: 7,
};

export const TRIGRAM_LY: Trigram = {
  id: TrigramCode.LY,
  code: TrigramCode.LY,
  name: 'Ly',
  sinoVietnameseName: 'Ly',
  chineseName: '離',
  symbol: '☲',
  element: Element.HOA,
  lines: [1, 0, 1],
  binary: '101',
  nature: 'Hỏa',
  earlyHeavenNumber: 3,
  laterHeavenNumber: 9,
};

export const TRIGRAM_CHAN: Trigram = {
  id: TrigramCode.CHAN,
  code: TrigramCode.CHAN,
  name: 'Chấn',
  sinoVietnameseName: 'Chấn',
  chineseName: '震',
  symbol: '☳',
  element: Element.MOC,
  lines: [1, 0, 0],
  binary: '100',
  nature: 'Lôi',
  earlyHeavenNumber: 4,
  laterHeavenNumber: 3,
};

export const TRIGRAM_TON: Trigram = {
  id: TrigramCode.TON,
  code: TrigramCode.TON,
  name: 'Tốn',
  sinoVietnameseName: 'Tốn',
  chineseName: '巽',
  symbol: '☴',
  element: Element.MOC,
  lines: [0, 1, 1],
  binary: '011',
  nature: 'Phong',
  earlyHeavenNumber: 5,
  laterHeavenNumber: 4,
};

export const TRIGRAM_KHAM: Trigram = {
  id: TrigramCode.KHAM,
  code: TrigramCode.KHAM,
  name: 'Khảm',
  sinoVietnameseName: 'Khảm',
  chineseName: '坎',
  symbol: '☵',
  element: Element.THUY,
  lines: [0, 1, 0],
  binary: '010',
  nature: 'Thủy',
  earlyHeavenNumber: 6,
  laterHeavenNumber: 1,
};

export const TRIGRAM_CAN_SON: Trigram = {
  id: TrigramCode.CAN_SON,
  code: TrigramCode.CAN_SON,
  name: 'Cấn',
  sinoVietnameseName: 'Cấn',
  chineseName: '艮',
  symbol: '☶',
  element: Element.THO,
  lines: [0, 0, 1],
  binary: '001',
  nature: 'Sơn',
  earlyHeavenNumber: 7,
  laterHeavenNumber: 8,
};

export const TRIGRAM_KHON: Trigram = {
  id: TrigramCode.KHON,
  code: TrigramCode.KHON,
  name: 'Khôn',
  sinoVietnameseName: 'Khôn',
  chineseName: '坤',
  symbol: '☷',
  element: Element.THO,
  lines: [0, 0, 0],
  binary: '000',
  nature: 'Địa',
  earlyHeavenNumber: 8,
  laterHeavenNumber: 2,
};

/**
 * Danh sách toàn bộ 8 quái theo thứ tự mã hóa Tiên Thiên:
 * Càn (111), Đoài (110), Ly (101), Chấn (100), Tốn (011), Khảm (010), Cấn (001), Khôn (000)
 */
export const EIGHT_TRIGRAMS: readonly Trigram[] = [
  TRIGRAM_CAN,
  TRIGRAM_DOAI,
  TRIGRAM_LY,
  TRIGRAM_CHAN,
  TRIGRAM_TON,
  TRIGRAM_KHAM,
  TRIGRAM_CAN_SON,
  TRIGRAM_KHON,
] as const;

/**
 * Bảng tra cứu Bát Quái theo ID (mã định danh)
 */
export const TRIGRAM_BY_ID_MAP: Readonly<Record<string, Trigram>> = Object.freeze({
  [TrigramCode.CAN]: TRIGRAM_CAN,
  [TrigramCode.DOAI]: TRIGRAM_DOAI,
  [TrigramCode.LY]: TRIGRAM_LY,
  [TrigramCode.CHAN]: TRIGRAM_CHAN,
  [TrigramCode.TON]: TRIGRAM_TON,
  [TrigramCode.KHAM]: TRIGRAM_KHAM,
  [TrigramCode.CAN_SON]: TRIGRAM_CAN_SON,
  [TrigramCode.KHON]: TRIGRAM_KHON,
});

/**
 * Bảng tra cứu Bát Quái theo chuỗi nhị phân ("111", "110", ...)
 */
export const TRIGRAM_BY_BINARY_MAP: Readonly<Record<string, Trigram>> = Object.freeze({
  '111': TRIGRAM_CAN,
  '110': TRIGRAM_DOAI,
  '101': TRIGRAM_LY,
  '100': TRIGRAM_CHAN,
  '011': TRIGRAM_TON,
  '010': TRIGRAM_KHAM,
  '001': TRIGRAM_CAN_SON,
  '000': TRIGRAM_KHON,
});

/**
 * Tra cứu quẻ đơn (Trigram) theo ID hoặc tên mã
 *
 * @param id - Mã ID quái (ví dụ: 'CAN', 'DOAI', 'CAN_SON', hoặc TrigramCode)
 * @returns Trigram tương ứng, hoặc undefined nếu không tìm thấy
 */
export function getTrigramById(id: TrigramCode | string): Trigram | undefined {
  if (!id) return undefined;
  const normalizedKey = id.toString().trim().toUpperCase();
  return TRIGRAM_BY_ID_MAP[normalizedKey];
}

/**
 * Tra cứu quẻ đơn (Trigram) theo bộ ba hào (từ dưới lên: [hào 1, hào 2, hào 3])
 *
 * @param lines - Mảng 3 hào [hào 1, hào 2, hào 3] hoặc chuỗi nhị phân "111", "110", v.v.
 * @returns Trigram tương ứng, hoặc undefined nếu đầu vào không hợp lệ
 */
export function getTrigramByLines(
  lines: RawTrigramValues | readonly YaoValue[] | string
): Trigram | undefined {
  let binaryKey: string;

  if (typeof lines === 'string') {
    binaryKey = lines.trim();
  } else if (Array.isArray(lines) && lines.length === 3) {
    binaryKey = `${lines[0]}${lines[1]}${lines[2]}`;
  } else {
    return undefined;
  }

  return TRIGRAM_BY_BINARY_MAP[binaryKey];
}

/**
 * Tra cứu quẻ đơn (Trigram) theo số Tiên Thiên Bát Quái (1 đến 8)
 *
 * @param number - Số Tiên thiên (1 = Càn, 2 = Đoài, ..., 8 = Khôn)
 * @returns Trigram tương ứng, hoặc undefined nếu ngoài phạm vi 1-8
 */
export function getTrigramByEarlyNumber(number: number): Trigram | undefined {
  if (number < 1 || number > 8) return undefined;
  return EIGHT_TRIGRAMS.find((t) => t.earlyHeavenNumber === number);
}
