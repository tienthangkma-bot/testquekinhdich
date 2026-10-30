import {
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
import { getKinDichDatabase, KinDichDatabase } from '../db/kindich.db';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt (bỏ dấu, chuyển chữ thường) phục vụ tìm kiếm không dấu
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
 * Sinh UUID ngẫu nhiên tương thích môi trường Browser và Node.js
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
 * Lớp Repository triển khai trên nền IndexedDB thông qua Dexie
 * Đảm bảo hoạt động hoàn toàn offline, độc lập không cần backend hoặc internet.
 */
export class DexieDivinationRepository implements IDivinationRepository {
  private readonly db: KinDichDatabase;

  constructor(dbInstance?: KinDichDatabase) {
    this.db = dbInstance ?? getKinDichDatabase();
  }

  /**
   * Tạo mới một phiên lập quẻ cùng kết quả, phân tích và snapshot bất biến
   */
  async create(dto: CreateDivinationDto): Promise<DivinationDetailAggregate> {
    const divinationId = dto.id ?? generateUUID();
    const now = new Date().toISOString();

    // Đảm bảo Result Snapshot luôn được khởi tạo và lưu trữ bất biến
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

    // Thực thi lưu trữ phân tán vào 4 bảng trong 1 transaction an toàn
    await this.db.transaction(
      'rw',
      [
        this.db.divinations,
        this.db.divination_results,
        this.db.divination_analyses,
        this.db.divination_notes,
      ],
      async () => {
        await this.db.divinations.add(divinationEntity);
        await this.db.divination_results.add(resultEntity);
        if (analysisEntity) {
          await this.db.divination_analyses.add(analysisEntity);
        }
        if (initialNoteEntity) {
          await this.db.divination_notes.add(initialNoteEntity);
        }
      }
    );

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
    const divination = await this.db.divinations.get(id);
    if (!divination) {
      return null;
    }

    const [result, analysis, notes] = await Promise.all([
      this.db.divination_results.where('divinationId').equals(id).first(),
      this.db.divination_analyses.where('divinationId').equals(id).first(),
      this.db.divination_notes.where('divinationId').equals(id).sortBy('createdAt'),
    ]);

    return {
      divination,
      result,
      analysis,
      notes,
      resultSnapshot: divination.resultSnapshot,
    };
  }

  /**
   * Cập nhật thông tin quẻ (câu hỏi, mục đích, tags, yêu thích)
   */
  async update(id: string, dto: UpdateDivinationDto): Promise<void> {
    const existing = await this.db.divinations.get(id);
    if (!existing) {
      throw new Error(`Không tìm thấy lần lập quẻ có ID "${id}".`);
    }

    const updates: Partial<Mutable<DivinationEntity>> = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.question !== undefined) {
      updates.question = dto.question.trim() || undefined;
    }
    if (dto.inquiryType !== undefined) {
      updates.inquiryType = dto.inquiryType.trim() || undefined;
    }
    if (dto.tags !== undefined) {
      updates.tags = [...dto.tags];
    }
    if (dto.starred !== undefined) {
      updates.starred = dto.starred;
    }

    await this.db.divinations.update(id, updates);
  }

  /**
   * Xóa quẻ và toàn bộ dữ liệu kết quả, phân tích, ghi chú liên quan (Cascade delete)
   */
  async delete(id: string): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.divinations,
        this.db.divination_results,
        this.db.divination_analyses,
        this.db.divination_notes,
      ],
      async () => {
        await this.db.divinations.delete(id);
        await this.db.divination_results.where('divinationId').equals(id).delete();
        await this.db.divination_analyses.where('divinationId').equals(id).delete();
        await this.db.divination_notes.where('divinationId').equals(id).delete();
      }
    );
  }

  /**
   * Liệt kê danh sách quẻ có hỗ trợ bộ lọc và phân trang
   */
  async list(
    filter?: DivinationFilterOptions,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<DivinationSummaryItem>> {
    const allDivinations = await this.db.divinations.toArray();
    const allResults = await this.db.divination_results.toArray();
    const allAnalyses = await this.db.divination_analyses.toArray();
    const allNotes = await this.db.divination_notes.toArray();

    // Tạo maps tra cứu nhanh
    const resultsMap = new Map<string, DivinationResultEntity>();
    for (const r of allResults) {
      resultsMap.set(r.divinationId, r);
    }

    const analysesMap = new Map<string, DivinationAnalysisEntity>();
    for (const a of allAnalyses) {
      analysesMap.set(a.divinationId, a);
    }

    const notesMap = new Map<string, DivinationNoteEntity[]>();
    for (const n of allNotes) {
      const list = notesMap.get(n.divinationId) ?? [];
      list.push(n);
      notesMap.set(n.divinationId, list);
    }

    // Lọc theo các tiêu chí
    const filtered = allDivinations.filter((d) => {
      const res = resultsMap.get(d.id);
      const notes = notesMap.get(d.id) ?? [];

      // Lọc theo phương pháp lập quẻ
      if (filter?.method && d.method !== filter.method) {
        return false;
      }

      // Lọc theo phân loại danh mục câu hỏi (inquiryType)
      if (filter?.inquiryType && d.inquiryType !== filter.inquiryType) {
        return false;
      }

      // Lọc theo trạng thái yêu thích
      if (filter?.starred !== undefined && (d.starred ?? false) !== filter.starred) {
        return false;
      }

      // Lọc theo ngày bắt đầu
      if (filter?.startDate && d.createdAt < filter.startDate) {
        return false;
      }

      // Lọc theo ngày kết thúc
      if (filter?.endDate && d.createdAt > filter.endDate) {
        return false;
      }

      // Lọc theo số thứ tự quẻ (Quẻ chủ hoặc Quẻ biến)
      if (filter?.hexagramNumber !== undefined) {
        const matchesPrimary = res?.primaryHexagramNumber === filter.hexagramNumber;
        const matchesChanging = res?.changingHexagramNumber === filter.hexagramNumber;
        if (!matchesPrimary && !matchesChanging) {
          return false;
        }
      }

      // Lọc theo tags
      if (filter?.tags && filter.tags.length > 0) {
        const dTags = d.tags ?? [];
        const hasAllTags = filter.tags.every((t) => dTags.includes(t));
        if (!hasAllTags) {
          return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm (query)
      if (filter?.query && filter.query.trim().length > 0) {
        const queryNorm = normalizeVietnamese(filter.query);
        const questionNorm = normalizeVietnamese(d.question ?? '');
        const primaryNameNorm = normalizeVietnamese(res?.primaryHexagramName ?? '');
        const primarySinoNorm = normalizeVietnamese(res?.primaryHexagramSinoVietnameseName ?? '');
        const changingNameNorm = normalizeVietnamese(res?.changingHexagramName ?? '');
        const changingSinoNorm = normalizeVietnamese(res?.changingHexagramSinoVietnameseName ?? '');
        const dayCanChiNorm = normalizeVietnamese(d.dateTimeInfo.dayCanChi ?? '');
        const monthCanChiNorm = normalizeVietnamese(d.dateTimeInfo.monthCanChi ?? '');
        const tagsNorm = (d.tags ?? []).map(normalizeVietnamese).join(' ');
        const notesNorm = notes.map((n) => normalizeVietnamese(n.content)).join(' ');

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
    const sortDir = pagination?.sortDirection ?? 'desc';

    filtered.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    // Phân trang
    const page = Math.max(1, pagination?.page ?? 1);
    const pageSize = Math.max(1, pagination?.pageSize ?? 10);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    // Chuyển đổi sang DivinationSummaryItem
    const summaryItems: DivinationSummaryItem[] = paginatedItems.map((d) => {
      const res = resultsMap.get(d.id);
      const analysis = analysesMap.get(d.id);
      const notes = notesMap.get(d.id) ?? [];

      const dt = d.dateTimeInfo;
      const leapStr = dt.lunarMonth < 0 ? ' (Nhuận)' : '';
      const lunarDateStr = `Ngày ${dt.lunarDay} tháng ${Math.abs(dt.lunarMonth)}${leapStr} năm ${dt.yearCanChi}`;

      return {
        id: d.id,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        method: d.method,
        question: d.question,
        inquiryType: d.inquiryType,
        tags: d.tags,
        primaryHexagramNumber: res?.primaryHexagramNumber ?? 0,
        primaryHexagramName: res?.primaryHexagramName ?? '',
        primaryHexagramSinoVietnameseName: res?.primaryHexagramSinoVietnameseName,
        changingHexagramNumber: res?.changingHexagramNumber,
        changingHexagramName: res?.changingHexagramName,
        changingHexagramSinoVietnameseName: res?.changingHexagramSinoVietnameseName,
        movingLines: res?.movingLines ?? [],
        lunarDateStr,
        dayCanChi: dt.dayCanChi,
        monthCanChi: dt.monthCanChi,
        palaceId: analysis?.palaceId,
        worldLine: analysis?.worldLine,
        responseLine: analysis?.responseLine,
        noteCount: notes.length,
        starred: d.starred,
      };
    });

    return {
      items: summaryItems,
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
    const divination = await this.db.divinations.get(divinationId);
    if (!divination) {
      throw new Error(`Không tìm thấy lần lập quẻ có ID "${divinationId}".`);
    }

    const now = new Date().toISOString();
    const noteEntity: DivinationNoteEntity = {
      id: generateUUID(),
      divinationId,
      createdAt: now,
      updatedAt: now,
      content: content.trim(),
      actualOutcome: actualOutcome?.trim() || undefined,
      isVerified: actualOutcome ? true : false,
    };

    await this.db.divination_notes.add(noteEntity);
    return noteEntity;
  }

  /**
   * Cập nhật nội dung ghi chú hoặc kết quả nghiệm lý thực tế
   */
  async updateNote(
    noteId: string,
    content: string,
    actualOutcome?: string,
    isVerified?: boolean
  ): Promise<void> {
    const existing = await this.db.divination_notes.get(noteId);
    if (!existing) {
      throw new Error(`Không tìm thấy ghi chú có ID "${noteId}".`);
    }

    const updates: Partial<Mutable<DivinationNoteEntity>> = {
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (actualOutcome !== undefined) {
      updates.actualOutcome = actualOutcome.trim() || undefined;
    }
    if (isVerified !== undefined) {
      updates.isVerified = isVerified;
    } else if (actualOutcome !== undefined && actualOutcome.trim().length > 0) {
      updates.isVerified = true;
    }

    await this.db.divination_notes.update(noteId, updates);
  }

  /**
   * Xóa một ghi chú
   */
  async deleteNote(noteId: string): Promise<void> {
    await this.db.divination_notes.delete(noteId);
  }

  /**
   * Lấy danh sách ghi chú của một quẻ
   */
  async getNotesByDivinationId(divinationId: string): Promise<DivinationNoteEntity[]> {
    return this.db.divination_notes.where('divinationId').equals(divinationId).sortBy('createdAt');
  }
}
