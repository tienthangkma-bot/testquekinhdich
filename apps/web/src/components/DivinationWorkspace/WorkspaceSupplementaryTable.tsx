import React, { useMemo } from 'react';
import { SixYaoAnalysisResult } from '@kindich/core';
import { createSupplementaryLineData, SupplementaryLineData } from '@kindich/core';

interface WorkspaceSupplementaryTableProps {
  sixYaoResult: SixYaoAnalysisResult;
}

export const WorkspaceSupplementaryTable: React.FC<WorkspaceSupplementaryTableProps> = ({
  sixYaoResult,
}) => {
  const { primaryHexagram, changingHexagram, dateTime: dt } = sixYaoResult;

  const dayStem = dt.dayMaster.stem;
  const dayBranch = dt.dayMaster.branch;
  const monthBranch = dt.monthCommander.branch;

  // Xây dựng dữ liệu phân tích bổ sung cho 6 hào Quẻ Chủ (Hào 6 xuống Hào 1)
  const primaryRows: SupplementaryLineData[] = useMemo(() => {
    const reversed = [...primaryHexagram.lines].reverse();
    return reversed.map((line) => {
      return createSupplementaryLineData({
        position: line.position,
        canChi: line.canChi,
        stem: line.stem,
        branch: line.branch,
        element: line.element,
        elementName: line.elementName,
        isMoving: line.isMoving,
        dayStem,
        dayBranch,
        monthBranch,
        isVoid: line.calendar.isVoid,
      });
    });
  }, [primaryHexagram.lines, dayStem, dayBranch, monthBranch]);

  // Xây dựng dữ liệu phân tích bổ sung cho 6 hào Quẻ Biến (nếu có)
  const changingRows: (SupplementaryLineData | null)[] = useMemo(() => {
    if (!changingHexagram) return primaryRows.map(() => null);
    const reversed = [...changingHexagram.lines].reverse();
    return reversed.map((line) => {
      const isMovingOrigin = primaryHexagram.lines.find((pl) => pl.position === line.position)?.isMoving || false;
      return createSupplementaryLineData({
        position: line.position,
        canChi: line.canChi,
        stem: line.stem,
        branch: line.branch,
        element: line.element,
        elementName: line.elementName,
        isMoving: isMovingOrigin,
        dayStem,
        dayBranch,
        monthBranch,
        isVoid: line.calendar.isVoid,
      });
    });
  }, [changingHexagram, primaryHexagram.lines, primaryRows, dayStem, dayBranch, monthBranch]);

  return (
    <div className="workspace-supplementary-card">
      <div className="workspace-table-scroll-container">
        <table className="workspace-supp-table">
          <thead>
            <tr>
              {/* Vế Quẻ Chủ */}
              <th className="th-left" style={{ minWidth: '95px' }}>Hào</th>
              <th className="th-center" style={{ width: '60px' }}>Q.Thần</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Ngày</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Tháng</th>
              <th className="th-center" style={{ width: '45px' }}>Lộc</th>
              <th className="th-center" style={{ width: '45px' }}>Mã</th>
              <th className="th-center" style={{ width: '45px' }}>Đào</th>

              {/* Vế Quẻ Biến */}
              <th className="th-left" style={{ minWidth: '95px' }}>Hào</th>
              <th className="th-center" style={{ width: '60px' }}>Q.Thần</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Ngày</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Tháng</th>
              <th className="th-center" style={{ width: '45px' }}>Lộc</th>
              <th className="th-center" style={{ width: '45px' }}>Mã</th>
              <th className="th-center" style={{ width: '45px' }}>Đào</th>
            </tr>
          </thead>
          <tbody>
            {primaryRows.map((pRow, idx) => {
              const cRow = changingRows[idx];
              const movingClass = pRow.isMoving ? 'row--moving' : '';

              return (
                <tr key={pRow.position} className={`workspace-supp-row ${movingClass}`}>
                  {/* Quẻ Chủ: Can Chi */}
                  <td className={`cell-canchi cell-left ${pRow.isMoving ? 'text-red font-bold' : ''}`}>
                    {pRow.canChi}
                  </td>
                  {/* Quẻ Chủ: Quái Thần */}
                  <td className="cell-center text-muted">-</td>
                  {/* Quẻ Chủ: Tràng Sinh Ngày */}
                  <td className={`cell-center ${pRow.isMoving ? 'text-red font-bold' : ''}`}>
                    {pRow.dayLifeStage.shortName}
                  </td>
                  {/* Quẻ Chủ: Tràng Sinh Tháng */}
                  <td className={`cell-center ${pRow.isMoving ? 'text-red font-bold' : ''}`}>
                    {pRow.monthLifeStage.shortName}
                  </td>
                  {/* Quẻ Chủ: Lộc */}
                  <td className="cell-center font-bold">
                    {pRow.deities.locLabel}
                  </td>
                  {/* Quẻ Chủ: Mã */}
                  <td className="cell-center font-bold">
                    {pRow.deities.maLabel}
                  </td>
                  {/* Quẻ Chủ: Đào */}
                  <td className="cell-center font-bold">
                    {pRow.deities.daoLabel}
                  </td>

                  {/* Quẻ Biến: Can Chi */}
                  <td className={`cell-canchi cell-left ${cRow?.isMoving ? 'text-red font-bold' : ''}`}>
                    {cRow ? cRow.canChi : '-'}
                  </td>
                  {/* Quẻ Biến: Quái Thần */}
                  <td className="cell-center text-muted">
                    {cRow ? '-' : '-'}
                  </td>
                  {/* Quẻ Biến: Tràng Sinh Ngày */}
                  <td className={`cell-center ${cRow?.isMoving ? 'text-red font-bold' : ''}`}>
                    {cRow ? cRow.dayLifeStage.shortName : '-'}
                  </td>
                  {/* Quẻ Biến: Tràng Sinh Tháng */}
                  <td className={`cell-center ${cRow?.isMoving ? 'text-red font-bold' : ''}`}>
                    {cRow ? cRow.monthLifeStage.shortName : '-'}
                  </td>
                  {/* Quẻ Biến: Lộc */}
                  <td className="cell-center font-bold">
                    {cRow ? cRow.deities.locLabel : '-'}
                  </td>
                  {/* Quẻ Biến: Mã */}
                  <td className="cell-center font-bold">
                    {cRow ? cRow.deities.maLabel : '-'}
                  </td>
                  {/* Quẻ Biến: Đào */}
                  <td className="cell-center font-bold">
                    {cRow ? cRow.deities.daoLabel : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dải Tóm Lược Tương Quan & Vượng Suy Cốt Lõi */}
      <div className="workspace-supp-footer-chips">
        <span className="supp-chip supp-chip--day">
          Nhật Thần: <strong>{dt.dayMaster.branch} ({dt.dayMaster.elementName})</strong>
        </span>
        <span className="supp-chip supp-chip--month">
          Nguyệt Kiến: <strong>{dt.monthCommander.branch} ({dt.monthCommander.elementName})</strong>
        </span>
        <span className="supp-chip supp-chip--void">
          Tuần Không: <strong>{dt.dayMaster.voidBranches.join(', ')}</strong>
        </span>
        <span className="supp-chip supp-chip--break">
          Nguyệt Phá: <strong>{dt.monthCommander.monthlyBreakBranch}</strong>
        </span>
        {primaryHexagram.lines.some((l) => l.strength.isAmDong) && (
          <span className="supp-chip supp-chip--am-dong">
            ⚡ Xuất hiện Hào Ám Động
          </span>
        )}
      </div>
    </div>
  );
};
