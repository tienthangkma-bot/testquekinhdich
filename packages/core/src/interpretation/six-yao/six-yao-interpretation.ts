import { getElementName, SixRelation } from '@kindich/domain';
import { SixYaoAnalysisResult } from '../../six-yao/six-yao.types';
import {
  isElementGenerating,
  isElementOvercoming,
} from '../../six-relations/six-relations.engine';
import {
  OfficerImpactInterpretation,
  ShiYingInterpretation,
  ShiYingRelationType,
  SixRelationInterpretationItem,
  SIX_YAO_INTERP_SOURCE,
  SIX_YAO_INTERP_VERSION,
  SixYaoInterpretationResult,
} from './six-yao-interpretation.types';

/**
 * Ý nghĩa biểu trưng phổ quát của Lục Thân theo sách "Bốc Phệ Chính Tông"
 */
const SIX_RELATION_SIGNIFICANCE: Record<SixRelation, string> = {
  [SixRelation.PHU_MAU]:
    'Đại diện cho cha mẹ, bậc trưởng bối, giấy tờ, văn bản, hợp đồng, nhà cửa, xe cộ, bằng cấp, học vấn và sự che chở bao bọc.',
  [SixRelation.HUYNH_DE]:
    'Đại diện cho anh em, bạn bè, đồng nghiệp, cộng sự; đồng thời cũng là thần tranh đoạt tiền bạc (khắc Thê Tài) và đối thủ cạnh tranh.',
  [SixRelation.TU_TON]:
    'Là Phúc Đức chi thần, đại diện cho niềm vui, sự thanh thản, con cái, thế hệ trẻ, khách hàng, phương thuốc trị bệnh, giải trừ tai họa (khắc Quan Quỷ, sinh Thê Tài).',
  [SixRelation.THE_TAI]:
    'Đại diện cho tiền tài, của cải, lợi nhuận, vật chất sở hữu, thành quả lao động; đối với nam giới còn đại diện cho vợ hoặc người yêu.',
  [SixRelation.QUAN_QUY]:
    'Đại diện cho công danh, chức vị, sự nghiệp quản lý, pháp luật, cơ quan công quyền; đối với nữ giới đại diện cho người chồng; mặt tiêu cực là tai họa, lo âu, bệnh tật, tiểu nhân.',
};

/**
 * Diễn giải tương quan giữa Hào Thế và Hào Ứng
 */
export function interpretShiYing(analysis: SixYaoAnalysisResult): ShiYingInterpretation {
  const worldPos = analysis.summary.worldLinePosition;
  const respPos = analysis.summary.responseLinePosition;

  const worldLine = analysis.primaryHexagram.lines[worldPos - 1]!;
  const respLine = analysis.primaryHexagram.lines[respPos - 1]!;

  const worldEl = worldLine.element;
  const respEl = respLine.element;

  let relation: ShiYingRelationType;
  let relationName: string;
  let explanation: string;

  if (worldEl === respEl) {
    relation = 'TY_HOA';
    relationName = 'Thế Ứng Tỷ Hòa (Đồng hành)';
    explanation = `Hào Thế (Hào ${worldPos} - ${getElementName(worldEl)}) và Hào Ứng (Hào ${respPos} - ${getElementName(respEl)}) cùng hành. Mình và đối tác đồng điệu tâm ý, việc cầu hòa hợp, cùng nhau phát triển thuận lợi.`;
  } else if (isElementGenerating(respEl, worldEl)) {
    relation = 'UNG_SINH_THE';
    relationName = 'Ứng Sinh Thế (Ngoại cảnh giúp mình)';
    explanation = `Hào Ứng (${getElementName(respEl)}) tương sinh cho Hào Thế (${getElementName(worldEl)}). Đối phương hoặc hoàn cảnh bên ngoài tạo điều kiện tốt, nâng đỡ và ủng hộ bản thân, mưu sự rất dễ thành.`;
  } else if (isElementGenerating(worldEl, respEl)) {
    relation = 'THE_SINH_UNG';
    relationName = 'Thế Sinh Ứng (Mình vì người khác)';
    explanation = `Hào Thế (${getElementName(worldEl)}) sinh cho Hào Ứng (${getElementName(respEl)}). Bản thân nhiệt tình cống hiến, hao tâm tốn sức vì người khác hoặc công việc, cần cẩn trọng tránh bị lợi dụng lòng tốt.`;
  } else if (isElementOvercoming(worldEl, respEl)) {
    relation = 'THE_KHAC_UNG';
    relationName = 'Thế Khắc Ứng (Mình chiếm ưu thế)';
    explanation = `Hào Thế (${getElementName(worldEl)}) khắc chế Hào Ứng (${getElementName(respEl)}). Bản thân nắm quyền chủ động, chế ngự được đối phương và tình thế, tuy có vất vả nhưng nắm chắc phần thắng.`;
  } else {
    relation = 'UNG_KHAC_THE';
    relationName = 'Ứng Khắc Thế (Ngoại cảnh chống đối)';
    explanation = `Hào Ứng (${getElementName(respEl)}) khắc chế Hào Thế (${getElementName(worldEl)}). Đối phương hoặc hoàn cảnh gây áp lực cản trở, dễ gặp phản trắc hoặc thua thiệt, không nên mạo hiểm tranh chấp.`;
  }

  const classicalReference =
    'Bốc Phệ Chính Tông: "Thế vi kỷ, Ứng vi nhân; Ứng sinh Thế cát, Thế khắc Ứng thắng, Ứng khắc Thế hung".';

  return {
    worldLine: worldPos,
    responseLine: respPos,
    worldElement: worldEl,
    responseElement: respEl,
    palaceId: analysis.primaryHexagram.palace.id,
    palaceName: analysis.primaryHexagram.palace.name,
    palaceElement: analysis.primaryHexagram.palace.element,
    relation,
    relationName,
    explanation,
    classicalReference,
  };
}

