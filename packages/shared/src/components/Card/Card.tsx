import React, { forwardRef } from 'react';
import './Card.css';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardBorderVariant = 'default' | 'gold' | 'crimson';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: CardPadding;
  borderVariant?: CardBorderVariant;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      extra,
      footer,
      children,
      padding = 'md',
      borderVariant = 'default',
      hoverable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasHeader = Boolean(title || subtitle || extra);

    const cardClasses = [
      'bha-card',
      `bha-card--p-${padding}`,
      borderVariant !== 'default' ? `bha-card--bordered-${borderVariant}` : '',
      hoverable ? 'bha-card--hoverable' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {hasHeader && (
          <header className="bha-card-header">
            <div className="bha-card-title-group">
              {title && <h3 className="bha-card-title">{title}</h3>}
              {subtitle && <p className="bha-card-subtitle">{subtitle}</p>}
            </div>
            {extra && <div className="bha-card-extra">{extra}</div>}
          </header>
        )}
        <div className="bha-card-body">{children}</div>
        {footer && <footer className="bha-card-footer">{footer}</footer>}
      </div>
    );
  }
);

Card.displayName = 'Card';
