import { Trigram } from './trigram.model';
import { HexagramLines, LinePosition, RawHexagramValues } from './yao.model';
import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';

/**
 * Thứ bậc biến hóa của quẻ trong Bát Cung:
 * - BAN_CUNG: Quẻ gốc / Thuần quái (Thế hào 6, Ứng hào 3)
 * - NHAT_THE: Biến hào 1 (Thế hào 1, Ứng hào 4)
 * - NHI_THE: Biến hào 2 (Thế hào 2, Ứng hào 5)
 * - TAM_THE: Biến hào 3 (Thế hào 3, Ứng hào 6)
 * - TU_THE: Biến hào 4 (Thế hào 4, Ứng hào 1)
 * - NGU_THE: Biến hào 5 (Thế hào 5, Ứng hào 2)
 * - DU_HON: Biến lùi hào 4 (Thế hào 4, Ứng hào 1)
 * - QUY_HON: Biến lùi cả 3 hào dưới (Thế hào 3, Ứng hào 6)
 */
export enum PalaceGeneration {
  BAN_CUNG = 'BAN_CUNG',
  NHAT_THE = 'NHAT_THE',
  NHI_THE = 'NHI_THE',
  TAM_THE = 'TAM_THE',
  TU_THE = 'TU_THE',
  NGU_THE = 'NGU_THE',
  DU_HON = 'DU_HON',
  QUY_HON = 'QUY_HON',
}

/**
 * Mô hình một Quẻ trong 64 quẻ Kinh Dịch (Đại Tượng)
 */
export interface Hexagram {
  /**
   * Số thứ tự quẻ theo trình tự Văn Vương (1 đến 64)
   * 1 = Thuần Càn, 2 = Thuần Khôn, ..., 64 = Hỏa Thủy Vị Tế
   */
  readonly number: number;

  /**
   * Tên quẻ tiếng Việt (ví dụ: "Thuần Càn", "Thiên Địa Bĩ", "Hỏa Lôi Phệ Hạp")
   */
  readonly name: string;

  /**
   * Tên quẻ chữ Hán (ví dụ: "乾為天", "天地否", "火雷噬嗑")
   */
  readonly chineseName: string;

  /**
   * Ký tự biểu tượng Unicode của quẻ 6 hào (䷀ đến ䷿)
   */
  readonly symbol: string;

  /**
   * Thượng quái (Quẻ ngoại / Quẻ trên, gồm hào 4, 5, 6)
   */
  readonly upperTrigram: Trigram;

  /**
   * Hạ quái (Quẻ nội / Quẻ dưới, gồm hào 1, 2, 3)
   */
  readonly lowerTrigram: Trigram;

  /**
   * Cấu trúc 6 hào đầy đủ, lưu từ dưới lên (index 0 = hào 1, index 5 = hào 6)
   */
  readonly lines: HexagramLines;

  /**
   * Dãy giá trị nhị phân thô của 6 hào từ dưới lên (0 = Âm, 1 = Dương)
   */
  readonly rawValues: RawHexagramValues;

  /**
   * Quẻ thuộc Cung nào trong Bát Cung (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài)
   */
  readonly palace: TrigramCode;

  /**
   * Ngũ Hành của Bát Cung mà quẻ trực thuộc (Kim, Mộc, Thủy, Hỏa, Thổ)
   */
  readonly palaceElement: Element;

  /**
   * Thứ bậc của quẻ trong Cung (Bản cung, Nhất thế... Quy hồn)
   */
  readonly generation: PalaceGeneration;

  /**
   * Vị trí hào Thế trong quẻ (tính từ dưới lên: 1 đến 6)
   */
  readonly worldLine: LinePosition;

  /**
   * Vị trí hào Ứng trong quẻ (tính từ dưới lên: 1 đến 6)
   */
  readonly responseLine: LinePosition;

  /**
   * Thoán từ / Lời thoán tóm lược ý nghĩa quẻ (tùy chọn)
   */
  readonly judgement?: string;
}

/**
 * Bộ 3 Quẻ hoàn chỉnh sau khi lập quẻ:
 * 1. Quẻ Chủ (Quẻ chính ban đầu)
 * 2. Quẻ Biến (Quẻ sau khi các hào động đổi cực âm <-> dương)
 * 3. Quẻ Hỗ (Quẻ tương hỗ, lấy hào 2,3,4 làm hạ quái; 3,4,5 làm thượng quái của quẻ chủ)
 */
export interface HexagramTrio {
  /**
   * Quẻ Chủ (Quẻ nguyên thủy xác lập từ phương pháp gieo)
   */
  readonly primary: Hexagram;

  /**
   * Quẻ Biến (Sinh ra do hào động biến đổi; nếu không có hào động thì bằng Quẻ Chủ)
   */
  readonly transformed: Hexagram;

  /**
   * Quẻ Hỗ (Nội hỗ và ngoại hỗ phản ánh quá trình trung gian phát triển của sự việc)
   */
  readonly nuclear: Hexagram;

  /**
   * Danh sách các vị trí hào động (1 đến 6, từ dưới lên)
   */
  readonly movingLineIndices: readonly LinePosition[];

  /**
   * Cờ đánh dấu có hào động hay không
   */
  readonly hasMovingLines: boolean;
}
