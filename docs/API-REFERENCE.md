# TÀI LIỆU API & CÁC GIAO DIỆN (API REFERENCE)
## Dự án: Kinh Dịch - Bắc Hà Tân An Phái
**Phiên bản tài liệu:** 1.0.0  
**Ngày cập nhật:** 31/10/2026  
**Phạm vi:** Tất cả các public interfaces, types và functions trong các packages `@kindich/*`

---

## 1. PACKAGE `@kindich/domain`

Gói nền tảng định nghĩa mô hình thực thể, hằng số, giao diện kho lưu trữ và dữ liệu chuẩn 64 quẻ.

### 1.1. Các Enums Cốt Lõi
```typescript
export enum CastingMethod {
  SERIAL = 'SERIAL', // Lập quẻ bằng số seri tiền polymer
  MAI_HUA = 'MAI_HUA', // Lập quẻ giờ động tâm Mai Hoa
}

export enum FiveElement {
  METAL = 'KIM',
  WATER = 'THUY',
  WOOD = 'MOC',
  FIRE = 'HOA',
  EARTH = 'THO',
}

export enum YinYang {
  YIN = 0, // Vạch đứt (Âm hào)
  YANG = 1, // Vạch liền (Dương hào)
}

export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6; // Hào từ sơ hào (1) đến thượng hào (6)
```

### 1.2. Các Hàm Tra Cứu (Lookup Functions)
```typescript
/** Tra cứu quẻ theo số thứ tự (1 đến 64) */
function getHexagramById(number: number): Hexagram | undefined;

/** Tra cứu quẻ trực tiếp theo tên thuần Việt với tốc độ O(1) */
function getHexagramByName(name: string): Hexagram | undefined;

/** Tra cứu quái theo số Bát Quái Tiên Thiên (1..8) */
function getTrigramByNumber(num: number): Trigram | undefined;
```

### 1.3. Giao diện Kho Lưu Trữ Quẻ (`IDivinationRepository`)
```typescript
export interface IDivinationRepository {
  create(dto: CreateDivinationDto): Promise<DivinationEntity>;
  getById(id: string): Promise<DivinationDetailEntity | null>;
  list(filter?: DivinationFilter, pagination?: PaginationOptions): Promise<PaginatedResult<DivinationSummaryItem>>;
  update(id: string, dto: UpdateDivinationDto): Promise<DivinationEntity>;
  delete(id: string): Promise<boolean>;
  addNote(divinationId: string, dto: CreateNoteDto): Promise<DivinationNoteEntity>;
  updateNote(noteId: string, dto: UpdateNoteDto): Promise<DivinationNoteEntity>;
  deleteNote(noteId: string): Promise<boolean>;
}
```

### 1.4. Giao diện Cài Đặt (`SettingsRepository`)
```typescript
export interface SettingsRepository {
  getSettings(): Promise<KinhDichSettings>;
  saveSettings(partial: Partial<KinhDichSettings>): Promise<KinhDichSettings>;
  resetSettings(): Promise<KinhDichSettings>;
  getStorageStats(): Promise<StorageStats>;
}
```

---

## 2. PACKAGE `@kindich/calendar`

Động cơ thiên văn nông lịch Việt Nam (kinh tuyến 105°E, UTC+7).

### 2.1. `getFullCalendarInfo(dateInput, options)`
Trả về toàn bộ thông tin ngày giờ âm dương, Can Chi 4 trụ, tiết khí và tuần không.
```typescript
function getFullCalendarInfo(
  dateInput: Date | string,
  options?: CalendarOptions
): CalendarConversionResult;
```
**Cấu trúc trả về (`CalendarConversionResult`):**
- `solar`: Ngày, tháng, năm dương lịch.
- `lunar`: Ngày, tháng, năm âm lịch, cờ `isLeap` (tháng nhuận).
- `canChi`:
  - `year`: Can Chi năm (ví dụ: "Bính Ngọ").
  - `month`: Can Chi tháng (ví dụ: "Mậu Tuất").
  - `day`: Can Chi ngày (ví dụ: "Giáp Tý").
  - `hour`: Can Chi giờ (ví dụ: "Kỷ Tỵ").
- `currentHourBranch`: Chi của giờ hiện tại và khoảng thời gian (ví dụ: Giờ Tỵ 09:00 - 11:00).
- `solarTerm`: Tên tiết khí (ví dụ: "Sương Giáng") và kinh độ Mặt Trời.

### 2.2. `calculateVoidBranches(dayStem, dayBranch)`
Tính 2 Địa Chi rơi vào Tuần Không (Không Vong) theo Can Chi của Ngày.
```typescript
function calculateVoidBranches(dayStem: string, dayBranch: string): {
  voidBranches: [string, string];
  weekLeader: string; // Tuần Giáp (ví dụ: "Giáp Tý")
};
```

---

## 3. PACKAGE `@kindich/core`

Toàn bộ thuật toán khởi quẻ và các động cơ điều phối phân tích Lục Hào, Mai Hoa.

