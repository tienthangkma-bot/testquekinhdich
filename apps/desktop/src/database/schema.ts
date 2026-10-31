import { ISqliteDatabase, Migration } from './sqlite.types';

export const LATEST_DATABASE_VERSION = 2;

/**
 * Danh sách các migrations cho cơ sở dữ liệu SQLite Mobile
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: '001_initial_schema',
    up: async (db: ISqliteDatabase) => {
      // 1. Bảng divinations
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS divinations (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          method TEXT NOT NULL,
          algorithm_version TEXT NOT NULL,
          rule_set_id TEXT NOT NULL,
          input TEXT NOT NULL,
          date_time_info TEXT NOT NULL,
          question TEXT,
          inquiry_type TEXT,
          tags TEXT,
          starred INTEGER NOT NULL DEFAULT 0,
          result_snapshot TEXT
        );
      `);

      // 2. Bảng divination_results
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS divination_results (
          id TEXT PRIMARY KEY,
          divination_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          primary_hexagram_number INTEGER NOT NULL,
          primary_hexagram_name TEXT NOT NULL,
          primary_hexagram_sino_vietnamese_name TEXT,
          changing_hexagram_number INTEGER,
          changing_hexagram_name TEXT,
          changing_hexagram_sino_vietnamese_name TEXT,
          nuclear_hexagram_number INTEGER,
          nuclear_hexagram_name TEXT,
          moving_lines TEXT NOT NULL,
          trio TEXT NOT NULL,
          FOREIGN KEY (divination_id) REFERENCES divinations(id) ON DELETE CASCADE
        );
      `);

      // 3. Bảng divination_analyses
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS divination_analyses (
          id TEXT PRIMARY KEY,
          divination_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          rule_set_id TEXT NOT NULL,
          algorithm_version TEXT NOT NULL,
          palace_id TEXT NOT NULL,
          palace_element TEXT NOT NULL,
          world_line INTEGER NOT NULL,
          response_line INTEGER NOT NULL,
          summary TEXT,
          details TEXT NOT NULL,
          FOREIGN KEY (divination_id) REFERENCES divinations(id) ON DELETE CASCADE
        );
      `);

      // 4. Bảng divination_notes
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS divination_notes (
          id TEXT PRIMARY KEY,
          divination_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          content TEXT NOT NULL,
          actual_outcome TEXT,
          is_verified INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (divination_id) REFERENCES divinations(id) ON DELETE CASCADE
        );
      `);

      // 5. Các Indexes ban đầu
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_divinations_created_at ON divinations(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_divinations_method ON divinations(method);
        CREATE INDEX IF NOT EXISTS idx_divinations_inquiry_type ON divinations(inquiry_type);
        CREATE INDEX IF NOT EXISTS idx_divination_results_divination_id ON divination_results(divination_id);
        CREATE INDEX IF NOT EXISTS idx_divination_analyses_divination_id ON divination_analyses(divination_id);
        CREATE INDEX IF NOT EXISTS idx_divination_notes_divination_id ON divination_notes(divination_id);
      `);
    },
    down: async (db: ISqliteDatabase) => {
      await db.execAsync(`
        DROP TABLE IF EXISTS divination_notes;
        DROP TABLE IF EXISTS divination_analyses;
        DROP TABLE IF EXISTS divination_results;
        DROP TABLE IF EXISTS divinations;
      `);
    },
  },
  {
    version: 2,
    name: '002_add_compound_and_starred_indexes',
    up: async (db: ISqliteDatabase) => {
      // Bổ sung compound indexes cho tìm kiếm và lọc lịch sử nhanh
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_divinations_method_created ON divinations(method, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_divinations_rule_set_created ON divinations(rule_set_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_divinations_starred ON divinations(starred);
        CREATE INDEX IF NOT EXISTS idx_divination_notes_created ON divination_notes(divination_id, created_at ASC);
      `);
    },
    down: async (db: ISqliteDatabase) => {
      await db.execAsync(`
        DROP INDEX IF EXISTS idx_divinations_method_created;
        DROP INDEX IF EXISTS idx_divinations_rule_set_created;
        DROP INDEX IF EXISTS idx_divinations_starred;
        DROP INDEX IF EXISTS idx_divination_notes_created;
      `);
    },
  },
];
