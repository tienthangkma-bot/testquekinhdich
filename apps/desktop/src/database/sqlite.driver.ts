import { ISqliteDatabase } from './sqlite.types';

/**
 * Driver Adapter chuyển đổi từ Tauri 2 SQL Plugin sang interface ISqliteDatabase
 */
export function createTauriSqliteDriver(tauriDb: any): ISqliteDatabase {
  return {
    async execAsync(sql: string): Promise<void> {
      // Phân tách các câu lệnh SQL bởi dấu chấm phẩy nếu có nhiều câu lệnh
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await tauriDb.execute(statement + ';');
      }
    },

    async runAsync(sql: string, params: unknown[] = []): Promise<{ lastInsertRowId?: number; changes: number }> {
      // Chuyển đổi tham số '?' sang '$1', '$2', ... để tương thích với sqlx / tauri-plugin-sql
      let paramIndex = 1;
      const normalizedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      const res = await tauriDb.execute(normalizedSql, params);
      return {
        lastInsertRowId: res.lastInsertId,
        changes: res.rowsAffected ?? 0,
      };
    },

    async getAllAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
      let paramIndex = 1;
      const normalizedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      const rows = await tauriDb.select(normalizedSql, params);
      return rows as T[];
    },

    async getFirstAsync<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
      const rows = await this.getAllAsync<T>(sql, params);
      return rows.length > 0 ? (rows[0] as T) : null;
    },

    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      await tauriDb.execute('BEGIN TRANSACTION;');
      try {
        const result = await task();
        await tauriDb.execute('COMMIT;');
        return result;
      } catch (err) {
        await tauriDb.execute('ROLLBACK;');
        throw err;
      }
    },

    async closeAsync(): Promise<void> {
      if (typeof tauriDb.close === 'function') {
        await tauriDb.close();
      }
    },
  };
}

/**
 * Mở cơ sở dữ liệu SQLite cho Desktop Windows (Tauri 2)
 *
 * Đường dẫn 'sqlite:kindich_desktop.db' được Tauri 2 tự động lưu
 * vào thư mục dữ liệu ứng dụng của hệ điều hành Windows:
 * (%APPDATA%\com.kindich.desktop\kindich_desktop.db)
 *
 * @param dbName - Tên tệp cơ sở dữ liệu (mặc định 'kindich_desktop.db')
 */
export async function openDesktopSqliteDatabase(dbName: string = 'kindich_desktop.db'): Promise<ISqliteDatabase> {
  const Database = (await import('@tauri-apps/plugin-sql')).default;
  const tauriDb = await Database.load(`sqlite:${dbName}`);
  return createTauriSqliteDriver(tauriDb);
}
