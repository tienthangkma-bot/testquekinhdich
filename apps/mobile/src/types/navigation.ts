import {
  CastingMethod,
  HexagramTrio,
  LinePosition,
} from '@kindich/domain';
import { SixYaoAnalysisResult } from '@kindich/core';

export type QuestionCategory =
  | 'work'
  | 'study'
  | 'finance'
  | 'family'
  | 'relationship'
  | 'other';

export type ScreenName =
  | 'home'
  | 'serial'
  | 'maihua'
  | 'result'
  | 'history'
  | 'settings';

export interface MobileDivinationRecord {
  id: string;
  method: CastingMethod;
  createdAt: string;
  question?: string;
  category?: QuestionCategory;
  trio: HexagramTrio;
  movingLines: readonly LinePosition[];
  sixYaoAnalysis?: SixYaoAnalysisResult;
  theDung?: {
    theTrigramNumber: number;
    theTrigramName: string;
    dungTrigramNumber: number;
    dungTrigramName: string;
    theLocation: 'upper' | 'lower';
    dungLocation: 'upper' | 'lower';
  };
  dateTimeInfo: {
    solarDateStr: string;
    lunarDateStr: string;
    yearCanChi: string;
    monthCanChi: string;
    dayCanChi: string;
    hourCanChi: string;
  };
  serialNumber?: string;
}

export interface NavigationState {
  currentScreen: ScreenName;
  activeRecord: MobileDivinationRecord | null;
  history: MobileDivinationRecord[];
}
