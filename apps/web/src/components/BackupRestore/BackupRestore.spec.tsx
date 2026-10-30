import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CastingMethod,
  DivinationDateTime,
  DivinationEntity,
  DivinationNoteEntity,
  DivinationResultEntity,
  getHexagramById,
  HexagramTrio,
  KinDichBackupData,
} from '@kindich/domain';
import { CURRENT_SCHEMA_VERSION, KinDichDatabase } from '@kindich/database';
import { BackupRestoreModal } from './BackupRestoreModal';
import { DivinationHistoryView } from '../DivinationHistory/DivinationHistoryView';

// Giả lập các hàm tương tác IndexedDB để test giao diện độc lập trong môi trường jsdom
const mockExportBackup = vi.fn();
const mockCheckImportConflicts = vi.fn();
const mockImportBackup = vi.fn();

const mockDb = {
  divinations: { count: vi.fn().mockResolvedValue(1) },
  divination_results: { count: vi.fn().mockResolvedValue(1) },
  divination_analyses: { count: vi.fn().mockResolvedValue(1) },
  divination_notes: { count: vi.fn().mockResolvedValue(1) },
  user_settings: { count: vi.fn().mockResolvedValue(1) },
} as unknown as KinDichDatabase;

vi.mock('@kindich/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@kindich/database')>();
  return {
    ...actual,
    getKinDichDatabase: vi.fn(() => mockDb),
    exportBackup: (...args: unknown[]) => mockExportBackup(...args),
    checkImportConflicts: (...args: unknown[]) => mockCheckImportConflicts(...args),
    importBackup: (...args: unknown[]) => mockImportBackup(...args),
  };
});

