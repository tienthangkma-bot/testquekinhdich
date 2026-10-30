import {
  DivinationAnalysisEntity,
  DivinationEntity,
  DivinationNoteEntity,
  DivinationResultEntity,
} from './divination.repository';

/**
 * Cấu hình người dùng cá nhân (Theme, Phương pháp mặc định, v.v.)
 */
export interface UserSettings {
  readonly defaultRuleSetId?: string;
  readonly defaultAlgorithmVersion?: string;
  readonly defaultMethod?: string;
  readonly theme?: 'light' | 'dark' | 'system';
  readonly autoSaveHistory?: boolean;
  readonly showMovingLineDetails?: boolean;
  readonly language?: string;
  readonly [key: string]: unknown;
}

/**
 * Thực thể lưu trữ cấu hình trong bảng `user_settings`
 */
export interface UserSettingEntity {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt: string;
}

/**
 * Metadata thông tin sao lưu dữ liệu (Requirement 3)
 */
export interface BackupMetadata {
  /** Thời điểm xuất file theo chuẩn ISO 8601 */
  readonly exportedAt: string;

  /** Phiên bản ứng dụng khi xuất */
  readonly appVersion: string;

  /** Phiên bản Schema của Database Dexie tại thời điểm xuất */
  readonly schemaVersion: number;

  /** RuleSet ID mặc định */
  readonly ruleSetId: string;

  /** Algorithm Version mặc định */
  readonly algorithmVersion: string;

  /** Tổng số lượng quẻ đã sao lưu */
  readonly totalDivinations: number;

  /** Tổng số lượng ghi chú đã sao lưu */
  readonly totalNotes: number;
}

/**
 * Cấu trúc chuẩn của File JSON sao lưu (Backup Format)
 */
export interface KinDichBackupData {
  /** Định danh định dạng file sao lưu */
  readonly format: 'KINDICH_BACKUP';

  /** Phiên bản định dạng sao lưu (bắt đầu từ 1) */
  readonly version: number;

  /** Thông tin metadata kèm theo */
  readonly metadata: BackupMetadata;

  /** Cấu hình người dùng cá nhân */
  readonly settings?: UserSettings;

  /** Toàn bộ dữ liệu của các bảng trong cơ sở dữ liệu */
  readonly data: {
    readonly divinations: readonly DivinationEntity[];
    readonly divination_results: readonly DivinationResultEntity[];
    readonly divination_analyses: readonly DivinationAnalysisEntity[];
    readonly divination_notes: readonly DivinationNoteEntity[];
    readonly user_settings?: readonly UserSettingEntity[];
  };
}

/**
 * Kết quả kiểm tra tính hợp lệ của file sao lưu (Requirement 5)
 */
export interface BackupValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly summary?: {
    readonly schemaVersion: number;
    readonly ruleSetId: string;
    readonly algorithmVersion: string;
    readonly totalDivinations: number;
    readonly totalResults: number;
    readonly totalAnalyses: number;
    readonly totalNotes: number;
    readonly totalSettings: number;
    readonly exportedAt: string;
    readonly requiresMigration: boolean;
  };
}

/**
 * Tóm tắt xung đột bản ghi trùng lặp trước khi nhập (Requirement 6)
 */
export interface DuplicateConflictSummary {
  readonly hasConflicts: boolean;
  readonly totalImportDivinations: number;
  readonly newDivinationsCount: number;
  readonly duplicateDivinationsCount: number;
  readonly duplicateIds: readonly string[];
  readonly totalExistingInDb: number;
}

/**
 * Tùy chọn khi nhập dữ liệu khôi phục
 */
export interface ImportOptions {
  /**
   * Chế độ xử lý bản ghi trùng lặp:
   * - 'overwrite': Ghi đè bản ghi trùng bằng dữ liệu trong file sao lưu
   * - 'skip': Bỏ qua bản ghi trùng, chỉ thêm các bản ghi mới
   */
  readonly mode?: 'overwrite' | 'skip';
}

/**
 * Kết quả tổng kết sau khi khôi phục dữ liệu
 */
export interface ImportSummary {
  readonly success: boolean;
  readonly importedDivinations: number;
  readonly overwrittenDivinations: number;
  readonly skippedDivinations: number;
  readonly importedResults: number;
  readonly importedAnalyses: number;
  readonly importedNotes: number;
  readonly importedSettings: number;
  readonly errors: readonly string[];
}
