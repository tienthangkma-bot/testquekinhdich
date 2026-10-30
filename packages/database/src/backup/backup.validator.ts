import {
  BackupValidationResult,
  DivinationEntity,
  DivinationNoteEntity,
  KinDichBackupData,
} from '@kindich/domain';
import { CURRENT_SCHEMA_VERSION } from '../db/kindich.db';

/**
 * Kiểm tra cấu trúc và tính hợp lệ của dữ liệu sao lưu trước khi nhập (Requirement 5)
 */
export function validateBackupData(data: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Kiểm tra đối tượng cơ bản
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Dữ liệu sao lưu không phải là một đối tượng JSON hợp lệ.'],
      warnings: [],
    };
  }

  const record = data as Record<string, unknown>;

  // 2. Kiểm tra định danh format
  if (record.format !== 'KINDICH_BACKUP') {
    errors.push(
      `Định dạng file không được hỗ trợ. Giá trị format phải là "KINDICH_BACKUP", nhận được: "${String(
        record.format
      )}".`
    );
  }

  // 3. Kiểm tra metadata (Requirement 3)
  if (!record.metadata || typeof record.metadata !== 'object' || Array.isArray(record.metadata)) {
    errors.push('Thiếu thông tin metadata trong file sao lưu.');
  } else {
    const meta = record.metadata as Record<string, unknown>;

    if (
      typeof meta.schemaVersion !== 'number' ||
      !Number.isInteger(meta.schemaVersion) ||
      meta.schemaVersion < 1
    ) {
      errors.push('Metadata schemaVersion không hợp lệ (phải là số nguyên dương).');
    }

    if (!meta.ruleSetId || typeof meta.ruleSetId !== 'string') {
      errors.push('Metadata ruleSetId không hợp lệ hoặc bị để trống.');
    }

    if (!meta.algorithmVersion || typeof meta.algorithmVersion !== 'string') {
      errors.push('Metadata algorithmVersion không hợp lệ hoặc bị để trống.');
    }

    if (!meta.exportedAt || typeof meta.exportedAt !== 'string' || isNaN(Date.parse(meta.exportedAt))) {
      warnings.push('Thời điểm exportedAt trong metadata không phải là chuỗi thời gian hợp lệ.');
    }
  }

  // 4. Kiểm tra khối data và các bảng dữ liệu
  if (!record.data || typeof record.data !== 'object' || Array.isArray(record.data)) {
    errors.push('Khối data chứa dữ liệu các bảng bị thiếu hoặc không đúng định dạng.');
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  const payload = record.data as Record<string, unknown>;

  // Kiểm tra mảng divinations
  if (!Array.isArray(payload.divinations)) {
    errors.push('Trường data.divinations phải là một mảng.');
  } else {
    payload.divinations.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Bản ghi divination tại vị trí [${index}] không hợp lệ.`);
        return;
      }
      const div = item as Record<string, unknown>;
      if (!div.id || typeof div.id !== 'string') {
        errors.push(`Bản ghi divination [${index}] thiếu id hoặc id không phải chuỗi.`);
      }
      if (!div.createdAt || typeof div.createdAt !== 'string') {
        errors.push(`Bản ghi divination [${index}] thiếu trường createdAt.`);
      }
      if (!div.method || typeof div.method !== 'string') {
        errors.push(`Bản ghi divination [${index}] thiếu phương pháp lập quẻ (method).`);
      }
    });
  }

  // Kiểm tra mảng divination_results
  if (!Array.isArray(payload.divination_results)) {
    errors.push('Trường data.divination_results phải là một mảng.');
  } else {
    payload.divination_results.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Bản ghi divination_result tại vị trí [${index}] không hợp lệ.`);
        return;
      }
      const res = item as Record<string, unknown>;
      if (!res.id || typeof res.id !== 'string') {
        errors.push(`Bản ghi result [${index}] thiếu id.`);
      }
      if (!res.divinationId || typeof res.divinationId !== 'string') {
        errors.push(`Bản ghi result [${index}] thiếu divinationId.`);
      }
      if (
        typeof res.primaryHexagramNumber !== 'number' ||
        res.primaryHexagramNumber < 1 ||
        res.primaryHexagramNumber > 64
      ) {
        errors.push(`Bản ghi result [${index}] có số quẻ chủ không hợp lệ (phải từ 1 đến 64).`);
      }
    });
  }

  // Kiểm tra mảng divination_analyses
  if (!Array.isArray(payload.divination_analyses)) {
    errors.push('Trường data.divination_analyses phải là một mảng.');
  } else {
    payload.divination_analyses.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Bản ghi divination_analysis tại vị trí [${index}] không hợp lệ.`);
        return;
      }
      const ana = item as Record<string, unknown>;
      if (!ana.id || typeof ana.id !== 'string') {
        errors.push(`Bản ghi analysis [${index}] thiếu id.`);
      }
      if (!ana.divinationId || typeof ana.divinationId !== 'string') {
        errors.push(`Bản ghi analysis [${index}] thiếu divinationId.`);
      }
    });
  }

  // Kiểm tra mảng divination_notes
  if (!Array.isArray(payload.divination_notes)) {
    errors.push('Trường data.divination_notes phải là một mảng.');
  } else {
    payload.divination_notes.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Bản ghi divination_note tại vị trí [${index}] không hợp lệ.`);
        return;
      }
      const note = item as Record<string, unknown>;
      if (!note.id || typeof note.id !== 'string') {
        errors.push(`Bản ghi note [${index}] thiếu id.`);
      }
      if (!note.divinationId || typeof note.divinationId !== 'string') {
        errors.push(`Bản ghi note [${index}] thiếu divinationId.`);
      }
      if (typeof note.content !== 'string') {
        errors.push(`Bản ghi note [${index}] thiếu trường content.`);
      }
    });
  }

  // 5. Kết xuất tổng kết nếu không có lỗi nghiêm trọng
  const isValid = errors.length === 0;

  if (!isValid) {
    return {
      isValid: false,
      errors,
      warnings,
    };
  }

  const meta = record.metadata as Record<string, unknown>;
  const schemaVer = Number(meta.schemaVersion);

  return {
    isValid: true,
    errors: [],
    warnings,
    summary: {
      schemaVersion: schemaVer,
      ruleSetId: String(meta.ruleSetId),
      algorithmVersion: String(meta.algorithmVersion),
      totalDivinations: (payload.divinations as unknown[]).length,
      totalResults: (payload.divination_results as unknown[]).length,
      totalAnalyses: (payload.divination_analyses as unknown[]).length,
      totalNotes: (payload.divination_notes as unknown[]).length,
      totalSettings: Array.isArray(payload.user_settings) ? payload.user_settings.length : 0,
      exportedAt: String(meta.exportedAt || new Date().toISOString()),
      requiresMigration: schemaVer < CURRENT_SCHEMA_VERSION,
    },
  };
}

