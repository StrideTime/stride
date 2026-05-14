import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import styles from './PageScaffold.module.css';

export const Route = createFileRoute('/_auth/schedule')({
  component: SchedulePage,
});

function SchedulePage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Typography as="p" size="sm" weight="semibold" color="accent">Schedule</Typography>
        <Typography as="h1" size="2xl" weight="bold">Plan the week.</Typography>
        <Typography as="p" size="base" color="muted">Week grid placeholder.</Typography>
      </div>
    </section>
  );
}
