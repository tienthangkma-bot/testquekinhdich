import { Element, LinePosition, SixRelation } from '@kindich/domain';

/**
 * 12 Vận Trường Sinh (Thập Nhị Vận Trường Sinh)
 */
export type TwelveLifeStage =
  | 'TRUONG_SINH'
  | 'MOC_DUC'
  | 'QUAN_DOI'
  | 'LAM_QUAN'
  | 'DE_VUONG'
  | 'SUY'
  | 'BENH'
  | 'TU'
  | 'MO'
  | 'TUYET'
  | 'THAI'
  | 'DUONG';

export interface TwelveLifeStageInfo {
  readonly stage: TwelveLifeStage;
  readonly fullName: string;
  readonly shortName: string;
}

/**
 * Thần Sát bổ trợ cho từng Hào (Lộc, Mã, Quý, Đào, Quái Thần)
 */
export interface AuxiliaryDeityInfo {
  readonly isLoc: boolean;
  readonly isMa: boolean;
  readonly isDao: boolean;
  readonly isQuyNhan: boolean;
  readonly isQuaiThan: boolean;
  readonly locLabel: string;
  readonly maLabel: string;
  readonly daoLabel: string;
  readonly quyLabel: string;
  readonly quaiThanLabel: string;
}

/**
 * Thông tin Phục Thần cho một Hào (nếu quẻ thiếu Lục Thân)
 */
export interface PhucThanInfo {
  readonly hasPhucThan: boolean;
  readonly sixRelation?: SixRelation;
  readonly sixRelationName?: string;
  readonly stem?: string;
  readonly branch?: string;
  readonly canChi?: string;
  readonly element?: Element;
  readonly elementName?: string;
  /** Nhãn viết tắt như phong cách cổ bản (ví dụ: "Tài-Ngọ", "Quan-Dần") */
  readonly shortLabel: string;
}

/**
 * Thông tin tổng hợp 1 dòng phân tích bổ sung (Supplementary Line Analysis)
 */
export interface SupplementaryLineData {
  readonly position: LinePosition;
  readonly canChi: string;
  readonly stem: string;
  readonly branch: string;
  readonly element: Element;
  readonly elementName: string;
  readonly isMoving: boolean;
  readonly dayLifeStage: TwelveLifeStageInfo;
  readonly monthLifeStage: TwelveLifeStageInfo;
  readonly deities: AuxiliaryDeityInfo;
  readonly phucThan: PhucThanInfo;
  readonly isVoid: boolean;
}