/**
 * Chuẩn hóa và áp dụng logic Migration cho các bản ghi từ các phiên bản Schema cũ (Requirement 9)
 */
export function normalizeBackupData(backup: KinDichBackupData): KinDichBackupData {
  const schemaVer = backup.metadata.schemaVersion;

  // Nếu đã ở Schema Version mới nhất, trả về nguyên bản
  if (schemaVer >= CURRENT_SCHEMA_VERSION) {
    return backup;
  }

  // Chuẩn hóa divinations (Migration từ V1 lên V2/V3: bổ sung ruleSetId và starred nếu thiếu)
  const normalizedDivinations: DivinationEntity[] = backup.data.divinations.map((div) => {
    return {
      ...div,
      ruleSetId: div.ruleSetId || backup.metadata.ruleSetId || 'BO_PHE_CHINH_TONG_V1',
      starred: div.starred ?? false,
    };
  });

  // Chuẩn hóa notes (Migration từ V1 lên V2/V3: bổ sung isVerified nếu thiếu)
  const normalizedNotes: DivinationNoteEntity[] = backup.data.divination_notes.map((note) => {
    return {
      ...note,
      isVerified: note.isVerified ?? false,
    };
  });

  return {
    ...backup,
    metadata: {
      ...backup.metadata,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    },
    data: {
      ...backup.data,
      divinations: normalizedDivinations,
      divination_notes: normalizedNotes,
    },
  };
}
