import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  KinhDichSettings,
  DEFAULT_KINHDICH_SETTINGS,
  ThemeMode,
  DisplayLanguage,
  FontSize,
  DefaultCastingMethod,
  SupportedTimeZone,
  DayTransitionRule,
  LeapMonthRule,
  StorageStats,
  LocalStorageSettingsRepository,
} from '@kindich/domain';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { BackupRestoreModal } from '../components/BackupRestoreModal';
import { ISqliteDatabase, SqliteDivinationRepository } from '../database';

export interface SettingsScreenProps {
  db?: ISqliteDatabase | null;
  onRestoreSuccess?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  db = null,
  onRestoreSuccess = () => {},
}) => {
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<KinhDichSettings>(DEFAULT_KINHDICH_SETTINGS);
  const [stats, setStats] = useState<StorageStats>({
    divinationCount: 0,
    noteCount: 0,
    totalSizeEstimateBytes: 0,
  });

  const getSettingsRepo = useCallback(() => {
    const divinationRepo = db ? new SqliteDivinationRepository(db) : undefined;
    return new LocalStorageSettingsRepository(undefined, divinationRepo);
  }, [db]);

  const loadData = useCallback(async () => {
    try {
      const repo = getSettingsRepo();
      const [currSettings, currStats] = await Promise.all([
        repo.getSettings(),
        repo.getStorageStats(),
      ]);
      setSettings(currSettings);
      setStats(currStats);
    } catch (err) {
      console.warn('Lỗi khi tải cài đặt mobile:', err);
    }
  }, [getSettingsRepo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateAppearance = async (field: keyof KinhDichSettings['appearance'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        appearance: {
          ...settings.appearance,
          [field]: value,
        },
      });
      setSettings(updated);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt giao diện');
    }
  };

  const handleUpdateDivination = async (field: keyof KinhDichSettings['divination'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        divination: {
          ...settings.divination,
          [field]: value,
        },
      });
      setSettings(updated);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt lập quẻ');
    }
  };

  const handleUpdateCalendar = async (field: keyof KinhDichSettings['calendar'], value: string) => {
    try {
      const repo = getSettingsRepo();
      const updated = await repo.saveSettings({
        calendar: {
          ...settings.calendar,
          [field]: value,
        },
      });
      setSettings(updated);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt lịch pháp');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Khôi phục cài đặt gốc',
      'Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định của hệ thống?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            try {
              const repo = getSettingsRepo();
              const reset = await repo.resetSettings();
              setSettings(reset);
              Alert.alert('Thành công', 'Đã khôi phục cài đặt mặc định thành công.');
            } catch {
              Alert.alert('Lỗi', 'Không thể khôi phục cài đặt.');
            }
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Cài Đặt & Cấu Hình"
        subtitle="Hệ thống Dịch học Cổ Pháp"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Cài Đặt Giao Diện (Requirement 1) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🎨 1. CÀI ĐẶT GIAO DIỆN (APPEARANCE)</Text>

          <Text style={styles.settingLabel}>Chế độ màu (Sáng / Tối):</Text>
          <View style={styles.segmentContainer}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.segmentBtn,
                  settings.appearance.theme === m && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateAppearance('theme', m)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.appearance.theme === m && styles.segmentTextActive,
                  ]}
                >
                  {m === 'light' ? '☀️ Sáng' : m === 'dark' ? '🌙 Tối' : '📱 Hệ thống'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.settingLabel}>Cỡ chữ hiển thị:</Text>
          <View style={styles.segmentContainer}>
            {(['small', 'medium', 'large'] as FontSize[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.segmentBtn,
                  settings.appearance.fontSize === f && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateAppearance('fontSize', f)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.appearance.fontSize === f && styles.segmentTextActive,
                  ]}
                >
                  {f === 'small' ? 'Nhỏ' : f === 'medium' ? 'Vừa' : 'Lớn'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.settingLabel}>Ngôn ngữ hiển thị:</Text>
          <View style={styles.segmentContainer}>
            {(['vi', 'zh', 'en'] as DisplayLanguage[]).map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.segmentBtn,
                  settings.appearance.language === l && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateAppearance('language', l)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.appearance.language === l && styles.segmentTextActive,
                  ]}
                >
                  {l === 'vi' ? 'Tiếng Việt' : l === 'zh' ? 'Hán Tự' : 'English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. Cài Đặt Lập Quẻ (Requirement 2) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🔮 2. CÀI ĐẶT LẬP QUẺ & THUẬT TOÁN</Text>

          <Text style={styles.settingLabel}>Phương pháp lập quẻ mặc định:</Text>
          <View style={styles.segmentContainer}>
            {(['serial', 'time', 'six-yao'] as DefaultCastingMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.segmentBtn,
                  settings.divination.defaultMethod === method && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateDivination('defaultMethod', method)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.divination.defaultMethod === method && styles.segmentTextActive,
                  ]}
                >
                  {method === 'serial' ? '💵 Seri' : method === 'time' ? '⏳ Mai Hoa' : '📊 Lục Hào'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.label}>Bộ quy tắc (RuleSet):</Text>
            <Text style={styles.value}>{settings.divination.ruleSetId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phiên bản thuật toán:</Text>
            <Text style={styles.value}>{settings.divination.algorithmVersion}</Text>
          </View>
        </View>

        {/* 3. Cài Đặt Lịch Pháp (Requirement 3) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📅 3. CÀI ĐẶT LỊCH PHÁP & THIÊN VĂN</Text>

          <Text style={styles.settingLabel}>Quy tắc chuyển ngày Can Chi:</Text>
          <View style={styles.segmentContainer}>
            {(['23:00', '00:00'] as DayTransitionRule[]).map((rule) => (
              <TouchableOpacity
                key={rule}
                style={[
                  styles.segmentBtn,
                  settings.calendar.dayTransitionRule === rule && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateCalendar('dayTransitionRule', rule)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.calendar.dayTransitionRule === rule && styles.segmentTextActive,
                  ]}
                >
                  {rule === '23:00' ? '23:00 (Giờ Tý)' : '00:00 (Nửa đêm)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.settingLabel}>Quy tắc tháng nhuận:</Text>
          <View style={styles.segmentContainer}>
            {(['TIET_KHI', 'TRUYEN_THONG'] as LeapMonthRule[]).map((leap) => (
              <TouchableOpacity
                key={leap}
                style={[
                  styles.segmentBtn,
                  settings.calendar.leapMonthRule === leap && styles.segmentBtnActive,
                ]}
                onPress={() => handleUpdateCalendar('leapMonthRule', leap)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    settings.calendar.leapMonthRule === leap && styles.segmentTextActive,
                  ]}
                >
                  {leap === 'TIET_KHI' ? 'Tiết Khí thiên văn' : 'Lịch vạn niên'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.label}>Múi giờ tính toán:</Text>
            <Text style={styles.value}>{settings.calendar.timeZone} (UTC+7)</Text>
          </View>
        </View>

        {/* 4. Quản Lý Dữ Liệu & Dung Lượng (Requirement 4) */}
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={[styles.cardHeader, { color: theme.colors.primary }]}>
            💾 4. QUẢN LÝ DỮ LIỆU & DUNG LƯỢNG LƯU TRỮ
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Số quẻ đã lập:</Text>
            <Text style={[styles.value, { color: theme.colors.primary }]}>{stats.divinationCount} quẻ</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Số ghi chú & nghiệm lý:</Text>
            <Text style={styles.value}>{stats.noteCount} ghi chú</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dung lượng bộ nhớ cục bộ:</Text>
            <Text style={[styles.value, { color: '#2e7d32' }]}>{formatSize(stats.totalSizeEstimateBytes)}</Text>
          </View>

          <TouchableOpacity
            style={styles.backupActionBtn}
            onPress={() => setShowBackupModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.backupActionBtnText}>📦 Mở Trung Tâm Sao Lưu & Khôi Phục</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Khôi Phục Cài Đặt Gốc (Requirement 6) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🔄 5. KHÔI PHỤC CÀI ĐẶT GỐC</Text>
          <Text style={styles.sourceDesc}>
            Đặt lại tất cả các tùy chỉnh giao diện, phương pháp lập quẻ và lịch pháp về cấu hình mặc định.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetSettings}
            activeOpacity={0.8}
          >
            <Text style={styles.resetBtnText}>Khôi phục cài đặt mặc định</Text>
          </TouchableOpacity>
        </View>

        {/* Tôn Chỉ Bắc Hà Tân An Phái (Requirement 7) */}
        <View style={[styles.card, styles.creedCard]}>
          <Text style={[styles.cardHeader, { color: theme.colors.primary }]}>
            TÔN CHỈ BẮC HÀ TÂN AN PHÁI
          </Text>
          <Text style={styles.creedText}>
            1. <Text style={styles.bold}>Trung thực:</Text> Giữ nguyên văn kinh điển, không tự bịa đặt hoặc tô vẽ thêm bớt.{'\n\n'}
            2. <Text style={styles.bold}>Khách quan:</Text> Cung cấp dữ liệu tính toán và quan hệ ngũ hành có căn cứ, không phán xét cát/hung võ đoán.{'\n\n'}
            3. <Text style={styles.bold}>Khoa học:</Text> Tách bạch tính toán toán học, thiên văn lịch pháp và diễn giải triết học.{'\n\n'}
            4. <Text style={styles.bold}>Tôn trọng sự thật:</Text> Mọi quẻ gieo đều là nhân duyên động tâm, dùng trí tuệ để tu tâm hướng thiện.
          </Text>
        </View>
      </ScrollView>

      {/* Modal Sao lưu & Phục hồi */}
      <BackupRestoreModal
        visible={showBackupModal}
        db={db}
        onClose={() => {
          setShowBackupModal(false);
          loadData();
        }}
        onRestoreSuccess={() => {
          onRestoreSuccess();
          loadData();
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  highlightCard: {
    borderColor: theme.colors.borderGold,
    backgroundColor: '#FFFDF9',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gold[800],
    letterSpacing: 0.4,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 6,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  segmentBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(152, 27, 30, 0.08)',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  backupActionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  backupActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: theme.colors.card,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '700',
  },
  sourceDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  creedCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  creedText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
});
