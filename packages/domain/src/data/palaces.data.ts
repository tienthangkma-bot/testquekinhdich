/**
 * Dữ liệu Bát Cung tương thích ngược (Backward compatibility layer)
 * Toàn bộ logic lõi và dữ liệu chuẩn được định nghĩa tại `bagong.data.ts`
 */

import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { LinePosition } from '../models/yao.model';
import { PalaceGeneration } from '../models/hexagram.model';
import {
  BA_GONG_HEXAGRAMS,
  BA_GONG_PALACES,
  getHexagramBaGong,
  getHexagramBaGongById,
  getPalaceElement,
} from './bagong.data';

/**
 * Cấu trúc thông tin Bát Cung của một Quẻ (tương thích ngược)
 */
export interface HexagramPalaceInfo {
  readonly hexagramNumber: number;
  readonly hexagramId: string;
  readonly hexagramName: string;
  readonly palace: TrigramCode;
  readonly palaceName: string;
  readonly palaceElement: Element;
  readonly generation: PalaceGeneration;
  readonly worldLine: LinePosition;
  readonly responseLine: LinePosition;
}

/**
 * Ngũ Hành định danh của 8 Cung Bát Quái
 */
export const PALACE_ELEMENT_MAP: Record<TrigramCode, Element> = Object.fromEntries(
  BA_GONG_PALACES.map((p) => [p.trigramCode, p.element])
) as Record<TrigramCode, Element>;

/**
 * Tên tiếng Việt của 8 Cung
 */
export const PALACE_NAME_MAP: Record<TrigramCode, string> = Object.fromEntries(
  BA_GONG_PALACES.map((p) => [p.trigramCode, p.name])
) as Record<TrigramCode, string>;

/**
 * Danh sách toàn bộ 64 Quẻ phân chia theo Bát Cung (tương thích ngược)
 */
export const HEXAGRAM_PALACES: readonly HexagramPalaceInfo[] = BA_GONG_HEXAGRAMS.map(
  (h) => ({
    hexagramNumber: h.hexagramNumber,
    hexagramId: h.hexagramId,
    hexagramName: h.hexagramName,
    palace: h.palaceId,
    palaceName: h.palaceName,
    palaceElement: h.palaceElement,
    generation: h.generationStage as unknown as PalaceGeneration,
    worldLine: h.worldLine,
    responseLine: h.responseLine,
  })
);

export { getPalaceElement };

/**
 * Tra cứu thông tin Bát Cung theo số thứ tự quẻ Văn Vương (1 đến 64)
 */
export function getPalaceInfoByHexagramNumber(hexagramNumber: number): HexagramPalaceInfo {
  const h = getHexagramBaGong(hexagramNumber);
  return {
    hexagramNumber: h.hexagramNumber,
    hexagramId: h.hexagramId,
    hexagramName: h.hexagramName,
    palace: h.palaceId,
    palaceName: h.palaceName,
    palaceElement: h.palaceElement,
    generation: h.generationStage as unknown as PalaceGeneration,
    worldLine: h.worldLine,
    responseLine: h.responseLine,
  };
}

/**
 * Tra cứu thông tin Bát Cung theo ID quẻ ('HEX_01' đến 'HEX_64')
 */
export function getPalaceInfoByHexagramId(hexagramId: string): HexagramPalaceInfo {
  const h = getHexagramBaGongById(hexagramId);
  return {
    hexagramNumber: h.hexagramNumber,
    hexagramId: h.hexagramId,
    hexagramName: h.hexagramName,
    palace: h.palaceId,
    palaceName: h.palaceName,
    palaceElement: h.palaceElement,
    generation: h.generationStage as unknown as PalaceGeneration,
    worldLine: h.worldLine,
    responseLine: h.responseLine,
  };
}
