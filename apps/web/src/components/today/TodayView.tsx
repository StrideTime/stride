import { useAppMode, type AppMode } from '../app-mode';
import { ScheduleToday } from './ScheduleToday';
import { SessionToday } from './SessionToday';
import styles from './TodayView.module.css';

// Today is two screens behind one route: the working mode picks which.
// Session-first centers on what to run next; schedule-first shows the day
// timeline. See docs/product/overview.md (User modes).
export function TodayView() {
  const { mode, setMode } = useAppMode();

  return (
    <>
      <TodayModeToggle mode={mode} setMode={setMode} />
      {mode === 'schedule-first' ? <ScheduleToday /> : <SessionToday />}
    </>
  );
}

function TodayModeToggle({
  mode,
  setMode,
}: {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}) {
  return (
    <div className={styles.modeToggle} aria-label="Today mode preview">
      <button
        className={mode === 'session-first'
          ? `${styles.modeButton} ${styles.modeButtonActive}`
          : styles.modeButton}
        onClick={() => setMode('session-first')}
        type="button"
      >
        Session
      </button>
      <button
        className={mode === 'schedule-first'
          ? `${styles.modeButton} ${styles.modeButtonActive}`
          : styles.modeButton}
        onClick={() => setMode('schedule-first')}
        type="button"
      >
        Schedule
      </button>
    </div>
  );
}
