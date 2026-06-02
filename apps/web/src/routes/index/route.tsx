import { createFileRoute } from '@tanstack/react-router';

import { TodayView } from '../../components/today';

export const Route = createFileRoute('/')({
  component: TodayPage,
});

function TodayPage() {
  return <TodayView />;
}
