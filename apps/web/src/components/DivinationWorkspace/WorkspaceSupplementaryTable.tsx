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
              <th className="th-center" style={{ width: '45px' }}>Quý</th>
              <th className="th-center col-divider-right" style={{ width: '45px' }}>Đào</th>

              {/* Vế Quẻ Biến */}
              <th className="th-left col-divider-left" style={{ minWidth: '95px' }}>Hào</th>
              <th className="th-center" style={{ width: '60px' }}>Q.Thần</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Ngày</th>
              <th className="th-center" style={{ minWidth: '75px' }}>TS.Tháng</th>
              <th className="th-center" style={{ width: '45px' }}>Lộc</th>
              <th className="th-center" style={{ width: '45px' }}>Mã</th>
              <th className="th-center" style={{ width: '45px' }}>Quý</th>
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
                  <td className={`cell-center ${pRow.deities.isLoc ? 'text-red font-bold' : 'text-muted'}`}>
                    {pRow.deities.locLabel}
                  </td>
                  {/* Quẻ Chủ: Mã */}
                  <td className={`cell-center ${pRow.deities.isMa ? 'text-red font-bold' : 'text-muted'}`}>
                    {pRow.deities.maLabel}
                  </td>
                  {/* Quẻ Chủ: Quý */}
                  <td className={`cell-center ${pRow.deities.isQuyNhan ? 'text-red font-bold' : 'text-muted'}`}>
                    {pRow.deities.quyLabel}
                  </td>
                  {/* Quẻ Chủ: Đào (với đường phân cách mạnh mẽ bên phải) */}
                  <td className={`cell-center col-divider-right ${pRow.deities.isDao ? 'text-red font-bold' : 'text-muted'}`}>
                    {pRow.deities.daoLabel}
                  </td>

                  {/* Quẻ Biến: Can Chi (với đường phân cách mạnh mẽ bên trái) */}
                  <td className={`cell-canchi cell-left col-divider-left ${cRow?.isMoving ? 'text-red font-bold' : ''}`}>
                    {cRow ? cRow.canChi : '-'}
                  </td>
                  {/* Quẻ Biến: Quái Thần */}
                  <td className="cell-center text-muted">
                    {cRow ? (cRow.position === 5 ? 'QT' : '-') : '-'}
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
                  <td className={`cell-center ${cRow?.deities.isLoc ? 'text-red font-bold' : 'text-muted'}`}>
                    {cRow ? cRow.deities.locLabel : '-'}
                  </td>
                  {/* Quẻ Biến: Mã */}
                  <td className={`cell-center ${cRow?.deities.isMa ? 'text-red font-bold' : 'text-muted'}`}>
                    {cRow ? cRow.deities.maLabel : '-'}
                  </td>
                  {/* Quẻ Biến: Quý */}
                  <td className={`cell-center ${cRow?.deities.isQuyNhan ? 'text-red font-bold' : 'text-muted'}`}>
                    {cRow ? cRow.deities.quyLabel : '-'}
                  </td>
                  {/* Quẻ Biến: Đào */}
                  <td className={`cell-center ${cRow?.deities.isDao ? 'text-red font-bold' : 'text-muted'}`}>
                    {cRow ? cRow.deities.daoLabel : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chú giải nhanh các thông số thần sát bổ trợ */}
      <div className="workspace-supp-footer-chips">
        <span className="supp-chip">
          <strong>TS.Ngày:</strong> Tràng Sinh theo Nhật Thần
        </span>
        <span className="supp-chip">
          <strong>TS.Tháng:</strong> Tràng Sinh theo Nguyệt Lệnh
        </span>
        <span className="supp-chip">
          <strong>Lộc:</strong> Lộc Thần (L)
        </span>
        <span className="supp-chip">
          <strong>Mã:</strong> Dịch Mã (M)
        </span>
        <span className="supp-chip">
          <strong>Quý:</strong> Thiên Ất Quý Nhân (Q)
        </span>
        <span className="supp-chip">
          <strong>Đào:</strong> Đào Hoa Sát (Đ)
        </span>
        <span className="supp-chip">
          <strong>Q.Thần:</strong> Quái Thần (QT)
        </span>
        <span className="supp-chip supp-chip--am-dong">
          <strong>Ghi chú:</strong> Chữ màu đỏ biểu thị Hào Động phát động biến hoá
        </span>
      </div>
    </div>
  );
};
