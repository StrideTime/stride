import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  return <main>Signup — placeholder</main>;
}
