import {
  CastingMethod,
  CreateDivinationDto,
  DivinationAnalysisEntity,
  DivinationDetailAggregate,
  DivinationEntity,
  DivinationFilterOptions,
  DivinationNoteEntity,
  DivinationResultEntity,
  DivinationResultSnapshot,
  DivinationSummaryItem,
  IDivinationRepository,
  PaginatedResult,
  PaginationParams,
  UpdateDivinationDto,
} from '@kindich/domain';
import {
  ISqliteDatabase,
  DivinationRow,
  DivinationResultRow,
  DivinationAnalysisRow,
  DivinationNoteRow,
} from './sqlite.types';
import { runMigrations } from './migrations';

/**
 * Chuẩn hóa chuỗi tiếng Việt phục vụ tìm kiếm không dấu
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Sinh UUID ngẫu nhiên tương thích Mobile và Node.js
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Repository Adapter triển khai trên SQLite dành cho nền tảng Mobile (React Native / Expo)
 * Đảm bảo hoạt động hoàn toàn offline, độc lập và tuân thủ chặt chẽ IDivinationRepository
 */
export class SqliteDivinationRepository implements IDivinationRepository {
  private readonly db: ISqliteDatabase;
  private isInitialized = false;

  constructor(db: ISqliteDatabase) {
    this.db = db;
  }

