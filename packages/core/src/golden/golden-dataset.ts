/**
 * GOLDEN DATASET (Bộ Dữ Liệu Kiểm Chứng Chuẩn Cổ Điển)
 * Dự án: Kinh Dịch - Bắc Hà Tân An Phái
 *
 * MỤC ĐÍCH:
 * Cung cấp bộ test cases chuẩn mực (Ground Truth / Gold Standard) đã được đối chiếu
 * và xác minh với các cổ tịch kinh điển:
 * - "Chu Dịch Chính Nghĩa" & "Chu Dịch Bản Nghĩa" (Khổng Dĩnh Đạt, Chu Hi).
 * - "Bốc Phệ Chính Tông" (Vương Duy Đức).
 * - "Tăng San Bốc Dịch" (Dã Hạc Đạo Nhân).
 * - "Mai Hoa Dịch Số" (Thiệu Khang Tiết).
 * - "Kinh Thị Dịch Truyện" (Kinh Phòng).
 *
 * Bộ dữ liệu này được thực thi đồng nhất trên Web, Mobile và Desktop để phát hiện
 * mọi sai lệch cross-platform và ngăn ngừa lỗi hồi quy (regression).
 */

export interface GoldenLineExpectation {
  readonly position: number; // 1 đến 6 (từ dưới lên)
  readonly stemBranch: string; // ví dụ "Canh Tý"
  readonly branch: string; // ví dụ "Tý"
  readonly element: string; // "Thủy", "Mộc", "Hỏa", "Thổ", "Kim"
  readonly sixRelation: string; // "Phụ Mẫu", "Huynh Đệ", "Tử Tôn", "Thê Tài", "Quan Quỷ"
  readonly sixSpirit?: string; // "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"
}

export interface GoldenTestCase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly canonicalReference: string;
  readonly algorithm: 'SERIAL-MOD8-V1' | 'MAI-HUA-V1' | 'SIX-YAO-V1' | 'VN-LUNAR-V1';
  
  // Dữ liệu đầu vào
  readonly input: {
    readonly serial?: string;
    readonly maiHuaInput?: {
      readonly yearBranch: 'Tý' | 'Sửu' | 'Dần' | 'Mão' | 'Thìn' | 'Tỵ' | 'Ngọ' | 'Mùi' | 'Thân' | 'Dậu' | 'Tuất' | 'Hợi';
      readonly month: number;
      readonly day: number;
      readonly hourBranch: 'Tý' | 'Sửu' | 'Dần' | 'Mão' | 'Thìn' | 'Tỵ' | 'Ngọ' | 'Mùi' | 'Thân' | 'Dậu' | 'Tuất' | 'Hợi';
    };
    readonly dateTime?: string; // ISO String
    readonly dayCanChi?: string; // Can Chi Ngày
    readonly monthCanChi?: string; // Can Chi Tháng
  };

  // Kết quả kỳ vọng chuẩn tuyệt đối
  readonly expected: {
    // 1. Quẻ Chủ, Quẻ Biến, Quẻ Hỗ
    readonly primaryHexagramNumber: number;
    readonly primaryHexagramName: string;
    readonly upperTrigramName: string;
    readonly lowerTrigramName: string;
    readonly movingYao: number; // 1 đến 6
    readonly transformedHexagramNumber: number;
    readonly transformedHexagramName: string;
    readonly nuclearHexagramNumber: number;
    readonly nuclearHexagramName: string;

    // 2. Thể Dụng (nếu là Mai Hoa)
    readonly theTrigramName?: string;
    readonly dungTrigramName?: string;

    // 3. Bát Cung & Thế Ứng
    readonly palaceName: string;
    readonly palaceElement: string;
    readonly worldLine: number; // Thế hào
    readonly responseLine: number; // Ứng hào

    // 4. Nạp Giáp & Lục Thân (Hào 1 đến Hào 6)
    readonly lines?: GoldenLineExpectation[];

    // 5. Nhật Thần, Nguyệt Kiến, Không Vong
    readonly canChi?: {
      readonly year: string;
      readonly month: string;
      readonly day: string;
      readonly hour: string;
    };
    readonly voidBranches?: string[];
    readonly solarTerm?: string;
  };
}

