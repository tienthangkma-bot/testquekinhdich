import { Element, LinePosition } from '@kindich/domain';

/**
 * Quan hệ Ngũ Hành sinh khắc giữa Quan Tinh (Nhật Thần / Nguyệt Kiến) và Hào
 */
export enum ElementRelationType {
  /** Quan tinh sinh Hào ("Nhật/Nguyệt sinh Hào") */
  SINH_HAO = 'SINH_HAO',

  /** Hào sinh Quan tinh ("Hào sinh Nhật/Nguyệt" - tiết khí) */
  HAO_SINH = 'HAO_SINH',

  /** Quan tinh khắc Hào ("Nhật/Nguyệt khắc Hào") */
  KHAC_HAO = 'KHAC_HAO',

  /** Hào khắc Quan tinh ("Hào khắc Nhật/Nguyệt") */
  HAO_KHAC = 'HAO_KHAC',

  /** Tỷ hòa / Cùng hành ("Đồng hành") */
  TY_HOA = 'TY_HOA',
}

/**
 * Thông tin chi tiết về tương tác giữa một Hào với Nhật Thần (Địa Chi Ngày)
 */
export interface LineDayRelation {
  /** Địa Chi của ngày */
  readonly dayBranch: string;

  /** Ngũ Hành của Địa Chi ngày */
  readonly dayElement: Element;

  /** Tên Ngũ Hành của ngày */
  readonly dayElementName: string;

  /** Loại quan hệ sinh khắc ngũ hành */
  readonly elementRelation: ElementRelationType;

  /** Mô tả quan hệ ngũ hành (ví dụ: "Nhật Thần sinh Hào", "Nhật Thần khắc Hào"...) */
  readonly elementRelationDescription: string;

  /** Hào có Lục Hợp với Nhật Thần hay không (Nhật Hợp) */
  readonly isHarmonious: boolean;

  /** Chi tiết hợp (ví dụ: "Tý Sửu hợp Thổ") */
  readonly harmonyDescription?: string;

  /** Hào có Lục Xung với Nhật Thần hay không (Nhật Xung) */
  readonly isClash: boolean;

  /** Chi tiết xung (ví dụ: "Tý Ngọ tương xung") */
  readonly clashDescription?: string;
}

/**
 * Thông tin chi tiết về tương tác giữa một Hào với Nguyệt Kiến (Địa Chi Tháng)
 */
export interface LineMonthRelation {
  /** Địa Chi của tháng */
  readonly monthBranch: string;

  /** Ngũ Hành của Địa Chi tháng */
  readonly monthElement: Element;

  /** Tên Ngũ Hành của tháng */
  readonly monthElementName: string;

  /** Loại quan hệ sinh khắc ngũ hành */
  readonly elementRelation: ElementRelationType;

  /** Mô tả quan hệ ngũ hành (ví dụ: "Nguyệt Kiến sinh Hào", "Nguyệt Kiến khắc Hào"...) */
  readonly elementRelationDescription: string;

  /** Hào có Lục Hợp với Nguyệt Kiến hay không (Nguyệt Hợp) */
  readonly isHarmonious: boolean;

  /** Chi tiết hợp (ví dụ: "Mão Tuất hợp Hỏa") */
  readonly harmonyDescription?: string;

  /** Hào có Lục Xung với Nguyệt Kiến hay không (Nguyệt Xung -> Nguyệt Phá) */
  readonly isClash: boolean;

  /** Chi tiết xung (ví dụ: "Dần Thân tương xung") */
  readonly clashDescription?: string;
}

/**
 * Kết quả phân tích lịch pháp toàn diện cho một Hào trong quẻ
 */
export interface LineCalendarAnalysis {
  /** Vị trí hào trong quẻ (1 đến 6, từ dưới lên) */
  readonly position: LinePosition;

  /** Địa Chi nạp vào hào (ví dụ: "Tý", "Dần"...) */
  readonly branch: string;

  /** Ngũ Hành của hào */
  readonly element: Element;

  /** Tên Ngũ Hành của hào ("Kim", "Mộc"...) */
  readonly elementName: string;

  /** Thiên Can của hào (nếu có) */
  readonly stem?: string;

  /** Tương tác với Nhật Thần (Địa Chi Ngày) */
  readonly dayRelation: LineDayRelation;

  /** Tương tác với Nguyệt Kiến (Địa Chi Tháng) */
  readonly monthRelation: LineMonthRelation;

