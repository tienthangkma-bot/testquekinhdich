import { Element, LinePosition, SixRelation } from '@kindich/domain';

export const SIX_YAO_INTERP_VERSION = 'SIX-YAO-INTERP-V1';
export const SIX_YAO_INTERP_SOURCE =
  'Bốc Phệ Chính Tông (Vương Duy Đức) & Tăng San Bốc Dịch (Dã Hạc Đạo Nhân)';

/**
 * Tương quan Ngũ Hành giữa Hào Thế và Hào Ứng
 */
export type ShiYingRelationType =
  | 'TY_HOA'          // Thế Ứng tỷ hòa (cùng hành)
  | 'THE_SINH_UNG'     // Thế sinh Ứng (mình vì người, tốn công)
  | 'UNG_SINH_THE'     // Ứng sinh Thế (người giúp mình, thuận lợi)
  | 'THE_KHAC_UNG'     // Thế khắc Ứng (mình chế ngự được người/việc)
  | 'UNG_KHAC_THE';    // Ứng khắc Thế (người/việc làm tổn hại mình)

/**
 * Diễn giải tương quan Thế - Ứng
 */
export interface ShiYingInterpretation {
  readonly worldLine: LinePosition;
  readonly responseLine: LinePosition;
  readonly worldElement: Element;
  readonly responseElement: Element;
  readonly palaceId: string;
  readonly palaceName: string;
  readonly palaceElement: Element;
  readonly relation: ShiYingRelationType;
  readonly relationName: string;
  readonly explanation: string;
  readonly classicalReference: string;
}

/**
 * Diễn giải vai trò của Lục Thân trên từng hào
 */
export interface SixRelationInterpretationItem {
  readonly position: LinePosition;
  readonly relation: SixRelation;
  readonly relationName: string;
  readonly branch: string;
  readonly element: Element;
  readonly elementName: string;
  readonly generalSignificance: string;
  readonly lineRoleDescription: string;
}

/**
 * Diễn giải tác động của Nhật Thần, Nguyệt Kiến, Tuần Không và Nguyệt Phá
 */
export interface OfficerImpactInterpretation {
  readonly dayBranch: string;
  readonly monthBranch: string;
  readonly voidBranches: readonly [string, string];
  readonly monthlyBreakBranch: string;
  readonly worldLineAnalysis: {
    readonly isVoid: boolean;
    readonly isMonthlyBreak: boolean;
    readonly seasonalStrength: string;
    readonly levelName: string;
    readonly explanation: string;
  };
  readonly movingLinesAnalysis: readonly {
    readonly position: LinePosition;
    readonly isVoid: boolean;
    readonly isMonthlyBreak: boolean;
    readonly changingInteractionName?: string;
    readonly explanation: string;
  }[];
  readonly summaryOverview: string;
  readonly classicalReference: string;
}

/**
 * Kết quả phân tích diễn giải Lục Hào tổng hợp
 */
export interface SixYaoInterpretationResult {
  readonly shiYing: ShiYingInterpretation;
  readonly relations: readonly SixRelationInterpretationItem[];
  readonly officerImpact: OfficerImpactInterpretation;
  readonly source: string;
  readonly version: string;
}
