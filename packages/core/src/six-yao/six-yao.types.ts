/**
 * Các định nghĩa kiểu dữ liệu cho Six Yao Analysis Orchestrator (Bộ Điều Phối Lục Hào Toàn Diện)
 *
 * PHIÊN BẢN: SIX-YAO-ORCHESTRATOR-V1
 * RULESET MẶC ĐỊNH: SIX-YAO-STANDARD-V1
 *
 * NGUỒN TƯ LIỆU ĐỐI CHIẾU:
 * 1. Bốc Phệ Chính Tông (Vương Duy Đức)
 * 2. Tăng San Bốc Dịch (Dã Hạc Đạo Nhân)
 * 3. Kinh Thị Dịch Truyện (Kinh Phòng)
 */

import {
  Element,
  GenerationStage,
  Hexagram,
  LinePosition,
  PalaceId,
  SixRelation,
  SixSpirit,
  TrigramCode,
} from '@kindich/domain';

import {
  DayMasterInfo,
  MonthCommanderInfo,
} from '../calendar-analysis/calendar-analysis.types';

import {
  SeasonalStrength,
  StrengthFactor,
  StrengthLevel,
  ThreeHarmonyFormation,
  VoidStatusType,
} from '../yao-strength/yao-strength.types';

import { DayTransitionRule, DateTimeInput } from '@kindich/calendar';

/**
 * Loại tương tác giữa Động Hào (Quẻ Chủ) và Biến Hào (Quẻ Biến)
 */
export type MovingLineInteractionType =
  | 'HOI_DAU_SINH'     // Biến hào tương sinh Động hào
  | 'HOI_DAU_KHAC'     // Biến hào tương khắc Động hào
  | 'HOI_DAU_HOP'      // Biến hào lục hợp với Động hào
  | 'HOI_DAU_XUNG'      // Biến hào tương xung với Động hào
  | 'HOA_TIEN_THAN'    // Động hào hóa Tiến Thần
  | 'HOA_THOAI_THAN'   // Động hào hóa Thoái Thần
  | 'TY_HOA'           // Cùng hành (Tỷ hòa)
  | 'HOA_TIET_KHI'     // Động hào sinh Biến hào (bị tiết hao)
  | 'DONG_KHAC_BIEN';  // Động hào khắc Biến hào

/**
 * Chi tiết mối tương tác giữa Hào Động và Hào Biến
 */
export interface MovingLineInteraction {
  /** Vị trí hào động (1 đến 6) */
  readonly position: LinePosition;

  /** Địa Chi và Ngũ Hành hào động (Quẻ Chủ) */
  readonly primaryBranch: string;
  readonly primaryElement: Element;
  readonly primaryRelation: SixRelation;
  readonly primaryRelationName: string;

  /** Địa Chi và Ngũ Hành hào biến (Quẻ Biến) */
  readonly changingBranch: string;
  readonly changingElement: Element;
  readonly changingRelation: SixRelation;
  readonly changingRelationName: string;

  /** Các cờ nhận diện tương tác đặc thù */
  readonly isHoiDauSinh: boolean;
  readonly isHoiDauKhac: boolean;
  readonly isHoiDauHop: boolean;
  readonly isHoiDauXung: boolean;
  readonly isTienThan: boolean;
  readonly isThoaiThan: boolean;
  readonly isTyHoa: boolean;
  readonly isHoaTietKhi: boolean;
  readonly isDongKhacBien: boolean;

  /** Nhãn tóm tắt các tính chất (ví dụ: ["Hồi Đầu Sinh", "Hồi Đầu Hợp"]) */
  readonly tags: readonly string[];

  /** Diễn giải chi tiết ảnh hưởng cơ học của hào biến đối với hào động */
  readonly description: string;

  /** Nguồn trích dẫn quy tắc */
  readonly sourceReference: string;
}

/**
 * Thông tin một hào biến trong cấu trúc phân tích
 */
export interface ChangingLineDetail {
  readonly position: LinePosition;
  readonly yinYang: 0 | 1;
  readonly stem: string;
  readonly branch: string;
  readonly element: Element;
  readonly elementName: string;
  readonly canChi: string;
  readonly sixRelation: SixRelation;
  readonly sixRelationName: string;
  readonly fullRelationLabel: string;
  readonly interaction: MovingLineInteraction;
}

