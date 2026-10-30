import { CastingMethod } from '../enums/casting-method.enum';
import { Element } from '../enums/element.enum';
import { CastingInput, DivinationDateTime } from '../models/divination.model';
import { HexagramTrio } from '../models/hexagram.model';

/**
 * Bản ghi lưu trữ bất biến (Snapshot) của kết quả quẻ và phân tích tại thời điểm gieo.
 * Mục đích: Đảm bảo dữ liệu lịch sử không bị thay đổi hoặc sai lệch khi các công thức
 * hoặc thuật toán trong tương lai được nâng cấp phiên bản.
 */
export interface DivinationResultSnapshot {
  readonly recordedAt: string;
  readonly ruleSetId: string;
  readonly algorithmVersion: string;
  readonly trio: HexagramTrio;
  readonly dateTimeInfo: DivinationDateTime;
  readonly analysis?: unknown;
  readonly maiHuaResult?: unknown;
}

/**
 * Thực thể thông tin phiên lập quẻ (Bảng `divinations`)
 */
export interface DivinationEntity {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly method: CastingMethod;
  readonly algorithmVersion: string;
  readonly ruleSetId: string;
  readonly input: CastingInput;
  readonly dateTimeInfo: DivinationDateTime;
  readonly question?: string;
  readonly inquiryType?: string;
  readonly tags?: readonly string[];
  readonly starred?: boolean;
  readonly resultSnapshot?: DivinationResultSnapshot;
}

/**
 * Thực thể kết quả quẻ (Bảng `divination_results`)
 */
export interface DivinationResultEntity {
  readonly id: string;
  readonly divinationId: string;
  readonly createdAt: string;
  readonly primaryHexagramNumber: number;
  readonly primaryHexagramName: string;
  readonly primaryHexagramSinoVietnameseName?: string;
  readonly changingHexagramNumber?: number;
  readonly changingHexagramName?: string;
  readonly changingHexagramSinoVietnameseName?: string;
  readonly nuclearHexagramNumber?: number;
  readonly nuclearHexagramName?: string;
  readonly movingLines: readonly number[];
  readonly trio: HexagramTrio;
}

/**
 * Thực thể kết quả phân tích Lục Hào (Bảng `divination_analyses`)
 */
export interface DivinationAnalysisEntity {
  readonly id: string;
  readonly divinationId: string;
  readonly createdAt: string;
  readonly ruleSetId: string;
  readonly algorithmVersion: string;
  readonly palaceId: string;
  readonly palaceElement: Element;
  readonly worldLine: number;
  readonly responseLine: number;
  readonly summary?: string;
  readonly details: unknown;
}

/**
 * Thực thể ghi chú, nghiệm lý cá nhân (Bảng `divination_notes`)
 */
export interface DivinationNoteEntity {
  readonly id: string;
  readonly divinationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly content: string;
  readonly actualOutcome?: string;
  readonly isVerified?: boolean;
}

/**
 * Đối tượng tổng hợp chi tiết một quẻ đầy đủ các bảng liên kết
 */
export interface DivinationDetailAggregate {
  readonly divination: DivinationEntity;
  readonly result?: DivinationResultEntity;
  readonly analysis?: DivinationAnalysisEntity;
  readonly notes: readonly DivinationNoteEntity[];
  readonly resultSnapshot?: DivinationResultSnapshot;
}

/**
 * Mục tóm tắt một lần lập quẻ hiển thị trong danh sách / tìm kiếm lịch sử
 */
export interface DivinationSummaryItem {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly method: CastingMethod;
  readonly question?: string;
  readonly inquiryType?: string;
  readonly tags?: readonly string[];
  readonly primaryHexagramNumber: number;
  readonly primaryHexagramName: string;
  readonly primaryHexagramSinoVietnameseName?: string;
  readonly changingHexagramNumber?: number;
  readonly changingHexagramName?: string;
  readonly changingHexagramSinoVietnameseName?: string;
  readonly movingLines: readonly number[];
  readonly lunarDateStr: string;
  readonly dayCanChi: string;
  readonly monthCanChi: string;
  readonly palaceId?: string;
  readonly worldLine?: number;
  readonly responseLine?: number;
  readonly noteCount: number;
  readonly starred?: boolean;
}

