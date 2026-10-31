import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CastingMethod } from '@kindich/domain';
import { getClassicalHexagramData } from '@kindich/core';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { SixLinesDisplay } from '../components/SixLinesDisplay';
import { SixYaoTable } from '../components/SixYaoTable';
import { MobileDivinationRecord } from '../types/navigation';

export interface HexagramResultScreenProps {
  record: MobileDivinationRecord;
  onBack: () => void;
  onNewCast: () => void;
}

export const HexagramResultScreen: React.FC<HexagramResultScreenProps> = ({
  record,
  onBack,
  onNewCast,
}) => {
  const [activeTab, setActiveTab] = useState<'trio' | 'sixyao' | 'texts'>('trio');

  const { trio, movingLines, sixYaoAnalysis, theDung, dateTimeInfo, question, method } = record;

  // Lấy dữ liệu kinh văn cổ điển
  const classicalLookup = getClassicalHexagramData(trio.primary.number);
  const classicalData = classicalLookup.status === 'AVAILABLE' ? classicalLookup.data : null;

  return (
    <View style={styles.container}>
      <Header
        title="Kết Quả Chiêm Bói"
        subtitle={
          method === CastingMethod.SERIAL
            ? '🔢 Seri tiền (SERIAL-MOD8-V1)'
            : '⏳ Giờ động tâm (Mai Hoa)'
        }
        showBackButton={true}
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={onNewCast} activeOpacity={0.7}>
            <Text style={styles.newCastBtnText}>+ Lập mới</Text>
          </TouchableOpacity>
        }
      />

      {/* Tabs điều hướng kết quả */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'trio' && styles.activeTabItem]}
          onPress={() => setActiveTab('trio')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'trio' && styles.activeTabItemText]}
          >
            ☯ Bộ Ba Quẻ
          </Text>
        </TouchableOpacity>

        {sixYaoAnalysis && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'sixyao' && styles.activeTabItem]}
            onPress={() => setActiveTab('sixyao')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'sixyao' && styles.activeTabItemText,
              ]}
            >
              📊 Đồ Bản Lục Hào
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'texts' && styles.activeTabItem]}
          onPress={() => setActiveTab('texts')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'texts' && styles.activeTabItemText]}
          >
            📜 Kinh Văn Thoán Hào
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner thông tin lần lập quẻ */}
        <View style={styles.metaCard}>
          {question ? (
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Việc cần hỏi:</Text>
              <Text style={styles.questionText}>"{question}"</Text>
            </View>
          ) : null}

          <View style={styles.dateTimeBox}>
            <Text style={styles.dateText}>
              🕒 {dateTimeInfo.solarDateStr} (Dương lịch)
            </Text>
            <Text style={styles.canChiText}>
              Âm lịch: {dateTimeInfo.lunarDateStr} • Can Chi: {dateTimeInfo.dayCanChi} (Ngày) - {dateTimeInfo.monthCanChi} (Tháng)
            </Text>
          </View>
        </View>

        {/* TAB 1: BỘ BA QUẺ & THỂ DỤNG */}
        {activeTab === 'trio' && (
          <View>
            {/* Phân tích Thể Dụng (Mai Hoa) nếu có */}
            {theDung && (
              <View style={styles.theDungCard}>
                <Text style={styles.theDungTitle}>Phân Tích Thể / Dụng (Mai Hoa)</Text>
                <View style={styles.theDungRow}>
                  <View style={styles.theDungCol}>
                    <Text style={styles.theDungLabel}>QUÁI THỂ (Chủ):</Text>
                    <Text style={styles.theDungValue}>{theDung.theTrigramName}</Text>
                    <Text style={styles.theDungSub}>Vị trí: {theDung.theLocation === 'upper' ? 'Thượng' : 'Hạ'}</Text>
                  </View>
                  <Text style={styles.theDungVersus}>⚡</Text>
                  <View style={styles.theDungCol}>
                    <Text style={styles.theDungLabel}>QUÁI DỤNG (Biến):</Text>
                    <Text style={[styles.theDungValue, { color: theme.colors.primary }]}>
                      {theDung.dungTrigramName}
                    </Text>
                    <Text style={styles.theDungSub}>Vị trí: {theDung.dungLocation === 'upper' ? 'Thượng' : 'Hạ'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Quẻ Chủ */}
            <View style={styles.hexCard}>
              <View style={styles.hexCardHeader}>
                <View style={styles.hexTitleCol}>
                  <View style={styles.hexTag}>
                    <Text style={styles.hexTagText}>QUẺ CHỦ #{trio.primary.number}</Text>
                  </View>
                  <Text style={styles.hexName}>
                    {trio.primary.name}
                  </Text>
                  <Text style={styles.hexSubName}>
                    {trio.primary.sinoVietnameseName} • {trio.primary.chineseName}
                  </Text>
                </View>
                <Text style={styles.hexSymbol}>{trio.primary.symbol}</Text>
              </View>

              <View style={styles.trigramsBar}>
                <Text style={styles.trigramText}>
                  Thượng: {trio.primary.upperTrigram.name} ({trio.primary.upperTrigram.symbol})
                </Text>
                <Text style={styles.trigramDivider}>•</Text>
                <Text style={styles.trigramText}>
                  Hạ: {trio.primary.lowerTrigram.name} ({trio.primary.lowerTrigram.symbol})
                </Text>
              </View>

              <SixLinesDisplay
                hexagram={trio.primary}
                movingLineIndices={movingLines}
              />
            </View>

            {/* Quẻ Biến & Quẻ Hỗ */}
            <View style={styles.trioSecondaryGrid}>
              {/* Quẻ Biến */}
              <View style={[styles.hexCard, styles.secondaryCard]}>
                <View style={styles.secondaryHeader}>
                  <Text style={styles.secondaryBadge}>
                    QUẺ BIẾN #{trio.transformed.number}
                  </Text>
                  <Text style={styles.secondarySymbol}>
                    {trio.transformed.symbol}
                  </Text>
                </View>
                <Text style={styles.secondaryName}>
                  {trio.transformed.name}
                </Text>
                <Text style={styles.secondarySubName}>
                  ({trio.transformed.sinoVietnameseName})
                </Text>
                <SixLinesDisplay
                  hexagram={trio.transformed}
                  movingLineIndices={[]}
                  showLabels={false}
                />
              </View>

              {/* Quẻ Hỗ */}
              <View style={[styles.hexCard, styles.secondaryCard]}>
                <View style={styles.secondaryHeader}>
                  <Text style={[styles.secondaryBadge, styles.nuclearBadge]}>
                    QUẺ HỖ #{trio.nuclear.number}
                  </Text>
                  <Text style={styles.secondarySymbol}>
                    {trio.nuclear.symbol}
                  </Text>
                </View>
                <Text style={styles.secondaryName}>{trio.nuclear.name}</Text>
                <Text style={styles.secondarySubName}>
                  ({trio.nuclear.sinoVietnameseName})
                </Text>
                <SixLinesDisplay
                  hexagram={trio.nuclear}
                  movingLineIndices={[]}
                  showLabels={false}
                />
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: ĐỒ BẢN LỤC HÀO CỔ PHÁP */}
        {activeTab === 'sixyao' && sixYaoAnalysis && (
          <View>
            <SixYaoTable analysis={sixYaoAnalysis} />
          </View>
        )}

        {/* TAB 3: KINH VĂN THOÁN HÀO */}
        {activeTab === 'texts' && (
          <View style={styles.textsContainer}>
            {/* Thoán từ */}
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Thoán Từ (Lời Quán Quẻ)</Text>
              <Text style={styles.textOriginal}>
                {classicalData?.thuanTu.chinese || 'Chưa có bản văn chữ Hán.'}
              </Text>
              {classicalData?.thuanTu.sinoVietnamese && (
                <Text style={styles.textSino}>
                  Phiên âm: {classicalData.thuanTu.sinoVietnamese}
                </Text>
              )}
              <Text style={styles.textTranslation}>
                Dịch nghĩa: {classicalData?.thuanTu.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>
            </View>

            {/* Đại Tượng */}
            <View style={styles.textSection}>
              <Text style={styles.textSectionTitle}>Đại Tượng Từ (Tượng Quẻ)</Text>
              <Text style={styles.textOriginal}>
                {classicalData?.daiTuong.chinese || 'Chưa có bản văn tượng quẻ.'}
              </Text>
              {classicalData?.daiTuong.sinoVietnamese && (
                <Text style={styles.textSino}>
                  Phiên âm: {classicalData.daiTuong.sinoVietnamese}
                </Text>
              )}
              <Text style={styles.textTranslation}>
                Dịch nghĩa: {classicalData?.daiTuong.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>
            </View>

            {/* Hào từ của các hào động */}
            {movingLines.length > 0 && (
              <View style={styles.textSection}>
                <Text style={styles.textSectionTitle}>
                  Hào Từ Các Hào Động ({movingLines.map((l: number) => `Hào ${l}`).join(', ')})
                </Text>
                {movingLines.map((pos: number) => {
                  const lineText = classicalData?.lines.find(
                    (l) => l.position === pos
                  );
                  return (
                    <View key={`moving-text-${pos}`} style={styles.movingTextItem}>
                      <Text style={styles.movingLineTitle}>
                        • Hào {pos} ({lineText?.lineName || `Hào ${pos}`}):
                      </Text>
                      <Text style={styles.textOriginal}>{lineText?.haoTu.chinese}</Text>
                      {lineText?.haoTu.sinoVietnamese && (
                        <Text style={styles.textSino}>
                          Phiên âm: {lineText.haoTu.sinoVietnamese}
                        </Text>
                      )}
                      {lineText?.haoTu.translation && (
                        <Text style={styles.textTranslation}>
                          Dịch nghĩa: {lineText.haoTu.translation}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  newCastBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: theme.colors.primary,
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabItemText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  metaCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  questionBox: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  questionLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
  },
  dateTimeBox: {
    gap: 2,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  canChiText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gold[800],
  },
  theDungCard: {
    backgroundColor: theme.colors.accentLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 12,
  },
  theDungTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gold[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  theDungRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  theDungCol: {
    alignItems: 'center',
  },
  theDungLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  theDungValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginVertical: 2,
  },
  theDungSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  theDungVersus: {
    fontSize: 18,
    color: theme.colors.gold[600],
  },
  hexCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hexCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hexTitleCol: {
    flex: 1,
  },
  hexTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  hexTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  hexName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  hexSubName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  hexSymbol: {
    fontSize: 36,
    lineHeight: 40,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  trigramsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  trigramText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  trigramDivider: {
    marginHorizontal: 8,
    color: theme.colors.textMuted,
  },
  trioSecondaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryCard: {
    flex: 1,
    borderColor: theme.colors.border,
    padding: 10,
  },
  secondaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  secondaryBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  nuclearBadge: {
    color: theme.colors.gold[800],
  },
  secondarySymbol: {
    fontSize: 22,
    color: theme.colors.text,
  },
  secondaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  secondarySubName: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  textsContainer: {
    gap: 12,
  },
  textSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  textOriginal: {
    fontSize: 13,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 4,
  },
  textSino: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  textTranslation: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  movingTextItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  movingLineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
});
