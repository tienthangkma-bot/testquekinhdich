/**
 * Bắc Hà Tân An Phái - Color Palette Tokens
 * Hệ màu sáng kết hợp Đỏ sẫm (Crimson) và Vàng đồng (Antique Gold)
 * Hỗ trợ đồng thời 2 chủ đề: Dark Mystic Theme & Imperial Ivory Theme
 */
export const colors = {
  // Nền sáng (Imperial Ivory / Parchment)
  background: {
    base: '#FAF8F5',       // Nền chính toàn ứng dụng (ấm áp như giấy xuyến chỉ)
    surface: '#FFFFFF',    // Nền thẻ card / bề mặt nổi
    subtle: '#F2EFE9',     // Nền phụ / tab không chọn
    muted: '#EAE5DC',      // Nền nhấn nhẹ / placeholder
    glass: 'rgba(255, 255, 255, 0.85)',
  },

  // Đường viền
  border: {
    light: '#ECE8E0',
    base: '#E0D8CB',
    hover: '#C5BAA9',
    focus: '#851616',      // Viền khi focus (đỏ sẫm)
    gold: '#D6B462',       // Viền vàng đồng
    glass: 'rgba(214, 180, 98, 0.25)',
  },

  // Màu chữ
  text: {
    primary: '#1F1916',    // Chữ đậm chính (màu mực tàu ấm)
    secondary: '#594F48',  // Chữ phụ / nhãn
    muted: '#8C8178',      // Chữ mờ / ghi chú
    inverse: '#FFFFFF',    // Chữ trắng trên nền tối
    gold: '#B5871D',       // Chữ màu vàng kim
    jade: '#059669',       // Chữ ngọc bích
  },

  // Màu chủ đạo: Đỏ sẫm (Crimson / Chu Sa cổ truyền)
  crimson: {
    50: '#FDF2F2',
    100: '#FBE4E4',
    200: '#F5C2C2',
    300: '#E99696',
    400: '#D75F5F',
    500: '#B82828',
    600: '#9B1B1B',
    700: '#851616',        // Primary Crimson
    800: '#6E1212',
    900: '#520D0D',
  },

  // Màu nhấn: Vàng đồng (Antique Gold / Hoàng Kim hoàng tộc)
  gold: {
    50: '#FCF9EE',
    100: '#F8F1D5',
    200: '#EFE1A7',
    300: '#E5CB77',
    400: '#DAB54E',
    500: '#C99E28',
    600: '#B5871D',        // Primary Gold
    700: '#946B12',
    800: '#73510C',
    900: '#543906',
  },

  // Xanh Ngọc Bích (Celestial Jade)
  jade: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    300: '#6EE7B7',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
  },

  // Dark Mystic Palette (Huyền Học Dạ Thần)
  darkMystic: {
    background: {
      base: '#0A0D14',     // Mực huyền vũ sâu thẳm
      surface: '#121722',  // Đen than phiến ngọc
      subtle: '#182030',   // Nền tương phản nhẹ
      muted: '#202A3D',    // Nền card/panel mờ
      glass: 'rgba(18, 23, 34, 0.82)',
    },
    border: {
      light: 'rgba(214, 180, 98, 0.12)',
      base: 'rgba(214, 180, 98, 0.22)',
      hover: 'rgba(229, 192, 88, 0.5)',
      gold: '#E5C058',
      focus: '#D32F2F',
    },
    text: {
      primary: '#F5EFEB',  // Trắng xuyến chỉ sáng
      secondary: '#C5B79D',// Vàng lụa nhạt
      muted: '#7E8B9E',    // Bạc xám cổ phong
      inverse: '#0A0D14',  // Chữ trên nền sáng
      gold: '#F0D278',     // Hoàng kim phát quang
      jade: '#34D399',     // Ngọc bích phát quang
    },
    glow: {
      gold: 'rgba(229, 192, 88, 0.35)',
      crimson: 'rgba(215, 60, 60, 0.35)',
      jade: 'rgba(16, 185, 129, 0.35)',
    },
  },

  // Trạng thái hệ thống
  feedback: {
    success: '#1B7340',    // Xanh ngọc bích
    successBg: '#E8F5E9',
    warning: '#C27803',    // Hổ phách
    warningBg: '#FEF3C7',
    error: '#C53030',      // Đỏ son cảnh báo
    errorBg: '#FEE2E2',
    info: '#1D64B2',       // Xanh lam
    infoBg: '#EFF6FF',
  },
} as const;

export type Colors = typeof colors;
