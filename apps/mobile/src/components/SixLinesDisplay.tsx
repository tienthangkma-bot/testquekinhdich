import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Hexagram, LinePosition } from '@kindich/domain';
import { theme } from '../theme/colors';

export interface SixLinesDisplayProps {
  hexagram: Hexagram;
  movingLineIndices?: readonly LinePosition[];
  showLabels?: boolean;
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
}) => {
  const movingSet = new Set<number>(movingLineIndices);
  // hexagram.rawValues: index 0 is line 1, index 5 is line 6
  // We display from line 6 down to line 1 (indices 5, 4, 3, 2, 1, 0)
  const displayPositions = [6, 5, 4, 3, 2, 1] as const;

  return (
    <View style={styles.container}>
      {displayPositions.map((pos) => {
        const val = hexagram.rawValues[pos - 1]; // 0: Yin, 1: Yang
        const isMoving = movingSet.has(pos);
        const isYang = val === 1;

        return (
          <View
            key={`line-${pos}`}
            style={[styles.lineRow, isMoving && styles.movingLineRow]}
          >
            {showLabels && (
              <View style={styles.labelCol}>
                <Text
                  style={[styles.labelText, isMoving && styles.movingLabelText]}
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
          </View>
        );
      })}
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  movingLineRow: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.crimson[200],
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
  barsContainer: {
    flex: 1,
    paddingHorizontal: 6,
  },
  solidBar: {
    height: 12,
    borderRadius: 3,
  },
  brokenBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 12,
  },
  brokenHalfBar: {
    flex: 1,
    height: 12,
    borderRadius: 3,
  },
  brokenGap: {
    width: 14,
  },
  regularBar: {
    backgroundColor: theme.colors.dark,
  },
  movingBar: {
    backgroundColor: theme.colors.primary,
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
});
