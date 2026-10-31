import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getFullCalendarInfo } from '@kindich/calendar';
import { theme } from '../theme/colors';
import { ScreenName } from '../types/navigation';
import { Header } from '../components/Header';

export interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const now = new Date();
  const calendarInfo = getFullCalendarInfo(now);

  return (
    <View style={styles.container}>
      <Header
        title="Kinh Dịch Tân An"
        subtitle="Hệ thống Dịch học Cổ Pháp"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Lịch Âm Dương */}
        <View style={styles.calendarBanner}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.calendarDateTitle}>
              {calendarInfo.solar.day}/{calendarInfo.solar.month}/{calendarInfo.solar.year} (Dương lịch)
            </Text>
          </View>

          <View style={styles.lunarBadge}>
            <Text style={styles.lunarDateText}>
              Âm lịch: Ngày {calendarInfo.lunar.day} tháng {calendarInfo.lunar.isLeap ? `${calendarInfo.lunar.month} (Nhuận)` : calendarInfo.lunar.month} năm {calendarInfo.canChi.year}
            </Text>
          </View>

          <View style={styles.canChiGrid}>
            <View style={styles.canChiItem}>
              <Text style={styles.canChiLabel}>NĂM</Text>
              <Text style={styles.canChiValue}>{calendarInfo.canChi.year}</Text>
            </View>
            <View style={styles.canChiItem}>
              <Text style={styles.canChiLabel}>THÁNG</Text>
              <Text style={styles.canChiValue}>{calendarInfo.canChi.month}</Text>
            </View>
            <View style={styles.canChiItem}>
              <Text style={styles.canChiLabel}>NGÀY</Text>
              <Text style={styles.canChiValue}>{calendarInfo.canChi.day}</Text>
            </View>
            <View style={styles.canChiItem}>
              <Text style={styles.canChiLabel}>GIỜ</Text>
              <Text style={styles.canChiValue}>{calendarInfo.canChi.hour}</Text>
            </View>
          </View>
        </View>

        {/* Khối Phương Pháp Lập Quẻ Chính */}
        <Text style={styles.sectionTitle}>Phương Pháp Lập Quẻ</Text>

        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => onNavigate('serial')}
          activeOpacity={0.85}
        >
          <View style={styles.heroIconBox}>
            <Text style={styles.heroIcon}>🔢</Text>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroTagRow}>
              <Text style={styles.heroTag}>CHUẨN SERIAL-MOD8-V1</Text>
            </View>
            <Text style={styles.heroTitle}>Lập Quẻ Bằng Seri Tiền</Text>
            <Text style={styles.heroDesc}>
              Sử dụng các chữ số trên tờ tiền để khởi quẻ. Vị trí lẻ làm Thượng quái, chẵn làm Hạ quái, tổng số định Hào động.
            </Text>
          </View>
          <Text style={styles.heroArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.heroCard, styles.maiHuaCard]}
          onPress={() => onNavigate('maihua')}
          activeOpacity={0.85}
        >
          <View style={[styles.heroIconBox, styles.maiHuaIconBox]}>
            <Text style={styles.heroIcon}>⏳</Text>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroTagRow}>
              <Text style={[styles.heroTag, styles.maiHuaTag]}>
                MAI HOA DỊCH SỐ
              </Text>
            </View>
            <Text style={styles.heroTitle}>Giờ Động Tâm Khởi Quẻ</Text>
            <Text style={styles.heroDesc}>
              Khởi quẻ theo Năm, Tháng, Ngày, Giờ thiên văn. Phân tích Thể Dụng sinh khắc, bốc phệ biến hóa cát hung.
            </Text>
          </View>
          <Text style={styles.heroArrow}>›</Text>
        </TouchableOpacity>

        {/* Lối tắt Lịch sử & Cài đặt */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onNavigate('history')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickIcon}>📜</Text>
            <Text style={styles.quickTitle}>Lịch Sử Quẻ</Text>
            <Text style={styles.quickDesc}>Xem lại các lần gieo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => onNavigate('settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickIcon}>⚙️</Text>
            <Text style={styles.quickTitle}>Cài Đặt & Căn Cứ</Text>
            <Text style={styles.quickDesc}>Nguồn tư liệu & RuleSet</Text>
          </TouchableOpacity>
        </View>

        {/* Châm ngôn triết lý */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteHeader}>BẮC HÀ TÂN AN PHÁI</Text>
          <Text style={styles.quoteBody}>
            "Thời hồ, thời hồ, bất đắc tái lai. Dịch dã giả, thám sách dĩ tri lai, định nghiệp dĩ thông biến."
          </Text>
          <Text style={styles.quoteSub}>
            Thuận Thiên Ứng Thời • Trung Chính Dĩ Hành
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  calendarBanner: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    fontSize: 16,
  },
  calendarDateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  lunarBadge: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 10,
  },
  lunarDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gold[900],
  },
  canChiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundSubtle,
    borderRadius: 8,
    padding: 8,
  },
  canChiItem: {
    alignItems: 'center',
    flex: 1,
  },
  canChiLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  canChiValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.crimson[200],
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  maiHuaCard: {
    borderColor: theme.colors.gold[300],
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  maiHuaIconBox: {
    backgroundColor: theme.colors.accentLight,
  },
  heroIcon: {
    fontSize: 22,
  },
  heroInfo: {
    flex: 1,
  },
  heroTagRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  heroTag: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  maiHuaTag: {
    color: theme.colors.gold[800],
    backgroundColor: theme.colors.accentLight,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  heroDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  heroArrow: {
    fontSize: 24,
    color: theme.colors.textMuted,
    marginLeft: 6,
    fontWeight: '300',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  quickCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  quickDesc: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#F9F6F0',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    marginTop: 16,
  },
  quoteHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quoteBody: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  quoteSub: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
    marginTop: 6,
  },
});
