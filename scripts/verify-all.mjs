#!/usr/bin/env node

/**
 * scripts/verify-all.mjs
 * Kiểm tra tính toàn vẹn phụ thuộc (Dependencies), TypeScript nghiêm ngặt,
 * và toàn bộ Unit Tests trước khi tiến hành build bất kỳ nền tảng nào.
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function logStep(step, message) {
  console.log(`\n======================================================`);
  console.log(`[BƯỚC ${step}] ${message}`);
  console.log(`======================================================`);
}

function runCmd(command, stepName) {
  try {
    console.log(`> Đang chạy: ${command}`);
    execSync(command, {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
  } catch (err) {
    console.error(`\n❌ THẤT BẠI tại bước: ${stepName}`);
    console.error(`Lệnh thất bại: ${command}`);
    process.exit(1);
  }
}

console.log(`\n🚀 [PRE-BUILD VERIFICATION] Bắt đầu kiểm tra điều kiện trước khi Build...`);

// 1. Kiểm tra Dependencies & Lockfile
logStep(1, 'Kiểm tra tính nhất quán Dependencies (pnpm install --frozen-lockfile)');
runCmd('pnpm install --frozen-lockfile', 'Kiểm tra Dependencies');

// 2. Kiểm tra TypeScript nghiêm ngặt (Strict Typecheck)
logStep(2, 'Kiểm tra TypeScript (pnpm -r typecheck)');
runCmd('pnpm -r typecheck', 'Kiểm tra TypeScript');

// 3. Kiểm tra Unit & Integration Tests
logStep(3, 'Chạy toàn bộ Test Suites (pnpm -r --if-present test)');
runCmd('pnpm -r --if-present test', 'Chạy Tests');

console.log(`\n======================================================`);
console.log(`✅ [PRE-BUILD VERIFICATION] THÀNH CÔNG:`);
console.log(`   - Dependencies hợp lệ và đồng bộ với pnpm-lock.yaml`);
console.log(`   - TypeScript 0 lỗi trên toàn bộ Monorepo`);
console.log(`   - 100% Tests đã vượt qua thành công!`);
console.log(`======================================================\n`);
