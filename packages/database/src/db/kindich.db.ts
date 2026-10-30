import { Dexie, type EntityTable, type DexieOptions } from 'dexie';
import {
  DivinationEntity,
  DivinationResultEntity,
  DivinationAnalysisEntity,
  DivinationNoteEntity,
} from '@kindich/domain';

/**
 * Tên cơ sở dữ liệu IndexedDB mặc định
 */
export const DEFAULT_DB_NAME = 'kindich_db';

/**
 * Lớp quản trị cơ sở dữ liệu IndexedDB bằng Dexie cho ứng dụng Kinh Dịch (offline-first)
 * Hỗ trợ lưu trữ thông tin quẻ, kết quả, phân tích Lục Hào, snapshot bất biến và ghi chú nghiệm lý.
 */
export class KinDichDatabase extends Dexie {
  divinations!: EntityTable<DivinationEntity, 'id'>;
  divination_results!: EntityTable<DivinationResultEntity, 'id'>;
  divination_analyses!: EntityTable<DivinationAnalysisEntity, 'id'>;
  divination_notes!: EntityTable<DivinationNoteEntity, 'id'>;

  constructor(dbName: string = DEFAULT_DB_NAME, options?: DexieOptions) {
    super(dbName, options);

    // Phiên bản 1: Cấu trúc cơ sở ban đầu
    this.version(1).stores({
      divinations: 'id, createdAt, updatedAt, method, inquiryType, [method+createdAt], *tags',
      divination_results: 'id, divinationId, primaryHexagramNumber, changingHexagramNumber, [divinationId+createdAt]',
      divination_analyses: 'id, divinationId, ruleSetId, algorithmVersion, palaceId',
      divination_notes: 'id, divinationId, createdAt, updatedAt, [divinationId+createdAt]',
    });

    // Phiên bản 2: Bổ sung chỉ mục ruleSetId, compound index [ruleSetId+createdAt] cùng migration logic
    this.version(2).stores({
      divinations: 'id, createdAt, updatedAt, method, ruleSetId, inquiryType, [method+createdAt], [ruleSetId+createdAt], *tags',
      divination_results: 'id, divinationId, primaryHexagramNumber, changingHexagramNumber, [divinationId+createdAt]',
      divination_analyses: 'id, divinationId, ruleSetId, algorithmVersion, palaceId, [divinationId+ruleSetId]',
      divination_notes: 'id, divinationId, createdAt, updatedAt, [divinationId+createdAt]',
    }).upgrade(async (tx) => {
      // Logic migration: điền giá trị mặc định cho ruleSetId, starred và isVerified cho bản ghi cũ
      await tx.table('divinations').toCollection().modify((record) => {
        if ((record as Record<string, unknown>).ruleSetId === undefined) {
          (record as Record<string, unknown>).ruleSetId = 'BO_PHE_CHINH_TONG_V1';
        }
        if ((record as Record<string, unknown>).starred === undefined) {
          (record as Record<string, unknown>).starred = false;
        }
      });
      await tx.table('divination_notes').toCollection().modify((note) => {
        if ((note as Record<string, unknown>).isVerified === undefined) {
          (note as Record<string, unknown>).isVerified = false;
        }
      });
    });
  }
}

/**
 * Singleton instance của cơ sở dữ liệu cho môi trường Web runtime
 */
let dbInstance: KinDichDatabase | null = null;

/**
 * Lấy instance cơ sở dữ liệu Dexie
 */
export function getKinDichDatabase(dbName?: string, options?: DexieOptions): KinDichDatabase {
  if (dbName || options) {
    return new KinDichDatabase(dbName, options);
  }
  if (!dbInstance) {
    dbInstance = new KinDichDatabase();
  }
  return dbInstance;
}

/**
 * Đóng và dọn dẹp kết nối cơ sở dữ liệu (phục vụ test)
 */
export async function closeKinDichDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
