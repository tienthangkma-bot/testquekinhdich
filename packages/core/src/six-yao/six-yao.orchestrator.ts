/**
 * Six Yao Analysis Orchestrator (Bộ Điều Phối Lục Hào Toàn Diện)
 *
 * PHIÊN BẢN: SIX-YAO-ORCHESTRATOR-V1
 * RULESET MẶC ĐỊNH: SIX-YAO-STANDARD-V1
 *
 * TÍNH NĂNG ĐIỀU PHỐI TỔNG HỢP:
 * 1. Tiếp nhận và chuẩn hóa linh hoạt: Quẻ Chủ, Quẻ Biến, Hào Động, Thời gian lập quẻ và RuleSet.
 * 2. Tích hợp sâu toàn bộ các động cơ Lục Hào cổ điển:
 *    - Bát Cung, Thế Ứng (Bốc Phệ Chính Tông, Kinh Thị Dịch Truyện).
 *    - Nạp Giáp 8 quái, Ngũ Hành 12 chi (Kinh Phòng).
 *    - Lục Thân (theo Cung Quẻ Chủ cho cả quẻ chủ và quẻ biến).
 *    - Lục Thú (an theo Thiên Can ngày lập quẻ).
 *    - Nhật Thần, Nguyệt Kiến, Tuần Không, Nguyệt Phá.
 *    - Vượng Tướng Hưu Tù Tử, Ám Động, Chân/Giả Không, Tam Hợp Cục.
 * 3. Phân tích cơ chế biến hóa động hào:
 *    - Hồi Đầu Sinh, Hồi Đầu Khắc, Hồi Đầu Hợp, Hồi Đầu Xung.
 *    - Hóa Tiến Thần, Hóa Thoái Thần, Hóa Tiết Khí, Động Khắc Biến.
 * 4. Phân biệt rõ rệt giữa Quẻ Chủ và Quẻ Biến.
 * 5. Truy vết nguồn gốc (provenance) và quy tắc đối chiếu cho từng kết luận.
 * 6. Tuân thủ nghiêm ngặt nguyên tắc: Không tự động phán quyết cát/hung tùy tiện khi chưa có Dụng Thần sự vụ.
 */

import {
  Element,
  getElementName,
  getHexagramBaGong,
  getHexagramById,
  getHexagramByLines,
  getHexagramByTrigrams,
  getNaJiaForHexagram,
  HEXAGRAMS,
  Hexagram,
  LinePosition,
  SixRelation,
  TrigramCode,
  RawHexagramValues,
} from '@kindich/domain';

import {
  DateTimeInput,
  DayTransitionRule,
  getFullCalendarInfo,
} from '@kindich/calendar';

import {
  analyzeCalendar,
  isBranchClash,
  isBranchHarmony,
  HARMONY_MAP,
} from '../calendar-analysis/calendar-analysis.engine';

import {
  calculateSixRelations,
  getSixRelationName,
  isElementGenerating,
  isElementOvercoming,
} from '../six-relations/six-relations.engine';

import {
  calculateSixSpirits,
  normalizeDayStem,
} from '../six-spirits/six-spirits.engine';

import {
  calculateYaoStrengths,
  SEASONAL_STRENGTH_NAMES,
} from '../yao-strength/yao-strength.engine';

import {
  AnalyzedSixYaoLine,
  ChangingLineDetail,
  DateTimeAnalysisBlock,
  HexagramAnalysisBlock,
  MovingLineInteraction,
  SixYaoAnalysisResult,
  SixYaoOrchestratorInput,
} from './six-yao.types';

/**
 * Phiên bản của thuật toán điều phối Lục Hào
 */
export const SIX_YAO_ORCHESTRATOR_VERSION = 'SIX-YAO-ORCHESTRATOR-V1';

/**
 * RuleSet ID mặc định
 */
export const SIX_YAO_DEFAULT_RULESET_ID = 'SIX-YAO-STANDARD-V1';

/**
 * Nguồn tư liệu đối chiếu và quy chuẩn học thuật
 */
