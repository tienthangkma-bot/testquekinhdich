import {
  Element,
  Hexagram,
  LinePosition,
  PalaceGeneration,
  SixRelation,
  TrigramCode,
} from '@kindich/domain';

/**
 * Chi tiết thông tin Lục Thân của một Hào trong quẻ
 */
export interface SixRelationLine {
  /**
   * Vị trí hào trong quẻ (1 đến 6, tính từ dưới lên):
   * - Hào 1: Sơ hào
   * - Hào 2: Nhị hào
   * - Hào 3: Tam hào
   * - Hào 4: Tứ hào
   * - Hào 5: Ngũ hào
   * - Hào 6: Thượng hào
   */
  readonly position: LinePosition;

  /**
   * Thiên Can của hào theo Nạp Giáp (ví dụ: "Giáp", "Nhâm", "Mậu"...)
   */
  readonly stem: string;

  /**
   * Địa Chi của hào theo Nạp Giáp (ví dụ: "Tý", "Dần", "Thìn"...)
   */
  readonly branch: string;

  /**
   * Chuỗi ghép Can Chi của hào (ví dụ: "Giáp Tý", "Nhâm Ngọ")
   */
  readonly canChi: string;

  /**
   * Ngũ Hành bản thể của Địa Chi hào (Kim, Mộc, Thủy, Hỏa, Thổ)
   */
  readonly element: Element;

  /**
   * Mã định danh Lục Thân ổn định, không phụ thuộc ngôn ngữ hiển thị:
   * - HUYNH_DE: Cùng hành với Cung
   * - PHU_MAU: Hào sinh Cung
   * - TU_TON: Cung sinh Hào
   * - THE_TAI: Cung khắc Hào
   * - QUAN_QUY: Hào khắc Cung
   */
  readonly relation: SixRelation;

  /**
   * Tên tiếng Việt của Lục Thân ("Huynh Đệ", "Phụ Mẫu", "Tử Tôn", "Thê Tài", "Quan Quỷ")
   */
  readonly relationName: string;

  /**
   * Nhãn chuẩn kinh điển của hào theo Lục Hào (ví dụ: "Tử Tôn Tý Thủy", "Thê Tài Dần Mộc")
   */
  readonly fullLabel: string;
}

/**
 * Kết quả phân tích Lục Thân hoàn chỉnh cho 6 hào của một Quẻ
 */
export interface HexagramSixRelationsResult {
  /**
   * Số thứ tự của quẻ theo hệ Văn Vương (1 - 64) nếu xác định được
   */
  readonly hexagramNumber?: number;

  /**
   * Mã định danh của quẻ (ví dụ: 'HEX_01') nếu xác định được
   */
  readonly hexagramId?: string;

  /**
   * Tên quẻ tiếng Việt (ví dụ: "Thuần Càn", "Thủy Thiên Nhu") nếu xác định được
   */
  readonly hexagramName?: string;

  /**
   * Mã quái của Cung quẻ (CAN, KHAM, CAN_SON, CHAN, TON, LY, KHON, DOAI)
   */
  readonly palace: TrigramCode;

  /**
   * Tên tiếng Việt của Cung quẻ (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài)
   */
  readonly palaceName: string;

  /**
   * Ngũ Hành của Cung quẻ làm mốc tham chiếu tính Lục Thân
   */
  readonly palaceElement: Element;

  /**
   * Thứ bậc của quẻ trong Cung (Bản cung, Nhất thế... Quy hồn) nếu xác định được
   */
  readonly generation?: PalaceGeneration;

  /**
   * Vị trí hào Thế (1 - 6, từ dưới lên) nếu xác định được
   */
  readonly worldLine?: LinePosition;

  /**
   * Vị trí hào Ứng (1 - 6, từ dưới lên) nếu xác định được
   */
  readonly responseLine?: LinePosition;

  /**
   * Danh sách 6 hào Lục Thân hoàn chỉnh tính từ dưới lên (Hào 1 đến Hào 6)
   */
  readonly lines: readonly [
    SixRelationLine,
    SixRelationLine,
    SixRelationLine,
    SixRelationLine,
    SixRelationLine,
    SixRelationLine,
  ];
}

/**
 * Tham số đầu vào để tính toán Lục Thân cho quẻ
 */
export interface CalculateSixRelationsParams {
  /**
   * Đối tượng Quẻ hoàn chỉnh (Hexagram)
   */
  readonly hexagram?: Hexagram;

  /**
   * Số thứ tự quẻ theo Chu Dịch Văn Vương (1 đến 64)
   */
  readonly hexagramNumber?: number;

  /**
   * Mã định danh quẻ (ví dụ: 'HEX_01')
   */
  readonly hexagramId?: string;

  /**
   * Mã quái của Hạ quái (Nội quái)
   */
  readonly lowerTrigramCode?: TrigramCode | string;

  /**
   * Mã quái của Thượng quái (Ngoại quái)
   */
  readonly upperTrigramCode?: TrigramCode | string;

  /**
   * Cho phép ghi đè Cung quẻ tùy chỉnh
   */
  readonly customPalace?: TrigramCode;

  /**
   * Cho phép ghi đè Ngũ Hành của Cung tham chiếu
   */
  readonly customPalaceElement?: Element;
}
