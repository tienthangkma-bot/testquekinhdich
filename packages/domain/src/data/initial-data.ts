/**
 * Quản lý Dữ liệu Khởi tạo và Cấu hình Mặc định (Initial Data & Default Configuration)
 * Đảm bảo 100% dữ liệu gốc được xác minh, không trùng lặp, hoạt động offline
 * và cho phép người dùng mới mở ứng dụng là có thể lập quẻ ngay lập tức.
 */

import { EIGHT_TRIGRAMS } from './trigrams.data';
import { Trigram } from '../models/trigram.model';
import { HEXAGRAMS } from './hexagrams.data';
import { Hexagram } from '../models/hexagram.model';
import { BA_GONG_PALACES, BA_GONG_HEXAGRAMS } from './bagong.data';
import { BaGongPalace, HexagramBaGong } from '../models/bagong.model';
import { getNaJiaForHexagram } from './najia.data';
import { NaJiaLine } from '../models/najia.model';
import { DEFAULT_KINHDICH_SETTINGS, KinhDichSettings } from '../settings/settings.types';
import { CANONICAL_AUTHORS, CANONICAL_BOOKS, CANONICAL_CITATIONS } from '../knowledge/knowledge.data';
import { Author, KnowledgeBook, ClassicalCitation } from '../knowledge/knowledge.types';

/**
 * Bảng tra cứu Nạp Giáp cho toàn bộ 64 Quẻ (1..64)
 */
export const NAJIA_MAP: Readonly<Record<number, readonly [NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine]>> = Object.freeze(
  HEXAGRAMS.reduce<Record<number, readonly [NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine, NaJiaLine]>>((acc, hex) => {
    acc[hex.number] = getNaJiaForHexagram(hex.lowerTrigram.code, hex.upperTrigram.code);
    return acc;
  }, {})
);

/**
 * Tóm tắt dữ liệu khởi tạo đã xác minh
 */
export interface MasterDataSummary {
  readonly trigramCount: number;
  readonly hexagramCount: number;
  readonly palaceCount: number;
  readonly palaceHexagramCount: number;
  readonly najiaHexagramCount: number;
  readonly canonicalAuthorCount: number;
  readonly canonicalBookCount: number;
  readonly canonicalCitationCount: number;
  readonly defaultCastingMethod: string;
  readonly defaultAlgorithmVersion: string;
  readonly defaultRuleSetId: string;
}

/**
 * Kết quả kiểm tra tính toàn vẹn của dữ liệu khởi tạo
 */
export interface InitialDataIntegrityResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly summary: MasterDataSummary;
}

/**
 * Toàn bộ tập dữ liệu gốc bất biến (Master Reference Data)
 */
export interface MasterDataBundle {
  readonly trigrams: readonly Trigram[];
  readonly hexagrams: readonly Hexagram[];
  readonly palaces: readonly BaGongPalace[];
  readonly palaceHexagrams: readonly HexagramBaGong[];
  readonly najiaMap: Record<number, readonly NaJiaLine[]>;
  readonly defaultSettings: KinhDichSettings;
  readonly authors: readonly Author[];
  readonly books: readonly KnowledgeBook[];
  readonly citations: readonly ClassicalCitation[];
}

/**
 * Kiểm tra tính toàn vẹn và không trùng lặp của dữ liệu khởi tạo (Health Check)
 */