export const GOLDEN_TEST_CASES: readonly GoldenTestCase[] = [
  // =========================================================================
  // Case 1: SERIAL-MOD8-V1 - Seri 6824
  // =========================================================================
  {
    id: 'GOLDEN-01-SERIAL-6824',
    name: 'Seri 6824 - Địa Lôi Phục biến Địa Trạch Lâm',
    description: 'Kiểm chứng thuật toán lập quẻ seri tiền chẵn lẻ, quẻ chủ, quẻ biến, quẻ hỗ và Lục Hào Cung Khôn.',
    canonicalReference: 'Bốc Phệ Chính Tông - Cung Khôn Quyển 2; Chu Dịch Chính Nghĩa Quẻ Phục số 24.',
    algorithm: 'SERIAL-MOD8-V1',
    input: {
      serial: '6824',
      dayCanChi: 'Giáp Tý',
      monthCanChi: 'Bính Tý',
    },
    expected: {
      primaryHexagramNumber: 24,
      primaryHexagramName: 'Địa Lôi Phục',
      upperTrigramName: 'Khôn',
      lowerTrigramName: 'Chấn',
      movingYao: 2,
      transformedHexagramNumber: 19,
      transformedHexagramName: 'Địa Trạch Lâm',
      nuclearHexagramNumber: 2,
      nuclearHexagramName: 'Thuần Khôn',
      palaceName: 'Khôn',
      palaceElement: 'Thổ',
      worldLine: 1,
      responseLine: 4,
      lines: [
        { position: 1, stemBranch: 'Canh Tý', branch: 'Tý', element: 'Thủy', sixRelation: 'Thê Tài', sixSpirit: 'Thanh Long' },
        { position: 2, stemBranch: 'Canh Dần', branch: 'Dần', element: 'Mộc', sixRelation: 'Quan Quỷ', sixSpirit: 'Chu Tước' },
        { position: 3, stemBranch: 'Canh Thìn', branch: 'Thìn', element: 'Thổ', sixRelation: 'Huynh Đệ', sixSpirit: 'Câu Trần' },
        { position: 4, stemBranch: 'Quý Sửu', branch: 'Sửu', element: 'Thổ', sixRelation: 'Huynh Đệ', sixSpirit: 'Đằng Xà' },
        { position: 5, stemBranch: 'Quý Hợi', branch: 'Hợi', element: 'Thủy', sixRelation: 'Thê Tài', sixSpirit: 'Bạch Hổ' },
        { position: 6, stemBranch: 'Quý Dậu', branch: 'Dậu', element: 'Kim', sixRelation: 'Tử Tôn', sixSpirit: 'Huyền Vũ' },
      ],
    },
  },

  // =========================================================================
  // Case 2: MAI-HUA-V1 - Chiêm Quạ Kêu (Điển tích Thiệu Khang Tiết)
  // =========================================================================
  {
    id: 'GOLDEN-02-MAIHUA-CROW',
    name: 'Mai Hoa Chiêm Quạ Kêu - Hỏa Lôi Phệ Hạp biến Hỏa Trạch Khuê',
    description: 'Điển tích kinh điển Thiệu Khang Tiết lập quẻ giờ động tâm năm Dậu, tháng 8, ngày 17, giờ Thân.',
    canonicalReference: 'Mai Hoa Dịch Số - Quyển 1: "Chiêm Quạ Kêu Quẻ Phệ Hạp biến Khuê"; Bốc Phệ Chính Tông - Cung Tốn.',
    algorithm: 'MAI-HUA-V1',
    input: {
      maiHuaInput: {
        yearBranch: 'Dậu', // 10
        month: 8,
        day: 17,
        hourBranch: 'Thân', // 9
      },
      dayCanChi: 'Kỷ Dậu',
      monthCanChi: 'Tân Dậu',
    },
    expected: {
      primaryHexagramNumber: 21,
      primaryHexagramName: 'Hỏa Lôi Phệ Hạp',
      upperTrigramName: 'Ly',
      lowerTrigramName: 'Chấn',
      movingYao: 2,
      transformedHexagramNumber: 38,
      transformedHexagramName: 'Hỏa Trạch Khuê',
      nuclearHexagramNumber: 39,
      nuclearHexagramName: 'Thủy Sơn Kiển',
      theTrigramName: 'Ly',
      dungTrigramName: 'Chấn',
      palaceName: 'Tốn',
      palaceElement: 'Mộc',
      worldLine: 5,
      responseLine: 2,
      lines: [
        { position: 1, stemBranch: 'Canh Tý', branch: 'Tý', element: 'Thủy', sixRelation: 'Phụ Mẫu', sixSpirit: 'Đằng Xà' },
        { position: 2, stemBranch: 'Canh Dần', branch: 'Dần', element: 'Mộc', sixRelation: 'Huynh Đệ', sixSpirit: 'Bạch Hổ' },
        { position: 3, stemBranch: 'Canh Thìn', branch: 'Thìn', element: 'Thổ', sixRelation: 'Thê Tài', sixSpirit: 'Huyền Vũ' },
        { position: 4, stemBranch: 'Kỷ Dậu', branch: 'Dậu', element: 'Kim', sixRelation: 'Quan Quỷ', sixSpirit: 'Thanh Long' },
        { position: 5, stemBranch: 'Kỷ Mùi', branch: 'Mùi', element: 'Thổ', sixRelation: 'Thê Tài', sixSpirit: 'Chu Tước' },
        { position: 6, stemBranch: 'Kỷ Tỵ', branch: 'Tỵ', element: 'Hỏa', sixRelation: 'Tử Tôn', sixSpirit: 'Câu Trần' },
      ],
    },
  },

  // =========================================================================
  // Case 3: SERIAL-MOD8-V1 - Seri 13579
  // =========================================================================
  {
    id: 'GOLDEN-03-SERIAL-13579',
    name: 'Seri 13579 - Sơn Trạch Tổn biến Sơn Thủy Mông',
    description: 'Kiểm chứng số lẻ vị trí 1,3,5 (15 mod 8 = 7 Cấn), chẵn 2,4 (10 mod 8 = 2 Đoài), hào động 1.',
    canonicalReference: 'Kinh Phòng Dịch Truyện - Cung Cấn; Bốc Phệ Chính Tông - Cung Cấn Đồ Bản.',
    algorithm: 'SERIAL-MOD8-V1',
    input: {
      serial: '13579',
      dayCanChi: 'Bính Dần',
      monthCanChi: 'Canh Dần',
    },
    expected: {
      primaryHexagramNumber: 41,
      primaryHexagramName: 'Sơn Trạch Tổn',
      upperTrigramName: 'Cấn',
      lowerTrigramName: 'Đoài',
      movingYao: 1,
      transformedHexagramNumber: 4,
      transformedHexagramName: 'Sơn Thủy Mông',
      nuclearHexagramNumber: 24,
      nuclearHexagramName: 'Địa Lôi Phục',
      palaceName: 'Cấn',
      palaceElement: 'Thổ',
      worldLine: 3,
      responseLine: 6,
      lines: [
        { position: 1, stemBranch: 'Đinh Tỵ', branch: 'Tỵ', element: 'Hỏa', sixRelation: 'Phụ Mẫu', sixSpirit: 'Chu Tước' },
        { position: 2, stemBranch: 'Đinh Mão', branch: 'Mão', element: 'Mộc', sixRelation: 'Quan Quỷ', sixSpirit: 'Câu Trần' },
        { position: 3, stemBranch: 'Đinh Sửu', branch: 'Sửu', element: 'Thổ', sixRelation: 'Huynh Đệ', sixSpirit: 'Đằng Xà' },
        { position: 4, stemBranch: 'Bính Tuất', branch: 'Tuất', element: 'Thổ', sixRelation: 'Huynh Đệ', sixSpirit: 'Bạch Hổ' },
        { position: 5, stemBranch: 'Bính Tý', branch: 'Tý', element: 'Thủy', sixRelation: 'Thê Tài', sixSpirit: 'Huyền Vũ' },
        { position: 6, stemBranch: 'Bính Dần', branch: 'Dần', element: 'Mộc', sixRelation: 'Quan Quỷ', sixSpirit: 'Thanh Long' },
      ],
    },
  },

  // =========================================================================
  // Case 4: MAI-HUA-V1 - Giờ Tý Đầu Năm
  // =========================================================================
  {
    id: 'GOLDEN-04-MAIHUA-NEWYEAR',
    name: 'Mai Hoa Giờ Tý Đầu Năm - Hỏa Lôi Phệ Hạp biến Sơn Lôi Di',
    description: 'Kiểm chứng khởi quẻ đầu năm Năm Tý (1), Tháng 1, Ngày 1, Giờ Tý (1).',
    canonicalReference: 'Mai Hoa Dịch Số - Chương Niên Nguyệt Nhật Thời Khởi Quái.',
    algorithm: 'MAI-HUA-V1',
    input: {
      maiHuaInput: {
        yearBranch: 'Tý', // 1
        month: 1,
        day: 1,
        hourBranch: 'Tý', // 1
      },
    },
    expected: {
      primaryHexagramNumber: 21,
      primaryHexagramName: 'Hỏa Lôi Phệ Hạp',
      upperTrigramName: 'Ly',
      lowerTrigramName: 'Chấn',
      movingYao: 4,
      transformedHexagramNumber: 27,
      transformedHexagramName: 'Sơn Lôi Di',
      nuclearHexagramNumber: 39,
      nuclearHexagramName: 'Thủy Sơn Kiển',
      theTrigramName: 'Chấn',
      dungTrigramName: 'Ly',
      palaceName: 'Tốn',
      palaceElement: 'Mộc',
      worldLine: 5,
      responseLine: 2,
    },
  },

  // =========================================================================
  // Case 5: SIX-YAO-V1 - Bát Thuần Càn (Càn vi Thiên #1) Hào 5 Động
  // =========================================================================
  {
    id: 'GOLDEN-05-PURE-HEAVEN',
    name: 'Càn vi Thiên (#1) biến Hỏa Thiên Đại Hữu (Hào 5 Động)',
    description: 'Kiểm chứng quẻ Thuần Dương bản cung, Thế hào 6 Ứng hào 3, Nạp Giáp Nhâm/Giáp, Lục Thân Kim Cung.',
    canonicalReference: 'Chu Dịch Bản Nghĩa (Chu Hi); Tăng San Bốc Dịch - Chương Càn Cung; Kinh Phòng Nạp Giáp.',
    algorithm: 'SIX-YAO-V1',
    input: {
      dayCanChi: 'Mậu Thân',
      monthCanChi: 'Canh Dần',
    },
    expected: {
      primaryHexagramNumber: 1,
      primaryHexagramName: 'Càn vi Thiên',
      upperTrigramName: 'Càn',
      lowerTrigramName: 'Càn',
      movingYao: 5,
      transformedHexagramNumber: 14,
      transformedHexagramName: 'Hỏa Thiên Đại Hữu',
      nuclearHexagramNumber: 1,
      nuclearHexagramName: 'Càn vi Thiên',
      palaceName: 'Càn',
      palaceElement: 'Kim',
      worldLine: 6,
      responseLine: 3,
      lines: [
        { position: 1, stemBranch: 'Giáp Tý', branch: 'Tý', element: 'Thủy', sixRelation: 'Tử Tôn', sixSpirit: 'Câu Trần' },
        { position: 2, stemBranch: 'Giáp Dần', branch: 'Dần', element: 'Mộc', sixRelation: 'Thê Tài', sixSpirit: 'Đằng Xà' },
        { position: 3, stemBranch: 'Giáp Thìn', branch: 'Thìn', element: 'Thổ', sixRelation: 'Phụ Mẫu', sixSpirit: 'Bạch Hổ' },
        { position: 4, stemBranch: 'Nhâm Ngọ', branch: 'Ngọ', element: 'Hỏa', sixRelation: 'Quan Quỷ', sixSpirit: 'Huyền Vũ' },
        { position: 5, stemBranch: 'Nhâm Thân', branch: 'Thân', element: 'Kim', sixRelation: 'Huynh Đệ', sixSpirit: 'Thanh Long' },
        { position: 6, stemBranch: 'Nhâm Tuất', branch: 'Tuất', element: 'Thổ', sixRelation: 'Phụ Mẫu', sixSpirit: 'Chu Tước' },
      ],
      voidBranches: ['Dần', 'Mão'],
    },
  },

  // =========================================================================
  // Case 6: SIX-YAO-V1 - Thủy Hỏa Ký Tế (#63) biến Thủy Lôi Truân
  // =========================================================================
  {
    id: 'GOLDEN-06-WATER-FIRE',
    name: 'Thủy Hỏa Ký Tế (#63) biến Thủy Lôi Truân (#3)',
    description: 'Kiểm chứng quẻ Cung Khảm Tam Thế, Nạp Giáp Kỷ/Mậu, Thế hào 3 Ứng hào 6.',
    canonicalReference: 'Bốc Phệ Chính Tông - Cung Khảm; Chu Dịch Chính Nghĩa Quẻ Ký Tế.',
    algorithm: 'SIX-YAO-V1',
    input: {
      dayCanChi: 'Canh Tý',
      monthCanChi: 'Mậu Thìn',
    },
    expected: {
      primaryHexagramNumber: 63,
      primaryHexagramName: 'Thủy Hỏa Ký Tế',
      upperTrigramName: 'Khảm',
      lowerTrigramName: 'Ly',
      movingYao: 1,
      transformedHexagramNumber: 3,
      transformedHexagramName: 'Thủy Lôi Truân',
      nuclearHexagramNumber: 64,
      nuclearHexagramName: 'Hỏa Thủy Vị Tế',
      palaceName: 'Khảm',
      palaceElement: 'Thủy',
      worldLine: 3,
      responseLine: 6,
      lines: [
        { position: 1, stemBranch: 'Kỷ Mão', branch: 'Mão', element: 'Mộc', sixRelation: 'Tử Tôn', sixSpirit: 'Bạch Hổ' },
        { position: 2, stemBranch: 'Kỷ Sửu', branch: 'Sửu', element: 'Thổ', sixRelation: 'Quan Quỷ', sixSpirit: 'Huyền Vũ' },
        { position: 3, stemBranch: 'Kỷ Hợi', branch: 'Hợi', element: 'Thủy', sixRelation: 'Huynh Đệ', sixSpirit: 'Thanh Long' },
        { position: 4, stemBranch: 'Mậu Thân', branch: 'Thân', element: 'Kim', sixRelation: 'Phụ Mẫu', sixSpirit: 'Chu Tước' },
        { position: 5, stemBranch: 'Mậu Tuất', branch: 'Tuất', element: 'Thổ', sixRelation: 'Quan Quỷ', sixSpirit: 'Câu Trần' },
        { position: 6, stemBranch: 'Mậu Tý', branch: 'Tý', element: 'Thủy', sixRelation: 'Huynh Đệ', sixSpirit: 'Đằng Xà' },
      ],
      voidBranches: ['Thìn', 'Tỵ'],
    },
  },

  // =========================================================================
  // Case 7: VN-LUNAR-V1 - Tiết Khí Lập Xuân & Can Chi 4 Trụ (04/02/2026)
  // =========================================================================
  {
    id: 'GOLDEN-07-LUNAR-CAN-CHI',
    name: 'Thiên Văn Nông Lịch Việt Nam - Can Chi, Tiết Khí, Tuần Không',
    description: 'Kiểm chứng tính toán 4 trụ Can Chi (Năm Ất Tỵ cuối năm, Tháng Kỷ Sửu Tháng Chạp, Ngày Kỷ Dậu, Giờ Canh Ngọ).',
    canonicalReference: 'Lịch Vạn Niên Việt Nam (NXB Khoa Học Kỹ Thuật); Thiên Văn Học Cổ Đại.',
    algorithm: 'VN-LUNAR-V1',
    input: {
      dateTime: '2026-02-04T12:00:00+07:00',
    },
    expected: {
      primaryHexagramNumber: 1,
      primaryHexagramName: 'Càn vi Thiên',
      upperTrigramName: 'Càn',
      lowerTrigramName: 'Càn',
      movingYao: 1,
      transformedHexagramNumber: 44,
      transformedHexagramName: 'Thiên Phong Cấu',
      nuclearHexagramNumber: 1,
      nuclearHexagramName: 'Càn vi Thiên',
      palaceName: 'Càn',
      palaceElement: 'Kim',
      worldLine: 6,
      responseLine: 3,
      canChi: {
        year: 'Ất Tỵ', // Tết 2026 là 17/02/2026 -> 04/02/2026 vẫn thuộc năm Ất Tỵ âm lịch
        month: 'Kỷ Sửu', // Tháng Chạp theo lịch âm lịch
        day: 'Kỷ Dậu',
        hour: 'Canh Ngọ',
      },
      voidBranches: ['Dần', 'Mão'], // Ngày Kỷ Dậu thuộc tuần Giáp Thìn -> Dần Mão Không Vong
      solarTerm: 'Lập xuân',
    },
  },
];
