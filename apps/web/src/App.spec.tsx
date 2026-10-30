import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CastingMethod, IDivinationRepository } from '@kindich/domain';
import { setDivinationRepository } from './services/repository.service';
import { App } from './App';

describe('App Integration - Database Auto-Save & History Flow', () => {
  let mockRepo: IDivinationRepository;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(async (dto) => ({
        divination: {
          id: 'test-div-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          method: dto.method,
          algorithmVersion: dto.algorithmVersion,
          ruleSetId: dto.ruleSetId,
          input: dto.input,
          dateTimeInfo: dto.dateTimeInfo,
          question: dto.question,
          inquiryType: dto.inquiryType,
          tags: dto.tags || [],
          starred: false,
        },
        result: {
          id: 'test-res-id',
          divinationId: 'test-div-id',
          createdAt: new Date().toISOString(),
          primaryHexagramNumber: dto.trio.primary.number,
          primaryHexagramName: dto.trio.primary.name,
          changingHexagramNumber: dto.trio.transformed?.number,
          changingHexagramName: dto.trio.transformed?.name,
          movingLines: [...dto.trio.movingLineIndices],
          trio: dto.trio,
        },
        notes: [],
      })),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(async () => ({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      })),
      search: vi.fn(),
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      getNotesByDivinationId: vi.fn(async () => []),
    };

    setDivinationRepository(mockRepo);
  });

  it('tự động lưu vào Repository sau khi lập quẻ Seri tiền thành công (Requirement 1)', async () => {
    render(<App />);

    // 1. Nhập câu hỏi chiêm nghiệm
    const questionInput = screen.getByLabelText(/Nội dung câu hỏi \/ Việc cần chiêm đoán/i);
    fireEvent.change(questionInput, { target: { value: 'Công việc kinh doanh cuối năm' } });

    // 2. Nhập số seri tiền
    const serialInput = screen.getByLabelText(/Dãy số seri tờ tiền đang cầm/i);
    fireEvent.change(serialInput, { target: { value: '198642' } });

    // 3. Bấm Lập quẻ
    const castBtn = screen.getByRole('button', { name: /^Lập quẻ$/i });
    fireEvent.click(castBtn);

    // 4. Kiểm tra repo.create được gọi với đầy đủ thông tin
    await waitFor(() => {
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          method: CastingMethod.SERIAL,
          question: 'Công việc kinh doanh cuối năm',
          algorithmVersion: 'SERIAL-MOD8-V1',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
          input: {
            method: CastingMethod.SERIAL,
            serialNumber: '198642',
          },
          trio: expect.anything(),
          dateTimeInfo: expect.anything(),
          analysis: expect.anything(),
        })
      );
    });

    // 5. Hiển thị thông báo lưu thành công
    expect(
      screen.getByText(/✓ Đã tự động lưu phiên lập quẻ vào Lịch sử!/i)
    ).toBeInTheDocument();
  });

  it('tự động lưu vào Repository sau khi lập quẻ Mai Hoa thành công (Requirement 1)', async () => {
    render(<App />);

    // 1. Chuyển sang tab Giờ động tâm
    const timeTab = screen.getByRole('button', { name: /Giờ động tâm/i });
    fireEvent.click(timeTab);

    // 2. Nhập câu hỏi
    const questionInput = screen.getByLabelText(/Nội dung câu hỏi \/ Việc cần chiêm đoán/i);
    fireEvent.change(questionInput, { target: { value: 'Sức khỏe gia đình' } });

    // 3. Bấm Lập quẻ Mai Hoa
    const castBtn = screen.getByRole('button', { name: /Lập quẻ Mai Hoa/i });
    fireEvent.click(castBtn);

    // 4. Kiểm tra repo.create được gọi với phương pháp MAI_HUA
    await waitFor(() => {
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          method: CastingMethod.MAI_HUA,
          question: 'Sức khỏe gia đình',
          algorithmVersion: 'MAI-HUA-V1',
          ruleSetId: 'BO_PHE_CHINH_TONG_V1',
        })
      );
    });

    expect(
      screen.getByText(/✓ Đã tự động lưu phiên lập quẻ vào Lịch sử!/i)
    ).toBeInTheDocument();
  });

  it('chuyển đổi sang tab Lịch sử hiển thị màn hình Lịch sử lập quẻ (Requirement 2)', async () => {
    render(<App />);

    // Bấm tab "Lịch sử lập quẻ"
    const historyTab = screen.getByRole('button', { name: /Lịch sử lập quẻ/i });
    fireEvent.click(historyTab);

    // Kiểm tra màn hình lịch sử hiển thị
    await waitFor(() => {
      expect(screen.getByText(/Lịch Sử Lập Quẻ & Chiêm Đoán/i)).toBeInTheDocument();
      expect(mockRepo.list).toHaveBeenCalled();
    });
  });
});
