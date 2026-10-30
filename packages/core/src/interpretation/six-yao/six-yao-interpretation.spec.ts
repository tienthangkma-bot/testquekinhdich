import { describe, it, expect } from 'vitest';
import { orchestrateSixYaoAnalysis } from '../../six-yao/six-yao.orchestrator';
import {
  interpretOfficerImpact,
  interpretShiYing,
  interpretSixRelations,
  interpretSixYao,
} from './six-yao-interpretation';
import {
  SIX_YAO_INTERP_SOURCE,
  SIX_YAO_INTERP_VERSION,
} from './six-yao-interpretation.types';

describe('Six Yao Interpretation Module (Thế/Ứng, Lục Thân, Nhật Nguyệt vượng suy)', () => {
  // Chuẩn bị kết quả phân tích quẻ Thuần Càn (Càn vi Thiên) có hào 1 động
  const analysis = orchestrateSixYaoAnalysis({
    primaryHexagram: 1, // Càn
    movingLineIndices: [1], // Động hào 1
    dateTime: {
      dayCanChi: 'Ất Mão',
      monthCanChi: 'Mậu Tuất',
      yearCanChi: 'Bính Ngọ',
      hourCanChi: 'Đinh Hợi',
    },
  });

  it('diễn giải chính xác quan hệ Thế - Ứng trong Bát Cung', () => {
    const shiYing = interpretShiYing(analysis);

    expect(shiYing.worldLine).toBe(6);
    expect(shiYing.responseLine).toBe(3);
    expect(shiYing.palaceName).toBe('Càn');
    // Càn vi Thiên: Hào 6 (Tuất Thổ) vs Hào 3 (Thìn Thổ) -> Tỷ hòa
    expect(shiYing.relation).toBe('TY_HOA');
    expect(shiYing.relationName).toContain('Tỷ Hòa');
    expect(shiYing.classicalReference).toContain('Bốc Phệ Chính Tông');
    expect(shiYing.classicalReference).toContain('Thế vi kỷ, Ứng vi nhân');
  });

  it('diễn giải vai trò của Lục Thân cho đủ cả 6 hào', () => {
    const relations = interpretSixRelations(analysis);

    expect(relations).toHaveLength(6);
    // Hào 1 là hào động
    expect(relations[0]?.position).toBe(1);
    expect(relations[0]?.lineRoleDescription).toContain('Là Hào Động');
    expect(relations[0]?.generalSignificance).toBeDefined();

    // Hào 6 là hào Thế
    expect(relations[5]?.position).toBe(6);
    expect(relations[5]?.lineRoleDescription).toContain('Là Hào Thế');

    // Hào 3 là hào Ứng
    expect(relations[2]?.position).toBe(3);
    expect(relations[2]?.lineRoleDescription).toContain('Là Hào Ứng');
  });

  it('diễn giải tác động của Nhật Thần, Nguyệt Kiến, Tuần Không và Nguyệt Phá', () => {
    const officer = interpretOfficerImpact(analysis);

    expect(officer.dayBranch).toContain('Ất Mão');
    expect(officer.monthBranch).toContain('Mậu Tuất');
    expect(officer.voidBranches).toBeDefined();
    expect(officer.worldLineAnalysis).toBeDefined();
    expect(officer.worldLineAnalysis.explanation).toContain('Hào Thế');
    expect(officer.movingLinesAnalysis).toHaveLength(1);
    expect(officer.movingLinesAnalysis[0]?.position).toBe(1);
    expect(officer.classicalReference).toContain('Tăng San Bốc Dịch');
  });

  it('tổng hợp toàn diện đầy đủ nguồn tham khảo và phiên bản dữ liệu (Requirement 4)', () => {
    const fullInterp = interpretSixYao(analysis);

    expect(fullInterp.source).toBe(SIX_YAO_INTERP_SOURCE);
    expect(fullInterp.version).toBe(SIX_YAO_INTERP_VERSION);
    expect(fullInterp.shiYing).toBeDefined();
    expect(fullInterp.relations).toHaveLength(6);
    expect(fullInterp.officerImpact).toBeDefined();
  });
});
