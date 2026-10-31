# HƯỚNG DẪN CÀI ĐẶT MÔI TRƯỜNG DỰ ÁN KINHDICH
## Hệ thống Chiêm bốc & Dịch học Cổ pháp - Bắc Hà Tân An Phái
**Phiên bản tài liệu:** 1.0.0  
**Ngày cập nhật:** 31/10/2026

---

## 1. YÊU CẦU MÔI TRƯỜNG TIÊN QUYẾT (PREREQUISITES)

Để phát triển và chạy toàn bộ Monorepo KinhDich trên máy tính của bạn, cần cài đặt các công cụ sau:

### 1.1. Công cụ cơ bản cho toàn Monorepo
- **Node.js:** Phiên bản `>= 20.18.0` (khuyến nghị phiên bản LTS `v22.x`). Kiểm tra bằng lệnh:
  ```bash
  node -v
  ```
- **pnpm:** Phiên bản `>= 9.x` (dự án được cấu hình với `pnpm@12.16.1`). Cài đặt toàn cục bằng:
  ```bash
  npm install -g pnpm
  pnpm -v
  ```
- **Git:** Để quản lý mã nguồn.

### 1.2. Yêu cầu riêng cho từng nền tảng

| Nền tảng | Công cụ bổ sung cần thiết | Ghi chú kiểm tra |
| :--- | :--- | :--- |
| **Web (PWA)** | Trình duyệt hiện đại (Chrome, Edge, Firefox, Brave) | Hỗ trợ IndexedDB và Service Worker |
| **Desktop (Windows)** | 1. **Rust & Cargo** (`rustc >= 1.77`)<br>2. **Visual Studio C++ Build Tools**<br>3. **Microsoft Edge WebView2** | Đã tích hợp sẵn trên Windows 10/11. Kiểm tra qua `cargo --version`. |
| **Mobile (Android/iOS)** | 1. **Expo Go** trên điện thoại thật (SDK 58)<br>2. **Android Studio** (nếu chạy máy ảo Android)<br>3. **Xcode** (nếu chạy iOS Simulator trên macOS) | Cần kết nối cùng mạng Wi-Fi với máy tính phát triển khi quét mã QR Expo Go. |

---

## 2. QUY TRÌNH CÀI ĐẶT BƯỚC TỪNG BƯỚC

### Bước 1: Sao chép mã nguồn (Clone Repository)
```bash
git clone <repository-url> E:/bac-ha-tan-an-phai
cd E:/bac-ha-tan-an-phai
```

### Bước 2: Cài đặt toàn bộ dependencies trong Monorepo
Chạy lệnh cài đặt của pnpm tại thư mục gốc:
```bash
pnpm install
```
*Lệnh này sẽ tự động liên kết các workspace packages (`@kindich/domain`, `@kindich/calendar`, `@kindich/core`, `@kindich/database`, `@kindich/shared`) thông qua symlink.*

### Bước 3: Biên dịch các thư viện dùng chung (Build Packages)
Trước khi khởi động ứng dụng Web, Mobile hoặc Desktop, hãy biên dịch mã nguồn TypeScript của các package sang thư mục `dist/`:
```bash
# Biên dịch tất cả các package dùng chung
pnpm -r build
```

### Bước 4: Kiểm tra tính toàn vẹn (Verification)
Chạy kiểm tra kiểu dữ liệu TypeScript và bộ test tự động để xác nhận môi trường đã sẵn sàng 100%:
```bash
# 1. Kiểm tra TypeScript strict mode trên 9 workspace
pnpm -r typecheck

# 2. Chạy 745+ unit & integration tests
pnpm test
```

---

## 3. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### Lỗi 1: `ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE`
- **Nguyên nhân:** Chạy lệnh ở sai thư mục làm việc (working directory).
- **Khắc phục:** Đảm bảo cửa sổ dòng lệnh PowerShell/Terminal đang đứng tại thư mục gốc `E:\bac-ha-tan-an-phai`.

### Lỗi 2: `Project is incompatible with this version of Expo Go (SDK 58 vs SDK 52)`
- **Nguyên nhân:** Phiên bản ứng dụng Expo Go trên điện thoại đã cập nhật lên SDK 58 mới nhất.
- **Khắc phục:** Dự án đã được nâng cấp đồng bộ lên Expo SDK 58 trong [apps/mobile/package.json](file:///E:/bac-ha-tan-an-phai/apps/mobile/package.json). Chỉ cần khởi động lại Expo qua:
  ```bash
  cd apps/mobile
  npx expo start -c
  ```

### Lỗi 3: Lỗi thiếu Rust Toolchain khi build Desktop
- **Nguyên nhân:** Máy tính chưa cài đặt trình biên dịch Rust cho Tauri 2.
- **Khắc phục:**
  1. Truy cập [https://rustup.rs](https://rustup.rs) tải và chạy `rustup-init.exe`.
  2. Chọn cài đặt mặc định (default).
  3. Mở lại terminal và chạy: `cargo --version`.
