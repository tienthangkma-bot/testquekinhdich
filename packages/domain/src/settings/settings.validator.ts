import {
  DEFAULT_KINHDICH_SETTINGS,
  KinhDichSettings,
  ThemeMode,
  DisplayLanguage,
  FontSize,
  DefaultCastingMethod,
  SupportedTimeZone,
  DayTransitionRule,
  LeapMonthRule,
} from './settings.types';

const VALID_THEMES: readonly ThemeMode[] = ['light', 'dark', 'system'];
const VALID_LANGUAGES: readonly DisplayLanguage[] = ['vi', 'zh', 'en'];
const VALID_FONT_SIZES: readonly FontSize[] = ['small', 'medium', 'large'];
const VALID_METHODS: readonly DefaultCastingMethod[] = ['serial', 'time', 'six-yao'];
const VALID_TIMEZONES: readonly SupportedTimeZone[] = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'UTC',
];
const VALID_DAY_RULES: readonly DayTransitionRule[] = ['23:00', '00:00'];
const VALID_LEAP_RULES: readonly LeapMonthRule[] = ['TIET_KHI', 'TRUYEN_THONG'];

/**
 * Chuẩn hóa và xác thực dữ liệu cài đặt người dùng, tự động điền giá trị mặc định nếu thiếu hoặc không hợp lệ.
 */
export function normalizeKinhDichSettings(input: unknown): KinhDichSettings {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_KINHDICH_SETTINGS, updatedAt: new Date().toISOString() };
  }

  const raw = input as Record<string, unknown>;
  const appearance = (raw.appearance as Record<string, unknown>) || {};
  const divination = (raw.divination as Record<string, unknown>) || {};
  const calendar = (raw.calendar as Record<string, unknown>) || {};

  const theme: ThemeMode = VALID_THEMES.includes(appearance.theme as ThemeMode)
    ? (appearance.theme as ThemeMode)
    : DEFAULT_KINHDICH_SETTINGS.appearance.theme;

  const language: DisplayLanguage = VALID_LANGUAGES.includes(appearance.language as DisplayLanguage)
    ? (appearance.language as DisplayLanguage)
    : DEFAULT_KINHDICH_SETTINGS.appearance.language;

  const fontSize: FontSize = VALID_FONT_SIZES.includes(appearance.fontSize as FontSize)
    ? (appearance.fontSize as FontSize)
    : DEFAULT_KINHDICH_SETTINGS.appearance.fontSize;

  const defaultMethod: DefaultCastingMethod = VALID_METHODS.includes(divination.defaultMethod as DefaultCastingMethod)
    ? (divination.defaultMethod as DefaultCastingMethod)
    : DEFAULT_KINHDICH_SETTINGS.divination.defaultMethod;

  const ruleSetId: string =
    typeof divination.ruleSetId === 'string' && divination.ruleSetId.trim().length > 0
      ? divination.ruleSetId.trim()
      : DEFAULT_KINHDICH_SETTINGS.divination.ruleSetId;

  const algorithmVersion: string =
    typeof divination.algorithmVersion === 'string' && divination.algorithmVersion.trim().length > 0
      ? divination.algorithmVersion.trim()
      : DEFAULT_KINHDICH_SETTINGS.divination.algorithmVersion;

  const timeZone: SupportedTimeZone = VALID_TIMEZONES.includes(calendar.timeZone as SupportedTimeZone)
    ? (calendar.timeZone as SupportedTimeZone)
    : DEFAULT_KINHDICH_SETTINGS.calendar.timeZone;

  const dayTransitionRule: DayTransitionRule = VALID_DAY_RULES.includes(calendar.dayTransitionRule as DayTransitionRule)
    ? (calendar.dayTransitionRule as DayTransitionRule)
    : DEFAULT_KINHDICH_SETTINGS.calendar.dayTransitionRule;

  const leapMonthRule: LeapMonthRule = VALID_LEAP_RULES.includes(calendar.leapMonthRule as LeapMonthRule)
    ? (calendar.leapMonthRule as LeapMonthRule)
    : DEFAULT_KINHDICH_SETTINGS.calendar.leapMonthRule;

  return {
    version: 1,
    appearance: {
      theme,
      language,
      fontSize,
    },
    divination: {
      defaultMethod,
      ruleSetId,
      algorithmVersion,
    },
    calendar: {
      timeZone,
      dayTransitionRule,
      leapMonthRule,
    },
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}
