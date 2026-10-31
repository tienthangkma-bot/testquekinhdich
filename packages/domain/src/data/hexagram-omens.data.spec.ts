import { describe, it, expect } from 'vitest';
import { HEXAGRAM_OMENS, HEXAGRAM_OMEN_MAP, getHexagramOmen } from './hexagram-omens.data';

describe('Hexagram Omens Data (Điềm Triệu 64 Quẻ Cổ Bản)', () => {
  it('chứa đầy đủ 64 quẻ không trùng lặp và đúng số thứ tự Văn Vương (1 đến 64)', () => {
    expect(HEXAGRAM_OMENS.length).toBe(64);
    expect(Object.keys(HEXAGRAM_OMEN_MAP).length).toBe(64);

    const numbers = new Set<number>();
    for (const item of HEXAGRAM_OMENS) {
      expect(item.hexagramNumber).toBeGreaterThanOrEqual(1);
      expect(item.hexagramNumber).toBeLessThanOrEqual(64);
      expect(item.omen.length).toBeGreaterThan(0);
      expect(item.meaning.length).toBeGreaterThan(0);
      numbers.add(item.hexagramNumber);
    }

    expect(numbers.size).toBe(64);
  });

  it('tra cứu chính xác Lời Triệu của các quẻ tiêu biểu', () => {
    // Quẻ 1: Thuần Càn -> Khốn long đắc thủy
    expect(getHexagramOmen(1).omen).toBe('Khốn long đắc thủy');

    // Quẻ 2: Thuần Khôn -> Sinh ngộ thái bình
    expect(getHexagramOmen(2).omen).toBe('Sinh ngộ thái bình');

    // Quẻ 3: Thủy Lôi Truân -> Loạn ty vô đầu
    expect(getHexagramOmen(3).omen).toBe('Loạn ty vô đầu');

    // Quẻ 23: Sơn Địa Bác -> Ưng thước đồng sào
    expect(getHexagramOmen(23).omen).toBe('Ưng thước đồng sào');

    // Quẻ 60: Thủy Trạch Tiết -> Trảm tướng phong thần
    expect(getHexagramOmen(60).omen).toBe('Trảm tướng phong thần');

    // Quẻ không hợp lệ trả về giá trị an toàn
    expect(getHexagramOmen(999).omen).toBe('Chưa xác định');
  });
});
