/**
 * GOLDEN PARITY TEST SUITE - DESKTOP APPLICATION
 * Kiểm chứng tính nhất quán 100% của Core Engine trên nền tảng Desktop (Tauri 2 + React 19).
 */

import { describe, it, expect } from 'vitest';
import {
  GOLDEN_TEST_CASES,
  castBySerial,
  castByMaiHua,
  orchestrateSixYaoAnalysis,
  calculateVoidBranches,
} from '@kindich/core';
import { getFullCalendarInfo } from '@kindich/calendar';
import {
  getHexagramById,
  getHexagramBaGong,
  ELEMENT_NAME_MAP,
} from '@kindich/domain';

describe('Golden Parity Test Suite - Desktop Platform Execution', () => {
  it('Khớp 100% toàn bộ Golden Cases trên Desktop Platform', () => {
    GOLDEN_TEST_CASES.forEach((tc) => {
      // 1. Bát Cung & Thế Ứng
      const bagong = getHexagramBaGong(tc.expected.primaryHexagramNumber);
      expect(bagong.palaceName).toBe(tc.expected.palaceName);
      expect(ELEMENT_NAME_MAP[bagong.palaceElement]).toBe(tc.expected.palaceElement);
      expect(bagong.worldLine).toBe(tc.expected.worldLine);
      expect(bagong.responseLine).toBe(tc.expected.responseLine);

      // 2. Thuật toán lập quẻ
      if (tc.algorithm === 'SERIAL-MOD8-V1') {
        const result = castBySerial(tc.input.serial!);
        expect(result.trio.primary.number).toBe(tc.expected.primaryHexagramNumber);
        expect(result.trio.transformed.number).toBe(tc.expected.transformedHexagramNumber);
        expect(result.trio.nuclear.number).toBe(tc.expected.nuclearHexagramNumber);
        expect(result.movingLine).toBe(tc.expected.movingYao);
      } else if (tc.algorithm === 'MAI-HUA-V1') {
        const result = castByMaiHua(tc.input.maiHuaInput!);
        expect(result.trio.primary.number).toBe(tc.expected.primaryHexagramNumber);
        expect(result.trio.transformed.number).toBe(tc.expected.transformedHexagramNumber);
        expect(result.trio.nuclear.number).toBe(tc.expected.nuclearHexagramNumber);
        expect(result.movingLine).toBe(tc.expected.movingYao);
      } else if (tc.algorithm === 'VN-LUNAR-V1') {
        const calInfo = getFullCalendarInfo(tc.input.dateTime!);
        expect(calInfo.canChi.year).toBe(tc.expected.canChi!.year);
        expect(calInfo.canChi.month).toBe(tc.expected.canChi!.month);
        expect(calInfo.canChi.day).toBe(tc.expected.canChi!.day);
        const [stem, branch] = calInfo.canChi.day.split(' ');
        const voidRes = calculateVoidBranches(stem!, branch!);
        expect(voidRes.voidBranches).toEqual(tc.expected.voidBranches);
      }

      // 3. Nạp Giáp, Lục Thân, Lục Thú
      if (tc.expected.lines) {
        const primaryHex = getHexagramById(tc.expected.primaryHexagramNumber);
        const analysis = orchestrateSixYaoAnalysis({
          primaryHexagram: primaryHex!,
          movingLineIndices: [tc.expected.movingYao as any],
          dateTime: {
            dayCanChi: tc.input.dayCanChi || 'Giáp Tý',
            monthCanChi: tc.input.monthCanChi || 'Bính Tý',
          } as any,
        });

        tc.expected.lines.forEach((expLine) => {
          const actualLine = analysis.primaryHexagram.lines.find((l) => l.position === expLine.position);
          expect(actualLine).toBeDefined();
          expect(actualLine!.canChi).toBe(expLine.stemBranch);
          expect(actualLine!.sixRelationName).toBe(expLine.sixRelation);
          if (expLine.sixSpirit) {
            expect(actualLine!.sixSpiritName).toBe(expLine.sixSpirit);
          }
        });
      }
    });
  });
});
