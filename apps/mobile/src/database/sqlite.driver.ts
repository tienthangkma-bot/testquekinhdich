import { ISqliteDatabase } from './sqlite.types';

/**
 * Driver Adapter chuyển đổi từ Expo SQLite (v14/v15) sang interface ISqliteDatabase
 */
export function createExpoSqliteDriver(expoDb: any): ISqliteDatabase {
  return {
    async execAsync(sql: string): Promise<void> {
      await expoDb.execAsync(sql);
    },
    async runAsync(sql: string, params: unknown[] = []): Promise<{ lastInsertRowId?: number; changes: number }> {
      const res = await expoDb.runAsync(sql, params as any[]);
      return {
        lastInsertRowId: res.lastInsertRowId,
        changes: res.changes ?? 0,
      };
    },
    async getAllAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
      const rows = await expoDb.getAllAsync(sql, params as any[]);
      return rows as T[];
    },
    async getFirstAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
      const row = await expoDb.getFirstAsync(sql, params as any[]);
      return (row as T) ?? null;
    },
    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      if (typeof expoDb.withTransactionAsync === 'function') {
        return expoDb.withTransactionAsync(task);
      }
      // Fallback thủ công nếu withTransactionAsync chưa được hỗ trợ
      await expoDb.execAsync('BEGIN TRANSACTION;');
      try {
        const result = await task();
        await expoDb.execAsync('COMMIT;');
        return result;
      } catch (err) {
        await expoDb.execAsync('ROLLBACK;');
        throw err;
      }
    },
    async closeAsync(): Promise<void> {
      if (typeof expoDb.closeAsync === 'function') {
        await expoDb.closeAsync();
      }
    },
  };
}

/**
 * Mở cơ sở dữ liệu SQLite cho Mobile (React Native / Expo)
 *
 * @param dbName - Tên tệp cơ sở dữ liệu (mặc định 'kindich_mobile.db')
 */
export async function openMobileSqliteDatabase(dbName: string = 'kindich_mobile.db'): Promise<ISqliteDatabase> {
  const SQLite = require('expo-sqlite');
  const expoDb = await SQLite.openDatabaseAsync(dbName);
  return createExpoSqliteDriver(expoDb);
}
