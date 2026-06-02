import { createFileRoute } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import { TrayView } from './components';
import styles from './TrayPreview.module.css';

export const Route = createFileRoute('/tray')({
  component: TrayPage,
});

function TrayPage() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Typography as="h1" size="2xl" weight="bold">Tray preview</Typography>
        <Typography as="p" size="base" color="muted">
          Desktop tray content shown inside the app shell for fast mode switching.
        </Typography>
      </header>
      <div className={styles.previewStage}>
        <div className={styles.previewFrame}>
          <TrayView />
        </div>
      </div>
    </section>
  );
}
