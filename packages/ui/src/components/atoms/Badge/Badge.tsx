import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Badge.module.css';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  leading?: ReactNode;
};

export function Badge({
  variant = 'neutral',
  leading,
  className,
  children,
  ...props
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      {children}
    </span>
  );
}
