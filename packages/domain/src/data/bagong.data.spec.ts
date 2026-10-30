import { describe, it, expect } from 'vitest';
import {
  BA_GONG_HEXAGRAMS,
  BA_GONG_PALACES,
  GENERATION_STAGE_LINES,
  getAllPalaces,
  getHexagramBaGong,
  getHexagramBaGongById,
  getHexagramsByPalace,
  getHexagramsByStage,
  getPalaceById,
  getPalaceElement,
  getStaticWorldAndResponse,
} from './bagong.data';
import { GenerationStage, PalaceId } from '../enums/bagong.enum';
import { Element } from '../enums/element.enum';
import { TrigramCode } from '../enums/trigram-name.enum';

describe('Module Ba Gong (Bát Cung & Thế Ứng 64 Quẻ) - Bốc Phệ Chính Tông', () => {
  describe('1. Khai báo đủ 8 cung quẻ và Ngũ Hành', () => {
    it('phải khai báo đủ 8 cung quẻ trong Bát Cung', () => {
      const palaces = getAllPalaces();
      expect(palaces).toHaveLength(8);
      expect(BA_GONG_PALACES).toHaveLength(8);
    });

    it('mỗi cung phải có đầy đủ ID, tên, tên Hán, Ngũ Hành, mã quái và danh sách 8 quẻ', () => {
      for (const palace of BA_GONG_PALACES) {
        expect(palace.id).toBeDefined();
        expect(palace.name).toBeTruthy();
        expect(palace.sinoVietnamese).toBeTruthy();
        expect(palace.chineseName).toBeTruthy();
        expect(palace.element).toBeDefined();
        expect(palace.elementName).toBeTruthy();
        expect(palace.trigramCode).toBeDefined();
        expect(palace.hexagramNumbers).toHaveLength(8);
        expect(palace.hexagramIds).toHaveLength(8);
      }
    });

    it('Ngũ Hành của từng cung phải chuẩn xác theo Bốc Phệ Chính Tông', () => {
      expect(getPalaceById(PalaceId.CAN).element).toBe(Element.KIM);
      expect(getPalaceById(PalaceId.CAN).elementName).toBe('Kim');

      expect(getPalaceById(PalaceId.KHAM).element).toBe(Element.THUY);
      expect(getPalaceById(PalaceId.KHAM).elementName).toBe('Thủy');

      expect(getPalaceById(PalaceId.CAN_SON).element).toBe(Element.THO);
      expect(getPalaceById(PalaceId.CAN_SON).elementName).toBe('Thổ');

      expect(getPalaceById(PalaceId.CHAN).element).toBe(Element.MOC);
      expect(getPalaceById(PalaceId.CHAN).elementName).toBe('Mộc');

      expect(getPalaceById(PalaceId.TON).element).toBe(Element.MOC);
      expect(getPalaceById(PalaceId.TON).elementName).toBe('Mộc');

      expect(getPalaceById(PalaceId.LY).element).toBe(Element.HOA);
      expect(getPalaceById(PalaceId.LY).elementName).toBe('Hỏa');

      expect(getPalaceById(PalaceId.KHON).element).toBe(Element.THO);
      expect(getPalaceById(PalaceId.KHON).elementName).toBe('Thổ');

      expect(getPalaceById(PalaceId.DOAI).element).toBe(Element.KIM);
      expect(getPalaceById(PalaceId.DOAI).elementName).toBe('Kim');
    });

    it('getPalaceElement trả về đúng Ngũ Hành của Cung', () => {
      expect(getPalaceElement(PalaceId.CAN)).toBe(Element.KIM);
      expect(getPalaceElement(PalaceId.LY)).toBe(Element.HOA);
      expect(getPalaceElement(PalaceId.KHAM)).toBe(Element.THUY);
    });
  });

  describe('2. Bảng ánh xạ 64 quẻ vào 8 cung', () => {
    it('phải có đủ 64 quẻ được ánh xạ', () => {
      expect(BA_GONG_HEXAGRAMS).toHaveLength(64);
    });

    it('không trùng lặp số thứ tự quẻ (1 đến 64)', () => {
      const numbers = BA_GONG_HEXAGRAMS.map((h) => h.hexagramNumber);
      const unique = new Set(numbers);
      expect(unique.size).toBe(64);
      for (let i = 1; i <= 64; i++) {
        expect(unique.has(i)).toBe(true);
      }
    });

    it('không trùng lặp mã định danh quẻ (HEX_01 đến HEX_64)', () => {
      const ids = BA_GONG_HEXAGRAMS.map((h) => h.hexagramId);
      const unique = new Set(ids);
      expect(unique.size).toBe(64);
    });

    it('mỗi cung trong 8 cung phải có đúng 8 quẻ', () => {
      for (const palace of BA_GONG_PALACES) {
        const hexagramsInPalace = getHexagramsByPalace(palace.id);
        expect(hexagramsInPalace).toHaveLength(8);
      }
    });

    it('trong mỗi cung, 8 quẻ phải trải qua đủ 8 giai đoạn biến thế theo đúng thứ tự', () => {
      const expectedStages = [
        GenerationStage.BAN_CUNG,
        GenerationStage.NHAT_THE,
        GenerationStage.NHI_THE,
        GenerationStage.TAM_THE,
        GenerationStage.TU_THE,
        GenerationStage.NGU_THE,
        GenerationStage.DU_HON,
        GenerationStage.QUY_HON,
      ];

      for (const palace of BA_GONG_PALACES) {
        const hexagramsInPalace = getHexagramsByPalace(palace.id);
        const actualStages = hexagramsInPalace.map((h) => h.generationStage);
        expect(actualStages).toEqual(expectedStages);

        const orders = hexagramsInPalace.map((h) => h.orderInPalace);
        expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      }
    });
  });

  describe('3. Dữ liệu chi tiết của từng quẻ', () => {
    it('mỗi quẻ phải có đủ Palace ID, Palace Element, Generation Stage, Thế, Ứng', () => {
      for (const h of BA_GONG_HEXAGRAMS) {
        expect(Object.values(PalaceId)).toContain(h.palaceId);
        expect(Object.values(Element)).toContain(h.palaceElement);
        expect(Object.values(GenerationStage)).toContain(h.generationStage);

        expect(h.worldLine).toBeGreaterThanOrEqual(1);
        expect(h.worldLine).toBeLessThanOrEqual(6);

        expect(h.responseLine).toBeGreaterThanOrEqual(1);
        expect(h.responseLine).toBeLessThanOrEqual(6);

        expect(h.palaceName).toBeTruthy();
        expect(h.palaceElementName).toBeTruthy();
        expect(h.generationStageName).toBeTruthy();
      }
    });
  });

  describe('4. Nguyên tắc Thế / Ứng tĩnh (Không suy ra từ hào động)', () => {
    it('vị trí Thế và Ứng cố định theo Bốc Phệ Chính Tông (Thế Ứng Khởi Lệ)', () => {
      expect(GENERATION_STAGE_LINES[GenerationStage.BAN_CUNG]).toEqual({ worldLine: 6, responseLine: 3 });
      expect(GENERATION_STAGE_LINES[GenerationStage.NHAT_THE]).toEqual({ worldLine: 1, responseLine: 4 });
      expect(GENERATION_STAGE_LINES[GenerationStage.NHI_THE]).toEqual({ worldLine: 2, responseLine: 5 });
      expect(GENERATION_STAGE_LINES[GenerationStage.TAM_THE]).toEqual({ worldLine: 3, responseLine: 6 });
      expect(GENERATION_STAGE_LINES[GenerationStage.TU_THE]).toEqual({ worldLine: 4, responseLine: 1 });
      expect(GENERATION_STAGE_LINES[GenerationStage.NGU_THE]).toEqual({ worldLine: 5, responseLine: 2 });
      expect(GENERATION_STAGE_LINES[GenerationStage.DU_HON]).toEqual({ worldLine: 4, responseLine: 1 });
      expect(GENERATION_STAGE_LINES[GenerationStage.QUY_HON]).toEqual({ worldLine: 3, responseLine: 6 });

      expect(getStaticWorldAndResponse(GenerationStage.BAN_CUNG)).toEqual({ worldLine: 6, responseLine: 3 });
      expect(getStaticWorldAndResponse(GenerationStage.DU_HON)).toEqual({ worldLine: 4, responseLine: 1 });
    });

    it('mọi quẻ trong 64 quẻ đều có hào Ứng cách hào Thế đúng 3 vị trí (|Thế - Ứng| = 3)', () => {
      for (const h of BA_GONG_HEXAGRAMS) {
        const diff = Math.abs(h.worldLine - h.responseLine);
        expect(diff).toBe(3);
      }
    });
  });

  describe('5. Đối chiếu chuẩn xác với Bốc Phệ Chính Tông', () => {
    it('Càn Cung (Kim) đủ 8 quẻ chuẩn', () => {
      const canPalace = getHexagramsByPalace(PalaceId.CAN);
      const names = canPalace.map((h) => h.hexagramName);
      expect(names).toEqual([
        'Thuần Càn',
        'Thiên Phong Cấu',
        'Thiên Sơn Độn',
        'Thiên Địa Bĩ',
        'Phong Địa Quan',
        'Sơn Địa Bác',
        'Hỏa Địa Tấn',
        'Hỏa Thiên Đại Hữu',
      ]);
      expect(canPalace[0]?.worldLine).toBe(6);
      expect(canPalace[0]?.responseLine).toBe(3);
      expect(canPalace[6]?.worldLine).toBe(4); // Du hồn Hỏa Địa Tấn
      expect(canPalace[7]?.worldLine).toBe(3); // Quy hồn Hỏa Thiên Đại Hữu
    });

    it('Khảm Cung (Thủy) đủ 8 quẻ chuẩn', () => {
      const khamPalace = getHexagramsByPalace(PalaceId.KHAM);
      const names = khamPalace.map((h) => h.hexagramName);
      expect(names).toEqual([
        'Thuần Khảm',
        'Thủy Trạch Tiết',
        'Thủy Lôi Truân',
        'Thủy Hỏa Ký Tế',
        'Trạch Hỏa Cách',
        'Lôi Hỏa Phong',
        'Địa Hỏa Minh Di',
        'Địa Thủy Sư',
      ]);
    });

    it('Khôn Cung (Thổ) đủ 8 quẻ chuẩn, đối chiếu Thủy Thiên Nhu (Du Hồn) & Thủy Địa Tỷ (Quy Hồn)', () => {
      const nhu = getHexagramBaGong(5); // Thủy Thiên Nhu
      expect(nhu.hexagramName).toBe('Thủy Thiên Nhu');
      expect(nhu.palaceId).toBe(PalaceId.KHON);
      expect(nhu.palaceElement).toBe(Element.THO);
      expect(nhu.generationStage).toBe(GenerationStage.DU_HON);
      expect(nhu.worldLine).toBe(4);
      expect(nhu.responseLine).toBe(1);

      const ty = getHexagramBaGong(8); // Thủy Địa Tỷ
      expect(ty.hexagramName).toBe('Thủy Địa Tỷ');
      expect(ty.palaceId).toBe(PalaceId.KHON);
      expect(ty.generationStage).toBe(GenerationStage.QUY_HON);
      expect(ty.worldLine).toBe(3);
      expect(ty.responseLine).toBe(6);
    });
  });

  describe('6. Các hàm tra cứu và xử lý lỗi', () => {
    it('getHexagramBaGong tra cứu theo số thứ tự (1 đến 64)', () => {
      const thuanCan = getHexagramBaGong(1);
      expect(thuanCan.hexagramName).toBe('Thuần Càn');
      expect(thuanCan.upperTrigramCode).toBe(TrigramCode.CAN);
      expect(thuanCan.lowerTrigramCode).toBe(TrigramCode.CAN);

      expect(() => getHexagramBaGong(0)).toThrow();
      expect(() => getHexagramBaGong(65)).toThrow();
    });

    it('getHexagramBaGongById tra cứu theo ID quẻ', () => {
      const thuanKhon = getHexagramBaGongById('HEX_02');
      expect(thuanKhon.hexagramName).toBe('Thuần Khôn');
      expect(thuanKhon.palaceId).toBe(PalaceId.KHON);

      expect(() => getHexagramBaGongById('HEX_00')).toThrow();
      expect(() => getHexagramBaGongById('INVALID')).toThrow();
    });

    it('getHexagramsByStage lấy đúng 8 quẻ của từng giai đoạn', () => {
      const duHonHexagrams = getHexagramsByStage(GenerationStage.DU_HON);
      expect(duHonHexagrams).toHaveLength(8);
      for (const h of duHonHexagrams) {
        expect(h.generationStage).toBe(GenerationStage.DU_HON);
        expect(h.worldLine).toBe(4);
        expect(h.responseLine).toBe(1);
      }
    });

    it('báo lỗi khi tra cứu Cung không hợp lệ', () => {
      expect(() => getPalaceById('UNKNOWN')).toThrow();
      expect(() => getHexagramsByPalace('UNKNOWN')).toThrow();
    });
  });
});
