import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/specs/$specId')({
  component: SpecPage,
});

// Spec detail (`/specs/$specId`) — the canonical, deep-linkable spec view. v1 tabs: Overview + History (no
// Comments tab in v1). The overlay-over-the-current-page behavior (and the separate ad-hoc client-state quick-look
// modal) is a Phase 2 implementation detail; this is a plain route placeholder for now. See docs/product/surfaces.md.
function SpecPage() {
  const { specId } = Route.useParams();
  return <section>Spec {specId} — coming soon</section>;
}
