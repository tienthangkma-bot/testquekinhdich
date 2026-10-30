import { LinePosition, RawHexagramValues, YaoValue } from '@kindich/domain';
import { InvalidHexagramInputError, InvalidMovingLineError } from './errors';

/**
 * Kiểm tra và chuẩn hóa dữ liệu 6 hào đầu vào
 *
 * @param input - Mảng 6 giá trị [0|1] hoặc chuỗi 6 ký tự nhị phân ("111111", "000000")
 * @returns Mảng RawHexagramValues hợp lệ gồm 6 phần tử từ dưới lên
 * @throws InvalidHexagramInputError nếu dữ liệu không hợp lệ
 */
export function validateRawHexagramValues(input: unknown): RawHexagramValues {
  let values: number[];

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.length !== 6 || !/^[01]{6}$/.test(trimmed)) {
      throw new InvalidHexagramInputError(
        `Dữ liệu chuỗi hào không hợp lệ: "${input}". Yêu cầu chuỗi đúng 6 ký tự nhị phân '0' hoặc '1'.`
      );
    }
    values = trimmed.split('').map((c) => (c === '1' ? 1 : 0));
  } else if (Array.isArray(input)) {
    if (input.length !== 6) {
      throw new InvalidHexagramInputError(
        `Số lượng hào không hợp lệ: nhận được ${input.length} hào, yêu cầu đúng 6 hào từ dưới lên.`
      );
    }

    values = input.map((val, idx) => {
      const num = Number(val);
      if (num !== 0 && num !== 1) {
        throw new InvalidHexagramInputError(
          `Hào tại vị trí ${idx + 1} có giá trị không hợp lệ: ${val}. Giá trị chỉ được là 0 (Âm) hoặc 1 (Dương).`
        );
      }
      return num as YaoValue;
    });
  } else {
    throw new InvalidHexagramInputError(
      'Dữ liệu 6 hào đầu vào phải là một mảng 6 số [0|1] hoặc chuỗi 6 ký tự nhị phân.'
    );
  }

  return [values[0] as YaoValue, values[1] as YaoValue, values[2] as YaoValue, values[3] as YaoValue, values[4] as YaoValue, values[5] as YaoValue];
}

/**
 * Kiểm tra và chuẩn hóa danh sách các vị trí hào động (1 đến 6)
 *
 * @param movingLines - Mảng vị trí hào động hoặc một số đơn lẻ (ví dụ: [1, 3] hoặc 1)
 * @returns Mảng các vị trí LinePosition duy nhất, được sắp xếp tăng dần từ 1 đến 6
 * @throws InvalidMovingLineError nếu vị trí hào động nằm ngoài phạm vi 1 đến 6
 */
export function validateMovingLines(movingLines?: unknown): LinePosition[] {
  if (movingLines === undefined || movingLines === null) {
    return [];
  }

  let list: unknown[];
  if (Array.isArray(movingLines)) {
    list = movingLines;
  } else if (typeof movingLines === 'number') {
    list = [movingLines];
  } else {
    throw new InvalidMovingLineError(
      'Dữ liệu hào động phải là một số (1 đến 6) hoặc một mảng số.'
    );
  }

  const positions: LinePosition[] = [];
  const seen = new Set<number>();

  for (const item of list) {
    const num = Number(item);
    if (!Number.isInteger(num) || num < 1 || num > 6) {
      throw new InvalidMovingLineError(
        `Vị trí hào động không hợp lệ: ${item}. Hào động chỉ được nằm trong phạm vi từ 1 (Sơ hào) đến 6 (Thượng hào).`
      );
    }

    if (!seen.has(num)) {
      seen.add(num);
      positions.push(num as LinePosition);
    }
  }

  // Sắp xếp tăng dần theo thứ tự từ dưới lên
  return positions.sort((a, b) => a - b);
}
