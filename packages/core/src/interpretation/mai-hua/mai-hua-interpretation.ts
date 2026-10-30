import { getElementName, Trigram } from '@kindich/domain';
import {
  isElementGenerating,
  isElementOvercoming,
} from '../../six-relations/six-relations.engine';
import {
  MAI_HUA_INTERP_SOURCE,
  MAI_HUA_INTERP_VERSION,
  TiYongInterpretation,
  TiYongJudgmentLevel,
  TiYongRelation,
} from './mai-hua-interpretation.types';

/**
 * Diễn giải tương quan Ngũ Hành giữa Thể Quái và Dụng Quái theo Mai Hoa Dịch Số
 *
 * Nguồn nguyên văn: "Mai Hoa Dịch Số" (Thiệu Ung):
 * - Dụng sinh Thể vi chi sinh nhập, thiết hữu tiến ích chi hỷ.
 * - Thể sinh Dụng vi chi sinh xuất, khủng hữu hao tổn chi ưu.
 * - Thể khắc Dụng vi chi khắc xuất, sự tuy thành nhi hữu tổn.
 * - Dụng khắc Thể vi chi khắc nhập, đại hung họa hoạn lai xâm.
 * - Thể Dụng tỷ hòa, bách sự như ý.
 */
export function interpretTiYong(
  tiTrigram: Trigram,
  yongTrigram: Trigram
): TiYongInterpretation {
  const tiElement = tiTrigram.element;
  const yongElement = yongTrigram.element;

  let relation: TiYongRelation;
  let relationName: string;
  let classicalVerse: string;
  let judgmentLevel: TiYongJudgmentLevel;
  let judgmentLevelName: string;
  let explanation: string;
  let advice: string;

  if (tiElement === yongElement) {
    relation = TiYongRelation.TY_HOA;
    relationName = 'Thể Dụng Tỷ Hòa (Đồng hành)';
    classicalVerse = 'Thể Dụng tỷ hòa, bách sự như ý (體用比和，百事如意).';
    judgmentLevel = 'CAT';
    judgmentLevelName = 'Cát lành, thuận hòa';
    explanation = `Thể quái ${tiTrigram.name} (${getElementName(tiElement)}) và Dụng quái ${yongTrigram.name} (${getElementName(yongElement)}) đồng hành ngũ hành. Ngoại giới và nội tâm hòa hợp, được người đồng chí hướng giúp đỡ.`;
    advice = 'Nên hợp tác, giữ gìn hòa khí, phát huy sức mạnh tập thể để hoàn thành mục tiêu.';
  } else if (isElementGenerating(yongElement, tiElement)) {
    relation = TiYongRelation.DUNG_SINH_THE;
    relationName = 'Dụng Sinh Thể (Sinh nhập)';
    classicalVerse = 'Dụng sinh Thể vi chi sinh nhập, thiết hữu tiến ích chi hỷ (用生體為之生入，切有進益之喜).';
    judgmentLevel = 'DAI_CAT';
    judgmentLevelName = 'Đại Cát (Rất tốt lành)';
    explanation = `Dụng quái ${yongTrigram.name} (${getElementName(yongElement)}) tương sinh cho Thể quái ${tiTrigram.name} (${getElementName(tiElement)}). Hoàn cảnh bên ngoài mang lại cơ hội, quý nhân phù trợ, mưu sự đại thành.`;
    advice = 'Thời cơ rất thuận lợi, nên chủ động nắm bắt cơ hội và triển khai các kế hoạch đã chuẩn bị.';
  } else if (isElementGenerating(tiElement, yongElement)) {
    relation = TiYongRelation.THE_SINH_DUNG;
    relationName = 'Thể Sinh Dụng (Sinh xuất)';
    classicalVerse = 'Thể sinh Dụng vi chi sinh xuất, khủng hữu hao tổn chi ưu (體生用為之生出，恐有耗損之憂).';
    judgmentLevel = 'HAU_TON';
    judgmentLevelName = 'Hao tổn, tiêu tán';
    explanation = `Thể quái ${tiTrigram.name} (${getElementName(tiElement)}) phải tiết khí sinh cho Dụng quái ${yongTrigram.name} (${getElementName(yongElement)}). Sự việc đòi hỏi tiêu hao nhiều công sức, tiền bạc hoặc sức khỏe mà thành quả thu về bị suy giảm.`;
    advice = 'Cần liệu sức mà làm, tránh ôm đồm việc vượt quá khả năng, kiểm soát chi tiêu và giữ gìn sinh lực.';
  } else if (isElementOvercoming(tiElement, yongElement)) {
    relation = TiYongRelation.THE_KHAC_DUNG;
    relationName = 'Thể Khắc Dụng (Khắc xuất)';
    classicalVerse = 'Thể khắc Dụng vi chi khắc xuất, sự tuy thành nhi hữu tổn (體克用為之克出，事雖成而有損).';
    judgmentLevel = 'BINH_HOA';
    judgmentLevelName = 'Việc thành nhưng vất vả';
    explanation = `Thể quái ${tiTrigram.name} (${getElementName(tiElement)}) khắc chế Dụng quái ${yongTrigram.name} (${getElementName(yongElement)}). Bản thân có đủ năng lực khống chế tình hình, việc có thể hoàn thành nhưng phải trải qua gian nan, tốn hao tâm trí.`;
    advice = 'Cần kiên trì và linh hoạt, tính toán kỹ lưỡng cái được cái mất trước khi hành động.';
  } else {
    relation = TiYongRelation.DUNG_KHAC_THE;
    relationName = 'Dụng Khắc Thể (Khắc nhập)';
    classicalVerse = 'Dụng khắc Thể vi chi khắc nhập, đại hung họa hoạn lai xâm (用克體為之克入，大凶禍患來侵).';
    judgmentLevel = 'DAI_HUNG';
    judgmentLevelName = 'Đại Hung (Bất lợi lớn)';
    explanation = `Dụng quái ${yongTrigram.name} (${getElementName(yongElement)}) khắc chế trực tiếp Thể quái ${tiTrigram.name} (${getElementName(tiElement)}). Môi trường hoặc hoàn cảnh bên ngoài chống đối, áp lực lớn, dễ gặp trở ngại, thất bại hoặc tổn thương.`;
    advice = 'Nên tạm thời dừng lại phòng thủ, tránh mạo hiểm đối đầu trực diện, tĩnh tâm chờ thời cơ mới.';
  }

  return {
    tiTrigram,
    yongTrigram,
    tiElement,
    yongElement,
    relation,
    relationName,
    classicalVerse,
    judgmentLevel,
    judgmentLevelName,
    explanation,
    advice,
    source: MAI_HUA_INTERP_SOURCE,
    version: MAI_HUA_INTERP_VERSION,
  };
}
