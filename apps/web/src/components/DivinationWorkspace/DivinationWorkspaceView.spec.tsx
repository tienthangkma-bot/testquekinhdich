import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  CastingMethod,
  DivinationDateTime,
  HEXAGRAM_MAP,
  LinePosition,
} from '@kindich/domain';
import {
  castByMaiHua,
  orchestrateSixYaoAnalysis,
} from '@kindich/core';
import { DivinationWorkspaceView } from './DivinationWorkspaceView';

describe('DivinationWorkspaceView Component (Single Divination Workspace)', () => {
  // Test case mô phỏng chính xác hình ảnh mẫu:
  // Quẻ Thủy Lôi Truân (#3) động hào 2 biến Thủy Trạch Tiết (#60)
  // Ngày Mậu Dần, Tháng Mậu Tuất, Giờ Đinh Tỵ, Năm Bính Ngọ, Tiết khí Sương Giáng
  const sampleDateTime: DivinationDateTime = {
    solarDateTime: '2026-10-31T10:03:00.000Z',
    lunarYear: 2026,
    lunarMonth: 9,
    lunarDay: 22,
    lunarHourBranch: 'Tỵ',
    yearCanChi: 'Bính Ngọ',
    monthCanChi: 'Mậu Tuất',
    dayCanChi: 'Mậu Dần',
    hourCanChi: 'Đinh Tỵ',
    solarTerm: 'Sương giáng',
    voidBranches: ['Thân', 'Dậu'],
  };

  const sampleTrio = {
    primary: HEXAGRAM_MAP[3]!, // Thủy Lôi Truân
    transformed: HEXAGRAM_MAP[60]!, // Thủy Trạch Tiết
    nuclear: HEXAGRAM_MAP[23]!, // Sơn Địa Bác (Quẻ hỗ của Truân)
    movingLineIndices: [2 as LinePosition],
    hasMovingLines: true,
  };

  const sampleSixYaoResult = orchestrateSixYaoAnalysis({
    primaryHexagram: 3,
    changingHexagram: 60,
    movingLineIndices: [2],
    dateTime: {
      dayCanChi: 'Mậu Dần',
      monthCanChi: 'Mậu Tuất',
      yearCanChi: 'Bính Ngọ',
      hourCanChi: 'Đinh Tỵ',
    },
  });

  it('Yêu cầu 1, 2, 7: Hiển thị đầy đủ khu vực thông tin chung và các nút điều hướng', () => {
    const handleBack = vi.fn();
    const handleSaveNote = vi.fn();

    render(
      <DivinationWorkspaceView
        method={CastingMethod.SERIAL}
        trio={sampleTrio}
        dateTimeInfo={sampleDateTime}
        question="Học Viện Phong Thủy Minh Việt - 08.4531.4531"
        sixYaoResult={sampleSixYaoResult}
        onBackToCasting={handleBack}
        onSaveNote={handleSaveNote}
      />
    );

    // 1. Kiểm tra tiêu đề banner
    expect(
      screen.getByText(/PHẦN MỀM LẬP QUẺ KINH DỊCH - BẮC HÀ TÂN AN PHÁI/i)
    ).toBeInTheDocument();

    // 2. Kiểm tra thông tin thời gian & lịch pháp
    expect(screen.getByText(/22\/9\/2026 ÂD hợp lịch/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Mậu Dần/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sương giáng/i)).toBeInTheDocument();
    expect(screen.getByText(/Thân-Dậu/i)).toBeInTheDocument();

    // 3. Kiểm tra nội dung câu hỏi
    expect(
      screen.getAllByText(/Học Viện Phong Thủy Minh Việt - 08.4531.4531/i).length
    ).toBeGreaterThan(0);

    // 4. Kiểm tra các nút thao tác
    const backBtn = screen.getByRole('button', { name: /Quay lại lập quẻ/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);

    const printBtn = screen.getByRole('button', { name: /In \/ Xuất PDF/i });
    expect(printBtn).toBeInTheDocument();

    const noteBtn = screen.getByRole('button', { name: /Thêm ghi chú nghiệm lý/i });
    expect(noteBtn).toBeInTheDocument();
    fireEvent.click(noteBtn);
    expect(handleSaveNote).toHaveBeenCalledTimes(1);
  });

  it('Yêu cầu 3: Hiển thị đồ hình 3 quẻ (Quẻ Chủ, Quẻ Hỗ, Quẻ Biến) với Bát Cung và hào động', () => {
    render(
      <DivinationWorkspaceView
        method={CastingMethod.SERIAL}
        trio={sampleTrio}
        dateTimeInfo={sampleDateTime}
        sixYaoResult={sampleSixYaoResult}
      />
    );

    // Kiểm tra tên 3 quẻ xuất hiện
    expect(screen.getAllByText(/Thủy Lôi Truân/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sơn Địa Bác/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Thủy Trạch Tiết/i).length).toBeGreaterThan(0);

    // Kiểm tra Bát Cung liên quan
    expect(screen.getAllByText(/HỌ KHẢM/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/HỌ CÀN/i)).toBeInTheDocument();
  });

  it('Yêu cầu 4: Bảng Lục Hào tổng hợp hiển thị đầy đủ Thế/Ứng, Nạp Giáp, Phục Thần, Tuần Không, Lục Thú', () => {
    const { container } = render(
      <DivinationWorkspaceView
        method={CastingMethod.SERIAL}
        trio={sampleTrio}
        dateTimeInfo={sampleDateTime}
        sixYaoResult={sampleSixYaoResult}
      />
    );

    // Kiểm tra tiêu đề bảng
    expect(
      screen.getByText(/BẢNG LỤC HÀO TỔNG HỢP CỔ PHÁP/i)
    ).toBeInTheDocument();

    // Bảng phải có 6 hàng dữ liệu tương ứng 6 hào
    const rows = container.querySelectorAll('.workspace-master-row');
    expect(rows.length).toBe(6);

    // Kiểm tra Phục Thần của quẻ Truân: tại hào 3 xuất hiện "Tài-Ngọ"
    expect(screen.getByText('Tài-Ngọ')).toBeInTheDocument();

    // Kiểm tra ký hiệu Tuần Không "K" cho hào Thân (Hào 4)
    const tkTags = container.querySelectorAll('.tag-tk');
    expect(tkTags.length).toBeGreaterThanOrEqual(1);

    // Kiểm tra Thế (màu đỏ) và Ứng
    expect(container.querySelectorAll('.tag-the-bold').length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll('.tag-ung-bold').length).toBeGreaterThanOrEqual(1);

    // Kiểm tra Lục Thú khởi theo can Mậu (Câu Trần, Đằng Xà, Chu Tước, Thanh Long...)
    expect(screen.getByText(/Đằng Xà/i)).toBeInTheDocument();
    expect(screen.getByText(/Thanh Long/i)).toBeInTheDocument();
  });

  it('Yêu cầu 5: Bảng phân tích bổ sung hiển thị 12 Trường Sinh, Lộc, Mã, Đào đúng cổ pháp', () => {
    const { container } = render(
      <DivinationWorkspaceView
        method={CastingMethod.SERIAL}
        trio={sampleTrio}
        dateTimeInfo={sampleDateTime}
        sixYaoResult={sampleSixYaoResult}
      />
    );

    // Kiểm tra tiêu đề bảng phân tích bổ sung
    expect(
      screen.getByText(/BẢNG PHÂN TÍCH BỔ SUNG/i)
    ).toBeInTheDocument();

    // 6 hàng phân tích bổ sung
    const suppRows = container.querySelectorAll('.workspace-supp-row');
    expect(suppRows.length).toBe(6);

    // Kiểm tra các cột tiêu đề bảng bổ sung
    expect(screen.getAllByText('TS.Ngày').length).toBe(2);
    expect(screen.getAllByText('TS.Tháng').length).toBe(2);
    expect(screen.getAllByText('Lộc').length).toBe(2);
    expect(screen.getAllByText('Mã').length).toBe(2);
    expect(screen.getAllByText('Đào').length).toBe(2);

    // Hào 4 (Thân Kim) có Dịch Mã ('M')
    expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(1);
  });

  it('Yêu cầu 6: Khu vực luận giải tập trung trên cùng một trang, không chia tab', () => {
    render(
      <DivinationWorkspaceView
        method={CastingMethod.SERIAL}
        trio={sampleTrio}
        dateTimeInfo={sampleDateTime}
        question="Dự án cuối năm có thuận buồm xuôi gió không?"
        inquiryType="work"
        sixYaoResult={sampleSixYaoResult}
      />
    );

    // Kiểm tra các phần luận giải chính
    expect(screen.getByText(/Tổng Quan Tượng Quẻ & Thoán Từ/i)).toBeInTheDocument();
    expect(screen.getByText(/Phân Tích Từng Hào & Hào Động/i)).toBeInTheDocument();
    expect(screen.getByText(/Tương Quan Sinh Khắc & Thế Ứng/i)).toBeInTheDocument();
    expect(screen.getByText(/Luận Giải Theo Câu Hỏi/i)).toBeInTheDocument();
    expect(screen.getByText(/Kết Luận & Khuyến Nghị Ứng Dụng/i)).toBeInTheDocument();

    // Kiểm tra cảnh báo khách quan (Disclaimer)
    expect(
      screen.getAllByText(/phân định rạch ròi giữa nguyên văn cổ điển/i).length
    ).toBeGreaterThan(0);
  });

  it('Hỗ trợ phương pháp Mai Hoa Dịch Số với đầy đủ thông số Thể / Dụng', () => {
    const maiHuaRes = castByMaiHua({
      yearBranch: 7, // Ngọ
      month: 9,
      day: 22,
      hourBranch: 6, // Tỵ
    });

    render(
      <DivinationWorkspaceView
        method={CastingMethod.MAI_HUA}
        trio={maiHuaRes.trio}
        dateTimeInfo={sampleDateTime}
        maiHuaResult={maiHuaRes}
      />
    );

    // Kiểm tra hiển thị phương pháp Mai Hoa
    expect(screen.getByText(/Gieo quẻ Mai Hoa/i)).toBeInTheDocument();

    // Kiểm tra khu vực Thể / Dụng
    expect(screen.getByText(/Phân Tích Thể \/ Dụng \(Mai Hoa Dịch Số\)/i)).toBeInTheDocument();
  });
});
