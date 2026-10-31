import {
  BackupMetadata,
  BackupValidationResult,
  DuplicateConflictSummary,
  ImportSummary,
  KinDichBackupData,
  DivinationEntity,
  DivinationResultEntity,
  DivinationAnalysisEntity,
  DivinationNoteEntity,
} from '@kindich/domain';
import {
  ISqliteDatabase,
  DivinationRow,
  DivinationResultRow,
  DivinationAnalysisRow,
  DivinationNoteRow,
} from './sqlite.types';
import { LATEST_DATABASE_VERSION } from './schema';

export interface MobileExportBackupOptions {
  appVersion?: string;
  defaultRuleSetId?: string;
  defaultAlgorithmVersion?: string;
}

/**
 * Xuất toàn bộ dữ liệu SQLite Mobile thành đối tượng JSON chuẩn KinDichBackupData
 * Hoạt động 100% offline, không gửi dữ liệu ra ngoài
 */
export async function exportSqliteBackup(
  db: ISqliteDatabase,
  options?: MobileExportBackupOptions
): Promise<KinDichBackupData> {
  // Lấy dữ liệu từ 4 bảng
  const [divRows, resRows, anaRows, noteRows] = await Promise.all([
    db.getAllAsync<DivinationRow>('SELECT * FROM divinations ORDER BY created_at DESC;'),
    db.getAllAsync<DivinationResultRow>('SELECT * FROM divination_results;'),
    db.getAllAsync<DivinationAnalysisRow>('SELECT * FROM divination_analyses;'),
    db.getAllAsync<DivinationNoteRow>('SELECT * FROM divination_notes ORDER BY created_at ASC;'),
  ]);

  // Chuyển đổi DivinationRow sang DivinationEntity
  const divinations: DivinationEntity[] = divRows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    method: r.method as any,
    algorithmVersion: r.algorithm_version,
    ruleSetId: r.rule_set_id,
    input: JSON.parse(r.input),
    dateTimeInfo: JSON.parse(r.date_time_info),
    question: r.question ?? undefined,
    inquiryType: r.inquiry_type ?? undefined,
    tags: r.tags ? JSON.parse(r.tags) : [],
    starred: r.starred === 1,
    resultSnapshot: r.result_snapshot ? JSON.parse(r.result_snapshot) : undefined,
  }));

  // Chuyển đổi DivinationResultRow sang DivinationResultEntity
  const divination_results: DivinationResultEntity[] = resRows.map((r) => ({
    id: r.id,
    divinationId: r.divination_id,
    createdAt: r.created_at,
    primaryHexagramNumber: r.primary_hexagram_number,
    primaryHexagramName: r.primary_hexagram_name,
    primaryHexagramSinoVietnameseName: r.primary_hexagram_sino_vietnamese_name ?? undefined,
    changingHexagramNumber: r.changing_hexagram_number ?? undefined,
    changingHexagramName: r.changing_hexagram_name ?? undefined,
    changingHexagramSinoVietnameseName: r.changing_hexagram_sino_vietnamese_name ?? undefined,
    nuclearHexagramNumber: r.nuclear_hexagram_number ?? undefined,
    nuclearHexagramName: r.nuclear_hexagram_name ?? undefined,
    movingLines: JSON.parse(r.moving_lines),
    trio: JSON.parse(r.trio),
  }));

  // Chuyển đổi DivinationAnalysisRow sang DivinationAnalysisEntity
  const divination_analyses: DivinationAnalysisEntity[] = anaRows.map((r) => ({
    id: r.id,
    divinationId: r.divination_id,
    createdAt: r.created_at,
    ruleSetId: r.rule_set_id,
    algorithmVersion: r.algorithm_version,
    palaceId: r.palace_id,
    palaceElement: r.palace_element as any,
    worldLine: r.world_line,
    responseLine: r.response_line,
    summary: r.summary ?? undefined,
    details: JSON.parse(r.details),
  }));

  // Chuyển đổi DivinationNoteRow sang DivinationNoteEntity
  const divination_notes: DivinationNoteEntity[] = noteRows.map((r) => ({
    id: r.id,
    divinationId: r.divination_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    content: r.content,
    actualOutcome: r.actual_outcome ?? undefined,
    isVerified: r.is_verified === 1,
  }));

  const metadata: BackupMetadata = {
    exportedAt: new Date().toISOString(),
    appVersion: options?.appVersion || '0.1.0',
    schemaVersion: LATEST_DATABASE_VERSION,
    ruleSetId: options?.defaultRuleSetId || 'SIX-YAO-STANDARD-V1',
    algorithmVersion: options?.defaultAlgorithmVersion || 'SERIAL-MOD8-V1',
    totalDivinations: divinations.length,
    totalNotes: divination_notes.length,
  };

  return {
    format: 'KINDICH_BACKUP',
    version: 1,
    metadata,
    settings: {
      defaultMethod: 'SERIAL',
      theme: 'light',
    },
    data: {
      divinations,
      divination_results,
      divination_analyses,
      divination_notes,
    },
  };
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu sao lưu trước khi nhập
 */
