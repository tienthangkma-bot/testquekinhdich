import { Element, LinePosition, SixRelation } from '@kindich/domain';

/**
 * Trạng thái Vượng Suy theo Mùa / Nguyệt Lệnh (Ngũ Vượng: Vượng, Tướng, Hưu, Tù, Tử)
 * Đối chiếu: Bốc Phệ Chính Tông & Tăng San Bốc Dịch
 */
export enum SeasonalStrength {
  /**
   * Vượng (旺): Cùng hành với Nguyệt Kiến ("Đồng khí vi Vượng")
   * Khí đang ở đỉnh cao cực thịnh nhất.
   */
  VUONG = 'VUONG',

  /**
   * Tướng (相): Được Nguyệt Kiến sinh ("Nguyệt sinh giả vi Tướng")
   * Khí đang sinh sôi lớn mạnh, hữu lực.
   */
  TUONG = 'TUONG',

  /**
   * Hưu (休): Hào sinh Nguyệt Kiến ("Hào sinh Nguyệt vi Hưu")
   * Bị tiết khí ra ngoài, khí thoái lùi, nghỉ ngơi.
   */
  HUU = 'HUU',

  /**
   * Tù (囚): Hào khắc Nguyệt Kiến ("Hào khắc Nguyệt vi Tù")
   * Hao tổn tâm lực chống lại Nguyệt lệnh, bị giam hãm.
   */
  TU = 'TU',

  /**
   * Tử (死): Nguyệt Kiến khắc Hào ("Nguyệt khắc Hào vi Tử")
   * Bị Nguyệt lệnh trực tiếp khắc phạt đè nén, vô khí.
   */
  TU_SI = 'TU_SI',
}

/**
 * Mức độ thực lực nội tại tổng hợp của một Hào
 */
export enum StrengthLevel {
  /** Rất vượng / Cực vượng: Được cả Nhật và Nguyệt sinh trợ hoặc đồng khí */
  RAT_VUONG = 'RAT_VUONG',

  /** Vượng / Khá mạnh: Được sinh hoặc tỷ hòa ở một bên, bên kia không khắc phạt */
  VUONG = 'VUONG',

  /** Trung bình / Bình hòa: Có sinh có khắc cân bằng hoặc hưu tù nhưng có trợ lực */
  TRUNG_BINH = 'TRUNG_BINH',

  /** Suy / Yếu: Bị khắc phạt hoặc hưu tù tiết khí */
  SUY = 'SUY',

  /** Rất suy / Tuyệt địa: Bị Nguyệt phá, Nhật khắc, tử tuyệt không nơi nương tựa */
  RAT_SUY = 'RAT_SUY',
}

/**
 * Phân loại bản chất Không Vong (Chân Không vs Giả Không)
 */
export enum VoidStatusType {
  /** Không thuộc Tuần Không */
  NONE = 'NONE',

  /**
   * Giả Không (假空): Rơi vào Tuần Không nhưng đắc Nguyệt lệnh (Vượng/Tướng)
   * hoặc được Nhật Thần sinh phù, hoặc động hào. Xuất Không (qua tuần) hoặc xung Không thì ứng nghiệm hữu dụng.
   */
  GIA_KHONG = 'GIA_KHONG',

  /**
   * Chân Không (真空): Rơi vào Tuần Không lại gặp Hưu Tù Tử, bị Nhật Nguyệt khắc phạt,
   * tĩnh bất động. Thực sự vô khí, không có thực lực.
   */
  CHAN_KHONG = 'CHAN_KHONG',
}

/**
 * Tương tác giữa 2 hào trong quẻ
 */
export interface InterYaoRelation {
  /** Vị trí hào tác động (1 đến 6) */
  readonly targetPosition: LinePosition;

  /** Địa Chi của hào tác động */
  readonly targetBranch: string;

  /** Ngũ Hành của hào tác động */
  readonly targetElement: Element;

  /** Quan hệ sinh khắc: 'SINH', 'KHAC', 'TY_HOA', 'NONE' */
  readonly elementRelation: 'SINH' | 'KHAC' | 'TY_HOA' | 'NONE';

  /** Có Lục Hợp với nhau không */
  readonly isHarmonious: boolean;

  /** Có Lục Xung với nhau không */
  readonly isClash: boolean;

  /** Mô tả tương tác (ví dụ: "Hào 1 Tý Thủy sinh Hào 2 Dần Mộc") */
  readonly description: string;
}

/**
 * Cục Tam Hợp phát hiện trong quẻ (Thân-Tý-Thìn, Hợi-Mão-Mùi, Dần-Ngọ-Tuất, Tỵ-Dậu-Sửu)
 */
