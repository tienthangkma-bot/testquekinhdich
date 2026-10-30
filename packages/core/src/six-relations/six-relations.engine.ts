/**
 * Động Cơ Lục Thân (Six Relations Engine) trong Dịch học Lục Hào
 *
 * NGUỒN TƯ LIỆU KIỂM CHỨNG:
 * 1. "Kinh Thị Dịch Truyện" (京氏易傳) - Kinh Phòng (Tây Hán).
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân (Thanh triều).
 * 3. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức (Thanh triều).
 *
 * NGUYÊN TẮC XÁC ĐỊNH LỤC THÂN (六親):
 * Lấy Ngũ Hành của Cung Quẻ làm Ngũ Hành tham chiếu (Ngã - 我):
 * 1. Cùng hành với Cung: HUYNH ĐỆ (兄弟) - "Đồng ngã giả vi Huynh Đệ"
 * 2. Hào sinh Cung: PHỤ MẪU (父母) - "Sinh ngã giả vi Phụ Mẫu"
 * 3. Cung sinh Hào: TỬ TÔN (子孫) - "Ngã sinh giả vi Tử Tôn"
 * 4. Cung khắc Hào: THÊ TÀI (妻財) - "Ngã khắc giả vi Thê Tài"
 * 5. Hào khắc Cung: QUAN QUỶ (官鬼) - "Khắc ngã giả vi Quan Quỷ"
 */

import {
  Element,
  HEXAGRAMS,
  PALACE_NAME_MAP,
  PalaceGeneration,
  SixRelation,
  SIX_RELATION_MAP,
  TrigramCode,
  getElementName,
  getNaJiaForHexagram,
  getPalaceElement,
  getPalaceInfoByHexagramId,
  getPalaceInfoByHexagramNumber,
  HexagramPalaceInfo,
} from '@kindich/domain';

import {
  CalculateSixRelationsParams,
  HexagramSixRelationsResult,
  SixRelationLine,
} from './six-relations.types';

/**
 * Quy luật Ngũ Hành Tương Sinh:
 * Mộc sinh Hỏa -> Hỏa sinh Thổ -> Thổ sinh Kim -> Kim sinh Thủy -> Thủy sinh Mộc
 */
export const ELEMENT_GENERATES: Record<Element, Element> = {
  [Element.MOC]: Element.HOA,
  [Element.HOA]: Element.THO,
  [Element.THO]: Element.KIM,
  [Element.KIM]: Element.THUY,
  [Element.THUY]: Element.MOC,
};

/**
 * Quy luật Ngũ Hành Tương Khắc:
 * Mộc khắc Thổ -> Thổ khắc Thủy -> Thủy khắc Hỏa -> Hỏa khắc Kim -> Kim khắc Mộc
 */
export const ELEMENT_OVERCOMES: Record<Element, Element> = {
  [Element.MOC]: Element.THO,
  [Element.THO]: Element.THUY,
  [Element.THUY]: Element.HOA,
  [Element.HOA]: Element.KIM,
  [Element.KIM]: Element.MOC,
};

/**
 * Kiểm tra quan hệ tương sinh giữa 2 hành
 *
 * @param source Hành sinh
 * @param target Hành được sinh
 * @returns true nếu source sinh target
 */
export function isElementGenerating(source: Element, target: Element): boolean {
  return ELEMENT_GENERATES[source] === target;
}

/**
 * Kiểm tra quan hệ tương khắc giữa 2 hành
 *
 * @param source Hành khắc
 * @param target Hành bị khắc
 * @returns true nếu source khắc target
 */
export function isElementOvercoming(source: Element, target: Element): boolean {
  return ELEMENT_OVERCOMES[source] === target;
}

/**
 * Xác định Lục Thân của một Hào dựa trên Ngũ Hành của Hào và Ngũ Hành của Cung Quẻ
 *
 * @param lineElement Ngũ Hành của Hào (tính từ Địa Chi nạp giáp)
 * @param palaceElement Ngũ Hành của Cung Quẻ tham chiếu
 * @returns SixRelation Mã định danh Lục Thân chuẩn
 */