export const SIX_YAO_PROVENANCE_SOURCES: Record<string, string> = {
  baGong: 'Bốc Phệ Chính Tông (Quyển 1: Bát Quái Bát Cung Đồ, Thế Ứng Khởi Lệ); Kinh Thị Dịch Truyện.',
  naJia: 'Kinh Thị Dịch Truyện (Kinh Phòng); Tăng San Bốc Dịch; Bốc Phệ Chính Tông.',
  sixRelations: 'Kinh Thị Dịch Truyện - Lục Thân Quyết ("Cung quẻ làm Ngã"); Bốc Phệ Chính Tông.',
  changingSixRelations: 'Bốc Phệ Chính Tông - Biến Hào Quyết ("Biến hào chi Lục Thân, y bản quái chi cung định").',
  sixSpirits: 'Bốc Phệ Chính Tông - An Lục Thú Quyết (Giáp Ất khởi Thanh Long...); Tăng San Bốc Dịch.',
  calendar: 'Bốc Phệ Chính Tông (Quyển 1: Tuần Không Quyết, Nguyệt Kiến, Nhật Thần, Nguyệt Phá); Tăng San Bốc Dịch (Chương 16 - 21).',
  yaoStrength: 'Bốc Phệ Chính Tông (Tứ Thời Vượng Tướng, Ám Động, Chân/Giả Không); Tăng San Bốc Dịch (Chương 16 - 25).',
  movingLineTransform: 'Bốc Phệ Chính Tông (Biến Hào Sinh Khắc Chi Điều: Hồi đầu sinh/khắc/hợp/xung, Tiến/Thoái thần); Tăng San Bốc Dịch.',
};

/**
 * Tuyên bố phân tích khách quan không kết luận cát hung tùy tiện
 */
export const SIX_YAO_OBJECTIVE_DISCLAIMER =
  'Kết quả phân tích phản ánh cấu trúc thực lực Ngũ Hành, tương tác sinh khắc xung hợp và vị thế động tĩnh theo quy chuẩn Lục Hào cổ điển. Hệ thống không tự ý đưa ra kết luận cát/hung sự vụ khi chưa xác định Dụng Thần và chủ đề chiêm đoán cụ thể.';

/**
 * Cặp Tiến Thần chuẩn trong Lục Hào:
 * Mộc: Dần -> Mão
 * Hỏa: Tỵ -> Ngọ
 * Kim: Thân -> Dậu
 * Thủy: Hợi -> Tý
 * Thổ: Sửu -> Thìn, Thìn -> Mùi, Mùi -> Tuất, Tuất -> Sửu
 */
const ADVANCING_SPIRIT_MAP: Record<string, string> = {
  'Dần': 'Mão',
  'Tỵ': 'Ngọ',
  'Thân': 'Dậu',
  'Hợi': 'Tý',
  'Sửu': 'Thìn',
  'Thìn': 'Mùi',
  'Mùi': 'Tuất',
  'Tuất': 'Sửu',
};

/**
 * Cặp Thoái Thần chuẩn trong Lục Hào:
 * Mộc: Mão -> Dần
 * Hỏa: Ngọ -> Tỵ
 * Kim: Dậu -> Thân
 * Thủy: Tý -> Hợi
 * Thổ: Thìn -> Sửu, Mùi -> Thìn, Tuất -> Mùi, Sửu -> Tuất
 */
const RETREATING_SPIRIT_MAP: Record<string, string> = {
  'Mão': 'Dần',
  'Ngọ': 'Tỵ',
  'Dậu': 'Thân',
  'Tý': 'Hợi',
  'Thìn': 'Sửu',
  'Mùi': 'Thìn',
  'Tuất': 'Mùi',
  'Sửu': 'Tuất',
};

/**
 * Hàm phân giải đối tượng Hexagram từ các dạng đầu vào linh hoạt
 */
