/**
 * Động Cơ Đánh Giá Vượng Suy & Nội Lực Lục Hào (Six Yao Strength Engine)
 *
 * NGUỒN TƯ LIỆU ĐỐI CHIẾU KINH ĐIỂN:
 * 1. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức (Thanh triều):
 *    - Ngũ Hành Tứ Thời Vượng Tướng Quyết (五行四時旺相訣)
 *    - Nguyệt Kiến Luận, Nhật Thần Luận, Ám Động Ca, Tuần Không Quyết, Tam Hợp Cục.
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân (Thanh triều):
 *    - Chương Nguyệt Kiến, Chương Nhật Thần, Chương Ám Động, Chương Tam Hợp Hội Cục.
 *
 * NGUYÊN TẮC CỐT LÕI:
 * - Đương lệnh giả VƯỢNG, Nguyệt sinh giả TƯỚNG, Hào sinh Nguyệt vi HƯU, Hào khắc Nguyệt vi TÙ, Nguyệt khắc Hào vi TỬ.
 * - Khí bẩm sinh do Nguyệt Lệnh định đoạt; Lực hiện hữu do Nhật Thần chi phối.
 * - KHÔNG KẾT LUẬN CÁT/HUNG ĐƠN PHƯƠNG TỪ MỘT YẾU TỐ ĐƠN LẺ.
 * - Đánh giá đa chiều khách quan, phân định rõ Ám Động vs Nhật Phá, Chân Không vs Giả Không.
 */

import {
  Element,
  getElementName,
  getBranchElement,
  getNaJiaForHexagram,
  LinePosition,
  SixRelation,
  SIX_RELATION_MAP,
} from '@kindich/domain';

import {
  analyzeCalendar,
  isBranchClash,
  isBranchHarmony,
  HARMONY_MAP,
} from '../calendar-analysis/calendar-analysis.engine';

import {
  isElementGenerating,
  isElementOvercoming,
  calculateSixRelations,
} from '../six-relations/six-relations.engine';

import {
  CalculateYaoStrengthParams,
  HexagramStrengthResult,
  InputYaoForStrengthAnalysis,
  InterYaoRelation,
  LineStrengthAnalysis,
  SeasonalStrength,
  StrengthFactor,
  StrengthLevel,
  ThreeHarmonyFormation,
  VoidStatusType,
} from './yao-strength.types';

/**
 * Phiên bản bộ quy tắc đánh giá lực lượng Lục Hào
 */
export const YAO_STRENGTH_RULE_VERSION = 'YAO-STRENGTH-V1';

/**
 * Nguồn tư liệu đối chiếu chuẩn tắc
 */
export const YAO_STRENGTH_SOURCE =
  'Bốc Phệ Chính Tông (Quyển 1: Ngũ Hành Tứ Thời Vượng Tướng, Nguyệt Kiến, Nhật Thần, Ám Động, Tuần Không, Tam Hợp); Tăng San Bốc Dịch (Chương 16 - 25).';

/**
 * Tên tiếng Việt và mô tả của 5 trạng thái Ngũ Vượng (Vượng, Tướng, Hưu, Tù, Tử)
 */
export const SEASONAL_STRENGTH_NAMES: Record<
  SeasonalStrength,
  { name: string; description: string }
> = {
  [SeasonalStrength.VUONG]: {
    name: 'Vượng',
    description: 'Cùng hành với Nguyệt Lệnh ("Đồng khí vi Vượng"), khí lực đang ở đỉnh cao cực thịnh nhất.',
  },
  [SeasonalStrength.TUONG]: {
    name: 'Tướng',
    description: 'Được Nguyệt Lệnh tương sinh ("Nguyệt sinh giả vi Tướng"), khí lực đang phát triển mạnh mẽ.',
  },
  [SeasonalStrength.HUU]: {
    name: 'Hưu',
    description: 'Hào sinh Nguyệt Lệnh ("Hào sinh Nguyệt vi Hưu"), bị tiết hao khí lực, đang trong thời kỳ nghỉ ngơi thoái khí.',
  },
  [SeasonalStrength.TU]: {
    name: 'Tù',
    description: 'Hào khắc Nguyệt Lệnh ("Hào khắc Nguyệt vi Tù"), tiêu hao lực lượng chống cự lệnh tháng, bị tù hãm vô quyền.',
  },
  [SeasonalStrength.TU_SI]: {
    name: 'Tử',
    description: 'Bị Nguyệt Lệnh trực tiếp khắc chế ("Nguyệt khắc Hào vi Tử"), tổn thương suy kiệt nặng nề nhất.',
  },
};

