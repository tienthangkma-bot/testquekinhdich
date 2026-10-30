import React, { useState } from 'react';
import { Button, Card, Select, Modal } from '@kindich/shared';
import { SerialCastingResult } from '@kindich/core';
import { SerialCastingForm, SerialCastingResultView } from './components/SerialCasting';
import './App.css';

type CastingMode = 'serial' | 'time';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CastingMode>('serial');
  const [serialResult, setSerialResult] = useState<SerialCastingResult | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date().toISOString().slice(0, 16));
  const [inquiryType, setInquiryType] = useState('general');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const inquiryOptions = [
    { value: 'general', label: 'Chiêm việc đại thể (Việc chung)' },
    { value: 'career', label: 'Cầu công danh, sự nghiệp, thi cử' },
    { value: 'wealth', label: 'Cầu tài lộc, kinh doanh, buôn bán' },
    { value: 'family', label: 'Gia đạo, hôn nhân, tình duyên' },
    { value: 'health', label: 'Bệnh tật, sức khỏe, bình an' },
    { value: 'travel', label: 'Xuất hành, đi xa, mưu sự' },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-badge">
          <span>☯</span>
          <span>Bắc Hà Tân An Phái</span>
        </div>
        <h1 className="brand-title">Bắc Hà Tân An Phái</h1>
        <p className="brand-subtitle">
          Ứng dụng Kinh Dịch Lục Hào & Mai Hoa Dịch Số Toàn Diện • Chuẩn Cổ Pháp • Offline-First
        </p>
      </header>

      {/* Mode Switcher */}
      <nav className="mode-switcher" aria-label="Phương pháp lập quẻ">
        <button
          type="button"
          className={`mode-tab ${activeMode === 'serial' ? 'active' : ''}`}
          onClick={() => setActiveMode('serial')}
        >
          <span className="tab-icon">🔢</span>
          <span>Lập quẻ bằng seri tiền</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${activeMode === 'time' ? 'active' : ''}`}
          onClick={() => setActiveMode('time')}
        >
          <span className="tab-icon">⏳</span>
          <span>Giờ động tâm</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeMode === 'serial' ? (
          <div className="serial-mode-section">
            <Card
              title="Lập Quẻ Theo Số Seri Tiền (SERIAL-MOD8-V1)"
              subtitle="Thuật toán chuẩn vị trí lẻ thượng quái, chẵn hạ quái và tổng xác định hào động"
              borderVariant="gold"
              hoverable
              extra={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHelpModalOpen(true)}
                >
                  Quy tắc thuật toán
                </Button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SerialCastingForm
                  onCastSuccess={(result) => setSerialResult(result)}
                  onReset={() => setSerialResult(null)}
                />

                <Select
                  label="Mục đích chiêm đoán (Tùy chọn):"
                  options={inquiryOptions}
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  helperText="Mục đích chiêm đoán làm căn cứ định Dụng Thần khi phân tích Lục Hào"
                  fullWidth
                />
              </div>

              {/* Khu vực hiển thị kết quả hoặc thông báo chờ */}
              <div style={{ marginTop: '28px' }}>
                {serialResult ? (
                  <SerialCastingResultView result={serialResult} />
                ) : (
                  <div className="placeholder-box">
                    <div className="placeholder-icon">☯</div>
                    <h4 className="placeholder-text">Chưa khởi quẻ</h4>
                    <p className="placeholder-sub">
                      Vui lòng nhập số seri tiền ở trên (tối thiểu 2 chữ số) và bấm{' '}
                      <strong>"Lập quẻ"</strong> để xem đồ hình Quẻ Chủ, Quẻ Biến và Quẻ Hỗ.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card
            title="Lập Quẻ Theo Giờ Động Tâm (Mai Hoa Dịch Số)"
            subtitle="Phương pháp khởi quẻ căn cứ theo thời khắc khởi tâm, phối hợp Can Chi và Lịch Âm"
            borderVariant="gold"
            hoverable
            extra={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHelpModalOpen(true)}
              >
                Quy tắc Mai Hoa
              </Button>
            }
          >
            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bha-text-primary)' }}>
                  Thời điểm khởi tâm chiêm nghiệm:
                </label>
                <input
                  type="datetime-local"
                  className="bha-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                  Mặc định thời khắc hiện tại. Hệ thống sẽ tự quy đổi Can Chi và Lịch Âm khi phân tích.
                </span>
              </div>

              <Select
                label="Mục đích chiêm đoán:"
                options={inquiryOptions}
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                helperText="Giúp xác định tương quan Thể - Dụng trong Mai Hoa và Dụng Thần trong Lục Hào"
                fullWidth
              />

              <div className="form-actions">
                <Button variant="gold" size="lg" type="submit">
                  Khởi quẻ giờ động tâm
                </Button>
              </div>
            </form>

            <div style={{ marginTop: '24px' }}>
              <div className="placeholder-box">
                <div className="placeholder-icon">⌛</div>
                <h4 className="placeholder-text">Phương pháp Mai Hoa Dịch Số</h4>
                <p className="placeholder-sub">
                  (Module Giờ Động Tâm & Gói Lịch Âm Dương sẽ được tích hợp ở nhiệm vụ tiếp theo)
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Feature Grid: Architecture Overview */}
        <Card
          title="Hệ Thống Phân Tích Lục Hào Toàn Diện"
          subtitle="Tập hợp đầy đủ các đồ hình và quy tắc cổ pháp chính truyền"
          padding="lg"
        >
          <div className="feature-grid">
            <Card padding="sm" borderVariant="default" hoverable>
              <div className="feature-icon-badge">I</div>
              <h4
                style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--bha-crimson-700)' }}
              >
                Bát Cung & Thế Ứng
              </h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--bha-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                Phân bổ 64 quẻ vào 8 cung Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài. Định vị chuẩn
                xác hào Thế và hào Ứng.
              </p>
            </Card>

            <Card padding="sm" borderVariant="default" hoverable>
              <div className="feature-icon-badge">II</div>
              <h4
                style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--bha-crimson-700)' }}
              >
                Nạp Giáp & Lục Thân
              </h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--bha-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                An Can Chi cho từng hào, phối Ngũ Hành bản mệnh và lập 5 mối quan hệ Lục Thân (Phụ
                Mẫu, Huynh Đệ, Tử Tôn, Thê Tài, Quan Quỷ).
              </p>
            </Card>

            <Card padding="sm" borderVariant="default" hoverable>
              <div className="feature-icon-badge">III</div>
              <h4
                style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--bha-crimson-700)' }}
              >
                Nhật Nguyệt Vượng Suy
              </h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--bha-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                Đối soát sinh khắc với Nhật Thần, Nguyệt Kiến, xét Tuần Không, Nguyệt Phá, Ám Động,
                Tam Hợp, Lục Xung.
              </p>
            </Card>

            <Card padding="sm" borderVariant="default" hoverable>
              <div className="feature-icon-badge">IV</div>
              <h4
                style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--bha-crimson-700)' }}
              >
                Lục Thú Hộ Trì
              </h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--bha-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                Khởi Thanh Long, Chu Tước, Câu Trần, Đằng Xà, Bạch Hổ, Huyền Vũ dựa theo Can của
                ngày khởi quẻ.
              </p>
            </Card>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p style={{ marginBottom: '8px' }}>
          <span className="status-tag">
            <span className="status-dot"></span>
            Offline-First Sẵn Sàng (Không cần Internet)
          </span>
          {' • '}Hệ thống Bắc Hà Tân An Phái Monorepo
        </p>
        <p>Bản quyền © 2026 Bắc Hà Tân An Phái • Phiên bản 0.1.0 (Core Engine Connected)</p>
      </footer>

      {/* Modal: Quy tắc thuật toán */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title={
          activeMode === 'serial'
            ? 'Quy Tắc Lập Quẻ Seri Tiền (SERIAL-MOD8-V1)'
            : 'Quy Tắc Mai Hoa Dịch Số'
        }
        size="md"
        footer={
          <Button variant="primary" onClick={() => setIsHelpModalOpen(false)}>
            Đã hiểu
          </Button>
        }
      >
        {activeMode === 'serial' ? (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9375rem' }}
          >
            <p>
              <strong>Thuật toán SERIAL-MOD8-V1</strong> được thiết kế theo đúng nguyên tắc âm dương
              phối hợp:
            </p>
            <ul
              style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <li>
                <strong>Thượng quái (Quẻ trên):</strong> Cộng tất cả chữ số ở các vị trí lẻ (vị trí
                1, 3, 5, 7...), lấy tổng chia cho 8 lấy số dư (dư 0 tính là 8 - quẻ Khôn).
              </li>
              <li>
                <strong>Hạ quái (Quẻ dưới):</strong> Cộng tất cả chữ số ở các vị trí chẵn (vị trí 2,
                4, 6, 8...), lấy tổng chia cho 8 lấy số dư (dư 0 tính là 8 - quẻ Khôn).
              </li>
              <li>
                <strong>Hào động:</strong> Cộng toàn bộ chữ số trong chuỗi seri, lấy tổng chia cho 6
                lấy số dư (dư 0 tính là hào 6 động).
              </li>
            </ul>
            <p style={{ color: 'var(--bha-text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              * Ghi chú: Dữ liệu tính toán chạy trực tiếp trên máy của bạn (offline), đảm bảo tính
              bảo mật và độc lập hoàn toàn.
            </p>
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9375rem' }}
          >
            <p>
              <strong>Phương pháp Mai Hoa Dịch Số</strong> căn cứ trên số lý thời gian theo truyền
              thống Thiệu Ung:
            </p>
            <ul
              style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <li>
                <strong>Thượng quái:</strong> (Địa chi năm + Tháng âm lịch + Ngày âm lịch) mod 8.
              </li>
              <li>
                <strong>Hạ quái:</strong> (Địa chi năm + Tháng âm lịch + Ngày âm lịch + Địa chi giờ)
                mod 8.
              </li>
              <li>
                <strong>Hào động:</strong> (Địa chi năm + Tháng âm lịch + Ngày âm lịch + Địa chi
                giờ) mod 6.
              </li>
            </ul>
            <p style={{ color: 'var(--bha-text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              * Can Chi của năm, tháng, ngày, giờ được tính toán chuẩn theo Tiết Khí thiên văn học
              phương Đông.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
