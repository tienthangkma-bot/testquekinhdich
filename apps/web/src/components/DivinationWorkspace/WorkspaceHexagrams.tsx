import React from 'react';
import {
  Hexagram,
  HexagramTrio,
  getPalaceInfoByHexagramNumber,
  getHexagramOmen,
} from '@kindich/domain';
import { MaiHuaCastingResult } from '@kindich/core';

interface WorkspaceHexagramsProps {
  trio: HexagramTrio;
  maiHuaResult?: MaiHuaCastingResult;
}

export const WorkspaceHexagrams: React.FC<WorkspaceHexagramsProps> = ({
  trio,
}) => {
  const { primary, transformed, nuclear, movingLineIndices } = trio;

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
    // hex.lines có 6 phần tử (index 0 = hào 1, index 5 = hào 6)
    // Hiển thị từ hào 6 xuống hào 1:
    const reversed = [...hex.lines].reverse();

    return (
      <div className="hex-lines-vertical-stack">
        {reversed.map((line) => {
          const isYang = line.value === 1;
          const pos = line.position;
          const isMoving = movingLineIndices.includes(pos);
          const isHighlight =
            (options?.isPrimary && isMoving) || (options?.isTransformed && isMoving);

          return (
            <div
              key={pos}
              className={`hex-line-row ${isHighlight ? 'hex-line-row--moving' : ''}`}
              title={`Hào ${pos}: ${isYang ? 'Dương' : 'Âm'}${isMoving ? ' (Hào Động)' : ''}`}
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

  return (
    <div className="workspace-hexagrams-section">
      <div className="workspace-hexagrams-grid">
        {/* Cột 1: QUẺ CHỦ */}
        <div className="hexagram-figure-card hexagram-figure-card--primary">
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
          <div className="hexagram-figure-card hexagram-figure-card--nuclear">
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
          <div className="hexagram-figure-card hexagram-figure-card--transformed">
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
          <div className="hexagram-figure-card hexagram-figure-card--static">
            <h3 className="hex-title">QUẺ TĨNH</h3>
            <div className="static-hex-box">
              <span className="static-icon">☯</span>
              <p>Quẻ không có hào động, giữ nguyên khí tượng quẻ chủ.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
