import { describe, it, expect } from 'vitest';
import { getHexagramById, HexagramTrio } from '@kindich/domain';
import { castByMaiHua } from '../mai-hua/mai-hua.casting';
import { orchestrateSixYaoAnalysis } from '../six-yao/six-yao.orchestrator';
import {
  determineDivinationRuleByMovingLines,
  interpretHexagram,
} from './interpretation.orchestrator';
import {
  InterpretationContentType,
  INTERPRETATION_ENGINE_VERSION,
} from './interpretation.types';

describe('Interpretation Engine Orchestrator (Tổng hợp Diễn Giải Toàn Diện)', () => {
  const hex1 = getHexagramById(1)!; // Thuần Càn
  const hex44 = getHexagramById(44)!; // Thiên Phong Cấu
  const hex5 = getHexagramById(5)!; // Thủy Thiên Nhu (chưa có nguyên văn kiểm chứng)

  const sampleTrio1Line: HexagramTrio = {
    primary: hex1,
    transformed: hex44,
    nuclear: hex1,
    movingLineIndices: [1],
    hasMovingLines: true,
  };

  const sampleTrioStatic: HexagramTrio = {
    primary: hex1,
    transformed: hex1,
    nuclear: hex1,
    movingLineIndices: [],
    hasMovingLines: false,
  };

  describe('Quy tắc chiêm đoán hào động Chu Hi (Dịch Học Khải Mông)', () => {
    it('xác định chính xác quy tắc cho các trường hợp từ 0 đến 6 hào động', () => {
      // 0 hào động
      const rule0 = determineDivinationRuleByMovingLines(0, 1);
      expect(rule0.rule).toContain('Quẻ Tĩnh (0 hào động): Lấy Thoán từ của Quẻ Chủ');

      // 1 hào động
      const rule1 = determineDivinationRuleByMovingLines(1, 1);
      expect(rule1.rule).toContain('Có 1 hào động: Lấy Hào từ của chính hào động quẻ Chủ');

      // 2 hào động
      const rule2 = determineDivinationRuleByMovingLines(2, 1);
      expect(rule2.rule).toContain('Có 2 hào động: Lấy Hào từ của cả 2 hào động');

      // 3 hào động
      const rule3 = determineDivinationRuleByMovingLines(3, 1);
      expect(rule3.rule).toContain('Có 3 hào động: Lấy Thoán từ của Quẻ Chủ và Quẻ Biến');

      // 4 hào động
      const rule4 = determineDivinationRuleByMovingLines(4, 1);
      expect(rule4.rule).toContain('Có 4 hào động: Lấy 2 hào TĨNH của Quẻ Biến');

      // 5 hào động
      const rule5 = determineDivinationRuleByMovingLines(5, 1);
      expect(rule5.rule).toContain('Có 5 hào động: Lấy 1 hào TĨNH duy nhất của Quẻ Biến');

      // 6 hào động trên quẻ Càn (Dụng Cửu)
      const rule6Can = determineDivinationRuleByMovingLines(6, 1);
      expect(rule6Can.rule).toContain('Dụng Cửu');

      // 6 hào động trên quẻ Khôn (Dụng Lục)
      const rule6Khon = determineDivinationRuleByMovingLines(6, 2);
      expect(rule6Khon.rule).toContain('Dụng Lục');
    });
  });

  describe('Phân loại bản chất nội dung & Nguồn trích dẫn (Requirement 4 & 5)', () => {
    it('diễn giải chính xác trường hợp Quẻ Tĩnh (0 hào động)', () => {
      const result = interpretHexagram({ trio: sampleTrioStatic });
      expect(result.hexagramTransformation.content.isStatic).toBe(true);
      expect(result.hexagramTransformation.content.divinationMethodRule).toContain(
        'Quẻ Tĩnh (0 hào động)'
      );
      expect(result.movingLinesClassical).toHaveLength(0);
    });

    it('phân biệt rạch ròi giữa nguyên văn cổ điển, giải thích hiện đại và quy tắc tính toán', () => {
      const result = interpretHexagram({ trio: sampleTrio1Line });

      expect(result.engineVersion).toBe(INTERPRETATION_ENGINE_VERSION);

      // 1. Khối nguyên văn cổ điển (CLASSICAL_ORIGINAL)
      expect(result.primaryClassical.contentType).toBe(
        InterpretationContentType.CLASSICAL_ORIGINAL
      );
      expect(result.primaryClassical.source).toContain('Chu Dịch Thập Dực');
      expect(result.primaryClassical.hasVerifiedContent).toBe(true);

      // 2. Khối lời hào động (CLASSICAL_ORIGINAL)
      expect(result.movingLinesClassical).toHaveLength(1);
      expect(result.movingLinesClassical[0]?.contentType).toBe(
        InterpretationContentType.CLASSICAL_ORIGINAL
      );
      expect(result.movingLinesClassical[0]?.content.lineName).toBe('Sơ Cửu');
      expect(result.movingLinesClassical[0]?.content.haoTu.chinese).toContain('潛龍勿用');

      // 3. Khối giải thích hiện đại (MODERN_EXPLANATION)
      expect(result.hexagramTransformation.contentType).toBe(
        InterpretationContentType.MODERN_EXPLANATION
      );
      expect(result.hexagramTransformation.source).toBe('Dịch Học Khải Mông (Chu Hi)');
    });

    it('báo thiếu dữ liệu minh bạch khi quẻ chưa có văn bản cổ điển kiểm chứng (Requirement 6 & 7)', () => {
      const unverifiedTrio: HexagramTrio = {
        primary: hex5, // Nhu
        transformed: hex5,
        nuclear: hex1,
        movingLineIndices: [],
        hasMovingLines: false,
      };

      const result = interpretHexagram({ trio: unverifiedTrio });

      expect(result.primaryClassical.hasVerifiedContent).toBe(false);
      expect(result.primaryClassical.content).toBeNull();
      expect(result.primaryClassical.notice).toContain('Chưa có dữ liệu nguyên văn cổ điển');
      expect(result.movingLinesClassical).toHaveLength(0);
    });
  });

  describe('Tích hợp Diễn giải Mai Hoa Dịch Số (Requirement 3)', () => {
    it('diễn giải Thể/Dụng khi có kết quả từ Mai Hua Casting Engine', () => {
      // Gieo quẻ Mai Hoa: Năm Tuất (11), Tháng 9, Ngày 15, Giờ Hợi (12)
      const maiHua = castByMaiHua({
        yearBranch: 11,
        month: 9,
        day: 15,
        hourBranch: 12,
      });

      const result = interpretHexagram({
        trio: maiHua.trio,
        maiHuaResult: maiHua,
      });

      expect(result.maiHua).toBeDefined();
      expect(result.maiHua?.contentType).toBe(InterpretationContentType.MODERN_EXPLANATION);
      expect(result.maiHua?.content.tiTrigram).toBeDefined();
      expect(result.maiHua?.content.yongTrigram).toBeDefined();
      expect(result.maiHua?.content.relation).toBeDefined();
      expect(result.maiHua?.content.classicalVerse).toBeDefined();
      expect(result.maiHua?.source).toContain('Mai Hoa Dịch Số');
    });
  });

  describe('Tích hợp Diễn giải Lục Hào (Requirement 3)', () => {
    it('diễn giải Thế/Ứng, Lục Thân, Nhật Nguyệt khi có kết quả Six Yao Analysis', () => {
      const sixYao = orchestrateSixYaoAnalysis({
        primaryHexagram: 1,
        movingLineIndices: [1],
        dateTime: {
          dayCanChi: 'Ất Mão',
          monthCanChi: 'Mậu Tuất',
          yearCanChi: 'Bính Ngọ',
          hourCanChi: 'Đinh Hợi',
        },
      });

      const result = interpretHexagram({
        trio: sampleTrio1Line,
        sixYaoResult: sixYao,
      });

      expect(result.sixYao).toBeDefined();
      expect(result.sixYao?.contentType).toBe(InterpretationContentType.MODERN_EXPLANATION);
      expect(result.sixYao?.content.shiYing).toBeDefined();
      expect(result.sixYao?.content.shiYing.relationName).toBeDefined();
      expect(result.sixYao?.content.relations).toHaveLength(6);
      expect(result.sixYao?.content.officerImpact).toBeDefined();
      expect(result.sixYao?.source).toContain('Bốc Phệ Chính Tông');
    });
  });
});
