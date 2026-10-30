import React, { useMemo, useState } from 'react';
import {
  LinePosition,
} from '@kindich/domain';
import {
  ComprehensiveInterpretationResult,
  interpretHexagram,
  orchestrateSixYaoAnalysis,
  SixYaoAnalysisResult,
  TiYongJudgmentLevel,
  SixYaoInterpretationResult,
  TiYongInterpretation,
} from '@kindich/core';
import { Card } from '@kindich/shared';
import { HexagramInterpretationViewProps, InterpretationTab } from './HexagramInterpretation.types';
import './HexagramInterpretation.css';

/**
 * Hiển thị nhãn Cát / Hung trực quan cho Mai Hoa Dịch Số
 */
function renderJudgmentBadge(level: TiYongJudgmentLevel) {
  switch (level) {
    case 'DAI_CAT':
      return (
        <span
          className="judgment-level-badge"
          style={{ backgroundColor: '#2E7D32', color: '#FFFFFF' }}
        >
          ĐẠI CÁT ✦✦✦
        </span>
      );
    case 'CAT':
      return (
        <span
          className="judgment-level-badge"
          style={{ backgroundColor: '#388E3C', color: '#FFFFFF' }}
        >
          TIỂU CÁT / CÁT ✦
        </span>
      );
    case 'BINH_HOA':
      return (
        <span
          className="judgment-level-badge"
          style={{ backgroundColor: '#F57F17', color: '#FFFFFF' }}
        >
          BÌNH HÒA ☯
        </span>
      );
    case 'HAU_TON':
      return (
        <span
          className="judgment-level-badge"
          style={{ backgroundColor: '#E65100', color: '#FFFFFF' }}
        >
          HAO TỔN ⚠
        </span>
      );
    case 'DAI_HUNG':
      return (
        <span
          className="judgment-level-badge"
          style={{ backgroundColor: '#B71C1C', color: '#FFFFFF' }}
        >
          ĐẠI HUNG ☠
        </span>
      );
    default:
      return null;
  }
}

/**
 * Component Hiển Thị Luận Giải Quẻ Toàn Diện (Interpretation Engine Integration)
 */
