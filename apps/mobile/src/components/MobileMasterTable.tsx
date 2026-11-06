import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SixYaoAnalysisResult } from '@kindich/core';
import { calculateHexagramPhucThan, PhucThanInfo } from '@kindich/core';
import { theme } from '../theme/colors';

export interface MobileMasterTableProps {
  sixYaoResult: SixYaoAnalysisResult;
}

export const MobileMasterTable: React.FC<MobileMasterTableProps> = ({ sixYaoResult }) => {
  const { primaryHexagram, changingHexagram } = sixYaoResult;

  // 1. Tính Phục Thần cho 6 hào của Quẻ Chủ
  const phucThanMap: Record<number, PhucThanInfo> = useMemo(() => {
    return calculateHexagramPhucThan(primaryHexagram.hexagramNumber);
  }, [primaryHexagram.hexagramNumber]);

  // 2. Lấy danh sách hào từ Hào 6 xuống Hào 1 (Quy ước hiển thị Lục Hào)
  const rows = useMemo(() => {
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

  // Vẽ vạch hào to, nét âm và nét dương có chiều dài bằng nhau
  const renderTableBar = (isYang: boolean, isMoving: boolean) => {
    const barColor = isMoving ? '#EF4444' : '#C9A227';

    return (
      <View style={styles.barWrapper}>
        <Text style={[styles.dotIndicator, { color: isMoving ? '#EF4444' : '#94A3B8' }]}>
          {isYang ? '●' : '●●'}
        </Text>
        {isYang ? (
          // Dương hào: Liền một khối, chiều dài chuẩn 44px
          <View style={[styles.solidBar, { backgroundColor: barColor }]} />
        ) : (
          // Âm hào: Đứt giữa nhưng tổng chiều dài (20 + 4 + 20 = 44px) bằng nét dương!
          <View style={styles.yinBarContainer}>
            <View style={[styles.yinSegment, { backgroundColor: barColor }]} />
            <View style={styles.yinGap} />
            <View style={[styles.yinSegment, { backgroundColor: barColor }]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.tableTitle}>BẢNG LỤC HÀO TỔNG HỢP CỔ PHÁP</Text>
        <Text style={styles.tableSubtitle}>• Hào 6 ➔ Hào 1 • Chuẩn Bát Cung & Biến Hóa</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.tableScrollContent}>
        <View style={styles.tableWrapper}>
          {/* Header nhóm 2 vế */}
          <View style={styles.superHeaderRow}>
            <View style={styles.superHeaderLeft}>
              <Text style={styles.superHeaderText}>QUẺ CHÍNH #{primaryHexagram.hexagramNumber} ({primaryHexagram.name})</Text>
            </View>
            <View style={styles.superHeaderRight}>
              <Text style={styles.superHeaderText}>
                {changingHexagram ? `QUẺ BIẾN #${changingHexagram.hexagramNumber} (${changingHexagram.name})` : 'QUẺ TĨNH (KHÔNG BIẾN)'}
              </Text>
            </View>
          </View>

          {/* Header các cột */}
          <View style={styles.headerRow}>
            {/* Quẻ Chủ */}
            <View style={[styles.cell, styles.colHex]}><Text style={styles.headerText}>Hào</Text></View>
            <View style={[styles.cell, styles.colWorld]}><Text style={styles.headerText}>T/Ư</Text></View>
            <View style={[styles.cell, styles.colRelation]}><Text style={[styles.headerText, styles.textLeft]}>Lục Thân</Text></View>
            <View style={[styles.cell, styles.colCanChi]}><Text style={[styles.headerText, styles.textLeft]}>Can Chi</Text></View>
            <View style={[styles.cell, styles.colPhuc]}><Text style={styles.headerText}>Phục</Text></View>
            <View style={[styles.cell, styles.colTK, styles.dividerRight]}><Text style={styles.headerText}>TK</Text></View>

            {/* Quẻ Biến: Cột Hào chuyển sang bên trái (sau TK quẻ chính) theo yêu cầu */}
            <View style={[styles.cell, styles.colHex, styles.dividerLeft]}><Text style={styles.headerText}>Hào</Text></View>
            <View style={[styles.cell, styles.colWorld]}><Text style={styles.headerText}>T/Ư</Text></View>
            <View style={[styles.cell, styles.colRelation]}><Text style={[styles.headerText, styles.textLeft]}>Lục Thân</Text></View>
            <View style={[styles.cell, styles.colCanChi]}><Text style={[styles.headerText, styles.textLeft]}>Can Chi</Text></View>
            <View style={[styles.cell, styles.colTK]}><Text style={styles.headerText}>TK</Text></View>
            <View style={[styles.cell, styles.colSpirit]}><Text style={styles.headerText}>Lục Thú</Text></View>
          </View>

          {/* Dữ liệu 6 hào */}
          {rows.map((row) => {
            const isMoving = row.isMoving;

            return (
              <View
                key={`master-row-${row.pos}`}
                style={[
                  styles.dataRow,
                  isMoving && styles.movingDataRow,
                ]}
              >
                {/* 1. Vạch Hào Quẻ Chủ */}
                <View style={[styles.cell, styles.colHex]}>
                  {renderTableBar(row.isYang, row.isMoving)}
                </View>

                {/* 2. Thế / Ứng Quẻ Chủ (viết tắt T / Ư) */}
                <View style={[styles.cell, styles.colWorld]}>
                  {row.isWorld ? (
                    <View style={styles.badgeThe}><Text style={styles.badgeTheText}>T</Text></View>
                  ) : row.isResponse ? (
                    <View style={styles.badgeUng}><Text style={styles.badgeUngText}>Ư</Text></View>
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 3. Lục Thân Quẻ Chủ */}
                <View style={[styles.cell, styles.colRelation]}>
                  <Text style={[styles.cellText, styles.textLeft, isMoving && styles.textRedBold]}>
                    {row.sixRelationName}
                  </Text>
                </View>

                {/* 4. Can Chi Quẻ Chủ */}
                <View style={[styles.cell, styles.colCanChi]}>
                  <Text style={[styles.cellText, styles.textLeft, isMoving && styles.textRedBold]}>
                    {row.canChiDisplay}
                  </Text>
                </View>

                {/* 5. Phục Thần */}
                <View style={[styles.cell, styles.colPhuc]}>
                  {row.phucThanLabel ? (
                    <Text style={styles.phucThanText}>{row.phucThanLabel}</Text>
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 6. Tuần Không Quẻ Chủ */}
                <View style={[styles.cell, styles.colTK, styles.dividerRight]}>
                  {row.isVoid ? (
                    <View style={styles.badgeTK}><Text style={styles.badgeTKText}>K</Text></View>
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 7. Vạch Hào Quẻ Biến (đặt sau TK quẻ chính) */}
                <View style={[styles.cell, styles.colHex, styles.dividerLeft]}>
                  {row.changingIsYang !== null ? (
                    renderTableBar(row.changingIsYang, row.isMoving)
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 8. Thế / Ứng Quẻ Biến */}
                <View style={[styles.cell, styles.colWorld]}>
                  {row.changingIsWorld ? (
                    <View style={styles.badgeThe}><Text style={styles.badgeTheText}>T</Text></View>
                  ) : row.changingIsResponse ? (
                    <View style={styles.badgeUng}><Text style={styles.badgeUngText}>Ư</Text></View>
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 9. Lục Thân Quẻ Biến */}
                <View style={[styles.cell, styles.colRelation]}>
                  <Text style={[styles.cellText, styles.textLeft, isMoving && styles.textRedBold]}>
                    {row.changingRelation || '-'}
                  </Text>
                </View>

                {/* 10. Can Chi Quẻ Biến */}
                <View style={[styles.cell, styles.colCanChi]}>
                  <Text style={[styles.cellText, styles.textLeft, isMoving && styles.textRedBold]}>
                    {row.changingCanChi || '-'}
                  </Text>
                </View>

                {/* 11. Tuần Không Quẻ Biến */}
                <View style={[styles.cell, styles.colTK]}>
                  {row.changingVoid ? (
                    <View style={styles.badgeTK}><Text style={styles.badgeTKText}>K</Text></View>
                  ) : (
                    <Text style={styles.mutedText}>-</Text>
                  )}
                </View>

                {/* 12. Lục Thú */}
                <View style={[styles.cell, styles.colSpirit]}>
                  <Text style={styles.spiritText}>{row.sixSpiritName}</Text>
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
    marginVertical: 8,
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
  superHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  superHeaderLeft: {
    width: 310,
    paddingVertical: 4,
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: '#C9A227',
  },
  superHeaderRight: {
    width: 310,
    paddingVertical: 4,
    alignItems: 'center',
  },
  superHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9A227',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1A2332',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
  },
  headerText: {
    fontSize: 11,
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
    paddingHorizontal: 3,
  },
  colHex: { width: 56 },
  colWorld: { width: 28 },
  colRelation: { width: 66, alignItems: 'flex-start' },
  colCanChi: { width: 68, alignItems: 'flex-start' },
  colPhuc: { width: 52 },
  colTK: { width: 40 },
  colSpirit: { width: 70 },
  dividerRight: {
    borderRightWidth: 2,
    borderRightColor: '#C9A227',
  },
  dividerLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#C9A227',
  },
  cellText: {
    fontSize: 11.5,
    color: '#E8EDF5',
  },
  textRedBold: {
    color: '#F87171',
    fontWeight: '700',
  },
  mutedText: {
    fontSize: 11,
    color: '#64748B',
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  dotIndicator: {
    fontSize: 9,
    marginRight: 3,
    width: 14,
    textAlign: 'center',
  },
  solidBar: {
    width: 32,
    height: 7,
    borderRadius: 3.5,
  },
  yinBarContainer: {
    flexDirection: 'row',
    width: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yinSegment: {
    width: 14,
    height: 7,
    borderRadius: 3.5,
  },
  yinGap: {
    width: 4,
  },
  badgeThe: {
    backgroundColor: '#C9A227',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeTheText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B0F1A',
  },
  badgeUng: {
    backgroundColor: '#3B82F6',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeUngText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeTK: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  badgeTKText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F87171',
  },
  phucThanText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A855F7',
  },
  spiritText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#60A5FA',
    textAlign: 'center',
  },
});