/**
 * Tên hiển thị tiếng Việt của các cấp độ thực lực
 */
export const STRENGTH_LEVEL_NAMES: Record<StrengthLevel, string> = {
  [StrengthLevel.RAT_VUONG]: 'Rất vượng',
  [StrengthLevel.VUONG]: 'Vượng',
  [StrengthLevel.TRUNG_BINH]: 'Bình hòa',
  [StrengthLevel.SUY]: 'Suy',
  [StrengthLevel.RAT_SUY]: 'Rất suy',
};

/**
 * Cấu hình 4 Cục Tam Hợp trong 12 Địa Chi
 */
const THREE_HARMONIES_CONFIG = [
  {
    name: 'Thân Tý Thìn hợp Thủy cục',
    element: Element.THUY,
    elementName: 'Thủy',
    branches: ['Thân', 'Tý', 'Thìn'] as const,
  },
  {
    name: 'Hợi Mão Mùi hợp Mộc cục',
    element: Element.MOC,
    elementName: 'Mộc',
    branches: ['Hợi', 'Mão', 'Mùi'] as const,
  },
  {
    name: 'Dần Ngọ Tuất hợp Hỏa cục',
    element: Element.HOA,
    elementName: 'Hỏa',
    branches: ['Dần', 'Ngọ', 'Tuất'] as const,
  },
  {
    name: 'Tỵ Dậu Sửu hợp Kim cục',
    element: Element.KIM,
    elementName: 'Kim',
    branches: ['Tỵ', 'Dậu', 'Sửu'] as const,
  },
];

/**
 * Xác định trạng thái Vượng, Tướng, Hưu, Tù, Tử của Hào đối với Nguyệt Lệnh
 *
 * @param lineElement Ngũ Hành của Hào
 * @param monthElement Ngũ Hành của Nguyệt Kiến (Chi tháng)
 * @returns SeasonalStrength
 */
export function determineSeasonalStrength(
  lineElement: Element,
  monthElement: Element
): SeasonalStrength {
  // 1. Cùng hành với tháng: VƯỢNG
  if (lineElement === monthElement) {
    return SeasonalStrength.VUONG;
  }

  // 2. Tháng sinh Hào: TƯỚNG
  if (isElementGenerating(monthElement, lineElement)) {
    return SeasonalStrength.TUONG;
  }

  // 3. Hào sinh Tháng: HƯU (tiết khí)
  if (isElementGenerating(lineElement, monthElement)) {
    return SeasonalStrength.HUU;
  }

  // 4. Hào khắc Tháng: TÙ
  if (isElementOvercoming(lineElement, monthElement)) {
    return SeasonalStrength.TU;
  }

  // 5. Tháng khắc Hào: TỬ
  if (isElementOvercoming(monthElement, lineElement)) {
    return SeasonalStrength.TU_SI;
  }

  throw new Error(
    `Không thể xác định trạng thái mùa giữa Hào (${lineElement}) và Tháng (${monthElement}).`
  );
}

/**
 * Phân tích quan hệ sinh, khắc, xung, hợp giữa 2 hào
 */
