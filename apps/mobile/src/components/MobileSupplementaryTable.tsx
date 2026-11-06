import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SixYaoAnalysisResult, createSupplementaryLineData, SupplementaryLineData } from '@kindich/core';

export interface MobileSupplementaryTableProps {
  sixYaoResult: SixYaoAnalysisResult;
}

// Bảng viết tắt 10 Thiên Can theo chuẩn GABDMKCTNQ
const STEM_ABBR_MAP: Record<string, string> = {
  'Giáp': 'G',
  'Ất': 'A',
  'Bính': 'B',
  'Đinh': 'D',
  'Mậu': 'M',
  'Kỷ': 'K',
  'Canh': 'C',
  'Tân': 'T',
  'Nhâm': 'N',
  'Quý': 'Q',
};

function formatLineCanChiAbbr(canChi: string): string {
  if (!canChi || canChi === '-') return '-';
  const parts = canChi.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const stem = parts[0];
    const branch = parts[1];
    const abbr = STEM_ABBR_MAP[stem] || stem;
    return `${abbr}.${branch}`;
  }
  return canChi;
}

export const MobileSupplementaryTable: React.FC<MobileSupplementaryTableProps> = ({ sixYaoResult }) => {
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
    <View style={styles.container}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.tableTitle}>BẢNG PHÂN TÍCH BỔ SUNG</Text>
        <Text style={styles.tableSubtitle}>• Tràng Sinh • Tuần Không • Lộc Mã Quý Đào</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.tableScrollContent}>
        <View style={styles.tableWrapper}>
          {/* Header các cột */}
          <View style={styles.headerRow}>
            {/* Vế Quẻ Chủ (310px) */}
            <View style={[styles.cell, styles.colHaoCanChi]}><Text style={[styles.headerText, styles.textLeft]}>Hào</Text></View>
            <View style={[styles.cell, styles.colQThan]}><Text style={styles.headerText}>Q.Thần</Text></View>
            <View style={[styles.cell, styles.colTS]}><Text style={styles.headerText}>TS.Ngày</Text></View>
            <View style={[styles.cell, styles.colTS]}><Text style={styles.headerText}>TS.Tháng</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Lộc</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Mã</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Quý</Text></View>
            <View style={[styles.cell, styles.colDeity, styles.dividerRight]}><Text style={styles.headerText}>Đào</Text></View>

            {/* Vế Quẻ Biến (310px) */}
            <View style={[styles.cell, styles.colHaoCanChi, styles.dividerLeft]}><Text style={[styles.headerText, styles.textLeft]}>Hào</Text></View>
            <View style={[styles.cell, styles.colQThan]}><Text style={styles.headerText}>Q.Thần</Text></View>
            <View style={[styles.cell, styles.colTS]}><Text style={styles.headerText}>TS.Ngày</Text></View>
            <View style={[styles.cell, styles.colTS]}><Text style={styles.headerText}>TS.Tháng</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Lộc</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Mã</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Quý</Text></View>
            <View style={[styles.cell, styles.colDeity]}><Text style={styles.headerText}>Đào</Text></View>
          </View>

          {/* Dữ liệu 6 hàng */}
          {primaryRows.map((pRow, idx) => {
            const cRow = changingRows[idx];
            const isMoving = pRow.isMoving;

            return (
              <View
                key={`supp-row-${pRow.position}`}
                style={[
                  styles.dataRow,
                  isMoving && styles.movingDataRow,
                ]}
              >
                {/* Quẻ Chủ: Can Chi */}
                <View style={[styles.cell, styles.colHaoCanChi]}>
                  <Text style={[styles.cellText, styles.textLeft, isMoving && styles.textRedBold]}>
                    {formatLineCanChiAbbr(pRow.canChi)}
                  </Text>
                </View>

                {/* Quẻ Chủ: Quái Thần */}
                <View style={[styles.cell, styles.colQThan]}>
                  <Text style={styles.mutedText}>-</Text>
                </View>

                {/* Quẻ Chủ: Tràng Sinh Ngày */}
                <View style={[styles.cell, styles.colTS]}>
                  <Text style={[styles.cellText, isMoving && styles.textRedBold]}>
                    {pRow.dayLifeStage.shortName}
                  </Text>
                </View>

                {/* Quẻ Chủ: Tràng Sinh Tháng */}
                <View style={[styles.cell, styles.colTS]}>
                  <Text style={[styles.cellText, isMoving && styles.textRedBold]}>
                    {pRow.monthLifeStage.shortName}
                  </Text>
                </View>

                {/* Quẻ Chủ: Lộc */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, pRow.deities.isLoc ? styles.textRedBold : styles.mutedText]}>
                    {pRow.deities.locLabel}
                  </Text>
                </View>

                {/* Quẻ Chủ: Mã */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, pRow.deities.isMa ? styles.textRedBold : styles.mutedText]}>
                    {pRow.deities.maLabel}
                  </Text>
                </View>

                {/* Quẻ Chủ: Quý */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, pRow.deities.isQuyNhan ? styles.textRedBold : styles.mutedText]}>
                    {pRow.deities.quyLabel}
                  </Text>
                </View>

                {/* Quẻ Chủ: Đào (với viền ngăn cách mạnh mẽ) */}
                <View style={[styles.cell, styles.colDeity, styles.dividerRight]}>
                  <Text style={[styles.deityText, pRow.deities.isDao ? styles.textRedBold : styles.mutedText]}>
                    {pRow.deities.daoLabel}
                  </Text>
                </View>

                {/* Quẻ Biến: Can Chi (với viền ngăn cách mạnh mẽ) */}
                <View style={[styles.cell, styles.colHaoCanChi, styles.dividerLeft]}>
                  <Text style={[styles.cellText, styles.textLeft, cRow?.isMoving && styles.textRedBold]}>
                    {cRow ? formatLineCanChiAbbr(cRow.canChi) : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Quái Thần */}
                <View style={[styles.cell, styles.colQThan]}>
                  <Text style={styles.mutedText}>
                    {cRow ? (cRow.position === 5 ? 'QT' : '-') : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Tràng Sinh Ngày */}
                <View style={[styles.cell, styles.colTS]}>
                  <Text style={[styles.cellText, cRow?.isMoving && styles.textRedBold]}>
                    {cRow ? cRow.dayLifeStage.shortName : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Tràng Sinh Tháng */}
                <View style={[styles.cell, styles.colTS]}>
                  <Text style={[styles.cellText, cRow?.isMoving && styles.textRedBold]}>
                    {cRow ? cRow.monthLifeStage.shortName : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Lộc */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, cRow?.deities.isLoc ? styles.textRedBold : styles.mutedText]}>
                    {cRow ? cRow.deities.locLabel : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Mã */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, cRow?.deities.isMa ? styles.textRedBold : styles.mutedText]}>
                    {cRow ? cRow.deities.maLabel : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Quý */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, cRow?.deities.isQuyNhan ? styles.textRedBold : styles.mutedText]}>
                    {cRow ? cRow.deities.quyLabel : '-'}
                  </Text>
                </View>

                {/* Quẻ Biến: Đào */}
                <View style={[styles.cell, styles.colDeity]}>
                  <Text style={[styles.deityText, cRow?.deities.isDao ? styles.textRedBold : styles.mutedText]}>
                    {cRow ? cRow.deities.daoLabel : '-'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitleRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  tableTitle: {
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#C9A227',
    letterSpacing: 0.5,
  },
  tableSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  tableScrollContent: {
    paddingHorizontal: 10,
  },
  tableWrapper: {
    minWidth: 620,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1A2332',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
  },
  headerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#E8EDF5',
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 5,
    backgroundColor: '#151B2B',
    alignItems: 'center',
  },
  movingDataRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  colHaoCanChi: { width: 76, alignItems: 'flex-start', paddingLeft: 4 },
  colQThan: { width: 38 },
  colTS: { width: 44 },
  colDeity: { width: 27 },
  dividerRight: {
    borderRightWidth: 2,
    borderRightColor: '#C9A227',
  },
  dividerLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#C9A227',
  },
  cellText: {
    fontSize: 11,
    color: '#E8EDF5',
  },
  deityText: {
    fontSize: 10.5,
  },
  textRedBold: {
    color: '#F87171',
    fontWeight: '700',
  },
  mutedText: {
    fontSize: 11,
    color: '#64748B',
  },
});
