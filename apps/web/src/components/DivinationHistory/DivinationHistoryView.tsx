import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, Input, Modal, Select } from '@kindich/shared';
import {
  CastingMethod,
  DivinationFilterOptions,
  DivinationSummaryItem,
  IDivinationRepository,
} from '@kindich/domain';
import { getDivinationRepository } from '../../services/repository.service';
import { DivinationDetailModal } from './DivinationDetailModal';
import './DivinationHistory.css';

export interface DivinationHistoryViewProps {
  repository?: IDivinationRepository;
  onSelectForAnalysis?: (hexNumber: number, movingLines: number[]) => void;
}

export const DivinationHistoryView: React.FC<DivinationHistoryViewProps> = ({
  repository,
}) => {
  const repo = repository ?? getDivinationRepository();

  // Danh sách và phân trang
  const [items, setItems] = useState<readonly DivinationSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Bộ lọc tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Xem chi tiết
  const [selectedDivinationId, setSelectedDivinationId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Xác nhận xóa
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Thông báo phản hồi người dùng
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /**
   * Tải danh sách quẻ từ Repository dựa trên bộ lọc và phân trang hiện tại
   */
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const filter: DivinationFilterOptions = {
        query: searchQuery.trim() || undefined,
        method:
          methodFilter === 'ALL'
            ? undefined
            : (methodFilter as CastingMethod),
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
      };

      const result = await repo.list(filter, { page, pageSize, sortBy: 'createdAt', sortDirection: 'desc' });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử lập quẻ:', err);
      setStatusMessage('Không thể tải danh sách lịch sử. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [repo, searchQuery, methodFilter, startDate, endDate, page, pageSize]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Xử lý tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  // Làm mới bộ lọc
  const handleResetFilters = () => {
    setSearchQuery('');
    setMethodFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = (id: string) => {
    setSelectedDivinationId(id);
    setIsDetailOpen(true);
  };

  // Yêu cầu xác nhận xóa
  const handlePromptDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteConfirmOpen(true);
  };

  // Thực hiện xóa sau khi người dùng xác nhận
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setIsDeleting(true);
      await repo.delete(deletingId);
      setIsDeleteConfirmOpen(false);
      setDeletingId(null);
      if (selectedDivinationId === deletingId) {
        setIsDetailOpen(false);
        setSelectedDivinationId(null);
      }
      setStatusMessage('Đã xóa lần lập quẻ thành công.');
      setTimeout(() => setStatusMessage(null), 3000);
      await loadHistory();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa quẻ.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Đổi trạng thái yêu thích
  const handleToggleStar = async (id: string, currentStarred?: boolean) => {
    try {
      await repo.update(id, { starred: !currentStarred });
      await loadHistory();
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);
    }
  };

  const methodOptions = [
    { value: 'ALL', label: 'Tất cả phương pháp' },
    { value: CastingMethod.SERIAL, label: 'Số seri tiền (SERIAL-MOD8-V1)' },
    { value: CastingMethod.MAI_HUA, label: 'Giờ động tâm (Mai Hoa Dịch Số)' },
  ];

  return (
    <div className="history-view-container">
      <Card
        title="Lịch Sử Lập Quẻ & Chiêm Đoán"
        subtitle="Toàn bộ lịch sử được lưu trữ bảo mật offline trên thiết bị qua IndexedDB, không phụ thuộc internet"
        borderVariant="gold"
      >
        {/* Thanh tìm kiếm và bộ lọc */}
        <form onSubmit={handleSearchSubmit} className="history-filters-bar">
          <div className="filter-item search-input">
            <Input
              placeholder="Tìm câu hỏi, tên quẻ, Can Chi, ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="md"
              leftIcon={<span style={{ fontSize: '1.1rem' }}>🔍</span>}
            />
          </div>

          <div className="filter-item method-select">
            <Select
              options={methodOptions}
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              fullWidth
              size="md"
            />
          </div>

          <div className="filter-item date-input">
            <input
              type="date"
              className="bha-input date-picker"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              aria-label="Từ ngày"
              title="Từ ngày"
            />
          </div>

          <div className="filter-item date-input">
            <input
              type="date"
              className="bha-input date-picker"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              aria-label="Đến ngày"
              title="Đến ngày"
            />
          </div>

          <div className="filter-actions">
            <Button type="submit" variant="primary" size="md">
              Tìm kiếm
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetFilters}
            >
              Làm mới
            </Button>
          </div>
        </form>

        {/* Thông báo trạng thái */}
        {statusMessage && (
          <div className="history-status-alert">
            <span>✓</span> {statusMessage}
          </div>
        )}

        {/* Thống kê và chỉ số */}
        <div className="history-stats-bar">
          <span>
            Tìm thấy <strong>{totalCount}</strong> lần lập quẻ
          </span>
          {totalPages > 1 && (
            <span>
              Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
            </span>
          )}
        </div>

        {/* Danh sách kết quả */}
        {loading ? (
          <div className="history-loading-box">
            <div className="spinner">☯</div>
            <p>Đang tải dữ liệu lịch sử từ Repository...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="history-empty-box">
            <div className="empty-icon">📜</div>
            <h4>Không tìm thấy dữ liệu lịch sử</h4>
            <p>
              {searchQuery || methodFilter !== 'ALL' || startDate || endDate
                ? 'Không có kết quả nào phù hợp với bộ lọc hiện tại. Vui lòng thử từ khóa khác hoặc bấm "Làm mới".'
                : 'Bạn chưa lập quẻ nào. Hãy chọn tab "Lập quẻ bằng seri tiền" hoặc "Giờ động tâm" để bắt đầu chiêm đoán.'}
            </p>
          </div>
        ) : (
          <div className="history-cards-grid">
            {items.map((item) => (
              <div key={item.id} className="history-item-card">
                <div className="history-card-header">
                  <div className="history-method-tag">
                    {item.method === CastingMethod.SERIAL ? (
                      <span className="badge-serial">🔢 Seri tiền</span>
                    ) : (
                      <span className="badge-maihua">⏳ Giờ động tâm</span>
                    )}
                    <span className="history-time-str">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`star-btn ${item.starred ? 'starred' : ''}`}
                    onClick={() => handleToggleStar(item.id, item.starred)}
                    title={item.starred ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                    aria-label="Yêu thích"
                  >
                    {item.starred ? '★' : '☆'}
                  </button>
                </div>

                <div className="history-card-body">
                  {/* Nội dung câu hỏi */}
                  <h4 className="history-question">
                    {item.question ? item.question : <em className="no-question">(Không ghi câu hỏi cụ thể)</em>}
                  </h4>

                  {/* Cặp quẻ: Quẻ Chủ -> Quẻ Biến */}
                  <div className="history-hexagrams-row">
                    <div className="hex-block primary">
                      <span className="hex-label">Quẻ Chủ:</span>
                      <strong className="hex-name">
                        #{item.primaryHexagramNumber} {item.primaryHexagramName}
                      </strong>
                      {item.primaryHexagramSinoVietnameseName && (
                        <span className="sino-name">
                          ({item.primaryHexagramSinoVietnameseName})
                        </span>
                      )}
                    </div>

                    <div className="hex-arrow">➔</div>

                    <div className="hex-block changing">
                      <span className="hex-label">Quẻ Biến:</span>
                      <strong className="hex-name">
                        {item.changingHexagramNumber ? `#${item.changingHexagramNumber} ${item.changingHexagramName}` : 'Quẻ Tĩnh'}
                      </strong>
                      {item.changingHexagramSinoVietnameseName && (
                        <span className="sino-name">
                          ({item.changingHexagramSinoVietnameseName})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chi tiết lịch & hào động */}
                  <div className="history-meta-row">
                    <span>📅 {item.lunarDateStr}</span>
                    <span>•</span>
                    <span>Ngày {item.dayCanChi} (Tháng {item.monthCanChi})</span>
                    {item.movingLines.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="moving-tag">
                          Động hào: {item.movingLines.join(', ')}
                        </span>
                      </>
                    )}
                    {item.noteCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="notes-tag">📝 {item.noteCount} ghi chú</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="history-card-footer">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenDetail(item.id)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptDelete(item.id)}
                    className="delete-item-btn"
                  >
                    🗑 Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="history-pagination-bar">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ◀ Trang trước
            </Button>
            <span className="pagination-info">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Trang sau ▶
            </Button>
          </div>
        )}
      </Card>

      {/* Modal Xem chi tiết một lần lập quẻ */}
      <DivinationDetailModal
        divinationId={selectedDivinationId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDivinationId(null);
        }}
        onDeleteRequested={(id) => {
          handlePromptDelete(id);
        }}
        onNotesUpdated={() => {
          loadHistory();
        }}
        repository={repo}
      />

      {/* Modal Xác nhận trước khi xóa (Requirement 7) */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteConfirmOpen(false);
            setDeletingId(null);
          }
        }}
        title="⚠️ Xác Nhận Xóa Lịch Sử Lập Quẻ"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="outline"
              size="md"
              disabled={isDeleting}
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setDeletingId(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              style={{ backgroundColor: 'var(--bha-crimson-700)', borderColor: 'var(--bha-crimson-800)' }}
            >
              Xác nhận xóa
            </Button>
          </div>
        }
      >
        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--bha-text-primary)' }}>
          <p style={{ margin: '0 0 12px' }}>
            Bạn có chắc chắn muốn xóa bản ghi lần lập quẻ này khỏi lịch sử không?
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bha-crimson-700)', backgroundColor: 'rgba(133, 22, 22, 0.08)', padding: '10px', borderRadius: '6px' }}>
            ⚠️ <strong>Lưu ý:</strong> Dữ liệu kết quả quẻ, đồ bản phân tích Lục Hào và toàn bộ ghi chú nghiệm lý liên quan sẽ bị xóa vĩnh viễn trên thiết bị của bạn và không thể phục hồi.
          </p>
        </div>
      </Modal>
    </div>
  );
};
