/**
 * Dữ liệu chuẩn Bát Cung và Thế Ứng của 64 Quẻ Kinh Dịch
 *
 * NGUỒN TƯ LIỆU KIỂM CHỨNG:
 * 1. "Kinh Thị Dịch Truyện" (京氏易傳) - Kinh Phòng (Tây Hán).
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân (Thanh triều).
 * 3. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức (Thanh triều).
 *
 * QUY TẮC BÁT CUNG (8 Palaces):
 * Mỗi Cung gồm 8 quẻ biến hóa theo trình tự:
 * 1. Bản Cung (Thuần quái): Hào Thế ở Hào 6, Hào Ứng ở Hào 3.
 * 2. Nhất Thế (Biến hào 1): Hào Thế ở Hào 1, Hào Ứng ở Hào 4.
 * 3. Nhị Thế (Biến hào 2): Hào Thế ở Hào 2, Hào Ứng ở Hào 5.
 * 4. Tam Thế (Biến hào 3): Hào Thế ở Hào 3, Hào Ứng ở Hào 6.
 * 5. Tứ Thế (Biến hào 4): Hào Thế ở Hào 4, Hào Ứng ở Hào 1.
 * 6. Ngũ Thế (Biến hào 5): Hào Thế ở Hào 5, Hào Ứng ở Hào 2.
 * 7. Du Hồn (Lùi biến hào 4): Hào Thế ở Hào 4, Hào Ứng ở Hào 1.
 * 8. Quy Hồn (Biến lại 3 hào nội quái): Hào Thế ở Hào 3, Hào Ứng ở Hào 6.
 *
 * NGŨ HÀNH CỦA BÁT CUNG:
 * - Càn: Kim | Đoài: Kim
 * - Khảm: Thủy
 * - Cấn: Thổ | Khôn: Thổ
 * - Chấn: Mộc | Tốn: Mộc
 * - Ly: Hỏa
 */

import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { LinePosition } from '../models/yao.model';
import { PalaceGeneration } from '../models/hexagram.model';

/**
 * Cấu trúc thông tin Bát Cung của một Quẻ
 */
export interface HexagramPalaceInfo {
  readonly hexagramNumber: number;
  readonly hexagramId: string;
  readonly hexagramName: string;
  readonly palace: TrigramCode;
  readonly palaceName: string;
  readonly palaceElement: Element;
  readonly generation: PalaceGeneration;
  readonly worldLine: LinePosition;
  readonly responseLine: LinePosition;
}

/**
 * Ngũ Hành định danh của 8 Cung Bát Quái
 */
export const PALACE_ELEMENT_MAP: Record<TrigramCode, Element> = {
  [TrigramCode.CAN]: Element.KIM,
  [TrigramCode.DOAI]: Element.KIM,
  [TrigramCode.LY]: Element.HOA,
  [TrigramCode.CHAN]: Element.MOC,
  [TrigramCode.TON]: Element.MOC,
  [TrigramCode.KHAM]: Element.THUY,
  [TrigramCode.CAN_SON]: Element.THO,
  [TrigramCode.KHON]: Element.THO,
};

/**
 * Tên tiếng Việt của 8 Cung
 */
export const PALACE_NAME_MAP: Record<TrigramCode, string> = {
  [TrigramCode.CAN]: 'Càn',
  [TrigramCode.DOAI]: 'Đoài',
  [TrigramCode.LY]: 'Ly',
  [TrigramCode.CHAN]: 'Chấn',
  [TrigramCode.TON]: 'Tốn',
  [TrigramCode.KHAM]: 'Khảm',
  [TrigramCode.CAN_SON]: 'Cấn',
  [TrigramCode.KHON]: 'Khôn',
};

/**
 * Helper khởi tạo thông tin Cung
 */
function createPalaceInfo(
  hexagramNumber: number,
  hexagramId: string,
  hexagramName: string,
  palace: TrigramCode,
  generation: PalaceGeneration,
  worldLine: LinePosition,
  responseLine: LinePosition
): HexagramPalaceInfo {
  return {
    hexagramNumber,
    hexagramId,
    hexagramName,
    palace,
    palaceName: PALACE_NAME_MAP[palace],
    palaceElement: PALACE_ELEMENT_MAP[palace],
    generation,
    worldLine,
    responseLine,
  };
}

/**
 * Danh sách toàn bộ 64 Quẻ phân chia theo Bát Cung
 */
