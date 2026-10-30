import { describe, it, expect } from 'vitest';
import {
  BRANCH_ELEMENT_MAP,
  getBranchElement,
  NA_JIA_RULES,
  getNaJiaRuleByTrigram,
  getNaJiaForLine,
  getNaJiaForHexagram,
} from './najia.data';
import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';

describe('Na Jia Data Specification (Nạp Giáp Cổ Pháp)', () => {
  describe('1. Bảng Ngũ Hành 12 Địa Chi', () => {
    it('định nghĩa chính xác Ngũ Hành của đủ 12 Địa Chi', () => {
      expect(Object.keys(BRANCH_ELEMENT_MAP).length).toBe(12);
      expect(getBranchElement('Tý')).toBe(Element.THUY);
      expect(getBranchElement('Sửu')).toBe(Element.THO);
      expect(getBranchElement('Dần')).toBe(Element.MOC);
      expect(getBranchElement('Mão')).toBe(Element.MOC);
      expect(getBranchElement('Thìn')).toBe(Element.THO);
      expect(getBranchElement('Tỵ')).toBe(Element.HOA);
      expect(getBranchElement('Ngọ')).toBe(Element.HOA);
      expect(getBranchElement('Mùi')).toBe(Element.THO);
      expect(getBranchElement('Thân')).toBe(Element.KIM);
      expect(getBranchElement('Dậu')).toBe(Element.KIM);
      expect(getBranchElement('Tuất')).toBe(Element.THO);
      expect(getBranchElement('Hợi')).toBe(Element.THUY);
    });

    it('ném lỗi khi tra cứu Địa Chi không hợp lệ', () => {
      expect(() => getBranchElement('Long')).toThrow(/Địa Chi không hợp lệ/);
      expect(() => getBranchElement('')).toThrow(/Địa Chi không hợp lệ/);
    });
  });

  describe('2. Khai báo Nạp Giáp đủ 8 Bát Quái', () => {
    it('chứa đủ quy tắc Nạp Giáp của 8 quái đơn', () => {
      expect(NA_JIA_RULES.length).toBe(8);
      const codes = NA_JIA_RULES.map((r) => r.trigramCode);
      expect(codes).toContain(TrigramCode.CAN);
      expect(codes).toContain(TrigramCode.KHON);
      expect(codes).toContain(TrigramCode.CHAN);
      expect(codes).toContain(TrigramCode.TON);
      expect(codes).toContain(TrigramCode.KHAM);
      expect(codes).toContain(TrigramCode.LY);
      expect(codes).toContain(TrigramCode.CAN_SON);
      expect(codes).toContain(TrigramCode.DOAI);
    });

    it('Quẻ CÀN: Can Giáp (nội), Nhâm (ngoại); Tý Dần Thìn, Ngọ Thân Tuất', () => {
      const can = getNaJiaRuleByTrigram(TrigramCode.CAN);
      expect(can.innerStem).toBe('Giáp');
      expect(can.outerStem).toBe('Nhâm');
      expect(can.innerBranches).toEqual(['Tý', 'Dần', 'Thìn']);
      expect(can.outerBranches).toEqual(['Ngọ', 'Thân', 'Tuất']);

      // Kiểm tra 6 hào từ dưới lên:
      expect(can.innerLines[0]).toEqual({
        position: 1,
        stem: 'Giáp',
        branch: 'Tý',
        element: Element.THUY,
        canChi: 'Giáp Tý',
      });
      expect(can.innerLines[1]).toEqual({
        position: 2,
        stem: 'Giáp',
        branch: 'Dần',
        element: Element.MOC,
        canChi: 'Giáp Dần',
      });
      expect(can.innerLines[2]).toEqual({
        position: 3,
        stem: 'Giáp',
        branch: 'Thìn',
        element: Element.THO,
        canChi: 'Giáp Thìn',
      });

      expect(can.outerLines[0]).toEqual({
        position: 4,
        stem: 'Nhâm',
        branch: 'Ngọ',
        element: Element.HOA,
        canChi: 'Nhâm Ngọ',
      });
      expect(can.outerLines[1]).toEqual({
        position: 5,
        stem: 'Nhâm',
        branch: 'Thân',
        element: Element.KIM,
        canChi: 'Nhâm Thân',
      });
      expect(can.outerLines[2]).toEqual({
        position: 6,
        stem: 'Nhâm',
        branch: 'Tuất',
        element: Element.THO,
        canChi: 'Nhâm Tuất',
      });
    });

    it('Quẻ KHÔN: Can Ất (nội), Quý (ngoại); Mùi Tỵ Mão, Sửu Hợi Dậu', () => {
      const khon = getNaJiaRuleByTrigram(TrigramCode.KHON);
      expect(khon.innerStem).toBe('Ất');
      expect(khon.outerStem).toBe('Quý');
      expect(khon.innerBranches).toEqual(['Mùi', 'Tỵ', 'Mão']);
      expect(khon.outerBranches).toEqual(['Sửu', 'Hợi', 'Dậu']);

      expect(khon.innerLines[0]?.canChi).toBe('Ất Mùi');
      expect(khon.innerLines[0]?.element).toBe(Element.THO);
      expect(khon.innerLines[1]?.canChi).toBe('Ất Tỵ');
      expect(khon.innerLines[1]?.element).toBe(Element.HOA);
      expect(khon.innerLines[2]?.canChi).toBe('Ất Mão');
      expect(khon.innerLines[2]?.element).toBe(Element.MOC);

      expect(khon.outerLines[0]?.canChi).toBe('Quý Sửu');
      expect(khon.outerLines[0]?.element).toBe(Element.THO);
      expect(khon.outerLines[1]?.canChi).toBe('Quý Hợi');
      expect(khon.outerLines[1]?.element).toBe(Element.THUY);
      expect(khon.outerLines[2]?.canChi).toBe('Quý Dậu');
      expect(khon.outerLines[2]?.element).toBe(Element.KIM);
    });

    it('Quẻ CHẤN: Can Canh; Tý Dần Thìn, Ngọ Thân Tuất', () => {
      const chan = getNaJiaRuleByTrigram(TrigramCode.CHAN);
      expect(chan.innerStem).toBe('Canh');
      expect(chan.outerStem).toBe('Canh');
      expect(chan.innerBranches).toEqual(['Tý', 'Dần', 'Thìn']);
      expect(chan.outerBranches).toEqual(['Ngọ', 'Thân', 'Tuất']);
      expect(chan.innerLines[0]?.canChi).toBe('Canh Tý');
      expect(chan.outerLines[2]?.canChi).toBe('Canh Tuất');
    });

    it('Quẻ TỐN: Can Tân; Sửu Hợi Dậu, Mùi Tỵ Mão', () => {
      const ton = getNaJiaRuleByTrigram(TrigramCode.TON);
      expect(ton.innerStem).toBe('Tân');
      expect(ton.outerStem).toBe('Tân');
      expect(ton.innerBranches).toEqual(['Sửu', 'Hợi', 'Dậu']);
      expect(ton.outerBranches).toEqual(['Mùi', 'Tỵ', 'Mão']);
      expect(ton.innerLines[0]?.canChi).toBe('Tân Sửu');
      expect(ton.outerLines[2]?.canChi).toBe('Tân Mão');
    });

    it('Quẻ KHẢM: Can Mậu; Dần Thìn Ngọ, Thân Tuất Tý', () => {
      const kham = getNaJiaRuleByTrigram(TrigramCode.KHAM);
      expect(kham.innerStem).toBe('Mậu');
      expect(kham.outerStem).toBe('Mậu');
      expect(kham.innerBranches).toEqual(['Dần', 'Thìn', 'Ngọ']);
      expect(kham.outerBranches).toEqual(['Thân', 'Tuất', 'Tý']);
      expect(kham.innerLines[0]?.canChi).toBe('Mậu Dần');
      expect(kham.outerLines[2]?.canChi).toBe('Mậu Tý');
    });

    it('Quẻ LY: Can Kỷ; Mão Sửu Hợi, Dậu Mùi Tỵ', () => {
      const ly = getNaJiaRuleByTrigram(TrigramCode.LY);
      expect(ly.innerStem).toBe('Kỷ');
      expect(ly.outerStem).toBe('Kỷ');
      expect(ly.innerBranches).toEqual(['Mão', 'Sửu', 'Hợi']);
      expect(ly.outerBranches).toEqual(['Dậu', 'Mùi', 'Tỵ']);
      expect(ly.innerLines[0]?.canChi).toBe('Kỷ Mão');
      expect(ly.outerLines[2]?.canChi).toBe('Kỷ Tỵ');
    });

    it('Quẻ CẤN: Can Bính; Thìn Ngọ Thân, Tuất Tý Dần', () => {
      const canSon = getNaJiaRuleByTrigram(TrigramCode.CAN_SON);
      expect(canSon.innerStem).toBe('Bính');
      expect(canSon.outerStem).toBe('Bính');
      expect(canSon.innerBranches).toEqual(['Thìn', 'Ngọ', 'Thân']);
      expect(canSon.outerBranches).toEqual(['Tuất', 'Tý', 'Dần']);
      expect(canSon.innerLines[0]?.canChi).toBe('Bính Thìn');
      expect(canSon.outerLines[2]?.canChi).toBe('Bính Dần');
    });

    it('Quẻ ĐOÀI: Can Đinh; Tỵ Mão Sửu, Hợi Dậu Mùi', () => {
      const doai = getNaJiaRuleByTrigram(TrigramCode.DOAI);
      expect(doai.innerStem).toBe('Đinh');
      expect(doai.outerStem).toBe('Đinh');
      expect(doai.innerBranches).toEqual(['Tỵ', 'Mão', 'Sửu']);
      expect(doai.outerBranches).toEqual(['Hợi', 'Dậu', 'Mùi']);
      expect(doai.innerLines[0]?.canChi).toBe('Đinh Tỵ');
      expect(doai.outerLines[2]?.canChi).toBe('Đinh Mùi');
    });
  });

  describe('3. Hàm tra cứu getNaJiaForLine và getNaJiaForHexagram', () => {
    it('tra cứu đúng Nạp Giáp cho từng vị trí hào (1 đến 6 từ dưới lên)', () => {
      // Quẻ Càn:
      expect(getNaJiaForLine(TrigramCode.CAN, 1).canChi).toBe('Giáp Tý');
      expect(getNaJiaForLine(TrigramCode.CAN, 3).canChi).toBe('Giáp Thìn');
      expect(getNaJiaForLine(TrigramCode.CAN, 4).canChi).toBe('Nhâm Ngọ');
      expect(getNaJiaForLine(TrigramCode.CAN, 6).canChi).toBe('Nhâm Tuất');
    });

    it('lập Nạp Giáp đầy đủ cho Quẻ Thủy Thiên Nhu (Hạ Càn, Thượng Khảm)', () => {
      const lines = getNaJiaForHexagram(TrigramCode.CAN, TrigramCode.KHAM);
      expect(lines.length).toBe(6);

      // Hạ quái: Càn (hào 1, 2, 3)
      expect(lines[0]?.canChi).toBe('Giáp Tý');
      expect(lines[0]?.element).toBe(Element.THUY);

      expect(lines[1]?.canChi).toBe('Giáp Dần');
      expect(lines[1]?.element).toBe(Element.MOC);

      expect(lines[2]?.canChi).toBe('Giáp Thìn');
      expect(lines[2]?.element).toBe(Element.THO);

      // Thượng quái: Khảm (hào 4, 5, 6)
      expect(lines[3]?.canChi).toBe('Mậu Thân');
      expect(lines[3]?.element).toBe(Element.KIM);

      expect(lines[4]?.canChi).toBe('Mậu Tuất');
      expect(lines[4]?.element).toBe(Element.THO);

      expect(lines[5]?.canChi).toBe('Mậu Tý');
      expect(lines[5]?.element).toBe(Element.THUY);
    });

    it('lập Nạp Giáp đầy đủ cho Quẻ Địa Thiên Thái (Hạ Càn, Thượng Khôn)', () => {
      const lines = getNaJiaForHexagram(TrigramCode.CAN, TrigramCode.KHON);
      expect(lines.length).toBe(6);

      // Hào 1, 2, 3: Càn
      expect(lines[0]?.canChi).toBe('Giáp Tý');
      expect(lines[1]?.canChi).toBe('Giáp Dần');
      expect(lines[2]?.canChi).toBe('Giáp Thìn');

      // Hào 4, 5, 6: Khôn
      expect(lines[3]?.canChi).toBe('Quý Sửu');
      expect(lines[4]?.canChi).toBe('Quý Hợi');
      expect(lines[5]?.canChi).toBe('Quý Dậu');
    });
  });
});