/**
 * Bộ lọc phục vụ tìm kiếm và lọc danh sách lịch sử quẻ
 */
export interface DivinationFilterOptions {
  readonly query?: string;
  readonly method?: CastingMethod;
  readonly hexagramNumber?: number;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly tags?: readonly string[];
  readonly starred?: boolean;
}

/**
 * Tham số phân trang và sắp xếp
 */
export interface PaginationParams {
  readonly page?: number; // 1-based, mặc định là 1
  readonly pageSize?: number; // mặc định là 10
  readonly sortBy?: 'createdAt' | 'updatedAt';
  readonly sortDirection?: 'asc' | 'desc'; // mặc định là 'desc'
}

/**
 * Kết quả phân trang
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

/**
 * Dữ liệu yêu cầu khi tạo mới một lần lập quẻ
 */
export interface CreateDivinationDto {
  readonly id?: string;
  readonly method: CastingMethod;
  readonly algorithmVersion: string;
  readonly ruleSetId: string;
  readonly input: CastingInput;
  readonly dateTimeInfo: DivinationDateTime;
  readonly trio: HexagramTrio;
  readonly question?: string;
  readonly inquiryType?: string;
  readonly analysis?: {
    readonly ruleSetId?: string;
    readonly algorithmVersion?: string;
    readonly palaceId: string;
    readonly palaceElement: Element;
    readonly worldLine: number;
    readonly responseLine: number;
    readonly summary?: string;
    readonly details: unknown;
  };
  readonly resultSnapshot?: DivinationResultSnapshot;
  readonly initialNote?: string;
  readonly tags?: readonly string[];
  readonly starred?: boolean;
}

/**
 * Dữ liệu cập nhật quẻ
 */
export interface UpdateDivinationDto {
  readonly question?: string;
  readonly inquiryType?: string;
  readonly tags?: readonly string[];
  readonly starred?: boolean;
}

/**
 * Interface Repository quản lý lưu trữ và truy vấn quẻ
 */
export interface IDivinationRepository {
  /**
   * Tạo và lưu mới một phiên lập quẻ cùng kết quả, phân tích và snapshot
   */
  create(dto: CreateDivinationDto): Promise<DivinationDetailAggregate>;

  /**
   * Lấy chi tiết toàn bộ thông tin quẻ theo ID
   */
  getById(id: string): Promise<DivinationDetailAggregate | null>;

  /**
   * Cập nhật thông tin quẻ (câu hỏi, tags, yêu thích...)
   */
  update(id: string, dto: UpdateDivinationDto): Promise<void>;

  /**
   * Xóa quẻ và toàn bộ dữ liệu kết quả, phân tích, ghi chú liên quan (Cascade delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Liệt kê danh sách quẻ có hỗ trợ bộ lọc và phân trang
   */
  list(filter?: DivinationFilterOptions, pagination?: PaginationParams): Promise<PaginatedResult<DivinationSummaryItem>>;

  /**
   * Tìm kiếm quẻ theo từ khóa và phân trang
   */
  search(query: string, pagination?: PaginationParams): Promise<PaginatedResult<DivinationSummaryItem>>;

  /**
   * Thêm ghi chú mới cho một quẻ
   */
  addNote(divinationId: string, content: string, actualOutcome?: string): Promise<DivinationNoteEntity>;

  /**
   * Cập nhật nội dung ghi chú hoặc kết quả nghiệm lý
   */
  updateNote(noteId: string, content: string, actualOutcome?: string, isVerified?: boolean): Promise<void>;

  /**
   * Xóa một ghi chú
   */
  deleteNote(noteId: string): Promise<void>;

  /**
   * Lấy danh sách ghi chú của một quẻ
   */
  getNotesByDivinationId(divinationId: string): Promise<DivinationNoteEntity[]>;
}