export function resolveHexagram(
  input:
    | Hexagram
    | number
    | string
    | {
        lowerTrigramCode: TrigramCode | string;
        upperTrigramCode: TrigramCode | string;
        lines?: readonly number[];
      }
): Hexagram {
  if (
    typeof input === 'object' &&
    input !== null &&
    'number' in input &&
    'rawValues' in input &&
    'lines' in input
  ) {
    return input as Hexagram;
  }

  if (typeof input === 'number') {
    const found = getHexagramById(input);
    if (!found) {
      throw new Error(`Không tìm thấy quẻ số ${input}. Số thứ tự phải từ 1 đến 64.`);
    }
    return found;
  }

  if (typeof input === 'string') {
    const found =
      getHexagramById(input) ||
      HEXAGRAMS.find((h) => h.name.toLowerCase() === input.trim().toLowerCase());
    if (!found) {
      throw new Error(`Không tìm thấy quẻ với mã hoặc tên: "${input}".`);
    }
    return found;
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    'lowerTrigramCode' in input &&
    'upperTrigramCode' in input
  ) {
    const found = getHexagramByTrigrams(input.upperTrigramCode, input.lowerTrigramCode);
    if (!found) {
      throw new Error(
        `Không tìm thấy quẻ với Thượng quái "${input.upperTrigramCode}" và Hạ quái "${input.lowerTrigramCode}".`
      );
    }
    return found;
  }

  throw new Error(
    'Đầu vào quẻ không hợp lệ. Vui lòng cung cấp Hexagram, số (1-64), ID ("HEX_01"), hoặc cặp Thượng/Hạ quái.'
  );
}

/**
 * Phân tích mối tương tác giữa Hào Động và Hào Biến
 *
 * @param position Vị trí hào (1-6)
 * @param primaryBranch Địa Chi hào động (Quẻ Chủ)
 * @param primaryElement Ngũ Hành hào động
 * @param primaryRelation Lục Thân hào động
 * @param changingBranch Địa Chi hào biến (Quẻ Biến)
 * @param changingElement Ngũ Hành hào biến
 * @param changingRelation Lục Thân hào biến (định theo Cung Quẻ Chủ)
 */
