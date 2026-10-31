import React, { useState } from 'react';
import { Button, Card, Select, Modal } from '@kindich/shared';
import {
  SerialCastingResult,
  MaiHuaCastingResult,
  orchestrateSixYaoAnalysis,
  parseCanChiString,
  calculateVoidBranches,
} from '@kindich/core';
import { CalendarConversionResult, getFullCalendarInfo } from '@kindich/calendar';
import {
  CastingMethod,
  DivinationDateTime,
  HEXAGRAMS,
  LinePosition,
} from '@kindich/domain';
import { getDivinationRepository } from './services/repository.service';
import { SerialCastingForm, SerialCastingResultView } from './components/SerialCasting';
import { MaiHuaCastingForm, MaiHuaCastingResultView } from './components/MaiHuaCasting';
import { SixYaoAnalysisView } from './components/SixYaoAnalysis';
import { QuestionCategorySelector, QuestionCategory } from './components/NotesAndQuestions';
import { LocalStorageSettingsRepository } from '@kindich/database';
import { PwaHeaderActions } from './pwa';
import './App.css';

const DivinationHistoryView = React.lazy(() =>
  import('./components/DivinationHistory').then((m) => ({ default: m.DivinationHistoryView }))
);
const SettingsView = React.lazy(() =>
  import('./components/Settings').then((m) => ({ default: m.SettingsView }))
);

