import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/')({
  component: TodayPage,
});

// Today (`/`) — the dashboard: now/next hero, today's schedule, the configurable Info Hub of widgets.
// See docs/product/surfaces.md.
function TodayPage() {
  return <section>Today — coming soon</section>;
}
