import React from 'react';
import { SerialCastingResult } from '@kindich/core';
import { HexagramView } from '../HexagramView';
import { getElementDisplayName } from './serial-casting.utils';
import './SerialCasting.css';

export interface SerialCastingResultViewProps {
  result: SerialCastingResult;
}

export const SerialCastingResultView: React.FC<SerialCastingResultViewProps> = ({ result }) => {
  const {
    serialNumber,
    oddSum,
    evenSum,
    totalSum,
    upperTrigramNumber,
    lowerTrigramNumber,
    movingLine,
    upperTrigram,
    lowerTrigram,
    trio,
  } = result;

  return (
    <div className="serial-result-container">
      {/* 1. Thanh tóm tắt thông số lập quẻ */}
      <div className="serial-summary-card">
        <div className="serial-summary-card__header">
          <span className="serial-summary-badge">Kết quả lập quẻ</span>
          <span className="serial-summary-version">{result.algorithmVersion}</span>
        </div>

        <div className="serial-summary-grid">
          {/* Seri đã nhập */}
          <div className="serial-summary-item serial-summary-item--highlight">
            <span className="serial-summary-label">Seri tiền đã nhập</span>
            <span className="serial-summary-value serial-summary-value--serial">
              {serialNumber}
            </span>
            <span className="serial-summary-hint">
              Tổng các chữ số: <strong>{totalSum}</strong>
            </span>
          </div>

          {/* Thượng quái */}
          <div className="serial-summary-item">
            <span className="serial-summary-label">Thượng Quái (Quẻ trên)</span>
            <div className="serial-summary-trigram">
              <span className="serial-trigram-symbol">{upperTrigram.symbol}</span>
              <div>
                <span className="serial-trigram-name">{upperTrigram.name}</span>
                <span className="serial-trigram-meta">
                  Hành {getElementDisplayName(upperTrigram.element)} • Tiên thiên #{upperTrigramNumber}
                </span>
              </div>
            </div>
            <span className="serial-summary-hint">
              Tổng vị trí lẻ: {oddSum} (chia 8 dư {upperTrigramNumber})
            </span>
          </div>

          {/* Hạ quái */}
          <div className="serial-summary-item">
            <span className="serial-summary-label">Hạ Quái (Quẻ dưới)</span>
            <div className="serial-summary-trigram">
              <span className="serial-trigram-symbol">{lowerTrigram.symbol}</span>
              <div>
                <span className="serial-trigram-name">{lowerTrigram.name}</span>
                <span className="serial-trigram-meta">
                  Hành {getElementDisplayName(lowerTrigram.element)} • Tiên thiên #{lowerTrigramNumber}
                </span>
              </div>
            </div>
            <span className="serial-summary-hint">
              Tổng vị trí chẵn: {evenSum} (chia 8 dư {lowerTrigramNumber})
            </span>
          </div>

          {/* Hào động */}
          <div className="serial-summary-item serial-summary-item--moving">
            <span className="serial-summary-label">Hào Động</span>
            <span className="serial-summary-value serial-summary-value--moving">
              Hào {movingLine} Động
            </span>
            <span className="serial-summary-hint">
              Tổng {totalSum} chia 6 dư {movingLine}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Đồ hình Bộ Ba Quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ */}
      <div className="serial-trio-section">
        <div className="serial-trio-header">
          <h3 className="serial-trio-title">Bộ Ba Quẻ: Quẻ Chủ • Quẻ Biến • Quẻ Hỗ</h3>
          <p className="serial-trio-subtitle">
            Các hào hiển thị theo thứ tự cổ pháp từ <strong>trên xuống dưới</strong> (Hào 6 ở trên
            cùng, Hào 1 ở dưới cùng).
          </p>
        </div>

        <div className="serial-trio-grid">
          {/* Quẻ Chủ */}
          <div className="serial-trio-col">
            <HexagramView
              hexagram={trio.primary}
              roleLabel="Quẻ Chủ (Gốc)"
              variant="primary"
            />
          </div>

          {/* Quẻ Biến */}
          <div className="serial-trio-col">
            <HexagramView
              hexagram={trio.transformed}
              roleLabel="Quẻ Biến (Kết quả)"
              variant="transformed"
            />
          </div>

          {/* Quẻ Hỗ */}
          <div className="serial-trio-col">
            <HexagramView
              hexagram={trio.nuclear}
              roleLabel="Quẻ Hỗ (Diễn biến)"
              variant="nuclear"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
