/**
 * Động Cơ Phân Tích Lịch Pháp (Calendar Analysis Engine) trong Dịch học Lục Hào
 *
 * NGUỒN TƯ LIỆU ĐỐI CHIẾU KINH ĐIỂN:
 * 1. "Bốc Phệ Chính Tông" (卜筮正宗) - Vương Duy Đức:
 *    - Quyển 1: Tuần Không Quyết, Lục Hợp Quyết, Lục Xung Quyết, Nguyệt Kiến Luận, Nhật Thần Luận, Nguyệt Phá Ca.
 * 2. "Tăng San Bốc Dịch" (增刪卜易) - Dã Hạc Đạo Nhân:
 *    - Chương 16 (Tuần Không), Chương 17 (Nguyệt Kiến), Chương 18 (Nguyệt Phá),
 *    - Chương 19 (Nhật Thần), Chương 20 (Lục Hợp), Chương 21 (Lục Xung).
 *
 * NGUYÊN TẮC:
 * - Nhật Thần (日辰): Địa Chi của ngày gieo quẻ.
 * - Nguyệt Kiến (月建): Địa Chi của tháng theo Tiết Khí.
 * - Tuần Không (Không Vong): 2 Địa Chi vắng mặt trong tuần Giáp của ngày.
 * - Nguyệt Phá (月破): Địa Chi bị Địa Chi tháng tương xung.
 */

import {
  Element,
  getElementName,
  getBranchElement,
  getNaJiaForHexagram,
} from '@kindich/domain';

import {
  CalendarAnalysisParams,
  CalendarAnalysisResult,
  DayMasterInfo,
  ElementRelationType,
  InputLineForCalendarAnalysis,
  LineCalendarAnalysis,
  LineDayRelation,
  LineMonthRelation,
  MonthCommanderInfo,
} from './calendar-analysis.types';

import {
  isElementGenerating,
  isElementOvercoming,
} from '../six-relations/six-relations.engine';

/**
 * Phiên bản bộ quy tắc phân tích lịch pháp
 */
export const CALENDAR_ANALYSIS_RULE_VERSION = 'CAL-ANALYSIS-V1';

/**
 * Nguồn tư liệu đối chiếu chuẩn tắc
 */
export const CALENDAR_ANALYSIS_SOURCE =
  'Bốc Phệ Chính Tông (Quyển 1: Tuần Không, Lục Hợp, Lục Xung, Nguyệt Kiến, Nhật Thần, Nguyệt Phá); Tăng San Bốc Dịch (Chương 16 - 21).';

/**
 * 10 Thiên Can chuẩn tiếng Việt
 */
