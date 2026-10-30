import React, { forwardRef, useId } from 'react';
import './Select.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  size?: SelectSize;
  fullWidth?: boolean;
  isRequired?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      isRequired = false,
      placeholder,
      id: customId,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const selectClasses = [
      'bha-select',
      `bha-select--${size}`,
      error ? 'bha-select--error' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const containerClasses = [
      'bha-select-container',
      fullWidth ? 'bha-select-container--full-width' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={id}
            className={`bha-select-label ${isRequired ? 'bha-select-label--required' : ''}`}
          >
            {label}
          </label>
        )}
        <div className="bha-select-wrapper">
          <select ref={ref} id={id} className={selectClasses} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="bha-select-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
        {error ? (
          <span className="bha-select-error-msg">{error}</span>
        ) : helperText ? (
          <span className="bha-select-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
