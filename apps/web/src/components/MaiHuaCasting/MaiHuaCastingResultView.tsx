import React from 'react';
import { MaiHuaCastingResult } from '@kindich/core';
import { CalendarConversionResult } from '@kindich/calendar';
import { HexagramView } from '../HexagramView';
import { HexagramInterpretationView } from '../HexagramInterpretation';
import { getElementDisplayName } from '../SerialCasting/serial-casting.utils';
import { formatSolarLunarSummary } from './mai-hua.utils';
import './MaiHuaCasting.css';

export interface MaiHuaCastingResultViewProps {
  result: MaiHuaCastingResult;
  calendarInfo?: CalendarConversionResult;
}

export const MaiHuaCastingResultView: React.FC<MaiHuaCastingResultViewProps> = ({
  result,
  calendarInfo,
}) => {
  const {
    input,
    upperSum,
    lowerSum,
    totalSum,
    upperTrigramNumber,
    lowerTrigramNumber,
    movingLine,
    upperTrigram,
    lowerTrigram,
    theDung,
    trio,
  } = result;

  return (
    <div className="mai-hua-result-container">
      {/* 1. Thẻ Tóm Tắt Thông Số Lập Quẻ Mai Hoa */}
      <div className="mai-hua-summary-card">
        <div className="mai-hua-summary-card__header">
          <span className="mai-hua-summary-badge">Kết quả lập quẻ Mai Hoa Dịch Số</span>
          <div className="mai-hua-summary-tags">
            <span className="mai-hua-tag-algo">{result.algorithmVersion}</span>
            <span className="mai-hua-tag-cal">{result.calendarRuleVersion}</span>
          </div>
        </div>

        {calendarInfo && (
          <div className="mai-hua-summary-time-banner">
            <div className="mai-hua-time-col">
              <span className="mai-hua-time-label">Thời điểm khởi quẻ</span>
              <p className="mai-hua-time-solar">{formatSolarLunarSummary(calendarInfo).solarText}</p>
              <p className="mai-hua-time-lunar">☯ {formatSolarLunarSummary(calendarInfo).lunarText}</p>
            </div>
            <div className="mai-hua-time-canchi-col">
              <span className="mai-hua-time-label">Tứ Trụ Can Chi</span>
              <p className="mai-hua-time-canchi-str">
                {calendarInfo.canChi.year} • {calendarInfo.canChi.month} • {calendarInfo.canChi.day} • {calendarInfo.canChi.hour}
              </p>
            </div>
          </div>
        )}

        <div className="mai-hua-summary-grid">
          {/* Thông số Âm lịch đầu vào */}
          <div className="mai-hua-summary-item">
            <span className="mai-hua-summary-label">Thông Số Âm Lịch Đầu Vào</span>
            <div className="mai-hua-lunar-params">
              <div>
                Năm <strong>{input.yearBranchName}</strong> (#{input.yearBranchNumber})
              </div>
              <div>
                Tháng <strong>{input.month}</strong> âm
              </div>
              <div>
                Ngày <strong>{input.day}</strong> âm
              </div>
              <div>
                Giờ <strong>{input.hourBranchName}</strong> (#{input.hourBranchNumber})
              </div>
            </div>
            <span className="mai-hua-summary-hint">
              Quy ước địa chi: Tý=1 đến Hợi=12
            </span>
          </div>

          {/* Thượng quái */}
          <div className="mai-hua-summary-item">
            <span className="mai-hua-summary-label">Thượng Quái (Quẻ trên)</span>
            <div className="mai-hua-summary-trigram">
              <span className="mai-hua-trigram-symbol">{upperTrigram.symbol}</span>
              <div>
                <span className="mai-hua-trigram-name">{upperTrigram.name}</span>
                <span className="mai-hua-trigram-meta">
                  Hành {getElementDisplayName(upperTrigram.element)} • Tiên thiên #{upperTrigramNumber}
                </span>
              </div>
            </div>
            <span className="mai-hua-summary-hint">
              ({input.yearBranchNumber} + {input.month} + {input.day}) = {upperSum} (chia 8 dư {upperTrigramNumber})
            </span>
          </div>

          {/* Hạ quái */}
          <div className="mai-hua-summary-item">
            <span className="mai-hua-summary-label">Hạ Quái (Quẻ dưới)</span>
            <div className="mai-hua-summary-trigram">
              <span className="mai-hua-trigram-symbol">{lowerTrigram.symbol}</span>
              <div>
                <span className="mai-hua-trigram-name">{lowerTrigram.name}</span>
                <span className="mai-hua-trigram-meta">
                  Hành {getElementDisplayName(lowerTrigram.element)} • Tiên thiên #{lowerTrigramNumber}
                </span>
              </div>
            </div>
            <span className="mai-hua-summary-hint">
              ({upperSum} + {input.hourBranchNumber}) = {lowerSum} (chia 8 dư {lowerTrigramNumber})
            </span>
          </div>

          {/* Hào động */}
          <div className="mai-hua-summary-item mai-hua-summary-item--moving">
            <span className="mai-hua-summary-label">Hào Động</span>
            <span className="mai-hua-summary-value mai-hua-summary-value--moving">
              Hào {movingLine} Động
            </span>
            <span className="mai-hua-summary-hint">
              Tổng {totalSum} chia 6 dư {movingLine}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Thẻ Phân Tích Thể / Dụng Trọng Yếu */}
      <div className="mai-hua-the-dung-card">
        <div className="mai-hua-the-dung-header">
          <span className="mai-hua-the-dung-badge">Phân Tích Thể • Dụng Cổ Pháp</span>
          <span className="mai-hua-the-dung-rule">
            * Quy tắc: Quái mang hào động là Dụng (biến động), quái còn lại là Thể (chủ thể)
          </span>
        </div>

        <div className="mai-hua-the-dung-grid">
          {/* Thể quái */}
          <div className="mai-hua-the-dung-box mai-hua-the-dung-box--the">
            <div className="the-dung-badge the-dung-badge--the">THỂ (Chủ Thể)</div>
            <div className="the-dung-content">
              <span className="the-dung-symbol">{theDung.theTrigram.symbol}</span>
              <div>
                <h4 className="the-dung-title">
                  {theDung.theTrigram.name} ({theDung.thePosition === 'UPPER' ? 'Thượng quái' : 'Hạ quái'})
                </h4>
                <p className="the-dung-desc">
                  Ngũ hành: <strong>{getElementDisplayName(theDung.theTrigram.element)}</strong>
                  {' • '}Tượng tự nhiên: {theDung.theTrigram.nature}
                </p>
                <p className="the-dung-role-note">
                  Đại diện cho bản thân người chiêm hoặc sự việc gốc (Tĩnh, bất biến).
                </p>
              </div>
            </div>
          </div>

          {/* Dụng quái */}
          <div className="mai-hua-the-dung-box mai-hua-the-dung-box--dung">
            <div className="the-dung-badge the-dung-badge--dung">DỤNG (Khách Thể)</div>
            <div className="the-dung-content">
              <span className="the-dung-symbol">{theDung.dungTrigram.symbol}</span>
              <div>
                <h4 className="the-dung-title">
                  {theDung.dungTrigram.name} ({theDung.dungPosition === 'UPPER' ? 'Thượng quái' : 'Hạ quái'})
                </h4>
                <p className="the-dung-desc">
                  Ngũ hành: <strong>{getElementDisplayName(theDung.dungTrigram.element)}</strong>
                  {' • '}Tượng tự nhiên: {theDung.dungTrigram.nature}
                </p>
                <p className="the-dung-role-note">
                  Chứa <strong>Hào {movingLine} động</strong>, đại diện cho ngoại cảnh, biến cố hoặc hành động tiếp theo (Động, biến chuyển).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="the-dung-summary-box">
          <span className="the-dung-summary-icon">💡</span>
          <p className="the-dung-summary-text">{theDung.summary}</p>
        </div>
      </div>

      {/* 3. Đồ Hình Bộ Ba Quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */}
      <div className="mai-hua-trio-section">
        <div className="mai-hua-trio-header">
          <h3 className="mai-hua-trio-title">Bộ Ba Quẻ: Quẻ Chủ • Quẻ Biến • Quẻ Hỗ</h3>
          <p className="mai-hua-trio-subtitle">
            Các hào hiển thị theo thứ tự cổ pháp từ <strong>trên xuống dưới</strong> (Hào 6 ở trên cùng, Hào 1 ở dưới cùng).
          </p>
        </div>

        <div className="mai-hua-trio-grid">
          {/* Quẻ Chủ */}
          <div className="mai-hua-trio-col">
            <HexagramView
              hexagram={trio.primary}
              roleLabel={`Quẻ Chủ (${theDung.thePosition === 'UPPER' ? 'Thượng Thể / Hạ Dụng' : 'Hạ Thể / Thượng Dụng'})`}
              variant="primary"
            />
          </div>

          {/* Quẻ Biến */}
          <div className="mai-hua-trio-col">
            <HexagramView
              hexagram={trio.transformed}
              roleLabel="Quẻ Biến (Kết quả sau khi động)"
              variant="transformed"
            />
          </div>

          {/* Quẻ Hỗ */}
          <div className="mai-hua-trio-col">
            <HexagramView
              hexagram={trio.nuclear}
              roleLabel="Quẻ Hỗ (Tiến trình trung gian)"
              variant="nuclear"
            />
          </div>
        </div>
      </div>

      {/* 4. Khu Vực Luận Giải Quẻ Toàn Diện (Interpretation Engine) */}
      <HexagramInterpretationView trio={trio} maiHuaResult={result} />
    </div>
  );
};
