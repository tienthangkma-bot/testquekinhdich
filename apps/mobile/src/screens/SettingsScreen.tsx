import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { BackupRestoreModal } from '../components/BackupRestoreModal';
import { ISqliteDatabase } from '../database';

export interface SettingsScreenProps {
  db?: ISqliteDatabase | null;
  onRestoreSuccess?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  db = null,
  onRestoreSuccess = () => {},
}) => {
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Header
        title="Cài Đặt & Căn Cứ"
        subtitle="Hệ thống Dịch học Cổ Pháp"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Quản lý Dữ liệu & Sao lưu Offline */}
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={[styles.cardHeader, { color: theme.colors.primary }]}>
            QUẢN LÝ DỮ LIỆU & SAO LƯU OFFLINE
          </Text>
          <Text style={styles.sourceDesc}>
            Dữ liệu của bạn được lưu trữ an toàn trong SQLite cục bộ trên thiết bị. Bạn có thể xuất file
            sao lưu JSON hoặc nhập lại dữ liệu để khôi phục hoàn toàn ngoại tuyến.
          </Text>

          <TouchableOpacity
            style={styles.backupActionBtn}
            onPress={() => setShowBackupModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.backupActionBtnText}>📦 Mở Trung Tâm Sao Lưu & Phục Hồi</Text>
          </TouchableOpacity>
        </View>

        {/* Card Phiên Bản Hệ Thống */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>THÔNG TIN PHIÊN BẢN HỆ THỐNG</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Ứng Dụng Mobile:</Text>
            <Text style={styles.value}>KinhDich Mobile v0.1.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nền Tảng Công Nghệ:</Text>
            <Text style={styles.value}>React Native + Expo SDK 52</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cơ Sở Dữ Liệu:</Text>
            <Text style={styles.value}>SQLite (Expo SQLite / better-sqlite3)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bộ Quy Tắc (RuleSet):</Text>
            <Text style={styles.value}>RULESET-KINH-DICH-V1</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phiên Bản Thuật Toán:</Text>
            <Text style={styles.value}>ALG-KINH-DICH-V1</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tiêu Chuẩn Lịch:</Text>
            <Text style={styles.value}>UTC+7 (Theo QĐ 121/CP & 134/2002)</Text>
          </View>
        </View>

        {/* Căn Cứ Học Thuật & Nguồn Cổ Pháp */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>CĂN CỨ HỌC THUẬT & TƯ LIỆU CỔ PHÁP</Text>

          <View style={styles.sourceItem}>
            <Text style={styles.sourceTitle}>1. Chu Dịch Chính Nghĩa (周易正義)</Text>
            <Text style={styles.sourceDesc}>
              Khổng Dĩnh Đạt (Đường triều) khảo cứu, xác lập thứ tự 64 Quẻ Văn Vương, Thoán Từ, Tượng Từ, Hào Từ.
            </Text>
          </View>

          <View style={styles.sourceItem}>
            <Text style={styles.sourceTitle}>2. Tăng San Bốc Dịch (增刪卜易)</Text>
            <Text style={styles.sourceDesc}>
              Dã Hạc Đạo Nhân (Thanh triều) truyền thụ, Lý Văn Huy biên tập. Chuẩn tắc phân tích Lục Hào, Nguyệt Kiến, Nhật Thần, Tuần Không, Ám Động.
            </Text>
          </View>

          <View style={styles.sourceItem}>
            <Text style={styles.sourceTitle}>3. Bốc Phệ Chính Tông (卜筮正宗)</Text>
            <Text style={styles.sourceDesc}>
              Vương Duy Đức (Thanh triều). Khẩu quyết Nạp Giáp, Lục Thân, Lục Thú, Ngũ Hành Vượng Tướng Hưu Tù Tử.
            </Text>
          </View>

          <View style={styles.sourceItem}>
            <Text style={styles.sourceTitle}>4. Mai Hoa Dịch Số (梅花易數)</Text>
            <Text style={styles.sourceDesc}>
              Tương truyền Thiệu Khang Tiết (Tống triều). Quy tắc Tiên Thiên Bát Quái, Thể Dụng sinh khắc bốc phệ.
            </Text>
          </View>
        </View>

        {/* Tôn Chỉ Phái Bắc Hà Tân An */}
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

        {/* Hướng Dẫn Chạy Trên Mobile */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>HƯỚNG DẪN KHỞI CHẠY TRÊN THIẾT BỊ</Text>
          <Text style={styles.guideStep}>
            • <Text style={styles.bold}>Chạy với Expo Go:</Text> Cài đặt ứng dụng "Expo Go" từ Google Play hoặc App Store, quét mã QR từ lệnh `npx expo start`.
          </Text>
          <Text style={styles.guideStep}>
            • <Text style={styles.bold}>Chạy trên Android Emulator:</Text> Chạy `pnpm --filter mobile android`.
          </Text>
          <Text style={styles.guideStep}>
            • <Text style={styles.bold}>Chạy trên iOS Simulator:</Text> Chạy `pnpm --filter mobile ios` (trên macOS có cài Xcode).
          </Text>
        </View>
      </ScrollView>

      {/* Modal Sao lưu & Phục hồi */}
      <BackupRestoreModal
        visible={showBackupModal}
        db={db}
        onClose={() => setShowBackupModal(false)}
        onRestoreSuccess={onRestoreSuccess}
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
  backupActionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backupActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  sourceItem: {
    marginBottom: 12,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
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
  guideStep: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 17,
  },
});
