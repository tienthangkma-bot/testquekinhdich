import React, { useMemo } from 'react';
import { HexagramTrio } from '@kindich/domain';
import {
  interpretHexagram,
  ComprehensiveInterpretationResult,
  SixYaoAnalysisResult,
  MaiHuaCastingResult,
} from '@kindich/core';

interface WorkspaceInterpretationProps {
  trio: HexagramTrio;
  sixYaoResult: SixYaoAnalysisResult;
  maiHuaResult?: MaiHuaCastingResult;
  question?: string;
  inquiryType?: string;
}

export const WorkspaceInterpretation: React.FC<WorkspaceInterpretationProps> = ({
  trio,
  sixYaoResult,
  maiHuaResult,
  question,
  inquiryType,
}) => {
  // Sinh dữ liệu luận giải từ Interpretation Orchestrator của @kindich/core
  const interpretation: ComprehensiveInterpretationResult = useMemo(() => {
    return interpretHexagram({
      trio,
      sixYaoResult,
      maiHuaResult,
      includeAllLines: true,
    });
  }, [trio, sixYaoResult, maiHuaResult]);

  const {
    primaryClassical,
    transformedClassical,
    movingLinesClassical,
    hexagramTransformation,
    maiHua,
    sixYao,
    disclaimer,
  } = interpretation;

  const primaryData = primaryClassical.content;
  const transformedData = transformedClassical?.content;
  const transformInfo = hexagramTransformation.content;
  const maiHuaData = maiHua?.content;
  const sixYaoData = sixYao?.content;

  // Lọc danh sách hào động
  const movingPositions = trio.movingLineIndices;

  return (
    <div className="workspace-interpretation-container">
      <div className="interpretation-section-header">
        <h3 className="section-title">
          <span>📖</span> Luận Giải Quẻ Toàn Diện (Kinh Văn Cổ Bản & Dịch Lý)
        </h3>
        <p className="section-subtitle">
          Tích hợp lời kinh Chu Dịch, hào từ cổ truyền, tương tác Thể/Dụng và ứng dụng thực tiễn
        </p>
      </div>

      {/* 1. Tổng quan quẻ & Thoán Từ, Đại Tượng */}
      <div className="interp-card interp-card--overview">
        <h4 className="interp-card__heading">
          <span className="interp-num">1</span> Tổng Quan Tượng Quẻ & Thoán Từ
        </h4>
        <div className="interp-card__content">
          <div className="interp-overview-grid">
            {/* Quẻ Chủ */}
            <div className="interp-overview-box">
              <h5 className="box-title">
                Quẻ Chủ: #{trio.primary.number} {trio.primary.name} ({trio.primary.sinoVietnameseName})
              </h5>
              {primaryData ? (
                <>
                  <div className="classical-quote-box">
                    <span className="quote-label">Thoán Từ (Kinh Văn):</span>
                    <p className="quote-text">
                      <strong>{primaryData.thuanTu.sinoVietnamese}</strong>
                    </p>
                    <p className="box-text" style={{ marginTop: '4px' }}>
                      <em>Dịch nghĩa:</em> {primaryData.thuanTu.translation}
                    </p>
                  </div>
                  <div className="classical-quote-box" style={{ marginTop: '8px' }}>
                    <span className="quote-label">Đại Tượng Truyện:</span>
                    <p className="quote-text">{primaryData.daiTuong.translation}</p>
                  </div>
                </>
              ) : (
                <p className="box-text">
                  Quẻ #{trio.primary.number}, thuộc {trio.primary.upperTrigram.name} Thượng /{' '}
                  {trio.primary.lowerTrigram.name} Hạ.
                </p>
              )}
            </div>

            {/* Quẻ Biến */}
            {trio.transformed && (
              <div className="interp-overview-box">
                <h5 className="box-title">
                  Quẻ Biến: #{trio.transformed.number} {trio.transformed.name} ({trio.transformed.sinoVietnameseName})
                </h5>
                {transformedData ? (
                  <>
                    <div className="classical-quote-box">
                      <span className="quote-label">Thoán Từ Quẻ Biến:</span>
                      <p className="quote-text">
                        <strong>{transformedData.thuanTu.sinoVietnamese}</strong>
                      </p>
                      <p className="box-text" style={{ marginTop: '4px' }}>
                        <em>Dịch nghĩa:</em> {transformedData.thuanTu.translation}
                      </p>
                    </div>
                    <div className="classical-quote-box" style={{ marginTop: '8px' }}>
                      <span className="quote-label">Đại Tượng Quẻ Biến:</span>
                      <p className="quote-text">{transformedData.daiTuong.translation}</p>
                    </div>
                  </>
                ) : (
                  <p className="box-text">
                    Biến sang Quẻ #{trio.transformed.number}, thuộc {trio.transformed.upperTrigram.name} Thượng /{' '}
                    {trio.transformed.lowerTrigram.name} Hạ.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Diễn giải biến hóa theo Chu Hi */}
          {transformInfo && (
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#444' }}>
              <strong>Quy tắc chiêm hào động (Chu Hi - Dịch Học Khải Mông):</strong> {transformInfo.explanation}
            </div>
          )}
        </div>
      </div>

      {/* 2. Phân tích Thể / Dụng (với Mai Hoa Dịch Số nếu có) */}
      {maiHuaData && (
        <div className="interp-card interp-card--tiyong">
          <h4 className="interp-card__heading">
            <span className="interp-num">2</span> Phân Tích Thể / Dụng (Mai Hoa Dịch Số)
          </h4>
          <div className="interp-card__content">
            <div className="tiyong-summary-row">
              <div className="tiyong-badge-group">
                <span className="tiyong-pill tiyong-pill--body">
                  Quẻ Thể: <strong>{maiHuaData.tiTrigram.name}</strong> [{maiHuaData.tiElement}] (Chủ thể người chiêm)
                </span>
                <span className="tiyong-pill tiyong-pill--use">
                  Quẻ Dụng: <strong>{maiHuaData.yongTrigram.name}</strong> [{maiHuaData.yongElement}] (Sự việc / Đối tượng)
                </span>
              </div>
              <div className="tiyong-judgment-tag">
                Tương tác: <strong>{maiHuaData.relationName} ({maiHuaData.judgmentLevelName})</strong>
              </div>
            </div>
            <p className="tiyong-narrative">{maiHuaData.explanation}</p>
            {maiHuaData.advice && (
              <p className="tiyong-narrative" style={{ marginTop: '6px', fontStyle: 'italic', color: '#1B5E20' }}>
                💡 {maiHuaData.advice}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Phân tích chi tiết từng hào (Hào Từ & Hào Động) */}
      <div className="interp-card interp-card--lines">
        <h4 className="interp-card__heading">
          <span className="interp-num">{maiHuaData ? '3' : '2'}</span> Phân Tích Từng Hào & Hào Động
        </h4>
        <div className="interp-card__content">
          <div className="interp-lines-list">
            {movingLinesClassical.map((sec) => {
              const line = sec.content;
              const isMoving = movingPositions.includes(line.position);

              return (
                <div
                  key={line.position}
                  className={`interp-line-item ${isMoving ? 'interp-line-item--moving' : ''}`}
                >
                  <div className="interp-line-header">
                    <span className="line-tag">
                      Hào {line.position} {isMoving && <span className="badge-moving">HÀO ĐỘNG</span>}
                    </span>
                    <span className="line-trad-name">{line.lineName}</span>
                  </div>

                  <div className="interp-line-body">
                    <p className="line-classical-text">
                      <strong>Hào từ:</strong> <em>"{line.haoTu.sinoVietnamese}"</em>
                    </p>
                    <p className="line-meaning-text">
                      <strong>Dịch nghĩa:</strong> {line.haoTu.translation}
                    </p>
                    {line.haoTu.modernExplanation && (
                      <p className="line-meaning-text" style={{ marginTop: '4px', color: '#555' }}>
                        <strong>Ý nghĩa:</strong> {line.haoTu.modernExplanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Quan hệ Sinh Khắc & Lực Lượng Hào (Lục Hào) */}
      {sixYaoData && (
        <div className="interp-card interp-card--relationships">
          <h4 className="interp-card__heading">
            <span className="interp-num">{maiHuaData ? '4' : '3'}</span> Tương Quan Sinh Khắc & Thế Ứng
          </h4>
          <div className="interp-card__content">
            <p className="interp-narrative-text">
              <strong>Tương quan Thế - Ứng:</strong> Hào Thế tại Hào {sixYaoData.shiYing.worldLine}, Hào Ứng tại Hào {sixYaoData.shiYing.responseLine}.{' '}
              {sixYaoData.shiYing.explanation}
            </p>
            <p className="interp-narrative-text">
              <strong>Tác động Nhật Nguyệt & Vượng Suy:</strong> {sixYaoData.officerImpact.summaryOverview}
            </p>
          </div>
        </div>
      )}

      {/* 5. Phân tích theo câu hỏi chiêm nghiệm (nếu có câu hỏi) */}
      {question && question.trim() && (
        <div className="interp-card interp-card--question">
          <h4 className="interp-card__heading">
            <span className="interp-num">{maiHuaData ? '5' : '4'}</span> Luận Giải Theo Câu Hỏi: "{question}"
          </h4>
          <div className="interp-card__content">
            <div className="question-analysis-box">
              <p>
                <strong>Phạm vi chiêm đoán:</strong>{' '}
                {inquiryType === 'finance'
                  ? 'Tài lộc, làm ăn, đầu tư (Dụng Thần: Thê Tài)'
                  : inquiryType === 'career' || inquiryType === 'work'
                  ? 'Công danh, sự nghiệp, chức vụ (Dụng Thần: Quan Quỷ)'
                  : inquiryType === 'family' || inquiryType === 'education'
                  ? 'Học hành, thi cử, gia đạo, giấy tờ (Dụng Thần: Phụ Mẫu)'
                  : inquiryType === 'health'
                  ? 'Sức khỏe, giải nạn, con cái (Dụng Thần: Tử Tôn)'
                  : 'Chiêm nghiệm tổng hợp sự việc.'}
              </p>
              <p>
                <strong>Định hướng thực tiễn:</strong> Xem xét hào Dụng Thần tương ứng trên Bảng Lục Hào tổng hợp.
                Nếu Dụng Thần được Nhật Thần hoặc Nguyệt Kiến sinh vượng, lại có Hào Động sinh trợ thì mưu sự đắc lợi.
                Nếu Dụng Thần lâm Tuần Không, Nguyệt Phá hoặc bị khắc tổn thì cần cẩn trọng chờ thời điểm xuất Không hoặc gặp Hợp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Kết luận & Nhận định khách quan */}
      <div className="interp-card interp-card--conclusion">
        <h4 className="interp-card__heading">
          <span className="interp-num">{maiHuaData ? '6' : '5'}</span> Kết Luận & Khuyến Nghị Ứng Dụng
        </h4>
        <div className="interp-card__content">
          <div className="conclusion-summary-box">
            <h5 className="conclusion-title">Nhận Định Tổng Thể:</h5>
            <p className="conclusion-text">
              {sixYaoResult.summary.objectiveOverview ||
                'Quẻ tượng thể hiện rõ tính chất tương quan sinh khắc giữa các hào. Người chiêm cần thuận theo thời thế của quẻ.'}
            </p>
          </div>

          {/* Cảnh báo tính chất tham khảo & Khách quan */}
          <div className="workspace-disclaimer-box">
            <span className="disclaimer-icon">ℹ</span>
            <p className="disclaimer-text">
              {disclaimer ||
                'Toàn bộ kết quả lập quẻ và diễn giải trên đây được đối chiếu nghiêm ngặt theo các quy tắc toán học và thư tịch cổ của Dịch học cổ pháp (Bốc Phệ Chính Tông, Tăng San Bốc Dịch, Mai Hoa Dịch Số). Kết quả mang tính chất tham khảo định hướng triết lý nhân sinh, không phải là lời tiên tri tuyệt đối.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
