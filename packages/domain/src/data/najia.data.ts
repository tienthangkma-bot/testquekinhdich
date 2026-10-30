/**
 * Module Dữ Liệu Nạp Giáp Chuẩn Cổ Pháp (納甲)
 *
 * NGUỒN ĐỐI CHIẾU KINH ĐIỂN:
 * 1. "Kinh Thị Dịch Truyện" (京氏易傳) - Kinh Phòng (Tây Hán, 77 TCN – 37 TCN).
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân (Thanh triều).
 * 3. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức (Thanh triều).
 * 4. "Bốc Phệ Đại Toàn" (卜筮大全) - Chu Chấn Hanh.
 *
 * QUY TẮC NẠP GIÁP 8 BÁT QUÁI:
 * - Càn (Kim): Can Giáp (nội), Nhâm (ngoại). Dương thuận khởi Tý: Tý, Dần, Thìn, Ngọ, Thân, Tuất.
 * - Khôn (Thổ): Can Ất (nội), Quý (ngoại). Âm nghịch khởi Mùi: Mùi, Tỵ, Mão, Sửu, Hợi, Dậu.
 * - Chấn (Mộc): Can Canh. Dương thuận khởi Tý: Tý, Dần, Thìn, Ngọ, Thân, Tuất.
 * - Tốn (Mộc): Can Tân. Âm nghịch khởi Sửu: Sửu, Hợi, Dậu, Mùi, Tỵ, Mão.
 * - Khảm (Thủy): Can Mậu. Dương thuận khởi Dần: Dần, Thìn, Ngọ, Thân, Tuất, Tý.
 * - Ly (Hỏa): Can Kỷ. Âm nghịch khởi Mão: Mão, Sửu, Hợi, Dậu, Mùi, Tỵ.
 * - Cấn (Thổ): Can Bính. Dương thuận khởi Thìn: Thìn, Ngọ, Thân, Tuất, Tý, Dần.
 * - Đoài (Kim): Can Đinh. Âm nghịch khởi Tỵ: Tỵ, Mão, Sửu, Hợi, Dậu, Mùi.
 *
 * THỨ TỰ HÀO: Luôn tính từ dưới lên (Hào 1 đến Hào 6).
 */

import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { LinePosition } from '../models/yao.model';
import { NaJiaLine, TrigramNaJiaRule } from '../models/najia.model';

/**
 * Bảng tra cứu Ngũ Hành của 12 Địa Chi
 */
export const BRANCH_ELEMENT_MAP: Record<string, Element> = {
  'Tý': Element.THUY,
  'Sửu': Element.THO,
  'Dần': Element.MOC,
  'Mão': Element.MOC,
  'Thìn': Element.THO,
  'Tỵ': Element.HOA,
  'Ngọ': Element.HOA,
  'Mùi': Element.THO,
  'Thân': Element.KIM,
  'Dậu': Element.KIM,
  'Tuất': Element.THO,
  'Hợi': Element.THUY,
};

/**
 * Lấy Ngũ Hành của một Địa Chi bất kỳ
 *
 * @param branch Tên Địa Chi (Tý đến Hợi)
 * @returns Element Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ)
 */
export function getBranchElement(branch: string): Element {
  const element = BRANCH_ELEMENT_MAP[branch];
  if (!element) {
    throw new Error(`Địa Chi không hợp lệ: "${branch}". Phải thuộc 12 Địa Chi (Tý đến Hợi).`);
  }
  return element;
}

/**
 * Hàm khởi tạo một NaJiaLine chuẩn xác
 */
function createNaJiaLine(position: LinePosition, stem: string, branch: string): NaJiaLine {
  const element = getBranchElement(branch);
  return {
    position,
    stem,
    branch,
    element,
    canChi: `${stem} ${branch}`,
  };
}

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Càn (Trời / Kim)
 * - Can: Giáp (nội), Nhâm (ngoại)
 * - Nội: Tý (1), Dần (2), Thìn (3)
 * - Ngoại: Ngọ (4), Thân (5), Tuất (6)
 */
