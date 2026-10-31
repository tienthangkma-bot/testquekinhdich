import {
  DEFAULT_KINHDICH_SETTINGS,
  KinhDichSettings,
  SettingsRepository,
  StorageStats,
} from './settings.types';
import { normalizeKinhDichSettings } from './settings.validator';
import { IDivinationRepository } from '../repositories/divination.repository';

export const SETTINGS_STORAGE_KEY = 'kindich_app_settings_v1';

export interface StorageBackend {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/**
 * InMemoryStorage fallback khi chạy môi trường không có localStorage (Node/Worker/Mobile)
 */
export class InMemoryStorage implements StorageBackend {
  private memory = new Map<string, string>();

  getItem(key: string): string | null {
    return this.memory.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.memory.set(key, value);
  }

  removeItem(key: string): void {
    this.memory.delete(key);
  }

  clear(): void {
    this.memory.clear();
  }
}

/**
 * Settings Repository lưu trữ cấu hình cục bộ (Offline-First)
 * Tương thích Web (localStorage), Desktop (localStorage/Tauri), và Mobile.
 */
export class LocalStorageSettingsRepository implements SettingsRepository {
  private storage: StorageBackend;
  private divinationRepo?: IDivinationRepository;

  constructor(storage?: StorageBackend, divinationRepo?: IDivinationRepository) {
    if (storage) {
      this.storage = storage;
    } else if (
      typeof globalThis !== 'undefined' &&
      'localStorage' in globalThis &&
      (globalThis as unknown as { localStorage: StorageBackend }).localStorage
    ) {
      this.storage = (globalThis as unknown as { localStorage: StorageBackend }).localStorage;
    } else {
      this.storage = new InMemoryStorage();
    }
    this.divinationRepo = divinationRepo;
  }

  async getSettings(): Promise<KinhDichSettings> {
    try {
      const raw = await this.storage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_KINHDICH_SETTINGS };
      }
      const parsed = JSON.parse(raw);
      return normalizeKinhDichSettings(parsed);
    } catch {
      return { ...DEFAULT_KINHDICH_SETTINGS };
    }
  }

  async saveSettings(partial: Partial<KinhDichSettings>): Promise<KinhDichSettings> {
    const current = await this.getSettings();
    const updated: KinhDichSettings = {
      ...current,
      ...partial,
      appearance: {
        ...current.appearance,
        ...(partial.appearance || {}),
      },
      divination: {
        ...current.divination,
        ...(partial.divination || {}),
      },
      calendar: {
        ...current.calendar,
        ...(partial.calendar || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    const normalized = normalizeKinhDichSettings(updated);
    await this.storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  async resetSettings(): Promise<KinhDichSettings> {
    const resetValues: KinhDichSettings = {
      ...DEFAULT_KINHDICH_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(resetValues));
    return resetValues;
  }

  async getStorageStats(): Promise<StorageStats> {
    let divinationCount = 0;
    let noteCount = 0;
    let totalSizeEstimateBytes = 0;

    if (this.divinationRepo) {
      try {
        const listRes = await this.divinationRepo.list(undefined, { page: 1, pageSize: 5000 });
        divinationCount = listRes.totalCount;
        for (const item of listRes.items) {
          noteCount += item.noteCount || 0;
        }
        totalSizeEstimateBytes = JSON.stringify(listRes.items).length * 2;
      } catch (err) {
        console.warn('Không thể đọc thống kê từ DivinationRepository:', err);
      }
    }

    const settingsStr = (await this.storage.getItem(SETTINGS_STORAGE_KEY)) || '';
    totalSizeEstimateBytes += settingsStr.length * 2;

    return {
      divinationCount,
      noteCount,
      totalSizeEstimateBytes,
    };
  }
}
