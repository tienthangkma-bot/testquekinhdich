import React, { useState, useEffect, useCallback } from 'react';
import {
  CastingMethod,
  DivinationDateTime,
  DivinationNoteEntity,
  HexagramTrio,
  getHexagramOmen,
  getPalaceInfoByHexagramNumber,
} from '@kindich/domain';
import { SixYaoAnalysisResult } from '@kindich/core';
import { Button } from '@kindich/shared';
import { getDivinationRepository } from '../../services/repository.service';
import './WorkspaceStudyNotes.css';

export interface WorkspaceStudyNotesProps {
  divinationId?: string;
  trio: HexagramTrio;
  dateTimeInfo: DivinationDateTime;
  question?: string;
  method: CastingMethod;
  sixYaoResult: SixYaoAnalysisResult;
  onNotesCountChanged?: (count: number) => void;
}

const CATEGORIES = [
  { id: 'study', label: '🎓 Học Tập & Thi Cử' },
  { id: 'career', label: '💼 Sự Nghiệp & Công Danh' },
  { id: 'finance', label: '💰 Tài Lộc & Kinh Doanh' },
  { id: 'relationship', label: '❤️ Tình Duyên & Gia Đạo' },
  { id: 'health', label: '🏥 Sức Khỏe & Thân Thể' },
  { id: 'travel', label: '✈️ Xuất Hành & Cầu Tài' },
  { id: 'academic', label: '📜 Chiêm Nghiệm Học Thuật & Tượng Quẻ' },
  { id: 'general', label: '🔮 Việc Đời Sống Chung' },
];

interface ParsedNoteContent {
  topic: string;
  category: string;
  theoreticalDeduction: string;
  bookLesson: string;
}

function parseNoteContent(rawContent: string): ParsedNoteContent {
  let topic = '';
  let category = 'academic';
  let theoreticalDeduction = rawContent;
  let bookLesson = '';

  const topicMatch = rawContent.match(/(?:\[CHỦ ĐỀ\]|\[ĐƯƠNG SỐ \/ CHỦ ĐỀ\]):\s*([^\n]+)/);
  if (topicMatch && topicMatch[1]) topic = topicMatch[1].trim();

  const catMatch = rawContent.match(/\[DANH MỤC\]:\s*([^\n]+)/);
  if (catMatch && catMatch[1]) category = catMatch[1].trim();

  const deductionMatch = rawContent.match(/\[CHIÊM ĐOÁN BAN ĐẦU\]:\s*([\s\S]*?)(?=\[BÀI HỌC LÀM SÁCH\]|$)/);
  if (deductionMatch && deductionMatch[1]) theoreticalDeduction = deductionMatch[1].trim();

  const bookMatch = rawContent.match(/\[BÀI HỌC LÀM SÁCH\]:\s*([\s\S]*)/);
  if (bookMatch && bookMatch[1]) bookLesson = bookMatch[1].trim();

  return { topic, category, theoreticalDeduction, bookLesson };
}

function buildNoteContent(params: {
  topic: string;
  category: string;
  theoreticalDeduction: string;
  bookLesson: string;
}): string {
  const parts: string[] = [];
  if (params.topic.trim()) parts.push(`[CHỦ ĐỀ]: ${params.topic.trim()}`);
  if (params.category.trim()) parts.push(`[DANH MỤC]: ${params.category.trim()}`);
  if (params.theoreticalDeduction.trim()) {
    parts.push(`[CHIÊM ĐOÁN BAN ĐẦU]:\n${params.theoreticalDeduction.trim()}`);
  }
  if (params.bookLesson.trim()) {
    parts.push(`[BÀI HỌC LÀM SÁCH]:\n${params.bookLesson.trim()}`);
  }
  return parts.join('\n\n') || params.theoreticalDeduction;
}

