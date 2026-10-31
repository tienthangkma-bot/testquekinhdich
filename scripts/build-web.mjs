#!/usr/bin/env node

/**
 * scripts/build-web.mjs
 * Script đóng gói ứng dụng Web (Single Page App / PWA) cho môi trường Production.
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'apps', 'web');
const distDir = path.join(webDir, 'dist');

const skipVerify = process.argv.includes('--skip-verify');

console.log(`\n======================================================`);
console.log(`🌐 [BUILD WEB] Bắt đầu đóng gói ứng dụng Web Production`);
console.log(`======================================================`);

// 1. Kiểm tra điều kiện tiên quyết (Dependency + TypeScript) nếu chưa kiểm tra trước đó
if (!skipVerify) {
  console.log(`> Đang chạy kiểm tra điều kiện tiên quyết (TypeScript & Dependencies)...`);
  try {
    execSync('pnpm typecheck', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ [BUILD WEB THẤT BẠI]: TypeScript có lỗi! Vui lòng sửa hết lỗi trước khi build.`);
    process.exit(1);
  }
}

// 2. Thực hiện Vite build cho Web
console.log(`\n> Đang biên dịch ứng dụng Web qua Vite...`);
try {
  execSync('pnpm --filter web build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error(`\n❌ [BUILD WEB THẤT BẠI]: Lỗi trong quá trình Vite build!`);
  process.exit(1);
}

// 3. Kiểm tra tính toàn vẹn của thư mục dist
const indexHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`\n❌ [BUILD WEB THẤT BẠI]: Không tìm thấy tệp index.html trong ${distDir}`);
  process.exit(1);
}

// 4. Báo cáo dung lượng
function getDirSize(dir) {
  let total = 0;
  for (const file of fs.readdirSync(dir, { recursive: true })) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      total += fs.statSync(filePath).size;
    }
  }
  return total;
}

const totalBytes = getDirSize(distDir);
const totalKB = (totalBytes / 1024).toFixed(2);

console.log(`\n======================================================`);
console.log(`✅ [BUILD WEB HOÀN TẤT]`);
console.log(`   - Thư mục đầu ra: ${distDir}`);
console.log(`   - Tệp khởi chạy: ${indexHtml}`);
console.log(`   - Tổng dung lượng gói: ${totalKB} KB (~${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`   - Tình trạng: Sẵn sàng triển khai lên Static Hosting / PWA CDN`);
console.log(`======================================================\n`);
