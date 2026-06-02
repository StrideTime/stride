import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

import styles from './Chip.module.css';

type ChipVariant = 'contained' | 'outlined';
type ChipColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

type BaseChipProps = {
  variant?: ChipVariant;
  color?: ChipColor;
  leading?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  className?: string;
  children: ReactNode;
};

export type ChipProps = BaseChipProps &
  (
    | ({ as?: 'span' } & HTMLAttributes<HTMLSpanElement>)
    | ({ as: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function Chip({
  as = 'span',
  variant = 'outlined',
  color = 'neutral',
  leading,
  trailing,
  active = false,
  className,
  children,
  ...props
}: ChipProps) {
  const classNames = [
    styles.chip,
    styles[variant],
    styles[color],
    active ? styles.active : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (as === 'button') {
    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button className={classNames} type="button" {...buttonProps}>
        {leading ? <span className={styles.slot}>{leading}</span> : null}
        <span>{children}</span>
        {trailing ? <span className={styles.slot}>{trailing}</span> : null}
      </button>
    );
  }

  const spanProps = props as HTMLAttributes<HTMLSpanElement>;

  return (
    <span className={classNames} {...spanProps}>
      {leading ? <span className={styles.slot}>{leading}</span> : null}
      <span>{children}</span>
      {trailing ? <span className={styles.slot}>{trailing}</span> : null}
    </span>
  );
}
