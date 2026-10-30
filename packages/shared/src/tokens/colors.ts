/**
 * Bắc Hà Tân An Phái - Color Palette Tokens
 * Hệ màu sáng kết hợp Đỏ sẫm (Crimson) và Vàng đồng (Antique Gold)
 */
export const colors = {
  // Nền sáng (Parchment / Ivory)
  background: {
    base: '#FAF8F5',       // Nền chính toàn ứng dụng (ấm áp như giấy xuyến chỉ)
    surface: '#FFFFFF',    // Nền thẻ card / bề mặt nổi
    subtle: '#F2EFE9',     // Nền phụ / tab không chọn
    muted: '#EAE5DC',      // Nền nhấn nhẹ / placeholder
  },

  // Đường viền
  border: {
    light: '#ECE8E0',
    base: '#E0D8CB',
    hover: '#C5BAA9',
    focus: '#851616',      // Viền khi focus (đỏ sẫm)
    gold: '#D6B462',       // Viền vàng đồng
  },

  // Màu chữ
  text: {
    primary: '#1F1916',    // Chữ đậm chính (màu mực tàu ấm)
    secondary: '#594F48',  // Chữ phụ / nhãn
    muted: '#8C8178',      // Chữ mờ / ghi chú
    inverse: '#FFFFFF',    // Chữ trắng trên nền tối
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
