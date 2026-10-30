import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaiHuaCastingForm } from './MaiHuaCastingForm';
import { MaiHuaCastingResultView } from './MaiHuaCastingResultView';
import { castByDateTime } from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';

describe('MaiHuaCastingForm Component', () => {
  it('hiển thị đầy đủ ô nhập ngày giờ, nút lấy giờ hiện tại và preview lịch', () => {
    const onCastSuccess = vi.fn();
    render(
      <MaiHuaCastingForm
        onCastSuccess={onCastSuccess}
        initialDateTime="2024-02-10T07:30" // Mùng 1 Tết Giáp Thìn
      />
    );

    // Kiểm tra các phần tử giao diện chính
    expect(screen.getByLabelText(/Thời điểm khởi tâm chiêm nghiệm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lấy giờ hiện tại/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lập quẻ Mai Hoa/i })).toBeInTheDocument();

    // Kiểm tra preview lịch âm dương & can chi
    expect(screen.getByText(/Đối Chiếu Lịch Âm Dương & Can Chi/i)).toBeInTheDocument();
    expect(screen.getByTitle('Can Chi Năm')).toHaveTextContent('Năm Giáp Thìn');
    expect(screen.getByTitle('Can Chi Ngày - Nhật Thần')).toHaveTextContent('Ngày Giáp Thìn');
  });

  it('gọi Mai Hua Casting Engine và trả về kết quả thành công khi nhấn Lập quẻ Mai Hoa', () => {
    const onCastSuccess = vi.fn();
    render(
      <MaiHuaCastingForm
        onCastSuccess={onCastSuccess}
        initialDateTime="2024-02-10T07:30"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Lập quẻ Mai Hoa/i });
    fireEvent.click(submitBtn);

    expect(onCastSuccess).toHaveBeenCalledTimes(1);
    const [result, calInfo] = onCastSuccess.mock.calls[0]!;
    expect(result.algorithmVersion).toBe('MAI-HUA-V1');
    expect(result.input.yearBranchName).toBe('Thìn');
    expect(result.input.hourBranchName).toBe('Thìn');
    expect(result.trio.primary.name).toBe('Sơn Lôi Di');
    expect(calInfo.canChi.year).toBe('Giáp Thìn');
  });

  it('cho phép chọn/tùy biến giờ Địa Chi (ví dụ chọn giờ Tuất)', () => {
    const onCastSuccess = vi.fn();
    render(
      <MaiHuaCastingForm
        onCastSuccess={onCastSuccess}
        initialDateTime="2024-02-10T07:30"
      />
    );

    // Thay đổi dropdown giờ Địa Chi sang Tuất (#11)
    const select = screen.getByLabelText(/Giờ Địa Chi lập quẻ/i);
    fireEvent.change(select, { target: { value: '11' } }); // Tuất = 11

    const submitBtn = screen.getByRole('button', { name: /Lập quẻ Mai Hoa/i });
    fireEvent.click(submitBtn);

    expect(onCastSuccess).toHaveBeenCalledTimes(1);
    const [result] = onCastSuccess.mock.calls[0]!;
    expect(result.input.hourBranchNumber).toBe(11);
    expect(result.input.hourBranchName).toBe('Tuất');
  });

  it('báo lỗi khi xóa trắng thời gian và cố gắng lập quẻ', () => {
    const onCastSuccess = vi.fn();
    render(<MaiHuaCastingForm onCastSuccess={onCastSuccess} initialDateTime="2024-02-10T07:30" />);

    const input = screen.getByLabelText(/Thời điểm khởi tâm chiêm nghiệm/i);
    fireEvent.change(input, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /Lập quẻ Mai Hoa/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Vui lòng chọn ngày và giờ/i)).toBeInTheDocument();
    expect(onCastSuccess).not.toHaveBeenCalled();
  });
});

describe('MaiHuaCastingResultView Component', () => {
  const calInfo = getFullCalendarInfo('2024-02-10T07:30:00.000+07:00');
  const result = castByDateTime('2024-02-10T07:30:00.000+07:00');

  it('hiển thị đầy đủ thông số quẻ, phân tích Thể/Dụng và bộ ba quẻ', () => {
    render(<MaiHuaCastingResultView result={result} calendarInfo={calInfo} />);

    // 1. Tiêu đề và badge thuật toán
    expect(screen.getByText('Kết quả lập quẻ Mai Hoa Dịch Số')).toBeInTheDocument();
    expect(screen.getByText('MAI-HUA-V1')).toBeInTheDocument();

    // 2. Thượng quái, Hạ quái, Hào động
    expect(screen.getByText('Thượng Quái (Quẻ trên)')).toBeInTheDocument();
    expect(screen.getByText('Hạ Quái (Quẻ dưới)')).toBeInTheDocument();
    expect(screen.getByText('Hào 6 Động')).toBeInTheDocument();

    // 3. Phân tích Thể / Dụng
    expect(screen.getByText('Phân Tích Thể • Dụng Cổ Pháp')).toBeInTheDocument();
    expect(screen.getByText('THỂ (Chủ Thể)')).toBeInTheDocument();
    expect(screen.getByText('DỤNG (Khách Thể)')).toBeInTheDocument();

    // 4. Bộ ba quẻ (Quẻ Chủ: Sơn Lôi Di)
    expect(screen.getByText('Sơn Lôi Di')).toBeInTheDocument();
  });
});
