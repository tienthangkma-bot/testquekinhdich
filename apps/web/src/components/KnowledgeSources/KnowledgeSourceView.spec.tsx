import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KnowledgeSourceView } from './KnowledgeSourceView';

describe('KnowledgeSourceView Component (apps/web)', () => {
  it('hiển thị đầy đủ tiêu đề, thanh thống kê và các tab chính', async () => {
    render(<KnowledgeSourceView />);

    expect(
      screen.getByText(/Quản Lý Nguồn Tri Thức Kinh Điển/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      // 10 tác giả
      expect(screen.getByText('10')).toBeInTheDocument();
      // 8 bộ thư tịch
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Tra cứu trích dẫn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thư viện thư tịch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Danh nhân Dịch học/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đối chiếu RuleSets/i })).toBeInTheDocument();
  });

  it('hiển thị 3 tầng văn bản và trích dẫn kinh điển ở tab mặc định', async () => {
    render(<KnowledgeSourceView />);

    await waitFor(() => {
      expect(screen.getByText(/Thoán từ Quẻ Thuần Càn/i)).toBeInTheDocument();
    });

    // Kiểm tra nhãn của 3 tầng văn bản
    expect(screen.getAllByText(/Tầng 1: Nguyên Văn Chữ Hán/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tầng 2: Bản Dịch Nghĩa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tầng 3: Bình Giải Nghĩa Lý/i).length).toBeGreaterThan(0);

    // Kiểm tra văn bản chữ Hán kinh điển
    expect(screen.getByText('乾：元，亨，利，貞。')).toBeInTheDocument();
    expect(screen.getAllByText(/Hán Việt:/i).length).toBeGreaterThan(0);
  });

  it('chuyển đổi sang tab Thư viện thư tịch và hiển thị danh sách sách cổ bản', async () => {
    render(<KnowledgeSourceView />);

    const booksTab = screen.getByRole('button', { name: /Thư viện thư tịch/i });
    fireEvent.click(booksTab);

    await waitFor(() => {
      expect(screen.getByText('Chu Dịch Chính Nghĩa')).toBeInTheDocument();
      expect(screen.getByText('Bốc Phệ Chính Tông')).toBeInTheDocument();
      expect(screen.getByText('Tăng San Bốc Dịch')).toBeInTheDocument();
      expect(screen.getByText('Mai Hoa Dịch Số')).toBeInTheDocument();
      expect(screen.getByText('Chu Dịch Bản Nghĩa')).toBeInTheDocument();
    });
  });

  it('chuyển đổi sang tab Danh nhân Dịch học và hiển thị các tác giả chính thống', async () => {
    render(<KnowledgeSourceView />);

    const authorsTab = screen.getByRole('button', { name: /Danh nhân Dịch học/i });
    fireEvent.click(authorsTab);

    await waitFor(() => {
      expect(screen.getByText('Chu Văn Vương (Cơ Xương)')).toBeInTheDocument();
      expect(screen.getByText('Chu Công (Cơ Đán)')).toBeInTheDocument();
      expect(screen.getByText('Khổng Tử (Khổng Khâu)')).toBeInTheDocument();
      expect(screen.getByText('Kinh Phòng (Kinh Quân Minh)')).toBeInTheDocument();
      expect(screen.getByText('Thiệu Ung (Thiệu Khang Tiết)')).toBeInTheDocument();
      expect(screen.getByText('Dã Hạc Đạo Nhân')).toBeInTheDocument();
    });
  });

  it('chuyển sang tab Đối chiếu RuleSets và hiển thị bảng ma trận quy tắc', async () => {
    render(<KnowledgeSourceView />);

    const ruleSetsTab = screen.getByRole('button', { name: /Đối chiếu RuleSets/i });
    fireEvent.click(ruleSetsTab);

    await waitFor(() => {
      expect(screen.getByText('Bảng Đối Chiếu Ma Trận: RuleSets & Cổ Thư Kinh Điển')).toBeInTheDocument();
      expect(screen.getByText('BO_PHE_CHINH_TONG_V1')).toBeInTheDocument();
      expect(screen.getByText('MAI-HUA-V1')).toBeInTheDocument();
      expect(screen.getByText('CHU_HI_V1')).toBeInTheDocument();
      expect(screen.getByText('SERIAL-MOD8-V1')).toBeInTheDocument();
    });
  });

  it('tìm kiếm trích dẫn theo từ khóa trong ô tìm kiếm', async () => {
    render(<KnowledgeSourceView />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tìm kiếm theo chữ Hán, phiên âm, bản dịch/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo chữ Hán, phiên âm, bản dịch/i);
    fireEvent.change(searchInput, { target: { value: 'Tiềm long' } });

    await waitFor(() => {
      expect(screen.getByText(/Hào Từ Sơ Cửu Quẻ Thuần Càn/i)).toBeInTheDocument();
      expect(screen.queryByText(/Thoán từ Quẻ Thuần Càn/i)).not.toBeInTheDocument();
    });

    // Bấm đặt lại bộ lọc
    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Thoán từ Quẻ Thuần Càn/i)).toBeInTheDocument();
    });
  });
});