export function analyzeMovingLineInteraction(
  position: LinePosition,
  primaryBranch: string,
  primaryElement: Element,
  primaryRelation: SixRelation,
  changingBranch: string,
  changingElement: Element,
  changingRelation: SixRelation
): MovingLineInteraction {
  const primaryRelationName = getSixRelationName(primaryRelation);
  const changingRelationName = getSixRelationName(changingRelation);

  const primaryElementName = getElementName(primaryElement);
  const changingElementName = getElementName(changingElement);

  const isHoiDauSinh = isElementGenerating(changingElement, primaryElement);
  const isHoiDauKhac = isElementOvercoming(changingElement, primaryElement);
  const isHoiDauHop = isBranchHarmony(primaryBranch, changingBranch);
  const isHoiDauXung = isBranchClash(primaryBranch, changingBranch);

  const isTienThan = ADVANCING_SPIRIT_MAP[primaryBranch] === changingBranch;
  const isThoaiThan = RETREATING_SPIRIT_MAP[primaryBranch] === changingBranch;
  const isTyHoa = primaryElement === changingElement;
  const isHoaTietKhi = isElementGenerating(primaryElement, changingElement);
  const isDongKhacBien = isElementOvercoming(primaryElement, changingElement);

  const tags: string[] = [];
  if (isHoiDauSinh) tags.push('Hồi Đầu Sinh');
  if (isHoiDauKhac) tags.push('Hồi Đầu Khắc');
  if (isHoiDauHop) tags.push('Hồi Đầu Hợp');
  if (isHoiDauXung) tags.push('Hồi Đầu Xung');
  if (isTienThan) tags.push('Hóa Tiến Thần');
  if (isThoaiThan) tags.push('Hóa Thoái Thần');
  if (isTyHoa && !isTienThan && !isThoaiThan) tags.push('Tỷ Hòa');
  if (isHoaTietKhi) tags.push('Hóa Tiết Khí');
  if (isDongKhacBien) tags.push('Động Khắc Biến');

  let description: string;
  if (isHoiDauSinh && isHoiDauHop) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Được Hồi Đầu Sinh Hợp (${changingBranch} sinh ${primaryBranch}, lục hợp ${HARMONY_MAP[primaryBranch]?.name ?? ''}), lực lượng tăng trưởng vững bền.`;
  } else if (isHoiDauKhac && isHoiDauHop) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Bị Hồi Đầu Khắc Hợp (${changingBranch} khắc ${primaryBranch}, lục hợp ${HARMONY_MAP[primaryBranch]?.name ?? ''}), vừa bị khắc chế vừa bị trói buộc.`;
  } else if (isHoiDauKhac && isHoiDauXung) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Phạm Hồi Đầu Xung Khắc (${changingBranch} khắc ${primaryBranch}, lục xung tương kích), căn cơ bị xung phạt nặng nề.`;
  } else if (isHoiDauSinh) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Được Hồi Đầu Sinh (${changingBranch} sinh ${primaryBranch}), sinh phù trợ khí mạnh mẽ.`;
  } else if (isHoiDauKhac) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Bị Hồi Đầu Khắc (${changingBranch} khắc ${primaryBranch}), khí lực bị chế ngự tổn hao.`;
  } else if (isTienThan) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Hóa Tiến Thần (cùng hành ${primaryElementName}, khí thế tiến bước phát triển).`;
  } else if (isThoaiThan) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Hóa Thoái Thần (cùng hành ${primaryElementName}, khí thế thoái lùi hao hụt).`;
  } else if (isHoiDauHop) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Được Hồi Đầu Hợp (lục hợp tương phối gắn kết).`;
  } else if (isHoiDauXung) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Phạm Hồi Đầu Xung (lục xung phản phục bất an).`;
  } else if (isHoaTietKhi) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Hóa Tiết Khí (${primaryBranch} sinh ${changingBranch}, tiết hao nguyên khí).`;
  } else if (isDongKhacBien) {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName}: Động Khắc Biến (${primaryBranch} khắc ${changingBranch}, tiêu hao công sức).`;
  } else {
    description = `Hào động ${primaryBranch} ${primaryElementName} biến ${changingBranch} ${changingElementName} (${changingRelationName}).`;
  }

  return {
    position,
    primaryBranch,
    primaryElement,
    primaryRelation,
    primaryRelationName,
    changingBranch,
    changingElement,
    changingRelation,
    changingRelationName,
    isHoiDauSinh,
    isHoiDauKhac,
    isHoiDauHop,
    isHoiDauXung,
    isTienThan,
    isThoaiThan,
    isTyHoa,
    isHoaTietKhi,
    isDongKhacBien,
    tags: Object.freeze(tags),
    description,
    sourceReference: SIX_YAO_PROVENANCE_SOURCES['movingLineTransform']!,
  };
}

/**
 * Động cơ điều phối phân tích Lục Hào toàn diện (Six Yao Orchestrator)
 *
 * @param input Tham số đầu vào chứa quẻ chủ, quẻ biến, ngày giờ, RuleSet
 * @returns SixYaoAnalysisResult Kết quả phân tích có cấu trúc sâu
 */
export function orchestrateSixYaoAnalysis(
  input: SixYaoOrchestratorInput
): SixYaoAnalysisResult {
  const ruleSetId = input.ruleSetId ?? SIX_YAO_DEFAULT_RULESET_ID;
  const analyzedAt = new Date().toISOString();

  // 1. Phân giải Quẻ Chủ và Bát Cung của Quẻ Chủ
  const primaryHex = resolveHexagram(input.primaryHexagram);
  const primaryBaGong = getHexagramBaGong(primaryHex.number);
  const primaryPalaceId = primaryBaGong.palaceId;
  const primaryPalaceElement = primaryBaGong.palaceElement;

  // 2. Phân giải Hào Động và Quẻ Biến
  let changingHex: Hexagram | null = null;
  let movingPositions: LinePosition[] = [];

  if (input.movingLineIndices && input.movingLineIndices.length > 0) {
    movingPositions = [
      ...new Set(input.movingLineIndices.map((p) => Number(p) as LinePosition)),
    ].sort((a, b) => a - b);
  }

  if (input.changingHexagram) {
    changingHex = resolveHexagram(input.changingHexagram);
    // Nếu chưa truyền movingLineIndices thì tự động suy ra bằng cách so sánh 6 hào
    if (movingPositions.length === 0) {
      for (let i = 0; i < 6; i++) {
        if (primaryHex.rawValues[i] !== changingHex.rawValues[i]) {
          movingPositions.push((i + 1) as LinePosition);
        }
      }
    }
  } else if (movingPositions.length > 0) {
    // Tự sinh Quẻ Biến từ các hào động
    const movingSet = new Set<number>(movingPositions);
    const changedRaw = primaryHex.rawValues.map((val, idx) => {
      const pos = idx + 1;
      return movingSet.has(pos) ? (val === 1 ? 0 : 1) : val;
    }) as unknown as RawHexagramValues;

    const autoChangedHex = getHexagramByLines(changedRaw);
    if (!autoChangedHex) {
      throw new Error(
        `Không thể xác định Quẻ Biến từ chuỗi hào đảo: [${changedRaw.join(', ')}].`
      );
    }
    changingHex = autoChangedHex;
  }

  const isStatic = movingPositions.length === 0 || changingHex === null;
  if (isStatic) {
    changingHex = null;
  }

  // 3. Xử lý thời gian và Can Chi 4 trụ
  let dayCanChiStr = '';
  let monthCanChiStr = '';
  let yearCanChiStr: string | undefined;
  let hourCanChiStr: string | undefined;
  let solarDate: DateTimeAnalysisBlock['solarDate'];
  let lunarDate: DateTimeAnalysisBlock['lunarDate'];

  const rawDateTime = input.dateTime ?? new Date();

  if (
    typeof rawDateTime === 'object' &&
    rawDateTime !== null &&
    'dayCanChi' in rawDateTime &&
    'monthCanChi' in rawDateTime
  ) {
    const rawDay = rawDateTime.dayCanChi;
    dayCanChiStr = typeof rawDay === 'string' ? rawDay : `${rawDay.stem} ${rawDay.branch}`;
    const rawMonth = rawDateTime.monthCanChi;
    monthCanChiStr =
      typeof rawMonth === 'string' ? rawMonth : `${rawMonth.stem} ${rawMonth.branch}`;
    yearCanChiStr = rawDateTime.yearCanChi;
    hourCanChiStr = rawDateTime.hourCanChi;
  } else {
    // Dùng Calendar Engine để phân giải
    const dayTransition: DayTransitionRule =
      input.options?.dayTransition ?? 'RAT_HOUR_23';
    const calResult = getFullCalendarInfo(rawDateTime as DateTimeInput, {
      dayTransition,
    });

    dayCanChiStr = calResult.canChi.day;
    monthCanChiStr = calResult.canChi.month;
    yearCanChiStr = calResult.canChi.year;
    hourCanChiStr = calResult.canChi.hour;

    solarDate = {
      day: calResult.solar.day,
      month: calResult.solar.month,
      year: calResult.solar.year,
      hour: calResult.solar.hour,
      minute: calResult.solar.minute,
    };

    lunarDate = {
      day: calResult.lunar.day,
      month: calResult.lunar.month,
      year: calResult.lunar.year,
      isLeap: calResult.lunar.isLeap,
    };
  }

  // 4. Lấy Nạp Giáp và Lục Thân Quẻ Chủ
  const primarySixRelations = calculateSixRelations({
    hexagramNumber: primaryHex.number,
  });

  // 5. Lấy Lục Thú (an theo Thiên Can ngày)
  const dayStem = normalizeDayStem(dayCanChiStr);
  const sixSpirits = calculateSixSpirits(dayStem);

  // 6. Phân tích Lịch Pháp cho Quẻ Chủ
  const primaryNajiaLines = getNaJiaForHexagram(
    primaryHex.lowerTrigram.code,
    primaryHex.upperTrigram.code
  );

  const calendarAnalysis = analyzeCalendar({
    dayCanChi: dayCanChiStr,
    monthCanChi: monthCanChiStr,
    solarTermName: input.options?.solarTermName,
    lines: primaryNajiaLines.map((l) => ({
      position: l.position,
      branch: l.branch,
      element: l.element,
      stem: l.stem,
    })),
  });

  // 7. Phân tích Thực Lực Lục Hào cho Quẻ Chủ
  const strengthAnalysis = calculateYaoStrengths({
    dayCanChi: dayCanChiStr,
    monthCanChi: monthCanChiStr,
    lines: primarySixRelations.lines.map((l) => ({
      position: l.position,
      branch: l.branch,
      element: l.element,
      stem: l.stem,
      isMoving: movingPositions.includes(l.position),
      sixRelation: l.relation,
    })),
    movingLineIndices: movingPositions,
    palaceElement: primaryPalaceElement,
    hexagramNumber: primaryHex.number,
  });

  // 8. Nếu có Quẻ Biến: Phân tích Lục Thân Quẻ Biến (THEO CUNG QUẺ CHỦ)
  let changingSixRelationsLines: readonly AnalyzedSixYaoLine['changingLine'][] | undefined;
  let changingBaGongBlock: HexagramAnalysisBlock['palace'] | undefined;
  let changingHexLinesList: AnalyzedSixYaoLine[] | undefined;
  const movingInteractions: MovingLineInteraction[] = [];

  if (changingHex) {
    const changingBaGong = getHexagramBaGong(changingHex.number);
    changingBaGongBlock = {
      id: changingBaGong.palaceId,
      name: changingBaGong.palaceName,
      element: changingBaGong.palaceElement,
      elementName: changingBaGong.palaceElementName,
      generationStage: changingBaGong.generationStage,
      generationStageName: changingBaGong.generationStageName,
      worldLine: changingBaGong.worldLine,
      responseLine: changingBaGong.responseLine,
    };

    // QUY TẮC CỐT LÕI: Hào biến lấy Lục Thân theo Cung Quẻ Chủ (Bản Quái)!
    const changingSixRelations = calculateSixRelations({
      hexagramNumber: changingHex.number,
      customPalace: primaryPalaceId,
      customPalaceElement: primaryPalaceElement,
    });

    const changingStrengthAnalysis = calculateYaoStrengths({
      dayCanChi: dayCanChiStr,
      monthCanChi: monthCanChiStr,
      lines: changingSixRelations.lines.map((l) => ({
        position: l.position,
        branch: l.branch,
        element: l.element,
        stem: l.stem,
        isMoving: false, // Quẻ biến là tĩnh
        sixRelation: l.relation,
      })),
      palaceElement: primaryPalaceElement,
      hexagramNumber: changingHex.number,
    });

    const changingCalendarAnalysis = analyzeCalendar({
      dayCanChi: dayCanChiStr,
      monthCanChi: monthCanChiStr,
      lines: changingSixRelations.lines.map((l) => ({
        position: l.position,
        branch: l.branch,
        element: l.element,
        stem: l.stem,
      })),
    });

    // Tạo tương tác giữa các hào động với hào biến
    const changingLinesMapped: ChangingLineDetail[] = [];
    for (const pos of movingPositions) {
      const idx = pos - 1;
      const pLine = primarySixRelations.lines[idx]!;
      const cLine = changingSixRelations.lines[idx]!;

      const interaction = analyzeMovingLineInteraction(
        pos,
        pLine.branch,
        pLine.element,
        pLine.relation,
        cLine.branch,
        cLine.element,
        cLine.relation
      );

      movingInteractions.push(interaction);

      changingLinesMapped[idx] = {
        position: pos,
        yinYang: (changingHex.rawValues[idx] as 0 | 1) ?? 0,
        stem: cLine.stem,
        branch: cLine.branch,
        element: cLine.element,
        elementName: getElementName(cLine.element),
        canChi: cLine.canChi,
        sixRelation: cLine.relation,
        sixRelationName: cLine.relationName,
        fullRelationLabel: cLine.fullLabel,
        interaction,
      };
    }

    // Lập danh sách 6 hào của Quẻ Biến
    changingHexLinesList = changingSixRelations.lines.map((cLine, idx) => {
      const pos = (idx + 1) as LinePosition;
      const isMoved = movingPositions.includes(pos);
      const calLine = changingCalendarAnalysis.lineAnalyses?.[idx];
      const strLine = changingStrengthAnalysis.lines[idx]!;
      const spiritLine = sixSpirits.lines[idx]!;

      return {
        position: pos,
        yinYang: (changingHex!.rawValues[idx] as 0 | 1) ?? 0,
        isMoving: isMoved,
        isWorld: pos === changingBaGong.worldLine,
        isResponse: pos === changingBaGong.responseLine,
        stem: cLine.stem,
        branch: cLine.branch,
        element: cLine.element,
        elementName: getElementName(cLine.element),
        canChi: cLine.canChi,
        sixRelation: cLine.relation,
        sixRelationName: cLine.relationName,
        fullRelationLabel: cLine.fullLabel,
        sixSpirit: spiritLine.spirit,
        sixSpiritName: spiritLine.spiritName,
        calendar: {
          isVoid: calLine?.isVoid ?? false,
          isMonthlyBreak: calLine?.isMonthlyBreak ?? false,
          isDayClash: calLine?.dayRelation.isClash ?? false,
          isDayHarmony: calLine?.dayRelation.isHarmonious ?? false,
          isMonthHarmony: calLine?.monthRelation.isHarmonious ?? false,
          dayEffect: calLine?.dayRelation.elementRelationDescription ?? '',
          monthEffect: calLine?.monthRelation.elementRelationDescription ?? '',
        },
        strength: {
          seasonalState: strLine.seasonalState.state,
          seasonalStateName: SEASONAL_STRENGTH_NAMES[strLine.seasonalState.state].name,
          seasonalDescription:
            SEASONAL_STRENGTH_NAMES[strLine.seasonalState.state].description,
          level: strLine.overallLevel,
          levelName: strLine.overallLevelName,
          totalScore: strLine.score,
          isAmDong: strLine.specialStates.isAmDong,
          isNhatPha: strLine.specialStates.isNhatPha,
          voidStatus: strLine.specialStates.voidType,
          factors: strLine.factors,
          rationale: strLine.reasoning,
        },
      };
    });

    changingSixRelationsLines = Object.freeze(changingLinesMapped);
  }

  // 9. Lắp ráp chi tiết 6 hào Quẻ Chủ
  const analyzedPrimaryLines: AnalyzedSixYaoLine[] = primarySixRelations.lines.map(
    (line, idx) => {
      const pos = (idx + 1) as LinePosition;
      const isMoving = movingPositions.includes(pos);
      const isWorld = pos === primaryBaGong.worldLine;
      const isResponse = pos === primaryBaGong.responseLine;

      const calLine = calendarAnalysis.lineAnalyses?.[idx];
      const strLine = strengthAnalysis.lines[idx]!;
      const spiritLine = sixSpirits.lines[idx]!;

      const changingDetail = changingSixRelationsLines?.[idx] ?? undefined;

      return {
        position: pos,
        yinYang: (primaryHex.rawValues[idx] as 0 | 1) ?? 0,
        isMoving,
        isWorld,
        isResponse,
        stem: line.stem,
        branch: line.branch,
        element: line.element,
        elementName: getElementName(line.element),
        canChi: line.canChi,
        sixRelation: line.relation,
        sixRelationName: line.relationName,
        fullRelationLabel: line.fullLabel,
        sixSpirit: spiritLine.spirit,
        sixSpiritName: spiritLine.spiritName,
        calendar: {
          isVoid: calLine?.isVoid ?? false,
          isMonthlyBreak: calLine?.isMonthlyBreak ?? false,
          isDayClash: calLine?.dayRelation.isClash ?? false,
          isDayHarmony: calLine?.dayRelation.isHarmonious ?? false,
          isMonthHarmony: calLine?.monthRelation.isHarmonious ?? false,
          dayEffect: calLine?.dayRelation.elementRelationDescription ?? '',
          monthEffect: calLine?.monthRelation.elementRelationDescription ?? '',
        },
        strength: {
          seasonalState: strLine.seasonalState.state,
          seasonalStateName: SEASONAL_STRENGTH_NAMES[strLine.seasonalState.state].name,
          seasonalDescription:
            SEASONAL_STRENGTH_NAMES[strLine.seasonalState.state].description,
          level: strLine.overallLevel,
          levelName: strLine.overallLevelName,
          totalScore: strLine.score,
          isAmDong: strLine.specialStates.isAmDong,
          isNhatPha: strLine.specialStates.isNhatPha,
          voidStatus: strLine.specialStates.voidType,
          factors: strLine.factors,
          rationale: strLine.reasoning,
        },
        changingLine: changingDetail,
      };
    }
  );

  // 10. Tạo khối Quẻ Chủ
  const primaryBlock: HexagramAnalysisBlock = {
    hexagramNumber: primaryHex.number,
    hexagramId: primaryHex.id,
    name: primaryHex.name,
    sinoVietnamese: primaryHex.sinoVietnameseName,
    chineseName: primaryHex.chineseName,
    symbol: primaryHex.symbol,
    upperTrigram: {
      code: primaryHex.upperTrigram.code,
      name: primaryHex.upperTrigram.name,
    },
    lowerTrigram: {
      code: primaryHex.lowerTrigram.code,
      name: primaryHex.lowerTrigram.name,
    },
    palace: {
      id: primaryBaGong.palaceId,
      name: primaryBaGong.palaceName,
      element: primaryBaGong.palaceElement,
      elementName: primaryBaGong.palaceElementName,
      generationStage: primaryBaGong.generationStage,
      generationStageName: primaryBaGong.generationStageName,
      worldLine: primaryBaGong.worldLine,
      responseLine: primaryBaGong.responseLine,
    },
    lines: Object.freeze(analyzedPrimaryLines),
  };

  // 11. Tạo khối Quẻ Biến (nếu có)
  let changingBlock: HexagramAnalysisBlock | null = null;
  if (changingHex && changingBaGongBlock && changingHexLinesList) {
    changingBlock = {
      hexagramNumber: changingHex.number,
      hexagramId: changingHex.id,
      name: changingHex.name,
      sinoVietnamese: changingHex.sinoVietnameseName,
      chineseName: changingHex.chineseName,
      symbol: changingHex.symbol,
      upperTrigram: {
        code: changingHex.upperTrigram.code,
        name: changingHex.upperTrigram.name,
      },
      lowerTrigram: {
        code: changingHex.lowerTrigram.code,
        name: changingHex.lowerTrigram.name,
      },
      palace: changingBaGongBlock,
      lines: Object.freeze(changingHexLinesList),
    };
  }

  // 12. Tạo khối Thời Gian & Lịch Pháp
  const dateTimeBlock: DateTimeAnalysisBlock = {
    solarDate,
    lunarDate,
    canChi: {
      year: yearCanChiStr ?? '',
      month: monthCanChiStr,
      day: dayCanChiStr,
      hour: hourCanChiStr,
    },
    dayMaster: calendarAnalysis.dayMaster,
    monthCommander: calendarAnalysis.monthCommander,
  };

  // 13. Tóm lược khách quan
  const movingDesc =
    movingPositions.length === 0
      ? 'Quẻ Tĩnh (không có hào động).'
      : `Có ${movingPositions.length} hào động (Hào ${movingPositions.join(', ')}), biến sang quẻ ${changingHex?.name ?? ''}.`;

  const threeHarmonyDesc =
    strengthAnalysis.threeHarmonies.length > 0
      ? `Phát hiện ${strengthAnalysis.threeHarmonies.map((th) => th.name).join(', ')}.`
      : 'Không có Tam Hợp Cục hoàn chỉnh trong 6 hào.';

  const objectiveOverview =
    `Quẻ ${primaryHex.name} (${primaryBaGong.palaceName} Cung, ${primaryBaGong.generationStageName}), Thế tại hào ${primaryBaGong.worldLine}, Ứng tại hào ${primaryBaGong.responseLine}. ` +
    `Ngày ${dayCanChiStr} (Nhật Thần ${calendarAnalysis.dayMaster.branch}), Tháng ${monthCanChiStr} (Nguyệt Kiến ${calendarAnalysis.monthCommander.branch}). ` +
    `Tuần Không: ${calendarAnalysis.dayMaster.voidBranches.join(', ')}; Nguyệt Phá: ${calendarAnalysis.monthCommander.monthlyBreakBranch}. ` +
    `${movingDesc} ${threeHarmonyDesc} Hào mạnh nhất: Hào ${strengthAnalysis.summary.strongestLinePosition}, hào suy yếu nhất: Hào ${strengthAnalysis.summary.weakestLinePosition}.`;

  return {
    ruleSetId,
    algorithmVersion: SIX_YAO_ORCHESTRATOR_VERSION,
    analyzedAt,
    sourceReferences: SIX_YAO_PROVENANCE_SOURCES,
    disclaimer: SIX_YAO_OBJECTIVE_DISCLAIMER,
    dateTime: dateTimeBlock,
    primaryHexagram: primaryBlock,
    changingHexagram: changingBlock,
    movingLines: Object.freeze(movingInteractions),
    isStatic,
    summary: {
      worldLinePosition: primaryBaGong.worldLine,
      responseLinePosition: primaryBaGong.responseLine,
      movingLineCount: movingPositions.length,
      dominantElement: strengthAnalysis.summary.dominantElement,
      dominantElementName: strengthAnalysis.summary.dominantElementName,
      strongestLinePosition: strengthAnalysis.summary.strongestLinePosition,
      weakestLinePosition: strengthAnalysis.summary.weakestLinePosition,
      threeHarmonies: strengthAnalysis.threeHarmonies,
      objectiveOverview,
    },
  };
}
