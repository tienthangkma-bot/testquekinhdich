import {
  CastingMethod,
  DivinationDateTime,
  HexagramTrio,
} from '@kindich/domain';
import {
  MaiHuaCastingResult,
  SerialCastingResult,
  SixYaoAnalysisResult,
  SixYaoOrchestratorInput,
} from '@kindich/core';
import { CalendarConversionResult } from '@kindich/calendar';

export interface SingleDivinationWorkspaceProps {
  /** Phương pháp lập quẻ */
  method: CastingMethod;
  /** Bộ 3 quẻ (Chủ, Biến, Hỗ) */
  trio: HexagramTrio;
  /** Thông tin ngày giờ, lịch pháp, Can Chi */
  dateTimeInfo: DivinationDateTime;
  /** Nội dung câu hỏi chiêm nghiệm */
  question?: string;
  /** Danh mục câu hỏi (công danh, tài lộc, sức khỏe...) */
  inquiryType?: string;
  /** Kết quả phân tích Lục Hào chuyên sâu từ Orchestrator */
  sixYaoResult?: SixYaoAnalysisResult;
  /** Hoặc các thông số để khởi chạy Orchestrator nếu chưa phân tích */
  orchestratorInput?: Partial<SixYaoOrchestratorInput>;
  /** Kết quả chi tiết phương pháp Mai Hoa (nếu lập quẻ bằng Mai Hoa) */
  maiHuaResult?: MaiHuaCastingResult;
  /** Kết quả chi tiết phương pháp Seri tiền (nếu lập quẻ bằng Seri) */
  serialResult?: SerialCastingResult;
  /** Dữ liệu lịch pháp chuyển đổi nếu có */
  calendarInfo?: CalendarConversionResult;
  /** Callback quay lại màn hình lập quẻ */
  onBackToCasting?: () => void;
  /** Callback lưu hoặc mở modal ghi chú */
  onSaveNote?: () => void;
  /** Đã lưu vào CSDL chưa */
  isSaved?: boolean;
  /** Tab màn hình khởi tạo ('an-que', 'luan-giai', hoặc 'ghi-chu') */
  initialTab?: 'an-que' | 'luan-giai' | 'ghi-chu';
  /** ID định danh phiên lập quẻ trong CSDL để lưu trữ ghi chú nghiệm lý */
  divinationId?: string;
}
