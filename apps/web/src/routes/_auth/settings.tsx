import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsPage,
});

// `/settings/*` — workspace settings, source + calendar connections, team + member management.
// Sub-pages are TBD (open-questions Q12); notifications/privacy are deferred placeholders. See docs/product/surfaces.md.
function SettingsPage() {
  return <section>Settings — coming soon</section>;
}
