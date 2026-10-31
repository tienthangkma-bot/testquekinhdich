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
import {
  ISqliteDatabase,
  exportSqliteBackup,
  validateSqliteBackupData,
  checkSqliteImportConflicts,
  importSqliteBackup,
} from '../../database';
import { getDivinationDatabase } from '../../services/repository.service';
import './BackupRestore.css';

export interface BackupRestoreModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRestoreSuccess?: () => void;
  readonly database?: KinDichDatabase;
  readonly sqliteDatabase?: ISqliteDatabase;
  readonly initialTab?: ActiveTab;
}

type ActiveTab = 'export' | 'restore';

/**
 * Modal Sao Lưu & Khôi Phục Dữ Liệu Offline (Hỗ trợ cả SQLite Desktop và Dexie Fallback)
 */
export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
  database,
  sqliteDatabase,
  initialTab,
}) => {
  const sqliteDb = sqliteDatabase ?? getDivinationDatabase();
  const db = database ?? getKinDichDatabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || 'export');

  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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
      if (sqliteDb) {
        const [divRow, resRow, anaRow, noteRow] = await Promise.all([
          sqliteDb.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM divinations;'),
          sqliteDb.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM divination_results;'),
          sqliteDb.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM divination_analyses;'),
          sqliteDb.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM divination_notes;'),
        ]);
        setStats({
          divinationsCount: divRow?.cnt ?? 0,
          resultsCount: resRow?.cnt ?? 0,
          analysesCount: anaRow?.cnt ?? 0,
          notesCount: noteRow?.cnt ?? 0,
        });
      } else {
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
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê cơ sở dữ liệu:', err);
    }
  }, [sqliteDb, db]);

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
   * Xuất toàn bộ dữ liệu ra file JSON offline
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportNotice(null);

      const backupData = sqliteDb
        ? await exportSqliteBackup(sqliteDb, {
            appVersion: '1.0.0',
            defaultRuleSetId: 'BO_PHE_CHINH_TONG_V1',
            defaultAlgorithmVersion: 'SERIAL-MOD8-V1',
          })
        : await exportBackup(db, {
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

      // Tạo link tải ảo và tự động kích hoạt tải về
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
   * Xử lý khi người dùng chọn file JSON sao lưu
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

      // Kiểm tra tính hợp lệ trước khi nhập
      const validation = sqliteDb
        ? validateSqliteBackupData(json)
        : validateBackupData(json);
      setValidationResult(validation);

      if (!validation.isValid) {
        setImportError(
          `File sao lưu không đáp ứng tiêu chuẩn cấu trúc:\n${validation.errors.join('\n')}`
        );
        return;
      }

      const backupObj = json as KinDichBackupData;
      setParsedBackup(backupObj);

      // Kiểm tra xung đột trùng lặp
      const conflicts = sqliteDb
        ? await checkSqliteImportConflicts(sqliteDb, backupObj)
        : await checkImportConflicts(db, backupObj);
      setConflictSummary(conflicts);
    } catch (err) {
      console.error('Lỗi khi đọc file sao lưu:', err);
      setImportError('Không thể đọc file đã chọn. Vui lòng thử lại.');
    }
  };

  /**
   * Thực hiện khôi phục dữ liệu
   */
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;

    try {
      setIsImporting(true);
      setImportError(null);

      const result = sqliteDb
        ? await importSqliteBackup(sqliteDb, parsedBackup, { mode: importMode === 'overwrite' ? 'overwrite' : 'merge' })
        : await importBackup(db, parsedBackup, { mode: importMode });

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
      setImportError('Đã xảy ra sự cố trong quá trình ghi dữ liệu.');
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
          >
            📤 Xuất Sao Lưu (JSON)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'restore'}
            className={`backup-tab-btn ${activeTab === 'restore' ? 'backup-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('restore')}
          >
            📥 Khôi Phục Dữ Liệu
          </button>
        </div>

        {/* Nội dung Tab Xuất Dữ Liệu */}
        {activeTab === 'export' && (
          <div className="backup-tab-content">
            <div className="backup-stats-box">
              <h4 className="backup-section-title">📊 Dữ liệu hiện có trong ứng dụng:</h4>
              <ul className="backup-stats-list">
                <li>
                  Lần lập quẻ: <strong>{stats.divinationsCount}</strong>
                </li>
                <li>
                  Kết quả quẻ: <strong>{stats.resultsCount}</strong>
                </li>
                <li>
                  Bản ghi phân tích: <strong>{stats.analysesCount}</strong>
                </li>
                <li>
                  Ghi chú & Nghiệm lý: <strong>{stats.notesCount}</strong>
                </li>
              </ul>
              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--bha-text-secondary)' }}>
                Lưu trữ: <strong>{sqliteDb ? 'SQLite Cục Bộ (Tauri 2)' : 'IndexedDB (Offline)'}</strong> • Schema v{CURRENT_SCHEMA_VERSION}
              </div>
            </div>

            <div className="backup-action-area">
              <Button
                variant="primary"
                onClick={handleExport}
                isLoading={isExporting}
                disabled={isExporting}
              >
                {isExporting ? 'Đang xuất dữ liệu...' : '💾 Xuất Toàn Bộ Dữ Liệu Ra File JSON'}
              </Button>
            </div>

            {exportNotice && (
              <div
                className={`backup-notice ${
                  exportNotice.startsWith('✓') ? 'backup-notice--success' : 'backup-notice--error'
                }`}
              >
                {exportNotice}
              </div>
            )}
          </div>
        )}

        {/* Nội dung Tab Khôi Phục Dữ Liệu */}
        {activeTab === 'restore' && (
          <div className="backup-tab-content">
            <div className="backup-file-picker">
              <label htmlFor="backup-file-input" className="backup-picker-label">
                📁 Chọn tệp tin sao lưu (.json):
              </label>
              <input
                id="backup-file-input"
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="backup-file-input"
              />
              {selectedFile && (
                <div className="backup-file-info">
                  Đã chọn: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Thông báo lỗi validation */}
            {importError && (
              <div className="backup-notice backup-notice--error">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {importError}
                </pre>
              </div>
            )}

            {/* Xem trước thông tin file hợp lệ & Cảnh báo trùng lặp */}
            {validationResult?.isValid && parsedBackup && conflictSummary && (
              <div className="backup-preview-box">
                <h4 className="backup-section-title">🔍 Thông tin bản sao lưu:</h4>
                <ul className="backup-stats-list">
                  <li>
                    Thời gian tạo:{' '}
                    <strong>{new Date(parsedBackup.metadata.exportedAt).toLocaleString('vi-VN')}</strong>
                  </li>
                  <li>
                    Phiên bản Schema:{' '}
                    <strong>v{parsedBackup.metadata.schemaVersion}</strong>
                  </li>
                  <li>
                    Tổng số quẻ trong file:{' '}
                    <strong>{parsedBackup.metadata.totalDivinations}</strong>
                  </li>
                  <li>
                    Tổng số ghi chú trong file:{' '}
                    <strong>{parsedBackup.metadata.totalNotes}</strong>
                  </li>
                </ul>

                {/* Cảnh báo dữ liệu trùng lặp */}
                {conflictSummary.hasConflicts ? (
                  <div className="backup-conflict-warning">
                    <strong>⚠️ Phát hiện {conflictSummary.duplicateDivinationsCount} bản ghi trùng lặp:</strong>
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ marginRight: '16px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="importMode"
                          value="overwrite"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                        />{' '}
                        Ghi đè dữ liệu trùng lặp (Cập nhật mới)
                      </label>
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="importMode"
                          value="skip"
                          checked={importMode === 'skip'}
                          onChange={() => setImportMode('skip')}
                        />{' '}
                        Bỏ qua các bản ghi đã có (Giữ nguyên cũ)
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="backup-notice backup-notice--success" style={{ margin: '12px 0' }}>
                    ✓ Không có xung đột trùng lặp. Tất cả dữ liệu đều mới!
                  </div>
                )}

                <div className="backup-action-area" style={{ marginTop: '16px' }}>
                  <Button
                    variant="gold"
                    onClick={handleExecuteRestore}
                    isLoading={isImporting}
                    disabled={isImporting}
                  >
                    {isImporting ? 'Đang khôi phục dữ liệu...' : '⚡ Bắt Đầu Khôi Phục Dữ Liệu'}
                  </Button>
                </div>
              </div>
            )}

            {/* Thông báo kết quả khôi phục thành công */}
            {importSuccessSummary && (
              <div className="backup-success-summary">
                <h4 style={{ color: '#2e7d32', margin: '0 0 8px 0' }}>🎉 Khôi phục dữ liệu hoàn tất!</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                  <li>Số lần lập quẻ đã nhập: <strong>{importSuccessSummary.importedDivinations}</strong></li>
                  <li>Số kết quả quẻ đã nhập: <strong>{importSuccessSummary.importedResults}</strong></li>
                  <li>Số phân tích đã nhập: <strong>{importSuccessSummary.importedAnalyses}</strong></li>
                  <li>Số ghi chú đã nhập: <strong>{importSuccessSummary.importedNotes}</strong></li>
                  {importSuccessSummary.skippedDivinations > 0 && (
                    <li>Số bản ghi bỏ qua (do trùng lặp): <strong>{importSuccessSummary.skippedDivinations}</strong></li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
