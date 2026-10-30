import React, { useState } from 'react';
import './App.css';

type CastingMode = 'serial' | 'time';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CastingMode>('serial');
  const [serialInput, setSerialInput] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date().toISOString().slice(0, 16));

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
          Ứng dụng lập và phân tích quẻ Kinh Dịch, Mai Hoa Dịch Số & Lục Hào toàn diện
          (Offline-First)
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
          <section className="card" aria-labelledby="serial-title">
            <h2 id="serial-title" className="card-title">
              <span>💵</span> Lập quẻ theo số seri tiền (SERIAL-MOD8-V1)
            </h2>
            <p className="card-desc">
              Thuật toán sử dụng các chữ số ở vị trí lẻ để tính thượng quái, vị trí chẵn để tính hạ
              quái, và tổng tất cả chữ số để xác định hào động.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div className="form-group">
                <label htmlFor="serialNumber" className="form-label">
                  Dãy số seri tờ tiền:
                </label>
                <input
                  id="serialNumber"
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: 19864205"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                />
                <span className="form-help">
                  Chỉ nhập các ký số tự nhiên từ tờ tiền lưu hành (tối thiểu 4 chữ số).
                </span>
              </div>

              <button type="submit" className="btn-primary">
                <span>Khởi quẻ theo số seri</span>
              </button>
            </form>

            <div style={{ marginTop: '24px' }}>
              <div className="placeholder-box">
                <div className="placeholder-icon">☯</div>
                <p className="placeholder-text">Khu vực hiển thị Quẻ Chủ, Quẻ Biến và Quẻ Hỗ</p>
                <p className="placeholder-sub">
                  (Mô hình giao diện sẵn sàng — Đang chờ kích hoạt Core Engine ở Sprint kế tiếp)
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="card" aria-labelledby="time-title">
            <h2 id="time-title" className="card-title">
              <span>⏱️</span> Lập quẻ theo giờ động tâm (Mai Hoa Dịch Số)
            </h2>
            <p className="card-desc">
              Phương pháp khởi quẻ dựa trên năm, tháng, ngày, giờ âm lịch tại thời điểm khởi tâm để
              tìm Thượng quái, Hạ quái và Hào biến.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div className="form-group">
                <label htmlFor="datetimeInput" className="form-label">
                  Thời điểm khởi tâm:
                </label>
                <input
                  id="datetimeInput"
                  type="datetime-local"
                  className="form-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
                <span className="form-help">
                  Mặc định là thời gian thực tế, hệ thống sẽ tự động đối soát sang Can Chi và Lịch
                  Âm.
                </span>
              </div>

              <button type="submit" className="btn-primary">
                <span>Khởi quẻ theo giờ động tâm</span>
              </button>
            </form>

            <div style={{ marginTop: '24px' }}>
              <div className="placeholder-box">
                <div className="placeholder-icon">⌛</div>
                <p className="placeholder-text">Khu vực hiển thị Quẻ Chủ, Quẻ Biến và Quẻ Hỗ</p>
                <p className="placeholder-sub">
                  (Mô hình giao diện sẵn sàng — Đang chờ kích hoạt Core Engine ở Sprint kế tiếp)
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Feature Grid: Architecture Overview */}
        <section className="card">
          <h2 className="card-title">
            <span>🛡️</span> Kiến trúc Lục Hào & Tính năng cốt lõi
          </h2>
          <div className="feature-grid">
            <div className="feature-item">
              <h3 className="feature-title">Bát Cung & Thế Ứng</h3>
              <p className="feature-desc">
                Xác định chính xác cung vị quẻ (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài) và hào
                Thế/Ứng theo chuẩn Dịch học cổ truyền.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Nạp Giáp & Ngũ Hành</h3>
              <p className="feature-desc">
                Tự động an Can Chi cho 6 hào, phân bố Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ) và Lục
                Thân (Phụ mẫu, Huynh đệ, Tử tôn, Thê tài, Quan quỷ).
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Nhật Thần & Nguyệt Kiến</h3>
              <p className="feature-desc">
                Xét sự vượng suy, tuần không, nguyệt phá, ám động, quan hệ tương sinh, tương khắc,
                tam hợp, lục hợp, lục xung.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-title">Offline-First Engine</h3>
              <p className="feature-desc">
                Toàn bộ dữ liệu Bát Quái, Lục Thập Hoa Giáp và thuật toán tính toán 100% cục bộ,
                không cần kết nối mạng.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p style={{ marginBottom: '6px' }}>
          <span className="status-tag">
            <span className="status-dot"></span>
            Chế độ Offline khả dụng
          </span>
          {' • '}Bắc Hà Tân An Phái Monorepo (TypeScript)
        </p>
        <p>Phiên bản 0.1.0 • Web App (React + Vite)</p>
      </footer>
    </div>
  );
};

export default App;
