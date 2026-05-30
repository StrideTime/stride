import { useAppMode } from '../app-mode';
import { ScheduleToday } from './ScheduleToday';
import { SessionToday } from './SessionToday';

// Today is two screens behind one route: the working mode picks which.
// Session-first centers on what to run next; schedule-first shows the day
// timeline. The mode is set in Settings → My workspace. See
// docs/product/overview.md (User modes).
export function TodayView() {
  const { mode } = useAppMode();

  return mode === 'schedule-first' ? <ScheduleToday /> : <SessionToday />;
}
