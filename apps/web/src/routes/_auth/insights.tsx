import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import styles from './PageScaffold.module.css';

export const Route = createFileRoute('/_auth/insights')({
  component: InsightsPage,
});

function InsightsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Typography as="p" size="sm" weight="semibold" color="accent">Insights</Typography>
        <Typography as="h1" size="2xl" weight="bold">Performance, without surveillance.</Typography>
        <Typography as="p" size="base" color="muted">Personal analytics placeholder.</Typography>
      </div>
    </section>
  );
}
