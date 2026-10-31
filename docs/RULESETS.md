# CÁC BỘ QUY TẮC KINH DỊCH & NGUỒN THAM KHẢO
## Dự án: Kinh Dịch - Bắc Hà Tân An Phái
**Phiên bản tài liệu:** 1.0.0  
**Ngày cập nhật:** 31/10/2026  
**Nguyên tắc bảo toàn:** Giữ nguyên vẹn kinh điển cổ pháp, minh bạch hóa giữa quy tắc đã xác minh và quy tắc đang khảo dị

---

## 1. DANH MỤC CÁC BỘ QUY TẮC ĐANG ÁP DỤNG TRONG CODEBASE

### 1.1. `BO_PHE_CHINH_TONG_V1` (Bộ quy tắc Phân tích Lục Hào Cổ Pháp)
- **Nguồn gốc học thuật:** Kết hợp hai pho sách kinh điển thời Minh - Thanh: *Bốc Phệ Chính Tông* (Vương Duy Đức) và *Tăng San Bốc Dịch* (Dã Hạc Đạo Nhân truyền dạy, Lý Văn Huy san định).
- **Phạm vi quản lý trong codebase:**
  - Định vị Bát Cung 64 quẻ, Cung bản mệnh, Quái Thân.
  - Phân định thứ tự hào Thế và hào Ứng.
  - Nạp Giáp Can Chi Kinh Phòng cho 6 hào.
  - Phối ngũ hành Lục Thân (Phụ Mẫu, Huynh Đệ, Tử Tôn, Thê Tài, Quan Quỷ).
  - Khởi Lục Thú theo Thiên Can ngày (Thanh Long, Chu Tước, Câu Trần, Đằng Xà, Bạch Hổ, Huyền Vũ).
  - Xét lực sinh khắc Nhật Thần, Nguyệt Kiến, Tuần Không, Ám Động, Nhật Phá, Nguyệt Phá.
  - Phân tích hào động biến (Hóa Tiến, Hóa Thoái, Hóa Hồi Đầu Khắc/Sinh).

### 1.2. `MAI-HUA-V1` (Bộ quy tắc Mai Hoa Dịch Số)
- **Nguồn gốc học thuật:** Tương truyền do danh nho Thiệu Ung (Thiệu Khang Tiết - Bắc Tống) trước tác.
- **Phạm vi quản lý trong codebase:**
  - Quy số Bát Quái Tiên Thiên: 1 Càn, 2 Đoài, 3 Ly, 4 Chấn, 5 Tốn, 6 Khảm, 7 Cấn, 8 Khôn.
  - Lập quẻ theo số lý thời gian (Năm, Tháng, Ngày, Giờ âm lịch).
  - Phân chia Thể Quái (quái chủ, bất biến) và Dụng Quái (quái khách, biến động).
  - Phân tích tương quan sinh khắc giữa Ngũ hành của Thể và Dụng:
    - *Thể sinh Dụng:* Hao tổn nguyên khí, thoái tài.
    - *Dụng sinh Thể:* Được sinh phù, quý nhân giúp đỡ, đại cát.
    - *Thể khắc Dụng:* Vất vả nhưng thành công, chế ngự được sự việc.
    - *Dụng khắc Thể:* Hung hiểm, áp lực, thất bại.
    - *Thể Dụng tỷ hòa:* Đồng khí tương cầu, thuận lợi bình hòa.

### 1.3. `CHU_HI_V1` (Bộ quy tắc Luận giải theo Chu Dịch Bản Nghĩa)
- **Nguồn gốc học thuật:** Chu Dịch Bản Nghĩa do Chu Hi (Nam Tống) khảo cứu và hệ thống hóa.
- **Phạm vi quản lý trong codebase:**
  - Quy tắc phân bổ trọng tâm kinh văn căn cứ theo số lượng hào động (từ 0 hào động đến 6 hào động toàn biến).
  - Xác định đọc Thoán từ quẻ chủ, Hào từ quẻ chủ, hay Thoán từ/Hào từ quẻ biến.

---

## 2. NGUỒN TƯ LIỆU CỔ BẢN THAM KHẢO

Toàn bộ thuật toán và dữ liệu trong dự án được đối chiếu nghiêm ngặt với các tài liệu Hán Nôm và bản dịch chính thống:

