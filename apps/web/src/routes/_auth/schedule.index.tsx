import { createFileRoute } from '@tanstack/react-router';

import { ScheduleDayView } from '../../components/schedule';

type ScheduleSearch = {
  date?: string;
  view?: 'schedule' | 'sessions';
  blockId?: string;
};

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const Route = createFileRoute('/_auth/schedule/')({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => ({
    date: typeof search.date === 'string' ? search.date : undefined,
    view: search.view === 'sessions' ? 'sessions' : 'schedule',
    blockId: typeof search.blockId === 'string' ? search.blockId : undefined,
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { date, view, blockId } = Route.useSearch();

  return (
    <ScheduleDayView
      date={date ?? todayKey()}
      selectedBlockId={blockId}
      view={view ?? 'schedule'}
    />
  );
}