### 3.1. `castBySerial(serialNumber)`
Lập quẻ theo số seri tiền polymer theo thuật toán `SERIAL-MOD8-V1`.
```typescript
function castBySerial(serialNumber: string): SerialCastingResult;
```
**Trả về:**
- `serialNumber`: Chuỗi seri đã chuẩn hóa.
- `trio`: Bộ ba quẻ gồm `primary` (quẻ chủ), `transformed` (quẻ biến), `nuclear` (quẻ hỗ).
- `upperTrigram`: Bát quái thượng.
- `lowerTrigram`: Bát quái hạ.
- `movingLine`: Vị trí hào động ($1 \dots 6$).
- `oddSum`: Tổng các chữ số lẻ.
- `evenSum`: Tổng các chữ số chẵn.
- `totalSum`: Tổng toàn bộ chữ số.

### 3.2. `castByMaiHua(input)`
Lập quẻ Mai Hoa Dịch Số theo giờ động tâm.
```typescript
function castByMaiHua(input: MaiHuaCastingInput): MaiHuaCastingResult;
```
**Tham số đầu vào (`MaiHuaCastingInput`):**
- `yearBranch`: Số thứ tự Chi năm ($1 \dots 12$).
- `month`: Tháng âm lịch ($1 \dots 12$).
- `day`: Ngày âm lịch ($1 \dots 30$).
- `hourBranch`: Số thứ tự Chi giờ ($1 \dots 12$).

### 3.3. `orchestrateSixYaoAnalysis(input)`
Động cơ điều phối phân tích Lục Hào chuyên sâu.
```typescript
function orchestrateSixYaoAnalysis(input: SixYaoOrchestratorInput): SixYaoAnalysisResult;
```
**Trả về đồ hình 6 hào đầy đủ (`AnalyzedSixYaoLine`):**
- `position`: Vị trí hào ($1 \dots 6$).
- `canChi`: Can Chi nạp giáp (ví dụ: "Mậu Tý").
- `element`: Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ).
- `fullRelationLabel`: Nhãn Lục Thân (ví dụ: "Thê Tài Mậu Tý (Thủy)").
- `isWorld`: Cờ hào Thế.
- `isResponse`: Cờ hào Ứng.
- `isMoving`: Cờ hào Động.
- `sixSpiritName`: Tên Lục Thú hộ trì (Thanh Long, Chu Tước...).
- `strength`: Trạng thái ngũ hành (`VUONG`, `TUONG`, `HUU`, `TU`, `TU`), `isAmDong`, `isNhatPha`, `voidStatus`.

### 3.4. `interpretHexagram(options)`
Động cơ luận giải tổng hợp 4 phương pháp:
```typescript
function interpretHexagram(options: InterpretationOptions): InterpretationResult;
```
**Kết quả luận giải (`InterpretationResult`):**
- `chuHi`: Luận đoán theo 7 quy tắc hào động Chu Dịch Bản Nghĩa.
- `maiHua`: Luận giải ngũ hành sinh khắc Thể Quái và Dụng Quái.
- `worldResponse`: Luận đoán tương quan vị thế giữa hào Thế và hào Ứng.
- `primaryClassical`: Kinh văn cổ bản (Thoán từ, Tượng từ, Hào từ quẻ chủ).
- `transformedClassical`: Kinh văn quẻ biến.

---

## 4. PACKAGE `@kindich/database`

Tầng lưu trữ cục bộ IndexedDB và công cụ sao lưu dữ liệu.

### 4.1. `KinDichDatabase`
Lớp kế thừa `Dexie` quản lý cơ sở dữ liệu IndexedDB của trình duyệt Web.
- Bảng: `divinations`, `divination_results`, `divination_analyses`, `divination_notes`, `user_settings`.

### 4.2. `exportBackupData(repository, database)`
Xuất toàn bộ cơ sở dữ liệu thành chuỗi JSON tiêu chuẩn.
```typescript
function exportBackupData(
  repository: IDivinationRepository,
  database?: KinDichDatabase
): Promise<KinDichBackupData>;
```

### 4.3. `importBackupData(backupData, repository, database, options)`
Kiểm tra tính hợp lệ và phục hồi dữ liệu từ JSON với các chiến lược xử lý xung đột (`overwrite`, `skip`, `clone`).
```typescript
function importBackupData(
  backupData: KinDichBackupData,
  repository: IDivinationRepository,
  database?: KinDichDatabase,
  options?: ImportOptions
): Promise<ImportSummary>;
```

---

## 5. PACKAGE `@kindich/shared`

Hệ thống Design System và UI Components.

- **Tokens (`theme`):**
  - Bảng màu truyền thống Bắc Hà Tân An: `primary` (#851616 Crimson), `accent` (#B5871D Gold), `background` (#FAF8F5 Sand), `card` (#FFFFFF), `border` (#E2D9CC).
  - Thang kích thước và bo góc (`spacing`, `radius`).
- **Components:**
  - `<Button variant="primary | secondary | outline | ghost" size="sm | md | lg">`
  - `<Card title="..." subtitle="..." padding="sm | md | lg" hoverable>`
  - `<Select options={[ { value, label } ]} value={...} onChange={...}>`
  - `<Input label="..." error="..." fullWidth>`
  - `<Modal isOpen={...} onClose={...} title="...">`
