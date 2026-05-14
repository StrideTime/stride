import { useTranslation } from 'react-i18next';
import { Typography } from '@stride/ui';

import styles from './Header.module.css';

type HeaderProps = {
  surface: 'specs' | 'actions';
};

export function Header({ surface }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <Typography as="h1" size="2xl" weight="bold">
        {surface === 'actions' ? t('backlog.common.actions') : t('backlog.common.specs')}
      </Typography>
    </header>
  );
}
