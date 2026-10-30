import React, { useState, useMemo } from 'react';
import { Button, Select } from '@kindich/shared';
import {
  getFullCalendarInfo,
  CalendarConversionResult,
  EARTHLY_BRANCHES,
} from '@kindich/calendar';
import {
  castByMaiHua,
  MaiHuaCastingResult,
  MAI_HUA_BRANCH_MAP,
  InvalidMaiHuaInputError,
} from '@kindich/core';
import { getCurrentVietnamTimeString, formatSolarLunarSummary } from './mai-hua.utils';

export interface MaiHuaCastingFormProps {
  /** Callback trả kết quả lập quẻ Mai Hoa và thông tin lịch về component cha */
  onCastSuccess: (result: MaiHuaCastingResult, calendarInfo: CalendarConversionResult) => void;
  /** Callback khi xóa hoặc làm mới form */
  onReset?: () => void;
  /** Giá trị thời gian khởi tạo (YYYY-MM-DDTHH:mm) */
  initialDateTime?: string;
}

export const MaiHuaCastingForm: React.FC<MaiHuaCastingFormProps> = ({
  onCastSuccess,
  onReset,
  initialDateTime,
}) => {
  const [dateTimeStr, setDateTimeStr] = useState<string>(
    initialDateTime || getCurrentVietnamTimeString()
  );
  // 'auto' nghĩa là tự động suy ra Địa Chi giờ từ thời gian đã chọn, hoặc người dùng tự chọn từ 1 đến 12
  const [selectedHourBranch, setSelectedHourBranch] = useState<string>('auto');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Tính toán thông tin lịch tự động mỗi khi người dùng thay đổi thời gian
   */
  const calendarPreview = useMemo<CalendarConversionResult | null>(() => {
    if (!dateTimeStr) return null;
    try {
      return getFullCalendarInfo(dateTimeStr, { dayTransition: 'RAT_HOUR_23' });
    } catch {
      return null;
    }
  }, [dateTimeStr]);

  /**
   * Thiết lập nhanh về thời khắc hiện tại
   */
  const handleSetCurrentTime = () => {
    const current = getCurrentVietnamTimeString();
    setDateTimeStr(current);
    setSelectedHourBranch('auto');
    setErrorMessage(null);
  };

  /**
   * Xử lý gửi form và lập quẻ Mai Hoa Dịch Số
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateTimeStr) {
      setErrorMessage('Vui lòng chọn ngày và giờ khởi tâm chiêm nghiệm.');
      return;
    }

    if (!calendarPreview) {
      setErrorMessage('Thời gian không hợp lệ. Vui lòng chọn ngày giờ hợp lệ.');
      return;
    }

    try {
      // Xác định số thứ tự Địa Chi năm (1: Tý ... 12: Hợi)
      const yearBranchIndex = ((calendarPreview.lunar.year + 8) % 12 + 12) % 12;
      const yearBranchNumber = yearBranchIndex + 1;

      // Xác định số thứ tự Địa Chi giờ (nếu 'auto' thì lấy từ calendarPreview, nếu không thì lấy giá trị đã chọn)
      let hourBranchNumber: number;
      if (selectedHourBranch === 'auto') {
        hourBranchNumber = calendarPreview.currentHourBranch.index + 1; // 1-based
      } else {
        hourBranchNumber = parseInt(selectedHourBranch, 10);
      }

      // Gọi Mai Hua Casting Engine từ @kindich/core
      const castingResult = castByMaiHua({
        yearBranch: yearBranchNumber,
        month: calendarPreview.lunar.month,
        day: calendarPreview.lunar.day,
        hourBranch: hourBranchNumber,
      });

      setErrorMessage(null);
      onCastSuccess(castingResult, calendarPreview);
    } catch (err) {
      if (err instanceof InvalidMaiHuaInputError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi khi lập quẻ Mai Hoa. Vui lòng kiểm tra lại.');
      }
    }
  };

  /**
   * Xóa và làm mới
   */
  const handleClear = () => {
    handleSetCurrentTime();
    if (onReset) {
      onReset();
    }
  };

  // Tạo danh sách tùy chọn 12 giờ địa chi
  const hourBranchOptions = [
    {
      value: 'auto',
      label: calendarPreview
        ? `Tự động theo giờ đã chọn (Giờ ${calendarPreview.currentHourBranch.branch} • ${calendarPreview.currentHourBranch.range})`
        : 'Tự động theo giờ đã chọn',
    },
    ...EARTHLY_BRANCHES.map((branch) => {
      const branchNum = MAI_HUA_BRANCH_MAP[branch];
      return {
        value: String(branchNum),
        label: `Giờ ${branch} (Chi số #${branchNum})`,
      };
    }),
  ];

  return (
    <form className="mai-hua-form" onSubmit={handleSubmit} noValidate>
      {/* 1. Chọn thời gian & nút lấy thời điểm hiện tại */}
      <div className="mai-hua-form__time-picker-row">
        <div className="mai-hua-form__input-group">
          <label className="mai-hua-label" htmlFor="mai-hua-datetime">
            Thời điểm khởi tâm chiêm nghiệm: <span style={{ color: 'var(--bha-error)' }}>*</span>
          </label>
          <div className="mai-hua-time-input-wrapper">
            <input
              id="mai-hua-datetime"
              type="datetime-local"
              className={`bha-input bha-input--lg ${errorMessage ? 'bha-input--error' : ''}`}
              value={dateTimeStr}
              onChange={(e) => {
                setDateTimeStr(e.target.value);
                setErrorMessage(null);
              }}
              required
            />
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handleSetCurrentTime}
              title="Lấy giờ hiện tại của hệ thống (múi giờ Asia/Ho_Chi_Minh)"
            >
              ⏳ Lấy giờ hiện tại
            </Button>
          </div>
          {errorMessage && <span className="bha-input-error-msg">{errorMessage}</span>}
        </div>
      </div>

      {/* 2. Hiển thị thông tin chuyển đổi Dương lịch - Âm lịch & 4 trụ Can Chi tương ứng */}
      {calendarPreview && (
        <div className="mai-hua-calendar-preview">
          <div className="mai-hua-calendar-preview__header">
            <span className="mai-hua-preview-badge">Đối Chiếu Lịch Âm Dương & Can Chi (UTC+7)</span>
            <span className="mai-hua-preview-version">{calendarPreview.algorithmVersion}</span>
          </div>

          <div className="mai-hua-preview-grid">
            {/* Dương lịch & Âm lịch */}
            <div className="mai-hua-preview-item">
              <span className="mai-hua-preview-label">Dương Lịch & Âm Lịch</span>
              <p className="mai-hua-preview-solar">
                {formatSolarLunarSummary(calendarPreview).solarText}
              </p>
              <p className="mai-hua-preview-lunar">
                ☯ <strong>{formatSolarLunarSummary(calendarPreview).lunarText}</strong>
              </p>
            </div>

            {/* Bốn trụ Can Chi */}
            <div className="mai-hua-preview-item mai-hua-preview-item--canchi">
              <span className="mai-hua-preview-label">Tứ Trụ Can Chi</span>
              <div className="mai-hua-canchi-tags">
                <span className="mai-hua-canchi-tag" title="Can Chi Năm">
                  Năm <strong>{calendarPreview.canChi.year}</strong>
                </span>
                <span className="mai-hua-canchi-tag" title="Can Chi Tháng - Nguyệt Kiến">
                  Tháng <strong>{calendarPreview.canChi.month}</strong>
                </span>
                <span className="mai-hua-canchi-tag mai-hua-canchi-tag--day" title="Can Chi Ngày - Nhật Thần">
                  Ngày <strong>{calendarPreview.canChi.day}</strong>
                </span>
                <span className="mai-hua-canchi-tag mai-hua-canchi-tag--hour" title="Can Chi Giờ - Thời Thần">
                  Giờ <strong>{calendarPreview.canChi.hour}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cho phép kiểm tra và chọn/tùy biến giờ địa chi */}
      <div className="mai-hua-form__branch-select">
        <Select
          label="Giờ Địa Chi lập quẻ (Tý = 1 đến Hợi = 12):"
          options={hourBranchOptions}
          value={selectedHourBranch}
          onChange={(e) => setSelectedHourBranch(e.target.value)}
          helperText="Mặc định hệ thống tự quy đổi chính xác theo giờ phút bạn đã chọn. Bạn có thể chọn cụ thể một giờ Địa Chi khác nếu muốn thử nghiệm."
          fullWidth
        />
      </div>

      {/* 4. Thao tác Form */}
      <div className="mai-hua-form__actions">
        <Button variant="primary" size="lg" type="submit">
          Lập quẻ Mai Hoa
        </Button>
        <Button variant="outline" size="lg" type="button" onClick={handleClear}>
          Làm mới
        </Button>
      </div>
    </form>
  );
};
