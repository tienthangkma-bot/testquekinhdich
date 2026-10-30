import { Element } from '../enums/element.enum';
import { TrigramCode } from '../enums/trigram-name.enum';
import { GenerationStage, PalaceId } from '../enums/bagong.enum';
import { LinePosition } from './yao.model';

/**
 * Cặp vị trí Hào Thế và Hào Ứng cố định của một quẻ
 */
export interface WorldResponsePair {
  /**
   * Vị trí hào Thế (1 đến 6, từ dưới lên)
   */
  readonly worldLine: LinePosition;

  /**
   * Vị trí hào Ứng (1 đến 6, từ dưới lên)
   */
  readonly responseLine: LinePosition;
}

/**
 * Cấu trúc thông tin một Cung trong Bát Cung (8 Palaces)
 */
export interface BaGongPalace {
  /**
   * Mã định danh của Cung (CAN, KHAM, CAN_SON, CHAN, TON, LY, KHON, DOAI)
   */
  readonly id: PalaceId;

  /**
   * Tên tiếng Việt của Cung (ví dụ: "Càn", "Khảm", "Cấn"...)
   */
  readonly name: string;

  /**
   * Tên Hán Việt đầy đủ của Cung (ví dụ: "Càn Cung", "Khảm Cung"...)
   */
  readonly sinoVietnamese: string;

  /**
   * Tên chữ Hán của Cung (ví dụ: "乾宮", "坎宮"...)
   */
  readonly chineseName: string;

  /**
   * Ngũ Hành bản thể của Cung (Kim, Mộc, Thủy, Hỏa, Thổ)
   */
  readonly element: Element;

  /**
   * Tên tiếng Việt có dấu của Ngũ Hành Cung ("Kim", "Mộc", "Thủy", "Hỏa", "Thổ")
   */
  readonly elementName: string;

  /**
   * Mã quái chủ quản của Cung
   */
  readonly trigramCode: TrigramCode;

  /**
   * Danh sách số thứ tự của 8 quẻ trực thuộc theo trình tự 8 giai đoạn (Bản cung -> Quy hồn)
   */
  readonly hexagramNumbers: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  /**
   * Danh sách ID của 8 quẻ trực thuộc theo trình tự 8 giai đoạn (Bản cung -> Quy hồn)
   */
  readonly hexagramIds: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}

/**
 * Cấu trúc ánh xạ Bát Cung của một Quẻ Kinh Dịch
 */
export interface HexagramBaGong {
  /**
   * Số thứ tự quẻ theo hệ Văn Vương (1 đến 64)
   */
  readonly hexagramNumber: number;

  /**
   * Mã định danh duy nhất của quẻ ('HEX_01' đến 'HEX_64')
   */
  readonly hexagramId: string;

  /**
   * Tên quẻ tiếng Việt (ví dụ: "Thuần Càn", "Thiên Phong Cấu"...)
   */
  readonly hexagramName: string;

  /**
   * Tên Hán Việt (ví dụ: "Càn vi Thiên", "Thiên Phong Cấu"...)
   */
  readonly sinoVietnameseName: string;

  /**
   * Tên chữ Hán của quẻ (ví dụ: "乾為天", "天風姤"...)
   */
  readonly chineseName: string;

  /**
   * Mã quái Thượng quái (Ngoại quái)
   */
  readonly upperTrigramCode: TrigramCode;

  /**
   * Mã quái Hạ quái (Nội quái)
   */
  readonly lowerTrigramCode: TrigramCode;

  /**
   * Mã định danh Cung quẻ (Palace ID)
   */
  readonly palaceId: PalaceId;

  /**
   * Tên Cung quẻ tiếng Việt (ví dụ: "Càn", "Khảm"...)
   */
  readonly palaceName: string;

  /**
   * Ngũ Hành của Cung quẻ (Palace Element)
   */
  readonly palaceElement: Element;

  /**
   * Tên tiếng Việt của Ngũ Hành Cung ("Kim", "Mộc", "Thủy", "Hỏa", "Thổ")
   */
  readonly palaceElementName: string;

  /**
   * Giai đoạn biến thế trong Cung (Generation Stage: BAN_CUNG -> QUY_HON)
   */
  readonly generationStage: GenerationStage;

  /**
   * Tên tiếng Việt của giai đoạn biến thế ("Bản Cung", "Nhất Thế"...)
   */
  readonly generationStageName: string;

  /**
   * Thứ tự của quẻ trong Cung (1 đến 8)
   */
  readonly orderInPalace: number;

  /**
   * Vị trí hào Thế tĩnh trong quẻ (1 đến 6, từ dưới lên)
   * TUYỆT ĐỐI CỐ ĐỊNH THEO BỐC PHỆ CHÍNH TÔNG - KHÔNG PHỤ THUỘC HÀO ĐỘNG
   */
  readonly worldLine: LinePosition;

  /**
   * Vị trí hào Ứng tĩnh trong quẻ (1 đến 6, từ dưới lên)
   * TUYỆT ĐỐI CỐ ĐỊNH THEO BỐC PHỆ CHÍNH TÔNG - KHÔNG PHỤ THUỘC HÀO ĐỘNG
   */
  readonly responseLine: LinePosition;
}
