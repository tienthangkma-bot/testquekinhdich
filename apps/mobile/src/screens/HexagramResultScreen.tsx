import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CastingMethod, DivinationNoteEntity, LinePosition } from '@kindich/domain';
import {
  getClassicalHexagramData,
  interpretHexagram,
  orchestrateSixYaoAnalysis,
  SixYaoAnalysisResult,
} from '@kindich/core';
import { Header } from '../components/Header';
import { MobileWorkspaceHexagrams } from '../components/MobileWorkspaceHexagrams';
import { MobileMasterTable } from '../components/MobileMasterTable';
import { MobileSupplementaryTable } from '../components/MobileSupplementaryTable';
import { MobileDivinationRecord } from '../types/navigation';

export interface HexagramResultScreenProps {
  record: MobileDivinationRecord;
  onBack: () => void;
  onNewCast: () => void;
  onAddNote?: (divinationId: string, content: string, actualOutcome?: string) => Promise<void>;
}

export type WorkspaceTab = 'an-que' | 'luan-giai';

export const HexagramResultScreen: React.FC<HexagramResultScreenProps> = ({
  record,
  onBack,
  onNewCast,
  onAddNote,
}) => {
  // Trạng thái chuyển đổi 2 chế độ xem: Bảng An Quẻ & Đồ Hình vs Luận Giải Quẻ Toàn Diện
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('an-que');
  const [showAllLines, setShowAllLines] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [localNotes, setLocalNotes] = useState<DivinationNoteEntity[]>(record.notes ? [...record.notes] : []);

  const { trio, movingLines, sixYaoAnalysis: initialSixYao, theDung, dateTimeInfo, question, method } = record;

  // Đảm bảo luôn có SixYaoAnalysisResult chuẩn tắc từ Core Orchestrator
  const sixYaoResult: SixYaoAnalysisResult = useMemo(() => {
    if (initialSixYao) {
      return initialSixYao;
    }
    return orchestrateSixYaoAnalysis({
      primaryHexagram: trio.primary.number,
      changingHexagram: trio.transformed?.number,
      movingLineIndices: (movingLines || trio.movingLineIndices) as LinePosition[],
      dateTime: {
        dayCanChi: dateTimeInfo.dayCanChi,
        monthCanChi: dateTimeInfo.monthCanChi,
        yearCanChi: dateTimeInfo.yearCanChi,
        hourCanChi: dateTimeInfo.hourCanChi,
      },
    });
  }, [initialSixYao, trio, movingLines, dateTimeInfo]);

  // 1. Dữ liệu Kinh Văn Cổ Điển
  const classicalLookup = getClassicalHexagramData(trio.primary.number);
  const classicalData = classicalLookup.status === 'AVAILABLE' ? classicalLookup.data : null;

  // 2. Dữ liệu Động Cơ Luận Giải (Interpretation Engine từ @kindich/core)
  const interpretation = interpretHexagram({
    trio,
    sixYaoResult,
    includeAllLines: showAllLines,
  });

  // Tách Nhật thần, Nguyệt lệnh và Tuần không
  const dayBranch = (dateTimeInfo.dayCanChi || '').split(' ')[1] || (dateTimeInfo.dayCanChi || '');
  const monthBranch = (dateTimeInfo.monthCanChi || '').split(' ')[1] || (dateTimeInfo.monthCanChi || '');
  const voidBranchesStr = sixYaoResult.dateTime.dayMaster.voidBranches.join(', ');

  // Xử lý thêm ghi chú / nghiệm lý
  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      Alert.alert('Chưa có nội dung', 'Vui lòng nhập nội dung ghi chú.');
      return;
    }

    const newNote: DivinationNoteEntity = {
      id: `note-${Date.now()}`,
      divinationId: record.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: noteContent.trim(),
      actualOutcome: actualOutcome.trim() || undefined,
      isVerified: Boolean(actualOutcome.trim()),
    };

    setLocalNotes((prev) => [newNote, ...prev]);
    setNoteContent('');
    setActualOutcome('');

    if (onAddNote) {
      try {
        await onAddNote(record.id, newNote.content, newNote.actualOutcome);
      } catch (err) {
        console.warn('Lỗi lưu ghi chú:', err);
      }
    }

    Alert.alert('Thành công', 'Đã lưu ghi chú cho quẻ này.');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Kinh Dịch Tân An Phái"
        subtitle="Bắc Hà Tân An Phái • Luận Quẻ Tập Trung"
        showBackButton={true}
        onBack={onBack}
        rightAction={
          <TouchableOpacity style={styles.newCastBtn} onPress={onNewCast} activeOpacity={0.7}>
            <Text style={styles.newCastBtnText}>+ Lập mới</Text>
          </TouchableOpacity>
        }
      />

      {/* 2 Tab điều hướng chính: Bảng An Quẻ & Đồ Hình vs Luận Giải Toàn Diện */}
      <View style={styles.viewModeTabs}>
        <TouchableOpacity
          style={[styles.viewModeTabBtn, activeTab === 'an-que' && styles.viewModeTabBtnActive]}
          onPress={() => setActiveTab('an-que')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewModeTabText, activeTab === 'an-que' && styles.viewModeTabTextActive]}>
            📊 Bảng An Quẻ & Đồ Hình
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewModeTabBtn, activeTab === 'luan-giai' && styles.viewModeTabBtnActive]}
          onPress={() => setActiveTab('luan-giai')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewModeTabText, activeTab === 'luan-giai' && styles.viewModeTabTextActive]}>
            📖 Luận Giải Quẻ Toàn Diện
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================================= */}
        {/* TRANG 1: MÀN HÌNH KẾT QUẢ TẬP TRUNG (SINGLE DIVINATION WORKSPACE)       */}
        {/* ========================================================================= */}
        {activeTab === 'an-que' && (
          <View>
            {/* KHU VỰC 1: THÔNG TIN CHUNG (META CARD) */}
            <View style={styles.metaCard}>
              <View style={styles.metaHeaderRow}>
                <View style={styles.brandTitleWrap}>
                  <Text style={styles.brandSubtitle}>BẮC HÀ TÂN AN PHÁI</Text>
                  <Text style={styles.brandTitle}>KINH DỊCH TÂN AN PHÁI</Text>
                </View>
                <View style={styles.methodBadge}>
                  <Text style={styles.methodBadgeText}>
                    {method === CastingMethod.SERIAL
                      ? `Số seri tiền${record.serialNumber ? `: ${record.serialNumber}` : ''}`
                      : 'Giờ động tâm (Mai Hoa)'}
                  </Text>
                </View>
              </View>

              {question ? (
                <View style={styles.questionBox}>
                  <Text style={styles.questionLabel}>Việc cần hỏi:</Text>
                  <Text style={styles.questionText}>"{question}"</Text>
                </View>
              ) : null}

              {/* Thông tin thời gian và Can Chi 4 trụ */}
              <View style={styles.dateTimeGrid}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>🕒 Dương lịch:</Text>
                  <Text style={styles.timeValue}>{dateTimeInfo.solarDateStr}</Text>
                </View>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>🌙 Âm lịch:</Text>
                  <Text style={styles.timeValue}>{dateTimeInfo.lunarDateStr}</Text>
                </View>

                <View style={styles.canChiBlock}>
                  <Text style={styles.canChiBlockLabel}>Can Chi 4 Trụ:</Text>
                  <Text style={styles.canChiBlockValue}>
                    Giờ {dateTimeInfo.hourCanChi} • Ngày {dateTimeInfo.dayCanChi} • Tháng {dateTimeInfo.monthCanChi} • Năm {dateTimeInfo.yearCanChi}
                  </Text>
                </View>

                <View style={styles.deitiesSummaryRow}>
                  <Text style={styles.deitiesSummaryText}>
                    Nhật thần: <Text style={styles.goldText}>{dayBranch}</Text> • Nguyệt lệnh: <Text style={styles.goldText}>{monthBranch}</Text> • Tuần không: <Text style={styles.redText}>[{voidBranchesStr || '—'}]</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* KHU VỰC 2: HÌNH TƯỢNG BỘ BA QUẺ (HEXAGRAM SHOWCASE) */}
            <MobileWorkspaceHexagrams trio={trio} />

            {/* KHU VỰC 3: BẢNG LỤC HÀO TỔNG HỢP CỔ PHÁP */}
            <MobileMasterTable sixYaoResult={sixYaoResult} />

            {/* KHU VỰC 4: BẢNG PHÂN TÍCH BỔ SUNG */}
            <MobileSupplementaryTable sixYaoResult={sixYaoResult} />
          </View>
        )}

        {/* ========================================================================= */}
        {/* TRANG 2: LUẬN GIẢI QUẺ TOÀN DIỆN & KINH VĂN & GHI CHÚ                     */}
        {/* ========================================================================= */}
        {activeTab === 'luan-giai' && (
          <View style={styles.interpContainer}>
            {/* 1. Trọng tâm chiêm đoán (Chu Hi - Dịch Học Khải Mông) */}
            <View style={styles.interpCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>1. Trọng Tâm Chiêm Đoán (Chu Hi)</Text>
                <Text style={styles.sourceTag}>Dịch Học Khải Mông</Text>
              </View>
              <Text style={styles.ruleName}>
                {interpretation.hexagramTransformation.content.divinationMethodRule}
              </Text>
              <Text style={styles.ruleExplanation}>
                {interpretation.hexagramTransformation.content.explanation}
              </Text>
            </View>

            {/* 2. Luận giải Thể / Dụng (Mai Hoa) nếu có */}
            {interpretation.maiHua && (
              <View style={styles.interpCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardSectionTitle}>2. Luận Giải Thể / Dụng (Mai Hoa)</Text>
                  <Text style={styles.sourceTag}>Mai Hoa Dịch Số</Text>
                </View>
                <Text style={styles.ruleName}>
                  {interpretation.maiHua.content.relationName} ({interpretation.maiHua.content.judgmentLevelName})
                </Text>
                <Text style={styles.ruleExplanation}>
                  {interpretation.maiHua.content.explanation}
                </Text>
                {interpretation.maiHua.content.advice ? (
                  <Text style={[styles.ruleExplanation, { marginTop: 6, fontStyle: 'italic' }]}>
                    • Lời khuyên: {interpretation.maiHua.content.advice}
                  </Text>
                ) : null}
                {interpretation.maiHua.content.classicalVerse ? (
                  <Text style={[styles.ruleExplanation, { marginTop: 4, color: '#C9A227' }]}>
                    • Thi từ: "{interpretation.maiHua.content.classicalVerse}"
                  </Text>
                ) : null}
              </View>
            )}

            {/* 3. Luận giải Thế / Ứng & Lục Hào */}
            {interpretation.sixYao && (
              <View style={styles.interpCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardSectionTitle}>3. Luận Giải Thế / Ứng (Lục Hào)</Text>
                  <Text style={styles.sourceTag}>Tăng San Bốc Dịch</Text>
                </View>
                <Text style={styles.ruleName}>
                  Thế Ứng: {interpretation.sixYao.content.shiYing.relationName}
                </Text>
                <Text style={styles.ruleExplanation}>
                  {interpretation.sixYao.content.shiYing.explanation}
                </Text>
                <Text style={[styles.ruleExplanation, { marginTop: 6 }]}>
                  {interpretation.sixYao.content.officerImpact.summaryOverview}
                </Text>
                <Text style={[styles.ruleExplanation, { marginTop: 4 }]}>
                  {interpretation.sixYao.content.officerImpact.worldLineAnalysis.explanation}
                </Text>
              </View>
            )}

            {/* 4. Kinh Văn Thoán Từ & Đại Tượng */}
            <View style={styles.interpCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>4. Thoán Từ & Đại Tượng Từ</Text>
                <Text style={styles.sourceTag}>Chu Dịch Chính Nghĩa</Text>
              </View>
              <Text style={styles.classicalOriginal}>
                {classicalData?.thuanTu.chinese || 'Chưa có bản văn chữ Hán.'}
              </Text>
              {classicalData?.thuanTu.sinoVietnamese && (
                <Text style={styles.classicalSino}>Phiên âm: {classicalData.thuanTu.sinoVietnamese}</Text>
              )}
              <Text style={styles.classicalTranslation}>
                Dịch nghĩa: {classicalData?.thuanTu.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>

              <View style={styles.innerDivider} />

              <Text style={styles.classicalOriginal}>
                {classicalData?.daiTuong.chinese || 'Chưa có bản văn đại tượng.'}
              </Text>
              {classicalData?.daiTuong.sinoVietnamese && (
                <Text style={styles.classicalSino}>Tượng truyện: {classicalData.daiTuong.sinoVietnamese}</Text>
              )}
              <Text style={styles.classicalTranslation}>
                Dịch nghĩa: {classicalData?.daiTuong.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>
            </View>

            {/* 5. Hào Từ Các Hào Động */}
            <View style={styles.interpCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>
                  5. Hào Từ ({showAllLines ? 'Toàn bộ 6 hào' : `Các hào động: ${movingLines.map((l: number) => `Hào ${l}`).join(', ') || 'Không có'}`})
                </Text>
                <TouchableOpacity
                  style={styles.toggleHaoBtn}
                  onPress={() => setShowAllLines(!showAllLines)}
                >
                  <Text style={styles.toggleHaoBtnText}>
                    {showAllLines ? 'Chỉ Hào Động' : 'Xem Cả 6 Hào'}
                  </Text>
                </TouchableOpacity>
              </View>

              {classicalData?.lines
                .filter((l) => (showAllLines ? true : movingLines.includes(l.position)))
                .map((line) => {
                  const isMoving = movingLines.includes(line.position);
                  return (
                    <View
                      key={`line-classical-${line.position}`}
                      style={[styles.lineClassicalItem, isMoving && styles.lineClassicalItemMoving]}
                    >
                      <View style={styles.lineHeaderRow}>
                        <Text style={[styles.lineTitle, isMoving && styles.lineTitleMoving]}>
                          • Hào {line.position} ({line.lineName}):
                        </Text>
                        {isMoving && (
                          <View style={styles.movingBadge}>
                            <Text style={styles.movingBadgeText}>HÀO ĐỘNG</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.classicalOriginal}>{line.haoTu.chinese}</Text>
                      {line.haoTu.sinoVietnamese && (
                        <Text style={styles.classicalSino}>Phiên âm: {line.haoTu.sinoVietnamese}</Text>
                      )}
                      {line.haoTu.translation && (
                        <Text style={styles.classicalTranslation}>Dịch nghĩa: {line.haoTu.translation}</Text>
                      )}
                    </View>
                  );
                })}
            </View>

            {/* 6. Ghi Chú & Nghiệm Lý */}
            <View style={styles.interpCard}>
              <Text style={styles.cardSectionTitle}>6. Ghi Chú & Nghiệm Lý ({localNotes.length})</Text>

              <TextInput
                style={styles.noteInput}
                placeholder="Nhập ghi chú chiêm đoán..."
                placeholderTextColor="#64748B"
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.noteInput, { height: 40, marginTop: 8 }]}
                placeholder="Kết quả thực tế / nghiệm chứng (nếu có)..."
                placeholderTextColor="#64748B"
                value={actualOutcome}
                onChangeText={setActualOutcome}
              />

              <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote} activeOpacity={0.8}>
                <Text style={styles.saveNoteBtnText}>💾 Lưu Ghi Chú</Text>
              </TouchableOpacity>

              {localNotes.length > 0 && (
                <View style={styles.notesList}>
                  {localNotes.map((n) => (
                    <View key={n.id} style={styles.noteItem}>
                      <Text style={styles.noteDate}>
                        {new Date(n.createdAt).toLocaleDateString('vi-VN')} {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.noteText}>{n.content}</Text>
                      {n.actualOutcome ? (
                        <Text style={styles.outcomeText}>✓ Nghiệm chứng: {n.actualOutcome}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  newCastBtn: {
    backgroundColor: '#C9A227',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  newCastBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B0F1A',
  },
  viewModeTabs: {
    flexDirection: 'row',
    backgroundColor: '#151B2B',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewModeTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewModeTabBtnActive: {
    borderBottomColor: '#C9A227',
    backgroundColor: 'rgba(201, 162, 39, 0.08)',
  },
  viewModeTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  viewModeTabTextActive: {
    color: '#C9A227',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  metaCard: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
  },
  metaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brandTitleWrap: {
    flex: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '800',
    color: '#C9A227',
    letterSpacing: 0.5,
  },
  methodBadge: {
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  methodBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#C9A227',
  },
  questionBox: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A227',
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C9A227',
  },
  questionText: {
    fontSize: 12,
    color: '#E8EDF5',
    fontStyle: 'italic',
    marginTop: 1,
  },
  dateTimeGrid: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8EDF5',
  },
  canChiBlock: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  canChiBlockLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginBottom: 1,
  },
  canChiBlockValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C9A227',
  },
  deitiesSummaryRow: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  deitiesSummaryText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  goldText: {
    color: '#C9A227',
    fontWeight: '700',
  },
  redText: {
    color: '#F87171',
    fontWeight: '700',
  },
  interpContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
  },
  interpCard: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSectionTitle: {
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700',
    color: '#C9A227',
  },
  sourceTag: {
    fontSize: 9.5,
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ruleName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8EDF5',
    marginBottom: 4,
  },
  ruleExplanation: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 17,
  },
  classicalOriginal: {
    fontFamily: 'serif',
    fontSize: 14,
    color: '#E8EDF5',
    lineHeight: 20,
    marginBottom: 4,
  },
  classicalSino: {
    fontSize: 11.5,
    color: '#C9A227',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  classicalTranslation: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  innerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  toggleHaoBtn: {
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  toggleHaoBtnText: {
    fontSize: 10,
    color: '#C9A227',
    fontWeight: '700',
  },
  lineClassicalItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  lineClassicalItemMoving: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  lineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  lineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8EDF5',
  },
  lineTitleMoving: {
    color: '#F87171',
  },
  movingBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  movingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#E8EDF5',
    padding: 8,
    fontSize: 12,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  saveNoteBtn: {
    backgroundColor: '#C9A227',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveNoteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B0F1A',
  },
  notesList: {
    marginTop: 10,
    gap: 6,
  },
  noteItem: {
    backgroundColor: '#0D1117',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#C9A227',
  },
  noteDate: {
    fontSize: 9.5,
    color: '#64748B',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 11.5,
    color: '#E8EDF5',
  },
  outcomeText: {
    fontSize: 11,
    color: '#34D399',
    marginTop: 2,
  },
});
