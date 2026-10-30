import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { RawTrigramValues } from './yao.model';

/**
 * Mô hình một Quái đơn (1 trong 8 quẻ của Bát Quái)
 */
export interface Trigram {
  /**
   * Mã định danh chuẩn của quái (CAN, DOAI, LY, CHAN, TON, KHAM, CAN_SON, KHON)
   */
  readonly code: TrigramCode;

  /**
   * Tên tiếng Việt của quẻ (ví dụ: "Càn", "Đoài", "Ly"...)
   */
  readonly name: string;

  /**
   * Tên chữ Hán (ví dụ: "乾", "兌", "離"...)
   */
  readonly chineseName: string;

  /**
   * Ký tự biểu tượng Unicode Bát Quái (☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷)
   */
  readonly symbol: string;

  /**
   * Tượng quẻ trong tự nhiên (Thiên, Trạch, Hỏa, Lôi, Phong, Thủy, Sơn, Địa)
   */
  readonly nature: string;

  /**
   * Cấu trúc 3 hào của quái đơn (lưu từ dưới lên: [hào 1, hào 2, hào 3])
   * 0 = Âm, 1 = Dương
   */
  readonly lines: RawTrigramValues;

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

  /**
   * Ngũ Hành bản thể của quái
   */
  readonly element: Element;
}