describe('BackupRestoreModal Component (apps/web)', () => {
  const hex1 = getHexagramById(1)!;
  const hex44 = getHexagramById(44)!;

  const sampleDateTime: DivinationDateTime = {
    solarDateTime: '2026-10-30T10:00:00.000Z',
    lunarYear: 2026,
    lunarMonth: 9,
    lunarDay: 15,
    lunarHourBranch: 'Tỵ',
    yearCanChi: 'Bính Ngọ',
    monthCanChi: 'Mậu Tuất',
    dayCanChi: 'Ất Mão',
    hourCanChi: 'Tân Tỵ',
    voidBranches: ['Tý', 'Sửu'],
  };

  const sampleTrio: HexagramTrio = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1],
    hasMovingLines: true,
  };

  const sampleDivination: DivinationEntity = {
    id: 'div-web-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
    method: CastingMethod.SERIAL,
    algorithmVersion: 'SERIAL-MOD8-V1',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    input: { method: CastingMethod.SERIAL, serialNumber: '88888888' },
    dateTimeInfo: sampleDateTime,
    question: 'Hỏi về tài lộc cuối năm',
    inquiryType: 'finance',
    starred: true,
  };

  const sampleResult: DivinationResultEntity = {
    id: 'res-web-01',
    divinationId: 'div-web-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    primaryHexagramNumber: 1,
    primaryHexagramName: 'Thuần Càn',
    primaryHexagramSinoVietnameseName: 'Càn vi Thiên',
    changingHexagramNumber: 44,
    changingHexagramName: 'Thiên Phong Cấu',
    changingHexagramSinoVietnameseName: 'Thiên Phong Cấu',
    nuclearHexagramNumber: 1,
    nuclearHexagramName: 'Thuần Càn',
    movingLines: [1],
    trio: sampleTrio,
  };

  const sampleNote: DivinationNoteEntity = {
    id: 'note-web-01',
    divinationId: 'div-web-01',
    createdAt: '2026-10-30T10:00:00.000Z',
    updatedAt: '2026-10-30T10:00:00.000Z',
    content: 'Cần thận trọng chi tiêu',
    actualOutcome: 'Tiết kiệm được ngân sách',
    isVerified: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockExportBackup.mockResolvedValue({
      format: 'KINDICH_BACKUP',
      version: 1,
      metadata: {
        exportedAt: '2026-10-30T10:00:00.000Z',
        appVersion: '1.0.0',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        algorithmVersion: 'SERIAL-MOD8-V1',
        totalDivinations: 1,
        totalNotes: 1,
      },
      settings: { theme: 'dark' },
      data: {
        divinations: [sampleDivination],
        divination_results: [sampleResult],
        divination_analyses: [],
        divination_notes: [sampleNote],
      },
    });

    mockCheckImportConflicts.mockResolvedValue({
      hasConflicts: false,
      totalImportDivinations: 1,
      newDivinationsCount: 1,
      duplicateDivinationsCount: 0,
      duplicateIds: [],
      totalExistingInDb: 1,
    });

    mockImportBackup.mockResolvedValue({
      success: true,
      importedDivinations: 1,
      overwrittenDivinations: 0,
      skippedDivinations: 0,
      importedResults: 1,
      importedAnalyses: 0,
      importedNotes: 1,
      importedSettings: 1,
      errors: [],
    });

    // Mock URL cho việc download offline
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-download-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Kiểm thử Tab Xuất dữ liệu (Export)
  // =========================================================================
  describe('Tab Xuất Dữ Liệu (Export Flow)', () => {
    it('hiển thị đầy đủ số liệu thống kê hiện có trong cơ sở dữ liệu', async () => {
      render(<BackupRestoreModal isOpen={true} onClose={vi.fn()} database={mockDb} />);

      await waitFor(() => {
        expect(screen.getByTestId('stat-divinations')).toHaveTextContent('1');
        expect(screen.getByTestId('stat-notes')).toHaveTextContent('1');
      });

      // Hiển thị đầy đủ metadata phiên bản (Requirement 3)
      expect(screen.getByText(new RegExp(`Schema: V${CURRENT_SCHEMA_VERSION}`, 'i'))).toBeInTheDocument();
      expect(screen.getByText(/RuleSet: BO_PHE_CHINH_TONG_V1/i)).toBeInTheDocument();
      expect(screen.getByText(/Algorithm: SERIAL-MOD8-V1/i)).toBeInTheDocument();
      expect(screen.getByText(/Không gửi dữ liệu lên máy chủ/i)).toBeInTheDocument();
    });

    it('xuất file sao lưu JSON thành công và kích hoạt tải về offline khi bấm nút', async () => {
      render(<BackupRestoreModal isOpen={true} onClose={vi.fn()} database={mockDb} />);

      const exportBtn = screen.getByTestId('execute-export-button');
      fireEvent.click(exportBtn);

      await waitFor(() => {
        expect(mockExportBackup).toHaveBeenCalled();
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(screen.getByTestId('export-notice')).toBeInTheDocument();
        expect(screen.getByText(/✓ Đã xuất thành công 1 lần lập quẻ/i)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 2. Kiểm thử Tab Khôi phục dữ liệu (Restore Flow)
  // =========================================================================
  describe('Tab Khôi Phục Dữ Liệu (Restore Flow)', () => {
    it('báo lỗi rõ ràng khi người dùng chọn file JSON bị lỗi cú pháp (Requirement 7)', async () => {
      render(<BackupRestoreModal isOpen={true} onClose={vi.fn()} database={mockDb} />);

      // Chuyển sang Tab Khôi Phục
      fireEvent.click(screen.getByTestId('tab-restore'));

      const fileInput = screen.getByTestId('backup-file-input');
      const corruptFile = new File(['{ invalid_syntax: '], 'corrupt.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [corruptFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('import-error-alert')).toBeInTheDocument();
        expect(screen.getByText(/File không phải là định dạng JSON hợp lệ/i)).toBeInTheDocument();
      });
    });

    it('báo lỗi khi file sao lưu không đáp ứng cấu trúc KINDICH_BACKUP (Requirement 5)', async () => {
      render(<BackupRestoreModal isOpen={true} onClose={vi.fn()} database={mockDb} />);

      fireEvent.click(screen.getByTestId('tab-restore'));

      const fileInput = screen.getByTestId('backup-file-input');
      const malformedData = JSON.stringify({
        format: 'WRONG_FORMAT',
        metadata: {},
        data: {},
      });
      const malformedFile = new File([malformedData], 'wrong.json', { type: 'application/json' });

      fireEvent.change(fileInput, { target: { files: [malformedFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('import-error-alert')).toBeInTheDocument();
        expect(screen.getByText(/Giá trị format phải là "KINDICH_BACKUP"/i)).toBeInTheDocument();
      });
    });

    it('hiển thị xem trước thông tin và khôi phục thành công khi không có trùng lặp', async () => {
      const onRestoreSuccess = vi.fn();
      render(
        <BackupRestoreModal
          isOpen={true}
          onClose={vi.fn()}
          database={mockDb}
          onRestoreSuccess={onRestoreSuccess}
        />
      );

      fireEvent.click(screen.getByTestId('tab-restore'));

      const validBackup: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: '2026-10-30T10:00:00.000Z',
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 1,
          totalNotes: 1,
        },
        data: {
          divinations: [sampleDivination],
          divination_results: [sampleResult],
          divination_analyses: [],
          divination_notes: [sampleNote],
        },
      };

      const fileInput = screen.getByTestId('backup-file-input');
      const validFile = new File([JSON.stringify(validBackup)], 'kindich_backup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Chờ xem trước hiển thị
      await waitFor(() => {
        expect(screen.getByTestId('file-preview-card')).toBeInTheDocument();
        expect(screen.getByText(/✓ File hợp lệ/i)).toBeInTheDocument();
      });

      // Bấm nút khôi phục
      const restoreBtn = screen.getByTestId('execute-restore-button');
      fireEvent.click(restoreBtn);

      await waitFor(() => {
        expect(mockImportBackup).toHaveBeenCalledWith(mockDb, expect.anything(), {
          mode: 'overwrite',
        });
        expect(screen.getByTestId('restore-success-notice')).toBeInTheDocument();
        expect(screen.getByText(/✓ Khôi Phục Dữ Liệu Thành Công!/i)).toBeInTheDocument();
        expect(onRestoreSuccess).toHaveBeenCalled();
      });
    });

    it('hiển thị cảnh báo trùng lặp và cho phép chọn phương án ghi đè hoặc bỏ qua (Requirement 6)', async () => {
      mockCheckImportConflicts.mockResolvedValueOnce({
        hasConflicts: true,
        totalImportDivinations: 2,
        newDivinationsCount: 1,
        duplicateDivinationsCount: 1,
        duplicateIds: ['div-web-01'],
        totalExistingInDb: 1,
      });

      render(<BackupRestoreModal isOpen={true} onClose={vi.fn()} database={mockDb} />);

      fireEvent.click(screen.getByTestId('tab-restore'));

      const divNew: DivinationEntity = {
        ...sampleDivination,
        id: 'div-web-02-new',
        question: 'Quẻ hoàn toàn mới',
      };

      const backupWithDuplicates: KinDichBackupData = {
        format: 'KINDICH_BACKUP',
        version: 1,
        metadata: {
          exportedAt: '2026-10-30T10:00:00.000Z',
          appVersion: '1.0.0',
          schemaVersion: CURRENT_SCHEMA_VERSION,
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          totalDivinations: 2,
          totalNotes: 0,
        },
        data: {
          divinations: [sampleDivination, divNew],
          divination_results: [],
          divination_analyses: [],
          divination_notes: [],
        },
      };

      const fileInput = screen.getByTestId('backup-file-input');
      const file = new File([JSON.stringify(backupWithDuplicates)], 'backup_dup.json', {
        type: 'application/json',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Xuất hiện banner cảnh báo trùng lặp (Requirement 6)
      await waitFor(() => {
        expect(screen.getByTestId('duplicate-warning-banner')).toBeInTheDocument();
        expect(
          screen.getByText(/⚠️ Cảnh Báo Trùng Lặp: Phát hiện 1 lần lập quẻ đã tồn tại trong máy!/i)
        ).toBeInTheDocument();
      });

      // Kiểm tra 2 lựa chọn radio
      const radioOverwrite = screen.getByTestId('radio-overwrite');
      const radioSkip = screen.getByTestId('radio-skip');
      expect(radioOverwrite).toBeChecked();

      // Đổi sang chế độ 'skip' (Bỏ qua bản ghi trùng)
      fireEvent.click(radioSkip);
      expect(radioSkip).toBeChecked();

      // Thực thi khôi phục
      const restoreBtn = screen.getByTestId('execute-restore-button');
      fireEvent.click(restoreBtn);

      await waitFor(() => {
        expect(mockImportBackup).toHaveBeenCalledWith(mockDb, expect.anything(), { mode: 'skip' });
      });
    });
  });

  // =========================================================================
  // 3. Tích hợp nút mở Modal từ DivinationHistoryView
  // =========================================================================
  describe('Tích Hợp Vào Giao Diện Lịch Sử', () => {
    it('hiển thị nút "💾 Sao lưu & Khôi phục" trong thanh công cụ Lịch sử và mở được modal', async () => {
      const mockHistoryRepo = {
        list: vi.fn().mockResolvedValue({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        }),
        create: vi.fn(),
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        search: vi.fn(),
        addNote: vi.fn(),
        updateNote: vi.fn(),
        deleteNote: vi.fn(),
        getNotesByDivinationId: vi.fn(),
      };
      render(<DivinationHistoryView repository={mockHistoryRepo} />);

      const openBtn = screen.getByTestId('open-backup-restore-button');
      expect(openBtn).toBeInTheDocument();
      expect(openBtn).toHaveTextContent('Sao lưu & Khôi phục');

      fireEvent.click(openBtn);

      await waitFor(() => {
        expect(screen.getByTestId('backup-restore-modal')).toBeInTheDocument();
        expect(screen.getByText(/💾 Sao Lưu & Khôi Phục Dữ Liệu/i)).toBeInTheDocument();
      });
    });
  });
});
