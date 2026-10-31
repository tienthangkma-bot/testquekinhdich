import React, { useState } from 'react';
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
import { castBySerial, orchestrateSixYaoAnalysis } from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { MobileDivinationRecord, QuestionCategory } from '../types/navigation';

export interface SerialCastingScreenProps {
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

export const SerialCastingScreen: React.FC<SerialCastingScreenProps> = ({
  onBack,
  onCastSuccess,
}) => {
  const [serial, setSerial] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [category, setCategory] = useState<QuestionCategory>('work');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCast = () => {
    setErrorMsg(null);
    const trimmedSerial = serial.trim();

    if (!trimmedSerial) {
      setErrorMsg('Vui lòng nhập số seri tiền (ví dụ: 081293 hoặc 6886).');
      return;
    }

    if (trimmedSerial.length < 2) {
      setErrorMsg('Số seri tiền phải có tối thiểu 2 chữ số.');
      return;
    }

    if (!/^\d+$/.test(trimmedSerial)) {
      setErrorMsg('Số seri tiền chỉ được chứa các ký tự số (0-9).');
      return;
    }

    try {
      setLoading(true);
      // Gọi core engine lập quẻ bằng seri tiền (SERIAL-MOD8-V1)
      const serialResult = castBySerial(trimmedSerial);

      // Lấy ngày giờ thực tế hiện tại
      const now = new Date();
      const cal = getFullCalendarInfo(now);

      // Phân tích Lục Hào Cổ Pháp
      const sixYaoAnalysis = orchestrateSixYaoAnalysis({
        primaryHexagram: serialResult.trio.primary,
        changingHexagram: serialResult.trio.transformed,
        movingLineIndices: serialResult.trio.movingLineIndices,
        dateTime: {
          dayCanChi: cal.canChi.day,
          monthCanChi: cal.canChi.month,
          yearCanChi: cal.canChi.year,
          hourCanChi: cal.canChi.hour,
        },
      });

      const record: MobileDivinationRecord = {
        id: `serial-${Date.now()}`,
        method: CastingMethod.SERIAL,
        createdAt: now.toISOString(),
        question: question.trim() || undefined,
        category,
        trio: serialResult.trio,
        movingLines: serialResult.trio.movingLineIndices,
        sixYaoAnalysis,
        serialNumber: trimmedSerial,
        dateTimeInfo: {
          solarDateStr: `${cal.solar.day}/${cal.solar.month}/${cal.solar.year} ${now.toLocaleTimeString('vi-VN')}`,
          lunarDateStr: `Ngày ${cal.lunar.day} tháng ${cal.lunar.isLeap ? `${cal.lunar.month} (Nhuận)` : cal.lunar.month} năm ${cal.canChi.year}`,
          yearCanChi: cal.canChi.year,
          monthCanChi: cal.canChi.month,
          dayCanChi: cal.canChi.day,
          hourCanChi: cal.canChi.hour,
        },
      };

      onCastSuccess(record);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi lập quẻ.';
      setErrorMsg(msg);
      Alert.alert('Không thể lập quẻ', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lập Quẻ Seri Tiền"
        subtitle="Chuẩn SERIAL-MOD8-V1"
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
          {/* Card Hướng Dẫn */}
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>Quy tắc khởi quẻ:</Text>
            <Text style={styles.guideText}>
              • Giữ nguyên toàn bộ số 0 ở đầu tờ tiền.{'\n'}
              • Vị trí lẻ (1, 3, 5...) chia 8 dư mấy làm Thượng quái.{'\n'}
              • Vị trí chẵn (2, 4, 6...) chia 8 dư mấy làm Hạ quái.{'\n'}
              • Tổng tất cả chữ số chia 6 dư mấy định Hào động.
            </Text>
          </View>

          {/* Ô nhập số seri */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Số Seri Tờ Tiền <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.serialInput, errorMsg && styles.inputError]}
              placeholder="Nhập chuỗi số (vd: 0918237)"
              placeholderTextColor={theme.colors.textMuted}
              value={serial}
              onChangeText={(text) => {
                setSerial(text);
                if (errorMsg) setErrorMsg(null);
              }}
              keyboardType="number-pad"
              autoFocus={true}
              maxLength={20}
            />
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Ô nhập câu hỏi chiêm bói */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nội Dung Việc Cần Chiêm Đoán (Tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tâm sự sự việc: Công việc, tài lộc, gia sự..."
              placeholderTextColor={theme.colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Danh mục câu hỏi */}
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
              {loading ? 'Đang Khởi Quẻ...' : '☯ Khởi Quẻ Kinh Dịch'}
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
  guideCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.gold[600],
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gold[800],
    marginBottom: 4,
  },
  guideText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
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
  requiredStar: {
    color: theme.colors.primary,
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
  serialInput: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.primary,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '500',
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
