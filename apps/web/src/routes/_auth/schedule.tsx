import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';

import { ScheduleWeekView } from '../../components/schedule';

export const Route = createFileRoute('/_auth/schedule')({
  component: ScheduleLayout,
});

function ScheduleLayout() {
  const pathname = useRouterState({ select: state => state.location.pathname });

  if (pathname === '/schedule') {
    return <ScheduleWeekView />;
  }

  return <Outlet />;
}
