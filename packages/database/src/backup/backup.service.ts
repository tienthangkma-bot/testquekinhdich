import {
  DuplicateConflictSummary,
  ImportOptions,
  ImportSummary,
  KinDichBackupData,
  UserSettings,
} from '@kindich/domain';
import { CURRENT_SCHEMA_VERSION, KinDichDatabase } from '../db/kindich.db';
import { normalizeBackupData, validateBackupData } from './backup.validator';

export interface ExportBackupOptions {
  readonly appVersion?: string;
  readonly defaultRuleSetId?: string;
  readonly defaultAlgorithmVersion?: string;
}

/**
 * Xuất toàn bộ dữ liệu cơ sở dữ liệu thành đối tượng KinDichBackupData (Requirement 1, 2, 3)
 */
export async function exportBackup(
  db: KinDichDatabase,
  options?: ExportBackupOptions
): Promise<KinDichBackupData> {
  // Lấy dữ liệu từ tất cả 4 bảng chính cùng bảng cấu hình cá nhân
  const [divinations, results, analyses, notes, userSettingsList] = await Promise.all([
    db.divinations.toArray(),
    db.divination_results.toArray(),
    db.divination_analyses.toArray(),
    db.divination_notes.toArray(),
    db.user_settings.toArray(),
  ]);

  // Chuyển danh sách user_settings thành object cấu hình cá nhân
  const settingsObj: Record<string, unknown> = {};
  for (const s of userSettingsList) {
    settingsObj[s.key] = s.value;
  }

  const defaultRuleSetId = options?.defaultRuleSetId || 'BO_PHE_CHINH_TONG_V1';
  const defaultAlgorithmVersion = options?.defaultAlgorithmVersion || 'SERIAL-MOD8-V1';

  return {
    format: 'KINDICH_BACKUP',
    version: 1,
    metadata: {
      exportedAt: new Date().toISOString(),
      appVersion: options?.appVersion || '1.0.0',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      ruleSetId: defaultRuleSetId,
      algorithmVersion: defaultAlgorithmVersion,
      totalDivinations: divinations.length,
      totalNotes: notes.length,
    },
    settings: settingsObj as UserSettings,
    data: {
      divinations,
      divination_results: results,
      divination_analyses: analyses,
      divination_notes: notes,
      user_settings: userSettingsList,
    },
  };
}

/**
 * Kiểm tra trước các xung đột bản ghi trùng lặp ID trong cơ sở dữ liệu (Requirement 6)
 */
export async function checkImportConflicts(
  db: KinDichDatabase,
  backup: KinDichBackupData
): Promise<DuplicateConflictSummary> {
  const importDivinationIds = backup.data.divinations.map((d) => d.id);
  const totalImportDivinations = importDivinationIds.length;

  if (totalImportDivinations === 0) {
    const totalExistingInDb = await db.divinations.count();
    return {
      hasConflicts: false,
      totalImportDivinations: 0,
      newDivinationsCount: 0,
      duplicateDivinationsCount: 0,
      duplicateIds: [],
      totalExistingInDb,
    };
  }

  // Tìm các bản ghi đã tồn tại trong DB
  const existingMatches = await db.divinations.where('id').anyOf(importDivinationIds).toArray();
  const duplicateIds = existingMatches.map((d) => d.id);
  const duplicateDivinationsCount = duplicateIds.length;
  const newDivinationsCount = totalImportDivinations - duplicateDivinationsCount;
  const totalExistingInDb = await db.divinations.count();

  return {
    hasConflicts: duplicateDivinationsCount > 0,
    totalImportDivinations,
    newDivinationsCount,
    duplicateDivinationsCount,
    duplicateIds,
    totalExistingInDb,
  };
}

/**
 * Khôi phục dữ liệu từ file sao lưu JSON vào cơ sở dữ liệu IndexedDB (Requirement 4, 6, 7)
 */
