/**
 * Định nghĩa các kiểu dữ liệu cho Quản lý Nguồn Tri thức (Knowledge Source Management)
 * Tuân thủ quy chuẩn kinh điển, hỗ trợ đa trường phái và 3 tầng văn bản.
 */

/**
 * Các trường phái Dịch học chính thống
 */
export type SchoolOfThought =
  | 'nghia_ly'            // Nghĩa Lý Phái (Khổng Tử, Chu Hi, Trình Di, Nguyễn Hiến Lê)
  | 'tuong_so'            // Tượng Số Phái (Thiệu Ung, Tiêu Diên Thọ)
  | 'luc_hao'             // Lục Hào / Nạp Giáp Phái (Kinh Phòng, Dã Hạc, Vương Duy Đức)
  | 'co_phap_bac_ha'      // Cổ Pháp Bắc Hà Tân An (Phối hợp Nạp Giáp, Mai Hoa và Cổ bản)
  | 'thien_van_lich_phap'; // Thiên Văn Lịch Pháp (Tiết Khí, Can Chi, Lục Thập Hoa Giáp)

export const SCHOOL_OF_THOUGHT_NAMES: Record<SchoolOfThought, string> = {
  nghia_ly: 'Nghĩa Lý Phái (Đạo Quân Tử & Triết Học)',
  tuong_so: 'Tượng Số Phái (Mai Hoa & Toán Số)',
  luc_hao: 'Lục Hào Phái (Nạp Giáp & Bốc Phệ)',
  co_phap_bac_ha: 'Cổ Pháp Bắc Hà Tân An (Tổng Hợp Cổ Truyền)',
  thien_van_lich_phap: 'Thiên Văn & Lịch Pháp Cổ',
};

/**
 * Cấp độ tin cậy của thư tịch và trích dẫn
 */
export type ReliabilityLevel =
  | 'canonical'   // Chính kinh / Thập Dực (Cấp tối thượng: Chu Dịch, Thập Dực, Kinh Thị Dịch Truyện)
  | 'standard'    // Chính truyền kinh điển (Tăng San Bốc Dịch, Bốc Phệ Chính Tông, Mai Hoa Dịch Số, Chu Dịch Bản Nghĩa)
  | 'commentary'  // Khảo cứu, Chú giải học thuật có giá trị cao (Chu Dịch Chính Nghĩa, Dịch Học Tinh Hoa, Nguyễn Hiến Lê)
  | 'unverified'; // Bản chép tay dân gian hoặc lưu truyền miệng chưa khảo dị

export const RELIABILITY_LEVEL_NAMES: Record<ReliabilityLevel, string> = {
  canonical: 'Chính Kinh (Độ tin cậy tối thượng)',
  standard: 'Chính Truyền (Kinh điển tiêu chuẩn)',
  commentary: 'Khảo Cứu & Chú Giải (Tham khảo cao)',
  unverified: 'Chưa Khảo Dị (Cần rà soát)',
};

/**
 * Trạng thái xác minh của dữ liệu
 */
export type VerificationStatus =
  | 'verified'      // Đã đối chiếu chính xác nguyên bản cổ thư
  | 'under_review'  // Đang rà soát, đối chiếu giữa các dị bản
  | 'disputed';     // Có sự dị biệt học thuật giữa các trường phái

export const VERIFICATION_STATUS_NAMES: Record<VerificationStatus, string> = {
  verified: 'Đã xác minh nguyên bản',
  under_review: 'Đang rà soát đối chiếu',
  disputed: 'Có khảo dị học thuật',
};

/**
 * Loại tầng văn bản trong trích dẫn
 */
export type TextContentType = 'original' | 'translation' | 'commentary' | 'rule_explanation';

/**
 * Cấu trúc 3 tầng văn bản chuẩn mực của một đoạn kinh văn
 */
export interface TextLayer {
  /** Tầng 1: Văn bản chữ Hán nguyên tác (chính thể) */
  readonly original: string;
  /** Tầng 1.5: Phiên âm Hán Việt chuẩn xác */
  readonly sinoVietnamese: string;
  /** Tầng 2: Bản dịch nghĩa tiếng Việt của học giả uy tín */
  readonly translation: string;
  /** Tầng 3: Lời giải thích, chú giải nghĩa lý hoặc ứng dụng quy tắc thực hành */
  readonly explanation: string;
}

/**
 * Thông tin tác giả / dịch gia / danh nhân Dịch học
 */
