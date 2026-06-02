import type { ShellStatus } from '../AppShell.mock';
import styles from '../AppShell.module.css';

export function StatusGlyph({ status }: { status: ShellStatus }) {
  const toneClass = styles[`glyph${status.color}`] ?? '';

  return (
    <span className={`${styles.statusGlyph} ${toneClass}`} aria-hidden="true">
      {status.icon ?? <span className={`${styles.statusDot} ${styles[`dot${status.color}`] ?? ''}`} />}
    </span>
  );
}
