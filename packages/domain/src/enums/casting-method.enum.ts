/**
 * Phương pháp lập quẻ Kinh Dịch
 */
export enum CastingMethod {
  /**
   * Lập quẻ bằng số seri tiền (SERIAL-MOD8-V1)
   */
  SERIAL = 'SERIAL',

  /**
   * Lập quẻ bằng giờ động tâm (Mai Hoa Dịch Số)
   */
  MAI_HUA = 'MAI_HUA',
}

/**
 * Phiên bản thuật toán lập quẻ
 */
export type AlgorithmVersion =
  | 'SERIAL-MOD8-V1'
  | 'MAI-HUA-V1';
