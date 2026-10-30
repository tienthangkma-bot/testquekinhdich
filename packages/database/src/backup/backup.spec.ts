import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  CastingMethod,
  DivinationAnalysisEntity,
  DivinationDateTime,
  DivinationEntity,
  DivinationNoteEntity,
  DivinationResultEntity,
  Element,
  getHexagramById,
  HexagramTrio,
  KinDichBackupData,
} from '@kindich/domain';
import { CURRENT_SCHEMA_VERSION, KinDichDatabase } from '../db/kindich.db';
import { normalizeBackupData, validateBackupData } from './backup.validator';
import { checkImportConflicts, exportBackup, importBackup } from './backup.service';

describe('Backup & Restore System (packages/database)', () => {
  let db: KinDichDatabase;
  const testDbName = `backup_test_${Date.now()}`;

  const hex1 = getHexagramById(1)!; // Càn Vi Thiên
  const hex44 = getHexagramById(44)!; // Thiên Phong Cấu

  const sampleDateTime: DivinationDateTime = {
    solarDateTime: '2026-10-30T10:00:00.000Z',
    lunarYear: 2026,
    lunarMonth: 9,
    lunarDay: 15,
    lunarHourBranch: 'Tỵ',
    yearCanChi: 'Bính Ngọ',
    monthCanChi: 'Mậu Tuất',
    dayCanChi: 'Ất Mão',
    hourCanChi: 'Tân Tỵ',
    voidBranches: ['Tý', 'Sửu'],
  };

  const sampleTrio: HexagramTrio = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1],
    hasMovingLines: true,
  };

  const sampleDivination: DivinationEntity = {
    id: 'div-test-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
    method: CastingMethod.SERIAL,
    algorithmVersion: 'SERIAL-MOD8-V1',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
    dateTimeInfo: sampleDateTime,
    question: 'Hỏi về việc chuyển công tác',
    inquiryType: 'work',
    starred: true,
  };

  const sampleResult: DivinationResultEntity = {
    id: 'res-test-01',
    divinationId: 'div-test-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    primaryHexagramNumber: 1,
    primaryHexagramName: 'Thuần Càn',
    primaryHexagramSinoVietnameseName: 'Càn vi Thiên',
    changingHexagramNumber: 44,
    changingHexagramName: 'Thiên Phong Cấu',
    changingHexagramSinoVietnameseName: 'Thiên Phong Cấu',
    nuclearHexagramNumber: 1,
    nuclearHexagramName: 'Thuần Càn',
    movingLines: [1],
    trio: sampleTrio,
  };

  const sampleAnalysis: DivinationAnalysisEntity = {
    id: 'ana-test-01',
    divinationId: 'div-test-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    algorithmVersion: 'SERIAL-MOD8-V1',
    palaceId: 'CAN',
    palaceElement: Element.KIM,
    worldLine: 6,
    responseLine: 3,
    summary: 'Càn vi Thiên thuộc cung Càn',
    details: {},
  };

  const sampleNote: DivinationNoteEntity = {
    id: 'note-test-01',
    divinationId: 'div-test-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
    content: 'Thầy khuyên cẩn trọng ngày Dần',
    actualOutcome: 'Đúng như dự đoán',
    isVerified: true,
  };

  beforeEach(async () => {
    db = new KinDichDatabase(testDbName);
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
    await db.close();
  });

  // =========================================================================
  // 1. Kiểm tra tính hợp lệ dữ liệu (Validator - Requirement 5)
  // =========================================================================
  describe('validateBackupData (Requirement 5)', () => {
    it('trả về hợp lệ đối với file sao lưu chuẩn format KINDICH_BACKUP', () => {
      const validBackup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 1,
        },
        settings: { theme: 'dark', defaultMethod: 'serial' },
        data: {
          divinations: [sampleDivination],
          divination_results: [sampleResult],
          divination_analyses: [sampleAnalysis],
          divination_notes: [sampleNote],
          user_settings: [{ key: 'theme', value: 'dark', updatedAt: new Date().toISOString() }],
        },
      };

      const result = validateBackupData(validBackup);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary).toBeDefined();
      expect(result.summary?.totalDivinations).toBe(1);
      expect(result.summary?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.summary?.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(result.summary?.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.summary?.requiresMigration).toBe(false);
    });

    it('báo lỗi nếu dữ liệu không phải object, null hoặc là mảng', () => {
      expect(validateBackupData(null).isValid).toBe(false);
      expect(validateBackupData('string').isValid).toBe(false);
      expect(validateBackupData([]).isValid).toBe(false);
    });

    it('báo lỗi nếu định danh format không đúng KINDICH_BACKUP', () => {
      const invalid = {
        format: 'UNKNOWN_FORMAT',
        metadata: {},
        data: {},
      };
      const res = validateBackupData(invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('KINDICH_BACKUP'))).toBe(true);
    });

    it('báo lỗi nếu thiếu metadata hoặc schemaVersion không phải số nguyên dương (Requirement 3)', () => {
      const invalid = {
        format: 'KINDICH_BACKUP',
        metadata: { schemaVersion: -1, ruleSetId: '' },
        data: {
          divinations: [],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [],
        },
      };
      const res = validateBackupData(invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('schemaVersion'))).toBe(true);
      expect(res.errors.some((e) => e.includes('ruleSetId'))).toBe(true);
    });

    it('báo lỗi nếu các bảng trong data không phải là mảng hoặc có phần tử lỗi', () => {
      const invalid = {
        format: 'KINDICH_BACKUP',
        metadata: {
          schemaVersion: 3,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
        },
        data: {
          divinations: [{ id: '', createdAt: '' }], // thiếu method, id rỗng
          divination_results: 'not_an_array',
          divination_analyses: [],
          divination_notes: [],
        },
      };
      const res = validateBackupData(invalid);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('divination_results'))).toBe(true);
      expect(res.errors.some((e) => e.includes('thiếu id'))).toBe(true);
    });
  });

  // =========================================================================
  // 2. Xuất dữ liệu (Export - Requirement 1, 2, 3)
  // =========================================================================
  describe('exportBackup (Requirement 1, 2, 3)', () => {
    it('xuất toàn bộ 4 bảng cùng cấu hình cá nhân và metadata chuẩn', async () => {
      // 1. Chuẩn bị dữ liệu trong DB
      await db.divinations.add(sampleDivination);
      await db.divination_results.add(sampleResult);
      await db.divination_analyses.add(sampleAnalysis);
      await db.divination_notes.add(sampleNote);
      await db.user_settings.add({
        key: 'theme',
        value: 'dark',
        updatedAt: '2026-10-30T10:00:00.000Z',
      });

      // 2. Thực thi xuất
      const backup = await exportBackup(db, {
        appVersion: '1.2.0',
        defaultRuleSetId: 'BO_PHE_CHINH_TONG_V1',
        defaultAlgorithmVersion: 'SERIAL-MOD8-V1',
      });

      // 3. Kiểm tra cấu trúc xuất ra
      expect(backup.format).toBe('KINDICH_BACKUP');
      expect(backup.version).toBe(1);
      expect(backup.metadata.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(backup.metadata.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(backup.metadata.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(backup.metadata.totalDivinations).toBe(1);
      expect(backup.metadata.totalNotes).toBe(1);
      expect(backup.metadata.appVersion).toBe('1.2.0');

      // Kiểm tra dữ liệu các bảng
      expect(backup.data.divinations).toHaveLength(1);
      expect(backup.data.divinations[0]?.id).toBe('div-test-01');
      expect(backup.data.divination_results).toHaveLength(1);
      expect(backup.data.divination_analyses).toHaveLength(1);
      expect(backup.data.divination_notes).toHaveLength(1);
      expect(backup.data.user_settings).toHaveLength(1);

      // Kiểm tra cấu hình cá nhân (Requirement 2)
      expect(backup.settings?.theme).toBe('dark');
    });
  });

  // =========================================================================
  // 3. Kiểm tra xung đột trùng lặp (Conflict Check - Requirement 6)
  // =========================================================================
  describe('checkImportConflicts (Requirement 6)', () => {
    it('báo không có xung đột khi DB trống', async () => {
      const backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 1,
        },
        data: {
          divinations: [sampleDivination],
          divination_results: [sampleResult],
          divination_analyses: [sampleAnalysis],
          divination_notes: [sampleNote],
        },
      };

      const conflict = await checkImportConflicts(db, backup);
      expect(conflict.hasConflicts).toBe(false);
      expect(conflict.totalImportDivinations).toBe(1);
      expect(conflict.newDivinationsCount).toBe(1);
      expect(conflict.duplicateDivinationsCount).toBe(0);
      expect(conflict.duplicateIds).toHaveLength(0);
    });

    it('phát hiện chính xác các bản ghi trùng ID khi DB đã chứa dữ liệu', async () => {
      // Đã có sẵn sampleDivination trong DB
      await db.divinations.add(sampleDivination);

      const divNew: DivinationEntity = {
        ...sampleDivination,
        id: 'div-test-02-new',
      };

      const backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 2,
          totalNotes: 0,
        },
        data: {
          divinations: [sampleDivination, divNew],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [],
        },
      };

      const conflict = await checkImportConflicts(db, backup);
      expect(conflict.hasConflicts).toBe(true);
      expect(conflict.totalImportDivinations).toBe(2);
      expect(conflict.duplicateDivinationsCount).toBe(1);
      expect(conflict.newDivinationsCount).toBe(1);
      expect(conflict.duplicateIds).toEqual(['div-test-01']);
      expect(conflict.totalExistingInDb).toBe(1);
    });
  });

  // =========================================================================
  // 4. Nhập dữ liệu và Xử lý Ghi đè / Bỏ qua (Import - Requirement 4, 6, 7)
  // =========================================================================
  describe('importBackup (Requirement 4, 6, 7)', () => {
    it('nhập thành công toàn bộ dữ liệu vào cơ sở dữ liệu trống', async () => {
      const backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 1,
        },
        settings: { theme: 'dark' },
        data: {
          divinations: [sampleDivination],
          divination_results: [sampleResult],
          divination_analyses: [sampleAnalysis],
          divination_notes: [sampleNote],
        },
      };

      const res = await importBackup(db, backup);
      expect(res.success).toBe(true);
      expect(res.importedDivinations).toBe(1);
      expect(res.overwrittenDivinations).toBe(0);
      expect(res.importedResults).toBe(1);
      expect(res.importedAnalyses).toBe(1);
      expect(res.importedNotes).toBe(1);
      expect(res.importedSettings).toBeGreaterThanOrEqual(1);

      // Xác nhận dữ liệu thực tế trong DB
      expect(await db.divinations.count()).toBe(1);
      expect(await db.divination_results.count()).toBe(1);
      expect(await db.divination_analyses.count()).toBe(1);
      expect(await db.divination_notes.count()).toBe(1);
    });

    it('chế độ overwrite ghi đè cập nhật lại dữ liệu của các bản ghi trùng lặp', async () => {
      // 1. Dữ liệu cũ trong DB
      await db.divinations.add({
        ...sampleDivination,
        question: 'Câu hỏi cũ trước khi ghi đè',
      });

      // 2. Dữ liệu mới trong file sao lưu có cùng ID
      const backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 0,
        },
        data: {
          divinations: [
            {
              ...sampleDivination,
              question: 'Câu hỏi mới ĐÃ ĐƯỢC GHI ĐÈ',
            },
          ],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [],
        },
      };

      const res = await importBackup(db, backup, { mode: 'overwrite' });
      expect(res.success).toBe(true);
      expect(res.overwrittenDivinations).toBe(1);
      expect(res.importedDivinations).toBe(0);

      // Kiểm tra nội dung câu hỏi đã được ghi đè thành công
      const updated = await db.divinations.get(sampleDivination.id);
      expect(updated?.question).toBe('Câu hỏi mới ĐÃ ĐƯỢC GHI ĐÈ');
    });

    it('chế độ skip giữ nguyên bản ghi trùng lặp và chỉ thêm các bản ghi mới', async () => {
      // 1. Dữ liệu cũ trong DB
      await db.divinations.add({
        ...sampleDivination,
        question: 'Dữ liệu gốc được giữ nguyên',
      });

      // 2. File sao lưu có 1 bản ghi trùng và 1 bản ghi mới
      const divNew: DivinationEntity = {
        ...sampleDivination,
        id: 'div-test-02-new',
        question: 'Quẻ hoàn toàn mới',
      };

      const backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: new Date().toISOString(),
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 2,
          totalNotes: 0,
        },
        data: {
          divinations: [
            {
              ...sampleDivination,
              question: 'Dữ liệu này sẽ bị BỎ QUA',
            },
            divNew,
          ],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [],
        },
      };

      const res = await importBackup(db, backup, { mode: 'skip' });
      expect(res.success).toBe(true);
      expect(res.skippedDivinations).toBe(1);
      expect(res.importedDivinations).toBe(1);

      // Bản ghi trùng lặp giữ nguyên nội dung cũ
      const existing = await db.divinations.get(sampleDivination.id);
      expect(existing?.question).toBe('Dữ liệu gốc được giữ nguyên');

      // Bản ghi mới được bổ sung
      const added = await db.divinations.get('div-test-02-new');
      expect(added?.question).toBe('Quẻ hoàn toàn mới');
      expect(await db.divinations.count()).toBe(2);
    });

    it('trả về lỗi rõ ràng khi file không hợp lệ (Requirement 7)', async () => {
      const corruptData = {
        format: 'INVALID_TAG',
      } as unknown as KinDichBackupData;

      const res = await importBackup(db, corruptData);
      expect(res.success).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(await db.divinations.count()).toBe(0);
    });
  });

  // =========================================================================
  // 5. Kiểm tra Migration phiên bản Schema cũ (Migration - Requirement 9)
  // =========================================================================
  describe('Migration khi Khôi phục Dữ liệu Cũ (Requirement 9)', () => {
    it('chuẩn hóa và bổ sung tự động các trường thiếu khi nhập bản sao lưu từ Schema Version 1', async () => {
      // Dữ liệu thời Schema V1: divinations thiếu ruleSetId và starred; notes thiếu isVerified
      const legacyV1Backup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: '2026-01-01T00:00:00.000Z',
          appVersion: '0.9.0',
          schemaVersion: 1, // Schema V1
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 1,
        },
        data: {
          divinations: [
            {
              id: 'legacy-div-01',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              method: CastingMethod.SERIAL,
              algorithmVersion: 'SERIAL-MOD8-V1',
              // Không có ruleSetId và starred
              input: { method: CastingMethod.SERIAL, serialNumber: '99999999' },
              dateTimeInfo: sampleDateTime,
            } as unknown as DivinationEntity,
          ],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [
            {
              id: 'legacy-note-01',
              divinationId: 'legacy-div-01',
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
              content: 'Ghi chú thời V1',
              // Không có isVerified
            } as unknown as DivinationNoteEntity,
          ],
        },
      };

      // 1. Kiểm tra normalizeBackupData
      const normalized = normalizeBackupData(legacyV1Backup);
      expect(normalized.metadata.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(normalized.data.divinations[0]?.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(normalized.data.divinations[0]?.starred).toBe(false);
      expect(normalized.data.divination_notes[0]?.isVerified).toBe(false);

      // 2. Nhập vào Database hiện tại
      const res = await importBackup(db, legacyV1Backup);
      expect(res.success).toBe(true);
      expect(res.importedDivinations).toBe(1);

      // 3. Kiểm tra bản ghi lưu trong DB đã có đầy đủ các trường mới
      const savedDiv = await db.divinations.get('legacy-div-01');
      expect(savedDiv?.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(savedDiv?.starred).toBe(false);

      const savedNote = await db.divination_notes.get('legacy-note-01');
      expect(savedNote?.isVerified).toBe(false);
    });
  });
});
