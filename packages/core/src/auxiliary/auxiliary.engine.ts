/**
 * Động Cơ Tính Toán Bổ Trợ (Auxiliary Analysis Engine)
 *
 * Tính toán Phục Thần, 12 Vận Trường Sinh và Thần Sát (Lộc, Mã, Quý, Đào, Quái Thần)
 * theo chuẩn cổ pháp "Bốc Phệ Chính Tông" và "Tăng San Bốc Dịch".
 */

import {
  Element,
  LinePosition,
  SixRelation,
  SIX_RELATION_MAP,
  getElementName,
  getPalaceInfoByHexagramNumber,
  getNaJiaForHexagram,
  BA_GONG_PALACES,
  HEXAGRAM_MAP,
} from '@kindich/domain';

import {
  AuxiliaryDeityInfo,
  PhucThanInfo,
  SupplementaryLineData,
  TwelveLifeStage,
  TwelveLifeStageInfo,
} from './auxiliary.types';

import { determineSixRelation } from '../six-relations/six-relations.engine';

/** Danh sách 12 Địa Chi */
const BRANCHES = [
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

/** 12 Vận Trường Sinh theo thứ tự */
const LIFE_STAGES: readonly TwelveLifeStage[] = [
  'TRUONG_SINH',
  'MOC_DUC',
  'QUAN_DOI',
  'LAM_QUAN',
  'DE_VUONG',
  'SUY',
  'BENH',
  'TU',
  'MO',
  'TUYET',
  'THAI',
  'DUONG',
] as const;

const LIFE_STAGE_NAMES: Record<TwelveLifeStage, { fullName: string; shortName: string }> = {
  TRUONG_SINH: { fullName: 'Trường Sinh', shortName: 'T.Sinh' },
  MOC_DUC: { fullName: 'Mộc Dục', shortName: 'M.Dục' },
  QUAN_DOI: { fullName: 'Quan Đới', shortName: 'Q.Đới' },
  LAM_QUAN: { fullName: 'Lâm Quan', shortName: 'L.Quan' },
  DE_VUONG: { fullName: 'Đế Vượng', shortName: 'Đ.Vượng' },
  SUY: { fullName: 'Suy', shortName: 'Suy' },
  BENH: { fullName: 'Bệnh', shortName: 'Bệnh' },
  TU: { fullName: 'Tử', shortName: 'Tử' },
  MO: { fullName: 'Mộ', shortName: 'Mộ' },
  TUYET: { fullName: 'Tuyệt', shortName: 'Tuyệt' },
  THAI: { fullName: 'Thai', shortName: 'Thai' },
  DUONG: { fullName: 'Dưỡng', shortName: 'Dưỡng' },
};

/**
 * Chi khởi Trường Sinh cho từng Ngũ Hành (Quy chuẩn Thủy Thổ Đồng Quy trong Bốc Phệ)
 */
const ELEMENT_START_BRANCH: Record<Element, string> = {
  [Element.KIM]: 'Tỵ',
  [Element.MOC]: 'Hợi',
  [Element.HOA]: 'Dần',
  [Element.THUY]: 'Thân',
  [Element.THO]: 'Thân',
};

/**
 * Bảng Lộc Thần theo Thiên Can ngày
 * Giáp lộc tại Dần, Ất lộc tại Mão, Bính Mậu lộc tại Tỵ, Đinh Kỷ lộc tại Ngọ,
 * Canh lộc tại Thân, Tân lộc tại Dậu, Nhâm lộc tại Hợi, Quý lộc tại Tý.
 */
const LOC_MAP: Record<string, string> = {
  Giáp: 'Dần',
  Ất: 'Mão',
  Bính: 'Tỵ',
  Đinh: 'Ngọ',
  Mậu: 'Tỵ',
  Kỷ: 'Ngọ',
  Canh: 'Thân',
  Tân: 'Dậu',
  Nhâm: 'Hợi',
  Quý: 'Tý',
};

/**
 * Bảng Dịch Mã theo Địa Chi ngày (Tam hợp cục khởi xung đầu)
 * Thân Tý Thìn mã tại Dần; Dần Ngọ Tuất mã tại Thân;
 * Tỵ Dậu Sửu mã tại Hợi; Hợi Mão Mùi mã tại Tỵ.
 */
const MA_MAP: Record<string, string> = {
  Dần: 'Thân',
  Ngọ: 'Thân',
  Tuất: 'Thân',
  Thân: 'Dần',
  Tý: 'Dần',
  Thìn: 'Dần',
  Tỵ: 'Hợi',
  Dậu: 'Hợi',
  Sửu: 'Hợi',
  Hợi: 'Tỵ',
  Mão: 'Tỵ',
  Mùi: 'Tỵ',
};

/**
 * Bảng Đào Hoa theo Địa Chi ngày
 * Thân Tý Thìn đào tại Dậu; Dần Ngọ Tuất đào tại Mão;
 * Tỵ Dậu Sửu đào tại Ngọ; Hợi Mão Mùi đào tại Tý.
 */
const DAO_MAP: Record<string, string> = {
  Dần: 'Mão',
  Ngọ: 'Mão',
  Tuất: 'Mão',
  Thân: 'Dậu',
  Tý: 'Dậu',
  Thìn: 'Dậu',
  Tỵ: 'Ngọ',
  Dậu: 'Ngọ',
  Sửu: 'Ngọ',
  Hợi: 'Tý',
  Mão: 'Tý',
  Mùi: 'Tý',
};

/**
 * Bảng Thiên Ất Quý Nhân theo Thiên Can ngày (Cổ bản Lục Hào: Bốc Phệ Chính Tông)
 * Khẩu quyết:
 * "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương,
 *  Bính Đinh trư kê vị, Lục Tân mã hổ phương,
 *  Nhâm Quý xà thố tàng, Thử thị Quý nhân phương."
 */
const QUI_NHAN_MAP: Record<string, readonly string[]> = {
  Giáp: ['Sửu', 'Mùi'],
  Ất: ['Tý', 'Thân'],
  Bính: ['Hợi', 'Dậu'],
  Đinh: ['Hợi', 'Dậu'],
  Mậu: ['Sửu', 'Mùi'],
  Kỷ: ['Tý', 'Thân'],
  Canh: ['Sửu', 'Mùi'],
  Tân: ['Ngọ', 'Dần'],
  Nhâm: ['Tỵ', 'Mão'],
  Quý: ['Tỵ', 'Mão'],
};

/**
 * Tính vận Trường Sinh của một Ngũ Hành đối với một Địa Chi (Ngày hoặc Tháng)
 */
export function calculateLifeStage(element: Element, targetBranch: string): TwelveLifeStageInfo {
  const startBranch = ELEMENT_START_BRANCH[element];
  const startIndex = BRANCHES.indexOf(startBranch as (typeof BRANCHES)[number]);
  const targetIndex = BRANCHES.indexOf(targetBranch as (typeof BRANCHES)[number]);

  if (startIndex === -1 || targetIndex === -1) {
    return {
      stage: 'TRUONG_SINH',
      fullName: 'Trường Sinh',
      shortName: 'T.Sinh',
    };
  }

  const offset = (targetIndex - startIndex + 12) % 12;
  const stage = LIFE_STAGES[offset] || 'TRUONG_SINH';
  const meta = LIFE_STAGE_NAMES[stage];

  return {
    stage,
    fullName: meta.fullName,
    shortName: meta.shortName,
  };
}

/**
 * Tính Thần Sát (Lộc, Mã, Quý, Đào) cho một Hào
 */
export function calculateAuxiliaryDeities(
  dayStem: string,
  dayBranch: string,
  lineBranch: string
): AuxiliaryDeityInfo {
  const locBranch = LOC_MAP[dayStem];
  const maBranch = MA_MAP[dayBranch];
  const daoBranch = DAO_MAP[dayBranch];
  const quiBranches: readonly string[] = QUI_NHAN_MAP[dayStem] ?? [];

  const isLoc = locBranch === lineBranch;
  const isMa = maBranch === lineBranch;
  const isDao = daoBranch === lineBranch;
  const isQuyNhan = quiBranches.includes(lineBranch);

  return {
    isLoc,
    isMa,
    isDao,
    isQuyNhan,
    isQuaiThan: false,
    locLabel: isLoc ? 'L' : '-',
    maLabel: isMa ? 'M' : '-',
    daoLabel: isDao ? 'Đ' : '-',
    quyLabel: isQuyNhan ? 'Q' : '-',
    quaiThanLabel: '-',
  };
}

/**
 * Tính Phục Thần cho toàn bộ 6 hào của Quẻ Chủ
 *
 * Căn cứ: Bốc Phệ Chính Tông & Tăng San Bốc Dịch.
 * Quẻ Bát Thuần của Cung chứa đầy đủ 5 Lục Thân. Nếu quẻ chủ thiếu Lục Thân nào,
 * Lục Thân đó phục dưới hào tương ứng của quẻ Bát Thuần bản Cung.
 */
export function calculateHexagramPhucThan(
  primaryHexNumber: number
): Record<LinePosition, PhucThanInfo> {
  const palaceInfo = getPalaceInfoByHexagramNumber(primaryHexNumber);
  const result: Partial<Record<LinePosition, PhucThanInfo>> = {};

  // Tìm Quẻ Bát Thuần của Cung này
  const palaceId = palaceInfo.palace;
  const palace = BA_GONG_PALACES.find((p) => p.id === palaceId);
  const pureHexNumber = palace ? palace.hexagramNumbers[0]! : primaryHexNumber;

  const primaryHex = HEXAGRAM_MAP[primaryHexNumber];
  const pureHex = HEXAGRAM_MAP[pureHexNumber];

  if (!primaryHex || !pureHex) {
    return result as Record<LinePosition, PhucThanInfo>;
  }

  // Lấy nạp giáp của Quẻ Chủ
  const primaryNaJiaLines = getNaJiaForHexagram(
    primaryHex.lowerTrigram.code,
    primaryHex.upperTrigram.code
  );
  // Lấy nạp giáp của Quẻ Bát Thuần
  const pureNaJiaLines = getNaJiaForHexagram(
    pureHex.lowerTrigram.code,
    pureHex.upperTrigram.code
  );

  // Tính Lục Thân hiện có trong Quẻ Chủ
  const existingRelations = new Set<SixRelation>();
  for (const line of primaryNaJiaLines) {
    const rel = determineSixRelation(line.element, palaceInfo.palaceElement);
    existingRelations.add(rel);
  }

  // 5 Lục Thân chuẩn
  const allRelations = [
    SixRelation.HUYNH_DE,
    SixRelation.TU_TON,
    SixRelation.THE_TAI,
    SixRelation.QUAN_QUY,
    SixRelation.PHU_MAU,
  ];

  // Tìm các Lục Thân bị thiếu
  const missingRelations = allRelations.filter((r) => !existingRelations.has(r));

  // Kiểm tra từng hào của Quẻ Bát Thuần (pos: 1..6)
  for (let pos = 1; pos <= 6; pos++) {
    const pureLine = pureNaJiaLines[pos - 1]!;
    const pureRel = determineSixRelation(pureLine.element, palaceInfo.palaceElement);

    if (missingRelations.includes(pureRel)) {
      // Hào này có Phục Thần!
      const shortPrefix =
        pureRel === SixRelation.THE_TAI
          ? 'Tài'
          : pureRel === SixRelation.QUAN_QUY
          ? 'Quan'
          : pureRel === SixRelation.PHU_MAU
          ? 'Phụ'
          : pureRel === SixRelation.TU_TON
          ? 'Tử'
          : 'Huynh';

      result[pos as LinePosition] = {
        hasPhucThan: true,
        sixRelation: pureRel,
        sixRelationName: SIX_RELATION_MAP[pureRel].name,
        stem: pureLine.stem,
        branch: pureLine.branch,
        canChi: pureLine.canChi,
        element: pureLine.element,
        elementName: getElementName(pureLine.element),
        shortLabel: `${shortPrefix}-${pureLine.branch}`,
      };
    } else {
      result[pos as LinePosition] = {
        hasPhucThan: false,
        shortLabel: '',
      };
    }
  }

  return result as Record<LinePosition, PhucThanInfo>;
}

/**
 * Xây dựng dữ liệu phân tích bổ sung cho 1 Hào (Quẻ Chủ hoặc Quẻ Biến)
 */
export function createSupplementaryLineData(params: {
  position: LinePosition;
  canChi: string;
  stem: string;
  branch: string;
  element: Element;
  elementName: string;
  isMoving: boolean;
  dayStem: string;
  dayBranch: string;
  monthBranch: string;
  phucThan?: PhucThanInfo;
  isVoid?: boolean;
}): SupplementaryLineData {
  const dayLifeStage = calculateLifeStage(params.element, params.dayBranch);
  const monthLifeStage = calculateLifeStage(params.element, params.monthBranch);
  const deities = calculateAuxiliaryDeities(params.dayStem, params.dayBranch, params.branch);

  return {
    position: params.position,
    canChi: params.canChi,
    stem: params.stem,
    branch: params.branch,
    element: params.element,
    elementName: params.elementName,
    isMoving: params.isMoving,
    dayLifeStage,
    monthLifeStage,
    deities,
    phucThan: params.phucThan || { hasPhucThan: false, shortLabel: '' },
    isVoid: !!params.isVoid,
  };
}
