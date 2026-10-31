/**
 * Repository interface và Offline In-Memory implementation cho Quản lý Nguồn Tri Thức.
 * Hoạt động 100% offline, hỗ trợ truy vấn, tìm kiếm đa tiêu chí và tính toán thống kê.
 */

import {
  Author,
  KnowledgeBook,
  ClassicalCitation,
  KnowledgeFilterOptions,
  KnowledgeStatistics,
} from './knowledge.types';
import {
  CANONICAL_AUTHORS,
  CANONICAL_BOOKS,
  CANONICAL_CITATIONS,
} from './knowledge.data';

/**
 * Interface chuẩn cho Repository Nguồn Tri Thức
 */
export interface IKnowledgeRepository {
  /** Lấy danh sách tất cả tác giả */
  getAuthors(): Promise<readonly Author[]>;
  /** Tìm tác giả theo ID */
  getAuthorById(id: string): Promise<Author | null>;
  /** Lấy danh sách thư tịch (có hỗ trợ bộ lọc) */
  getBooks(filter?: KnowledgeFilterOptions): Promise<readonly KnowledgeBook[]>;
  /** Tìm sách theo ID */
  getBookById(id: string): Promise<KnowledgeBook | null>;
  /** Lấy danh sách trích dẫn kinh điển (có hỗ trợ bộ lọc đa chiều) */
  getCitations(filter?: KnowledgeFilterOptions): Promise<readonly ClassicalCitation[]>;
  /** Tìm trích dẫn theo ID */
  getCitationById(id: string): Promise<ClassicalCitation | null>;
  /** Lấy các trích dẫn liên kết với một RuleSet cụ thể */
  getCitationsByRuleSet(ruleSetId: string): Promise<readonly ClassicalCitation[]>;
  /** Tìm kiếm toàn văn trong tất cả các tầng văn bản */
  searchCitations(keyword: string): Promise<readonly ClassicalCitation[]>;
  /** Lấy thống kê tổng quan về kho tri thức */
  getStatistics(): Promise<KnowledgeStatistics>;
}

/**
 * Triển khai Offline In-Memory Repository
 */
export class InMemoryKnowledgeRepository implements IKnowledgeRepository {
  private readonly authors: Author[];
  private readonly books: KnowledgeBook[];
  private readonly citations: ClassicalCitation[];

  constructor(
    initialAuthors: readonly Author[] = CANONICAL_AUTHORS,
    initialBooks: readonly KnowledgeBook[] = CANONICAL_BOOKS,
    initialCitations: readonly ClassicalCitation[] = CANONICAL_CITATIONS
  ) {
    this.authors = [...initialAuthors];
    this.books = [...initialBooks];
    this.citations = [...initialCitations];
  }

  async getAuthors(): Promise<readonly Author[]> {
    return [...this.authors];
  }

  async getAuthorById(id: string): Promise<Author | null> {
    const found = this.authors.find((a) => a.id === id);
    return found ? { ...found } : null;
  }

  async getBooks(filter?: KnowledgeFilterOptions): Promise<readonly KnowledgeBook[]> {
    let result = [...this.books];

    if (filter) {
      if (filter.authorId) {
        result = result.filter((b) => b.authorId === filter.authorId);
      }
      if (filter.schoolOfThought) {
        result = result.filter((b) => b.schoolOfThought === filter.schoolOfThought);
      }
      if (filter.reliabilityLevel) {
        result = result.filter((b) => b.reliabilityLevel === filter.reliabilityLevel);
      }
      if (filter.verificationStatus) {
        result = result.filter((b) => b.verificationStatus === filter.verificationStatus);
      }
      if (filter.searchKeyword) {
        const kw = filter.searchKeyword.toLowerCase().trim();
        result = result.filter(
          (b) =>
            b.title.toLowerCase().includes(kw) ||
            b.nativeTitle.toLowerCase().includes(kw) ||
            b.description.toLowerCase().includes(kw) ||
            b.edition.toLowerCase().includes(kw)
        );
      }
    }

    return result;
  }

  async getBookById(id: string): Promise<KnowledgeBook | null> {
    const found = this.books.find((b) => b.id === id);
    return found ? { ...found } : null;
  }

  async getCitations(filter?: KnowledgeFilterOptions): Promise<readonly ClassicalCitation[]> {
    let result = [...this.citations];

    if (filter) {
      if (filter.authorId) {
        result = result.filter((c) => c.authorId === filter.authorId);
      }
      if (filter.bookId) {
        result = result.filter((c) => c.bookId === filter.bookId);
      }
      if (filter.schoolOfThought) {
        result = result.filter((c) => c.schoolOfThought === filter.schoolOfThought);
      }
      if (filter.reliabilityLevel) {
        result = result.filter((c) => c.reliabilityLevel === filter.reliabilityLevel);
      }
      if (filter.verificationStatus) {
        result = result.filter((c) => c.verificationStatus === filter.verificationStatus);
      }
      if (filter.ruleSetId) {
        result = result.filter((c) => c.relatedRuleSets.includes(filter.ruleSetId!));
      }
      if (filter.hexagramNumber !== undefined) {
        result = result.filter((c) => c.hexagramNumber === filter.hexagramNumber);
      }
      if (filter.searchKeyword) {
        const kw = filter.searchKeyword.toLowerCase().trim();
        result = result.filter((c) => this.citationMatchesKeyword(c, kw));
      }
    }

    return result;
  }

  async getCitationById(id: string): Promise<ClassicalCitation | null> {
    const found = this.citations.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async getCitationsByRuleSet(ruleSetId: string): Promise<readonly ClassicalCitation[]> {
    return this.citations.filter((c) => c.relatedRuleSets.includes(ruleSetId));
  }

  async searchCitations(keyword: string): Promise<readonly ClassicalCitation[]> {
    const kw = keyword.toLowerCase().trim();
    if (!kw) return [...this.citations];
    return this.citations.filter((c) => this.citationMatchesKeyword(c, kw));
  }

  async getStatistics(): Promise<KnowledgeStatistics> {
    const verifiedCitationCount = this.citations.filter(
      (c) => c.verificationStatus === 'verified'
    ).length;
    const disputedCitationCount = this.citations.filter(
      (c) => c.verificationStatus === 'disputed'
    ).length;
    const underReviewCitationCount = this.citations.filter(
      (c) => c.verificationStatus === 'under_review'
    ).length;

    return {
      authorCount: this.authors.length,
      bookCount: this.books.length,
      citationCount: this.citations.length,
      verifiedCitationCount,
      disputedCitationCount,
      underReviewCitationCount,
    };
  }

  private citationMatchesKeyword(c: ClassicalCitation, kw: string): boolean {
    return (
      c.topic.toLowerCase().includes(kw) ||
      c.authorName.toLowerCase().includes(kw) ||
      c.bookTitle.toLowerCase().includes(kw) ||
      c.chapter.toLowerCase().includes(kw) ||
      (c.section?.toLowerCase().includes(kw) ?? false) ||
      c.content.original.toLowerCase().includes(kw) ||
      c.content.sinoVietnamese.toLowerCase().includes(kw) ||
      c.content.translation.toLowerCase().includes(kw) ||
      c.content.explanation.toLowerCase().includes(kw) ||
      (c.disputeNotes?.toLowerCase().includes(kw) ?? false)
    );
  }
}

/**
 * Singleton repository instance dùng chung cho ứng dụng offline
 */
export const defaultKnowledgeRepository = new InMemoryKnowledgeRepository();
