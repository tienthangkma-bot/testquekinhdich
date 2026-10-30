import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SixYaoAnalysisView } from './SixYaoAnalysisView';
import { orchestrateSixYaoAnalysis } from '@kindich/core';

describe('SixYaoAnalysisView Component', () => {
  it('kết nối Six Yao Analysis Orchestrator từ @kindich/core và hiển thị đầy đủ thông tin quẻ chủ, quẻ biến, quẻ hỗ', () => {
    // Quẻ 1 (Thuần Càn) động hào 1 -> biến Quẻ 44 (Thiên Phong Cấu)
    render(
      <SixYaoAnalysisView
        primaryHexagram={1}
        movingLineIndices={[1]}
        dateTime={{
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Mậu Thìn',
        }}
      />
    );

    // 1. Kiểm tra tiêu đề và thông tin Bát Cung
    expect(screen.getByText('Bảng Phân Tích Lục Hào Cổ Pháp')).toBeInTheDocument();
    expect(screen.getAllByText(/Thuần Càn/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Càn/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kim/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Thế tại hào 6, Ứng tại hào 3/i)).toBeInTheDocument();

    // 2. Kiểm tra bộ ba quẻ: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ
    expect(screen.getByText('Quẻ Chủ (Bản Quái)')).toBeInTheDocument();
    expect(screen.getByText('Quẻ Biến (Biến Quái)')).toBeInTheDocument();
    expect(screen.getByText('Quẻ Hỗ (Hỗ Quái)')).toBeInTheDocument();
    expect(screen.getAllByText(/Thiên Phong Cấu/i).length).toBeGreaterThan(0);

    // 3. Kiểm tra thông tin Lịch Pháp & Can Chi
    expect(screen.getAllByText(/Tháng Bính Dần/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ngày Giáp Tý/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nhật Thần/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nguyệt Kiến/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tuất, Hợi/i).length).toBeGreaterThan(0); // Tuần Không
    expect(screen.getAllByText(/Thân/i).length).toBeGreaterThan(0); // Nguyệt Phá
  });

  it('hiển thị bảng 6 hào theo thứ tự từ TRÊN XUỐNG (Hào 6 ở đầu, Hào 1 ở cuối)', () => {
    const { container } = render(
      <SixYaoAnalysisView
        primaryHexagram={1}
        movingLineIndices={[1]}
        dateTime={{
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
        }}
      />
    );

    const rows = container.querySelectorAll('.six-yao-row');
    expect(rows.length).toBe(6);

    // Hàng 1 (trên cùng): Hào 6 (Nhâm Tuất Thổ, Hào THẾ)
    expect(rows[0]?.getAttribute('data-line-position')).toBe('6');
    expect(rows[0]?.textContent).toContain('Hào 6');
    expect(rows[0]?.textContent).toContain('Tuất');
    expect(rows[0]?.textContent).toContain('THẾ');
    expect(rows[0]?.textContent).toContain('Phụ Mẫu');

    // Hàng 2: Hào 5 (Nhâm Thân Kim)
    expect(rows[1]?.getAttribute('data-line-position')).toBe('5');
    expect(rows[1]?.textContent).toContain('Hào 5');
    expect(rows[1]?.textContent).toContain('Thân');
    expect(rows[1]?.textContent).toContain('Huynh Đệ');

    // Hàng 3: Hào 4 (Nhâm Ngọ Hỏa)
    expect(rows[2]?.getAttribute('data-line-position')).toBe('4');
    expect(rows[2]?.textContent).toContain('Hào 4');
    expect(rows[2]?.textContent).toContain('Ngọ');
    expect(rows[2]?.textContent).toContain('Quan Quỷ');

    // Hàng 4: Hào 3 (Giáp Thìn Thổ, Hào ỨNG)
    expect(rows[3]?.getAttribute('data-line-position')).toBe('3');
    expect(rows[3]?.textContent).toContain('Hào 3');
    expect(rows[3]?.textContent).toContain('Thìn');
    expect(rows[3]?.textContent).toContain('ỨNG');
    expect(rows[3]?.textContent).toContain('Phụ Mẫu');

    // Hàng 5: Hào 2 (Giáp Dần Mộc)
    expect(rows[4]?.getAttribute('data-line-position')).toBe('2');
    expect(rows[4]?.textContent).toContain('Hào 2');
    expect(rows[4]?.textContent).toContain('Dần');
    expect(rows[4]?.textContent).toContain('Thê Tài');

    // Hàng 6 (dưới cùng): Hào 1 (Giáp Tý Thủy, Hào ĐỘNG)
    expect(rows[5]?.getAttribute('data-line-position')).toBe('1');
    expect(rows[5]?.textContent).toContain('Hào 1');
    expect(rows[5]?.textContent).toContain('Tý');
    expect(rows[5]?.textContent).toContain('Tử Tôn');
    expect(rows[5]?.textContent).toContain('ĐỘNG');
    expect(rows[5]?.textContent).toContain('Sửu'); // Biến sang Sửu Thổ
  });

  it('cập nhật khu vực giải thích chi tiết khi chọn từng hào trong bảng', () => {
    const { container } = render(
      <SixYaoAnalysisView
        primaryHexagram={1}
        movingLineIndices={[1]}
        dateTime={{
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
        }}
      />
    );

    // Mặc định chọn Hào 6 (Hào Thế của Quẻ Càn)
    const inspector = screen.getByTestId('six-yao-inspector');
    expect(inspector.textContent).toContain('Chi Tiết Hào 6');
    expect(inspector.textContent).toContain('Là Hào THẾ');
    expect(inspector.textContent).toContain('Tuất');

    // Click vào Hào 1 (Động hào)
    const hao1Row = container.querySelector('[data-line-position="1"]');
    expect(hao1Row).not.toBeNull();
    fireEvent.click(hao1Row!);

    // Inspector phải cập nhật sang Hào 1
    expect(inspector.textContent).toContain('Chi Tiết Hào 1');
    expect(inspector.textContent).toContain('HÀO ĐỘNG');
    expect(inspector.textContent).toContain('Tử Tôn');
    expect(inspector.textContent).toContain('Biến Hóa Hào Động & Hồi Đầu');
    expect(inspector.textContent).toContain('Hồi Đầu Khắc');
    expect(inspector.textContent).toContain('Hồi Đầu Hợp');
  });

  it('nhận trực tiếp kết quả analysisResult từ orchestrateSixYaoAnalysis mà không tính lại', () => {
    const customResult = orchestrateSixYaoAnalysis({
      primaryHexagram: 11, // Địa Thiên Thái
      dateTime: {
        dayCanChi: 'Ất Sửu',
        monthCanChi: 'Mậu Thân',
      },
    });

    render(<SixYaoAnalysisView analysisResult={customResult} />);

    expect(screen.getAllByText(/Địa Thiên Thái/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Khôn/i).length).toBeGreaterThan(0);
  });
});
