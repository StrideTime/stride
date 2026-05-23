import { createFileRoute } from '@tanstack/react-router';

import { SpecView } from '../../components/specs';

export const Route = createFileRoute('/_auth/specs/$specId')({
  component: SpecPage,
});

// Spec detail (`/specs/$specId`) — the canonical, deep-linkable spec view. v1 tabs: Overview + History (no
// Comments tab in v1). The overlay-over-the-current-page presentation and the separate ad-hoc quick-look modal
// are a later refinement; this route renders SpecView directly. See docs/product/surfaces.md.
function SpecPage() {
  const { specId } = Route.useParams();
  return <SpecView specId={specId} />;
}
