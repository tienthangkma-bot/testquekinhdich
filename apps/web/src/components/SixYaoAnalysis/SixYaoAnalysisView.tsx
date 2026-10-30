import React, { useMemo, useState } from 'react';
import {
  Hexagram,
  HexagramTrio,
  LinePosition,
  getHexagramById,
} from '@kindich/domain';
import {
  AnalyzedSixYaoLine,
  createNuclearHexagram,
  orchestrateSixYaoAnalysis,
  SixYaoAnalysisResult,
  SixYaoOrchestratorInput,
} from '@kindich/core';
import { getTraditionalLineName } from '../HexagramView/line-name.utils';
import { HexagramInterpretationView } from '../HexagramInterpretation';
import { Card } from '@kindich/shared';
import './SixYaoAnalysis.css';

export interface SixYaoAnalysisViewProps {
  /** Kết quả phân tích Lục Hào hoàn chỉnh từ Orchestrator */
  analysisResult?: SixYaoAnalysisResult;
  /** Hoặc các thông số để tự động gọi Orchestrator */
  primaryHexagram?: Hexagram | number | string;
  changingHexagram?: Hexagram | number | string | null;
  movingLineIndices?: readonly LinePosition[] | readonly number[];
  dateTime?: SixYaoOrchestratorInput['dateTime'];
  ruleSetId?: string;
}

