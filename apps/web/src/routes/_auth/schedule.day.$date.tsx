import { createFileRoute } from '@tanstack/react-router';

import { ScheduleDayView } from '../../components/schedule';

type ScheduleDaySearch = {
  view?: 'schedule' | 'sessions';
  blockId?: string;
};

export const Route = createFileRoute('/_auth/schedule/day/$date')({
  validateSearch: (search: Record<string, unknown>): ScheduleDaySearch => ({
    view: search.view === 'sessions' ? 'sessions' : 'schedule',
    blockId: typeof search.blockId === 'string' ? search.blockId : undefined,
  }),
  component: ScheduleDayPage,
});

function ScheduleDayPage() {
  const { date } = Route.useParams();
  const { view, blockId } = Route.useSearch();

  return <ScheduleDayView date={date} selectedBlockId={blockId} view={view ?? 'schedule'} />;
}
