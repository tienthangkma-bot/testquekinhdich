/**
 * Các hằng số Dịch học và Lịch pháp Việt Nam
 */

/**
 * 10 Thiên Can (Thập Can)
 */
export const HEAVENLY_STEMS = [
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

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

/**
 * 12 Địa Chi (Thập Nhị Chi)
 */
export const EARTHLY_BRANCHES = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

/**
 * 12 Con Giáp tương ứng với 12 Địa Chi theo văn hóa Việt Nam
 * (Lưu ý: Mão trong văn hóa Việt Nam là Mèo, khác với Thỏ ở Trung Quốc)
 */
export const ZODIAC_ANIMALS = [
  'Chuột', // Tý
  'Trâu',  // Sửu
  'Hổ',    // Dần
  'Mèo',   // Mão (Việt Nam)
  'Rồng',  // Thìn
  'Rắn',   // Tỵ
  'Ngựa',  // Ngọ
  'Dê',    // Mùi
  'Khỉ',   // Thân
  'Gà',    // Dậu
  'Chó',   // Tuất
  'Lợn',   // Hợi
] as const;

export type ZodiacAnimal = (typeof ZODIAC_ANIMALS)[number];

/**
 * Múi giờ chính thức của Việt Nam: GMT+7 / UTC+7 (Kinh tuyến 105° Đông)
 * Căn cứ pháp lý:
 * - Quyết định 121/CP (08/08/1967, hiệu lực từ 01/01/1968): Lịch âm phải tính theo giờ chính thức của Việt Nam.
 * - Quyết định 134/2002/QĐ-TTg ngày 14/10/2002 của Thủ tướng Chính phủ tái khẳng định.
 */
export const VN_TIMEZONE_OFFSET = 7;
export const VN_TIMEZONE_NAME = 'Asia/Ho_Chi_Minh';

/**
 * Phiên bản chuẩn quy tắc lịch âm dương Việt Nam độc lập
 */
export const CALENDAR_RULE_VERSION = 'VN-LUNAR-V1';
