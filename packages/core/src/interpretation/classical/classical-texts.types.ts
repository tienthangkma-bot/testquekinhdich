import { LinePosition } from '@kindich/domain';

/**
 * Phiên bản dữ liệu kinh điển Chu Dịch
 */
export const CLASSICAL_TEXT_VERSION = 'CLASSICAL-ZHOUYI-V1';

/**
 * Danh mục nguồn tham khảo nguyên bản cổ điển
 */
export const CLASSICAL_SOURCES = [
  'Chu Dịch Thập Dực (Chu Văn Vương, Chu Công, Khổng Tử)',
  'Kinh Dịch - Đạo của người quân tử (Nguyễn Hiến Lê, NXB Văn học)',
  'Kinh Dịch diễn giải (Phan Bội Châu)',
  'Chu Dịch Bản Nghĩa (Chu Hi)',
] as const;

/**
 * Cấu trúc một đoạn văn bản cổ điển có đối chiếu Hán văn, phiên âm và bản dịch
 */
export interface ClassicalSnippet {
  /** Văn bản chữ Hán nguyên bản (ví dụ: "元亨利貞") */
  readonly chinese: string;
  /** Phiên âm Hán Việt (ví dụ: "Nguyên hanh lợi trinh") */
  readonly sinoVietnamese: string;
  /** Dịch nghĩa cổ điển sát nguyên văn */
  readonly translation: string;
  /** Giải thích hiện đại / ý nghĩa biểu trưng */
  readonly modernExplanation: string;
  /** Nguồn trích dẫn cụ thể */
  readonly source: string;
  /** Phiên bản dữ liệu */
  readonly version: string;
}

/**
 * Lời hào cổ điển (gồm Hào từ của Chu Công và Tiểu Tượng của Khổng Tử)
 */
export interface ClassicalLineStatement {
  /** Vị trí hào (1 đến 6 từ dưới lên) */
  readonly position: LinePosition;
  /** Tên định danh hào (ví dụ: "Sơ Cửu", "Lục Nhị", "Cửu Tam", "Lục Tứ", "Cửu Ngũ", "Thượng Lục") */
  readonly lineName: string;
  /** Hào từ của Chu Công */
  readonly haoTu: ClassicalSnippet;
  /** Tiểu Tượng truyện của Khổng Tử (nếu có) */
  readonly tieuTuong?: ClassicalSnippet;
  readonly source: string;
  readonly version: string;
}

/**
 * Dữ liệu kinh điển hoàn chỉnh của một Quẻ
 */
export interface ClassicalHexagramData {
  readonly hexagramNumber: number; // 1 đến 64
  readonly hexagramName: string; // ví dụ: "Thuần Càn", "Thuần Khôn"
  readonly sinoVietnameseName: string; // ví dụ: "Càn vi Thiên"
  readonly chineseName: string; // ví dụ: "乾為天"
  /** Thoán từ (Văn Vương) */
  readonly thuanTu: ClassicalSnippet;
  /** Đại Tượng truyện (Khổng Tử) */
  readonly daiTuong: ClassicalSnippet;
  /** Lời 6 hào (1 đến 6) */
  readonly lines: readonly ClassicalLineStatement[];
  /** Dụng Cửu (cho Càn) hoặc Dụng Lục (cho Khôn) nếu có */
  readonly specialLine?: ClassicalSnippet;
  readonly source: string;
  readonly version: string;
}

/**
 * Trạng thái tra cứu văn bản kinh điển
 */
export type ClassicalLookupResult =
  | {
      readonly status: 'AVAILABLE';
      readonly data: ClassicalHexagramData;
      readonly hasVerifiedContent: true;
    }
  | {
      readonly status: 'MISSING';
      readonly hexagramNumber: number;
      readonly message: string;
      readonly hasVerifiedContent: false;
    };