export function analyzeInterYao(
  sourceLine: { position: LinePosition; branch: string; element: Element },
  targetLine: { position: LinePosition; branch: string; element: Element }
): InterYaoRelation {
  let elementRelation: 'SINH' | 'KHAC' | 'TY_HOA' | 'NONE' = 'NONE';
  let relationText = '';

  if (sourceLine.element === targetLine.element) {
    elementRelation = 'TY_HOA';
    relationText = 'đồng hành tỷ hòa với';
  } else if (isElementGenerating(sourceLine.element, targetLine.element)) {
    elementRelation = 'SINH';
    relationText = 'sinh';
  } else if (isElementOvercoming(sourceLine.element, targetLine.element)) {
    elementRelation = 'KHAC';
    relationText = 'khắc';
  }

  const isHarmonious = isBranchHarmony(sourceLine.branch, targetLine.branch);
  const isClash = isBranchClash(sourceLine.branch, targetLine.branch);

  const modifiers: string[] = [];
  if (isHarmonious) {
    const harmonyName = HARMONY_MAP[sourceLine.branch]?.name;
    modifiers.push(harmonyName ? `Lục Hợp (${harmonyName})` : 'Lục Hợp');
  }
  if (isClash) {
    modifiers.push('Lục Xung');
  }

  const modifierText = modifiers.length > 0 ? ` [${modifiers.join(', ')}]` : '';
  const description = `Hào ${sourceLine.position} (${sourceLine.branch} ${getElementName(sourceLine.element)}) ${relationText} Hào ${targetLine.position} (${targetLine.branch} ${getElementName(targetLine.element)})${modifierText}`;

  return {
    targetPosition: targetLine.position,
    targetBranch: targetLine.branch,
    targetElement: targetLine.element,
    elementRelation,
    isHarmonious,
    isClash,
    description,
  };
}

/**
 * Phát hiện các cấu trúc Tam Hợp Cục trong 6 hào của quẻ
 */
export function detectThreeHarmonies(
  lines: readonly { position: LinePosition; branch: string }[]
): ThreeHarmonyFormation[] {
  const formations: ThreeHarmonyFormation[] = [];

  for (const config of THREE_HARMONIES_CONFIG) {
    const matchedPositions: LinePosition[] = [];
    const matchedBranches = new Set<string>();

    for (const line of lines) {
      if ((config.branches as readonly string[]).includes(line.branch)) {
        matchedPositions.push(line.position);
        matchedBranches.add(line.branch);
      }
    }

    // Đủ cả 3 chi của cục Tam Hợp
    if (matchedBranches.size === 3) {
      formations.push({
        name: config.name,
        element: config.element,
        elementName: config.elementName,
        linePositions: Object.freeze(matchedPositions),
        branches: config.branches,
        isComplete: true,
      });
    }
  }

  return formations;
}

/**
 * Đánh giá chi tiết lực lượng của một Hào cụ thể
 */