export async function importBackup(
  db: KinDichDatabase,
  backupData: KinDichBackupData,
  options?: ImportOptions
): Promise<ImportSummary> {
  // 1. Kiểm tra tính hợp lệ trước khi nhập (Requirement 5)
  const validation = validateBackupData(backupData);
  if (!validation.isValid) {
    return {
      success: false,
      importedDivinations: 0,
      overwrittenDivinations: 0,
      skippedDivinations: 0,
      importedResults: 0,
      importedAnalyses: 0,
      importedNotes: 0,
      importedSettings: 0,
      errors: validation.errors,
    };
  }

  // 2. Chuẩn hóa và áp dụng migration cho các phiên bản cũ (Requirement 9)
  const normalized = normalizeBackupData(backupData);
  const mode = options?.mode || 'overwrite';

  try {
    let importedDivinations = 0;
    let overwrittenDivinations = 0;
    let skippedDivinations = 0;
    let importedResults = 0;
    let importedAnalyses = 0;
    let importedNotes = 0;
    let importedSettings = 0;

    await db.transaction(
      'rw',
      [
        db.divinations,
        db.divination_results,
        db.divination_analyses,
        db.divination_notes,
        db.user_settings,
      ],
      async () => {
        if (mode === 'overwrite') {
          // Tìm các bản ghi trùng lặp để đếm số lượng ghi đè
          const importDivIds = normalized.data.divinations.map((d) => d.id);
          const existingMatches = await db.divinations.where('id').anyOf(importDivIds).toArray();
          const existingIdSet = new Set(existingMatches.map((d) => d.id));

          overwrittenDivinations = existingIdSet.size;
          importedDivinations = normalized.data.divinations.length - overwrittenDivinations;

          // Ghi đè toàn bộ (bulkPut)
          if (normalized.data.divinations.length > 0) {
            await db.divinations.bulkPut(normalized.data.divinations);
          }
          if (normalized.data.divination_results.length > 0) {
            await db.divination_results.bulkPut(normalized.data.divination_results);
            importedResults = normalized.data.divination_results.length;
          }
          if (normalized.data.divination_analyses.length > 0) {
            await db.divination_analyses.bulkPut(normalized.data.divination_analyses);
            importedAnalyses = normalized.data.divination_analyses.length;
          }
          if (normalized.data.divination_notes.length > 0) {
            await db.divination_notes.bulkPut(normalized.data.divination_notes);
            importedNotes = normalized.data.divination_notes.length;
          }
        } else {
          // Chế độ 'skip': Chỉ nhập các bản ghi chưa từng có trong DB
          const importDivIds = normalized.data.divinations.map((d) => d.id);
          const existingMatches = await db.divinations.where('id').anyOf(importDivIds).toArray();
          const existingDivIdSet = new Set(existingMatches.map((d) => d.id));

          const newDivinations = normalized.data.divinations.filter(
            (d) => !existingDivIdSet.has(d.id)
          );
          skippedDivinations = existingDivIdSet.size;
          importedDivinations = newDivinations.length;

          if (newDivinations.length > 0) {
            await db.divinations.bulkAdd(newDivinations);
          }

          // Lọc results tương ứng
          const existingResultIds = new Set(
            (await db.divination_results.toArray()).map((r) => r.id)
          );
          const newResults = normalized.data.divination_results.filter(
            (r) => !existingResultIds.has(r.id)
          );
          if (newResults.length > 0) {
            await db.divination_results.bulkAdd(newResults);
            importedResults = newResults.length;
          }

          // Lọc analyses tương ứng
          const existingAnalysisIds = new Set(
            (await db.divination_analyses.toArray()).map((a) => a.id)
          );
          const newAnalyses = normalized.data.divination_analyses.filter(
            (a) => !existingAnalysisIds.has(a.id)
          );
          if (newAnalyses.length > 0) {
            await db.divination_analyses.bulkAdd(newAnalyses);
            importedAnalyses = newAnalyses.length;
          }

          // Lọc notes tương ứng
          const existingNoteIds = new Set((await db.divination_notes.toArray()).map((n) => n.id));
          const newNotes = normalized.data.divination_notes.filter((n) => !existingNoteIds.has(n.id));
          if (newNotes.length > 0) {
            await db.divination_notes.bulkAdd(newNotes);
            importedNotes = newNotes.length;
          }
        }

        // Nhập cấu hình cá nhân nếu có trong file
        if (normalized.data.user_settings && normalized.data.user_settings.length > 0) {
          await db.user_settings.bulkPut(normalized.data.user_settings);
          importedSettings = normalized.data.user_settings.length;
        } else if (normalized.settings && typeof normalized.settings === 'object') {
          const settingEntries = Object.entries(normalized.settings).map(([key, value]) => ({
            key,
            value,
            updatedAt: new Date().toISOString(),
          }));
          if (settingEntries.length > 0) {
            await db.user_settings.bulkPut(settingEntries);
            importedSettings = settingEntries.length;
          }
        }
      }
    );

    return {
      success: true,
      importedDivinations,
      overwrittenDivinations,
      skippedDivinations,
      importedResults,
      importedAnalyses,
      importedNotes,
      importedSettings,
      errors: [],
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      importedDivinations: 0,
      overwrittenDivinations: 0,
      skippedDivinations: 0,
      importedResults: 0,
      importedAnalyses: 0,
      importedNotes: 0,
      importedSettings: 0,
      errors: [errorMsg],
    };
  }
}