export function determineSixRelation(
  lineElement: Element,
  palaceElement: Element
): SixRelation {
  // 1. Cùng hành: Huynh Đệ ("Đồng ngã giả vi Huynh Đệ")
  if (lineElement === palaceElement) {
    return SixRelation.HUYNH_DE;
  }

  // 2. Hào sinh Cung: Phụ Mẫu ("Sinh ngã giả vi Phụ Mẫu")
  if (isElementGenerating(lineElement, palaceElement)) {
    return SixRelation.PHU_MAU;
  }

  // 3. Cung sinh Hào: Tử Tôn ("Ngã sinh giả vi Tử Tôn")
  if (isElementGenerating(palaceElement, lineElement)) {
    return SixRelation.TU_TON;
  }

  // 4. Cung khắc Hào: Thê Tài ("Ngã khắc giả vi Thê Tài")
  if (isElementOvercoming(palaceElement, lineElement)) {
    return SixRelation.THE_TAI;
  }

  // 5. Hào khắc Cung: Quan Quỷ ("Khắc ngã giả vi Quan Quỷ")
  if (isElementOvercoming(lineElement, palaceElement)) {
    return SixRelation.QUAN_QUY;
  }

  throw new Error(
    `Không thể xác định quan hệ Ngũ Hành giữa Hào (${lineElement}) và Cung (${palaceElement}).`
  );
}

/**
 * Lấy tên tiếng Việt của Lục Thân
 *
 * @param relation Mã Lục Thân (SixRelation)
 * @returns Tên tiếng Việt ("Huynh Đệ", "Phụ Mẫu", "Tử Tôn", "Thê Tài", "Quan Quỷ")
 */
export function getSixRelationName(relation: SixRelation): string {
  const info = SIX_RELATION_MAP[relation];
  if (!info) {
    throw new Error(`Mã Lục Thân không hợp lệ: "${relation}".`);
  }
  return info.name;
}

/**
 * Tính toán toàn bộ Lục Thân cho 6 hào của một quẻ
 *
 * @param params Tham số đầu vào (quẻ, số quẻ, quái hoặc cung)
 * @returns HexagramSixRelationsResult Kết quả chi tiết 6 hào Lục Thân từ dưới lên (Hào 1 đến Hào 6)
 */