export const VALID_STEMS = [
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

/**
 * 12 Địa Chi chuẩn tiếng Việt
 */
export const VALID_BRANCHES = [
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

/**
 * Bảng 6 cặp Lục Xung (Lục Xung chi chi)
 */
export const CLASH_MAP: Record<string, string> = {
  'Tý': 'Ngọ',
  'Ngọ': 'Tý',
  'Sửu': 'Mùi',
  'Mùi': 'Sửu',
  'Dần': 'Thân',
  'Thân': 'Dần',
  'Mão': 'Dậu',
  'Dậu': 'Mão',
  'Thìn': 'Tuất',
  'Tuất': 'Thìn',
  'Tỵ': 'Hợi',
  'Hợi': 'Tỵ',
};

/**
 * Bảng 6 cặp Lục Hợp và hành hợp hóa
 */
export const HARMONY_MAP: Record<string, { partner: string; resultingElement: Element; name: string }> = {
  'Tý': { partner: 'Sửu', resultingElement: Element.THO, name: 'Tý Sửu hợp Thổ' },
  'Sửu': { partner: 'Tý', resultingElement: Element.THO, name: 'Tý Sửu hợp Thổ' },
  'Dần': { partner: 'Hợi', resultingElement: Element.MOC, name: 'Dần Hợi hợp Mộc' },
  'Hợi': { partner: 'Dần', resultingElement: Element.MOC, name: 'Dần Hợi hợp Mộc' },
  'Mão': { partner: 'Tuất', resultingElement: Element.HOA, name: 'Mão Tuất hợp Hỏa' },
  'Tuất': { partner: 'Mão', resultingElement: Element.HOA, name: 'Mão Tuất hợp Hỏa' },
  'Thìn': { partner: 'Dậu', resultingElement: Element.KIM, name: 'Thìn Dậu hợp Kim' },
  'Dậu': { partner: 'Thìn', resultingElement: Element.KIM, name: 'Thìn Dậu hợp Kim' },
  'Tỵ': { partner: 'Thân', resultingElement: Element.THUY, name: 'Tỵ Thân hợp Thủy' },
  'Thân': { partner: 'Tỵ', resultingElement: Element.THUY, name: 'Tỵ Thân hợp Thủy' },
  'Ngọ': { partner: 'Mùi', resultingElement: Element.THO, name: 'Ngọ Mùi hợp Thổ' },
  'Mùi': { partner: 'Ngọ', resultingElement: Element.THO, name: 'Ngọ Mùi hợp Thổ' },
};

/**
 * Kiểm tra 2 Địa Chi có thuộc quan hệ Lục Xung hay không
 */
export function isBranchClash(branch1: string, branch2: string): boolean {
  return CLASH_MAP[branch1] === branch2;
}

/**
 * Kiểm tra 2 Địa Chi có thuộc quan hệ Lục Hợp hay không
 */
export function isBranchHarmony(branch1: string, branch2: string): boolean {
  return HARMONY_MAP[branch1]?.partner === branch2;
}

/**
 * Lấy Địa Chi tương xung với một Địa Chi cho trước
 */
export function getClashingBranch(branch: string): string {
  const clashing = CLASH_MAP[branch];
  if (!clashing) {
    throw new Error(`Địa Chi không hợp lệ: "${branch}".`);
  }
  return clashing;
}

/**
 * Lấy Địa Chi bị Nguyệt Phá trong tháng (Chi xung với Nguyệt Kiến)
 *
 * @param monthBranch Địa Chi của tháng
 * @returns Tên Địa Chi bị Nguyệt Phá
 */
export function getMonthlyBreakBranch(monthBranch: string): string {
  return getClashingBranch(monthBranch);
}

/**
 * Chuẩn hóa một cặp Can Chi
 */
export function parseCanChiString(canChiStr: string): { stem: string; branch: string } {
  const parts = canChiStr.trim().split(/\s+/);
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Chuỗi Can Chi không hợp lệ: "${canChiStr}". Phải gồm Can và Chi cách nhau bởi dấu cách (ví dụ: "Giáp Tý").`
    );
  }
  return { stem: parts[0], branch: parts[1] };
}

/**
 * Xác định Tuần Giáp và 2 Địa Chi Không Vong (Tuần Không) của ngày gieo quẻ
 *
 * Thuật toán toán học:
 * Trong chu kỳ 60 Hoa Giáp, mỗi Tuần gồm 10 ngày bắt đầu từ Giáp:
 * offset = (index(Chi) - index(Can) + 12) % 12
 * 2 Chi Không Vong luôn ở vị trí (offset + 10) % 12 và (offset + 11) % 12
 *
 * @param stem Thiên Can ngày (Giáp đến Quý)
 * @param branch Địa Chi ngày (Tý đến Hợi)
 * @returns { weekCycle, voidBranches }
 */
export function calculateVoidBranches(
  stem: string,
  branch: string
): { weekCycle: string; voidBranches: readonly [string, string] } {
  const stemIndex = VALID_STEMS.indexOf(stem as (typeof VALID_STEMS)[number]);
  const branchIndex = VALID_BRANCHES.indexOf(branch as (typeof VALID_BRANCHES)[number]);

  if (stemIndex === -1) {
    throw new Error(`Thiên Can không hợp lệ: "${stem}".`);
  }
  if (branchIndex === -1) {
    throw new Error(`Địa Chi không hợp lệ: "${branch}".`);
  }

  const offset = (branchIndex - stemIndex + 12) % 12;
  const startBranch = VALID_BRANCHES[offset]!;
  const weekCycle = `Tuần Giáp ${startBranch}`;

  const voidBranch1 = VALID_BRANCHES[(offset + 10) % 12]!;
  const voidBranch2 = VALID_BRANCHES[(offset + 11) % 12]!;

  return {
    weekCycle,
    voidBranches: [voidBranch1, voidBranch2],
  };
}

/**
 * Phân tích quan hệ sinh khắc ngũ hành giữa Quan Tinh (Nhật/Nguyệt) và Hào
 */
export function determineOfficerElementRelation(
  officerElement: Element,
  lineElement: Element,
  officerTitle: 'Nhật Thần' | 'Nguyệt Kiến'
): { relation: ElementRelationType; description: string } {
  if (officerElement === lineElement) {
    return {
      relation: ElementRelationType.TY_HOA,
      description: `${officerTitle} tỷ hòa / đồng hành với Hào`,
    };
  }

  if (isElementGenerating(officerElement, lineElement)) {
    return {
      relation: ElementRelationType.SINH_HAO,
      description: `${officerTitle} sinh Hào`,
    };
  }

  if (isElementGenerating(lineElement, officerElement)) {
    return {
      relation: ElementRelationType.HAO_SINH,
      description: `Hào sinh ${officerTitle} (tiết khí)`,
    };
  }

  if (isElementOvercoming(officerElement, lineElement)) {
    return {
      relation: ElementRelationType.KHAC_HAO,
      description: `${officerTitle} khắc Hào`,
    };
  }

  if (isElementOvercoming(lineElement, officerElement)) {
    return {
      relation: ElementRelationType.HAO_KHAC,
      description: `Hào khắc ${officerTitle}`,
    };
  }

  throw new Error(
    `Không thể xác định quan hệ Ngũ Hành giữa ${officerElement} và ${lineElement}.`
  );
}

/**
 * Phân tích tương tác giữa một Hào với Nhật Thần (Địa Chi Ngày)
 */
function analyzeLineDayRelation(
  lineBranch: string,
  lineElement: Element,
  dayBranch: string,
  dayElement: Element
): LineDayRelation {
  const { relation, description } = determineOfficerElementRelation(
    dayElement,
    lineElement,
    'Nhật Thần'
  );

  const isHarmonious = isBranchHarmony(lineBranch, dayBranch);
  const harmonyInfo = HARMONY_MAP[lineBranch];
  const harmonyDescription = isHarmonious && harmonyInfo ? harmonyInfo.name : undefined;

  const isClash = isBranchClash(lineBranch, dayBranch);
  const clashDescription = isClash ? `${lineBranch} ${dayBranch} tương xung (Nhật Xung)` : undefined;

  return {
    dayBranch,
    dayElement,
    dayElementName: getElementName(dayElement),
    elementRelation: relation,
    elementRelationDescription: description,
    isHarmonious,
    harmonyDescription,
    isClash,
    clashDescription,
  };
}

/**
 * Phân tích tương tác giữa một Hào với Nguyệt Kiến (Địa Chi Tháng)
 */
function analyzeLineMonthRelation(
  lineBranch: string,
  lineElement: Element,
  monthBranch: string,
  monthElement: Element
): LineMonthRelation {
  const { relation, description } = determineOfficerElementRelation(
    monthElement,
    lineElement,
    'Nguyệt Kiến'
  );

  const isHarmonious = isBranchHarmony(lineBranch, monthBranch);
  const harmonyInfo = HARMONY_MAP[lineBranch];
  const harmonyDescription = isHarmonious && harmonyInfo ? harmonyInfo.name : undefined;

  const isClash = isBranchClash(lineBranch, monthBranch);
  const clashDescription = isClash
    ? `${lineBranch} ${monthBranch} tương xung (Nguyệt Phá)`
    : undefined;

  return {
    monthBranch,
    monthElement,
    monthElementName: getElementName(monthElement),
    elementRelation: relation,
    elementRelationDescription: description,
    isHarmonious,
    harmonyDescription,
    isClash,
    clashDescription,
  };
}

/**
 * Trích xuất và chuẩn hóa tham số đầu vào cho Calendar Analysis
 */
function extractCanChiParams(params: CalendarAnalysisParams): {
  dayStem: string;
  dayBranch: string;
  monthStem: string;
  monthBranch: string;
  solarTermName?: string;
} {
  let dayStem = params.dayStem;
  let dayBranch = params.dayBranch;
  let monthStem = params.monthStem;
  let monthBranch = params.monthBranch;
  let solarTermName = params.solarTermName;

  // 1. Trích xuất từ calendarResult nếu có
  if (params.calendarResult) {
    const { canChi, solarTerm } = params.calendarResult;
    if (canChi.day) {
      const parsedDay = parseCanChiString(canChi.day);
      dayStem = dayStem ?? parsedDay.stem;
      dayBranch = dayBranch ?? parsedDay.branch;
    }
    if (canChi.month) {
      const parsedMonth = parseCanChiString(canChi.month);
      monthStem = monthStem ?? parsedMonth.stem;
      monthBranch = monthBranch ?? parsedMonth.branch;
    }
    if (solarTerm?.name) {
      solarTermName = solarTermName ?? solarTerm.name;
    }
  }

  // 2. Trích xuất từ dayCanChi
  if (params.dayCanChi) {
    if (typeof params.dayCanChi === 'string') {
      const parsed = parseCanChiString(params.dayCanChi);
      dayStem = dayStem ?? parsed.stem;
      dayBranch = dayBranch ?? parsed.branch;
    } else {
      dayStem = dayStem ?? params.dayCanChi.stem;
      dayBranch = dayBranch ?? params.dayCanChi.branch;
    }
  }

  // 3. Trích xuất từ monthCanChi
  if (params.monthCanChi) {
    if (typeof params.monthCanChi === 'string') {
      const parsed = parseCanChiString(params.monthCanChi);
      monthStem = monthStem ?? parsed.stem;
      monthBranch = monthBranch ?? parsed.branch;
    } else {
      monthStem = monthStem ?? params.monthCanChi.stem;
      monthBranch = monthBranch ?? params.monthCanChi.branch;
    }
  }

  if (!dayStem || !dayBranch) {
    throw new Error('Thiếu thông tin Can Chi ngày (Nhật Thần).');
  }

  if (!monthStem || !monthBranch) {
    throw new Error('Thiếu thông tin Can Chi tháng (Nguyệt Kiến).');
  }

  return { dayStem, dayBranch, monthStem, monthBranch, solarTermName };
}

/**
 * Động cơ phân tích tương tác Lịch Pháp (Calendar Analysis) cho quẻ
 *
 * @param params Tham số Can Chi ngày, tháng và danh sách hào
 * @returns CalendarAnalysisResult Kết quả phân tích toàn diện
 */
export function analyzeCalendar(
  params: CalendarAnalysisParams
): CalendarAnalysisResult {
  const { dayStem, dayBranch, monthStem, monthBranch, solarTermName } =
    extractCanChiParams(params);

  // 1. Xác định Nhật Thần (Địa Chi Ngày)
  const dayElement = getBranchElement(dayBranch);
  const { weekCycle, voidBranches } = calculateVoidBranches(dayStem, dayBranch);
  const isMonthlyBreakDay = isBranchClash(dayBranch, monthBranch);

  const dayMaster: DayMasterInfo = {
    stem: dayStem,
    branch: dayBranch,
    canChi: `${dayStem} ${dayBranch}`,
    element: dayElement,
    elementName: getElementName(dayElement),
    weekCycle,
    voidBranches,
    isMonthlyBreakDay,
  };

  // 2. Xác định Nguyệt Kiến (Địa Chi Tháng)
  const monthElement = getBranchElement(monthBranch);
  const monthlyBreakBranch = getMonthlyBreakBranch(monthBranch);

  const monthCommander: MonthCommanderInfo = {
    stem: monthStem,
    branch: monthBranch,
    canChi: `${monthStem} ${monthBranch}`,
    element: monthElement,
    elementName: getElementName(monthElement),
    monthlyBreakBranch,
    solarTermName,
  };

  // 3. Chuẩn bị danh sách hào nếu có
  let linesToAnalyze: InputLineForCalendarAnalysis[] | undefined;

  if (params.lines && params.lines.length === 6) {
    linesToAnalyze = [...params.lines];
  } else if (params.lowerTrigramCode && params.upperTrigramCode) {
    const najia = getNaJiaForHexagram(params.lowerTrigramCode, params.upperTrigramCode);
    linesToAnalyze = najia.map((l) => ({
      position: l.position,
      branch: l.branch,
      element: l.element,
      stem: l.stem,
    }));
  }

  // 4. Phân tích tương tác cho từng hào (nếu có 6 hào)
  let lineAnalyses: readonly [
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
  ] | undefined;

  if (linesToAnalyze && linesToAnalyze.length === 6) {
    const mappedLines = linesToAnalyze.map((line) => {
      const lineElement = line.element ?? getBranchElement(line.branch);
      const dayRel = analyzeLineDayRelation(line.branch, lineElement, dayBranch, dayElement);
      const monthRel = analyzeLineMonthRelation(line.branch, lineElement, monthBranch, monthElement);

      const isVoid = voidBranches.includes(line.branch);
      const isMonthlyBreak = line.branch === monthlyBreakBranch;

      const summaryTags: string[] = [];
      if (isVoid) summaryTags.push('Không Vong');
      if (isMonthlyBreak) summaryTags.push('Nguyệt Phá');
      if (dayRel.isHarmonious) summaryTags.push('Nhật Hợp');
      if (dayRel.isClash) summaryTags.push('Nhật Xung');
      if (monthRel.isHarmonious) summaryTags.push('Nguyệt Hợp');

      return {
        position: line.position,
        branch: line.branch,
        element: lineElement,
        elementName: getElementName(lineElement),
        stem: line.stem,
        dayRelation: dayRel,
        monthRelation: monthRel,
        isVoid,
        isMonthlyBreak,
        summaryTags: Object.freeze(summaryTags),
      };
    });

    lineAnalyses = mappedLines as unknown as readonly [
      LineCalendarAnalysis,
      LineCalendarAnalysis,
      LineCalendarAnalysis,
      LineCalendarAnalysis,
      LineCalendarAnalysis,
      LineCalendarAnalysis,
    ];
  }

  return {
    ruleVersion: CALENDAR_ANALYSIS_RULE_VERSION,
    sourceReference: CALENDAR_ANALYSIS_SOURCE,
    dayMaster,
    monthCommander,
    lineAnalyses,
  };
}
