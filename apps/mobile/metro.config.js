const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Lắng nghe toàn bộ thư mục trong monorepo
config.watchFolders = [monorepoRoot];

// 2. Tìm kiếm node_modules ở cả thư mục apps/mobile và thư mục gốc monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Tắt tìm kiếm phân cấp để phù hợp với cơ chế symlinks của pnpm
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