/**
 * Diễn giải vai trò Lục Thân trên cả 6 hào
 */
export function interpretSixRelations(
  analysis: SixYaoAnalysisResult
): readonly SixRelationInterpretationItem[] {
  return analysis.primaryHexagram.lines.map((line) => {
    let roleDesc = '';
    if (line.isWorld) {
      roleDesc = 'Là Hào Thế: Đại diện cho chính bản thân người xem quẻ.';
    } else if (line.isResponse) {
      roleDesc = 'Là Hào Ứng: Đại diện cho sự việc cần hỏi hoặc đối phương.';
    } else if (line.isMoving) {
      roleDesc = 'Là Hào Động: Yếu tố then chốt đang phát sinh biến chuyển.';
    } else {
      roleDesc = 'Hào Tĩnh: Giữ trạng thái ổn định theo lẽ thường.';
    }

    return {
      position: line.position,
      relation: line.sixRelation,
      relationName: line.sixRelationName,
      branch: line.branch,
      element: line.element,
      elementName: line.elementName,
      generalSignificance: SIX_RELATION_SIGNIFICANCE[line.sixRelation],
      lineRoleDescription: roleDesc,
    };
  });
}

/**
 * Diễn giải tác động của Nhật Thần, Nguyệt Kiến và vượng suy
 */
export function interpretOfficerImpact(
  analysis: SixYaoAnalysisResult
): OfficerImpactInterpretation {
  const worldPos = analysis.summary.worldLinePosition;
  const worldLine = analysis.primaryHexagram.lines[worldPos - 1]!;

  const isWorldVoid = worldLine.calendar.isVoid;
  const isWorldBreak = worldLine.calendar.isMonthlyBreak;

  let worldExplanation = `Hào Thế lâm ${worldLine.sixRelationName} (${worldLine.branch} ${worldLine.elementName}), khí lực đạt mức "${worldLine.strength.levelName}" (Điểm: ${worldLine.strength.totalScore}). `;

  if (isWorldVoid) {
    worldExplanation +=
      'Đang lâm Tuần Không: Tâm lý còn hoang mang do dự, mưu sự chưa đậu thực chất, cần đợi đến ngày xuất Không mới rõ kết quả. ';
  }
  if (isWorldBreak) {
    worldExplanation +=
      'Đang lâm Nguyệt Phá: Bị Địa Chi tháng xung phá, sức mạnh tạm thời suy thoái tổn thương, cần sự bồi đắp hoặc gặp ngày Lục Hợp mới hồi phục. ';
  }
  if (!isWorldVoid && !isWorldBreak) {
    worldExplanation +=
      'Không bị Không Vong hay Nguyệt Phá, năng lượng ổn định để ứng phó hoàn cảnh. ';
  }

  // Phân tích các hào động
  const movingLinesAnalysis = analysis.primaryHexagram.lines
    .filter((l) => l.isMoving)
    .map((l) => {
      let exp = `Hào ${l.position} (${l.sixRelationName} ${l.branch}) phát động. `;
      if (l.changingLine) {
        exp += `Biến thành Hào ${l.changingLine.position} (${l.changingLine.sixRelationName} ${l.changingLine.branch}). `;
        exp += `Mối tương tác: ${l.changingLine.interaction.isHoiDauSinh ? 'Hồi Đầu Sinh (rất tốt)' : ''}${l.changingLine.interaction.isHoiDauKhac ? 'Hồi Đầu Khắc (bất lợi)' : ''}${l.changingLine.interaction.isTienThan ? 'Hóa Tiến Thần (khí thế ngày càng mạnh)' : ''}${l.changingLine.interaction.isThoaiThan ? 'Hóa Thoái Thần (khí thế lùi dần)' : ''}`;
      }
      return {
        position: l.position,
        isVoid: l.calendar.isVoid,
        isMonthlyBreak: l.calendar.isMonthlyBreak,
        changingInteractionName: l.changingLine?.interaction ? l.changingLine.sixRelationName : undefined,
        explanation: exp,
      };
    });

  const classicalReference =
    'Tăng San Bốc Dịch: "Nguyệt Kiến ti vạn bặc chi vượng suy; Nhật Thần chủ nhất nhật chi sinh sát; Nguyệt Phá Tuần Không nghi tường sát dã".';

  return {
    dayBranch: analysis.dateTime.canChi.day,
    monthBranch: analysis.dateTime.canChi.month,
    voidBranches: [analysis.dateTime.dayMaster.voidBranches[0] ?? '', analysis.dateTime.dayMaster.voidBranches[1] ?? ''],
    monthlyBreakBranch: analysis.dateTime.monthCommander.monthlyBreakBranch,
    worldLineAnalysis: {
      isVoid: isWorldVoid,
      isMonthlyBreak: isWorldBreak,
      seasonalStrength: worldLine.strength.seasonalStateName,
      levelName: worldLine.strength.levelName,
      explanation: worldExplanation,
    },
    movingLinesAnalysis,
    summaryOverview: analysis.summary.objectiveOverview,
    classicalReference,
  };
}

/**
 * Tổng hợp toàn bộ diễn giải Lục Hào
 */
export function interpretSixYao(analysis: SixYaoAnalysisResult): SixYaoInterpretationResult {
  return {
    shiYing: interpretShiYing(analysis),
    relations: interpretSixRelations(analysis),
    officerImpact: interpretOfficerImpact(analysis),
    source: SIX_YAO_INTERP_SOURCE,
    version: SIX_YAO_INTERP_VERSION,
  };
}
