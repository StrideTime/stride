import { Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import type { Feeling } from '../../yourData.mock';
import styles from '../../SettingsView.module.css';
import { FEELING_META } from './yourData.constants';

type FeelingTagProps = {
  feeling: Feeling | null;
};

export function FeelingTag({ feeling }: FeelingTagProps) {
  const { t } = useTranslation();

  if (!feeling) {
    return (
      <Typography as="span" size="xs" color="muted">
        {t('settings.yourData.feelings.notLogged')}
      </Typography>
    );
  }
  const meta = FEELING_META[feeling];
  const Icon = meta.icon;
  return (
    <span className={styles.feelingTag}>
      <Icon size={15} weight="fill" aria-hidden="true" />
      <Typography as="span" size="xs" weight="semibold">
        {t(meta.labelKey)}
      </Typography>
    </span>
  );
}
