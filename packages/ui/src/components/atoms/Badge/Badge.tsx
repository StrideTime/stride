import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Badge.module.css';

type BadgeStyle = 'contained' | 'outlined' | 'ghost';
type BadgeColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
type LegacyBadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
type BadgeVariant = BadgeStyle | LegacyBadgeVariant;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  color?: BadgeColor;
  leading?: ReactNode;
};

function resolveVariant(variant: BadgeVariant, color?: BadgeColor) {
  if (variant === 'accent') return { style: 'contained' as const, color: color ?? 'primary' };
  if (
    variant === 'neutral' ||
    variant === 'success' ||
    variant === 'warning' ||
    variant === 'danger'
  ) {
    return { style: 'contained' as const, color: color ?? variant };
  }
  return { style: variant, color: color ?? 'neutral' };
}

export function Badge({
  variant = 'outlined',
  color,
  leading,
  className,
  children,
  ...props
}: BadgeProps) {
  const resolved = resolveVariant(variant, color);
  const classNames = [styles.badge, styles[resolved.style], styles[resolved.color], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      {children}
    </span>
  );
}