export interface ThreeHarmonyFormation {
  /** Tên cục (ví dụ: "Thân Tý Thìn hợp Thủy cục") */
  readonly name: string;

  /** Ngũ Hành hóa cục (Thủy, Mộc, Hỏa, Kim) */
  readonly element: Element;

  /** Tên tiếng Việt của Ngũ Hành */
  readonly elementName: string;

  /** Các vị trí hào tham gia hợp cục (ví dụ: [1, 3, 5]) */
  readonly linePositions: readonly LinePosition[];

  /** Ba Địa Chi cấu thành hợp cục (ví dụ: ["Thân", "Tý", "Thìn"]) */
  readonly branches: readonly [string, string, string];

  /** Hợp cục hoàn chỉnh (đủ 3 chi) hay bán hợp (2 chi) */
  readonly isComplete: boolean;
}

/**
 * Yếu tố tác động cộng / trừ lực lượng của hào
 */
export interface StrengthFactor {
  /** Nguồn tác động: 'NGUYET_LENH', 'NHAT_THAN', 'DONG_HAO', 'NOI_QUAI', 'THAN_SAT' */
  readonly source: 'NGUYET_LENH' | 'NHAT_THAN' | 'DONG_HAO' | 'NOI_QUAI' | 'THAN_SAT';

  /** Loại ảnh hưởng: 'SINH_TRO', 'TY_HOA', 'TIET_KHI', 'KHAC_PHAT', 'XUNG_PHA', 'HOP_TRO', 'KHONG_VONG' */
  readonly effectType:
    | 'SINH_TRO'
    | 'TY_HOA'
    | 'TIET_KHI'
    | 'KHAC_PHAT'
    | 'XUNG_PHA'
    | 'HOP_TRO'
    | 'KHONG_VONG';

  /** Trọng số điểm ảnh hưởng tham chiếu (từ -3 đến +3) */
  readonly weight: number;

  /** Diễn giải rõ ràng nguyên nhân của yếu tố */
  readonly reason: string;
}

/**
 * Kết quả phân tích lực lượng toàn diện cho một Hào
 */
export interface LineStrengthAnalysis {
  /** Vị trí hào trong quẻ (1 đến 6, từ dưới lên) */
  readonly position: LinePosition;

  /** Thiên Can nạp vào hào (nếu có) */
  readonly stem?: string;

  /** Địa Chi nạp vào hào */
  readonly branch: string;

  /** Ngũ Hành của hào */
  readonly element: Element;

  /** Tên tiếng Việt của Ngũ Hành ("Kim", "Mộc"...) */
  readonly elementName: string;

  /** Lục Thân của hào (nếu có, ví dụ: HUYNH_DE, PHU_MAU...) */
  readonly sixRelation?: SixRelation;

  /** Tên Lục Thân của hào (ví dụ: "Phụ Mẫu", "Quan Quỷ"...) */
  readonly sixRelationName?: string;

  /** Trạng thái hào động (true nếu là hào động) */
  readonly isMoving: boolean;

  /** Trạng thái Vượng Suy theo Mùa / Nguyệt Lệnh */
  readonly seasonalState: {
    readonly state: SeasonalStrength;
    readonly name: string;
    readonly description: string;
  };

  /** Ảnh hưởng của Nhật Thần (Địa Chi Ngày) */
  readonly dayInfluence: {
    readonly dayBranch: string;
    readonly dayElement: Element;
    readonly isSupported: boolean;   // Được sinh hoặc tỷ hòa
    readonly isSuppressed: boolean;  // Bị khắc
    readonly isHarmonious: boolean;  // Nhật Hợp
    readonly isClash: boolean;       // Nhật Xung
    readonly description: string;
  };

  /** Ảnh hưởng của Nguyệt Kiến (Địa Chi Tháng) */
  readonly monthInfluence: {
    readonly monthBranch: string;
    readonly monthElement: Element;
    readonly isSupported: boolean;   // Được sinh hoặc tỷ hòa
    readonly isSuppressed: boolean;  // Bị khắc
    readonly isHarmonious: boolean;  // Nguyệt Hợp
    readonly isClash: boolean;       // Nguyệt Xung (Nguyệt Phá)
    readonly isMonthlyBreak: boolean;// Nguyệt Phá
    readonly description: string;
  };

