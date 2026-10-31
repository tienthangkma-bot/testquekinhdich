import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SixYaoAnalysisResult, AnalyzedSixYaoLine } from '@kindich/core';
import { theme } from '../theme/colors';

export interface SixYaoTableProps {
  analysis: SixYaoAnalysisResult;
}

interface SixYaoLineCardProps {
  line: AnalyzedSixYaoLine;
  isSelected: boolean;
  onToggle: (position: number) => void;
  dayCanChi: string;
  monthCanChi: string;
}

const SixYaoLineCardComponent: React.FC<SixYaoLineCardProps> = ({
  line,
  isSelected,
  onToggle,
  dayCanChi,
  monthCanChi,
}) => {
  const isShi = line.isWorld;
  const isYing = line.isResponse;
  const isMoving = line.isMoving;

  return (
    <TouchableOpacity
      style={[
        styles.yaoCard,
        isSelected && styles.selectedYaoCard,
        isMoving && styles.movingYaoCard,
      ]}
      onPress={() => onToggle(line.position)}
      activeOpacity={0.8}
    >
      <View style={styles.yaoCardHeader}>
        <View style={styles.yaoPosBadge}>
          <Text style={styles.yaoPosText}>Hào {line.position}</Text>
          {isShi && (
            <View style={styles.shiBadge}>
              <Text style={styles.badgeText}>THẾ</Text>
            </View>
          )}
          {isYing && (
            <View style={styles.yingBadge}>
              <Text style={styles.badgeText}>ỨNG</Text>
            </View>
          )}
          {isMoving && (
            <View style={styles.movingBadge}>
              <Text style={styles.badgeText}>ĐỘNG</Text>
            </View>
          )}
        </View>

        <View style={styles.beastBadge}>
          <Text style={styles.beastText}>{line.sixSpiritName}</Text>
        </View>
      </View>

      <View style={styles.yaoCardBody}>
        <View style={styles.relationCol}>
          <Text style={styles.relationText}>{line.fullRelationLabel}</Text>
          <Text style={styles.elementSubText}>
            {line.canChi} ({line.elementName}) • {line.yinYang === 1 ? 'Dương' : 'Âm'}
          </Text>
        </View>

        <View style={styles.strengthCol}>
          <View
            style={[
              styles.strengthPill,
              line.strength.seasonalState === 'VUONG' && styles.vuongPill,
              line.strength.seasonalState === 'TUONG' && styles.tuongPill,
            ]}
          >
            <Text style={styles.strengthText}>{line.strength.seasonalStateName}</Text>
          </View>
          {line.calendar.isVoid && (
            <Text style={styles.voidWarningText}>
              [{line.strength.voidStatus === 'CHAN_KHONG' ? 'Chân Không' : 'Giả Không'}]
            </Text>
          )}
          {line.calendar.isMonthlyBreak && (
            <Text style={styles.voidWarningText}>[Nguyệt Phá]</Text>
          )}
          {line.strength.isAmDong && (
            <Text style={[styles.voidWarningText, { color: theme.colors.gold[800] }]}>
              [Ám Động]
            </Text>
          )}
          {line.strength.isNhatPha && (
            <Text style={styles.voidWarningText}>[Nhật Phá]</Text>
          )}
        </View>
      </View>

      {/* Chi tiết khi mở rộng */}
      {isSelected && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailTitle}>Chi tiết phân tích:</Text>
          <Text style={styles.detailItem}>
            • Nguyệt Kiến ({monthCanChi}): {line.calendar.monthEffect || 'Bình hòa'}
          </Text>
          <Text style={styles.detailItem}>
            • Nhật Thần ({dayCanChi}): {line.calendar.dayEffect || 'Bình hòa'}
          </Text>
          {line.changingLine && (
            <Text style={[styles.detailItem, { color: theme.colors.primary }]}>
              • Hóa biến: {line.changingLine.interaction.description}
            </Text>
          )}
          {line.strength.rationale ? (
            <Text style={styles.detailNotes}>• Đánh giá: {line.strength.rationale}</Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const SixYaoLineCard = React.memo(SixYaoLineCardComponent);

export const SixYaoTable: React.FC<SixYaoTableProps> = ({ analysis }) => {
  const [selectedYao, setSelectedYao] = useState<number | null>(null);

  const primary = analysis.primaryHexagram;
  // Memoize danh sách hào đảo ngược để tránh cấp phát mảng mới trên mỗi render
  const reversedLines = useMemo(() => [...primary.lines].reverse(), [primary.lines]);

  const handleToggleYao = useCallback((pos: number) => {
    setSelectedYao((prev) => (prev === pos ? null : pos));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerInfoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bát Cung:</Text>
          <Text style={styles.infoValue}>
            {primary.palace.name} ({primary.palace.elementName}) • {primary.palace.generationStageName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hào Thế / Ứng:</Text>
          <Text style={styles.infoValue}>
            Thế hào {primary.palace.worldLine} • Ứng hào {primary.palace.responseLine}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nhật Thần / Nguyệt Kiến:</Text>
          <Text style={styles.infoValue}>
            Ngày {analysis.dateTime.canChi.day} • Tháng {analysis.dateTime.canChi.month}
          </Text>
        </View>
        {analysis.dateTime.dayMaster?.voidBranches && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuần Không (Không Vong):</Text>
            <Text style={[styles.infoValue, { color: theme.colors.crimson[600] }]}>
              {analysis.dateTime.dayMaster.voidBranches.join(', ')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.guideText}>
        💡 Chạm vào từng hào bên dưới để xem giải thích chi tiết
      </Text>

      <View style={styles.linesList}>
        {reversedLines.map((line: AnalyzedSixYaoLine) => (
          <SixYaoLineCard
            key={`yao-${line.position}`}
            line={line}
            isSelected={selectedYao === line.position}
            onToggle={handleToggleYao}
            dayCanChi={analysis.dateTime.canChi.day}
            monthCanChi={analysis.dateTime.canChi.month}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerInfoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '700',
  },
  guideText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  linesList: {
    gap: 8,
  },
  yaoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
  },
  selectedYaoCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#FFFDFD',
  },
  movingYaoCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  yaoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  yaoPosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yaoPosText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  shiBadge: {
    backgroundColor: theme.colors.crimson[700],
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  yingBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  movingBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: '700',
  },
  beastBadge: {
    backgroundColor: theme.colors.backgroundSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beastText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  yaoCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relationCol: {
    flex: 1,
  },
  relationText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  elementSubText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  strengthCol: {
    alignItems: 'flex-end',
  },
  strengthPill: {
    backgroundColor: theme.colors.backgroundMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  vuongPill: {
    backgroundColor: '#E8F5E9',
  },
  tuongPill: {
    backgroundColor: '#FFF8E1',
  },
  strengthText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text,
  },
  voidWarningText: {
    fontSize: 10,
    color: theme.colors.crimson[700],
    fontWeight: '700',
    marginTop: 2,
  },
  detailsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  detailItem: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  detailNotes: {
    fontSize: 11,
    color: theme.colors.accent,
    marginTop: 2,
  },
});
