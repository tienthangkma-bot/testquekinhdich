import React, { useState, useEffect, useRef } from 'react';
import { DesktopNavScreen } from '../DesktopHome/DesktopHomeView';
import './DesktopMenuBar.css';

export interface DesktopMenuBarProps {
  onNavigate: (screen: DesktopNavScreen) => void;
  onOpenBackup: (tab?: 'export' | 'restore') => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onQuitApp: () => void;
}

type MenuKey = 'file' | 'view' | 'settings' | 'help' | null;

export const DesktopMenuBar: React.FC<DesktopMenuBarProps> = ({
  onNavigate,
  onOpenBackup,
  onOpenHelp,
  onOpenAbout,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFullscreen,
  onToggleFullscreen,
  onQuitApp,
}) => {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: MenuKey) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const handleAction = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  return (
    <div className="desktop-menubar" ref={menuBarRef} role="menubar">
      {/* Các danh mục Menu bên trái */}
      <div className="desktop-menubar-menus">
        {/* Menu File */}
        <div className="menubar-menu-item">
          <button
            type="button"
            className={`menubar-menu-btn ${openMenu === 'file' ? 'active' : ''}`}
            onClick={() => handleMenuClick('file')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'file'}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="menubar-dropdown">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('serial'))}
              >
                <span>🔢 Lập quẻ seri tiền</span>
                <span className="dropdown-item-shortcut">Ctrl+N</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('time'))}
              >
                <span>⏳ Lập quẻ giờ động tâm</span>
                <span className="dropdown-item-shortcut">Ctrl+T</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onOpenBackup('export'))}
              >
                <span>📤 Xuất sao lưu JSON...</span>
                <span className="dropdown-item-shortcut">Ctrl+E</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onOpenBackup('restore'))}
              >
                <span>📥 Khôi phục dữ liệu JSON...</span>
                <span className="dropdown-item-shortcut">Ctrl+I</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onQuitApp)}
              >
                <span>❌ Thoát ứng dụng</span>
                <span className="dropdown-item-shortcut">Ctrl+Q</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu View */}
        <div className="menubar-menu-item">
          <button
            type="button"
            className={`menubar-menu-btn ${openMenu === 'view' ? 'active' : ''}`}
            onClick={() => handleMenuClick('view')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'view'}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="menubar-dropdown">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onZoomIn)}
              >
                <span>🔍 Phóng to giao diện</span>
                <span className="dropdown-item-shortcut">Ctrl +</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onZoomOut)}
              >
                <span>🔎 Thu nhỏ giao diện</span>
                <span className="dropdown-item-shortcut">Ctrl -</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onZoomReset)}
              >
                <span>↺ Đặt lại kích thước (100%)</span>
                <span className="dropdown-item-shortcut">Ctrl 0</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onToggleFullscreen)}
              >
                <span>{isFullscreen ? '⛶ Thoát toàn màn hình' : '⛶ Toàn màn hình'}</span>
                <span className="dropdown-item-shortcut">F11</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('home'))}
              >
                <span>🏠 Trang chủ</span>
                <span className="dropdown-item-shortcut">Alt+1</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('six-yao'))}
              >
                <span>☯ Đồ bản Lục Hào</span>
                <span className="dropdown-item-shortcut">Alt+4</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('history'))}
              >
                <span>📜 Sổ lịch sử & ghi chú</span>
                <span className="dropdown-item-shortcut">Alt+5</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu Settings */}
        <div className="menubar-menu-item">
          <button
            type="button"
            className={`menubar-menu-btn ${openMenu === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuClick('settings')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'settings'}
          >
            Settings
          </button>
          {openMenu === 'settings' && (
            <div className="menubar-dropdown">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onNavigate('settings'))}
              >
                <span>⚙️ Cài đặt hệ thống & CSDL</span>
                <span className="dropdown-item-shortcut">Alt+6</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(() => onOpenBackup('export'))}
              >
                <span>💾 Trung tâm Sao lưu & Khôi phục</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu Help */}
        <div className="menubar-menu-item">
          <button
            type="button"
            className={`menubar-menu-btn ${openMenu === 'help' ? 'active' : ''}`}
            onClick={() => handleMenuClick('help')}
            aria-haspopup="true"
            aria-expanded={openMenu === 'help'}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="menubar-dropdown">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onOpenHelp)}
              >
                <span>📖 Hướng dẫn lập quẻ & quy tắc</span>
                <span className="dropdown-item-shortcut">F1</span>
              </button>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleAction(onOpenAbout)}
              >
                <span>ℹ️ Về ứng dụng Kinh Dịch...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thông số thu phóng & điều khiển bên phải */}
      <div className="desktop-window-controls">
        <span className="zoom-badge" title="Tỷ lệ hiển thị hiện tại">
          Zoom: {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          className="window-ctrl-btn"
          onClick={onZoomOut}
          title="Thu nhỏ giao diện (Ctrl -)"
        >
          -
        </button>
        <button
          type="button"
          className="window-ctrl-btn"
          onClick={onZoomReset}
          title="Đặt lại kích thước chuẩn (Ctrl 0)"
        >
          100%
        </button>
        <button
          type="button"
          className="window-ctrl-btn"
          onClick={onZoomIn}
          title="Phóng to giao diện (Ctrl +)"
        >
          +
        </button>
        <button
          type="button"
          className="window-ctrl-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình (F11)' : 'Toàn màn hình (F11)'}
        >
          {isFullscreen ? '🗗' : '🗖'}
        </button>
      </div>
    </div>
  );
};
