#!/usr/bin/env node

/**
 * scripts/build-android.mjs
 * Script đóng gói ứng dụng Mobile cho nền tảng Android (Hermes Bytecode & Assets bundle)
 * Hỗ trợ tạo gói phân phối cục bộ ngoại tuyến.
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mobileDir = path.join(rootDir, 'apps', 'mobile');
const outputDir = path.join(mobileDir, 'dist', 'android');

const skipVerify = process.argv.includes('--skip-verify');

console.log(`\n======================================================`);
console.log(`🤖 [BUILD ANDROID] Bắt đầu đóng gói ứng dụng Android`);
console.log(`======================================================`);

// 1. Kiểm tra điều kiện tiên quyết (TypeScript & Dependencies)
if (!skipVerify) {
  console.log(`> Đang kiểm tra TypeScript cho ứng dụng mobile...`);
  try {
    execSync('pnpm --filter mobile typecheck', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ [BUILD ANDROID THẤT BẠI]: TypeScript có lỗi trong apps/mobile!`);
    process.exit(1);
  }
}

// 2. Chạy Expo Export cho Android
console.log(`\n> Đang xuất gói tĩnh Hermes Bytecode & Assets cho Android (npx expo export)...`);
try {
  // Tạo thư mục nếu chưa có
  fs.mkdirSync(outputDir, { recursive: true });
  execSync(`npx expo export -p android --output-dir "${outputDir}" --clear`, {
    cwd: mobileDir,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' }
  });
} catch (err) {
  console.error(`\n❌ [BUILD ANDROID THẤT BẠI]: Lỗi khi chạy npx expo export cho Android!`);
  process.exit(1);
}

// 3. Kiểm tra tính toàn vẹn gói đầu ra
const metadataFile = path.join(outputDir, 'metadata.json');
if (!fs.existsSync(metadataFile)) {
  console.warn(`⚠️ Cảnh báo: metadata.json không tìm thấy ở ${outputDir}, kiểm tra cấu trúc thư mục con...`);
}

function getDirSize(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const file of fs.readdirSync(dir, { recursive: true })) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      total += fs.statSync(filePath).size;
    }
  }
  return total;
}

const totalBytes = getDirSize(outputDir);
const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

console.log(`\n======================================================`);
console.log(`✅ [BUILD ANDROID HOÀN TẤT]`);
console.log(`   - Thư mục bundle Android: ${outputDir}`);
console.log(`   - Dung lượng: ${totalMB} MB (${totalBytes} bytes)`);
console.log(`   - Hermes Bytecode & Static Assets đã sẵn sàng.`);
console.log(`   - Lưu ý phát hành cục bộ (Standalone APK):`);
console.log(`     Để biên dịch tệp .apk cài đặt trực tiếp không qua Store:`);
console.log(`     1) npx expo prebuild --platform android`);
console.log(`     2) cd apps/mobile/android && ./gradlew assembleRelease`);
console.log(`     3) Tệp APK sẽ nằm tại: android/app/build/outputs/apk/release/`);
console.log(`======================================================\n`);
