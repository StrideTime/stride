import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import styles from './PageScaffold.module.css';

export const Route = createFileRoute('/_auth/')({
  component: TodayPage,
});

function TodayPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Typography as="p" size="sm" weight="semibold" color="accent">Today</Typography>
        <Typography as="h1" size="2xl" weight="bold">What should move next?</Typography>
        <Typography as="p" size="base" color="muted">
          Placeholder dashboard shell. Backlog can now be built inside the real app chrome.
        </Typography>
      </div>
      <div className={styles.panel}>Now hero, today schedule, and the info hub land here.</div>
    </section>
  );
}
