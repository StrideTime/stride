import { Link, Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: AppShell,
});

// Placeholder app shell (a pathless layout route — wraps everything under routes/_auth/ without adding a URL
// segment). The real left-rail nav — Today · Backlog · Schedule · Insights, with a ⚙ Settings gear pinned to the
// bottom, plus the workspace+team switcher and the live-session mini-indicator — gets built in packages/ui.
// See docs/product/surfaces.md. (Auth gating is added later; this layout doesn't enforce anything yet.)
function AppShell() {
  return (
    <div>
      <nav aria-label="Primary">
        <Link to="/">Today</Link>
        {' · '}
        <Link to="/backlog">Backlog</Link>
        {' · '}
        <Link to="/schedule">Schedule</Link>
        {' · '}
        <Link to="/insights">Insights</Link>
        {' · '}
        <Link to="/settings">Settings</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
