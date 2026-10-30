import { getClassicalHexagramData } from './classical/classical-texts.data';
import {
  ClassicalHexagramData,
  ClassicalLineStatement,
  CLASSICAL_SOURCES,
  CLASSICAL_TEXT_VERSION,
} from './classical/classical-texts.types';
import { interpretTiYong } from './mai-hua/mai-hua-interpretation';
import {
  MAI_HUA_INTERP_SOURCE,
  MAI_HUA_INTERP_VERSION,
  TiYongInterpretation,
} from './mai-hua/mai-hua-interpretation.types';
import { interpretSixYao } from './six-yao/six-yao-interpretation';
import {
  SIX_YAO_INTERP_SOURCE,
  SIX_YAO_INTERP_VERSION,
  SixYaoInterpretationResult,
} from './six-yao/six-yao-interpretation.types';
import {
  ComprehensiveInterpretationResult,
  HexagramTransformationInterpretation,
  InterpretationContentType,
  InterpretationInput,
  InterpretedSection,
  INTERPRETATION_ENGINE_VERSION,
} from './interpretation.types';

/**
 * Xác định quy tắc chiêm đoán cổ điển theo số lượng hào động của Chu Hi (Dịch Học Khải Mông)
 */
export function determineDivinationRuleByMovingLines(
  movingCount: number,
  primaryHexNumber: number
): { rule: string; explanation: string } {
  switch (movingCount) {
    case 0:
      return {
        rule: 'Quẻ Tĩnh (0 hào động): Lấy Thoán từ của Quẻ Chủ làm gốc chiêm đoán.',
        explanation:
          'Sự việc giữ nguyên trạng thái ổn định, tiến triển tuần tự, xem Thoán từ quẻ Chủ để hiểu rõ thời vận tổng quan.',
      };
    case 1:
      return {
        rule: 'Có 1 hào động: Lấy Hào từ của chính hào động quẻ Chủ làm căn cứ chủ đạo.',
        explanation:
          'Toàn bộ năng lượng biến hóa tập trung tại hào động này. Lời hào của Chu Công là kim chỉ nam trực tiếp cho tình huống.',
      };
    case 2:
      return {
        rule: 'Có 2 hào động: Lấy Hào từ của cả 2 hào động, lấy hào trên làm chính, hào dưới làm phụ.',
        explanation:
          'Sự việc có 2 mâu thuẫn hoặc biến cố đan xen. Xem cả 2 hào nhưng ưu tiên xét hào ở bậc cao hơn.',
      };
    case 3:
      return {
        rule: 'Có 3 hào động: Lấy Thoán từ của Quẻ Chủ và Quẻ Biến để xem, Chủ trước Biến sau.',
        explanation:
          'Âm dương biến hóa ngang ngửa nhau. Quẻ Chủ thể hiện thực trạng ban đầu, Quẻ Biến thể hiện xu thế hồi kết.',
      };
    case 4:
      return {
        rule: 'Có 4 hào động: Lấy 2 hào TĨNH của Quẻ Biến để xem, hào dưới làm chủ.',
        explanation:
          'Đa số các hào đã biến động. Lúc này lấy cái tĩnh chế ngự cái động, xem 2 hào giữ nguyên ở quẻ Biến.',
      };
    case 5:
      return {
        rule: 'Có 5 hào động: Lấy 1 hào TĨNH duy nhất của Quẻ Biến làm chủ thể chiêm đoán.',
        explanation:
          'Hầu như toàn quẻ đã thay đổi bản chất, chỉ còn 1 hào tĩnh duy nhất ở Quẻ Biến làm chỗ dựa trọng tâm.',
      };
    case 6:
      if (primaryHexNumber === 1) {
        return {
          rule: 'Sáu hào đều động (Quẻ Càn): Lấy lời Dụng Cửu "Kiến quần long vô thủ, cát" để xem.',
          explanation:
            'Thuần dương biến thành Thuần âm, đạt đến cực điểm của đức Càn, cương nhu tương tể, đại cát tường.',
        };
      }
      if (primaryHexNumber === 2) {
        return {
          rule: 'Sáu hào đều động (Quẻ Khôn): Lấy lời Dụng Lục "Lợi vĩnh trinh" để xem.',
          explanation:
            'Thuần âm biến thành Thuần dương, đức Khôn đạt viên mãn, giữ vững bền bỉ thì thu trọn thành quả.',
        };
      }
      return {
        rule: 'Sáu hào đều động: Lấy Thoán từ của Quẻ Biến làm chủ.',
        explanation:
          'Toàn bộ sự việc đã lật ngược cực tính sang một hoàn cảnh hoàn toàn mới, cần theo dõi Thoán từ quẻ Biến.',
      };
    default:
      return {
        rule: 'Quy tắc chiêm đoán mặc định.',
        explanation: 'Xem xét phối hợp giữa Quẻ Chủ và Quẻ Biến.',
      };
  }
}

