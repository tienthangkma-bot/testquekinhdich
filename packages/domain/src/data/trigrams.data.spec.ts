import { describe, it, expect } from 'vitest';
import {
  EIGHT_TRIGRAMS,
  TRIGRAM_CAN,
  TRIGRAM_DOAI,
  TRIGRAM_LY,
  TRIGRAM_CHAN,
  TRIGRAM_TON,
  TRIGRAM_KHAM,
  TRIGRAM_CAN_SON,
  TRIGRAM_KHON,
  getTrigramById,
  getTrigramByLines,
  getTrigramByEarlyNumber,
} from './trigrams.data';
import { TrigramCode } from '../enums/trigram-name.enum';
import { Element } from '../enums/element.enum';

describe('Bát Quái Data Specification', () => {
  it('phải khai báo đủ chính xác 8 quái', () => {
    expect(EIGHT_TRIGRAMS).toHaveLength(8);
  });

  it('phải đảm bảo tính duy nhất của ID, binary, symbol và số Tiên thiên', () => {
    const ids = new Set(EIGHT_TRIGRAMS.map((t) => t.id));
    const binaries = new Set(EIGHT_TRIGRAMS.map((t) => t.binary));
    const symbols = new Set(EIGHT_TRIGRAMS.map((t) => t.symbol));
    const earlyNums = new Set(EIGHT_TRIGRAMS.map((t) => t.earlyHeavenNumber));

    expect(ids.size).toBe(8);
    expect(binaries.size).toBe(8);
    expect(symbols.size).toBe(8);
    expect(earlyNums.size).toBe(8);
  });

  it('phải có đúng thứ tự mã hóa Tiên Thiên Bát Quái', () => {
    const expectedOrder = [
      { name: 'Càn', binary: '111', lines: [1, 1, 1], early: 1 },
      { name: 'Đoài', binary: '110', lines: [1, 1, 0], early: 2 },
      { name: 'Ly', binary: '101', lines: [1, 0, 1], early: 3 },
      { name: 'Chấn', binary: '100', lines: [1, 0, 0], early: 4 },
      { name: 'Tốn', binary: '011', lines: [0, 1, 1], early: 5 },
      { name: 'Khảm', binary: '010', lines: [0, 1, 0], early: 6 },
      { name: 'Cấn', binary: '001', lines: [0, 0, 1], early: 7 },
      { name: 'Khôn', binary: '000', lines: [0, 0, 0], early: 8 },
    ];

    EIGHT_TRIGRAMS.forEach((trigram, index) => {
      const expected = expectedOrder[index];
      expect(trigram.name).toBe(expected?.name);
      expect(trigram.binary).toBe(expected?.binary);
      expect(trigram.lines).toEqual(expected?.lines);
      expect(trigram.earlyHeavenNumber).toBe(expected?.early);
    });
  });

  describe('Chi tiết thuộc tính từng quái', () => {
    it('Càn: 111, Kim, Trời, ☰', () => {
      expect(TRIGRAM_CAN.id).toBe(TrigramCode.CAN);
      expect(TRIGRAM_CAN.name).toBe('Càn');
      expect(TRIGRAM_CAN.sinoVietnameseName).toBe('Càn');
      expect(TRIGRAM_CAN.chineseName).toBe('乾');
      expect(TRIGRAM_CAN.symbol).toBe('☰');
      expect(TRIGRAM_CAN.element).toBe(Element.KIM);
      expect(TRIGRAM_CAN.lines).toEqual([1, 1, 1]);
      expect(TRIGRAM_CAN.binary).toBe('111');
      expect(TRIGRAM_CAN.earlyHeavenNumber).toBe(1);
      expect(TRIGRAM_CAN.laterHeavenNumber).toBe(6);
    });

    it('Đoài: 110, Kim, Đầm, ☱', () => {
      expect(TRIGRAM_DOAI.id).toBe(TrigramCode.DOAI);
      expect(TRIGRAM_DOAI.name).toBe('Đoài');
      expect(TRIGRAM_DOAI.sinoVietnameseName).toBe('Đoài');
      expect(TRIGRAM_DOAI.chineseName).toBe('兌');
      expect(TRIGRAM_DOAI.symbol).toBe('☱');
      expect(TRIGRAM_DOAI.element).toBe(Element.KIM);
      expect(TRIGRAM_DOAI.lines).toEqual([1, 1, 0]);
      expect(TRIGRAM_DOAI.binary).toBe('110');
      expect(TRIGRAM_DOAI.earlyHeavenNumber).toBe(2);
      expect(TRIGRAM_DOAI.laterHeavenNumber).toBe(7);
    });

    it('Ly: 101, Hỏa, Lửa, ☲', () => {
      expect(TRIGRAM_LY.id).toBe(TrigramCode.LY);
      expect(TRIGRAM_LY.name).toBe('Ly');
      expect(TRIGRAM_LY.sinoVietnameseName).toBe('Ly');
      expect(TRIGRAM_LY.chineseName).toBe('離');
      expect(TRIGRAM_LY.symbol).toBe('☲');
      expect(TRIGRAM_LY.element).toBe(Element.HOA);
      expect(TRIGRAM_LY.lines).toEqual([1, 0, 1]);
      expect(TRIGRAM_LY.binary).toBe('101');
      expect(TRIGRAM_LY.earlyHeavenNumber).toBe(3);
      expect(TRIGRAM_LY.laterHeavenNumber).toBe(9);
    });

    it('Chấn: 100, Mộc, Sấm, ☳', () => {
      expect(TRIGRAM_CHAN.id).toBe(TrigramCode.CHAN);
      expect(TRIGRAM_CHAN.name).toBe('Chấn');
      expect(TRIGRAM_CHAN.sinoVietnameseName).toBe('Chấn');
      expect(TRIGRAM_CHAN.chineseName).toBe('震');
      expect(TRIGRAM_CHAN.symbol).toBe('☳');
      expect(TRIGRAM_CHAN.element).toBe(Element.MOC);
      expect(TRIGRAM_CHAN.lines).toEqual([1, 0, 0]);
      expect(TRIGRAM_CHAN.binary).toBe('100');
      expect(TRIGRAM_CHAN.earlyHeavenNumber).toBe(4);
      expect(TRIGRAM_CHAN.laterHeavenNumber).toBe(3);
    });

    it('Tốn: 011, Mộc, Gió, ☴', () => {
      expect(TRIGRAM_TON.id).toBe(TrigramCode.TON);
      expect(TRIGRAM_TON.name).toBe('Tốn');
      expect(TRIGRAM_TON.sinoVietnameseName).toBe('Tốn');
      expect(TRIGRAM_TON.chineseName).toBe('巽');
      expect(TRIGRAM_TON.symbol).toBe('☴');
      expect(TRIGRAM_TON.element).toBe(Element.MOC);
      expect(TRIGRAM_TON.lines).toEqual([0, 1, 1]);
      expect(TRIGRAM_TON.binary).toBe('011');
      expect(TRIGRAM_TON.earlyHeavenNumber).toBe(5);
      expect(TRIGRAM_TON.laterHeavenNumber).toBe(4);
    });

    it('Khảm: 010, Thủy, Nước, ☵', () => {
      expect(TRIGRAM_KHAM.id).toBe(TrigramCode.KHAM);
      expect(TRIGRAM_KHAM.name).toBe('Khảm');
      expect(TRIGRAM_KHAM.sinoVietnameseName).toBe('Khảm');
      expect(TRIGRAM_KHAM.chineseName).toBe('坎');
      expect(TRIGRAM_KHAM.symbol).toBe('☵');
      expect(TRIGRAM_KHAM.element).toBe(Element.THUY);
      expect(TRIGRAM_KHAM.lines).toEqual([0, 1, 0]);
      expect(TRIGRAM_KHAM.binary).toBe('010');
      expect(TRIGRAM_KHAM.earlyHeavenNumber).toBe(6);
      expect(TRIGRAM_KHAM.laterHeavenNumber).toBe(1);
    });

    it('Cấn: 001, Thổ, Núi, ☶', () => {
      expect(TRIGRAM_CAN_SON.id).toBe(TrigramCode.CAN_SON);
      expect(TRIGRAM_CAN_SON.name).toBe('Cấn');
      expect(TRIGRAM_CAN_SON.sinoVietnameseName).toBe('Cấn');
      expect(TRIGRAM_CAN_SON.chineseName).toBe('艮');
      expect(TRIGRAM_CAN_SON.symbol).toBe('☶');
      expect(TRIGRAM_CAN_SON.element).toBe(Element.THO);
      expect(TRIGRAM_CAN_SON.lines).toEqual([0, 0, 1]);
      expect(TRIGRAM_CAN_SON.binary).toBe('001');
      expect(TRIGRAM_CAN_SON.earlyHeavenNumber).toBe(7);
      expect(TRIGRAM_CAN_SON.laterHeavenNumber).toBe(8);
    });

    it('Khôn: 000, Thổ, Đất, ☷', () => {
      expect(TRIGRAM_KHON.id).toBe(TrigramCode.KHON);
      expect(TRIGRAM_KHON.name).toBe('Khôn');
      expect(TRIGRAM_KHON.sinoVietnameseName).toBe('Khôn');
      expect(TRIGRAM_KHON.chineseName).toBe('坤');
      expect(TRIGRAM_KHON.symbol).toBe('☷');
      expect(TRIGRAM_KHON.element).toBe(Element.THO);
      expect(TRIGRAM_KHON.lines).toEqual([0, 0, 0]);
      expect(TRIGRAM_KHON.binary).toBe('000');
      expect(TRIGRAM_KHON.earlyHeavenNumber).toBe(8);
      expect(TRIGRAM_KHON.laterHeavenNumber).toBe(2);
    });
  });

  describe('Hàm tra cứu: getTrigramById', () => {
    it('tra cứu đúng theo ID enum', () => {
      expect(getTrigramById(TrigramCode.CAN)).toBe(TRIGRAM_CAN);
      expect(getTrigramById(TrigramCode.DOAI)).toBe(TRIGRAM_DOAI);
      expect(getTrigramById(TrigramCode.LY)).toBe(TRIGRAM_LY);
      expect(getTrigramById(TrigramCode.CHAN)).toBe(TRIGRAM_CHAN);
      expect(getTrigramById(TrigramCode.TON)).toBe(TRIGRAM_TON);
      expect(getTrigramById(TrigramCode.KHAM)).toBe(TRIGRAM_KHAM);
      expect(getTrigramById(TrigramCode.CAN_SON)).toBe(TRIGRAM_CAN_SON);
      expect(getTrigramById(TrigramCode.KHON)).toBe(TRIGRAM_KHON);
    });

    it('tra cứu đúng không phân biệt chữ hoa thường', () => {
      expect(getTrigramById('can')).toBe(TRIGRAM_CAN);
      expect(getTrigramById('kHam')).toBe(TRIGRAM_KHAM);
      expect(getTrigramById('can_son')).toBe(TRIGRAM_CAN_SON);
    });

    it('trả về undefined nếu ID không hợp lệ', () => {
      expect(getTrigramById('INVALID')).toBeUndefined();
      expect(getTrigramById('')).toBeUndefined();
    });
  });

  describe('Hàm tra cứu: getTrigramByLines', () => {
    it('tra cứu đúng theo mảng 3 hào [hào 1, hào 2, hào 3] từ dưới lên', () => {
      expect(getTrigramByLines([1, 1, 1])).toBe(TRIGRAM_CAN);
      expect(getTrigramByLines([1, 1, 0])).toBe(TRIGRAM_DOAI);
      expect(getTrigramByLines([1, 0, 1])).toBe(TRIGRAM_LY);
      expect(getTrigramByLines([1, 0, 0])).toBe(TRIGRAM_CHAN);
      expect(getTrigramByLines([0, 1, 1])).toBe(TRIGRAM_TON);
      expect(getTrigramByLines([0, 1, 0])).toBe(TRIGRAM_KHAM);
      expect(getTrigramByLines([0, 0, 1])).toBe(TRIGRAM_CAN_SON);
      expect(getTrigramByLines([0, 0, 0])).toBe(TRIGRAM_KHON);
    });

    it('tra cứu đúng theo chuỗi mã hóa nhị phân ("111", "110", ...)', () => {
      expect(getTrigramByLines('111')).toBe(TRIGRAM_CAN);
      expect(getTrigramByLines('110')).toBe(TRIGRAM_DOAI);
      expect(getTrigramByLines('101')).toBe(TRIGRAM_LY);
      expect(getTrigramByLines('100')).toBe(TRIGRAM_CHAN);
      expect(getTrigramByLines('011')).toBe(TRIGRAM_TON);
      expect(getTrigramByLines('010')).toBe(TRIGRAM_KHAM);
      expect(getTrigramByLines('001')).toBe(TRIGRAM_CAN_SON);
      expect(getTrigramByLines('000')).toBe(TRIGRAM_KHON);
    });

    it('trả về undefined nếu dữ liệu hào không hợp lệ', () => {
      expect(getTrigramByLines('11')).toBeUndefined();
      expect(getTrigramByLines('1111')).toBeUndefined();
      expect(getTrigramByLines([1, 1] as any)).toBeUndefined();
      expect(getTrigramByLines('abc')).toBeUndefined();
    });
  });

  describe('Hàm tra cứu: getTrigramByEarlyNumber', () => {
    it('tra cứu đúng số Tiên Thiên 1 đến 8', () => {
      expect(getTrigramByEarlyNumber(1)).toBe(TRIGRAM_CAN);
      expect(getTrigramByEarlyNumber(2)).toBe(TRIGRAM_DOAI);
      expect(getTrigramByEarlyNumber(3)).toBe(TRIGRAM_LY);
      expect(getTrigramByEarlyNumber(4)).toBe(TRIGRAM_CHAN);
      expect(getTrigramByEarlyNumber(5)).toBe(TRIGRAM_TON);
      expect(getTrigramByEarlyNumber(6)).toBe(TRIGRAM_KHAM);
      expect(getTrigramByEarlyNumber(7)).toBe(TRIGRAM_CAN_SON);
      expect(getTrigramByEarlyNumber(8)).toBe(TRIGRAM_KHON);
    });

    it('trả về undefined nếu số ngoài phạm vi 1 đến 8', () => {
      expect(getTrigramByEarlyNumber(0)).toBeUndefined();
      expect(getTrigramByEarlyNumber(9)).toBeUndefined();
      expect(getTrigramByEarlyNumber(-1)).toBeUndefined();
    });
  });
});
