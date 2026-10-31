import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CastingMethod } from '@kindich/domain';
import { castByMaiHua, orchestrateSixYaoAnalysis } from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { MobileDivinationRecord, QuestionCategory } from '../types/navigation';

export interface MaiHuaCastingScreenProps {
  onBack: () => void;
  onCastSuccess: (record: MobileDivinationRecord) => void;
}

const CATEGORIES: { key: QuestionCategory; label: string; icon: string }[] = [
  { key: 'work', label: 'Công việc', icon: '💼' },
  { key: 'finance', label: 'Tài chính', icon: '💰' },
  { key: 'study', label: 'Học tập', icon: '📚' },
  { key: 'family', label: 'Gia đình', icon: '🏡' },
  { key: 'relationship', label: 'Tình cảm', icon: '❤️' },
  { key: 'other', label: 'Khác', icon: '🔮' },
];

export const MaiHuaCastingScreen: React.FC<MaiHuaCastingScreenProps> = ({
  onBack,
  onCastSuccess,
}) => {
  const now = new Date();
  const [year, setYear] = useState<string>(String(now.getFullYear()));
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1));
  const [day, setDay] = useState<string>(String(now.getDate()));
  const [hour, setHour] = useState<string>(String(now.getHours()));
  const [minute, setMinute] = useState<string>(String(now.getMinutes()));
  const [question, setQuestion] = useState<string>('');
  const [category, setCategory] = useState<QuestionCategory>('work');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set thời gian hiện tại
  const setNowTime = () => {
    const current = new Date();
    setYear(String(current.getFullYear()));
    setMonth(String(current.getMonth() + 1));
    setDay(String(current.getDate()));
    setHour(String(current.getHours()));
    setMinute(String(current.getMinutes()));
    setErrorMsg(null);
  };

  // Tính thử thông tin lịch để hiển thị Can Chi preview
  const previewCalendar = useMemo(() => {
    try {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const d = parseInt(day, 10);
      const h = parseInt(hour, 10);
      const min = parseInt(minute, 10) || 0;

      if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
        return null;
      }
      const testDate = new Date(y, m - 1, d, h, min);
      return getFullCalendarInfo(testDate);
    } catch {
      return null;
    }
  }, [year, month, day, hour, minute]);

  const handleCast = () => {
    setErrorMsg(null);
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const h = parseInt(hour, 10);
    const min = parseInt(minute, 10) || 0;

    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h)) {
      setErrorMsg('Vui lòng nhập đầy đủ và chính xác các trường ngày, tháng, năm, giờ.');
      return;
    }

    if (m < 1 || m > 12) {
      setErrorMsg('Tháng phải nằm trong khoảng từ 1 đến 12.');
      return;
    }

    if (d < 1 || d > 31) {
      setErrorMsg('Ngày phải nằm trong khoảng từ 1 đến 31.');
      return;
    }

    if (h < 0 || h > 23) {
      setErrorMsg('Giờ phải nằm trong khoảng từ 0 đến 23.');
      return;
    }

    try {
      setLoading(true);
      const targetDate = new Date(y, m - 1, d, h, min);
      const cal = getFullCalendarInfo(targetDate, { dayTransition: 'RAT_HOUR_23' });

      // Tính số thứ tự Địa Chi năm (1-12) và Địa Chi giờ (1-12)
      const yearBranchIndex = ((cal.lunar.year + 8) % 12 + 12) % 12;
      const yearBranchNumber = yearBranchIndex + 1;
      const hourBranchNumber = cal.currentHourBranch.index + 1;

      // Gọi core engine Mai Hoa Dịch Số
      const maiHuaResult = castByMaiHua({
        yearBranch: yearBranchNumber,
        month: Math.abs(cal.lunar.month),
        day: cal.lunar.day,
        hourBranch: hourBranchNumber,
      });

      // Phân tích Lục Hào Cổ Pháp
      const sixYaoAnalysis = orchestrateSixYaoAnalysis({
        primaryHexagram: maiHuaResult.trio.primary,
        changingHexagram: maiHuaResult.trio.transformed,
        movingLineIndices: maiHuaResult.trio.movingLineIndices,
        dateTime: {
          dayCanChi: cal.canChi.day,
          monthCanChi: cal.canChi.month,
          yearCanChi: cal.canChi.year,
          hourCanChi: cal.canChi.hour,
        },
      });

      const record: MobileDivinationRecord = {
        id: `maihua-${Date.now()}`,
        method: CastingMethod.MAI_HUA,
        createdAt: targetDate.toISOString(),
        question: question.trim() || undefined,
        category,
        trio: maiHuaResult.trio,
        movingLines: maiHuaResult.trio.movingLineIndices,
        sixYaoAnalysis,
        theDung: {
          theTrigramNumber: maiHuaResult.theDung.theTrigram.earlyHeavenNumber,
          theTrigramName: maiHuaResult.theDung.theTrigram.name,
          dungTrigramNumber: maiHuaResult.theDung.dungTrigram.earlyHeavenNumber,
          dungTrigramName: maiHuaResult.theDung.dungTrigram.name,
          theLocation: maiHuaResult.theDung.thePosition === 'UPPER' ? 'upper' : 'lower',
          dungLocation: maiHuaResult.theDung.dungPosition === 'UPPER' ? 'upper' : 'lower',
        },
        dateTimeInfo: {
          solarDateStr: `${d}/${m}/${y} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
          lunarDateStr: `Ngày ${cal.lunar.day} tháng ${cal.lunar.isLeap ? `${cal.lunar.month} (Nhuận)` : cal.lunar.month} năm ${cal.canChi.year}`,
          yearCanChi: cal.canChi.year,
          monthCanChi: cal.canChi.month,
          dayCanChi: cal.canChi.day,
          hourCanChi: cal.canChi.hour,
        },
      };

      onCastSuccess(record);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi lập quẻ Mai Hoa.';
      setErrorMsg(msg);
      Alert.alert('Không thể lập quẻ', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Mai Hoa Dịch Số"
        subtitle="Lập quẻ Giờ Động Tâm"
        showBackButton={true}
        onBack={onBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Hướng Dẫn & Nút Lấy Giờ Hiện Tại */}
          <View style={styles.timeSelectCard}>
            <View style={styles.timeCardHeader}>
              <Text style={styles.timeCardTitle}>Thời Điểm Động Tâm Khởi Quẻ</Text>
              <TouchableOpacity
                style={styles.nowButton}
                onPress={setNowTime}
                activeOpacity={0.7}
              >
                <Text style={styles.nowButtonText}>⚡ Lấy giờ hiện tại</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputsRow}>
              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Ngày</Text>
                <TextInput
                  style={styles.timeInput}
                  value={day}
                  onChangeText={setDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Tháng</Text>
                <TextInput
                  style={styles.timeInput}
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={[styles.timeInputCol, { flex: 1.4 }]}>
                <Text style={styles.timeInputLabel}>Năm</Text>
                <TextInput
                  style={styles.timeInput}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Giờ</Text>
                <TextInput
                  style={styles.timeInput}
                  value={hour}
                  onChangeText={setHour}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>

              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Phút</Text>
                <TextInput
                  style={styles.timeInput}
                  value={minute}
                  onChangeText={setMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Preview Can Chi */}
            {previewCalendar && (
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>
                  Âm lịch: Ngày {previewCalendar.lunar.day} tháng {previewCalendar.lunar.isLeap ? `${previewCalendar.lunar.month} (Nhuận)` : previewCalendar.lunar.month}
                </Text>
                <Text style={styles.previewCanChi}>
                  {previewCalendar.canChi.year} (Năm) • {previewCalendar.canChi.month} (Tháng) • {previewCalendar.canChi.day} (Ngày) • {previewCalendar.canChi.hour} (Giờ)
                </Text>
              </View>
            )}
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Ô nhập câu hỏi chiêm bói */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nội Dung Chiêm Bói (Tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập việc cần hỏi: Tài lộc, công danh, hôn nhân..."
              placeholderTextColor={theme.colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Danh mục */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phân Loại Đề Mục</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.catLabel,
                        isSelected && styles.catLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nút Thực Hiện */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCast}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang Khởi Quẻ...' : '⏳ Khởi Quẻ Mai Hoa'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  timeSelectCard: {
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
  timeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  nowButton: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  nowButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.gold[900],
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeInputCol: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: theme.colors.backgroundSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  previewBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gold[800],
  },
  previewCanChi: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  catIcon: {
    fontSize: 14,
  },
  catLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  catLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.white,
    letterSpacing: 0.5,
  },
});
