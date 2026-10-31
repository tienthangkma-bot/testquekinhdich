import { IDivinationRepository } from '@kindich/domain';
import { DexieDivinationRepository } from '@kindich/database';
import {
  ISqliteDatabase,
  SqliteDivinationRepository,
  openDesktopSqliteDatabase,
  runMigrations,
} from '../database';

let repositoryInstance: IDivinationRepository | null = null;
let databaseInstance: ISqliteDatabase | null = null;
let initPromise: Promise<IDivinationRepository> | null = null;

/**
 * Kiểm tra xem ứng dụng có đang chạy trong môi trường WebView của Tauri Desktop hay không
 */
export function isTauriEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  );
}

/**
 * Khởi tạo cơ sở dữ liệu SQLite cho Desktop Windows
 * Cơ sở dữ liệu được tự động lưu trong thư mục App Data của Windows (%APPDATA%\com.kindich.desktop)
 */
export async function initDesktopSqliteRepository(
  dbName: string = 'kindich_desktop.db'
): Promise<IDivinationRepository> {
  if (repositoryInstance && databaseInstance) return repositoryInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (isTauriEnvironment()) {
        const db = await openDesktopSqliteDatabase(dbName);
        await runMigrations(db);
        databaseInstance = db;
        repositoryInstance = new SqliteDivinationRepository(db);
        return repositoryInstance;
      } else {
        // Fallback sang Dexie khi chạy chế độ dev trên trình duyệt thông thường
        repositoryInstance = new DexieDivinationRepository();
        return repositoryInstance;
      }
    } catch (err) {
      console.warn('Không thể mở SQLite Native trong môi trường này, chuyển sang Dexie:', err);
      repositoryInstance = new DexieDivinationRepository();
      return repositoryInstance;
    }
  })();

  return initPromise;
}

/**
 * Lấy Repository instance dùng chung cho toàn bộ ứng dụng Desktop
 * Tuân thủ nguyên tắc Dependency Inversion: Component chỉ phụ thuộc IDivinationRepository
 */
export function getDivinationRepository(): IDivinationRepository {
  if (!repositoryInstance) {
    if (isTauriEnvironment()) {
      initDesktopSqliteRepository().catch((err) => console.error(err));
    }
    repositoryInstance = new DexieDivinationRepository();
  }
  return repositoryInstance;
}

/**
 * Lấy đối tượng cơ sở dữ liệu SQLite hiện hành (nếu đã kết nối)
 */
export function getDivinationDatabase(): ISqliteDatabase | null {
  return databaseInstance;
}

/**
 * Gán Repository instance (phục vụ unit test và mock)
 */
export function setDivinationRepository(
  repo: IDivinationRepository | null,
  db: ISqliteDatabase | null = null
): void {
  repositoryInstance = repo;
  databaseInstance = db;
  initPromise = null;
}
