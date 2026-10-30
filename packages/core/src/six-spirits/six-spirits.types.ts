import { Element, LinePosition, SixSpirit } from '@kindich/domain';

/**
 * Thông tin Lục Thú của một Hào trong quẻ
 */
export interface SixSpiritLine {
  /**
   * Vị trí hào trong quẻ (1 đến 6, đếm từ dưới lên):
   * - Hào 1: Sơ hào
   * - Hào 2: Nhị hào
   * - Hào 3: Tam hào
   * - Hào 4: Tứ hào
   * - Hào 5: Ngũ hào
   * - Hào 6: Thượng hào
   */
  readonly position: LinePosition;

  /**
   * Mã định danh Lục Thú ổn định:
   * THANH_LONG, CHU_TUOC, CAU_TRAN, DANG_XA, BACH_HO, HUYEN_VU
   */
  readonly spirit: SixSpirit;

  /**
   * Tên tiếng Việt của Lục Thú ("Thanh Long", "Chu Tước"...)
   */
  readonly spiritName: string;

  /**
   * Tên chữ Hán của Lục Thú ("青龍", "朱雀"...)
   */
  readonly chineseName: string;

  /**
   * Ngũ Hành bản thể của Lục Thú (Mộc, Hỏa, Thổ, Kim, Thủy)
   */
  readonly element: Element;

  /**
   * Tên tiếng Việt của Ngũ Hành ("Mộc", "Hỏa", "Thổ", "Kim", "Thủy")
   */
  readonly elementName: string;

  /**
   * Phương vị tương ứng của Lục Thú ("Đông", "Nam", "Trung ương", "Tây", "Bắc")
   */
  readonly direction: string;

  /**
   * Tượng trưng / tính chất thần sát ("Cát thần", "Văn thư / Khẩu thiệt"...)
   */
  readonly nature: string;

  /**
   * Mô tả ý nghĩa tượng trưng chi tiết trong phép đoán quẻ Lục Hào
   */
  readonly description: string;
}

/**
 * Kết quả an Lục Thú cho đủ 6 hào của một quẻ
 */
export interface HexagramSixSpiritsResult {
  /**
   * Thiên Can ngày lập quẻ sau khi đã chuẩn hóa (ví dụ: "Giáp", "Ất"...)
   */
  readonly dayStem: string;

  /**
   * Mã Lục Thú khởi đầu tại hào 1
   */
  readonly startingSpirit: SixSpirit;

  /**
   * Tên Lục Thú khởi đầu tại hào 1
   */
  readonly startingSpiritName: string;

  /**
   * Danh sách 6 hào Lục Thú tính từ dưới lên (Hào 1 đến Hào 6)
   */
  readonly lines: readonly [
    SixSpiritLine,
    SixSpiritLine,
    SixSpiritLine,
    SixSpiritLine,
    SixSpiritLine,
    SixSpiritLine,
  ];
}

/**
 * Tham số đầu vào để xác định Lục Thú
 */
export interface CalculateSixSpiritsParams {
  /**
   * Thiên Can của ngày lập quẻ (ví dụ: "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý")
   * Chấp nhận chuỗi Can Chi đầy đủ (ví dụ: "Giáp Tý" -> tự trích xuất "Giáp")
   */
  readonly dayStem: string;
}
