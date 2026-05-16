import { createFileRoute } from '@tanstack/react-router';

import { TodayView } from '../../components/today';

export const Route = createFileRoute('/_auth/')({
  component: TodayPage,
});

function TodayPage() {
  return <TodayView />;
}
