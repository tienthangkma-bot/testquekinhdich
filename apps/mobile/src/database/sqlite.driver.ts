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

/**
 * Mở cơ sở dữ liệu SQLite cho Mobile với fallback an toàn
 *
 * @param dbName - Tên tệp cơ sở dữ liệu (mặc định 'kindich_mobile.db')
 */
export async function openMobileSqliteDatabase(dbName: string = 'kindich_mobile.db'): Promise<ISqliteDatabase> {
  // Môi trường Node.js / Vitest
  if (typeof navigator === 'undefined' || !navigator.product || navigator.product !== 'ReactNative') {
    try {
      const BetterSqlite = require('better-sqlite3');
      const inMemory = dbName === ':memory:' || process.env.NODE_ENV === 'test';
      const rawDb = new BetterSqlite(inMemory ? ':memory:' : dbName);
      return createBetterSqliteDriver(rawDb);
    } catch {
      // Fall through nếu không load được better-sqlite3
    }
  }

  // Môi trường React Native / Expo
  try {
    const SQLite = require('expo-sqlite');
    const expoDb = await SQLite.openDatabaseAsync(dbName);
    return createExpoSqliteDriver(expoDb);
  } catch (err) {
    throw new Error(
      `Không thể mở cơ sở dữ liệu SQLite: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
