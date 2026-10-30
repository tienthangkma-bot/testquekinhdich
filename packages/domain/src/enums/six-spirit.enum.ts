import { Element } from './element.enum';

/**
 * Lục Thú (Six Spirits / Lục Thần - 六獸 / 六神) trong Dịch học Lục Hào:
 * 6 linh thú thần sát hộ trì quẻ, an theo Thiên Can của ngày lập quẻ:
 * 1. THANH_LONG (青龍 - Rồng xanh): Phương Đông, Mộc
 * 2. CHU_TUOC (朱雀 - Chim sẻ lửa đỏ): Phương Nam, Hỏa
 * 3. CAU_TRAN (勾陳 - Kỳ lân đất): Trung ương (Mậu), Thổ
 * 4. DANG_XA (螣蛇 - Rắn bay thần): Trung ương (Kỷ), Thổ
 * 5. BACH_HO (白虎 - Hổ trắng): Phương Tây, Kim
 * 6. HUYEN_VU (玄武 - Rùa rắn đen): Phương Bắc, Thủy
 */
export enum SixSpirit {
  /**
   * Thanh Long (Phương Đông - Hành Mộc)
   * Tượng trưng cho: Hỷ sự, cát khánh, quý nhân, may mắn, hôn nhân, tiệc tùng, tửu sắc, văn chương.
   */
  THANH_LONG = 'THANH_LONG',

  /**
   * Chu Tước (Phương Nam - Hành Hỏa)
   * Tượng trưng cho: Văn thư, khẩu thiệt, tiếng tăm, tin tức, tranh cãi, thư từ, hỏa hoạn, thị phi.
   */
  CHU_TUOC = 'CHU_TUOC',

  /**
   * Câu Trần (Trung ương - Hành Thổ - Dương Thổ/Mậu)
   * Tượng trưng cho: Chậm trễ, điền trạch, bất động sản, câu lưu, giam cầm, tranh chấp đất đai, người quen cũ.
   */
  CAU_TRAN = 'CAU_TRAN',

  /**
   * Đằng Xà (Trung ương - Hành Thổ - Âm Thổ/Kỷ)
   * Tượng trưng cho: Kinh sợ, quái dị, ác mộng, hoang mang, nghi hoặc, gian trá, quỷ thần ám muội.
   */
  DANG_XA = 'DANG_XA',

  /**
   * Bạch Hổ (Phương Tây - Hành Kim)
   * Tượng trưng cho: Hung dữ, thương tật, tai nạn, huyết quang, bệnh tật hiểm nghèo, tang chế, phẫu thuật.
   */
  BACH_HO = 'BACH_HO',

  /**
   * Huyền Vũ (Phương Bắc - Hành Thủy)
   * Tượng trưng cho: Âm thầm, trộm cắp, lừa đảo, mưu mô, gian xảo, tư tình vụng trộm, ám muội, ẩm thấp.
   */
  HUYEN_VU = 'HUYEN_VU',
}

/**
 * Thông tin chi tiết của một Lục Thú
 */
export interface SixSpiritInfo {
  readonly code: SixSpirit;
  readonly name: string;
  readonly sinoVietnamese: string;
  readonly chineseName: string;
  readonly element: Element;
  readonly elementName: string;
  readonly direction: string;
  readonly nature: string;
  readonly description: string;
}

/**
 * Trình tự tuần hoàn kinh điển của Lục Thú từ hào 1 đến hào 6:
 * Thanh Long -> Chu Tước -> Câu Trần -> Đằng Xà -> Bạch Hổ -> Huyền Vũ
 */
export const SIX_SPIRITS_ORDER: readonly [
  SixSpirit.THANH_LONG,
  SixSpirit.CHU_TUOC,
  SixSpirit.CAU_TRAN,
  SixSpirit.DANG_XA,
  SixSpirit.BACH_HO,
  SixSpirit.HUYEN_VU,
] = [
  SixSpirit.THANH_LONG,
  SixSpirit.CHU_TUOC,
  SixSpirit.CAU_TRAN,
  SixSpirit.DANG_XA,
  SixSpirit.BACH_HO,
  SixSpirit.HUYEN_VU,
];

/**
 * Bảng tra cứu thông tin chi tiết của Lục Thú
 */
export const SIX_SPIRIT_MAP: Record<SixSpirit, SixSpiritInfo> = {
  [SixSpirit.THANH_LONG]: {
    code: SixSpirit.THANH_LONG,
    name: 'Thanh Long',
    sinoVietnamese: 'Thanh Long',
    chineseName: '青龍',
    element: Element.MOC,
    elementName: 'Mộc',
    direction: 'Đông',
    nature: 'Cát thần',
    description: 'Chủ về vui mừng, hỷ sự, quý nhân, may mắn, rượu chè, ăn uống, thi cử đỗ đạt, hôn nhân.',
  },
  [SixSpirit.CHU_TUOC]: {
    code: SixSpirit.CHU_TUOC,
    name: 'Chu Tước',
    sinoVietnamese: 'Chu Tước',
    chineseName: '朱雀',
    element: Element.HOA,
    elementName: 'Hỏa',
    direction: 'Nam',
    nature: 'Văn thư / Khẩu thiệt',
    description: 'Chủ về văn thư, giấy tờ, tin tức, tiếng tăm, nhưng cũng chủ về tranh cãi, thị phi, khẩu thiệt, hỏa hoạn.',
  },
  [SixSpirit.CAU_TRAN]: {
    code: SixSpirit.CAU_TRAN,
    name: 'Câu Trần',
    sinoVietnamese: 'Câu Trần',
    chineseName: '勾陳',
    element: Element.THO,
    elementName: 'Thổ',
    direction: 'Trung ương (Dương Thổ)',
    nature: 'Chậm trễ / Trì trệ',
    description: 'Chủ về đất đai, nhà cửa, việc chậm chạp kéo dài, câu lưu, giam giữ, quan tụng, quen biết cũ.',
  },
  [SixSpirit.DANG_XA]: {
    code: SixSpirit.DANG_XA,
    name: 'Đằng Xà',
    sinoVietnamese: 'Đằng Xà',
    chineseName: '螣蛇',
    element: Element.THO,
    elementName: 'Thổ',
    direction: 'Trung ương (Âm Thổ)',
    nature: 'Kinh sợ / Nghi hoặc',
    description: 'Chủ về sợ hãi, ác mộng, quái dị, gian xảo, biến hóa khó lường, lo âu, tâm thần bất an.',
  },
  [SixSpirit.BACH_HO]: {
    code: SixSpirit.BACH_HO,
    name: 'Bạch Hổ',
    sinoVietnamese: 'Bạch Hổ',
    chineseName: '白虎',
    element: Element.KIM,
    elementName: 'Kim',
    direction: 'Tây',
    nature: 'Hung sát / Huyết quang',
    description: 'Chủ về máu me, tai nạn, thương tích, bệnh tật nguy hiểm, tang sự, tính tình dữ dội, dũng mãnh.',
  },
  [SixSpirit.HUYEN_VU]: {
    code: SixSpirit.HUYEN_VU,
    name: 'Huyền Vũ',
    sinoVietnamese: 'Huyền Vũ',
    chineseName: '玄武',
    element: Element.THUY,
    elementName: 'Thủy',
    direction: 'Bắc',
    nature: 'Ám muội / Đạo tặc',
    description: 'Chủ về trộm cắp, lừa dối, gian lận, mưu kế ngầm, việc mờ ám, tình ái vụng trộm, ẩm ướt thất thoát.',
  },
};
