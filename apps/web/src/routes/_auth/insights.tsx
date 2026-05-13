import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/insights')({
  component: InsightsPage,
});

// Insights (`/insights`) — v1: the Performance view only (personal stat cards + estimate-vs-actual scatter);
// Team / Goals / Burnout / Focus Time tabs are post-v1. v1 scope is a working assumption (open-questions Q16).
// See docs/product/surfaces.md + docs/product/mvp.md.
function InsightsPage() {
  return <section>Insights — coming soon</section>;
}
