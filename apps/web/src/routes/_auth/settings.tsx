import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import styles from './PageScaffold.module.css';

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Typography as="p" size="sm" weight="semibold" color="accent">Settings</Typography>
        <Typography as="h1" size="2xl" weight="bold">Workspace setup.</Typography>
      </div>
    </section>
  );
}
