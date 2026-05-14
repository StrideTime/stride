import type { InputHTMLAttributes, ReactNode } from 'react';

import styles from './TextInput.module.css';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode;
};

export function TextInput({ leading, className, ...props }: TextInputProps) {
  const classNames = [styles.root, className].filter(Boolean).join(' ');

  return (
    <label className={classNames}>
      {leading ? <span className={styles.leading}>{leading}</span> : null}
      <input className={styles.input} {...props} />
    </label>
  );
}
