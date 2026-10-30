import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HexagramInterpretationView } from './HexagramInterpretationView';
import {
  castByDateTime,
} from '@kindich/core';
import { getHexagramById } from '@kindich/domain';

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('HexagramInterpretationView Component', () => {
  // Chuẩn bị dữ liệu quẻ mẫu đã được xác minh: Quẻ 1 (Thuần Càn) động hào 1 -> biến Quẻ 44 (Thiên Phong Cấu)
  const hex1 = getHexagramById(1)!;
  const hex44 = getHexagramById(44)!;
  const verifiedTrioWithMovingLine = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1 as const],
    hasMovingLines: true,
  };

  // Quẻ tĩnh: Quẻ 1 (Thuần Càn) không hào động
  const staticTrio = {
    primary: hex1,
    transformed: hex1,
    nuclear: hex1,
    movingLineIndices: [] as const,
    hasMovingLines: false,
  };

  // Quẻ chưa có kinh văn xác thực: Quẻ 3 (Thủy Lôi Truân)
  const hex3 = getHexagramById(3)!;
  const unverifiedTrio = {
    primary: hex3,
    transformed: hex3,
    nuclear: hex1,
    movingLineIndices: [] as const,
    hasMovingLines: false,
  };

  it('Yêu cầu 1 & 2: Hiển thị khu vực "Luận giải quẻ" với đầy đủ 4 tab chức năng', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} />);

    // 1. Kiểm tra tiêu đề và phiên bản Engine
    expect(screen.getByTestId('hexagram-interpretation-view')).toBeInTheDocument();
    expect(screen.getByText('Luận Giải Quẻ Toàn Diện')).toBeInTheDocument();
    expect(screen.getByText(/INTERPRETATION-ENGINE-V1/i)).toBeInTheDocument();

    // 2. Kiểm tra đủ 4 tab điều hướng
    expect(screen.getByRole('button', { name: /Tổng quan quẻ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kinh văn cổ điển/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Phân tích Mai Hoa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Phân tích Lục Hào/i })).toBeInTheDocument();
  });

  it('Yêu cầu 2: Cho phép chuyển đổi linh hoạt giữa các tab', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} />);

    // Mặc định ở tab Tổng quan quẻ
    expect(screen.getByTestId('interpretation-tab-overview')).toBeInTheDocument();

    // Chuyển sang tab Kinh văn cổ điển
    fireEvent.click(screen.getByRole('button', { name: /Kinh văn cổ điển/i }));
    expect(screen.getByTestId('interpretation-tab-classical')).toBeInTheDocument();

    // Chuyển sang tab Phân tích Mai Hoa
    fireEvent.click(screen.getByRole('button', { name: /Phân tích Mai Hoa/i }));
    expect(screen.getByTestId('interpretation-tab-mai-hua')).toBeInTheDocument();

    // Chuyển sang tab Phân tích Lục Hào
    fireEvent.click(screen.getByRole('button', { name: /Phân tích Lục Hào/i }));
    expect(screen.getByTestId('interpretation-tab-six-yao')).toBeInTheDocument();
  });

  it('Yêu cầu 4 & 5: Tab "Tổng quan quẻ" hiển thị quy tắc Chu Hi, phân biệt nhãn nội dung và có liên kết hào động', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} />);

    // Quy tắc Chu Hi cho 1 hào động
    expect(screen.getByText(/Có 1 hào động: Lấy Hào từ của chính hào động quẻ Chủ làm căn cứ chủ đạo/i)).toBeInTheDocument();
    expect(screen.getByText(/Toàn bộ năng lượng biến hóa tập trung tại hào động này/i)).toBeInTheDocument();

    // Phân loại nhãn nội dung (Requirement 4)
    expect(screen.getByText(/GIẢI NGHĨA HIỆN ĐẠI/i)).toBeInTheDocument();
    expect(screen.getByText(/PHÂN TÍCH KỸ THUẬT/i)).toBeInTheDocument();

    // Liên kết từng hào động (Requirement 5)
    const jumpBtn = screen.getByRole('button', { name: /Xem Hào 1 Động/i });
    expect(jumpBtn).toBeInTheDocument();

    // Nhấn nút liên kết hào động -> tự động chuyển sang tab Kinh văn cổ điển và chọn Hào 1
    fireEvent.click(jumpBtn);
    expect(screen.getByTestId('interpretation-tab-classical')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-1')).toBeInTheDocument();
  });

  it('Hiển thị quy tắc Chu Hi cho quẻ Tĩnh (0 hào động)', () => {
    render(<HexagramInterpretationView trio={staticTrio} />);

    expect(screen.getByText(/Quẻ Tĩnh \(0 hào động\): Lấy Thoán từ của Quẻ Chủ làm gốc chiêm đoán/i)).toBeInTheDocument();
    expect(screen.getByText(/Sự việc giữ nguyên trạng thái ổn định/i)).toBeInTheDocument();
    expect(screen.getByText(/Quẻ Tĩnh \(Không có hào động\)/i)).toBeInTheDocument();
  });

  it('Yêu cầu 3 & 4: Tab "Kinh văn cổ điển" hiển thị Thoán từ, Đại Tượng, Tiểu Tượng, Hào từ và phân biệt nguyên văn, giải nghĩa', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} initialTab="classical" />);

    // 1. Thoán từ
    const thuanTuCard = screen.getByTestId('classical-thuan-tu-card');
    expect(thuanTuCard).toBeInTheDocument();
    expect(thuanTuCard).toHaveTextContent('乾：元亨利貞。'); // Hán tự nguyên tác
    expect(thuanTuCard).toHaveTextContent('Càn: Nguyên, hanh, lợi, trinh.'); // Phiên âm
    expect(thuanTuCard).toHaveTextContent('Rất hanh thông, ích lợi, chính bền.'); // Dịch nghĩa
    expect(thuanTuCard).toHaveTextContent('Càn là sức mạnh sáng tạo nguyên thủy của Trời'); // Giải nghĩa hiện đại

    // 2. Đại Tượng truyện
    const daiTuongCard = screen.getByTestId('classical-dai-tuong-card');
    expect(daiTuongCard).toBeInTheDocument();
    expect(daiTuongCard).toHaveTextContent('天行健，君子以自強不息。');
    expect(daiTuongCard).toHaveTextContent('Thiên hành kiện, quân tử dĩ tự cường bất tức.');
    expect(daiTuongCard).toHaveTextContent('Trời vận hành mạnh mẽ, người quân tử noi theo đó mà tự cường không ngừng nghỉ.');

    // 3. Hào từ và Tiểu Tượng của Hào 1 (Sơ Cửu)
    const line1Card = screen.getByTestId('classical-line-1');
    expect(line1Card).toBeInTheDocument();
    expect(line1Card).toHaveTextContent('Sơ Cửu');
    expect(line1Card).toHaveTextContent('HÀO ĐỘNG'); // Badge hào động
    expect(line1Card).toHaveTextContent('潛龍勿用。'); // Hào từ Hán tự
    expect(line1Card).toHaveTextContent('Tiềm long vật dụng.'); // Hào từ phiên âm
    expect(line1Card).toHaveTextContent('Rồng còn ẩn náu dưới vực sâu, chớ nên hành động vội.'); // Hào từ dịch nghĩa
    expect(line1Card).toHaveTextContent('潛龍勿用，陽在下也。'); // Tiểu Tượng Hán tự
    expect(line1Card).toHaveTextContent('Tiềm long vật dụng, dương tại hạ dã.'); // Tiểu Tượng phiên âm
    expect(line1Card).toHaveTextContent('Rồng ẩn chớ dùng, là vì khí dương còn đang ở dưới đáy.'); // Tiểu Tượng dịch nghĩa

    // 4. Phân biệt rõ nhãn "NGUYÊN VĂN CỔ ĐIỂN" và "GIẢI NGHĨA HIỆN ĐẠI"
    expect(screen.getAllByText(/NGUYÊN VĂN CỔ ĐIỂN/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/GIẢI NGHĨA HIỆN ĐẠI/i).length).toBeGreaterThan(0);
  });

  it('Yêu cầu 5: Bộ lọc Hào từ cho phép chuyển đổi giữa "Chỉ hào động" và "Toàn bộ 6 hào"', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} initialTab="classical" />);

    // Mặc định đang ưu tiên hiện hào động (Hào 1)
    expect(screen.getByTestId('classical-line-1')).toBeInTheDocument();
    expect(screen.queryByTestId('classical-line-2')).not.toBeInTheDocument();

    // Bấm nút "Toàn bộ 6 hào"
    const allLinesBtn = screen.getByRole('button', { name: /Toàn bộ 6 hào/i });
    fireEvent.click(allLinesBtn);

    // Cả 6 hào đều được hiển thị
    expect(screen.getByTestId('classical-line-1')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-2')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-3')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-4')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-5')).toBeInTheDocument();
    expect(screen.getByTestId('classical-line-6')).toBeInTheDocument();

    // Bấm nút "Hào 2" để xem riêng Hào 2
    const line2Btn = screen.getByRole('button', { name: /^Hào 2/i });
    fireEvent.click(line2Btn);
    expect(screen.queryByTestId('classical-line-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('classical-line-2')).toBeInTheDocument();
  });

  it('Yêu cầu 6: Hiển thị nguồn tham khảo và phiên bản dữ liệu minh bạch', () => {
    render(<HexagramInterpretationView trio={verifiedTrioWithMovingLine} initialTab="classical" />);

    expect(screen.getAllByText(/Chu Dịch Thập Dực/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CLASSICAL-ZHOUYI-V1/i).length).toBeGreaterThan(0);
  });

  it('Yêu cầu 7: Không tự tạo nội dung khi chưa có dữ liệu xác thực (Quẻ chưa kiểm chứng)', () => {
    render(<HexagramInterpretationView trio={unverifiedTrio} initialTab="classical" />);

    // Kiểm tra có cảnh báo thiếu dữ liệu theo đúng Requirement 7
    const alert = screen.getByTestId('missing-classical-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Kho Văn Bản Cổ Điển Chưa Có Dữ Liệu Xác Thực/i);
    expect(alert).toHaveTextContent(/Chưa có dữ liệu nguyên văn cổ điển đã kiểm chứng/i);
    expect(alert).toHaveTextContent(/tuyệt đối không tự động tạo sinh/i);

    // Không render component Thoán từ giả mạo
    expect(screen.queryByTestId('classical-thuan-tu-card')).not.toBeInTheDocument();
  });

  it('Phân tích Mai Hoa: Hiển thị tương quan Thể/Dụng, cát hung và lời khuyên khi có dữ liệu Mai Hoa', () => {
    // Tạo kết quả Mai Hoa thực tế: 2026-10-31 10:00 (Năm Bính Ngọ, tháng 9 âm, ngày 21 âm, giờ Tỵ)
    const maiHuaResult = castByDateTime('2026-10-31T10:00:00.000Z');

    render(
      <HexagramInterpretationView
        trio={maiHuaResult.trio}
        maiHuaResult={maiHuaResult}
        initialTab="mai-hua"
      />
    );

    expect(screen.getByTestId('interpretation-tab-mai-hua')).toBeInTheDocument();
    expect(screen.getByText(/Luận Giải Thể • Dụng \(Mai Hoa Cổ Pháp\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/THỂ QUÁI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DỤNG QUÁI/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/LỜI KHUYÊN HÀNH XỬ THỰC TIỄN/i)).toBeInTheDocument();
    expect(screen.getByText(/Mai Hoa Dịch Số \(Thiệu Ung/i)).toBeInTheDocument();
  });

  it('Phân tích Lục Hào: Hiển thị Thế Ứng, Bảng Lục Thân và tác động Nhật Nguyệt', () => {
    render(
      <HexagramInterpretationView
        trio={verifiedTrioWithMovingLine}
        initialTab="six-yao"
        dateTime={{
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Mậu Thìn',
        }}
      />
    );

    expect(screen.getByTestId('interpretation-tab-six-yao')).toBeInTheDocument();
    expect(screen.getByText(/Phân Tích Thế Ứng Cổ Pháp \(Bốc Phệ Chính Tông\)/i)).toBeInTheDocument();
    expect(screen.getByText(/HÀO THẾ \(Bản thân \/ Chủ thể\)/i)).toBeInTheDocument();
    expect(screen.getByText(/HÀO ỨNG \(Đối tượng \/ Khách thể\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Bảng Lục Thân & Định Vị Dụng Thần \(Tăng San Bốc Dịch\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tác Động Nhật Thần, Nguyệt Kiến & Vượng Suy/i)).toBeInTheDocument();
  });
});
