import React, { useEffect, useState } from 'react';
import { Card, Button } from '@kindich/shared';
import { getFullCalendarInfo, CalendarConversionResult } from '@kindich/calendar';
import { parseCanChiString, calculateVoidBranches } from '@kindich/core';
import { getDivinationRepository } from '../../services/repository.service';

export type DesktopNavScreen = 'home' | 'serial' | 'time' | 'six-yao' | 'history' | 'settings';

interface DesktopHomeViewProps {
  onNavigate: (screen: DesktopNavScreen) => void;
}

export const DesktopHomeView: React.FC<DesktopHomeViewProps> = ({ onNavigate }) => {
  const [calInfo, setCalInfo] = useState<CalendarConversionResult | null>(null);
  const [voidBranches, setVoidBranches] = useState<readonly string[]>([]);
  const [stats, setStats] = useState<{ total: number; serial: number; maiHua: number }>({
    total: 0,
    serial: 0,
    maiHua: 0,
  });

  useEffect(() => {
    // 1. Lấy thông tin lịch hiện tại
    const now = new Date();
    const info = getFullCalendarInfo(now.toISOString());
    setCalInfo(info);

    const { stem, branch } = parseCanChiString(info.canChi.day);
    const { voidBranches: vb } = calculateVoidBranches(stem, branch);
    setVoidBranches(vb);

    // 2. Tải thống kê từ Repository offline
    const loadStats = async () => {
      try {
        const repo = getDivinationRepository();
        const res = await repo.list(undefined, { page: 1, pageSize: 1000 });
        const serialCount = res.items.filter((item) => item.method === 'SERIAL').length;
        const maiHuaCount = res.items.filter((item) => item.method === 'MAI_HUA').length;
        setStats({
          total: res.totalCount,
          serial: serialCount,
          maiHua: maiHuaCount,
        });
      } catch (err) {
        console.error('Không thể tải thống kê lịch sử:', err);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="desktop-home-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner chào mừng phong cách Desktop */}
      <div
        style={{
          background: 'linear-gradient(135deg, #8B0000 0%, #5B0000 100%)',
          color: '#FAF6EE',
          padding: '28px 32px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(139, 0, 0, 0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>☯</span>
            <span style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.9 }}>
              Bắc Hà Tân An Phái
            </span>
          </div>
          <h1 style={{ color: '#FAF6EE', fontSize: '28px', margin: 0, fontFamily: 'var(--bha-font-serif)' }}>
            Kinh Dịch Lục Hào & Mai Hoa Dịch Số
          </h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.85, fontSize: '14px', maxWidth: '640px' }}>
            Hệ thống luận giải Dịch học chuẩn cổ pháp • Hoạt động 100% offline trên máy tính • Bảo toàn nguyên bản Kinh văn, Bát Cung, Nạp Giáp và Chu Hi hào từ.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '16px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            minWidth: '200px',
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Hệ thống Desktop</div>
          <div style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: '#D4AF37' }}>Tauri 2 Native</div>
          <div style={{ fontSize: '11px', opacity: 0.75 }}>Windows x64 • Cục bộ 100%</div>
        </div>
      </div>

      {/* Grid 2 cột: Bảng Thời thần hiện tại & Thống kê nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Bảng thời thần Can Chi */}
        <Card title="⏳ Thời Thần & Lịch Tiết Khí Hiện Tại">
          {calInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  background: 'var(--bha-bg-subtle, #fcf9f2)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--bha-border-subtle, #e8dfcf)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--bha-text-secondary)' }}>Năm Can Chi</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                    {calInfo.canChi.year}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--bha-text-secondary)' }}>Tháng (Nguyệt Kiến)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                    {calInfo.canChi.month}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--bha-text-secondary)' }}>Ngày (Nhật Thần)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                    {calInfo.canChi.day}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--bha-text-secondary)' }}>Giờ (Thời Thần)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bha-crimson-800)' }}>
                    {calInfo.canChi.hour}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '0 4px' }}>
                <div>
                  <span style={{ color: 'var(--bha-text-secondary)' }}>Tiết khí: </span>
                  <strong>{calInfo.solarTerm?.name || 'Không xác định'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--bha-text-secondary)' }}>Âm lịch: </span>
                  <strong>
                    Ngày {calInfo.lunar.day} tháng {calInfo.lunar.month} {calInfo.lunar.isLeap ? '(Nhuận)' : ''} năm {calInfo.lunar.year}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--bha-text-secondary)' }}>Tuần Không (Không Vong): </span>
                  <strong style={{ color: '#d32f2f' }}>
                    {voidBranches.length > 0 ? voidBranches.join(', ') : 'Không'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div>Đang tính toán thiên can địa chi...</div>
          )}
        </Card>

        {/* Thẻ thống kê */}
        <Card title="📊 Dữ Liệu Nghiệm Lý">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Tổng số lần lập quẻ:</span>
              <strong style={{ fontSize: '18px', color: 'var(--bha-crimson-700)' }}>{stats.total}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Quẻ Seri tiền (SERIAL):</span>
              <strong style={{ color: '#1565c0' }}>{stats.serial}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--bha-text-secondary)' }}>Quẻ Giờ động tâm (MAI_HUA):</span>
              <strong style={{ color: '#2e7d32' }}>{stats.maiHua}</strong>
            </div>
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--bha-border-subtle, #eee)', paddingTop: '10px' }}>
              <Button variant="secondary" size="sm" style={{ width: '100%' }} onClick={() => onNavigate('history')}>
                📜 Xem Sổ Nghiệm Lý & Ghi Chú
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Lối tắt chức năng nhanh (Quick Launch Grid 4 cột) */}
      <div>
        <h2 style={{ fontSize: '18px', marginBottom: '14px', fontFamily: 'var(--bha-font-serif)' }}>
          ⚡ Lối Tắt Chức Năng Nhanh
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div
            onClick={() => onNavigate('serial')}
            style={{
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid var(--bha-border-subtle, #e2d9cc)',
              background: 'var(--bha-bg-card, #fff)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bha-crimson-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bha-border-subtle, #e2d9cc)')}
          >
            <span style={{ fontSize: '28px' }}>🔢</span>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--bha-crimson-800)' }}>Lập Quẻ Seri Tiền</div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--bha-text-secondary)' }}>
              Nhập 4 chữ số cuối seri tiền theo thuật toán SERIAL-MOD8-V1 chuẩn tắc.
            </p>
          </div>

          <div
            onClick={() => onNavigate('time')}
            style={{
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid var(--bha-border-subtle, #e2d9cc)',
              background: 'var(--bha-bg-card, #fff)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bha-crimson-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bha-border-subtle, #e2d9cc)')}
          >
            <span style={{ fontSize: '28px' }}>⏳</span>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--bha-crimson-800)' }}>Giờ Động Tâm (Mai Hoa)</div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--bha-text-secondary)' }}>
              Lập quẻ theo thời điểm khởi niệm, quy đổi âm lịch & phân định Thể/Dụng.
            </p>
          </div>

          <div
            onClick={() => onNavigate('six-yao')}
            style={{
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid var(--bha-border-subtle, #e2d9cc)',
              background: 'var(--bha-bg-card, #fff)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bha-crimson-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bha-border-subtle, #e2d9cc)')}
          >
            <span style={{ fontSize: '28px' }}>☯</span>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--bha-crimson-800)' }}>Đồ Bản Lục Hào</div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--bha-text-secondary)' }}>
              Phân tích 64 quẻ, Bát Cung, Thế/Ứng, Lục Thân, Lục Thú, Vượng suy, Ám động.
            </p>
          </div>

          <div
            onClick={() => onNavigate('settings')}
            style={{
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid var(--bha-border-subtle, #e2d9cc)',
              background: 'var(--bha-bg-card, #fff)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--bha-crimson-600)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--bha-border-subtle, #e2d9cc)')}
          >
            <span style={{ fontSize: '28px' }}>💾</span>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--bha-crimson-800)' }}>Sao Lưu & Khôi Phục</div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--bha-text-secondary)' }}>
              Xuất/nhập file JSON toàn bộ lịch sử và ghi chú offline độc lập, an toàn.
            </p>
          </div>
        </div>
      </div>

      {/* Triết lý Dịch học & Nguyên tắc tông phái */}
      <Card title="📜 Tông Chỉ Bắc Hà Tân An Phái">
        <blockquote
          style={{
            margin: 0,
            padding: '12px 18px',
            borderLeft: '4px solid var(--bha-crimson-700)',
            fontStyle: 'italic',
            background: 'var(--bha-bg-subtle, #faf7f0)',
            borderRadius: '0 8px 8px 0',
          }}
        >
          &ldquo;Dịch hữu Thái cực, thị sinh Lưỡng nghi, Lưỡng nghi sinh Tứ tượng, Tứ tượng sinh Bát quái, Bát quái định cát hung, cát hung sinh đại nghiệp.&rdquo;
          <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '6px', fontStyle: 'normal' }}>
            — Hệ Từ Thượng, Chu Dịch
          </div>
        </blockquote>
        <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--bha-text-secondary)', lineHeight: 1.7 }}>
          Bắc Hà Tân An Phái đề cao nguyên tắc lập quẻ khi <strong>tâm có động niệm</strong>, lấy Đức vi bản, ứng xử theo lẽ biến dịch của trời đất. Mọi thuật toán trong hệ thống đều tuân thủ chặt chẽ phép Bốc Phệ Chính Tông, không tùy tiện suy diễn hoặc hư cấu kinh văn.
        </div>
      </Card>
    </div>
  );
};
