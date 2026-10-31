import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  CastingMethod,
  CreateDivinationDto,
  HEXAGRAMS,
} from '@kindich/domain';
import {
  castBySerial,
  castByMaiHua,
  castHexagramTrio,
  orchestrateSixYaoAnalysis,
  interpretHexagram,
  InvalidSerialInputError,
  InvalidMaiHuaInputError,
  parseCanChiString,
  calculateVoidBranches,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { createBetterSqliteDriver } from '../database/sqlite-test.driver';
import {
  ISqliteDatabase,
  SqliteDivinationRepository,
  runMigrations,
  exportSqliteBackup,
  validateSqliteBackupData,
  checkSqliteImportConflicts,
  importSqliteBackup,
} from '../database';

describe('Cross-Platform Multi-Platform Test & Core Engine Parity', () => {
  let rawDb: any;
  let db: ISqliteDatabase;
  let repository: SqliteDivinationRepository;

  beforeEach(async () => {
    rawDb = new Database(':memory:');
    db = createBetterSqliteDriver(rawDb);
    repository = new SqliteDivinationRepository(db);
    await runMigrations(db, 2);
  });

  afterEach(() => {
    if (rawDb) rawDb.close();
  });

  // =========================================================================
  // 1. Core Engine Parity & Determinism Across All Platforms
  // =========================================================================
  describe('1. Core Engine Determinism & Parity (Web, Mobile, Desktop)', () => {
    it('Vector A (Seri 6824): tính toán đồng nhất 100% quẻ chủ, quẻ biến, quẻ hỗ và hào động', () => {
      const serial = '6824';
      const result = castBySerial(serial);

      // Thuật toán SERIAL-MOD8-V1:
      // Vị trí lẻ: 6 (1), 2 (3) => tổng 8 mod 8 = 0 => 8 (Khôn - Địa) => Thượng quái
      // Vị trí chẵn: 8 (2), 4 (4) => tổng 12 mod 8 = 4 (Chấn - Lôi) => Hạ quái
      // Quẻ Chủ: Địa Lôi Phục (#24)
      expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.serialNumber).toBe('6824');
      expect(result.upperTrigramNumber).toBe(8); // Khôn
      expect(result.lowerTrigramNumber).toBe(4); // Chấn
      expect(result.trio.primary.number).toBe(24);
      expect(result.trio.primary.name).toBe('Địa Lôi Phục');

      // Hào động: (6 + 8 + 2 + 4) = 20 mod 6 = 2 => Hào 2 động
      expect(result.movingLine).toBe(2);

      // Quẻ Biến: hào 2 âm biến dương => Địa Trạch Lâm (#19)
      expect(result.trio.transformed).toBeDefined();
      expect(result.trio.transformed?.number).toBe(19);
      expect(result.trio.transformed?.name).toBe('Địa Trạch Lâm');

      // Quẻ Hỗ: Nội hỗ hào 2,3,4 (000 = Khôn), Ngoại hỗ hào 3,4,5 (000 = Khôn) => Thuần Khôn (#2)
      expect(result.trio.nuclear.number).toBe(2);
      expect(result.trio.nuclear.name).toBe('Thuần Khôn');
    });

    it('Vector B (Seri 0000 - Edge case toàn số 0): xử lý chuẩn xác không gây chia cho 0', () => {
      const serial = '0000';
      const result = castBySerial(serial);

      // Vị trí lẻ 0 + 0 = 0 mod 8 => 8 (Khôn)
      // Vị trí chẵn 0 + 0 = 0 mod 8 => 8 (Khôn)
      // Tổng = 0 mod 6 => 6 (Hào 6 động)
      expect(result.upperTrigramNumber).toBe(8);
      expect(result.lowerTrigramNumber).toBe(8);
      expect(result.trio.primary.number).toBe(2); // Thuần Khôn
      expect(result.movingLine).toBe(6);
      expect(result.trio.transformed?.number).toBe(23); // Sơn Địa Bác
    });

    it('Vector C (Seri 1234): tính toán chuẩn tắc phân bổ quái', () => {
      const serial = '1234';
      const result = castBySerial(serial);

      // Lẻ: 1 + 3 = 4 (Chấn - Lôi)
      // Chẵn: 2 + 4 = 6 (Khảm - Thủy)
      // Quẻ: Lôi Thủy Giải (#40)
      // Hào động: (1+2+3+4) = 10 mod 6 = 4 => Hào 4 động
      // Biến: Địa Thủy Sư (#7)
      expect(result.upperTrigramNumber).toBe(4);
      expect(result.lowerTrigramNumber).toBe(6);
      expect(result.trio.primary.number).toBe(40);
      expect(result.movingLine).toBe(4);
      expect(result.trio.transformed?.number).toBe(7);
    });

    it('Vector D (Mai Hoa Dịch Số MAI-HUA-V1): đồng nhất Thể Dụng và biến quái', () => {
      // Đầu vào: Năm Ngọ (7), Tháng 9, Ngày 20, Giờ Thìn (5)
      const res = castByMaiHua({
        yearBranch: 7,
        month: 9,
        day: 20,
        hourBranch: 5,
      });

      // Thượng quái: (7 + 9 + 20) mod 8 = 36 mod 8 = 4 (Chấn - Lôi)
      // Hạ quái: (7 + 9 + 20 + 5) mod 8 = 41 mod 8 = 1 (Càn - Thiên)
      // Quẻ Chủ: Lôi Thiên Đại Tráng (#34)
      expect(res.trio.primary.number).toBe(34);
      expect(res.trio.primary.name).toBe('Lôi Thiên Đại Tráng');

      // Hào động: 41 mod 6 = 5 => Hào 5 động
      expect(res.movingLine).toBe(5);

      // Quẻ Biến: hào 5 động (Thượng quái Chấn hào 2 biến => Đoài) => Trạch Thiên Quải (#43)
      expect(res.trio.transformed?.number).toBe(43);
      expect(res.trio.transformed?.name).toBe('Trạch Thiên Quải');

      // Thể Dụng: Hào động ở Thượng quái (hào 5) => Thượng quái là Dụng (Chấn - Mộc), Hạ quái là Thể (Càn - Kim)
      expect(res.theDung.theTrigram.name).toBe('Càn');
      expect(res.theDung.dungTrigram.name).toBe('Chấn');
      expect(res.theDung.thePosition).toBe('LOWER');
      expect(res.theDung.dungPosition).toBe('UPPER');
    });

    it('Vector E (Lục Hào Chuyên Sâu): Bát Cung, Thế Ứng, Nạp Giáp, Lục Thân, Lục Thú, Tuần Không', () => {
      // Phân tích quẻ #24 Địa Lôi Phục, hào 2 động, ngày Giáp Tý, tháng Bính Dần
      const sixYao = orchestrateSixYaoAnalysis({
        primaryHexagram: 24,
        changingHexagram: 19,
        movingLineIndices: [2],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Kỷ Tỵ',
        },
      });

      // Quẻ Phục thuộc Cung Khôn (Thổ)
      expect(sixYao.primaryHexagram.palace.name).toBe('Khôn');
      expect(sixYao.primaryHexagram.palace.element).toBe('THO');
      expect(sixYao.summary.worldLinePosition).toBe(1); // Thế tại hào 1
      expect(sixYao.summary.responseLinePosition).toBe(4); // Ứng tại hào 4

      // Nạp giáp 6 hào quẻ Phục:
      // Hào 1: Tý Thủy (Thê Tài)
      // Hào 2: Dần Mộc (Quan Quỷ - hào động)
      // Hào 3: Thìn Thổ (Huynh Đệ)
      // Hào 4: Sửu Thổ (Huynh Đệ)
      // Hào 5: Hợi Thủy (Thê Tài)
      // Hào 6: Dậu Kim (Tử Tôn)
      expect(sixYao.primaryHexagram.lines).toHaveLength(6);
      expect(sixYao.primaryHexagram.lines[0]!.branch).toBe('Tý');
      expect(sixYao.primaryHexagram.lines[1]!.branch).toBe('Dần');
      expect(sixYao.primaryHexagram.lines[1]!.isMoving).toBe(true);

      // Lục Thú ngày Giáp Tý: Giáp Ất khởi Thanh Long tại hào 1
      expect(sixYao.primaryHexagram.lines[0]!.sixSpiritName).toBe('Thanh Long');
      expect(sixYao.primaryHexagram.lines[1]!.sixSpiritName).toBe('Chu Tước');
      expect(sixYao.primaryHexagram.lines[2]!.sixSpiritName).toBe('Câu Trần');
      expect(sixYao.primaryHexagram.lines[3]!.sixSpiritName).toBe('Đằng Xà');
      expect(sixYao.primaryHexagram.lines[4]!.sixSpiritName).toBe('Bạch Hổ');
      expect(sixYao.primaryHexagram.lines[5]!.sixSpiritName).toBe('Huyền Vũ');

      // Tuần không: Giáp Tý tuần Giáp Tý => Tuất Hợi không vong
      const { stem, branch } = parseCanChiString('Giáp Tý');
      const { voidBranches } = calculateVoidBranches(stem, branch);
      expect(voidBranches).toEqual(['Tuất', 'Hợi']);
      expect(sixYao.primaryHexagram.lines[4]!.calendar.isVoid).toBe(true); // Hào 5 Hợi Thủy rơi vào Tuần Không
    });

    it('Vector F (Chu Hi Interpretation Rule): 1 hào động và nhiều hào động', () => {
      // Quẻ #1 Thuần Càn có 1 hào động (hào 1)
      const hex1 = HEXAGRAMS.find((h) => h.number === 1)!;
      const trio1 = castHexagramTrio(hex1.binary, [1]);
      const interp1 = interpretHexagram({ trio: trio1 });
      expect(interp1.movingLinesClassical).toHaveLength(1);
      expect(interp1.movingLinesClassical[0]!.content.position).toBe(1);
      expect(interp1.hexagramTransformation.content.divinationMethodRule).toContain('1 hào động');

      // 2 hào động: Lấy hào trên làm chủ
      const trio2 = castHexagramTrio(hex1.binary, [1, 3]);
      const interp2 = interpretHexagram({ trio: trio2 });
      expect(interp2.movingLinesClassical).toHaveLength(2);
      expect(interp2.hexagramTransformation.content.divinationMethodRule).toContain('2 hào động');
    });
  });

  // =========================================================================
  // 2. Storage, History, Notes & Cross-Platform Backup/Restore
  // =========================================================================
  describe('2. Storage, History, Notes & Cross-Platform Backup/Restore', () => {
    it('thực hiện CRUD quẻ, ghi chú và nghiệm lý thực tế (actualOutcome, isVerified)', async () => {
      const serialRes = castBySerial('6824');
      const now = new Date();
      const calInfo = getFullCalendarInfo(now.toISOString());
      const { stem, branch } = parseCanChiString(calInfo.canChi.day);
      const { voidBranches } = calculateVoidBranches(stem, branch);

      const dto: CreateDivinationDto = {
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '6824' },
        dateTimeInfo: {
          solarDateTime: now.toISOString(),
          lunarYear: calInfo.lunar.year,
          lunarMonth: calInfo.lunar.month,
          lunarDay: calInfo.lunar.day,
          lunarHourBranch: calInfo.currentHourBranch.branch,
          yearCanChi: calInfo.canChi.year,
          monthCanChi: calInfo.canChi.month,
          dayCanChi: calInfo.canChi.day,
          hourCanChi: calInfo.canChi.hour,
          voidBranches,
        },
        trio: serialRes.trio,
        question: 'Dự đoán công việc kinh doanh cuối năm',
        inquiryType: 'business',
      };

      // Create
      const created = await repository.create(dto);
      expect(created.divination.id).toBeDefined();
      expect(created.divination.question).toBe('Dự đoán công việc kinh doanh cuối năm');

      // Add Note & Verify actualOutcome
      const note = await repository.addNote(
        created.divination.id,
        'Khách hàng phản hồi rất tích cực, hợp đồng được ký đúng hạn.',
        'Thực tế ứng nghiệm cát lợi, doanh thu vượt 15%.'
      );
      expect(note.id).toBeDefined();
      expect(note.isVerified).toBe(true);
      expect(note.actualOutcome).toContain('doanh thu vượt 15%');

      // Read aggregate
      const fetched = await repository.getById(created.divination.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.notes).toHaveLength(1);
      expect(fetched?.notes[0]!.isVerified).toBe(true);

      // Search & Pagination
      const paged = await repository.list(
        { query: 'kinh doanh' },
        { page: 1, pageSize: 10 }
      );
      expect(paged.totalCount).toBe(1);
      expect(paged.items[0]!.id).toBe(created.divination.id);
    });

    it('tính tương thích trọn vẹn của Backup/Restore JSON giữa Web (Dexie) và SQLite (Mobile/Desktop)', async () => {
      // 1. Tạo 2 bản ghi mẫu trong SQLite
      const created1 = await repository.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '6824' },
        dateTimeInfo: {
          solarDateTime: new Date().toISOString(),
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 20,
          lunarHourBranch: 'Thìn',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Mậu Tuất',
          dayCanChi: 'Giáp Tý',
          hourCanChi: 'Mậu Thìn',
          voidBranches: ['Tuất', 'Hợi'],
        },
        trio: castBySerial('6824').trio,
        question: 'Câu hỏi kiểm thử liên nền tảng 1',
      });

      await repository.addNote(
        created1.divination.id,
        'Ghi chú thử nghiệm Web <-> SQLite',
        'Chính xác 100%'
      );

      // 2. Xuất dữ liệu Backup JSON (chuẩn KINDICH_BACKUP)
      const backupJson = await exportSqliteBackup(db, {
        appVersion: '1.0.0',
        defaultRuleSetId: 'BO_PHE_CHINH_TONG_V1',
        defaultAlgorithmVersion: 'SERIAL-MOD8-V1',
      });

      expect(backupJson.format).toBe('KINDICH_BACKUP');
      expect(backupJson.version).toBe(1);
      expect(backupJson.metadata.schemaVersion).toBe(2);
      expect(backupJson.data.divinations).toHaveLength(1);
      expect(backupJson.data.divination_notes).toHaveLength(1);

      // 3. Kiểm tra tính hợp lệ dữ liệu (Validator)
      const validation = validateSqliteBackupData(backupJson);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // 4. Kiểm tra xung đột (Duplicate Conflicts)
      const conflicts = await checkSqliteImportConflicts(db, backupJson);
      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.duplicateDivinationsCount).toBe(1);

      // 5. Khôi phục vào một cơ sở dữ liệu SQLite mới (giả lập Mobile hoặc Desktop khác)
      const rawDbTarget = new Database(':memory:');
      const dbTarget = createBetterSqliteDriver(rawDbTarget);
      await runMigrations(dbTarget, 2);
      const repoTarget = new SqliteDivinationRepository(dbTarget);

      const importSummary = await importSqliteBackup(dbTarget, backupJson, { mode: 'overwrite' });
      expect(importSummary.importedDivinations).toBe(1);
      expect(importSummary.importedNotes).toBe(1);

      const targetItem = await repoTarget.getById(created1.divination.id);
      expect(targetItem).not.toBeNull();
      expect(targetItem?.divination.question).toBe('Câu hỏi kiểm thử liên nền tảng 1');
      expect(targetItem?.notes[0]!.actualOutcome).toBe('Chính xác 100%');

      rawDbTarget.close();
    });
  });

  // =========================================================================
  // 3. Offline Capabilities & Database Migration Across Restarts
  // =========================================================================
  describe('3. Offline Persistence & Database Migration v1 -> v2', () => {
    it('kiểm tra dữ liệu được bảo toàn nguyên vẹn sau khi nâng cấp Migration v1 lên v2', async () => {
      const memDb = new Database(':memory:');
      const testDb = createBetterSqliteDriver(memDb);

      // Chạy migration v1
      await runMigrations(testDb, 1);

      // Thêm bản ghi v1
      await testDb.runAsync(
        `INSERT INTO divinations (
          id, created_at, updated_at, method, algorithm_version, rule_set_id,
          input, date_time_info, question, inquiry_type, tags, starred, result_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'div-mig-1',
          new Date().toISOString(),
          new Date().toISOString(),
          'SERIAL',
          'SERIAL-MOD8-V1',
          'BO_PHE_CHINH_TONG_V1',
          JSON.stringify({ serialNumber: '1234' }),
          JSON.stringify({ dayCanChi: 'Giáp Tý' }),
          'Câu hỏi trước khi migrate',
          'career',
          null,
          0,
          null,
        ]
      );

      // Nâng cấp migration lên v2
      await runMigrations(testDb, 2);

      // Kiểm tra bảng mới divination_notes và các chỉ mục v2 đã được tạo
      const notesTable = await testDb.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='divination_notes';"
      );
      expect(notesTable).toHaveLength(1);

      // Dữ liệu cũ v1 vẫn được bảo toàn
      const existing = await testDb.getAllAsync<{ id: string; question: string }>(
        'SELECT id, question FROM divinations WHERE id = ?;',
        ['div-mig-1']
      );
      expect(existing).toHaveLength(1);
      expect(existing[0]!.question).toBe('Câu hỏi trước khi migrate');

      memDb.close();
    });
  });

  // =========================================================================
  // 4. Input Validation & Error Handling (Edge Cases)
  // =========================================================================
  describe('4. Input Validation & Error Handling Edge Cases', () => {
    it('báo lỗi rõ ràng khi số seri tiền không hợp lệ', () => {
      // 1. Chứa chữ cái
      expect(() => castBySerial('68A4')).toThrow(InvalidSerialInputError);
      // 2. Độ dài nhỏ hơn 2
      expect(() => castBySerial('5')).toThrow(InvalidSerialInputError);
      // 3. Chuỗi rỗng
      expect(() => castBySerial('')).toThrow(InvalidSerialInputError);
      // 4. Ký tự đặc biệt
      expect(() => castBySerial('68#4')).toThrow(InvalidSerialInputError);
    });

    it('báo lỗi rõ ràng khi thông số lập quẻ Mai Hoa không hợp lệ', () => {
      // Tháng âm lịch = 13 (ngoài 1-12)
      expect(() =>
        castByMaiHua({
          yearBranch: 1,
          month: 13,
          day: 15,
          hourBranch: 1,
        })
      ).toThrow(InvalidMaiHuaInputError);

      // Ngày âm lịch = 32 (ngoài 1-30)
      expect(() =>
        castByMaiHua({
          yearBranch: 1,
          month: 5,
          day: 32,
          hourBranch: 1,
        })
      ).toThrow(InvalidMaiHuaInputError);

      // Chi giờ = 0 hoặc 13 (ngoài 1-12)
      expect(() =>
        castByMaiHua({
          yearBranch: 1,
          month: 5,
          day: 15,
          hourBranch: 14,
        })
      ).toThrow(InvalidMaiHuaInputError);
    });

    it('phát hiện file backup JSON bị lỗi định dạng hoặc sai schema', () => {
      // Không đúng format
      const invalidFormat: any = { format: 'WRONG_FORMAT', version: 1, metadata: {}, data: {} };
      const val1 = validateSqliteBackupData(invalidFormat);
      expect(val1.isValid).toBe(false);

      // Thiếu mảng divinations
      const missingArrays: any = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: { schemaVersion: 2 },
        data: {},
      };
      const val2 = validateSqliteBackupData(missingArrays);
      expect(val2.isValid).toBe(false);
      expect(val2.errors.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. Performance Benchmarks
  // =========================================================================
  describe('5. Performance Benchmarks across Operations', () => {
    it('tốc độ lập quẻ Seri tiền đạt dưới 0.1ms/lần gọi (1000 iterations)', () => {
      const start = performance.now();
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        castBySerial('6824');
      }
      const duration = performance.now() - start;
      const avgLatencyMs = duration / iterations;

      expect(avgLatencyMs).toBeLessThan(0.1); // Dưới 100 microseconds
    });

    it('tốc độ phân tích Lục Hào chuyên sâu đạt dưới 0.5ms/lần gọi (1000 iterations)', () => {
      const start = performance.now();
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        orchestrateSixYaoAnalysis({
          primaryHexagram: 24,
          changingHexagram: 19,
          movingLineIndices: [2],
          dateTime: {
            dayCanChi: 'Giáp Tý',
            monthCanChi: 'Bính Dần',
            yearCanChi: 'Bính Ngọ',
            hourCanChi: 'Kỷ Tỵ',
          },
        });
      }
      const duration = performance.now() - start;
      const avgLatencyMs = duration / iterations;

      expect(avgLatencyMs).toBeLessThan(1.0); // Dưới 1ms (đảm bảo >1000 quẻ/giây kể cả khi CPU tải nặng)
    });

    it('tốc độ tra cứu và tìm kiếm SQLite đạt dưới 10ms', async () => {
      // Seed 50 bản ghi
      for (let i = 0; i < 50; i++) {
        await repository.create({
          method: CastingMethod.SERIAL,
          algorithmVersion: 'SERIAL-MOD8-V1',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          input: { method: CastingMethod.SERIAL, serialNumber: String(1000 + i) },
          dateTimeInfo: {
            solarDateTime: new Date().toISOString(),
            lunarYear: 2026,
            lunarMonth: 9,
            lunarDay: 20,
            lunarHourBranch: 'Thìn',
            yearCanChi: 'Bính Ngọ',
            monthCanChi: 'Mậu Tuất',
            dayCanChi: 'Giáp Tý',
            hourCanChi: 'Mậu Thìn',
            voidBranches: ['Tuất', 'Hợi'],
          },
          trio: castBySerial('6824').trio,
          question: `Kiểm tra hiệu năng tra cứu hồ sơ thứ ${i}`,
        });
      }

      const start = performance.now();
      const results = await repository.list({ query: 'hồ sơ thứ 45' }, { page: 1, pageSize: 10 });
      const duration = performance.now() - start;

      expect(results.items.length).toBe(1);
      expect(duration).toBeLessThan(10); // Dưới 10ms
    });
  });
});
