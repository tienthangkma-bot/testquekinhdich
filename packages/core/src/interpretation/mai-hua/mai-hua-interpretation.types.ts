import { Element, Trigram } from '@kindich/domain';

export const MAI_HUA_INTERP_VERSION = 'MAI-HUA-TI-YONG-V1';
export const MAI_HUA_INTERP_SOURCE =
  'Mai Hoa Dịch Số (Thiệu Ung / Thiệu Khang Tiết) - Chương Thể Dụng Luận';

/**
 * 5 mối quan hệ Thể - Dụng trong Mai Hoa Dịch Số
 */
export enum TiYongRelation {
  /** Dụng sinh Thể (Sinh nhập): Khí bên ngoài đến nuôi dưỡng mình, rất tốt lành */
  DUNG_SINH_THE = 'DUNG_SINH_THE',

  /** Thể sinh Dụng (Sinh xuất): Mình phải tiết khí ra ngoài để nuôi dưỡng sự việc, hao tổn */
  THE_SINH_DUNG = 'THE_SINH_DUNG',

  /** Thể khắc Dụng (Khắc xuất): Mình khống chế chế ngự được sự việc, vất vả nhưng thành công */
  THE_KHAC_DUNG = 'THE_KHAC_DUNG',

  /** Dụng khắc Thể (Khắc nhập): Sự việc hoặc hoàn cảnh bên ngoài khắc chế mình, tai họa tổn thương */
  DUNG_KHAC_THE = 'DUNG_KHAC_THE',

  /** Thể Dụng Tỷ Hòa: Cùng hành ngũ hành, tương thân tương ái, hòa thuận bình an */
  TY_HOA = 'TY_HOA',
}

/**
 * Mức độ cát hung theo cổ pháp Mai Hoa
 */
export type TiYongJudgmentLevel =
  | 'DAI_CAT'    // Rất tốt, việc thành
  | 'CAT'        // Tốt lành
  | 'BINH_HOA'   // Bình yên, ổn định
  | 'HAU_TON'    // Hao tổn, hao sức
  | 'DAI_HUNG';  // Rất xấu, thất bại

/**
 * Kết quả phân tích và diễn giải Thể Dụng Mai Hoa
 */
export interface TiYongInterpretation {
  readonly tiTrigram: Trigram;
  readonly yongTrigram: Trigram;
  readonly tiElement: Element;
  readonly yongElement: Element;
  readonly relation: TiYongRelation;
  readonly relationName: string;
  readonly classicalVerse: string;
  readonly judgmentLevel: TiYongJudgmentLevel;
  readonly judgmentLevelName: string;
  readonly explanation: string;
  readonly advice: string;
  readonly source: string;
  readonly version: string;
}
