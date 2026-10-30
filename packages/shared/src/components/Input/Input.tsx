import React, { forwardRef, useId } from 'react';
import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isRequired = false,
      id: customId,
      className = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const inputClasses = [
      'bha-input',
      `bha-input--${size}`,
      error ? 'bha-input--error' : '',
      leftIcon ? 'bha-input--has-icon-left' : '',
      rightIcon ? 'bha-input--has-icon-right' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const containerClasses = [
      'bha-input-container',
      fullWidth ? 'bha-input-container--full-width' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={id}
            className={`bha-input-label ${isRequired ? 'bha-input-label--required' : ''}`}
          >
            {label}
          </label>
        )}
        <div className="bha-input-wrapper">
          {leftIcon && <span className="bha-input-icon-left">{leftIcon}</span>}
          <input ref={ref} id={id} className={inputClasses} {...props} />
          {rightIcon && <span className="bha-input-icon-right">{rightIcon}</span>}
        </div>
        {error ? (
          <span className="bha-input-error-msg">{error}</span>
        ) : helperText ? (
          <span className="bha-input-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
