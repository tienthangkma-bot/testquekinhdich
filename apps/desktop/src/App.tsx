import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Select, Modal, Button } from '@kindich/shared';
import {
  SerialCastingResult,
  MaiHuaCastingResult,
  orchestrateSixYaoAnalysis,
  parseCanChiString,
  calculateVoidBranches,
  castHexagramTrio,
  castBySerial,
  castByMaiHua,
} from '@kindich/core';
import { CalendarConversionResult, getFullCalendarInfo } from '@kindich/calendar';
import {
  CastingMethod,
  DivinationDateTime,
  DivinationNoteEntity,
  HEXAGRAMS,
  HexagramTrio,
  LinePosition,
} from '@kindich/domain';
import { getDivinationRepository } from './services/repository.service';
import { SerialCastingForm, SerialCastingResultView } from './components/SerialCasting';
import { MaiHuaCastingForm, MaiHuaCastingResultView } from './components/MaiHuaCasting';
import { SixYaoAnalysisView } from './components/SixYaoAnalysis';
import { HexagramInterpretationView } from './components/HexagramInterpretation';
import {
  QuestionCategorySelector,
  QuestionCategory,
  DivinationNotesSection,
} from './components/NotesAndQuestions';
import { DesktopHomeView, DesktopNavScreen } from './components/DesktopHome/DesktopHomeView';
import { DesktopMenuBar } from './components/DesktopMenuBar/DesktopMenuBar';
import './App.css';

const DivinationHistoryView = React.lazy(() =>
  import('./components/DivinationHistory').then((m) => ({ default: m.DivinationHistoryView }))
);
const DesktopSettingsView = React.lazy(() =>
  import('./components/DesktopSettings/DesktopSettingsView').then((m) => ({ default: m.DesktopSettingsView }))
);
const DesktopAboutModal = React.lazy(() =>
  import('./components/DesktopAboutModal/DesktopAboutModal').then((m) => ({ default: m.DesktopAboutModal }))
);
const BackupRestoreModal = React.lazy(() =>
  import('./components/BackupRestore/BackupRestoreModal').then((m) => ({ default: m.BackupRestoreModal }))
);

