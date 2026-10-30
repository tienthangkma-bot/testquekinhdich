/**
 * Ngũ Hành trong Dịch học cổ truyền
 */
export enum Element {
  /** Hành Kim (Phương Tây, số 4 - 9) */
  KIM = 'KIM',

  /** Hành Mộc (Phương Đông, số 3 - 8) */
  MOC = 'MOC',

  /** Hành Thủy (Phương Bắc, số 1 - 6) */
  THUY = 'THUY',

  /** Hành Hỏa (Phương Nam, số 2 - 7) */
  HOA = 'HOA',

  /** Hành Thổ (Trung cung, số 5 - 10) */
  THO = 'THO',
}

/**
 * Tên tiếng Việt có dấu của Ngũ Hành
 */
export const ELEMENT_NAME_MAP: Record<Element, string> = {
  [Element.KIM]: 'Kim',
  [Element.MOC]: 'Mộc',
  [Element.THUY]: 'Thủy',
  [Element.HOA]: 'Hỏa',
  [Element.THO]: 'Thổ',
};

/**
 * Lấy tên tiếng Việt của một Ngũ Hành
 */
export function getElementName(element: Element): string {
  const name = ELEMENT_NAME_MAP[element];
  if (!name) {
    throw new Error(`Ngũ Hành không hợp lệ: "${element}".`);
  }
  return name;
}

