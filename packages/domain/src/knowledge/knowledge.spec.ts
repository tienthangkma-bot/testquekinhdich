import { describe, it, expect } from 'vitest';
import {
  CANONICAL_AUTHORS,
  CANONICAL_BOOKS,
  CANONICAL_CITATIONS,
} from './knowledge.data';
import {
  InMemoryKnowledgeRepository,
  defaultKnowledgeRepository,
} from './knowledge.repository';


describe('Knowledge Domain: Canonical Data & Anti-Fabrication Integrity', () => {
  it('phải có đủ 10 tác giả danh nhân Dịch học chính thống', () => {
    expect(CANONICAL_AUTHORS.length).toBe(10);
    const expectedAuthorIds = [
      'author_king_wen',
      'author_duke_of_zhou',
      'author_confucius',
      'author_jing_fang',
      'author_shao_yong',
      'author_zhu_xi',
      'author_wang_wei_de',
      'author_ye_he',
      'author_nguyen_hien_le',
      'author_bac_ha',
    ];

    expectedAuthorIds.forEach((id) => {
      const found = CANONICAL_AUTHORS.find((a) => a.id === id);
      expect(found, `Thiếu tác giả: ${id}`).toBeDefined();
      expect(found?.name.length).toBeGreaterThan(0);
      expect(found?.nativeName.length).toBeGreaterThan(0);
      expect(found?.period.length).toBeGreaterThan(0);
      expect(found?.biography.length).toBeGreaterThan(20);
      expect(found?.notableWorks.length).toBeGreaterThan(0);
    });
  });

  it('phải có 8 bộ thư tịch kinh điển và mỗi thư tịch liên kết với tác giả hợp lệ', () => {
    expect(CANONICAL_BOOKS.length).toBe(8);
    const authorIds = new Set(CANONICAL_AUTHORS.map((a) => a.id));

    CANONICAL_BOOKS.forEach((book) => {
      expect(authorIds.has(book.authorId), `Sách ${book.id} có authorId không tồn tại`).toBe(true);
      expect(book.title.length).toBeGreaterThan(0);
      expect(book.nativeTitle.length).toBeGreaterThan(0);
      expect(book.edition.length).toBeGreaterThan(0);
      expect(book.chapters.length).toBeGreaterThan(0);
      expect(['canonical', 'standard', 'commentary']).toContain(book.reliabilityLevel);
      expect(['verified', 'under_review', 'disputed']).toContain(book.verificationStatus);
    });
  });

  it('mọi trích dẫn phải liên kết với sách và tác giả thực tế, không bịa đặt nguồn', () => {
    expect(CANONICAL_CITATIONS.length).toBeGreaterThanOrEqual(13);
    const authorIds = new Set(CANONICAL_AUTHORS.map((a) => a.id));
    const bookIds = new Set(CANONICAL_BOOKS.map((b) => b.id));

    CANONICAL_CITATIONS.forEach((citation) => {
      expect(authorIds.has(citation.authorId), `Trích dẫn ${citation.id} có authorId không hợp lệ`).toBe(true);
      expect(bookIds.has(citation.bookId), `Trích dẫn ${citation.id} có bookId không hợp lệ`).toBe(true);
      expect(citation.chapter.length).toBeGreaterThan(0);
      expect(citation.edition.length).toBeGreaterThan(0);
      expect(citation.relatedRuleSets.length).toBeGreaterThan(0);

      // Kiểm tra 3 tầng văn bản bắt buộc
      expect(citation.content.original.length, `Trích dẫn ${citation.id} thiếu chữ Hán`).toBeGreaterThan(0);
      expect(citation.content.sinoVietnamese.length, `Trích dẫn ${citation.id} thiếu phiên âm`).toBeGreaterThan(0);
      expect(citation.content.translation.length, `Trích dẫn ${citation.id} thiếu bản dịch`).toBeGreaterThan(0);
      expect(citation.content.explanation.length, `Trích dẫn ${citation.id} thiếu giải thích`).toBeGreaterThan(0);

      // Nếu có tranh luận học thuật (disputed), bắt buộc phải có ghi chú khảo dị
      if (citation.verificationStatus === 'disputed') {
        expect(citation.disputeNotes?.length).toBeGreaterThan(10);
      }
    });
  });
});