export function validateSqliteBackupData(data: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Dữ liệu sao lưu không phải là một đối tượng JSON hợp lệ.'],
      warnings: [],
    };
  }

  const record = data as Record<string, unknown>;

  if (record.format !== 'KINDICH_BACKUP') {
    errors.push(
      `Định dạng file không được hỗ trợ. Giá trị format phải là "KINDICH_BACKUP", nhận được: "${String(
        record.format
      )}".`
    );
  }

  if (!record.metadata || typeof record.metadata !== 'object' || Array.isArray(record.metadata)) {
    errors.push('Thiếu thông tin metadata trong file sao lưu.');
  } else {
    const meta = record.metadata as Record<string, unknown>;
    if (typeof meta.schemaVersion !== 'number' || meta.schemaVersion < 1) {
      errors.push('Metadata schemaVersion không hợp lệ (phải là số nguyên dương).');
    }
    if (!meta.ruleSetId || typeof meta.ruleSetId !== 'string') {
      errors.push('Metadata ruleSetId không hợp lệ.');
    }
    if (!meta.algorithmVersion || typeof meta.algorithmVersion !== 'string') {
      errors.push('Metadata algorithmVersion không hợp lệ.');
    }
  }

  if (!record.data || typeof record.data !== 'object' || Array.isArray(record.data)) {
    errors.push('Khối data chứa dữ liệu các bảng bị thiếu hoặc không đúng định dạng.');
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  const payload = record.data as Record<string, unknown>;

  if (!Array.isArray(payload.divinations)) {
    errors.push('Trường data.divinations phải là một mảng.');
  }
  if (!Array.isArray(payload.divination_results)) {
    errors.push('Trường data.divination_results phải là một mảng.');
  }
  if (!Array.isArray(payload.divination_analyses)) {
    errors.push('Trường data.divination_analyses phải là một mảng.');
  }
  if (!Array.isArray(payload.divination_notes)) {
    errors.push('Trường data.divination_notes phải là một mảng.');
  }

  const isValid = errors.length === 0;
  const meta = (record.metadata || {}) as Record<string, unknown>;

  return {
    isValid,
    errors,
    warnings,
    summary: isValid
      ? {
          schemaVersion: Number(meta.schemaVersion) || 1,
          ruleSetId: String(meta.ruleSetId || ''),
          algorithmVersion: String(meta.algorithmVersion || ''),
          totalDivinations: (payload.divinations as unknown[])?.length || 0,
          totalResults: (payload.divination_results as unknown[])?.length || 0,
          totalAnalyses: (payload.divination_analyses as unknown[])?.length || 0,
          totalNotes: (payload.divination_notes as unknown[])?.length || 0,
          totalSettings: 0,
          exportedAt: String(meta.exportedAt || ''),
          requiresMigration: Number(meta.schemaVersion) < LATEST_DATABASE_VERSION,
        }
      : undefined,
  };
}

/**
 * Kiểm tra trước các xung đột ID trùng lặp giữa file sao lưu và SQLite hiện có
 */
export async function checkSqliteImportConflicts(
  db: ISqliteDatabase,
  backup: KinDichBackupData
): Promise<DuplicateConflictSummary> {
  const importDivinationIds = backup.data.divinations.map((d) => d.id);
  const totalImportDivinations = importDivinationIds.length;

  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM divinations;'
  );
  const totalExistingInDb = countRow?.count ?? 0;

  if (totalImportDivinations === 0) {
    return {
      hasConflicts: false,
      totalImportDivinations: 0,
      newDivinationsCount: 0,
      duplicateDivinationsCount: 0,
      duplicateIds: [],
      totalExistingInDb,
    };
  }

  // Tìm các ID trùng lặp
  const existingRows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM divinations;'
  );
  const existingIdSet = new Set(existingRows.map((r) => r.id));

  const duplicateIds = importDivinationIds.filter((id) => existingIdSet.has(id));
  const duplicateDivinationsCount = duplicateIds.length;
  const newDivinationsCount = totalImportDivinations - duplicateDivinationsCount;

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
 * Nhập dữ liệu sao lưu vào SQLite Mobile
 * Hỗ trợ 2 chế độ:
 * - 'merge': Giữ lại dữ liệu hiện tại, ghi đè hoặc bổ sung bản ghi mới.
 * - 'overwrite': Xóa toàn bộ dữ liệu hiện tại trước khi nhập.
 */
