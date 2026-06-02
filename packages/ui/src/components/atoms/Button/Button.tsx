import type { ButtonHTMLAttributes, ReactNode } from 'react';

import styles from './Button.module.css';

type ButtonStyle = 'contained' | 'outlined' | 'ghost';
type ButtonColor = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';
type LegacyButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonVariant = ButtonStyle | LegacyButtonVariant;
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  icon?: ReactNode;
};

function resolveVariant(variant: ButtonVariant, color?: ButtonColor) {
  if (variant === 'primary') return { style: 'contained' as const, color: color ?? 'primary' };
  if (variant === 'secondary') return { style: 'outlined' as const, color: color ?? 'neutral' };
  if (variant === 'danger') return { style: 'contained' as const, color: color ?? 'danger' };
  return { style: variant, color: color ?? (variant === 'contained' ? 'primary' : 'neutral') };
}

export function Button({
  variant = 'outlined',
  color,
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const resolved = resolveVariant(variant, color);
  const classNames = [
    styles.button,
    styles[resolved.style],
    styles[resolved.color],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} type={type} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </button>
  );
}
