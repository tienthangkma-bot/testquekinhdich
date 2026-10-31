import { ISqliteDatabase } from './sqlite.types';

/**
 * Driver Adapter chuyển đổi từ better-sqlite3 sang interface ISqliteDatabase (Dùng cho Unit/Integration Tests trong Node/Vitest)
 */
export function createBetterSqliteDriver(betterDb: any): ISqliteDatabase {
  return {
    async execAsync(sql: string): Promise<void> {
      betterDb.exec(sql);
    },
    async runAsync(sql: string, params: unknown[] = []): Promise<{ lastInsertRowId?: number; changes: number }> {
      const stmt = betterDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        lastInsertRowId: Number(info.lastInsertRowid),
        changes: info.changes,
      };
    },
    async getAllAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
      const stmt = betterDb.prepare(sql);
      const rows = stmt.all(...params);
      return rows as T[];
    },
    async getFirstAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
      const stmt = betterDb.prepare(sql);
      const row = stmt.get(...params);
      return (row as T) ?? null;
    },
    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      betterDb.exec('BEGIN IMMEDIATE;');
      try {
        const result = await task();
        betterDb.exec('COMMIT;');
        return result;
      } catch (err) {
        betterDb.exec('ROLLBACK;');
        throw err;
      }
    },
    async closeAsync(): Promise<void> {
      betterDb.close();
    },
  };
}
