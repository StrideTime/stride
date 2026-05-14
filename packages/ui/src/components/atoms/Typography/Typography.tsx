import type { ElementType, ReactNode } from 'react';

import styles from './Typography.module.css';

type TypographyProps = {
  as?: ElementType;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'inverse' | 'accent';
  className?: string;
  children: ReactNode;
};

export function Typography({
  as: Component = 'span',
  size = 'base',
  weight = 'regular',
  color = 'default',
  className,
  children,
}: TypographyProps) {
  const classNames = [styles.text, styles[size], styles[weight], styles[color], className]
    .filter(Boolean)
    .join(' ');

  return <Component className={classNames}>{children}</Component>;
}
