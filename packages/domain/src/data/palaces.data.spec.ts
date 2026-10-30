import { describe, it, expect } from 'vitest';
import {
  HEXAGRAM_PALACES,
  PALACE_ELEMENT_MAP,
  PALACE_NAME_MAP,
  getPalaceElement,
  getPalaceInfoByHexagramId,
  getPalaceInfoByHexagramNumber,
} from './palaces.data';
import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';
import { PalaceGeneration } from '../models/hexagram.model';

describe('Palaces Data (Bát Cung & Thế Ứng 64 Quẻ)', () => {
  it('phải có đúng 64 quẻ trong danh sách Bát Cung', () => {
    expect(HEXAGRAM_PALACES).toHaveLength(64);
  });

  it('không được trùng số thứ tự quẻ (1 đến 64)', () => {
    const numbers = HEXAGRAM_PALACES.map((h) => h.hexagramNumber);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(64);
    for (let i = 1; i <= 64; i++) {
      expect(uniqueNumbers.has(i)).toBe(true);
    }
  });

  it('không được trùng mã định danh quẻ (HEX_01 đến HEX_64)', () => {
    const ids = HEXAGRAM_PALACES.map((h) => h.hexagramId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(64);
  });

  it('mỗi Cung trong 8 Cung phải chứa đúng 8 quẻ', () => {
    const palaceCount: Record<string, number> = {};
    for (const h of HEXAGRAM_PALACES) {
      palaceCount[h.palace] = (palaceCount[h.palace] || 0) + 1;
    }

    const allTrigramCodes = [
      TrigramCode.CAN,
      TrigramCode.DOAI,
      TrigramCode.LY,
      TrigramCode.CHAN,
      TrigramCode.TON,
      TrigramCode.KHAM,
      TrigramCode.CAN_SON,
      TrigramCode.KHON,
    ];

    for (const code of allTrigramCodes) {
      expect(palaceCount[code]).toBe(8);
    }
  });

  it('mỗi Cung phải có đủ 8 biến bậc (Bản cung, Nhất thế... Quy hồn)', () => {
    const generations = [
      PalaceGeneration.BAN_CUNG,
      PalaceGeneration.NHAT_THE,
      PalaceGeneration.NHI_THE,
      PalaceGeneration.TAM_THE,
      PalaceGeneration.TU_THE,
      PalaceGeneration.NGU_THE,
      PalaceGeneration.DU_HON,
      PalaceGeneration.QUY_HON,
    ];

    const allTrigramCodes = [
      TrigramCode.CAN,
      TrigramCode.DOAI,
      TrigramCode.LY,
      TrigramCode.CHAN,
      TrigramCode.TON,
      TrigramCode.KHAM,
      TrigramCode.CAN_SON,
      TrigramCode.KHON,
    ];

    for (const code of allTrigramCodes) {
      const hexagramsInPalace = HEXAGRAM_PALACES.filter((h) => h.palace === code);
      const gensInPalace = hexagramsInPalace.map((h) => h.generation);
      expect(gensInPalace).toEqual(generations);
    }
  });

  it('vị trí hào Thế và Ứng phải chuẩn xác theo quy luật biến thế', () => {
    for (const h of HEXAGRAM_PALACES) {
      switch (h.generation) {
        case PalaceGeneration.BAN_CUNG:
          expect(h.worldLine).toBe(6);
          expect(h.responseLine).toBe(3);
          break;
        case PalaceGeneration.NHAT_THE:
          expect(h.worldLine).toBe(1);
          expect(h.responseLine).toBe(4);
          break;
        case PalaceGeneration.NHI_THE:
          expect(h.worldLine).toBe(2);
          expect(h.responseLine).toBe(5);
          break;
        case PalaceGeneration.TAM_THE:
          expect(h.worldLine).toBe(3);
          expect(h.responseLine).toBe(6);
          break;
        case PalaceGeneration.TU_THE:
          expect(h.worldLine).toBe(4);
          expect(h.responseLine).toBe(1);
          break;
        case PalaceGeneration.NGU_THE:
          expect(h.worldLine).toBe(5);
          expect(h.responseLine).toBe(2);
          break;
        case PalaceGeneration.DU_HON:
          expect(h.worldLine).toBe(4);
          expect(h.responseLine).toBe(1);
          break;
        case PalaceGeneration.QUY_HON:
          expect(h.worldLine).toBe(3);
          expect(h.responseLine).toBe(6);
          break;
      }
    }
  });

  it('Ngũ Hành Bát Cung và tên Cung phải chuẩn xác tuyệt đối', () => {
    expect(PALACE_NAME_MAP[TrigramCode.CAN]).toBe('Càn');
    expect(PALACE_NAME_MAP[TrigramCode.KHON]).toBe('Khôn');
    expect(PALACE_ELEMENT_MAP[TrigramCode.CAN]).toBe(Element.KIM);
    expect(PALACE_ELEMENT_MAP[TrigramCode.DOAI]).toBe(Element.KIM);
    expect(PALACE_ELEMENT_MAP[TrigramCode.LY]).toBe(Element.HOA);
    expect(PALACE_ELEMENT_MAP[TrigramCode.CHAN]).toBe(Element.MOC);
    expect(PALACE_ELEMENT_MAP[TrigramCode.TON]).toBe(Element.MOC);
    expect(PALACE_ELEMENT_MAP[TrigramCode.KHAM]).toBe(Element.THUY);
    expect(PALACE_ELEMENT_MAP[TrigramCode.CAN_SON]).toBe(Element.THO);
    expect(PALACE_ELEMENT_MAP[TrigramCode.KHON]).toBe(Element.THO);
  });

  it('getPalaceInfoByHexagramNumber hoạt động đúng và báo lỗi khi số không hợp lệ', () => {
    const thuanCan = getPalaceInfoByHexagramNumber(1);
    expect(thuanCan.hexagramName).toBe('Thuần Càn');
    expect(thuanCan.palace).toBe(TrigramCode.CAN);
    expect(thuanCan.palaceElement).toBe(Element.KIM);
    expect(thuanCan.generation).toBe(PalaceGeneration.BAN_CUNG);

    const thuyThienNhu = getPalaceInfoByHexagramNumber(5);
    expect(thuyThienNhu.hexagramName).toBe('Thủy Thiên Nhu');
    expect(thuyThienNhu.palace).toBe(TrigramCode.KHON);
    expect(thuyThienNhu.palaceElement).toBe(Element.THO);
    expect(thuyThienNhu.generation).toBe(PalaceGeneration.DU_HON);

    expect(() => getPalaceInfoByHexagramNumber(0)).toThrow();
    expect(() => getPalaceInfoByHexagramNumber(65)).toThrow();
  });

  it('getPalaceInfoByHexagramId hoạt động đúng và báo lỗi khi ID không hợp lệ', () => {
    const can = getPalaceInfoByHexagramId('HEX_01');
    expect(can.hexagramNumber).toBe(1);

    expect(() => getPalaceInfoByHexagramId('HEX_99')).toThrow();
  });

  it('getPalaceElement trả về đúng Ngũ Hành của Cung', () => {
    expect(getPalaceElement(TrigramCode.CAN)).toBe(Element.KIM);
    expect(getPalaceElement(TrigramCode.KHAM)).toBe(Element.THUY);
  });
});
