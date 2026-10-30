import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SerialCastingForm } from './SerialCastingForm';
import { SerialCastingResultView } from './SerialCastingResultView';
import { castBySerial } from '@kindich/core';

describe('SerialCastingForm Component', () => {
  it('chỉ cho phép nhập ký tự chữ số và giữ nguyên số 0 ở đầu', () => {
    const onCastSuccess = vi.fn();
    render(<SerialCastingForm onCastSuccess={onCastSuccess} />);

    const input = screen.getByPlaceholderText(/Ví dụ: 123456/i) as HTMLInputElement;

    // Nhập lẫn chữ và số: "09abc123" -> chỉ giữ lại "09123"
    fireEvent.change(input, { target: { value: '09abc123' } });
    expect(input.value).toBe('09123');
  });

  it('báo lỗi khi nhập ít hơn 2 chữ số và cố gắng gửi form', () => {
    const onCastSuccess = vi.fn();
    render(<SerialCastingForm onCastSuccess={onCastSuccess} />);

    const input = screen.getByPlaceholderText(/Ví dụ: 123456/i);
    const form = input.closest('form')!;

    // Nhập 1 chữ số
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.submit(form);

    expect(screen.getByText(/Số seri tiền phải có tối thiểu 2 chữ số/i)).toBeInTheDocument();
    expect(onCastSuccess).not.toHaveBeenCalled();
  });

  it('gọi castBySerial từ @kindich/core và trả về kết quả chính xác khi nhập hợp lệ', () => {
    const onCastSuccess = vi.fn();
    render(<SerialCastingForm onCastSuccess={onCastSuccess} />);

    const input = screen.getByPlaceholderText(/Ví dụ: 123456/i);
    const submitBtn = screen.getByRole('button', { name: /Lập quẻ/i });

    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(submitBtn);

    expect(onCastSuccess).toHaveBeenCalledTimes(1);
    const result = onCastSuccess.mock.calls[0]![0];
    expect(result.serialNumber).toBe('123456');
    expect(result.trio.primary.name).toBe('Thiên Lôi Vô Vọng');
    expect(result.movingLine).toBe(3);
  });

  it('hỗ trợ nút Xóa & Nhập lại để làm mới form', () => {
    const onCastSuccess = vi.fn();
    const onReset = vi.fn();
    render(<SerialCastingForm onCastSuccess={onCastSuccess} onReset={onReset} />);

    const input = screen.getByPlaceholderText(/Ví dụ: 123456/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '091234' } });

    const clearBtn = screen.getByRole('button', { name: /Xóa & Nhập lại/i });
    fireEvent.click(clearBtn);

    expect(input.value).toBe('');
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('SerialCastingResultView Component', () => {
  const result = castBySerial('123456');

  it('hiển thị đầy đủ seri, Thượng quái, Hạ quái, Hào động và bộ ba quẻ', () => {
    render(<SerialCastingResultView result={result} />);

    // 1. Seri đã nhập
    expect(screen.getByText('123456')).toBeInTheDocument();

    // 2. Thượng quái & Hạ quái
    expect(screen.getByText('Thượng Quái (Quẻ trên)')).toBeInTheDocument();
    expect(screen.getByText('Hạ Quái (Quẻ dưới)')).toBeInTheDocument();
    expect(screen.getByText('Hành Kim • Tiên thiên #1')).toBeInTheDocument();
    expect(screen.getByText('Hành Mộc • Tiên thiên #4')).toBeInTheDocument();

    // 3. Hào động
    expect(screen.getByText('Hào 3 Động')).toBeInTheDocument();

    // 4. Bộ ba quẻ (Quẻ Chủ, Quẻ Biến, Quẻ Hỗ)
    expect(screen.getByText('Thiên Lôi Vô Vọng')).toBeInTheDocument(); // Quẻ Chủ
    expect(screen.getByText('Thiên Hỏa Đồng Nhân')).toBeInTheDocument(); // Quẻ Biến
    expect(screen.getByText('Phong Sơn Tiệm')).toBeInTheDocument(); // Quẻ Hỗ
  });
});
