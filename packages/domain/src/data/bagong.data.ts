/**
 * Module Dữ Liệu Bát Cung (Ba Gong - 八宮) & Thế Ứng 64 Quẻ Kinh Dịch
 *
 * NGUỒN TƯ LIỆU ĐỐI CHIẾU KINH ĐIỂN:
 * 1. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức (Thanh triều):
 *    - Quyển 1: Bát Quái Bát Cung Đồ (八卦八宮圖)
 *    - Thế Ứng Khởi Lệ (世應起例):
 *      "Bản Cung lục thế tam vi ứng,
 *       Nhất thế sơ tứ nhị nhị ngũ,
 *       Tam thế tam thượng tứ tứ sơ,
 *       Ngũ thế ngũ nhị du tứ sơ,
 *       Quy hồn tam thế lục vi ứng."
 * 2. "Kinh Thị Dịch Truyện" (京氏易傳) - Kinh Phòng (Tây Hán, 77 TCN - 37 TCN):
 *    - Thuyết Bát Cung Quái Biến (8 Cung, mỗi cung 8 quẻ từ Bản Cung đến Quy Hồn).
 * 3. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân (Thanh triều):
 *    - Chương Bát Quái Phân Thuộc Cung Phân Thuộc Ngũ Hành, Chương Thế Ứng.
 *
 * QUY TẮC CỐT LÕI:
 * - Vị trí hào Thế và hào Ứng là THUỘC TÍNH TĨNH CỐ ĐỊNH của từng quẻ theo Bát Cung.
 * - TUYỆT ĐỐI KHÔNG SUY RA VỊ TRÍ THẾ / ỨNG TỪ HÀO ĐỘNG.
 * - Hào Ứng luôn cách Hào Thế đúng 3 vị trí (|Thế - Ứng| = 3): 1<->4, 2<->5, 3<->6.
 */

import { Element, ELEMENT_NAME_MAP } from '../enums/element.enum';
import { TrigramCode } from '../enums/trigram-name.enum';
import {
  GenerationStage,
  GENERATION_STAGE_NAMES,
  PalaceId,
} from '../enums/bagong.enum';
import {
  BaGongPalace,
  HexagramBaGong,
  WorldResponsePair,
} from '../models/bagong.model';

/**
 * Bảng vị trí Hào Thế và Hào Ứng tĩnh theo 8 giai đoạn biến thế
 * Đối chiếu: Bốc Phệ Chính Tông - Thế Ứng Khởi Lệ
 */
export const GENERATION_STAGE_LINES: Record<GenerationStage, WorldResponsePair> = {
  [GenerationStage.BAN_CUNG]: { worldLine: 6, responseLine: 3 },
  [GenerationStage.NHAT_THE]: { worldLine: 1, responseLine: 4 },
  [GenerationStage.NHI_THE]: { worldLine: 2, responseLine: 5 },
  [GenerationStage.TAM_THE]: { worldLine: 3, responseLine: 6 },
  [GenerationStage.TU_THE]: { worldLine: 4, responseLine: 1 },
  [GenerationStage.NGU_THE]: { worldLine: 5, responseLine: 2 },
  [GenerationStage.DU_HON]: { worldLine: 4, responseLine: 1 },
  [GenerationStage.QUY_HON]: { worldLine: 3, responseLine: 6 },
};

/**
 * Lấy cặp vị trí Hào Thế và Hào Ứng tĩnh theo giai đoạn biến thế
 *
 * @param stage Giai đoạn biến thế (BAN_CUNG -> QUY_HON)
 * @returns WorldResponsePair { worldLine, responseLine }
 */
export function getStaticWorldAndResponse(stage: GenerationStage): WorldResponsePair {
  return GENERATION_STAGE_LINES[stage];
}

/**
 * Danh sách 8 Cung Quẻ chuẩn Kinh Dịch Lục Hào
 */