1. **Chu Dịch Chính Nghĩa (周易正義) - 14 quyển:** Khổng Dĩnh Đạt (Đường triều) phụng chiếu biên soạn. Định chuẩn thứ tự 64 Quẻ Văn Vương, Thoán Từ, Đại Tượng Từ, Tiểu Tượng Từ và Hào Từ.
2. **Bốc Phệ Chính Tông (卜筮正宗) - 14 quyển:** Vương Duy Đức (Thanh triều). Khẩu quyết Nạp Giáp, an Lục Thân, Lục Thú, Ngũ Hành Vượng Tướng Hưu Tù Tử, Hoàng Kim Sách.
3. **Tăng San Bốc Dịch (增刪卜易) - 4 quyển:** Dã Hạc Đạo Nhân khảo nghiệm hơn 40 năm, Lý Văn Huy biên tập (Thanh triều Khang Hy). Chuẩn tắc thực chứng chiêm bốc Lục Hào, Nhật Thần, Nguyệt Kiến, Tuần Không, Ám Động, Phi Phục Thần.
4. **Mai Hoa Dịch Số (梅花易數):** Thiệu Khang Tiết trước tác. Bản in Cổ học tùng thư.
5. **Chu Dịch Bản Nghĩa (周易本義):** Chu Hi. Khảo cứu thứ tự quái hào và phương pháp đoán quẻ cổ pháp.
6. **Kinh Dịch - Đạo của người quân tử:** Học giả Nguyễn Hiến Lê khảo dịch (NXB Văn học).
7. **Kinh Dịch trọn bộ:** Học giả Ngô Tất Tố dịch và chú giải (NXB Văn hóa Thông tin).

---

## 3. BẢNG PHÂN ĐỊNH QUY TẮC ĐÃ XÁC MINH VS CHƯA XÁC MINH

Nhằm tuân thủ nguyên tắc trung thực và minh bạch học thuật, hệ thống phân định rõ ràng:

### 3.1. Các quy tắc ĐÃ XÁC MINH (Verified Canonical Rules)
*Những quy tắc này đã được đối chiếu khớp 100% giữa các văn bản cổ và kiểm thử tự động với 745+ test cases:*

| Quy tắc | Căn cứ văn bản | Kết quả đối soát trong Codebase |
| :--- | :--- | :--- |
| **Thứ tự 64 Quẻ Văn Vương** | Chu Dịch Chính Nghĩa | Mảng `HEXAGRAMS` từ #1 (Thuần Càn) đến #64 (Hỏa Thủy Vị Tế). |
| **Bát Cung 64 Quẻ** | Bốc Phệ Chính Tông | 8 Cung Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài. Mỗi cung 8 quẻ chuẩn xác. |
| **Hào Thế & Hào Ứng** | Kinh Phòng Dịch Truyện | Định vị chính xác hào Thế/Ứng từ Sơ hào đến Ngũ hào, Du Hồn (hào 4), Quy Hồn (hào 3). |
| **Nạp Giáp Can Chi** | Bốc Phệ Chính Tông | Càn nạp Giáp/Nhâm, Khôn nạp Ất/Quý, Cấn Bính, Đoài Đinh, Khảm Mậu, Ly Kỷ, Chấn Canh, Tốn Tân. |
| **Ngũ Hành Lục Thân** | Tăng San Bốc Dịch | So sánh ngũ hành chi của hào với ngũ hành bản mệnh của Bát Cung. |
| **Khởi Lục Thú** | Bốc Phệ Chính Tông | Giáp Ất - Long, Bính Đinh - Tước, Mậu - Trần, Kỷ - Xà, Canh Tân - Hổ, Nhâm Quý - Vũ. |
| **Tuần Không (Không Vong)** | Lục Thập Hoa Giáp | 6 tuần Giáp (Giáp Tý, Giáp Tuất, Giáp Thân, Giáp Ngọ, Giáp Thìn, Giáp Dần). |
| **Mùa & Lệnh Tháng Vượng Suy** | Tăng San Bốc Dịch | Xuân (Mộc vượng, Hỏa tướng), Hạ (Hỏa vượng, Thổ tướng), Thu (Kim vượng, Thủy tướng), Đông (Thủy vượng, Mộc tướng), Tứ Quý (Thổ vượng, Kim tướng). |
| **Thượng/Hạ Quẻ Hỗ** | Hệ Từ Thượng Truyện | Hào 2-3-4 làm Hạ quái hỗ; Hào 3-4-5 làm Thượng quái hỗ. |
| **Toán học SERIAL-MOD8-V1** | Bốc Phệ / Số học Dịch | Lẻ (Dương) tính Thượng; Chẵn (Âm) tính Hạ; Tổng tính Hào động. |

