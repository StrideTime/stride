import type { ModeButtonProps } from './ModeButton.type';
import styles from '../../../backlog.module.css';

export function ModeButton({
  view,
  activeView,
  onViewChange,
  title,
  subtitle,
  icon,
}: ModeButtonProps) {
  const className =
    view === activeView ? `${styles.mode} ${styles.modeActive}` : styles.mode;

  return (
    <button
      className={className}
      onClick={() => onViewChange(view)}
      type="button"
    >
      {icon ? <span className={styles.modeIcon}>{icon}</span> : null}
      <span className={styles.modeCopy}>
        <span className={styles.modeTitle}>{title}</span>
        <span className={styles.modeSubtitle}>{subtitle}</span>
      </span>
    </button>
  );
}