/**
 * Kết quả phân tích toàn diện cho 1 Hào trong Quẻ Chủ
 */
export interface AnalyzedSixYaoLine {
  /** Vị trí hào (1 đến 6, từ dưới lên) */
  readonly position: LinePosition;

  /** Giá trị Âm (0) hay Dương (1) */
  readonly yinYang: 0 | 1;

  /** Trạng thái Động hay Tĩnh */
  readonly isMoving: boolean;

  /** Có phải là Hào Thế không */
  readonly isWorld: boolean;

  /** Có phải là Hào Ứng không */
  readonly isResponse: boolean;

  /** Thông tin Nạp Giáp */
  readonly stem: string;
  readonly branch: string;
  readonly element: Element;
  readonly elementName: string;
  readonly canChi: string;

  /** Lục Thân của hào (theo Cung Quẻ Chủ) */
  readonly sixRelation: SixRelation;
  readonly sixRelationName: string;
  readonly fullRelationLabel: string;

  /** Lục Thú an trên hào */
  readonly sixSpirit: SixSpirit;
  readonly sixSpiritName: string;

  /** Tác động từ Lịch Pháp */
  readonly calendar: {
    readonly isVoid: boolean;
    readonly isMonthlyBreak: boolean;
    readonly isDayClash: boolean;
    readonly isDayHarmony: boolean;
    readonly isMonthHarmony: boolean;
    readonly dayEffect: string;
    readonly monthEffect: string;
  };

  /** Đánh giá Lực Lượng và Vượng Suy */
  readonly strength: {
    readonly seasonalState: SeasonalStrength;
    readonly seasonalStateName: string;
    readonly seasonalDescription: string;
    readonly level: StrengthLevel;
    readonly levelName: string;
    readonly totalScore: number;
    readonly isAmDong: boolean;
    readonly isNhatPha: boolean;
    readonly voidStatus: VoidStatusType;
    readonly factors: readonly StrengthFactor[];
    readonly rationale: string;
  };

  /** Chi tiết Hào Biến tương ứng (nếu hào này là hào động) */
  readonly changingLine?: ChangingLineDetail;
}

/**
 * Khối thông tin phân tích một Quẻ (Chủ hoặc Biến)
 */
export interface HexagramAnalysisBlock {
  readonly hexagramNumber: number;
  readonly hexagramId: string;
  readonly name: string;
  readonly sinoVietnamese: string;
  readonly chineseName: string;
  readonly symbol: string;
  readonly rawValues: readonly (0 | 1)[];
  readonly upperTrigram: {
    readonly code: TrigramCode;
    readonly name: string;
  };
  readonly lowerTrigram: {
    readonly code: TrigramCode;
    readonly name: string;
  };
  readonly palace: {
    readonly id: PalaceId;
    readonly name: string;
    readonly element: Element;
    readonly elementName: string;
    readonly generationStage: GenerationStage;
    readonly generationStageName: string;
    readonly worldLine: LinePosition;
    readonly responseLine: LinePosition;
  };
  readonly lines: readonly AnalyzedSixYaoLine[];
}

/**
 * Khối thông tin thời gian và lịch pháp đầu vào
 */
export interface DateTimeAnalysisBlock {
  readonly solarDate?: {
    readonly day: number;
    readonly month: number;
    readonly year: number;
    readonly hour?: number;
    readonly minute?: number;
  };
  readonly lunarDate?: {
    readonly day: number;
    readonly month: number;
    readonly year: number;
    readonly isLeap: boolean;
  };
  readonly canChi: {
    readonly year: string;
    readonly month: string;
    readonly day: string;
    readonly hour?: string;
  };
  readonly dayMaster: DayMasterInfo;
  readonly monthCommander: MonthCommanderInfo;
}

/**
 * Kết quả phân tích toàn diện Lục Hào do Orchestrator tạo ra
 */
export interface SixYaoAnalysisResult {
  /** Mã bộ quy tắc áp dụng (ví dụ: 'SIX-YAO-STANDARD-V1') */
  readonly ruleSetId: string;

