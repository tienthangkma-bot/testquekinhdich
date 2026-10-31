import { ISqliteDatabase } from './sqlite.types';
import { MIGRATIONS, LATEST_DATABASE_VERSION } from './schema';

export interface MigrationHistoryRow {
  version: number;
  name: string;
  applied_at: string;
}

/**
 * Khởi tạo bảng lưu vết migrations
 */
async function ensureMigrationsTable(db: ISqliteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

/**
 * Lấy danh sách các phiên bản migration đã áp dụng
 */
export async function getAppliedMigrationVersions(db: ISqliteDatabase): Promise<number[]> {
  await ensureMigrationsTable(db);
  const rows = await db.getAllAsync<MigrationHistoryRow>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  return rows.map((r) => r.version);
}

/**
 * Lấy phiên bản database hiện tại
 */
export async function getCurrentDatabaseVersion(db: ISqliteDatabase): Promise<number> {
  const versions = await getAppliedMigrationVersions(db);
  if (versions.length === 0) return 0;
  return versions[versions.length - 1] ?? 0;
}

/**
 * Thực thi các migrations chưa được áp dụng theo thứ tự tăng dần
 *
 * @param db - Database instance
 * @param targetVersion - Phiên bản đích cần nâng cấp (mặc định là LATEST_DATABASE_VERSION)
 * @returns Phiên bản hiện tại sau khi chạy migration
 */
export async function runMigrations(
  db: ISqliteDatabase,
  targetVersion: number = LATEST_DATABASE_VERSION
): Promise<number> {
  await ensureMigrationsTable(db);
  const appliedVersions = new Set(await getAppliedMigrationVersions(db));

  // Kích hoạt foreign keys trong SQLite
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const pendingMigrations = MIGRATIONS.filter(
    (m) => m.version <= targetVersion && !appliedVersions.has(m.version)
  ).sort((a, b) => a.version - b.version);

  for (const migration of pendingMigrations) {
    await db.withTransactionAsync(async () => {
      // 1. Thực thi thay đổi schema
      await migration.up(db);

      // 2. Ghi nhận vào bảng schema_migrations
      const now = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [migration.version, migration.name, now]
      );
    });
  }

  return getCurrentDatabaseVersion(db);
}
