import { IDivinationRepository } from '@kindich/domain';
import { DexieDivinationRepository } from '@kindich/database';

let repositoryInstance: IDivinationRepository | null = null;

/**
 * Lấy Repository instance dùng chung cho toàn bộ ứng dụng web
 * Tuân thủ nguyên tắc Dependency Inversion: Component chỉ phụ thuộc IDivinationRepository
 */
export function getDivinationRepository(): IDivinationRepository {
  if (!repositoryInstance) {
    repositoryInstance = new DexieDivinationRepository();
  }
  return repositoryInstance;
}

/**
 * Gán Repository instance (phục vụ unit test và mock)
 */
export function setDivinationRepository(repo: IDivinationRepository | null): void {
  repositoryInstance = repo;
}
