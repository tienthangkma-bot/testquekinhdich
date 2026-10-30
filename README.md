# Bắc Hà Tân An Phái - Ứng dụng Kinh Dịch Đa Nền Tảng (Offline-First)

Ứng dụng hỗ trợ lập và phân tích quẻ Kinh Dịch đa nền tảng, thiết kế theo kiến trúc monorepo với tiêu chí offline-first, tách bạch giữa core engine, nghiệp vụ luận giải và tầng hiển thị/cơ sở dữ liệu.

## Cấu trúc Monorepo

```text
bac-ha-tan-an-phai/
├── apps/
│   ├── web/          # Ứng dụng Web (React + Vite)
│   ├── mobile/       # Ứng dụng Mobile (React Native + Expo)
│   └── desktop/      # Ứng dụng Desktop Windows (Tauri 2 + React)
├── packages/
│   ├── domain/       # Các Entity, Value Object, Schema và Type định nghĩa nghiệp vụ
│   ├── core/         # Core Engine Kinh Dịch (Lập quẻ, biến quẻ, Lục Hào, Mai Hoa...)
│   ├── calendar/     # Xử lý âm dương lịch, tiết khí, can chi (Nhật Thần, Nguyệt Kiến)
│   ├── database/     # Adapter lưu trữ (IndexedDB/Dexie cho Web, SQLite cho Mobile/Desktop)
│   └── shared/       # Các hàm tiện ích dùng chung
├── docs/             # Tài liệu kiến trúc, thuật toán và nghiên cứu Kinh Dịch
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Nguyên tắc kiến trúc

1. **Offline-first**: Toàn bộ thuật toán lập quẻ, nạp giáp, ngũ hành, lục hào vận hành độc lập không phụ thuộc Internet.
2. **Core Engine dùng chung**: Thuật toán được đóng gói trong `packages/core` và `packages/domain`, tái sử dụng 100% trên Web, Mobile và Desktop.
3. **Phiên bản hóa thuật toán**: Các phương pháp lập quẻ (như `SERIAL-MOD8-V1`, Mai Hoa) tuân thủ đúng công thức và được đánh version rõ ràng.
4. **Kiểm chứng dữ liệu**: Dữ liệu Kinh Dịch, Bát Quái, Lục Hào, Can Chi được xác thực chặt chẽ, không tự tạo dữ liệu chưa có căn cứ.

## Yêu cầu môi trường & Cài đặt

- **Node.js**: >= 20.x (khuyến nghị >= 22.x)
- **Package Manager**: pnpm (`npm install -g pnpm`)

```bash
# Cài đặt dependencies
pnpm install

# Kiểm tra kiểu dữ liệu toàn bộ workspace
pnpm typecheck
```