export const HexagramInterpretationView: React.FC<HexagramInterpretationViewProps> = ({
  trio,
  maiHuaResult,
  sixYaoResult,
  dateTime,
  initialTab = 'overview',
  initialIncludeAllLines = false,
  className = '',
}) => {
  // 1. Quản lý tab chủ động
  const [activeTab, setActiveTab] = useState<InterpretationTab>(initialTab);

  // 2. Quản lý tùy chọn hiển thị: Chỉ hào động hay toàn bộ 6 hào (Requirement 5)
  const hasMoving = trio.movingLineIndices.length > 0;
  const [includeAllLines, setIncludeAllLines] = useState<boolean>(
    initialIncludeAllLines || !hasMoving
  );

  // 3. Quản lý hào được focus / highlight khi nhấn liên kết hào động (Requirement 5)
  const [focusedLinePosition, setFocusedLinePosition] = useState<number | null>(null);

  // 4. Lọc xem một hào cụ thể trong tab kinh văn (null = xem danh sách theo includeAllLines)
  const [selectedSingleLine, setSelectedSingleLine] = useState<number | null>(null);

  // 5. Chuẩn bị kết quả Lục Hào (nếu chưa có thì gọi orchestrator)
  const resolvedSixYaoResult: SixYaoAnalysisResult = useMemo(() => {
    if (sixYaoResult) return sixYaoResult;
    return orchestrateSixYaoAnalysis({
      primaryHexagram: trio.primary.number,
      changingHexagram: trio.transformed?.number,
      movingLineIndices: trio.movingLineIndices,
      dateTime,
    });
  }, [sixYaoResult, trio, dateTime]);

  // 6. Thực thi Interpretation Engine từ @kindich/core
  const interp: ComprehensiveInterpretationResult = useMemo(() => {
    return interpretHexagram({
      trio,
      maiHuaResult,
      sixYaoResult: resolvedSixYaoResult,
      includeAllLines: true, // Luôn lấy toàn bộ hào để UI linh hoạt lọc
    });
  }, [trio, maiHuaResult, resolvedSixYaoResult]);

  // Điều hướng liên kết nhanh đến từng hào động (Requirement 5)
  const handleJumpToMovingLine = (pos: number) => {
    setActiveTab('classical');
    setFocusedLinePosition(pos);
    setSelectedSingleLine(pos);
    setTimeout(() => {
      const el = document.getElementById(`line-statement-${pos}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const primaryClassical = interp.primaryClassical;
  const hexTransform = interp.hexagramTransformation;
  const maiHuaSection = interp.maiHua;
  const sixYaoSection = interp.sixYao;

  return (
    <div
      className={`interpretation-container ${className}`}
      data-testid="hexagram-interpretation-view"
    >
      {/* 1. Header Khu Vực Luận Giải Quẻ (Requirement 1) */}
      <div className="interpretation-header">
        <div className="interpretation-title-group">
          <h3 className="interpretation-title">
            <span>☯</span>
            <span>Luận Giải Quẻ Toàn Diện</span>
          </h3>
          <p className="interpretation-subtitle">
            Hệ thống diễn giải chuẩn cổ pháp: Kinh Văn Chu Dịch • Quy Tắc Chu Hi • Mai Hoa Thể Dụng •
            Lục Hào Phân Tích
          </p>
        </div>

        <div className="interpretation-engine-badge">
          <span>⚙️</span>
          <span>{interp.engineVersion}</span>
        </div>
      </div>

      {/* 2. Thanh Chuyển Tab (Requirement 2) */}
      <nav className="interpretation-tabs" aria-label="Các chuyên mục luận giải quẻ">
        <button
          type="button"
          className={`interpretation-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>🧭</span>
          <span>Tổng quan quẻ</span>
        </button>

        <button
          type="button"
          className={`interpretation-tab-btn ${activeTab === 'classical' ? 'active' : ''}`}
          onClick={() => setActiveTab('classical')}
        >
          <span>📜</span>
          <span>Kinh văn cổ điển</span>
          {primaryClassical.hasVerifiedContent && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--bha-crimson-100)',
                color: 'var(--bha-crimson-800)',
                padding: '1px 6px',
                borderRadius: '10px',
              }}
            >
              ✓ Xác thực
            </span>
          )}
        </button>

        <button
          type="button"
          className={`interpretation-tab-btn ${activeTab === 'mai-hua' ? 'active' : ''}`}
          onClick={() => setActiveTab('mai-hua')}
        >
          <span>🌺</span>
          <span>Phân tích Mai Hoa</span>
          {maiHuaSection && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--bha-gold-100)',
                color: 'var(--bha-gold-800)',
                padding: '1px 6px',
                borderRadius: '10px',
              }}
            >
              Thể/Dụng
            </span>
          )}
        </button>

        <button
          type="button"
          className={`interpretation-tab-btn ${activeTab === 'six-yao' ? 'active' : ''}`}
          onClick={() => setActiveTab('six-yao')}
        >
          <span>⚔️</span>
          <span>Phân tích Lục Hào</span>
          {sixYaoSection && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                color: '#1565C0',
                padding: '1px 6px',
                borderRadius: '10px',
              }}
            >
              Thế/Ứng
            </span>
          )}
        </button>
      </nav>

      {/* 3. Nội Dung Tab 1: Tổng Quan Quẻ (Overview) */}
      {activeTab === 'overview' && (
        <div className="tab-pane tab-pane--overview" data-testid="interpretation-tab-overview">
          {/* Card: Quy Tắc Chu Hi Chiêm Đoán Biến Hào (Dịch Học Khải Mông) */}
          <Card padding="md" borderVariant="gold">
            <div className="classical-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <h4 className="classical-card__title">
                  Định Hướng Chiêm Đoán Cổ Pháp (Quy Tắc Chu Hi)
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="content-badge content-badge--metric">
                  ⚙️ PHÂN TÍCH KỸ THUẬT
                </span>
                <span className="content-badge content-badge--modern">
                  💡 GIẢI NGHĨA HIỆN ĐẠI
                </span>
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--bha-bg-subtle)',
                  borderRadius: 'var(--bha-radius-md)',
                  border: '1px solid var(--bha-border-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                    Tình trạng biến hào:
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                    {hexTransform.content.isStatic
                      ? 'Quẻ Tĩnh (Không có hào động)'
                      : `Có ${hexTransform.content.movingLineCount} hào động: Hào ${hexTransform.content.movingLineIndices.join(', ')}`}
                  </strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                    Chuyển dịch quẻ:
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    #{hexTransform.content.primaryHexagramNumber} {hexTransform.content.primaryHexagramName}{' '}
                    {hexTransform.content.changingHexagramNumber && (
                      <>➔ #{hexTransform.content.changingHexagramNumber} {hexTransform.content.changingHexagramName}</>
                    )}
                  </span>
                </div>
              </div>

              {/* Lời Quy Tắc Chu Hi */}
              <div className="classical-text-box">
                <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)' }}>
                  QUY TẮC CỔ ĐIỂN CHU HI:
                </span>
                <p
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--bha-crimson-800)',
                    margin: 0,
                  }}
                >
                  {hexTransform.content.divinationMethodRule}
                </p>
              </div>

              {/* Giải nghĩa phương pháp */}
              <div className="modern-text-box">
                <span style={{ fontSize: '0.8rem', color: '#1B5E20' }}>
                  HƯỚNG DẪN ỨNG DỤNG CHIÊM NGHIỆM:
                </span>
                <p className="modern-explanation-text">
                  {hexTransform.content.explanation}
                </p>
              </div>

              {/* Liên kết từng hào động (Requirement 5) */}
              {hasMoving && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(133, 22, 22, 0.04)',
                    border: '1px dashed var(--bha-crimson-300)',
                    borderRadius: 'var(--bha-radius-md)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--bha-crimson-800)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    🔗 Liên kết trực tiếp Hào Động ➔ Nội dung Hào Từ tương ứng:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {trio.movingLineIndices.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        className="line-nav-chip line-nav-chip--moving"
                        onClick={() => handleJumpToMovingLine(pos)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>● Xem Hào {pos} Động</span>
                        <span>➔</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="interp-source-footer">
              <span className="interp-source-item">
                <span>📚 Nguồn:</span>
                <strong>{hexTransform.source}</strong>
              </span>
              <span className="interp-version-tag">{hexTransform.version}</span>
            </div>
          </Card>

          {/* Card: Bộ 3 Quẻ Tóm Lược */}
          <Card padding="md" borderVariant="default" style={{ marginTop: '16px' }}>
            <h4
              style={{
                fontFamily: 'var(--bha-font-serif)',
                fontSize: '1.05rem',
                color: 'var(--bha-crimson-700)',
                marginBottom: '12px',
              }}
            >
              Ý Nghĩa Chuyển Dịch Bộ Ba Quẻ
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bha-bg-subtle)',
                  borderRadius: 'var(--bha-radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ CHỦ (GỐC)</span>
                <h5 style={{ margin: '4px 0', fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                  #{trio.primary.number} - {trio.primary.name}
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                  Trạng thái căn nguyên, điều kiện ban đầu của hoàn cảnh trước khi có biến động.
                </p>
              </div>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bha-bg-subtle)',
                  borderRadius: 'var(--bha-radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ HỖ (TRUNG GIAN)</span>
                <h5 style={{ margin: '4px 0', fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                  #{trio.nuclear.number} - {trio.nuclear.name}
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                  Quá trình tương tác ngầm định, diễn biến trung gian kết nối giữa chủ và biến.
                </p>
              </div>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bha-bg-subtle)',
                  borderRadius: 'var(--bha-radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ BIẾN (KẾT QUẢ)</span>
                <h5 style={{ margin: '4px 0', fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                  #{trio.transformed.number} - {trio.transformed.name}
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                  Xu hướng hồi kết sau khi các hào động đã chuyển giao năng lượng âm dương.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Nội Dung Tab 2: Kinh Văn Cổ Điển (Classical Texts - Requirement 3, 4, 7) */}
      {activeTab === 'classical' && (
        <div className="tab-pane tab-pane--classical" data-testid="interpretation-tab-classical">
          {/* Requirement 7: Nếu chưa có kinh văn xác thực -> cảnh báo rõ ràng, không bịa đặt nội dung */}
          {!primaryClassical.hasVerifiedContent || !primaryClassical.content ? (
            <div className="missing-data-alert" data-testid="missing-classical-alert">
              <span className="missing-data-alert__icon">⚠️</span>
              <div>
                <h4 className="missing-data-alert__title">
                  Kho Văn Bản Cổ Điển Chưa Có Dữ Liệu Xác Thực
                </h4>
                <p className="missing-data-alert__text">
                  {primaryClassical.notice ||
                    `Quẻ #${trio.primary.number} (${trio.primary.name}) hiện chưa có bản dịch đối chiếu kinh văn cổ điển đạt chuẩn xác thực trong kho dữ liệu.`}
                </p>
                <p className="missing-data-alert__notice">
                  * Nguyên tắc bảo tồn: Hệ thống tuyệt đối không tự động tạo sinh (hallucinate) hoặc
                  phóng tác lời quẻ/lời hào khi chưa có văn bản khảo dị đã được kiểm chứng chuẩn xác.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Thoán từ (彖辭) - Lời Quẻ (Requirement 3 & 4) */}
              <div className="classical-card" data-testid="classical-thuan-tu-card">
                <div className="classical-card__header">
                  <h4 className="classical-card__title">
                    Thoán Từ (彖辭) • Lời Quẻ #{primaryClassical.content.hexagramNumber}{' '}
                    {primaryClassical.content.hexagramName} ({primaryClassical.content.chineseName})
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="content-badge content-badge--classical">
                      📜 NGUYÊN VĂN CỔ ĐIỂN
                    </span>
                    <span className="content-badge content-badge--modern">
                      💡 GIẢI NGHĨA HIỆN ĐẠI
                    </span>
                  </div>
                </div>

                {/* Phần 1: Nguyên văn cổ điển (Requirement 4) */}
                <div className="classical-text-box">
                  <div className="classical-chinese">
                    {primaryClassical.content.thuanTu.chinese}
                  </div>
                  <div className="classical-sino">
                    {primaryClassical.content.thuanTu.sinoVietnamese}
                  </div>
                  <div className="classical-trans">
                    <strong>Dịch nghĩa:</strong> {primaryClassical.content.thuanTu.translation}
                  </div>
                </div>

                {/* Phần 2: Giải nghĩa hiện đại (Requirement 4) */}
                <div className="modern-text-box">
                  <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                    ỨNG DỤNG ĐẠO QUÂN TỬ & THỜI THẾ:
                  </span>
                  <p className="modern-explanation-text">
                    {primaryClassical.content.thuanTu.modernExplanation}
                  </p>
                </div>
              </div>

              {/* Đại Tượng Truyện (大象傳) (Requirement 3 & 4) */}
              <div className="classical-card" data-testid="classical-dai-tuong-card">
                <div className="classical-card__header">
                  <h4 className="classical-card__title">
                    Đại Tượng Truyện (大象傳) • Tượng Quẻ & Đạo Tu Thân
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="content-badge content-badge--classical">
                      📜 NGUYÊN VĂN CỔ ĐIỂN
                    </span>
                    <span className="content-badge content-badge--modern">
                      💡 GIẢI NGHĨA HIỆN ĐẠI
                    </span>
                  </div>
                </div>

                {/* Nguyên văn cổ điển */}
                <div className="classical-text-box">
                  <div className="classical-chinese">
                    {primaryClassical.content.daiTuong.chinese}
                  </div>
                  <div className="classical-sino">
                    {primaryClassical.content.daiTuong.sinoVietnamese}
                  </div>
                  <div className="classical-trans">
                    <strong>Dịch nghĩa:</strong> {primaryClassical.content.daiTuong.translation}
                  </div>
                </div>

                {/* Giải nghĩa hiện đại */}
                <div className="modern-text-box">
                  <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                    LỜI KHUYÊN HÀNH ĐỘNG:
                  </span>
                  <p className="modern-explanation-text">
                    {primaryClassical.content.daiTuong.modernExplanation}
                  </p>
                </div>
              </div>

              {/* Thanh Điều Hướng & Bộ Lọc Hào Từ (Requirement 5) */}
              <div className="moving-lines-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                    Hào Từ (爻辭) & Tiểu Tượng:
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)' }}>
                    ({includeAllLines ? 'Đang hiện đủ 6 hào' : 'Đang ưu tiên các hào động'})
                  </span>
                </div>

                <div className="moving-lines-pills">
                  <button
                    type="button"
                    className={`line-nav-chip ${
                      selectedSingleLine === null && !includeAllLines ? 'line-nav-chip--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedSingleLine(null);
                      setIncludeAllLines(false);
                    }}
                  >
                    Chỉ hào động ({trio.movingLineIndices.length})
                  </button>

                  <button
                    type="button"
                    className={`line-nav-chip ${
                      selectedSingleLine === null && includeAllLines ? 'line-nav-chip--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedSingleLine(null);
                      setIncludeAllLines(true);
                    }}
                  >
                    Toàn bộ 6 hào
                  </button>

                  {/* Các nút bấm chọn nhanh từng hào (Requirement 5) */}
                  {[1, 2, 3, 4, 5, 6].map((p) => {
                    const isMoving = trio.movingLineIndices.includes(p as LinePosition);
                    const isSelected = selectedSingleLine === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`line-nav-chip ${
                          isSelected
                            ? 'line-nav-chip--active'
                            : isMoving
                            ? 'line-nav-chip--moving'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedSingleLine(p);
                          setFocusedLinePosition(p);
                        }}
                      >
                        Hào {p} {isMoving ? '●' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Danh sách các Hào Từ & Tiểu Tượng (Requirement 3, 4, 5) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {primaryClassical.content.lines
                  .filter((l) => {
                    if (selectedSingleLine !== null) {
                      return l.position === selectedSingleLine;
                    }
                    if (!includeAllLines && hasMoving) {
                      return trio.movingLineIndices.includes(l.position as LinePosition);
                    }
                    return true;
                  })
                  .map((l) => {
                    const isMoving = trio.movingLineIndices.includes(l.position as LinePosition);
                    const isFocused = focusedLinePosition === l.position;

                    return (
                      <div
                        key={l.position}
                        id={`line-statement-${l.position}`}
                        className={`classical-card line-statement-card ${
                          isMoving ? 'line-statement-card--moving' : ''
                        } ${isFocused ? 'line-statement-card--focused' : ''}`}
                        data-testid={`classical-line-${l.position}`}
                      >
                        <div className="classical-card__header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 className="classical-card__title">
                              Hào {l.position}: {l.lineName}
                            </h4>
                            {isMoving && (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor: 'var(--bha-crimson-600)',
                                  color: '#fff',
                                  borderRadius: 'var(--bha-radius-full)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                ● HÀO ĐỘNG (Trọng tâm chiêm đoán)
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className="content-badge content-badge--classical">
                              📜 NGUYÊN VĂN
                            </span>
                            <span className="content-badge content-badge--modern">
                              💡 GIẢI NGHĨA
                            </span>
                          </div>
                        </div>

                        {/* Hào từ (爻辭) */}
                        <div className="classical-text-box">
                          <span style={{ fontSize: '0.78rem', color: 'var(--bha-crimson-700)', fontWeight: 700 }}>
                            HÀO TỪ (Chu Công):
                          </span>
                          <div className="classical-chinese">{l.haoTu.chinese}</div>
                          <div className="classical-sino">{l.haoTu.sinoVietnamese}</div>
                          <div className="classical-trans">
                            <strong>Dịch nghĩa:</strong> {l.haoTu.translation}
                          </div>
                        </div>

                        <div className="modern-text-box">
                          <span style={{ fontSize: '0.78rem', color: '#1B5E20', fontWeight: 600 }}>
                            GIẢI NGHĨA HÀO TỪ:
                          </span>
                          <p className="modern-explanation-text">
                            {l.haoTu.modernExplanation}
                          </p>
                        </div>

                        {/* Tiểu Tượng (小象傳) (Requirement 3) */}
                        {l.tieuTuong && (
                          <>
                            <div className="classical-text-box" style={{ marginTop: '4px' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--bha-crimson-700)', fontWeight: 700 }}>
                                TIỂU TƯỢNG TRUYỆN (Khổng Tử):
                              </span>
                              <div className="classical-chinese">{l.tieuTuong.chinese}</div>
                              <div className="classical-sino">{l.tieuTuong.sinoVietnamese}</div>
                              <div className="classical-trans">
                                <strong>Dịch nghĩa:</strong> {l.tieuTuong.translation}
                              </div>
                            </div>

                            <div className="modern-text-box">
                              <span style={{ fontSize: '0.78rem', color: '#1B5E20', fontWeight: 600 }}>
                                Ý NGHĨA TIỂU TƯỢNG:
                              </span>
                              <p className="modern-explanation-text">
                                {l.tieuTuong.modernExplanation}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Dụng Cửu / Dụng Lục (Đặc biệt) */}
              {primaryClassical.content.specialLine && (
                <div className="classical-card" style={{ borderColor: 'var(--bha-gold-500)' }}>
                  <div className="classical-card__header">
                    <h4 className="classical-card__title" style={{ color: 'var(--bha-gold-800)' }}>
                      {primaryClassical.content.hexagramNumber === 1
                        ? 'Dụng Cửu (Quẻ Thuần Càn Sáu Hào Đều Động)'
                        : 'Dụng Lục (Quẻ Thuần Khôn Sáu Hào Đều Động)'}
                    </h4>
                    <span className="content-badge content-badge--classical">
                      📜 ĐẶC BIỆT CỔ TRUYỀN
                    </span>
                  </div>
                  <div className="classical-text-box">
                    <div className="classical-chinese">
                      {primaryClassical.content.specialLine.chinese}
                    </div>
                    <div className="classical-sino">
                      {primaryClassical.content.specialLine.sinoVietnamese}
                    </div>
                    <div className="classical-trans">
                      <strong>Dịch nghĩa:</strong> {primaryClassical.content.specialLine.translation}
                    </div>
                  </div>
                  <div className="modern-text-box">
                    <p className="modern-explanation-text">
                      {primaryClassical.content.specialLine.modernExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Trích dẫn nguồn tham khảo và phiên bản (Requirement 6) */}
              <div className="interp-source-footer">
                <span className="interp-source-item">
                  <span>📚 Nguồn văn bản:</span>
                  <strong>{primaryClassical.source}</strong>
                </span>
                <span className="interp-version-tag">{primaryClassical.version}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Nội Dung Tab 3: Phân Tích Mai Hoa (Mai Hua Ti/Yong) */}
      {activeTab === 'mai-hua' && (
        <div className="tab-pane tab-pane--mai-hua" data-testid="interpretation-tab-mai-hua">
          {maiHuaSection ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const tiYong = maiHuaSection.content as TiYongInterpretation;
                const isPositive =
                  tiYong.judgmentLevel === 'DAI_CAT' || tiYong.judgmentLevel === 'CAT';
                const isNegative =
                  tiYong.judgmentLevel === 'DAI_HUNG' || tiYong.judgmentLevel === 'HAU_TON';

                return (
                  <Card padding="md" borderVariant="gold">
                    <div className="classical-card__header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌺</span>
                        <h4 className="classical-card__title">
                          Luận Giải Thể • Dụng (Mai Hoa Cổ Pháp)
                        </h4>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="content-badge content-badge--metric">
                          ⚙️ PHÂN TÍCH KỸ THUẬT
                        </span>
                        <span className="content-badge content-badge--modern">
                          💡 GIẢI NGHĨA HIỆN ĐẠI
                        </span>
                      </div>
                    </div>

                    <div
                      className={`ti-yong-judgment-box ${
                        isPositive
                          ? 'ti-yong-judgment-box--good'
                          : isNegative
                          ? 'ti-yong-judgment-box--bad'
                          : 'ti-yong-judgment-box--neutral'
                      }`}
                      style={{ marginTop: '16px' }}
                    >
                      <div>{renderJudgmentBadge(tiYong.judgmentLevel)}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{tiYong.relationName}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>{tiYong.explanation}</p>
                      </div>
                    </div>

                    {/* So sánh Thể và Dụng */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          backgroundColor: 'rgba(46, 125, 50, 0.06)',
                          border: '1px solid rgba(46, 125, 50, 0.2)',
                          borderRadius: 'var(--bha-radius-md)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 700 }}>
                          THỂ QUÁI (Chủ thể):
                        </span>
                        <h4 style={{ margin: '4px 0', fontSize: '1.05rem', color: '#1B5E20' }}>
                          Quái {tiYong.tiTrigram.name} ({tiYong.tiElement})
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                          Tượng: {tiYong.tiTrigram.nature} • Đại diện cho bản thân, việc gốc
                        </p>
                      </div>

                      <div
                        style={{
                          padding: '12px 16px',
                          backgroundColor: 'rgba(181, 135, 29, 0.08)',
                          border: '1px solid rgba(181, 135, 29, 0.25)',
                          borderRadius: 'var(--bha-radius-md)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--bha-gold-800)', fontWeight: 700 }}>
                          DỤNG QUÁI (Khách thể):
                        </span>
                        <h4 style={{ margin: '4px 0', fontSize: '1.05rem', color: 'var(--bha-gold-800)' }}>
                          Quái {tiYong.yongTrigram.name} ({tiYong.yongElement})
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                          Tượng: {tiYong.yongTrigram.nature} • Đại diện cho sự việc động, ngoại cảnh
                        </p>
                      </div>
                    </div>

                    {/* Lời khuyên và Diễn giải chi tiết */}
                    <div className="modern-text-box" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                        LỜI KHUYÊN HÀNH XỬ THỰC TIỄN:
                      </span>
                      <p className="modern-explanation-text">{tiYong.advice}</p>
                    </div>

                    <div className="classical-text-box">
                      <span style={{ fontSize: '0.8rem', color: 'var(--bha-crimson-700)', fontWeight: 600 }}>
                        CÂU PHÚ THỂ DỤNG CỔ TRUYỀN:
                      </span>
                      <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--bha-text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{tiYong.classicalVerse}"
                      </p>
                    </div>

                    {/* Nguồn tham khảo & Version (Requirement 6) */}
                    <div className="interp-source-footer">
                      <span className="interp-source-item">
                        <span>📚 Nguồn:</span>
                        <strong>{maiHuaSection.source}</strong>
                      </span>
                      <span className="interp-version-tag">{maiHuaSection.version}</span>
                    </div>
                  </Card>
                );
              })()}
            </div>
          ) : (
            <Card padding="md">
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--bha-text-secondary)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🌺</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--bha-crimson-800)', marginBottom: '6px' }}>
                  Chưa Có Dữ Liệu Mai Hoa Dịch Số
                </h4>
                <p style={{ fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px' }}>
                  Lần lập quẻ này xuất phát từ phương pháp Seri tiền hoặc tra cứu tổng hợp, chưa xác lập quái Thể và quái Dụng theo số lý thời gian.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-muted)' }}>
                  💡 Gợi ý: Hãy chuyển sang mục <strong>"Giờ động tâm"</strong> ở menu trên nếu bạn muốn khởi quẻ và giải đoán theo thuật Mai Hoa Dịch Số của Thiệu Khang Tiết.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* 6. Nội Dung Tab 4: Phân Tích Lục Hào (Six Yao Interpretation) */}
      {activeTab === 'six-yao' && (
        <div className="tab-pane tab-pane--six-yao" data-testid="interpretation-tab-six-yao">
          {sixYaoSection ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const sixYao = sixYaoSection.content as SixYaoInterpretationResult;

                return (
                  <>
                    {/* Thẻ 1: Phân Tích Thế Ứng Cổ Pháp */}
                    <Card padding="md" borderVariant="gold">
                      <div className="classical-card__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>⚔️</span>
                          <h4 className="classical-card__title">
                            Phân Tích Thế Ứng Cổ Pháp (Bốc Phệ Chính Tông)
                          </h4>
                        </div>
                        <span className="content-badge content-badge--metric">
                          ⚙️ PHÂN TÍCH KỸ THUẬT
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '12px',
                          marginTop: '16px',
                        }}
                      >
                        {/* Hào Thế */}
                        <div
                          style={{
                            padding: '14px',
                            backgroundColor: 'rgba(133, 22, 22, 0.05)',
                            border: '1px solid var(--bha-crimson-300)',
                            borderRadius: 'var(--bha-radius-md)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                            HÀO THẾ (Bản thân / Chủ thể):
                          </span>
                          <h4 style={{ margin: '4px 0', fontSize: '1.1rem', color: 'var(--bha-crimson-800)' }}>
                            Hào {sixYao.shiYing.worldLine} ({sixYao.shiYing.worldElement})
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                            Cung: {sixYao.shiYing.palaceName} ({sixYao.shiYing.palaceElement}) • Đại diện cho bản thân, năng lực, việc gốc
                          </p>
                        </div>

                        {/* Hào Ứng */}
                        <div
                          style={{
                            padding: '14px',
                            backgroundColor: 'rgba(30, 136, 229, 0.05)',
                            border: '1px solid rgba(30, 136, 229, 0.3)',
                            borderRadius: 'var(--bha-radius-md)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1565C0' }}>
                            HÀO ỨNG (Đối tượng / Khách thể):
                          </span>
                          <h4 style={{ margin: '4px 0', fontSize: '1.1rem', color: '#0D47A1' }}>
                            Hào {sixYao.shiYing.responseLine} ({sixYao.shiYing.responseElement})
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)', margin: 0 }}>
                            Đại diện cho tha nhân, đối phương, khách hàng, môi trường xung quanh
                          </p>
                        </div>
                      </div>

                      {/* Quan hệ Thế - Ứng */}
                      <div className="classical-text-box" style={{ marginTop: '14px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--bha-crimson-700)', fontWeight: 600 }}>
                          TƯƠNG QUAN THẾ • ỨNG:
                        </span>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                          {sixYao.shiYing.relationName}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--bha-text-muted)', fontStyle: 'italic' }}>
                          * {sixYao.shiYing.classicalReference}
                        </p>
                      </div>

                      <div className="modern-text-box" style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                          LỜI KHUYÊN CHIÊM ĐOÁN:
                        </span>
                        <p className="modern-explanation-text">{sixYao.shiYing.explanation}</p>
                      </div>
                    </Card>

                    {/* Thẻ 2: Bảng 5 Lục Thân & Định Vị Dụng Thần */}
                    <Card padding="md" style={{ marginTop: '14px' }}>
                      <div className="classical-card__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>📜</span>
                          <h4 className="classical-card__title">
                            Bảng Lục Thân & Định Vị Dụng Thần (Tăng San Bốc Dịch)
                          </h4>
                        </div>
                        <span className="content-badge content-badge--modern">
                          💡 DỤNG THẦN CHIÊM SỰ
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto', marginTop: '14px' }}>
                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem',
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                borderBottom: '2px solid var(--bha-border-base)',
                                backgroundColor: 'var(--bha-bg-subtle)',
                                textAlign: 'left',
                              }}
                            >
                              <th style={{ padding: '8px 12px' }}>Vị trí hào</th>
                              <th style={{ padding: '8px 12px' }}>Lục Thân</th>
                              <th style={{ padding: '8px 12px' }}>Can Chi & Hành</th>
                              <th style={{ padding: '8px 12px' }}>Ý nghĩa đại diện</th>
                              <th style={{ padding: '8px 12px' }}>Vai trò chiêm sự</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sixYao.relations.map((rel) => (
                              <tr
                                key={rel.position}
                                style={{
                                  borderBottom: '1px solid var(--bha-border-light)',
                                }}
                              >
                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                  Hào {rel.position}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                                  {rel.relationName}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  {rel.branch} ({rel.elementName})
                                </td>
                                <td style={{ padding: '10px 12px', color: 'var(--bha-text-secondary)' }}>
                                  {rel.generalSignificance}
                                </td>
                                <td style={{ padding: '10px 12px', color: 'var(--bha-text-primary)' }}>
                                  {rel.lineRoleDescription}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Thẻ 3: Tác Động Nhật Nguyệt & Vượng Suy */}
                    <Card padding="md" style={{ marginTop: '14px' }}>
                      <div className="classical-card__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>🌙</span>
                          <h4 className="classical-card__title">
                            Tác Động Nhật Thần, Nguyệt Kiến & Vượng Suy
                          </h4>
                        </div>
                        <span className="content-badge content-badge--metric">
                          ⚙️ ĐỊNH LƯỢNG VẬN KHÍ
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          marginTop: '14px',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bha-bg-subtle)',
                            borderRadius: 'var(--bha-radius-sm)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                            NHẬT THẦN (Chi ngày):
                          </span>
                          <h5 style={{ margin: '2px 0', fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                            {sixYao.officerImpact.dayBranch}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--bha-text-secondary)' }}>
                            Chủ về sinh khắc tức thời, hợp xung hào
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bha-bg-subtle)',
                            borderRadius: 'var(--bha-radius-sm)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                            NGUYỆT KIẾN (Chi tháng):
                          </span>
                          <h5 style={{ margin: '2px 0', fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                            {sixYao.officerImpact.monthBranch}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--bha-text-secondary)' }}>
                            Chủ về khí lệnh 4 mùa, vượng tướng hưu tù tử
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bha-bg-subtle)',
                            borderRadius: 'var(--bha-radius-sm)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                            TUẦN KHÔNG:
                          </span>
                          <h5 style={{ margin: '2px 0', fontSize: '1rem', color: '#E65100' }}>
                            {sixYao.officerImpact.voidBranches.join(', ')}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--bha-text-secondary)' }}>
                            {sixYao.officerImpact.worldLineAnalysis.isVoid
                              ? 'Hào Thế lâm Không Vong'
                              : 'Hào Thế không lâm Không'}
                          </p>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            backgroundColor: 'var(--bha-bg-subtle)',
                            borderRadius: 'var(--bha-radius-sm)',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                            NGUYỆT PHÁ:
                          </span>
                          <h5 style={{ margin: '2px 0', fontSize: '1rem', color: '#C62828' }}>
                            {sixYao.officerImpact.monthlyBreakBranch}
                          </h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--bha-text-secondary)' }}>
                            {sixYao.officerImpact.worldLineAnalysis.isMonthlyBreak
                              ? 'Hào Thế bị Nguyệt Phá'
                              : 'Hào Thế không bị Nguyệt Phá'}
                          </p>
                        </div>
                      </div>

                      {/* Tóm tắt vượng suy Hào Thế */}
                      <div className="classical-text-box" style={{ marginTop: '14px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--bha-crimson-700)', fontWeight: 600 }}>
                          ĐÁNH GIÁ HÀO THẾ THEO NGUYỆT LỆNH:
                        </span>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                          Trạng thái: {sixYao.officerImpact.worldLineAnalysis.levelName} ({sixYao.officerImpact.worldLineAnalysis.seasonalStrength})
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--bha-text-secondary)' }}>
                          {sixYao.officerImpact.worldLineAnalysis.explanation}
                        </p>
                      </div>

                      {/* Tóm tắt vượng suy toàn thể */}
                      <div className="modern-text-box" style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                          TỔNG QUAN TÁC ĐỘNG NHẬT NGUYỆT:
                        </span>
                        <p className="modern-explanation-text">
                          {sixYao.officerImpact.summaryOverview}
                        </p>
                      </div>
                    </Card>

                    {/* Nguồn tham khảo & Phiên bản Lục Hào (Requirement 6) */}
                    <div className="interp-source-footer">
                      <span className="interp-source-item">
                        <span>📚 Nguồn tư liệu:</span>
                        <strong>{sixYaoSection.source}</strong>
                      </span>
                      <span className="interp-version-tag">{sixYaoSection.version}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <Card padding="md">
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--bha-text-secondary)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>⚔️</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--bha-crimson-800)', marginBottom: '6px' }}>
                  Chưa Có Dữ Liệu Lục Hào
                </h4>
                <p style={{ fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto' }}>
                  Không thể khởi tạo dữ liệu Lục Hào cho quẻ này.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
