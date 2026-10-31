import { CalendarConversionResult } from '@kindich/calendar';

/**
 * Trả về chuỗi ngày giờ hiện tại theo định dạng YYYY-MM-DDTHH:mm
 * chuẩn múi giờ Asia/Ho_Chi_Minh (UTC+7)
 */
export function getCurrentVietnamTimeString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return formatter.format(now).replace(' ', 'T');
}

/**
 * Tạo chuỗi tóm tắt Dương lịch và Âm lịch đẹp mắt
 */
export function formatSolarLunarSummary(calInfo: CalendarConversionResult): {
  solarText: string;
  lunarText: string;
} {
  const { solar, lunar } = calInfo;
  const pad = (n: number) => String(n).padStart(2, '0');

  const solarText = `${solar.weekday}, ngày ${pad(solar.day)}/${pad(solar.month)}/${solar.year} lúc ${pad(solar.hour)}:${pad(solar.minute)}`;
  const leapText = lunar.isLeap ? ' (Nhuận)' : '';
  const lunarText = `Ngày ${pad(lunar.day)} tháng ${pad(lunar.month)}${leapText} năm ${calInfo.canChi.year} (${calInfo.zodiacAnimal})`;

  return { solarText, lunarText };
}
