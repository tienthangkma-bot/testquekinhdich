import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, Modal } from '@kindich/shared';
import {
  CastingMethod,
  DivinationDetailAggregate,
  IDivinationRepository,
} from '@kindich/domain';
import { getDivinationRepository } from '../../services/repository.service';
import { SixYaoAnalysisView } from '../SixYaoAnalysis';
import {
  DivinationNotesSection,
  getCategoryDefinition,
  getCategoryIcon,
  getCategoryLabel,
} from '../NotesAndQuestions';

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

  // Tải thông tin chi tiết quẻ từ Repository
  const loadDetail = useCallback(async () => {
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
  }, [divinationId, repo]);

  useEffect(() => {
    if (isOpen && divinationId) {
      loadDetail();
    } else {
      setDetail(null);
    }
  }, [isOpen, divinationId, loadDetail]);

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
                <div style={{ marginTop: '8px' }}>
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: getCategoryDefinition(div.inquiryType).bgColor,
                      color: getCategoryDefinition(div.inquiryType).color,
                      border: `1px solid ${getCategoryDefinition(div.inquiryType).color}40`,
                    }}
                  >
                    <span>{getCategoryIcon(div.inquiryType)}</span>
                    <span>Phân loại: {getCategoryLabel(div.inquiryType)}</span>
                  </span>
                </div>
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

          {/* Khu vực Ghi chú cá nhân và Kiểm chứng Nghiệm lý (Requirement 3) */}
          <Card padding="md" borderVariant="gold">
            <DivinationNotesSection
              divinationId={div.id}
              notes={detail.notes}
              repository={repo}
              onNotesChanged={async () => {
                await loadDetail();
                if (onNotesUpdated) onNotesUpdated();
              }}
            />
          </Card>
        </div>
      )}
    </Modal>
  );
};
