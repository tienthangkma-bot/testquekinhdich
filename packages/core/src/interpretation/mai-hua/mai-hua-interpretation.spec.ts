import { describe, it, expect } from 'vitest';
import {
  TRIGRAM_CAN,
  TRIGRAM_CAN_SON,
  TRIGRAM_CHAN,
  TRIGRAM_DOAI,
  TRIGRAM_KHAM,
  TRIGRAM_LY,
} from '@kindich/domain';
import { interpretTiYong } from './mai-hua-interpretation';
import {
  MAI_HUA_INTERP_SOURCE,
  MAI_HUA_INTERP_VERSION,
  TiYongRelation,
} from './mai-hua-interpretation.types';

describe('Mai Hua Ti / Yong Interpretation Module (Thể / Dụng Mai Hoa)', () => {
  it('xác định chính xác quan hệ Dụng Sinh Thể (Đại Cát)', () => {
    // Thể = Càn (Kim), Dụng = Cấn (Thổ) -> Thổ sinh Kim (Sinh nhập)
    const result = interpretTiYong(TRIGRAM_CAN, TRIGRAM_CAN_SON);

    expect(result.relation).toBe(TiYongRelation.DUNG_SINH_THE);
    expect(result.judgmentLevel).toBe('DAI_CAT');
    expect(result.judgmentLevelName).toContain('Đại Cát');
    expect(result.classicalVerse).toContain('Dụng sinh Thể vi chi sinh nhập');
    expect(result.explanation).toContain('tương sinh cho Thể quái Càn');
    expect(result.source).toBe(MAI_HUA_INTERP_SOURCE);
    expect(result.version).toBe(MAI_HUA_INTERP_VERSION);
  });

  it('xác định chính xác quan hệ Thể Sinh Dụng (Hao tổn / Tiết khí)', () => {
    // Thể = Càn (Kim), Dụng = Khảm (Thủy) -> Kim sinh Thủy (Sinh xuất)
    const result = interpretTiYong(TRIGRAM_CAN, TRIGRAM_KHAM);

    expect(result.relation).toBe(TiYongRelation.THE_SINH_DUNG);
    expect(result.judgmentLevel).toBe('HAU_TON');
    expect(result.judgmentLevelName).toContain('Hao tổn');
    expect(result.classicalVerse).toContain('Thể sinh Dụng vi chi sinh xuất');
    expect(result.advice).toContain('tránh ôm đồm việc vượt quá khả năng');
  });

  it('xác định chính xác quan hệ Thể Khắc Dụng (Việc thành nhưng vất vả)', () => {
    // Thể = Càn (Kim), Dụng = Chấn (Mộc) -> Kim khắc Mộc (Khắc xuất)
    const result = interpretTiYong(TRIGRAM_CAN, TRIGRAM_CHAN);

    expect(result.relation).toBe(TiYongRelation.THE_KHAC_DUNG);
    expect(result.judgmentLevel).toBe('BINH_HOA');
    expect(result.classicalVerse).toContain('Thể khắc Dụng vi chi khắc xuất');
    expect(result.explanation).toContain('khắc chế Dụng quái Chấn');
  });

  it('xác định chính xác quan hệ Dụng Khắc Thể (Đại Hung / Bất lợi lớn)', () => {
    // Thể = Càn (Kim), Dụng = Ly (Hỏa) -> Hỏa khắc Kim (Khắc nhập)
    const result = interpretTiYong(TRIGRAM_CAN, TRIGRAM_LY);

    expect(result.relation).toBe(TiYongRelation.DUNG_KHAC_THE);
    expect(result.judgmentLevel).toBe('DAI_HUNG');
    expect(result.judgmentLevelName).toContain('Đại Hung');
    expect(result.classicalVerse).toContain('Dụng khắc Thể vi chi khắc nhập');
    expect(result.advice).toContain('tạm thời dừng lại phòng thủ');
  });

  it('xác định chính xác quan hệ Thể Dụng Tỷ Hòa (Đồng hành / Cát lành)', () => {
    // Thể = Càn (Kim), Dụng = Đoài (Kim) -> Tỷ hòa
    const result = interpretTiYong(TRIGRAM_CAN, TRIGRAM_DOAI);

    expect(result.relation).toBe(TiYongRelation.TY_HOA);
    expect(result.judgmentLevel).toBe('CAT');
    expect(result.classicalVerse).toContain('Thể Dụng tỷ hòa, bách sự như ý');
    expect(result.explanation).toContain('đồng hành ngũ hành');
  });
});
