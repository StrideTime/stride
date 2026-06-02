import { ShieldCheck } from '@phosphor-icons/react';
import { Typography } from '@stride/ui';

import styles from '../../SettingsView.module.css';

type GuaranteeNoteProps = {
  body: string;
};

export function GuaranteeNote({ body }: GuaranteeNoteProps) {
  return (
    <div className={styles.guaranteeNote}>
      <ShieldCheck size={17} weight="fill" aria-hidden="true" />
      <Typography as="p" size="sm" color="muted">
        {body}
      </Typography>
    </div>
  );
}
