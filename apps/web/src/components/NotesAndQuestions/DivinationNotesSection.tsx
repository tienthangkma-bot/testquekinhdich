import React, { useState } from 'react';
import { Button, Input } from '@kindich/shared';
import { DivinationNoteEntity, IDivinationRepository } from '@kindich/domain';
import { getDivinationRepository } from '../../services/repository.service';
import './NotesAndQuestions.css';

export interface DivinationNotesSectionProps {
  readonly divinationId: string;
  readonly notes: readonly DivinationNoteEntity[];
  readonly repository?: IDivinationRepository;
  readonly onNotesChanged: () => void | Promise<void>;
  readonly title?: string;
}

/**
 * Component Quản Lý Ghi Chú Cá Nhân & Nghiệm Lý (CRUD - Requirement 3)
 */
export const DivinationNotesSection: React.FC<DivinationNotesSectionProps> = ({
  divinationId,
  notes,
  repository,
  onNotesChanged,
  title = 'Ghi Chú & Nghiệm Lý Sự Việc',
}) => {
  const repo = repository ?? getDivinationRepository();

  // Trạng thái form thêm mới
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  // Trạng thái form sửa
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editOutcome, setEditOutcome] = useState('');
  const [editVerified, setEditVerified] = useState(false);

  // Trạng thái xác nhận xóa
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Thêm ghi chú mới (Create)
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await repo.addNote(divinationId, newContent.trim(), newOutcome.trim() || undefined);
      setNewContent('');
      setNewOutcome('');
      setIsAdding(false);
      await onNotesChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm ghi chú.');
    }
  };

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (note: DivinationNoteEntity) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditOutcome(note.actualOutcome || '');
    setEditVerified(note.isVerified || false);
    setConfirmDeleteId(null);
  };

  // Lưu chỉnh sửa (Update)
  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      await repo.updateNote(
        noteId,
        editContent.trim(),
        editOutcome.trim() || undefined,
        editVerified
      );
      setEditingId(null);
      await onNotesChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật ghi chú.');
    }
  };

  // Xóa ghi chú (Delete)
  const handleConfirmDelete = async (noteId: string) => {
    try {
      await repo.deleteNote(noteId);
      setConfirmDeleteId(null);
      await onNotesChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa ghi chú.');
    }
  };

  return (
    <div className="notes-section-container" data-testid="divination-notes-section">
      <div className="notes-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h4 className="notes-header-title">
            <span>📝</span>
            <span>{title}</span>
          </h4>
          <span className="notes-count-tag" data-testid="notes-count-tag">
            {notes.length} ghi chú
          </span>
        </div>

        {!isAdding && (
          <Button
            size="sm"
            variant="gold"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setConfirmDeleteId(null);
            }}
            data-testid="add-note-button"
          >
            + Thêm ghi chú
          </Button>
        )}
      </div>

      {/* Form thêm ghi chú mới */}
      {isAdding && (
        <form
          onSubmit={handleCreateNote}
          className="note-form-card"
          data-testid="add-note-form"
        >
          <h5 className="note-form-title">Thêm Ghi Chú / Nhận Định Mới</h5>
          <div>
            <textarea
              className="note-textarea"
              rows={3}
              placeholder="Ghi nhận định hoặc lời khuyên của quẻ..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
              data-testid="note-content-input"
            />
          </div>

          <div>
            <Input
              label="Kết quả thực tế sau này (nếu đã nghiệm chứng):"
              placeholder="Ví dụ: Thi đậu ngày 15/10 đúng như dự đoán..."
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              size="sm"
              fullWidth
              data-testid="note-outcome-input"
            />
          </div>

          <div className="note-form-actions">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              disabled={!newContent.trim()}
              data-testid="save-note-button"
            >
              Lưu ghi chú
            </Button>
          </div>
        </form>
      )}

      {/* Danh sách ghi chú */}
      {notes.length === 0 ? (
        <p className="empty-notes-hint" data-testid="empty-notes-message">
          Chưa có ghi chú nào cho lần lập quẻ này. Hãy bấm "+ Thêm ghi chú" ở trên để ghi lại cảm nhận hoặc theo dõi nghiệm lý.
        </p>
      ) : (
        <div className="notes-list" data-testid="notes-list">
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-item-card"
              data-testid={`note-card-${note.id}`}
            >
              {editingId === note.id ? (
                /* Form Sửa Ghi Chú */
                <div
                  className="note-form-card"
                  style={{ backgroundColor: 'transparent', padding: 0, border: 'none' }}
                  data-testid={`edit-note-form-${note.id}`}
                >
                  <h5 className="note-form-title">Chỉnh Sửa Ghi Chú</h5>
                  <textarea
                    className="note-textarea"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                    data-testid="edit-content-input"
                  />

                  <Input
                    label="Kết quả nghiệm lý thực tế:"
                    value={editOutcome}
                    onChange={(e) => setEditOutcome(e.target.value)}
                    size="sm"
                    fullWidth
                    data-testid="edit-outcome-input"
                  />

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      color: 'var(--bha-text-secondary)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editVerified}
                      onChange={(e) => setEditVerified(e.target.checked)}
                      data-testid="edit-verified-checkbox"
                    />
                    <span>Đánh dấu sự việc đã ứng nghiệm thực tế</span>
                  </label>

                  <div className="note-form-actions">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={!editContent.trim()}
                      onClick={() => handleSaveEdit(note.id)}
                      data-testid="save-edit-button"
                    >
                      Cập nhật
                    </Button>
                  </div>
                </div>
              ) : confirmDeleteId === note.id ? (
                /* Hộp thoại xác nhận xóa ghi chú (Requirement 3) */
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bha-error-bg)',
                    borderRadius: 'var(--bha-radius-md)',
                    border: '1px solid #EF9A9A',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                  data-testid={`confirm-delete-box-${note.id}`}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--bha-error)',
                    }}
                  >
                    ⚠️ Bạn có chắc chắn muốn xóa ghi chú này không?
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleConfirmDelete(note.id)}
                      style={{ backgroundColor: 'var(--bha-error)' }}
                      data-testid="confirm-delete-button"
                    >
                      Xác nhận xóa
                    </Button>
                  </div>
                </div>
              ) : (
                /* Hiển thị chi tiết ghi chú */
                <>
                  <div className="note-item-header">
                    <p className="note-content-text" data-testid="note-content-text">
                      {note.content}
                    </p>
                    <div className="note-item-actions">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(note)}
                        data-testid={`edit-note-btn-${note.id}`}
                      >
                        ✏️ Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(note.id)}
                        data-testid={`delete-note-btn-${note.id}`}
                      >
                        🗑️ Xóa
                      </Button>
                    </div>
                  </div>

                  {note.actualOutcome && (
                    <div className="note-outcome-box" data-testid="note-outcome-box">
                      <strong>Nghiệm lý thực tế:</strong> {note.actualOutcome}
                    </div>
                  )}

                  <div className="note-item-footer">
                    <span>Tạo lúc: {new Date(note.createdAt).toLocaleString('vi-VN')}</span>
                    {note.isVerified && (
                      <span className="note-verified-tag" data-testid="note-verified-tag">
                        ✓ Đã ứng nghiệm
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
