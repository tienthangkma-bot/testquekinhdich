import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  verifyInitialDataIntegrity,
  getMasterDataBundle,
  getInitialApplicationSettings,
  NAJIA_MAP,
} from './initial-data';
import {
  DEV_SEED_DIVINATIONS,
  seedDevelopmentDatabase,
  clearDevelopmentSeedData,
  isProductionEnvironment,
} from './development.seed';
import { EIGHT_TRIGRAMS } from './trigrams.data';
import { HEXAGRAMS } from './hexagrams.data';
import { BA_GONG_PALACES, BA_GONG_HEXAGRAMS } from './bagong.data';
import { DEFAULT_KINHDICH_SETTINGS } from '../settings/settings.types';
import { IDivinationRepository } from '../repositories/divination.repository';

describe('Initial Data & Master Reference Verification (Hoàn thiện Dữ liệu Khởi tạo)', () => {
  it('hàm verifyInitialDataIntegrity() phải vượt qua 100% không có bất kỳ lỗi nào', () => {
    const result = verifyInitialDataIntegrity();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.summary.trigramCount).toBe(8);
    expect(result.summary.hexagramCount).toBe(64);
    expect(result.summary.palaceCount).toBe(8);
    expect(result.summary.najiaHexagramCount).toBe(64);
    expect(result.summary.canonicalAuthorCount).toBe(10);
    expect(result.summary.canonicalBookCount).toBe(8);
    expect(result.summary.canonicalCitationCount).toBeGreaterThanOrEqual(13);
  });

  describe('1. Khởi tạo 8 Bát Quái (Trigrams)', () => {
    it('phải có đúng 8 quẻ đơn Tiên Thiên với đầy đủ thông tin chuẩn xác', () => {
      expect(EIGHT_TRIGRAMS.length).toBe(8);
      const earlyNumbers = EIGHT_TRIGRAMS.map((t) => t.earlyHeavenNumber).sort((a, b) => a - b);
      expect(earlyNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

      const expectedNames = ['Càn', 'Đoài', 'Ly', 'Chấn', 'Tốn', 'Khảm', 'Cấn', 'Khôn'];
      expectedNames.forEach((name) => {
        const found = EIGHT_TRIGRAMS.find((t) => t.name === name);
        expect(found, `Thiếu quái: ${name}`).toBeDefined();
        expect(found?.lines.length).toBe(3);
        expect(found?.binary.length).toBe(3);
        expect(found?.symbol.length).toBe(1);
        expect(found?.element).toBeDefined();
      });
    });

    it('không có bất kỳ sự trùng lặp nào về mã nhị phân hay tên quái', () => {
      const binaries = new Set(EIGHT_TRIGRAMS.map((t) => t.binary));
      expect(binaries.size).toBe(8);

      const ids = new Set(EIGHT_TRIGRAMS.map((t) => t.id));
      expect(ids.size).toBe(8);
    });
  });

  describe('2. Khởi tạo 64 Quẻ (Hexagrams)', () => {
    it('phải có đầy đủ 64 quẻ từ #1 đến #64 không bị khuyết số', () => {
      expect(HEXAGRAMS.length).toBe(64);

      const numbers = HEXAGRAMS.map((h) => h.number).sort((a, b) => a - b);
      for (let i = 1; i <= 64; i++) {
        expect(numbers[i - 1]).toBe(i);
      }
    });

    it('quẻ #1 Thuần Càn và quẻ #64 Hỏa Thủy Vị Tế phải đúng chuẩn Văn Vương', () => {
      const can = HEXAGRAMS.find((h) => h.number === 1);
      expect(can?.name).toBe('Thuần Càn');
      expect(can?.chineseName).toBe('乾為天');
      expect(can?.upperTrigram.name).toBe('Càn');
      expect(can?.lowerTrigram.name).toBe('Càn');
      expect(can?.binary).toBe('111111');

      const viTe = HEXAGRAMS.find((h) => h.number === 64);
      expect(viTe?.name).toBe('Hỏa Thủy Vị Tế');
      expect(viTe?.upperTrigram.name).toBe('Ly');
      expect(viTe?.lowerTrigram.name).toBe('Khảm');
    });

    it('tất cả 64 mã nhị phân và tên quẻ phải là duy nhất', () => {
      const binaries = new Set(HEXAGRAMS.map((h) => h.binary));
      expect(binaries.size).toBe(64);

      const names = new Set(HEXAGRAMS.map((h) => h.name));
      expect(names.size).toBe(64);
    });
  });

  describe('3. Khởi tạo Bát Cung & Nạp Giáp đã xác minh', () => {
    it('8 cung phải phân bổ đúng 64 quẻ, mỗi cung 8 quẻ và không trùng lặp', () => {
      expect(BA_GONG_PALACES.length).toBe(8);
      const allHexNumbers: number[] = [];

      BA_GONG_PALACES.forEach((palace) => {
        expect(palace.hexagramNumbers.length).toBe(8);
        expect(palace.element).toBeDefined();

        palace.hexagramNumbers.forEach((num) => {
          allHexNumbers.push(num);
        });
      });

      expect(allHexNumbers.length).toBe(64);
      const uniqueHexNumbers = new Set(allHexNumbers);
      expect(uniqueHexNumbers.size).toBe(64);

      // Kiểm tra 64 thực thể BA_GONG_HEXAGRAMS có Thế Ứng hợp lệ
      expect(BA_GONG_HEXAGRAMS.length).toBe(64);
      BA_GONG_HEXAGRAMS.forEach((hex) => {
        expect(hex.worldLine).toBeGreaterThanOrEqual(1);
        expect(hex.worldLine).toBeLessThanOrEqual(6);
        expect(hex.responseLine).toBeGreaterThanOrEqual(1);
        expect(hex.responseLine).toBeLessThanOrEqual(6);
        expect(Math.abs(hex.worldLine - hex.responseLine)).toBe(3);
      });
    });

    it('Nạp Giáp phải có đủ 64 quẻ, mỗi quẻ có 6 hào đầy đủ Can Chi và Ngũ Hành', () => {
      for (let n = 1; n <= 64; n++) {
        const lines = NAJIA_MAP[n];
        expect(lines, `Thiếu Nạp Giáp cho quẻ #${n}`).toBeDefined();
        expect(lines!.length).toBe(6);

        lines!.forEach((line, idx) => {
          expect(line.position).toBe(idx + 1);
          expect(line.stem.length).toBeGreaterThan(0);
          expect(line.branch.length).toBeGreaterThan(0);
          expect(line.canChi.length).toBeGreaterThan(0);
          expect(line.element).toBeDefined();
        });
      }
    });
  });

  describe('4. Cấu hình Mặc định (Default Configuration)', () => {
    it('thiết lập SERIAL-MOD8-V1 làm phương pháp lập quẻ mặc định', () => {
      expect(DEFAULT_KINHDICH_SETTINGS.divination.defaultMethod).toBe('serial');
      expect(DEFAULT_KINHDICH_SETTINGS.divination.algorithmVersion).toBe('SERIAL-MOD8-V1');
    });

    it('thiết lập RuleSet mặc định là BO_PHE_CHINH_TONG_V1', () => {
      expect(DEFAULT_KINHDICH_SETTINGS.divination.ruleSetId).toBe('BO_PHE_CHINH_TONG_V1');
    });

    it('thiết lập các cấu hình lịch pháp cổ truyền chuẩn xác', () => {
      expect(DEFAULT_KINHDICH_SETTINGS.calendar.timeZone).toBe('Asia/Ho_Chi_Minh');
      expect(DEFAULT_KINHDICH_SETTINGS.calendar.dayTransitionRule).toBe('23:00'); // Cổ pháp giờ Tý
      expect(DEFAULT_KINHDICH_SETTINGS.calendar.leapMonthRule).toBe('TIET_KHI'); // Tiết Khí thiên văn
    });

    it('getInitialApplicationSettings() trả về bản sao an toàn của cấu hình mặc định', () => {
      const settings = getInitialApplicationSettings();
      expect(settings).toEqual(DEFAULT_KINHDICH_SETTINGS);
      expect(settings).not.toBe(DEFAULT_KINHDICH_SETTINGS); // Bản sao mới
    });
  });

  describe('5. Tính sẵn sàng Offline 100% (Zero Network Requirement)', () => {
    it('getMasterDataBundle() trả về toàn bộ dữ liệu gốc tức thì mà không cần mạng', () => {
      const bundle = getMasterDataBundle();
      expect(bundle.trigrams.length).toBe(8);
      expect(bundle.hexagrams.length).toBe(64);
      expect(bundle.palaces.length).toBe(8);
      expect(Object.keys(bundle.najiaMap).length).toBe(64);
      expect(bundle.authors.length).toBe(10);
      expect(bundle.books.length).toBe(8);
      expect(bundle.citations.length).toBeGreaterThanOrEqual(13);
      expect(bundle.defaultSettings.divination.defaultMethod).toBe('serial');
    });
  });
});

