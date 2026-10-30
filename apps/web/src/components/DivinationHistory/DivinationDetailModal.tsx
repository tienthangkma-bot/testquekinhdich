import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Input } from '@kindich/shared';
import {
  CastingMethod,
  DivinationDetailAggregate,
  DivinationNoteEntity,
  IDivinationRepository,
} from '@kindich/domain';
import { getDivinationRepository } from '../../services/repository.service';
import { SixYaoAnalysisView } from '../SixYaoAnalysis';

export interface DivinationDetailModalProps {
  divinationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteRequested?: (id: string) => void;
  onNotesUpdated?: () => void;
  repository?: IDivinationRepository;
}

export const DivinationDetailModal: React.FC<DivinationDetailModalProps> = ({
  divinationId,
  isOpen,
  onClose,
  onDeleteRequested,
  onNotesUpdated,
  repository,
}) => {
  const repo = repository ?? getDivinationRepository();
  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<DivinationDetailAggregate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái thêm ghi chú mới
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteOutcome, setNewNoteOutcome] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Trạng thái sửa ghi chú
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editOutcome, setEditOutcome] = useState('');
  const [editVerified, setEditVerified] = useState(false);

  // Tải thông tin chi tiết quẻ từ Repository
  const loadDetail = async () => {
    if (!divinationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await repo.getById(divinationId);
      if (!data) {
        setError('Không tìm thấy dữ liệu lần lập quẻ này.');
      } else {
        setDetail(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết quẻ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && divinationId) {
      loadDetail();
      setIsAddingNote(false);
      setEditingNoteId(null);
    } else {
      setDetail(null);
    }
  }, [isOpen, divinationId]);

  // Xử lý thêm ghi chú mới
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divinationId || !newNoteContent.trim()) return;

    try {
      await repo.addNote(divinationId, newNoteContent.trim(), newNoteOutcome.trim() || undefined);
      setNewNoteContent('');
      setNewNoteOutcome('');
      setIsAddingNote(false);
      await loadDetail();
      if (onNotesUpdated) onNotesUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm ghi chú.');
    }
  };

  // Bắt đầu sửa ghi chú
  const handleStartEditNote = (note: DivinationNoteEntity) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditOutcome(note.actualOutcome || '');
    setEditVerified(note.isVerified || false);
  };

  // Lưu sửa ghi chú
  const handleSaveEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      await repo.updateNote(
        noteId,
        editContent.trim(),
        editOutcome.trim() || undefined,
        editVerified
      );
      setEditingNoteId(null);
      await loadDetail();
      if (onNotesUpdated) onNotesUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi sửa ghi chú.');
    }
  };

  // Xóa một ghi chú
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) return;
    try {
      await repo.deleteNote(noteId);
      await loadDetail();
      if (onNotesUpdated) onNotesUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa ghi chú.');
    }
  };

  if (!isOpen) return null;

  const div = detail?.divination;
  const trio = detail?.result?.trio ?? div?.resultSnapshot?.trio;
  const dt = div?.dateTimeInfo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜</span>
          <span>Chi Tiết Lần Lập Quẻ Lịch Sử</span>
        </div>
      }
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {divinationId && onDeleteRequested ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteRequested(divinationId)}
              style={{ color: 'var(--bha-crimson-700)', borderColor: 'var(--bha-crimson-300)' }}
            >
              🗑 Xóa lần lập quẻ này
            </Button>
          ) : (
            <div></div>
          )}
          <Button variant="primary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--bha-text-secondary)' }}>
          <p>Đang tải dữ liệu chi tiết từ cơ sở dữ liệu...</p>
        </div>
      ) : error || !detail || !div || !trio || !dt ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--bha-crimson-600)' }}>
          <p>{error || 'Không tìm thấy dữ liệu.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Thông tin tổng quan */}
          <Card padding="md" borderVariant="gold">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                  Phương pháp:
                </span>
                <strong style={{ fontSize: '1rem', color: 'var(--bha-crimson-800)' }}>
                  {div.method === CastingMethod.SERIAL ? '🔢 Seri tiền (SERIAL-MOD8-V1)' : '⏳ Giờ động tâm (Mai Hoa)'}
                </strong>
                {div.method === CastingMethod.SERIAL && 'serialNumber' in div.input && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)' }}>
                    Seri: <code>{(div.input as { serialNumber: string }).serialNumber}</code>
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                  Thời điểm lập quẻ:
                </span>
                <strong style={{ fontSize: '0.95rem' }}>
                  {new Date(div.createdAt).toLocaleString('vi-VN')}
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--bha-gold-700)' }}>
                  Âm lịch: Ngày {dt.lunarDay} tháng {dt.lunarMonth < 0 ? `${Math.abs(dt.lunarMonth)} (Nhuận)` : dt.lunarMonth} năm {dt.yearCanChi}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                  Can Chi 4 Trụ & Tiết khí:
                </span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Năm {dt.yearCanChi} • Tháng {dt.monthCanChi} • Ngày {dt.dayCanChi} • Giờ {dt.hourCanChi}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)' }}>
                  {dt.solarTerm ? `Tiết: ${dt.solarTerm}` : ''}{dt.voidBranches ? ` • Không Vong: ${dt.voidBranches.join(', ')}` : ''}
                </div>
              </div>
            </div>

            {/* Nội dung câu hỏi và mục đích */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--bha-border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--bha-text-muted)', display: 'block' }}>
                Nội dung câu hỏi chiêm nghiệm:
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 600, color: 'var(--bha-text-primary)' }}>
                {div.question ? div.question : <em style={{ color: 'var(--bha-text-muted)' }}>(Không ghi câu hỏi cụ thể)</em>}
              </p>
              {div.inquiryType && (
                <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bha-bg-subtle)', color: 'var(--bha-text-secondary)' }}>
                  Mục đích: {div.inquiryType}
                </span>
              )}
            </div>
          </Card>

          {/* Bộ 3 Quẻ Tóm lược */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <Card padding="sm" borderVariant="default">
              <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ CHỦ:</span>
              <h4 style={{ margin: '4px 0 0', color: 'var(--bha-crimson-800)' }}>
                #{trio.primary.number} - {trio.primary.name}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)' }}>
                ({trio.primary.sinoVietnameseName})
              </div>
            </Card>

            <Card padding="sm" borderVariant="default">
              <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ BIẾN:</span>
              <h4 style={{ margin: '4px 0 0', color: 'var(--bha-crimson-800)' }}>
                #{trio.transformed.number} - {trio.transformed.name}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)' }}>
                {trio.hasMovingLines ? `Động hào: ${trio.movingLineIndices.join(', ')}` : 'Quẻ Tĩnh'}
              </div>
            </Card>

            <Card padding="sm" borderVariant="default">
              <span style={{ fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>QUẺ HỖ:</span>
              <h4 style={{ margin: '4px 0 0', color: 'var(--bha-crimson-800)' }}>
                #{trio.nuclear.number} - {trio.nuclear.name}
              </h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--bha-text-secondary)' }}>
                ({trio.nuclear.sinoVietnameseName})
              </div>
            </Card>
          </div>

          {/* Đồ bản Phân tích Lục Hào Chi Tiết */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--bha-crimson-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>☯</span>
              <span>Đồ Bản Phân Tích Lục Hào Cổ Pháp</span>
            </h3>
            <SixYaoAnalysisView
              primaryHexagram={trio.primary.number}
              changingHexagram={trio.transformed.number}
              movingLineIndices={trio.movingLineIndices}
              dateTime={{
                dayCanChi: dt.dayCanChi,
                monthCanChi: dt.monthCanChi,
                yearCanChi: dt.yearCanChi,
                hourCanChi: dt.hourCanChi,
              }}
            />
          </div>

          {/* Khu vực Ghi chú cá nhân và Kiểm chứng Nghiệm lý */}
          <Card title="Ghi Chú & Nghiệm Lý Sự Việc" padding="md" borderVariant="gold">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bha-text-secondary)' }}>
                Ghi chép lại các nhận định ban đầu và theo dõi sự việc ứng nghiệm trên thực tế.
              </p>
              {!isAddingNote && (
                <Button size="sm" variant="gold" onClick={() => setIsAddingNote(true)}>
                  + Thêm ghi chú
                </Button>
              )}
            </div>

            {/* Form thêm ghi chú mới */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bha-bg-subtle)', borderRadius: '8px', border: '1px solid var(--bha-border-subtle)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      Nội dung ghi chú / Lời luận giải:
                    </label>
                    <textarea
                      rows={3}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Ghi nhận định hoặc lời khuyên của quẻ..."
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--bha-border-base)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <Input
                      label="Kết quả thực tế sau này (nếu đã ứng nghiệm):"
                      placeholder="Ví dụ: Thi đậu ngày 15/10 đúng như dự đoán..."
                      value={newNoteOutcome}
                      onChange={(e) => setNewNoteOutcome(e.target.value)}
                      fullWidth
                      size="sm"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingNote(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" variant="primary" type="submit">
                      Lưu ghi chú
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Danh sách ghi chú */}
            {detail.notes.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'var(--bha-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Chưa có ghi chú nào cho lần lập quẻ này.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {detail.notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bha-bg-surface)',
                      border: '1px solid var(--bha-border-subtle)',
                    }}
                  >
                    {editingNoteId === note.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--bha-border-base)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                        <Input
                          label="Kết quả thực tế:"
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value)}
                          size="sm"
                          fullWidth
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={editVerified}
                            onChange={(e) => setEditVerified(e.target.checked)}
                          />
                          Đánh dấu đã ứng nghiệm thực tế
                        </label>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>
                            Hủy
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => handleSaveEditNote(note.id)}>
                            Lưu thay đổi
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: 'var(--bha-text-primary)' }}>
                            {note.content}
                          </p>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Button size="sm" variant="ghost" onClick={() => handleStartEditNote(note)}>
                              ✏️ Sửa
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                              🗑️ Xóa
                            </Button>
                          </div>
                        </div>

                        {note.actualOutcome && (
                          <div style={{ marginTop: '6px', padding: '6px 10px', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '4px', borderLeft: '3px solid var(--bha-gold-600)', fontSize: '0.85rem' }}>
                            <strong>Nghiệm lý thực tế:</strong> {note.actualOutcome}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--bha-text-muted)' }}>
                          <span>Tạo lúc: {new Date(note.createdAt).toLocaleString('vi-VN')}</span>
                          {note.isVerified && (
                            <span style={{ color: 'var(--bha-gold-700)', fontWeight: 700 }}>
                              ✓ Đã ứng nghiệm
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </Modal>
  );
};
