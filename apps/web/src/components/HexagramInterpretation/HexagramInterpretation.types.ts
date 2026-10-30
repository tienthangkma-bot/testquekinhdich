import { HexagramTrio } from '@kindich/domain';
import {
  MaiHuaCastingResult,
  SixYaoAnalysisResult,
  SixYaoOrchestratorInput,
} from '@kindich/core';

/**
 * 4 tab chính của khu vực Luận Giải Quẻ (Requirement 2)
 */
export type InterpretationTab = 'overview' | 'classical' | 'mai-hua' | 'six-yao';

/**
 * Thuộc tính đầu vào cho HexagramInterpretationView
 */
export interface HexagramInterpretationViewProps {
  /** Bộ 3 quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */
  readonly trio: HexagramTrio;

  /** Kết quả từ Mai Hoa Casting Engine (nếu lập quẻ bằng Mai Hoa) */
  readonly maiHuaResult?: MaiHuaCastingResult;

  /** Kết quả từ Six Yao Orchestrator (nếu có phân tích Lục Hào) */
  readonly sixYaoResult?: SixYaoAnalysisResult;

  /** Thông tin ngày giờ để tự động phân tích Lục Hào nếu chưa có sixYaoResult */
  readonly dateTime?: SixYaoOrchestratorInput['dateTime'];

  /** Tab hiển thị mặc định */
  readonly initialTab?: InterpretationTab;

  /** Tùy chọn mặc định xem toàn bộ 6 hào hay chỉ các hào động */
  readonly initialIncludeAllLines?: boolean;

  /** Lớp CSS tùy chỉnh */
  readonly className?: string;
}