describe('Knowledge Domain: Repository Queries & Filtering', () => {
  const repo = new InMemoryKnowledgeRepository();

  it('lấy danh sách tác giả và tìm theo ID', async () => {
    const authors = await repo.getAuthors();
    expect(authors.length).toBe(10);

    const kingWen = await repo.getAuthorById('author_king_wen');
    expect(kingWen).toBeDefined();
    expect(kingWen?.name).toContain('Chu Văn Vương');

    const nonExistent = await repo.getAuthorById('non_existent');
    expect(nonExistent).toBeNull();
  });

  it('lấy danh sách sách và lọc theo trường phái / độ tin cậy', async () => {
    const allBooks = await repo.getBooks();
    expect(allBooks.length).toBe(8);

    const lucHaoBooks = await repo.getBooks({ schoolOfThought: 'luc_hao' });
    expect(lucHaoBooks.length).toBe(3);
    expect(lucHaoBooks.map((b) => b.id)).toEqual(
      expect.arrayContaining(['book_jingshi_yizhuan', 'book_bushi_zhengzong', 'book_zengshan_buyi'])
    );

    const canonicalBooks = await repo.getBooks({ reliabilityLevel: 'canonical' });
    expect(canonicalBooks.length).toBe(2);

    const searchedBooks = await repo.getBooks({ searchKeyword: 'Mai Hoa' });
    expect(searchedBooks.length).toBe(1);
    expect(searchedBooks[0]?.id).toBe('book_meihua_yishu');
  });

  it('lọc trích dẫn theo RuleSet', async () => {
    const maiHuaCitations = await repo.getCitationsByRuleSet('MAI-HUA-V1');
    expect(maiHuaCitations.length).toBeGreaterThanOrEqual(1);
    expect(maiHuaCitations.some((c) => c.id === 'cite_mai_hua_the_dung')).toBe(true);

    const sixYaoCitations = await repo.getCitationsByRuleSet('BO_PHE_CHINH_TONG_V1');
    expect(sixYaoCitations.length).toBeGreaterThanOrEqual(5);

    const zhuXiCitations = await repo.getCitationsByRuleSet('CHU_HI_V1');
    expect(zhuXiCitations.length).toBeGreaterThanOrEqual(4);

    const serialCitations = await repo.getCitationsByRuleSet('SERIAL-MOD8-V1');
    expect(serialCitations.length).toBeGreaterThanOrEqual(1);
  });

  it('lọc trích dẫn theo trạng thái xác minh và độ tin cậy', async () => {
    const verifiedCitations = await repo.getCitations({ verificationStatus: 'verified' });
    expect(verifiedCitations.length).toBeGreaterThan(0);

    const disputedCitations = await repo.getCitations({ verificationStatus: 'disputed' });
    expect(disputedCitations.length).toBeGreaterThanOrEqual(2);
    expect(disputedCitations.map((c) => c.id)).toContain('cite_tuan_khong_chan_gia');
    expect(disputedCitations.map((c) => c.id)).toContain('cite_gio_ty_da_chinh');
  });

  it('tìm kiếm trích dẫn toàn văn đa tầng (Hán văn, Phiên âm, Bản dịch, Thuật ngữ)', async () => {
    // Tìm bằng chữ Hán
    const hanSearch = await repo.searchCitations('潛龍');
    expect(hanSearch.length).toBeGreaterThanOrEqual(1);
    expect(hanSearch[0]?.id).toBe('cite_can_so_cuu');

    // Tìm bằng phiên âm Hán Việt
    const sinoSearch = await repo.searchCitations('Tiềm long vật dụng');
    expect(sinoSearch.length).toBeGreaterThanOrEqual(1);

    // Tìm bằng từ khóa dịch nghĩa
    const vietSearch = await repo.searchCitations('rồng còn ẩn nấp');
    expect(vietSearch.length).toBeGreaterThanOrEqual(1);

    // Tìm bằng chủ đề nạp giáp
    const napGiapSearch = await repo.searchCitations('Nạp Giáp');
    expect(napGiapSearch.length).toBeGreaterThanOrEqual(1);
  });

  it('tính toán số liệu thống kê kho tri thức chính xác', async () => {
    const stats = await repo.getStatistics();
    expect(stats.authorCount).toBe(10);
    expect(stats.bookCount).toBe(8);
    expect(stats.citationCount).toBeGreaterThanOrEqual(13);
    expect(stats.verifiedCitationCount + stats.disputedCitationCount + stats.underReviewCitationCount).toBe(
      stats.citationCount
    );
    expect(stats.disputedCitationCount).toBeGreaterThanOrEqual(2);
  });

  it('defaultKnowledgeRepository singleton hoạt động bình thường', async () => {
    const stats = await defaultKnowledgeRepository.getStatistics();
    expect(stats.authorCount).toBe(10);
  });
});