const CAN_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.CAN,
  trigramName: 'Càn',
  innerStem: 'Giáp',
  outerStem: 'Nhâm',
  innerBranches: ['Tý', 'Dần', 'Thìn'],
  outerBranches: ['Ngọ', 'Thân', 'Tuất'],
  innerLines: [
    createNaJiaLine(1, 'Giáp', 'Tý'),
    createNaJiaLine(2, 'Giáp', 'Dần'),
    createNaJiaLine(3, 'Giáp', 'Thìn'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Nhâm', 'Ngọ'),
    createNaJiaLine(5, 'Nhâm', 'Thân'),
    createNaJiaLine(6, 'Nhâm', 'Tuất'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Khôn (Đất / Thổ)
 * - Can: Ất (nội), Quý (ngoại)
 * - Nội: Mùi (1), Tỵ (2), Mão (3)
 * - Ngoại: Sửu (4), Hợi (5), Dậu (6)
 */
const KHON_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.KHON,
  trigramName: 'Khôn',
  innerStem: 'Ất',
  outerStem: 'Quý',
  innerBranches: ['Mùi', 'Tỵ', 'Mão'],
  outerBranches: ['Sửu', 'Hợi', 'Dậu'],
  innerLines: [
    createNaJiaLine(1, 'Ất', 'Mùi'),
    createNaJiaLine(2, 'Ất', 'Tỵ'),
    createNaJiaLine(3, 'Ất', 'Mão'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Quý', 'Sửu'),
    createNaJiaLine(5, 'Quý', 'Hợi'),
    createNaJiaLine(6, 'Quý', 'Dậu'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Chấn (Sấm / Mộc - Trưởng nam)
 * - Can: Canh (nội & ngoại)
 * - Nội: Tý (1), Dần (2), Thìn (3)
 * - Ngoại: Ngọ (4), Thân (5), Tuất (6)
 */
const CHAN_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.CHAN,
  trigramName: 'Chấn',
  innerStem: 'Canh',
  outerStem: 'Canh',
  innerBranches: ['Tý', 'Dần', 'Thìn'],
  outerBranches: ['Ngọ', 'Thân', 'Tuất'],
  innerLines: [
    createNaJiaLine(1, 'Canh', 'Tý'),
    createNaJiaLine(2, 'Canh', 'Dần'),
    createNaJiaLine(3, 'Canh', 'Thìn'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Canh', 'Ngọ'),
    createNaJiaLine(5, 'Canh', 'Thân'),
    createNaJiaLine(6, 'Canh', 'Tuất'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Tốn (Gió / Mộc - Trưởng nữ)
 * - Can: Tân (nội & ngoại)
 * - Nội: Sửu (1), Hợi (2), Dậu (3)
 * - Ngoại: Mùi (4), Tỵ (5), Mão (6)
 */
const TON_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.TON,
  trigramName: 'Tốn',
  innerStem: 'Tân',
  outerStem: 'Tân',
  innerBranches: ['Sửu', 'Hợi', 'Dậu'],
  outerBranches: ['Mùi', 'Tỵ', 'Mão'],
  innerLines: [
    createNaJiaLine(1, 'Tân', 'Sửu'),
    createNaJiaLine(2, 'Tân', 'Hợi'),
    createNaJiaLine(3, 'Tân', 'Dậu'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Tân', 'Mùi'),
    createNaJiaLine(5, 'Tân', 'Tỵ'),
    createNaJiaLine(6, 'Tân', 'Mão'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Khảm (Nước / Thủy - Trung nam)
 * - Can: Mậu (nội & ngoại)
 * - Nội: Dần (1), Thìn (2), Ngọ (3)
 * - Ngoại: Thân (4), Tuất (5), Tý (6)
 */
const KHAM_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.KHAM,
  trigramName: 'Khảm',
  innerStem: 'Mậu',
  outerStem: 'Mậu',
  innerBranches: ['Dần', 'Thìn', 'Ngọ'],
  outerBranches: ['Thân', 'Tuất', 'Tý'],
  innerLines: [
    createNaJiaLine(1, 'Mậu', 'Dần'),
    createNaJiaLine(2, 'Mậu', 'Thìn'),
    createNaJiaLine(3, 'Mậu', 'Ngọ'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Mậu', 'Thân'),
    createNaJiaLine(5, 'Mậu', 'Tuất'),
    createNaJiaLine(6, 'Mậu', 'Tý'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Ly (Lửa / Hỏa - Trung nữ)
 * - Can: Kỷ (nội & ngoại)
 * - Nội: Mão (1), Sửu (2), Hợi (3)
 * - Ngoại: Dậu (4), Mùi (5), Tỵ (6)
 */
const LY_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.LY,
  trigramName: 'Ly',
  innerStem: 'Kỷ',
  outerStem: 'Kỷ',
  innerBranches: ['Mão', 'Sửu', 'Hợi'],
  outerBranches: ['Dậu', 'Mùi', 'Tỵ'],
  innerLines: [
    createNaJiaLine(1, 'Kỷ', 'Mão'),
    createNaJiaLine(2, 'Kỷ', 'Sửu'),
    createNaJiaLine(3, 'Kỷ', 'Hợi'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Kỷ', 'Dậu'),
    createNaJiaLine(5, 'Kỷ', 'Mùi'),
    createNaJiaLine(6, 'Kỷ', 'Tỵ'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Cấn (Núi / Thổ - Thiếu nam)
 * - Can: Bính (nội & ngoại)
 * - Nội: Thìn (1), Ngọ (2), Thân (3)
 * - Ngoại: Tuất (4), Tý (5), Dần (6)
 */
const CAN_SON_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.CAN_SON,
  trigramName: 'Cấn',
  innerStem: 'Bính',
  outerStem: 'Bính',
  innerBranches: ['Thìn', 'Ngọ', 'Thân'],
  outerBranches: ['Tuất', 'Tý', 'Dần'],
  innerLines: [
    createNaJiaLine(1, 'Bính', 'Thìn'),
    createNaJiaLine(2, 'Bính', 'Ngọ'),
    createNaJiaLine(3, 'Bính', 'Thân'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Bính', 'Tuất'),
    createNaJiaLine(5, 'Bính', 'Tý'),
    createNaJiaLine(6, 'Bính', 'Dần'),
  ],
};

/**
 * Cấu trúc dữ liệu Nạp Giáp cho quẻ Đoài (Đầm / Kim - Thiếu nữ)
 * - Can: Đinh (nội & ngoại)
 * - Nội: Tỵ (1), Mão (2), Sửu (3)
 * - Ngoại: Hợi (4), Dậu (5), Mùi (6)
 */
const DOAI_NA_JIA: TrigramNaJiaRule = {
  trigramCode: TrigramCode.DOAI,
  trigramName: 'Đoài',
  innerStem: 'Đinh',
  outerStem: 'Đinh',
  innerBranches: ['Tỵ', 'Mão', 'Sửu'],
  outerBranches: ['Hợi', 'Dậu', 'Mùi'],
  innerLines: [
    createNaJiaLine(1, 'Đinh', 'Tỵ'),
    createNaJiaLine(2, 'Đinh', 'Mão'),
    createNaJiaLine(3, 'Đinh', 'Sửu'),
  ],
  outerLines: [
    createNaJiaLine(4, 'Đinh', 'Hợi'),
    createNaJiaLine(5, 'Đinh', 'Dậu'),
    createNaJiaLine(6, 'Đinh', 'Mùi'),
  ],
};

/**
 * Danh mục chuẩn đầy đủ Nạp Giáp của 8 Bát Quái
 */
export const NA_JIA_RULES: readonly TrigramNaJiaRule[] = [
  CAN_NA_JIA,
  KHON_NA_JIA,
  CHAN_NA_JIA,
  TON_NA_JIA,
  KHAM_NA_JIA,
  LY_NA_JIA,
  CAN_SON_NA_JIA,
  DOAI_NA_JIA,
];

/**
 * Map tra cứu Nạp Giáp theo TrigramCode
 */
const NA_JIA_BY_CODE: Record<string, TrigramNaJiaRule> = {
  [TrigramCode.CAN]: CAN_NA_JIA,
  [TrigramCode.KHON]: KHON_NA_JIA,
  [TrigramCode.CHAN]: CHAN_NA_JIA,
  [TrigramCode.TON]: TON_NA_JIA,
  [TrigramCode.KHAM]: KHAM_NA_JIA,
  [TrigramCode.LY]: LY_NA_JIA,
  [TrigramCode.CAN_SON]: CAN_SON_NA_JIA,
  [TrigramCode.DOAI]: DOAI_NA_JIA,
};

/**
 * Tra cứu toàn bộ quy tắc Nạp Giáp của một quái đơn
 *
 * @param trigramCode Mã quái hoặc chuỗi mã định danh
 * @returns TrigramNaJiaRule Quy tắc Nạp Giáp của quái
 */
export function getNaJiaRuleByTrigram(trigramCode: TrigramCode | string): TrigramNaJiaRule {
  const rule = NA_JIA_BY_CODE[trigramCode];
  if (!rule) {
    throw new Error(`Không tìm thấy quy tắc Nạp Giáp cho quái: "${trigramCode}".`);
  }
  return rule;
}

/**
 * Tra cứu Nạp Giáp cho một vị trí hào cụ thể (1 đến 6)
 *
 * @param trigramCode Mã quái (Bát quái)
 * @param position Vị trí hào trong quẻ (1 đến 6, từ dưới lên)
 * @returns NaJiaLine Thông tin Nạp Giáp (Can, Chi, Ngũ Hành)
 */
export function getNaJiaForLine(
  trigramCode: TrigramCode | string,
  position: LinePosition
): NaJiaLine {
  const rule = getNaJiaRuleByTrigram(trigramCode);

  if (position >= 1 && position <= 3) {
    // Hào nội quái (hào 1, 2, 3)
    return rule.innerLines[position - 1]!;
  }

  if (position >= 4 && position <= 6) {
    // Hào ngoại quái (hào 4, 5, 6)
    return rule.outerLines[position - 4]!;
  }

  throw new Error(`Vị trí hào không hợp lệ: ${position}. Phải là số nguyên từ 1 đến 6.`);
}

/**
 * Lập danh sách Nạp Giáp hoàn chỉnh cho cả 6 hào của một quẻ (từ dưới lên: hào 1 đến hào 6)
 *
 * @param lowerTrigramCode Mã quái của Hạ quái (Nội quái)
 * @param upperTrigramCode Mã quái của Thượng quái (Ngoại quái)
 * @returns Mảng 6 NaJiaLine tương ứng từ hào 1 đến hào 6
 */
export function getNaJiaForHexagram(
  lowerTrigramCode: TrigramCode | string,
  upperTrigramCode: TrigramCode | string
): readonly [NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine] {
  const lowerRule = getNaJiaRuleByTrigram(lowerTrigramCode);
  const upperRule = getNaJiaRuleByTrigram(upperTrigramCode);

  return [
    lowerRule.innerLines[0],
    lowerRule.innerLines[1],
    lowerRule.innerLines[2],
    upperRule.outerLines[0],
    upperRule.outerLines[1],
    upperRule.outerLines[2],
  ];
}
