/**
 * GOLDEN TEST SUITE - CORE ENGINE
 * Kiểm chứng tính đúng đắn và bất biến của toàn bộ thuật toán Kinh Dịch
 * đối chiếu với Golden Dataset cổ điển.
 */

import { describe, it, expect } from 'vitest';
import {
  GOLDEN_TEST_CASES,
} from './golden-dataset';
import { castBySerial } from '../serial/serial.casting';
import { castByMaiHua } from '../mai-hua/mai-hua.casting';
import { orchestrateSixYaoAnalysis } from '../six-yao/six-yao.orchestrator';
import { calculateVoidBranches } from '../calendar-analysis/calendar-analysis.engine';
import { getFullCalendarInfo } from '@kindich/calendar';
import {
  getHexagramById,
  getHexagramBaGong,
  ELEMENT_NAME_MAP,
} from '@kindich/domain';

describe('Golden Test Suite - Core Engine Classical Validation', () => {
  // =========================================================================
  // 1. Kiểm chứng SERIAL-MOD8-V1
  // =========================================================================
  describe('1. Thuật toán Lập Quẻ Seri Tiền (SERIAL-MOD8-V1)', () => {
    const serialCases = GOLDEN_TEST_CASES.filter((c) => c.algorithm === 'SERIAL-MOD8-V1');

    serialCases.forEach((tc) => {
      it(`[${tc.id}] ${tc.name}: khớp 100% chuẩn cổ điển`, () => {
        expect(tc.input.serial).toBeDefined();
        const result = castBySerial(tc.input.serial!);

        expect(result.algorithmVersion).toBe('SERIAL-MOD8-V1');
        expect(result.trio.primary.number).toBe(tc.expected.primaryHexagramNumber);
        expect(result.trio.primary.name).toBe(tc.expected.primaryHexagramName);
        expect(result.upperTrigram.name).toBe(tc.expected.upperTrigramName);
        expect(result.lowerTrigram.name).toBe(tc.expected.lowerTrigramName);
        expect(result.movingLine).toBe(tc.expected.movingYao);
        expect(result.trio.transformed.number).toBe(tc.expected.transformedHexagramNumber);
        expect(result.trio.transformed.name).toBe(tc.expected.transformedHexagramName);
        expect(result.trio.nuclear.number).toBe(tc.expected.nuclearHexagramNumber);
        expect(result.trio.nuclear.name).toBe(tc.expected.nuclearHexagramName);
      });
    });
  });

  // =========================================================================
  // 2. Kiểm chứng Mai Hoa Dịch Số (MAI-HUA-V1)
  // =========================================================================
  describe('2. Thuật toán Mai Hoa Dịch Số (MAI-HUA-V1)', () => {
    const maiHuaCases = GOLDEN_TEST_CASES.filter((c) => c.algorithm === 'MAI-HUA-V1');

    maiHuaCases.forEach((tc) => {
      it(`[${tc.id}] ${tc.name}: khớp điển tích Thiệu Khang Tiết & Thể Dụng`, () => {
        expect(tc.input.maiHuaInput).toBeDefined();
        const result = castByMaiHua(tc.input.maiHuaInput!);

        expect(result.algorithmVersion).toBe('MAI-HUA-V1');
        expect(result.trio.primary.number).toBe(tc.expected.primaryHexagramNumber);
        expect(result.trio.primary.name).toBe(tc.expected.primaryHexagramName);
        expect(result.trio.transformed.number).toBe(tc.expected.transformedHexagramNumber);
        expect(result.trio.transformed.name).toBe(tc.expected.transformedHexagramName);
        expect(result.trio.nuclear.number).toBe(tc.expected.nuclearHexagramNumber);
        expect(result.trio.nuclear.name).toBe(tc.expected.nuclearHexagramName);
        expect(result.movingLine).toBe(tc.expected.movingYao);

        if (tc.expected.theTrigramName) {
          expect(result.theDung.theTrigram.name).toBe(tc.expected.theTrigramName);
        }
        if (tc.expected.dungTrigramName) {
          expect(result.theDung.dungTrigram.name).toBe(tc.expected.dungTrigramName);
        }
      });
    });
  });

  // =========================================================================
  // 3. Bát Cung & Thế Ứng
  // =========================================================================
  describe('3. Bát Cung & Vị Trí Thế Ứng Chuẩn Cổ Pháp', () => {
    GOLDEN_TEST_CASES.forEach((tc) => {
      it(`[${tc.id}] ${tc.name}: Cung ${tc.expected.palaceName}, Thế hào ${tc.expected.worldLine}, Ứng hào ${tc.expected.responseLine}`, () => {
        const bagong = getHexagramBaGong(tc.expected.primaryHexagramNumber);
        expect(bagong.palaceName).toBe(tc.expected.palaceName);
        expect(ELEMENT_NAME_MAP[bagong.palaceElement]).toBe(tc.expected.palaceElement);
        expect(bagong.worldLine).toBe(tc.expected.worldLine);
        expect(bagong.responseLine).toBe(tc.expected.responseLine);
      });
    });
  });

  // =========================================================================
  // 4. Kiểm chứng Nạp Giáp, Lục Thân, Lục Thú (Six Yao Orchestrator)
  // =========================================================================
  describe('4. Nạp Giáp, Lục Thân, Lục Thú (Six Yao Orchestrator)', () => {
    const sixYaoCases = GOLDEN_TEST_CASES.filter((tc) => tc.expected.lines && tc.expected.lines.length === 6);

    sixYaoCases.forEach((tc) => {
      it(`[${tc.id}] ${tc.name}: Nạp Giáp 6 hào và Lục Thân khớp 100% cổ thư`, () => {
        const primaryHex = getHexagramById(tc.expected.primaryHexagramNumber);
        expect(primaryHex).toBeDefined();

        const analysis = orchestrateSixYaoAnalysis({
          primaryHexagram: primaryHex!,
          movingLineIndices: [tc.expected.movingYao as any],
          dateTime: {
            dayCanChi: tc.input.dayCanChi || 'Giáp Tý',
            monthCanChi: tc.input.monthCanChi || 'Bính Tý',
          } as any,
        });

        expect(analysis.primaryHexagram.hexagramNumber).toBe(tc.expected.primaryHexagramNumber);
        expect(analysis.primaryHexagram.palace.name).toBe(tc.expected.palaceName);
        expect(analysis.primaryHexagram.palace.worldLine).toBe(tc.expected.worldLine);
        expect(analysis.primaryHexagram.palace.responseLine).toBe(tc.expected.responseLine);

        // Kiểm tra từng hào trong 6 hào
        tc.expected.lines!.forEach((expectedLine) => {
          const actualLine = analysis.primaryHexagram.lines.find((l) => l.position === expectedLine.position);
          expect(actualLine).toBeDefined();
          expect(actualLine!.canChi).toBe(expectedLine.stemBranch);
          expect(actualLine!.branch).toBe(expectedLine.branch);
          expect(actualLine!.elementName).toBe(expectedLine.element);
          expect(actualLine!.sixRelationName).toBe(expectedLine.sixRelation);

          if (expectedLine.sixSpirit) {
            expect(actualLine!.sixSpiritName).toBe(expectedLine.sixSpirit);
          }
        });
      });
    });
  });

  // =========================================================================
  // 5. Kiểm chứng Thiên Văn Nông Lịch (Can Chi, Tiết Khí, Tuần Không)
  // =========================================================================
  describe('5. Thiên Văn Nông Lịch Việt Nam (Can Chi, Tiết Khí, Tuần Không)', () => {
    const calendarCase = GOLDEN_TEST_CASES.find((tc) => tc.id === 'GOLDEN-07-LUNAR-CAN-CHI');

    it(`[${calendarCase!.id}] Khớp chính xác 4 trụ Can Chi, Lập Xuân và Tuần Không`, () => {
      const calInfo = getFullCalendarInfo(calendarCase!.input.dateTime!);
      expect(calInfo.canChi.year).toBe(calendarCase!.expected.canChi!.year);
      expect(calInfo.canChi.month).toBe(calendarCase!.expected.canChi!.month);
      expect(calInfo.canChi.day).toBe(calendarCase!.expected.canChi!.day);
      expect(calInfo.canChi.hour).toBe(calendarCase!.expected.canChi!.hour);
      expect(calInfo.solarTerm?.name.toLowerCase()).toContain(calendarCase!.expected.solarTerm!.toLowerCase());
      
      const [stem, branch] = calInfo.canChi.day.split(' ');
      const voidResult = calculateVoidBranches(stem!, branch!);
      expect(voidResult.voidBranches).toEqual(calendarCase!.expected.voidBranches);
    });
  });

  // =========================================================================
  // 6. Kiểm chứng Tính Xác Định Tuyệt Đối (Determinism)
  // =========================================================================
  describe('6. Tính Xác Định Tuyệt Đối (Determinism - 100 lần lặp)', () => {
    it('Chạy 100 lần lập quẻ liên tục trả về kết quả cấu trúc bitwise đồng nhất 100%', () => {
      const baseResult = castBySerial('6824');
      for (let i = 0; i < 100; i++) {
        const iterResult = castBySerial('6824');
        expect(iterResult.trio.primary.number).toBe(baseResult.trio.primary.number);
        expect(iterResult.trio.transformed.number).toBe(baseResult.trio.transformed.number);
        expect(iterResult.trio.nuclear.number).toBe(baseResult.trio.nuclear.number);
        expect(iterResult.movingLine).toBe(baseResult.movingLine);
      }
    });
  });
});
