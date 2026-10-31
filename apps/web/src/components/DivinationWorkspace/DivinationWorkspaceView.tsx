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
import './DivinationWorkspace.css';

export type WorkspaceViewTab = 'an-que' | 'luan-giai';

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
}) => {
  // Trạng thái chuyển đổi giữa Bảng An Quẻ và Luận Giải Quẻ Toàn Diện (Tách trang mới theo Yêu cầu 6)
  const [activeTab, setActiveTab] = useState<WorkspaceViewTab>(initialTab);

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
        onSaveNote={onSaveNote}
        isSaved={isSaved}
      />

      {/* Thanh điều hướng trang: Bảng An Quẻ & Đồ Hình vs Luận Giải Quẻ Toàn Diện */}
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

        {/* Nút chuyển trang trực tiếp sang phần Luận giải */}
        <div className="workspace-switch-page-footer no-print">
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
        </div>
      </div>

      {/* TRANG 2: Tách trang riêng cho Luận Giải Quẻ Toàn Diện (từ "Luận giải quẻ toàn diện..." trở đi) */}
      <div
        className={"workspace-tab-page " + (activeTab === 'luan-giai' ? 'workspace-tab-page--active' : 'workspace-tab-page--hidden')}
        data-testid="page-luan-giai"
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
          <WorkspaceInterpretation
            trio={trio}
            sixYaoResult={sixYaoResult}
            maiHuaResult={maiHuaResult}
            question={question}
            inquiryType={inquiryType}
          />
        </div>
      </div>
    </div>
  );
};