export const HEXAGRAM_PALACES: readonly HexagramPalaceInfo[] = [
  // --- 1. CUNG CÀN (Hành Kim) ---
  createPalaceInfo(1, 'HEX_01', 'Thuần Càn', TrigramCode.CAN, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(44, 'HEX_44', 'Thiên Phong Cấu', TrigramCode.CAN, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(33, 'HEX_33', 'Thiên Sơn Độn', TrigramCode.CAN, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(12, 'HEX_12', 'Thiên Địa Bĩ', TrigramCode.CAN, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(20, 'HEX_20', 'Phong Địa Quan', TrigramCode.CAN, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(23, 'HEX_23', 'Sơn Địa Bác', TrigramCode.CAN, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(35, 'HEX_35', 'Hỏa Địa Tấn', TrigramCode.CAN, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(14, 'HEX_14', 'Hỏa Thiên Đại Hữu', TrigramCode.CAN, PalaceGeneration.QUY_HON, 3, 6),

  // --- 2. CUNG KHẢM (Hành Thủy) ---
  createPalaceInfo(29, 'HEX_29', 'Thuần Khảm', TrigramCode.KHAM, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(60, 'HEX_60', 'Thủy Trạch Tiết', TrigramCode.KHAM, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(3, 'HEX_03', 'Thủy Lôi Truân', TrigramCode.KHAM, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(63, 'HEX_63', 'Thủy Hỏa Ký Tế', TrigramCode.KHAM, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(49, 'HEX_49', 'Trạch Hỏa Cách', TrigramCode.KHAM, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(55, 'HEX_55', 'Lôi Hỏa Phong', TrigramCode.KHAM, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(36, 'HEX_36', 'Địa Hỏa Minh Di', TrigramCode.KHAM, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(7, 'HEX_07', 'Địa Thủy Sư', TrigramCode.KHAM, PalaceGeneration.QUY_HON, 3, 6),

  // --- 3. CUNG CẤN (Hành Thổ) ---
  createPalaceInfo(52, 'HEX_52', 'Thuần Cấn', TrigramCode.CAN_SON, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(22, 'HEX_22', 'Sơn Hỏa Bí', TrigramCode.CAN_SON, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(26, 'HEX_26', 'Sơn Thiên Đại Súc', TrigramCode.CAN_SON, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(41, 'HEX_41', 'Sơn Trạch Tổn', TrigramCode.CAN_SON, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(38, 'HEX_38', 'Hỏa Trạch Khuê', TrigramCode.CAN_SON, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(10, 'HEX_10', 'Thiên Trạch Lý', TrigramCode.CAN_SON, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(61, 'HEX_61', 'Phong Trạch Trung Phu', TrigramCode.CAN_SON, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(53, 'HEX_53', 'Phong Sơn Tiệm', TrigramCode.CAN_SON, PalaceGeneration.QUY_HON, 3, 6),

  // --- 4. CUNG CHẤN (Hành Mộc) ---
  createPalaceInfo(51, 'HEX_51', 'Thuần Chấn', TrigramCode.CHAN, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(16, 'HEX_16', 'Lôi Địa Dự', TrigramCode.CHAN, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(40, 'HEX_40', 'Lôi Thủy Giải', TrigramCode.CHAN, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(32, 'HEX_32', 'Lôi Phong Hằng', TrigramCode.CHAN, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(46, 'HEX_46', 'Địa Phong Thăng', TrigramCode.CHAN, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(48, 'HEX_48', 'Thủy Phong Tỉnh', TrigramCode.CHAN, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(28, 'HEX_28', 'Trạch Phong Đại Quá', TrigramCode.CHAN, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(17, 'HEX_17', 'Trạch Lôi Tùy', TrigramCode.CHAN, PalaceGeneration.QUY_HON, 3, 6),

  // --- 5. CUNG TỐN (Hành Mộc) ---
  createPalaceInfo(57, 'HEX_57', 'Thuần Tốn', TrigramCode.TON, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(9, 'HEX_09', 'Phong Thiên Tiểu Súc', TrigramCode.TON, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(37, 'HEX_37', 'Phong Hỏa Gia Nhân', TrigramCode.TON, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(42, 'HEX_42', 'Phong Lôi Ích', TrigramCode.TON, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(25, 'HEX_25', 'Thiên Lôi Vô Vọng', TrigramCode.TON, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(21, 'HEX_21', 'Hỏa Lôi Phệ Hạp', TrigramCode.TON, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(27, 'HEX_27', 'Sơn Lôi Di', TrigramCode.TON, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(18, 'HEX_18', 'Sơn Phong Cổ', TrigramCode.TON, PalaceGeneration.QUY_HON, 3, 6),

  // --- 6. CUNG LY (Hành Hỏa) ---
  createPalaceInfo(30, 'HEX_30', 'Thuần Ly', TrigramCode.LY, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(56, 'HEX_56', 'Hỏa Sơn Lữ', TrigramCode.LY, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(50, 'HEX_50', 'Hỏa Phong Đỉnh', TrigramCode.LY, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(64, 'HEX_64', 'Hỏa Thủy Vị Tế', TrigramCode.LY, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(4, 'HEX_04', 'Sơn Thủy Mông', TrigramCode.LY, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(59, 'HEX_59', 'Phong Thủy Hoán', TrigramCode.LY, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(6, 'HEX_06', 'Thiên Thủy Tụng', TrigramCode.LY, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(13, 'HEX_13', 'Thiên Hỏa Đồng Nhân', TrigramCode.LY, PalaceGeneration.QUY_HON, 3, 6),

  // --- 7. CUNG KHÔN (Hành Thổ) ---
  createPalaceInfo(2, 'HEX_02', 'Thuần Khôn', TrigramCode.KHON, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(24, 'HEX_24', 'Địa Lôi Phục', TrigramCode.KHON, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(19, 'HEX_19', 'Địa Trạch Lâm', TrigramCode.KHON, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(11, 'HEX_11', 'Địa Thiên Thái', TrigramCode.KHON, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(34, 'HEX_34', 'Lôi Thiên Đại Tráng', TrigramCode.KHON, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(43, 'HEX_43', 'Trạch Thiên Quải', TrigramCode.KHON, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(5, 'HEX_05', 'Thủy Thiên Nhu', TrigramCode.KHON, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(8, 'HEX_08', 'Thủy Địa Tỷ', TrigramCode.KHON, PalaceGeneration.QUY_HON, 3, 6),

  // --- 8. CUNG ĐOÀI (Hành Kim) ---
  createPalaceInfo(58, 'HEX_58', 'Thuần Đoài', TrigramCode.DOAI, PalaceGeneration.BAN_CUNG, 6, 3),
  createPalaceInfo(47, 'HEX_47', 'Trạch Thủy Khốn', TrigramCode.DOAI, PalaceGeneration.NHAT_THE, 1, 4),
  createPalaceInfo(45, 'HEX_45', 'Trạch Địa Tụy', TrigramCode.DOAI, PalaceGeneration.NHI_THE, 2, 5),
  createPalaceInfo(31, 'HEX_31', 'Trạch Sơn Hàm', TrigramCode.DOAI, PalaceGeneration.TAM_THE, 3, 6),
  createPalaceInfo(39, 'HEX_39', 'Thủy Sơn Kiển', TrigramCode.DOAI, PalaceGeneration.TU_THE, 4, 1),
  createPalaceInfo(15, 'HEX_15', 'Địa Sơn Khiêm', TrigramCode.DOAI, PalaceGeneration.NGU_THE, 5, 2),
  createPalaceInfo(62, 'HEX_62', 'Lôi Sơn Tiểu Quá', TrigramCode.DOAI, PalaceGeneration.DU_HON, 4, 1),
  createPalaceInfo(54, 'HEX_54', 'Lôi Trạch Quy Muội', TrigramCode.DOAI, PalaceGeneration.QUY_HON, 3, 6),
];

/**
 * Tra cứu theo số thứ tự quẻ (1 đến 64)
 */
const PALACE_BY_NUMBER: Record<number, HexagramPalaceInfo> = Object.fromEntries(
  HEXAGRAM_PALACES.map((info) => [info.hexagramNumber, info])
);

/**
 * Tra cứu theo ID quẻ ('HEX_01' đến 'HEX_64')
 */
const PALACE_BY_ID: Record<string, HexagramPalaceInfo> = Object.fromEntries(
  HEXAGRAM_PALACES.map((info) => [info.hexagramId, info])
);

/**
 * Lấy Ngũ Hành của một Cung cụ thể
 *
 * @param palace Mã quái của Cung
 * @returns Element Ngũ Hành của Cung
 */
export function getPalaceElement(palace: TrigramCode): Element {
  const element = PALACE_ELEMENT_MAP[palace];
  if (!element) {
    throw new Error(`Cung không hợp lệ: "${palace}".`);
  }
  return element;
}

/**
 * Tra cứu thông tin Bát Cung theo số thứ tự quẻ Văn Vương (1 đến 64)
 *
 * @param hexagramNumber Số thứ tự quẻ (1 - 64)
 * @returns HexagramPalaceInfo Thông tin Cung, Ngũ Hành, Thế, Ứng
 */
export function getPalaceInfoByHexagramNumber(hexagramNumber: number): HexagramPalaceInfo {
  const info = PALACE_BY_NUMBER[hexagramNumber];
  if (!info) {
    throw new Error(`Số thứ tự quẻ không hợp lệ: ${hexagramNumber}. Phải từ 1 đến 64.`);
  }
  return info;
}

/**
 * Tra cứu thông tin Bát Cung theo ID quẻ ('HEX_01' đến 'HEX_64')
 *
 * @param hexagramId Mã định danh quẻ
 * @returns HexagramPalaceInfo Thông tin Cung, Ngũ Hành, Thế, Ứng
 */
export function getPalaceInfoByHexagramId(hexagramId: string): HexagramPalaceInfo {
  const info = PALACE_BY_ID[hexagramId];
  if (!info) {
    throw new Error(`Mã định danh quẻ không hợp lệ: "${hexagramId}".`);
  }
  return info;
}