type CastingMode = 'serial' | 'time' | 'six-yao' | 'history' | 'settings';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CastingMode>('serial');
  const hasUserNavigated = React.useRef(false);
  const [question, setQuestion] = useState<string>('');
  const [inquiryType, setInquiryType] = useState<QuestionCategory>('work');
  const [serialResult, setSerialResult] = useState<SerialCastingResult | null>(null);
  const [maiHuaData, setMaiHuaData] = useState<{
    result: MaiHuaCastingResult;
    calendarInfo: CalendarConversionResult;
  } | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Trạng thái cho tab Phân Tích Lục Hào Chuyên Sâu
  const [selectedHexNumber, setSelectedHexNumber] = useState<number>(1);
  const [selectedMovingLines, setSelectedMovingLines] = useState<number[]>([1]);
  const [showSerialSixYao, setShowSerialSixYao] = useState(false);
  const [showMaiHuaSixYao, setShowMaiHuaSixYao] = useState(false);

  const hexagramOptions = HEXAGRAMS.map((h) => ({
    value: h.number.toString(),
    label: `#${h.number} - ${h.name} (${h.sinoVietnameseName})`,
  }));

  // Khởi tạo cấu hình hệ thống (Theme, Font Size, Default Casting Method)
  React.useEffect(() => {
    const settingsRepo = new LocalStorageSettingsRepository();
    settingsRepo.getSettings().then((s) => {
      if (s.appearance.theme !== 'light') {
        document.documentElement.setAttribute('data-theme', s.appearance.theme);
      }
      if (s.appearance.fontSize !== 'medium') {
        document.documentElement.setAttribute('data-font-size', s.appearance.fontSize);
      }
      if (!hasUserNavigated.current && s.divination.defaultMethod && s.divination.defaultMethod !== 'serial') {
        setActiveMode(s.divination.defaultMethod);
      }
    });
  }, []);

  const handleSelectMode = (mode: CastingMode) => {
    hasUserNavigated.current = true;
    setActiveMode(mode);
  };

  /**
   * Tự động lưu lịch sử khi lập quẻ Seri tiền thành công (Requirement 1)
   */
  const handleSerialCastSuccess = async (result: SerialCastingResult) => {
    setSerialResult(result);
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

      // Phân tích Lục Hào từ Orchestrator
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

      await repo.create({
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

      setSaveSuccessNotice('✓ Đã tự động lưu phiên lập quẻ vào Lịch sử!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tự động lưu lịch sử quẻ seri:', err);
    }
  };

  /**
   * Tự động lưu lịch sử khi lập quẻ Mai Hoa thành công (Requirement 1)
   */
  const handleMaiHuaCastSuccess = async (
    result: MaiHuaCastingResult,
    calendarInfo: CalendarConversionResult
  ) => {
    setMaiHuaData({ result, calendarInfo });
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

      await repo.create({
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

      setSaveSuccessNotice('✓ Đã tự động lưu phiên lập quẻ vào Lịch sử!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Lỗi khi tự động lưu lịch sử quẻ Mai Hoa:', err);
    }
  };

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

        {/* Tiện ích PWA: Trạng thái kết nối mạng & Hướng dẫn cài đặt (Requirements 5 & 6) */}
        <PwaHeaderActions />
      </header>

      {/* Mode Switcher */}
      <nav className="mode-switcher" aria-label="Phương pháp lập quẻ và chức năng">
        <button
          type="button"
          className={`mode-tab ${activeMode === 'serial' ? 'active' : ''}`}
          onClick={() => handleSelectMode('serial')}
        >
          <span className="tab-icon">🔢</span>
          <span>Lập quẻ seri tiền</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${activeMode === 'time' ? 'active' : ''}`}
          onClick={() => handleSelectMode('time')}
        >
          <span className="tab-icon">⏳</span>
          <span>Giờ động tâm</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${activeMode === 'six-yao' ? 'active' : ''}`}
          onClick={() => handleSelectMode('six-yao')}
        >
          <span className="tab-icon">☯</span>
          <span>Phân tích Lục Hào</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${activeMode === 'history' ? 'active' : ''}`}
          onClick={() => handleSelectMode('history')}
        >
          <span className="tab-icon">📜</span>
          <span>Lịch sử lập quẻ</span>
        </button>
        <button
          type="button"
          className={`mode-tab ${activeMode === 'settings' ? 'active' : ''}`}
          onClick={() => handleSelectMode('settings')}
        >
          <span className="tab-icon">⚙️</span>
          <span>Cài đặt</span>
        </button>
      </nav>

      {/* Thông báo đã lưu tự động */}
      {saveSuccessNotice && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            color: '#2e7d32',
            border: '1px solid rgba(46, 125, 50, 0.3)',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1040px',
            margin: '-12px auto 0 auto',
            width: '100%',
          }}
        >
          <span>{saveSuccessNotice}</span>
          <Button size="sm" variant="ghost" onClick={() => setActiveMode('history')}>
            Xem lịch sử ngay ➔
          </Button>
        </div>
      )}

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
                <QuestionCategorySelector
                  question={question}
                  onQuestionChange={setQuestion}
                  category={inquiryType}
                  onCategoryChange={setInquiryType}
                  inputPlaceholder="Ví dụ: Kỳ thi công chức tháng 11 có thuận lợi không?"
                />

                <SerialCastingForm
                  onCastSuccess={handleSerialCastSuccess}
                  onReset={() => setSerialResult(null)}
                />
              </div>

              {/* Khu vực hiển thị kết quả hoặc thông báo chờ */}
              <div style={{ marginTop: '28px' }}>
                {serialResult ? (
                  <>
                    <SerialCastingResultView result={serialResult} />
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                      <Button
                        variant="outline"
                        onClick={() => setShowSerialSixYao(!showSerialSixYao)}
                      >
                        {showSerialSixYao
                          ? '▲ Thu gọn đồ bản Lục Hào'
                          : '☯ Xem bảng phân tích Lục Hào chi tiết'}
                      </Button>
                    </div>
                    {showSerialSixYao && (
                      <div style={{ marginTop: '24px' }}>
                        <SixYaoAnalysisView
                          primaryHexagram={serialResult.trio.primary.number}
                          movingLineIndices={[serialResult.movingLine as LinePosition]}
                        />
                      </div>
                    )}
                  </>
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
        ) : activeMode === 'time' ? (
          <div className="mai-hua-mode-section">
            <Card
              title="Lập Quẻ Theo Giờ Động Tâm (Mai Hoa Dịch Số)"
              subtitle="Phương pháp khởi quẻ căn cứ theo thời khắc khởi tâm, phối hợp Can Chi, Lịch Âm và Thể/Dụng"
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <QuestionCategorySelector
                  question={question}
                  onQuestionChange={setQuestion}
                  category={inquiryType}
                  onCategoryChange={setInquiryType}
                  inputPlaceholder="Ví dụ: Việc hợp tác kinh doanh sắp tới diễn biến ra sao?"
                />

                <MaiHuaCastingForm
                  onCastSuccess={handleMaiHuaCastSuccess}
                  onReset={() => setMaiHuaData(null)}
                />
              </div>

              {/* Khu vực hiển thị kết quả Mai Hoa hoặc thông báo chờ */}
              <div style={{ marginTop: '28px' }}>
                {maiHuaData ? (
                  <>
                    <MaiHuaCastingResultView
                      result={maiHuaData.result}
                      calendarInfo={maiHuaData.calendarInfo}
                    />
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                      <Button
                        variant="outline"
                        onClick={() => setShowMaiHuaSixYao(!showMaiHuaSixYao)}
                      >
                        {showMaiHuaSixYao
                          ? '▲ Thu gọn đồ bản Lục Hào'
                          : '☯ Xem bảng phân tích Lục Hào chi tiết'}
                      </Button>
                    </div>
                    {showMaiHuaSixYao && (
                      <div style={{ marginTop: '24px' }}>
                        <SixYaoAnalysisView
                          primaryHexagram={maiHuaData.result.trio.primary.number}
                          movingLineIndices={[maiHuaData.result.movingLine as LinePosition]}
                          dateTime={{
                            dayCanChi: maiHuaData.calendarInfo.canChi.day,
                            monthCanChi: maiHuaData.calendarInfo.canChi.month,
                            yearCanChi: maiHuaData.calendarInfo.canChi.year,
                            hourCanChi: maiHuaData.calendarInfo.canChi.hour,
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="placeholder-box">
                    <div className="placeholder-icon">⌛</div>
                    <h4 className="placeholder-text">Chưa khởi quẻ giờ động tâm</h4>
                    <p className="placeholder-sub">
                      Chọn thời điểm khởi tâm chiêm nghiệm ở trên và bấm{' '}
                      <strong>"Lập quẻ Mai Hoa"</strong> để phân tích Quẻ Chủ, Quẻ Biến, Quẻ Hỗ và quan hệ Thể/Dụng.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : activeMode === 'six-yao' ? (
          <div className="six-yao-mode-section">
            <Card
              title="Khảo Sát & Phân Tích Lục Hào Chuyên Sâu"
              subtitle="Tra cứu và phân tích toàn diện 64 quẻ, Bát Cung, Nạp Giáp, Lục Thân, Lục Thú và Vượng Suy theo Nhật/Nguyệt"
              borderVariant="gold"
              hoverable
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
                <Select
                  label="Chọn Quẻ Chủ cần phân tích (1 đến 64):"
                  options={hexagramOptions}
                  value={selectedHexNumber.toString()}
                  onChange={(e) => setSelectedHexNumber(Number(e.target.value))}
                  helperText="Tra cứu đồ hình Bát Cung, Thế Ứng và Nạp Giáp theo cổ pháp Chu Dịch"
                  fullWidth
                />

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      marginBottom: '8px',
                      color: 'var(--bha-text-primary)',
                    }}
                  >
                    Chọn các hào động (nếu có):
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6].map((p) => {
                      const isChecked = selectedMovingLines.includes(p);
                      return (
                        <label
                          key={p}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: `1px solid ${
                              isChecked ? 'var(--bha-crimson-600)' : 'var(--bha-border-base)'
                            }`,
                            backgroundColor: isChecked
                              ? 'rgba(133, 22, 22, 0.08)'
                              : 'var(--bha-bg-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: isChecked ? 700 : 500,
                            color: isChecked
                              ? 'var(--bha-crimson-800)'
                              : 'var(--bha-text-secondary)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMovingLines([...selectedMovingLines, p].sort());
                              } else {
                                setSelectedMovingLines(selectedMovingLines.filter((x) => x !== p));
                              }
                            }}
                          />
                          Hào {p} {isChecked ? '●' : ''}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SixYaoAnalysisView
                primaryHexagram={selectedHexNumber}
                movingLineIndices={selectedMovingLines}
              />
            </Card>
          </div>
        ) : activeMode === 'history' ? (
          /* Màn hình Lịch Sử Lập Quẻ (Requirement 2) */
          <div className="history-mode-section">
            <React.Suspense
              fallback={
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--bha-text-muted)' }}>
                  Đang tải dữ liệu lịch sử...
                </div>
              }
            >
              <DivinationHistoryView />
            </React.Suspense>
          </div>
        ) : (
          /* Màn hình Cài Đặt Hệ Thống (Settings Module) */
          <div className="settings-mode-section">
            <React.Suspense
              fallback={
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--bha-text-muted)' }}>
                  Đang tải cài đặt hệ thống...
                </div>
              }
            >
              <SettingsView />
            </React.Suspense>
          </div>
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
            Offline-First Sẵn Sàng (IndexedDB & Dexter Database)
          </span>
          {' • '}Hệ thống Bắc Hà Tân An Phái Monorepo
        </p>
        <p>Bản quyền © 2026 Bắc Hà Tân An Phái • Phiên bản 0.1.0 (Database & Repository Connected)</p>
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