  /**
   * Đảm bảo các bảng và migrations đã sẵn sàng trước khi truy vấn
   */
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await runMigrations(this.db);
      this.isInitialized = true;
    }
  }

  /**
   * Tạo và lưu mới một phiên lập quẻ cùng kết quả, phân tích và snapshot
   */
  async create(dto: CreateDivinationDto): Promise<DivinationDetailAggregate> {
    await this.initialize();
    const divinationId = dto.id ?? generateUUID();
    const now = new Date().toISOString();

    // Lưu snapshot bất biến của kết quả tính toán tại thời điểm gieo
    const resultSnapshot: DivinationResultSnapshot = dto.resultSnapshot ?? {
      recordedAt: now,
      ruleSetId: dto.ruleSetId,
      algorithmVersion: dto.algorithmVersion,
      trio: dto.trio,
      dateTimeInfo: dto.dateTimeInfo,
      analysis: dto.analysis?.details,
    };

    const divinationEntity: DivinationEntity = {
      id: divinationId,
      createdAt: now,
      updatedAt: now,
      method: dto.method,
      algorithmVersion: dto.algorithmVersion,
      ruleSetId: dto.ruleSetId,
      input: dto.input,
      dateTimeInfo: dto.dateTimeInfo,
      question: dto.question?.trim() || undefined,
      inquiryType: dto.inquiryType?.trim() || undefined,
      tags: dto.tags ? [...dto.tags] : [],
      starred: dto.starred ?? false,
      resultSnapshot,
    };

    const resultEntity: DivinationResultEntity = {
      id: generateUUID(),
      divinationId,
      createdAt: now,
      primaryHexagramNumber: dto.trio.primary.number,
      primaryHexagramName: dto.trio.primary.name,
      primaryHexagramSinoVietnameseName: dto.trio.primary.sinoVietnameseName,
      changingHexagramNumber: dto.trio.transformed?.number,
      changingHexagramName: dto.trio.transformed?.name,
      changingHexagramSinoVietnameseName: dto.trio.transformed?.sinoVietnameseName,
      nuclearHexagramNumber: dto.trio.nuclear?.number,
      nuclearHexagramName: dto.trio.nuclear?.name,
      movingLines: [...dto.trio.movingLineIndices],
      trio: dto.trio,
    };

    let analysisEntity: DivinationAnalysisEntity | undefined;
    if (dto.analysis) {
      analysisEntity = {
        id: generateUUID(),
        divinationId,
        createdAt: now,
        ruleSetId: dto.analysis.ruleSetId ?? dto.ruleSetId,
        algorithmVersion: dto.analysis.algorithmVersion ?? dto.algorithmVersion,
        palaceId: dto.analysis.palaceId,
        palaceElement: dto.analysis.palaceElement,
        worldLine: dto.analysis.worldLine,
        responseLine: dto.analysis.responseLine,
        summary: dto.analysis.summary,
        details: dto.analysis.details,
      };
    }

    let initialNoteEntity: DivinationNoteEntity | undefined;
    if (dto.initialNote && dto.initialNote.trim().length > 0) {
      initialNoteEntity = {
        id: generateUUID(),
        divinationId,
        createdAt: now,
        updatedAt: now,
        content: dto.initialNote.trim(),
        isVerified: false,
      };
    }

    // Thực thi lưu phân tán vào 4 bảng trong 1 transaction an toàn
    await this.db.withTransactionAsync(async () => {
      // 1. Insert divinations
      await this.db.runAsync(
        `INSERT INTO divinations (
          id, created_at, updated_at, method, algorithm_version, rule_set_id,
          input, date_time_info, question, inquiry_type, tags, starred, result_snapshot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          divinationEntity.id,
          divinationEntity.createdAt,
          divinationEntity.updatedAt,
          divinationEntity.method,
          divinationEntity.algorithmVersion,
          divinationEntity.ruleSetId,
          JSON.stringify(divinationEntity.input),
          JSON.stringify(divinationEntity.dateTimeInfo),
          divinationEntity.question ?? null,
          divinationEntity.inquiryType ?? null,
          divinationEntity.tags ? JSON.stringify(divinationEntity.tags) : null,
          divinationEntity.starred ? 1 : 0,
          JSON.stringify(resultSnapshot),
        ]
      );

      // 2. Insert divination_results
      await this.db.runAsync(
        `INSERT INTO divination_results (
          id, divination_id, created_at, primary_hexagram_number, primary_hexagram_name,
          primary_hexagram_sino_vietnamese_name, changing_hexagram_number, changing_hexagram_name,
          changing_hexagram_sino_vietnamese_name, nuclear_hexagram_number, nuclear_hexagram_name,
          moving_lines, trio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          resultEntity.id,
          resultEntity.divinationId,
          resultEntity.createdAt,
          resultEntity.primaryHexagramNumber,
          resultEntity.primaryHexagramName,
          resultEntity.primaryHexagramSinoVietnameseName ?? null,
          resultEntity.changingHexagramNumber ?? null,
          resultEntity.changingHexagramName ?? null,
          resultEntity.changingHexagramSinoVietnameseName ?? null,
          resultEntity.nuclearHexagramNumber ?? null,
          resultEntity.nuclearHexagramName ?? null,
          JSON.stringify(resultEntity.movingLines),
          JSON.stringify(resultEntity.trio),
        ]
      );

      // 3. Insert divination_analyses (nếu có)
      if (analysisEntity) {
        await this.db.runAsync(
          `INSERT INTO divination_analyses (
            id, divination_id, created_at, rule_set_id, algorithm_version,
            palace_id, palace_element, world_line, response_line, summary, details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            analysisEntity.id,
            analysisEntity.divinationId,
            analysisEntity.createdAt,
            analysisEntity.ruleSetId,
            analysisEntity.algorithmVersion,
            analysisEntity.palaceId,
            analysisEntity.palaceElement,
            analysisEntity.worldLine,
            analysisEntity.responseLine,
            analysisEntity.summary ?? null,
            JSON.stringify(analysisEntity.details),
          ]
        );
      }

      // 4. Insert initial note (nếu có)
      if (initialNoteEntity) {
        await this.db.runAsync(
          `INSERT INTO divination_notes (
            id, divination_id, created_at, updated_at, content, actual_outcome, is_verified
          ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            initialNoteEntity.id,
            initialNoteEntity.divinationId,
            initialNoteEntity.createdAt,
            initialNoteEntity.updatedAt,
            initialNoteEntity.content,
            initialNoteEntity.actualOutcome ?? null,
            initialNoteEntity.isVerified ? 1 : 0,
          ]
        );
      }
    });

    return {
      divination: divinationEntity,
      result: resultEntity,
      analysis: analysisEntity,
      notes: initialNoteEntity ? [initialNoteEntity] : [],
      resultSnapshot,
    };
  }

  /**
   * Lấy chi tiết toàn bộ thông tin quẻ theo ID
   */
  async getById(id: string): Promise<DivinationDetailAggregate | null> {
    await this.initialize();

    const divRow = await this.db.getFirstAsync<DivinationRow>(
      'SELECT * FROM divinations WHERE id = ?;',
      [id]
    );
    if (!divRow) return null;

    const [resRow, anaRow, noteRows] = await Promise.all([
      this.db.getFirstAsync<DivinationResultRow>(
        'SELECT * FROM divination_results WHERE divination_id = ?;',
        [id]
      ),
      this.db.getFirstAsync<DivinationAnalysisRow>(
        'SELECT * FROM divination_analyses WHERE divination_id = ?;',
        [id]
      ),
      this.db.getAllAsync<DivinationNoteRow>(
        'SELECT * FROM divination_notes WHERE divination_id = ? ORDER BY created_at ASC;',
        [id]
      ),
    ]);

    const divination: DivinationEntity = {
      id: divRow.id,
      createdAt: divRow.created_at,
      updatedAt: divRow.updated_at,
      method: divRow.method as CastingMethod,
      algorithmVersion: divRow.algorithm_version,
      ruleSetId: divRow.rule_set_id,
      input: JSON.parse(divRow.input),
      dateTimeInfo: JSON.parse(divRow.date_time_info),
      question: divRow.question ?? undefined,
      inquiryType: divRow.inquiry_type ?? undefined,
      tags: divRow.tags ? JSON.parse(divRow.tags) : [],
      starred: divRow.starred === 1,
      resultSnapshot: divRow.result_snapshot ? JSON.parse(divRow.result_snapshot) : undefined,
    };

    let result: DivinationResultEntity | undefined;
    if (resRow) {
      result = {
        id: resRow.id,
        divinationId: resRow.divination_id,
        createdAt: resRow.created_at,
        primaryHexagramNumber: resRow.primary_hexagram_number,
        primaryHexagramName: resRow.primary_hexagram_name,
        primaryHexagramSinoVietnameseName: resRow.primary_hexagram_sino_vietnamese_name ?? undefined,
        changingHexagramNumber: resRow.changing_hexagram_number ?? undefined,
        changingHexagramName: resRow.changing_hexagram_name ?? undefined,
        changingHexagramSinoVietnameseName: resRow.changing_hexagram_sino_vietnamese_name ?? undefined,
        nuclearHexagramNumber: resRow.nuclear_hexagram_number ?? undefined,
        nuclearHexagramName: resRow.nuclear_hexagram_name ?? undefined,
        movingLines: JSON.parse(resRow.moving_lines),
        trio: JSON.parse(resRow.trio),
      };
    }

    let analysis: DivinationAnalysisEntity | undefined;
    if (anaRow) {
      analysis = {
        id: anaRow.id,
        divinationId: anaRow.divination_id,
        createdAt: anaRow.created_at,
        ruleSetId: anaRow.rule_set_id,
        algorithmVersion: anaRow.algorithm_version,
        palaceId: anaRow.palace_id,
        palaceElement: anaRow.palace_element as any,
        worldLine: anaRow.world_line,
        responseLine: anaRow.response_line,
        summary: anaRow.summary ?? undefined,
        details: JSON.parse(anaRow.details),
      };
    }

    const notes: DivinationNoteEntity[] = noteRows.map((n) => ({
      id: n.id,
      divinationId: n.divination_id,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      content: n.content,
      actualOutcome: n.actual_outcome ?? undefined,
      isVerified: n.is_verified === 1,
    }));

    return {
      divination,
      result,
      analysis,
      notes,
      resultSnapshot: divination.resultSnapshot,
    };
  }

  /**
   * Cập nhật thông tin quẻ (câu hỏi, tags, yêu thích...)
   */
  async update(id: string, dto: UpdateDivinationDto): Promise<void> {
    await this.initialize();
    const existing = await this.db.getFirstAsync<DivinationRow>(
      'SELECT id, question, inquiry_type, tags, starred FROM divinations WHERE id = ?;',
      [id]
    );
    if (!existing) {
      throw new Error(`Không tìm thấy lần lập quẻ có ID "${id}".`);
    }

    const now = new Date().toISOString();
    const question = dto.question !== undefined ? (dto.question.trim() || null) : existing.question;
    const inquiryType = dto.inquiryType !== undefined ? (dto.inquiryType.trim() || null) : existing.inquiry_type;
    const tags = dto.tags !== undefined ? JSON.stringify(dto.tags) : existing.tags;
    const starred = dto.starred !== undefined ? (dto.starred ? 1 : 0) : existing.starred;

    await this.db.runAsync(
      `UPDATE divinations
       SET updated_at = ?, question = ?, inquiry_type = ?, tags = ?, starred = ?
       WHERE id = ?;`,
      [now, question, inquiryType, tags, starred, id]
    );
  }

  /**
   * Xóa quẻ và toàn bộ dữ liệu kết quả, phân tích, ghi chú liên quan (Cascade delete)
   */
  async delete(id: string): Promise<void> {
    await this.initialize();
    await this.db.withTransactionAsync(async () => {
      // Nhờ PRAGMA foreign_keys = ON; các bảng con cũng tự động được xóa, nhưng thực hiện dọn dẹp tường minh để an toàn tuyệt đối
      await this.db.runAsync('DELETE FROM divination_notes WHERE divination_id = ?;', [id]);
      await this.db.runAsync('DELETE FROM divination_analyses WHERE divination_id = ?;', [id]);
      await this.db.runAsync('DELETE FROM divination_results WHERE divination_id = ?;', [id]);
      await this.db.runAsync('DELETE FROM divinations WHERE id = ?;', [id]);
    });
  }

  /**
   * Liệt kê danh sách quẻ có hỗ trợ bộ lọc và phân trang
   */
  async list(
    filter?: DivinationFilterOptions,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<DivinationSummaryItem>> {
    await this.initialize();

    // Lấy toàn bộ divinations kết hợp với thông tin kết quả và số lượng ghi chú
    const sql = `
      SELECT
        d.id, d.created_at, d.updated_at, d.method, d.question, d.inquiry_type, d.tags, d.starred,
        d.date_time_info,
        r.primary_hexagram_number, r.primary_hexagram_name, r.primary_hexagram_sino_vietnamese_name,
        r.changing_hexagram_number, r.changing_hexagram_name, r.changing_hexagram_sino_vietnamese_name,
        r.moving_lines,
        a.palace_id, a.world_line, a.response_line,
        (SELECT COUNT(*) FROM divination_notes WHERE divination_id = d.id) as note_count
      FROM divinations d
      LEFT JOIN divination_results r ON d.id = r.divination_id
      LEFT JOIN divination_analyses a ON d.id = a.divination_id
      ORDER BY d.created_at DESC;
    `;

    const rawRows = await this.db.getAllAsync<any>(sql);

    // Lấy toàn bộ ghi chú phục vụ cho việc tìm kiếm text trong ghi chú nếu có filter.query
    let allNotesForSearch: Map<string, string[]> = new Map();
    if (filter?.query && filter.query.trim().length > 0) {
      const noteRows = await this.db.getAllAsync<{ divination_id: string; content: string }>(
        'SELECT divination_id, content FROM divination_notes;'
      );
      for (const n of noteRows) {
        const list = allNotesForSearch.get(n.divination_id) ?? [];
        list.push(n.content);
        allNotesForSearch.set(n.divination_id, list);
      }
    }

    // Lọc theo các tiêu chí nghiệp vụ
    const filtered = rawRows.filter((row) => {
      // 1. Phương pháp
      if (filter?.method && row.method !== filter.method) {
        return false;
      }
      // 2. Danh mục (inquiryType)
      if (filter?.inquiryType && row.inquiry_type !== filter.inquiryType) {
        return false;
      }
      // 3. Yêu thích (starred)
      if (filter?.starred !== undefined && (row.starred === 1) !== filter.starred) {
        return false;
      }
      // 4. Ngày bắt đầu
      if (filter?.startDate && row.created_at < filter.startDate) {
        return false;
      }
      // 5. Ngày kết thúc
      if (filter?.endDate && row.created_at > filter.endDate) {
        return false;
      }
      // 6. Số quẻ
      if (filter?.hexagramNumber !== undefined) {
        const matchesPrimary = row.primary_hexagram_number === filter.hexagramNumber;
        const matchesChanging = row.changing_hexagram_number === filter.hexagramNumber;
        if (!matchesPrimary && !matchesChanging) {
          return false;
        }
      }
      // 7. Tags
      if (filter?.tags && filter.tags.length > 0) {
        const rowTags: string[] = row.tags ? JSON.parse(row.tags) : [];
        const hasAllTags = filter.tags.every((t) => rowTags.includes(t));
        if (!hasAllTags) {
          return false;
        }
      }
      // 8. Từ khóa tìm kiếm (query)
      if (filter?.query && filter.query.trim().length > 0) {
        const queryNorm = normalizeVietnamese(filter.query);
        const questionNorm = normalizeVietnamese(row.question ?? '');
        const primaryNameNorm = normalizeVietnamese(row.primary_hexagram_name ?? '');
        const primarySinoNorm = normalizeVietnamese(row.primary_hexagram_sino_vietnamese_name ?? '');
        const changingNameNorm = normalizeVietnamese(row.changing_hexagram_name ?? '');
        const changingSinoNorm = normalizeVietnamese(row.changing_hexagram_sino_vietnamese_name ?? '');

        let dateTimeInfo: any = {};
        try {
          dateTimeInfo = row.date_time_info ? JSON.parse(row.date_time_info) : {};
        } catch {}
        const dayCanChiNorm = normalizeVietnamese(dateTimeInfo.dayCanChi ?? '');
        const monthCanChiNorm = normalizeVietnamese(dateTimeInfo.monthCanChi ?? '');

        const rowTags: string[] = row.tags ? JSON.parse(row.tags) : [];
        const tagsNorm = rowTags.map(normalizeVietnamese).join(' ');

        const notesList = allNotesForSearch.get(row.id) ?? [];
        const notesNorm = notesList.map(normalizeVietnamese).join(' ');

        const isMatch =
          questionNorm.includes(queryNorm) ||
          primaryNameNorm.includes(queryNorm) ||
          primarySinoNorm.includes(queryNorm) ||
          changingNameNorm.includes(queryNorm) ||
          changingSinoNorm.includes(queryNorm) ||
          dayCanChiNorm.includes(queryNorm) ||
          monthCanChiNorm.includes(queryNorm) ||
          tagsNorm.includes(queryNorm) ||
          notesNorm.includes(queryNorm);

        if (!isMatch) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp
    const sortBy = pagination?.sortBy ?? 'createdAt';
    const sortDirection = pagination?.sortDirection ?? 'desc';

    filtered.sort((a, b) => {
      const fieldA = sortBy === 'updatedAt' ? a.updated_at : a.created_at;
      const fieldB = sortBy === 'updatedAt' ? b.updated_at : b.created_at;
      if (sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB);
      }
      return fieldB.localeCompare(fieldA);
    });

    const totalCount = filtered.length;
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginatedRows = filtered.slice(offset, offset + pageSize);

    const items: DivinationSummaryItem[] = paginatedRows.map((r) => {
      let dt: any = {};
      try {
        dt = r.date_time_info ? JSON.parse(r.date_time_info) : {};
      } catch {}

      return {
        id: r.id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        method: r.method as CastingMethod,
        question: r.question ?? undefined,
        inquiryType: r.inquiry_type ?? undefined,
        tags: r.tags ? JSON.parse(r.tags) : [],
        primaryHexagramNumber: r.primary_hexagram_number,
        primaryHexagramName: r.primary_hexagram_name,
        primaryHexagramSinoVietnameseName: r.primary_hexagram_sino_vietnamese_name ?? undefined,
        changingHexagramNumber: r.changing_hexagram_number ?? undefined,
        changingHexagramName: r.changing_hexagram_name ?? undefined,
        changingHexagramSinoVietnameseName: r.changing_hexagram_sino_vietnamese_name ?? undefined,
        movingLines: r.moving_lines ? JSON.parse(r.moving_lines) : [],
        lunarDateStr: dt.lunarDateStr ?? `Ngày ${dt.lunarDay ?? ''} tháng ${dt.lunarMonth ?? ''}`,
        dayCanChi: dt.dayCanChi ?? '',
        monthCanChi: dt.monthCanChi ?? '',
        palaceId: r.palace_id ?? undefined,
        worldLine: r.world_line ?? undefined,
        responseLine: r.response_line ?? undefined,
        noteCount: r.note_count ?? 0,
        starred: r.starred === 1,
      };
    });

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Tìm kiếm quẻ theo từ khóa và phân trang
   */
  async search(
    query: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<DivinationSummaryItem>> {
    return this.list({ query }, pagination);
  }

  /**
   * Thêm ghi chú mới cho một quẻ
   */
  async addNote(
    divinationId: string,
    content: string,
    actualOutcome?: string
  ): Promise<DivinationNoteEntity> {
    await this.initialize();
    const existing = await this.db.getFirstAsync<DivinationRow>(
      'SELECT id FROM divinations WHERE id = ?;',
      [divinationId]
    );
    if (!existing) {
      throw new Error(`Không tìm thấy lần lập quẻ có ID "${divinationId}".`);
    }

    const noteId = generateUUID();
    const now = new Date().toISOString();
    const isVerified = actualOutcome && actualOutcome.trim().length > 0 ? 1 : 0;

    await this.db.runAsync(
      `INSERT INTO divination_notes (
        id, divination_id, created_at, updated_at, content, actual_outcome, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        noteId,
        divinationId,
        now,
        now,
        content.trim(),
        actualOutcome?.trim() || null,
        isVerified,
      ]
    );

    return {
      id: noteId,
      divinationId,
      createdAt: now,
      updatedAt: now,
      content: content.trim(),
      actualOutcome: actualOutcome?.trim() || undefined,
      isVerified: Boolean(isVerified),
    };
  }

  /**
   * Cập nhật nội dung ghi chú hoặc kết quả nghiệm lý
   */
  async updateNote(
    noteId: string,
    content: string,
    actualOutcome?: string,
    isVerified?: boolean
  ): Promise<void> {
    await this.initialize();
    const existing = await this.db.getFirstAsync<DivinationNoteRow>(
      'SELECT id, is_verified FROM divination_notes WHERE id = ?;',
      [noteId]
    );
    if (!existing) {
      throw new Error(`Không tìm thấy ghi chú có ID "${noteId}".`);
    }

    const now = new Date().toISOString();
    const verifiedValue =
      isVerified !== undefined
        ? (isVerified ? 1 : 0)
        : (actualOutcome && actualOutcome.trim().length > 0 ? 1 : existing.is_verified);

    await this.db.runAsync(
      `UPDATE divination_notes
       SET updated_at = ?, content = ?, actual_outcome = ?, is_verified = ?
       WHERE id = ?;`,
      [now, content.trim(), actualOutcome?.trim() || null, verifiedValue, noteId]
    );
  }

  /**
   * Xóa một ghi chú
   */
  async deleteNote(noteId: string): Promise<void> {
    await this.initialize();
    await this.db.runAsync('DELETE FROM divination_notes WHERE id = ?;', [noteId]);
  }

  /**
   * Lấy danh sách ghi chú của một quẻ
   */
  async getNotesByDivinationId(divinationId: string): Promise<DivinationNoteEntity[]> {
    await this.initialize();
    const rows = await this.db.getAllAsync<DivinationNoteRow>(
      'SELECT * FROM divination_notes WHERE divination_id = ? ORDER BY created_at ASC;',
      [divinationId]
    );

    return rows.map((n) => ({
      id: n.id,
      divinationId: n.divination_id,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      content: n.content,
      actualOutcome: n.actual_outcome ?? undefined,
      isVerified: n.is_verified === 1,
    }));
  }
}