describe('Development Seed Data (Dữ liệu mẫu môi trường Phát triển)', () => {
  let inMemoryDivinations: Map<string, any>;
  let mockRepository: IDivinationRepository;

  beforeEach(() => {
    inMemoryDivinations = new Map();
    mockRepository = {
      create: vi.fn(async (dto) => {
        const id = dto.id || `div-${Date.now()}`;
        const record = { ...dto, id, createdAt: new Date().toISOString() };
        inMemoryDivinations.set(id, record);
        return { divination: record, notes: [] } as any;
      }),
      getById: vi.fn(async (id) => inMemoryDivinations.get(id) || null),
      delete: vi.fn(async (id) => {
        inMemoryDivinations.delete(id);
      }),
      list: vi.fn(async () => ({
        items: Array.from(inMemoryDivinations.values()),
        totalCount: inMemoryDivinations.size,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      })),
      update: vi.fn(),
      search: vi.fn(),
      addNote: vi.fn(),
      updateNote: vi.fn(),
      deleteNote: vi.fn(),
      getNotesByDivinationId: vi.fn(async () => []),
    };
  });

  it('danh sách DEV_SEED_DIVINATIONS phải có 3 phiên mẫu với đầy đủ thông tin chuẩn tắc', () => {
    expect(DEV_SEED_DIVINATIONS.length).toBe(3);

    const ids = DEV_SEED_DIVINATIONS.map((d) => d.id);
    expect(ids).toContain('seed-dev-serial-career');
    expect(ids).toContain('seed-dev-maihua-health');
    expect(ids).toContain('seed-dev-serial-finance');

    DEV_SEED_DIVINATIONS.forEach((dto) => {
      expect(dto.question?.length).toBeGreaterThan(10);
      expect(dto.trio.primary.number).toBeGreaterThanOrEqual(1);
      expect(dto.trio.primary.number).toBeLessThanOrEqual(64);
      expect(dto.trio.movingLineIndices.length).toBeGreaterThan(0);
      expect(dto.dateTimeInfo.yearCanChi.length).toBeGreaterThan(0);
      expect(dto.dateTimeInfo.dayCanChi.length).toBeGreaterThan(0);
      expect(dto.tags).toContain('dev-sample');
      expect(dto.initialNote?.length).toBeGreaterThan(10);
    });
  });

  it('seedDevelopmentDatabase nạp thành công 3 bản ghi mẫu vào cơ sở dữ liệu development', async () => {
    const result = await seedDevelopmentDatabase(mockRepository, { force: true });
    expect(result.seededCount).toBe(3);
    expect(result.skippedCount).toBe(0);
    expect(result.errors).toEqual([]);
    expect(inMemoryDivinations.size).toBe(3);
  });

  it('seedDevelopmentDatabase có tính chất Idempotent (không tạo trùng lặp khi chạy lại)', async () => {
    // Chạy lần 1
    const res1 = await seedDevelopmentDatabase(mockRepository, { force: true });
    expect(res1.seededCount).toBe(3);

    // Chạy lần 2
    const res2 = await seedDevelopmentDatabase(mockRepository, { force: true });
    expect(res2.seededCount).toBe(0);
    expect(res2.skippedCount).toBe(3);
    expect(inMemoryDivinations.size).toBe(3);
  });

  it('clearDevelopmentSeedData xóa sạch đúng các bản ghi mẫu', async () => {
    await seedDevelopmentDatabase(mockRepository, { force: true });
    expect(inMemoryDivinations.size).toBe(3);

    const clearRes = await clearDevelopmentSeedData(mockRepository);
    expect(clearRes.deletedCount).toBe(3);
    expect(inMemoryDivinations.size).toBe(0);
  });

  it('bảo vệ môi trường Production: từ chối nạp dữ liệu mẫu nếu ở môi trường production mà không có force', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      expect(isProductionEnvironment()).toBe(true);

      await expect(seedDevelopmentDatabase(mockRepository)).rejects.toThrow(
        /AN TOÀN BẢO VỆ DỮ LIỆU: Không thể nạp dữ liệu mẫu/
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