export const BA_GONG_PALACES: readonly BaGongPalace[] = [
  {
    id: PalaceId.CAN,
    name: 'Càn',
    sinoVietnamese: 'Càn Cung',
    chineseName: '乾宮',
    element: Element.KIM,
    elementName: ELEMENT_NAME_MAP[Element.KIM],
    trigramCode: TrigramCode.CAN,
    hexagramNumbers: [1, 44, 33, 12, 20, 23, 35, 14],
    hexagramIds: [
      'HEX_01',
      'HEX_44',
      'HEX_33',
      'HEX_12',
      'HEX_20',
      'HEX_23',
      'HEX_35',
      'HEX_14',
    ],
  },
  {
    id: PalaceId.KHAM,
    name: 'Khảm',
    sinoVietnamese: 'Khảm Cung',
    chineseName: '坎宮',
    element: Element.THUY,
    elementName: ELEMENT_NAME_MAP[Element.THUY],
    trigramCode: TrigramCode.KHAM,
    hexagramNumbers: [29, 60, 3, 63, 49, 55, 36, 7],
    hexagramIds: [
      'HEX_29',
      'HEX_60',
      'HEX_03',
      'HEX_63',
      'HEX_49',
      'HEX_55',
      'HEX_36',
      'HEX_07',
    ],
  },
  {
    id: PalaceId.CAN_SON,
    name: 'Cấn',
    sinoVietnamese: 'Cấn Cung',
    chineseName: '艮宮',
    element: Element.THO,
    elementName: ELEMENT_NAME_MAP[Element.THO],
    trigramCode: TrigramCode.CAN_SON,
    hexagramNumbers: [52, 22, 26, 41, 38, 10, 61, 53],
    hexagramIds: [
      'HEX_52',
      'HEX_22',
      'HEX_26',
      'HEX_41',
      'HEX_38',
      'HEX_10',
      'HEX_61',
      'HEX_53',
    ],
  },
  {
    id: PalaceId.CHAN,
    name: 'Chấn',
    sinoVietnamese: 'Chấn Cung',
    chineseName: '震宮',
    element: Element.MOC,
    elementName: ELEMENT_NAME_MAP[Element.MOC],
    trigramCode: TrigramCode.CHAN,
    hexagramNumbers: [51, 16, 40, 32, 46, 48, 28, 17],
    hexagramIds: [
      'HEX_51',
      'HEX_16',
      'HEX_40',
      'HEX_32',
      'HEX_46',
      'HEX_48',
      'HEX_28',
      'HEX_17',
    ],
  },
  {
    id: PalaceId.TON,
    name: 'Tốn',
    sinoVietnamese: 'Tốn Cung',
    chineseName: '巽宮',
    element: Element.MOC,
    elementName: ELEMENT_NAME_MAP[Element.MOC],
    trigramCode: TrigramCode.TON,
    hexagramNumbers: [57, 9, 37, 42, 25, 21, 27, 18],
    hexagramIds: [
      'HEX_57',
      'HEX_09',
      'HEX_37',
      'HEX_42',
      'HEX_25',
      'HEX_21',
      'HEX_27',
      'HEX_18',
    ],
  },
  {
    id: PalaceId.LY,
    name: 'Ly',
    sinoVietnamese: 'Ly Cung',
    chineseName: '離宮',
    element: Element.HOA,
    elementName: ELEMENT_NAME_MAP[Element.HOA],
    trigramCode: TrigramCode.LY,
    hexagramNumbers: [30, 56, 50, 64, 4, 59, 6, 13],
    hexagramIds: [
      'HEX_30',
      'HEX_56',
      'HEX_50',
      'HEX_64',
      'HEX_04',
      'HEX_59',
      'HEX_06',
      'HEX_13',
    ],
  },
  {
    id: PalaceId.KHON,
    name: 'Khôn',
    sinoVietnamese: 'Khôn Cung',
    chineseName: '坤宮',
    element: Element.THO,
    elementName: ELEMENT_NAME_MAP[Element.THO],
    trigramCode: TrigramCode.KHON,
    hexagramNumbers: [2, 24, 19, 11, 34, 43, 5, 8],
    hexagramIds: [
      'HEX_02',
      'HEX_24',
      'HEX_19',
      'HEX_11',
      'HEX_34',
      'HEX_43',
      'HEX_05',
      'HEX_08',
    ],
  },
  {
    id: PalaceId.DOAI,
    name: 'Đoài',
    sinoVietnamese: 'Đoài Cung',
    chineseName: '兌宮',
    element: Element.KIM,
    elementName: ELEMENT_NAME_MAP[Element.KIM],
    trigramCode: TrigramCode.DOAI,
    hexagramNumbers: [58, 47, 45, 31, 39, 15, 62, 54],
    hexagramIds: [
      'HEX_58',
      'HEX_47',
      'HEX_45',
      'HEX_31',
      'HEX_39',
      'HEX_15',
      'HEX_62',
      'HEX_54',
    ],
  },
];

