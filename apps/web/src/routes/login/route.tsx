import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// Placeholder. v1 auth is invite-only (Better Auth) — see docs/product/mvp.md; the /login + /onboarding route
// shape is still open (docs/product/open-questions.md Q11).
function LoginPage() {
  return <main>Login — placeholder</main>;
}
