import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';
import {
  CastingMethod,
  Element,
  getHexagramById,
  HexagramTrio,
  DivinationDateTime,
  CreateDivinationDto,
} from '@kindich/domain';
import { KinDichDatabase } from '../db/kindich.db';
import { DexieDivinationRepository, normalizeVietnamese } from './dexie-divination.repository';

describe('DexieDivinationRepository & IndexedDB Database Layer', () => {
  let db: KinDichDatabase;
  let repo: DexieDivinationRepository;
  let testDbName: string;

  // Lấy quẻ mẫu để tạo dữ liệu test
  const hex1 = getHexagramById(1)!; // Càn Vi Thiên
  const hex44 = getHexagramById(44)!; // Thiên Phong Cấu
  const hex2 = getHexagramById(2)!; // Khôn Vi Địa

  const sampleTrio: HexagramTrio = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1],
    hasMovingLines: true,
  };

  const sampleDateTime: DivinationDateTime = {
    solarDateTime: '2026-10-30T21:45:00.000Z',
    lunarYear: 2026,
    lunarMonth: 9,
    lunarDay: 15,
    lunarHourBranch: 'Hợi',
    yearCanChi: 'Bính Ngọ',
    monthCanChi: 'Mậu Tuất',
    dayCanChi: 'Ất Mão',
    hourCanChi: 'Đinh Hợi',
    solarTerm: 'Sương Giáng',
    voidBranches: ['Thân', 'Dậu'],
  };

  beforeEach(() => {
    testDbName = `kindich_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    db = new KinDichDatabase(testDbName);
    repo = new DexieDivinationRepository(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  describe('Chuẩn hóa tiếng Việt (normalizeVietnamese)', () => {
    it('chuẩn hóa chính xác chuỗi có dấu về không dấu chữ thường', () => {
      expect(normalizeVietnamese('Càn Vi Thiên')).toBe('can vi thien');
      expect(normalizeVietnamese('Hỏi sức khỏe & công việc')).toBe('hoi suc khoe & cong viec');
      expect(normalizeVietnamese('Đinh Mão')).toBe('dinh mao');
      expect(normalizeVietnamese('')).toBe('');
    });
  });

  describe('Tạo mới và Lưu trữ (Create & Result Snapshot)', () => {
    it('lưu đầy đủ dữ liệu vào 4 bảng và tự động tạo snapshot bất biến', async () => {
      const dto: CreateDivinationDto = {
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        question: 'Hỏi về thi cử đỗ đạt',
        inquiryType: 'exam',
        tags: ['thi_cu', 'hoc_tap'],
        input: {
          method: CastingMethod.SERIAL,
          serialNumber: '19864205',
          note: 'Tờ 500k',
        },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
        analysis: {
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SIX-YAO-V1',
          palaceId: 'CAN',
          palaceElement: Element.KIM,
          worldLine: 6,
          responseLine: 3,
          summary: 'Quẻ Càn Kim thuần dương thế hào 6',
          details: { strengthScore: 85, voidStatus: false },
        },
        initialNote: 'Tâm trạng hồi hộp trước ngày thi',
      };

      const result = await repo.create(dto);

      expect(result.divination.id).toBeDefined();
      expect(result.divination.method).toBe(CastingMethod.SERIAL);
      expect(result.divination.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.divination.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(result.divination.question).toBe('Hỏi về thi cử đỗ đạt');
      expect(result.divination.tags).toEqual(['thi_cu', 'hoc_tap']);
      expect(result.divination.starred).toBe(false);

      // Snapshot bất biến
      expect(result.resultSnapshot).toBeDefined();
      expect(result.resultSnapshot?.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(result.resultSnapshot?.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.resultSnapshot?.trio.primary.number).toBe(1);
      expect(result.resultSnapshot?.trio.transformed.number).toBe(44);
      expect(result.resultSnapshot?.dateTimeInfo.dayCanChi).toBe('Ất Mão');

      // Bảng kết quả (divination_results)
      expect(result.result).toBeDefined();
      expect(result.result?.primaryHexagramNumber).toBe(1);
      expect(result.result?.primaryHexagramName).toBe('Thuần Càn');
      expect(result.result?.primaryHexagramSinoVietnameseName).toBe('Càn vi Thiên');
      expect(result.result?.changingHexagramNumber).toBe(44);
      expect(result.result?.changingHexagramSinoVietnameseName).toBe('Thiên Phong Cấu');
      expect(result.result?.movingLines).toEqual([1]);

      // Bảng phân tích (divination_analyses)
      expect(result.analysis).toBeDefined();
      expect(result.analysis?.palaceId).toBe('CAN');
      expect(result.analysis?.palaceElement).toBe(Element.KIM);
      expect(result.analysis?.worldLine).toBe(6);
      expect(result.analysis?.responseLine).toBe(3);

      // Bảng ghi chú (divination_notes)
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0]?.content).toBe('Tâm trạng hồi hộp trước ngày thi');

      // Kiểm tra trực tiếp trong các bảng Dexie
      const storedDiv = await db.divinations.get(result.divination.id);
      const storedRes = await db.divination_results.where('divinationId').equals(result.divination.id).first();
      const storedAn = await db.divination_analyses.where('divinationId').equals(result.divination.id).first();
      const storedNotes = await db.divination_notes.where('divinationId').equals(result.divination.id).toArray();

      expect(storedDiv).toBeDefined();
      expect(storedRes).toBeDefined();
      expect(storedAn).toBeDefined();
      expect(storedNotes).toHaveLength(1);
    });

    it('bảo toàn resultSnapshot được cung cấp riêng biệt để không phụ thuộc thuật toán tương lai', async () => {
      const customSnapshot = {
        recordedAt: '2026-01-01T00:00:00.000Z',
        ruleSetId: 'LEGACY_RULESET_V0',
        algorithmVersion: 'LEGACY_ALGO_V0',
        trio: sampleTrio,
        dateTimeInfo: sampleDateTime,
        analysis: { legacyText: 'Diễn giải theo sách cổ' },
      };

      const dto: CreateDivinationDto = {
        method: CastingMethod.MAI_HUA,
        algorithmVersion: 'MAI-HUA-V1',
        ruleSetId: 'STANDARD_V1',
        input: {
          method: CastingMethod.MAI_HUA,
          dateTime: '2026-10-30T21:45:00.000Z',
        },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
        resultSnapshot: customSnapshot,
      };

      const result = await repo.create(dto);
      expect(result.resultSnapshot?.ruleSetId).toBe('LEGACY_RULESET_V0');
      expect(result.resultSnapshot?.recordedAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('Đọc chi tiết theo ID (Get By ID)', () => {
    it('trả về DivinationDetailAggregate đầy đủ các quan hệ', async () => {
      const created = await repo.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
        question: 'Xem sức khỏe',
        initialNote: 'Ghi chú ban đầu',
      });

      const fetched = await repo.getById(created.divination.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.divination.id).toBe(created.divination.id);
      expect(fetched?.result?.primaryHexagramNumber).toBe(1);
      expect(fetched?.notes).toHaveLength(1);
      expect(fetched?.notes[0]?.content).toBe('Ghi chú ban đầu');
      expect(fetched?.resultSnapshot).toBeDefined();
    });

    it('trả về null nếu ID không tồn tại', async () => {
      const nonExistent = await repo.getById('non-existent-id');
      expect(nonExistent).toBeNull();
    });
  });

  describe('Cập nhật (Update)', () => {
    it('cập nhật thành công câu hỏi, tags, yêu thích và thời gian updatedAt', async () => {
      const created = await repo.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
        question: 'Câu hỏi ban đầu',
        tags: ['cu'],
        starred: false,
      });

      // Đợi một khoảng ngắn để updatedAt khác createdAt
      await new Promise((r) => setTimeout(r, 10));

      await repo.update(created.divination.id, {
        question: 'Câu hỏi mới đã cập nhật',
        inquiryType: 'business',
        tags: ['moi', 'kinh_doanh'],
        starred: true,
      });

      const updated = await repo.getById(created.divination.id);
      expect(updated?.divination.question).toBe('Câu hỏi mới đã cập nhật');
      expect(updated?.divination.inquiryType).toBe('business');
      expect(updated?.divination.tags).toEqual(['moi', 'kinh_doanh']);
      expect(updated?.divination.starred).toBe(true);
      expect(updated?.divination.updatedAt).not.toBe(created.divination.createdAt);
    });

    it('báo lỗi nếu ID không tồn tại khi cập nhật', async () => {
      await expect(repo.update('invalid-id', { question: 'Test' })).rejects.toThrow(
        'Không tìm thấy lần lập quẻ có ID "invalid-id".'
      );
    });
  });

  describe('Xóa và Cascade Delete (Delete)', () => {
    it('xóa triệt để bản ghi trong cả 4 bảng khi gọi delete', async () => {
      const created = await repo.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
        analysis: {
          palaceId: 'CAN',
          palaceElement: Element.KIM,
          worldLine: 6,
          responseLine: 3,
          details: {},
        },
        initialNote: 'Ghi chú sẽ bị xóa',
      });

      const divId = created.divination.id;

      // Xác nhận cả 4 bảng đều có dữ liệu
      expect(await db.divinations.get(divId)).toBeDefined();
      expect(await db.divination_results.where('divinationId').equals(divId).count()).toBe(1);
      expect(await db.divination_analyses.where('divinationId').equals(divId).count()).toBe(1);
      expect(await db.divination_notes.where('divinationId').equals(divId).count()).toBe(1);

      // Thực thi xóa
      await repo.delete(divId);

      // Xác nhận tất cả bảng đã được dọn sạch
      expect(await db.divinations.get(divId)).toBeUndefined();
      expect(await db.divination_results.where('divinationId').equals(divId).count()).toBe(0);
      expect(await db.divination_analyses.where('divinationId').equals(divId).count()).toBe(0);
      expect(await db.divination_notes.where('divinationId').equals(divId).count()).toBe(0);

      // getById trả về null
      expect(await repo.getById(divId)).toBeNull();
    });
  });

  describe('Quản lý Ghi chú và Nghiệm lý (Notes Management)', () => {
    it('hỗ trợ thêm, sửa, nghiệm lý và xóa ghi chú', async () => {
      const created = await repo.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
        dateTimeInfo: sampleDateTime,
        trio: sampleTrio,
      });

      const divId = created.divination.id;

      // 1. Thêm ghi chú
      const note1 = await repo.addNote(divId, 'Dự đoán sẽ thi đậu vào tháng 10');
      expect(note1.id).toBeDefined();
      expect(note1.content).toBe('Dự đoán sẽ thi đậu vào tháng 10');
      expect(note1.isVerified).toBe(false);

      // 2. Lấy danh sách ghi chú
      const notes = await repo.getNotesByDivinationId(divId);
      expect(notes).toHaveLength(1);
      expect(notes[0]?.id).toBe(note1.id);

      // 3. Cập nhật kết quả nghiệm lý thực tế
      await repo.updateNote(
        note1.id,
        'Dự đoán sẽ thi đậu vào tháng 10 (đã có kết quả)',
        'Đã nhận giấy báo trúng tuyển thủ khoa',
        true
      );

      const updatedNotes = await repo.getNotesByDivinationId(divId);
      expect(updatedNotes[0]?.content).toBe('Dự đoán sẽ thi đậu vào tháng 10 (đã có kết quả)');
      expect(updatedNotes[0]?.actualOutcome).toBe('Đã nhận giấy báo trúng tuyển thủ khoa');
      expect(updatedNotes[0]?.isVerified).toBe(true);

      // 4. Xóa ghi chú
      await repo.deleteNote(note1.id);
      const remainingNotes = await repo.getNotesByDivinationId(divId);
      expect(remainingNotes).toHaveLength(0);
    });

    it('báo lỗi khi thêm ghi chú vào quẻ không tồn tại', async () => {
      await expect(repo.addNote('non-existent', 'Test')).rejects.toThrow(
        'Không tìm thấy lần lập quẻ có ID "non-existent".'
      );
    });
  });

  describe('Tìm kiếm, Lọc và Phân trang (Search, Filter, Pagination)', () => {
    beforeEach(async () => {
      // Chuẩn bị 3 quẻ mẫu với các đặc điểm khác nhau
      await repo.create({
        id: 'div-01',
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        question: 'Hỏi về việc chuyển đổi công tác',
        tags: ['cong_viec', 'thang_tien'],
        input: { method: CastingMethod.SERIAL, serialNumber: '11111111' },
        dateTimeInfo: sampleDateTime,
        trio: {
          primary: hex1, // Càn Vi Thiên (1)
          transformed: hex44, // Thiên Phong Cấu (44)
          nuclear: hex1,
          movingLineIndices: [1],
          hasMovingLines: true,
        },
        starred: true,
        initialNote: 'Thầy khuyên cẩn trọng vào ngày Dần',
      });

      await repo.create({
        id: 'div-02',
        method: CastingMethod.MAI_HUA,
        algorithmVersion: 'MAI-HUA-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        question: 'Hỏi về sức khỏe cha mẹ',
        tags: ['gia_dao', 'suc_khoe'],
        input: { method: CastingMethod.MAI_HUA, dateTime: '2026-10-30T10:00:00.000Z' },
        dateTimeInfo: {
          ...sampleDateTime,
          dayCanChi: 'Đinh Mão',
        },
        trio: {
          primary: hex2, // Khôn Vi Địa (2)
          transformed: hex2,
          nuclear: hex2,
          movingLineIndices: [],
          hasMovingLines: false,
        },
        starred: false,
      });

      await repo.create({
        id: 'div-03',
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        question: 'Đầu tư tài chính ngắn hạn',
        tags: ['tai_chinh', 'dau_tu'],
        input: { method: CastingMethod.SERIAL, serialNumber: '33333333' },
        dateTimeInfo: sampleDateTime,
        trio: {
          primary: hex44, // Thiên Phong Cấu (44)
          transformed: hex1, // Càn Vi Thiên (1)
          nuclear: hex1,
          movingLineIndices: [1],
          hasMovingLines: true,
        },
        starred: true,
      });
    });

    it('tìm kiếm tiếng Việt không dấu khớp chính xác câu hỏi và tên quẻ', async () => {
      // Tìm câu hỏi "suc khoe" (không dấu)
      const res1 = await repo.search('suc khoe');
      expect(res1.totalCount).toBe(1);
      expect(res1.items[0]?.id).toBe('div-02');
      expect(res1.items[0]?.question).toBe('Hỏi về sức khỏe cha mẹ');

      // Tìm tên Hán Việt của quẻ "can vi thien" (Càn vi Thiên)
      const res2 = await repo.search('can vi thien');
      // div-01 có primary là Càn vi Thiên, div-03 có transformed là Càn vi Thiên
      expect(res2.totalCount).toBeGreaterThanOrEqual(1);
      expect(res2.items.some((it) => it.id === 'div-01')).toBe(true);

      // Tìm trong ghi chú: "cẩn trọng"
      const res3 = await repo.search('can trong');
      expect(res3.totalCount).toBe(1);
      expect(res3.items[0]?.id).toBe('div-01');

      // Tìm Can Chi "Dinh Mao"
      const res4 = await repo.search('dinh mao');
      expect(res4.totalCount).toBe(1);
      expect(res4.items[0]?.id).toBe('div-02');
    });

    it('lọc chính xác theo phương pháp lập quẻ', async () => {
      const serialRes = await repo.list({ method: CastingMethod.SERIAL });
      expect(serialRes.totalCount).toBe(2);
      expect(serialRes.items.every((it) => it.method === CastingMethod.SERIAL)).toBe(true);

      const maiHuaRes = await repo.list({ method: CastingMethod.MAI_HUA });
      expect(maiHuaRes.totalCount).toBe(1);
      expect(maiHuaRes.items[0]?.method).toBe(CastingMethod.MAI_HUA);
    });

    it('lọc theo quẻ yêu thích (starred)', async () => {
      const starredRes = await repo.list({ starred: true });
      expect(starredRes.totalCount).toBe(2);
      expect(starredRes.items.every((it) => it.starred === true)).toBe(true);

      const unstarredRes = await repo.list({ starred: false });
      expect(unstarredRes.totalCount).toBe(1);
      expect(unstarredRes.items[0]?.starred).toBe(false);
    });

    it('lọc theo số thứ tự quẻ (hexagramNumber)', async () => {
      // Quẻ số 2 (Khôn Vi Địa)
      const hex2Res = await repo.list({ hexagramNumber: 2 });
      expect(hex2Res.totalCount).toBe(1);
      expect(hex2Res.items[0]?.primaryHexagramNumber).toBe(2);

      // Quẻ số 44 (Thiên Phong Cấu) xuất hiện ở div-01 (biến) và div-03 (chủ)
      const hex44Res = await repo.list({ hexagramNumber: 44 });
      expect(hex44Res.totalCount).toBe(2);
    });

    it('lọc theo tags', async () => {
      const tagRes = await repo.list({ tags: ['tai_chinh'] });
      expect(tagRes.totalCount).toBe(1);
      expect(tagRes.items[0]?.id).toBe('div-03');
    });

    it('hỗ trợ phân trang và tính toán tổng số trang chính xác', async () => {
      // Page size = 2 trên tổng số 3 bản ghi -> 2 trang
      const page1 = await repo.list(undefined, { page: 1, pageSize: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.totalCount).toBe(3);
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(2);
      expect(page1.totalPages).toBe(2);

      const page2 = await repo.list(undefined, { page: 2, pageSize: 2 });
      expect(page2.items).toHaveLength(1);
      expect(page2.page).toBe(2);
      expect(page2.totalPages).toBe(2);
    });
  });

  describe('Kiểm tra Migration (Schema Upgrade)', () => {
    it('nâng cấp từ Version 1 lên Version 2 bổ sung ruleSetId và migration cho bản ghi cũ', async () => {
      const migrationDbName = `migration_test_${Date.now()}`;

      // 1. Mở database ở Version 1 thuần túy
      const v1Db = new Dexie(migrationDbName);
      v1Db.version(1).stores({
        divinations: 'id, createdAt, updatedAt, method, inquiryType, [method+createdAt], *tags',
        divination_results: 'id, divinationId, primaryHexagramNumber, changingHexagramNumber, [divinationId+createdAt]',
        divination_analyses: 'id, divinationId, ruleSetId, algorithmVersion, palaceId',
        divination_notes: 'id, divinationId, createdAt, updatedAt, [divinationId+createdAt]',
      });

      await v1Db.open();

      // Thêm bản ghi ở Version 1 (không có ruleSetId trong divinations, không có isVerified trong notes)
      await v1Db.table('divinations').add({
        id: 'legacy-div-01',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        input: { method: CastingMethod.SERIAL, serialNumber: '99999999' },
        dateTimeInfo: sampleDateTime,
      });

      await v1Db.table('divination_notes').add({
        id: 'legacy-note-01',
        divinationId: 'legacy-div-01',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        content: 'Ghi chú thời V1',
      });

      await v1Db.close();

      // 2. Mở cơ sở dữ liệu bằng KinDichDatabase (đã tích hợp Version 2 + migration upgrade)
      const v2Db = new KinDichDatabase(migrationDbName);
      await v2Db.open();

      // Kiểm tra bản ghi cũ đã được migration bổ sung giá trị mặc định
      const migratedDiv = await v2Db.divinations.get('legacy-div-01');
      expect(migratedDiv).toBeDefined();
      expect(migratedDiv?.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(migratedDiv?.starred).toBe(false);

      const migratedNote = await v2Db.divination_notes.get('legacy-note-01');
      expect(migratedNote).toBeDefined();
      expect(migratedNote?.isVerified).toBe(false);

      // Thử query qua index mới `ruleSetId` được thêm ở version 2
      const count = await v2Db.divinations.where('ruleSetId').equals('BO_PHE_CHINH_TONG_V1').count();
      expect(count).toBeGreaterThanOrEqual(1);

      await v2Db.delete();
    });
  });
});
