import { HeavenlyStem, EarthlyBranch, ZodiacAnimal } from '../constants';

/**
 * Ngày Dương lịch (Gregorian Calendar)
 */
export interface SolarDate {
  readonly day: number;   // 1 đến 31
  readonly month: number; // 1 đến 12
  readonly year: number;  // ví dụ: 2026
}

/**
 * Thời gian Dương lịch
 */
export interface SolarTime {
  readonly hour: number;   // 0 đến 23
  readonly minute: number; // 0 đến 59
  readonly second?: number;// 0 đến 59
}

/**
 * Ngày Âm lịch Việt Nam (Vietnamese Lunar Calendar)
 */
export interface LunarDate {
  readonly day: number;         // 1 đến 30
  readonly month: number;       // 1 đến 12
  readonly year: number;        // Năm âm lịch (ví dụ: 2026)
  readonly isLeap: boolean;     // Có phải tháng nhuận hay không
  readonly monthLength?: number;// Số ngày trong tháng âm lịch (29 hoặc 30 ngày)
}

/**
 * Bộ cặp Can Chi (Hoa Giáp)
 */
export interface CanChi {
  readonly stem: HeavenlyStem;
  readonly branch: EarthlyBranch;
  readonly name: string; // Ghép Can + Chi, ví dụ: "Bính Ngọ", "Giáp Thìn"
}

/**
 * Thông tin chi tiết một giờ trong 12 Địa Chi giờ
 */
export interface HourBranchInfo {
  /** Chỉ số địa chi từ 0 (Tý) đến 11 (Hợi) */
  readonly index: number;
  /** Tên Địa Chi (Tý, Sửu, Dần...) */
  readonly branch: EarthlyBranch;
  /** Khung giờ Dương lịch tương ứng (ví dụ: "23:00 – 00:59", "01:00 – 02:59") */
  readonly range: string;
  /** Giờ Hoàng Đạo (true) hay Hắc Đạo (false) */
  readonly isAuspicious: boolean;
  /** Can Chi của giờ (ví dụ: "Bính Tý", "Đinh Sửu") */
  readonly canChi: string;
}

/**
 * Quy tắc chuyển ngày âm lịch tại thời điểm 23:00 (Giờ Tý):
 * - 'MIDNIGHT': Chuyển ngày lúc 00:00 (theo lịch hành chính dân dụng).
 * - 'RAT_HOUR_23': Chuyển ngày lúc 23:00 (theo cổ pháp Dịch học / Mai Hoa / Tử Vi: 23:00 bắt đầu giờ Tý của ngày mới).
 */
export type DayTransitionRule = 'MIDNIGHT' | 'RAT_HOUR_23';

/**
 * Cấu hình tùy chọn khi tính toán lịch
 */
export interface CalendarOptions {
  /** Quy tắc chuyển mốc ngày khi vào giờ Tý (mặc định: 'RAT_HOUR_23' cho Dịch học) */
  readonly dayTransition?: DayTransitionRule;
  /** Múi giờ tính toán (mặc định: 7 - UTC+7 Asia/Ho_Chi_Minh) */
  readonly timeZoneOffset?: number;
}

/**
 * Kết quả tính toán và chuyển đổi lịch toàn diện
 */
export interface CalendarConversionResult {
  /** Phiên bản bộ quy tắc lịch */
  readonly algorithmVersion: 'VN-LUNAR-V1';
  /** Múi giờ áp dụng */
  readonly timeZone: 'Asia/Ho_Chi_Minh';
  /** Ngày giờ Dương lịch */
  readonly solar: {
    readonly day: number;
    readonly month: number;
    readonly year: number;
    readonly hour: number;
    readonly minute: number;
    readonly weekday: string;      // "Thứ Hai", "Chủ Nhật"...
    readonly weekdayIndex: number; // 0 = Chủ Nhật, 1 = Thứ Hai...
  };
  /** Ngày Âm lịch Việt Nam */
  readonly lunar: {
    readonly day: number;
    readonly month: number;
    readonly year: number;
    readonly isLeap: boolean;
    readonly monthLength: number;
  };
  /** Bộ Can Chi 4 trụ (Năm, Tháng, Ngày, Giờ) */
  readonly canChi: {
    readonly year: string;  // Can Chi Năm (ví dụ: "Bính Ngọ")
    readonly month: string; // Can Chi Tháng (ví dụ: "Mậu Tuất")
    readonly day: string;   // Can Chi Ngày - Nhật Thần (ví dụ: "Ất Mão")
    readonly hour: string;  // Can Chi Giờ (ví dụ: "Bính Tý")
  };
  /** Tên con giáp của năm âm lịch (ví dụ: "Ngựa", "Rồng", "Mèo") */
  readonly zodiacAnimal: ZodiacAnimal;
  /** Thông tin chi tiết Địa Chi giờ hiện tại */
  readonly currentHourBranch: HourBranchInfo;
  /** Danh sách toàn bộ 12 giờ trong ngày với trạng thái Hoàng Đạo / Hắc Đạo */
  readonly allHourBranches: readonly HourBranchInfo[];
  /** Tiết khí thiên văn hiện tại (nếu có) */
  readonly solarTerm?: {
    readonly name: string;
    readonly index: number;
  };
}
