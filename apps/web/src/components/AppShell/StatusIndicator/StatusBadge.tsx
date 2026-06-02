import type { ShellStatus } from '../AppShell.data';
import styles from '../AppShell.module.css';

type StatusBadgeProps = {
  status: ShellStatus;
  className?: string;
  label: string;
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const bgClass = styles[`dot${status.color}`] ?? '';

  return (
    <span
      aria-label={label}
      className={`${styles.statusBadge} ${bgClass} ${className ?? ''}`}
      role="img"
      tabIndex={0}
    >
      {status.icon ?? null}
      <span className={styles.statusTooltip} aria-hidden="true">
        <span className={`${styles.statusTooltipIcon} ${bgClass}`}>{status.icon ?? null}</span>
        <span className={styles.statusTooltipValue}>{status.label}</span>
      </span>
    </span>
  );
}
