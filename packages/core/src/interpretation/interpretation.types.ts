import { HexagramTrio, LinePosition } from '@kindich/domain';
import { MaiHuaCastingResult } from '../mai-hua/mai-hua.types';
import { SixYaoAnalysisResult } from '../six-yao/six-yao.types';
import { ClassicalHexagramData, ClassicalLineStatement } from './classical/classical-texts.types';
import { TiYongInterpretation } from './mai-hua/mai-hua-interpretation.types';
import { SixYaoInterpretationResult } from './six-yao/six-yao-interpretation.types';

export const INTERPRETATION_ENGINE_VERSION = 'INTERPRETATION-ENGINE-V1';

/**
 * Phân loại bản chất nội dung diễn giải để người dùng và giao diện nhận diện rành mạch
 */
export enum InterpretationContentType {
  /** Nguyên văn cổ điển: Lời quẻ, Lời hào nguyên gốc thời Tiên Tần / Chu Dịch */
  CLASSICAL_ORIGINAL = 'CLASSICAL_ORIGINAL',

  /** Giải thích hiện đại: Diễn giải ngữ nghĩa, ứng dụng thực tiễn và lời khuyên */
  MODERN_EXPLANATION = 'MODERN_EXPLANATION',

  /** Kết quả tính toán: Dữ liệu định lượng từ các thuật toán */
  CALCULATION_METRIC = 'CALCULATION_METRIC',
}

/**
 * Khối diễn giải có gắn nhãn nguồn gốc và phân loại nội dung
 */
export interface InterpretedSection<T = unknown> {
  readonly contentType: InterpretationContentType;
  readonly title: string;
  readonly content: T;
  readonly source: string;
  readonly version: string;
  readonly hasVerifiedContent: boolean;
  readonly notice?: string;
}

/**
 * Diễn giải phương thức chiêm đoán quẻ biến theo số lượng hào động (Quy tắc Chu Hi - Dịch Học Khải Mông)
 */
export interface HexagramTransformationInterpretation {
  readonly primaryHexagramNumber: number;
  readonly primaryHexagramName: string;
  readonly changingHexagramNumber?: number;
  readonly changingHexagramName?: string;
  readonly movingLineIndices: readonly LinePosition[];
  readonly movingLineCount: number;
  readonly isStatic: boolean;
  readonly divinationMethodRule: string;
  readonly explanation: string;
  readonly source: string;
  readonly version: string;
}

/**
 * Đầu vào cho Interpretation Engine
 */
export interface InterpretationInput {
  /** Bộ 3 quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */
  readonly trio: HexagramTrio;

  /** Kết quả từ Mai Hoa Casting Engine (nếu lập quẻ bằng Mai Hoa) */
  readonly maiHuaResult?: MaiHuaCastingResult;

  /** Kết quả từ Six Yao Orchestrator (nếu có phân tích Lục Hào) */
  readonly sixYaoResult?: SixYaoAnalysisResult;

  /** Tùy chọn mở rộng: Xem lời của toàn bộ 6 hào thay vì chỉ các hào động */
  readonly includeAllLines?: boolean;
}

/**
 * Kết quả diễn giải toàn diện của Interpretation Engine
 */
export interface ComprehensiveInterpretationResult {
  readonly engineVersion: string;
  readonly interpretedAt: string;
  readonly disclaimer: string;

  /** Nội dung cổ điển Quẻ Chủ (Thoán từ, Đại Tượng, Lời hào động, Tiểu Tượng) */
  readonly primaryClassical: InterpretedSection<ClassicalHexagramData | null>;

  /** Lời hào cổ điển của các hào động (hoặc tất cả các hào nếu yêu cầu) */
  readonly movingLinesClassical: readonly InterpretedSection<ClassicalLineStatement>[];

  /** Nội dung cổ điển Quẻ Biến (nếu có biến) */
  readonly transformedClassical?: InterpretedSection<ClassicalHexagramData | null>;

  /** Diễn giải biến hóa Quẻ Chủ -> Quẻ Biến và quy tắc xem hào động Chu Hi */
  readonly hexagramTransformation: InterpretedSection<HexagramTransformationInterpretation>;

  /** Diễn giải Thể/Dụng Mai Hoa (nếu có đầu vào Mai Hoa) */
  readonly maiHua?: InterpretedSection<TiYongInterpretation>;

  /** Diễn giải Lục Hào: Thế/Ứng, Lục Thân, Nhật Nguyệt vượng suy (nếu có đầu vào Lục Hào) */
  readonly sixYao?: InterpretedSection<SixYaoInterpretationResult>;
}
