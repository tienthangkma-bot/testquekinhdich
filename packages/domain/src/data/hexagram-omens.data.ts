/**
 * Dữ liệu chuẩn Điềm Triệu (Lời Triệu) của 64 Quẻ Kinh Dịch
 *
 * Căn cứ khảo dị cổ bản:
 * 1. "Mai Hoa Dịch Số" (Thiệu Ung - phần 64 Quẻ Điềm Triệu)
 * 2. "Bốc Phệ Chính Tông" (Vương Duy Đức)
 * 3. "Dịch Học Tinh Hoa" & Dịch Lâm cổ tịch
 */

export interface HexagramOmen {
  readonly hexagramNumber: number;
  readonly omen: string;
  readonly meaning: string;
}

export const HEXAGRAM_OMENS: readonly HexagramOmen[] = [
  { hexagramNumber: 1, omen: 'Khốn long đắc thủy', meaning: 'Rồng mắc cạn gặp nước, vận thế đại thông' },
  { hexagramNumber: 2, omen: 'Sinh ngộ thái bình', meaning: 'Sinh gặp cảnh thái bình, an vui thịnh trị' },
  { hexagramNumber: 3, omen: 'Loạn ty vô đầu', meaning: 'Mối tơ vò không đầu mối, vạn sự khởi đầu nan' },
  { hexagramNumber: 4, omen: 'U muội ngộ sư', meaning: 'Tối tăm u muội gặp thầy soi đường chỉ lối' },
  { hexagramNumber: 5, omen: 'Minh vân bất vũ', meaning: 'Mây dày đặc chưa mưa, kiên nhẫn đợi thời' },
  { hexagramNumber: 6, omen: 'Nhị nhân phân kim', meaning: 'Hai người chia vàng, đề phòng tranh tụng bất hòa' },
  { hexagramNumber: 7, omen: 'Mã đáo thành công', meaning: 'Ngựa tới thành công, xuất quân đắc thắng' },
  { hexagramNumber: 8, omen: 'Thuyền đắc thuận phong', meaning: 'Thuyền gặp gió thuận, thân mật tương trợ lẫn nhau' },
  { hexagramNumber: 9, omen: 'Mật vân bất vũ', meaning: 'Mây dầy đặc chưa mưa, tích lũy lực lượng nhỏ' },
  { hexagramNumber: 10, omen: 'Phượng minh Kỳ sơn', meaning: 'Chim phượng hót núi Kỳ, đi trên đuôi cọp thận trọng' },
  { hexagramNumber: 11, omen: 'Hỷ báo tam nguyên', meaning: 'Tin mừng đỗ tam nguyên, hanh thông thông suốt' },
  { hexagramNumber: 12, omen: 'Hổ lạc hãm khanh', meaning: 'Cọp rơi xuống hố bẫy, bế tắc gian nan thủ phận' },
  { hexagramNumber: 13, omen: 'Tiên nhân chỉ lộ', meaning: 'Tiên nhân chỉ đường, hòa đồng cùng thiên hạ' },
  { hexagramNumber: 14, omen: 'Kim ngọc mãn đường', meaning: 'Vàng ngọc đầy nhà, đại phú đại quý quang minh' },
  { hexagramNumber: 15, omen: 'Tiệm nhập giai cảnh', meaning: 'Dần vào cảnh đẹp, khiêm tốn hưởng phúc lộc lâu dài' },
  { hexagramNumber: 16, omen: 'Thanh long đắc vị', meaning: 'Rồng xanh được vị thế, vui vẻ hưng khởi thuận thời' },
  { hexagramNumber: 17, omen: 'Khởi bộc đắc kim', meaning: 'Đẩy cối xay ngô được vàng, tùy thuận thời thế' },
  { hexagramNumber: 18, omen: 'Thu thảo phùng sương', meaning: 'Cỏ mùa thu gặp sương tuyết, trừ tệ đổi mới kịp thời' },
  { hexagramNumber: 19, omen: 'Phát chính thi nhân', meaning: 'Ban chính sự thi ân đức, chăm lo coi sóc chu toàn' },
  { hexagramNumber: 20, omen: 'Hạn bồng xuân vũ', meaning: 'Hạn hán gặp mưa xuân tươi tốt, xem xét chiêm ngưỡng' },
  { hexagramNumber: 21, omen: 'Cơ nhân đắc thực', meaning: 'Người đói được ban của ăn, thưởng phạt phân minh' },
  { hexagramNumber: 22, omen: 'Hỷ khí dinh môn', meaning: 'Khí vui đầy cửa, văn vẻ trang sức rạng ngời' },
  { hexagramNumber: 23, omen: 'Ưng thước đồng sào', meaning: 'Chim ưng cùng sẻ chung tổ, hao mòn tiêu bớt cần cảnh giác' },
  { hexagramNumber: 24, omen: 'Khí tượng trùng hưng', meaning: 'Khí tượng phục hồi hưng thịnh, dương khí quay về' },
  { hexagramNumber: 25, omen: 'Điểu cùng phi không', meaning: 'Chim khốn bay trên không, giữ lẽ tự nhiên chớ vọng động' },
  { hexagramNumber: 26, omen: 'Trận thế đắc khai', meaning: 'Trận thế mở rộng, chứa giữ đạo đức và tài năng lớn' },
  { hexagramNumber: 27, omen: 'Vị thủy điếu ngư', meaning: 'Khương Tử Nha câu cá sông Vị, dưỡng đức chờ thời' },
  { hexagramNumber: 28, omen: 'Dạ hành đăng quang', meaning: 'Đi đêm gặp đuốc sáng, gánh vác việc trọng đại phi thường' },
  { hexagramNumber: 29, omen: 'Hải để mò kim', meaning: 'Mò kim đáy biển sâu, hiểm trở trùng trùng cần kiên tâm' },
  { hexagramNumber: 30, omen: 'Phi long thượng thiên', meaning: 'Rồng bay lên mây thắm, quang minh chiếu soi tứ phương' },
  { hexagramNumber: 31, omen: 'Manh nha xuất thổ', meaning: 'Mầm non nhú khỏi mặt đất, cảm ứng tương thông lòng người' },
  { hexagramNumber: 32, omen: 'Ngư ông đắc lợi', meaning: 'Ngư ông được lợi cá, giữ đạo bền lâu không đổi' },
  { hexagramNumber: 33, omen: 'Nùng vân tế nhật', meaning: 'Mây dày che lấp mặt trời, lui ẩn tránh kẻ tiểu nhân' },
  { hexagramNumber: 34, omen: 'Long vĩ phiên phong', meaning: 'Rồng vẫy đuôi trong gió lộng, thanh thế lớn mạnh giữ chính đạo' },
  { hexagramNumber: 35, omen: 'Sừ địa đắc kim', meaning: 'Cuốc đất gặp khối vàng, ngày càng tiến triển vẻ vang' },
  { hexagramNumber: 36, omen: 'Quá kiều trừu bản', meaning: 'Qua cầu bị rút ván, giấu tài ẩn nhẫn vượt tai ương' },
  { hexagramNumber: 37, omen: 'Kính lý quan hoa', meaning: 'Soi gương ngắm hoa tươi, trong ấm ngoài êm gia đạo tề' },
  { hexagramNumber: 38, omen: 'Thái Công bất ngộ', meaning: 'Thái Công chưa gặp thời, bất hòa trái ý tìm sự đồng' },
  { hexagramNumber: 39, omen: 'Vũ tuyết đồ hoạt', meaning: 'Mưa tuyết đường trơn trượt, thấy hiểm nguy dừng lại tự xét' },
  { hexagramNumber: 40, omen: 'Ngũ quan thoát nạn', meaning: 'Năm ải đều thoát nạn, tai qua nạn khỏi tha thứ ân giảm' },
  { hexagramNumber: 41, omen: 'Thôi thuyền thượng than', meaning: 'Đẩy thuyền trên bãi cát, bớt dưới thêm trên giữ lòng thành' },
  { hexagramNumber: 42, omen: 'Khô mộc khai hoa', meaning: 'Cây khô nảy cành hoa thắm, tăng ích giúp đời làm điều thiện' },
  { hexagramNumber: 43, omen: 'Du phong thoát võng', meaning: 'Ong say mật thoát khỏi lưới nhện, dứt khoát quyết đoán' },
  { hexagramNumber: 44, omen: 'Tha hương ngộ hữu', meaning: 'Nơi đất khách gặp bạn hiền, tình cờ tương ngộ cần phòng ngừa' },
  { hexagramNumber: 45, omen: 'Lý ngư hóa long', meaning: 'Cá chép vượt vũ môn hóa rồng, tụ hợp quần chúng giữ nghĩa' },
  { hexagramNumber: 46, omen: 'Chỉ nhật cao thăng', meaning: 'Ngóng ngày bay cao trên mây, thăng tiến thuận chiều từng bước' },
  { hexagramNumber: 47, omen: 'Lạc tỉnh hạ thạch', meaning: 'Rơi xuống giếng bị ném đá, cùng khốn không sờn giữ tiết tháo' },
  { hexagramNumber: 48, omen: 'Khô tỉnh sinh tuyền', meaning: 'Giếng cạn tuôn dòng nước mát, nuôi dưỡng nhân dân vô tận' },
  { hexagramNumber: 49, omen: 'Hạn bồng xuân vũ', meaning: 'Nắng hạn gặp mưa rào rực rỡ, cách tân đổi mới hợp lòng người' },
  { hexagramNumber: 50, omen: 'Ngư ông đắc lợi', meaning: 'Ngư ông được mối lợi kép, luyện điều mới lập danh thành' },
  { hexagramNumber: 51, omen: 'Kim chung dạ hưởng', meaning: 'Chuông vàng vang tiếng trong đêm, sấm sét kinh sợ rồi yên vui' },
  { hexagramNumber: 52, omen: 'Tiền trình hữu ngại', meaning: 'Đường đi phía trước có ngăn trở, dừng đúng lúc đúng chỗ' },
  { hexagramNumber: 53, omen: 'Phượng hoàng sinh vũ', meaning: 'Phượng hoàng mọc lông cánh đủ đầy, tiến bước vững vàng' },
  { hexagramNumber: 54, omen: 'Duyên mộc cầu ngư', meaning: 'Trèo lên ngọn cây tìm cá, trái đạo sai thời chẳng lâu bền' },
  { hexagramNumber: 55, omen: 'Nhật lệ trung thiên', meaning: 'Mặt trời sáng rực giữa trời cao, phong phú thịnh đại quang minh' },
  { hexagramNumber: 56, omen: 'Tước sào phần đốt', meaning: 'Tổ chim sẻ bị lửa đốt thiêu, lưu lạc tha hương cẩn trọng' },
  { hexagramNumber: 57, omen: 'Cô chu đắc phong', meaning: 'Thuyền côi gặp gió thuận dòng, khiêm nhường thuận nhập ý sâu xa' },
  { hexagramNumber: 58, omen: 'Lưỡng trạch tương tư', meaning: 'Hai đầm nước cùng ngấm nhuần, bạn bè cùng vui chia sẻ đạo' },
  { hexagramNumber: 59, omen: 'Cách hà vọng kim', meaning: 'Cách sông ngắm bọc vàng son, hóa giải ly tán quy về một' },
  { hexagramNumber: 60, omen: 'Trảm tướng phong thần', meaning: 'Chém tướng phong thần ghi công lớn, tiết độ chừng mực có giới hạn' },
  { hexagramNumber: 61, omen: 'Hạc minh cửu cao', meaning: 'Hạc kêu ngoài đầm sâu vang dội, lòng thành chân thật cảm hóa vật' },
  { hexagramNumber: 62, omen: 'Phi điểu di âm', meaning: 'Chim bay qua để lại tiếng kêu, việc nhỏ có thể làm, việc lớn dừng lại' },
  { hexagramNumber: 63, omen: 'Kim bảng đề danh', meaning: 'Bảng vàng ghi tên đỗ đạt, việc đã hoàn tất đề phòng sa sút' },
  { hexagramNumber: 64, omen: 'Ưu trung vọng hỷ', meaning: 'Trong lo âu ngóng tin mừng vui, việc chưa xong tiếp tục nỗ lực' },
];

export const HEXAGRAM_OMEN_MAP: Record<number, HexagramOmen> = Object.fromEntries(
  HEXAGRAM_OMENS.map((item) => [item.hexagramNumber, item])
);

/**
 * Lấy Lời Triệu (Điềm Triệu) cổ bản của một Quẻ Kinh Dịch
 */
export function getHexagramOmen(hexNumber: number): HexagramOmen {
  const found = HEXAGRAM_OMEN_MAP[hexNumber];
  if (found) return found;
  return {
    hexagramNumber: hexNumber,
    omen: 'Chưa xác định',
    meaning: 'Khí tượng trung hòa',
  };
}
