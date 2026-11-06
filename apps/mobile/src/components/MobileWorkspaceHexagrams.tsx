import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  Hexagram,
  HexagramTrio,
  LinePosition,
  getPalaceInfoByHexagramNumber,
  getHexagramOmen,
} from '@kindich/domain';

export interface MobileWorkspaceHexagramsProps {
  trio: HexagramTrio;
}

export const MobileWorkspaceHexagrams: React.FC<MobileWorkspaceHexagramsProps> = ({ trio }) => {
  const { primary, nuclear, transformed, movingLineIndices } = trio;

  // Lời Triệu
  const primaryOmen = getHexagramOmen(primary.number);
  const nuclearOmen = nuclear ? getHexagramOmen(nuclear.number) : null;
  const transformedOmen = transformed ? getHexagramOmen(transformed.number) : null;

  // Bát Cung
  const primaryPalace = getPalaceInfoByHexagramNumber(primary.number);
  const nuclearPalace = nuclear ? getPalaceInfoByHexagramNumber(nuclear.number) : null;
  const transformedPalace = transformed ? getPalaceInfoByHexagramNumber(transformed.number) : null;

  const renderHexLines = (hex: Hexagram, isPrimary: boolean, isTransformed: boolean) => {
    // lines: index 0 is line 1, index 5 is line 6 -> đảo ngược để vẽ từ Hào 6 xuống Hào 1
    const reversed = [...hex.lines].reverse();

    return (
      <View style={styles.hexLinesContainer}>
        {reversed.map((line) => {
          const pos = line.position as LinePosition;
          const isMoving = movingLineIndices.includes(pos);
          const isYang = line.value === 1;
          const isHighlight = (isPrimary && isMoving) || (isTransformed && isMoving);
          const barColor = isHighlight ? '#EF4444' : '#C9A227';

          return (
            <View key={`hex-line-${hex.number}-${pos}`} style={styles.hexLineRow}>
              <Text style={[styles.posLabel, isHighlight && styles.posLabelMoving]}>
                {pos}
              </Text>
              <View style={styles.barArea}>
                {isYang ? (
                  <View style={[styles.solidBar, { backgroundColor: barColor }]} />
                ) : (
                  <View style={styles.brokenBarRow}>
                    <View style={[styles.brokenBarHalf, { backgroundColor: barColor }]} />
                    <View style={styles.brokenBarGap} />
                    <View style={[styles.brokenBarHalf, { backgroundColor: barColor }]} />
                  </View>
                )}
              </View>
              {isHighlight ? (
                <View style={styles.movingDot}>
                  <Text style={styles.movingDotText}>●</Text>
                </View>
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderCard = (
    title: string,
    roleTag: string,
    hex: Hexagram,
    omenText: string,
    palaceName?: string,
    palaceElement?: string,
    isPrimary = false,
    isTransformed = false
  ) => {
    return (
      <View style={[styles.hexCard, isPrimary && styles.primaryCard]}>
        {/* Header thẻ */}
        <View style={styles.cardHeader}>
          <View style={[styles.roleBadge, isPrimary ? styles.roleBadgePrimary : isTransformed ? styles.roleBadgeTransformed : styles.roleBadgeNuclear]}>
            <Text style={styles.roleBadgeText}>{roleTag}</Text>
          </View>
          <Text style={styles.hexNumberText}>#{hex.number}</Text>
        </View>

        {/* Tên Quẻ */}
        <Text style={styles.hexName} numberOfLines={1}>{hex.name}</Text>
        <Text style={styles.sinoName}>
          {hex.sinoVietnameseName} • {hex.chineseName}
        </Text>

        {/* Cung quái & Quẻ đơn */}
        <View style={styles.palaceBadge}>
          <Text style={styles.palaceText}>
            Cung {palaceName || '—'} ({palaceElement || '—'})
          </Text>
        </View>

        <View style={styles.trigramsRow}>
          <Text style={styles.trigramText}>
            Thượng: {hex.upperTrigram.name} ({hex.upperTrigram.element})
          </Text>
          <Text style={styles.trigramDivider}>•</Text>
          <Text style={styles.trigramText}>
            Hạ: {hex.lowerTrigram.name} ({hex.lowerTrigram.element})
          </Text>
        </View>

        {/* 6 vạch hào */}
        {renderHexLines(hex, isPrimary, isTransformed)}

        {/* Lời Triệu Cổ Bản */}
        <View style={styles.omenBox}>
          <Text style={styles.omenLabel}>📜 Lời Triệu:</Text>
          <Text style={styles.omenValue} numberOfLines={2}>{omenText}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>HÌNH TƯỢNG BỘ BA QUẺ</Text>
        <Text style={styles.sectionSubtitle}>Chủ ➔ Hỗ ➔ Biến</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsScroll}
        decelerationRate="fast"
        snapToInterval={228}
      >
        {/* 1. Quẻ Chủ */}
        {renderCard(
          'Quẻ Chủ',
          'QUẺ CHỦ',
          primary,
          primaryOmen.omen,
          primaryPalace.palaceName,
          primaryPalace.palaceElement,
          true,
          false
        )}

        {/* 2. Quẻ Hỗ */}
        {nuclear &&
          renderCard(
            'Quẻ Hỗ',
            'QUẺ HỖ',
            nuclear,
            nuclearOmen ? nuclearOmen.omen : 'Chưa xác định',
            nuclearPalace?.palaceName,
            nuclearPalace?.palaceElement,
            false,
            false
          )}

        {/* 3. Quẻ Biến */}
        {transformed &&
          renderCard(
            'Quẻ Biến',
            'QUẺ BIẾN',
            transformed,
            transformedOmen ? transformedOmen.omen : 'Chưa xác định',
            transformedPalace?.palaceName,
            transformedPalace?.palaceElement,
            false,
            true
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  titleRow: {
    paddingHorizontal: 16,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#C9A227',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardsScroll: {
    paddingHorizontal: 12,
    gap: 10,
  },
  hexCard: {
    width: 218,
    backgroundColor: '#151B2B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryCard: {
    borderColor: 'rgba(201, 162, 39, 0.45)',
    backgroundColor: '#172033',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleBadgePrimary: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    borderWidth: 1,
    borderColor: '#C9A227',
  },
  roleBadgeNuclear: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  roleBadgeTransformed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E8EDF5',
  },
  hexNumberText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  hexName: {
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    color: '#E8EDF5',
    marginTop: 2,
  },
  sinoName: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
    marginBottom: 4,
  },
  palaceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    marginBottom: 4,
  },
  palaceText: {
    fontSize: 10,
    color: '#C9A227',
    fontWeight: '600',
  },
  trigramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trigramText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  trigramDivider: {
    marginHorizontal: 4,
    color: '#64748B',
    fontSize: 9,
  },
  hexLinesContainer: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    gap: 4.5,
  },
  hexLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posLabel: {
    width: 14,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  posLabelMoving: {
    color: '#EF4444',
    fontWeight: '700',
  },
  barArea: {
    flex: 1,
    marginHorizontal: 6,
    height: 9,
    justifyContent: 'center',
  },
  solidBar: {
    width: '100%',
    height: 7.5,
    borderRadius: 3.5,
  },
  brokenBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brokenBarHalf: {
    width: '46%',
    height: 7.5,
    borderRadius: 3.5,
  },
  brokenBarGap: {
    width: '8%',
  },
  movingDot: {
    width: 12,
    alignItems: 'center',
  },
  movingDotText: {
    fontSize: 9,
    color: '#EF4444',
  },
  emptyDot: {
    width: 12,
  },
  omenBox: {
    backgroundColor: 'rgba(201, 162, 39, 0.08)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A227',
    padding: 6,
  },
  omenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C9A227',
    marginBottom: 1,
  },
  omenValue: {
    fontSize: 11,
    color: '#E8EDF5',
    fontStyle: 'italic',
  },
});
