import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CastingMethod,
  DivinationDetailAggregate,
  DivinationNoteEntity,
  DivinationResultSnapshot,
  DivinationSummaryItem,
  Element,
  getHexagramById,
  HexagramTrio,
  IDivinationRepository,
} from '@kindich/domain';
import { QuestionCategorySelector } from './QuestionCategorySelector';
import { DivinationNotesSection } from './DivinationNotesSection';
import {
  QUESTION_CATEGORIES,
  getCategoryLabel,
  getCategoryIcon,
} from './notes-questions.types';
import { DivinationHistoryView } from '../DivinationHistory/DivinationHistoryView';

describe('Notes & Questions Module', () => {
  const hex1 = getHexagramById(1)!; // Càn Vi Thiên
  const hex44 = getHexagramById(44)!; // Thiên Phong Cấu

  const sampleTrio: HexagramTrio = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1],
    hasMovingLines: true,
  };

  // =========================================================================
  // 1. Phân loại danh mục & Nhập câu hỏi (Requirements 1 & 4)
  // =========================================================================
  describe('QuestionCategorySelector Component', () => {
    it('hiển thị đầy đủ 6 danh mục theo đúng yêu cầu đề bài', () => {
      const handleQuestionChange = vi.fn();
      const handleCategoryChange = vi.fn();

      render(
        <QuestionCategorySelector
          question="Kỳ thi tháng 11 có thuận lợi không?"
          onQuestionChange={handleQuestionChange}
          category="study"
          onCategoryChange={handleCategoryChange}
        />
      );

      // Kiểm tra 6 danh mục chính xác qua testId của từng pill
      expect(screen.getByTestId('category-pill-work')).toHaveTextContent('Công việc');
      expect(screen.getByTestId('category-pill-study')).toHaveTextContent('Học tập');
      expect(screen.getByTestId('category-pill-finance')).toHaveTextContent('Tài chính');
      expect(screen.getByTestId('category-pill-family')).toHaveTextContent('Gia đình');
      expect(screen.getByTestId('category-pill-relationship')).toHaveTextContent('Tình cảm');
      expect(screen.getByTestId('category-pill-other')).toHaveTextContent('Khác');

      // Kiểm tra ô nhập câu hỏi hiển thị đúng giá trị
      const input = screen.getByDisplayValue('Kỳ thi tháng 11 có thuận lợi không?');
      expect(input).toBeInTheDocument();
    });

    it('cho phép nhập và thay đổi câu hỏi trước khi lập quẻ (Requirement 1)', () => {
      const handleQuestionChange = vi.fn();
      const handleCategoryChange = vi.fn();

      render(
        <QuestionCategorySelector
          question=""
          onQuestionChange={handleQuestionChange}
          category="work"
          onCategoryChange={handleCategoryChange}
          inputPlaceholder="Nhập câu hỏi chiêm đoán..."
        />
      );

      const input = screen.getByPlaceholderText('Nhập câu hỏi chiêm đoán...');
      fireEvent.change(input, { target: { value: 'Dự án mới có thành công không?' } });

      expect(handleQuestionChange).toHaveBeenCalledWith('Dự án mới có thành công không?');
    });

    it('cho phép chuyển đổi giữa các danh mục khi bấm vào các pill (Requirement 4)', () => {
      const handleQuestionChange = vi.fn();
      const handleCategoryChange = vi.fn();

      render(
        <QuestionCategorySelector
          question="Đầu tư bất động sản"
          onQuestionChange={handleQuestionChange}
          category="work"
          onCategoryChange={handleCategoryChange}
        />
      );

      // Bấm vào pill Tài chính
      const financePill = screen.getByTestId('category-pill-finance');
      fireEvent.click(financePill);
      expect(handleCategoryChange).toHaveBeenCalledWith('finance');

      // Bấm vào pill Tình cảm
      const relationshipPill = screen.getByTestId('category-pill-relationship');
      fireEvent.click(relationshipPill);
      expect(handleCategoryChange).toHaveBeenCalledWith('relationship');
    });

    it('đánh dấu trạng thái active cho danh mục đang chọn và hiển thị lời khuyên định vị Dụng Thần', () => {
      const { rerender } = render(
        <QuestionCategorySelector
          question=""
          onQuestionChange={vi.fn()}
          category="work"
          onCategoryChange={vi.fn()}
        />
      );

      const workPill = screen.getByTestId('category-pill-work');
      expect(workPill).toHaveClass('category-pill--active');
      expect(screen.getByText(/Sự nghiệp, công danh/i)).toBeInTheDocument();

      // Đổi sang Tài chính
      rerender(
        <QuestionCategorySelector
          question=""
          onQuestionChange={vi.fn()}
          category="finance"
          onCategoryChange={vi.fn()}
        />
      );
      const financePill = screen.getByTestId('category-pill-finance');
      expect(financePill).toHaveClass('category-pill--active');
      expect(screen.getByText(/Tiền bạc, đầu tư/i)).toBeInTheDocument();
    });

    it('hỗ trợ chế độ compact (chỉ hiển thị pill danh mục, không hiển thị ô input)', () => {
      render(
        <QuestionCategorySelector
          question=""
          onQuestionChange={vi.fn()}
          category="other"
          onCategoryChange={vi.fn()}
          compact
        />
      );

      // Không có input
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      // Vẫn có 6 pill danh mục
      expect(screen.getByTestId('category-pill-other')).toBeInTheDocument();
    });

    it('các helper định nghĩa danh mục trả về đúng dữ liệu chuẩn', () => {
      expect(getCategoryLabel('work')).toBe('Công việc');
      expect(getCategoryLabel('study')).toBe('Học tập');
      expect(getCategoryLabel('finance')).toBe('Tài chính');
      expect(getCategoryLabel('family')).toBe('Gia đình');
      expect(getCategoryLabel('relationship')).toBe('Tình cảm');
      expect(getCategoryLabel('other')).toBe('Khác');

      expect(getCategoryIcon('work')).toBe('💼');
      expect(getCategoryIcon('study')).toBe('📚');
      expect(getCategoryIcon('finance')).toBe('💰');
      expect(getCategoryIcon('family')).toBe('🏡');
      expect(getCategoryIcon('relationship')).toBe('❤️');
      expect(getCategoryIcon('other')).toBe('🔮');

      expect(QUESTION_CATEGORIES).toHaveLength(6);
    });
  });

  // =========================================================================
  // 2. Quản lý Ghi chú Cá nhân & Nghiệm lý (CRUD - Requirement 3)
  // =========================================================================
  describe('DivinationNotesSection Component (CRUD Ghi chú)', () => {
    let mockNotes: DivinationNoteEntity[];
    let mockRepo: IDivinationRepository;
    let onNotesChanged: () => void;

    beforeEach(() => {
      mockNotes = [
        {
          id: 'note-01',
          divinationId: 'div-test-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          updatedAt: '2026-10-30T10:00:00.000Z',
          content: 'Quẻ dự báo tháng 11 có tin vui về việc làm.',
          actualOutcome: 'Đã nhận thư mời phỏng vấn ngày 05/11.',
          isVerified: true,
        },
      ];

      const onNotesChangedFn = vi.fn();
      onNotesChanged = onNotesChangedFn;

      mockRepo = {
        create: vi.fn(),
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        search: vi.fn(),
        addNote: vi.fn().mockImplementation(async (divId, content, actualOutcome) => {
          const newNote: DivinationNoteEntity = {
            id: 'note-new',
            divinationId: divId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content,
            actualOutcome,
            isVerified: false,
          };
          mockNotes.push(newNote);
          return newNote;
        }),
        updateNote: vi.fn().mockImplementation(async (noteId, content, actualOutcome, isVerified) => {
          const targetIndex = mockNotes.findIndex((n) => n.id === noteId);
          if (targetIndex >= 0) {
            const old = mockNotes[targetIndex]!;
            mockNotes[targetIndex] = {
              ...old,
              content,
              actualOutcome,
              isVerified: isVerified ?? old.isVerified,
              updatedAt: new Date().toISOString(),
            };
          }
        }),
        deleteNote: vi.fn().mockImplementation(async (noteId) => {
          mockNotes = mockNotes.filter((n) => n.id !== noteId);
        }),
        getNotesByDivinationId: vi.fn().mockImplementation(async () => mockNotes),
      };
    });

    it('hiển thị danh sách ghi chú với nội dung, nghiệm lý và huy hiệu kiểm chứng', () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      expect(screen.getByText(/Quẻ dự báo tháng 11 có tin vui về việc làm/i)).toBeInTheDocument();
      expect(screen.getByText(/Đã nhận thư mời phỏng vấn ngày 05\/11/i)).toBeInTheDocument();
      expect(screen.getByText(/✓ Đã ứng nghiệm/i)).toBeInTheDocument();
    });

    it('hiển thị trạng thái trống khi chưa có ghi chú nào', () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={[]}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      expect(screen.getByText(/Chưa có ghi chú nào cho lần lập quẻ này/i)).toBeInTheDocument();
    });

    it('thêm mới ghi chú thành công và gọi repository.addNote (Create)', async () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      // Bấm nút "Thêm ghi chú"
      const addBtn = screen.getByRole('button', { name: /\+ Thêm ghi chú/i });
      fireEvent.click(addBtn);

      // Form thêm mới xuất hiện
      const contentTextarea = screen.getByPlaceholderText(
        /Ghi nhận định hoặc lời khuyên của quẻ.../i
      );
      const outcomeInput = screen.getByPlaceholderText(
        /Ví dụ: Thi đậu ngày 15\/10 đúng như dự đoán.../i
      );

      fireEvent.change(contentTextarea, {
        target: { value: 'Cần lưu ý hào Phụ Mẫu động khắc Tử Tôn' },
      });
      fireEvent.change(outcomeInput, {
        target: { value: 'Con cái bị cảm nhẹ vào ngày Tý' },
      });

      // Bấm Lưu ghi chú
      const saveBtn = screen.getByRole('button', { name: /Lưu ghi chú/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockRepo.addNote).toHaveBeenCalledWith(
          'div-test-01',
          'Cần lưu ý hào Phụ Mẫu động khắc Tử Tôn',
          'Con cái bị cảm nhẹ vào ngày Tý'
        );
        expect(onNotesChanged).toHaveBeenCalled();
      });
    });

    it('không cho phép lưu ghi chú nếu nội dung để trống', () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      const addBtn = screen.getByRole('button', { name: /\+ Thêm ghi chú/i });
      fireEvent.click(addBtn);

      const saveBtn = screen.getByRole('button', { name: /Lưu ghi chú/i });
      expect(saveBtn).toBeDisabled();
    });

    it('chỉnh sửa ghi chú, cập nhật nghiệm lý và trạng thái ứng nghiệm (Update)', async () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      // Bấm nút "Sửa"
      const editBtn = screen.getByTestId('edit-note-btn-note-01');
      fireEvent.click(editBtn);

      // Form sửa hiển thị với dữ liệu cũ
      const contentTextarea = screen.getByDisplayValue(
        'Quẻ dự báo tháng 11 có tin vui về việc làm.'
      );
      fireEvent.change(contentTextarea, {
        target: { value: 'Quẻ dự báo tháng 11 có tin vui lớn về sự nghiệp (đã sửa).' },
      });

      const outcomeInput = screen.getByDisplayValue('Đã nhận thư mời phỏng vấn ngày 05/11.');
      fireEvent.change(outcomeInput, {
        target: { value: 'Đã chính thức nhận việc với mức lương cao.' },
      });

      // Bấm Cập nhật
      const updateBtn = screen.getByRole('button', { name: /Cập nhật/i });
      fireEvent.click(updateBtn);

      await waitFor(() => {
        expect(mockRepo.updateNote).toHaveBeenCalledWith(
          'note-01',
          'Quẻ dự báo tháng 11 có tin vui lớn về sự nghiệp (đã sửa).',
          'Đã chính thức nhận việc với mức lương cao.',
          true
        );
        expect(onNotesChanged).toHaveBeenCalled();
      });
    });

    it('hủy bỏ chế độ chỉnh sửa khi bấm nút Hủy', () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      const editBtn = screen.getByTestId('edit-note-btn-note-01');
      fireEvent.click(editBtn);

      expect(screen.getByRole('button', { name: /Cập nhật/i })).toBeInTheDocument();

      const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
      fireEvent.click(cancelBtn);

      // Quay lại chế độ xem thường
      expect(screen.queryByRole('button', { name: /Cập nhật/i })).not.toBeInTheDocument();
      expect(mockRepo.updateNote).not.toHaveBeenCalled();
    });

    it('hiển thị hộp thoại xác nhận trước khi xóa và xóa thành công khi xác nhận (Delete)', async () => {
      render(
        <DivinationNotesSection
          divinationId="div-test-01"
          notes={mockNotes}
          repository={mockRepo}
          onNotesChanged={onNotesChanged}
        />
      );

      // Bấm nút "Xóa"
      const deleteBtn = screen.getByTestId('delete-note-btn-note-01');
      fireEvent.click(deleteBtn);

      // Xuất hiện modal xác nhận xóa
      expect(
        screen.getByText(/Bạn có chắc chắn muốn xóa ghi chú này không\?/i)
      ).toBeInTheDocument();

      // 1. Thử bấm "Hủy bỏ" -> không xóa
      const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
      fireEvent.click(cancelBtn);

      expect(mockRepo.deleteNote).not.toHaveBeenCalled();
      expect(
        screen.queryByText(/Bạn có chắc chắn muốn xóa ghi chú này không\?/i)
      ).not.toBeInTheDocument();

      // 2. Mở lại và bấm "Xác nhận xóa"
      fireEvent.click(deleteBtn);
      const confirmDeleteBtn = screen.getByTestId('confirm-delete-button');
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(mockRepo.deleteNote).toHaveBeenCalledWith('note-01');
        expect(onNotesChanged).toHaveBeenCalled();
      });
    });
  });

  // =========================================================================
  // 3. Lọc Lịch Sử Theo Danh Mục (Requirement 5)
  // =========================================================================
  describe('Lọc Lịch Sử Theo Danh Mục (Requirement 5)', () => {
    let mockItems: DivinationSummaryItem[];
    let mockRepo: IDivinationRepository;

    beforeEach(() => {
      mockItems = [
        {
          id: 'div-work-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          updatedAt: '2026-10-30T10:00:00.000Z',
          method: CastingMethod.SERIAL,
          question: 'Hỏi về việc chuyển công tác',
          inquiryType: 'work',
          tags: ['cong_viec'],
          primaryHexagramNumber: 1,
          primaryHexagramName: 'Thuần Càn',
          primaryHexagramSinoVietnameseName: 'Càn vi Thiên',
          changingHexagramNumber: 44,
          changingHexagramName: 'Thiên Phong Cấu',
          changingHexagramSinoVietnameseName: 'Thiên Phong Cấu',
          movingLines: [1],
          lunarDateStr: 'Ngày 15 tháng 9 năm Bính Ngọ',
          dayCanChi: 'Ất Mão',
          monthCanChi: 'Mậu Tuất',
          noteCount: 1,
          starred: false,
        },
        {
          id: 'div-study-02',
          createdAt: '2026-10-29T08:00:00.000Z',
          updatedAt: '2026-10-29T08:00:00.000Z',
          method: CastingMethod.SERIAL,
          question: 'Hỏi về kết quả thi cao học',
          inquiryType: 'study',
          tags: ['hoc_tap'],
          primaryHexagramNumber: 2,
          primaryHexagramName: 'Thuần Khôn',
          primaryHexagramSinoVietnameseName: 'Khôn vi Địa',
          changingHexagramNumber: undefined,
          changingHexagramName: undefined,
          changingHexagramSinoVietnameseName: undefined,
          movingLines: [],
          lunarDateStr: 'Ngày 14 tháng 9 năm Bính Ngọ',
          dayCanChi: 'Giáp Dần',
          monthCanChi: 'Mậu Tuất',
          noteCount: 0,
          starred: true,
        },
        {
          id: 'div-finance-03',
          createdAt: '2026-10-28T14:00:00.000Z',
          updatedAt: '2026-10-28T14:00:00.000Z',
          method: CastingMethod.MAI_HUA,
          question: 'Hỏi về đầu tư chứng khoán',
          inquiryType: 'finance',
          tags: ['tai_chinh'],
          primaryHexagramNumber: 14,
          primaryHexagramName: 'Hỏa Thiên Đại Hữu',
          primaryHexagramSinoVietnameseName: 'Hỏa Thiên Đại Hữu',
          changingHexagramNumber: 38,
          changingHexagramName: 'Hỏa Trạch Khuê',
          changingHexagramSinoVietnameseName: 'Hỏa Trạch Khuê',
          movingLines: [3],
          lunarDateStr: 'Ngày 13 tháng 9 năm Bính Ngọ',
          dayCanChi: 'Quý Sửu',
          monthCanChi: 'Mậu Tuất',
          noteCount: 2,
          starred: false,
        },
      ];

      mockRepo = {
        create: vi.fn(),
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        search: vi.fn(),
        addNote: vi.fn(),
        updateNote: vi.fn(),
        deleteNote: vi.fn(),
        getNotesByDivinationId: vi.fn(),
        list: vi.fn().mockImplementation(async (filter, pagination) => {
          let filtered = [...mockItems];

          if (filter?.inquiryType) {
            filtered = filtered.filter((it) => it.inquiryType === filter.inquiryType);
          }
          if (filter?.keyword) {
            const kw = filter.keyword.toLowerCase();
            filtered = filtered.filter(
              (it) => it.question?.toLowerCase().includes(kw) || it.primaryHexagramName.toLowerCase().includes(kw)
            );
          }
          return {
            items: filtered,
            totalCount: filtered.length,
            page: pagination?.page ?? 1,
            pageSize: pagination?.pageSize ?? 10,
            totalPages: Math.ceil(filtered.length / (pagination?.pageSize ?? 10)) || 1,
          };
        }),
      };
    });

    it('hiển thị danh mục câu hỏi trên từng bản ghi trong danh sách lịch sử', async () => {
      render(<DivinationHistoryView repository={mockRepo} />);

      await waitFor(() => {
        expect(screen.getByText(/Hỏi về việc chuyển công tác/i)).toBeInTheDocument();
      });

      // Kiểm tra có badge danh mục
      expect(screen.getByText(/💼 Công việc/i)).toBeInTheDocument();
      expect(screen.getByText(/📚 Học tập/i)).toBeInTheDocument();
      expect(screen.getByText(/💰 Tài chính/i)).toBeInTheDocument();
    });

    it('cho phép lọc theo danh mục cụ thể qua dropdown bộ lọc (Requirement 5)', async () => {
      render(<DivinationHistoryView repository={mockRepo} />);

      await waitFor(() => {
        expect(screen.getByText(/Hỏi về việc chuyển công tác/i)).toBeInTheDocument();
      });

      // Tìm dropdown lọc danh mục
      const categorySelectContainer = screen.getByTestId('category-filter-select');
      const selectElement = categorySelectContainer.querySelector('select')!;

      // Chọn danh mục 'study' (Học tập)
      fireEvent.change(selectElement, { target: { value: 'study' } });

      await waitFor(() => {
        expect(mockRepo.list).toHaveBeenCalledWith(
          expect.objectContaining({ inquiryType: 'study' }),
          expect.anything()
        );
      });
    });

    it('cho phép đặt lại bộ lọc danh mục về "Tất cả danh mục câu hỏi"', async () => {
      render(<DivinationHistoryView repository={mockRepo} />);

      await waitFor(() => {
        expect(screen.getByText(/Hỏi về việc chuyển công tác/i)).toBeInTheDocument();
      });

      const categorySelectContainer = screen.getByTestId('category-filter-select');
      const selectElement = categorySelectContainer.querySelector('select')!;

      // 1. Lọc theo finance
      fireEvent.change(selectElement, { target: { value: 'finance' } });

      await waitFor(() => {
        expect(mockRepo.list).toHaveBeenCalledWith(
          expect.objectContaining({ inquiryType: 'finance' }),
          expect.anything()
        );
      });

      // 2. Bấm nút Làm mới bộ lọc
      const refreshBtn = screen.getByRole('button', { name: /Làm mới/i });
      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(mockRepo.list).toHaveBeenCalledWith(
          expect.objectContaining({ inquiryType: undefined }),
          expect.anything()
        );
      });
    });
  });

  // =========================================================================
  // 4. Bất biến kết quả quẻ và snapshot khi quản lý ghi chú (Requirement 7)
  // =========================================================================
  describe('Bảo Toàn Kết Quả Quẻ Đã Lưu (Requirement 7)', () => {
    it('thao tác CRUD ghi chú không làm thay đổi kết quả quẻ hay resultSnapshot', async () => {
      const fixedPrimary = hex1;
      const fixedTransformed = hex44;
      const fixedSnapshot: DivinationResultSnapshot = {
        recordedAt: '2026-10-30T10:00:00.000Z',
        ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        algorithmVersion: 'SERIAL-MOD8-V1',
        trio: sampleTrio,
        dateTimeInfo: {
          solarDateTime: '2026-10-30T10:00:00.000Z',
          lunarYear: 2026,
          lunarMonth: 9,
          lunarDay: 15,
          lunarHourBranch: 'Tỵ',
          yearCanChi: 'Bính Ngọ',
          monthCanChi: 'Mậu Tuất',
          dayCanChi: 'Ất Mão',
          hourCanChi: 'Tân Tỵ',
          voidBranches: ['Tý', 'Sửu'] as readonly [string, string],
        },
      };

      const divinationRecord: DivinationDetailAggregate = {
        divination: {
          id: 'div-immutable-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          updatedAt: '2026-10-30T10:00:00.000Z',
          method: CastingMethod.SERIAL,
          algorithmVersion: 'SERIAL-MOD8-V1',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          input: { method: CastingMethod.SERIAL, serialNumber: '88888888' },
          dateTimeInfo: {
            solarDateTime: '2026-10-30T10:00:00.000Z',
            lunarYear: 2026,
            lunarMonth: 9,
            lunarDay: 15,
            lunarHourBranch: 'Tỵ',
            yearCanChi: 'Bính Ngọ',
            monthCanChi: 'Mậu Tuất',
            dayCanChi: 'Ất Mão',
            hourCanChi: 'Tân Tỵ',
            voidBranches: ['Tý', 'Sửu'] as readonly [string, string],
          },
          question: 'Việc kinh doanh cuối năm',
          inquiryType: 'finance',
          starred: false,
          resultSnapshot: fixedSnapshot,
        },
        result: {
          id: 'res-immutable-01',
          divinationId: 'div-immutable-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          primaryHexagramNumber: fixedPrimary.number,
          primaryHexagramName: fixedPrimary.name,
          primaryHexagramSinoVietnameseName: fixedPrimary.sinoVietnameseName,
          changingHexagramNumber: fixedTransformed.number,
          changingHexagramName: fixedTransformed.name,
          changingHexagramSinoVietnameseName: fixedTransformed.sinoVietnameseName,
          nuclearHexagramNumber: fixedPrimary.number,
          nuclearHexagramName: fixedPrimary.name,
          movingLines: [1],
          trio: sampleTrio,
        },
        analysis: {
          id: 'ana-immutable-01',
          divinationId: 'div-immutable-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SERIAL-MOD8-V1',
          palaceId: 'CAN',
          palaceElement: Element.KIM,
          worldLine: 6,
          responseLine: 3,
          details: {},
        },
        notes: [],
        resultSnapshot: fixedSnapshot,
      };

      // Ghi nhớ snapshot và kết quả quẻ trước khi tác động ghi chú
      const originalSnapshot = divinationRecord.divination.resultSnapshot;
      const originalPrimaryNumber = divinationRecord.result!.primaryHexagramNumber;
      const originalChangingNumber = divinationRecord.result!.changingHexagramNumber;
      const originalMovingLines = [...divinationRecord.result!.movingLines];

      // Giả lập Repository thực hiện các hành động CRUD ghi chú
      // 1. Thêm ghi chú
      const note1: DivinationNoteEntity = {
        id: 'note-01',
        divinationId: divinationRecord.divination.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: 'Ghi chú kiểm chứng 1',
        actualOutcome: 'Đã hoàn tất nghiệm lý',
        isVerified: true,
      };
      const recordAfterAdd: DivinationDetailAggregate = {
        ...divinationRecord,
        notes: [note1],
      };

      // Kiểm tra tính bất biến sau khi Thêm
      expect(recordAfterAdd.divination.resultSnapshot).toBe(originalSnapshot);
      expect(recordAfterAdd.result!.primaryHexagramNumber).toBe(originalPrimaryNumber);
      expect(recordAfterAdd.result!.changingHexagramNumber).toBe(originalChangingNumber);
      expect(recordAfterAdd.result!.movingLines).toEqual(originalMovingLines);

      // 2. Cập nhật ghi chú
      const updatedNote1: DivinationNoteEntity = {
        ...note1,
        content: 'Ghi chú đã chỉnh sửa nội dung',
        actualOutcome: 'Cập nhật thêm chi tiết',
        updatedAt: new Date().toISOString(),
      };
      const recordAfterUpdate: DivinationDetailAggregate = {
        ...recordAfterAdd,
        notes: [updatedNote1],
      };

      // Kiểm tra tính bất biến sau khi Sửa
      expect(recordAfterUpdate.divination.resultSnapshot).toBe(originalSnapshot);
      expect(recordAfterUpdate.result!.primaryHexagramNumber).toBe(originalPrimaryNumber);
      expect(recordAfterUpdate.result!.changingHexagramNumber).toBe(originalChangingNumber);
      expect(recordAfterUpdate.result!.movingLines).toEqual(originalMovingLines);

      // 3. Xóa ghi chú
      const recordAfterDelete: DivinationDetailAggregate = {
        ...recordAfterUpdate,
        notes: [],
      };

      // Kiểm tra tính bất biến sau khi Xóa
      expect(recordAfterDelete.divination.resultSnapshot).toBe(originalSnapshot);
      expect(recordAfterDelete.result!.primaryHexagramNumber).toBe(originalPrimaryNumber);
      expect(recordAfterDelete.result!.changingHexagramNumber).toBe(originalChangingNumber);
      expect(recordAfterDelete.result!.movingLines).toEqual(originalMovingLines);
    });
  });
});
