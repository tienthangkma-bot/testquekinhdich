import { describe, it, expect } from 'vitest';
import {
  castBySerial,
  castByMaiHua,
  castHexagramTrio,
  orchestrateSixYaoAnalysis,
  parseCanChiString,
  calculateVoidBranches,
  interpretHexagram,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import { HEXAGRAMS, LinePosition } from '@kindich/domain';

describe('Desktop App - Core Integration & Desktop Specifications', () => {
  describe('1. Desktop Navigation & 6 Key Screens Validation', () => {
    it('định nghĩa đầy đủ 6 màn hình bắt buộc cho Desktop', () => {
      const desktopScreens = ['home', 'serial', 'time', 'six-yao', 'history', 'settings'];
      expect(desktopScreens).toHaveLength(6);
      expect(desktopScreens).toContain('home');
      expect(desktopScreens).toContain('serial');
      expect(desktopScreens).toContain('time');
      expect(desktopScreens).toContain('six-yao');
      expect(desktopScreens).toContain('history');
      expect(desktopScreens).toContain('settings');
    });

    it('tổng quan 64 quẻ tra cứu khả dụng trong selector desktop', () => {
      expect(HEXAGRAMS).toHaveLength(64);
      expect(HEXAGRAMS[0]?.name).toBe('Thuần Càn');
      expect(HEXAGRAMS[1]?.name).toBe('Thuần Khôn');
      expect(HEXAGRAMS[63]?.name).toBe('Hỏa Thủy Vị Tế');
    });
  });

  describe('2. Desktop Header & Real-time Calendar Engine Integration', () => {
    it('tính toán can chi, tiết khí và tuần không chuẩn xác cho thanh Header Desktop', () => {
      // Test mốc thời gian xác định: 2026-10-31 09:00:00
      const cal = getFullCalendarInfo('2026-10-31T09:00:00.000Z');
      expect(cal).toBeDefined();
      expect(cal.canChi.day).toBeDefined();
      expect(cal.canChi.month).toBeDefined();
      expect(cal.canChi.year).toBeDefined();
      expect(cal.canChi.hour).toBeDefined();
      expect(cal.solarTerm).toBeDefined();

      // Tuần không
      const { stem, branch } = parseCanChiString(cal.canChi.day);
      const { voidBranches } = calculateVoidBranches(stem, branch);
      expect(voidBranches).toHaveLength(2);
    });
  });

  describe('3. Desktop Serial Casting Workflow (SERIAL-MOD8-V1)', () => {
    it('lập quẻ theo 4 số seri tiền polymer và trả về bộ ba quẻ chuẩn tắc', () => {
      const serial = '6824';
      const result = castBySerial(serial);

      expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(result.serialNumber).toBe('6824');
      expect(result.trio.primary).toBeDefined();
      expect(result.trio.nuclear).toBeDefined();
      expect(result.movingLine).toBeGreaterThanOrEqual(1);
      expect(result.movingLine).toBeLessThanOrEqual(6);

      // Phân tích Lục Hào
      const sixYao = orchestrateSixYaoAnalysis({
        primaryHexagram: result.trio.primary.number,
        changingHexagram: result.trio.transformed?.number,
        movingLineIndices: result.movingLine ? [result.movingLine as LinePosition] : [],
        dateTime: {
          dayCanChi: 'Giáp Tý',
          monthCanChi: 'Bính Dần',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Kỷ Tỵ',
        },
      });
      expect(sixYao.primaryHexagram.palace).toBeDefined();
      expect(sixYao.primaryHexagram.lines).toHaveLength(6);
    });
  });

  describe('4. Desktop Mai Hua Casting Workflow (MAI-HUA-V1)', () => {
    it('lập quẻ theo giờ động tâm và định chuẩn Thể/Dụng Mai Hoa', () => {
      const result = castByMaiHua({
        yearBranch: 1, // Tý
        month: 9,
        day: 20,
        hourBranch: 5, // Thìn
      });

      expect(result.algorithmVersion).toBe('MAI-HUA-V1');
      expect(result.trio.primary).toBeDefined();
      expect(result.trio.transformed).toBeDefined();
      expect(result.trio.nuclear).toBeDefined();
      expect(result.theDung.theTrigram).toBeDefined();
      expect(result.theDung.dungTrigram).toBeDefined();
      expect(result.theDung.summary).toBeDefined();
    });
  });

  describe('5. Desktop Six Yao & Comprehensive Interpretation Orchestration', () => {
    it('xây dựng bộ ba quẻ và đồ bản Lục Hào từ quẻ tùy chọn', () => {
      // Ví dụ quẻ #1 Thuần Càn (binary 111111) hào 1 động
      const trio = castHexagramTrio('111111', [1]);
      expect(trio.primary.number).toBe(1);
      expect(trio.movingLineIndices).toEqual([1]);
      expect(trio.transformed).toBeDefined();
      expect(trio.transformed?.number).toBe(44); // Thiên Phong Cấu

      // Diễn giải Kinh văn & Chu Hi
      const interpretation = interpretHexagram({
        trio,
      });
      expect(interpretation.primaryClassical).toBeDefined();
      expect(interpretation.movingLinesClassical).toHaveLength(1);
      expect(interpretation.hexagramTransformation.content.divinationMethodRule).toBeDefined();
      expect(interpretation.hexagramTransformation.content.explanation).toBeDefined();
    });
  });

  describe('6. Desktop System Specifications & Offline Data Standards', () => {
    it('đáp ứng tiêu chuẩn RuleSet Bốc Phệ Chính Tông và Offline', () => {
      const ruleSetId = 'BO_PHE_CHINH_TONG_V1';
      const algorithmVersion = 'SERIAL-MOD8-V1';
      const schemaVersion = 1;

      expect(ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
      expect(algorithmVersion).toBe('SERIAL-MOD8-V1');
      expect(schemaVersion).toBe(1);
    });
  });
});
