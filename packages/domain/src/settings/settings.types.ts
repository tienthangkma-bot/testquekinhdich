/**
 * Chế độ giao diện sáng / tối
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Ngôn ngữ hiển thị
 */
export type DisplayLanguage = 'vi' | 'zh' | 'en';

/**
 * Cỡ chữ hiển thị
 */
export type FontSize = 'small' | 'medium' | 'large';

/**
 * Phương pháp lập quẻ mặc định khi mở ứng dụng
 */
export type DefaultCastingMethod = 'serial' | 'time' | 'six-yao';

/**
 * Múi giờ hỗ trợ trong tính toán lịch pháp
 */
export type SupportedTimeZone =
  | 'Asia/Ho_Chi_Minh'
  | 'Asia/Bangkok'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'UTC';

/**
 * Quy tắc chuyển ngày trong Dịch học & Âm lịch
 * - '23:00': Giờ Tý bắt đầu ngày mới (Cổ pháp Dịch học & Tử Vi: từ 23h đêm hôm trước sang ngày Can Chi mới)
 * - '00:00': Nửa đêm dương lịch (Chuyển ngày lúc 0h00 theo lịch hành chính hiện đại)
 */
export type DayTransitionRule = '23:00' | '00:00';

/**
 * Quy tắc tính tháng nhuận
 * - 'TIET_KHI': Dựa vào Trung Khí / Tiết Khí thiên văn học phương Đông
 * - 'TRUYEN_THONG': Theo quy ước Lịch vạn niên truyền thống
 */
export type LeapMonthRule = 'TIET_KHI' | 'TRUYEN_THONG';

/**
 * Nhóm cài đặt giao diện (Requirement 1)
 */
export interface AppearanceSettings {
  readonly theme: ThemeMode;
  readonly language: DisplayLanguage;
  readonly fontSize: FontSize;
}

/**
 * Nhóm cài đặt lập quẻ (Requirement 2)
 */
export interface DivinationSettings {
  readonly defaultMethod: DefaultCastingMethod;
  readonly ruleSetId: string;
  readonly algorithmVersion: string;
}

/**
 * Nhóm cài đặt lịch pháp (Requirement 3)
 */
export interface CalendarSettings {
  readonly timeZone: SupportedTimeZone;
  readonly dayTransitionRule: DayTransitionRule;
  readonly leapMonthRule: LeapMonthRule;
}

/**
 * Thống kê dung lượng lưu trữ cục bộ (Requirement 4)
 */
export interface StorageStats {
  readonly divinationCount: number;
  readonly noteCount: number;
  readonly totalSizeEstimateBytes: number;
  readonly lastBackupDate?: string;
}

/**
 * Cấu hình tổng thể ứng dụng Kinh Dịch
 */
export interface KinhDichSettings {
  readonly version: number;
  readonly appearance: AppearanceSettings;
  readonly divination: DivinationSettings;
  readonly calendar: CalendarSettings;
  readonly updatedAt: string;
}

/**
 * Cấu hình mặc định của hệ thống Kinh Dịch (Requirement 6)
 */
export const DEFAULT_KINHDICH_SETTINGS: KinhDichSettings = {
  version: 1,
  appearance: {
    theme: 'light',
    language: 'vi',
    fontSize: 'medium',
  },
  divination: {
    defaultMethod: 'serial',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    algorithmVersion: 'SERIAL-MOD8-V1',
  },
  calendar: {
    timeZone: 'Asia/Ho_Chi_Minh',
    dayTransitionRule: '23:00',
    leapMonthRule: 'TIET_KHI',
  },
  updatedAt: '2026-10-31T00:00:00.000Z',
};

/**
 * Interface cho Settings Repository (Requirement 5 & 6)
 */
export interface SettingsRepository {
  getSettings(): Promise<KinhDichSettings>;
  saveSettings(partial: Partial<KinhDichSettings>): Promise<KinhDichSettings>;
  resetSettings(): Promise<KinhDichSettings>;
  getStorageStats(): Promise<StorageStats>;
}
