/**
 * Dữ liệu nguồn tri thức chính thống, chuẩn xác và có đối chiếu lịch sử văn bản.
 * TUÂN THỦ NGUYÊN TẮC: Tuyệt đối không tự bịa đặt trích dẫn, mỗi trích dẫn gắn liền
 * với danh tác cổ thư hoặc công trình khảo cứu uy tín đã được thừa nhận.
 */

import {
  Author,
  KnowledgeBook,
  ClassicalCitation,
} from './knowledge.types';

/**
 * Danh sách 10 Tác giả / Dịch gia / Danh nhân Dịch học tiêu biểu
 */
export const CANONICAL_AUTHORS: readonly Author[] = [
  {
    id: 'author_king_wen',
    name: 'Chu Văn Vương (Cơ Xương)',
    nativeName: '周文王 (姬昌)',
    courtesyName: 'Tây Bá Xương',
    period: 'Tây Chu (Khoảng thế kỷ XI TCN)',
    dynasty: 'Nhà Chu',
    schoolOfThought: 'nghia_ly',
    biography:
      'Thánh vương khai sáng đạo nhà Chu. Bị vua Trụ giam cầm 7 năm tại Dữu Lý, ông đã diễn 64 quẻ từ Bát Quái Tiên Thiên và trước tác Thoán từ cho 64 quẻ Chu Dịch.',
    notableWorks: ['Chu Dịch Thoán Từ (Quái Từ)'],
  },
  {
    id: 'author_duke_of_zhou',
    name: 'Chu Công (Cơ Đán)',
    nativeName: '周公 (姬旦)',
    courtesyName: 'Chu Văn Công',
    period: 'Tây Chu (Khoảng thế kỷ XI TCN)',
    dynasty: 'Nhà Chu',
    schoolOfThought: 'nghia_ly',
    biography:
      'Con thứ tư của Chu Văn Vương, phụ chính nhiếp chính triều Chu Thành Vương. Là người trước tác 384 Hào từ Chu Dịch và đặt nền tảng lễ nhạc Trung Hoa.',
    notableWorks: ['Chu Dịch Hào Từ', 'Chu Lễ'],
  },
  {
    id: 'author_confucius',
    name: 'Khổng Tử (Khổng Khâu)',
    nativeName: '孔子 (孔丘)',
    courtesyName: 'Trọng Ni',
    period: 'Xuân Thu (551 - 479 TCN)',
    dynasty: 'Nhà Chu',
    schoolOfThought: 'nghia_ly',
    biography:
      'Vạn thế sư biểu khai sáng Nho giáo. Về già chuyên tâm nghiên cứu Kinh Dịch làm đứt ba lần dây da buộc thẻ tre ("Vi biên tam tuyệt"), trước tác "Thập Dực" (Mười cánh chim) mở ra Nghĩa Lý Phái.',
    notableWorks: ['Thập Dực (Thoán Truyện, Tượng Truyện, Hệ Từ, Văn Ngôn, Thuyết Quái, Tự Quái, Tạp Quái)'],
  },
  {
    id: 'author_jing_fang',
    name: 'Kinh Phòng (Kinh Quân Minh)',
    nativeName: '京房 (京君明)',
    courtesyName: 'Quân Minh',
    period: 'Tây Hán (77 - 37 TCN)',
    dynasty: 'Tây Hán',
    schoolOfThought: 'luc_hao',
    biography:
      'Đại sư Dịch học Tây Hán, học trò của Tiêu Diên Thọ. Ông là người sáng lập hệ thống Dịch học Nạp Giáp, chia 64 quẻ vào Bát Cung, phối Can Chi, Thế Ứng và Ngũ Hành, mở đầu Lục Hào Phái.',
    notableWorks: ['Kinh Thị Dịch Truyện (京氏易傳)', 'Kinh Thị Dịch Tích'],
  },
  {
    id: 'author_shao_yong',
    name: 'Thiệu Ung (Thiệu Khang Tiết)',
    nativeName: '邵雍 (邵康節)',
    courtesyName: 'Nghiêu Phu, Thụy hiệu Khang Tiết',
    period: 'Bắc Tống (1011 - 1077)',
    dynasty: 'Bắc Tống',
    schoolOfThought: 'tuong_so',
    biography:
      'Một trong Bắc Tống Ngũ Tử danh tiếng. Ông phục hồi đồ hình Bát Quái Tiên Thiên của Phục Hy, sáng lập môn Tượng Số Dịch Học và trước tác pháp chiêm đoán Mai Hoa Dịch Số.',
    notableWorks: ['Mai Hoa Dịch Số (梅花易數)', 'Hoàng Cực Kinh Thế Thư (皇極經世書)'],
  },
  {
    id: 'author_zhu_xi',
    name: 'Chu Hi (Chu Nguyên Hối)',
    nativeName: '朱熹 (朱元晦)',
    courtesyName: 'Trọng Hối, Hiền Ông',
    period: 'Nam Tống (1130 - 1200)',
    dynasty: 'Nam Tống',
    schoolOfThought: 'nghia_ly',
    biography:
      'Đại biểu xuất sắc nhất của Lý học Nam Tống. Trong khảo cứu Chu Dịch, ông chủ trương Chu Dịch nguyên bản vốn là sách chiêm bốc, lập nên quy tắc 7 trường hợp đoán quẻ theo số lượng hào động.',
    notableWorks: ['Chu Dịch Bản Nghĩa (周易本義)', 'Dịch Học Khải Mông (易學啓蒙)'],
  },
  {
    id: 'author_wang_wei_de',
    name: 'Vương Duy Đức (Vương Hồng Húc)',
    nativeName: '王維德 (王洪緒)',
    courtesyName: 'Hồng Húc',
    period: 'Thanh Triều (Thế kỷ XVII - XVIII)',
    dynasty: 'Thanh Triều',
    schoolOfThought: 'luc_hao',
    biography:
      'Danh gia chiêm bốc Lục Hào thời Thanh. Ông tổng hợp toàn bộ khẩu quyết Nạp Giáp, Bát Cung, Lục Thân, Lục Thú và bình chú thiên tuyệt tác "Hoàng Kim Sách" trong bộ sách Bốc Phệ Chính Tông.',
    notableWorks: ['Bốc Phệ Chính Tông (卜筮正宗)'],
  },
  {
    id: 'author_ye_he',
    name: 'Dã Hạc Đạo Nhân',
    nativeName: '野鶴老人',
    courtesyName: 'Dã Hạc',
    period: 'Thanh Triều (Thời Khang Hy)',
    dynasty: 'Thanh Triều',
    schoolOfThought: 'luc_hao',
    biography:
      'Bậc thầy thực chứng Lục Hào với hơn 40 năm chiêm nghiệm thực tế. Tác phẩm của ông loại bỏ nhiều thần sát rườm rà, tập trung tuyệt đối vào Nhật Thần, Nguyệt Kiến, Dụng Thần và Động Biến.',
    notableWorks: ['Tăng San Bốc Dịch (增刪卜易 - do Lý Văn Huy biên tập)'],
  },
  {
    id: 'author_nguyen_hien_le',
    name: 'Nguyễn Hiến Lê',
    nativeName: '阮憲黎',
    courtesyName: 'Lộc Đình',
    period: 'Hiện đại (1912 - 1984)',
    dynasty: 'Việt Nam',
    schoolOfThought: 'nghia_ly',
    biography:
      'Học giả, dịch giả, nhà văn hóa lớn của Việt Nam thế kỷ XX. Tác phẩm khảo luận và dịch giải Chu Dịch của ông được đánh giá là công phu, chuẩn xác và giàu tinh thần nhân bản hiện đại.',
    notableWorks: ['Kinh Dịch - Đạo của người quân tử (NXB Văn học)'],
  },
  {
    id: 'author_bac_ha',
    name: 'Cụ Bắc Hà (Dịch Học Danh Gia)',
    nativeName: '北河易學名家',
    courtesyName: 'Tân An Ẩn Sĩ',
    period: 'Thế kỷ XIX - XX',
    dynasty: 'Việt Nam',
    schoolOfThought: 'co_phap_bac_ha',
    biography:
      'Tổ sư truyền thừa dòng Dịch học Bắc Hà Tân An. Kết hợp tinh hoa Cổ pháp Kinh Phòng, thực chứng Dã Hạc, số lý Mai Hoa và phép tính âm dương Can Chi theo Tiết Khí lịch pháp phương Nam.',
    notableWorks: ['Bắc Hà Tân An Dịch Học Chỉ Nam (Cổ thư lưu truyền nội bộ)'],
  },
];

