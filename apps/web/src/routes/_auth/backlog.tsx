import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/backlog')({
  component: BacklogPage,
});

// Backlog (`/backlog`) — every spec; search + priority/assignee/sprint filters; comfy/compact density;
// "needs breakdown" vs "ready to schedule" groups; Specs ↔ Actions ↔ Blockers as in-page views (?view=…).
// See docs/product/surfaces.md.
function BacklogPage() {
  return <section>Backlog — coming soon</section>;
}
