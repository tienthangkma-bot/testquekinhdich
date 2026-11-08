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
import {
  CastingMethod,
  DivinationNoteEntity,
  LinePosition,
  getHexagramOmen,
  getPalaceInfoByHexagramNumber,
} from '@kindich/domain';
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

export type WorkspaceTab = 'an-que' | 'luan-giai' | 'ghi-chu';

const STUDY_CATEGORIES = [
  { id: 'academic', label: 'Học tập' },
  { id: 'career', label: 'Công danh' },
  { id: 'wealth', label: 'Tài lộc' },
  { id: 'relationship', label: 'Tình duyên' },
  { id: 'health', label: 'Sức khỏe' },
  { id: 'general', label: 'Tổng hợp' },
];

export const HexagramResultScreen: React.FC<HexagramResultScreenProps> = ({
  record,
  onBack,
  onNewCast,
  onAddNote,
}) => {
  // Trạng thái chuyển đổi 3 chế độ xem: Bảng An Quẻ & Đồ Hình vs Luận Giải Quẻ Toàn Diện vs Sổ Tay Nghiệm Lý
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('an-que');
  const [showAllLines, setShowAllLines] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [localNotes, setLocalNotes] = useState<DivinationNoteEntity[]>(record.notes ? [...record.notes] : []);

  // Form Sổ tay nghiệm lý & làm sách
  const [studyTopic, setStudyTopic] = useState<string>(record.question || '');
  const [studyCategory, setStudyCategory] = useState<string>('academic');
  const [studyDeduction, setStudyDeduction] = useState<string>('');
  const [studyOutcome, setStudyOutcome] = useState<string>('');
  const [studyLesson, setStudyLesson] = useState<string>('');
  const [studyVerified, setStudyVerified] = useState<boolean>(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState<boolean>(false);

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

  // Lưu ghi chú chuyên sâu phục vụ nghiên cứu & làm sách
  const handleSaveStudyNote = async () => {
    if (!studyDeduction.trim() && !studyOutcome.trim() && !studyLesson.trim()) {
      Alert.alert('Chưa có nội dung', 'Vui lòng nhập chiêm đoán lý thuyết, diễn biến thực tế hoặc bài học làm sách.');
      return;
    }

    const fullContent = [
      `[CHỦ ĐỀ]: ${studyTopic.trim() || question || `Quẻ #${trio.primary.number} ${trio.primary.name}`}`,
      `[DANH MỤC]: ${studyCategory}`,
      studyDeduction.trim() ? `[CHIÊM ĐOÁN BAN ĐẦU]:\n${studyDeduction.trim()}` : '',
      studyLesson.trim() ? `[BÀI HỌC LÀM SÁCH]:\n${studyLesson.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const newNote: DivinationNoteEntity = {
      id: `note-${Date.now()}`,
      divinationId: record.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: fullContent,
      actualOutcome: studyOutcome.trim() || undefined,
      isVerified: studyVerified || Boolean(studyOutcome.trim()),
    };

    setLocalNotes((prev) => [newNote, ...prev]);
    setStudyDeduction('');
    setStudyOutcome('');
    setStudyLesson('');

    if (onAddNote) {
      try {
        await onAddNote(record.id, newNote.content, newNote.actualOutcome);
      } catch (err) {
        console.warn('Lỗi lưu ghi chú SQLite:', err);
      }
    }

    Alert.alert('Thành công', 'Đã lưu tư liệu nghiệm lý và làm sách vào cơ sở dữ liệu!');
  };

  // Trích xuất tư liệu sách Markdown
  const primaryOmen = getHexagramOmen(trio.primary.number);
  const primaryPalace = getPalaceInfoByHexagramNumber(trio.primary.number);
  const transformedOmen = trio.transformed ? getHexagramOmen(trio.transformed.number) : null;
  const transformedPalace = trio.transformed ? getPalaceInfoByHexagramNumber(trio.transformed.number) : null;

  const bookMarkdown = `# TƯ LIỆU NGHIỆM LÝ KINH DỊCH - BẮC HÀ TÂN AN PHÁI
**Chủ đề chiêm bói:** ${studyTopic.trim() || question || 'Chiêm nghiệm học thuật'}
**Thời gian lập quẻ:** ${dateTimeInfo.solarDateStr} (${dateTimeInfo.hourCanChi} - ${dateTimeInfo.dayCanChi} - ${dateTimeInfo.monthCanChi} - ${dateTimeInfo.yearCanChi})
**Tuần không:** [${voidBranchesStr}]
**Phương pháp:** ${method === CastingMethod.SERIAL ? 'Seri tiền' : 'Mai Hoa Dịch Số (Giờ động tâm)'}

---

## 1. THÔNG SỐ ĐỒ HÌNH
* **Quẻ Chủ (#${trio.primary.number}):** ${trio.primary.name} (${trio.primary.sinoVietnameseName})
  - Cung Bát Quái: Cung ${primaryPalace.palaceName} (${primaryPalace.palaceElement}) | Lục Hào: Thế Hào ${sixYaoResult.summary.worldLinePosition}, Ứng Hào ${sixYaoResult.summary.responseLinePosition}
  - Lời Triệu: "${primaryOmen.omen}"
* **Quẻ Hỗ (#${trio.nuclear.number}):** ${trio.nuclear.name}
* **Quẻ Biến (#${trio.transformed?.number || '—'}):** ${trio.transformed?.name || 'Tĩnh'}
  - Cung Bát Quái: ${transformedPalace ? `Cung ${transformedPalace.palaceName} (${transformedPalace.palaceElement})` : '—'}
  - Lời Triệu: "${transformedOmen?.omen || '—'}"
* **Hào động:** ${trio.movingLineIndices.length > 0 ? trio.movingLineIndices.map((p) => `Hào ${p}`).join(', ') : 'Tĩnh (Không có hào động)'}

---

## 2. CHIÊM ĐOÁN BAN ĐẦU & NGUYÊN LÝ LỤC HÀO
${studyDeduction.trim() || 'Chưa ghi chú chiêm đoán ban đầu.'}

---

## 3. DIỄN BIẾN THỰC TẾ & NGHIỆM CHỨNG
* **Trạng thái:** ${studyVerified ? '✅ ĐÃ ỨNG NGHIỆM CHUẨN XÁC' : '⏳ ĐANG THEO DÕI NGHIỆM LÝ'}
${studyOutcome.trim() || 'Chưa có cập nhật nghiệm chứng thực tế.'}

---

## 4. BÀI HỌC ĐÚC KẾT & TƯ LIỆU LÀM SÁCH
${studyLesson.trim() || 'Chưa ghi chú bài học làm sách.'}
`;

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

      {/* 3 Tab điều hướng chính */}
      <View style={styles.viewModeTabs}>
        <TouchableOpacity
          style={[styles.viewModeTabBtn, activeTab === 'an-que' && styles.viewModeTabBtnActive]}
          onPress={() => setActiveTab('an-que')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewModeTabText, activeTab === 'an-que' && styles.viewModeTabTextActive]}>
            📊 An Quẻ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewModeTabBtn, activeTab === 'luan-giai' && styles.viewModeTabBtnActive]}
          onPress={() => setActiveTab('luan-giai')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewModeTabText, activeTab === 'luan-giai' && styles.viewModeTabTextActive]}>
            📖 Luận Giải
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewModeTabBtn, activeTab === 'ghi-chu' && styles.viewModeTabBtnActive]}
          onPress={() => setActiveTab('ghi-chu')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewModeTabText, activeTab === 'ghi-chu' && styles.viewModeTabTextActive]}>
            📝 Sổ Tay ({localNotes.length})
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

        {/* ========================================================================= */}
        {/* TRANG 3: SỔ TAY NGHIỆM LÝ & TƯ LIỆU LÀM SÁCH                           */}
        {/* ========================================================================= */}
        {activeTab === 'ghi-chu' && (
          <View>
            {/* Banner giới thiệu */}
            <View style={styles.studyBannerCard}>
              <View style={styles.studyBadge}>
                <Text style={styles.studyBadgeText}>📚 Kho Tri Thức & Sáng Tác</Text>
              </View>
              <Text style={styles.studyMainTitle}>Sổ Tay Nghiệm Lý & Tư Liệu Sách</Text>
              <Text style={styles.studySubtitle}>
                Ghi chép chiêm đoán lý thuyết, theo dõi diễn biến thực tế và đúc kết kinh nghiệm Lục Hào & Mai Hoa phục vụ giảng dạy, xuất bản sách.
              </Text>

              <TouchableOpacity
                style={styles.markdownToggleBtn}
                onPress={() => setShowMarkdownPreview(!showMarkdownPreview)}
                activeOpacity={0.8}
              >
                <Text style={styles.markdownToggleBtnText}>
                  {showMarkdownPreview ? '▲ Ẩn Bản Thảo Sách (Markdown)' : '📋 Xem Bản Thảo Sách (Markdown)'}
                </Text>
              </TouchableOpacity>

              {showMarkdownPreview && (
                <View style={styles.markdownPreviewBox}>
                  <Text style={styles.markdownPreviewTip}>
                    💡 Chạm giữ đoạn văn bản dưới đây để sao chép vào bộ nhớ tạm hoặc Word/Notion:
                  </Text>
                  <Text selectable={true} style={styles.markdownPreviewContent}>
                    {bookMarkdown}
                  </Text>
                </View>
              )}
            </View>

            {/* Form ghi chép nghiệm lý */}
            <View style={styles.studyFormCard}>
              <Text style={styles.formSectionHeading}>✍️ Ghi Chép Nghiệm Lý Mới</Text>

              <Text style={styles.inputFieldLabel}>Chủ đề / Vấn đề chiêm bói:</Text>
              <TextInput
                style={styles.singleLineInput}
                placeholder="Nhập chủ đề hoặc câu hỏi..."
                placeholderTextColor="#64748B"
                value={studyTopic}
                onChangeText={setStudyTopic}
              />

              <Text style={styles.inputFieldLabel}>Danh mục học thuật:</Text>
              <View style={styles.categoryPillsRow}>
                {STUDY_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryPill, studyCategory === cat.id && styles.categoryPillActive]}
                    onPress={() => setStudyCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryPillText, studyCategory === cat.id && styles.categoryPillTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputFieldLabel}>1. Chiêm đoán ban đầu & Phân tích Thế/Ứng/Dụng thần:</Text>
              <TextInput
                style={styles.studyTextArea}
                placeholder="Phân tích Hào Thế, Hào Ứng, Dụng Thần vượng tướng hưu tù, sinh khắc chế hóa..."
                placeholderTextColor="#64748B"
                value={studyDeduction}
                onChangeText={setStudyDeduction}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputFieldLabel}>2. Diễn biến thực tế & Kết quả nghiệm chứng:</Text>
              <TextInput
                style={styles.studyTextArea}
                placeholder="Ghi lại sự việc đã diễn ra trên thực tế vào ngày tháng nào, đúng/sai so với suy đoán..."
                placeholderTextColor="#64748B"
                value={studyOutcome}
                onChangeText={setStudyOutcome}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputFieldLabel}>3. Bài học đúc kết & Tư liệu làm sách:</Text>
              <TextInput
                style={styles.studyTextArea}
                placeholder="Nguyên lý mấu chốt, bài học từ quẻ này để đưa vào giáo trình/sách..."
                placeholderTextColor="#64748B"
                value={studyLesson}
                onChangeText={setStudyLesson}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.verifiedToggleRow, studyVerified && styles.verifiedToggleRowActive]}
                onPress={() => setStudyVerified(!studyVerified)}
                activeOpacity={0.8}
              >
                <Text style={styles.verifiedCheckIcon}>{studyVerified ? '☑' : '☐'}</Text>
                <Text style={[styles.verifiedToggleText, studyVerified && styles.verifiedToggleTextActive]}>
                  ✓ Đã nghiệm chứng chuẩn xác (Đủ tiêu chuẩn làm sách thực chiến)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitStudyBtn} onPress={handleSaveStudyNote} activeOpacity={0.8}>
                <Text style={styles.submitStudyBtnText}>💾 Lưu Ghi Chú Nghiệm Lý Vào Cơ Sở Dữ Liệu</Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách các ghi chú đã lưu */}
            <View style={styles.savedStudyNotesCard}>
              <View style={styles.savedNotesHeaderRow}>
                <Text style={styles.savedNotesCardTitle}>📑 Nhật Ký Nghiệm Lý Đã Lưu</Text>
                <View style={styles.notesCountBadge}>
                  <Text style={styles.notesCountBadgeText}>{localNotes.length}</Text>
                </View>
              </View>

              {localNotes.length === 0 ? (
                <View style={styles.emptyNotesWrap}>
                  <Text style={styles.emptyNotesEmoji}>📝</Text>
                  <Text style={styles.emptyNotesTitle}>Chưa có ghi chú nghiệm lý nào cho quẻ này.</Text>
                  <Text style={styles.emptyNotesSub}>
                    Hãy nhập các thông số chiêm đoán và nghiệm chứng ở biểu mẫu trên để tích lũy kho tư liệu học thuật.
                  </Text>
                </View>
              ) : (
                localNotes.map((note) => (
                  <View key={note.id} style={styles.studyNoteCardItem}>
                    <View style={styles.noteItemTopRow}>
                      <View style={[styles.statusBadge, note.isVerified ? styles.statusBadgeVerified : styles.statusBadgePending]}>
                        <Text style={[styles.statusBadgeText, note.isVerified ? styles.statusBadgeTextVerified : styles.statusBadgeTextPending]}>
                          {note.isVerified ? '✓ Đã nghiệm chứng' : '⏳ Đang theo dõi'}
                        </Text>
                      </View>
                      <Text style={styles.noteItemDate}>
                        {new Date(note.createdAt).toLocaleDateString('vi-VN')} {new Date(note.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.noteItemContent}>{note.content}</Text>
                    {note.actualOutcome ? (
                      <View style={styles.actualOutcomeBox}>
                        <Text style={styles.actualOutcomeTitle}>✓ Nghiệm chứng thực tế:</Text>
                        <Text style={styles.actualOutcomeContent}>{note.actualOutcome}</Text>
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
  // Sổ tay Nghiệm lý & Tư liệu sách
  studyBannerCard: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  studyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#C9A227',
  },
  studyBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E8C547',
  },
  studyMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E8EDF5',
    marginBottom: 4,
  },
  studySubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#94A3B8',
    marginBottom: 10,
  },
  markdownToggleBtn: {
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
    borderWidth: 1,
    borderColor: '#C9A227',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  markdownToggleBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E8C547',
  },
  markdownPreviewBox: {
    marginTop: 10,
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  markdownPreviewTip: {
    fontSize: 10.5,
    color: '#60A5FA',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  markdownPreviewContent: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    lineHeight: 16,
    color: '#E2E8F0',
  },
  studyFormCard: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formSectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#C9A227',
    marginBottom: 10,
  },
  inputFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 8,
    marginBottom: 4,
  },
  singleLineInput: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#E8EDF5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  categoryPill: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryPillActive: {
    backgroundColor: '#C9A227',
    borderColor: '#C9A227',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryPillTextActive: {
    color: '#0B0F1A',
    fontWeight: '800',
  },
  studyTextArea: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#E8EDF5',
    padding: 8,
    fontSize: 11.5,
    textAlignVertical: 'top',
  },
  verifiedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: '#0D1117',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  verifiedToggleRowActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22C55E',
  },
  verifiedCheckIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#22C55E',
  },
  verifiedToggleText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  verifiedToggleTextActive: {
    color: '#22C55E',
    fontWeight: '700',
  },
  submitStudyBtn: {
    backgroundColor: '#C9A227',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitStudyBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0B0F1A',
  },
  savedStudyNotesCard: {
    backgroundColor: '#151B2B',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  savedNotesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savedNotesCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#E8EDF5',
  },
  notesCountBadge: {
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notesCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E8C547',
  },
  emptyNotesWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyNotesEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  emptyNotesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 4,
  },
  emptyNotesSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
  studyNoteCardItem: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A227',
  },
  noteItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeVerified: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadgeTextVerified: {
    color: '#22C55E',
  },
  statusBadgeTextPending: {
    color: '#EAB308',
  },
  noteItemDate: {
    fontSize: 9.5,
    color: '#64748B',
  },
  noteItemContent: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#E8EDF5',
  },
  actualOutcomeBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actualOutcomeTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 2,
  },
  actualOutcomeContent: {
    fontSize: 11,
    color: '#86EFAC',
  },
});
