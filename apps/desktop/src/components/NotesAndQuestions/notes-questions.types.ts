/**
 * 6 Danh mục phân loại câu hỏi chiêm đoán chuẩn xác (Requirement 4)
 */
export type QuestionCategory =
  | 'work' // Công việc
  | 'study' // Học tập
  | 'finance' // Tài chính
  | 'family' // Gia đình
  | 'relationship' // Tình cảm
  | 'other'; // Khác

/**
 * Định nghĩa chi tiết từng danh mục câu hỏi
 */
export interface QuestionCategoryDefinition {
  readonly id: QuestionCategory;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
  readonly color: string;
  readonly bgColor: string;
}

/**
 * Danh sách 6 danh mục phân loại câu hỏi (Requirement 4)
 */
export const QUESTION_CATEGORIES: readonly QuestionCategoryDefinition[] = [
  {
    id: 'work',
    label: 'Công việc',
    icon: '💼',
    description: 'Sự nghiệp, công danh, thăng tiến, chuyển việc, đàm phán, dự án',
    color: '#1565C0',
    bgColor: '#E3F2FD',
  },
  {
    id: 'study',
    label: 'Học tập',
    icon: '📚',
    description: 'Thi cử, học vấn, bằng cấp, du học, nghiên cứu, phát triển kỹ năng',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  {
    id: 'finance',
    label: 'Tài chính',
    icon: '💰',
    description: 'Tiền bạc, đầu tư, buôn bán, kinh doanh, thu hồi vốn, tài sản',
    color: '#C67D00',
    bgColor: '#FFF8E1',
  },
  {
    id: 'family',
    label: 'Gia đình',
    icon: '🏡',
    description: 'Gia đạo, nhà cửa, đất đai, con cái, cha mẹ, anh em, bình an',
    color: '#6A1B9A',
    bgColor: '#F3E5F5',
  },
  {
    id: 'relationship',
    label: 'Tình cảm',
    icon: '❤️',
    description: 'Tình duyên, hôn nhân, tình cảm lứa đôi, giao thiệp bằng hữu',
    color: '#C2185B',
    bgColor: '#FCE4EC',
  },
  {
    id: 'other',
    label: 'Khác',
    icon: '🔮',
    description: 'Sức khỏe, xuất hành, tìm đồ thất lạc, chiêm đoán tổng quan',
    color: '#455A64',
    bgColor: '#ECEFF1',
  },
] as const;

/**
 * Tra cứu định nghĩa danh mục theo mã ID
 */
export function getCategoryDefinition(category?: string): QuestionCategoryDefinition {
  const found = QUESTION_CATEGORIES.find((c) => c.id === category);
  if (found) return found;

  // Hỗ trợ ánh xạ ngược nếu dữ liệu cũ lưu bằng nhãn tiếng Việt
  const foundByLabel = QUESTION_CATEGORIES.find(
    (c) => c.label.toLowerCase() === category?.toLowerCase()
  );
  if (foundByLabel) return foundByLabel;

  return QUESTION_CATEGORIES[5]!; // Mặc định: 'other' (Khác)
}

/**
 * Lấy nhãn hiển thị tiếng Việt của danh mục
 */
export function getCategoryLabel(category?: string): string {
  if (!category) return 'Khác';
  return getCategoryDefinition(category).label;
}

/**
 * Lấy biểu tượng icon của danh mục
 */
export function getCategoryIcon(category?: string): string {
  if (!category) return '🔮';
  return getCategoryDefinition(category).icon;
}