---

### 3.2. Các quy tắc CHƯA XÁC MINH HOÀN TOÀN / ĐANG KHẢO DỊ (Under Academic Verification)
*Những quy tắc này có sự dị biệt giữa các trường phái hoặc thiếu sự đồng thuận tuyệt đối trong tư liệu, hiện được cấu hình linh hoạt hoặc gắn nhãn khuyến cáo:*

| Quy tắc | Vấn đề khảo dị học thuật | Cách xử lý trong Codebase hiện tại |
| :--- | :--- | :--- |
| **Quy tắc Chuyển ngày Giờ Tý (23:00 vs 00:00)** | Trong Dịch học và Tử vi truyền thống, giờ Tý bắt đầu từ 23h00 đêm hôm trước. Tuy nhiên, một số nhà nghiên cứu hiện đại chia thành *Dạ Tý (23h-24h)* thuộc ngày cũ và *Chính Tý (0h-1h)* thuộc ngày mới theo lịch pháp hành chính phương Tây. | Cung cấp tùy chọn cấu hình trong **Settings Module** (`calendar.dayTransitionRule`), đặt mặc định là cổ pháp `23:00`. |
| **Quy tắc Tháng Nhuận Can Chi** | Tranh luận giữa việc tính Can Chi tháng thuần túy theo **Tiết Khí thiên văn** (Mặt Trời qua 24 điểm phân chí) hay tính theo **quy ước Lịch Vạn Niên** (tháng nhuận lấy Can Chi của tháng chính). | Hỗ trợ cấu hình `calendar.leapMonthRule`: `TIET_KHI` (mặc định) và `TRUYEN_THONG`. |
| **Phân biệt Chân Không vs Giả Không trong Ám Động** | Hào rơi vào Tuần Không nhưng được Nhật Thần xung kích: Một số phái cho rằng trở thành Ám Động (hữu dụng), phái khác cho rằng vẫn là Không Phá (vô dụng). | Codebase đánh dấu chi tiết trạng thái `strength.voidStatus` (`CHAN_KHONG` hoặc `GIA_KHONG`) kèm giải trình `rationale` để người dùng tự chiêm nghiệm. |
| **Luận giải Chu Hi khi có 4 hoặc 5 hào động** | Chu Hi quy định đọc hào tĩnh của quẻ biến. Tuy nhiên Dã Hạc Đạo Nhân trong *Tăng San Bốc Dịch* lại chủ trương trong bốc dịch Lục Hào, chỉ cần hào nào phát động thì hào đó phát sinh tác dụng sinh khắc Dụng Thần, không phụ thuộc vào văn từ quẻ biến. | Tách bạch thành 2 tab riêng biệt trên UI: Tab *Luận giải Chu Hi* (theo kinh điển) và Tab *Phân tích Lục Hào* (theo tương quan Dụng Thần ngũ hành). |

---

## 4. TÔN CHỈ BẮC HÀ TÂN AN PHÁI

1. **Trung thực:** Giữ đúng nguyên văn kinh điển, không tự tiện bịa đặt hào từ hay tô vẽ cát hung vô căn cứ.
2. **Khách quan:** Cung cấp dữ liệu tính toán ngũ hành và thiên văn có cơ sở, không đưa ra những lời phán xét mê tín dị đoan.
3. **Khoa học:** Tách bạch rõ ràng giữa tính toán toán học, thiên văn học lịch pháp và triết học diễn giải nhân sinh.
4. **Tôn trọng sự thật:** Mọi quẻ chiêm bốc đều là nhân duyên khi có sự việc động tâm, người xem dùng trí tuệ để tu tâm dưỡng tính và hướng thiện.