  /** Phiên bản thuật toán điều phối */
  readonly algorithmVersion: string;

  /** Thời điểm phân tích (ISO 8601) */
  readonly analyzedAt: string;

  /** Danh mục nguồn tư liệu đối chiếu cho từng thành phần */
  readonly sourceReferences: Record<string, string>;

  /** Tuyên bố trách nhiệm phân tích khách quan, không phán quyết cát/hung tùy tiện */
  readonly disclaimer: string;

  /** Khối thời gian và Lịch pháp */
  readonly dateTime: DateTimeAnalysisBlock;

  /** Quẻ Chủ hoàn chỉnh với 6 hào chi tiết */
  readonly primaryHexagram: HexagramAnalysisBlock;

  /** Quẻ Biến hoàn chỉnh (nếu có hào động; null nếu là quẻ tĩnh) */
  readonly changingHexagram: HexagramAnalysisBlock | null;

  /** Danh sách các hào động và mối tương tác biến hào */
  readonly movingLines: readonly MovingLineInteraction[];

  /** Cờ cho biết đây có phải quẻ tĩnh (không có hào động) không */
  readonly isStatic: boolean;

  /** Tóm lược phân tích thực lực và tương quan tổng quan */
  readonly summary: {
    readonly worldLinePosition: LinePosition;
    readonly responseLinePosition: LinePosition;
    readonly movingLineCount: number;
    readonly dominantElement: Element;
    readonly dominantElementName: string;
    readonly strongestLinePosition: LinePosition;
    readonly weakestLinePosition: LinePosition;
    readonly threeHarmonies: readonly ThreeHarmonyFormation[];
    readonly objectiveOverview: string;
  };
}

/**
 * Tham số đầu vào cho Six Yao Orchestrator
 */
export interface SixYaoOrchestratorInput {
  /**
   * Quẻ Chủ: có thể là thực thể Hexagram, số thứ tự (1-64), mã ID ('HEX_01'-'HEX_64'),
   * hoặc object chứa { lowerTrigramCode, upperTrigramCode, lines? }
   */
  readonly primaryHexagram:
    | Hexagram
    | number
    | string
    | {
        lowerTrigramCode: TrigramCode | string;
        upperTrigramCode: TrigramCode | string;
        lines?: readonly number[];
      };

  /**
   * Quẻ Biến (tùy chọn nếu quẻ có hào biến). Nếu không truyền nhưng có movingLineIndices,
   * Orchestrator sẽ tự động suy diễn Quẻ Biến chuẩn xác.
   */
  readonly changingHexagram?:
    | Hexagram
    | number
    | string
    | {
        lowerTrigramCode: TrigramCode | string;
        upperTrigramCode: TrigramCode | string;
        lines?: readonly number[];
      }
    | null;

  /**
   * Danh sách vị trí các hào động (1 đến 6).
   * Nếu không truyền, hệ thống sẽ tự động so sánh Quẻ Chủ và Quẻ Biến để xác định.
   */
  readonly movingLineIndices?: readonly LinePosition[] | readonly number[];

  /**
   * Thời điểm gieo/lập quẻ:
   * - Có thể là Date, chuỗi ISO 8601, DateTimeInput { day, month, year, hour }
   * - Hoặc bộ Can Chi trực tiếp { dayCanChi, monthCanChi, yearCanChi?, hourCanChi? }
   * - Nếu để trống, mặc định lấy thời gian hiện tại
   */
  readonly dateTime?:
    | Date
    | string
    | DateTimeInput
    | {
        dayCanChi: string | { stem: string; branch: string };
        monthCanChi: string | { stem: string; branch: string };
        yearCanChi?: string;
        hourCanChi?: string;
      };

  /**
   * Mã định danh RuleSet áp dụng (mặc định 'SIX-YAO-STANDARD-V1')
   */
  readonly ruleSetId?: string;

  /**
   * Tùy chọn cấu hình phân tích
   */
  readonly options?: {
    /** Quy tắc chuyển ngày giờ Tý ('RAT_HOUR_23' hoặc 'MIDNIGHT') */
    dayTransition?: DayTransitionRule;
    /** Tên tiết khí (nếu muốn chỉ định rõ) */
    solarTermName?: string;
  };
}
