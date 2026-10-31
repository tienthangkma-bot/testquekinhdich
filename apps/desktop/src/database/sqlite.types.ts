/**
 * Interface trừu tượng hóa cho các thao tác SQLite
 * Tương thích trực tiếp với Expo SQLite (SQLiteDatabase) và Node better-sqlite3 driver
 */
export interface ISqliteDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: unknown[]): Promise<{ lastInsertRowId?: number; changes: number }>;
  getAllAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  getFirstAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  withTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
  closeAsync?(): Promise<void>;
}

/**
 * Định nghĩa một bản ghi migration
 */
export interface Migration {
  readonly version: number;
  readonly name: string;
  up(db: ISqliteDatabase): Promise<void>;
  down?(db: ISqliteDatabase): Promise<void>;
}

/**
 * Cấu trúc hàng (Row) trong bảng `divinations`
 */
export interface DivinationRow {
  id: string;
  created_at: string;
  updated_at: string;
  method: string;
  algorithm_version: string;
  rule_set_id: string;
  input: string; // JSON string
  date_time_info: string; // JSON string
  question: string | null;
  inquiry_type: string | null;
  tags: string | null; // JSON array string
  starred: number; // 0 hoặc 1
  result_snapshot: string | null; // JSON string
}

/**
 * Cấu trúc hàng trong bảng `divination_results`
 */
export interface DivinationResultRow {
  id: string;
  divination_id: string;
  created_at: string;
  primary_hexagram_number: number;
  primary_hexagram_name: string;
  primary_hexagram_sino_vietnamese_name: string | null;
  changing_hexagram_number: number | null;
  changing_hexagram_name: string | null;
  changing_hexagram_sino_vietnamese_name: string | null;
  nuclear_hexagram_number: number | null;
  nuclear_hexagram_name: string | null;
  moving_lines: string; // JSON array string
  trio: string; // JSON string
}

/**
 * Cấu trúc hàng trong bảng `divination_analyses`
 */
export interface DivinationAnalysisRow {
  id: string;
  divination_id: string;
  created_at: string;
  rule_set_id: string;
  algorithm_version: string;
  palace_id: string;
  palace_element: string;
  world_line: number;
  response_line: number;
  summary: string | null;
  details: string; // JSON string
}

/**
 * Cấu trúc hàng trong bảng `divination_notes`
 */
export interface DivinationNoteRow {
  id: string;
  divination_id: string;
  created_at: string;
  updated_at: string;
  content: string;
  actual_outcome: string | null;
  is_verified: number; // 0 hoặc 1
}