export async function importSqliteBackup(
  db: ISqliteDatabase,
  backup: KinDichBackupData,
  options?: { mode?: 'merge' | 'overwrite' }
): Promise<ImportSummary> {
  const validation = validateSqliteBackupData(backup);
  if (!validation.isValid) {
    throw new Error(
      `Dữ liệu sao lưu không hợp lệ: ${validation.errors.join('; ')}`
    );
  }

  const mode = options?.mode ?? 'merge';

  let importedDivinationsCount = 0;
  let importedResultsCount = 0;
  let importedAnalysesCount = 0;
  let importedNotesCount = 0;
  let skippedDuplicatesCount = 0;
  let overwrittenCount = 0;

  await db.withTransactionAsync(async () => {
    // Nếu là chế độ overwrite, xóa sạch các bảng
    if (mode === 'overwrite') {
      await db.runAsync('DELETE FROM divination_notes;');
      await db.runAsync('DELETE FROM divination_analyses;');
      await db.runAsync('DELETE FROM divination_results;');
      await db.runAsync('DELETE FROM divinations;');
    }

    // Lấy tập hợp ID đang có trong DB để đếm trùng lặp nếu là merge
    const existingRows = await db.getAllAsync<{ id: string }>('SELECT id FROM divinations;');
    const existingIdSet = new Set(existingRows.map((r) => r.id));

    // 1. Nhập divinations
    for (const d of backup.data.divinations) {
      const isExisting = existingIdSet.has(d.id);
      if (isExisting) {
        overwrittenCount++;
        // Xóa bản ghi cũ để ghi đè sạch
        await db.runAsync('DELETE FROM divination_notes WHERE divination_id = ?;', [d.id]);
        await db.runAsync('DELETE FROM divination_analyses WHERE divination_id = ?;', [d.id]);
        await db.runAsync('DELETE FROM divination_results WHERE divination_id = ?;', [d.id]);
        await db.runAsync('DELETE FROM divinations WHERE id = ?;', [d.id]);
      }

      await db.runAsync(
        `INSERT INTO divinations (
          id, created_at, updated_at, method, algorithm_version, rule_set_id,
          input, date_time_info, question, inquiry_type, tags, starred, result_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          d.id,
          d.createdAt,
          d.updatedAt,
          d.method,
          d.algorithmVersion,
          d.ruleSetId,
          JSON.stringify(d.input),
          JSON.stringify(d.dateTimeInfo),
          d.question ?? null,
          d.inquiryType ?? null,
          d.tags ? JSON.stringify(d.tags) : null,
          d.starred ? 1 : 0,
          d.resultSnapshot ? JSON.stringify(d.resultSnapshot) : null,
        ]
      );
      importedDivinationsCount++;
    }

    // 2. Nhập divination_results
    for (const r of backup.data.divination_results) {
      await db.runAsync(
        `INSERT OR REPLACE INTO divination_results (
          id, divination_id, created_at, primary_hexagram_number, primary_hexagram_name,
          primary_hexagram_sino_vietnamese_name, changing_hexagram_number, changing_hexagram_name,
          changing_hexagram_sino_vietnamese_name, nuclear_hexagram_number, nuclear_hexagram_name,
          moving_lines, trio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          r.id,
          r.divinationId,
          r.createdAt,
          r.primaryHexagramNumber,
          r.primaryHexagramName,
          r.primaryHexagramSinoVietnameseName ?? null,
          r.changingHexagramNumber ?? null,
          r.changingHexagramName ?? null,
          r.changingHexagramSinoVietnameseName ?? null,
          r.nuclearHexagramNumber ?? null,
          r.nuclearHexagramName ?? null,
          JSON.stringify(r.movingLines),
          JSON.stringify(r.trio),
        ]
      );
      importedResultsCount++;
    }

    // 3. Nhập divination_analyses
    for (const a of backup.data.divination_analyses) {
      await db.runAsync(
        `INSERT OR REPLACE INTO divination_analyses (
          id, divination_id, created_at, rule_set_id, algorithm_version,
          palace_id, palace_element, world_line, response_line, summary, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          a.id,
          a.divinationId,
          a.createdAt,
          a.ruleSetId,
          a.algorithmVersion,
          a.palaceId,
          a.palaceElement,
          a.worldLine,
          a.responseLine,
          a.summary ?? null,
          JSON.stringify(a.details),
        ]
      );
      importedAnalysesCount++;
    }

    // 4. Nhập divination_notes
    for (const n of backup.data.divination_notes) {
      await db.runAsync(
        `INSERT OR REPLACE INTO divination_notes (
          id, divination_id, created_at, updated_at, content, actual_outcome, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          n.id,
          n.divinationId,
          n.createdAt,
          n.updatedAt,
          n.content,
          n.actualOutcome ?? null,
          n.isVerified ? 1 : 0,
        ]
      );
      importedNotesCount++;
    }
  });

  return {
    success: true,
    importedDivinations: importedDivinationsCount,
    overwrittenDivinations: overwrittenCount,
    skippedDivinations: skippedDuplicatesCount,
    importedResults: importedResultsCount,
    importedAnalyses: importedAnalysesCount,
    importedNotes: importedNotesCount,
    importedSettings: 0,
    errors: [],
  };
}
