import { Element } from '@kindich/domain';

/**
 * Hiển thị tên tiếng Việt có dấu cho Ngũ Hành
 */
export function getElementDisplayName(element: Element): string {
  switch (element) {
    case Element.KIM:
      return 'Kim';
    case Element.MOC:
      return 'Mộc';
    case Element.THUY:
      return 'Thủy';
    case Element.HOA:
      return 'Hỏa';
    case Element.THO:
      return 'Thổ';
    default:
      return element;
  }
}
