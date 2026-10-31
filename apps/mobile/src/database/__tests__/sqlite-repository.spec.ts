import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  CastingMethod,
  CreateDivinationDto,
  LinePosition,
} from '@kindich/domain';
import {
  castBySerial,
  castByMaiHua,
  orchestrateSixYaoAnalysis,
  SIX_YAO_DEFAULT_RULESET_ID,
  SIX_YAO_ORCHESTRATOR_VERSION,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import {
  createBetterSqliteDriver,
  ISqliteDatabase,
  SqliteDivinationRepository,
  runMigrations,
  getCurrentDatabaseVersion,
  getAppliedMigrationVersions,
  LATEST_DATABASE_VERSION,
  normalizeVietnamese,
} from '../index';

describe('SQLite Database Layer & Repository Adapter (@apps/mobile)', () => {
  let rawDb: any;
  let db: ISqliteDatabase;
  let repository: SqliteDivinationRepository;

  beforeEach(async () => {
    // Sử dụng in-memory SQLite thuần C cho tests siêu tốc và độc lập
    rawDb = new Database(':memory:');
    db = createBetterSqliteDriver(rawDb);
    repository = new SqliteDivinationRepository(db);
  });

  afterEach(async () => {
    if (rawDb) {
      rawDb.close();
    }
  });

  // =========================================================================
  // 1. Database Migrations & Versioning
  // =========================================================================
  describe('Database Migrations & Versioning', () => {
    it('khởi tạo và áp dụng migration version 1 thành công (Initial Schema)', async () => {
      const v0 = await getCurrentDatabaseVersion(db);
      expect(v0).toBe(0);

      const v1 = await runMigrations(db, 1);
      expect(v1).toBe(1);

      const applied = await getAppliedMigrationVersions(db);
      expect(applied).toEqual([1]);

      // Kiểm tra các bảng đã được tạo
      const tables = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC;"
      );
      const tableNames = tables.map((t) => t.name);
      expect(tableNames).toContain('schema_migrations');
      expect(tableNames).toContain('divinations');
      expect(tableNames).toContain('divination_results');
      expect(tableNames).toContain('divination_analyses');
      expect(tableNames).toContain('divination_notes');
    });

    it('áp dụng tiếp migration version 2 (Compound & Starred Indexes)', async () => {
      await runMigrations(db, 1);
      const v2 = await runMigrations(db, 2);
      expect(v2).toBe(2);

      const applied = await getAppliedMigrationVersions(db);
      expect(applied).toEqual([1, 2]);

      // Kiểm tra các indexes ở version 2
      const indexes = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name ASC;"
      );
      const indexNames = indexes.map((i) => i.name);
      expect(indexNames).toContain('idx_divinations_method_created');
      expect(indexNames).toContain('idx_divinations_rule_set_created');
      expect(indexNames).toContain('idx_divinations_starred');
      expect(indexNames).toContain('idx_divination_notes_created');
    });

    it('tính chất Idempotent: chạy lại migration không gây lỗi và không tạo trùng lặp', async () => {
      await runMigrations(db, LATEST_DATABASE_VERSION);
      const vFirst = await getCurrentDatabaseVersion(db);
      expect(vFirst).toBe(LATEST_DATABASE_VERSION);

      // Chạy lại
      const vSecond = await runMigrations(db, LATEST_DATABASE_VERSION);
      expect(vSecond).toBe(LATEST_DATABASE_VERSION);

      const applied = await getAppliedMigrationVersions(db);
      expect(applied).toEqual([1, 2]);
    });
  });

  // =========================================================================
  // 2. Helper Chuẩn Hóa Tiếng Việt Tìm Kiếm
  // =========================================================================
  describe('normalizeVietnamese helper', () => {
    it('bỏ dấu, chuyển chữ thường và xử lý chữ đ/Đ', () => {
      expect(normalizeVietnamese('Bắc Hà Tân An')).toBe('bac ha tan an');
      expect(normalizeVietnamese('Đoán Quẻ Kinh Dịch')).toBe('doan que kinh dich');
      expect(normalizeVietnamese('Quẻ Thuần Càn - Cát')).toBe('que thuan can - cat');
      expect(normalizeVietnamese('')).toBe('');
    });
  });

  // =========================================================================
  // 3. Repository CRUD Operations
  // =========================================================================
  describe('SqliteDivinationRepository CRUD', () => {
    // Chuẩn bị dữ liệu mẫu quẻ lập từ Seri tiền
    function createSampleSerialDto(override?: Partial<CreateDivinationDto>): CreateDivinationDto {
      const serial = '081293';
      const castResult = castBySerial(serial);
      const calInfo = getFullCalendarInfo(new Date('2026-10-31T08:00:00.000Z'));

      const analysis = orchestrateSixYaoAnalysis({
        primaryHexagram: castResult.trio.primary.number,
        changingHexagram: castResult.trio.transformed?.number,
        movingLineIndices: [castResult.movingLine as LinePosition],
        dateTime: {
          dayCanChi: calInfo.canChi.day,
          monthCanChi: calInfo.canChi.month,
          yearCanChi: calInfo.canChi.year,
          hourCanChi: calInfo.canChi.hour,
        },
      });

      return {
        method: CastingMethod.SERIAL,
        algorithmVersion: castResult.algorithmVersion,
        ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
        input: { method: CastingMethod.SERIAL, serialNumber: serial },
        dateTimeInfo: {
          solarDateTime: '2026-10-31T08:00:00.000Z',
          lunarYear: calInfo.lunar.year,
          lunarMonth: calInfo.lunar.month,
          lunarDay: calInfo.lunar.day,
          lunarHourBranch: calInfo.canChi.hour.split(' ')[1] ?? 'Thìn',
          yearCanChi: calInfo.canChi.year,
          monthCanChi: calInfo.canChi.month,
          dayCanChi: calInfo.canChi.day,
          hourCanChi: calInfo.canChi.hour,
        },
        trio: castResult.trio,
        question: 'Hôm nay công việc hanh thông không?',
        inquiryType: 'work',
        tags: ['cong-viec', 'seri-tien'],
        starred: true,
        initialNote: 'Gieo lúc sáng sớm trước khi đi phỏng vấn.',
        analysis: {
          ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
          algorithmVersion: SIX_YAO_ORCHESTRATOR_VERSION,
          palaceId: analysis.primaryHexagram.palace.id,
          palaceElement: analysis.primaryHexagram.palace.element,
          worldLine: analysis.primaryHexagram.palace.worldLine,
          responseLine: analysis.primaryHexagram.palace.responseLine,
          summary: 'Quẻ có Thế lâm Phụ Mẫu vượng tướng',
          details: analysis,
        },
        ...override,
      };
    }

    it('create() lưu thành công toàn bộ quẻ, kết quả, phân tích, ghi chú và snapshot', async () => {
      const dto = createSampleSerialDto();
      const saved = await repository.create(dto);

      expect(saved.divination.id).toBeDefined();
      expect(saved.divination.question).toBe('Hôm nay công việc hanh thông không?');
      expect(saved.divination.inquiryType).toBe('work');
      expect(saved.divination.starred).toBe(true);
      expect(saved.divination.tags).toEqual(['cong-viec', 'seri-tien']);

      // Kiểm tra kết quả
      expect(saved.result?.primaryHexagramNumber).toBe(dto.trio.primary.number);
      expect(saved.result?.primaryHexagramName).toBe(dto.trio.primary.name);
      expect(saved.result?.movingLines).toContain(dto.trio.movingLineIndices[0]);

      // Kiểm tra phân tích
      expect(saved.analysis).toBeDefined();
      expect(saved.analysis?.palaceId).toBe(dto.analysis?.palaceId);
      expect(saved.analysis?.worldLine).toBe(dto.analysis?.worldLine);

      // Kiểm tra ghi chú ban đầu
      expect(saved.notes.length).toBe(1);
      expect(saved.notes[0]?.content).toBe('Gieo lúc sáng sớm trước khi đi phỏng vấn.');

      // Kiểm tra Result Snapshot bất biến
      expect(saved.resultSnapshot).toBeDefined();
      expect(saved.resultSnapshot?.ruleSetId).toBe(SIX_YAO_DEFAULT_RULESET_ID);
      expect(saved.resultSnapshot?.trio.primary.number).toBe(dto.trio.primary.number);
    });

    it('getById() truy xuất chính xác đầy đủ aggregate theo ID', async () => {
      const dto = createSampleSerialDto();
      const created = await repository.create(dto);

      const fetched = await repository.getById(created.divination.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.divination.id).toBe(created.divination.id);
      expect(fetched?.divination.method).toBe(CastingMethod.SERIAL);
      expect(fetched?.result?.primaryHexagramName).toBe(created.result?.primaryHexagramName);
      expect(fetched?.analysis?.palaceId).toBe(created.analysis?.palaceId);
      expect(fetched?.notes[0]?.content).toBe('Gieo lúc sáng sớm trước khi đi phỏng vấn.');
      expect(fetched?.resultSnapshot?.algorithmVersion).toBe(dto.algorithmVersion);
    });

    it('getById() trả về null nếu ID không tồn tại', async () => {
      const nonExistent = await repository.getById('non-existent-id-12345');
      expect(nonExistent).toBeNull();
    });

    it('update() cập nhật câu hỏi, danh mục, yêu thích và tags thành công', async () => {
      const dto = createSampleSerialDto();
      const created = await repository.create(dto);

      await repository.update(created.divination.id, {
        question: 'Dự án mới có thuận lợi không?',
        inquiryType: 'finance',
        starred: false,
        tags: ['tai-chinh', 'dau-tu'],
      });

      const updated = await repository.getById(created.divination.id);
      expect(updated?.divination.question).toBe('Dự án mới có thuận lợi không?');
      expect(updated?.divination.inquiryType).toBe('finance');
      expect(updated?.divination.starred).toBe(false);
      expect(updated?.divination.tags).toEqual(['tai-chinh', 'dau-tu']);
    });

    it('delete() xóa quẻ và tự động cascade xóa bảng kết quả, phân tích, ghi chú', async () => {
      const dto = createSampleSerialDto();
      const created = await repository.create(dto);
      const divId = created.divination.id;

      // Xác nhận các bảng con có dữ liệu
      const resBefore = await db.getAllAsync('SELECT * FROM divination_results WHERE divination_id = ?;', [divId]);
      const anaBefore = await db.getAllAsync('SELECT * FROM divination_analyses WHERE divination_id = ?;', [divId]);
      const noteBefore = await db.getAllAsync('SELECT * FROM divination_notes WHERE divination_id = ?;', [divId]);
      expect(resBefore.length).toBe(1);
      expect(anaBefore.length).toBe(1);
      expect(noteBefore.length).toBe(1);

      // Thực hiện xóa
      await repository.delete(divId);

      // Kiểm tra getById
      const fetched = await repository.getById(divId);
      expect(fetched).toBeNull();

      // Kiểm tra bảng con đã sạch
      const resAfter = await db.getAllAsync('SELECT * FROM divination_results WHERE divination_id = ?;', [divId]);
      const anaAfter = await db.getAllAsync('SELECT * FROM divination_analyses WHERE divination_id = ?;', [divId]);
      const noteAfter = await db.getAllAsync('SELECT * FROM divination_notes WHERE divination_id = ?;', [divId]);
      expect(resAfter.length).toBe(0);
      expect(anaAfter.length).toBe(0);
      expect(noteAfter.length).toBe(0);
    });
  });

  // =========================================================================
  // 4. Notes CRUD & Nghiệm Lý
  // =========================================================================
  describe('Notes & Outcome Verification CRUD', () => {
    it('thêm, cập nhật kết quả nghiệm lý và xóa ghi chú', async () => {
      const dto: CreateDivinationDto = {
        method: CastingMethod.MAI_HUA,
        algorithmVersion: 'MAI-HUA-V1',
        ruleSetId: 'MAI-HUA-STANDARD',
        input: { method: CastingMethod.MAI_HUA, dateTime: '2026-10-31T08:00:00.000Z' },
        dateTimeInfo: {
          solarDateTime: '2026-10-31T08:00:00.000Z',
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 21,
          lunarHourBranch: 'Thìn',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Mậu Tuất',
          dayCanChi: 'Canh Tý',
          hourCanChi: 'Canh Thìn',
        },
        trio: castByMaiHua({
          yearBranch: 7, // Ngọ
          month: 9,
          day: 21,
          hourBranch: 5, // Thìn
        }).trio,
        question: 'Hỏi về việc mua nhà',
      };

      const created = await repository.create(dto);
      const divId = created.divination.id;

      // 1. Thêm ghi chú mới
      const note1 = await repository.addNote(divId, 'Đã đặt cọc 100 triệu.');
      expect(note1.id).toBeDefined();
      expect(note1.content).toBe('Đã đặt cọc 100 triệu.');
      expect(note1.isVerified).toBe(false);

      // 2. Thêm ghi chú thứ 2 kèm nghiệm lý
      const note2 = await repository.addNote(
        divId,
        'Giao dịch hoàn tất đúng dự kiến.',
        'Mua được căn nhà giá tốt, giấy tờ suôn sẻ.'
      );
      expect(note2.isVerified).toBe(true);
      expect(note2.actualOutcome).toBe('Mua được căn nhà giá tốt, giấy tờ suôn sẻ.');

      // 3. Lấy danh sách ghi chú
      const notes = await repository.getNotesByDivinationId(divId);
      expect(notes.length).toBe(2);

      // 4. Cập nhật ghi chú 1
      await repository.updateNote(note1.id, 'Đã đặt cọc 150 triệu thay vì 100.', 'Chủ nhà đồng ý.');
      const updatedNotes = await repository.getNotesByDivinationId(divId);
      const updatedNote1 = updatedNotes.find((n) => n.id === note1.id);
      expect(updatedNote1?.content).toBe('Đã đặt cọc 150 triệu thay vì 100.');
      expect(updatedNote1?.actualOutcome).toBe('Chủ nhà đồng ý.');
      expect(updatedNote1?.isVerified).toBe(true);

      // 5. Xóa ghi chú 2
      await repository.deleteNote(note2.id);
      const remainingNotes = await repository.getNotesByDivinationId(divId);
      expect(remainingNotes.length).toBe(1);
      expect(remainingNotes[0]?.id).toBe(note1.id);
    });
  });

  // =========================================================================
  // 5. Filtering, Pagination & Vietnamese Search
  // =========================================================================
  describe('Filtering, Pagination & Vietnamese Search', () => {
    beforeEach(async () => {
      // Quẻ 1: Seri tiền - Công việc - Yêu thích
      const serialRes1 = castBySerial('112233');
      await repository.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
        input: { method: CastingMethod.SERIAL, serialNumber: '112233' },
        dateTimeInfo: {
          solarDateTime: '2026-10-31T08:00:00.000Z',
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 21,
          lunarHourBranch: 'Tý',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Bính Tuất',
          dayCanChi: 'Canh Tý',
          hourCanChi: 'Bính Tý',
        },
        trio: serialRes1.trio,
        question: 'Thi đỗ chứng chỉ chuyên môn không?',
        inquiryType: 'study',
        tags: ['hoc-tap', 'thi-cu'],
        starred: true,
      });

      // Quẻ 2: Mai Hoa - Tài chính - Không yêu thích
      const maihuaRes = castByMaiHua({ yearBranch: 7, month: 9, day: 21, hourBranch: 5 });
      await repository.create({
        method: CastingMethod.MAI_HUA,
        algorithmVersion: 'MAI-HUA-V1',
        ruleSetId: 'MAI-HUA-STANDARD',
        input: { method: CastingMethod.MAI_HUA, dateTime: '2026-10-30T08:00:00.000Z' },
        dateTimeInfo: {
          solarDateTime: '2026-10-30T08:00:00.000Z',
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 20,
          lunarHourBranch: 'Hợi',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Bính Tuất',
          dayCanChi: 'Kỷ Hợi',
          hourCanChi: 'Ất Hợi',
        },
        trio: maihuaRes.trio,
        question: 'Đầu tư cổ phiếu tháng này có sinh lời không?',
        inquiryType: 'finance',
        tags: ['tai-chinh', 'chung-khoan'],
        starred: false,
      });

      // Quẻ 3: Seri tiền - Gia đình - Yêu thích
      const serialRes2 = castBySerial('889900');
      await repository.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: SIX_YAO_DEFAULT_RULESET_ID,
        input: { method: CastingMethod.SERIAL, serialNumber: '889900' },
        dateTimeInfo: {
          solarDateTime: '2026-10-29T08:00:00.000Z',
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 19,
          lunarHourBranch: 'Tuất',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Bính Tuất',
          dayCanChi: 'Mậu Tuất',
          hourCanChi: 'Giáp Tuất',
        },
        trio: serialRes2.trio,
        question: 'Sức khỏe người thân thế nào?',
        inquiryType: 'family',
        tags: ['gia-dinh', 'suc-khoe'],
        starred: true,
      });
    });

    it('list() lọc theo phương pháp lập quẻ (method)', async () => {
      const serials = await repository.list({ method: CastingMethod.SERIAL });
      expect(serials.totalCount).toBe(2);
      expect(serials.items.every((i) => i.method === CastingMethod.SERIAL)).toBe(true);

      const maihuas = await repository.list({ method: CastingMethod.MAI_HUA });
      expect(maihuas.totalCount).toBe(1);
      expect(maihuas.items[0]?.method).toBe(CastingMethod.MAI_HUA);
    });

    it('list() lọc theo danh mục câu hỏi (inquiryType)', async () => {
      const studyItems = await repository.list({ inquiryType: 'study' });
      expect(studyItems.totalCount).toBe(1);
      expect(studyItems.items[0]?.question).toContain('chứng chỉ');

      const financeItems = await repository.list({ inquiryType: 'finance' });
      expect(financeItems.totalCount).toBe(1);
      expect(financeItems.items[0]?.question).toContain('cổ phiếu');
    });

    it('list() lọc theo mục yêu thích (starred)', async () => {
      const starredItems = await repository.list({ starred: true });
      expect(starredItems.totalCount).toBe(2);

      const nonStarredItems = await repository.list({ starred: false });
      expect(nonStarredItems.totalCount).toBe(1);
    });

    it('list() hỗ trợ phân trang (page, pageSize)', async () => {
      const page1 = await repository.list(undefined, { page: 1, pageSize: 2 });
      expect(page1.items.length).toBe(2);
      expect(page1.totalCount).toBe(3);
      expect(page1.totalPages).toBe(2);

      const page2 = await repository.list(undefined, { page: 2, pageSize: 2 });
      expect(page2.items.length).toBe(1);
    });

    it('search() tìm kiếm tiếng Việt không dấu trên câu hỏi', async () => {
      // Tìm "chung chi" sẽ khớp "Thi đỗ chứng chỉ chuyên môn không?"
      const res = await repository.search('chung chi');
      expect(res.totalCount).toBe(1);
      expect(res.items[0]?.question).toBe('Thi đỗ chứng chỉ chuyên môn không?');

      // Tìm "co phieu" sẽ khớp "Đầu tư cổ phiếu tháng này có sinh lời không?"
      const resFinance = await repository.search('co phieu');
      expect(resFinance.totalCount).toBe(1);
      expect(resFinance.items[0]?.inquiryType).toBe('finance');
    });

    it('search() tìm kiếm trên Can Chi ngày và tags', async () => {
      // Tìm "canh ty"
      const resCanChi = await repository.search('canh ty');
      expect(resCanChi.totalCount).toBe(1);
      expect(resCanChi.items[0]?.dayCanChi).toBe('Canh Tý');

      // Tìm tag "thi-cu"
      const resTag = await repository.search('thi-cu');
      expect(resTag.totalCount).toBe(1);
    });
  });
});
