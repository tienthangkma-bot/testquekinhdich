/**
 * Dữ liệu mẫu phục vụ môi trường phát triển & kiểm thử (Development Seed Data)
 * ĐẢM BẢO NGUYÊN TẮC: Tách biệt hoàn toàn với production, không bao giờ tự động nạp
 * vào cơ sở dữ liệu thực của người dùng khi cài đặt hoặc mở ứng dụng chính thức.
 */

import { CastingMethod } from '../enums/casting-method.enum';
import { Element } from '../enums/element.enum';
import { CreateDivinationDto, IDivinationRepository } from '../repositories/divination.repository';
import { HEXAGRAM_MAP } from './hexagrams.data';

/**
 * Kiểm tra xem môi trường hiện tại có phải là Development hay không
 */
export function isDevelopmentEnvironment(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { __DEV__?: boolean }).__DEV__ === true
  ) {
    return true;
  }
  return false;
}

/**
 * Kiểm tra xem môi trường hiện tại có phải là Production hay không
 */
export function isProductionEnvironment(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return true;
  }
  return false;
}

/**
 * Danh sách 3 phiên lập quẻ mẫu đại diện cho các phương pháp và bối cảnh khác nhau
 * Chỉ được sử dụng trong Development & Testing.
 */
export const DEV_SEED_DIVINATIONS: readonly CreateDivinationDto[] = [
  // 1. Quẻ Seri Tiền: Hỏi về công danh sự nghiệp
  {
    id: 'seed-dev-serial-career',
    method: CastingMethod.SERIAL,
    algorithmVersion: 'SERIAL-MOD8-V1',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    question: 'Kỳ thi thăng chức và định hướng sự nghiệp cuối năm 2026',
    inquiryType: 'career',
    tags: ['dev-sample', 'công danh', 'seri-tiền'],
    starred: true,
    input: {
      method: CastingMethod.SERIAL,
      serialNumber: '19864205',
      note: 'Tờ tiền 500,000 VND số seri polymer',
    },
    dateTimeInfo: {
      solarDateTime: '2026-10-31T09:30:00.000Z',
      lunarYear: 2026,
      lunarMonth: 9,
      lunarDay: 21,
      lunarHourBranch: 'Tỵ',
      yearCanChi: 'Bính Ngọ',
      monthCanChi: 'Mậu Tuất',
      dayCanChi: 'Ất Mão',
      hourCanChi: 'Tân Tỵ',
      solarTerm: 'Sương Giáng',
      voidBranches: ['Tý', 'Sửu'],
    },
    trio: {
      primary: HEXAGRAM_MAP[24]!, // #24 Địa Lôi Phục
      transformed: HEXAGRAM_MAP[19]!, // #19 Địa Trạch Lâm
      nuclear: HEXAGRAM_MAP[2]!, // #2 Thuần Khôn
      movingLineIndices: [2],
      hasMovingLines: true,
    },
    analysis: {
      ruleSetId: 'BO_PHE_CHINH_TONG_V1',
      algorithmVersion: 'SERIAL-MOD8-V1',
      palaceId: 'palace_khon',
      palaceElement: Element.THO,
      worldLine: 1,
      responseLine: 4,
      summary: 'Quẻ Địa Lôi Phục hào 2 động: Dương khí hồi sinh, sự nghiệp dần khởi sắc sau thời kỳ trầm lắng.',
      details: {
        movingLineDetails: [
          {
            position: 2,
            stemBranch: 'Kỷ Dần',
            sixRelation: 'Quan Quỷ',
            action: 'Động',
          },
        ],
      },
    },
    initialNote:
      'Nghiệm lý thực tế: Ngày 31/10 nộp hồ sơ thi tuyển, hào 2 Dần Mộc được Nhật thần Mão trợ lực, báo hiệu kết quả tốt đẹp.',
  },

  // 2. Quẻ Giờ Động Tâm Mai Hoa: Hỏi về sức khỏe gia đạo
  {
    id: 'seed-dev-maihua-health',
    method: CastingMethod.MAI_HUA,
    algorithmVersion: 'MAI-HUA-V1',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    question: 'Chiêm nghiệm sức khỏe người thân trong gia đình mùa đông',
    inquiryType: 'health',
    tags: ['dev-sample', 'sức khỏe', 'mai-hoa'],
    starred: false,
    input: {
      method: CastingMethod.MAI_HUA,
      dateTime: '2026-10-31T14:15:00.000Z',
      note: 'Khởi quẻ lúc lòng động tâm bất an',
    },
    dateTimeInfo: {
      solarDateTime: '2026-10-31T14:15:00.000Z',
      lunarYear: 2026,
      lunarMonth: 9,
      lunarDay: 21,
      lunarHourBranch: 'Thân',
      yearCanChi: 'Bính Ngọ',
      monthCanChi: 'Mậu Tuất',
      dayCanChi: 'Ất Mão',
      hourCanChi: 'Giáp Thân',
      solarTerm: 'Sương Giáng',
      voidBranches: ['Tý', 'Sửu'],
    },
    trio: {
      primary: HEXAGRAM_MAP[34]!, // #34 Lôi Thiên Đại Tráng
      transformed: HEXAGRAM_MAP[43]!, // #43 Trạch Thiên Quải
      nuclear: HEXAGRAM_MAP[1]!, // #1 Thuần Càn
      movingLineIndices: [5],
      hasMovingLines: true,
    },
    analysis: {
      ruleSetId: 'BO_PHE_CHINH_TONG_V1',
      algorithmVersion: 'MAI-HUA-V1',
      palaceId: 'palace_khon',
      palaceElement: Element.THO,
      worldLine: 4,
      responseLine: 1,
      summary: 'Mai Hoa Thể Dụng: Hạ quái Càn Kim là Thể, Thượng quái Chấn Mộc là Dụng. Thể Kim khắc Dụng Mộc.',
      details: {
        relation: 'Thể khắc Dụng',
        favorable: true,
      },
    },
    initialNote:
      'Ghi chép: Người nhà hơi mệt nhưng không có gì đáng lo, uống thuốc nghỉ ngơi 3 ngày là bình phục.',
  },

  // 3. Quẻ Seri Tiền: Hỏi về đầu tư tài chính kinh doanh
  {
    id: 'seed-dev-serial-finance',
    method: CastingMethod.SERIAL,
    algorithmVersion: 'SERIAL-MOD8-V1',
    ruleSetId: 'BO_PHE_CHINH_TONG_V1',
    question: 'Kế hoạch hợp tác mở rộng kinh doanh mặt hàng thủ công mỹ nghệ',
    inquiryType: 'finance',
    tags: ['dev-sample', 'tài chính', 'kinh doanh'],
    starred: true,
    input: {
      method: CastingMethod.SERIAL,
      serialNumber: '682491',
      note: 'Tờ tiền kỷ niệm mang theo trong ví',
    },
    dateTimeInfo: {
      solarDateTime: '2026-10-31T16:00:00.000Z',
      lunarYear: 2026,
      lunarMonth: 9,
      lunarDay: 21,
      lunarHourBranch: 'Dậu',
      yearCanChi: 'Bính Ngọ',
      monthCanChi: 'Mậu Tuất',
      dayCanChi: 'Ất Mão',
      hourCanChi: 'Ất Dậu',
      solarTerm: 'Sương Giáng',
      voidBranches: ['Tý', 'Sửu'],
    },
    trio: {
      primary: HEXAGRAM_MAP[11]!, // #11 Địa Thiên Thái
      transformed: HEXAGRAM_MAP[26]!, // #26 Sơn Thiên Đại Súc
      nuclear: HEXAGRAM_MAP[54]!, // #54 Lôi Trạch Quy Muội
      movingLineIndices: [6],
      hasMovingLines: true,
    },
    analysis: {
      ruleSetId: 'BO_PHE_CHINH_TONG_V1',
      algorithmVersion: 'SERIAL-MOD8-V1',
      palaceId: 'palace_can',
      palaceElement: Element.KIM,
      worldLine: 3,
      responseLine: 6,
      summary: 'Quẻ Địa Thiên Thái: Trời Đất giao hòa, vạn vật hanh thông, tài lộc dồi dào vững bền.',
      details: {
        movingLine: 6,
      },
    },
    initialNote:
      'Đánh giá: Dự án khả thi cao, đối tác uy tín, nên tiến hành ký kết hợp đồng trong tháng 10 âm lịch.',
  },
];

