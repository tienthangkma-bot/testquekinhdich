# Tư Liệu Khảo Chứng & Hệ Thống 64 Quẻ Kinh Dịch

Tài liệu này xác lập nguồn tham chiếu chuẩn xác, đối soát học thuật cho hệ thống 64 Quẻ Kinh Dịch (Đại Tượng) được triển khai trong mã nguồn gói `@kindich/domain`.

---

## 1. Nguồn tư liệu tham khảo chính thống

Toàn bộ thứ tự Văn Vương, tên quẻ (Việt - Hán Việt - Chữ Hán), tượng quẻ và cấu trúc quái đơn được đối chiếu chuẩn xác theo các nguồn:

1. **Chu Dịch Chính Nghĩa (周易正義)** - *Khổng Dĩnh Đạt (Đường triều)*: Bản khảo cứu kinh điển xác lập thứ tự Văn Vương và hệ thống Thoán Từ, Hào Từ.
2. **Kinh Dịch - Đạo của người quân tử** - *Học giả Nguyễn Hiến Lê (NXB Văn học, 1990)*: Bản dịch và chú giải học thuật chuẩn mực, đối chiếu kỹ lưỡng danh xưng 64 quẻ.
3. **Kinh Dịch diễn giải** - *Chí sĩ Phan Bội Châu (NXB Văn hóa Thông tin)*: Khảo sát thứ tự Thoán từ, Tượng từ và phối hợp Bát Quái.
4. **The Unicode Standard - Yijing Hexagram Symbols Block**:
   - Dải mã: `U+4DC0` đến `U+4DFF` (64 ký tự Unicode chính thức).
   - Thứ tự mã Unicode được thiết kế trùng khớp hoàn toàn 1:1 với hệ thống số thứ tự Văn Vương (1 = Thuần Càn `U+4DC0`, 64 = Hỏa Thủy Vị Tế `U+4DFF`).

---

## 2. Bảng đối chiếu 64 Quẻ Văn Vương (King Wen Sequence)

