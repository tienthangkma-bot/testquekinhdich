import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '@kindich/shared';
import type {
  Author,
  KnowledgeBook,
  ClassicalCitation,
  KnowledgeStatistics,
} from '@kindich/domain';
import {
  defaultKnowledgeRepository,
  SCHOOL_OF_THOUGHT_NAMES,
  RELIABILITY_LEVEL_NAMES,
  VERIFICATION_STATUS_NAMES,
} from '@kindich/domain';
import './KnowledgeSourceView.css';

type KnowledgeTab = 'citations' | 'books' | 'authors' | 'rulesets';

export const KnowledgeSourceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('citations');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedReliability, setSelectedReliability] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRuleSet, setSelectedRuleSet] = useState<string>('all');
  const [filterBookId, setFilterBookId] = useState<string | null>(null);
  const [filterAuthorId, setFilterAuthorId] = useState<string | null>(null);

  const [authors, setAuthors] = useState<readonly Author[]>([]);
  const [books, setBooks] = useState<readonly KnowledgeBook[]>([]);
  const [citations, setCitations] = useState<readonly ClassicalCitation[]>([]);
  const [stats, setStats] = useState<KnowledgeStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo và tải dữ liệu từ Repository Offline
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedAuthors, loadedBooks, loadedCitations, loadedStats] = await Promise.all([
          defaultKnowledgeRepository.getAuthors(),
          defaultKnowledgeRepository.getBooks(),
          defaultKnowledgeRepository.getCitations(),
          defaultKnowledgeRepository.getStatistics(),
        ]);
        setAuthors(loadedAuthors);
        setBooks(loadedBooks);
        setCitations(loadedCitations);
        setStats(loadedStats);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Lọc danh sách trích dẫn căn cứ trên các tiêu chí
  const filteredCitations = useMemo(() => {
    let result = [...citations];

    if (filterBookId) {
      result = result.filter((c) => c.bookId === filterBookId);
    }

    if (filterAuthorId) {
      result = result.filter((c) => c.authorId === filterAuthorId);
    }

    if (selectedSchool !== 'all') {
      result = result.filter((c) => c.schoolOfThought === selectedSchool);
    }

    if (selectedReliability !== 'all') {
      result = result.filter((c) => c.reliabilityLevel === selectedReliability);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((c) => c.verificationStatus === selectedStatus);
    }

    if (selectedRuleSet !== 'all') {
      result = result.filter((c) => c.relatedRuleSets.includes(selectedRuleSet));
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase().trim();
      result = result.filter(
        (c) =>
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

    return result;
  }, [
    citations,
    filterBookId,
    filterAuthorId,
    selectedSchool,
    selectedReliability,
    selectedStatus,
    selectedRuleSet,
    searchKeyword,
  ]);

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedSchool('all');
    setSelectedReliability('all');
    setSelectedStatus('all');
    setSelectedRuleSet('all');
    setFilterBookId(null);
    setFilterAuthorId(null);
  };

  const handleSelectBook = (bookId: string) => {
    setFilterBookId(bookId);
    setFilterAuthorId(null);
    setActiveTab('citations');
  };

  const handleSelectAuthor = (authorId: string) => {
    setFilterAuthorId(authorId);
    setFilterBookId(null);
    setActiveTab('citations');
  };

  const handleSelectRuleSetFromMatrix = (ruleSetId: string) => {
    setSelectedRuleSet(ruleSetId);
    setFilterBookId(null);
    setFilterAuthorId(null);
    setActiveTab('citations');
  };

  return (
    <div className="knowledge-sources-view">
      {/* Header Giới Thiệu & Thống Kê Tổng Thể */}
      <Card
        title="Quản Lý Nguồn Tri Thức Kinh Điển (Knowledge Sources)"
        subtitle="Hệ thống tra cứu thư tịch, trích dẫn 3 tầng văn bản và đối chiếu chuẩn mực học thuật"
        borderVariant="gold"
        padding="lg"
      >
        <div className="ks-stats-bar">
          <div className="ks-stat-card">
            <span className="ks-stat-value">{stats ? stats.authorCount : 0}</span>
            <span className="ks-stat-label">Tác giả & Dịch gia</span>
          </div>
          <div className="ks-stat-card">
            <span className="ks-stat-value">{stats ? stats.bookCount : 0}</span>
            <span className="ks-stat-label">Bộ Thư tịch cổ bản</span>
          </div>
          <div className="ks-stat-card">
            <span className="ks-stat-value">{stats ? stats.citationCount : 0}</span>
            <span className="ks-stat-label">Trích dẫn 3 tầng văn bản</span>
          </div>
          <div className="ks-stat-card">
            <span className="ks-stat-value" style={{ color: '#166534' }}>
              {stats ? stats.verifiedCitationCount : 0}
            </span>
            <span className="ks-stat-label">Đã xác minh nguyên bản</span>
          </div>
          <div className="ks-stat-card">
            <span className="ks-stat-value" style={{ color: '#991b1b' }}>
              {stats ? stats.disputedCitationCount : 0}
            </span>
            <span className="ks-stat-label">Chủ đề có khảo dị học thuật</span>
          </div>
        </div>

        <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--bha-text-secondary)' }}>
          <span className="status-tag" style={{ marginRight: '8px' }}>
            <span className="status-dot"></span>
            100% Hoạt động Offline
          </span>
          Toàn bộ dữ liệu Hán văn, phiên âm, bản dịch và chú giải được nhúng trực tiếp trong ứng dụng,
          cam kết không hư cấu trích dẫn và liên kết minh bạch với từng RuleSet.
        </div>
      </Card>

      {/* Tabs Điều Hướng */}
      <div className="ks-tabs-nav">
        <button
          type="button"
          className={`ks-tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
          onClick={() => setActiveTab('citations')}
        >
          <span>📜</span>
          <span>Tra cứu trích dẫn ({citations.length})</span>
        </button>
        <button
          type="button"
          className={`ks-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <span>📚</span>
          <span>Thư viện thư tịch ({books.length})</span>
        </button>
        <button
          type="button"
          className={`ks-tab-btn ${activeTab === 'authors' ? 'active' : ''}`}
          onClick={() => setActiveTab('authors')}
        >
          <span>👤</span>
          <span>Danh nhân Dịch học ({authors.length})</span>
        </button>
        <button
          type="button"
          className={`ks-tab-btn ${activeTab === 'rulesets' ? 'active' : ''}`}
          onClick={() => setActiveTab('rulesets')}
        >
          <span>⚖️</span>
          <span>Đối chiếu RuleSets</span>
        </button>
      </div>

      {/* TAB 1: TRA CỨU TRÍCH DẪN & 3 TẦNG VĂN BẢN */}
      {activeTab === 'citations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Thanh tìm kiếm và bộ lọc đa chiều */}
          <div className="ks-filter-bar">
            <div className="ks-search-row">
              <input
                type="text"
                className="ks-search-input"
                placeholder="Tìm kiếm theo chữ Hán, phiên âm, bản dịch, thuật ngữ, quẻ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Đặt lại bộ lọc
              </Button>
            </div>

            <div className="ks-filter-row">
              <select
                className="ks-filter-select"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="all">Tất cả trường phái</option>
                <option value="nghia_ly">Nghĩa Lý Phái</option>
                <option value="tuong_so">Tượng Số Phái</option>
                <option value="luc_hao">Lục Hào Phái</option>
                <option value="co_phap_bac_ha">Cổ Pháp Bắc Hà Tân An</option>
              </select>

              <select
                className="ks-filter-select"
                value={selectedReliability}
                onChange={(e) => setSelectedReliability(e.target.value)}
              >
                <option value="all">Tất cả cấp độ tin cậy</option>
                <option value="canonical">Chính Kinh (Tối thượng)</option>
                <option value="standard">Chính Truyền (Kinh điển)</option>
                <option value="commentary">Khảo Cứu & Chú Giải</option>
              </select>

              <select
                className="ks-filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái xác minh</option>
                <option value="verified">Đã xác minh nguyên bản</option>
                <option value="disputed">Có khảo dị học thuật</option>
                <option value="under_review">Đang rà soát</option>
              </select>

              <select
                className="ks-filter-select"
                value={selectedRuleSet}
                onChange={(e) => setSelectedRuleSet(e.target.value)}
              >
                <option value="all">Tất cả RuleSets</option>
                <option value="BO_PHE_CHINH_TONG_V1">BO_PHE_CHINH_TONG_V1</option>
                <option value="MAI-HUA-V1">MAI-HUA-V1</option>
                <option value="CHU_HI_V1">CHU_HI_V1</option>
                <option value="SERIAL-MOD8-V1">SERIAL-MOD8-V1</option>
                <option value="RULESET-DEFAULT">RULESET-DEFAULT</option>
              </select>
            </div>

            {/* Thông báo lọc theo sách hoặc tác giả */}
            {(filterBookId || filterAuthorId) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--bha-crimson-800)',
                }}
              >
                <span>
                  Đang lọc theo:{' '}
                  <strong>
                    {filterBookId
                      ? books.find((b) => b.id === filterBookId)?.title
                      : authors.find((a) => a.id === filterAuthorId)?.name}
                  </strong>
                </span>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    setFilterBookId(null);
                    setFilterAuthorId(null);
                  }}
                >
                  Xóa điều kiện này
                </button>
              </div>
            )}
          </div>

          {/* Danh sách các trích dẫn */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
              Đang tải dữ liệu trích dẫn kinh điển...
            </div>
          ) : filteredCitations.length === 0 ? (
            <div className="ks-empty-state">
              <div className="ks-empty-icon">📜</div>
              <div className="ks-empty-text">Không tìm thấy trích dẫn phù hợp</div>
              <div className="ks-empty-sub">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm "Đặt lại bộ lọc" để xem toàn bộ 13+ trích dẫn.
              </div>
            </div>
          ) : (
            <div className="ks-citation-list">
              {filteredCitations.map((citation) => (
                <div key={citation.id} className="ks-citation-card">
                  {/* Header Trích Dẫn */}
                  <div className="ks-citation-header">
                    <h3 className="ks-citation-title">{citation.topic}</h3>
                    <div className="ks-citation-badges">
                      <span className={`ks-badge ks-badge-${citation.reliabilityLevel}`}>
                        {RELIABILITY_LEVEL_NAMES[citation.reliabilityLevel]}
                      </span>
                      <span className={`ks-badge ks-badge-${citation.verificationStatus}`}>
                        {VERIFICATION_STATUS_NAMES[citation.verificationStatus]}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Nguồn Thư Tịch Cụ Thể */}
                  <div className="ks-source-meta">
                    <div>
                      Sách nguồn: <strong>{citation.bookTitle}</strong>
                    </div>
                    <div>
                      Tác giả: <strong>{citation.authorName}</strong>
                    </div>
                    <div>
                      Quyển / Chương: <strong>{citation.chapter}</strong>
                    </div>
                    {citation.section && (
                      <div>
                        Tiết mục: <strong>{citation.section}</strong>
                      </div>
                    )}
                    {citation.pageNumber && (
                      <div>
                        Trang / Quy ước: <strong>{citation.pageNumber}</strong>
                      </div>
                    )}
                    <div>
                      Ấn bản: <em>{citation.edition}</em>
                    </div>
                  </div>

                  {/* Cấu trúc 3 Tầng Văn Bản */}
                  <div className="ks-three-layers">
                    {/* Tầng 1: Nguyên văn chữ Hán */}
                    <div className="ks-layer ks-layer-original">
                      <div className="ks-layer-label">
                        <span>⛩️</span>
                        <span>Tầng 1: Nguyên Văn Chữ Hán & Phiên Âm Cổ Điển</span>
                      </div>
                      <div className="ks-text-original">{citation.content.original}</div>
                      <div className="ks-text-sino-viet">
                        <strong>Hán Việt:</strong> {citation.content.sinoVietnamese}
                      </div>
                    </div>

                    {/* Tầng 2: Bản dịch nghĩa tiếng Việt */}
                    <div className="ks-layer ks-layer-translation">
                      <div className="ks-layer-label">
                        <span>📖</span>
                        <span>Tầng 2: Bản Dịch Nghĩa Tiếng Việt Chuẩn Tắc</span>
                      </div>
                      <div className="ks-text-translation">{citation.content.translation}</div>
                    </div>

                    {/* Tầng 3: Lời giải thích & Ứng dụng quy tắc */}
                    <div className="ks-layer ks-layer-explanation">
                      <div className="ks-layer-label">
                        <span>💡</span>
                        <span>Tầng 3: Bình Giải Nghĩa Lý & Quy Tắc Thực Hành</span>
                      </div>
                      <div className="ks-text-explanation">{citation.content.explanation}</div>
                    </div>
                  </div>

                  {/* Cảnh báo khảo dị học thuật nếu có */}
                  {citation.verificationStatus === 'disputed' && citation.disputeNotes && (
                    <div className="ks-dispute-alert">
                      <strong>⚠️ Khảo dị học thuật:</strong> {citation.disputeNotes}
                    </div>
                  )}

                  {/* Footer: Liên kết RuleSet */}
                  <div className="ks-citation-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--bha-text-secondary)', fontSize: '0.8rem' }}>
                        Áp dụng trong RuleSets:
                      </span>
                      {citation.relatedRuleSets.map((rs) => (
                        <span key={rs} className="ks-badge ks-badge-ruleset">
                          {rs}
                        </span>
                      ))}
                    </div>

                    <div style={{ color: 'var(--bha-text-muted)', fontSize: '0.8rem' }}>
                      Trường phái: <strong>{SCHOOL_OF_THOUGHT_NAMES[citation.schoolOfThought]}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THƯ VIỆN THƯ TỊCH */}
      {activeTab === 'books' && (
        <div className="ks-grid-list">
          {books.map((book) => {
            const author = authors.find((a) => a.id === book.authorId);
            const bookCitationsCount = citations.filter((c) => c.bookId === book.id).length;

            return (
              <div key={book.id} className="ks-grid-card">
                <div className="ks-grid-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="ks-grid-card-title">{book.title}</h3>
                    <span className={`ks-badge ks-badge-${book.reliabilityLevel}`}>
                      {RELIABILITY_LEVEL_NAMES[book.reliabilityLevel]}
                    </span>
                  </div>
                  <div className="ks-grid-card-sub" style={{ fontStyle: 'italic' }}>
                    {book.nativeTitle} • {book.period}
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    Tác giả: <strong>{author ? author.name : book.authorId}</strong>
                  </div>
                  <div>
                    Ấn bản: <em>{book.edition}</em>
                  </div>
                  {book.publisher && (
                    <div>
                      Nơi tàng bản: <span>{book.publisher}</span>
                    </div>
                  )}
                  <div>
                    Ngôn ngữ: <span>{book.language}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', lineHeight: 1.5 }}>
                  {book.description}
                </p>

                {/* Mục lục tóm tắt */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #e5e7eb' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#555' }}>
                    Mục lục các quyển chính ({book.chapters.length} quyển):
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: '#666' }}>
                    {book.chapters.slice(0, 3).map((ch, idx) => (
                      <li key={idx}>{ch}</li>
                    ))}
                    {book.chapters.length > 3 && (
                      <li style={{ fontStyle: 'italic' }}>...và {book.chapters.length - 3} quyển khác</li>
                    )}
                  </ul>

                  <div style={{ marginTop: '12px', textAlign: 'right' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectBook(book.id)}
                    >
                      Xem trích dẫn ({bookCitationsCount}) ➔
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: DANH NHÂN DỊCH HỌC */}
      {activeTab === 'authors' && (
        <div className="ks-grid-list">
          {authors.map((author) => {
            const authorBooks = books.filter((b) => b.authorId === author.id);
            const authorCitations = citations.filter((c) => c.authorId === author.id);

            return (
              <div key={author.id} className="ks-grid-card">
                <div className="ks-grid-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="ks-grid-card-title">{author.name}</h3>
                    <span className="ks-badge ks-badge-standard">
                      {author.dynasty}
                    </span>
                  </div>
                  <div className="ks-grid-card-sub">
                    {author.nativeName}
                    {author.courtesyName ? ` (${author.courtesyName})` : ''} • {author.period}
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--bha-crimson-800)', fontWeight: 600 }}>
                  Trường phái: {SCHOOL_OF_THOUGHT_NAMES[author.schoolOfThought]}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', lineHeight: 1.5 }}>
                  {author.biography}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #e5e7eb' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#555' }}>
                    Tác phẩm tiêu biểu:
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#444' }}>
                    {author.notableWorks.join(' • ')}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {authorBooks.length} thư tịch • {authorCitations.length} trích dẫn
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectAuthor(author.id)}
                    >
                      Xem trích dẫn ➔
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: ĐỐI CHIẾU RULESETS & MA TRẬN NGUỒN GỐC */}
      {activeTab === 'rulesets' && (
        <Card
          title="Bảng Đối Chiếu Ma Trận: RuleSets & Cổ Thư Kinh Điển"
          subtitle="Minh bạch hóa xuất xứ học thuật của từng bộ quy tắc đang vận hành trong dự án"
          padding="lg"
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="ks-matrix-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>RuleSet ID & Tên</th>
                  <th style={{ width: '25%' }}>Căn cứ Thư tịch & Tác giả</th>
                  <th style={{ width: '38%' }}>Nội dung quy tắc học thuật</th>
                  <th style={{ width: '15%' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style={{ color: 'var(--bha-crimson-800)' }}>BO_PHE_CHINH_TONG_V1</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      Phân tích Lục Hào Cổ Pháp
                    </div>
                  </td>
                  <td>
                    <div><strong>Bốc Phệ Chính Tông</strong> (Vương Duy Đức)</div>
                    <div><strong>Tăng San Bốc Dịch</strong> (Dã Hạc Đạo Nhân)</div>
                    <div><strong>Kinh Thị Dịch Truyện</strong> (Kinh Phòng)</div>
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      <li>Phân định 64 quẻ vào Bát Cung, an hào Thế Ứng.</li>
                      <li>Khẩu quyết Nạp Giáp Can Chi Kinh Phòng cho 6 hào.</li>
                      <li>Phối ngũ hành an Lục Thân (Phụ Mẫu, Huynh Đệ, Tử Tôn, Thê Tài, Quan Quỷ).</li>
                      <li>Khởi Lục Thú (Long, Tước, Trần, Xà, Hổ, Vũ) theo Can ngày.</li>
                      <li>Sinh khắc Nhật Thần, Nguyệt Kiến, Tuần Không (Chân/Giả Không), Ám Động.</li>
                    </ul>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectRuleSetFromMatrix('BO_PHE_CHINH_TONG_V1')}
                    >
                      Xem chứng cứ ➔
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong style={{ color: 'var(--bha-crimson-800)' }}>MAI-HUA-V1</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      Mai Hoa Dịch Số
                    </div>
                  </td>
                  <td>
                    <div><strong>Mai Hoa Dịch Số</strong> (Thiệu Ung - Thiệu Khang Tiết)</div>
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      <li>Quy số Bát Quái Tiên Thiên (1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn).</li>
                      <li>Lập quẻ theo số lý Năm, Tháng, Ngày, Giờ Âm lịch.</li>
                      <li>Phân chia Thể Quái (chủ thể) và Dụng Quái (sự việc).</li>
                      <li>Luận giải sinh khắc ngũ hành giữa Thể và Dụng (Thể sinh Dụng, Dụng sinh Thể, Tỷ hòa...).</li>
                    </ul>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectRuleSetFromMatrix('MAI-HUA-V1')}
                    >
                      Xem chứng cứ ➔
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong style={{ color: 'var(--bha-crimson-800)' }}>CHU_HI_V1</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      Chu Dịch Bản Nghĩa
                    </div>
                  </td>
                  <td>
                    <div><strong>Chu Dịch Bản Nghĩa</strong> (Chu Hi)</div>
                    <div><strong>Chu Dịch Chính Nghĩa</strong> (Khổng Dĩnh Đạt)</div>
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      <li>Phân bổ trọng tâm kinh văn căn cứ theo số lượng hào động (từ 0 đến 6 hào toàn biến).</li>
                      <li>Quy tắc đọc Thoán từ, Hào từ quẻ chủ và quẻ biến chính xác, không mâu thuẫn.</li>
                    </ul>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectRuleSetFromMatrix('CHU_HI_V1')}
                    >
                      Xem chứng cứ ➔
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong style={{ color: 'var(--bha-crimson-800)' }}>SERIAL-MOD8-V1</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      Lập Quẻ Seri Tiền Mặt
                    </div>
                  </td>
                  <td>
                    <div><strong>Bắc Hà Tân An Dịch Học Chỉ Nam</strong> (Cụ Bắc Hà)</div>
                  </td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      <li>Vị trí lẻ thuộc Dương tính Thượng quái (chia 8 lấy dư).</li>
                      <li>Vị trí chẵn thuộc Âm tính Hạ quái (chia 8 lấy dư).</li>
                      <li>Tổng toàn bộ dãy số là Thái Cực hỗn nguyên, chia 6 lấy dư xác định Hào động.</li>
                    </ul>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectRuleSetFromMatrix('SERIAL-MOD8-V1')}
                    >
                      Xem chứng cứ ➔
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeSourceView;
