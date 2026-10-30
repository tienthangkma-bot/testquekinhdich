import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { RawTrigramValues } from './yao.model';

/**
 * Mô hình một Quái đơn chuẩn trong 8 quẻ Bát Quái
 */
export interface Trigram {
  /**
   * Mã ID định danh chuẩn của quái (CAN, DOAI, LY, CHAN, TON, KHAM, CAN_SON, KHON)
   */
  readonly id: TrigramCode | string;

  /**
   * Mã code định danh dạng enum
   */
  readonly code: TrigramCode;

  /**
   * Tên tiếng Việt của quẻ (ví dụ: "Càn", "Đoài", "Ly"...)
   */
  readonly name: string;

  /**
   * Tên Hán Việt (ví dụ: "Càn", "Đoài", "Ly", "Chấn", "Tốn", "Khảm", "Cấn", "Khôn")
   */
  readonly sinoVietnameseName: string;

  /**
   * Ký tự chữ Hán (乾, 兌, 離, 震, 巽, 坎, 艮, 坤)
   */
  readonly chineseName: string;

  /**
   * Ký tự biểu tượng Unicode Bát Quái (☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷)
   */
  readonly symbol: string;

  /**
   * Ngũ Hành bản thể của quái (Kim, Mộc, Thủy, Hỏa, Thổ)
   */
  readonly element: Element;

  /**
   * Cấu trúc ba hào theo thứ tự từ dưới lên: [hào 1, hào 2, hào 3]
   * Quy ước: 0 = Âm, 1 = Dương
   */
  readonly lines: RawTrigramValues;

  /**
   * Chuỗi nhị phân mã hóa tương ứng với 3 hào từ dưới lên (ví dụ: "111", "110", "101"...)
   */
  readonly binary: string;

  /**
   * Tượng quẻ trong tự nhiên (Thiên / Trời, Trạch / Đầm, Hỏa / Lửa, Lôi / Sấm, Phong / Gió, Thủy / Nước, Sơn / Núi, Địa / Đất)
   */
  readonly nature: string;

  /**
   * Số Tiên Thiên Bát Quái (dùng cho Mai Hoa Dịch Số & thuật toán MOD 8):
   * Càn 1, Đoài 2, Ly 3, Chấn 4, Tốn 5, Khảm 6, Cấn 7, Khôn 8
   */
  readonly earlyHeavenNumber: number;

  /**
   * Số Hậu Thiên Bát Quái (Lạc Thư / Cửu Cung):
   * Khảm 1, Khôn 2, Chấn 3, Tốn 4, Càn 6, Đoài 7, Cấn 8, Ly 9
   */
  readonly laterHeavenNumber: number;
}
