/**
 * Lục Thân (Six Relations - 六親) trong Dịch học Lục Hào
 *
 * Định nghĩa 5 mối quan hệ giữa Ngũ Hành của Hào và Ngũ Hành của Cung Quẻ:
 * 1. HUYNH_DE: Cùng hành với Cung (Huynh Đệ - 兄弟)
 * 2. PHU_MAU: Hào sinh Cung (Phụ Mẫu - 父母)
 * 3. TU_TON: Cung sinh Hào (Tử Tôn - 子孫)
 * 4. THE_TAI: Cung khắc Hào (Thê Tài - 妻財)
 * 5. QUAN_QUY: Hào khắc Cung (Quan Quỷ - 官鬼)
 */
export enum SixRelation {
  /**
   * Huynh Đệ (Anh em, bằng hữu, đồng liêu)
   * Quan hệ: Cùng hành với Cung quẻ ("Đồng ngã giả vi Huynh Đệ")
   */
  HUYNH_DE = 'HUYNH_DE',

  /**
   * Phụ Mẫu (Cha mẹ, trưởng bối, văn thư, giấy tờ, nhà cửa, xe cộ)
   * Quan hệ: Hào sinh Cung quẻ ("Sinh ngã giả vi Phụ Mẫu")
   */
  PHU_MAU = 'PHU_MAU',

  /**
   * Tử Tôn (Con cái, hậu bối, học trò, phúc thần, hỷ thần, giải tai ương)
   * Quan hệ: Cung quẻ sinh Hào ("Ngã sinh giả vi Tử Tôn")
   */
  TU_TON = 'TU_TON',

  /**
   * Thê Tài (Vợ, người yêu, tiền tài, của cải, vật chất)
   * Quan hệ: Cung quẻ khắc Hào ("Ngã khắc giả vi Thê Tài")
   */
  THE_TAI = 'THE_TAI',

  /**
   * Quan Quỷ (Quan chức, chức vụ, sự nghiệp, tai họa, bệnh tật, kẻ trộm)
   * Quan hệ: Hào khắc Cung quẻ ("Khắc ngã giả vi Quan Quỷ")
   */
  QUAN_QUY = 'QUAN_QUY',
}

/**
 * Thông tin chi tiết của một Lục Thân
 */
export interface SixRelationInfo {
  readonly code: SixRelation;
  readonly name: string;
  readonly sinoVietnamese: string;
  readonly chineseName: string;
  readonly description: string;
}

/**
 * Bảng tra cứu thông tin mô tả chi tiết của Lục Thân
 */
export const SIX_RELATION_MAP: Record<SixRelation, SixRelationInfo> = {
  [SixRelation.HUYNH_DE]: {
    code: SixRelation.HUYNH_DE,
    name: 'Huynh Đệ',
    sinoVietnamese: 'Huynh Đệ',
    chineseName: '兄弟',
    description: 'Cùng hành với cung quẻ. Đại diện cho anh em, bạn bè, đồng sự, đối thủ cạnh tranh.',
  },
  [SixRelation.PHU_MAU]: {
    code: SixRelation.PHU_MAU,
    name: 'Phụ Mẫu',
    sinoVietnamese: 'Phụ Mẫu',
    chineseName: '父母',
    description: 'Hào sinh cung quẻ. Đại diện cho cha mẹ, bề trên, giấy tờ, học hành, nhà cửa, bảo trợ.',
  },
  [SixRelation.TU_TON]: {
    code: SixRelation.TU_TON,
    name: 'Tử Tôn',
    sinoVietnamese: 'Tử Tôn',
    chineseName: '子孫',
    description: 'Cung quẻ sinh hào. Đại diện cho con cháu, sản phẩm, niềm vui, phúc đức, giải trừ tai họa.',
  },
  [SixRelation.THE_TAI]: {
    code: SixRelation.THE_TAI,
    name: 'Thê Tài',
    sinoVietnamese: 'Thê Tài',
    chineseName: '妻財',
    description: 'Cung quẻ khắc hào. Đại diện cho tiền bạc, tài sản, vợ, người yêu, vật sở hữu.',
  },
  [SixRelation.QUAN_QUY]: {
    code: SixRelation.QUAN_QUY,
    name: 'Quan Quỷ',
    sinoVietnamese: 'Quan Quỷ',
    chineseName: '官鬼',
    description: 'Hào khắc cung quẻ. Đại diện cho công danh, quan trường, chồng, bệnh tật, áp lực, lo âu.',
  },
};
