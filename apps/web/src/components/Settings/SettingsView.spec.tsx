import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from './SettingsView';
import { SETTINGS_STORAGE_KEY } from '@kindich/database';
import { setDivinationRepository } from '../../services/repository.service';

describe('SettingsView Component (apps/web)', () => {
  beforeEach(() => {
    localStorage.clear();
    setDivinationRepository({
      list: async () => ({
        items: [
          { id: 'div-1', noteCount: 2 } as any,
          { id: 'div-2', noteCount: 1 } as any,
        ],
        totalCount: 2,
        page: 1,
        pageSize: 5000,
        totalPages: 1,
      }),
      delete: async () => {},
    } as any);
  });

  it('hiển thị đầy đủ 5 khu vực cài đặt chính', async () => {
    render(<SettingsView />);

    expect(screen.getByText(/1\. Cài Đặt Giao Diện/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Cài Đặt Lập Quẻ/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Cài Đặt Lịch Pháp/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Quản Lý Dữ Liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Khôi Phục Cài Đặt Gốc/i)).toBeInTheDocument();

    // Kiểm tra hiển thị thống kê dung lượng
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 quẻ
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 ghi chú (2 + 1)
    });
  });

  it('cho phép thay đổi cài đặt giao diện (Theme & Cỡ chữ) và lưu vào localStorage', async () => {
    render(<SettingsView />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('☀️ Sáng (Mặc định Cổ điển)')).toBeInTheDocument();
    });

    const themeSelect = screen.getByDisplayValue('☀️ Sáng (Mặc định Cổ điển)');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    await waitFor(() => {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.appearance.theme).toBe('dark');
    });
  });

  it('cho phép thay đổi phương pháp lập quẻ mặc định', async () => {
    render(<SettingsView />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('💵 Seri Tiền Polymer (SERIAL-MOD8-V1)')).toBeInTheDocument();
    });

    const methodSelect = screen.getByDisplayValue('💵 Seri Tiền Polymer (SERIAL-MOD8-V1)');
    fireEvent.change(methodSelect, { target: { value: 'time' } });

    await waitFor(() => {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.divination.defaultMethod).toBe('time');
    });
  });

  it('khôi phục cài đặt gốc khi người dùng nhấn nút Reset', async () => {
    window.confirm = vi.fn().mockReturnValue(true);

    // Lưu trước theme = dark
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        appearance: { theme: 'dark', language: 'en', fontSize: 'large' },
        divination: { defaultMethod: 'six-yao', ruleSetId: 'BO_PHE_CHINH_TONG_V1', algorithmVersion: 'V1' },
        calendar: { timeZone: 'UTC', dayTransitionRule: '00:00', leapMonthRule: 'TRUYEN_THONG' },
      })
    );

    render(<SettingsView />);

    const resetBtn = screen.getByText('Khôi Phục Cài Đặt Mặc Định (Reset to Defaults)');
    fireEvent.click(resetBtn);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.appearance.theme).toBe('light');
      expect(parsed.appearance.fontSize).toBe('medium');
      expect(parsed.divination.defaultMethod).toBe('serial');
    });
  });
});
