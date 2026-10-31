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

  // Hàm render thanh vạch hào với 2 chấm (●● / ●) và thanh vạch bo góc tròn
  const renderTableBar = (isYang: boolean, isMoving: boolean, titleText: string) => {
    const movingClass = isMoving ? 'table-hex-bar--moving' : '';
    const dotColorClass = isMoving ? 'dot--moving' : 'dot--static';

    return (
      <div className="table-hex-bar-wrapper" title={titleText}>
        <span className={`table-hex-dot-indicator ${dotColorClass}`} aria-hidden="true">
          {isYang ? '●' : '●●'}
        </span>
        {isYang ? (
          <div className={`table-hex-bar table-hex-bar--yang ${movingClass}`} />
        ) : (
          <div className="table-hex-bar-yin-wrap">
            <div className={`table-hex-bar-yin-seg ${movingClass}`} />
            <div className="table-hex-bar-yin-gap" />
            <div className={`table-hex-bar-yin-seg ${movingClass}`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="workspace-table-card">
      <div className="workspace-table-scroll-container">
        <table className="workspace-master-table">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '4%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              {/* Vế Quẻ Chủ */}
              <th className="th-center">Hào</th>
              <th className="th-center">T/Ứ</th>
              <th className="th-left">Lục Thân</th>
              <th className="th-canchi th-left">Can Chi</th>
              <th className="th-center" title="Phục thần">Phục</th>
              <th className="th-center col-divider-right">TK</th>

              {/* Vế Quẻ Biến: Cột Hào chuyển sang bên trái (sau TK quẻ chính) */}
              <th className="th-center col-divider-left">Hào</th>
              <th className="th-center">T/Ứ</th>
              <th className="th-left">Lục Thân</th>
              <th className="th-canchi th-left">Can Chi</th>
              <th className="th-center">TK</th>
              <th className="th-center">Lục Thú</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const movingClass = row.isMoving ? 'row--moving' : '';

              return (
                <tr key={row.pos} className={`workspace-master-row ${movingClass}`}>
                  {/* Cột 1: Vạch Hào Quẻ Chủ (To, rõ, chiều dài âm dương bằng nhau) */}
                  <td className="cell-hex-mark cell-center">
                    {renderTableBar(
                      row.isYang,
                      row.isMoving,
                      `Hào ${row.pos}: ${row.isYang ? 'Dương' : 'Âm'}${row.isMoving ? ' (Động)' : ''}`
                    )}
                  </td>

                  {/* Cột 2: Thế / Ứng Quẻ Chủ (viết tắt T / Ư) */}
                  <td className="cell-world-response cell-center">
                    {row.isWorld && <span className="tag-the-bold" title="Thế">T</span>}
                    {row.isResponse && <span className="tag-ung-bold" title="Ứng">Ư</span>}
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
                  <td className="cell-phuc-than cell-center">
                    {row.phucThanLabel ? (
                      <span className="tag-phuc-than font-bold">{row.phucThanLabel}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>

                  {/* Cột 6: Tuần Không (TK) Quẻ Chủ (với đường phân cách mạnh mẽ bên phải) */}
                  <td className="cell-tk cell-center col-divider-right">
                    {row.isVoid && <span className="tag-tk">K</span>}
                  </td>

                  {/* Cột 7: Vạch Hào Quẻ Biến (chuyển sang bên trái của Quẻ Biến, sau TK quẻ chính) */}
                  <td className="cell-hex-mark cell-center col-divider-left">
                    {row.changingIsYang !== null ? (
                      renderTableBar(
                        row.changingIsYang,
                        row.isMoving,
                        `Hào ${row.pos} biến: ${row.changingIsYang ? 'Dương' : 'Âm'}`
                      )
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>

                  {/* Cột 8: Thế / Ứng Quẻ Biến (viết tắt T / Ư) */}
                  <td className="cell-world-response cell-center">
                    {row.changingIsWorld && <span className="tag-the-bold" title="Thế">T</span>}
                    {row.changingIsResponse && <span className="tag-ung-bold" title="Ứng">Ư</span>}
                  </td>

                  {/* Cột 9: Lục Thân Quẻ Biến */}
                  <td className={`cell-relation cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.changingRelation || '-'}
                  </td>

                  {/* Cột 10: Can Chi Quẻ Biến */}
                  <td className={`cell-canchi cell-left ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.changingCanChi || '-'}
                  </td>

                  {/* Cột 11: Tuần Không (TK) Quẻ Biến */}
                  <td className="cell-tk cell-center">
                    {row.changingVoid && <span className="tag-tk">K</span>}
                  </td>

                  {/* Cột 12: Lục Thú */}
                  <td className={`cell-spirit cell-center ${row.isMoving ? 'text-red font-bold' : ''}`}>
                    {row.sixSpiritName}
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
