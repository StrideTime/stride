import { useState } from 'react';
import { Typography } from '@stride/ui';

import styles from '../SettingsView.module.css';

type ToggleRowProps = {
  title: string;
  detail: string;
  defaultOn?: boolean;
};

export function ToggleRow({ title, detail, defaultOn = false }: ToggleRowProps) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <button
      className={styles.toggleRow}
      onClick={() => setEnabled(value => !value)}
      type="button"
    >
      <span>
        <Typography as="span" size="sm" weight="semibold">
          {title}
        </Typography>
        <Typography as="span" size="xs" color="muted" className={styles.optionDetail}>
          {detail}
        </Typography>
      </span>
      <span
        className={enabled ? `${styles.switch} ${styles.switchOn}` : styles.switch}
        aria-hidden="true"
      >
        <span />
      </span>
    </button>
  );
}
