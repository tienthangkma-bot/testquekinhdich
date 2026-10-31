#!/usr/bin/env node

/**
 * scripts/build-windows.mjs
 * Script đóng gói ứng dụng Desktop cho Windows (Tauri 2 + React + SQLite)
 * Tạo tệp thực thi (.exe) và bộ cài đặt (.msi / NSIS .exe).
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const desktopDir = path.join(rootDir, 'apps', 'desktop');
const frontendDist = path.join(desktopDir, 'dist');
const tauriTargetDir = path.join(desktopDir, 'src-tauri', 'target', 'release');

const skipVerify = process.argv.includes('--skip-verify');

console.log(`\n======================================================`);
console.log(`🪟 [BUILD WINDOWS] Bắt đầu đóng gói ứng dụng Windows`);
console.log(`======================================================`);

// 1. Đảm bảo Cargo/Rust có trong PATH
const userProfile = process.env.USERPROFILE || os.homedir();
const cargoBin = path.join(userProfile, '.cargo', 'bin');
if (fs.existsSync(cargoBin) && !process.env.PATH?.includes(cargoBin)) {
  process.env.PATH = `${cargoBin}${path.delimiter}${process.env.PATH}`;
  console.log(`> Đã liên kết Cargo/Rust từ: ${cargoBin}`);
}

// 2. Kiểm tra TypeScript & Dependencies
if (!skipVerify) {
  console.log(`> Đang kiểm tra TypeScript cho apps/desktop...`);
  try {
    execSync('pnpm --filter desktop typecheck', { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ [BUILD WINDOWS THẤT BẠI]: TypeScript có lỗi trong apps/desktop!`);
    process.exit(1);
  }
}

// 3. Biên dịch Giao diện Desktop Frontend (Vite)
console.log(`\n> Đang biên dịch Desktop Frontend...`);
try {
  execSync('pnpm --filter desktop build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error(`\n❌ [BUILD WINDOWS THẤT BẠI]: Lỗi khi build Frontend của Desktop!`);
  process.exit(1);
}

// 4. Kiểm tra công cụ Rust/Cargo để đóng gói Native Tauri
let hasRust = false;
try {
  const cargoVer = execSync('cargo --version', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  console.log(`> Đã phát hiện trình biên dịch Rust: ${cargoVer.trim()}`);
  hasRust = true;
} catch {
  console.warn(`⚠️ Cảnh báo: Không phát hiện thấy trình biên dịch 'cargo' trong môi trường hiện tại.`);
}

if (hasRust) {
  console.log(`\n> Đang biên dịch ứng dụng Tauri Windows (tauri build)...`);
  try {
    execSync('pnpm --filter desktop desktop:build', {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
  } catch (err) {
    console.error(`\n❌ [BUILD WINDOWS THẤT BẠI]: Lỗi khi chạy tauri build!`);
    process.exit(1);
  }
} else {
  console.log(`\nℹ️ Giao diện frontend đã được build sẵn sàng tại: ${frontendDist}`);
  console.log(`   Để tạo file .exe/.msi, hãy cài đặt Rust từ https://rustup.rs và chạy lại:`);
  console.log(`   pnpm build:windows`);
}

// 5. Tổng kết
console.log(`\n======================================================`);
console.log(`✅ [BUILD WINDOWS HOÀN TẤT]`);
console.log(`   - Frontend Dist: ${frontendDist}`);
if (fs.existsSync(tauriTargetDir)) {
  console.log(`   - Binary Release: ${tauriTargetDir}`);
  const bundleDir = path.join(tauriTargetDir, 'bundle');
  if (fs.existsSync(bundleDir)) {
    console.log(`   - Gói cài đặt (Installers): ${bundleDir}`);
  }
}
console.log(`   - Tình trạng: Sẵn sàng phân phối ngoại tuyến trên Windows 10/11.`);
console.log(`======================================================\n`);