  /** Các trạng thái đặc thù của Lục Hào */
  readonly specialStates: {
    /** Rơi vào Tuần Không */
    readonly isVoid: boolean;
    /** Phân loại Không Vong: NONE, GIA_KHONG, CHAN_KHONG */
    readonly voidType: VoidStatusType;
    /** Phạm Nguyệt Phá */
    readonly isMonthlyBreak: boolean;
    /** Ám Động: Hào tĩnh nhưng Vượng Tướng gặp Nhật Thần tương xung (xung khởi) */
    readonly isAmDong: boolean;
    /** Nhật Phá: Hào tĩnh Hưu Tù gặp Nhật Thần tương xung */
    readonly isNhatPha: boolean;
    /** Được Nhật Hợp */
    readonly isNhatHop: boolean;
    /** Được Nguyệt Hợp */
    readonly isNguyetHop: boolean;
  };

  /** Quan hệ với 5 hào còn lại trong quẻ */
  readonly interYaoRelations: readonly InterYaoRelation[];

  /** Danh sách các yếu tố tác động cộng/trừ lực lượng có giải thích nguyên nhân */
  readonly factors: readonly StrengthFactor[];

  /** Điểm lực lượng tham chiếu (số âm là suy, số dương là vượng) */
  readonly score: number;

  /** Mức độ thực lực nội tại tổng hợp */
  readonly overallLevel: StrengthLevel;

  /** Tên tiếng Việt của mức độ thực lực ("Rất vượng", "Vượng", "Bình hòa", "Suy", "Rất suy") */
  readonly overallLevelName: string;

  /** Đoạn phân tích giải thích nguyên nhân khách quan, mạch lạc */
  readonly reasoning: string;
}

/**
 * Kết quả phân tích lực lượng 6 hào hoàn chỉnh cho một Quẻ
 */
export interface HexagramStrengthResult {
  /** Phiên bản bộ quy tắc đánh giá lực lượng */
  readonly ruleVersion: 'YAO-STRENGTH-V1';

  /** Tài liệu đối chiếu kinh điển */
  readonly sourceReference: string;

  /** Thông tin ngày và tháng làm căn cứ */
  readonly calendarContext: {
    readonly dayCanChi: string;
    readonly dayBranch: string;
    readonly dayElement: Element;
    readonly monthCanChi: string;
    readonly monthBranch: string;
    readonly monthElement: Element;
    readonly voidBranches: readonly [string, string];
    readonly monthlyBreakBranch: string;
  };

  /** Danh sách 6 hào đã phân tích đầy đủ từ dưới lên (Hào 1 đến Hào 6) */
  readonly lines: readonly [
    LineStrengthAnalysis,
    LineStrengthAnalysis,
    LineStrengthAnalysis,
    LineStrengthAnalysis,
    LineStrengthAnalysis,
    LineStrengthAnalysis,
  ];

  /** Các cấu trúc Tam Hợp Cục phát hiện trong 6 hào (nếu có) */
  readonly threeHarmonies: readonly ThreeHarmonyFormation[];

  /** Tóm lược phân tích tương quan lực lượng tổng thể */
  readonly summary: {
    readonly dominantElement: Element;
    readonly dominantElementName: string;
    readonly strongestLinePosition: LinePosition;
    readonly weakestLinePosition: LinePosition;
    readonly summaryText: string;
  };
}

/**
 * Thông tin một hào đầu vào cho động cơ phân tích lực lượng
 */
export interface InputYaoForStrengthAnalysis {
  readonly position: LinePosition;
  readonly branch: string;
  readonly stem?: string;
  readonly element?: Element;
  readonly isMoving?: boolean;
  readonly sixRelation?: SixRelation;
}

/**
 * Tham số đầu vào cho động cơ phân tích lực lượng Lục Hào
 */
export interface CalculateYaoStrengthParams {
  /** Can Chi ngày (ví dụ: "Giáp Tý") */
  readonly dayCanChi: string | { stem: string; branch: string };

  /** Can Chi tháng (ví dụ: "Bính Thân") */
  readonly monthCanChi: string | { stem: string; branch: string };

  /**
   * Danh sách 6 hào của quẻ
   */
  readonly lines?: readonly InputYaoForStrengthAnalysis[];

  /**
   * Hoặc truyền mã quái Thượng / Hạ quái để tự động sinh 6 hào Nạp Giáp
   */
  readonly lowerTrigramCode?: string;
  readonly upperTrigramCode?: string;

  /** Vị trí các hào động (1 đến 6) nếu có */
  readonly movingLineIndices?: readonly LinePosition[];

  /** Cung quẻ (để gán Lục Thân nếu cần) */
  readonly palaceElement?: Element;
  readonly hexagramNumber?: number;
}
