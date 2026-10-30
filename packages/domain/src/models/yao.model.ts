/**
 * Giá trị cơ bản của một hào:
 * - 0 = Hào Âm (vạch đứt: - -)
 * - 1 = Hào Dương (vạch liền: ---)
 */
export type YaoValue = 0 | 1;

/**
 * Hằng số định nghĩa quy ước âm dương
 */
export const YAO_VALUE = {
  YIN: 0 as const,
  YANG: 1 as const,
};

/**
 * Vị trí của hào trong quẻ 6 hào (tính từ dưới lên):
 * - 1: Sơ hào (hào dưới cùng)
 * - 2: Nhị hào
 * - 3: Tam hào
 * - 4: Tứ hào
 * - 5: Ngũ hào
 * - 6: Thượng hào (hào trên cùng)
 */
export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Vị trí hào trong quẻ đơn (Bát quái, 3 hào từ dưới lên):
 * - 1: Hào dưới
 * - 2: Hào giữa
 * - 3: Hào trên
 */
export type TrigramLinePosition = 1 | 2 | 3;

/**
 * Tên gọi truyền thống của các vị trí hào trong quẻ Lục Hào
 */
export type LinePositionName =
  | 'Sơ'
  | 'Nhị'
  | 'Tam'
  | 'Tứ'
  | 'Ngũ'
  | 'Thượng';

/**
 * Trạng thái 4 thời kỳ biến đổi của Hào (Tứ Tượng):
 * - THIEU_DUONG: Dương tĩnh (1, không động)
 * - THIEU_AM: Âm tĩnh (0, không động)
 * - LAO_DUONG: Dương động (1 động, sẽ biến thành 0)
 * - LAO_AM: Âm động (0 động, sẽ biến thành 1)
 */
export enum YaoState {
  THIEU_DUONG = 'THIEU_DUONG',
  THIEU_AM = 'THIEU_AM',
  LAO_DUONG = 'LAO_DUONG',
  LAO_AM = 'LAO_AM',
}

/**
 * Mô hình một Hào hoàn chỉnh trong quẻ
 */
export interface Line {
  /**
   * Vị trí của hào trong quẻ (1 đến 6, từ dưới lên)
   */
  readonly position: LinePosition;

  /**
   * Giá trị của hào (0 = Âm, 1 = Dương)
   */
  readonly value: YaoValue;

  /**
   * Trạng thái hào có động hay không
   */
  readonly isMoving: boolean;

  /**
   * Tên gọi hào kết hợp âm dương (ví dụ: "Sơ Cửu", "Lục Nhị", "Cửu Tam", "Thượng Lục")
   */
  readonly name?: string;
}

/**
 * Bộ 6 hào của quẻ, lưu từ dưới lên (index 0 = hào 1, index 5 = hào 6)
 */
export type HexagramLines = readonly [Line, Line, Line, Line, Line, Line];

/**
 * Mảng 6 giá trị nhị phân thô của quẻ (từ dưới lên: [hào 1, hào 2, hào 3, hào 4, hào 5, hào 6])
 */
export type RawHexagramValues = readonly [YaoValue, YaoValue, YaoValue, YaoValue, YaoValue, YaoValue];

/**
 * Mảng 3 giá trị nhị phân thô của quái đơn (từ dưới lên: [hào 1, hào 2, hào 3])
 */
export type RawTrigramValues = readonly [YaoValue, YaoValue, YaoValue];
