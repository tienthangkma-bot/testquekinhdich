#!/usr/bin/env node

/**
 * scripts/bump-version.mjs
 * Tự động hóa cập nhật và đồng bộ phiên bản Semantic Versioning (MAJOR.MINOR.PATCH)
 * trên toàn bộ các gói và ứng dụng của dự án Kinh Dịch.
 *
 * Cách dùng:
 *   node scripts/bump-version.mjs patch   # 0.1.0 -> 0.1.1
 *   node scripts/bump-version.mjs minor   # 0.1.0 -> 0.2.0
 *   node scripts/bump-version.mjs major   # 0.1.0 -> 1.0.0
 *   node scripts/bump-version.mjs 0.2.5   # chỉ định trực tiếp
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const arg = process.argv[2];
if (!arg) {
  console.error(`\n❌ Vui lòng cung cấp loại cập nhật hoặc phiên bản:`);
  console.error(`   node scripts/bump-version.mjs <patch|minor|major|X.Y.Z>\n`);
  process.exit(1);
}

const rootPkgPath = path.join(rootDir, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const currentVersion = rootPkg.version || '0.1.0';

const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;
const match = currentVersion.match(semverRegex);
if (!match) {
  console.error(`\n❌ Phiên bản hiện tại (${currentVersion}) không tuân thủ định dạng SemVer!`);
  process.exit(1);
}

let [_, majorStr, minorStr, patchStr] = match;
let major = parseInt(majorStr, 10);
let minor = parseInt(minorStr, 10);
let patch = parseInt(patchStr, 10);

let nextVersion = '';
if (arg === 'patch') {
  patch += 1;
  nextVersion = `${major}.${minor}.${patch}`;
} else if (arg === 'minor') {
  minor += 1;
  patch = 0;
  nextVersion = `${major}.${minor}.${patch}`;
} else if (arg === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
  nextVersion = `${major}.${minor}.${patch}`;
} else if (semverRegex.test(arg)) {
  nextVersion = arg;
} else {
  console.error(`\n❌ Tham số '${arg}' không hợp lệ. Chỉ chấp nhận 'major', 'minor', 'patch' hoặc 'X.Y.Z'.`);
  process.exit(1);
}

console.log(`\n======================================================`);
console.log(`🔖 [BUMP VERSION] Nâng cấp phiên bản: ${currentVersion} -> ${nextVersion}`);
console.log(`======================================================`);

const updatedFiles = [];

// 1. Cập nhật các package.json
const pkgJsonPaths = [
  'package.json',
  'packages/shared/package.json',
  'packages/domain/package.json',
  'packages/calendar/package.json',
  'packages/core/package.json',
  'packages/database/package.json',
  'apps/web/package.json',
  'apps/desktop/package.json',
  'apps/mobile/package.json'
];

for (const relPath of pkgJsonPaths) {
  const fullPath = path.join(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    pkg.version = nextVersion;
    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    updatedFiles.push(relPath);
  }
}

// 2. Cập nhật apps/mobile/app.json (Expo)
const appJsonPath = path.join(rootDir, 'apps', 'mobile', 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (appJson.expo) {
    appJson.expo.version = nextVersion;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
    updatedFiles.push('apps/mobile/app.json');
  }
}

// 3. Cập nhật apps/desktop/src-tauri/tauri.conf.json (Tauri 2)
const tauriConfPath = path.join(rootDir, 'apps', 'desktop', 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauriConf.version = nextVersion;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
  updatedFiles.push('apps/desktop/src-tauri/tauri.conf.json');
}

// 4. Cập nhật apps/desktop/src-tauri/Cargo.toml (Rust)
const cargoTomlPath = path.join(rootDir, 'apps', 'desktop', 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoContent = cargoContent.replace(/(\[package\][\s\S]*?version\s*=\s*")([^"]+)(")/, `$1${nextVersion}$3`);
  fs.writeFileSync(cargoTomlPath, cargoContent, 'utf8');
  updatedFiles.push('apps/desktop/src-tauri/Cargo.toml');
}

// 5. Cập nhật CHANGELOG.md nếu có
const todayStr = new Date().toISOString().split('T')[0];
const changelogPaths = [
  path.join(rootDir, 'CHANGELOG.md'),
  path.join(rootDir, 'docs', 'CHANGELOG.md')
];

for (const chPath of changelogPaths) {
  if (fs.existsSync(chPath)) {
    let content = fs.readFileSync(chPath, 'utf8');
    if (!content.includes(`## [${nextVersion}]`)) {
      if (content.includes('## [Unreleased]')) {
        content = content.replace(
          '## [Unreleased]',
          `## [Unreleased]\n\n## [${nextVersion}] - ${todayStr}`
        );
      } else {
        content = content.replace(
          /(# Nhật ký thay đổi.*?\n\n)/s,
          `$1## [Unreleased]\n\n## [${nextVersion}] - ${todayStr}\n\n`
        );
      }
      fs.writeFileSync(chPath, content, 'utf8');
      updatedFiles.push(path.relative(rootDir, chPath));
    }
  }
}

console.log(`✅ Đã cập nhật thành công phiên bản ${nextVersion} trên ${updatedFiles.length} tệp:`);
for (const f of updatedFiles) {
  console.log(`   - ${f}`);
}
console.log(`\n📌 Các bước tiếp theo:`);
console.log(`   1) Kiểm tra lại git diff: git diff`);
console.log(`   2) Cập nhật ghi chú phát hành trong CHANGELOG.md`);
console.log(`   3) Tạo git commit: git commit -am "chore(release): bump version to ${nextVersion}"`);
console.log(`   4) Đánh git tag: git tag -a v${nextVersion} -m "Release v${nextVersion}"`);
console.log(`======================================================\n`);
