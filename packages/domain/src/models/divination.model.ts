import { CastingMethod, AlgorithmVersion } from '../enums/casting-method.enum';
import { HexagramTrio } from './hexagram.model';

/**
 * Thông tin thời gian âm dương lịch và Can Chi phục vụ luận đoán Lục Hào
 */
export interface DivinationDateTime {
  /** Thời điểm lập quẻ theo Dương lịch (chuỗi ISO 8601, ví dụ: "2026-10-30T21:45:00.000Z") */
  readonly solarDateTime: string;

  /** Năm âm lịch (ví dụ: 2026) */
  readonly lunarYear: number;

  /** Tháng âm lịch (1 đến 12, số âm nếu tháng nhuận) */
  readonly lunarMonth: number;

  /** Ngày âm lịch (1 đến 30) */
  readonly lunarDay: number;

  /** Giờ âm lịch (tính theo Địa Chi, ví dụ: "Tý", "Sửu", "Dần"...) */
  readonly lunarHourBranch: string;

  /** Can Chi năm (ví dụ: "Bính Ngọ") */
  readonly yearCanChi: string;

  /** Can Chi tháng - Nguyệt Kiến (ví dụ: "Mậu Tuất") */
  readonly monthCanChi: string;

  /** Can Chi ngày - Nhật Thần (ví dụ: "Ất Mão") */
  readonly dayCanChi: string;

  /** Can Chi giờ (ví dụ: "Bính Tý") */
  readonly hourCanChi: string;

  /** Tiết khí hiện tại (ví dụ: "Sương Giáng", "Lập Đông") */
  readonly solarTerm?: string;

  /** Hai chi Tuần Không của ngày lập quẻ (ví dụ: ["Thân", "Dậu"]) */
  readonly voidBranches?: readonly [string, string];
}

/**
 * Dữ liệu đầu vào khi lập quẻ bằng số seri tiền (SERIAL-MOD8-V1)
 */
export interface SerialCastingInput {
  readonly method: CastingMethod.SERIAL;

  /** Dãy số seri tiền (chuỗi ký số, ví dụ: "19864205") */
  readonly serialNumber: string;

  /** Ghi chú về tờ tiền (mệnh giá, loại tiền, tùy chọn) */
  readonly note?: string;
}

/**
 * Dữ liệu đầu vào khi lập quẻ bằng Giờ động tâm (Mai Hoa Dịch Số)
 */
export interface MaiHuaCastingInput {
  readonly method: CastingMethod.MAI_HUA;

  /** Thời điểm động tâm khởi quẻ (Dương lịch ISO 8601) */
  readonly dateTime: string;

  /** Ghi chú bối cảnh khi khởi tâm chiêm nghiệm */
  readonly note?: string;
}

/**
 * Kiểu hợp nhất cho mọi loại đầu vào lập quẻ
 */
export type CastingInput = SerialCastingInput | MaiHuaCastingInput;

/**
 * Bản ghi chi tiết của một lần lập quẻ (Divination Record)
 * Đây là thực thể cốt lõi (Core Entity) đại diện cho một lần gieo quẻ hoàn chỉnh,
 * được lưu trữ trong Database (IndexedDB / SQLite) và vận hành offline-first.
 */
export interface DivinationRecord {
  /**
   * Mã định danh duy nhất của lần lập quẻ (UUID v4)
   */
  readonly id: string;

  /**
   * Thời điểm tạo bản ghi (chuỗi ISO 8601)
   */
  readonly createdAt: string;

  /**
   * Phương pháp đã sử dụng để lập quẻ (SERIAL hoặc MAI_HUA)
   */
  readonly method: CastingMethod;

  /**
   * Phiên bản thuật toán đã áp dụng (ví dụ: "SERIAL-MOD8-V1" hoặc "MAI-HUA-V1")
   */
  readonly algorithmVersion: AlgorithmVersion;

  /**
   * Dữ liệu tham số đầu vào của lần lập quẻ
   */
  readonly input: CastingInput;

  /**
   * Mục đích hoặc câu hỏi khi chiêm đoán (ví dụ: "Hỏi về công danh sự nghiệp")
   */
  readonly question?: string;

  /**
   * Bộ ba quẻ kết quả: Quẻ Chủ, Quẻ Biến, Quẻ Hỗ và Hào Động
   */
  readonly trio: HexagramTrio;

  /**
   * Thông tin thiên can địa chi, Nhật Thần, Nguyệt Kiến tại thời điểm lập quẻ
   */
  readonly dateTimeInfo: DivinationDateTime;

  /**
   * Ghi chú bổ sung hoặc lời bình giải của người dùng
   */
  readonly notes?: string;
}
