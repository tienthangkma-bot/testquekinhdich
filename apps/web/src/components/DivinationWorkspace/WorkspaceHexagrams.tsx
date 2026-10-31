import React, { useState } from 'react';
import {
  Hexagram,
  HexagramTrio,
  LinePosition,
  getPalaceInfoByHexagramNumber,
  getHexagramOmen,
} from '@kindich/domain';
import { MaiHuaCastingResult } from '@kindich/core';

interface WorkspaceHexagramsProps {
  trio: HexagramTrio;
  maiHuaResult?: MaiHuaCastingResult;
  selectedLine?: LinePosition | null;
  onSelectLine?: (pos: LinePosition | null) => void;
}

const LINE_POSITION_NAMES: Record<number, string> = {
  1: 'Hào Sơ (Hào 1)',
  2: 'Hào Nhị (Hào 2)',
  3: 'Hào Tam (Hào 3)',
  4: 'Hào Tứ (Hào 4)',
  5: 'Hào Ngũ (Hào 5)',
  6: 'Hào Thượng (Hào 6)',
};

export const WorkspaceHexagrams: React.FC<WorkspaceHexagramsProps> = ({
  trio,
  selectedLine: externalSelectedLine,
  onSelectLine: externalOnSelectLine,
}) => {
  const { primary, transformed, nuclear, movingLineIndices } = trio;

  // Quản lý hào được chọn để hiển thị chi tiết (Line Inspection)
  const [internalSelectedLine, setInternalSelectedLine] = useState<LinePosition | null>(null);
  const activeSelectedLine = externalSelectedLine !== undefined ? externalSelectedLine : internalSelectedLine;

  const handleLineClick = (pos: LinePosition) => {
    const next = activeSelectedLine === pos ? null : pos;
    if (externalOnSelectLine) {
      externalOnSelectLine(next);
    } else {
      setInternalSelectedLine(next);
    }
  };



  // Lấy Cung Bát Cung của từng quẻ
  const primaryPalace = getPalaceInfoByHexagramNumber(primary.number);
  const transformedPalace = transformed
    ? getPalaceInfoByHexagramNumber(transformed.number)
    : null;
  const nuclearPalace = nuclear
    ? getPalaceInfoByHexagramNumber(nuclear.number)
    : null;

  // Lấy Lời Triệu (Điềm Triệu) cổ bản của từng quẻ
  const primaryOmen = getHexagramOmen(primary.number);
  const nuclearOmen = nuclear ? getHexagramOmen(nuclear.number) : null;
  const transformedOmen = transformed ? getHexagramOmen(transformed.number) : null;

  // Render 6 vạch của một quẻ (từ Hào 6 trên xuống Hào 1 dưới)
  const renderHexagramLines = (
    hex: Hexagram,
    options?: { isPrimary?: boolean; isTransformed?: boolean }
  ) => {
    const reversed = [...hex.lines].reverse();

    return (
      <div className="hex-lines-vertical-stack">
        {reversed.map((line) => {
          const isYang = line.value === 1;
          const pos = line.position;
          const isMoving = movingLineIndices.includes(pos);
          const isHighlight =
            (options?.isPrimary && isMoving) || (options?.isTransformed && isMoving);
          const isSelected = activeSelectedLine === pos;


          return (
            <div
              key={pos}
              role="button"
              tabIndex={0}
              onClick={() => handleLineClick(pos)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLineClick(pos);
                }
              }}
              className={`hex-line-row ${isHighlight ? 'hex-line-row--moving' : ''} ${isSelected ? 'hex-line-row--selected' : ''}`}
              title={`${LINE_POSITION_NAMES[pos]}: ${isYang ? 'Dương hào (——)' : 'Âm hào (— —)'}${isMoving ? ' [HÀO ĐỘNG ⭕]' : ''} • Bấm để xem chi tiết`}
            >
              {isYang ? (
                // Hào Dương: Vạch liền
                <div
                  className={`hex-bar hex-bar--yang ${isHighlight ? 'hex-bar--moving' : ''}`}
                />
              ) : (
                // Hào Âm: Vạch đứt có khe giữa (chiều dài tổng thể bằng hào dương)
                <div className="hex-bar-yin-wrapper">
                  <div
                    className={`hex-bar hex-bar--yin-half ${isHighlight ? 'hex-bar--moving' : ''}`}
                  />
                  <div className="hex-bar-gap" />
                  <div
                    className={`hex-bar hex-bar--yin-half ${isHighlight ? 'hex-bar--moving' : ''}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Thông tin hào đang được chọn để soi chiếu
  const selectedPrimaryLine = activeSelectedLine
    ? primary.lines.find((l) => l.position === activeSelectedLine)
    : null;
  const isSelectedMoving = activeSelectedLine ? movingLineIndices.includes(activeSelectedLine) : false;

  return (
    <div className="workspace-hexagrams-section">

      <div className="workspace-hexagrams-grid">
        {/* Cột 1: QUẺ CHỦ */}
        <div className="hexagram-figure-card hexagram-figure-card--primary bha-glass-card">
          <div className="bha-corner-accent bha-corner-accent--tl" />
          <div className="bha-corner-accent bha-corner-accent--tr" />
          <div className="bha-corner-accent bha-corner-accent--bl" />
          <div className="bha-corner-accent bha-corner-accent--br" />

          <h3 className="hex-title hex-title--primary">{primary.sinoVietnameseName || primary.name}</h3>
          {renderHexagramLines(primary, { isPrimary: true })}
          <div className="hex-palace-label">
            HỌ {primaryPalace.palaceName.toUpperCase()}
          </div>
          <div className="hex-omen-badge" title={primaryOmen.meaning}>
            <span className="omen-label">Lời Triệu:</span>{' '}
            <span className="omen-text">{primaryOmen.omen}</span>
          </div>
        </div>

        {/* Cột 2: QUẺ HỖ */}
        {nuclear && (
          <div className="hexagram-figure-card hexagram-figure-card--nuclear bha-glass-card">
            <div className="bha-corner-accent bha-corner-accent--tl" />
            <div className="bha-corner-accent bha-corner-accent--tr" />
            <div className="bha-corner-accent bha-corner-accent--bl" />
            <div className="bha-corner-accent bha-corner-accent--br" />

            <h3 className="hex-title hex-title--nuclear">{nuclear.sinoVietnameseName || nuclear.name}</h3>
            {renderHexagramLines(nuclear)}
            <div className="hex-palace-label">
              HỌ {nuclearPalace ? nuclearPalace.palaceName.toUpperCase() : ''}
            </div>
            {nuclearOmen && (
              <div className="hex-omen-badge" title={nuclearOmen.meaning}>
                <span className="omen-label">Lời Triệu:</span>{' '}
                <span className="omen-text">{nuclearOmen.omen}</span>
              </div>
            )}
          </div>
        )}

        {/* Cột 3: QUẺ BIẾN */}
        {transformed ? (
          <div className="hexagram-figure-card hexagram-figure-card--transformed bha-glass-card">
            <div className="bha-corner-accent bha-corner-accent--tl" />
            <div className="bha-corner-accent bha-corner-accent--tr" />
            <div className="bha-corner-accent bha-corner-accent--bl" />
            <div className="bha-corner-accent bha-corner-accent--br" />

            <h3 className="hex-title hex-title--transformed">
              {transformed.sinoVietnameseName || transformed.name}
            </h3>
            {renderHexagramLines(transformed, { isTransformed: true })}
            <div className="hex-palace-label">
              HỌ {transformedPalace ? transformedPalace.palaceName.toUpperCase() : ''}
            </div>
            {transformedOmen && (
              <div className="hex-omen-badge" title={transformedOmen.meaning}>
                <span className="omen-label">Lời Triệu:</span>{' '}
                <span className="omen-text">{transformedOmen.omen}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="hexagram-figure-card hexagram-figure-card--static bha-glass-card">
            <div className="bha-corner-accent bha-corner-accent--tl" />
            <div className="bha-corner-accent bha-corner-accent--tr" />
            <div className="bha-corner-accent bha-corner-accent--bl" />
            <div className="bha-corner-accent bha-corner-accent--br" />

            <h3 className="hex-title">QUẺ TĨNH</h3>
            <div className="static-hex-box">
              <span className="static-icon bha-taiji-spinner">☯</span>
              <p>Quẻ không có hào động, giữ nguyên khí tượng quẻ chủ.</p>
            </div>
          </div>
        )}
      </div>

      {/* Panel Soi Chiếu Chi Tiết Hào (Interactive Line Inspection Drawer) */}
      {activeSelectedLine && selectedPrimaryLine && (
        <div className="hex-line-inspector-card bha-glass-card no-print">
          <div className="inspector-header">
            <div className="inspector-title-wrap">
              <span className="inspector-badge">
                {LINE_POSITION_NAMES[activeSelectedLine]}
              </span>
              <span className="inspector-nature">
                {selectedPrimaryLine.value === 1 ? 'Dương Hào (——)' : 'Âm Hào (— —)'}
                {isSelectedMoving ? ' • [HÀO ĐỘNG PHÁT KHỞI ⭕]' : ' • [Hào Tĩnh]'}
              </span>
            </div>
            <button
              type="button"
              className="inspector-close-btn"
              onClick={() => handleLineClick(activeSelectedLine)}
              title="Đóng bảng chi tiết"
            >
              ✕ Đóng
            </button>
          </div>
          <div className="inspector-body">
            <div className="inspector-grid">
              <div className="inspector-item">
                <span className="item-label">Vị trí:</span>
                <span className="item-val">
                  {activeSelectedLine <= 3 ? 'Nội Quái (Hạ Quái)' : 'Ngoại Quái (Thượng Quái)'}
                </span>
              </div>
              <div className="inspector-item">
                <span className="item-label">Trạng thái:</span>
                <span className={`item-val ${isSelectedMoving ? 'text-red font-bold' : ''}`}>
                  {isSelectedMoving
                    ? selectedPrimaryLine.value === 1
                      ? 'Dương Động biến Âm (Lão Dương biến Thiếu Âm)'
                      : 'Âm Động biến Dương (Lão Âm biến Thiếu Dương)'
                    : 'Tĩnh định (Không biến)'}
                </span>
              </div>
              {isSelectedMoving && transformed && (
                <div className="inspector-item inspector-item--full">
                  <span className="item-label">Biến hóa:</span>
                  <span className="item-val text-red">
                    Hào {activeSelectedLine} quẻ {primary.name} chuyển hóa thành Hào {activeSelectedLine} quẻ {transformed.name}.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