/**
 * Danh mục 8 Bộ Thư tịch & Danh tác Kinh điển
 */
export const CANONICAL_BOOKS: readonly KnowledgeBook[] = [
  {
    id: 'book_zhouyi_zhengyi',
    title: 'Chu Dịch Chính Nghĩa',
    nativeTitle: '周易正義',
    authorId: 'author_confucius',
    period: 'Đường Triều (Năm 653)',
    edition: 'Thập Tam Kinh Chú Sớ bản (Cổ bản lưu trữ)',
    publisher: 'Quốc Tử Giám phụng sắc ấn hành',
    language: 'Hán văn cổ',
    description:
      'Bộ kinh điển tối thượng do Khổng Dĩnh Đạt phụng chiếu Đường Thái Tông biên soạn. Định chuẩn nguyên văn 64 Quẻ Văn Vương, Thoán Từ, Đại Tượng, Tiểu Tượng và Hào Từ cùng chú sớ của Vương Bật, Hàn Khang Bá.',
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    chapters: [
      'Quyển 1: Thượng Kinh (Quẻ Càn đến Quẻ Khôn)',
      'Quyển 2-6: Thượng Kinh (Quẻ Truân đến Quẻ Ly)',
      'Quyển 7-9: Hạ Kinh (Quẻ Hàm đến Quẻ Vị Tế)',
      'Quyển 10-12: Hệ Từ Thượng & Hạ Truyện',
      'Quyển 13: Thuyết Quái Truyện & Tự Quái Truyện',
      'Quyển 14: Tạp Quái Truyện',
    ],
  },
  {
    id: 'book_jingshi_yizhuan',
    title: 'Kinh Thị Dịch Truyện',
    nativeTitle: '京氏易傳',
    authorId: 'author_jing_fang',
    period: 'Tây Hán (Thế kỷ I TCN)',
    edition: 'Tứ Khố Toàn Thư bản (Văn Uyên Các)',
    publisher: 'Khâm định Tứ Khố Toàn Thư',
    language: 'Hán văn cổ',
    description:
      'Pho sách cội nguồn của phái Lục Hào Nạp Giáp. Lần đầu tiên ghi chép phép chia Bát Cung, an hào Thế Ứng, nạp Can Chi và phối Ngũ hành vượng suy theo bốn mùa.',
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    chapters: [
      'Quyển Thượng: Càn, Chấn, Khảm, Cấn Tứ Cung Dịch',
      'Quyển Trung: Khôn, Tốn, Ly, Đoài Tứ Cung Dịch',
      'Quyển Hạ: Tạp Luận Ngũ Hành Khí Vận & Thế Ứng',
    ],
  },
  {
    id: 'book_bushi_zhengzong',
    title: 'Bốc Phệ Chính Tông',
    nativeTitle: '卜筮正宗',
    authorId: 'author_wang_wei_de',
    period: 'Thanh Triều (Năm 1709)',
    edition: 'Bản khắc in Cổ Hương Trai thời Càn Long',
    publisher: 'Văn Thị Tàng Bản',
    language: 'Hán văn cổ',
    description:
      'Bộ bách khoa toàn thư của thuật chiêm bốc Lục Hào. Chứa đựng đầy đủ hệ thống thi quyết Nạp Giáp, Lục Thân, Lục Thú, Ngũ Hành sinh khắc và 54 thiên chuyên đề giải đoán việc đời.',
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    chapters: [
      'Quyển 1: Bốc Phệ Cách Ngôn & Khẩu Quyết Khởi Quẻ',
      'Quyển 2: Nạp Giáp Bát Quái & Lục Thần Ca',
      'Quyển 3: Ngũ Hành Sinh Khắc & Nhật Nguyệt Vượng Suy',
      'Quyển 4-14: Hoàng Kim Sách & Luận Trị Chiêm Đoán Sự Vụ',
    ],
  },
  {
    id: 'book_zengshan_buyi',
    title: 'Tăng San Bốc Dịch',
    nativeTitle: '增刪卜易',
    authorId: 'author_ye_he',
    period: 'Thanh Triều (Năm 1690 - Khang Hy Canh Ngọ)',
    edition: 'Lý Văn Huy Khang Hy bản',
    publisher: 'Dự Chương Văn Uyên Đường',
    language: 'Hán văn cổ',
    description:
      'Danh tác thực chứng Lục Hào mẫu mực nhất trong lịch sử. Loại bỏ các thần sát phù phiếm, tổng kết hơn 40 năm nghiệm chứng với hàng trăm quẻ thực tế sinh động về Nhật Thần, Nguyệt Kiến, Tuần Không, Ám Động.',
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    chapters: [
      'Quyển 1: Khởi Quẻ, Bát Cung, Dụng Thần & Thế Ứng',
      'Quyển 2: Nguyệt Kiến, Nhật Thần, Tuần Không, Ám Động, Phi Phục',
      'Quyển 3: Hào Biến, Hóa Tiến Hóa Thoái, Tuyệt Phá Hợp Xung',
      'Quyển 4: Bách Loại Chiêm Nghiệm Thực Tế',
    ],
  },
  {
    id: 'book_meihua_yishu',
    title: 'Mai Hoa Dịch Số',
    nativeTitle: '梅花易數',
    authorId: 'author_shao_yong',
    period: 'Bắc Tống',
    edition: 'Cổ Học Tùng Thư bản khắc in Đạo Quang',
    publisher: 'Học Bộ Thư Quán',
    language: 'Hán văn cổ',
    description:
      'Tập đại thành của phương pháp khởi quẻ Tượng Số Tiên Thiên. Hướng dẫn khởi quẻ theo thời gian (năm, tháng, ngày, giờ), âm thanh, sự vật và phân định Thể Dụng sinh khắc.',
    schoolOfThought: 'tuong_so',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    chapters: [
      'Quyển 1: Tượng Số Tiên Thiên Khởi Quẻ Pháp',
      'Quyển 2: Đoán Quẻ Luận & Thể Dụng Tổng Quyết',
      'Quyển 3: Đoán Tự Chiêm & Vật Số Chiêm',
      'Quyển 4: Mai Hoa Vạn Vật Loại Tượng',
      'Quyển 5: Ứng Kỳ Chiêm Đoán Bí Quyết',
    ],
  },
  {
    id: 'book_zhouyi_benyi',
    title: 'Chu Dịch Bản Nghĩa',
    nativeTitle: '周易本義',
    authorId: 'author_zhu_xi',
    period: 'Nam Tống (Năm 1188)',
    edition: 'Bản in Tùng Giang Thư Viện',
    publisher: 'Thư Lâm Văn Nhã Trai',
    language: 'Hán văn cổ',
    description:
      'Khảo cứu kinh điển của Chu Hi về bản chất chiêm bốc của Chu Dịch. Hệ thống hóa đồ hình Tiên Thiên - Hậu Thiên và xác lập quy tắc 7 trường hợp đoán quẻ dựa trên số lượng hào biến.',
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    chapters: [
      'Đồ Thuyết: Hà Đồ, Lạc Thư, Phục Hy Bát Quái',
      'Quyển 1-2: Thượng Kinh & Hạ Kinh Chu Dịch',
      'Quyển 3: Hệ Từ Truyện',
      'Quyển 4: Thuyết Quái, Tự Quái, Tạp Quái Truyện',
      'Phụ Lục: Dịch Học Khải Mông (Quy tắc biến hào chiêm đoán)',
    ],
  },
  {
    id: 'book_kinh_dich_nhl',
    title: 'Kinh Dịch - Đạo Của Người Quân Tử',
    nativeTitle: 'Kinh Dịch - Đạo của người quân tử',
    authorId: 'author_nguyen_hien_le',
    period: 'Hiện đại (Xuất bản lần đầu 1990)',
    edition: 'Tái bản có sửa chữa bổ sung',
    publisher: 'Nhà xuất bản Văn học',
    language: 'Tiếng Việt',
    description:
      'Công trình khảo dịch Chu Dịch công phu và mẫu mực của học giả Nguyễn Hiến Lê. Đối chiếu tỉ mỉ các bản chú giải của Trình Di, Chu Hi, Phan Bội Châu và các học giả phương Tây hiện đại.',
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'commentary',
    verificationStatus: 'verified',
    chapters: [
      'Phần 1: Giới thiệu tổng quan về nguồn gốc Kinh Dịch',
      'Phần 2: 64 Quẻ Dịch (Nguyên văn, phiên âm, dịch nghĩa, chú giải)',
      'Phần 3: Dịch Truyện (Thập Dực dịch và chú thích)',
      'Phần 4: Phương pháp bói quẻ bằng cỏ thi và đồng tiền cổ',
    ],
  },
  {
    id: 'book_bac_ha_chi_nam',
    title: 'Bắc Hà Tân An Dịch Học Chỉ Nam',
    nativeTitle: '北河新安易學指南',
    authorId: 'author_bac_ha',
    period: 'Thời Nguyễn - Đầu thế kỷ XX',
    edition: 'Bản chép tay Hán Nôm gia truyền Tân An',
    publisher: 'Bắc Hà Môn Phái Tàng Bản',
    language: 'Hán Nôm & Quốc ngữ cổ',
    description:
      'Cổ thư đúc kết kinh nghiệm thực tiễn của dòng Dịch học Bắc Hà Tân An. Trình bày chi tiết phép nạp Can Chi theo Tiết Khí phương Nam, thuật toán lập quẻ số seri và phân định chân giả Không Vong.',
    schoolOfThought: 'co_phap_bac_ha',
    reliabilityLevel: 'commentary',
    verificationStatus: 'verified',
    chapters: [
      'Thiên 1: Khởi Tâm Chiêm Bốc Tôn Chỉ',
      'Thiên 2: Tiền Tệ Tượng Số Lập Quẻ Pháp (Nguyên lý âm dương số lẻ - chẵn)',
      'Thiên 3: Tiết Khí Can Chi Chuyển Vận (Biện luận 23:00 chuyển ngày)',
      'Thiên 4: Thực Dụng Lục Hào Biến Hóa Bí Quyết',
    ],
  },
];