const ZOOM_LEVELS = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5];

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<DesktopNavScreen>('home');
  const [currentHeaderCal, setCurrentHeaderCal] = useState<CalendarConversionResult | null>(null);

  // Câu hỏi và danh mục câu hỏi
  const [question, setQuestion] = useState<string>('');
  const [inquiryType, setInquiryType] = useState<QuestionCategory>('work');

  // Kết quả lập quẻ
  const [serialResult, setSerialResult] = useState<SerialCastingResult | null>(null);
  const [serialSavedId, setSerialSavedId] = useState<string | null>(null);
  const [serialNotes, setSerialNotes] = useState<readonly DivinationNoteEntity[]>([]);

  const [maiHuaData, setMaiHuaData] = useState<{
    result: MaiHuaCastingResult;
    calendarInfo: CalendarConversionResult;
  } | null>(null);
  const [maiHuaSavedId, setMaiHuaSavedId] = useState<string | null>(null);
  const [maiHuaNotes, setMaiHuaNotes] = useState<readonly DivinationNoteEntity[]>([]);

  // Trạng thái lưu trữ, thông báo và modal
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'restore'>('export');

  // Trạng thái điều khiển giao diện Desktop (Zoom & Toàn màn hình)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trạng thái cho tab Phân tích Lục Hào độc lập
  const [selectedHexNumber, setSelectedHexNumber] = useState<number>(1);
  const [selectedMovingLines, setSelectedMovingLines] = useState<number[]>([1]);

  // Cập nhật thông tin lịch trên Header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHeaderCal(getFullCalendarInfo(now.toISOString()));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý zoom giao diện
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const next = ZOOM_LEVELS.find((z) => z > prev + 0.01);
      return next !== undefined ? next : Math.min(1.5, Number((prev + 0.1).toFixed(2)));
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const prevLevels = [...ZOOM_LEVELS].reverse();
      const next = prevLevels.find((z) => z < prev - 0.01);
      return next !== undefined ? next : Math.max(0.8, Number((prev - 0.1).toFixed(2)));
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  // Xử lý toàn màn hình (Tauri 2 Native + Web fallback)
  const handleToggleFullscreen = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      const current = await win.isFullscreen();
      await win.setFullscreen(!current);
      setIsFullscreen(!current);
    } catch {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.().catch(() => {});
        setIsFullscreen(false);
      }
    }
  }, []);

  // Xử lý thoát ứng dụng
  const handleQuitApp = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.close();
    } catch {
      window.close();
    }
  }, []);

  // Mở modal Backup/Restore
  const handleOpenBackup = useCallback((tab?: 'export' | 'restore') => {
    setBackupModalTab(tab || 'export');
    setIsBackupModalOpen(true);
  }, []);

  // Bắt phím tắt toàn cầu Desktop (Global Keyboard Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setActiveScreen('serial');
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setActiveScreen('time');
        } else if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          handleOpenBackup('export');
        } else if (e.key.toLowerCase() === 'i') {
          e.preventDefault();
          handleOpenBackup('restore');
        } else if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          handleQuitApp();
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleZoomReset();
        }
      } else if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveScreen('home');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveScreen('serial');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveScreen('time');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveScreen('six-yao');
        } else if (e.key === '5') {
          e.preventDefault();
          setActiveScreen('history');
        } else if (e.key === '6') {
          e.preventDefault();
          setActiveScreen('settings');
        }
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleOpenBackup,
    handleQuitApp,
    handleToggleFullscreen,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  ]);

  const hexagramOptions = HEXAGRAMS.map((h) => ({
    value: h.number.toString(),
    label: `#${h.number} - ${h.name} (${h.sinoVietnameseName})`,
  }));

  // Tạo Trio cho tab Phân Tích Lục Hào độc lập
  const sixYaoTrio = useMemo<HexagramTrio | null>(() => {
    const hexDef = HEXAGRAMS.find((h) => h.number === selectedHexNumber);
    if (!hexDef) return null;
    return castHexagramTrio(hexDef.binary, selectedMovingLines);
  }, [selectedHexNumber, selectedMovingLines]);

  const loadSerialNotes = useCallback(async () => {
    if (!serialSavedId) return;
    try {
      const repo = getDivinationRepository();
      const agg = await repo.getById(serialSavedId);
      if (agg) setSerialNotes(agg.notes);
    } catch (err) {
      console.error('Lỗi khi tải ghi chú quẻ seri:', err);
    }
  }, [serialSavedId]);

  const loadMaiHuaNotes = useCallback(async () => {
    if (!maiHuaSavedId) return;
    try {
      const repo = getDivinationRepository();
      const agg = await repo.getById(maiHuaSavedId);
      if (agg) setMaiHuaNotes(agg.notes);
    } catch (err) {
      console.error('Lỗi khi tải ghi chú quẻ Mai Hoa:', err);
    }
  }, [maiHuaSavedId]);

  /**
   * Tự động lưu lịch sử khi lập quẻ Seri tiền thành công
   */
  const handleSerialCastSuccess = async (result: SerialCastingResult) => {
    setSerialResult(result);
    setIsSaving(true);
    try {
      const repo = getDivinationRepository();
      const now = new Date();
      const calInfo = getFullCalendarInfo(now.toISOString());
      const { stem, branch } = parseCanChiString(calInfo.canChi.day);
      const { voidBranches } = calculateVoidBranches(stem, branch);

      const dt: DivinationDateTime = {
        solarDateTime: now.toISOString(),
        lunarYear: calInfo.lunar.year,
        lunarMonth: calInfo.lunar.month,
        lunarDay: calInfo.lunar.day,
        lunarHourBranch: calInfo.currentHourBranch.branch,
        yearCanChi: calInfo.canChi.year,
        monthCanChi: calInfo.canChi.month,
        dayCanChi: calInfo.canChi.day,
        hourCanChi: calInfo.canChi.hour,
        solarTerm: calInfo.solarTerm?.name,
        voidBranches,
      };

      const sixYaoRes = orchestrateSixYaoAnalysis({
        primaryHexagram: result.trio.primary.number,
        changingHexagram: result.trio.transformed?.number,
        movingLineIndices: result.movingLine ? [result.movingLine as LinePosition] : [],
        dateTime: {
          dayCanChi: dt.dayCanChi,
          monthCanChi: dt.monthCanChi,
          yearCanChi: dt.yearCanChi,
          hourCanChi: dt.hourCanChi,
        },
      });

      const saved = await repo.create({
        method: CastingMethod.SERIAL,
        algorithmVersion: 'SERIAL-MOD8-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: {
          method: CastingMethod.SERIAL,
          serialNumber: result.serialNumber,
        },
        dateTimeInfo: dt,
        trio: result.trio,
        question: question.trim() || undefined,
        inquiryType,
        analysis: {
          palaceId: sixYaoRes.primaryHexagram.palace.id,
          palaceElement: sixYaoRes.primaryHexagram.palace.element,
          worldLine: sixYaoRes.summary.worldLinePosition,
          responseLine: sixYaoRes.summary.responseLinePosition,
          summary: sixYaoRes.summary.objectiveOverview,
          details: sixYaoRes,
        },
      });

      setSerialSavedId(saved.divination.id);
      setSerialNotes([]);
      setSaveSuccessNotice('✓ Đã tự động lưu phiên lập quẻ vào Lịch sử máy tính!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tự động lưu lịch sử quẻ seri:', err);
      setErrorMessage('Lỗi khi tự động lưu lịch sử quẻ seri: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Tự động lưu lịch sử khi lập quẻ Mai Hoa thành công
   */
  const handleMaiHuaCastSuccess = async (
    result: MaiHuaCastingResult,
    calendarInfo: CalendarConversionResult
  ) => {
    setMaiHuaData({ result, calendarInfo });
    setIsSaving(true);
    try {
      const repo = getDivinationRepository();
      const { stem, branch } = parseCanChiString(calendarInfo.canChi.day);
      const { voidBranches } = calculateVoidBranches(stem, branch);

      const solarDateStr = `${calendarInfo.solar.year}-${String(calendarInfo.solar.month).padStart(2, '0')}-${String(calendarInfo.solar.day).padStart(2, '0')}T${String(calendarInfo.solar.hour).padStart(2, '0')}:${String(calendarInfo.solar.minute).padStart(2, '0')}:00.000Z`;

      const dt: DivinationDateTime = {
        solarDateTime: solarDateStr,
        lunarYear: calendarInfo.lunar.year,
        lunarMonth: calendarInfo.lunar.month,
        lunarDay: calendarInfo.lunar.day,
        lunarHourBranch: calendarInfo.currentHourBranch.branch,
        yearCanChi: calendarInfo.canChi.year,
        monthCanChi: calendarInfo.canChi.month,
        dayCanChi: calendarInfo.canChi.day,
        hourCanChi: calendarInfo.canChi.hour,
        solarTerm: calendarInfo.solarTerm?.name,
        voidBranches,
      };

      const sixYaoRes = orchestrateSixYaoAnalysis({
        primaryHexagram: result.trio.primary.number,
        changingHexagram: result.trio.transformed?.number,
        movingLineIndices: result.movingLine ? [result.movingLine as LinePosition] : [],
        dateTime: {
          dayCanChi: dt.dayCanChi,
          monthCanChi: dt.monthCanChi,
          yearCanChi: dt.yearCanChi,
          hourCanChi: dt.hourCanChi,
        },
      });

      const saved = await repo.create({
        method: CastingMethod.MAI_HUA,
        algorithmVersion: 'MAI-HUA-V1',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        input: {
          method: CastingMethod.MAI_HUA,
          dateTime: solarDateStr,
        },
        dateTimeInfo: dt,
        trio: result.trio,
        question: question.trim() || undefined,
        inquiryType,
        analysis: {
          palaceId: sixYaoRes.primaryHexagram.palace.id,
          palaceElement: sixYaoRes.primaryHexagram.palace.element,
          worldLine: sixYaoRes.summary.worldLinePosition,
          responseLine: sixYaoRes.summary.responseLinePosition,
          summary: sixYaoRes.summary.objectiveOverview,
          details: sixYaoRes,
        },
      });

      setMaiHuaSavedId(saved.divination.id);
      setMaiHuaNotes([]);
      setSaveSuccessNotice('✓ Đã tự động lưu phiên lập quẻ vào Lịch sử máy tính!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tự động lưu lịch sử quẻ Mai Hoa:', err);
      setErrorMessage('Lỗi khi tự động lưu lịch sử quẻ Mai Hoa: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const getScreenTitle = (screen: DesktopNavScreen) => {
    switch (screen) {
      case 'home':
        return 'Trang Chủ & Tổng Quan';
      case 'serial':
        return 'Lập Quẻ Bằng Seri Tiền (SERIAL-MOD8-V1)';
      case 'time':
        return 'Lập Quẻ Bằng Giờ Động Tâm (Mai Hoa Dịch Số)';
      case 'six-yao':
        return 'Đồ Bản & Luận Giải Lục Hào Chuyên Sâu';
      case 'history':
        return 'Sổ Nghiệm Lý & Lịch Sử Lập Quẻ';
      case 'settings':
        return 'Cài Đặt & Quản Trị Dữ Liệu';
    }
  };

  return (
    <div
      className="desktop-root-container"
      style={{ zoom: zoomLevel } as React.CSSProperties}
    >
      {/* 1. Thanh Menu Ứng Dụng Chuẩn Desktop: File, View, Settings, Help */}
      <DesktopMenuBar
        onNavigate={setActiveScreen}
        onOpenBackup={handleOpenBackup}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onQuitApp={handleQuitApp}
      />

      {/* 2. Khung Bố Cục Chính Desktop (Sidebar bên trái + Main bên phải) */}
      <div className="desktop-app-layout">
        {/* Sidebar bên trái */}
        <aside className="desktop-sidebar">
          <div className="desktop-sidebar-brand">
            <span className="desktop-brand-symbol">☯</span>
            <div className="desktop-brand-text">
              <h2>Kinh Dịch Desktop</h2>
              <p>Bắc Hà Tân An Phái</p>
            </div>
          </div>

          {/* Danh mục điều hướng */}
          <nav className="desktop-nav">
            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'home' ? 'active' : ''}`}
              onClick={() => setActiveScreen('home')}
            >
              <span className="desktop-nav-icon">🏠</span>
              <span>Trang Chủ</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'serial' ? 'active' : ''}`}
              onClick={() => setActiveScreen('serial')}
            >
              <span className="desktop-nav-icon">🔢</span>
              <span>Lập Quẻ Seri Tiền</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'time' ? 'active' : ''}`}
              onClick={() => setActiveScreen('time')}
            >
              <span className="desktop-nav-icon">⏳</span>
              <span>Giờ Động Tâm</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'six-yao' ? 'active' : ''}`}
              onClick={() => setActiveScreen('six-yao')}
            >
              <span className="desktop-nav-icon">☯</span>
              <span>Phân Tích Lục Hào</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'history' ? 'active' : ''}`}
              onClick={() => setActiveScreen('history')}
            >
              <span className="desktop-nav-icon">📜</span>
              <span>Lịch Sử & Ghi Chú</span>
            </button>

            <button
              type="button"
              className={`desktop-nav-item ${activeScreen === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveScreen('settings')}
            >
              <span className="desktop-nav-icon">⚙️</span>
              <span>Cài Đặt & Dữ Liệu</span>
            </button>
          </nav>

          {/* Chân sidebar: Trạng thái hệ thống */}
          <div className="desktop-sidebar-footer">
            <div className="desktop-status-pill">
              <span className="status-dot"></span>
              <span>100% Offline • Cục bộ</span>
            </div>
            <div>Tauri 2 Native x64</div>
            <div>Bốc Phệ Chính Tông V1</div>
          </div>
        </aside>

        {/* Vùng nội dung chính bên phải */}
        <div className="desktop-main-wrapper">
          {/* Header thanh trên cùng */}
          <header className="desktop-top-header">
            <div className="desktop-header-title">
              <h1>{getScreenTitle(activeScreen)}</h1>
            </div>

            <div className="desktop-header-calinfo">
              {isSaving && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--bha-crimson-700)' }}>
                  <span className="desktop-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  <span>Đang lưu...</span>
                </div>
              )}
              {currentHeaderCal && (
                <>
                  <span className="desktop-header-badge">
                    {currentHeaderCal.canChi.day} (Ngày) • {currentHeaderCal.canChi.month} (Tháng)
                  </span>
                  <span>
                    Tiết khí: <strong>{currentHeaderCal.solarTerm?.name || 'Hiện hành'}</strong>
                  </span>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHelpModalOpen(true)}
              >
                📖 Hướng Dẫn
              </Button>
            </div>
          </header>

          {/* Thông báo đã lưu tự động */}
          {saveSuccessNotice && (
            <div
              style={{
                padding: '10px 28px',
                backgroundColor: 'rgba(46, 125, 50, 0.12)',
                color: '#2e7d32',
                borderBottom: '1px solid rgba(46, 125, 50, 0.25)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {saveSuccessNotice}
            </div>
          )}

          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="desktop-alert desktop-alert--error" style={{ margin: '12px 28px 0 28px' }}>
              <span>⚠️ {errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d32f2f',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Vùng cuộn trang */}
          <main className="desktop-content-scroll">
            <div className="desktop-page-container">
              {/* 1. Màn hình Trang Chủ */}
              {activeScreen === 'home' && (
                <DesktopHomeView onNavigate={(screen) => setActiveScreen(screen)} />
              )}

              {/* 2. Màn hình Lập Quẻ Seri Tiền */}
              {activeScreen === 'serial' && (
                <div>
                  {/* Khu vực nhập câu hỏi & danh mục */}
                  <div className="desktop-question-box">
                    <QuestionCategorySelector
                      question={question}
                      onQuestionChange={setQuestion}
                      category={inquiryType}
                      onCategoryChange={setInquiryType}
                    />
                  </div>

                  {/* Form Lập quẻ seri tiền */}
                  <SerialCastingForm onCastSuccess={handleSerialCastSuccess} />

                  {/* Trạng thái trống (Empty State) khi chưa gieo */}
                  {!serialResult ? (
                    <div className="desktop-placeholder-box">
                      <span className="desktop-placeholder-icon">🔢</span>
                      <h3 className="desktop-placeholder-title">Chưa có quẻ nào được lập</h3>
                      <p className="desktop-placeholder-desc">
                        Vui lòng nhập 4 chữ số đuôi của tờ tiền polymer ở biểu mẫu trên và nhấn &ldquo;Lập Quẻ Bằng Seri&rdquo; để hệ thống tự động an quẻ, lập đồ bản Lục Hào chuyên sâu và tra cứu Kinh văn.
                      </p>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              const res = castBySerial('6824');
                              handleSerialCastSuccess(res);
                            } catch (err) {
                              setErrorMessage('Lỗi khi lập quẻ mẫu: ' + String(err));
                            }
                          }}
                        >
                          💡 Lập thử quẻ mẫu seri 6824 (Địa Lôi Phục)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Kết quả khi đã gieo */
                    <div className="desktop-results-grid">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSerialResult(null);
                            setSerialSavedId(null);
                            setSerialNotes([]);
                          }}
                        >
                          🔄 Lập quẻ khác
                        </Button>
                      </div>

                      <SerialCastingResultView result={serialResult} />

                      {/* Đồ bản Lục Hào */}
                      <SixYaoAnalysisView
                        primaryHexagram={serialResult.trio.primary.number}
                        changingHexagram={serialResult.trio.transformed?.number}
                        movingLineIndices={
                          serialResult.movingLine ? [serialResult.movingLine as LinePosition] : []
                        }
                      />

                      {/* Luận giải Kinh văn & Chu Hi */}
                      <HexagramInterpretationView trio={serialResult.trio} />

                      {/* Sổ ghi chú & Nghiệm lý */}
                      {serialSavedId && (
                        <DivinationNotesSection
                          divinationId={serialSavedId}
                          notes={serialNotes}
                          repository={getDivinationRepository()}
                          onNotesChanged={loadSerialNotes}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Màn hình Lập Quẻ Giờ Động Tâm */}
              {activeScreen === 'time' && (
                <div>
                  {/* Khu vực nhập câu hỏi & danh mục */}
                  <div className="desktop-question-box">
                    <QuestionCategorySelector
                      question={question}
                      onQuestionChange={setQuestion}
                      category={inquiryType}
                      onCategoryChange={setInquiryType}
                    />
                  </div>

                  {/* Form Lập quẻ Mai Hoa */}
                  <MaiHuaCastingForm onCastSuccess={handleMaiHuaCastSuccess} />

                  {/* Trạng thái trống (Empty State) khi chưa gieo */}
                  {!maiHuaData ? (
                    <div className="desktop-placeholder-box">
                      <span className="desktop-placeholder-icon">⏳</span>
                      <h3 className="desktop-placeholder-title">Chưa khởi quẻ giờ động tâm</h3>
                      <p className="desktop-placeholder-desc">
                        Phương pháp Mai Hoa Dịch Số dựa vào thời khắc tâm niệm khởi phát (Năm, Tháng, Ngày, Giờ, Phút) để định Thượng quái, Hạ quái và Hào biến. Hãy nhấn &ldquo;Lấy Thời Điểm Hiện Tại&rdquo; hoặc chọn giờ để lập quẻ.
                      </p>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              const now = new Date();
                              const cal = getFullCalendarInfo(now.toISOString(), { dayTransition: 'RAT_HOUR_23' });
                              const yearBranchIndex = ((cal.lunar.year + 8) % 12 + 12) % 12;
                              const yearBranchNumber = yearBranchIndex + 1;
                              const hourBranchNumber = cal.currentHourBranch.index + 1;
                              const res = castByMaiHua({
                                yearBranch: yearBranchNumber,
                                month: cal.lunar.month,
                                day: cal.lunar.day,
                                hourBranch: hourBranchNumber,
                              });
                              handleMaiHuaCastSuccess(res, cal);
                            } catch (err) {
                              setErrorMessage('Lỗi khi khởi quẻ giờ hiện tại: ' + String(err));
                            }
                          }}
                        >
                          ⚡ Khởi quẻ ngay với thời khắc hiện tại
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Kết quả khi đã gieo */
                    <div className="desktop-results-grid">
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMaiHuaData(null);
                            setMaiHuaSavedId(null);
                            setMaiHuaNotes([]);
                          }}
                        >
                          🔄 Lập quẻ khác
                        </Button>
                      </div>

                      <MaiHuaCastingResultView
                        result={maiHuaData.result}
                        calendarInfo={maiHuaData.calendarInfo}
                      />

                      {/* Đồ bản Lục Hào */}
                      <SixYaoAnalysisView
                        primaryHexagram={maiHuaData.result.trio.primary.number}
                        changingHexagram={maiHuaData.result.trio.transformed?.number}
                        movingLineIndices={
                          maiHuaData.result.movingLine ? [maiHuaData.result.movingLine as LinePosition] : []
                        }
                      />

                      {/* Luận giải Kinh văn */}
                      <HexagramInterpretationView
                        trio={maiHuaData.result.trio}
                        maiHuaResult={maiHuaData.result}
                      />

                      {/* Sổ ghi chú & Nghiệm lý */}
                      {maiHuaSavedId && (
                        <DivinationNotesSection
                          divinationId={maiHuaSavedId}
                          notes={maiHuaNotes}
                          repository={getDivinationRepository()}
                          onNotesChanged={loadMaiHuaNotes}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Màn hình Phân Tích Lục Hào Chuyên Sâu */}
              {activeScreen === 'six-yao' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <Card title="⚙️ Tùy Chọn Quẻ & Hào Động">
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                      <div>
                        <Select
                          label="Chọn Quẻ Chủ (1 trong 64 quẻ)"
                          options={hexagramOptions}
                          value={selectedHexNumber.toString()}
                          onChange={(e) => setSelectedHexNumber(parseInt(e.target.value, 10))}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--bha-text-primary)',
                          }}
                        >
                          Hào Động (1 - 6)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5, 6].map((line) => {
                            const isSelected = selectedMovingLines.includes(line);
                            return (
                              <button
                                key={line}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedMovingLines(
                                      selectedMovingLines.filter((l) => l !== line)
                                    );
                                  } else {
                                    setSelectedMovingLines([...selectedMovingLines, line].sort());
                                  }
                                }}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '4px',
                                  border: `1px solid ${isSelected ? 'var(--bha-crimson-700)' : 'var(--bha-border-subtle)'}`,
                                  backgroundColor: isSelected
                                    ? 'var(--bha-crimson-700)'
                                    : 'var(--bha-bg-card)',
                                  color: isSelected ? '#ffffff' : 'var(--bha-text-primary)',
                                  cursor: 'pointer',
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                              >
                                Hào {line}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Đồ bản phân tích Lục Hào */}
                  <SixYaoAnalysisView
                    primaryHexagram={selectedHexNumber}
                    movingLineIndices={selectedMovingLines as LinePosition[]}
                  />

                  {/* Luận giải Kinh văn & Chu Hi */}
                  {sixYaoTrio && <HexagramInterpretationView trio={sixYaoTrio} />}
                </div>
              )}

              {/* 5. Màn hình Lịch Sử & Ghi Chú */}
              {activeScreen === 'history' && (
                <React.Suspense
                  fallback={
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--bha-text-muted)' }}>
                      Đang tải danh sách lịch sử...
                    </div>
                  }
                >
                  <DivinationHistoryView
                    repository={getDivinationRepository()}
                    onSelectForAnalysis={(hexNumber, movingLines) => {
                      setSelectedHexNumber(hexNumber);
                      setSelectedMovingLines(movingLines);
                      setActiveScreen('six-yao');
                    }}
                  />
                </React.Suspense>
              )}

              {/* 6. Màn hình Cài Đặt */}
              {activeScreen === 'settings' && (
                <React.Suspense
                  fallback={
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--bha-text-muted)' }}>
                      Đang tải cài đặt hệ thống...
                    </div>
                  }
                >
                  <DesktopSettingsView />
                </React.Suspense>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal Hướng Dẫn Sử Dụng Desktop */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="📖 Hướng Dẫn Sử Dụng Kinh Dịch Desktop"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', lineHeight: 1.6 }}>
          <p>
            Chào mừng bạn đến với ứng dụng <strong>Kinh Dịch - Bắc Hà Tân An Phái</strong> phiên bản dành riêng cho máy tính Windows (Tauri 2).
          </p>
          <div>
            <strong>1. Lập quẻ seri tiền (Ctrl+N):</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--bha-text-secondary)' }}>
              Nhập câu hỏi và 4 chữ số cuối của tờ tiền polymer (phép Bốc Phệ Chính Tông SERIAL-MOD8-V1).
            </p>
          </div>
          <div>
            <strong>2. Lập quẻ giờ động tâm (Ctrl+T):</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--bha-text-secondary)' }}>
              Lập quẻ khi trong tâm có việc trăn trở khởi phát. Chọn thời điểm hoặc nhấn &ldquo;Lấy thời điểm hiện tại&rdquo;.
            </p>
          </div>
          <div>
            <strong>3. Phím tắt thao tác nhanh:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', color: 'var(--bha-text-secondary)' }}>
              <li><strong>Ctrl+N / Ctrl+T:</strong> Lập quẻ seri / giờ động tâm</li>
              <li><strong>Ctrl+E / Ctrl+I:</strong> Xuất sao lưu / Khôi phục dữ liệu JSON</li>
              <li><strong>Ctrl + / Ctrl - / Ctrl 0:</strong> Phóng to / Thu nhỏ / Đặt lại 100%</li>
              <li><strong>F11:</strong> Bật/tắt chế độ toàn màn hình</li>
              <li><strong>Alt+1..6:</strong> Chuyển nhanh giữa các màn hình</li>
            </ul>
          </div>
          <div>
            <strong>4. Lưu trữ & Sao lưu cục bộ:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--bha-text-secondary)' }}>
              Ứng dụng hoạt động 100% offline, toàn bộ dữ liệu lưu trữ trên máy tính của bạn. Bạn có thể vào mục <strong>Cài Đặt & Dữ Liệu</strong> hoặc menu <strong>File</strong> để xuất/nhập file sao lưu JSON an toàn.
            </p>
          </div>
          <div style={{ textAlign: 'right', marginTop: '12px' }}>
            <Button variant="primary" onClick={() => setIsHelpModalOpen(false)}>
              Đã hiểu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Giới Thiệu (About) */}
      {isAboutModalOpen && (
        <React.Suspense fallback={null}>
          <DesktopAboutModal
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Modal Sao Lưu & Khôi Phục Dữ Liệu (Backup/Restore) */}
      {isBackupModalOpen && (
        <React.Suspense fallback={null}>
          <BackupRestoreModal
            isOpen={isBackupModalOpen}
            onClose={() => setIsBackupModalOpen(false)}
            initialTab={backupModalTab}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default App;