export function verifyInitialDataIntegrity(): InitialDataIntegrityResult {
  const errors: string[] = [];

  // 1. Kiểm tra 8 Bát Quái
  if (EIGHT_TRIGRAMS.length !== 8) {
    errors.push(`Số lượng Bát Quái không đúng: kỳ vọng 8, nhận được ${EIGHT_TRIGRAMS.length}`);
  }
  const trigramIds = new Set<string>();
  const trigramBinaries = new Set<string>();
  const trigramEarlyNumbers = new Set<number>();
  for (const t of EIGHT_TRIGRAMS) {
    if (trigramIds.has(t.id)) errors.push(`Trùng lặp ID quái: ${t.id}`);
    trigramIds.add(t.id);
    if (trigramBinaries.has(t.binary)) errors.push(`Trùng lặp nhị phân quái: ${t.binary}`);
    trigramBinaries.add(t.binary);
    if (trigramEarlyNumbers.has(t.earlyHeavenNumber)) errors.push(`Trùng lặp số Tiên thiên: ${t.earlyHeavenNumber}`);
    trigramEarlyNumbers.add(t.earlyHeavenNumber);
  }

  // 2. Kiểm tra 64 Quẻ
  if (HEXAGRAMS.length !== 64) {
    errors.push(`Số lượng Quẻ không đúng: kỳ vọng 64, nhận được ${HEXAGRAMS.length}`);
  }
  const hexNumbers = new Set<number>();
  const hexBinaries = new Set<string>();
  const hexNames = new Set<string>();
  for (const h of HEXAGRAMS) {
    if (h.number < 1 || h.number > 64) {
      errors.push(`Số thứ tự quẻ ngoài khoảng 1..64: ${h.number}`);
    }
    if (hexNumbers.has(h.number)) errors.push(`Trùng lặp số thứ tự quẻ: ${h.number}`);
    hexNumbers.add(h.number);
    if (hexBinaries.has(h.binary)) errors.push(`Trùng lặp nhị phân quẻ: ${h.binary}`);
    hexBinaries.add(h.binary);
    if (hexNames.has(h.name)) errors.push(`Trùng lặp tên quẻ: ${h.name}`);
    hexNames.add(h.name);
  }
  for (let n = 1; n <= 64; n++) {
    if (!hexNumbers.has(n)) errors.push(`Thiếu quẻ số: ${n}`);
  }

  // 3. Kiểm tra 8 Cung (Bát Cung)
  if (BA_GONG_PALACES.length !== 8) {
    errors.push(`Số lượng Bát Cung không đúng: kỳ vọng 8, nhận được ${BA_GONG_PALACES.length}`);
  }
  let totalPalaceHexagrams = 0;
  const palaceHexNumbers = new Set<number>();
  for (const p of BA_GONG_PALACES) {
    totalPalaceHexagrams += p.hexagramNumbers.length;
    if (p.hexagramNumbers.length !== 8) {
      errors.push(`Cung ${p.id} không có đủ 8 quẻ: có ${p.hexagramNumbers.length} quẻ`);
    }
    for (const num of p.hexagramNumbers) {
      if (palaceHexNumbers.has(num)) {
        errors.push(`Quẻ #${num} bị trùng lặp ở nhiều cung`);
      }
      palaceHexNumbers.add(num);
    }
  }
  if (totalPalaceHexagrams !== 64) {
    errors.push(`Tổng số quẻ trong Bát Cung không bằng 64: ${totalPalaceHexagrams}`);
  }

  if (BA_GONG_HEXAGRAMS.length !== 64) {
    errors.push(`Tổng số thực thể BA_GONG_HEXAGRAMS không bằng 64: ${BA_GONG_HEXAGRAMS.length}`);
  }

  // 4. Kiểm tra Nạp Giáp (Najia)
  const najiaKeys = Object.keys(NAJIA_MAP).map(Number);
  if (najiaKeys.length !== 64) {
    errors.push(`Bảng Nạp Giáp không đủ 64 quẻ: có ${najiaKeys.length}`);
  }
  for (let n = 1; n <= 64; n++) {
    const najia = NAJIA_MAP[n];
    if (!najia) {
      errors.push(`Thiếu dữ liệu Nạp Giáp cho quẻ #${n}`);
    } else if (najia.length !== 6) {
      errors.push(`Quẻ #${n} không có đủ 6 hào Nạp Giáp: có ${najia.length}`);
    }
  }

  // 5. Kiểm tra Cấu hình Mặc định (Default Settings)
  if (DEFAULT_KINHDICH_SETTINGS.divination.defaultMethod !== 'serial') {
    errors.push(`Phương pháp lập quẻ mặc định không phải 'serial': ${DEFAULT_KINHDICH_SETTINGS.divination.defaultMethod}`);
  }
  if (DEFAULT_KINHDICH_SETTINGS.divination.algorithmVersion !== 'SERIAL-MOD8-V1') {
    errors.push(`Phiên bản thuật toán mặc định không phải 'SERIAL-MOD8-V1': ${DEFAULT_KINHDICH_SETTINGS.divination.algorithmVersion}`);
  }
  if (DEFAULT_KINHDICH_SETTINGS.divination.ruleSetId !== 'BO_PHE_CHINH_TONG_V1') {
    errors.push(`RuleSet mặc định không phải 'BO_PHE_CHINH_TONG_V1': ${DEFAULT_KINHDICH_SETTINGS.divination.ruleSetId}`);
  }

  // 6. Kiểm tra Nguồn Tri thức (Knowledge Base)
  if (CANONICAL_AUTHORS.length !== 10) {
    errors.push(`Số lượng tác giả kinh điển không đúng: kỳ vọng 10, nhận được ${CANONICAL_AUTHORS.length}`);
  }
  if (CANONICAL_BOOKS.length !== 8) {
    errors.push(`Số lượng thư tịch cổ không đúng: kỳ vọng 8, nhận được ${CANONICAL_BOOKS.length}`);
  }
  if (CANONICAL_CITATIONS.length < 13) {
    errors.push(`Số lượng trích dẫn cốt lõi không đủ: kỳ vọng >= 13, nhận được ${CANONICAL_CITATIONS.length}`);
  }

  const summary: MasterDataSummary = {
    trigramCount: EIGHT_TRIGRAMS.length,
    hexagramCount: HEXAGRAMS.length,
    palaceCount: BA_GONG_PALACES.length,
    palaceHexagramCount: BA_GONG_HEXAGRAMS.length,
    najiaHexagramCount: najiaKeys.length,
    canonicalAuthorCount: CANONICAL_AUTHORS.length,
    canonicalBookCount: CANONICAL_BOOKS.length,
    canonicalCitationCount: CANONICAL_CITATIONS.length,
    defaultCastingMethod: DEFAULT_KINHDICH_SETTINGS.divination.defaultMethod,
    defaultAlgorithmVersion: DEFAULT_KINHDICH_SETTINGS.divination.algorithmVersion,
    defaultRuleSetId: DEFAULT_KINHDICH_SETTINGS.divination.ruleSetId,
  };

  return {
    isValid: errors.length === 0,
    errors,
    summary,
  };
}

/**
 * Trả về gói dữ liệu gốc đầy đủ của hệ thống (Hoàn toàn Offline & Không phụ thuộc mạng)
 */
export function getMasterDataBundle(): MasterDataBundle {
  return {
    trigrams: EIGHT_TRIGRAMS,
    hexagrams: HEXAGRAMS,
    palaces: BA_GONG_PALACES,
    palaceHexagrams: BA_GONG_HEXAGRAMS,
    najiaMap: NAJIA_MAP,
    defaultSettings: { ...DEFAULT_KINHDICH_SETTINGS },
    authors: CANONICAL_AUTHORS,
    books: CANONICAL_BOOKS,
    citations: CANONICAL_CITATIONS,
  };
}

/**
 * Trả về cấu hình mặc định chuẩn tắc cho người dùng mới mở ứng dụng
 */
export function getInitialApplicationSettings(): KinhDichSettings {
  return { ...DEFAULT_KINHDICH_SETTINGS };
}