/**
 * Động Cơ Diễn Giải Toàn Diện (Interpretation Engine Orchestrator)
 *
 * ĐẶC ĐIỂM THIẾT KẾ:
 * 1. Độc lập hoàn toàn với các thuật toán gieo quẻ và tính toán.
 * 2. Phân loại rành mạch: Nguyên văn cổ điển (CLASSICAL_ORIGINAL), Giải thích hiện đại (MODERN_EXPLANATION), Kết quả tính toán (CALCULATION_METRIC).
 * 3. Minh bạch nguồn gốc trích dẫn và phiên bản dữ liệu cho từng khối nội dung.
 * 4. Nghiêm cấm bịa đặt nguyên văn; nếu thiếu dữ liệu sẽ báo rõ ràng `hasVerifiedContent: false`.
 */
export function interpretHexagram(
  input: InterpretationInput
): ComprehensiveInterpretationResult {
  const { trio, maiHuaResult, sixYaoResult, includeAllLines = false } = input;
  const primaryNumber = trio.primary.number;
  const transformedNumber = trio.transformed?.number;
  const movingPositions = trio.movingLineIndices;
  const movingCount = movingPositions.length;

  // 1. Tra cứu nguyên văn cổ điển Quẻ Chủ
  const primaryLookup = getClassicalHexagramData(primaryNumber);
  let primaryClassical: InterpretedSection<ClassicalHexagramData | null>;

  if (primaryLookup.status === 'AVAILABLE') {
    primaryClassical = {
      contentType: InterpretationContentType.CLASSICAL_ORIGINAL,
      title: `Nguyên Văn Cổ Điển Quẻ Chủ #${primaryNumber} - ${trio.primary.name}`,
      content: primaryLookup.data,
      source: primaryLookup.data.source,
      version: primaryLookup.data.version,
      hasVerifiedContent: true,
    };
  } else {
    primaryClassical = {
      contentType: InterpretationContentType.CLASSICAL_ORIGINAL,
      title: `Nguyên Văn Cổ Điển Quẻ Chủ #${primaryNumber} - ${trio.primary.name}`,
      content: null,
      source: CLASSICAL_SOURCES[0],
      version: CLASSICAL_TEXT_VERSION,
      hasVerifiedContent: false,
      notice: primaryLookup.message,
    };
  }

  // 2. Tra cứu lời hào của các hào động
  const movingLinesClassical: InterpretedSection<ClassicalLineStatement>[] = [];

  if (primaryLookup.status === 'AVAILABLE' && primaryLookup.data.lines.length > 0) {
    const targetLines = includeAllLines
      ? primaryLookup.data.lines
      : primaryLookup.data.lines.filter((l) => movingPositions.includes(l.position));

    for (const line of targetLines) {
      movingLinesClassical.push({
        contentType: InterpretationContentType.CLASSICAL_ORIGINAL,
        title: `Hào từ Hào ${line.position} (${line.lineName})`,
        content: line,
        source: line.source,
        version: line.version,
        hasVerifiedContent: true,
      });
    }
  }

  // 3. Tra cứu nguyên văn cổ điển Quẻ Biến (nếu có biến)
  let transformedClassical: InterpretedSection<ClassicalHexagramData | null> | undefined;

  if (transformedNumber && transformedNumber !== primaryNumber) {
    const transformedLookup = getClassicalHexagramData(transformedNumber);
    if (transformedLookup.status === 'AVAILABLE') {
      transformedClassical = {
        contentType: InterpretationContentType.CLASSICAL_ORIGINAL,
        title: `Nguyên Văn Cổ Điển Quẻ Biến #${transformedNumber} - ${trio.transformed.name}`,
        content: transformedLookup.data,
        source: transformedLookup.data.source,
        version: transformedLookup.data.version,
        hasVerifiedContent: true,
      };
    } else {
      transformedClassical = {
        contentType: InterpretationContentType.CLASSICAL_ORIGINAL,
        title: `Nguyên Văn Cổ Điển Quẻ Biến #${transformedNumber} - ${trio.transformed.name}`,
        content: null,
        source: CLASSICAL_SOURCES[0],
        version: CLASSICAL_TEXT_VERSION,
        hasVerifiedContent: false,
        notice: transformedLookup.message,
      };
    }
  }

  // 4. Diễn giải biến hóa quẻ và quy tắc xem theo Chu Hi
  const ruleInfo = determineDivinationRuleByMovingLines(movingCount, primaryNumber);
  const hexagramTransformation: InterpretedSection<HexagramTransformationInterpretation> = {
    contentType: InterpretationContentType.MODERN_EXPLANATION,
    title: 'Phân Tích Chuyển Hóa Quẻ & Trọng Tâm Chiêm Đoán',
    content: {
      primaryHexagramNumber: primaryNumber,
      primaryHexagramName: trio.primary.name,
      changingHexagramNumber: trio.hasMovingLines ? transformedNumber : undefined,
      changingHexagramName: trio.hasMovingLines ? trio.transformed?.name : undefined,
      movingLineIndices: trio.movingLineIndices,
      movingLineCount: movingCount,
      isStatic: !trio.hasMovingLines,
      divinationMethodRule: ruleInfo.rule,
      explanation: ruleInfo.explanation,
      source: 'Dịch Học Khải Mông (Chu Hi)',
      version: 'CHU-XI-METHOD-V1',
    },
    source: 'Dịch Học Khải Mông (Chu Hi)',
    version: 'CHU-XI-METHOD-V1',
    hasVerifiedContent: true,
  };

  // 5. Diễn giải Thể/Dụng Mai Hoa (nếu có dữ liệu Mai Hoa)
  let maiHuaInterp: InterpretedSection<TiYongInterpretation> | undefined;

  if (maiHuaResult) {
    const tiTrig = maiHuaResult.theDung.theTrigram;
    const yongTrig = maiHuaResult.theDung.dungTrigram;
    const tiYongRes = interpretTiYong(tiTrig, yongTrig);

    maiHuaInterp = {
      contentType: InterpretationContentType.MODERN_EXPLANATION,
      title: 'Diễn Giải Thể / Dụng Mai Hoa Dịch Số',
      content: tiYongRes,
      source: MAI_HUA_INTERP_SOURCE,
      version: MAI_HUA_INTERP_VERSION,
      hasVerifiedContent: true,
    };
  }

  // 6. Diễn giải Lục Hào: Thế/Ứng, Lục Thân, Nhật Nguyệt (nếu có dữ liệu Lục Hào)
  let sixYaoInterp: InterpretedSection<SixYaoInterpretationResult> | undefined;

  if (sixYaoResult) {
    const sixYaoData = interpretSixYao(sixYaoResult);

    sixYaoInterp = {
      contentType: InterpretationContentType.MODERN_EXPLANATION,
      title: 'Diễn Giải Phân Tích Lục Hào Cổ Pháp (Thế Ứng, Lục Thân, Nhật Nguyệt)',
      content: sixYaoData,
      source: SIX_YAO_INTERP_SOURCE,
      version: SIX_YAO_INTERP_VERSION,
      hasVerifiedContent: true,
    };
  }

  return {
    engineVersion: INTERPRETATION_ENGINE_VERSION,
    interpretedAt: new Date().toISOString(),
    disclaimer:
      'Hệ thống Bắc Hà Tân An Phái phân định rạch ròi giữa nguyên văn cổ điển kinh điển và lời giải thích hiện đại. Mọi nội dung đều được truy nguyên nguồn gốc thư tịch rõ ràng.',
    primaryClassical,
    movingLinesClassical,
    transformedClassical,
    hexagramTransformation,
    maiHua: maiHuaInterp,
    sixYao: sixYaoInterp,
  };
}