/**
 * Map tra cứu nhanh Cung theo PalaceId
 */
const PALACE_MAP: Record<string, BaGongPalace> = Object.fromEntries(
  BA_GONG_PALACES.map((p) => [p.id, p])
);

/**
 * Hàm trợ giúp tạo một HexagramBaGong chuẩn xác
 */
function createHexagramBaGong(
  hexagramNumber: number,
  hexagramId: string,
  hexagramName: string,
  sinoVietnameseName: string,
  chineseName: string,
  upperTrigramCode: TrigramCode,
  lowerTrigramCode: TrigramCode,
  palaceId: PalaceId,
  generationStage: GenerationStage,
  orderInPalace: number
): HexagramBaGong {
  const palace = PALACE_MAP[palaceId];
  if (!palace) {
    throw new Error(`Cung không tồn tại: "${palaceId}".`);
  }

  const { worldLine, responseLine } = GENERATION_STAGE_LINES[generationStage];

  return {
    hexagramNumber,
    hexagramId,
    hexagramName,
    sinoVietnameseName,
    chineseName,
    upperTrigramCode,
    lowerTrigramCode,
    palaceId,
    palaceName: palace.name,
    palaceElement: palace.element,
    palaceElementName: palace.elementName,
    generationStage,
    generationStageName: GENERATION_STAGE_NAMES[generationStage],
    orderInPalace,
    worldLine,
    responseLine,
  };
}

/**
 * Bảng ánh xạ đầy đủ 64 Quẻ vào 8 Cung
 * Sắp xếp chuẩn theo trình tự Bốc Phệ Chính Tông: 8 cung x 8 quẻ
 */
