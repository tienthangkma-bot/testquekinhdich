import { describe, it, expect } from 'vitest';
import { getClassicalHexagramData, VERIFIED_CLASSICAL_HEXAGRAMS } from './classical-texts.data';
import { CLASSICAL_TEXT_VERSION, CLASSICAL_SOURCES } from './classical-texts.types';

describe('Classical Texts Module (Thoán từ, Đại Tượng, Tiểu Tượng, Hào từ)', () => {
  it('cung cấp đầy đủ Thoán từ, Đại Tượng, 6 Hào từ, 6 Tiểu Tượng và Dụng Cửu cho Quẻ Càn (1)', () => {
    const result = getClassicalHexagramData(1);
    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') return;

    const data = result.data;
    expect(data.hexagramNumber).toBe(1);
    expect(data.hexagramName).toBe('Thuần Càn');
    expect(data.sinoVietnameseName).toBe('Càn vi Thiên');
    expect(data.chineseName).toBe('乾為天');
    expect(data.version).toBe(CLASSICAL_TEXT_VERSION);
    expect(data.source).toBe(CLASSICAL_SOURCES[0]);

    // 1. Thoán từ
    expect(data.thuanTu.chinese).toBe('乾：元亨利貞。');
    expect(data.thuanTu.sinoVietnamese).toContain('Nguyên, hanh, lợi, trinh');
    expect(data.thuanTu.translation).toBeDefined();
    expect(data.thuanTu.modernExplanation).toBeDefined();

    // 2. Đại Tượng
    expect(data.daiTuong.chinese).toBe('天行健，君子以自強不息。');
    expect(data.daiTuong.sinoVietnamese).toContain('Thiên hành kiện, quân tử dĩ tự cường bất tức');

    // 3. Đủ 6 hào từ và tiểu tượng
    expect(data.lines).toHaveLength(6);
    expect(data.lines[0]?.position).toBe(1);
    expect(data.lines[0]?.lineName).toBe('Sơ Cửu');
    expect(data.lines[0]?.haoTu.chinese).toContain('潛龍勿用');
    expect(data.lines[0]?.haoTu.sinoVietnamese).toContain('Tiềm long vật dụng');
    expect(data.lines[0]?.tieuTuong?.chinese).toContain('潛龍勿用，陽在下也');

    expect(data.lines[1]?.position).toBe(2);
    expect(data.lines[1]?.lineName).toBe('Cửu Nhị');
    expect(data.lines[1]?.haoTu.chinese).toContain('見龍在田');

    expect(data.lines[4]?.position).toBe(5);
    expect(data.lines[4]?.lineName).toBe('Cửu Ngũ');
    expect(data.lines[4]?.haoTu.chinese).toContain('飛龍在天');

    expect(data.lines[5]?.position).toBe(6);
    expect(data.lines[5]?.lineName).toBe('Thượng Cửu');
    expect(data.lines[5]?.haoTu.chinese).toContain('亢龍有悔');

    // 4. Dụng Cửu
    expect(data.specialLine).toBeDefined();
    expect(data.specialLine?.chinese).toContain('用九：見群龍無首，吉');
  });

  it('cung cấp đầy đủ Thoán từ, Đại Tượng, 6 Hào từ và Dụng Lục cho Quẻ Khôn (2)', () => {
    const result = getClassicalHexagramData(2);
    expect(result.status).toBe('AVAILABLE');
    if (result.status !== 'AVAILABLE') return;

    const data = result.data;
    expect(data.hexagramNumber).toBe(2);
    expect(data.hexagramName).toBe('Thuần Khôn');
    expect(data.thuanTu.chinese).toContain('坤：元亨，利牝馬之貞');
    expect(data.daiTuong.chinese).toContain('地勢坤，君子以厚德載物');
    expect(data.lines).toHaveLength(6);
    expect(data.lines[0]?.lineName).toBe('Sơ Lục');
    expect(data.lines[0]?.haoTu.chinese).toContain('履霜，堅冰至');
    expect(data.specialLine?.chinese).toContain('用六：利永貞');
  });

  it('cung cấp văn bản chuẩn tắc cho các quẻ trọng yếu: Thái (11), Bĩ (12), Cấu (44), Ký Tế (63), Vị Tế (64)', () => {
    const numbers = [11, 12, 44, 63, 64];
    for (const num of numbers) {
      const res = getClassicalHexagramData(num);
      expect(res.status).toBe('AVAILABLE');
      if (res.status === 'AVAILABLE') {
        expect(res.data.thuanTu.chinese).toBeDefined();
        expect(res.data.daiTuong.chinese).toBeDefined();
        expect(res.data.source).toBeDefined();
        expect(res.data.version).toBe(CLASSICAL_TEXT_VERSION);
      }
    }
  });

  it('xử lý minh bạch khi thiếu dữ liệu nguyên văn cổ điển, không tự bịa đặt (Requirement 6 & 7)', () => {
    // Quẻ số 5 (Thuỷ Thiên Nhu) chưa được nạp dữ liệu nguyên văn đã đối chiếu
    const unverifiedHexNumber = 5;
    expect(VERIFIED_CLASSICAL_HEXAGRAMS[unverifiedHexNumber]).toBeUndefined();

    const result = getClassicalHexagramData(unverifiedHexNumber);
    expect(result.status).toBe('MISSING');
    expect(result.hasVerifiedContent).toBe(false);
    if (result.status === 'MISSING') {
      expect(result.hexagramNumber).toBe(5);
      expect(result.message).toContain(
        'Chưa có dữ liệu nguyên văn cổ điển đã kiểm chứng cho quẻ số 5'
      );
      expect(result.message).toContain(
        'tuân thủ nguyên tắc không tự bịa đặt hoặc gán nguồn không xác thực'
      );
    }
  });
});
