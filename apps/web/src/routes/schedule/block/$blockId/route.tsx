import { createFileRoute } from '@tanstack/react-router';

import { ScheduleBlockDetail } from '../../../../components/schedule';

export const Route = createFileRoute('/schedule/block/$blockId')({
  component: ScheduleBlockDetailPage,
});

function ScheduleBlockDetailPage() {
  const { blockId } = Route.useParams();
  return <ScheduleBlockDetail blockId={blockId} />;
}
