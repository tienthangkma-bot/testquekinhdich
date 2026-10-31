import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  KinDichBackupData,
  DuplicateConflictSummary,
  BackupValidationResult,
} from '@kindich/domain';
import { theme } from '../theme/colors';
import {
  ISqliteDatabase,
  exportSqliteBackup,
  validateSqliteBackupData,
  checkSqliteImportConflicts,
  importSqliteBackup,
} from '../database';

export interface BackupRestoreModalProps {
  visible: boolean;
  db: ISqliteDatabase | null;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  visible,
  db,
  onClose,
  onRestoreSuccess,
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [exportedJson, setExportedJson] = useState<string>('');
  const [importJsonInput, setImportJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [conflictSummary, setConflictSummary] = useState<DuplicateConflictSummary | null>(null);
  const [parsedBackup, setParsedBackup] = useState<KinDichBackupData | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');

  // Xử lý tạo bản sao lưu
  const handleExport = async () => {
    if (!db) {
      Alert.alert('Lỗi', 'Cơ sở dữ liệu chưa sẵn sàng.');
      return;
    }
    setLoading(true);
    try {
      const backup = await exportSqliteBackup(db, {
        appVersion: '0.1.0',
        defaultRuleSetId: 'SIX-YAO-STANDARD-V1',
        defaultAlgorithmVersion: 'SERIAL-MOD8-V1',
      });
      const jsonStr = JSON.stringify(backup, null, 2);
      setExportedJson(jsonStr);
      Alert.alert(
        'Sao Lưu Thành Công',
        `Đã xuất thành công ${backup.metadata.totalDivinations} lần lập quẻ và ${backup.metadata.totalNotes} ghi chú.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Lỗi sao lưu', msg);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra file sao lưu trước khi nhập
  const handleValidateImport = async () => {
    if (!importJsonInput.trim()) {
      Alert.alert('Chưa có dữ liệu', 'Vui lòng dán chuỗi JSON sao lưu vào ô nhập.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonInput.trim());
      const validation = validateSqliteBackupData(parsed);
      setValidationResult(validation);

      if (!validation.isValid) {
        Alert.alert('Dữ liệu không hợp lệ', validation.errors.join('\n'));
        return;
      }

      setParsedBackup(parsed as KinDichBackupData);

      // Kiểm tra xung đột với dữ liệu hiện có trong DB
      if (db) {
        const conflicts = await checkSqliteImportConflicts(db, parsed as KinDichBackupData);
        setConflictSummary(conflicts);
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        errors: ['Chuỗi văn bản không phải là định dạng JSON hợp lệ.'],
        warnings: [],
      });
      Alert.alert('Lỗi cú pháp', 'Chuỗi văn bản không phải là định dạng JSON hợp lệ.');
    }
  };

  // Tiến hành phục hồi
  const handleExecuteImport = () => {
    if (!db || !parsedBackup) return;

    const actionText =
      importMode === 'overwrite'
        ? 'GHI ĐÈ TOÀN BỘ dữ liệu hiện tại trong máy'
        : 'HỢP NHẤT thêm vào dữ liệu hiện có';

    Alert.alert(
      'Xác nhận phục hồi',
      `Bạn chuẩn bị ${actionText}. Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiến hành',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const summary = await importSqliteBackup(db, parsedBackup, { mode: importMode });
              Alert.alert(
                'Phục Hồi Hoàn Tất',
                `Đã phục hồi thành công:\n• ${summary.importedDivinations} lần lập quẻ\n• ${summary.importedNotes} ghi chú\n• ${summary.overwrittenDivinations} bản ghi ghi đè.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onRestoreSuccess();
                      onClose();
                    },
                  },
                ]
              );
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              Alert.alert('Lỗi phục hồi', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header Modal */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sao Lưu & Phục Hồi Dữ Liệu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {/* Tab chuyển đổi */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'export' && styles.activeTabBtn]}
            onPress={() => setTab('export')}
          >
            <Text style={[styles.tabBtnText, tab === 'export' && styles.activeTabBtnText]}>
              📤 Sao Lưu (Xuất JSON)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'import' && styles.activeTabBtn]}
            onPress={() => setTab('import')}
          >
            <Text style={[styles.tabBtnText, tab === 'import' && styles.activeTabBtnText]}>
              📥 Phục Hồi (Nhập JSON)
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* TAB 1: SAO LƯU */}
          {tab === 'export' && (
            <View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Tự chủ dữ liệu ngoại tuyến (Offline-First)</Text>
                <Text style={styles.infoDesc}>
                  Toàn bộ lịch sử gieo quẻ, kết quả chiêm đoán và ghi chú được đóng gói thành file JSON
                  chuẩn format KINDICH_BACKUP. Bạn có thể lưu trữ cá nhân hoặc chuyển đổi giữa các máy.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleExport}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionBtnText}>Tạo Bản Sao Lưu Dữ Liệu</Text>
                )}
              </TouchableOpacity>

              {exportedJson.length > 0 && (
                <View style={styles.jsonResultBox}>
                  <Text style={styles.jsonResultLabel}>Dữ liệu sao lưu JSON (Chạm để sao chép):</Text>
                  <TextInput
                    style={styles.jsonInput}
                    multiline
                    editable={false}
                    selectTextOnFocus
                    value={exportedJson}
                  />
                  <Text style={styles.offlineNote}>
                    🔒 Dữ liệu được tạo hoàn toàn offline trên điện thoại của bạn.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: PHỤC HỒI */}
          {tab === 'import' && (
            <View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Phục hồi từ bản sao lưu</Text>
                <Text style={styles.infoDesc}>
                  Dán chuỗi JSON đã sao lưu vào khung bên dưới. Hệ thống sẽ kiểm tra cấu trúc schema và cảnh báo
                  trước khi áp dụng vào SQLite.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Nội dung file JSON sao lưu:</Text>
              <TextInput
                style={[styles.jsonInput, styles.editableInput]}
                multiline
                placeholder="Dán chuỗi JSON bắt đầu với { 'format': 'KINDICH_BACKUP' ... } vào đây..."
                placeholderTextColor={theme.colors.textMuted}
                value={importJsonInput}
                onChangeText={(text) => {
                  setImportJsonInput(text);
                  setValidationResult(null);
                  setConflictSummary(null);
                  setParsedBackup(null);
                }}
              />

              <TouchableOpacity
                style={[styles.actionBtn, styles.validateBtn]}
                onPress={handleValidateImport}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>1. Kiểm Tra Tính Hợp Lệ</Text>
              </TouchableOpacity>

              {/* Kết quả kiểm tra */}
              {validationResult && (
                <View
                  style={[
                    styles.validationCard,
                    validationResult.isValid ? styles.validCard : styles.invalidCard,
                  ]}
                >
                  <Text style={styles.validationTitle}>
                    {validationResult.isValid ? '✅ Bản sao lưu hợp lệ' : '❌ Bản sao lưu không hợp lệ'}
                  </Text>
                  {validationResult.summary && (
                    <View style={styles.summaryList}>
                      <Text style={styles.summaryItem}>
                        • Số quẻ trong file: {validationResult.summary.totalDivinations}
                      </Text>
                      <Text style={styles.summaryItem}>
                        • Số ghi chú: {validationResult.summary.totalNotes}
                      </Text>
                      <Text style={styles.summaryItem}>
                        • Phiên bản Schema: v{validationResult.summary.schemaVersion}
                      </Text>
                      <Text style={styles.summaryItem}>
                        • Thời điểm xuất: {new Date(validationResult.summary.exportedAt).toLocaleString('vi-VN')}
                      </Text>
                    </View>
                  )}
                  {validationResult.errors.map((err, idx) => (
                    <Text key={idx} style={styles.errorText}>
                      • {err}
                    </Text>
                  ))}
                </View>
              )}

              {/* Cảnh báo xung đột nếu có */}
              {conflictSummary && (
                <View style={styles.conflictCard}>
                  <Text style={styles.conflictTitle}>Xung đột dữ liệu:</Text>
                  <Text style={styles.conflictText}>
                    • Bản ghi mới hoàn toàn: {conflictSummary.newDivinationsCount}
                  </Text>
                  <Text style={styles.conflictText}>
                    • Bản ghi trùng ID với máy: {conflictSummary.duplicateDivinationsCount}
                  </Text>

                  <Text style={styles.modeLabel}>Chọn phương thức khôi phục:</Text>
                  <View style={styles.modeRow}>
                    <TouchableOpacity
                      style={[styles.modeBtn, importMode === 'merge' && styles.activeModeBtn]}
                      onPress={() => setImportMode('merge')}
                    >
                      <Text
                        style={[
                          styles.modeBtnText,
                          importMode === 'merge' && styles.activeModeBtnText,
                        ]}
                      >
                        Hợp nhất (Ghi đè bản trùng)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modeBtn,
                        importMode === 'overwrite' && styles.activeModeBtn,
                      ]}
                      onPress={() => setImportMode('overwrite')}
                    >
                      <Text
                        style={[
                          styles.modeBtnText,
                          importMode === 'overwrite' && styles.activeModeBtnText,
                        ]}
                      >
                        Xóa hết và ghi đè
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.executeBtn]}
                    onPress={handleExecuteImport}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.actionBtnText}>2. Tiến Hành Phục Hồi Dữ Liệu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.background,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jsonResultBox: {
    marginTop: 8,
  },
  jsonResultLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  jsonInput: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: theme.colors.text,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  editableInput: {
    minHeight: 120,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  offlineNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  validateBtn: {
    backgroundColor: theme.colors.accent,
  },
  validationCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  validCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  invalidCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: theme.colors.text,
  },
  summaryList: {
    marginTop: 4,
  },
  summaryItem: {
    fontSize: 13,
    color: theme.colors.text,
    marginVertical: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginVertical: 2,
  },
  conflictCard: {
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  conflictText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginVertical: 2,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  modeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  activeModeBtn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  modeBtnText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  activeModeBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  executeBtn: {
    backgroundColor: theme.colors.crimson[700],
    marginTop: 6,
  },
});