export function calculateSixRelations(
  params: CalculateSixRelationsParams
): HexagramSixRelationsResult {
  let lowerTrigramCode: TrigramCode | string | undefined = params.lowerTrigramCode;
  let upperTrigramCode: TrigramCode | string | undefined = params.upperTrigramCode;
  let hexagramNumber: number | undefined = params.hexagramNumber;
  let hexagramId: string | undefined = params.hexagramId;
  let hexagramName: string | undefined;
  let palaceInfo: HexagramPalaceInfo | undefined;

  // 1. Nếu truyền đối tượng Hexagram
  if (params.hexagram) {
    const hex = params.hexagram;
    hexagramNumber = hex.number;
    hexagramId = hex.id;
    hexagramName = hex.name;
    lowerTrigramCode = hex.lowerTrigram.code;
    upperTrigramCode = hex.upperTrigram.code;
    try {
      palaceInfo = getPalaceInfoByHexagramNumber(hex.number);
    } catch {
      // Bỏ qua nếu là quẻ tùy biến không nằm trong 1..64
    }
  }

  // 2. Nếu truyền hexagramNumber (1 - 64)
  if (!palaceInfo && hexagramNumber !== undefined) {
    palaceInfo = getPalaceInfoByHexagramNumber(hexagramNumber);
    hexagramId = hexagramId ?? palaceInfo.hexagramId;
    hexagramName = hexagramName ?? palaceInfo.hexagramName;

    const foundHex = HEXAGRAMS.find((h) => h.number === hexagramNumber);
    if (foundHex) {
      lowerTrigramCode = lowerTrigramCode ?? foundHex.lowerTrigram.code;
      upperTrigramCode = upperTrigramCode ?? foundHex.upperTrigram.code;
      hexagramName = hexagramName ?? foundHex.name;
    }
  }

  // 3. Nếu truyền hexagramId ('HEX_01' - 'HEX_64')
  if (!palaceInfo && hexagramId !== undefined) {
    palaceInfo = getPalaceInfoByHexagramId(hexagramId);
    hexagramNumber = hexagramNumber ?? palaceInfo.hexagramNumber;
    hexagramName = hexagramName ?? palaceInfo.hexagramName;

    const foundHex = HEXAGRAMS.find((h) => h.id === hexagramId);
    if (foundHex) {
      lowerTrigramCode = lowerTrigramCode ?? foundHex.lowerTrigram.code;
      upperTrigramCode = upperTrigramCode ?? foundHex.upperTrigram.code;
      hexagramName = hexagramName ?? foundHex.name;
    }
  }

  // 4. Nếu truyền lowerTrigramCode và upperTrigramCode
  if (lowerTrigramCode && upperTrigramCode && !palaceInfo) {
    const foundHex = HEXAGRAMS.find(
      (h) => h.lowerTrigram.code === lowerTrigramCode && h.upperTrigram.code === upperTrigramCode
    );
    if (foundHex) {
      hexagramNumber = hexagramNumber ?? foundHex.number;
      hexagramId = hexagramId ?? foundHex.id;
      hexagramName = hexagramName ?? foundHex.name;
      palaceInfo = getPalaceInfoByHexagramNumber(foundHex.number);
    }
  }

  // 5. Xác định Cung và Ngũ Hành của Cung
  let palace: TrigramCode;
  let palaceName: string;
  let palaceElement: Element;
  let generation: PalaceGeneration | undefined = palaceInfo?.generation;
  let worldLine = palaceInfo?.worldLine;
  let responseLine = palaceInfo?.responseLine;

  if (params.customPalace) {
    palace = params.customPalace;
    palaceName = PALACE_NAME_MAP[palace] ?? palace;
    palaceElement = params.customPalaceElement ?? getPalaceElement(palace);
  } else if (palaceInfo) {
    palace = palaceInfo.palace;
    palaceName = palaceInfo.palaceName;
    palaceElement = params.customPalaceElement ?? palaceInfo.palaceElement;
  } else if (params.customPalaceElement) {
    // Trường hợp cung tùy biến chỉ định trực tiếp Ngũ Hành
    palaceElement = params.customPalaceElement;
    palace = TrigramCode.CAN;
    palaceName = 'Tùy biến';
  } else {
    throw new Error(
      'Không thể xác định Cung quẻ hoặc Ngũ Hành của Cung. Vui lòng cung cấp Hexagram, hexagramNumber (1-64), hoặc cặp Thượng/Hạ quái hợp lệ.'
    );
  }

  // 6. Kiểm tra Thượng quái và Hạ quái để Nạp Giáp
  if (!lowerTrigramCode || !upperTrigramCode) {
    throw new Error(
      'Thiếu thông tin Thượng quái hoặc Hạ quái để thực hiện Nạp Giáp cho 6 hào.'
    );
  }

  // 7. Lấy danh sách 6 hào Nạp Giáp từ domain
  const najiaLines = getNaJiaForHexagram(lowerTrigramCode, upperTrigramCode);

  // 8. Tính toán Lục Thân cho từng hào từ dưới lên (Hào 1 đến Hào 6)
  const sixRelationLines = najiaLines.map((line) => {
    const relation = determineSixRelation(line.element, palaceElement);
    const relationName = getSixRelationName(relation);
    const elementName = getElementName(line.element);
    const fullLabel = `${relationName} ${line.branch} ${elementName}`;

    const sixRelationLine: SixRelationLine = {
      position: line.position,
      stem: line.stem,
      branch: line.branch,
      canChi: line.canChi,
      element: line.element,
      relation,
      relationName,
      fullLabel,
    };
    return sixRelationLine;
  });

  return {
    hexagramNumber,
    hexagramId,
    hexagramName,
    palace,
    palaceName,
    palaceElement,
    generation,
    worldLine,
    responseLine,
    lines: sixRelationLines as unknown as readonly [
      SixRelationLine,
      SixRelationLine,
      SixRelationLine,
      SixRelationLine,
      SixRelationLine,
      SixRelationLine,
    ],
  };
}
