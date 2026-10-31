import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CastingMethod, DivinationNoteEntity } from '@kindich/domain';
import {
  getClassicalHexagramData,
  interpretHexagram,
  determineDivinationRuleByMovingLines,
} from '@kindich/core';
import { theme } from '../theme/colors';
import { Header } from '../components/Header';
import { SixLinesDisplay } from '../components/SixLinesDisplay';
import { SixYaoTable } from '../components/SixYaoTable';
import { MobileDivinationRecord } from '../types/navigation';

export interface HexagramResultScreenProps {
  record: MobileDivinationRecord;
  onBack: () => void;
  onNewCast: () => void;
  onAddNote?: (divinationId: string, content: string, actualOutcome?: string) => Promise<void>;
}

export const HexagramResultScreen: React.FC<HexagramResultScreenProps> = ({
  record,
  onBack,
  onNewCast,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<'trio' | 'sixyao' | 'classical' | 'interpretation' | 'notes'>('trio');
  const [showAllLines, setShowAllLines] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [localNotes, setLocalNotes] = useState<DivinationNoteEntity[]>(record.notes ? [...record.notes] : []);

  const { trio, movingLines, sixYaoAnalysis, theDung, dateTimeInfo, question, method } = record;

  // 1. Dữ liệu Kinh Văn Cổ Điển
  const classicalLookup = getClassicalHexagramData(trio.primary.number);
  const classicalData = classicalLookup.status === 'AVAILABLE' ? classicalLookup.data : null;

  // 2. Dữ liệu Động Cơ Luận Giải (Interpretation Engine từ @kindich/core)
  const interpretation = interpretHexagram({
    trio,
    sixYaoResult: sixYaoAnalysis,
    includeAllLines: showAllLines,
  });

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
        title="Kết Quả Chiêm Bói"
        subtitle={
          method === CastingMethod.SERIAL
            ? '🔢 Seri tiền (SERIAL-MOD8-V1)'
            : '⏳ Giờ động tâm (Mai Hoa Dịch Số)'
        }
        showBackButton={true}
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={onNewCast} activeOpacity={0.7}>
            <Text style={styles.newCastBtnText}>+ Lập mới</Text>
          </TouchableOpacity>
        }
      />

      {/* Thanh Tabs cuộn ngang mượt mà cho mọi kích thước màn hình */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'trio' && styles.activeTabItem]}
            onPress={() => setActiveTab('trio')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabItemText, activeTab === 'trio' && styles.activeTabItemText]}>
              ☯ Bộ Ba Quẻ
            </Text>
          </TouchableOpacity>

          {sixYaoAnalysis && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'sixyao' && styles.activeTabItem]}
              onPress={() => setActiveTab('sixyao')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabItemText, activeTab === 'sixyao' && styles.activeTabItemText]}>
                📊 Đồ Bản Lục Hào
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'classical' && styles.activeTabItem]}
            onPress={() => setActiveTab('classical')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabItemText, activeTab === 'classical' && styles.activeTabItemText]}>
              📜 Kinh Văn Thoán Hào
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'interpretation' && styles.activeTabItem]}
            onPress={() => setActiveTab('interpretation')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabItemText, activeTab === 'interpretation' && styles.activeTabItemText]}>
              🔮 Luận Giải Toàn Diện
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'notes' && styles.activeTabItem]}
            onPress={() => setActiveTab('notes')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabItemText, activeTab === 'notes' && styles.activeTabItemText]}>
              📝 Ghi Chú & Nghiệm Lý ({localNotes.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner tóm tắt thông tin lần lập quẻ */}
        <View style={styles.metaCard}>
          {question ? (
            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Việc cần hỏi:</Text>
              <Text style={styles.questionText}>"{question}"</Text>
            </View>
          ) : null}

          <View style={styles.dateTimeBox}>
            <Text style={styles.dateText}>🕒 {dateTimeInfo.solarDateStr} (Dương lịch)</Text>
            <Text style={styles.canChiText}>
              Âm lịch: {dateTimeInfo.lunarDateStr} • Can Chi: {dateTimeInfo.dayCanChi} (Ngày) -{' '}
              {dateTimeInfo.monthCanChi} (Tháng)
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
                    <Text style={styles.theDungSub}>
                      Vị trí: {theDung.theLocation === 'upper' ? 'Thượng' : 'Hạ'}
                    </Text>
                  </View>
                  <Text style={styles.theDungVersus}>⚡</Text>
                  <View style={styles.theDungCol}>
                    <Text style={styles.theDungLabel}>QUÁI DỤNG (Biến):</Text>
                    <Text style={[styles.theDungValue, { color: theme.colors.primary }]}>
                      {theDung.dungTrigramName}
                    </Text>
                    <Text style={styles.theDungSub}>
                      Vị trí: {theDung.dungLocation === 'upper' ? 'Thượng' : 'Hạ'}
                    </Text>
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
                  <Text style={styles.hexName}>{trio.primary.name}</Text>
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

              <SixLinesDisplay hexagram={trio.primary} movingLineIndices={movingLines} />
            </View>

            {/* Quẻ Biến & Quẻ Hỗ */}
            <View style={styles.trioSecondaryGrid}>
              {/* Quẻ Biến */}
              <View style={[styles.hexCard, styles.secondaryCard]}>
                <View style={styles.secondaryHeader}>
                  <Text style={styles.secondaryBadge}>QUẺ BIẾN #{trio.transformed.number}</Text>
                  <Text style={styles.secondarySymbol}>{trio.transformed.symbol}</Text>
                </View>
                <Text style={styles.secondaryName}>{trio.transformed.name}</Text>
                <Text style={styles.secondarySubName}>({trio.transformed.sinoVietnameseName})</Text>
                <SixLinesDisplay hexagram={trio.transformed} movingLineIndices={[]} showLabels={false} />
              </View>

              {/* Quẻ Hỗ */}
              <View style={[styles.hexCard, styles.secondaryCard]}>
                <View style={styles.secondaryHeader}>
                  <Text style={[styles.secondaryBadge, styles.nuclearBadge]}>
                    QUẺ HỖ #{trio.nuclear.number}
                  </Text>
                  <Text style={styles.secondarySymbol}>{trio.nuclear.symbol}</Text>
                </View>
                <Text style={styles.secondaryName}>{trio.nuclear.name}</Text>
                <Text style={styles.secondarySubName}>({trio.nuclear.sinoVietnameseName})</Text>
                <SixLinesDisplay hexagram={trio.nuclear} movingLineIndices={[]} showLabels={false} />
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
        {activeTab === 'classical' && (
          <View style={styles.textsContainer}>
            {/* Bộ lọc Hào Từ */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Phạm vi Hào Từ:</Text>
              <View style={styles.filterButtonGroup}>
                <TouchableOpacity
                  style={[styles.filterBtn, !showAllLines && styles.filterBtnActive]}
                  onPress={() => setShowAllLines(false)}
                >
                  <Text style={[styles.filterBtnText, !showAllLines && styles.filterBtnTextActive]}>
                    Chỉ Hào Động ({movingLines.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterBtn, showAllLines && styles.filterBtnActive]}
                  onPress={() => setShowAllLines(true)}
                >
                  <Text style={[styles.filterBtnText, showAllLines && styles.filterBtnTextActive]}>
                    Toàn Bộ 6 Hào
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Thoán từ */}
            <View style={styles.textSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.textSectionTitle}>Thoán Từ (Lời Quán Quẻ)</Text>
                <Text style={styles.sourceTag}>Chu Dịch Chính Nghĩa</Text>
              </View>
              <Text style={styles.textOriginal}>
                {classicalData?.thuanTu.chinese || 'Chưa có bản văn chữ Hán.'}
              </Text>
              {classicalData?.thuanTu.sinoVietnamese && (
                <Text style={styles.textSino}>Phiên âm: {classicalData.thuanTu.sinoVietnamese}</Text>
              )}
              <Text style={styles.textTranslation}>
                Dịch nghĩa: {classicalData?.thuanTu.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>
            </View>

            {/* Đại Tượng */}
            <View style={styles.textSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.textSectionTitle}>Đại Tượng Từ (Tượng Quẻ)</Text>
                <Text style={styles.sourceTag}>Văn Vương Tượng</Text>
              </View>
              <Text style={styles.textOriginal}>
                {classicalData?.daiTuong.chinese || 'Chưa có bản văn tượng quẻ.'}
              </Text>
              {classicalData?.daiTuong.sinoVietnamese && (
                <Text style={styles.textSino}>Phiên âm: {classicalData.daiTuong.sinoVietnamese}</Text>
              )}
              <Text style={styles.textTranslation}>
                Dịch nghĩa: {classicalData?.daiTuong.translation || 'Chưa có bản dịch nghĩa.'}
              </Text>
            </View>

            {/* Hào từ */}
            <View style={styles.textSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.textSectionTitle}>
                  Hào Từ ({showAllLines ? 'Toàn bộ 6 hào' : `Các hào động: ${movingLines.map((l: number) => `Hào ${l}`).join(', ') || 'Không có'}`})
                </Text>
                <Text style={styles.sourceTag}>Chu Công Hào Từ</Text>
              </View>

              {classicalData?.lines
                .filter((l) => (showAllLines ? true : movingLines.includes(l.position)))
                .map((line) => {
                  const isMoving = movingLines.includes(line.position);
                  return (
                    <View
                      key={`line-text-${line.position}`}
                      style={[styles.movingTextItem, isMoving && styles.movingTextHighlight]}
                    >
                      <View style={styles.lineHeaderRow}>
                        <Text style={[styles.movingLineTitle, isMoving && { color: theme.colors.primary }]}>
                          • Hào {line.position} ({line.lineName}):
                        </Text>
                        {isMoving && (
                          <View style={styles.movingPill}>
                            <Text style={styles.movingPillText}>HÀO ĐỘNG</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.textOriginal}>{line.haoTu.chinese}</Text>
                      {line.haoTu.sinoVietnamese && (
                        <Text style={styles.textSino}>Phiên âm: {line.haoTu.sinoVietnamese}</Text>
                      )}
                      {line.haoTu.translation && (
                        <Text style={styles.textTranslation}>Dịch nghĩa: {line.haoTu.translation}</Text>
                      )}
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* TAB 4: LUẬN GIẢI TOÀN DIỆN */}
        {activeTab === 'interpretation' && (
          <View style={styles.textsContainer}>
            {/* Quy tắc Chu Hi Dịch Học Khải Mông */}
            <View style={[styles.textSection, styles.interpCard]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.textSectionTitle}>1. Trọng Tâm Chiêm Đoán (Chu Hi)</Text>
                <Text style={styles.sourceTag}>Dịch Học Khải Mông</Text>
              </View>
              <Text style={styles.ruleName}>
                {interpretation.hexagramTransformation.content.divinationMethodRule}
              </Text>
              <Text style={styles.ruleExplanation}>
                {interpretation.hexagramTransformation.content.explanation}
              </Text>
            </View>

            {/* Luận giải Mai Hoa nếu có */}
            {interpretation.maiHua && (
              <View style={[styles.textSection, styles.interpCard]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.textSectionTitle}>2. Luận Giải Thể / Dụng (Mai Hoa)</Text>
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
                  <Text style={[styles.ruleExplanation, { marginTop: 4, color: theme.colors.gold[800] }]}>
                    • Thi từ: "{interpretation.maiHua.content.classicalVerse}"
                  </Text>
                ) : null}
              </View>
            )}

            {/* Luận giải Lục Hào nếu có */}
            {interpretation.sixYao && (
              <View style={[styles.textSection, styles.interpCard]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.textSectionTitle}>3. Luận Giải Thế / Ứng & Nhật Nguyệt (Lục Hào)</Text>
                  <Text style={styles.sourceTag}>Tăng San Bốc Dịch</Text>
                </View>
                <Text style={styles.ruleName}>
                  Thế Ứng: {interpretation.sixYao.content.shiYing.relationName}
                </Text>
                <Text style={styles.ruleExplanation}>
                  {interpretation.sixYao.content.shiYing.explanation}
                </Text>
                <Text style={[styles.ruleExplanation, { marginTop: 8 }]}>
                  {interpretation.sixYao.content.officerImpact.summaryOverview}
                </Text>
                <Text style={[styles.ruleExplanation, { marginTop: 4 }]}>
                  {interpretation.sixYao.content.officerImpact.worldLineAnalysis.explanation}
                </Text>
              </View>
            )}

            {/* Tuyên bố trách nhiệm học thuật */}
            <View style={[styles.textSection, styles.disclaimerCard]}>
              <Text style={styles.disclaimerTitle}>TÔN CHỈ KHOA HỌC & KHÁCH QUAN</Text>
              <Text style={styles.disclaimerText}>
                {interpretation.disclaimer}
              </Text>
            </View>
          </View>
        )}

        {/* TAB 5: GHI CHÚ & NGHIỆM LÝ */}
        {activeTab === 'notes' && (
          <View style={styles.notesContainer}>
            {/* Form thêm ghi chú */}
            <View style={styles.addNoteCard}>
              <Text style={styles.addNoteTitle}>Thêm Ghi Chú & Nghiệm Lý</Text>
              <Text style={styles.inputSubLabel}>Nội dung bối cảnh / cảm nghĩ khi gieo:</Text>
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Ghi lại bối cảnh, sự việc hoặc linh cảm lúc lập quẻ..."
                placeholderTextColor={theme.colors.textMuted}
                value={noteContent}
                onChangeText={setNoteContent}
              />

              <Text style={styles.inputSubLabel}>Kết quả nghiệm chứng thực tế (nếu có):</Text>
              <TextInput
                style={[styles.noteInput, { minHeight: 60 }]}
                multiline
                placeholder="Kết quả thực tế diễn ra sau này để đối chiếu chiêm nghiệm..."
                placeholderTextColor={theme.colors.textMuted}
                value={actualOutcome}
                onChangeText={setActualOutcome}
              />

              <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote} activeOpacity={0.8}>
                <Text style={styles.saveNoteBtnText}>💾 Lưu Ghi Chú & Nghiệm Lý</Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách ghi chú */}
            <View style={styles.notesList}>
              <Text style={styles.notesListTitle}>Lịch Sử Ghi Chú Của Quẻ Này ({localNotes.length})</Text>
              {localNotes.length === 0 ? (
                <View style={styles.emptyNotesBox}>
                  <Text style={styles.emptyNotesText}>Chưa có ghi chú nào cho lần lập quẻ này.</Text>
                </View>
              ) : (
                localNotes.map((note) => (
                  <View key={note.id} style={styles.noteItemCard}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteDate}>
                        📅 {new Date(note.createdAt).toLocaleString('vi-VN')}
                      </Text>
                      {note.isVerified ? (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedBadgeText}>ĐÃ NGHIỆM LÝ</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.noteContentText}>{note.content}</Text>
                    {note.actualOutcome ? (
                      <View style={styles.outcomeBox}>
                        <Text style={styles.outcomeLabel}>Kết quả thực tế:</Text>
                        <Text style={styles.outcomeText}>{note.actualOutcome}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
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
  tabsContainer: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
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
    paddingBottom: 36,
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
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
  },
  dateTimeBox: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  canChiText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  theDungCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
    marginBottom: 12,
  },
  theDungTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  theDungRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  theDungCol: {
    alignItems: 'center',
  },
  theDungLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  theDungValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginVertical: 2,
  },
  theDungSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  theDungVersus: {
    fontSize: 16,
  },
  hexCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
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
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  hexName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  hexSubName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  hexSymbol: {
    fontSize: 34,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  trigramsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  trigramText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  trigramDivider: {
    marginHorizontal: 8,
    color: theme.colors.borderGold,
  },
  trioSecondaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryCard: {
    flex: 1,
    padding: 10,
  },
  secondaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  secondaryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nuclearBadge: {
    color: theme.colors.gold[800],
    backgroundColor: theme.colors.gold[100],
  },
  secondarySymbol: {
    fontSize: 20,
    color: theme.colors.text,
  },
  secondaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  secondarySubName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  textsContainer: {
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  filterBtnText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  filterBtnTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  textSection: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  sourceTag: {
    fontSize: 10,
    color: theme.colors.gold[800],
    backgroundColor: theme.colors.gold[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  textOriginal: {
    fontSize: 15,
    fontFamily: 'serif',
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  textSino: {
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  textTranslation: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 19,
  },
  movingTextItem: {
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  movingTextHighlight: {
    backgroundColor: '#FFFDF7',
    padding: 8,
    borderRadius: 6,
  },
  lineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  movingLineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  movingPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movingPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  interpCard: {
    borderColor: theme.colors.borderGold,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  ruleExplanation: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  disclaimerCard: {
    backgroundColor: '#FBF9F4',
    borderColor: theme.colors.borderGold,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.gold[800],
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  notesContainer: {
    gap: 14,
  },
  addNoteCard: {
    backgroundColor: theme.colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderGold,
  },
  addNoteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  noteInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: theme.colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveNoteBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveNoteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notesList: {
    gap: 8,
  },
  notesListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptyNotesBox: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyNotesText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  noteItemCard: {
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  noteContentText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  outcomeBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  outcomeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  outcomeText: {
    fontSize: 12,
    color: theme.colors.text,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
