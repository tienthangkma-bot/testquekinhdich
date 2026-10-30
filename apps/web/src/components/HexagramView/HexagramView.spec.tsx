import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HexagramView } from './HexagramView';
import { getTraditionalLineName } from './line-name.utils';
import { castBySerial } from '@kindich/core';

describe('HexagramView Component', () => {
  const result = castBySerial('123456');
  // result.trio.primary là Quẻ 25 (Thiên Lôi Vô Vọng), hào 3 động
  const primaryHexagram = result.trio.primary;

  it('xác định tên gọi truyền thống của từng hào chính xác (Lục / Cửu)', () => {
    // lines: [0]=hào 1, [1]=hào 2, [2]=hào 3, [3]=hào 4, [4]=hào 5, [5]=hào 6
    // Quẻ 25: 100111 (hào 1=1 Sơ Cửu, hào 2=0 Lục Nhị, hào 3=0 Lục Tam, hào 4=1 Cửu Tứ, hào 5=1 Cửu Ngũ, hào 6=1 Thượng Cửu)
    expect(getTraditionalLineName(primaryHexagram.lines[0]!)).toBe('Sơ Cửu');
    expect(getTraditionalLineName(primaryHexagram.lines[1]!)).toBe('Lục Nhị');
    expect(getTraditionalLineName(primaryHexagram.lines[2]!)).toBe('Lục Tam');
    expect(getTraditionalLineName(primaryHexagram.lines[3]!)).toBe('Cửu Tứ');
    expect(getTraditionalLineName(primaryHexagram.lines[4]!)).toBe('Cửu Ngũ');
    expect(getTraditionalLineName(primaryHexagram.lines[5]!)).toBe('Thượng Cửu');
  });

  it('hiển thị 6 hào theo thứ tự từ TRÊN XUỐNG DƯỚI (Hào 6 ở đầu, Hào 1 ở cuối)', () => {
    const { container } = render(
      <HexagramView hexagram={primaryHexagram} roleLabel="Quẻ Chủ" variant="primary" />
    );

    // Tìm tất cả các hàng hào
    const lineRows = container.querySelectorAll('.hexagram-line-row');
    expect(lineRows.length).toBe(6);

    // Hàng 1 (trên cùng): Hào 6
    expect(lineRows[0]?.textContent).toContain('Hào 6');
    expect(lineRows[0]?.textContent).toContain('Thượng Cửu');

    // Hàng 2: Hào 5
    expect(lineRows[1]?.textContent).toContain('Hào 5');
    expect(lineRows[1]?.textContent).toContain('Cửu Ngũ');

    // Hàng 3: Hào 4
    expect(lineRows[2]?.textContent).toContain('Hào 4');
    expect(lineRows[2]?.textContent).toContain('Cửu Tứ');

    // Hàng 4: Hào 3 (Hào động)
    expect(lineRows[3]?.textContent).toContain('Hào 3');
    expect(lineRows[3]?.textContent).toContain('Lục Tam');
    expect(lineRows[3]?.textContent).toContain('● Động');

    // Hàng 5: Hào 2
    expect(lineRows[4]?.textContent).toContain('Hào 2');
    expect(lineRows[4]?.textContent).toContain('Lục Nhị');

    // Hàng 6 (dưới cùng): Hào 1
    expect(lineRows[5]?.textContent).toContain('Hào 1');
    expect(lineRows[5]?.textContent).toContain('Sơ Cửu');
  });

  it('đánh dấu trực quan đúng hào động', () => {
    const { container } = render(
      <HexagramView hexagram={primaryHexagram} roleLabel="Quẻ Chủ" variant="primary" />
    );

    const movingRow = container.querySelector('.hexagram-line-row--moving');
    expect(movingRow).toBeTruthy();
    expect(movingRow?.textContent).toContain('Hào 3');
    expect(movingRow?.textContent).toContain('● Động');
  });

  it('hiển thị đầy đủ tên quẻ, số Văn Vương, chữ Hán và biểu tượng', () => {
    render(<HexagramView hexagram={primaryHexagram} roleLabel="Quẻ Chủ" variant="primary" />);

    expect(screen.getByText('Thiên Lôi Vô Vọng')).toBeInTheDocument();
    expect(screen.getByText('#25')).toBeInTheDocument();
    expect(screen.getByText('天雷無妄')).toBeInTheDocument();
    expect(screen.getByText('Quẻ Chủ')).toBeInTheDocument();
  });
});
