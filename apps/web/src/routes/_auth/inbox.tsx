import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import styles from './PageScaffold.module.css';

export const Route = createFileRoute('/_auth/inbox')({
  component: InboxPage,
});

function InboxPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Typography as="p" size="sm" weight="semibold" color="accent">Inbox</Typography>
        <Typography as="h1" size="2xl" weight="bold">New work entering Stride.</Typography>
        <Typography as="p" size="base" color="muted">
          Newly synced specs, handoffs, and unmapped source items land here before they become backlog work.
        </Typography>
      </div>
      <div className={styles.panel}>Inbox triage placeholder.</div>
    </section>
  );
}