function evaluateSingleLineStrength(
  line: InputYaoForStrengthAnalysis,
  allLines: readonly InputYaoForStrengthAnalysis[],
  calendarResult: ReturnType<typeof analyzeCalendar>
): LineStrengthAnalysis {
  const lineElement = line.element ?? getBranchElement(line.branch);
  const elementName = getElementName(lineElement);
  const isMoving = line.isMoving ?? false;

  const dayBranch = calendarResult.dayMaster.branch;
  const dayElement = calendarResult.dayMaster.element;
  const monthBranch = calendarResult.monthCommander.branch;
  const monthElement = calendarResult.monthCommander.element;

  const factors: StrengthFactor[] = [];

  // 1. Phân tích Vượng Suy theo Nguyệt Lệnh (Khí thời gian)
  const seasonalState = determineSeasonalStrength(lineElement, monthElement);
  const seasonalInfo = SEASONAL_STRENGTH_NAMES[seasonalState];

  switch (seasonalState) {
    case SeasonalStrength.VUONG:
      factors.push({
        source: 'NGUYET_LENH',
        effectType: 'TY_HOA',
        weight: 3.0,
        reason: `Đắc Nguyệt Lệnh, đồng khí với Chi tháng ${monthBranch} (${getElementName(monthElement)}) nên ở trạng thái Vượng cực thịnh.`,
      });
      break;
    case SeasonalStrength.TUONG:
      factors.push({
        source: 'NGUYET_LENH',
        effectType: 'SINH_TRO',
        weight: 2.0,
        reason: `Được Nguyệt Lệnh ${monthBranch} (${getElementName(monthElement)}) tương sinh nên ở trạng thái Tướng hữu lực.`,
      });
      break;
    case SeasonalStrength.HUU:
      factors.push({
        source: 'NGUYET_LENH',
        effectType: 'TIET_KHI',
        weight: -1.0,
        reason: `Sinh xuất cho Nguyệt Lệnh ${monthBranch} (${getElementName(monthElement)}) nên ở trạng thái Hưu, khí thoái nghỉ ngơi.`,
      });
      break;
    case SeasonalStrength.TU:
      factors.push({
        source: 'NGUYET_LENH',
        effectType: 'TIET_KHI',
        weight: -1.5,
        reason: `Khắc Nguyệt Lệnh ${monthBranch} (${getElementName(monthElement)}) nên ở trạng thái Tù, hao tổn khí lực.`,
      });
      break;
    case SeasonalStrength.TU_SI:
      factors.push({
        source: 'NGUYET_LENH',
        effectType: 'KHAC_PHAT',
        weight: -2.5,
        reason: `Bị Nguyệt Lệnh ${monthBranch} (${getElementName(monthElement)}) trực tiếp khắc phạt nên ở trạng thái Tử, vô khí.`,
      });
      break;
  }

  // 2. Phân tích tác động của Nguyệt Kiến (Xung, Hợp, Nguyệt Phá)
  const isMonthlyBreak = line.branch === calendarResult.monthCommander.monthlyBreakBranch;
  const isNguyetClash = isBranchClash(line.branch, monthBranch);
  const isNguyetHop = isBranchHarmony(line.branch, monthBranch);
  const isMonthSupported = isElementGenerating(monthElement, lineElement) || lineElement === monthElement;
  const isMonthSuppressed = isElementOvercoming(monthElement, lineElement);

  if (isMonthlyBreak) {
    factors.push({
      source: 'NGUYET_LENH',
      effectType: 'XUNG_PHA',
      weight: -3.0,
      reason: `Phạm Nguyệt Phá vì tương xung với Nguyệt Kiến (${line.branch} xung ${monthBranch}), căn cơ bị xung tán nặng nề.`,
    });
  }

  if (isNguyetHop) {
    factors.push({
      source: 'NGUYET_LENH',
      effectType: 'HOP_TRO',
      weight: 1.5,
      reason: `Được Nguyệt Hợp (${HARMONY_MAP[line.branch]?.name ?? 'Hợp với Nguyệt Kiến'}), có chỗ che chở vững chãi.`,
    });
  }

  const monthDescription = isMonthlyBreak
    ? `Phạm Nguyệt Phá (xung với ${monthBranch})`
    : isNguyetHop
    ? `Được Nguyệt Hợp với ${monthBranch}`
    : isMonthSupported
    ? `Được Nguyệt Kiến ${monthBranch} sinh trợ`
    : isMonthSuppressed
    ? `Bị Nguyệt Kiến ${monthBranch} khắc phạt`
    : `Bình thường đối với Nguyệt Kiến ${monthBranch}`;

  // 3. Phân tích tác động của Nhật Thần (Địa Chi Ngày)
  const isNhatClash = isBranchClash(line.branch, dayBranch);
  const isNhatHop = isBranchHarmony(line.branch, dayBranch);
  const isDaySupported = isElementGenerating(dayElement, lineElement) || lineElement === dayElement;
  const isDaySuppressed = isElementOvercoming(dayElement, lineElement);

  if (isDaySupported) {
    const isSame = lineElement === dayElement;
    factors.push({
      source: 'NHAT_THAN',
      effectType: isSame ? 'TY_HOA' : 'SINH_TRO',
      weight: isSame ? 1.5 : 2.0,
      reason: isSame
        ? `Được Nhật Thần ${dayBranch} (${getElementName(dayElement)}) tỷ hòa đồng hành tương trợ.`
        : `Được Nhật Thần ${dayBranch} (${getElementName(dayElement)}) tương sinh bồi bổ lực lượng.`,
    });
  } else if (isDaySuppressed) {
    factors.push({
      source: 'NHAT_THAN',
      effectType: 'KHAC_PHAT',
      weight: -2.0,
      reason: `Bị Nhật Thần ${dayBranch} (${getElementName(dayElement)}) khắc phạt đè nén.`,
    });
  }

  if (isNhatHop) {
    factors.push({
      source: 'NHAT_THAN',
      effectType: 'HOP_TRO',
      weight: 1.5,
      reason: `Được Nhật Hợp (${HARMONY_MAP[line.branch]?.name ?? 'Hợp với Nhật Thần'}), được ngày nâng đỡ giữ gìn.`,
    });
  }

  // 4. Phân định Ám Động vs Nhật Phá (khi gặp Nhật Xung)
  let isAmDong = false;
  let isNhatPha = false;

  if (isNhatClash) {
    // Nếu hào Vượng hoặc Tướng ở Nguyệt Lệnh (hoặc được Nhật sinh) -> Ám Động
    const isVigorous =
      seasonalState === SeasonalStrength.VUONG ||
      seasonalState === SeasonalStrength.TUONG ||
      isDaySupported;

    if (isVigorous && !isMoving) {
      isAmDong = true;
      factors.push({
        source: 'NHAT_THAN',
        effectType: 'SINH_TRO',
        weight: 1.0,
        reason: `Ám Động: Hào tĩnh nhưng vốn hữu khí vượng tướng, gặp Nhật Thần ${dayBranch} tương xung hóa thành xung khởi, có lực tác động như hào động.`,
      });
    } else {
      isNhatPha = true;
      factors.push({
        source: 'NHAT_THAN',
        effectType: 'XUNG_PHA',
        weight: -1.5,
        reason: `Nhật Phá: Hào ở trạng thái hưu tù suy nhược gặp Nhật Thần ${dayBranch} tương xung hóa thành xung tán, hao tổn.`,
      });
    }
  }

  const dayDescription = isNhatClash
    ? isAmDong
      ? `Ám Động (Nhật xung khởi)`
      : `Nhật Phá (Nhật xung tán)`
    : isNhatHop
    ? `Được Nhật Hợp với ${dayBranch}`
    : isDaySupported
    ? `Được Nhật Thần ${dayBranch} sinh phù`
    : isDaySuppressed
    ? `Bị Nhật Thần ${dayBranch} khắc phạt`
    : `Bình thường đối với Nhật Thần ${dayBranch}`;

  // 5. Phân định Chân Không vs Giả Không
  const isVoid = calendarResult.dayMaster.voidBranches.includes(line.branch);
  let voidType: VoidStatusType = VoidStatusType.NONE;

  if (isVoid) {
    // Nếu vượng tướng hoặc được Nhật/Nguyệt sinh trợ hoặc có động -> Giả Không
    const isVigorousInSeason =
      seasonalState === SeasonalStrength.VUONG || seasonalState === SeasonalStrength.TUONG;
    const isStronglyAssisted = isDaySupported || isMonthSupported || isMoving || isAmDong;

    if (isVigorousInSeason || isStronglyAssisted) {
      voidType = VoidStatusType.GIA_KHONG;
      factors.push({
        source: 'THAN_SAT',
        effectType: 'KHONG_VONG',
        weight: -0.5,
        reason: `Giả Không: Hào rơi vào Tuần Không nhưng vốn đắc vượng tướng hoặc có trợ lực, xuất Không (hết tuần) hoặc phùng xung thì ứng sự hữu hiệu.`,
      });
    } else {
      voidType = VoidStatusType.CHAN_KHONG;
      factors.push({
        source: 'THAN_SAT',
        effectType: 'KHONG_VONG',
        weight: -2.5,
        reason: `Chân Không: Hào rơi vào Tuần Không lại ở trạng thái hưu tù tử tuyệt, không có nguồn sinh trợ, thực sự trống rỗng vô lực.`,
      });
    }
  }

  // 6. Yếu tố hào động (nếu là hào động)
  if (isMoving) {
    factors.push({
      source: 'DONG_HAO',
      effectType: 'SINH_TRO',
      weight: 1.0,
      reason: 'Hào Động: Hào phát động có năng lực biến đổi và chủ động sinh khắc các hào khác.',
    });
  }

  // 7. Phân tích tương tác với các hào khác trong quẻ
  const interYaoRelations: InterYaoRelation[] = [];
  for (const other of allLines) {
    if (other.position !== line.position) {
      const otherElement = other.element ?? getBranchElement(other.branch);
      interYaoRelations.push(
        analyzeInterYao(
          { position: line.position, branch: line.branch, element: lineElement },
          { position: other.position, branch: other.branch, element: otherElement }
        )
      );
    }
  }

  // 8. Tổng hợp điểm lực lượng tham chiếu (Score)
  const score = Number(
    factors.reduce((acc, f) => acc + f.weight, 0).toFixed(1)
  );

  // 9. Xác định cấp độ thực lực tổng hợp
  let overallLevel: StrengthLevel;
  if (score >= 3.5) {
    overallLevel = StrengthLevel.RAT_VUONG;
  } else if (score >= 1.5) {
    overallLevel = StrengthLevel.VUONG;
  } else if (score >= -1.0) {
    overallLevel = StrengthLevel.TRUNG_BINH;
  } else if (score >= -3.0) {
    overallLevel = StrengthLevel.SUY;
  } else {
    overallLevel = StrengthLevel.RAT_SUY;
  }

  const overallLevelName = STRENGTH_LEVEL_NAMES[overallLevel];

  // 10. Tạo đoạn văn bản giải thích khách quan (Reasoning)
  const sixRelText = line.sixRelation ? `${SIX_RELATION_MAP[line.sixRelation]?.name ?? ''} ` : '';
  const statusBadges: string[] = [];
  if (isMonthlyBreak) statusBadges.push('Nguyệt Phá');
  if (isAmDong) statusBadges.push('Ám Động');
  if (isNhatPha) statusBadges.push('Nhật Phá');
  if (isVoid) statusBadges.push(voidType === VoidStatusType.GIA_KHONG ? 'Giả Không' : 'Chân Không');
  if (isNhatHop) statusBadges.push('Nhật Hợp');
  if (isNguyetHop) statusBadges.push('Nguyệt Hợp');

  const badgeText = statusBadges.length > 0 ? ` (Trạng thái đặc thù: ${statusBadges.join(', ')})` : '';

  const reasoning = `Hào ${line.position} ${sixRelText}${line.branch} (${elementName}) ở tháng ${monthBranch} đắc trạng thái ${seasonalInfo.name}. ${dayDescription}; ${monthDescription}.${badgeText} Tổng hợp đa chiều, thực lực nội tại của hào ở mức ${overallLevelName} (điểm lượng hóa: ${score > 0 ? '+' : ''}${score}).`;

  return {
    position: line.position,
    stem: line.stem,
    branch: line.branch,
    element: lineElement,
    elementName,
    sixRelation: line.sixRelation,
    sixRelationName: line.sixRelation ? SIX_RELATION_MAP[line.sixRelation]?.name : undefined,
    isMoving,
    seasonalState: {
      state: seasonalState,
      name: seasonalInfo.name,
      description: seasonalInfo.description,
    },
    dayInfluence: {
      dayBranch,
      dayElement,
      isSupported: isDaySupported,
      isSuppressed: isDaySuppressed,
      isHarmonious: isNhatHop,
      isClash: isNhatClash,
      description: dayDescription,
    },
    monthInfluence: {
      monthBranch,
      monthElement,
      isSupported: isMonthSupported,
      isSuppressed: isMonthSuppressed,
      isHarmonious: isNguyetHop,
      isClash: isNguyetClash,
      isMonthlyBreak,
      description: monthDescription,
    },
    specialStates: {
      isVoid,
      voidType,
      isMonthlyBreak,
      isAmDong,
      isNhatPha,
      isNhatHop,
      isNguyetHop,
    },
    interYaoRelations: Object.freeze(interYaoRelations),
    factors: Object.freeze(factors),
    score,
    overallLevel,
    overallLevelName,
    reasoning,
  };
}