export const BA_GONG_HEXAGRAMS: readonly HexagramBaGong[] = [
  // ==========================================
  // 1. CÀN CUNG (HÀNH KIM) - 乾宮八卦屬金
  // ==========================================
  createHexagramBaGong(1, 'HEX_01', 'Thuần Càn', 'Càn vi Thiên', '乾為天', TrigramCode.CAN, TrigramCode.CAN, PalaceId.CAN, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(44, 'HEX_44', 'Thiên Phong Cấu', 'Thiên Phong Cấu', '天風姤', TrigramCode.CAN, TrigramCode.TON, PalaceId.CAN, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(33, 'HEX_33', 'Thiên Sơn Độn', 'Thiên Sơn Độn', '天山遯', TrigramCode.CAN, TrigramCode.CAN_SON, PalaceId.CAN, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(12, 'HEX_12', 'Thiên Địa Bĩ', 'Thiên Địa Bĩ', '天地否', TrigramCode.CAN, TrigramCode.KHON, PalaceId.CAN, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(20, 'HEX_20', 'Phong Địa Quan', 'Phong Địa Quan', '風地觀', TrigramCode.TON, TrigramCode.KHON, PalaceId.CAN, GenerationStage.TU_THE, 5),
  createHexagramBaGong(23, 'HEX_23', 'Sơn Địa Bác', 'Sơn Địa Bác', '山地剝', TrigramCode.CAN_SON, TrigramCode.KHON, PalaceId.CAN, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(35, 'HEX_35', 'Hỏa Địa Tấn', 'Hỏa Địa Tấn', '火地晉', TrigramCode.LY, TrigramCode.KHON, PalaceId.CAN, GenerationStage.DU_HON, 7),
  createHexagramBaGong(14, 'HEX_14', 'Hỏa Thiên Đại Hữu', 'Hỏa Thiên Đại Hữu', '火天大有', TrigramCode.LY, TrigramCode.CAN, PalaceId.CAN, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 2. KHẢM CUNG (HÀNH THỦY) - 坎宮八卦屬水
  // ==========================================
  createHexagramBaGong(29, 'HEX_29', 'Thuần Khảm', 'Khảm vi Thủy', '坎為水', TrigramCode.KHAM, TrigramCode.KHAM, PalaceId.KHAM, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(60, 'HEX_60', 'Thủy Trạch Tiết', 'Thủy Trạch Tiết', '水澤節', TrigramCode.KHAM, TrigramCode.DOAI, PalaceId.KHAM, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(3, 'HEX_03', 'Thủy Lôi Truân', 'Thủy Lôi Truân', '水雷屯', TrigramCode.KHAM, TrigramCode.CHAN, PalaceId.KHAM, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(63, 'HEX_63', 'Thủy Hỏa Ký Tế', 'Thủy Hỏa Ký Tế', '水火既濟', TrigramCode.KHAM, TrigramCode.LY, PalaceId.KHAM, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(49, 'HEX_49', 'Trạch Hỏa Cách', 'Trạch Hỏa Cách', '澤火革', TrigramCode.DOAI, TrigramCode.LY, PalaceId.KHAM, GenerationStage.TU_THE, 5),
  createHexagramBaGong(55, 'HEX_55', 'Lôi Hỏa Phong', 'Lôi Hỏa Phong', '雷火豐', TrigramCode.CHAN, TrigramCode.LY, PalaceId.KHAM, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(36, 'HEX_36', 'Địa Hỏa Minh Di', 'Địa Hỏa Minh Di', '地火明夷', TrigramCode.KHON, TrigramCode.LY, PalaceId.KHAM, GenerationStage.DU_HON, 7),
  createHexagramBaGong(7, 'HEX_07', 'Địa Thủy Sư', 'Địa Thủy Sư', '地水師', TrigramCode.KHON, TrigramCode.KHAM, PalaceId.KHAM, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 3. CẤN CUNG (HÀNH THỔ) - 艮宮八卦屬土
  // ==========================================
  createHexagramBaGong(52, 'HEX_52', 'Thuần Cấn', 'Cấn vi Sơn', '艮為山', TrigramCode.CAN_SON, TrigramCode.CAN_SON, PalaceId.CAN_SON, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(22, 'HEX_22', 'Sơn Hỏa Bí', 'Sơn Hỏa Bí', '山火賁', TrigramCode.CAN_SON, TrigramCode.LY, PalaceId.CAN_SON, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(26, 'HEX_26', 'Sơn Thiên Đại Súc', 'Sơn Thiên Đại Súc', '山天大畜', TrigramCode.CAN_SON, TrigramCode.CAN, PalaceId.CAN_SON, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(41, 'HEX_41', 'Sơn Trạch Tổn', 'Sơn Trạch Tổn', '山澤損', TrigramCode.CAN_SON, TrigramCode.DOAI, PalaceId.CAN_SON, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(38, 'HEX_38', 'Hỏa Trạch Khuê', 'Hỏa Trạch Khuê', '火澤睽', TrigramCode.LY, TrigramCode.DOAI, PalaceId.CAN_SON, GenerationStage.TU_THE, 5),
  createHexagramBaGong(10, 'HEX_10', 'Thiên Trạch Lý', 'Thiên Trạch Lý', '天澤履', TrigramCode.CAN, TrigramCode.DOAI, PalaceId.CAN_SON, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(61, 'HEX_61', 'Phong Trạch Trung Phu', 'Phong Trạch Trung Phu', '風澤中孚', TrigramCode.TON, TrigramCode.DOAI, PalaceId.CAN_SON, GenerationStage.DU_HON, 7),
  createHexagramBaGong(53, 'HEX_53', 'Phong Sơn Tiệm', 'Phong Sơn Tiệm', '風山漸', TrigramCode.TON, TrigramCode.CAN_SON, PalaceId.CAN_SON, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 4. CHẤN CUNG (HÀNH MỘC) - 震宮八卦屬木
  // ==========================================
  createHexagramBaGong(51, 'HEX_51', 'Thuần Chấn', 'Chấn vi Lôi', '震為雷', TrigramCode.CHAN, TrigramCode.CHAN, PalaceId.CHAN, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(16, 'HEX_16', 'Lôi Địa Dự', 'Lôi Địa Dự', '雷地豫', TrigramCode.CHAN, TrigramCode.KHON, PalaceId.CHAN, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(40, 'HEX_40', 'Lôi Thủy Giải', 'Lôi Thủy Giải', '雷水解', TrigramCode.CHAN, TrigramCode.KHAM, PalaceId.CHAN, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(32, 'HEX_32', 'Lôi Phong Hằng', 'Lôi Phong Hằng', '雷風恆', TrigramCode.CHAN, TrigramCode.TON, PalaceId.CHAN, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(46, 'HEX_46', 'Địa Phong Thăng', 'Địa Phong Thăng', '地風升', TrigramCode.KHON, TrigramCode.TON, PalaceId.CHAN, GenerationStage.TU_THE, 5),
  createHexagramBaGong(48, 'HEX_48', 'Thủy Phong Tỉnh', 'Thủy Phong Tỉnh', '水風井', TrigramCode.KHAM, TrigramCode.TON, PalaceId.CHAN, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(28, 'HEX_28', 'Trạch Phong Đại Quá', 'Trạch Phong Đại Quá', '澤風大過', TrigramCode.DOAI, TrigramCode.TON, PalaceId.CHAN, GenerationStage.DU_HON, 7),
  createHexagramBaGong(17, 'HEX_17', 'Trạch Lôi Tùy', 'Trạch Lôi Tùy', '澤雷隨', TrigramCode.DOAI, TrigramCode.CHAN, PalaceId.CHAN, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 5. TỐN CUNG (HÀNH MỘC) - 巽宮八卦屬木
  // ==========================================
  createHexagramBaGong(57, 'HEX_57', 'Thuần Tốn', 'Tốn vi Phong', '巽為風', TrigramCode.TON, TrigramCode.TON, PalaceId.TON, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(9, 'HEX_09', 'Phong Thiên Tiểu Súc', 'Phong Thiên Tiểu Súc', '風天小畜', TrigramCode.TON, TrigramCode.CAN, PalaceId.TON, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(37, 'HEX_37', 'Phong Hỏa Gia Nhân', 'Phong Hỏa Gia Nhân', '風火家人', TrigramCode.TON, TrigramCode.LY, PalaceId.TON, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(42, 'HEX_42', 'Phong Lôi Ích', 'Phong Lôi Ích', '風雷益', TrigramCode.TON, TrigramCode.CHAN, PalaceId.TON, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(25, 'HEX_25', 'Thiên Lôi Vô Vọng', 'Thiên Lôi Vô Vọng', '天雷無妄', TrigramCode.CAN, TrigramCode.CHAN, PalaceId.TON, GenerationStage.TU_THE, 5),
  createHexagramBaGong(21, 'HEX_21', 'Hỏa Lôi Phệ Hạp', 'Hỏa Lôi Phệ Hạp', '火雷噬嗑', TrigramCode.LY, TrigramCode.CHAN, PalaceId.TON, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(27, 'HEX_27', 'Sơn Lôi Di', 'Sơn Lôi Di', '山雷頤', TrigramCode.CAN_SON, TrigramCode.CHAN, PalaceId.TON, GenerationStage.DU_HON, 7),
  createHexagramBaGong(18, 'HEX_18', 'Sơn Phong Cổ', 'Sơn Phong Cổ', '山風蠱', TrigramCode.CAN_SON, TrigramCode.TON, PalaceId.TON, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 6. LY CUNG (HÀNH HỎA) - 離宮八卦屬火
  // ==========================================
  createHexagramBaGong(30, 'HEX_30', 'Thuần Ly', 'Ly vi Hỏa', '離為火', TrigramCode.LY, TrigramCode.LY, PalaceId.LY, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(56, 'HEX_56', 'Hỏa Sơn Lữ', 'Hỏa Sơn Lữ', '火山旅', TrigramCode.LY, TrigramCode.CAN_SON, PalaceId.LY, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(50, 'HEX_50', 'Hỏa Phong Đỉnh', 'Hỏa Phong Đỉnh', '火風鼎', TrigramCode.LY, TrigramCode.TON, PalaceId.LY, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(64, 'HEX_64', 'Hỏa Thủy Vị Tế', 'Hỏa Thủy Vị Tế', '火水未濟', TrigramCode.LY, TrigramCode.KHAM, PalaceId.LY, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(4, 'HEX_04', 'Sơn Thủy Mông', 'Sơn Thủy Mông', '山水蒙', TrigramCode.CAN_SON, TrigramCode.KHAM, PalaceId.LY, GenerationStage.TU_THE, 5),
  createHexagramBaGong(59, 'HEX_59', 'Phong Thủy Hoán', 'Phong Thủy Hoán', '風水渙', TrigramCode.TON, TrigramCode.KHAM, PalaceId.LY, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(6, 'HEX_06', 'Thiên Thủy Tụng', 'Thiên Thủy Tụng', '天水訟', TrigramCode.CAN, TrigramCode.KHAM, PalaceId.LY, GenerationStage.DU_HON, 7),
  createHexagramBaGong(13, 'HEX_13', 'Thiên Hỏa Đồng Nhân', 'Thiên Hỏa Đồng Nhân', '天火同人', TrigramCode.CAN, TrigramCode.LY, PalaceId.LY, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 7. KHÔN CUNG (HÀNH THỔ) - 坤宮八卦屬土
  // ==========================================
  createHexagramBaGong(2, 'HEX_02', 'Thuần Khôn', 'Khôn vi Địa', '坤為地', TrigramCode.KHON, TrigramCode.KHON, PalaceId.KHON, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(24, 'HEX_24', 'Địa Lôi Phục', 'Địa Lôi Phục', '地雷復', TrigramCode.KHON, TrigramCode.CHAN, PalaceId.KHON, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(19, 'HEX_19', 'Địa Trạch Lâm', 'Địa Trạch Lâm', '地澤臨', TrigramCode.KHON, TrigramCode.DOAI, PalaceId.KHON, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(11, 'HEX_11', 'Địa Thiên Thái', 'Địa Thiên Thái', '地天泰', TrigramCode.KHON, TrigramCode.CAN, PalaceId.KHON, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(34, 'HEX_34', 'Lôi Thiên Đại Tráng', 'Lôi Thiên Đại Tráng', '雷天大壯', TrigramCode.CHAN, TrigramCode.CAN, PalaceId.KHON, GenerationStage.TU_THE, 5),
  createHexagramBaGong(43, 'HEX_43', 'Trạch Thiên Quải', 'Trạch Thiên Quải', '澤天夬', TrigramCode.DOAI, TrigramCode.CAN, PalaceId.KHON, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(5, 'HEX_05', 'Thủy Thiên Nhu', 'Thủy Thiên Nhu', '水天需', TrigramCode.KHAM, TrigramCode.CAN, PalaceId.KHON, GenerationStage.DU_HON, 7),
  createHexagramBaGong(8, 'HEX_08', 'Thủy Địa Tỷ', 'Thủy Địa Tỷ', '水地比', TrigramCode.KHAM, TrigramCode.KHON, PalaceId.KHON, GenerationStage.QUY_HON, 8),

  // ==========================================
  // 8. ĐOÀI CUNG (HÀNH KIM) - 兌宮八卦屬金
  // ==========================================
  createHexagramBaGong(58, 'HEX_58', 'Thuần Đoài', 'Đoài vi Trạch', '兌為澤', TrigramCode.DOAI, TrigramCode.DOAI, PalaceId.DOAI, GenerationStage.BAN_CUNG, 1),
  createHexagramBaGong(47, 'HEX_47', 'Trạch Thủy Khốn', 'Trạch Thủy Khốn', '澤水困', TrigramCode.DOAI, TrigramCode.KHAM, PalaceId.DOAI, GenerationStage.NHAT_THE, 2),
  createHexagramBaGong(45, 'HEX_45', 'Trạch Địa Tụy', 'Trạch Địa Tụy', '澤地萃', TrigramCode.DOAI, TrigramCode.KHON, PalaceId.DOAI, GenerationStage.NHI_THE, 3),
  createHexagramBaGong(31, 'HEX_31', 'Trạch Sơn Hàm', 'Trạch Sơn Hàm', '澤山咸', TrigramCode.DOAI, TrigramCode.CAN_SON, PalaceId.DOAI, GenerationStage.TAM_THE, 4),
  createHexagramBaGong(39, 'HEX_39', 'Thủy Sơn Kiển', 'Thủy Sơn Kiển', '水山蹇', TrigramCode.KHAM, TrigramCode.CAN_SON, PalaceId.DOAI, GenerationStage.TU_THE, 5),
  createHexagramBaGong(15, 'HEX_15', 'Địa Sơn Khiêm', 'Địa Sơn Khiêm', '地山謙', TrigramCode.KHON, TrigramCode.CAN_SON, PalaceId.DOAI, GenerationStage.NGU_THE, 6),
  createHexagramBaGong(62, 'HEX_62', 'Lôi Sơn Tiểu Quá', 'Lôi Sơn Tiểu Quá', '雷山小過', TrigramCode.CHAN, TrigramCode.CAN_SON, PalaceId.DOAI, GenerationStage.DU_HON, 7),
  createHexagramBaGong(54, 'HEX_54', 'Lôi Trạch Quy Muội', 'Lôi Trạch Quy Muội', '雷澤歸妹', TrigramCode.CHAN, TrigramCode.DOAI, PalaceId.DOAI, GenerationStage.QUY_HON, 8),
];

/**
 * Map tra cứu theo số thứ tự quẻ Văn Vương (1 đến 64)
 */
const BA_GONG_BY_NUMBER: Record<number, HexagramBaGong> = Object.fromEntries(
  BA_GONG_HEXAGRAMS.map((h) => [h.hexagramNumber, h])
);

/**
 * Map tra cứu theo mã định danh quẻ ('HEX_01' đến 'HEX_64')
 */
const BA_GONG_BY_ID: Record<string, HexagramBaGong> = Object.fromEntries(
  BA_GONG_HEXAGRAMS.map((h) => [h.hexagramId, h])
);

/**
 * Lấy toàn bộ 8 Cung trong Bát Cung
 *
 * @returns Danh sách 8 BaGongPalace
 */
export function getAllPalaces(): readonly BaGongPalace[] {
  return BA_GONG_PALACES;
}

/**
 * Lấy thông tin chi tiết một Cung theo PalaceId
 *
 * @param palaceId Mã định danh cung (CAN, KHAM, CAN_SON, CHAN, TON, LY, KHON, DOAI)
 * @returns BaGongPalace
 */
export function getPalaceById(palaceId: PalaceId | TrigramCode | string): BaGongPalace {
  const palace = PALACE_MAP[palaceId];
  if (!palace) {
    throw new Error(`Cung không hợp lệ: "${palaceId}". Phải là một trong 8 Cung Bát Quái.`);
  }
  return palace;
}

/**
 * Lấy Ngũ Hành của một Cung trong Bát Cung
 *
 * @param palaceId Mã định danh cung
 * @returns Element Ngũ Hành
 */
export function getPalaceElement(palaceId: PalaceId | TrigramCode | string): Element {
  return getPalaceById(palaceId).element;
}

/**
 * Tra cứu thông tin Bát Cung của một quẻ theo số thứ tự Văn Vương (1 đến 64)
 *
 * @param hexagramNumber Số thứ tự quẻ (1 - 64)
 * @returns HexagramBaGong
 */
export function getHexagramBaGong(hexagramNumber: number): HexagramBaGong {
  const mapping = BA_GONG_BY_NUMBER[hexagramNumber];
  if (!mapping) {
    throw new Error(
      `Số thứ tự quẻ không hợp lệ: ${hexagramNumber}. Phải là số nguyên từ 1 đến 64.`
    );
  }
  return mapping;
}

/**
 * Tra cứu thông tin Bát Cung của một quẻ theo mã định danh ('HEX_01' đến 'HEX_64')
 *
 * @param hexagramId Mã định danh quẻ
 * @returns HexagramBaGong
 */
export function getHexagramBaGongById(hexagramId: string): HexagramBaGong {
  const mapping = BA_GONG_BY_ID[hexagramId];
  if (!mapping) {
    throw new Error(
      `Mã định danh quẻ không hợp lệ: "${hexagramId}". Phải có định dạng HEX_01 đến HEX_64.`
    );
  }
  return mapping;
}

/**
 * Lấy toàn bộ 8 quẻ thuộc về một Cung cụ thể
 *
 * @param palaceId Mã định danh cung
 * @returns Mảng 8 HexagramBaGong theo thứ tự từ Bản Cung đến Quy Hồn
 */
export function getHexagramsByPalace(
  palaceId: PalaceId | TrigramCode | string
): readonly HexagramBaGong[] {
  // Đảm bảo palaceId hợp lệ
  getPalaceById(palaceId);
  return BA_GONG_HEXAGRAMS.filter((h) => h.palaceId === palaceId);
}

/**
 * Lấy toàn bộ 8 quẻ có cùng một giai đoạn biến thế trong Bát Cung (ví dụ: tất cả quẻ Du Hồn)
 *
 * @param stage Giai đoạn biến thế (GenerationStage)
 * @returns Mảng 8 HexagramBaGong
 */
export function getHexagramsByStage(
  stage: GenerationStage
): readonly HexagramBaGong[] {
  return BA_GONG_HEXAGRAMS.filter((h) => h.generationStage === stage);
}
