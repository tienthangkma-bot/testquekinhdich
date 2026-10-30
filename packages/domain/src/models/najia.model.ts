import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { LinePosition } from './yao.model';

/**
 * Thông tin Nạp Giáp (Can Chi & Ngũ Hành) của một hào cụ thể trong quẻ
 */
export interface NaJiaLine {
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
   * Thiên Can nạp vào hào (ví dụ: "Giáp", "Nhâm", "Bính", "Canh"...)
   */
  readonly stem: string;

  /**
   * Địa Chi nạp vào hào (ví dụ: "Tý", "Dần", "Thìn", "Ngọ"...)
   */
  readonly branch: string;

  /**
   * Ngũ Hành bản thể của Địa Chi (Kim, Mộc, Thủy, Hỏa, Thổ)
   * Đây là cơ sở cốt lõi để tính Lục Thân và quan hệ sinh khắc trong Lục Hào
   */
  readonly element: Element;

  /**
   * Chuỗi ghép đầy đủ Thiên Can + Địa Chi (ví dụ: "Giáp Tý", "Nhâm Ngọ", "Canh Thìn")
   */
  readonly canChi: string;
}

/**
 * Quy tắc Nạp Giáp kinh điển cho một quái đơn trong Bát Quái
 */
export interface TrigramNaJiaRule {
  /**
   * Mã định danh quái (CAN, DOAI, LY, CHAN, TON, KHAM, CAN_SON, KHON)
   */
  readonly trigramCode: TrigramCode;

  /**
   * Tên tiếng Việt của quái (Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn)
   */
  readonly trigramName: string;

  /**
   * Thiên Can nạp cho Nội quái (Hạ quái - hào 1, 2, 3)
   */
  readonly innerStem: string;

  /**
   * Thiên Can nạp cho Ngoại quái (Thượng quái - hào 4, 5, 6)
   */
  readonly outerStem: string;

  /**
   * Ba Địa Chi của Nội quái từ dưới lên: [hào 1, hào 2, hào 3]
   */
  readonly innerBranches: readonly [string, string, string];

  /**
   * Ba Địa Chi của Ngoại quái từ dưới lên: [hào 4, hào 5, hào 6]
   */
  readonly outerBranches: readonly [string, string, string];

  /**
   * Chi tiết Nạp Giáp 3 hào Nội quái (hào 1, 2, 3)
   */
  readonly innerLines: readonly [NaJiaLine, NaJiaLine, NaJiaLine];

  /**
   * Chi tiết Nạp Giáp 3 hào Ngoại quái (hào 4, 5, 6)
   */
  readonly outerLines: readonly [NaJiaLine, NaJiaLine, NaJiaLine];
}
