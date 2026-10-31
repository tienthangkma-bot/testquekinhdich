import React, { useMemo } from 'react';
import { SixYaoAnalysisResult } from '@kindich/core';
import { calculateHexagramPhucThan, PhucThanInfo } from '@kindich/core';

interface WorkspaceMasterTableProps {
  sixYaoResult: SixYaoAnalysisResult;
}

export const WorkspaceMasterTable: React.FC<WorkspaceMasterTableProps> = ({
  sixYaoResult,
}) => {
  const { primaryHexagram, changingHexagram } = sixYaoResult;

  // 1. Tính Phục Thần cho 6 hào của Quẻ Chủ
  const phucThanMap: Record<number, PhucThanInfo> = useMemo(() => {
    return calculateHexagramPhucThan(primaryHexagram.hexagramNumber);
  }, [primaryHexagram.hexagramNumber]);

  // 2. Lấy danh sách hào từ Hào 6 xuống Hào 1 (Quy ước hiển thị)
  const rows = useMemo(() => {
    // primaryHexagram.lines có 6 phần tử (index 0 = hào 1, index 5 = hào 6)
    // Đảo ngược để hiển thị từ Hào 6 xuống Hào 1:
    const reversedPrimary = [...primaryHexagram.lines].reverse();

    return reversedPrimary.map((line) => {
      const pos = line.position;
      const isMoving = line.isMoving;
      const isYang = line.yinYang === 1;

      // Hào tương ứng của Quẻ Biến (nếu có)
      const changingLine = line.changingLine;
      const changingFullLine = changingHexagram?.lines.find((cl) => cl.position === pos);
      const isChangingYang = changingFullLine ? changingFullLine.yinYang === 1 : null;

      // Phục thần của hào này
      const pt = phucThanMap[pos] || { hasPhucThan: false, shortLabel: '' };

      return {
        pos,
        isYang,
        isMoving,
        isWorld: line.isWorld,
        isResponse: line.isResponse,
        sixRelationName: line.sixRelationName,
        canChiDisplay: `${line.branch}-${line.elementName}`,
        fullCanChi: line.canChi,
        phucThanLabel: pt.shortLabel || '',
        isVoid: line.calendar.isVoid,
        // Quẻ biến
        changingRelation: changingLine?.sixRelationName || changingFullLine?.sixRelationName || '',
        changingCanChi: changingLine
          ? `${changingLine.branch}-${changingLine.elementName}`
          : changingFullLine
          ? `${changingFullLine.branch}-${changingFullLine.elementName}`
          : '',
        changingVoid: changingFullLine?.calendar.isVoid || false,
        changingIsWorld: changingFullLine?.isWorld || false,
        changingIsResponse: changingFullLine?.isResponse || false,
        changingIsYang: isChangingYang,
        // Lục Thú
        sixSpiritName: line.sixSpiritName,
      };
    });
  }, [primaryHexagram.lines, changingHexagram?.lines, phucThanMap]);

  return (
    <div className="workspace-table-card">
      <div className="workspace-table-scroll-container">
        <table className="workspace-master-table">
          <thead>
            <tr>
              <th className="th-center" style={{ width: '48px' }}>Hào</th>
              <th className="th-center" style={{ width: '56px' }}>T/Ứ</th>
              <th className="th-left" style={{ minWidth: '95px' }}>Lục Thân</th>
              <th className="th-left" style={{ minWidth: '95px' }}>Can Chi</th>
              <th className="th-center" style={{ minWidth: '85px' }}>Phục thần</th>
              <th className="th-center" style={{ width: '45px' }}>TK</th>
              <th className="th-left" style={{ minWidth: '95px' }}>Lục Thân</th>
              <th className="th-left" style={{ minWidth: '95px' }}>Can Chi</th>
              <th className="th-center" style={{ width: '45px' }}>TK</th>
              <th className="th-center" style={{ minWidth: '95px' }}>Lục Thú</th>
              <th className="th-center" style={{ width: '56px' }}>T/Ứ</th>
              <th className="th-center" style={{ width: '48px' }}>Hào</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const movingClass = row.isMoving ? 'row--moving' : '';

              return (
                <tr key={row.pos} className={`workspace-master-row ${movingClass}`}>
                  {/* Cột 1: Vạch Hào Quẻ Chủ */}
                  <td className="cell-hex-mark cell-center">
                    <span
                      className={`hex-ascii-bar ${row.isYang ? 'bar--yang' : 'bar--yin'} ${
                        row.isMoving ? 'text-red' : 'text-blue'
                      }`}
                      title={`Hào ${row.pos}: ${row.isYang ? 'Dương' : 'Âm'}${row.isMoving ? ' (Động)' : ''}`}
                    >
                      {row.isYang ? '━━━' : '━ ━'}
                    </span>
                  </td>

                  {/* Cột 2: Thế / Ứng Quẻ Chủ */}
                  <td className="cell-world-response cell-center">
                    {row.isWorld && <span className="tag-the-bold">Thế</span>}
                    {row.isResponse && <span className="tag-ung-bold">Ứng</span>}
                  </td>

                  {/* Cột 3: Lục Thân Quẻ Chủ */}
                  <td className={`cell-relation cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.sixRelationName}
                  </td>

                  {/* Cột 4: Can Chi Quẻ Chủ */}
                  <td className={`cell-canchi cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.canChiDisplay}
                  </td>

                  {/* Cột 5: Phục Thần */}
                  <td className="cell-phucthan cell-center font-medium">
                    {row.phucThanLabel || ''}
                  </td>

                  {/* Cột 6: Tuần Không (TK) Quẻ Chủ */}
                  <td className="cell-tk cell-center">
                    {row.isVoid && <span className="tag-tk">K</span>}
                  </td>

                  {/* Cột 7: Lục Thân Quẻ Biến */}
                  <td className={`cell-relation cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.changingRelation || '-'}
                  </td>

                  {/* Cột 8: Can Chi Quẻ Biến */}
                  <td className={`cell-canchi cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.changingCanChi || '-'}
                  </td>

                  {/* Cột 9: Tuần Không (TK) Quẻ Biến */}
                  <td className="cell-tk cell-center">
                    {row.changingVoid && <span className="tag-tk">K</span>}
                  </td>

                  {/* Cột 10: Lục Thú */}
                  <td className={`cell-spirit cell-center ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.sixSpiritName}
                  </td>

                  {/* Cột 11: Thế / Ứng Quẻ Biến */}
                  <td className="cell-world-response cell-center">
                    {row.changingIsWorld && <span className="tag-the-bold">Thế</span>}
                    {row.changingIsResponse && <span className="tag-ung-bold">Ứng</span>}
                  </td>

                  {/* Cột 12: Vạch Hào Quẻ Biến */}
                  <td className="cell-hex-mark cell-center">
                    {row.changingIsYang !== null ? (
                      <span
                        className={`hex-ascii-bar ${row.changingIsYang ? 'bar--yang' : 'bar--yin'} ${
                          row.isMoving ? 'text-red' : 'text-blue'
                        }`}
                      >
                        {row.changingIsYang ? '━━━' : '━ ━'}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
