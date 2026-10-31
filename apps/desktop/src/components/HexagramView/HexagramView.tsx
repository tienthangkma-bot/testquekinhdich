import React from 'react';
import { Hexagram } from '@kindich/domain';
import { getTraditionalLineName } from './line-name.utils';
import './HexagramView.css';

export interface HexagramViewProps {
  /** Quẻ cần hiển thị */
  hexagram: Hexagram;
  /** Nhãn phân loại quẻ (ví dụ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ) */
  roleLabel: string;
  /** Biến thể viền để tạo điểm nhấn */
  variant?: 'primary' | 'transformed' | 'nuclear';
}

export const HexagramView: React.FC<HexagramViewProps> = ({
  hexagram,
  roleLabel,
  variant = 'primary',
}) => {
  // Yêu cầu: "Sáu hào theo thứ tự từ TRÊN XUỐNG khi hiển thị"
  // Dữ liệu hexagram.lines được lưu từ dưới lên (Hào 1 ở index 0, Hào 6 ở index 5)
  // Khi hiển thị từ trên xuống, ta đảo ngược mảng để Hào 6 ở dòng đầu tiên, Hào 1 ở dòng cuối cùng
  const displayedLines = [...hexagram.lines].reverse();

  return (
    <div className={`hexagram-card hexagram-card--${variant}`}>
      {/* Role Header */}
      <div className="hexagram-card__role">
        <span className="hexagram-card__role-tag">{roleLabel}</span>
        <span className="hexagram-card__number">#{hexagram.number}</span>
      </div>

      {/* Hexagram Name & Symbols */}
      <div className="hexagram-card__header">
        <div className="hexagram-card__symbol">{hexagram.symbol}</div>
        <div className="hexagram-card__title-group">
          <h4 className="hexagram-card__name">{hexagram.name}</h4>
          <div className="hexagram-card__meta">
            <span className="hexagram-card__hantu">{hexagram.chineseName}</span>
            <span className="hexagram-card__trigrams">
              {hexagram.upperTrigram.name} thượng / {hexagram.lowerTrigram.name} hạ
            </span>
          </div>
        </div>
      </div>

      {/* 6 Lines Display: Từ trên xuống dưới (Hào 6 -> Hào 1) */}
      <div
        className="hexagram-card__lines-container"
        aria-label={`Đồ hình 6 hào của ${hexagram.name} từ trên xuống dưới`}
      >
        <div className="hexagram-card__lines-legend">
          <span>Hào (Trên → Dưới)</span>
          <span>Đồ hình Hào</span>
          <span>Trạng thái</span>
        </div>

        {displayedLines.map((line) => {
          const isYang = line.value === 1;
          const isMoving = Boolean(line.isMoving);
          const lineName = getTraditionalLineName(line);

          return (
            <div
              key={line.position}
              className={`hexagram-line-row ${isMoving ? 'hexagram-line-row--moving' : ''}`}
              title={`Hào ${line.position}: ${lineName} (${isYang ? 'Hào Dương' : 'Hào Âm'}${isMoving ? ' - ĐỘNG' : ''})`}
            >
              {/* Cột 1: Tên hào */}
              <div className="hexagram-line-row__label">
                <span className="hexagram-line-row__pos">Hào {line.position}</span>
                <span className="hexagram-line-row__name">{lineName}</span>
              </div>

              {/* Cột 2: Đồ họa hào (Dương = liền nét, Âm = đứt nét) */}
              <div className="hexagram-line-row__bar-wrapper">
                {isYang ? (
                  // Hào Dương: vạch liền
                  <div
                    className={`hexagram-bar hexagram-bar--yang ${
                      isMoving ? 'hexagram-bar--moving' : ''
                    }`}
                  />
                ) : (
                  // Hào Âm: vạch đứt đôi
                  <div className="hexagram-bar-yin-container">
                    <div
                      className={`hexagram-bar hexagram-bar--yin-segment ${
                        isMoving ? 'hexagram-bar--moving' : ''
                      }`}
                    />
                    <div className="hexagram-bar-yin-gap" />
                    <div
                      className={`hexagram-bar hexagram-bar--yin-segment ${
                        isMoving ? 'hexagram-bar--moving' : ''
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Cột 3: Trạng thái Động / Tĩnh */}
              <div className="hexagram-line-row__status">
                {isMoving ? (
                  <span className="hexagram-badge hexagram-badge--moving">● Động</span>
                ) : (
                  <span className="hexagram-badge hexagram-badge--static">Tĩnh</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
