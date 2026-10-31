import { describe, it, expect } from 'vitest';
import { Element } from '@kindich/domain';
import {
  calculateLifeStage,
  calculateAuxiliaryDeities,
  calculateHexagramPhucThan,
  createSupplementaryLineData,
} from './auxiliary.engine';

describe('Auxiliary Analysis Engine (Phục Thần, Trường Sinh & Thần Sát)', () => {
  describe('calculateHexagramPhucThan', () => {
    it('xác định chính xác Phục Thần cho quẻ Thủy Lôi Truân (#3)', () => {
      // Quẻ Thủy Lôi Truân (#3) thuộc Cung Khảm
      // Các Lục Thân có trong quẻ: Huynh Đệ, Quan Quỷ, Phụ Mẫu, Tử Tôn
      // Thiếu Thê Tài (Hỏa).
      // Trong Quẻ Bát Thuần Khảm (#29), hào 3 là Mậu Ngọ (Thê Tài).
      const phucThanMap = calculateHexagramPhucThan(3);

      expect(phucThanMap[3].hasPhucThan).toBe(true);
      expect(phucThanMap[3].shortLabel).toBe('Tài-Ngọ');
      expect(phucThanMap[3].branch).toBe('Ngọ');

      // Các hào khác không có phục thần thiếu
      expect(phucThanMap[1].hasPhucThan).toBe(false);
      expect(phucThanMap[2].hasPhucThan).toBe(false);
      expect(phucThanMap[4].hasPhucThan).toBe(false);
      expect(phucThanMap[5].hasPhucThan).toBe(false);
      expect(phucThanMap[6].hasPhucThan).toBe(false);
    });

    it('quẻ Bát Thuần Càn (#1) có đủ 5 Lục Thân nên không có Phục Thần', () => {
      const phucThanMap = calculateHexagramPhucThan(1);
      for (let i = 1; i <= 6; i++) {
        expect(phucThanMap[i as 1 | 2 | 3 | 4 | 5 | 6].hasPhucThan).toBe(false);
      }
    });
  });

  describe('calculateLifeStage (12 Vận Trường Sinh)', () => {
    it('tính chính xác 12 Trường Sinh đối với ngày Dần và tháng Tuất (như trong ảnh mẫu)', () => {
      // Ngày Dần:
      expect(calculateLifeStage(Element.THUY, 'Dần').shortName).toBe('Bệnh');
      expect(calculateLifeStage(Element.THO, 'Dần').shortName).toBe('Bệnh');
      expect(calculateLifeStage(Element.KIM, 'Dần').shortName).toBe('Tuyệt');
      expect(calculateLifeStage(Element.MOC, 'Dần').shortName).toBe('L.Quan');
      expect(calculateLifeStage(Element.HOA, 'Dần').shortName).toBe('T.Sinh');

      // Tháng Tuất:
      expect(calculateLifeStage(Element.THUY, 'Tuất').shortName).toBe('Q.Đới');
      expect(calculateLifeStage(Element.THO, 'Tuất').shortName).toBe('Q.Đới');
      expect(calculateLifeStage(Element.KIM, 'Tuất').shortName).toBe('Suy');
      expect(calculateLifeStage(Element.MOC, 'Tuất').shortName).toBe('Dưỡng');
      expect(calculateLifeStage(Element.HOA, 'Tuất').shortName).toBe('Mộ');
    });
  });

  describe('calculateAuxiliaryDeities (Thần Sát: Lộc, Mã, Đào)', () => {
    it('tính chính xác Lộc, Dịch Mã, Đào Hoa cho ngày Mậu Dần', () => {
      // Can Mậu -> Lộc tại Tỵ
      // Chi Dần -> Dịch Mã tại Thân, Đào Hoa tại Mão
      const tyDeities = calculateAuxiliaryDeities('Mậu', 'Dần', 'Tỵ');
      expect(tyDeities.isLoc).toBe(true);
      expect(tyDeities.locLabel).toBe('L');
      expect(tyDeities.isMa).toBe(false);
      expect(tyDeities.isDao).toBe(false);

      const thanDeities = calculateAuxiliaryDeities('Mậu', 'Dần', 'Thân');
      expect(thanDeities.isLoc).toBe(false);
      expect(thanDeities.isMa).toBe(true);
      expect(thanDeities.maLabel).toBe('M');
      expect(thanDeities.isDao).toBe(false);

      const maoDeities = calculateAuxiliaryDeities('Mậu', 'Dần', 'Mão');
      expect(maoDeities.isLoc).toBe(false);
      expect(maoDeities.isMa).toBe(false);
      expect(maoDeities.isDao).toBe(true);
      expect(maoDeities.daoLabel).toBe('Đ');
    });
  });

  describe('createSupplementaryLineData', () => {
    it('tổng hợp đầy đủ thông tin bổ trợ cho 1 hào', () => {
      const lineData = createSupplementaryLineData({
        position: 4,
        canChi: 'Mậu Thân',
        stem: 'Mậu',
        branch: 'Thân',
        element: Element.KIM,
        elementName: 'Kim',
        isMoving: false,
        dayStem: 'Mậu',
        dayBranch: 'Dần',
        monthBranch: 'Tuất',
        isVoid: true,
      });

      expect(lineData.position).toBe(4);
      expect(lineData.dayLifeStage.shortName).toBe('Tuyệt');
      expect(lineData.monthLifeStage.shortName).toBe('Suy');
      expect(lineData.deities.isMa).toBe(true);
      expect(lineData.deities.maLabel).toBe('M');
      expect(lineData.isVoid).toBe(true);
    });
  });
});
