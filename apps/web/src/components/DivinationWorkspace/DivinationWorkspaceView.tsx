import React, { useMemo } from 'react';
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
}) => {
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

      {/* 2. Khu Vực Hình Tượng Quẻ (3 Cột: Quẻ Chủ - Quẻ Hỗ - Quẻ Biến) */}
      <WorkspaceHexagrams
        trio={trio}
        maiHuaResult={maiHuaResult}
      />

      {/* 3. Bảng Lục Hào Tổng Hợp (Khu vực trung tâm theo phong cách ảnh mẫu) */}
      <div className="workspace-section-wrapper">
        <h3 className="workspace-section-caption">
          BẢNG LỤC HÀO TỔNG HỢP CỔ PHÁP (SÁU HÀO TỪ TRÊN XUỐNG DƯỚI)
        </h3>
        <WorkspaceMasterTable sixYaoResult={sixYaoResult} />
      </div>

      {/* 4. Bảng Phân Tích Bổ Sung (Trường Sinh, Thần Sát, Vượng Suy) */}
      <div className="workspace-section-wrapper">
        <h3 className="workspace-section-caption">
          BẢNG PHÂN TÍCH BỔ SUNG (THẬP NHỊ VẬN TRƯỜNG SINH & THẦN SÁT)
        </h3>
        <WorkspaceSupplementaryTable sixYaoResult={sixYaoResult} />
      </div>

      {/* 5. Khu Vực Luận Giải Tập Trung (Liền mạch, không bắt buộc chuyển tab) */}
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
  );
};
