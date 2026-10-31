import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Hexagram, LinePosition } from '@kindich/domain';
import { theme } from '../theme/colors';

export interface SixLinesDisplayProps {
  hexagram: Hexagram;
  movingLineIndices?: readonly LinePosition[];
  showLabels?: boolean;
  onLinePress?: (pos: LinePosition) => void;
}

const LINE_NAMES: Record<number, string> = {
  6: 'Hào Thượng',
  5: 'Hào Ngũ',
  4: 'Hào Tứ',
  3: 'Hào Tam',
  2: 'Hào Nhị',
  1: 'Hào Sơ',
};

export const SixLinesDisplay: React.FC<SixLinesDisplayProps> = ({
  hexagram,
  movingLineIndices = [],
  showLabels = true,
  onLinePress,
}) => {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const movingSet = new Set<number>(movingLineIndices);
  // hexagram.rawValues: index 0 is line 1, index 5 is line 6
  // We display from line 6 down to line 1 (indices 5, 4, 3, 2, 1, 0)
  const displayPositions = [6, 5, 4, 3, 2, 1] as const;

  const handlePressLine = (pos: LinePosition) => {
    setSelectedLine((prev) => (prev === pos ? null : pos));
    if (onLinePress) {
      onLinePress(pos);
    }
  };

  const selectedVal = selectedLine !== null ? hexagram.rawValues[selectedLine - 1] : null;
  const isSelectedMoving = selectedLine !== null ? movingSet.has(selectedLine) : false;

  return (
    <View style={styles.container}>
      {displayPositions.map((pos) => {
        const val = hexagram.rawValues[pos - 1]; // 0: Yin, 1: Yang
        const isMoving = movingSet.has(pos);
        const isYang = val === 1;
        const isSelected = selectedLine === pos;

        return (
          <TouchableOpacity
            key={`line-${pos}`}
            activeOpacity={0.7}
            onPress={() => handlePressLine(pos as LinePosition)}
            style={[
              styles.lineRow,
              isMoving && styles.movingLineRow,
              isSelected && styles.selectedLineRow,
            ]}
          >
            {showLabels && (
              <View style={styles.labelCol}>
                <Text
                  style={[
                    styles.labelText,
                    isMoving && styles.movingLabelText,
                    isSelected && styles.selectedLabelText,
                  ]}
                >
                  {pos}. {LINE_NAMES[pos]}
                </Text>
              </View>
            )}

            <View style={styles.barsContainer}>
              {isYang ? (
                // Dương hào: liền
                <View
                  style={[
                    styles.solidBar,
                    isMoving ? styles.movingBar : styles.regularBar,
                  ]}
                />
              ) : (
                // Âm hào: đứt ở giữa
                <View style={styles.brokenBarRow}>
                  <View
                    style={[
                      styles.brokenHalfBar,
                      isMoving ? styles.movingBar : styles.regularBar,
                    ]}
                  />
                  <View style={styles.brokenGap} />
                  <View
                    style={[
                      styles.brokenHalfBar,
                      isMoving ? styles.movingBar : styles.regularBar,
                    ]}
                  />
                </View>
              )}
            </View>

            {showLabels && (
              <View style={styles.tagCol}>
                {isMoving ? (
                  <View style={styles.movingTag}>
                    <Text style={styles.movingTagText}>⭕ Động</Text>
                  </View>
                ) : (
                  <Text style={styles.natureTagText}>
                    {isYang ? 'Dương' : 'Âm'}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Card Chi tiết hào khi người dùng chạm vào (Interactive Line Inspection) */}
      {selectedLine !== null && (
        <View style={styles.inspectionCard}>
          <View style={styles.inspectionHeader}>
            <Text style={styles.inspectionTitle}>
              Chi tiết {LINE_NAMES[selectedLine]} (Vị trí {selectedLine})
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedLine(null)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.inspectionClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inspectionContent}>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>Bản thể hào:</Text>
              <Text style={styles.inspectionVal}>
                {selectedVal === 1 ? 'Hào Dương (Cương hào ⚊)' : 'Hào Âm (Nhu hào ⚋)'}
              </Text>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>Trạng thái biến dịch:</Text>
              <Text
                style={[
                  styles.inspectionVal,
                  isSelectedMoving ? styles.inspectionValMoving : undefined,
                ]}
              >
                {isSelectedMoving
                  ? `Động hào (Phát động ➔ Biến hóa thành hào ${selectedVal === 1 ? 'Âm ⚋' : 'Dương ⚊'})`
                  : 'Hào Tĩnh (An định, không biến dịch)'}
              </Text>
            </View>
            <View style={styles.inspectionRow}>
              <Text style={styles.inspectionLabel}>Cổ pháp quy định:</Text>
              <Text style={styles.inspectionVal}>
                {selectedLine === 1
                  ? 'Sơ hào cơ sở: đại diện cho khởi nguyên, việc ban đầu, thứ dân.'
                  : selectedLine === 5
                  ? 'Ngũ hào chí tôn: ngôi quân vương, trung chính cát hanh.'
                  : selectedLine === 6
                  ? 'Thượng hào: cùng cực tất biến, thái quá tri thoái.'
                  : 'Nội ngoại trung gian: vị trí giao tiếp, quan sát ứng viện.'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  movingLineRow: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.crimson[200],
  },
  selectedLineRow: {
    borderColor: theme.colors.borderGold,
    backgroundColor: 'rgba(212, 160, 23, 0.1)',
  },
  labelCol: {
    width: 80,
  },
  labelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  movingLabelText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  selectedLabelText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  barsContainer: {
    flex: 1,
    paddingHorizontal: 6,
  },
  solidBar: {
    height: 14,
    borderRadius: 4,
  },
  brokenBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 14,
  },
  brokenHalfBar: {
    flex: 1,
    height: 14,
    borderRadius: 4,
  },
  brokenGap: {
    width: 14,
  },
  regularBar: {
    backgroundColor: theme.colors.dark,
  },
  movingBar: {
    backgroundColor: '#F87171',
    shadowColor: '#F87171',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  tagCol: {
    width: 60,
    alignItems: 'flex-end',
  },
  natureTagText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  movingTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movingTagText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '700',
  },
  inspectionCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 6,
    marginBottom: 8,
  },
  inspectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  inspectionClose: {
    fontSize: 15,
    color: theme.colors.textMuted,
    fontWeight: 'bold',
  },
  inspectionContent: {
    gap: 6,
  },
  inspectionRow: {
    flexDirection: 'column',
  },
  inspectionLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  inspectionVal: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  inspectionValMoving: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
