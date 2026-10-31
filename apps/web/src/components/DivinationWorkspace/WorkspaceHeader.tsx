import React from 'react';
import { CastingMethod, DivinationDateTime } from '@kindich/domain';
import { Button } from '@kindich/shared';

interface WorkspaceHeaderProps {
  method: CastingMethod;
  dateTimeInfo: DivinationDateTime;
  question?: string;
  serialNumber?: string;
  onBackToCasting?: () => void;
  onSaveNote?: () => void;
  isSaved?: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  method,
  dateTimeInfo,
  question,
  serialNumber,
  onBackToCasting,
  onSaveNote,
  isSaved = true,
}) => {
  const dt = dateTimeInfo;
  const solarDate = new Date(dt.solarDateTime);

  // Định dạng giờ và ngày dương lịch chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh)
  const pad = (n: number | string) => String(n).padStart(2, '0');
  let timeFormatted = '';

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(solarDate);
    let hours = '';
    let minutes = '';
    let solarDay = '';
    let solarMonth = '';
    let solarYear = '';
    for (const part of parts) {
      if (part.type === 'hour') hours = part.value;
      if (part.type === 'minute') minutes = part.value;
      if (part.type === 'day') solarDay = part.value;
      if (part.type === 'month') solarMonth = part.value;
      if (part.type === 'year') solarYear = part.value;
    }
    timeFormatted = `${hours}:${minutes} - ${solarDay}/${solarMonth}/${solarYear}`;
  } catch {
    const hours = pad(solarDate.getHours());
    const minutes = pad(solarDate.getMinutes());
    const solarDay = pad(solarDate.getDate());
    const solarMonth = pad(solarDate.getMonth() + 1);
    const solarYear = solarDate.getFullYear();
    timeFormatted = `${hours}:${minutes} - ${solarDay}/${solarMonth}/${solarYear}`;
  }

  // Chuỗi giờ Âm lịch
  const hourBranch = dt.lunarHourBranch || 'Tý';
  const lunarStr = `(giờ ${hourBranch}, ngày ${dt.lunarDay}/${dt.lunarMonth}/${dt.lunarYear} ÂD hợp lịch)`;

  // Can Chi 4 trụ
  const canChiStr = `Giờ ${dt.hourCanChi || '-'}, ngày ${dt.dayCanChi || '-'}, tháng ${dt.monthCanChi || '-'}, năm ${dt.yearCanChi || '-'}`;

  // Tách Nhật thần và Nguyệt lệnh
  const dayBranch = (dt.dayCanChi || '').split(' ')[1] || (dt.dayCanChi || '');
  const monthBranch = (dt.monthCanChi || '').split(' ')[1] || (dt.monthCanChi || '');

  // Phương pháp lập quẻ
  let methodName = 'Gieo quẻ Mai Hoa (Giờ động tâm)';
  if (method === CastingMethod.SERIAL) {
    methodName = `Lập quẻ số seri tiền${serialNumber ? `: ${serialNumber}` : ''}`;
  }

  // Xử lý in ấn / xuất PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="workspace-header-container">
      {/* Thanh điều hướng thao tác */}
      <div className="workspace-toolbar no-print">
        <div className="workspace-toolbar-left">
          {onBackToCasting && (
            <Button variant="outline" size="sm" onClick={onBackToCasting}>
              ⬅ Quay lại lập quẻ
            </Button>
          )}
          <span className="workspace-status-badge">
            {isSaved ? '✓ Đã lưu tự động vào Lịch sử' : 'Chưa lưu'}
          </span>
        </div>
        <div className="workspace-toolbar-right">
          {onSaveNote && (
            <Button variant="outline" size="sm" onClick={onSaveNote}>
              📝 Thêm ghi chú nghiệm lý
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handlePrint}>
            🖨️ In / Xuất PDF
          </Button>
        </div>
      </div>

      {/* Banner Tiêu Đề Chính */}
      <div className="workspace-brand-banner">
        <div className="workspace-brand-text">
          <h2 className="workspace-app-title">
            PHẦN MỀM LẬP QUẺ KINH DỊCH - BẮC HÀ TÂN AN PHÁI
          </h2>
          <div className="workspace-meta-grid">
            <div className="meta-row">
              <span className="meta-label">Thời gian lập quẻ:</span>
              <span className="meta-value">
                <strong>{timeFormatted}</strong> {lunarStr}
              </span>
            </div>

            <div className="meta-row">
              <span className="meta-label">Can Chi:</span>
              <span className="meta-value">{canChiStr}</span>
            </div>

            <div className="meta-row meta-row--multi">
              <div>
                <span className="meta-label">Tiết khí:</span>
                <span className="meta-value">
                  <strong>{dt.solarTerm || 'Bình thường'}</strong>
                </span>
              </div>
              <div>
                <span className="meta-label">Nhật thần:</span>
                <span className="meta-value">
                  <strong>{dayBranch}</strong>
                </span>
              </div>
              <div>
                <span className="meta-label">Nguyệt lệnh:</span>
                <span className="meta-value">
                  <strong>{monthBranch}</strong>
                </span>
              </div>
            </div>

            <div className="meta-row meta-row--multi">
              <div>
                <span className="meta-label">Phương pháp lập quẻ:</span>
                <span className="meta-value">
                  <strong>{methodName}</strong>
                </span>
              </div>
              <div>
                <span className="meta-label">Tuần Không:</span>
                <span className="meta-value">
                  <strong>{(dt.voidBranches || []).join('-') || 'Không có'}</strong>
                </span>
              </div>
            </div>

            <div className="meta-row meta-row--question">
              <span className="meta-label">Việc cần xem:</span>
              <span className="meta-value meta-value--question">
                {question && question.trim() ? question : 'Chiêm nghiệm tổng quan sự việc'}
              </span>
            </div>
          </div>
        </div>

        {/* Đồng tiền Cổ / Thái Cực Biểu Trưng */}
        <div className="workspace-coin-emblem" aria-hidden="true">
          <div className="coin-outer-circle">
            <div className="coin-inner-square">
              <span className="coin-character top">Bắc</span>
              <span className="coin-character bottom">Hà</span>
              <span className="coin-character left">Tân</span>
              <span className="coin-character right">An</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
