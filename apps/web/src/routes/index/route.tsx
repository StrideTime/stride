import { createFileRoute } from '@tanstack/react-router';

import { useAppMode } from '@providers';
import { ScheduleToday } from './components/ScheduleToday';
import { SessionToday } from './components/SessionToday';

export const Route = createFileRoute('/')({
  component: TodayPage,
});

// Today is two screens behind one route: the working mode picks which.
// Session-first centers on what to run next; schedule-first shows the day
// timeline. The mode is set in Settings → My workspace. See
// docs/product/overview.md (User modes).
function TodayPage() {
  const { mode } = useAppMode();

  return mode === 'schedule-first' ? <ScheduleToday /> : <SessionToday />;
}
