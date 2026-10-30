import React, { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classNames = [
      'bha-btn',
      `bha-btn--${variant}`,
      `bha-btn--${size}`,
      fullWidth ? 'bha-btn--full-width' : '',
      isLoading ? 'bha-btn--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={classNames}
        {...props}
      >
        {isLoading && <span className="bha-btn-spinner" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="bha-btn-icon-left">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="bha-btn-icon-right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
