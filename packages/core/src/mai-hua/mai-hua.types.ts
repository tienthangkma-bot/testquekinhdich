import { HexagramTrio, LinePosition, Trigram } from '@kindich/domain';
import { EarthlyBranch } from '@kindich/calendar';

/**
 * Tên 12 Địa Chi theo quy ước văn hóa Việt Nam
 */
export type EarthlyBranchName = EarthlyBranch;

/**
 * Dữ liệu đầu vào Âm lịch phục vụ lập quẻ Mai Hoa Dịch Số
 */
export interface MaiHuaLunarInput {
  /**
   * Địa chi năm:
   * - Số từ 1 (Tý) đến 12 (Hợi), hoặc
   * - Tên Địa Chi (ví dụ: "Ngọ", "Thìn"), hoặc
   * - Năm số (ví dụ: 2026 -> tự động tính chi Ngọ = 7)
   */
  readonly yearBranch: number | EarthlyBranchName;

  /** Tháng âm lịch (1 đến 12) */
  readonly month: number;

  /** Ngày âm lịch (1 đến 30) */
  readonly day: number;

  /**
   * Địa chi giờ:
   * - Số từ 1 (Tý) đến 12 (Hợi), hoặc
   * - Tên Địa Chi (ví dụ: "Tuất", "Tý")
   */
  readonly hourBranch: number | EarthlyBranchName;
}

/**
 * Vị trí quái trong quẻ 6 hào:
 * - UPPER: Thượng quái (Quẻ ngoại / Quẻ trên, hào 4-6)
 * - LOWER: Hạ quái (Quẻ nội / Quẻ dưới, hào 1-3)
 */
export type TrigramRole = 'UPPER' | 'LOWER';

/**
 * Kết quả phân tích Thể / Dụng trong Mai Hoa Dịch Số
 */
export interface TheDungAnalysis {
  /** Thể quái: Quái không chứa hào động (tĩnh, chủ thể) */
  readonly theTrigram: Trigram;

  /** Vị trí của Thể quái ('UPPER' hoặc 'LOWER') */
  readonly thePosition: TrigramRole;

  /** Dụng quái: Quái chứa hào động (động, biến hóa, khách thể) */
  readonly dungTrigram: Trigram;

  /** Vị trí của Dụng quái ('UPPER' hoặc 'LOWER') */
  readonly dungPosition: TrigramRole;

  /** Tóm lược phân tích Thể Dụng */
  readonly summary: string;
}

/**
 * Kết quả chi tiết một lần lập quẻ Mai Hoa Dịch Số
 */
export interface MaiHuaCastingResult {
  /** Phiên bản thuật toán */
  readonly algorithmVersion: 'MAI-HUA-V1';

  /** Phiên bản quy tắc lịch âm dương */
  readonly calendarRuleVersion: 'VN-LUNAR-V1';

  /** Múi giờ sử dụng */
  readonly timeZone: 'Asia/Ho_Chi_Minh';

  /** Thông số đầu vào đã chuẩn hóa */
  readonly input: {
    readonly yearBranchNumber: number;
    readonly yearBranchName: EarthlyBranchName;
    readonly month: number;
    readonly day: number;
    readonly hourBranchNumber: number;
    readonly hourBranchName: EarthlyBranchName;
  };

  /** Tổng tính Thượng quái: (Năm + Tháng + Ngày) */
  readonly upperSum: number;

  /** Tổng tính Hạ quái & Hào động: (Năm + Tháng + Ngày + Giờ) */
  readonly lowerSum: number;

  /** Tổng toàn phần (bằng lowerSum) */
  readonly totalSum: number;

  /** Số Tiên Thiên Thượng quái (1 đến 8) */
  readonly upperTrigramNumber: number;

  /** Số Tiên Thiên Hạ quái (1 đến 8) */
  readonly lowerTrigramNumber: number;

  /** Vị trí Hào Động (1 đến 6) */
  readonly movingLine: LinePosition;

  /** Thượng quái xác định được */
  readonly upperTrigram: Trigram;

  /** Hạ quái xác định được */
  readonly lowerTrigram: Trigram;

  /** Phân tích Thể / Dụng */
  readonly theDung: TheDungAnalysis;

  /** Bộ ba quẻ hoàn chỉnh: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */
  readonly trio: HexagramTrio;
}