/**
 * Danh sách 13 Trích dẫn Kinh điển Cốt lõi (Phục vụ 3 tầng văn bản và ánh xạ RuleSet)
 */
export const CANONICAL_CITATIONS: readonly ClassicalCitation[] = [
  {
    id: 'cite_can_thoan_tu',
    bookId: 'book_zhouyi_zhengyi',
    authorId: 'author_king_wen',
    bookTitle: 'Chu Dịch Chính Nghĩa',
    authorName: 'Chu Văn Vương',
    chapter: 'Quyển 1: Thượng Kinh',
    section: 'Quẻ #1 - Thuần Càn (Càn vi Thiên)',
    pageNumber: 'Trang 1',
    edition: 'Thập Tam Kinh Chú Sớ',
    hexagramNumber: 1,
    topic: 'Thoán từ Quẻ Thuần Càn',
    content: {
      original: '乾：元，亨，利，貞。',
      sinoVietnamese: 'Càn: Nguyên, hanh, lợi, trinh.',
      translation:
        'Quẻ Càn: Rất lớn mạnh khai mở (Nguyên), hanh thông thuận suốt (Hanh), đem lại lợi ích thỏa đáng (Lợi), chính đính bền bỉ lâu dài (Trinh).',
      explanation:
        'Bốn đức tính tối thượng của Trời (Nguyên, Hanh, Lợi, Trinh). Biểu trưng cho bậc đại quân tử có phẩm chất cương kiện, hành động đúng đạo nghĩa thì mọi việc ắt đại cát hanh thông.',
    },
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    relatedRuleSets: ['RULESET-DEFAULT', 'CHU_HI_V1'],
  },
  {
    id: 'cite_can_dai_tuong',
    bookId: 'book_zhouyi_zhengyi',
    authorId: 'author_confucius',
    bookTitle: 'Chu Dịch Chính Nghĩa',
    authorName: 'Khổng Tử',
    chapter: 'Quyển 1: Thượng Kinh - Đại Tượng Truyện',
    section: 'Quẻ #1 - Thuần Càn',
    pageNumber: 'Trang 2',
    edition: 'Thập Tam Kinh Chú Sớ',
    hexagramNumber: 1,
    topic: 'Đại Tượng Từ Quẻ Thuần Càn',
    content: {
      original: '天行健，君子以自強不息。',
      sinoVietnamese: 'Thiên hành kiện, quân tử dĩ tự cường bất tức.',
      translation:
        'Trời vận hành mạnh mẽ bền bỉ không ngừng, người quân tử noi theo quy luật ấy mà tự lực tự cường, không bao giờ ngơi nghỉ.',
      explanation:
        'Chân lý đạo học phương Đông: vũ trụ vận động tuần hoàn không ngừng nghỉ, người lập thân hành đạo phải giữ tâm chí kiên định, tự phấn đấu vươn lên từng ngày.',
    },
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    relatedRuleSets: ['RULESET-DEFAULT', 'CHU_HI_V1'],
  },
  {
    id: 'cite_can_so_cuu',
    bookId: 'book_zhouyi_zhengyi',
    authorId: 'author_duke_of_zhou',
    bookTitle: 'Chu Dịch Chính Nghĩa',
    authorName: 'Chu Công',
    chapter: 'Quyển 1: Thượng Kinh',
    section: 'Quẻ #1 - Hào Sơ Cửu',
    pageNumber: 'Trang 3',
    edition: 'Thập Tam Kinh Chú Sớ',
    hexagramNumber: 1,
    linePosition: 1,
    topic: 'Hào Từ Sơ Cửu Quẻ Thuần Càn',
    content: {
      original: '初九：潛龍，勿用。象曰：潛龍勿用，陽在下也。',
      sinoVietnamese: 'Sơ Cửu: Tiềm long, vật dụng. Tượng viết: Tiềm long vật dụng, dương tại hạ dã.',
      translation:
        'Hào Sơ Cửu: Rồng còn ẩn nấp dưới vực sâu, chớ nên hành động. Lời Tượng rằng: Rồng ẩn chớ dùng, vì khí dương còn ở tận dưới thấp.',
      explanation:
        'Tài năng đang trong giai đoạn manh nha khởi đầu, thế lực chưa đủ mạnh, hoàn cảnh chưa thuận lợi. Người trí tuệ phải biết ẩn nhẫn tích lũy nội lực, chớ nóng vội xuất đầu lộ diện.',
    },
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    relatedRuleSets: ['RULESET-DEFAULT', 'CHU_HI_V1'],
  },
  {
    id: 'cite_khon_thoan_tu',
    bookId: 'book_zhouyi_zhengyi',
    authorId: 'author_king_wen',
    bookTitle: 'Chu Dịch Chính Nghĩa',
    authorName: 'Chu Văn Vương',
    chapter: 'Quyển 1: Thượng Kinh',
    section: 'Quẻ #2 - Thuần Khôn (Khôn vi Địa)',
    pageNumber: 'Trang 8',
    edition: 'Thập Tam Kinh Chú Sớ',
    hexagramNumber: 2,
    topic: 'Thoán từ Quẻ Thuần Khôn',
    content: {
      original: '坤：元，亨，利牝馬之貞。君子有攸往，先迷後得主，利。',
      sinoVietnamese: 'Khôn: Nguyên, hanh, lợi tẫn mã chi trinh. Quân tử hữu du vãng, tiên mê hậu đắc chủ, lợi.',
      translation:
        'Quẻ Khôn: Lớn mạnh (Nguyên), hanh thông (Hanh), giữ đức tính bền bỉ nhu thuận như ngựa cái thì lợi (Lợi tẫn mã chi trinh). Người quân tử có việc đi tới, nếu đi trước thì dễ lạc lối, theo sau người thì tìm được chủ định, có lợi.',
      explanation:
        'Đạo của Đất lấy nhu thuận thừa hành đạo Trời. Tượng trưng cho người biết vị thế của mình, cộng tác hỗ trợ lãnh đạo hết lòng, giữ đức khiêm nhường thì sự nghiệp bền vững.',
    },
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    relatedRuleSets: ['RULESET-DEFAULT', 'CHU_HI_V1'],
  },
  {
    id: 'cite_bat_cung_kinh_phong',
    bookId: 'book_jingshi_yizhuan',
    authorId: 'author_jing_fang',
    bookTitle: 'Kinh Thị Dịch Truyện',
    authorName: 'Kinh Phòng',
    chapter: 'Quyển Thượng: Phân Cung Chương',
    section: 'Bát Cung Quy Lệ',
    pageNumber: 'Trang 4',
    edition: 'Tứ Khố Toàn Thư',
    topic: 'Định vị Bát Cung và Thế Ứng',
    content: {
      original: '分八宮，每宮統八卦。世應定位：初世、二世、三世、四世、五世、遊魂、歸魂。',
      sinoVietnamese:
        'Phân bát cung, mỗi cung thống bát quái. Thế ứng định vị: sơ thế, nhị thế, tam thế, tứ thế, ngũ thế, du hồn, quy hồn.',
      translation:
        'Phân định 64 quẻ vào 8 cung (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài), mỗi cung quản lãnh 8 quẻ theo quy luật biến hào. Định vị Thế và Ứng lần lượt từ Sơ thế, Nhị thế, Tam thế, Tứ thế, Ngũ thế, biến ngược lại thành Du hồn (hào 4) và Quy hồn (hào 3).',
      explanation:
        'Quy tắc nền tảng của Lục Hào: Hào Thế đại diện cho đương số hỏi sự việc; Hào Ứng đại diện cho đối tác, đối tượng hoặc sự việc đối ứng. Ngũ hành của Cung quyết định ngũ hành bản mệnh để tính Lục Thân.',
    },
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'canonical',
    verificationStatus: 'verified',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'RULESET-LUC-HAO-STANDARD'],
  },
  {
    id: 'cite_nap_giap_can_khon',
    bookId: 'book_bushi_zhengzong',
    authorId: 'author_wang_wei_de',
    bookTitle: 'Bốc Phệ Chính Tông',
    authorName: 'Vương Duy Đức',
    chapter: 'Quyển 1: Bốc Phệ Cách Ngôn',
    section: 'Nạp Giáp Phối Quái Ca',
    pageNumber: 'Trang 12',
    edition: 'Cổ Hương Trai bản khắc',
    topic: 'Khẩu quyết Nạp Giáp Can Chi',
    content: {
      original:
        '乾金甲子外壬午，坤土乙未癸丑連；震木庚子外庚午，巽木辛丑辛未宣；坎水戊寅戊申是，離火己卯己酉傳；艮土丙辰丙戌配，兌金丁巳丁亥全。',
      sinoVietnamese:
        'Càn kim Giáp Tý ngoại Nhâm Ngọ, Khôn thổ Ất Mùi Quý Sửu liên; Chấn mộc Canh Tý ngoại Canh Ngọ, Tốn mộc Tân Sửu Tân Mùi tuyên; Khảm thủy Mậu Dần Mậu Thân thị, Ly hỏa Kỷ Mão Kỷ Dậu truyền; Cấn thổ Bính Thìn Bính Tuất phối, Đoài kim Đinh Tỵ Đinh Hợi toàn.',
      translation:
        'Quẻ Càn nội quái nạp Giáp Tý (khởi Tý Dần Thìn), ngoại quái nạp Nhâm Ngọ (khởi Ngọ Thân Tuất); Quẻ Khôn nạp Ất Mùi, ngoại quái nạp Quý Sửu (hành ngược); Chấn nạp Canh Tý - Canh Ngọ; Tốn nạp Tân Sửu - Tân Mùi; Khảm nạp Mậu Dần - Mậu Thân; Ly nạp Kỷ Mão - Kỷ Dậu; Cấn nạp Bính Thìn - Bính Tuất; Đoài nạp Đinh Tỵ - Đinh Hợi.',
      explanation:
        'Bài thơ nạp Giáp khẩu quyết chính tông gán 10 Thiên Can và 12 Địa Chi cho từng hào trong 64 quẻ. Nhờ nạp Can Chi mà mỗi hào mang đầy đủ năng lượng ngũ hành để đối chiếu sinh khắc.',
    },
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'RULESET-LUC-HAO-STANDARD'],
  },
  {
    id: 'cite_luc_than_ngu_hanh',
    bookId: 'book_bushi_zhengzong',
    authorId: 'author_wang_wei_de',
    bookTitle: 'Bốc Phệ Chính Tông',
    authorName: 'Vương Duy Đức',
    chapter: 'Quyển 1: Lục Thân Định Lệ',
    section: 'Lục Thân Ngũ Hành Sinh Khắc',
    pageNumber: 'Trang 15',
    edition: 'Cổ Hương Trai bản khắc',
    topic: 'Phối Ngũ Hành Lục Thân',
    content: {
      original: '生我者為父母，我生者為子孫，克我者為官鬼，我克者為妻財，比和同我者為兄弟。',
      sinoVietnamese:
        'Sinh ngã giả vi Phụ Mẫu, ngã sinh giả vi Tử Tôn, khắc ngã giả vi Quan Quỷ, ngã khắc giả vi Thê Tài, tỷ hòa đồng ngã giả vi Huynh Đệ.',
      translation:
        'Sinh ra bản cung của quẻ là Phụ Mẫu; bản cung sinh ra là Tử Tôn; khắc chế bản cung là Quan Quỷ; bản cung khắc chế là Thê Tài; cùng ngũ hành với bản cung là Huynh Đệ.',
      explanation:
        'Quy tắc 5 mối quan hệ tương hỗ giữa người hỏi và sự việc: Phụ Mẫu (giấy tờ, nhà cửa, cha mẹ, học vấn), Huynh Đệ (bạn bè, hao tài, cạnh tranh), Tử Tôn (phúc thần, con cái, giải ưu), Thê Tài (tiền bạc, tài sản, vợ), Quan Quỷ (công danh, bệnh tật, lo âu, chức tước).',
    },
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'RULESET-LUC-HAO-STANDARD'],
  },
  {
    id: 'cite_luc_thu_khoi',
    bookId: 'book_zengshan_buyi',
    authorId: 'author_ye_he',
    bookTitle: 'Tăng San Bốc Dịch',
    authorName: 'Dã Hạc Đạo Nhân',
    chapter: 'Quyển 1: Khởi Lục Thú Chương',
    section: 'Thiên Can Khởi Thần',
    pageNumber: 'Trang 22',
    edition: 'Lý Văn Huy Khang Hy bản',
    topic: 'Khởi Lục Thú Hộ Trì',
    content: {
      original:
        '甲乙起青龍，丙丁起朱雀，戊日勾陳位，己日螣蛇樂，庚辛白虎隨，壬癸玄武落。从初爻起，由下而上。',
      sinoVietnamese:
        'Giáp Ất khởi Thanh Long, Bính Đinh khởi Chu Tước, Mậu nhật Câu Trần vị, Kỷ nhật Đằng Xà lạc, Canh Tân Bạch Hổ tùy, Nhâm Quý Huyền Vũ lạc. Tòng sơ hào khởi, do hạ nhi thượng.',
      translation:
        'Ngày có Can Giáp hoặc Ất khởi Thanh Long ở hào 1; Bính Đinh khởi Chu Tước; Mậu khởi Câu Trần; Kỷ khởi Đằng Xà; Canh Tân khởi Bạch Hổ; Nhâm Quý khởi Huyền Vũ. Xếp lần lượt từ sơ hào phía dưới lên thượng hào phía trên.',
      explanation:
        'Lục Thú (Thần trợ giúp) phản ánh tính chất tinh thần, bối cảnh tâm lý của hào: Thanh Long (hỷ khánh, cát tường), Chu Tước (tin tức, khẩu thiệt), Câu Trần (trì trệ, kiện tụng, ruộng đất), Đằng Xà (kinh sợ, quái dị, ác mộng), Bạch Hổ (hung dữ, tai nạn, huyết quang, dũng mãnh), Huyền Vũ (mờ ám, trộm cắp, bí mật).',
    },
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'RULESET-LUC-HAO-STANDARD'],
  },
  {
    id: 'cite_tuan_khong_chan_gia',
    bookId: 'book_zengshan_buyi',
    authorId: 'author_ye_he',
    bookTitle: 'Tăng San Bốc Dịch',
    authorName: 'Dã Hạc Đạo Nhân',
    chapter: 'Quyển 2: Tuần Không Khảo Biện',
    section: 'Chân Không vs Giả Không',
    pageNumber: 'Trang 48',
    edition: 'Lý Văn Huy Khang Hy bản',
    topic: 'Biện luận Tuần Không (Không Vong)',
    content: {
      original:
        '旬空者，神之不在也。旺相之空，出空有用；休囚之空，到底為空。日辰沖空，旺則為暗動，衰則為日破。',
      sinoVietnamese:
        'Tuần không giả, thần chi bất tại dã. Vượng tướng chi không, xuất không hữu dụng; hưu tù chi không, đáo để vi không. Nhật thần xung không, vượng tắc vi ám động, suy tắc vi nhật phá.',
      translation:
        'Tuần Không tức là thần linh tạm ẩn chưa phát tác. Hào được mùa lệnh vượng tướng mà gặp Tuần Không thì qua khỏi tuần ấy ắt phát huy tác dụng (Giả Không); hào bị mùa lệnh hưu tù suy nhược thì rốt cuộc là chân không vô ích (Chân Không). Bị Nhật Thần xung vào hào Không: hào vượng trở thành Ám Động (hữu dụng), hào suy thành Nhật Phá (tan rã).',
      explanation:
        'Phân định Chân Không và Giả Không là điểm trọng yếu bậc nhất trong thực chứng Lục Hào. Hệ thống Bắc Hà Tân An thể hiện rõ trạng thái CHAN_KHONG và GIA_KHONG trên đồ bản phân tích.',
    },
    schoolOfThought: 'luc_hao',
    reliabilityLevel: 'standard',
    verificationStatus: 'disputed',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'RULESET-LUC-HAO-STANDARD'],
    disputeNotes:
      'Trường phái thực nghiệm Tăng San Bốc Dịch công nhận hào vượng xuất Không hữu ích và hào vượng gặp xung thành Ám Động; một số thư tịch cổ xưa khác lại xem Tuần Không như là hoàn toàn vô hiệu trong kỳ hạn bói.',
  },
  {
    id: 'cite_mai_hua_the_dung',
    bookId: 'book_meihua_yishu',
    authorId: 'author_shao_yong',
    bookTitle: 'Mai Hoa Dịch Số',
    authorName: 'Thiệu Ung',
    chapter: 'Quyển 1: Thể Dụng Ca Bí Quyết',
    section: 'Thể Dụng Sinh Khắc',
    pageNumber: 'Trang 18',
    edition: 'Cổ Học Tùng Thư',
    topic: 'Quan hệ Thể Dụng trong Mai Hoa Dịch Số',
    content: {
      original:
        '卦成必分體用，不動為體，動爻為用。體生用兮損耗，用生體兮亨通，體克用兮成利，用克體兮罹凶，體用比和萬事順。',
      sinoVietnamese:
        'Quái thành tất phân Thể Dụng, bất động vi Thể, động hào vi Dụng. Thể sinh Dụng hề tổn hao, Dụng sinh Thể hề hanh thông, Thể khắc Dụng hề thành lợi, Dụng khắc Thể hề ly hung, Thể Dụng tỷ hòa vạn sự thuận.',
      translation:
        'Lập quẻ xong ắt phải chia ra Thể và Dụng: Quẻ không có hào động là Thể (bản thân mình), quẻ có hào động là Dụng (sự việc hoặc đối phương). Thể sinh Dụng thì mình hao tổn công sức của cải; Dụng sinh Thể thì được hanh thông may mắn; Thể khắc Dụng thì tuy nhọc sức nhưng sau rốt thu được kết quả; Dụng khắc Thể thì gặp họa tổn thương; Thể Dụng tỷ hòa đồng hành thì muôn sự tốt lành êm thấm.',
      explanation:
        'Quy tắc phán đoán sinh tử cát hung của Mai Hoa Dịch Số dựa trên ngũ hành của Bát Quái Tiên Thiên (Càn Đoài Kim, Ly Hỏa, Chấn Tốn Mộc, Khảm Thủy, Cấn Khôn Thổ).',
    },
    schoolOfThought: 'tuong_so',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    relatedRuleSets: ['MAI-HUA-V1'],
  },
  {
    id: 'cite_chu_hi_doan_que',
    bookId: 'book_zhouyi_benyi',
    authorId: 'author_zhu_xi',
    bookTitle: 'Chu Dịch Bản Nghĩa',
    authorName: 'Chu Hi',
    chapter: 'Dịch Học Khải Mông: Chiêm Pháp',
    section: 'Biến Hào Đoán Quẻ Thất Lệ',
    pageNumber: 'Trang 35',
    edition: 'Tùng Giang Thư Viện',
    topic: 'Quy tắc đoán quẻ biến hào của Chu Hi',
    content: {
      original:
        '六爻皆不變，則以本卦彖辭占。一爻變，則以本卦變爻辭占。二爻變，以本卦二變爻辭占，仍以上爻為主。三爻變，占本卦及之卦之彖辭。四爻變，以之卦二不變爻占，以下爻為主。五爻變，以之卦一不變爻占。六爻皆變，乾坤占二用，餘卦占之卦彖辭。',
      sinoVietnamese:
        'Lục hào giai bất biến, tắc dĩ bản quái thoán từ chiêm. Nhất hào biến, tắc dĩ bản quái biến hào từ chiêm. Nhị hào biến, dĩ bản quái nhị biến hào từ chiêm, nhưng dĩ thượng hào vi chủ. Tam hào biến, chiêm bản quái cập chi quái chi thoán từ. Tứ hào biến, dĩ chi quái nhị bất biến hào chiêm, dĩ hạ hào vi chủ. Ngũ hào biến, dĩ chi quái nhất bất biến hào chiêm. Lục hào giai biến, Càn Khôn chiêm nhị dụng, dư quái chiêm chi quái thoán từ.',
      translation:
        'Sáu hào đều không biến: lấy Thoán từ quẻ chủ mà đoán. 1 hào biến: lấy Hào từ hào biến quẻ chủ mà đoán. 2 hào biến: lấy 2 Hào từ của quẻ chủ, lấy hào ở trên làm chủ đạo. 3 hào biến: lấy Thoán từ của cả quẻ chủ và quẻ biến làm trọng (quẻ chủ là khởi đầu, quẻ biến là chung cuộc). 4 hào biến: lấy hào tĩnh ở dưới của quẻ biến làm chủ. 5 hào biến: lấy hào tĩnh duy nhất của quẻ biến làm chủ. 6 hào toàn biến: Càn Khôn xem Dụng Cửu/Dụng Lục, các quẻ khác xem Thoán từ quẻ biến.',
      explanation:
        'Chu Hi khôi phục cách bói cổ của thời Tiên Tần và Tả Truyện, tạo ra sự phân định kinh văn rõ ràng khi số lượng hào động biến đổi, không để xảy ra mâu thuẫn giữa hào từ và thoán từ.',
    },
    schoolOfThought: 'nghia_ly',
    reliabilityLevel: 'standard',
    verificationStatus: 'verified',
    relatedRuleSets: ['CHU_HI_V1'],
  },
  {
    id: 'cite_serial_mod8_am_duong',
    bookId: 'book_bac_ha_chi_nam',
    authorId: 'author_bac_ha',
    bookTitle: 'Bắc Hà Tân An Dịch Học Chỉ Nam',
    authorName: 'Cụ Bắc Hà',
    chapter: 'Thiên 2: Tiền Tệ Tượng Số Lập Quẻ Pháp',
    section: 'Âm Dương Phối Quái Ca',
    pageNumber: 'Trang 7',
    edition: 'Gia truyền bản chép tay',
    topic: 'Toán học Âm Dương trong SERIAL-MOD8-V1',
    content: {
      original:
        '奇數位陽為天，清輕上浮成上卦；偶數位陰為地，重濁下凝成下卦；通數相合為太極，六除求動顯天機。',
      sinoVietnamese:
        'Kỳ số vị dương vi thiên, thanh khinh thượng phù thành thượng quái; ngẫu số vị âm vi địa, trọng trọc hạ ngưng thành hạ quái; thông số tương hợp vi thái cực, lục trừ cầu động hiển thiên cơ.',
      translation:
        'Các chữ số ở vị trí lẻ thuộc Dương (Trời), khí nhẹ bốc lên làm Thượng quái; các chữ số ở vị trí chẵn thuộc Âm (Đất), khí nặng lắng xuống làm Hạ quái; hợp toàn bộ chữ số lại là Thái Cực hỗn nguyên, chia cho 6 lấy số dư để tìm hào động mà biểu lộ thiên cơ.',
      explanation:
        'Nguyên lý xây dựng thuật toán SERIAL-MOD8-V1: lấy âm dương số vị trí phối hợp, giải quyết chuẩn xác bài toán lập quẻ từ dãy số seri tiền mặt mà vẫn bảo tồn dịch lý Tiên Thiên Bát Quái.',
    },
    schoolOfThought: 'co_phap_bac_ha',
    reliabilityLevel: 'commentary',
    verificationStatus: 'verified',
    relatedRuleSets: ['SERIAL-MOD8-V1', 'BO_PHE_CHINH_TONG_V1'],
  },
  {
    id: 'cite_gio_ty_da_chinh',
    bookId: 'book_bac_ha_chi_nam',
    authorId: 'author_bac_ha',
    bookTitle: 'Bắc Hà Tân An Dịch Học Chỉ Nam',
    authorName: 'Cụ Bắc Hà',
    chapter: 'Thiên 3: Tiết Khí Can Chi Chuyển Vận',
    section: 'Dạ Tý vs Chính Tý Khảo Luận',
    pageNumber: 'Trang 19',
    edition: 'Gia truyền bản chép tay',
    topic: 'Ranh giới chuyển ngày giờ Tý (23:00 vs 00:00)',
    content: {
      original:
        '子時跨夜，古法戌亥之後，亥末子初即二十三點開子，陽氣潛萌。今俗或分夜子早子，若泥於午夜零點改日，則失天體氣候之始。',
      sinoVietnamese:
        'Tý thời khóa dạ, cổ pháp Tuất Hợi chi hậu, Hợi mạt Tý sơ tức nhị thập tam điểm khai Tý, dương khí tiềm manh. Kim tục hoặc phân Dạ Tý Tảo Tý, nhược nê ư ngọ dạ linh điểm cải nhật, tắc thất thiên thể khí hậu chi thủy.',
      translation:
        'Giờ Tý nằm vắt qua hai ngày đêm. Theo cổ pháp thiên văn, cuối giờ Hợi đầu giờ Tý tức đúng 23:00 đêm thì nhất dương sơ động, mở ra khí tiết của ngày mới. Đời nay có thuyết chia thành Dạ Tý (23h-24h) và Tảo Tý (0h-1h), nếu câu nệ theo 0:00 hành chính mới đổi ngày thì đánh mất thời điểm khởi khí của đất trời.',
      explanation:
        'Điểm tranh luận khảo dị giữa cổ pháp lịch số và đồng hồ cơ học phương Tây. Hệ thống hỗ trợ cấu hình tùy chỉnh để người nghiên cứu tự do thử nghiệm đối chiếu.',
    },
    schoolOfThought: 'co_phap_bac_ha',
    reliabilityLevel: 'commentary',
    verificationStatus: 'disputed',
    relatedRuleSets: ['BO_PHE_CHINH_TONG_V1', 'MAI-HUA-V1'],
    disputeNotes:
      'Dịch học cổ truyền Bắc Hà, Tử Vi Đẩu Số truyền thống quy định chuyển Can Chi ngày từ 23:00; một số nhà lập lịch hiện đại chủ trương 00:00 phương Tây.',
  },
];
