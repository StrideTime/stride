import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/schedule')({
  component: SchedulePage,
});

// Schedule (`/schedule`) — week + month calendar; drag-to-schedule / move / resize; plan-vs-actual inline;
// typed blocks (action / meeting / focus / break). Meeting blocks come from the calendar sync. See docs/product/surfaces.md.
function SchedulePage() {
  return <section>Schedule — coming soon</section>;
}