export const SixYaoAnalysisView: React.FC<SixYaoAnalysisViewProps> = ({
  analysisResult,
  primaryHexagram = 1,
  changingHexagram,
  movingLineIndices,
  dateTime,
  ruleSetId,
}) => {
  // 1. Phân giải kết quả phân tích Lục Hào qua Orchestrator từ @kindich/core (Không tính toán trong UI)
  const result: SixYaoAnalysisResult = useMemo(() => {
    if (analysisResult) {
      return analysisResult;
    }
    return orchestrateSixYaoAnalysis({
      primaryHexagram,
      changingHexagram,
      movingLineIndices,
      dateTime,
      ruleSetId,
    });
  }, [analysisResult, primaryHexagram, changingHexagram, movingLineIndices, dateTime, ruleSetId]);

  // 2. Tính Quẻ Hỗ bằng Hexagram Engine từ @kindich/core
  const nuclearHexagram: Hexagram = useMemo(() => {
    const fullHex = getHexagramById(result.primaryHexagram.hexagramNumber);
    if (fullHex) {
      return createNuclearHexagram(fullHex);
    }
    return createNuclearHexagram(result.primaryHexagram as unknown as Hexagram);
  }, [result.primaryHexagram]);

  // Bộ 3 Quẻ chuẩn hóa cho Interpretation Engine
  const trio: HexagramTrio = useMemo(() => {
    const primary = getHexagramById(result.primaryHexagram.hexagramNumber)!;
    const transformed = result.changingHexagram
      ? getHexagramById(result.changingHexagram.hexagramNumber) || primary
      : primary;
    return {
      primary,
      transformed,
      nuclear: nuclearHexagram,
      movingLineIndices: result.movingLines.map((m) => m.position),
      hasMovingLines: result.movingLines.length > 0,
    };
  }, [result, nuclearHexagram]);

  // 3. Quản lý hào được chọn để hiển thị khu vực giải thích chi tiết (mặc định hào Thế)
  const [selectedPosition, setSelectedPosition] = useState<LinePosition>(
    result.summary.worldLinePosition
  );

  // 4. QUY ƯỚC HIỂN THỊ: Từ Hào 6 xuống Hào 1 (từ trên xuống dưới màn hình)
  // Dữ liệu nội bộ vẫn giữ từ Hào 1 lên Hào 6 (index 0 = Hào 1, index 5 = Hào 6)
  const displayedLines = useMemo(() => {
    return [...result.primaryHexagram.lines].reverse();
  }, [result.primaryHexagram.lines]);

  // Hào đang được chọn để xem giải thích chi tiết
  const selectedLine: AnalyzedSixYaoLine = useMemo(() => {
    const found = result.primaryHexagram.lines.find((l) => l.position === selectedPosition);
    return found || result.primaryHexagram.lines[0]!;
  }, [result.primaryHexagram.lines, selectedPosition]);

  const { primaryHexagram: primary, changingHexagram: changing, dateTime: dt, summary } = result;

  return (
    <div className="six-yao-container" data-testid="six-yao-analysis-view">
      {/* 1. Header: Banner Thông Tin Lập Quẻ & Lịch Pháp */}
      <div className="six-yao-header-card">
        <div className="six-yao-header-top">
          <div className="six-yao-header-title-group">
            <span className="six-yao-badge-main">Bảng Phân Tích Lục Hào Cổ Pháp</span>
            <h2 className="six-yao-main-title">
              {primary.name} ({primary.sinoVietnamese})
            </h2>
            <p className="six-yao-palace-text">
              Cung <strong>{primary.palace.name}</strong> ({primary.palace.elementName}) •{' '}
              {primary.palace.generationStageName} • Thế tại hào{' '}
              <strong>{primary.palace.worldLine}</strong>, Ứng tại hào{' '}
              <strong>{primary.palace.responseLine}</strong>
            </p>
          </div>

          <div className="six-yao-header-meta">
            <span className="six-yao-tag-version">{result.algorithmVersion}</span>
            <span className="six-yao-tag-ruleset">{result.ruleSetId}</span>
          </div>
        </div>

        {/* Banner Thời Gian, Âm Lịch, Tứ Trụ Can Chi */}
        <div className="six-yao-time-grid">
          <div className="six-yao-time-item">
            <span className="six-yao-time-label">Dương Lịch & Âm Lịch</span>
            <div className="six-yao-time-val">
              {dt.solarDate ? (
                <p className="six-yao-time-solar">
                  {dt.solarDate.day}/{dt.solarDate.month}/{dt.solarDate.year}{' '}
                  {dt.solarDate.hour !== undefined ? `${dt.solarDate.hour}h` : ''}
                </p>
              ) : (
                <p className="six-yao-time-solar">Thời điểm lập quẻ</p>
              )}
              {dt.lunarDate && (
                <p className="six-yao-time-lunar">
                  Âm lịch: Ngày {dt.lunarDate.day} tháng {dt.lunarDate.month}
                  {dt.lunarDate.isLeap ? ' (nhuận)' : ''} năm {dt.canChi.year}
                </p>
              )}
            </div>
          </div>

          <div className="six-yao-time-item">
            <span className="six-yao-time-label">Tứ Trụ Can Chi</span>
            <div className="six-yao-canchi-badges">
              <span className="six-yao-canchi-pill" title="Năm">
                Năm {dt.canChi.year || '-'}
              </span>
              <span className="six-yao-canchi-pill" title="Tháng (Nguyệt Lệnh)">
                Tháng {dt.canChi.month}
              </span>
              <span className="six-yao-canchi-pill six-yao-canchi-pill--day" title="Ngày (Nhật Thần)">
                Ngày {dt.canChi.day}
              </span>
              <span className="six-yao-canchi-pill" title="Giờ">
                Giờ {dt.canChi.hour || '-'}
              </span>
            </div>
          </div>

          <div className="six-yao-time-item">
            <span className="six-yao-time-label">Nhật Thần & Nguyệt Kiến</span>
            <div className="six-yao-time-val">
              <p>
                Nhật Thần: <strong>{dt.dayMaster.branch}</strong> ({dt.dayMaster.elementName}) • Nguyệt Kiến:{' '}
                <strong>{dt.monthCommander.branch}</strong> ({dt.monthCommander.elementName})
              </p>
              <p className="six-yao-time-break">
                Tuần Không: <strong>{dt.dayMaster.voidBranches.join(', ')}</strong> • Nguyệt Phá:{' '}
                <strong>{dt.monthCommander.monthlyBreakBranch}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Đồ Hình Bộ Ba Quẻ: Quẻ Chủ • Quẻ Biến • Quẻ Hỗ */}
      <div className="six-yao-trio-grid">
        {/* Quẻ Chủ */}
        <div className="six-yao-hex-card six-yao-hex-card--primary">
          <div className="six-yao-hex-card__badge">Quẻ Chủ (Bản Quái)</div>
          <div className="six-yao-hex-card__content">
            <span className="six-yao-hex-symbol">{primary.symbol}</span>
            <div>
              <h4 className="six-yao-hex-name">
                #{primary.hexagramNumber} {primary.name}
              </h4>
              <p className="six-yao-hex-sub">
                {primary.chineseName} • {primary.upperTrigram.name} thượng / {primary.lowerTrigram.name} hạ
              </p>
              <p className="six-yao-hex-palace">
                Cung {primary.palace.name} ({primary.palace.elementName}) • Thế hào {primary.palace.worldLine}, Ứng hào {primary.palace.responseLine}
              </p>
            </div>
          </div>
        </div>

        {/* Quẻ Biến */}
        <div className="six-yao-hex-card six-yao-hex-card--changing">
          <div className="six-yao-hex-card__badge">
            {changing ? 'Quẻ Biến (Biến Quái)' : 'Quẻ Tĩnh'}
          </div>
          <div className="six-yao-hex-card__content">
            {changing ? (
              <>
                <span className="six-yao-hex-symbol">{changing.symbol}</span>
                <div>
                  <h4 className="six-yao-hex-name">
                    #{changing.hexagramNumber} {changing.name}
                  </h4>
                  <p className="six-yao-hex-sub">
                    {changing.chineseName} • {changing.upperTrigram.name} thượng / {changing.lowerTrigram.name} hạ
                  </p>
                  <p className="six-yao-hex-palace">
                    Cung gốc: {changing.palace.name} ({changing.palace.elementName}) • Lục Thân y Cung {primary.palace.name}
                  </p>
                </div>
              </>
            ) : (
              <div className="six-yao-static-note">
                <span className="six-yao-static-icon">☯</span>
                <p>Quẻ Tĩnh (không có hào động), xem xét căn cơ 6 hào của Quẻ Chủ.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quẻ Hỗ */}
        <div className="six-yao-hex-card six-yao-hex-card--nuclear">
          <div className="six-yao-hex-card__badge">Quẻ Hỗ (Hỗ Quái)</div>
          <div className="six-yao-hex-card__content">
            <span className="six-yao-hex-symbol">{nuclearHexagram.symbol}</span>
            <div>
              <h4 className="six-yao-hex-name">
                #{nuclearHexagram.number} {nuclearHexagram.name}
              </h4>
              <p className="six-yao-hex-sub">
                {nuclearHexagram.chineseName} • {nuclearHexagram.upperTrigram.name} thượng / {nuclearHexagram.lowerTrigram.name} hạ
              </p>
              <p className="six-yao-hex-palace">
                Hào 2-3-4 làm hạ quái, hào 3-4-5 làm thượng quái
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bảng 6 Hào Lục Hào (Hiển thị từ Hào 6 xuống Hào 1) */}
      <div className="six-yao-table-section">
        <div className="six-yao-table-header">
          <div>
            <h3 className="six-yao-table-title">Đồ Bản Lục Hào (Sáu Hào Từ Trên Xuống Dưới)</h3>
            <p className="six-yao-table-subtitle">
              Quy ước cổ pháp hiển thị từ <strong>Hào 6 (trên cùng)</strong> xuống{' '}
              <strong>Hào 1 (dưới cùng)</strong>. Bấm vào từng hào để xem phân tích chi tiết.
            </p>
          </div>
          <div className="six-yao-table-legend">
            <span className="legend-item">
              <span className="legend-tag legend-tag--world">THẾ</span> Hào Thế
            </span>
            <span className="legend-item">
              <span className="legend-tag legend-tag--response">ỨNG</span> Hào Ứng
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--moving" /> Hào Động
            </span>
          </div>
        </div>

        <div className="six-yao-table-responsive-wrapper">
          <table className="six-yao-master-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Thế/Ứng</th>
                <th style={{ width: '90px' }}>Lục Thú</th>
                <th style={{ width: '85px' }}>Vị Trí</th>
                <th style={{ width: '130px' }}>Đồ Hình Hào</th>
                <th>Nạp Giáp</th>
                <th>Lục Thân</th>
                <th>Hào Biến</th>
                <th>Nhật/Nguyệt</th>
                <th style={{ width: '110px' }}>Vượng Suy</th>
              </tr>
            </thead>
            <tbody>
              {displayedLines.map((line) => {
                const isSelected = line.position === selectedPosition;
                const isYang = line.yinYang === 1;
                const traditionalName = getTraditionalLineName({
                  position: line.position,
                  value: line.yinYang,
                  isMoving: line.isMoving,
                });

                return (
                  <tr
                    key={line.position}
                    className={`six-yao-row ${isSelected ? 'six-yao-row--selected' : ''} ${
                      line.isMoving ? 'six-yao-row--moving' : ''
                    }`}
                    onClick={() => setSelectedPosition(line.position)}
                    data-testid={`six-yao-row-${line.position}`}
                    data-line-position={line.position}
                  >
                    {/* Cột 1: Thế / Ứng */}
                    <td className="cell-world-response">
                      {line.isWorld && <span className="tag-world">THẾ</span>}
                      {line.isResponse && <span className="tag-response">ỨNG</span>}
                    </td>

                    {/* Cột 2: Lục Thú */}
                    <td className="cell-spirit">
                      <span className={`spirit-badge spirit-badge--${line.sixSpirit}`}>
                        {line.sixSpiritName}
                      </span>
                    </td>

                    {/* Cột 3: Vị trí & Tên hào */}
                    <td className="cell-position">
                      <span className="line-pos-num">Hào {line.position}</span>
                      <span className="line-pos-trad">{traditionalName}</span>
                    </td>

                    {/* Cột 4: Đồ hình hào Âm/Dương & Động */}
                    <td className="cell-graphic">
                      <div className="line-bar-container">
                        {isYang ? (
                          <div className={`line-bar line-bar--yang ${line.isMoving ? 'line-bar--moving' : ''}`} />
                        ) : (
                          <div className="line-bar-yin-wrap">
                            <div className={`line-bar line-bar--yin ${line.isMoving ? 'line-bar--moving' : ''}`} />
                            <div className="line-bar-yin-gap" />
                            <div className={`line-bar line-bar--yin ${line.isMoving ? 'line-bar--moving' : ''}`} />
                          </div>
                        )}
                        {line.isMoving && (
                          <span className="moving-indicator" title="Hào Động">
                            {isYang ? '⚪' : '✕'} ĐỘNG
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột 5: Nạp Giáp */}
                    <td className="cell-najia">
                      <span className="najia-canchi">{line.canChi}</span>
                      <span className={`element-pill element-pill--${line.element}`}>
                        {line.elementName}
                      </span>
                    </td>

                    {/* Cột 6: Lục Thân */}
                    <td className="cell-relation">
                      <span className="relation-name">{line.sixRelationName}</span>
                    </td>

                    {/* Cột 7: Hào Biến (nếu có) */}
                    <td className="cell-changing">
                      {line.changingLine ? (
                        <div className="changing-info">
                          <span className="changing-arrow">➔</span>
                          <span className="changing-canchi">{line.changingLine.canChi}</span>
                          <span className={`element-pill element-pill--${line.changingLine.element}`}>
                            {line.changingLine.elementName}
                          </span>
                          <span className="changing-rel">{line.changingLine.sixRelationName}</span>
                          {line.changingLine.interaction.tags.length > 0 && (
                            <span className="changing-tag">
                              {line.changingLine.interaction.tags[0]}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="cell-empty">-</span>
                      )}
                    </td>

                    {/* Cột 8: Tương tác Nhật / Nguyệt / Thần Sát */}
                    <td className="cell-calendar">
                      <div className="calendar-tags-list">
                        {line.calendar.isVoid && <span className="cal-tag cal-tag--void">Không</span>}
                        {line.calendar.isMonthlyBreak && <span className="cal-tag cal-tag--break">Phá</span>}
                        {line.calendar.isDayHarmony && <span className="cal-tag cal-tag--harmony">Nhật Hợp</span>}
                        {line.calendar.isDayClash && <span className="cal-tag cal-tag--clash">Nhật Xung</span>}
                        {line.calendar.isMonthHarmony && <span className="cal-tag cal-tag--harmony">Nguyệt Hợp</span>}
                        {line.strength.isAmDong && <span className="cal-tag cal-tag--am-dong">Ám Động</span>}
                        {!line.calendar.isVoid &&
                          !line.calendar.isMonthlyBreak &&
                          !line.calendar.isDayHarmony &&
                          !line.calendar.isDayClash &&
                          !line.calendar.isMonthHarmony &&
                          !line.strength.isAmDong && (
                            <span className="cal-tag cal-tag--neutral">Hòa</span>
                          )}
                      </div>
                    </td>

                    {/* Cột 9: Trạng thái Vượng Suy */}
                    <td className="cell-strength">
                      <span className={`seasonal-badge seasonal-badge--${line.strength.seasonalState}`}>
                        {line.strength.seasonalStateName}
                      </span>
                      <span className="strength-level-text">{line.strength.levelName}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Khu Vực Giải Thích Chi Tiết Khi Chọn Từng Hào */}
      <div className="six-yao-inspector-section" data-testid="six-yao-inspector">
        <Card
          title={`Chi Tiết Hào ${selectedLine.position}: ${selectedLine.sixRelationName} ${selectedLine.canChi} [${selectedLine.elementName}]`}
          subtitle={`Phân tích toàn diện thực lực, tương tác Nhật/Nguyệt và biến hóa cho Hào ${selectedLine.position}`}
          borderVariant="gold"
          padding="md"
        >
          <div className="inspector-grid">
            {/* Box 1: Vị thế & Thần sát */}
            <div className="inspector-card">
              <h5 className="inspector-card__title">1. Căn Cơ & Vị Thế Hào</h5>
              <div className="inspector-card__body">
                <p>
                  <strong>Vị trí:</strong> Hào {selectedLine.position} ({selectedLine.yinYang === 1 ? 'Dương Hào' : 'Âm Hào'}),{' '}
                  {selectedLine.isWorld
                    ? 'Là Hào THẾ (Đại diện cho chủ thể/bản thân người gieo).'
                    : selectedLine.isResponse
                    ? 'Là Hào ỨNG (Đại diện cho đối phương, sự việc, đối tác).'
                    : 'Hào bình hòa.'}
                </p>
                <p>
                  <strong>Lục Thân:</strong>{' '}
                  <span className="highlight-text">{selectedLine.sixRelationName}</span> (Định theo Cung{' '}
                  {primary.palace.name} [{primary.palace.elementName}]).
                </p>
                <p>
                  <strong>Lục Thú:</strong>{' '}
                  <span className="highlight-text">{selectedLine.sixSpiritName}</span> (Khởi theo Can ngày{' '}
                  {dt.dayMaster.stem}).
                </p>
                <p>
                  <strong>Trạng thái Động/Tĩnh:</strong>{' '}
                  {selectedLine.isMoving ? (
                    <span className="text-danger">HÀO ĐỘNG (Có quẻ biến)</span>
                  ) : selectedLine.strength.isAmDong ? (
                    <span className="text-warning">ÁM ĐỘNG (Xung khởi)</span>
                  ) : (
                    <span>Hào Tĩnh</span>
                  )}
                </p>
              </div>
            </div>

            {/* Box 2: Tứ Thời Vượng Tướng & Nguyệt Lệnh */}
            <div className="inspector-card">
              <h5 className="inspector-card__title">2. Tứ Thời Vượng Tướng (Tháng {dt.monthCommander.branch})</h5>
              <div className="inspector-card__body">
                <p>
                  <strong>Trạng thái mùa:</strong>{' '}
                  <span className={`seasonal-tag seasonal-tag--${selectedLine.strength.seasonalState}`}>
                    {selectedLine.strength.seasonalStateName}
                  </span>
                </p>
                <p className="inspector-desc">{selectedLine.strength.seasonalDescription}</p>
                <p>
                  <strong>Tác động Nguyệt Kiến:</strong>{' '}
                  {selectedLine.calendar.isMonthlyBreak ? (
                    <span className="text-danger">Phạm NGUYỆT PHÁ (xung với {dt.monthCommander.branch})!</span>
                  ) : selectedLine.calendar.isMonthHarmony ? (
                    <span className="text-success">Được NGUYỆT HỢP với {dt.monthCommander.branch}!</span>
                  ) : (
                    selectedLine.calendar.monthEffect || 'Quan hệ bình thường.'
                  )}
                </p>
              </div>
            </div>

            {/* Box 3: Tác Động Nhật Thần & Không Vong */}
            <div className="inspector-card">
              <h5 className="inspector-card__title">3. Tác Động Nhật Thần & Thần Sát (Ngày {dt.dayMaster.branch})</h5>
              <div className="inspector-card__body">
                <p>
                  <strong>Tác động Nhật Thần:</strong>{' '}
                  {selectedLine.calendar.isDayClash ? (
                    <span className="text-warning">Gặp NHẬT XUNG ({selectedLine.branch} xung {dt.dayMaster.branch}).</span>
                  ) : selectedLine.calendar.isDayHarmony ? (
                    <span className="text-success">Được NHẬT HỢP ({selectedLine.branch} hợp {dt.dayMaster.branch}).</span>
                  ) : (
                    selectedLine.calendar.dayEffect || 'Quan hệ bình thường.'
                  )}
                </p>
                <p>
                  <strong>Tuần Không:</strong>{' '}
                  {selectedLine.calendar.isVoid ? (
                    <span className="text-danger">
                      Rơi vào Không Vong (
                      {selectedLine.strength.voidStatus === 'CHAN_KHONG'
                        ? 'Chân Không - hư vô suy kiệt'
                        : 'Giả Không - tạm vắng, gặp xung/xuất tuần sẽ động'}
                      )
                    </span>
                  ) : (
                    'Không phạm Tuần Không.'
                  )}
                </p>
                <p>
                  <strong>Thực lực tổng hợp:</strong>{' '}
                  <strong>{selectedLine.strength.levelName}</strong> ({selectedLine.strength.totalScore > 0 ? '+' : ''}
                  {selectedLine.strength.totalScore.toFixed(1)} điểm).
                </p>
              </div>
            </div>

            {/* Box 4: Biến Hóa Hào Động (nếu có) */}
            {selectedLine.changingLine && (
              <div className="inspector-card inspector-card--changing">
                <h5 className="inspector-card__title">4. Biến Hóa Hào Động & Hồi Đầu</h5>
                <div className="inspector-card__body">
                  <p>
                    <strong>Hào biến:</strong> Hào {selectedLine.position} Quẻ {changing?.name} (
                    {selectedLine.changingLine.canChi} [{selectedLine.changingLine.elementName}] -{' '}
                    {selectedLine.changingLine.sixRelationName}).
                  </p>
                  <p>
                    <strong>Tính chất biến hào:</strong>{' '}
                    <span className="changing-tag-highlight">
                      {selectedLine.changingLine.interaction.tags.join(' • ')}
                    </span>
                  </p>
                  <p className="inspector-desc">{selectedLine.changingLine.interaction.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lý Giải & Yếu Tố Tác Động Cấu Thành */}
          <div className="inspector-factors-section">
            <h5 className="inspector-factors-title">Cơ Cấu Điểm Thực Lực Của Hào</h5>
            <div className="factors-table-wrap">
              <table className="factors-table">
                <thead>
                  <tr>
                    <th>Nguồn Tác Động</th>
                    <th>Loại Ảnh Hưởng</th>
                    <th style={{ width: '80px' }}>Trọng Số</th>
                    <th>Lý Giải Chi Tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLine.strength.factors.map((f, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="factor-source">{f.source}</span>
                      </td>
                      <td>
                        <span className="factor-type">{f.effectType}</span>
                      </td>
                      <td className={f.weight >= 0 ? 'factor-weight-pos' : 'factor-weight-neg'}>
                        {f.weight > 0 ? `+${f.weight}` : f.weight}
                      </td>
                      <td className="factor-reason">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="inspector-rationale">
              <strong>Lý giải tổng hợp:</strong> {selectedLine.strength.rationale}
            </p>
          </div>
        </Card>
      </div>

      {/* 5. Tóm Tắt Khách Quan & Thư Tịch Nguồn */}
      <div className="six-yao-summary-footer">
        <div className="summary-overview-box">
          <h4 className="summary-overview-title">Tổng Quan Tương Quan Toàn Quẻ</h4>
          <p className="summary-overview-text">{summary.objectiveOverview}</p>
          <p className="summary-disclaimer">{result.disclaimer}</p>
        </div>

        <div className="summary-sources-box">
          <h5 className="summary-sources-title">Nguồn Tư Liệu Đối Chiếu</h5>
          <ul className="summary-sources-list">
            <li>
              <strong>Bát Cung & Thế Ứng:</strong> {result.sourceReferences['baGong']}
            </li>
            <li>
              <strong>Nạp Giáp & Lục Thân:</strong> {result.sourceReferences['sixRelations']}
            </li>
            <li>
              <strong>Biến Hào Lục Thân:</strong> {result.sourceReferences['changingSixRelations']}
            </li>
            <li>
              <strong>Nhật/Nguyệt & Vượng Suy:</strong> {result.sourceReferences['yaoStrength']}
            </li>
          </ul>
        </div>
      </div>

      {/* 6. Khu Vực Luận Giải Quẻ Toàn Diện (Interpretation Engine) */}
      <HexagramInterpretationView trio={trio} sixYaoResult={result} initialTab="overview" />
    </div>
  );
};
