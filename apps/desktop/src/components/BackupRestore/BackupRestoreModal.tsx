import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Modal } from '@kindich/shared';
import {
  CURRENT_SCHEMA_VERSION,
  KinDichDatabase,
  checkImportConflicts,
  exportBackup,
  getKinDichDatabase,
  importBackup,
  validateBackupData,
} from '@kindich/database';
import {
  BackupValidationResult,
  DuplicateConflictSummary,
  ImportSummary,
  KinDichBackupData,
} from '@kindich/domain';
import './BackupRestore.css';

export interface BackupRestoreModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRestoreSuccess?: () => void;
  readonly database?: KinDichDatabase;
}

type ActiveTab = 'export' | 'restore';

/**
 * Modal Sao Lưu & Khôi Phục Dữ Liệu Offline (Requirements 1-8)
 */
export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
  database,
}) => {
  const db = database ?? getKinDichDatabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('export');

  // Thống kê cơ sở dữ liệu hiện tại
  const [stats, setStats] = useState({
    divinationsCount: 0,
    resultsCount: 0,
    analysesCount: 0,
    notesCount: 0,
  });

  // Trạng thái thao tác Xuất
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Trạng thái thao tác Khôi phục
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<KinDichBackupData | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [conflictSummary, setConflictSummary] = useState<DuplicateConflictSummary | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'skip'>('overwrite');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessSummary, setImportSuccessSummary] = useState<ImportSummary | null>(null);

  // Tải thống kê hiện tại
  const loadDbStats = useCallback(async () => {
    try {
      const [divCount, resCount, anaCount, noteCount] = await Promise.all([
        db.divinations.count(),
        db.divination_results.count(),
        db.divination_analyses.count(),
        db.divination_notes.count(),
      ]);
      setStats({
        divinationsCount: divCount,
        resultsCount: resCount,
        analysesCount: anaCount,
        notesCount: noteCount,
      });
    } catch (err) {
      console.error('Lỗi khi tải thống kê cơ sở dữ liệu:', err);
    }
  }, [db]);

  useEffect(() => {
    if (isOpen) {
      loadDbStats();
      setExportNotice(null);
      setSelectedFile(null);
      setParsedBackup(null);
      setValidationResult(null);
      setConflictSummary(null);
      setImportError(null);
      setImportSuccessSummary(null);
    }
  }, [isOpen, loadDbStats]);

  /**
   * Xuất toàn bộ dữ liệu ra file JSON offline (Requirement 1, 2, 3, 8)
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportNotice(null);

      const backupData = await exportBackup(db, {
        appVersion: '1.0.0',
        defaultRuleSetId: 'BO_PHE_CHINH_TONG_V1',
        defaultAlgorithmVersion: 'SERIAL-MOD8-V1',
      });

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });

      // Tạo tên file kèm dấu mốc thời gian ISO YYYY-MM-DD
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const fileName = `kindich_backup_${dateStr}.json`;

      // Tạo link tải ảo và tự động kích hoạt tải về trên trình duyệt
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice(
        `✓ Đã xuất thành công ${backupData.metadata.totalDivinations} lần lập quẻ, ${backupData.metadata.totalNotes} ghi chú và cấu hình vào file "${fileName}"!`
      );
    } catch (err) {
      console.error('Lỗi khi xuất file sao lưu:', err);
      setExportNotice('❌ Có lỗi xảy ra trong quá trình xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Xử lý khi người dùng chọn file JSON sao lưu (Requirement 4, 5, 6)
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportError(null);
    setImportSuccessSummary(null);
    setValidationResult(null);
    setConflictSummary(null);
    setParsedBackup(null);

    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        setImportError('File không phải là định dạng JSON hợp lệ hoặc đã bị lỗi cú pháp.');
        return;
      }

      // Kiểm tra tính hợp lệ trước khi nhập (Requirement 5)
      const validation = validateBackupData(json);
      setValidationResult(validation);

      if (!validation.isValid) {
        setImportError(
          `File sao lưu không đáp ứng tiêu chuẩn cấu trúc:\n${validation.errors.join('\n')}`
        );
        return;
      }

      const backupObj = json as KinDichBackupData;
      setParsedBackup(backupObj);

      // Kiểm tra xung đột trùng lặp (Requirement 6)
      const conflicts = await checkImportConflicts(db, backupObj);
      setConflictSummary(conflicts);
    } catch (err) {
      console.error('Lỗi khi đọc file sao lưu:', err);
      setImportError('Không thể đọc file đã chọn. Vui lòng thử lại.');
    }
  };

  /**
   * Thực hiện khôi phục dữ liệu vào IndexedDB (Requirement 4, 6, 7, 8)
   */
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;

    try {
      setIsImporting(true);
      setImportError(null);

      const result = await importBackup(db, parsedBackup, { mode: importMode });

      if (result.success) {
        setImportSuccessSummary(result);
        await loadDbStats();
        if (onRestoreSuccess) {
          onRestoreSuccess();
        }
      } else {
        setImportError(
          `Khôi phục dữ liệu thất bại:\n${result.errors.join('\n')}`
        );
      }
    } catch (err) {
      console.error('Lỗi khi khôi phục dữ liệu:', err);
      setImportError('Đã xảy ra sự cố trong quá trình ghi dữ liệu vào IndexedDB.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💾 Sao Lưu & Khôi Phục Dữ Liệu"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="backup-restore-container" data-testid="backup-restore-modal">
        {/* Thanh chuyển đổi Tab */}
        <div className="backup-restore-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'export'}
            className={`backup-tab-btn ${activeTab === 'export' ? 'backup-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('export')}
            data-testid="tab-export"
          >
            <span>📤</span>
            <span>Sao Lưu Dữ Liệu (Export)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'restore'}
            className={`backup-tab-btn ${activeTab === 'restore' ? 'backup-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('restore')}
            data-testid="tab-restore"
          >
            <span>📥</span>
            <span>Khôi Phục Dữ Liệu (Restore)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: SAO LƯU DỮ LIỆU (EXPORT) */}
        {/* ============================================================== */}
        {activeTab === 'export' ? (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--bha-text-secondary)', marginTop: 0 }}>
              Xuất toàn bộ lịch sử lập quẻ, phân tích Lục Hào, ghi chú và cấu hình cá nhân ra file
              JSON. Dữ liệu được đóng gói an toàn và lưu trực tiếp trên máy của bạn (100% offline).
            </p>

            {/* Thống kê dữ liệu hiện có trong DB */}
            <div className="backup-stats-grid" data-testid="backup-stats-grid">
              <div className="backup-stat-card">
                <div className="backup-stat-card__label">Tổng Lần Lập Quẻ</div>
                <div className="backup-stat-card__value" data-testid="stat-divinations">
                  {stats.divinationsCount}
                </div>
              </div>
              <div className="backup-stat-card">
                <div className="backup-stat-card__label">Kết Quả Quẻ</div>
                <div className="backup-stat-card__value">{stats.resultsCount}</div>
              </div>
              <div className="backup-stat-card">
                <div className="backup-stat-card__label">Bản Phân Tích</div>
                <div className="backup-stat-card__value">{stats.analysesCount}</div>
              </div>
              <div className="backup-stat-card">
                <div className="backup-stat-card__label">Ghi Chú Nghiệm Lý</div>
                <div className="backup-stat-card__value" data-testid="stat-notes">
                  {stats.notesCount}
                </div>
              </div>
            </div>

            {/* Thông tin Metadata chuẩn được lưu kèm (Requirement 3) */}
            <div className="backup-meta-list">
              <span className="backup-meta-pill">Schema: V{CURRENT_SCHEMA_VERSION}</span>
              <span className="backup-meta-pill">RuleSet: BO_PHE_CHINH_TONG_V1</span>
              <span className="backup-meta-pill">Algorithm: SERIAL-MOD8-V1</span>
              <span className="backup-meta-pill">Offline: Không gửi dữ liệu lên máy chủ</span>
            </div>

            {exportNotice && (
              <div
                className={`backup-alert ${
                  exportNotice.startsWith('✓') ? 'backup-alert--success' : 'backup-alert--error'
                }`}
                style={{ marginTop: '16px' }}
                data-testid="export-notice"
              >
                {exportNotice}
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Button
                variant="gold"
                size="md"
                onClick={handleExport}
                disabled={isExporting}
                data-testid="execute-export-button"
              >
                <span>{isExporting ? 'Đang đóng gói file...' : '📤 Tải file sao lưu (.json) ngay'}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* TAB 2: KHÔI PHỤC DỮ LIỆU (RESTORE) */
          /* ============================================================== */
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--bha-text-secondary)', marginTop: 0 }}>
              Chọn file JSON sao lưu từ máy để khôi phục lại dữ liệu lịch sử gieo quẻ và ghi chú.
              Hệ thống sẽ tự động kiểm tra tính hợp lệ trước khi ghi dữ liệu.
            </p>

            {/* Vùng chọn file */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              data-testid="backup-file-input"
            />

            <div
              className="backup-dropzone"
              onClick={() => fileInputRef.current?.click()}
              data-testid="backup-dropzone"
            >
              <div className="backup-dropzone__icon">📁</div>
              <div className="backup-dropzone__text">
                {selectedFile ? selectedFile.name : 'Bấm vào đây để chọn file JSON sao lưu'}
              </div>
              <div className="backup-dropzone__sub">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB - Nhấp để đổi file khác`
                  : 'Chỉ chấp nhận file .json có định dạng KINDICH_BACKUP'}
              </div>
            </div>

            {/* Thông báo lỗi khi đọc / validate file */}
            {importError && (
              <div
                className="backup-alert backup-alert--error"
                style={{ marginTop: '16px' }}
                data-testid="import-error-alert"
              >
                <div className="backup-alert__title">❌ Không thể khôi phục file</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{importError}</div>
              </div>
            )}

            {/* Kết quả kiểm tra file hợp lệ và xem trước thông tin */}
            {validationResult?.isValid && validationResult.summary && (
              <div style={{ marginTop: '16px' }}>
                <div className="backup-alert backup-alert--success" data-testid="file-preview-card">
                  <div className="backup-alert__title">
                    ✓ File hợp lệ (KINDICH_BACKUP Schema V{validationResult.summary.schemaVersion})
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    Tìm thấy: <strong>{validationResult.summary.totalDivinations}</strong> lần lập quẻ,{' '}
                    <strong>{validationResult.summary.totalNotes}</strong> ghi chú,{' '}
                    <strong>{validationResult.summary.totalResults}</strong> kết quả.
                    {validationResult.summary.requiresMigration && (
                      <span style={{ color: '#E65100', marginLeft: '6px' }}>
                        (Sẽ tự động nâng cấp từ Schema V{validationResult.summary.schemaVersion} lên V
                        {CURRENT_SCHEMA_VERSION})
                      </span>
                    )}
                  </div>
                </div>

                {/* Cảnh báo xung đột trùng lặp (Requirement 6) */}
                {conflictSummary?.hasConflicts && (
                  <div
                    className="backup-alert backup-alert--warning"
                    style={{ marginTop: '14px' }}
                    data-testid="duplicate-warning-banner"
                  >
                    <div className="backup-alert__title">
                      ⚠️ Cảnh Báo Trùng Lặp: Phát hiện {conflictSummary.duplicateDivinationsCount} lần lập
                      quẻ đã tồn tại trong máy!
                    </div>
                    <div>
                      Có <strong>{conflictSummary.duplicateDivinationsCount}</strong> bản ghi trùng mã
                      định danh (ID) và <strong>{conflictSummary.newDivinationsCount}</strong> bản ghi
                      mới chưa có.
                    </div>

                    {/* Lựa chọn phương án xử lý trùng lặp */}
                    <div className="conflict-options-box" style={{ marginTop: '8px' }}>
                      <label className="conflict-option-item">
                        <input
                          type="radio"
                          name="importMode"
                          value="overwrite"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                          data-testid="radio-overwrite"
                        />
                        <div className="conflict-option-item__label">
                          <span className="conflict-option-item__title">
                            Ghi đè bản ghi trùng lặp (Khuyến nghị)
                          </span>
                          <span className="conflict-option-item__desc">
                            Cập nhật lại các bản ghi trùng bằng dữ liệu mới nhất từ file sao lưu.
                          </span>
                        </div>
                      </label>

                      <label className="conflict-option-item">
                        <input
                          type="radio"
                          name="importMode"
                          value="skip"
                          checked={importMode === 'skip'}
                          onChange={() => setImportMode('skip')}
                          data-testid="radio-skip"
                        />
                        <div className="conflict-option-item__label">
                          <span className="conflict-option-item__title">
                            Bỏ qua bản ghi trùng lặp
                          </span>
                          <span className="conflict-option-item__desc">
                            Giữ nguyên dữ liệu cũ trên máy, chỉ nhập {conflictSummary.newDivinationsCount}{' '}
                            bản ghi mới.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Nút bấm thực hiện khôi phục */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleExecuteRestore}
                    disabled={isImporting}
                    data-testid="execute-restore-button"
                  >
                    <span>
                      {isImporting
                        ? 'Đang khôi phục dữ liệu...'
                        : `📥 Khôi phục ${validationResult.summary.totalDivinations} lần lập quẻ`}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* Thông báo kết quả khôi phục thành công (Requirement 7) */}
            {importSuccessSummary && (
              <div
                className="backup-alert backup-alert--success"
                style={{ marginTop: '16px' }}
                data-testid="restore-success-notice"
              >
                <div className="backup-alert__title">✓ Khôi Phục Dữ Liệu Thành Công!</div>
                <div>
                  - Nhập mới: <strong>{importSuccessSummary.importedDivinations}</strong> lần lập quẻ.
                  <br />- Ghi đè cập nhật:{' '}
                  <strong>{importSuccessSummary.overwrittenDivinations}</strong> lần lập quẻ.
                  <br />- Bỏ qua trùng lặp:{' '}
                  <strong>{importSuccessSummary.skippedDivinations}</strong> lần lập quẻ.
                  <br />- Ghi chú khôi phục: <strong>{importSuccessSummary.importedNotes}</strong>.
                  <br />- Cấu hình khôi phục:{' '}
                  <strong>{importSuccessSummary.importedSettings}</strong> mục.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
