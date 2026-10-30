import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CastingMethod,
  DivinationDetailAggregate,
  DivinationFilterOptions,
  DivinationNoteEntity,
  DivinationSummaryItem,
  Element,
  getHexagramById,
  IDivinationRepository,
  PaginationParams,
} from '@kindich/domain';
import { DivinationHistoryView } from './DivinationHistoryView';

describe('DivinationHistoryView Component', () => {
  const hex1 = getHexagramById(1)!; // Càn Vi Thiên
  const hex44 = getHexagramById(44)!; // Thiên Phong Cấu

  // Dữ liệu mẫu ban đầu
  let mockItems: DivinationSummaryItem[];
  let mockDetails: Record<string, DivinationDetailAggregate>;
  let mockRepo: IDivinationRepository;

  beforeEach(() => {
    mockItems = [
      {
        id: 'div-01',
        createdAt: '2026-10-30T10:00:00.000Z',
        updatedAt: '2026-10-30T10:00:00.000Z',
        method: CastingMethod.SERIAL,
        question: 'Thi cử công chức tháng 11 có đỗ đạt không?',
        inquiryType: 'career',
        tags: ['thi_cu'],
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
        id: 'div-02',
        createdAt: '2026-10-29T08:00:00.000Z',
        updatedAt: '2026-10-29T08:00:00.000Z',
        method: CastingMethod.MAI_HUA,
        question: 'Hỏi về sức khỏe cha mẹ mùa đông',
        inquiryType: 'health',
        tags: ['suc_khoe'],
        primaryHexagramNumber: 2,
        primaryHexagramName: 'Thuần Khôn',
        primaryHexagramSinoVietnameseName: 'Khôn vi Địa',
        changingHexagramNumber: undefined,
        changingHexagramName: undefined,
        movingLines: [],
        lunarDateStr: 'Ngày 14 tháng 9 năm Bính Ngọ',
        dayCanChi: 'Giáp Dần',
        monthCanChi: 'Mậu Tuất',
        noteCount: 0,
        starred: true,
      },
    ];

    mockDetails = {
      'div-01': {
        divination: {
          id: 'div-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          updatedAt: '2026-10-30T10:00:00.000Z',
          method: CastingMethod.SERIAL,
          algorithmVersion: 'SERIAL-MOD8-V1',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          question: 'Thi cử công chức tháng 11 có đỗ đạt không?',
          inquiryType: 'career',
          input: { method: CastingMethod.SERIAL, serialNumber: '12345678' },
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
            solarTerm: 'Sương Giáng',
            voidBranches: ['Thân', 'Dậu'],
          },
          starred: false,
        },
        result: {
          id: 'res-01',
          divinationId: 'div-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          primaryHexagramNumber: 1,
          primaryHexagramName: 'Thuần Càn',
          primaryHexagramSinoVietnameseName: 'Càn vi Thiên',
          changingHexagramNumber: 44,
          changingHexagramName: 'Thiên Phong Cấu',
          changingHexagramSinoVietnameseName: 'Thiên Phong Cấu',
          movingLines: [1],
          trio: {
            primary: hex1,
            transformed: hex44,
            nuclear: hex1,
            movingLineIndices: [1],
            hasMovingLines: true,
          },
        },
        analysis: {
          id: 'an-01',
          divinationId: 'div-01',
          createdAt: '2026-10-30T10:00:00.000Z',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          algorithmVersion: 'SIX-YAO-V1',
          palaceId: 'CAN',
          palaceElement: Element.KIM,
          worldLine: 6,
          responseLine: 3,
          details: {},
        },
        notes: [
          {
            id: 'note-01',
            divinationId: 'div-01',
            createdAt: '2026-10-30T10:05:00.000Z',
            updatedAt: '2026-10-30T10:05:00.000Z',
            content: 'Dự đoán có kết quả tốt vào đầu tháng 11',
            actualOutcome: 'Đã đỗ thủ khoa kỳ thi',
            isVerified: true,
          },
        ],
      },
    };

    mockRepo = {
      create: vi.fn(),
      getById: vi.fn(async (id: string) => mockDetails[id] || null),
      update: vi.fn(async (id: string, dto) => {
        const item = mockItems.find((x) => x.id === id);
        if (item && dto.starred !== undefined) {
          (item as any).starred = dto.starred;
        }
      }),
      delete: vi.fn(async (id: string) => {
        mockItems = mockItems.filter((x) => x.id !== id);
        delete mockDetails[id];
      }),
      list: vi.fn(async (filter?: DivinationFilterOptions, pagination?: PaginationParams) => {
        let filtered = [...mockItems];
        if (filter?.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(
            (i) =>
              (i.question && i.question.toLowerCase().includes(q)) ||
              i.primaryHexagramName.toLowerCase().includes(q) ||
              (i.changingHexagramName && i.changingHexagramName.toLowerCase().includes(q))
          );
        }
        if (filter?.method) {
          filtered = filtered.filter((i) => i.method === filter.method);
        }
        if (filter?.startDate) {
          filtered = filtered.filter((i) => i.createdAt >= filter.startDate!);
        }
        if (filter?.endDate) {
          filtered = filtered.filter((i) => i.createdAt <= filter.endDate!);
        }

        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 10;
        return {
          items: filtered.slice((page - 1) * pageSize, page * pageSize),
          totalCount: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize) || 1,
        };
      }),
      search: vi.fn(async (query: string) => {
        return mockRepo.list({ query });
      }),
      addNote: vi.fn(async (divId: string, content: string, outcome?: string) => {
        const newNote: DivinationNoteEntity = {
          id: `note-${Date.now()}`,
          divinationId: divId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          content,
          actualOutcome: outcome,
          isVerified: Boolean(outcome),
        };
        if (mockDetails[divId]) {
          (mockDetails[divId].notes as any).push(newNote);
        }
        return newNote;
      }),
      updateNote: vi.fn(async (noteId: string, content: string, outcome?: string, verified?: boolean) => {
        for (const d of Object.values(mockDetails)) {
          const note = d.notes.find((n) => n.id === noteId);
          if (note) {
            (note as any).content = content;
            (note as any).actualOutcome = outcome;
            (note as any).isVerified = verified;
          }
        }
      }),
      deleteNote: vi.fn(async (noteId: string) => {
        for (const d of Object.values(mockDetails)) {
          (d as any).notes = d.notes.filter((n) => n.id !== noteId);
        }
      }),
      getNotesByDivinationId: vi.fn(async (divId: string) => {
        return [...(mockDetails[divId]?.notes || [])];
      }),
    };
  });

  it('hiển thị danh sách lịch sử với đầy đủ các thông tin yêu cầu', async () => {
    render(<DivinationHistoryView repository={mockRepo} />);

    // Kiểm tra gọi repo.list
    await waitFor(() => {
      expect(mockRepo.list).toHaveBeenCalled();
    });

    // 1. Ngày giờ lập quẻ
    expect(screen.getByText(/Ngày 15 tháng 9 năm Bính Ngọ/i)).toBeInTheDocument();
    expect(screen.getByText(/Ngày 14 tháng 9 năm Bính Ngọ/i)).toBeInTheDocument();

    // 2. Phương pháp lập quẻ
    expect(screen.getByText(/🔢 Seri tiền/i)).toBeInTheDocument();
    expect(screen.getByText(/⏳ Giờ động tâm/i)).toBeInTheDocument();

    // 3. Nội dung câu hỏi
    expect(screen.getByText(/Thi cử công chức tháng 11 có đỗ đạt không\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Hỏi về sức khỏe cha mẹ mùa đông/i)).toBeInTheDocument();

    // 4. Tên quẻ chủ và quẻ biến
    expect(screen.getByText(/#1 Thuần Càn/i)).toBeInTheDocument();
    expect(screen.getByText(/#44 Thiên Phong Cấu/i)).toBeInTheDocument();
    expect(screen.getByText(/#2 Thuần Khôn/i)).toBeInTheDocument();
  });

  it('hỗ trợ tìm kiếm theo câu hỏi và phương pháp lập quẻ', async () => {
    render(<DivinationHistoryView repository={mockRepo} />);

    await waitFor(() => {
      expect(mockRepo.list).toHaveBeenCalled();
    });

    // Nhập từ khóa tìm kiếm "thi cu"
    const searchInput = screen.getByPlaceholderText(/Tìm câu hỏi, tên quẻ, Can Chi, ghi chú.../i);
    fireEvent.change(searchInput, { target: { value: 'thi cử' } });

    // Bấm nút Tìm kiếm
    const searchBtn = screen.getByRole('button', { name: /Tìm kiếm/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(mockRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'thi cử' }),
        expect.anything()
      );
    });
  });

  it('mở modal xem lại chi tiết một lần lập quẻ khi bấm Xem chi tiết', async () => {
    render(<DivinationHistoryView repository={mockRepo} />);

    await waitFor(() => {
      expect(screen.getByText(/Thi cử công chức tháng 11 có đỗ đạt không\?/i)).toBeInTheDocument();
    });

    // Bấm "Xem chi tiết" của lần lập quẻ đầu tiên
    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết/i });
    fireEvent.click(viewButtons[0]!);

    // Chờ modal chi tiết hiển thị
    await waitFor(() => {
      expect(mockRepo.getById).toHaveBeenCalledWith('div-01');
      expect(screen.getByText(/Chi Tiết Lần Lập Quẻ Lịch Sử/i)).toBeInTheDocument();
    });

    // Kiểm tra hiển thị đầy đủ thông tin chi tiết
    expect(screen.getByText(/Đồ Bản Phân Tích Lục Hào Cổ Pháp/i)).toBeInTheDocument();
    expect(screen.getByText(/Ghi Chú & Nghiệm Lý Sự Việc/i)).toBeInTheDocument();
    expect(screen.getByText(/Dự đoán có kết quả tốt vào đầu tháng 11/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã đỗ thủ khoa kỳ thi/i)).toBeInTheDocument();
  });

  it('hiển thị hộp thoại xác nhận trước khi xóa và xóa thành công khi xác nhận (Requirement 7)', async () => {
    render(<DivinationHistoryView repository={mockRepo} />);

    await waitFor(() => {
      expect(screen.getByText(/Thi cử công chức tháng 11 có đỗ đạt không\?/i)).toBeInTheDocument();
    });

    // Bấm nút xóa quẻ đầu tiên
    const deleteButtons = screen.getAllByRole('button', { name: /🗑 Xóa/i });
    fireEvent.click(deleteButtons[0]!);

    // Kiểm tra Modal xác nhận xuất hiện
    expect(screen.getByText(/⚠️ Xác Nhận Xóa Lịch Sử Lập Quẻ/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn có chắc chắn muốn xóa bản ghi lần lập quẻ này khỏi lịch sử không\?/i)
    ).toBeInTheDocument();

    // 1. Thử bấm "Hủy bỏ" -> không xóa
    const cancelBtn = screen.getByRole('button', { name: /Hủy bỏ/i });
    fireEvent.click(cancelBtn);

    expect(mockRepo.delete).not.toHaveBeenCalled();

    // 2. Mở lại và bấm "Xác nhận xóa"
    const deleteButtonsAgain = screen.getAllByRole('button', { name: /🗑 Xóa/i });
    fireEvent.click(deleteButtonsAgain[0]!);

    const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockRepo.delete).toHaveBeenCalledWith('div-01');
    });
  });

  it('cho phép thêm ghi chú và nghiệm lý mới trong modal chi tiết', async () => {
    render(<DivinationHistoryView repository={mockRepo} />);

    await waitFor(() => {
      expect(screen.getByText(/Thi cử công chức tháng 11 có đỗ đạt không\?/i)).toBeInTheDocument();
    });

    // Mở modal chi tiết
    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết/i });
    fireEvent.click(viewButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText(/Chi Tiết Lần Lập Quẻ Lịch Sử/i)).toBeInTheDocument();
    });

    // Bấm "+ Thêm ghi chú"
    const addNoteBtn = screen.getByRole('button', { name: /\+ Thêm ghi chú/i });
    fireEvent.click(addNoteBtn);

    // Điền form ghi chú
    const contentTextarea = screen.getByPlaceholderText(/Ghi nhận định hoặc lời khuyên của quẻ.../i);
    fireEvent.change(contentTextarea, { target: { value: 'Ghi chú bổ sung sau 1 tuần' } });

    const outcomeInput = screen.getByPlaceholderText(/Ví dụ: Thi đậu ngày 15\/10 đúng như dự đoán.../i);
    fireEvent.change(outcomeInput, { target: { value: 'Ứng nghiệm 100%' } });

    // Bấm "Lưu ghi chú"
    const saveNoteBtn = screen.getByRole('button', { name: /Lưu ghi chú/i });
    fireEvent.click(saveNoteBtn);

    await waitFor(() => {
      expect(mockRepo.addNote).toHaveBeenCalledWith(
        'div-01',
        'Ghi chú bổ sung sau 1 tuần',
        'Ứng nghiệm 100%'
      );
    });
  });
});