export const WorkspaceStudyNotes: React.FC<WorkspaceStudyNotesProps> = ({
  divinationId,
  trio,
  dateTimeInfo,
  question,
  method,
  sixYaoResult,
  onNotesCountChanged,
}) => {
  const repo = getDivinationRepository();

  // Danh sách ghi chú của quẻ hiện tại
  const [notes, setNotes] = useState<DivinationNoteEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Form Fields
  const [topic, setTopic] = useState<string>(question || '');
  const [category, setCategory] = useState<string>('academic');
  const [theoreticalDeduction, setTheoreticalDeduction] = useState<string>('');
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [bookLesson, setBookLesson] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Trạng thái sửa ghi chú
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Tải danh sách ghi chú từ Repository
  const loadNotes = useCallback(async () => {
    if (!divinationId) {
      // Fallback lấy từ localStorage nếu chưa có id
      try {
        const local = localStorage.getItem(`kindich_temp_notes_${trio.primary.number}`);
        if (local) {
          const parsed = JSON.parse(local);
          setNotes(parsed);
          onNotesCountChanged?.(parsed.length);
        }
      } catch (err) {
        console.warn('Lỗi đọc local notes:', err);
      }
      return;
    }

    try {
      setIsLoading(true);
      const fetched = await repo.getNotesByDivinationId(divinationId);
      setNotes(fetched);
      onNotesCountChanged?.(fetched.length);
    } catch (err) {
      console.warn('Lỗi tải ghi chú:', err);
    } finally {
      setIsLoading(false);
    }
  }, [divinationId, trio.primary.number, onNotesCountChanged, repo]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Lưu hoặc Cập nhật ghi chú
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoreticalDeduction.trim() && !bookLesson.trim() && !actualOutcome.trim()) {
      alert('Vui lòng nhập nội dung chiêm đoán, nghiệm chứng hoặc bài học làm sách.');
      return;
    }

    const fullContent = buildNoteContent({
      topic: topic.trim() || question || `Quẻ #${trio.primary.number} ${trio.primary.name}`,
      category,
      theoreticalDeduction,
      bookLesson,
    });

    try {
      if (editingNoteId) {
        // Cập nhật ghi chú hiện có
        await repo.updateNote(
          editingNoteId,
          fullContent,
          actualOutcome.trim() || undefined,
          isVerified
        );
        setEditingNoteId(null);
      } else {
        // Thêm ghi chú mới
        if (divinationId) {
          await repo.addNote(
            divinationId,
            fullContent,
            actualOutcome.trim() || undefined
          );
        } else {
          // Lưu fallback vào localStorage
          const newNote: DivinationNoteEntity = {
            id: `temp-note-${Date.now()}`,
            divinationId: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: fullContent,
            actualOutcome: actualOutcome.trim() || undefined,
            isVerified,
          };
          const next = [newNote, ...notes];
          setNotes(next);
          localStorage.setItem(`kindich_temp_notes_${trio.primary.number}`, JSON.stringify(next));
          onNotesCountChanged?.(next.length);
        }
      }

      // Reset form
      setTheoreticalDeduction('');
      setActualOutcome('');
      setBookLesson('');
      setIsVerified(false);
      setEditingNoteId(null);
      await loadNotes();

      setCopyFeedback('✓ Đã lưu thành công dữ liệu ghi chú vào hệ thống!');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu ghi chú.');
    }
  };

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (note: DivinationNoteEntity) => {
    setEditingNoteId(note.id);
    const parsed = parseNoteContent(note.content);
    setTopic(parsed.topic || question || '');
    setCategory(parsed.category || 'academic');
    setTheoreticalDeduction(parsed.theoreticalDeduction || note.content);
    setBookLesson(parsed.bookLesson || '');
    setActualOutcome(note.actualOutcome || '');
    setIsVerified(note.isVerified || false);

    // Cuộn lên form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setTheoreticalDeduction('');
    setActualOutcome('');
    setBookLesson('');
    setIsVerified(false);
  };

  // Xóa ghi chú
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi chú này không?')) return;
    try {
      if (divinationId) {
        await repo.deleteNote(noteId);
      } else {
        const next = notes.filter((n) => n.id !== noteId);
        setNotes(next);
        localStorage.setItem(`kindich_temp_notes_${trio.primary.number}`, JSON.stringify(next));
        onNotesCountChanged?.(next.length);
      }
      await loadNotes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa ghi chú.');
    }
  };

  // Sao chép toàn bộ tư liệu làm sách dưới dạng Markdown
  const handleCopyBookExcerpt = () => {
    const primaryOmen = getHexagramOmen(trio.primary.number);
    const primaryPalace = getPalaceInfoByHexagramNumber(trio.primary.number);
    const transformedOmen = trio.transformed ? getHexagramOmen(trio.transformed.number) : null;
    const transformedPalace = trio.transformed ? getPalaceInfoByHexagramNumber(trio.transformed.number) : null;

    const voidText = dateTimeInfo.voidBranches?.length ? dateTimeInfo.voidBranches.join(', ') : 'Không có';
    const sixYaoText = sixYaoResult
      ? `\n  - Lục Hào: Thế hào ${sixYaoResult.summary.worldLinePosition}, Ứng hào ${sixYaoResult.summary.responseLinePosition} | Cung ${sixYaoResult.primaryHexagram.palace.name}`
      : '';

    const markdownText = `# TƯ LIỆU NGHIỆM LÝ KINH DỊCH - BẮC HÀ TÂN AN PHÁI
**Chủ đề chiêm bói:** ${topic.trim() || question || 'Chiêm nghiệm học thuật'}
**Thời gian lập quẻ:** ${dateTimeInfo.solarDateTime} (${dateTimeInfo.hourCanChi} - ${dateTimeInfo.dayCanChi} - ${dateTimeInfo.monthCanChi} - ${dateTimeInfo.yearCanChi})
**Tiết khí:** ${dateTimeInfo.solarTerm || '—'} | **Tuần không:** [${voidText}]
**Phương pháp:** ${method === CastingMethod.SERIAL ? 'Seri tiền' : 'Mai Hoa Dịch Số (Giờ động tâm)'}

---

## 1. THÔNG SỐ ĐỒ HÌNH
* **Quẻ Chủ (#${trio.primary.number}):** ${trio.primary.name} (${trio.primary.sinoVietnameseName})
  - Cung Bát Quái: Cung ${primaryPalace.palaceName} (${primaryPalace.palaceElement})${sixYaoText}
  - Lời Triệu cổ bản: "${primaryOmen.omen}"
  - Thượng quái: ${trio.primary.upperTrigram.name} | Hạ quái: ${trio.primary.lowerTrigram.name}
* **Quẻ Hỗ (#${trio.nuclear.number}):** ${trio.nuclear.name}
* **Quẻ Biến (#${trio.transformed?.number || '—'}):** ${trio.transformed?.name || 'Tĩnh'}
  - Cung Bát Quái: ${transformedPalace ? `Cung ${transformedPalace.palaceName} (${transformedPalace.palaceElement})` : '—'}
  - Lời Triệu: "${transformedOmen?.omen || '—'}"
* **Hào động:** ${trio.movingLineIndices.length > 0 ? trio.movingLineIndices.map((p) => `Hào ${p}`).join(', ') : 'Tĩnh (Không có hào động)'}

---

## 2. CHIÊM ĐOÁN BAN ĐẦU & NGUYÊN LÝ LỤC HÀO
${theoreticalDeduction.trim() || 'Chưa ghi chú chiêm đoán ban đầu.'}

---

## 3. DIỄN BIẾN THỰC TẾ & NGHIỆM CHỨNG
* **Trạng thái:** ${isVerified ? '✅ ĐÃ ỨNG NGHIỆM CHUẨN XÁC' : '⏳ ĐANG THEO DÕI NGHIỆM LÝ'}
${actualOutcome.trim() || 'Chưa có cập nhật nghiệm chứng thực tế.'}

---

## 4. BÀI HỌC ĐÚC KẾT & TƯ LIỆU LÀM SÁCH
${bookLesson.trim() || 'Chưa ghi chú bài học làm sách.'}

---
*Ghi chép tự động bởi Hệ Thống Kinh Dịch Tân An Phái (Bắc Hà Tân An Phái)*
`;

    navigator.clipboard.writeText(markdownText).then(() => {
      setCopyFeedback('📋 Đã sao chép toàn bộ tư liệu làm sách (Markdown) vào bộ nhớ tạm!');
      setTimeout(() => setCopyFeedback(null), 3500);
    });
  };

  return (
    <div className="study-notes-container" data-testid="workspace-study-notes">
      {/* Banner giới thiệu */}
      <div className="study-notes-banner">
        <div className="study-notes-banner-left">
          <div className="study-notes-badge">📚 Kho Tri Thức & Sáng Tác</div>
          <h3 className="study-notes-main-title">Sổ Tay Nghiệm Lý & Tư Liệu Làm Sách</h3>
          <p className="study-notes-subtitle">
            Ghi chép chiêm đoán lý thuyết, theo dõi diễn biến thực tế, đúc kết kinh nghiệm học thuật Lục Hào & Mai Hoa phục vụ giảng dạy và xuất bản sách.
          </p>
        </div>

        <div className="study-notes-banner-actions">
          <Button variant="outline" size="sm" onClick={handleCopyBookExcerpt}>
            📋 Sao chép tư liệu sách (Markdown)
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            🖨️ In Phiếu Nghiệm Lý
          </Button>
        </div>
      </div>

      {copyFeedback && (
        <div style={{
          backgroundColor: '#DCFCE7',
          color: '#15803D',
          padding: '10px 16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
          border: '1px solid #86EFAC',
        }}>
          {copyFeedback}
        </div>
      )}

      {/* Form Nhập Ghi Chú Học Tập & Làm Sách */}
      <div className="study-note-form-card">
        <div className="study-note-form-header">
          <h4 className="study-form-title">
            <span>{editingNoteId ? '✏️ Chỉnh Sửa Ghi Chú' : '✍️ Ghi Chép Nghiệm Lý Mới'}</span>
          </h4>
          {editingNoteId && (
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              Hủy sửa
            </Button>
          )}
        </div>

        <form onSubmit={handleSaveNote}>
          <div className="study-form-grid">
            {/* Chủ đề */}
            <div className="study-form-group">
              <label className="study-form-label">
                📌 Đương số / Việc cần xem:
                <span className="study-form-hint">(Tên đương số & việc cần đoán)</span>
              </label>
              <input
                type="text"
                className="study-form-input"
                placeholder="Ví dụ: Anh Nguyễn Văn A xem chuyển công tác, mua bán đất..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Phân loại danh mục */}
            <div className="study-form-group">
              <label className="study-form-label">
                📂 Phân loại chuyên đề:
                <span className="study-form-hint">(Lĩnh vực việc xem)</span>
              </label>
              <select
                className="study-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 1. Chiêm đoán ban đầu */}
            <div className="study-form-group study-form-group--full">
              <label className="study-form-label">
                🧠 1. Chiêm Đoán Ban Đầu & Luận Giải Cho Đương Số:
                <span className="study-form-hint">(Dụng thần, Thế Ứng, Ngũ Hành sinh khắc, vượng suy, Ứng kỳ dự kiến, Lời dặn đương số)</span>
              </label>
              <textarea
                className="study-form-textarea"
                rows={4}
                placeholder="Ghi lại luận đoán lúc xem quẻ: Dụng thần vượng suy ra sao, hào Thế/Ứng thế nào, dự kiến ngày tháng nào ứng nghiệm, lời khuyên cho đương số..."
                value={theoreticalDeduction}
                onChange={(e) => setTheoreticalDeduction(e.target.value)}
              />
            </div>

            {/* 2. Diễn biến thực tế */}
            <div className="study-form-group">
              <label className="study-form-label">
                🔍 2. Diễn Biến Thực Tế & Phản Hồi Của Đương Số:
                <span className="study-form-hint">(Ghi lại khi đương số phản hồi lại kết quả thực tế)</span>
              </label>
              <textarea
                className="study-form-textarea study-form-textarea--highlight"
                rows={3}
                placeholder="Ví dụ: Đúng ngày Giáp Thân đương số phản hồi đã ký hợp đồng thành công, đúng như dự đoán..."
                value={actualOutcome}
                onChange={(e) => setActualOutcome(e.target.value)}
              />
            </div>

            {/* 3. Bài học làm sách */}
            <div className="study-form-group">
              <label className="study-form-label">
                📖 3. Bài Học Đúc Kết & Tư Liệu Làm Sách:
                <span className="study-form-hint">(Khẩu quyết, kinh nghiệm quý báu trích yếu vào sách)</span>
              </label>
              <textarea
                className="study-form-textarea study-form-textarea--highlight"
                rows={3}
                placeholder="Ví dụ: Dụng thần tuy lâm Không nhưng ngày xung là ứng kỳ. Trích làm ví dụ thực chiến trong sách..."
                value={bookLesson}
                onChange={(e) => setBookLesson(e.target.value)}
              />
            </div>

            {/* Xác nhận ứng nghiệm */}
            <div className="study-form-group study-form-group--full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="isVerifiedCheck"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isVerifiedCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803D', cursor: 'pointer' }}>
                ✓ Đã nghiệm chứng thực tế chuẩn xác (Đủ tiêu chuẩn làm tư liệu sách thực chiến)
              </label>
            </div>
          </div>

          <div className="study-form-actions">
            <Button variant="primary" type="submit">
              {editingNoteId ? '💾 Cập Nhật Ghi Chú' : '💾 Lưu Ghi Chú Nghiệm Lý'}
            </Button>
          </div>
        </form>
      </div>

      {/* Danh Sách Các Ghi Chú Đã Lưu */}
      <div className="saved-notes-section">
        <div className="saved-notes-header">
          <h4 className="saved-notes-title">
            <span>📑 Nhật Ký Nghiệm Lý Đã Lưu</span>
            <span className="saved-notes-count">{notes.length}</span>
          </h4>
        </div>

        {isLoading ? (
          <div className="empty-notes-card">
            <p style={{ margin: 0, fontWeight: 600 }}>Đang tải dữ liệu ghi chú...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-notes-card">
            <div className="empty-notes-icon">📝</div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Chưa có ghi chú nghiệm lý nào cho quẻ này.</p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Hãy nhập chiêm đoán ban đầu ở form trên để lưu lại làm kho dữ liệu học thuật của bạn.</p>
          </div>
        ) : (
          notes.map((note) => {
            const parsed = parseNoteContent(note.content);
            const catObj = CATEGORIES.find((c) => c.id === parsed.category);

            return (
              <div key={note.id} className="saved-note-card">
                <div className="saved-note-card-top">
                  <div className="saved-note-meta-left">
                    <span className={`status-pill ${note.isVerified ? 'status-pill--verified' : 'status-pill--pending'}`}>
                      {note.isVerified ? '✓ Đã nghiệm chứng' : '⏳ Đang theo dõi'}
                    </span>
                    {catObj && <span className="category-tag">{catObj.label}</span>}
                    {parsed.topic && (
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
                        {parsed.topic}
                      </span>
                    )}
                    <span className="note-timestamp">
                      {new Date(note.createdAt).toLocaleDateString('vi-VN')} {new Date(note.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="saved-note-actions">
                    <Button variant="ghost" size="sm" onClick={() => handleStartEdit(note)}>
                      ✏️ Sửa
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                      🗑️ Xóa
                    </Button>
                  </div>
                </div>

                <div className="saved-note-body">
                  {/* Chiêm đoán */}
                  {parsed.theoreticalDeduction && (
                    <div className="note-subblock">
                      <div className="note-subblock-title">Chiêm Đoán Ban Đầu:</div>
                      <p className="note-subblock-content">{parsed.theoreticalDeduction}</p>
                    </div>
                  )}

                  {/* Diễn biến thực tế */}
                  {note.actualOutcome && (
                    <div className="note-subblock note-subblock--outcome">
                      <div className="note-subblock-title">Diễn Biến Thực Tế & Nghiệm Chứng:</div>
                      <p className="note-subblock-content">{note.actualOutcome}</p>
                    </div>
                  )}

                  {/* Bài học làm sách */}
                  {parsed.bookLesson && (
                    <div className="note-subblock note-subblock--book">
                      <div className="note-subblock-title">Đúc Kết Tư Liệu Làm Sách:</div>
                      <p className="note-subblock-content">{parsed.bookLesson}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