export interface Author {
  readonly id: string;
  /** Họ tên tiếng Việt */
  readonly name: string;
  /** Tên chữ Hán */
  readonly nativeName: string;
  /** Tên chữ (Biểu tự) hoặc đạo hiệu nếu có */
  readonly courtesyName?: string;
  /** Thời kỳ lịch sử / Triều đại (ví dụ: Tây Chu, Xuân Thu, Tây Hán, Bắc Tống, Thanh Triều, Hiện đại) */
  readonly period: string;
  readonly dynasty: string;
  /** Trường phái Dịch học chủ đạo */
  readonly schoolOfThought: SchoolOfThought;
  /** Tóm lược tiểu sử và đóng góp học thuật */
  readonly biography: string;
  /** Các tác phẩm tiêu biểu */
  readonly notableWorks: readonly string[];
}

/**
 * Thư tịch, sách, tài liệu Dịch học cổ điển và hiện đại
 */
export interface KnowledgeBook {
  readonly id: string;
  /** Tên sách tiếng Việt / Hán Việt */
  readonly title: string;
  /** Tên sách nguyên bản (chữ Hán) */
  readonly nativeTitle: string;
  /** Mã định danh tác giả */
  readonly authorId: string;
  /** Thời kỳ biên soạn */
  readonly period: string;
  /** Năm xuất bản hoặc niên đại ước tính */
  readonly publicationYear?: string;
  /** Ấn bản / Bản khắc in cụ thể */
  readonly edition: string;
  /** Nhà xuất bản hoặc nơi tàng bản */
  readonly publisher?: string;
  /** Ngôn ngữ văn bản (Hán văn cổ, Hán Nôm, Tiếng Việt) */
  readonly language: string;
  /** Tóm tắt nội dung và giá trị học thuật */
  readonly description: string;
  /** Trường phái chủ đạo của tác phẩm */
  readonly schoolOfThought: SchoolOfThought;
  /** Cấp độ tin cậy */
  readonly reliabilityLevel: ReliabilityLevel;
  /** Trạng thái xác minh */
  readonly verificationStatus: VerificationStatus;
  /** Danh sách các chương / quyển / thiên chính */
  readonly chapters: readonly string[];
  /** Mã số tham chiếu thư viện hoặc ISBN nếu có */
  readonly referenceUrl?: string;
}

/**
 * Trích dẫn kinh điển cụ thể gắn với nguồn sách và vị trí chính xác
 */
export interface ClassicalCitation {
  readonly id: string;
  /** Mã sách nguồn */
  readonly bookId: string;
  /** Mã tác giả */
  readonly authorId: string;
  /** Tên sách (denormalized để tiện truy vấn và hiển thị offline) */
  readonly bookTitle: string;
  /** Tên tác giả (denormalized) */
  readonly authorName: string;
  /** Chương / Thiên / Quyển */
  readonly chapter: string;
  /** Tiết mục nhỏ hơn nếu có */
  readonly section?: string;
  /** Số trang hoặc số thiên trong bản in tiêu chuẩn */
  readonly pageNumber?: string | number;
  /** Phiên bản sách tham chiếu */
  readonly edition: string;
  /** Số thứ tự Quẻ liên quan (1 - 64) nếu trích dẫn gắn với quẻ */
  readonly hexagramNumber?: number;
  /** Vị trí Hào liên quan (1 - 6) nếu trích dẫn gắn với hào */
  readonly linePosition?: number;
  /** Chủ đề của trích dẫn (ví dụ: Thoán từ, Hào từ, Nạp Giáp, Bát Cung, Tuần Không, v.v.) */
  readonly topic: string;
  /** Nội dung 3 tầng văn bản */
  readonly content: TextLayer;
  /** Trường phái */
  readonly schoolOfThought: SchoolOfThought;
  /** Độ tin cậy */
  readonly reliabilityLevel: ReliabilityLevel;
  /** Trạng thái xác minh */
  readonly verificationStatus: VerificationStatus;
  /** Danh sách các RuleSet ID liên kết trực tiếp với trích dẫn này */
  readonly relatedRuleSets: readonly string[];
  /** Ghi chú khảo dị nếu có tranh luận hoặc có nhiều dị bản */
  readonly disputeNotes?: string;
}

/**
 * Tùy chọn lọc tra cứu nguồn tri thức
 */
export interface KnowledgeFilterOptions {
  readonly authorId?: string;
  readonly bookId?: string;
  readonly schoolOfThought?: SchoolOfThought;
  readonly reliabilityLevel?: ReliabilityLevel;
  readonly verificationStatus?: VerificationStatus;
  readonly ruleSetId?: string;
  readonly hexagramNumber?: number;
  readonly searchKeyword?: string;
}

/**
 * Thống kê tổng thể kho nguồn tri thức
 */
export interface KnowledgeStatistics {
  readonly authorCount: number;
  readonly bookCount: number;
  readonly citationCount: number;
  readonly verifiedCitationCount: number;
  readonly disputedCitationCount: number;
  readonly underReviewCitationCount: number;
}
