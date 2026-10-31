# NHẬT KÝ THAY ĐỔI PHIÊN BẢN (CHANGELOG)
## Dự án: Kinh Dịch - Bắc Hà Tân An Phái
Tất cả những thay đổi quan trọng của dự án KinhDich sẽ được ghi nhận tại tệp này theo chuẩn [Keep a Changelog](https://keepachangelog.com/vi/1.0.0/) và tuân thủ nguyên tắc [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Dự kiến (Planned)
- Bổ sung phương pháp lập quẻ 3 đồng xu gieo 6 lần cổ truyền (Tiền gieo Lục Hào).
- Mở rộng hỗ trợ xuất báo cáo luận giải quẻ ra định dạng PDF ngoại tuyến.

---

## [0.1.0] - 2026-10-31

### Đã Thêm (Added)
- **Kiến trúc Monorepo:** Thiết lập cấu trúc Monorepo với `pnpm workspaces` gồm 5 packages dùng chung (`@kindich/shared`, `@kindich/domain`, `@kindich/calendar`, `@kindich/core`, `@kindich/database`) và 3 ứng dụng đầu cuối (`apps/web`, `apps/mobile`, `apps/desktop`).
- **Domain Model Kinh Dịch Cổ Pháp:**
  - Dữ liệu chuẩn 64 quẻ Văn Vương kèm Thoán từ, Đại Tượng từ, Tiểu Tượng từ và Hào từ.
  - Bát Quái Tiên Thiên và Hậu Thiên chuẩn số lý.
  - Bát Cung 64 quẻ (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài), định vị hào Thế và hào Ứng chuẩn Kinh Phòng Dịch Truyện.
  - Nạp Giáp Can Chi Kinh Phòng cho 6 hào của 8 cung.
  - Lục Thân (Phụ Mẫu, Huynh Đệ, Tử Tôn, Thê Tài, Quan Quỷ) và Lục Thú (Thanh Long $\to$ Huyền Vũ).
- **Động Cơ Thiên Văn Nông Lịch Việt Nam (`@kindich/calendar`):**
  - Thuật toán `VN-LUNAR-V1` tính toán Can Chi Năm, Tháng, Ngày, Giờ theo múi giờ chuẩn UTC+7 (kinh tuyến 105°E).
  - Tự động xác định 24 Tiết Khí thiên văn học phương Đông và lệnh tháng (Nguyệt Kiến).
  - Thuật toán tính toán Tuần Không (Không Vong) theo Giáp Tý tuần.
- **Động Cơ Nghiệp Vụ Cốt Lõi (`@kindich/core`):**
  - Thuật toán lập quẻ Seri tiền `SERIAL-MOD8-V1` (lẻ tính thượng quái, chẵn tính hạ quái, tổng tính hào động).
  - Thuật toán lập quẻ giờ động tâm Mai Hoa Dịch Số `MAI-HUA-V1` kèm phân định Thể Quái và Dụng Quái.
  - Thuật toán sinh Quẻ Biến và Quẻ Hỗ nội sinh.
  - **Six Yao Analysis Orchestrator:** Điều phối phân tích toàn diện 6 hào, Bát Cung, Nạp Giáp, Lục Thân, Lục Thú, Vượng Tướng Hưu Tù Tử theo mùa, Ám Động, Nhật Phá, Nguyệt Phá, Hóa Tiến/Thoái.
  - **Interpretation Engine:** Luận giải tổng hợp theo 7 quy tắc hào động của Chu Hi, Thể Dụng sinh khắc, Thế Ứng và Kinh văn cổ điển.
- **Tầng Cơ Sở Dữ Liệu Ngoại Tuyến (`@kindich/database`):**
  - Adapter Dexie IndexedDB cho Web với migration tự động từ v1 lên v2 và v3.
  - Snapshot bất biến kết quả quẻ và đồ bản Lục Hào lưu kèm `ruleSetId` và `algorithmVersion`.
  - Hệ thống Sao lưu & Khôi phục dữ liệu qua tệp JSON tiêu chuẩn có mã băm bảo vệ.
- **Ứng Dụng Web PWA (`apps/web`):**
  - Giao diện người dùng responsive với Design System chuẩn Bắc Hà Tân An (Crimson & Gold).
  - Hỗ trợ Progressive Web App với Service Worker hoạt động ngoại tuyến 100%.
  - Quản lý ghi chú, câu hỏi chiêm bốc với 6 danh mục và nghiệm lý thực tế.
- **Ứng Dụng Di Động (`apps/mobile`):**
  - Phát triển bằng React Native + Expo tương thích cả Android và iOS.
  - Nâng cấp đồng bộ tương thích với Expo Go SDK 58.
  - Tích hợp cơ sở dữ liệu SQLite cục bộ thông qua `expo-sqlite` / `better-sqlite3`.
  - 6 màn hình chức năng: Trang chủ, Lập quẻ seri tiền, Lập quẻ giờ động tâm, Kết quả chi tiết, Lịch sử, Cài đặt.
- **Ứng Dụng Máy Tính Windows (`apps/desktop`):**
  - Phát triển bằng Tauri 2 + Rust Native Shell + React 19 + TypeScript.
  - Tích hợp SQLite native thông qua `@tauri-apps/plugin-sql` lưu trữ tại `%APPDATA%\com.kindich.desktop\`.
  - Bổ sung thanh Application Menu Bar (File, View, Settings, Help), phím tắt nhanh và bộ điều khiển Zoom giao diện (80% đến 150%).
- **Settings Module Đa Nền Tảng:**
  - Cài đặt giao diện: Chế độ Sáng / Tối / Tự động, Ngôn ngữ (Việt, Hán, Anh), Cỡ chữ (Nhỏ, Vừa, Lớn).
  - Cài đặt lập quẻ: Phương pháp mặc định, hiển thị RuleSet và thuật toán.
  - Cài đặt lịch pháp: Múi giờ, Quy tắc chuyển ngày (23:00 / 00:00), Quy tắc tháng nhuận (Tiết Khí / Lịch vạn niên).
  - Quản lý dữ liệu & Xem dung lượng: Thống kê số quẻ, số ghi chú, dung lượng bộ nhớ cục bộ.
  - Nút Khôi phục cài đặt mặc định với hộp thoại xác nhận.

### Đã Thay Đổi & Tối Ưu Hóa (Changed & Optimized)
- **Tối ưu Kích thước Bundle (Code Splitting):**
  - Web: Giảm kích thước entry JavaScript từ **602.74 kB** xuống **21.94 kB** (giảm 93.2%), triệt tiêu cảnh báo bundle vượt ngưỡng của Vite.
  - Desktop: Giảm kích thước entry JavaScript từ **644.46 kB** xuống **16.22 kB** (giảm 97.5%).
  - Phân tách thành các gói nạp động: `DivinationHistoryView`, `SettingsView`, `BackupRestoreModal`.
- **Tối ưu Calendar Engine:**
  - Thay thế việc tạo mới `new Intl.DateTimeFormat` liên tục bằng bộ đệm singleton `VN_DATE_FORMATTER`, tăng tốc gấp 10 lần (chỉ còn 6.61 µs/lần gọi).
- **Tối ưu Tra cứu Quẻ Domain:**
  - Bổ sung bảng băm `HEXAGRAM_BY_NAME_MAP` giúp hàm `getHexagramByName()` đạt tốc độ tra cứu $O(1)$ thay vì quét mảng tuần tự.
- **Tối ưu Truy vấn SQLite:**
  - Bổ sung 3 chỉ mục quan trọng: `idx_divinations_created_at`, `idx_divinations_method`, `idx_notes_divination_id`.

### Đã Sửa Lỗi (Fixed)
- Sửa lỗi tương thích Expo Go SDK 58 trên nền tảng Mobile.
- Sửa lỗi xử lý sự kiện trong phần tử `<select>` của giao diện Settings.
- Sửa lỗi tràn bộ nhớ khi lưu trữ các cấu hình cài đặt cục bộ.

### An Toàn & Hoạt Động Ngoại Tuyến (Security & Offline)
- Kiểm thử toàn diện 745/745 bài test tự động trên tất cả 9 workspaces.
- Xác nhận 100% tính năng lập quẻ, lịch pháp và phân tích Lục Hào hoạt động ngoại tuyến, không gửi bất kỳ dữ liệu cá nhân nào lên Internet.
