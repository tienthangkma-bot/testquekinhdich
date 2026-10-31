import React from 'react';
import { Input } from '@kindich/shared';
import {
  QUESTION_CATEGORIES,
  QuestionCategory,
  getCategoryDefinition,
} from './notes-questions.types';
import './NotesAndQuestions.css';

export interface QuestionCategorySelectorProps {
  /** Nội dung câu hỏi người dùng nhập */
  readonly question: string;
  readonly onQuestionChange: (value: string) => void;

  /** Danh mục phân loại được chọn */
  readonly category: QuestionCategory;
  readonly onCategoryChange: (value: QuestionCategory) => void;

  /** Nhãn tùy biến cho ô nhập câu hỏi */
  readonly inputLabel?: string;
  readonly inputPlaceholder?: string;

  /** Hiển thị dạng ngắn gọn (chỉ danh mục) */
  readonly compact?: boolean;
}

/**
 * Component Nhập Câu Hỏi & Chọn Phân Loại Danh Mục (Requirement 1 & 4)
 */
export const QuestionCategorySelector: React.FC<QuestionCategorySelectorProps> = ({
  question,
  onQuestionChange,
  category,
  onCategoryChange,
  inputLabel = 'Nội dung câu hỏi / Việc cần chiêm đoán:',
  inputPlaceholder = 'Ví dụ: Kỳ thi sắp tới có thuận lợi không? Việc kinh doanh tháng này ra sao?',
  compact = false,
}) => {
  const currentCategoryDef = getCategoryDefinition(category);

  return (
    <div className="question-category-selector" data-testid="question-category-selector">
      {!compact && (
        <div style={{ marginBottom: '14px' }}>
          <Input
            label={inputLabel}
            placeholder={inputPlaceholder}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            fullWidth
            helperText="Khởi tâm thanh tịnh, tập trung suy nghĩ vào câu hỏi trước khi gieo quẻ"
          />
        </div>
      )}

      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '4px',
            color: 'var(--bha-text-primary)',
          }}
        >
          Phân loại danh mục câu hỏi (Requirement 4):
        </label>

        {/* 6 Danh Mục Phân Loại: Công việc, Học tập, Tài chính, Gia đình, Tình cảm, Khác */}
        <div className="question-category-pills" role="radiogroup" aria-label="Phân loại câu hỏi">
          {QUESTION_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`category-pill ${isSelected ? 'category-pill--active' : ''}`}
                onClick={() => onCategoryChange(cat.id)}
                title={cat.description}
                data-testid={`category-pill-${cat.id}`}
              >
                <span className="category-pill__icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ghi chú định hướng Dụng Thần tương ứng */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--bha-text-muted)',
            marginTop: '6px',
            marginBottom: 0,
          }}
        >
          * <strong>{currentCategoryDef.icon} {currentCategoryDef.label}:</strong>{' '}
          {currentCategoryDef.description}
        </p>
      </div>
    </div>
  );
};
