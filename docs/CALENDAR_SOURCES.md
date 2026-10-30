# Tài Liệu Căn Cứ Khoa Học & Nguồn Dữ Liệu Lịch Âm Dương Việt Nam

Tài liệu này ghi nhận đầy đủ nguồn gốc, cơ sở toán thiên văn học, căn cứ pháp lý và giấy phép bản quyền của **Calendar Engine** (`packages/calendar`) trong dự án **Bắc Hà Tân An Phái**.

---

## 1. Thư Viện Nền Tảng & Giấy Phép Bản Quyền

- **Tên gói thư viện**: `@lunar-calendar/sdk` (phiên bản `^0.2.0`)
- **Tác giả / Duy trì**: Phillip Tran (`philliptran1402`, email: `phitranviet99@gmail.com`)
- **Kho mã nguồn**: [GitHub - phillip-tech-labs/lunar-calendar](https://github.com/phillip-tech-labs/lunar-calendar/tree/main/packages/sdk)
- **Giấy phép (License)**: **MIT License** (Tự do sử dụng thương mại, phi thương mại, chỉnh sửa và tích hợp mã nguồn đóng/mở).
- **Đặc tính kỹ thuật**:
  - Không có phụ thuộc bên thứ ba (Zero-dependency).
  - Tự chứa mô hình tính vị trí Mặt Trăng và Mặt Trời (ephemeris) với độ chính xác cao.
  - Hỗ trợ đầy đủ múi giờ chính thức Việt Nam (GMT+7 / UTC+7).
  - Viết bằng TypeScript với kiểu dữ liệu tĩnh nghiêm ngặt.

---

## 2. Cơ Sở Toán Học & Thiên Văn Học

Thuật toán tính lịch âm dương trong gói dựa trên các công trình thiên văn học chuẩn quốc tế:

1. **Jean Meeus – *Astronomical Algorithms*** (Willmann-Bell, 1991, 1998):
   - **Chương 7 (Julian Day Number)**: Quy đổi ngày tháng sang số ngày Julius liên tục để tính toán chu kỳ tuần hoàn chính xác.
   - **Chương 49 (Phases of the Moon)**: Công thức xác định thời điểm chính xác của pha Trăng Mới (thời điểm Sóc - New Moon) tính theo múi giờ quốc tế UTC.
   - **Chương 25 (Solar Coordinates)**: Tính kinh độ biểu kiến của Mặt Trời ($\lambda$) để xác định 24 Tiết Khí và 12 Trung Khí (Major Solar Terms).
2. **VSOP87 (Variations Séculaires des Orbites Planétaires)** của Đài Thiên văn Paris (Bureau des Longitudes) để bù trừ nhiễu loạn hành tinh.
3. **Cơ sở nghiên cứu lịch Âm Việt Nam của Hồ Ngọc Đức** (Đại học Leipzig, 2000–2004, Public Domain):
   - Thuật toán xác định tháng âm lịch bằng cách định vị thời điểm Sóc theo giờ địa phương Việt Nam ($105^\circ\text{Đ}$, UTC+7).
   - Quy tắc tháng nhuận: Tháng âm lịch nào không chứa **Trung Khí** (kinh độ Mặt Trời là bội số của $30^\circ$, gồm Vũ Thủy $330^\circ$, Xuân Phân $0^\circ$, Cốc Vũ $30^\circ$, Tiểu Mãn $60^\circ$, Hạ Chí $90^\circ$, Đại Thử $120^\circ$, Xử Thử $150^\circ$, Thu Phân $180^\circ$, Sương Giáng $210^\circ$, Tiểu Tuyết $240^\circ$, Đông Chí $270^\circ$, Đại Hàn $300^\circ$) sẽ được quy định là **tháng nhuận**.
   - Tiết **Đông Chí** ($270^\circ$) luôn nằm trong tháng 11 âm lịch (tháng Một).

---

## 3. Căn Cứ Pháp Lý & Múi Giờ Lịch Việt Nam (`Asia/Ho_Chi_Minh`)

Lịch Âm Việt Nam sử dụng kinh tuyến $105^\circ$ Đông làm kinh tuyến chuẩn cho múi giờ quốc gia (UTC+7 / `Asia/Ho_Chi_Minh`).

- **Quyết định 121/CP** ngày 08/08/1967 của Hội đồng Chính phủ Việt Nam Dân chủ Cộng hòa (có hiệu lực từ 01/01/1968):
  > *Điều 3: Việc tính lịch âm của Việt Nam phải căn cứ theo giờ chính thức của Việt Nam (múi giờ thứ 7).*
- **Quyết định 134/2002/QĐ-TTg** ngày 14/10/2002 của Thủ tướng Chính phủ tái khẳng định múi giờ chuẩn quốc gia là UTC+7.

### Sự Khác Biệt Giữa Âm Lịch Việt Nam (UTC+7) Và Âm Lịch Trung Quốc (UTC+8)

Do Việt Nam nằm ở múi giờ UTC+7 và Trung Quốc ở UTC+8 (chênh nhau đúng 60 phút):
- Nếu thời điểm Trăng Mới (Sóc) hoặc thời điểm chuyển Trung Khí rơi vào khoảng thời gian từ **16:00 đến 17:00 UTC**:
  - Tại Việt Nam: Giờ địa phương là **23:00 đến 24:00 ngày $D$** $\rightarrow$ Ngày mùng 1 âm lịch bắt đầu từ ngày $D$.
  - Tại Trung Quốc: Giờ địa phương là **00:00 đến 01:00 ngày $D+1$** $\rightarrow$ Ngày mùng 1 âm lịch rơi vào ngày $D+1$.
- Các mốc lịch sử thực tế chứng minh sự sai lệch này:
  - **Tết Mậu Thân 1968**: Mùng 1 Tết tại Việt Nam là ngày **29/01/1968**, trong khi Trung Quốc là ngày **30/01/1968**.
  - **Tết Ất Sửu 1985**: Tháng nhuận rơi khác nhau giữa 2 múi giờ, dẫn tới Việt Nam đón Tết sớm hơn Trung Quốc trọn vẹn 1 tháng (21/01/1985 ở Việt Nam so với 20/02/1985 ở Trung Quốc).
  - **Tết Đinh Hợi 2007**: Việt Nam ăn Tết ngày 17/02/2007, Trung Quốc ngày 18/02/2007.

Do đó, các thư viện lịch âm gốc Trung Quốc (như `lunar-javascript`) không thể áp dụng trực tiếp cho người dùng Việt Nam nếu không điều chỉnh múi giờ thiên văn về UTC+7.

---

## 4. Bộ Quy Tắc Can Chi Truyền Thống (`VN-LUNAR-V1`)

1. **Can Chi Năm**:
   - $\text{CanNăm} = (\text{Năm} + 6) \pmod{10}$ (0: Giáp, 1: Ất ... 9: Quý).
   - $\text{ChiNăm} = (\text{Năm} + 8) \pmod{12}$ (0: Tý, 1: Sửu ... 11: Hợi).
   - Con Giáp: 12 con vật Việt Nam (Tý: Chuột, Sửu: Trâu, Dần: Hổ, Mão: Mèo, Thìn: Rồng, Tỵ: Rắn, Ngọ: Ngựa, Mùi: Dê, Thân: Khỉ, Dậu: Gà, Tuất: Chó, Hợi: Lợn).
2. **Can Chi Tháng (Quy tắc Ngũ Hổ Độn)**:
   - Chi tháng cố định: Tháng 1 là Dần, Tháng 2 là Mão ... Tháng 11 là Tý, Tháng 12 là Sửu.
   - Can tháng dựa vào Can của năm:
     - Năm Giáp, Kỷ: Tháng Giêng khởi Bính Dần.
     - Năm Ất, Canh: Tháng Giêng khởi Mậu Dần.
     - Năm Bính, Tân: Tháng Giêng khởi Canh Dần.
     - Năm Đinh, Nhâm: Tháng Giêng khởi Nhâm Dần.
     - Năm Mậu, Quý: Tháng Giêng khởi Giáp Dần.
     - Công thức tổng quát: $\text{CanTháng} = (\text{CanNăm} \times 2 + \text{Tháng} + 1) \pmod{10}$.
3. **Can Chi Ngày (Nhật Thần)**:
   - Dựa trên số ngày Julius nguyên ($JD$):
   - $\text{CanNgày} = (JD + 9) \pmod{10}$.
   - $\text{ChiNgày} = (JD + 1) \pmod{12}$.
4. **12 Địa Chi Giờ**:
   - 24 giờ được chia thành 12 canh giờ đôi:
     - Giờ Tý: 23:00 – 00:59
     - Giờ Sửu: 01:00 – 02:59
     - Giờ Dần: 03:00 – 04:59
     - Giờ Mão: 05:00 – 06:59
     - Giờ Thìn: 07:00 – 08:59
     - Giờ Tỵ: 09:00 – 10:59
     - Giờ Ngọ: 11:00 – 12:59
     - Giờ Mùi: 13:00 – 14:59
     - Giờ Thân: 15:00 – 16:59
     - Giờ Dậu: 17:00 – 18:59
     - Giờ Tuất: 19:00 – 20:59
     - Giờ Hợi: 21:00 – 22:59
   - Công thức xác định chỉ số Chi giờ: $\text{ChiGiờ} = \lfloor \frac{\text{Giờ} + 1}{2} \rfloor \pmod{12}$.
5. **Can Chi Giờ (Quy tắc Ngũ Thử Độn)**:
   - Can giờ dựa vào Can của ngày:
     - Ngày Giáp, Kỷ: Giờ Tý khởi Giáp Tý.
     - Ngày Ất, Canh: Giờ Tý khởi Bính Tý.
     - Ngày Bính, Tân: Giờ Tý khởi Mậu Tý.
     - Ngày Đinh, Nhâm: Giờ Tý khởi Canh Tý.
     - Ngày Mậu, Quý: Giờ Tý khởi Nhâm Tý.
     - Công thức tổng quát: $\text{CanGiờ} = (\text{CanNgày} \times 2 + \text{ChiGiờ}) \pmod{10}$.
6. **Quy Tắc Chuyển Ngày Tại Giờ Tý (23:00)**:
   - Trong Dịch học, Mai Hoa Dịch Số và Tử Vi: Giờ Tý bắt đầu từ 23:00 hôm trước.
   - Chế độ `'RAT_HOUR_23'` (mặc định): Từ 23:00, ngày âm lịch và Can Chi ngày được tự động chuyển sang ngày tiếp theo, đảm bảo tính chuẩn xác cho việc khởi quẻ Dịch học.
   - Chế độ `'MIDNIGHT'`: Chuyển ngày lúc 00:00 phục vụ đối chiếu hành chính dân dụng (phân biệt Dạ Tý và Chính Tý).
