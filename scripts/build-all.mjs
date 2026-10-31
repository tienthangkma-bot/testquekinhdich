#!/usr/bin/env node

/**
 * scripts/build-all.mjs
 * Script trung tâm đóng gói toàn bộ 4 nền tảng (Web, Android, iOS, Windows).
 * Đảm bảo kiểm tra TypeScript, Dependencies và Tests trước khi build.
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log(`\n======================================================`);
console.log(`📦 [KINH DỊCH BUILD ALL] BẮT ĐẦU ĐÓNG GÓI 4 NỀN TẢNG`);
console.log(`   Nền tảng mục tiêu: Web, Android, iOS, Windows`);
console.log(`======================================================`);

// Bước 1: Kiểm tra toàn diện trước khi build
console.log(`\n[GIAI ĐOẠN 1/2] KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT TOÀN DỰ ÁN...`);
try {
  execSync(`node "${path.join(__dirname, 'verify-all.mjs')}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (err) {
  console.error(`\n❌ [BUILD ALL DỪNG LẠI]: Bước kiểm tra điều kiện tiên quyết thất bại!`);
  process.exit(1);
}

// Bước 2: Đóng gói tuần tự từng nền tảng
console.log(`\n[GIAI ĐOẠN 2/2] ĐÓNG GÓI CÁC NỀN TẢNG...`);

const targets = [
  { name: 'Web', script: 'build-web.mjs' },
  { name: 'Android', script: 'build-android.mjs' },
  { name: 'iOS', script: 'build-ios.mjs' },
  { name: 'Windows', script: 'build-windows.mjs' }
];

const results = [];

for (const target of targets) {
  console.log(`\n------------------------------------------------------`);
  console.log(`▶ Đang tiến hành đóng gói nền tảng: ${target.name}...`);
  console.log(`------------------------------------------------------`);
  try {
    execSync(`node "${path.join(__dirname, target.script)}" --skip-verify`, {
      cwd: rootDir,
      stdio: 'inherit'
    });
    results.push({ name: target.name, status: '✅ THÀNH CÔNG' });
  } catch (err) {
    console.error(`❌ Đóng gói thất bại cho: ${target.name}`);
    results.push({ name: target.name, status: '❌ THẤT BẠI' });
  }
}

console.log(`\n======================================================`);
console.log(`📊 TỔNG KẾT KẾT QUẢ ĐÓNG GÓI DỰ ÁN KINH DỊCH:`);
console.table(results);
console.log(`Lưu ý: Không tự động phát hành lên kho ứng dụng.`);
console.log(`Các bản build đã được lưu trữ cục bộ để kiểm định nội bộ.`);
console.log(`======================================================\n`);
