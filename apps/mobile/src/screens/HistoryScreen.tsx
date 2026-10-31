import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { CastingMethod } from '@kindich/domain';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { MobileDivinationRecord, QuestionCategory } from '../types/navigation';

export interface HistoryScreenProps {
  history: MobileDivinationRecord[];
  onSelectRecord: (record: MobileDivinationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNavigateCast: (method: 'serial' | 'maihua') => void;
}

const CATEGORY_FILTERS: { key: string; label: string; icon: string }[] = [
  { key: 'ALL', label: 'Tất cả', icon: '🌟' },
  { key: 'work', label: 'Công việc', icon: '💼' },
  { key: 'finance', label: 'Tài chính', icon: '💰' },
  { key: 'study', label: 'Học tập', icon: '📚' },
  { key: 'family', label: 'Gia đình', icon: '🏡' },
  { key: 'relationship', label: 'Tình cảm', icon: '❤️' },
  { key: 'other', label: 'Khác', icon: '🔮' },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onNavigateCast,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Lọc lịch sử theo từ khóa tìm kiếm và danh mục
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Lọc theo danh mục
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Lọc theo từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQuestion = item.question?.toLowerCase().includes(q);
        const matchPrimary = item.trio.primary.name.toLowerCase().includes(q);
        const matchTrans = item.trio.transformed.name.toLowerCase().includes(q);
        const matchSerial = item.serialNumber?.includes(q);
        return matchQuestion || matchPrimary || matchTrans || matchSerial;
      }
      return true;
    });
  }, [history, searchQuery, selectedCategory]);

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bản ghi quẻ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onDeleteRecord(id) },
      ]
    );
  };

  const confirmClearAll = () => {
    Alert.alert(
      'Xóa toàn bộ lịch sử',
      'Thao tác này sẽ xóa tất cả các quẻ đã lưu trong phiên hiện tại. Bạn có chắc không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa tất cả', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lịch Sử Lập Quẻ"
        subtitle={`${history.length} lần gieo trong phiên`}
        rightAction={
          history.length > 0 ? (
            <TouchableOpacity onPress={confirmClearAll} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>Xóa hết</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm câu hỏi, tên quẻ, số seri..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Bộ lọc danh mục */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedCategory(item.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.filterChipIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách quẻ */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>Chưa Có Dữ Liệu Quẻ</Text>
            <Text style={styles.emptyDesc}>
              {history.length === 0
                ? 'Bạn chưa lập quẻ nào trong phiên hiện tại.'
                : 'Không tìm thấy quẻ phù hợp với bộ lọc tìm kiếm.'}
            </Text>
            <View style={styles.emptyActionsRow}>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => onNavigateCast('serial')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>🔢 Lập Seri Tiền</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emptyButton, styles.emptyButtonGold]}
                onPress={() => onNavigateCast('maihua')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyButtonText, styles.emptyButtonTextGold]}>
                  ⏳ Lập Mai Hoa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.recordCard}
              onPress={() => onSelectRecord(item)}
              activeOpacity={0.75}
            >
              <View style={styles.recordHeader}>
                <View style={styles.methodTag}>
                  <Text style={styles.methodTagText}>
                    {item.method === CastingMethod.SERIAL ? '🔢 SERI TIỀN' : '⏳ MAI HOA'}
                  </Text>
                </View>
                <Text style={styles.recordDateText}>
                  {item.dateTimeInfo.solarDateStr}
                </Text>
                <TouchableOpacity
                  style={styles.deleteItemBtn}
                  onPress={() => confirmDelete(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteItemBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {item.question ? (
                <Text style={styles.recordQuestion} numberOfLines={2}>
                  "{item.question}"
                </Text>
              ) : null}

              <View style={styles.hexRow}>
                <View style={styles.hexBlock}>
                  <Text style={styles.hexSymbol}>{item.trio.primary.symbol}</Text>
                  <View style={styles.hexNameCol}>
                    <Text style={styles.hexRoleText}>QUẺ CHỦ</Text>
                    <Text style={styles.hexNameText} numberOfLines={1}>
                      {item.trio.primary.name}
                    </Text>
                  </View>
                </View>

                <Text style={styles.transformArrow}>➔</Text>

                <View style={styles.hexBlock}>
                  <Text style={styles.hexSymbol}>{item.trio.transformed.symbol}</Text>
                  <View style={styles.hexNameCol}>
                    <Text style={styles.hexRoleText}>QUẺ BIẾN</Text>
                    <Text style={styles.hexNameText} numberOfLines={1}>
                      {item.trio.transformed.name}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.recordFooter}>
                <Text style={styles.movingSummaryText}>
                  {item.movingLines.length > 0
                    ? `Hào động: ${item.movingLines.map((l) => `Hào ${l}`).join(', ')}`
                    : 'Quẻ tĩnh (Không có hào động)'}
                </Text>
                <Text style={styles.viewDetailText}>Chi tiết ›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  clearBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
  },
  filtersWrapper: {
    paddingBottom: 8,
  },
  filterList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  filterChipIcon: {
    fontSize: 12,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  recordCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  methodTag: {
    backgroundColor: theme.colors.backgroundSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  recordDateText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    flex: 1,
    marginLeft: 8,
  },
  deleteItemBtn: {
    padding: 2,
  },
  deleteItemBtnText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  recordQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSubtle,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  hexBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  hexSymbol: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  hexNameCol: {
    flex: 1,
  },
  hexRoleText: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  hexNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  transformArrow: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginHorizontal: 8,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movingSummaryText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  viewDetailText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonGold: {
    backgroundColor: theme.colors.accentLight,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  emptyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },
  emptyButtonTextGold: {
    color: theme.colors.gold[900],
  },
});