/**
 * Động cơ phân tích Vượng Suy & Thực Lực 6 Hào toàn diện
 *
 * @param params Tham số đầu vào (ngày, tháng, hào của quẻ)
 * @returns HexagramStrengthResult Kết quả phân tích lực lượng 6 hào
 */
export function calculateYaoStrengths(
  params: CalculateYaoStrengthParams
): HexagramStrengthResult {
  // 1. Phân tích tương tác lịch pháp với Nhật Thần & Nguyệt Kiến
  const calendarResult = analyzeCalendar({
    dayCanChi: params.dayCanChi,
    monthCanChi: params.monthCanChi,
  });

  // 2. Chuẩn bị danh sách 6 hào
  let inputLines: InputYaoForStrengthAnalysis[];

  if (params.lines && params.lines.length === 6) {
    inputLines = [...params.lines];
  } else if (params.lowerTrigramCode && params.upperTrigramCode) {
    const najia = getNaJiaForHexagram(params.lowerTrigramCode, params.upperTrigramCode);

    // Tính Lục Thân nếu có thông tin Cung hoặc hexagramNumber
    let sixRelLines: Record<number, SixRelation> = {};
    if (params.hexagramNumber || params.palaceElement) {
      try {
        const sixRelResult = calculateSixRelations({
          hexagramNumber: params.hexagramNumber,
          lowerTrigramCode: params.lowerTrigramCode,
          upperTrigramCode: params.upperTrigramCode,
          customPalaceElement: params.palaceElement,
        });
        for (const line of sixRelResult.lines) {
          sixRelLines[line.position] = line.relation;
        }
      } catch {
        // Bỏ qua nếu thiếu thông tin cung
      }
    }

    const movingSet = new Set(params.movingLineIndices ?? []);

    inputLines = najia.map((l) => ({
      position: l.position,
      branch: l.branch,
      stem: l.stem,
      element: l.element,
      isMoving: movingSet.has(l.position),
      sixRelation: sixRelLines[l.position],
    }));
  } else {
    throw new Error(
      'Cần cung cấp danh sách 6 hào (lines) hoặc cặp mã quái (lowerTrigramCode, upperTrigramCode).'
    );
  }

  // 3. Phân tích lực lượng cho từng hào
  const lineAnalyses = inputLines.map((line) =>
    evaluateSingleLineStrength(line, inputLines, calendarResult)
  );

  // 4. Phát hiện Tam Hợp Cục trong 6 hào
  const threeHarmonies = detectThreeHarmonies(inputLines);

  // 5. Xác định hào mạnh nhất và yếu nhất trong quẻ
  let maxScore = -Infinity;
  let minScore = Infinity;
  let strongestPosition: LinePosition = 1;
  let weakestPosition: LinePosition = 1;

  for (const l of lineAnalyses) {
    if (l.score > maxScore) {
      maxScore = l.score;
      strongestPosition = l.position;
    }
    if (l.score < minScore) {
      minScore = l.score;
      weakestPosition = l.position;
    }
  }

  // 6. Xác định hành chiếm ưu thế trong quẻ
  const elementCounts: Record<string, number> = {};
  for (const l of lineAnalyses) {
    elementCounts[l.element] = (elementCounts[l.element] ?? 0) + 1;
  }
  let dominantElement = Element.MOC;
  let maxCount = 0;
  for (const [el, count] of Object.entries(elementCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantElement = el as Element;
    }
  }

  const dominantName = getElementName(dominantElement);
  const summaryText = `Quẻ có hành ${dominantName} chiếm đa số (${maxCount}/6 hào). Hào mạnh nhất là Hào ${strongestPosition} (${lineAnalyses[strongestPosition - 1]?.overallLevelName}, điểm: ${maxScore}); Hào yếu nhất là Hào ${weakestPosition} (${lineAnalyses[weakestPosition - 1]?.overallLevelName}, điểm: ${minScore}).`;

  return {
    ruleVersion: YAO_STRENGTH_RULE_VERSION,
    sourceReference: YAO_STRENGTH_SOURCE,
    calendarContext: {
      dayCanChi: calendarResult.dayMaster.canChi,
      dayBranch: calendarResult.dayMaster.branch,
      dayElement: calendarResult.dayMaster.element,
      monthCanChi: calendarResult.monthCommander.canChi,
      monthBranch: calendarResult.monthCommander.branch,
      monthElement: calendarResult.monthCommander.element,
      voidBranches: calendarResult.dayMaster.voidBranches,
      monthlyBreakBranch: calendarResult.monthCommander.monthlyBreakBranch,
    },
    lines: lineAnalyses as unknown as readonly [
      LineStrengthAnalysis,
      LineStrengthAnalysis,
      LineStrengthAnalysis,
      LineStrengthAnalysis,
      LineStrengthAnalysis,
      LineStrengthAnalysis,
    ],
    threeHarmonies: Object.freeze(threeHarmonies),
    summary: {
      dominantElement,
      dominantElementName: dominantName,
      strongestLinePosition: strongestPosition,
      weakestLinePosition: weakestPosition,
      summaryText,
    },
  };
}