| STT | Mã ID | Tên Quẻ | Tên Hán Việt | Chữ Hán | Thượng quái | Hạ quái | Chuỗi 6 hào (từ dưới lên) | Ký hiệu Unicode |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | `HEX_01` | Thuần Càn | Càn vi Thiên | 乾為天 | Càn (☰) | Càn (☰) | 111111 | ䷀ |
| 2 | `HEX_02` | Thuần Khôn | Khôn vi Địa | 坤為地 | Khôn (☷) | Khôn (☷) | 000000 | ䷁ |
| 3 | `HEX_03` | Thủy Lôi Truân | Thủy Lôi Truân | 水雷屯 | Khảm (☵) | Chấn (☳) | 100010 | ䷂ |
| 4 | `HEX_04` | Sơn Thủy Mông | Sơn Thủy Mông | 山水蒙 | Cấn (☶) | Khảm (☵) | 010001 | ䷃ |
| 5 | `HEX_05` | Thủy Thiên Nhu | Thủy Thiên Nhu | 水天需 | Khảm (☵) | Càn (☰) | 111010 | ䷄ |
| 6 | `HEX_06` | Thiên Thủy Tụng | Thiên Thủy Tụng | 天水訟 | Càn (☰) | Khảm (☵) | 010111 | ䷅ |
| 7 | `HEX_07` | Địa Thủy Sư | Địa Thủy Sư | 地水師 | Khôn (☷) | Khảm (☵) | 010000 | ䷆ |
| 8 | `HEX_08` | Thủy Địa Tỷ | Thủy Địa Tỷ | 水地比 | Khảm (☵) | Khôn (☷) | 000010 | ䷇ |
| 9 | `HEX_09` | Phong Thiên Tiểu Súc | Phong Thiên Tiểu Súc | 風天小畜 | Tốn (☴) | Càn (☰) | 111011 | ䷈ |
| 10 | `HEX_10` | Thiên Trạch Lý | Thiên Trạch Lý | 天澤履 | Càn (☰) | Đoài (☱) | 110111 | ䷉ |
| 11 | `HEX_11` | Địa Thiên Thái | Địa Thiên Thái | 地天泰 | Khôn (☷) | Càn (☰) | 111000 | ䷊ |
| 12 | `HEX_12` | Thiên Địa Bĩ | Thiên Địa Bĩ | 天地否 | Càn (☰) | Khôn (☷) | 000111 | ䷋ |
| 13 | `HEX_13` | Thiên Hỏa Đồng Nhân | Thiên Hỏa Đồng Nhân | 天火同人 | Càn (☰) | Ly (☲) | 101111 | ䷌ |
| 14 | `HEX_14` | Hỏa Thiên Đại Hữu | Hỏa Thiên Đại Hữu | 火天大有 | Ly (☲) | Càn (☰) | 111101 | ䷍ |
| 15 | `HEX_15` | Địa Sơn Khiêm | Địa Sơn Khiêm | 地山謙 | Khôn (☷) | Cấn (☶) | 001000 | ䷎ |
| 16 | `HEX_16` | Lôi Địa Dự | Lôi Địa Dự | 雷地豫 | Chấn (☳) | Khôn (☷) | 000100 | ䷏ |
| 17 | `HEX_17` | Trạch Lôi Tùy | Trạch Lôi Tùy | 澤雷隨 | Đoài (☱) | Chấn (☳) | 100110 | ䷐ |
| 18 | `HEX_18` | Sơn Phong Cổ | Sơn Phong Cổ | 山風蠱 | Cấn (☶) | Tốn (☴) | 011001 | ䷑ |
| 19 | `HEX_19` | Địa Trạch Lâm | Địa Trạch Lâm | 地澤臨 | Khôn (☷) | Đoài (☱) | 110000 | ䷒ |
| 20 | `HEX_20` | Phong Địa Quan | Phong Địa Quan | 風地觀 | Tốn (☴) | Khôn (☷) | 000011 | ䷓ |
| 21 | `HEX_21` | Hỏa Lôi Phệ Hạp | Hỏa Lôi Phệ Hạp | 火雷噬嗑 | Ly (☲) | Chấn (☳) | 100101 | ䷔ |
| 22 | `HEX_22` | Sơn Hỏa Bí | Sơn Hỏa Bí | 山火賁 | Cấn (☶) | Ly (☲) | 101001 | ䷕ |
| 23 | `HEX_23` | Sơn Địa Bác | Sơn Địa Bác | 山地剝 | Cấn (☶) | Khôn (☷) | 000001 | ䷖ |
| 24 | `HEX_24` | Địa Lôi Phục | Địa Lôi Phục | 地雷復 | Khôn (☷) | Chấn (☳) | 100000 | ䷗ |
| 25 | `HEX_25` | Thiên Lôi Vô Vọng | Thiên Lôi Vô Vọng | 天雷無妄 | Càn (☰) | Chấn (☳) | 100111 | ䷘ |
| 26 | `HEX_26` | Sơn Thiên Đại Súc | Sơn Thiên Đại Súc | 山天大畜 | Cấn (☶) | Càn (☰) | 111001 | ䷙ |
| 27 | `HEX_27` | Sơn Lôi Di | Sơn Lôi Di | 山雷頤 | Cấn (☶) | Chấn (☳) | 100001 | ䷚ |
| 28 | `HEX_28` | Trạch Phong Đại Quá | Trạch Phong Đại Quá | 澤風大過 | Đoài (☱) | Tốn (☴) | 011110 | ䷛ |
| 29 | `HEX_29` | Thuần Khảm | Khảm vi Thủy | 坎為水 | Khảm (☵) | Khảm (☵) | 010010 | ䷜ |
| 30 | `HEX_30` | Thuần Ly | Ly vi Hỏa | 離為火 | Ly (☲) | Ly (☲) | 101101 | ䷝ |
| 31 | `HEX_31` | Trạch Sơn Hàm | Trạch Sơn Hàm | 澤山咸 | Đoài (☱) | Cấn (☶) | 001110 | ䷞ |
| 32 | `HEX_32` | Lôi Phong Hằng | Lôi Phong Hằng | 雷風恆 | Chấn (☳) | Tốn (☴) | 011100 | ䷟ |
| 33 | `HEX_33` | Thiên Sơn Độn | Thiên Sơn Độn | 天山遯 | Càn (☰) | Cấn (☶) | 001111 | ䷠ |
| 34 | `HEX_34` | Lôi Thiên Đại Tráng | Lôi Thiên Đại Tráng | 雷天大壯 | Chấn (☳) | Càn (☰) | 111100 | ䷡ |
| 35 | `HEX_35` | Hỏa Địa Tấn | Hỏa Địa Tấn | 火地晉 | Ly (☲) | Khôn (☷) | 000101 | ䷢ |
| 36 | `HEX_36` | Địa Hỏa Minh Di | Địa Hỏa Minh Di | 地火明夷 | Khôn (☷) | Ly (☲) | 101000 | ䷣ |
| 37 | `HEX_37` | Phong Hỏa Gia Nhân | Phong Hỏa Gia Nhân | 風火家人 | Tốn (☴) | Ly (☲) | 101011 | ䷤ |
| 38 | `HEX_38` | Hỏa Trạch Khuê | Hỏa Trạch Khuê | 火澤睽 | Ly (☲) | Đoài (☱) | 110101 | ䷥ |
| 39 | `HEX_39` | Thủy Sơn Kiển | Thủy Sơn Kiển | 水山蹇 | Khảm (☵) | Cấn (☶) | 001010 | ䷦ |
| 40 | `HEX_40` | Lôi Thủy Giải | Lôi Thủy Giải | 雷水解 | Chấn (☳) | Khảm (☵) | 010100 | ䷧ |
| 41 | `HEX_41` | Sơn Trạch Tổn | Sơn Trạch Tổn | 山澤損 | Cấn (☶) | Đoài (☱) | 110001 | ䷨ |
| 42 | `HEX_42` | Phong Lôi Ích | Phong Lôi Ích | 風雷益 | Tốn (☴) | Chấn (☳) | 100011 | ䷩ |
| 43 | `HEX_43` | Trạch Thiên Quải | Trạch Thiên Quải | 澤天夬 | Đoài (☱) | Càn (☰) | 111110 | ䷪ |
| 44 | `HEX_44` | Thiên Phong Cấu | Thiên Phong Cấu | 天風姤 | Càn (☰) | Tốn (☴) | 011111 | ䷫ |
| 45 | `HEX_45` | Trạch Địa Tụy | Trạch Địa Tụy | 澤地萃 | Đoài (☱) | Khôn (☷) | 000110 | ䷬ |
| 46 | `HEX_46` | Địa Phong Thăng | Địa Phong Thăng | 地風升 | Khôn (☷) | Tốn (☴) | 011000 | ䷭ |
| 47 | `HEX_47` | Trạch Thủy Khốn | Trạch Thủy Khốn | 澤水困 | Đoài (☱) | Khảm (☵) | 010110 | ䷮ |
| 48 | `HEX_48` | Thủy Phong Tỉnh | Thủy Phong Tỉnh | 水風井 | Khảm (☵) | Tốn (☴) | 011010 | ䷯ |
| 49 | `HEX_49` | Trạch Hỏa Cách | Trạch Hỏa Cách | 澤火革 | Đoài (☱) | Ly (☲) | 101110 | ䷰ |
| 50 | `HEX_50` | Hỏa Phong Đỉnh | Hỏa Phong Đỉnh | 火風鼎 | Ly (☲) | Tốn (☴) | 011101 | ䷱ |
| 51 | `HEX_51` | Thuần Chấn | Chấn vi Lôi | 震為雷 | Chấn (☳) | Chấn (☳) | 100100 | ䷲ |
| 52 | `HEX_52` | Thuần Cấn | Cấn vi Sơn | 艮為山 | Cấn (☶) | Cấn (☶) | 001001 | ䷳ |
| 53 | `HEX_53` | Phong Sơn Tiệm | Phong Sơn Tiệm | 風山漸 | Tốn (☴) | Cấn (☶) | 001011 | ䷴ |
| 54 | `HEX_54` | Lôi Trạch Quy Muội | Lôi Trạch Quy Muội | 雷澤歸妹 | Chấn (☳) | Đoài (☱) | 110100 | ䷵ |
| 55 | `HEX_55` | Lôi Hỏa Phong | Lôi Hỏa Phong | 雷火豐 | Chấn (☳) | Ly (☲) | 101100 | ䷶ |
| 56 | `HEX_56` | Hỏa Sơn Lữ | Hỏa Sơn Lữ | 火山旅 | Ly (☲) | Cấn (☶) | 001101 | ䷷ |
| 57 | `HEX_57` | Thuần Tốn | Tốn vi Phong | 巽為風 | Tốn (☴) | Tốn (☴) | 011011 | ䷸ |
| 58 | `HEX_58` | Thuần Đoài | Đoài vi Trạch | 兌為澤 | Đoài (☱) | Đoài (☱) | 110110 | ䷹ |
| 59 | `HEX_59` | Phong Thủy Hoán | Phong Thủy Hoán | 風水渙 | Tốn (☴) | Khảm (☵) | 010011 | ䷺ |
| 60 | `HEX_60` | Thủy Trạch Tiết | Thủy Trạch Tiết | 水澤節 | Khảm (☵) | Đoài (☱) | 110010 | ䷻ |
| 61 | `HEX_61` | Phong Trạch Trung Phu | Phong Trạch Trung Phu | 風澤中孚 | Tốn (☴) | Đoài (☱) | 110011 | ䷼ |
| 62 | `HEX_62` | Lôi Sơn Tiểu Quá | Lôi Sơn Tiểu Quá | 雷山小過 | Chấn (☳) | Cấn (☶) | 001100 | ䷽ |
| 63 | `HEX_63` | Thủy Hỏa Ký Tế | Thủy Hỏa Ký Tế | 水火既濟 | Khảm (☵) | Ly (☲) | 101010 | ䷾ |
| 64 | `HEX_64` | Hỏa Thủy Vị Tế | Hỏa Thủy Vị Tế | 火水未濟 | Ly (☲) | Khảm (☵) | 010101 | ䷿ |
