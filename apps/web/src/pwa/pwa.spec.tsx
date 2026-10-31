import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { useNetworkStatus } from './useNetworkStatus';
import { usePwaInstall } from './usePwaInstall';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { PwaInstallGuideModal } from './PwaInstallGuideModal';
import { PwaHeaderActions } from './PwaHeaderActions';
import { registerServiceWorker, unregisterServiceWorker } from './registerServiceWorker';

describe('PWA Module (apps/web)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });
  // =========================================================================
  // 1. Cấu hình Web App Manifest (Requirement 1)
  // =========================================================================
  describe('Cấu hình Web App Manifest & Header Meta Tags (Requirement 1)', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest');
    const htmlPath = path.resolve(__dirname, '../../index.html');

    it('tệp manifest.webmanifest tồn tại và có định dạng JSON chuẩn PWA', () => {
      expect(fs.existsSync(manifestPath)).toBe(true);

      const content = fs.readFileSync(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);

      // Tên ứng dụng và định danh
      expect(manifest.id).toBe('/');
      expect(manifest.name).toContain('Bắc Hà Tân An Phái');
      expect(manifest.short_name).toBe('Kinh Dịch');
      expect(manifest.start_url).toBe('/');
      expect(manifest.scope).toBe('/');

      // Cấu hình hiển thị độc lập như Native App
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#8B0000');
      expect(manifest.background_color).toBe('#1A1A1A');
      expect(manifest.lang).toBe('vi');

      // Kiểm tra danh sách icons có tối thiểu 192x192, 512x512 và maskable
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

      const has192 = manifest.icons.some(
        (icon: { sizes: string }) => icon.sizes === '192x192'
      );
      const has512 = manifest.icons.some(
        (icon: { sizes: string }) => icon.sizes === '512x512'
      );
      const hasMaskable = manifest.icons.some(
        (icon: { purpose?: string }) => icon.purpose === 'maskable'
      );

      expect(has192).toBe(true);
      expect(has512).toBe(true);
      expect(hasMaskable).toBe(true);
    });

    it('index.html có đầy đủ các thẻ meta PWA, link manifest và apple-touch-icon', () => {
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

      expect(htmlContent).toContain('<link rel="manifest" href="/manifest.webmanifest"');
      expect(htmlContent).toContain('<meta name="theme-color" content="#8B0000"');
      expect(htmlContent).toContain('<meta name="apple-mobile-web-app-capable" content="yes"');
      expect(htmlContent).toContain('<link rel="apple-touch-icon" href="/icons/icon-192.svg"');
    });

    it('tệp icon SVG tồn tại trong thư mục public/icons', () => {
      const icon192 = path.resolve(__dirname, '../../public/icons/icon-192.svg');
      const icon512 = path.resolve(__dirname, '../../public/icons/icon-512.svg');
      const iconMask = path.resolve(__dirname, '../../public/icons/icon-maskable.svg');

      expect(fs.existsSync(icon192)).toBe(true);
      expect(fs.existsSync(icon512)).toBe(true);
      expect(fs.existsSync(iconMask)).toBe(true);
    });
  });

  // =========================================================================
  // 2. Kiểm tra Service Worker & Chiến lược Cache An Toàn (Requirement 2 & 7)
  // =========================================================================
  describe('Service Worker & Bảo Mật Dữ Liệu Cá Nhân (Requirement 2 & 7)', () => {
    const swPath = path.resolve(__dirname, '../../public/sw.js');

    it('tệp Service Worker sw.js tồn tại và cấu hình App Shell precache', () => {
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, 'utf-8');

      // Có phiên bản cache name
      expect(swContent).toContain('kindich-pwa-');
      // Precache app shell
      expect(swContent).toContain('/index.html');
      expect(swContent).toContain('/manifest.webmanifest');
      expect(swContent).toContain('addEventListener(\'install\'');
      expect(swContent).toContain('addEventListener(\'activate\'');
      expect(swContent).toContain('addEventListener(\'fetch\'');
    });

    it('Service Worker TUYỆT ĐỐI KHÔNG cache các request phi-GET hoặc dữ liệu ngoài domain (Requirement 7)', () => {
      const swContent = fs.readFileSync(swPath, 'utf-8');

      // Kiểm tra bộ lọc phương thức: chỉ cho phép GET
      expect(swContent).toContain("request.method !== 'GET'");

      // Kiểm tra bộ lọc cùng origin
      expect(swContent).toContain('url.origin !== self.location.origin');
    });

    it('hàm registerServiceWorker xử lý an toàn trong môi trường test/node', async () => {
      const onInstalled = vi.fn();
      const res = await registerServiceWorker({ onInstalled });
      // Trong môi trường jsdom chưa cấu hình serviceWorker giả lập đầy đủ, hàm trả về null an toàn không crash
      expect(res === null || typeof res === 'object').toBe(true);

      const unregisterRes = await unregisterServiceWorker();
      expect(typeof unregisterRes).toBe('boolean');
    });
  });

  // =========================================================================
  // 3. Trạng thái Online / Offline (Requirement 5)
  // =========================================================================
  describe('Trạng thái Online / Offline (Requirement 5)', () => {
    it('useNetworkStatus phản hồi chính xác khi mất mạng và có mạng trở lại', () => {
      const { result } = renderHook(() => useNetworkStatus());

      // Mặc định ban đầu
      expect(result.current.isOnline).toBe(true);
      expect(result.current.wasOffline).toBe(false);

      // Kích hoạt sự kiện mất mạng (offline)
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.wasOffline).toBe(true);

      // Kích hoạt sự kiện có mạng lại (online)
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.wasOffline).toBe(true);
    });

    it('NetworkStatusIndicator hiển thị nhãn và mở modal thông tin khi bấm', () => {
      render(<NetworkStatusIndicator />);

      const indicator = screen.getByTestId('network-status-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveTextContent(/Trực tuyến/i);

      // Bấm vào indicator để mở modal giải thích
      fireEvent.click(indicator);

      expect(screen.getByText(/Trạng Thái Kết Nối/i)).toBeInTheDocument();
      expect(screen.getByText(/Đã hiểu/i)).toBeInTheDocument();
    });

    it('NetworkStatusIndicator hiển thị ngoại tuyến khi window phát sự kiện offline', () => {
      render(<NetworkStatusIndicator />);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      const indicator = screen.getByTestId('network-status-indicator');
      expect(indicator).toHaveTextContent(/Ngoại tuyến/i);
      expect(indicator).toHaveClass('network-status-pill--offline');
    });
  });

  // =========================================================================
  // 4. Hướng dẫn Cài Đặt Lên Màn Hình Chính (Requirement 6)
  // =========================================================================
  describe('Hướng dẫn Cài Đặt PWA (Requirement 6)', () => {
    it('usePwaInstall lắng nghe sự kiện beforeinstallprompt và kích hoạt prompt()', async () => {
      const { result } = renderHook(() => usePwaInstall());

      expect(result.current.canInstall).toBe(false);

      // Giả lập sự kiện beforeinstallprompt của trình duyệt
      const promptMock = vi.fn().mockResolvedValue(undefined);
      const fakeEvent = new Event('beforeinstallprompt') as any;
      fakeEvent.prompt = promptMock;
      fakeEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

      act(() => {
        window.dispatchEvent(fakeEvent);
      });

      expect(result.current.canInstall).toBe(true);

      // Thử gọi installApp
      let outcome = false;
      await act(async () => {
        outcome = await result.current.installApp();
      });

      expect(promptMock).toHaveBeenCalled();
      expect(outcome).toBe(true);
      expect(result.current.isInstalled).toBe(true);
    });

    it('PwaInstallGuideModal hiển thị hướng dẫn chi tiết cho 3 nền tảng: Android, iOS, Desktop', () => {
      render(<PwaInstallGuideModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId('pwa-install-guide')).toBeInTheDocument();

      // Kiểm tra 3 tab nền tảng
      const androidTab = screen.getByTestId('pwa-tab-android');
      const iosTab = screen.getByTestId('pwa-tab-ios');
      const desktopTab = screen.getByTestId('pwa-tab-desktop');

      expect(androidTab).toBeInTheDocument();
      expect(iosTab).toBeInTheDocument();
      expect(desktopTab).toBeInTheDocument();

      // Mặc định hoặc chuyển tab iOS
      fireEvent.click(iosTab);
      expect(screen.getByText(/Safari/i)).toBeInTheDocument();
      expect(screen.getByText(/Thêm vào MH chính/i)).toBeInTheDocument();

      // Chuyển tab Desktop
      fireEvent.click(desktopTab);
      expect(screen.getByText(/thanh địa chỉ URL/i)).toBeInTheDocument();

      // Chuyển tab Android
      fireEvent.click(androidTab);
      expect(screen.getByText(/menu 3 chấm/i)).toBeInTheDocument();
    });

    it('PwaHeaderActions hiển thị cụm trạng thái và nút mở hướng dẫn cài đặt', () => {
      render(<PwaHeaderActions />);

      expect(screen.getByTestId('pwa-header-actions')).toBeInTheDocument();
      expect(screen.getByTestId('network-status-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('pwa-install-guide-btn')).toBeInTheDocument();

      // Bấm nút cài đặt -> Mở Modal hướng dẫn
      fireEvent.click(screen.getByTestId('pwa-install-guide-btn'));
      expect(screen.getByTestId('pwa-install-guide')).toBeInTheDocument();

      // Khi offline: Hiển thị banner cảnh báo ngoại tuyến
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(screen.getByTestId('offline-global-banner')).toBeInTheDocument();
      expect(screen.getByText(/Chế độ Ngoại tuyến \(Offline\)/i)).toBeInTheDocument();
    });
  });
});
