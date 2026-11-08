import React, { useMemo, useState } from 'react';
import {
  LinePosition,
} from '@kindich/domain';
import {
  orchestrateSixYaoAnalysis,
  SixYaoAnalysisResult,
} from '@kindich/core';
import { SingleDivinationWorkspaceProps } from './DivinationWorkspace.types';
import { WorkspaceHeader } from './WorkspaceHeader';
import { WorkspaceHexagrams } from './WorkspaceHexagrams';
import { WorkspaceMasterTable } from './WorkspaceMasterTable';
import { WorkspaceSupplementaryTable } from './WorkspaceSupplementaryTable';
import { WorkspaceInterpretation } from './WorkspaceInterpretation';
import { WorkspaceStudyNotes } from './WorkspaceStudyNotes';
import './DivinationWorkspace.css';

export type WorkspaceViewTab = 'an-que' | 'luan-giai' | 'ghi-chu';

export const DivinationWorkspaceView: React.FC<SingleDivinationWorkspaceProps> = ({
  method,
  trio,
  dateTimeInfo,
  question,
  inquiryType,
  sixYaoResult: initialSixYaoResult,
  maiHuaResult,
  serialResult,
  onBackToCasting,
  onSaveNote,
  isSaved = true,
  initialTab = 'an-que',
  divinationId,
}) => {
  // Trạng thái chuyển đổi giữa Bảng An Quẻ, Luận Giải Quẻ và Sổ Tay Ghi Chú Làm Sách
  const [activeTab, setActiveTab] = useState<WorkspaceViewTab>(initialTab);
  const [notesCount, setNotesCount] = useState<number>(0);

  // Đảm bảo luôn có SixYaoAnalysisResult chuẩn tắc từ Core Orchestrator
  const sixYaoResult: SixYaoAnalysisResult = useMemo(() => {
    if (initialSixYaoResult) {
      return initialSixYaoResult;
    }
    return orchestrateSixYaoAnalysis({
      primaryHexagram: trio.primary.number,
      changingHexagram: trio.transformed?.number,
      movingLineIndices: trio.movingLineIndices as LinePosition[],
      dateTime: {
        dayCanChi: dateTimeInfo.dayCanChi,
        monthCanChi: dateTimeInfo.monthCanChi,
        yearCanChi: dateTimeInfo.yearCanChi,
        hourCanChi: dateTimeInfo.hourCanChi,
      },
    });
  }, [initialSixYaoResult, trio, dateTimeInfo]);

  // Xử lý khi bấm nút "Thêm ghi chú nghiệm lý" ở Header
  const handleHeaderSaveNote = () => {
    if (onSaveNote) {
      onSaveNote();
    }
    setActiveTab('ghi-chu');
  };

  return (
    <div
      className="single-divination-workspace"
      data-testid="single-divination-workspace"
    >
      {/* 1. Khu Vực Thông Tin Chung & Header */}
      <WorkspaceHeader
        method={method}
        dateTimeInfo={dateTimeInfo}
        question={question}
        serialNumber={serialResult?.serialNumber}
        onBackToCasting={onBackToCasting}
        onSaveNote={handleHeaderSaveNote}
        isSaved={isSaved}
      />

      {/* Thanh điều hướng trang: Bảng An Quẻ & Đồ Hình vs Luận Giải vs Sổ Tay Nghiệm Lý & Làm Sách */}
      <div className="workspace-view-tabs no-print" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'an-que'}
          className={"workspace-view-tab-btn " + (activeTab === 'an-que' ? 'active' : '')}
          onClick={() => setActiveTab('an-que')}
          data-testid="tab-an-que"
        >
          <span className="tab-icon">📊</span>
          <span>Bảng An Quẻ & Đồ Hình</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'luan-giai'}
          className={"workspace-view-tab-btn " + (activeTab === 'luan-giai' ? 'active' : '')}
          onClick={() => setActiveTab('luan-giai')}
          data-testid="tab-luan-giai"
        >
          <span className="tab-icon">📖</span>
          <span>Luận Giải Quẻ Toàn Diện</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ghi-chu'}
          className={"workspace-view-tab-btn " + (activeTab === 'ghi-chu' ? 'active' : '')}
          onClick={() => setActiveTab('ghi-chu')}
          data-testid="tab-ghi-chu"
        >
          <span className="tab-icon">📝</span>
          <span>Sổ Tay Nghiệm Lý & Làm Sách</span>
          {notesCount > 0 && (
            <span style={{
              marginLeft: '4px',
              backgroundColor: activeTab === 'ghi-chu' ? '#FFFFFF' : '#851616',
              color: activeTab === 'ghi-chu' ? '#851616' : '#FFFFFF',
              borderRadius: '10px',
              padding: '1px 6px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {notesCount}
            </span>
          )}
        </button>
      </div>

      {/* TRANG 1: Thông Tin An Quẻ (Hình tượng 3 quẻ + 2 Bảng Lục Hào & Phân Tích Bổ Sung sát nhau) */}
      <div
        className={"workspace-tab-page " + (activeTab === 'an-que' ? 'workspace-tab-page--active' : 'workspace-tab-page--hidden')}
        data-testid="page-an-que"
      >
        {/* 2. Khu Vực Hình Tượng Quẻ (3 Cột: Quẻ Chủ - Quẻ Hỗ - Quẻ Biến) */}
        <WorkspaceHexagrams
          trio={trio}
          maiHuaResult={maiHuaResult}
        />

        {/* 3 & 4. Bảng Lục Hào Tổng Hợp & Bảng Phân Tích Bổ Sung (Kéo 2 bảng sát lại nhau, bỏ 2 dòng tiêu đề) */}
        <div className="workspace-tables-group">
          <WorkspaceMasterTable sixYaoResult={sixYaoResult} />
          <WorkspaceSupplementaryTable sixYaoResult={sixYaoResult} />
        </div>

        {/* Nút chuyển trang trực tiếp sang phần Luận giải hoặc Ghi chú */}
        <div className="workspace-switch-page-footer no-print" style={{ gap: '12px' }}>
          <button
            type="button"
            className="btn-switch-to-interpretation"
            onClick={() => {
              setActiveTab('luan-giai');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>📖 Xem Luận Giải Quẻ Toàn Diện (Kinh Văn Cổ Bản & Dịch Lý) ➔</span>
          </button>
          <button
            type="button"
            className="btn-switch-to-interpretation"
            style={{ backgroundColor: '#B88E28' }}
            onClick={() => {
              setActiveTab('ghi-chu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>📝 Mở Sổ Tay Ghi Chú & Nghiệm Lý Làm Sách ➔</span>
          </button>
        </div>
      </div>

      {/* TRANG 2: Tách trang riêng cho Luận Giải Quẻ Toàn Diện (từ "Luận giải quẻ toàn diện..." trở đi) */}
      <div
        className={"workspace-tab-page " + (activeTab === 'luan-giai' ? 'workspace-tab-page--active' : 'workspace-tab-page--hidden')}
        data-testid="page-luan-giai"
      >
        <div className="workspace-switch-page-header no-print" style={{ gap: '12px' }}>
          <button
            type="button"
            className="btn-switch-back-to-an-que"
            onClick={() => {
              setActiveTab('an-que');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>⬅ Quay lại Bảng An Quẻ & Đồ Hình</span>
          </button>
          <button
            type="button"
            className="btn-switch-back-to-an-que"
            style={{ borderColor: '#B88E28', color: '#B88E28' }}
            onClick={() => {
              setActiveTab('ghi-chu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>📝 Đi Đến Sổ Tay Nghiệm Lý Làm Sách ➔</span>
          </button>
        </div>

        <div className="workspace-section-wrapper">
          <WorkspaceInterpretation
            trio={trio}
            sixYaoResult={sixYaoResult}
            maiHuaResult={maiHuaResult}
            question={question}
            inquiryType={inquiryType}
          />
        </div>
      </div>

      {/* TRANG 3: Sổ Tay Nghiệm Lý & Dữ Liệu Học Tập Làm Sách */}
      <div
        className={"workspace-tab-page " + (activeTab === 'ghi-chu' ? 'workspace-tab-page--active' : 'workspace-tab-page--hidden')}
        data-testid="page-ghi-chu"
      >
        <div className="workspace-switch-page-header no-print">
          <button
            type="button"
            className="btn-switch-back-to-an-que"
            onClick={() => {
              setActiveTab('an-que');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>⬅ Quay lại Bảng An Quẻ & Đồ Hình</span>
          </button>
        </div>

        <div className="workspace-section-wrapper">
          <WorkspaceStudyNotes
            divinationId={divinationId}
            trio={trio}
            dateTimeInfo={dateTimeInfo}
            question={question}
            method={method}
            sixYaoResult={sixYaoResult}
            onNotesCountChanged={setNotesCount}
          />
        </div>
      </div>
    </div>
  );
};
