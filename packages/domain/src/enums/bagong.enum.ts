import { TrigramCode } from './trigram-name.enum';

/**
 * Mã định danh của 8 Cung (Bát Cung - 八宮) trong Dịch học Lục Hào:
 * Theo hệ thống Kinh Thị Dịch Truyện & Bốc Phệ Chính Tông
 * 8 Cung quẻ tương ứng trực tiếp với 8 Quái chủ quản
 */
export type PalaceId = TrigramCode;

export const PalaceId = {
  /** Cung Càn (Hành Kim) */
  CAN: TrigramCode.CAN,

  /** Cung Khảm (Hành Thủy) */
  KHAM: TrigramCode.KHAM,

  /** Cung Cấn (Hành Thổ) */
  CAN_SON: TrigramCode.CAN_SON,

  /** Cung Chấn (Hành Mộc) */
  CHAN: TrigramCode.CHAN,

  /** Cung Tốn (Hành Mộc) */
  TON: TrigramCode.TON,

  /** Cung Ly (Hành Hỏa) */
  LY: TrigramCode.LY,

  /** Cung Khôn (Hành Thổ) */
  KHON: TrigramCode.KHON,

  /** Cung Đoài (Hành Kim) */
  DOAI: TrigramCode.DOAI,
} as const;


/**
 * 8 Giai đoạn biến thế (Generation Stage) trong mỗi Cung của Bát Cung:
 * 1. BAN_CUNG: Quẻ gốc / Thuần quái (Thế hào 6, Ứng hào 3)
 * 2. NHAT_THE: Biến hào 1 (Thế hào 1, Ứng hào 4)
 * 3. NHI_THE: Biến tiếp hào 2 (Thế hào 2, Ứng hào 5)
 * 4. TAM_THE: Biến tiếp hào 3 (Thế hào 3, Ứng hào 6)
 * 5. TU_THE: Biến tiếp hào 4 (Thế hào 4, Ứng hào 1)
 * 6. NGU_THE: Biến tiếp hào 5 (Thế hào 5, Ứng hào 2)
 * 7. DU_HON: Biến lùi hào 4 (Thế hào 4, Ứng hào 1)
 * 8. QUY_HON: Biến lùi 3 hào nội quái về nguyên thể (Thế hào 3, Ứng hào 6)
 */
export enum GenerationStage {
  BAN_CUNG = 'BAN_CUNG',
  NHAT_THE = 'NHAT_THE',
  NHI_THE = 'NHI_THE',
  TAM_THE = 'TAM_THE',
  TU_THE = 'TU_THE',
  NGU_THE = 'NGU_THE',
  DU_HON = 'DU_HON',
  QUY_HON = 'QUY_HON',
}

/**
 * Tên tiếng Việt của 8 giai đoạn biến thế
 */
export const GENERATION_STAGE_NAMES: Record<GenerationStage, string> = {
  [GenerationStage.BAN_CUNG]: 'Bản Cung',
  [GenerationStage.NHAT_THE]: 'Nhất Thế',
  [GenerationStage.NHI_THE]: 'Nhị Thế',
  [GenerationStage.TAM_THE]: 'Tam Thế',
  [GenerationStage.TU_THE]: 'Tứ Thế',
  [GenerationStage.NGU_THE]: 'Ngũ Thế',
  [GenerationStage.DU_HON]: 'Du Hồn',
  [GenerationStage.QUY_HON]: 'Quy Hồn',
};

/**
 * Thông tin mô tả chi tiết của từng giai đoạn biến thế
 */
export interface GenerationStageInfo {
  readonly stage: GenerationStage;
  readonly name: string;
  readonly sinoVietnamese: string;
  readonly chineseName: string;
  readonly orderInPalace: number;
  readonly worldLine: number;
  readonly responseLine: number;
  readonly description: string;
}

/**
 * Bảng thông tin 8 giai đoạn biến thế chuẩn theo Bốc Phệ Chính Tông
 */
export const GENERATION_STAGE_INFO_MAP: Record<GenerationStage, GenerationStageInfo> = {
  [GenerationStage.BAN_CUNG]: {
    stage: GenerationStage.BAN_CUNG,
    name: 'Bản Cung',
    sinoVietnamese: 'Bản Cung',
    chineseName: '本宮',
    orderInPalace: 1,
    worldLine: 6,
    responseLine: 3,
    description: 'Quẻ thuần bản cung, thượng hạ đồng quái. Thế tại hào 6, Ứng tại hào 3.',
  },
  [GenerationStage.NHAT_THE]: {
    stage: GenerationStage.NHAT_THE,
    name: 'Nhất Thế',
    sinoVietnamese: 'Nhất Thế',
    chineseName: '一世',
    orderInPalace: 2,
    worldLine: 1,
    responseLine: 4,
    description: 'Biến hào 1 từ bản cung. Thế tại sơ hào (hào 1), Ứng tại tứ hào (hào 4).',
  },
  [GenerationStage.NHI_THE]: {
    stage: GenerationStage.NHI_THE,
    name: 'Nhị Thế',
    sinoVietnamese: 'Nhị Thế',
    chineseName: '二世',
    orderInPalace: 3,
    worldLine: 2,
    responseLine: 5,
    description: 'Biến tiếp hào 2. Thế tại nhị hào (hào 2), Ứng tại ngũ hào (hào 5).',
  },
  [GenerationStage.TAM_THE]: {
    stage: GenerationStage.TAM_THE,
    name: 'Tam Thế',
    sinoVietnamese: 'Tam Thế',
    chineseName: '三世',
    orderInPalace: 4,
    worldLine: 3,
    responseLine: 6,
    description: 'Biến tiếp hào 3. Thế tại tam hào (hào 3), Ứng tại thượng hào (hào 6).',
  },
  [GenerationStage.TU_THE]: {
    stage: GenerationStage.TU_THE,
    name: 'Tứ Thế',
    sinoVietnamese: 'Tứ Thế',
    chineseName: '四世',
    orderInPalace: 5,
    worldLine: 4,
    responseLine: 1,
    description: 'Biến tiếp hào 4. Thế tại tứ hào (hào 4), Ứng tại sơ hào (hào 1).',
  },
  [GenerationStage.NGU_THE]: {
    stage: GenerationStage.NGU_THE,
    name: 'Ngũ Thế',
    sinoVietnamese: 'Ngũ Thế',
    chineseName: '五世',
    orderInPalace: 6,
    worldLine: 5,
    responseLine: 2,
    description: 'Biến tiếp hào 5. Thế tại ngũ hào (hào 5), Ứng tại nhị hào (hào 2).',
  },
  [GenerationStage.DU_HON]: {
    stage: GenerationStage.DU_HON,
    name: 'Du Hồn',
    sinoVietnamese: 'Du Hồn',
    chineseName: '遊魂',
    orderInPalace: 7,
    worldLine: 4,
    responseLine: 1,
    description: 'Lùi biến hào 4 trở lại. Thế tại tứ hào (hào 4), Ứng tại sơ hào (hào 1).',
  },
  [GenerationStage.QUY_HON]: {
    stage: GenerationStage.QUY_HON,
    name: 'Quy Hồn',
    sinoVietnamese: 'Quy Hồn',
    chineseName: '歸魂',
    orderInPalace: 8,
    worldLine: 3,
    responseLine: 6,
    description: 'Biến 3 hào nội quái quay về bản thể ban đầu. Thế tại tam hào (hào 3), Ứng tại thượng hào (hào 6).',
  },
};