  /** Trạng thái Không Vong: Hào có rơi vào Tuần Không của ngày hay không */
  readonly isVoid: boolean;

  /** Trạng thái Nguyệt Phá: Hào có bị Nguyệt Kiến xung hay không */
  readonly isMonthlyBreak: boolean;

  /** Các nhãn tóm tắt trạng thái (ví dụ: ["Không Vong", "Nguyệt Phá", "Nhật Hợp"]) */
  readonly summaryTags: readonly string[];
}

/**
 * Dữ liệu phân tích Nhật Thần (Địa Chi Ngày)
 */
export interface DayMasterInfo {
  readonly stem: string;
  readonly branch: string;
  readonly canChi: string;
  readonly element: Element;
  readonly elementName: string;
  /** Tên Tuần Giáp (ví dụ: "Tuần Giáp Tý") */
  readonly weekCycle: string;
  /** Hai Địa Chi rơi vào Không Vong của tuần này (ví dụ: ["Tuất", "Hợi"]) */
  readonly voidBranches: readonly [string, string];
  /** Ngày lập quẻ có phải là ngày Nguyệt Phá (Chi ngày xung Chi tháng) hay không */
  readonly isMonthlyBreakDay: boolean;
}

/**
 * Dữ liệu phân tích Nguyệt Kiến (Địa Chi Tháng)
 */
export interface MonthCommanderInfo {
  readonly stem: string;
  readonly branch: string;
  readonly canChi: string;
  readonly element: Element;
  readonly elementName: string;
  /** Địa Chi bị Nguyệt Phá trong tháng này (Địa Chi tương xung với Nguyệt Kiến) */
  readonly monthlyBreakBranch: string;
  /** Tên Tiết Khí thiên văn nếu có */
  readonly solarTermName?: string;
}

/**
 * Kết quả phân tích Calendar Analysis hoàn chỉnh
 */
export interface CalendarAnalysisResult {
  /** Phiên bản bộ quy tắc phân tích lịch pháp */
  readonly ruleVersion: 'CAL-ANALYSIS-V1';

  /** Tài liệu đối chiếu kinh điển */
  readonly sourceReference: string;

  /** Thông tin Nhật Thần */
  readonly dayMaster: DayMasterInfo;

  /** Thông tin Nguyệt Kiến */
  readonly monthCommander: MonthCommanderInfo;

  /** Phân tích tương tác lịch pháp cho 6 hào (nếu đầu vào có cung cấp thông tin quẻ/hào) */
  readonly lineAnalyses?: readonly [
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
    LineCalendarAnalysis,
  ];
}

/**
 * Thông tin đầu vào của một hào cần phân tích
 */
export interface InputLineForCalendarAnalysis {
  readonly position: LinePosition;
  readonly branch: string;
  readonly element?: Element;
  readonly stem?: string;
}

/**
 * Tham số đầu vào cho Calendar Analysis Engine
 */
export interface CalendarAnalysisParams {
  /** Chuỗi Can Chi ngày (ví dụ: "Giáp Tý", "Ất Sửu") hoặc đối tượng */
  readonly dayCanChi?: string | { stem: string; branch: string };

  /** Chuỗi Can Chi tháng (ví dụ: "Mậu Tuất", "Bính Dần") hoặc đối tượng */
  readonly monthCanChi?: string | { stem: string; branch: string };

  /** Thiên Can ngày trực tiếp */
  readonly dayStem?: string;

  /** Địa Chi ngày trực tiếp (Nhật Thần) */
  readonly dayBranch?: string;

  /** Thiên Can tháng trực tiếp */
  readonly monthStem?: string;

  /** Địa Chi tháng trực tiếp (Nguyệt Kiến) */
  readonly monthBranch?: string;

  /** Tên tiết khí (nếu có từ Calendar Engine) */
  readonly solarTermName?: string;

  /**
   * Kết quả chuyển đổi từ Calendar Engine (nếu có, tự động trích xuất Can Chi ngày & tháng)
   */
  readonly calendarResult?: {
    readonly canChi: {
      readonly day: string;
      readonly month: string;
    };
    readonly solarTerm?: {
      readonly name: string;
    };
  };

  /**
   * Danh sách 6 hào cần phân tích quan hệ
   */
  readonly lines?: readonly InputLineForCalendarAnalysis[];

  /**
   * Hoặc truyền mã quái để tự động sinh 6 hào Nạp Giáp phân tích
   */
  readonly lowerTrigramCode?: string;
  readonly upperTrigramCode?: string;
}
