import { Line } from '@kindich/domain';

/**
 * Trả về tên truyền thống của hào theo vị trí và tính chất âm/dương
 * - Dương (1) = Cửu
 * - Âm (0) = Lục
 */
export function getTraditionalLineName(line: Line): string {
  const isYang = line.value === 1;
  const numName = isYang ? 'Cửu' : 'Lục';

  switch (line.position) {
    case 1:
      return `Sơ ${numName}`;
    case 2:
      return `${numName} Nhị`;
    case 3:
      return `${numName} Tam`;
    case 4:
      return `${numName} Tứ`;
    case 5:
      return `${numName} Ngũ`;
    case 6:
      return `Thượng ${numName}`;
    default:
      return `Hào ${line.position}`;
  }
}
