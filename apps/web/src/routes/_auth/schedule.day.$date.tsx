import { createFileRoute } from '@tanstack/react-router';

import { ScheduleDayView } from '../../components/schedule';

export const Route = createFileRoute('/_auth/schedule/day/$date')({
  component: ScheduleDayPage,
});

function ScheduleDayPage() {
  const { date } = Route.useParams();

  return <ScheduleDayView date={date} />;
}