/**
 * Kết quả nạp dữ liệu mẫu
 */
export interface SeedResult {
  readonly seededCount: number;
  readonly skippedCount: number;
  readonly errors: readonly string[];
}

/**
 * Hàm nạp dữ liệu mẫu vào Repository với cơ chế bảo vệ môi trường nghiêm ngặt.
 * TUYỆT ĐỐI KHÔNG NẠP VÀO PRODUCTION trừ khi có cờ `force: true` rõ ràng từ lệnh quản trị.
 */
export async function seedDevelopmentDatabase(
  repository: IDivinationRepository,
  options?: { force?: boolean }
): Promise<SeedResult> {
  // 1. Kiểm tra an toàn môi trường Production
  if (isProductionEnvironment() && !options?.force) {
    throw new Error(
      'AN TOÀN BẢO VỆ DỮ LIỆU: Không thể nạp dữ liệu mẫu (Seed Data) vào môi trường Production! Cần gắn cờ `force: true` nếu bạn thực sự chắc chắn.'
    );
  }

  let seededCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const dto of DEV_SEED_DIVINATIONS) {
    try {
      // Kiểm tra bản ghi đã tồn tại chưa (Idempotent)
      if (dto.id) {
        const existing = await repository.getById(dto.id);
        if (existing) {
          skippedCount++;
          continue;
        }
      }

      await repository.create(dto);
      seededCount++;
    } catch (err) {
      errors.push(`Lỗi khi tạo bản ghi seed [${dto.id}]: ${(err as Error).message}`);
    }
  }

  return {
    seededCount,
    skippedCount,
    errors,
  };
}

/**
 * Xóa sạch toàn bộ dữ liệu mẫu trong môi trường Development
 */
export async function clearDevelopmentSeedData(
  repository: IDivinationRepository
): Promise<{ deletedCount: number }> {
  let deletedCount = 0;
  for (const dto of DEV_SEED_DIVINATIONS) {
    if (dto.id) {
      const existing = await repository.getById(dto.id);
      if (existing) {
        await repository.delete(dto.id);
        deletedCount++;
      }
    }
  }
  return { deletedCount };
}
